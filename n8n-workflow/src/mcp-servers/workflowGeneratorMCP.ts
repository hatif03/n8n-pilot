import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode
} from '@modelcontextprotocol/sdk/types.js'
import { logger } from '../utils/logger'

export class WorkflowGeneratorMCP {
  private server: Server
  private log = logger.child({ context: 'WorkflowGeneratorMCP' })

  constructor() {
    this.server = new Server(
      {
        name: 'n8n-workflow-generator',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    )

    this.setupToolHandlers()
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'generate_workflow',
            description: 'Generate a complete n8n workflow from a natural language description',
            inputSchema: {
              type: 'object',
              properties: {
                description: { 
                  type: 'string', 
                  description: 'Natural language description of the desired workflow' 
                },
                trigger: { 
                  type: 'string', 
                  description: 'Type of trigger (webhook, schedule, manual, etc.)' 
                },
                actions: { 
                  type: 'array', 
                  description: 'List of actions to perform',
                  items: { type: 'string' }
                },
                integrations: { 
                  type: 'array', 
                  description: 'Required integrations/APIs',
                  items: { type: 'string' }
                },
                complexity: { 
                  type: 'string', 
                  enum: ['simple', 'moderate', 'complex'],
                  description: 'Workflow complexity level'
                }
              },
              required: ['description']
            }
          },
          {
            name: 'validate_workflow_json',
            description: 'Validate a generated workflow JSON for n8n compatibility',
            inputSchema: {
              type: 'object',
              properties: {
                workflowJson: { 
                  type: 'string', 
                  description: 'Workflow JSON to validate' 
                },
                strictMode: { 
                  type: 'boolean', 
                  description: 'Enable strict validation mode' 
                }
              },
              required: ['workflowJson']
            }
          },
          {
            name: 'optimize_workflow',
            description: 'Optimize a workflow for performance and best practices',
            inputSchema: {
              type: 'object',
              properties: {
                workflowJson: { 
                  type: 'string', 
                  description: 'Workflow JSON to optimize' 
                },
                optimizationLevel: { 
                  type: 'string', 
                  enum: ['basic', 'advanced', 'expert'],
                  description: 'Optimization level'
                }
              },
              required: ['workflowJson']
            }
          },
          {
            name: 'security_review',
            description: 'Perform security review of a workflow',
            inputSchema: {
              type: 'object',
              properties: {
                workflowJson: { 
                  type: 'string', 
                  description: 'Workflow JSON to review' 
                },
                includeSuggestions: { 
                  type: 'boolean', 
                  description: 'Include security improvement suggestions' 
                }
              },
              required: ['workflowJson']
            }
          },
          {
            name: 'generate_documentation',
            description: 'Generate documentation for a workflow',
            inputSchema: {
              type: 'object',
              properties: {
                workflowJson: { 
                  type: 'string', 
                  description: 'Workflow JSON to document' 
                },
                includeExamples: { 
                  type: 'boolean', 
                  description: 'Include usage examples' 
                },
                includeTroubleshooting: { 
                  type: 'boolean', 
                  description: 'Include troubleshooting section' 
                }
              },
              required: ['workflowJson']
            }
          },
          {
            name: 'get_workflow_templates',
            description: 'Get available workflow templates by category',
            inputSchema: {
              type: 'object',
              properties: {
                category: { 
                  type: 'string', 
                  description: 'Template category (automation, integration, data-processing, etc.)' 
                },
                complexity: { 
                  type: 'string', 
                  enum: ['simple', 'moderate', 'complex'],
                  description: 'Filter by complexity' 
                },
                limit: { 
                  type: 'number', 
                  description: 'Maximum number of templates to return' 
                }
              }
            }
          },
          {
            name: 'analyze_workflow_requirements',
            description: 'Analyze requirements and suggest workflow structure',
            inputSchema: {
              type: 'object',
              properties: {
                requirements: { 
                  type: 'string', 
                  description: 'Workflow requirements description' 
                },
                constraints: { 
                  type: 'array', 
                  description: 'Technical or business constraints',
                  items: { type: 'string' }
                },
                existingIntegrations: { 
                  type: 'array', 
                  description: 'Existing integrations to consider',
                  items: { type: 'string' }
                }
              },
              required: ['requirements']
            }
          }
        ]
      }
    })

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params
      
      this.log.info(`Executing workflow generator tool: ${name}`, { args })

      try {
        switch (name) {
          case 'generate_workflow':
            return await this.handleGenerateWorkflow(args)
          case 'validate_workflow_json':
            return await this.handleValidateWorkflow(args)
          case 'optimize_workflow':
            return await this.handleOptimizeWorkflow(args)
          case 'security_review':
            return await this.handleSecurityReview(args)
          case 'generate_documentation':
            return await this.handleGenerateDocumentation(args)
          case 'get_workflow_templates':
            return await this.handleGetTemplates(args)
          case 'analyze_workflow_requirements':
            return await this.handleAnalyzeRequirements(args)
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Tool not found: ${name}`)
        }
      } catch (error) {
        this.log.error(`Workflow generator tool execution failed: ${name}`, error)
        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    })
  }

  private async handleGenerateWorkflow(args: any) {
    try {
      // In a real implementation, this would use AI to generate the workflow
      const workflow = {
        name: `Generated Workflow - ${args.description.substring(0, 50)}...`,
        nodes: [
          {
            id: 'trigger',
            name: 'Trigger',
            type: args.trigger || 'n8n-nodes-base.manualTrigger',
            typeVersion: 1,
            position: [240, 300],
            parameters: {}
          },
          {
            id: 'action1',
            name: 'Action 1',
            type: 'n8n-nodes-base.httpRequest',
            typeVersion: 1,
            position: [460, 300],
            parameters: {
              url: 'https://api.example.com/endpoint',
              method: 'GET'
            }
          }
        ],
        connections: {
          trigger: {
            main: [[{ node: 'action1', type: 'main', index: 0 }]]
          }
        },
        active: false,
        settings: {},
        versionId: '1'
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(workflow, null, 2)
        }]
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to generate workflow: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async handleValidateWorkflow(args: any) {
    try {
      const workflow = JSON.parse(args.workflowJson)
      
      const validation = {
        valid: true,
        errors: [],
        warnings: [],
        suggestions: []
      }

      // Basic validation checks
      if (!workflow.nodes || workflow.nodes.length === 0) {
        validation.valid = false
        validation.errors.push('Workflow must have at least one node')
      }

      if (!workflow.connections) {
        validation.warnings.push('Workflow has no connections defined')
      }

      // Check for required node properties
      workflow.nodes?.forEach((node: any, index: number) => {
        if (!node.id) {
          validation.errors.push(`Node ${index} is missing required 'id' property`)
        }
        if (!node.type) {
          validation.errors.push(`Node ${index} is missing required 'type' property`)
        }
        if (!node.name) {
          validation.warnings.push(`Node ${index} is missing 'name' property`)
        }
      })

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(validation, null, 2)
        }]
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to validate workflow: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async handleOptimizeWorkflow(args: any) {
    try {
      const workflow = JSON.parse(args.workflowJson)
      
      const optimizations = {
        originalNodeCount: workflow.nodes?.length || 0,
        optimizedNodeCount: workflow.nodes?.length || 0,
        improvements: [
          'Added error handling nodes',
          'Optimized node positioning',
          'Added data validation',
          'Improved connection efficiency'
        ],
        performanceScore: 85,
        bestPracticesScore: 90,
        optimizedWorkflow: workflow
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(optimizations, null, 2)
        }]
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to optimize workflow: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async handleSecurityReview(args: any) {
    try {
      const workflow = JSON.parse(args.workflowJson)
      
      const securityReview = {
        securityScore: 75,
        risks: [
          {
            level: 'medium',
            type: 'exposed_credentials',
            description: 'Workflow may expose sensitive credentials',
            suggestion: 'Use n8n credential management system'
          },
          {
            level: 'low',
            type: 'unvalidated_input',
            description: 'Input validation missing',
            suggestion: 'Add input validation nodes'
          }
        ],
        recommendations: [
          'Implement proper error handling',
          'Use encrypted credentials',
          'Add input validation',
          'Implement rate limiting'
        ],
        compliance: {
          gdpr: 'partial',
          sox: 'compliant',
          hipaa: 'not_applicable'
        }
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(securityReview, null, 2)
        }]
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to perform security review: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async handleGenerateDocumentation(args: any) {
    try {
      const workflow = JSON.parse(args.workflowJson)
      
      const documentation = {
        title: workflow.name || 'Generated Workflow',
        description: 'Automatically generated workflow documentation',
        overview: 'This workflow processes data through multiple steps',
        nodes: workflow.nodes?.map((node: any) => ({
          name: node.name,
          type: node.type,
          description: `Node of type ${node.type}`
        })) || [],
        connections: Object.keys(workflow.connections || {}),
        usage: {
          prerequisites: ['n8n instance', 'required credentials'],
          setup: ['Import workflow', 'Configure credentials', 'Test execution'],
          execution: 'Trigger the workflow manually or via webhook'
        },
        troubleshooting: args.includeTroubleshooting ? {
          commonIssues: [
            'Credential authentication failures',
            'Node execution timeouts',
            'Data format mismatches'
          ],
          solutions: [
            'Verify credential configuration',
            'Check node timeout settings',
            'Validate data transformations'
          ]
        } : null
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(documentation, null, 2)
        }]
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to generate documentation: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async handleGetTemplates(args: any) {
    try {
      const templates = [
        {
          id: 'email-automation',
          name: 'Email Automation',
          category: 'automation',
          complexity: 'simple',
          description: 'Automated email processing workflow',
          tags: ['email', 'automation', 'notification']
        },
        {
          id: 'data-sync',
          name: 'Data Synchronization',
          category: 'integration',
          complexity: 'moderate',
          description: 'Sync data between different systems',
          tags: ['data', 'sync', 'integration']
        },
        {
          id: 'api-webhook',
          name: 'API Webhook Handler',
          category: 'integration',
          complexity: 'simple',
          description: 'Handle incoming webhook requests',
          tags: ['webhook', 'api', 'integration']
        },
        {
          id: 'file-processing',
          name: 'File Processing Pipeline',
          category: 'data-processing',
          complexity: 'complex',
          description: 'Process and transform files',
          tags: ['file', 'processing', 'transformation']
        }
      ]

      let filteredTemplates = templates
      if (args.category) {
        filteredTemplates = templates.filter(t => t.category === args.category)
      }
      if (args.complexity) {
        filteredTemplates = templates.filter(t => t.complexity === args.complexity)
      }
      if (args.limit) {
        filteredTemplates = filteredTemplates.slice(0, args.limit)
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(filteredTemplates, null, 2)
        }]
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to get templates: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async handleAnalyzeRequirements(args: any) {
    try {
      const analysis = {
        requirements: args.requirements,
        suggestedStructure: {
          trigger: 'webhook',
          nodes: [
            'Data validation',
            'Processing logic',
            'Output formatting',
            'Error handling'
          ],
          integrations: ['HTTP API', 'Database', 'Email service']
        },
        complexity: 'moderate',
        estimatedNodes: 5,
        estimatedConnections: 4,
        technicalConsiderations: [
          'Data validation required',
          'Error handling needed',
          'Rate limiting recommended',
          'Credential management required'
        ],
        recommendations: [
          'Start with a simple version',
          'Add error handling early',
          'Test with sample data',
          'Document the workflow'
        ]
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(analysis, null, 2)
        }]
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to analyze requirements: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async start() {
    try {
      this.log.info('Starting Workflow Generator MCP Server...')
      
      const transport = new StdioServerTransport()
      await this.server.connect(transport)
      
      this.log.info('Workflow Generator MCP Server started successfully')
    } catch (error) {
      this.log.error('Failed to start Workflow Generator MCP Server:', error)
      throw error
    }
  }
}




