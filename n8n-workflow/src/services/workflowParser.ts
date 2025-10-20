import { logger } from '../utils/logger';
import { N8nWorkflow, WorkflowMetadata, WorkflowNode, WorkflowConnection } from '../types/workflow';

export interface ParsedWorkflow {
  workflow: N8nWorkflow;
  metadata: WorkflowMetadata;
  analysis: WorkflowAnalysis;
}

export interface WorkflowAnalysis {
  nodeCount: number;
  connectionCount: number;
  complexity: 'simple' | 'moderate' | 'complex';
  nodeTypes: string[];
  categories: string[];
  hasErrorHandling: boolean;
  hasLoops: boolean;
  hasConditionals: boolean;
  estimatedExecutionTime: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export class WorkflowParser {
  private logger = logger.child({ context: 'WorkflowParser' });

  public parseWorkflow(workflowJson: any): ParsedWorkflow {
    try {
      const workflow = this.validateAndNormalizeWorkflow(workflowJson);
      const metadata = this.extractMetadata(workflow);
      const analysis = this.analyzeWorkflow(workflow);

      return {
        workflow,
        metadata,
        analysis
      };
    } catch (error) {
      this.logger.error('Failed to parse workflow:', error);
      throw new Error(`Failed to parse workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateAndNormalizeWorkflow(workflowJson: any): N8nWorkflow {
    // Basic validation
    if (!workflowJson) {
      throw new Error('Workflow JSON is required');
    }

    if (!workflowJson.nodes || !Array.isArray(workflowJson.nodes)) {
      throw new Error('Workflow must have a nodes array');
    }

    // Normalize the workflow structure
    const workflow: N8nWorkflow = {
      id: workflowJson.id || this.generateId(workflowJson.name),
      name: workflowJson.name || 'Untitled Workflow',
      nodes: this.normalizeNodes(workflowJson.nodes),
      connections: workflowJson.connections || {},
      active: workflowJson.active || false,
      settings: workflowJson.settings || {},
      versionId: workflowJson.versionId || '1'
    };

    return workflow;
  }

  private normalizeNodes(nodes: any[]): WorkflowNode[] {
    return nodes.map((node, index) => ({
      id: node.id || `node_${index}`,
      name: node.name || `Node ${index + 1}`,
      type: node.type || 'n8n-nodes-base.noOp',
      typeVersion: node.typeVersion || 1,
      position: node.position || [100 + index * 200, 100],
      parameters: node.parameters || {},
      disabled: node.disabled || false,
      notes: node.notes || '',
      alwaysExecute: node.alwaysExecute || false
    }));
  }

  private extractMetadata(workflow: N8nWorkflow): WorkflowMetadata {
    const nodeTypes = [...new Set(workflow.nodes.map(node => node.type))];
    const categories = this.categorizeWorkflow(workflow);
    const tags = this.extractTags(workflow);

    return {
      id: workflow.id,
      name: workflow.name,
      description: this.generateDescription(workflow),
      category: categories[0] || 'general',
      tags,
      complexity: this.calculateComplexity(workflow),
      nodeCount: workflow.nodes.length,
      connectionCount: this.countConnections(workflow.connections),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'system',
      version: workflow.versionId
    };
  }

  private analyzeWorkflow(workflow: N8nWorkflow): WorkflowAnalysis {
    const nodeTypes = [...new Set(workflow.nodes.map(node => node.type))];
    const categories = this.categorizeWorkflow(workflow);
    const hasErrorHandling = this.hasErrorHandling(workflow);
    const hasLoops = this.hasLoops(workflow);
    const hasConditionals = this.hasConditionals(workflow);
    const complexity = this.calculateComplexity(workflow);
    const riskLevel = this.assessRiskLevel(workflow);
    const recommendations = this.generateRecommendations(workflow);

    return {
      nodeCount: workflow.nodes.length,
      connectionCount: this.countConnections(workflow.connections),
      complexity,
      nodeTypes,
      categories,
      hasErrorHandling,
      hasLoops,
      hasConditionals,
      estimatedExecutionTime: this.estimateExecutionTime(workflow),
      riskLevel,
      recommendations
    };
  }

  private categorizeWorkflow(workflow: N8nWorkflow): string[] {
    const categories: string[] = [];
    const nodeTypes = workflow.nodes.map(node => node.type);

    // Data processing
    if (nodeTypes.some(type => type.includes('data') || type.includes('transform'))) {
      categories.push('data-processing');
    }

    // API integration
    if (nodeTypes.some(type => type.includes('http') || type.includes('api'))) {
      categories.push('api-integration');
    }

    // Automation
    if (nodeTypes.some(type => type.includes('schedule') || type.includes('trigger'))) {
      categories.push('automation');
    }

    // Notification
    if (nodeTypes.some(type => type.includes('email') || type.includes('slack') || type.includes('telegram'))) {
      categories.push('notification');
    }

    // File processing
    if (nodeTypes.some(type => type.includes('file') || type.includes('document'))) {
      categories.push('file-processing');
    }

    // Database
    if (nodeTypes.some(type => type.includes('database') || type.includes('sql') || type.includes('postgres'))) {
      categories.push('database');
    }

    return categories.length > 0 ? categories : ['general'];
  }

  private extractTags(workflow: N8nWorkflow): string[] {
    const tags: string[] = [];
    const nodeTypes = workflow.nodes.map(node => node.type);

    // Extract tags from node types
    nodeTypes.forEach(type => {
      const parts = type.split('.');
      if (parts.length > 1) {
        tags.push(parts[1]); // e.g., 'httpRequest' from 'n8n-nodes-base.httpRequest'
      }
    });

    // Add complexity-based tags
    const complexity = this.calculateComplexity(workflow);
    tags.push(complexity);

    // Add category-based tags
    const categories = this.categorizeWorkflow(workflow);
    tags.push(...categories);

    return [...new Set(tags)];
  }

  private generateDescription(workflow: N8nWorkflow): string {
    const nodeTypes = [...new Set(workflow.nodes.map(node => node.type))];
    const categories = this.categorizeWorkflow(workflow);
    
    let description = `A ${categories[0] || 'general'} workflow`;
    
    if (nodeTypes.includes('n8n-nodes-base.manualTrigger')) {
      description += ' that can be triggered manually';
    } else if (nodeTypes.includes('n8n-nodes-base.webhook')) {
      description += ' that responds to webhook requests';
    } else if (nodeTypes.some(type => type.includes('schedule'))) {
      description += ' that runs on a schedule';
    }

    description += ` with ${workflow.nodes.length} nodes`;

    return description;
  }

  private calculateComplexity(workflow: N8nWorkflow): 'simple' | 'moderate' | 'complex' {
    const nodeCount = workflow.nodes.length;
    const connectionCount = this.countConnections(workflow.connections);
    const hasLoops = this.hasLoops(workflow);
    const hasConditionals = this.hasConditionals(workflow);
    const hasErrorHandling = this.hasErrorHandling(workflow);

    let score = 0;

    // Node count scoring
    if (nodeCount <= 3) score += 1;
    else if (nodeCount <= 8) score += 2;
    else score += 3;

    // Connection density scoring
    const density = connectionCount / Math.max(nodeCount, 1);
    if (density <= 1) score += 1;
    else if (density <= 2) score += 2;
    else score += 3;

    // Feature scoring
    if (hasLoops) score += 2;
    if (hasConditionals) score += 1;
    if (hasErrorHandling) score += 1;

    if (score <= 3) return 'simple';
    if (score <= 6) return 'moderate';
    return 'complex';
  }

  private hasErrorHandling(workflow: N8nWorkflow): boolean {
    return workflow.nodes.some(node => 
      node.type.includes('error') || 
      node.type.includes('catch') ||
      node.parameters?.continueOnFail === true
    );
  }

  private hasLoops(workflow: N8nWorkflow): boolean {
    return workflow.nodes.some(node => 
      node.type.includes('loop') || 
      node.type.includes('repeat') ||
      node.type.includes('iterate')
    );
  }

  private hasConditionals(workflow: N8nWorkflow): boolean {
    return workflow.nodes.some(node => 
      node.type.includes('if') || 
      node.type.includes('switch') ||
      node.type.includes('condition')
    );
  }

  private countConnections(connections: any): number {
    let count = 0;
    for (const nodeConnections of Object.values(connections)) {
      if (Array.isArray(nodeConnections)) {
        for (const connection of nodeConnections) {
          if (Array.isArray(connection)) {
            count += connection.length;
          }
        }
      }
    }
    return count;
  }

  private estimateExecutionTime(workflow: N8nWorkflow): number {
    // Rough estimation based on node count and types
    let baseTime = workflow.nodes.length * 1000; // 1 second per node base

    // Add time for specific node types
    workflow.nodes.forEach(node => {
      if (node.type.includes('http')) baseTime += 2000; // HTTP requests take longer
      if (node.type.includes('database')) baseTime += 1500; // Database operations
      if (node.type.includes('file')) baseTime += 1000; // File operations
    });

    return Math.min(baseTime, 300000); // Cap at 5 minutes
  }

  private assessRiskLevel(workflow: N8nWorkflow): 'low' | 'medium' | 'high' {
    let riskScore = 0;

    // Check for sensitive operations
    if (workflow.nodes.some(node => node.type.includes('credential'))) riskScore += 2;
    if (workflow.nodes.some(node => node.type.includes('http'))) riskScore += 1;
    if (workflow.nodes.some(node => node.type.includes('database'))) riskScore += 2;
    if (workflow.nodes.some(node => node.type.includes('file'))) riskScore += 1;

    // Check for error handling
    if (!this.hasErrorHandling(workflow)) riskScore += 1;

    // Check for loops (can cause infinite loops)
    if (this.hasLoops(workflow)) riskScore += 1;

    if (riskScore <= 2) return 'low';
    if (riskScore <= 4) return 'medium';
    return 'high';
  }

  private generateRecommendations(workflow: N8nWorkflow): string[] {
    const recommendations: string[] = [];

    if (!this.hasErrorHandling(workflow)) {
      recommendations.push('Add error handling nodes to improve workflow reliability');
    }

    if (workflow.nodes.length > 10) {
      recommendations.push('Consider breaking this workflow into smaller, more manageable pieces');
    }

    if (workflow.nodes.some(node => node.type.includes('http') && !node.parameters?.timeout)) {
      recommendations.push('Add timeout settings to HTTP request nodes');
    }

    if (workflow.nodes.some(node => node.type.includes('credential'))) {
      recommendations.push('Ensure credentials are properly secured and rotated regularly');
    }

    if (this.hasLoops(workflow)) {
      recommendations.push('Add loop limits to prevent infinite loops');
    }

    return recommendations;
  }

  private generateId(name: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `${sanitizedName}_${timestamp}_${random}`;
  }
}



