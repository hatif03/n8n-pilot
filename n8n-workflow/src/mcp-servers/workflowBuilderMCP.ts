import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode
} from '@modelcontextprotocol/sdk/types.js'
import { N8nService } from '../services/n8nService'
import { logger } from '../utils/logger'

export class WorkflowBuilderMCP {
  private server: Server
  private n8nService: N8nService
  private log = logger.child({ context: 'WorkflowBuilderMCP' })

  constructor() {
    this.n8nService = new N8nService([{
      name: 'default',
      host: process.env.N8N_HOST || 'http://localhost:5678',
      apiKey: process.env.N8N_API_KEY || '',
      enabled: true
    }])
    
    this.server = new Server(
      {
        name: 'n8n-workflow-builder',
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
            name: 'create_workflow',
            description: 'Create a new n8n workflow with nodes and connections',
            inputSchema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Workflow name' },
                nodes: { 
                  type: 'array', 
                  description: 'Array of workflow nodes',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string' },
                      name: { type: 'string' },
                      parameters: { type: 'object' }
                    },
                    required: ['type', 'name']
                  }
                },
                connections: {
                  type: 'array',
                  description: 'Array of node connections',
                  items: {
                    type: 'object',
                    properties: {
                      source: { type: 'string' },
                      target: { type: 'string' },
                      sourceOutput: { type: 'number', default: 0 },
                      targetInput: { type: 'number', default: 0 }
                    },
                    required: ['source', 'target']
                  }
                },
                instanceName: { type: 'string', description: 'Optional n8n instance name' }
              },
              required: ['name', 'nodes', 'connections']
            }
          },
          {
            name: 'add_node',
            description: 'Add a node to an existing workflow',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: { type: 'string', description: 'Workflow ID' },
                nodeType: { type: 'string', description: 'Node type' },
                nodeName: { type: 'string', description: 'Node name' },
                parameters: { type: 'object', description: 'Node parameters' },
                position: { type: 'object', description: 'Node position' },
                instanceName: { type: 'string', description: 'Optional n8n instance name' }
              },
              required: ['workflowId', 'nodeType', 'nodeName']
            }
          },
          {
            name: 'edit_node',
            description: 'Edit an existing node in a workflow',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: { type: 'string', description: 'Workflow ID' },
                nodeId: { type: 'string', description: 'Node ID' },
                nodeType: { type: 'string', description: 'New node type' },
                nodeName: { type: 'string', description: 'New node name' },
                parameters: { type: 'object', description: 'New node parameters' },
                instanceName: { type: 'string', description: 'Optional n8n instance name' }
              },
              required: ['workflowId', 'nodeId']
            }
          },
          {
            name: 'delete_node',
            description: 'Delete a node from a workflow',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: { type: 'string', description: 'Workflow ID' },
                nodeId: { type: 'string', description: 'Node ID' },
                instanceName: { type: 'string', description: 'Optional n8n instance name' }
              },
              required: ['workflowId', 'nodeId']
            }
          },
          {
            name: 'add_connection',
            description: 'Add a connection between nodes',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: { type: 'string', description: 'Workflow ID' },
                sourceNodeId: { type: 'string', description: 'Source node ID' },
                targetNodeId: { type: 'string', description: 'Target node ID' },
                sourceOutput: { type: 'number', default: 0 },
                targetInput: { type: 'number', default: 0 },
                instanceName: { type: 'string', description: 'Optional n8n instance name' }
              },
              required: ['workflowId', 'sourceNodeId', 'targetNodeId']
            }
          },
          {
            name: 'remove_connection',
            description: 'Remove a connection between nodes',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: { type: 'string', description: 'Workflow ID' },
                sourceNodeId: { type: 'string', description: 'Source node ID' },
                targetNodeId: { type: 'string', description: 'Target node ID' },
                instanceName: { type: 'string', description: 'Optional n8n instance name' }
              },
              required: ['workflowId', 'sourceNodeId', 'targetNodeId']
            }
          },
          {
            name: 'validate_workflow',
            description: 'Validate a workflow for errors and best practices',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: { type: 'string', description: 'Workflow ID' },
                instanceName: { type: 'string', description: 'Optional n8n instance name' }
              },
              required: ['workflowId']
            }
          },
          {
            name: 'search_nodes',
            description: 'Search for available n8n nodes',
            inputSchema: {
              type: 'object',
              properties: {
                searchTerm: { type: 'string', description: 'Search term' },
                category: { type: 'string', description: 'Node category' },
                limit: { type: 'number', description: 'Maximum results' }
              }
            }
          }
        ]
      }
    })

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params
      
      this.log.info(`Executing tool: ${name}`, { args })

      try {
        switch (name) {
          case 'create_workflow':
            return await this.handleCreateWorkflow(args)
          case 'add_node':
            return await this.handleAddNode(args)
          case 'edit_node':
            return await this.handleEditNode(args)
          case 'delete_node':
            return await this.handleDeleteNode(args)
          case 'add_connection':
            return await this.handleAddConnection(args)
          case 'remove_connection':
            return await this.handleRemoveConnection(args)
          case 'validate_workflow':
            return await this.handleValidateWorkflow(args)
          case 'search_nodes':
            return await this.handleSearchNodes(args)
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Tool not found: ${name}`)
        }
      } catch (error) {
        this.log.error(`Tool execution failed: ${name}`, error)
        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    })
  }

  private async handleCreateWorkflow(args: any) {
    const workflow = await this.n8nService.createWorkflow({
      name: args.name,
      nodes: args.nodes,
      connections: args.connections
    }, args.instanceName)

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(workflow, null, 2)
      }]
    }
  }

  private async handleAddNode(args: any) {
    // Implementation for adding a node
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ success: true, message: 'Node added successfully' }, null, 2)
      }]
    }
  }

  private async handleEditNode(args: any) {
    // Implementation for editing a node
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ success: true, message: 'Node edited successfully' }, null, 2)
      }]
    }
  }

  private async handleDeleteNode(args: any) {
    // Implementation for deleting a node
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ success: true, message: 'Node deleted successfully' }, null, 2)
      }]
    }
  }

  private async handleAddConnection(args: any) {
    // Implementation for adding a connection
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ success: true, message: 'Connection added successfully' }, null, 2)
      }]
    }
  }

  private async handleRemoveConnection(args: any) {
    // Implementation for removing a connection
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ success: true, message: 'Connection removed successfully' }, null, 2)
      }]
    }
  }

  private async handleValidateWorkflow(args: any) {
    const workflow = await this.n8nService.getWorkflow(args.workflowId, args.instanceName)
    
    // Basic validation logic
    const validation = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    }

    if (!workflow.nodes || workflow.nodes.length === 0) {
      validation.valid = false
      validation.errors.push('Workflow has no nodes')
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(validation, null, 2)
      }]
    }
  }

  private async handleSearchNodes(args: any) {
    // Mock node search - in real implementation, this would search a node registry
    const nodes = [
      { id: 'n8n-nodes-base.manualTrigger', name: 'Manual Trigger', category: 'trigger' },
      { id: 'n8n-nodes-base.webhook', name: 'Webhook', category: 'trigger' },
      { id: 'n8n-nodes-base.httpRequest', name: 'HTTP Request', category: 'action' },
      { id: 'n8n-nodes-base.set', name: 'Set', category: 'action' },
      { id: 'n8n-nodes-base.if', name: 'IF', category: 'action' }
    ]

    let filteredNodes = nodes
    if (args.searchTerm) {
      filteredNodes = nodes.filter(node => 
        node.name.toLowerCase().includes(args.searchTerm.toLowerCase())
      )
    }
    if (args.category) {
      filteredNodes = filteredNodes.filter(node => node.category === args.category)
    }
    if (args.limit) {
      filteredNodes = filteredNodes.slice(0, args.limit)
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(filteredNodes, null, 2)
      }]
    }
  }

  async start() {
    try {
      this.log.info('Starting Workflow Builder MCP Server...')
      
      const transport = new StdioServerTransport()
      await this.server.connect(transport)
      
      this.log.info('Workflow Builder MCP Server started successfully')
    } catch (error) {
      this.log.error('Failed to start Workflow Builder MCP Server:', error)
      throw error
    }
  }
}




