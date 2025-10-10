import { AgentBuilder, LlmAgent, FunctionTool } from '@iqai/adk';
import { N8nWorkflow, N8nNode, N8nConnection } from '../types/workflow';
import { N8nService } from '../services/n8nService';
import { WorkflowValidator } from '../services/workflowValidator';
import { logger } from '../utils/logger';

export class WorkflowBuilderAgent {
  private agent: LlmAgent;
  private n8nService: N8nService;
  private validator: WorkflowValidator;
  private logger = logger.child({ context: 'WorkflowBuilderAgent' });

  constructor(n8nService: N8nService) {
    this.n8nService = n8nService;
    this.validator = new WorkflowValidator();
    this.agent = this.createAgent();
  }

  private createAgent(): LlmAgent {
    return new LlmAgent({
      name: 'workflow_builder',
      model: 'gemini-2.5-flash',
      description: 'AI agent that builds production-ready n8n workflows from natural language descriptions',
      instruction: `You are an expert n8n workflow builder. Your role is to:

1. Create comprehensive, production-ready n8n workflows from natural language descriptions
2. Ensure workflows follow best practices for naming, error handling, security, and performance
3. Use appropriate node types and connections for the given requirements
4. Include proper error handling and validation
5. Add meaningful node names and documentation
6. Optimize for maintainability and scalability

When building workflows:
- Always start with a trigger node (schedule, webhook, or manual)
- Use descriptive names for all nodes
- Include error handling where appropriate
- Add proper connections between nodes
- Consider security implications
- Optimize for performance

Available tools:
- createWorkflow: Create a new n8n workflow
- validateWorkflow: Validate a workflow for best practices
- listAvailableNodes: Get information about available n8n nodes
- analyzeRequirements: Analyze user requirements and suggest workflow structure`,
      tools: [
        this.createWorkflowTool(),
        this.validateWorkflowTool(),
        this.listAvailableNodesTool(),
        this.analyzeRequirementsTool(),
      ],
    });
  }

  private createWorkflowTool(): FunctionTool {
    return new FunctionTool(async (params: { 
      name: string; 
      description?: string; 
      nodes: N8nNode[]; 
      connections: N8nConnection[];
      instanceName?: string;
    }) => {
        try {
          this.logger.info(`Creating workflow: ${params.name}`);
          
          const workflow: N8nWorkflow = {
            name: params.name,
            nodes: params.nodes,
            connections: this.convertConnectionsToN8nFormat(params.connections),
            active: false,
            settings: {
              executionOrder: 'v1',
              saveManualExecutions: true,
              callerPolicy: 'workflowsFromSameOwner',
            },
            tags: [],
          };

          const createdWorkflow = await this.n8nService.createWorkflow(workflow, params.instanceName);
          
          this.logger.info(`Successfully created workflow: ${createdWorkflow.name} (ID: ${createdWorkflow.id})`);
          
          return {
            success: true,
            workflow: createdWorkflow,
            message: `Workflow '${params.name}' created successfully`,
          };
        } catch (error) {
          this.logger.error(`Failed to create workflow ${params.name}:`, error);
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      }, {
        name: 'createWorkflow',
        description: 'Create a new n8n workflow with specified nodes and connections',
      });
  }

  private validateWorkflowTool(): FunctionTool {
    return new FunctionTool(async (params: { 
      workflow: N8nWorkflow; 
      strictness?: 'low' | 'medium' | 'high';
      categories?: string[];
    }) => {
        try {
          const validationResult = this.validator.validateWorkflow(params.workflow, {
            strictness: params.strictness || 'medium',
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
      }, {
        name: 'validateWorkflow',
        description: 'Validate a workflow for best practices and potential issues',
      });
  }

  private listAvailableNodesTool(): FunctionTool {
    return new FunctionTool(async (params: { 
      category?: string; 
      search?: string;
      limit?: number;
    }) => {
        try {
          // This is a simplified implementation
          // In production, you would query the actual n8n node registry
          const commonNodes = [
            {
              type: 'n8n-nodes-base.scheduleTrigger',
              name: 'Schedule Trigger',
              category: 'trigger',
              description: 'Triggers workflow execution on a schedule',
              parameters: ['triggerTimes', 'timezone'],
            },
            {
              type: 'n8n-nodes-base.webhook',
              name: 'Webhook',
              category: 'trigger',
              description: 'Triggers workflow execution via HTTP webhook',
              parameters: ['httpMethod', 'path', 'responseMode'],
            },
            {
              type: 'n8n-nodes-base.httpRequest',
              name: 'HTTP Request',
              category: 'action',
              description: 'Makes HTTP requests to external APIs',
              parameters: ['url', 'method', 'authentication', 'headers', 'body'],
            },
            {
              type: 'n8n-nodes-base.set',
              name: 'Set',
              category: 'transform',
              description: 'Sets data values and transforms data structure',
              parameters: ['values', 'options'],
            },
            {
              type: 'n8n-nodes-base.if',
              name: 'IF',
              category: 'logic',
              description: 'Conditional logic for workflow branching',
              parameters: ['conditions', 'options'],
            },
            {
              type: 'n8n-nodes-base.switch',
              name: 'Switch',
              category: 'logic',
              description: 'Routes data based on different conditions',
              parameters: ['rules', 'options'],
            },
            {
              type: 'n8n-nodes-base.merge',
              name: 'Merge',
              category: 'transform',
              description: 'Merges data from multiple sources',
              parameters: ['mode', 'options'],
            },
            {
              type: 'n8n-nodes-base.errorTrigger',
              name: 'Error Trigger',
              category: 'trigger',
              description: 'Handles errors from other nodes',
              parameters: ['errorMessage', 'options'],
            },
          ];

          let filteredNodes = commonNodes;

          if (params.category) {
            filteredNodes = filteredNodes.filter(node => node.category === params.category);
          }

          if (params.search) {
            const searchLower = params.search.toLowerCase();
            filteredNodes = filteredNodes.filter(node => 
              node.name.toLowerCase().includes(searchLower) ||
              node.description.toLowerCase().includes(searchLower)
            );
          }

          if (params.limit) {
            filteredNodes = filteredNodes.slice(0, params.limit);
          }

          return {
            success: true,
            nodes: filteredNodes,
            total: filteredNodes.length,
          };
        } catch (error) {
          this.logger.error('Failed to list available nodes:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      }, {
        name: 'listAvailableNodes',
        description: 'Get information about available n8n node types and their capabilities',
      });
  }

  private analyzeRequirementsTool(): FunctionTool {
    return new FunctionTool(async (params: { 
      description: string; 
      context?: Record<string, any>;
    }) => {
        try {
          // This is a simplified analysis
          // In production, you would use more sophisticated NLP analysis
          const analysis = {
            suggestedNodes: [] as string[],
            workflowType: 'unknown',
            complexity: 'medium',
            recommendations: [] as string[],
            potentialIssues: [] as string[],
          };

          const desc = params.description.toLowerCase();

          // Analyze trigger requirements
          if (desc.includes('schedule') || desc.includes('cron') || desc.includes('daily') || desc.includes('hourly')) {
            analysis.suggestedNodes.push('n8n-nodes-base.scheduleTrigger');
            analysis.workflowType = 'scheduled';
          } else if (desc.includes('webhook') || desc.includes('api') || desc.includes('http')) {
            analysis.suggestedNodes.push('n8n-nodes-base.webhook');
            analysis.workflowType = 'webhook';
          } else {
            analysis.suggestedNodes.push('n8n-nodes-base.manualTrigger');
            analysis.workflowType = 'manual';
          }

          // Analyze data processing requirements
          if (desc.includes('transform') || desc.includes('convert') || desc.includes('map')) {
            analysis.suggestedNodes.push('n8n-nodes-base.set');
          }

          if (desc.includes('condition') || desc.includes('if') || desc.includes('branch')) {
            analysis.suggestedNodes.push('n8n-nodes-base.if');
          }

          if (desc.includes('merge') || desc.includes('combine') || desc.includes('join')) {
            analysis.suggestedNodes.push('n8n-nodes-base.merge');
          }

          // Analyze external integrations
          if (desc.includes('http') || desc.includes('api') || desc.includes('request')) {
            analysis.suggestedNodes.push('n8n-nodes-base.httpRequest');
          }

          // Analyze complexity
          if (analysis.suggestedNodes.length > 5) {
            analysis.complexity = 'high';
          } else if (analysis.suggestedNodes.length > 2) {
            analysis.complexity = 'medium';
          } else {
            analysis.complexity = 'low';
          }

          // Add recommendations
          analysis.recommendations.push('Include error handling with Error Trigger node');
          analysis.recommendations.push('Use descriptive names for all nodes');
          analysis.recommendations.push('Add proper documentation and notes');

          if (analysis.workflowType === 'webhook') {
            analysis.recommendations.push('Consider rate limiting for webhook endpoints');
          }

          if (analysis.complexity === 'high') {
            analysis.recommendations.push('Consider breaking down into smaller workflows');
            analysis.potentialIssues.push('High complexity may impact maintainability');
          }

          return {
            success: true,
            analysis,
            message: 'Requirements analysis completed',
          };
        } catch (error) {
          this.logger.error('Failed to analyze requirements:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      }, {
        name: 'analyzeRequirements',
        description: 'Analyze user requirements and suggest workflow structure and components',
      });
  }

  private convertConnectionsToN8nFormat(connections: N8nConnection[]): Record<string, any> {
    const n8nConnections: Record<string, any> = {};
    
    for (const conn of connections) {
      if (!n8nConnections[conn.source]) {
        n8nConnections[conn.source] = { main: [[]] };
      }
      
      n8nConnections[conn.source].main[conn.sourceOutput].push({
        node: conn.target,
        type: 'main',
        index: conn.targetInput,
      });
    }
    
    return n8nConnections;
  }

  public async buildWorkflow(description: string, context?: Record<string, any>): Promise<any> {
    try {
      this.logger.info(`Building workflow from description: ${description}`);
      
      const { runner } = await AgentBuilder.create('workflow_builder').withAgent(this.agent).build();
      
      const prompt = `Create a production-ready n8n workflow based on this description:

"${description}"

${context ? `Additional context: ${JSON.stringify(context, null, 2)}` : ''}

Please:
1. Analyze the requirements
2. Design the workflow structure
3. Create the workflow with proper nodes and connections
4. Validate the workflow for best practices
5. Provide a summary of what was created

Make sure to use descriptive names, include error handling, and follow n8n best practices.`;

      const result = await runner.ask(prompt);
      
      this.logger.info('Workflow building completed');
      return result;
    } catch (error) {
      this.logger.error('Failed to build workflow:', error);
      throw new Error(`Failed to build workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public getAgent(): LlmAgent {
    return this.agent;
  }
}

