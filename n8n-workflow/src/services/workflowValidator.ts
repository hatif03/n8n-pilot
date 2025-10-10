import { N8nWorkflow, WorkflowValidationResult } from '../types/workflow';
import { logger } from '../utils/logger';

export interface ValidationOptions {
  strictness: 'low' | 'medium' | 'high';
  categories: string[];
  includeSuggestions: boolean;
}

export class WorkflowValidator {
  private logger = logger.child({ context: 'WorkflowValidator' });

  public validateWorkflow(
    workflow: N8nWorkflow, 
    options: ValidationOptions = { strictness: 'medium', categories: ['naming', 'security', 'performance', 'errorHandling', 'documentation'], includeSuggestions: true }
  ): WorkflowValidationResult {
    this.logger.debug(`Validating workflow: ${workflow.name}`, { workflowId: workflow.id });

    const results: Record<string, any> = {};
    let totalIssues = 0;
    let criticalIssues = 0;

    // Run validation for each category
    for (const category of options.categories) {
      const result = this.validateCategory(workflow, category, options.strictness);
      results[category] = result;
      totalIssues += result.issues.length;
      if (result.critical) {
        criticalIssues += result.critical;
      }
    }

    // Calculate overall score
    const categoryScores = Object.values(results).map((r: any) => r.score || 0);
    const averageScore = categoryScores.length > 0 ? categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length : 0;

    const validationResult: WorkflowValidationResult = {
      passed: criticalIssues === 0 && totalIssues === 0,
      score: Math.round(averageScore),
      categories: results,
      totalIssues,
      criticalIssues,
    };

    this.logger.info(`Workflow validation completed`, {
      workflowId: workflow.id,
      workflowName: workflow.name,
      passed: validationResult.passed,
      score: validationResult.score,
      totalIssues,
      criticalIssues,
    });

    return validationResult;
  }

  private validateCategory(workflow: N8nWorkflow, category: string, strictness: string): any {
    switch (category) {
      case 'naming':
        return this.validateNaming(workflow, strictness);
      case 'security':
        return this.validateSecurity(workflow, strictness);
      case 'performance':
        return this.validatePerformance(workflow, strictness);
      case 'errorHandling':
        return this.validateErrorHandling(workflow, strictness);
      case 'documentation':
        return this.validateDocumentation(workflow, strictness);
      default:
        return { passed: true, score: 100, issues: [], suggestions: [], critical: 0 };
    }
  }

  private validateNaming(workflow: N8nWorkflow, strictness: string): any {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let critical = 0;

    // Check workflow name
    if (!workflow.name) {
      issues.push('Workflow name is missing');
      suggestions.push('Add a descriptive name to the workflow');
      critical++;
    } else if (workflow.name.length < 5 && strictness !== 'low') {
      issues.push('Workflow name is too short');
      suggestions.push('Use a more descriptive name that indicates the workflow\'s purpose');
    }

    // Check node names
    if (workflow.nodes && Array.isArray(workflow.nodes)) {
      const defaultNodeNames = new Set();
      const duplicateNodeNames = new Set();
      
      workflow.nodes.forEach(node => {
        // Check for default names (ones that include the node type)
        if (node.name && node.type) {
          const nodeTypeName = node.type.split('.').pop();
          if (nodeTypeName && node.name.includes(nodeTypeName)) {
            defaultNodeNames.add(node.name);
          }
        }
        
        // Check for duplicate names
        if (node.name) {
          const count = workflow.nodes!.filter(n => n.name === node.name).length;
          if (count > 1) {
            duplicateNodeNames.add(node.name);
          }
        }
      });
      
      if (defaultNodeNames.size > 0 && strictness !== 'low') {
        issues.push(`${defaultNodeNames.size} nodes have default names`);
        suggestions.push('Rename nodes to better describe their purpose in the workflow');
      }
      
      if (duplicateNodeNames.size > 0) {
        issues.push(`Found ${duplicateNodeNames.size} duplicate node names`);
        suggestions.push('Ensure each node has a unique name to avoid confusion');
        critical += duplicateNodeNames.size;
      }
    }

    const score = issues.length === 0 ? 100 : Math.max(0, 100 - (issues.length * 20) - (critical * 30));
    return { passed: issues.length === 0, score, issues, suggestions, critical };
  }

  private validateSecurity(workflow: N8nWorkflow, strictness: string): any {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let critical = 0;

    // Check for hardcoded credentials
    if (workflow.nodes && Array.isArray(workflow.nodes)) {
      workflow.nodes.forEach(node => {
        if (node.parameters) {
          const paramsStr = JSON.stringify(node.parameters).toLowerCase();
          const sensitivePatterns = ['password', 'secret', 'key', 'token', 'auth'];
          
          for (const pattern of sensitivePatterns) {
            if (paramsStr.includes(pattern) && !paramsStr.includes('{{') && !paramsStr.includes('$')) {
              issues.push(`Node '${node.name}' may contain hardcoded sensitive data`);
              suggestions.push('Use environment variables or credential stores for sensitive data');
              critical++;
            }
          }
        }
      });
    }

    // Check for HTTP nodes without proper authentication
    const httpNodes = workflow.nodes?.filter(node => 
      node.type === 'n8n-nodes-base.httpRequest' || 
      node.type.toLowerCase().includes('http')
    ) || [];

    if (httpNodes.length > 0) {
      const insecureHttpNodes = httpNodes.filter(node => {
        const params = node.parameters as any;
        return !params?.authentication || params.authentication === 'none';
      });

      if (insecureHttpNodes.length > 0 && strictness !== 'low') {
        issues.push(`${insecureHttpNodes.length} HTTP nodes without authentication`);
        suggestions.push('Add proper authentication to HTTP requests');
      }
    }

    const score = issues.length === 0 ? 100 : Math.max(0, 100 - (issues.length * 25) - (critical * 40));
    return { passed: issues.length === 0, score, issues, suggestions, critical };
  }

  private validatePerformance(workflow: N8nWorkflow, strictness: string): any {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let critical = 0;

    if (!workflow.nodes) {
      return { passed: true, score: 100, issues, suggestions, critical };
    }

    // Check for too many nodes
    const nodeCount = workflow.nodes.length;
    if (nodeCount > 50 && strictness === 'high') {
      issues.push(`Workflow has ${nodeCount} nodes, which may impact performance`);
      suggestions.push('Consider breaking down the workflow into smaller, more manageable pieces');
    }

    // Check for loops without limits
    const loopNodes = workflow.nodes.filter(node => 
      node.type.includes('loop') || node.type.includes('repeat')
    );

    if (loopNodes.length > 0) {
      const unlimitedLoops = loopNodes.filter(node => {
        const params = node.parameters as any;
        return !params?.maxIterations && !params?.limit;
      });

      if (unlimitedLoops.length > 0) {
        issues.push(`${unlimitedLoops.length} loop nodes without iteration limits`);
        suggestions.push('Add iteration limits to prevent infinite loops');
        critical += unlimitedLoops.length;
      }
    }

    // Check for synchronous operations that could be parallel
    const httpNodes = workflow.nodes.filter(node => 
      node.type === 'n8n-nodes-base.httpRequest'
    );

    if (httpNodes.length > 3 && strictness !== 'low') {
      issues.push('Multiple HTTP requests that could potentially be parallelized');
      suggestions.push('Consider using parallel execution for independent HTTP requests');
    }

    const score = issues.length === 0 ? 100 : Math.max(0, 100 - (issues.length * 15) - (critical * 25));
    return { passed: issues.length === 0, score, issues, suggestions, critical };
  }

  private validateErrorHandling(workflow: N8nWorkflow, strictness: string): any {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let critical = 0;

    // Check if workflow has error handling
    const hasErrorTrigger = workflow.nodes?.some(node => 
      node.type === 'n8n-nodes-base.errorTrigger'
    ) || false;

    const hasErrorWorkflow = workflow.settings?.errorWorkflow;

    if (!hasErrorTrigger && !hasErrorWorkflow && strictness !== 'low') {
      issues.push('No error handling found in workflow');
      suggestions.push('Add an Error Trigger node or set an error workflow in the settings');
    }

    // Check for HTTP nodes without error handling
    const httpNodes = workflow.nodes?.filter(node => 
      node.type === 'n8n-nodes-base.httpRequest' || 
      node.type.toLowerCase().includes('http')
    ) || [];

    if (httpNodes.length > 0) {
      const hasHttpErrorHandling = httpNodes.some(node => {
        const params = node.parameters as any;
        return params?.continueOnFail || params?.retryOnFail;
      });

      if (!hasHttpErrorHandling && strictness !== 'low') {
        issues.push('HTTP nodes without proper error handling');
        suggestions.push('Enable "Continue on Fail" or "Retry on Fail" for HTTP requests');
      }
    }

    const score = issues.length === 0 ? 100 : Math.max(0, 100 - (issues.length * 20) - (critical * 30));
    return { passed: issues.length === 0, score, issues, suggestions, critical };
  }

  private validateDocumentation(workflow: N8nWorkflow, strictness: string): any {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let critical = 0;

    // Check for workflow description
    if (!workflow.settings?.description && strictness !== 'low') {
      issues.push('Workflow lacks description');
      suggestions.push('Add a description explaining the workflow\'s purpose');
    }

    // Check for node documentation
    const functionalNodes = workflow.nodes?.filter(node => 
      !node.type.includes('stickyNote') && 
      !node.type.includes('note')
    ) || [];

    const documentedNodes = functionalNodes.filter(node => 
      node.notes && node.notes.trim().length > 0
    );

    if (functionalNodes.length > 0) {
      const documentationRate = documentedNodes.length / functionalNodes.length;
      
      if (documentationRate < 0.5 && strictness === 'high') {
        issues.push(`Only ${Math.round(documentationRate * 100)}% of nodes are documented`);
        suggestions.push('Add notes to important nodes explaining their purpose');
      }
    }

    const score = issues.length === 0 ? 100 : Math.max(0, 100 - (issues.length * 15));
    return { passed: issues.length === 0, score, issues, suggestions, critical };
  }
}

