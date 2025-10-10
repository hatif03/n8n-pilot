import { AgentBuilder, LlmAgent, FunctionTool } from '@iqai/adk';
import { N8nWorkflow, WorkflowAnalysis, VectorSearchRequest, VectorSearchResult } from '../types/workflow';
import { VectorSearchService } from '../services/vectorSearchService';
import { WorkflowValidator } from '../services/workflowValidator';
import { logger } from '../utils/logger';

export class WorkflowAnalyzerAgent {
  private agent: LlmAgent;
  private vectorSearchService: VectorSearchService;
  private validator: WorkflowValidator;
  private logger = logger.child({ context: 'WorkflowAnalyzerAgent' });

  constructor(vectorSearchService: VectorSearchService) {
    this.vectorSearchService = vectorSearchService;
    this.validator = new WorkflowValidator();
    this.agent = this.createAgent();
  }

  private createAgent(): LlmAgent {
    return new LlmAgent({
      name: 'workflow_analyzer',
      model: 'gemini-2.5-flash',
      description: 'AI agent that analyzes n8n workflows for patterns, performance, and optimization opportunities',
      instruction: `You are an expert n8n workflow analyst. Your role is to:

1. Analyze workflows for patterns, performance issues, and optimization opportunities
2. Identify anti-patterns and suggest improvements
3. Compare workflows with similar patterns in the knowledge base
4. Provide detailed analysis reports with actionable recommendations
5. Assess workflow complexity, maintainability, and scalability
6. Identify security vulnerabilities and compliance issues

When analyzing workflows:
- Look for performance bottlenecks and optimization opportunities
- Identify common patterns and anti-patterns
- Assess security and compliance issues
- Evaluate maintainability and scalability
- Compare with similar workflows in the knowledge base
- Provide specific, actionable recommendations

Available tools:
- analyzeWorkflow: Perform comprehensive workflow analysis
- searchSimilarWorkflows: Find similar workflows in the knowledge base
- validateWorkflow: Validate workflow for best practices
- calculateComplexity: Calculate workflow complexity metrics
- identifyPatterns: Identify common patterns and anti-patterns`,
      tools: [
        this.analyzeWorkflowTool(),
        this.searchSimilarWorkflowsTool(),
        this.validateWorkflowTool(),
        this.calculateComplexityTool(),
        this.identifyPatternsTool(),
      ],
    });
  }

  private analyzeWorkflowTool(): FunctionTool {
    return new FunctionTool({
      name: 'analyzeWorkflow',
      description: 'Perform comprehensive analysis of a workflow including performance, security, and maintainability',
      func: async (params: { 
        workflow: N8nWorkflow; 
        includeValidation?: boolean;
        includePatterns?: boolean;
      }) => {
        try {
          this.logger.info(`Analyzing workflow: ${params.workflow.name}`);
          
          const analysis: WorkflowAnalysis = {
            workflowId: params.workflow.id || 'unknown',
            complexityScore: this.calculateComplexityScore(params.workflow),
            performanceScore: this.calculatePerformanceScore(params.workflow),
            securityScore: this.calculateSecurityScore(params.workflow),
            maintainabilityScore: this.calculateMaintainabilityScore(params.workflow),
            issues: [],
            recommendations: [],
            patterns: [],
            dependencies: [],
          };

          // Add validation results if requested
          if (params.includeValidation) {
            const validationResult = this.validator.validateWorkflow(params.workflow, {
              strictness: 'high',
              categories: ['naming', 'security', 'performance', 'errorHandling', 'documentation'],
              includeSuggestions: true,
            });

            // Convert validation issues to analysis issues
            Object.entries(validationResult.categories).forEach(([category, result]) => {
              result.issues.forEach(issue => {
                analysis.issues.push({
                  type: 'warning',
                  category: category as any,
                  message: issue,
                  suggestion: result.suggestions[0] || 'Review and improve this aspect',
                });
              });
            });
          }

          // Identify patterns if requested
          if (params.includePatterns) {
            analysis.patterns = this.identifyWorkflowPatterns(params.workflow);
          }

          // Generate recommendations
          analysis.recommendations = this.generateRecommendations(params.workflow, analysis);

          return {
            success: true,
            analysis,
            message: `Workflow analysis completed. Overall score: ${Math.round((analysis.complexityScore + analysis.performanceScore + analysis.securityScore + analysis.maintainabilityScore) / 4)}/10`,
          };
        } catch (error) {
          this.logger.error('Failed to analyze workflow:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      },
    });
  }

  private searchSimilarWorkflowsTool(): FunctionTool {
    return new FunctionTool({
      name: 'searchSimilarWorkflows',
      description: 'Search for similar workflows in the knowledge base using semantic search',
      func: async (params: { 
        query: string; 
        limit?: number;
        threshold?: number;
      }) => {
        try {
          const searchRequest: VectorSearchRequest = {
            query: params.query,
            limit: params.limit || 10,
            threshold: params.threshold || 0.7,
          };

          const results = await this.vectorSearchService.searchByText(searchRequest.query || '', searchRequest.limit);
          
          return {
            success: true,
            results,
            message: `Found ${results.length} similar workflows`,
          };
        } catch (error) {
          this.logger.error('Failed to search similar workflows:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      },
    });
  }

  private validateWorkflowTool(): FunctionTool {
    return new FunctionTool({
      name: 'validateWorkflow',
      description: 'Validate a workflow for best practices and potential issues',
      func: async (params: { 
        workflow: N8nWorkflow; 
        strictness?: 'low' | 'medium' | 'high';
        categories?: string[];
      }) => {
        try {
          const validationResult = this.validator.validateWorkflow(params.workflow, {
            strictness: params.strictness || 'high',
            categories: params.categories || ['naming', 'security', 'performance', 'errorHandling', 'documentation'],
            includeSuggestions: true,
          });

          return {
            success: true,
            validation: validationResult,
            message: `Workflow validation completed. Score: ${validationResult.score}/100`,
          };
        } catch (error) {
          this.logger.error('Failed to validate workflow:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      },
    });
  }

  private calculateComplexityTool(): FunctionTool {
    return new FunctionTool({
      name: 'calculateComplexity',
      description: 'Calculate detailed complexity metrics for a workflow',
      func: async (params: { workflow: N8nWorkflow }) => {
        try {
          const complexity = this.calculateComplexityScore(params.workflow);
          const metrics = this.getComplexityMetrics(params.workflow);
          
          return {
            success: true,
            complexity,
            metrics,
            message: `Complexity calculated: ${complexity}/10`,
          };
        } catch (error) {
          this.logger.error('Failed to calculate complexity:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      },
    });
  }

  private identifyPatternsTool(): FunctionTool {
    return new FunctionTool({
      name: 'identifyPatterns',
      description: 'Identify common patterns and anti-patterns in a workflow',
      func: async (params: { workflow: N8nWorkflow }) => {
        try {
          const patterns = this.identifyWorkflowPatterns(params.workflow);
          const antiPatterns = this.identifyAntiPatterns(params.workflow);
          
          return {
            success: true,
            patterns,
            antiPatterns,
            message: `Identified ${patterns.length} patterns and ${antiPatterns.length} anti-patterns`,
          };
        } catch (error) {
          this.logger.error('Failed to identify patterns:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      },
    });
  }

  private calculateComplexityScore(workflow: N8nWorkflow): number {
    let score = 0;
    
    // Base score from node count
    const nodeCount = workflow.nodes?.length || 0;
    score += Math.min(nodeCount * 0.5, 5);
    
    // Add score for different node types
    const uniqueNodeTypes = new Set(workflow.nodes?.map(node => node.type) || []);
    score += Math.min(uniqueNodeTypes.size * 0.3, 2);
    
    // Add score for connections complexity
    const connectionCount = Object.keys(workflow.connections || {}).length;
    score += Math.min(connectionCount * 0.2, 2);
    
    // Add score for nested logic
    const logicNodes = workflow.nodes?.filter(node => 
      node.type.includes('if') || node.type.includes('switch') || node.type.includes('loop')
    ).length || 0;
    score += Math.min(logicNodes * 0.5, 1);
    
    return Math.min(Math.round(score * 10) / 10, 10);
  }

  private calculatePerformanceScore(workflow: N8nWorkflow): number {
    let score = 10;
    
    // Deduct for potential performance issues
    const httpNodes = workflow.nodes?.filter(node => 
      node.type === 'n8n-nodes-base.httpRequest'
    ).length || 0;
    
    if (httpNodes > 5) score -= 2;
    if (httpNodes > 10) score -= 3;
    
    // Check for loops without limits
    const loopNodes = workflow.nodes?.filter(node => {
      const params = node.parameters as any;
      return (node.type.includes('loop') || node.type.includes('repeat')) && 
             !params?.maxIterations && !params?.limit;
    }).length || 0;
    
    score -= loopNodes * 2;
    
    // Check for synchronous operations that could be parallel
    const sequentialHttpNodes = this.countSequentialHttpNodes(workflow);
    if (sequentialHttpNodes > 3) score -= 1;
    
    return Math.max(score, 0);
  }

  private calculateSecurityScore(workflow: N8nWorkflow): number {
    let score = 10;
    
    // Check for hardcoded credentials
    const hasHardcodedCredentials = workflow.nodes?.some(node => {
      if (!node.parameters) return false;
      const paramsStr = JSON.stringify(node.parameters).toLowerCase();
      const sensitivePatterns = ['password', 'secret', 'key', 'token', 'auth'];
      return sensitivePatterns.some(pattern => 
        paramsStr.includes(pattern) && !paramsStr.includes('{{') && !paramsStr.includes('$')
      );
    }) || false;
    
    if (hasHardcodedCredentials) score -= 5;
    
    // Check for HTTP nodes without authentication
    const httpNodes = workflow.nodes?.filter(node => 
      node.type === 'n8n-nodes-base.httpRequest'
    ) || [];
    
    const insecureHttpNodes = httpNodes.filter(node => {
      const params = node.parameters as any;
      return !params?.authentication || params.authentication === 'none';
    });
    
    score -= insecureHttpNodes.length * 1;
    
    return Math.max(score, 0);
  }

  private calculateMaintainabilityScore(workflow: N8nWorkflow): number {
    let score = 10;
    
    // Check for documentation
    const documentedNodes = workflow.nodes?.filter(node => 
      node.notes && node.notes.trim().length > 0
    ).length || 0;
    
    const totalNodes = workflow.nodes?.length || 1;
    const documentationRate = documentedNodes / totalNodes;
    
    if (documentationRate < 0.3) score -= 3;
    else if (documentationRate < 0.6) score -= 1;
    
    // Check for descriptive names
    const defaultNames = workflow.nodes?.filter(node => {
      if (!node.name || !node.type) return false;
      const nodeTypeName = node.type.split('.').pop();
      return node.name.includes(nodeTypeName);
    }).length || 0;
    
    if (defaultNames > 0) score -= Math.min(defaultNames * 0.5, 3);
    
    // Check for workflow description
    if (!workflow.settings?.description) score -= 1;
    
    return Math.max(score, 0);
  }

  private getComplexityMetrics(workflow: N8nWorkflow): Record<string, any> {
    const nodes = workflow.nodes || [];
    
    return {
      nodeCount: nodes.length,
      uniqueNodeTypes: new Set(nodes.map(node => node.type)).size,
      connectionCount: Object.keys(workflow.connections || {}).length,
      logicNodes: nodes.filter(node => 
        node.type.includes('if') || node.type.includes('switch') || node.type.includes('loop')
      ).length,
      httpNodes: nodes.filter(node => node.type === 'n8n-nodes-base.httpRequest').length,
      triggerNodes: nodes.filter(node => node.type.includes('trigger')).length,
      documentationRate: nodes.filter(node => node.notes && node.notes.trim().length > 0).length / Math.max(nodes.length, 1),
    };
  }

  private identifyWorkflowPatterns(workflow: N8nWorkflow): string[] {
    const patterns: string[] = [];
    const nodes = workflow.nodes || [];
    
    // ETL Pattern
    if (nodes.some(node => node.type.includes('trigger')) &&
        nodes.some(node => node.type.includes('transform') || node.type === 'n8n-nodes-base.set') &&
        nodes.some(node => node.type.includes('http') || node.type.includes('database'))) {
      patterns.push('ETL (Extract, Transform, Load)');
    }
    
    // Webhook Pattern
    if (nodes.some(node => node.type === 'n8n-nodes-base.webhook')) {
      patterns.push('Webhook Integration');
    }
    
    // Scheduled Task Pattern
    if (nodes.some(node => node.type === 'n8n-nodes-base.scheduleTrigger')) {
      patterns.push('Scheduled Task');
    }
    
    // API Gateway Pattern
    if (nodes.filter(node => node.type === 'n8n-nodes-base.httpRequest').length > 3) {
      patterns.push('API Gateway/Proxy');
    }
    
    // Error Handling Pattern
    if (nodes.some(node => node.type === 'n8n-nodes-base.errorTrigger')) {
      patterns.push('Error Handling');
    }
    
    // Data Processing Pattern
    if (nodes.filter(node => 
      node.type === 'n8n-nodes-base.set' || 
      node.type === 'n8n-nodes-base.merge' ||
      node.type === 'n8n-nodes-base.if'
    ).length > 2) {
      patterns.push('Data Processing Pipeline');
    }
    
    return patterns;
  }

  private identifyAntiPatterns(workflow: N8nWorkflow): string[] {
    const antiPatterns: string[] = [];
    const nodes = workflow.nodes || [];
    
    // Too many nodes
    if (nodes.length > 50) {
      antiPatterns.push('Monolithic workflow with too many nodes');
    }
    
    // Hardcoded values
    const hasHardcodedValues = nodes.some(node => {
      if (!node.parameters) return false;
      const paramsStr = JSON.stringify(node.parameters);
      return paramsStr.includes('http://') || paramsStr.includes('https://') && !paramsStr.includes('{{');
    });
    
    if (hasHardcodedValues) {
      antiPatterns.push('Hardcoded URLs or values');
    }
    
    // No error handling
    if (!nodes.some(node => node.type === 'n8n-nodes-base.errorTrigger') && 
        !workflow.settings?.errorWorkflow) {
      antiPatterns.push('No error handling mechanism');
    }
    
    // Sequential HTTP requests
    const httpNodes = nodes.filter(node => node.type === 'n8n-nodes-base.httpRequest');
    if (httpNodes.length > 3) {
      antiPatterns.push('Multiple sequential HTTP requests that could be parallelized');
    }
    
    return antiPatterns;
  }

  private countSequentialHttpNodes(workflow: N8nWorkflow): number {
    // This is a simplified implementation
    // In production, you would analyze the actual connection graph
    return workflow.nodes?.filter(node => node.type === 'n8n-nodes-base.httpRequest').length || 0;
  }

  private generateRecommendations(workflow: N8nWorkflow, analysis: WorkflowAnalysis): string[] {
    const recommendations: string[] = [];
    
    if (analysis.complexityScore > 7) {
      recommendations.push('Consider breaking down this workflow into smaller, more manageable pieces');
    }
    
    if (analysis.performanceScore < 7) {
      recommendations.push('Optimize performance by parallelizing independent operations');
    }
    
    if (analysis.securityScore < 8) {
      recommendations.push('Review and improve security practices, especially credential management');
    }
    
    if (analysis.maintainabilityScore < 7) {
      recommendations.push('Improve documentation and use more descriptive node names');
    }
    
    if (analysis.issues.length > 5) {
      recommendations.push('Address the identified issues to improve workflow quality');
    }
    
    return recommendations;
  }

  public async analyzeWorkflow(workflow: N8nWorkflow, options?: {
    includeValidation?: boolean;
    includePatterns?: boolean;
    includeSimilar?: boolean;
  }): Promise<any> {
    try {
      this.logger.info(`Analyzing workflow: ${workflow.name}`);
      
      const { runner } = await AgentBuilder.create('workflow_analyzer').withAgent(this.agent).build();
      
      const prompt = `Analyze this n8n workflow comprehensively:

Workflow: ${workflow.name}
Nodes: ${workflow.nodes?.length || 0}
Active: ${workflow.active}

${options?.includeValidation ? 'Include validation results' : ''}
${options?.includePatterns ? 'Include pattern analysis' : ''}
${options?.includeSimilar ? 'Find similar workflows' : ''}

Please provide:
1. Detailed analysis of the workflow
2. Performance, security, and maintainability scores
3. Identified patterns and anti-patterns
4. Specific recommendations for improvement
5. Comparison with similar workflows (if applicable)`;

      const result = await runner.ask(prompt);
      
      this.logger.info('Workflow analysis completed');
      return result;
    } catch (error) {
      this.logger.error('Failed to analyze workflow:', error);
      throw new Error(`Failed to analyze workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public getAgent(): LlmAgent {
    return this.agent;
  }
}

