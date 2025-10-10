import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode
} from '@modelcontextprotocol/sdk/types.js'
import { logger } from '../utils/logger'

export class Agent2AgentMCP {
  private server: Server
  private log = logger.child({ context: 'Agent2AgentMCP' })

  constructor() {
    this.server = new Server(
      {
        name: 'n8n-agent2agent',
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
            name: 'discover_agent',
            description: 'Discover and parse an agent\'s public Agent Card',
            inputSchema: {
              type: 'object',
              properties: {
                agentUrl: { 
                  type: 'string', 
                  description: 'URL of the agent to discover (e.g., https://agent.example.com)' 
                }
              },
              required: ['agentUrl']
            }
          },
          {
            name: 'send_task',
            description: 'Send a task to an A2A agent',
            inputSchema: {
              type: 'object',
              properties: {
                agentUrl: { type: 'string', description: 'Target agent URL' },
                message: { type: 'string', description: 'Message to send' },
                taskId: { type: 'string', description: 'Optional existing task ID for follow-up' },
                messageParts: {
                  type: 'array',
                  description: 'Message parts (text, file, data)',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string', enum: ['text', 'file', 'data'] },
                      content: { type: 'string' },
                      mimeType: { type: 'string' },
                      data: { type: 'object' }
                    }
                  }
                },
                waitForCompletion: { type: 'boolean', description: 'Wait for task completion' },
                credentials: { type: 'object', description: 'Authentication credentials' }
              },
              required: ['agentUrl', 'message']
            }
          },
          {
            name: 'get_task',
            description: 'Get the status and details of a specific task',
            inputSchema: {
              type: 'object',
              properties: {
                agentUrl: { type: 'string', description: 'Target agent URL' },
                taskId: { type: 'string', description: 'Task ID to retrieve' },
                credentials: { type: 'object', description: 'Authentication credentials' }
              },
              required: ['agentUrl', 'taskId']
            }
          },
          {
            name: 'cancel_task',
            description: 'Cancel an ongoing task',
            inputSchema: {
              type: 'object',
              properties: {
                agentUrl: { type: 'string', description: 'Target agent URL' },
                taskId: { type: 'string', description: 'Task ID to cancel' },
                credentials: { type: 'object', description: 'Authentication credentials' }
              },
              required: ['agentUrl', 'taskId']
            }
          },
          {
            name: 'list_agents',
            description: 'List available A2A agents in the network',
            inputSchema: {
              type: 'object',
              properties: {
                networkUrl: { type: 'string', description: 'Network discovery URL' },
                category: { type: 'string', description: 'Filter by agent category' },
                capabilities: { type: 'array', description: 'Filter by required capabilities' }
              }
            }
          },
          {
            name: 'test_agent_connection',
            description: 'Test connection to an A2A agent',
            inputSchema: {
              type: 'object',
              properties: {
                agentUrl: { type: 'string', description: 'Agent URL to test' },
                credentials: { type: 'object', description: 'Authentication credentials' }
              },
              required: ['agentUrl']
            }
          }
        ]
      }
    })

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params
      
      this.log.info(`Executing A2A tool: ${name}`, { args })

      try {
        switch (name) {
          case 'discover_agent':
            return await this.handleDiscoverAgent(args)
          case 'send_task':
            return await this.handleSendTask(args)
          case 'get_task':
            return await this.handleGetTask(args)
          case 'cancel_task':
            return await this.handleCancelTask(args)
          case 'list_agents':
            return await this.handleListAgents(args)
          case 'test_agent_connection':
            return await this.handleTestConnection(args)
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Tool not found: ${name}`)
        }
      } catch (error) {
        this.log.error(`A2A tool execution failed: ${name}`, error)
        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    })
  }

  private async handleDiscoverAgent(args: any) {
    try {
      // In a real implementation, this would fetch the agent card from /.well-known/agent.json
      const agentCard = {
        name: 'Sample Agent',
        description: 'A sample A2A agent',
        version: '1.0.0',
        endpoint: args.agentUrl,
        capabilities: ['text', 'file', 'data'],
        authentication: {
          type: 'api_key',
          header: 'Authorization',
          format: 'Bearer {token}'
        },
        streaming: true,
        maxFileSize: '10MB',
        supportedMimeTypes: ['text/plain', 'application/json', 'image/png']
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(agentCard, null, 2)
        }]
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to discover agent: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async handleSendTask(args: any) {
    try {
      // In a real implementation, this would send a task to the A2A agent
      const task = {
        id: `task_${Date.now()}`,
        status: 'submitted',
        agentUrl: args.agentUrl,
        message: args.message,
        messageParts: args.messageParts || [],
        createdAt: new Date().toISOString(),
        result: null
      }

      if (args.waitForCompletion) {
        // Simulate waiting for completion
        task.status = 'completed'
        task.result = {
          type: 'text',
          content: `Task completed: ${args.message}`,
          artifacts: []
        }
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(task, null, 2)
        }]
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to send task: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async handleGetTask(args: any) {
    try {
      // In a real implementation, this would retrieve task status from the agent
      const task = {
        id: args.taskId,
        status: 'completed',
        agentUrl: args.agentUrl,
        message: 'Sample task message',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        result: {
          type: 'text',
          content: 'Task completed successfully',
          artifacts: [
            {
              type: 'text',
              content: 'Generated response',
              mimeType: 'text/plain'
            }
          ]
        }
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(task, null, 2)
        }]
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to get task: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async handleCancelTask(args: any) {
    try {
      // In a real implementation, this would cancel the task on the agent
      const result = {
        success: true,
        taskId: args.taskId,
        status: 'cancelled',
        message: 'Task cancelled successfully',
        cancelledAt: new Date().toISOString()
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }]
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to cancel task: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async handleListAgents(args: any) {
    try {
      // In a real implementation, this would discover agents from a network registry
      const agents = [
        {
          name: 'Data Processing Agent',
          description: 'Processes and analyzes data',
          url: 'https://data-agent.example.com',
          category: 'data',
          capabilities: ['text', 'data'],
          status: 'online'
        },
        {
          name: 'Image Processing Agent',
          description: 'Processes and manipulates images',
          url: 'https://image-agent.example.com',
          category: 'media',
          capabilities: ['file', 'data'],
          status: 'online'
        },
        {
          name: 'Text Analysis Agent',
          description: 'Analyzes and processes text content',
          url: 'https://text-agent.example.com',
          category: 'nlp',
          capabilities: ['text'],
          status: 'online'
        }
      ]

      let filteredAgents = agents
      if (args.category) {
        filteredAgents = agents.filter(agent => agent.category === args.category)
      }
      if (args.capabilities) {
        filteredAgents = agents.filter(agent => 
          args.capabilities.every((cap: string) => agent.capabilities.includes(cap))
        )
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(filteredAgents, null, 2)
        }]
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to list agents: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async handleTestConnection(args: any) {
    try {
      // In a real implementation, this would test the connection to the agent
      const testResult = {
        success: true,
        agentUrl: args.agentUrl,
        responseTime: Math.random() * 1000, // Mock response time
        status: 'online',
        capabilities: ['text', 'file', 'data'],
        testedAt: new Date().toISOString()
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(testResult, null, 2)
        }]
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to test connection: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async start() {
    try {
      this.log.info('Starting Agent2Agent MCP Server...')
      
      const transport = new StdioServerTransport()
      await this.server.connect(transport)
      
      this.log.info('Agent2Agent MCP Server started successfully')
    } catch (error) {
      this.log.error('Failed to start Agent2Agent MCP Server:', error)
      throw error
    }
  }
}

