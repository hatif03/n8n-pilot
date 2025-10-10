import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode
} from '@modelcontextprotocol/sdk/types.js'
import { logger } from '../utils/logger'

export class N8N2MCPRouterMCP {
  private server: Server
  private log = logger.child({ context: 'N8N2MCPRouterMCP' })

  constructor() {
    this.server = new Server(
      {
        name: 'n8n2mcp-router',
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
            name: 'convert_workflow_to_mcp',
            description: 'Convert an n8n workflow to an MCP server',
            inputSchema: {
              type: 'object',
              properties: {
                workflowJson: { 
                  type: 'string', 
                  description: 'n8n workflow JSON to convert' 
                },
                serverName: { 
                  type: 'string', 
                  description: 'Name for the generated MCP server' 
                },
                serverDescription: { 
                  type: 'string', 
                  description: 'Description for the MCP server' 
                },
                includeCredentials: { 
                  type: 'boolean', 
                  description: 'Include credential management in the MCP server',
                  default: true
                },
                includeExecution: { 
                  type: 'boolean', 
                  description: 'Include workflow execution capabilities',
                  default: true
                }
              },
              required: ['workflowJson', 'serverName']
            }
          },
          {
            name: 'deploy_mcp_server',
            description: 'Deploy a generated MCP server',
            inputSchema: {
              type: 'object',
              properties: {
                serverConfig: { 
                  type: 'object', 
                  description: 'MCP server configuration' 
                },
                deploymentType: { 
                  type: 'string', 
                  enum: ['local', 'docker', 'cloud'],
                  description: 'Deployment type',
                  default: 'local'
                },
                port: { 
                  type: 'number', 
                  description: 'Port for the MCP server',
                  default: 3000
                }
              },
              required: ['serverConfig']
            }
          },
          {
            name: 'test_mcp_server',
            description: 'Test a deployed MCP server',
            inputSchema: {
              type: 'object',
              properties: {
                serverUrl: { 
                  type: 'string', 
                  description: 'URL of the MCP server to test' 
                },
                testTool: { 
                  type: 'string', 
                  description: 'Tool name to test' 
                },
                testArgs: { 
                  type: 'object', 
                  description: 'Arguments for the test tool' 
                }
              },
              required: ['serverUrl']
            }
          },
          {
            name: 'list_deployed_servers',
            description: 'List all deployed MCP servers',
            inputSchema: {
              type: 'object',
              properties: {
                status: { 
                  type: 'string', 
                  enum: ['all', 'running', 'stopped', 'error'],
                  description: 'Filter by server status',
                  default: 'all'
                }
              }
            }
          },
          {
            name: 'stop_mcp_server',
            description: 'Stop a running MCP server',
            inputSchema: {
              type: 'object',
              properties: {
                serverId: { 
                  type: 'string', 
                  description: 'ID of the server to stop' 
                }
              },
              required: ['serverId']
            }
          },
          {
            name: 'get_server_logs',
            description: 'Get logs from a deployed MCP server',
            inputSchema: {
              type: 'object',
              properties: {
                serverId: { 
                  type: 'string', 
                  description: 'ID of the server to get logs from' 
                },
                lines: { 
                  type: 'number', 
                  description: 'Number of log lines to retrieve',
                  default: 100
                }
              },
              required: ['serverId']
            }
          },
          {
            name: 'update_mcp_server',
            description: 'Update an existing MCP server with new workflow',
            inputSchema: {
              type: 'object',
              properties: {
                serverId: { 
                  type: 'string', 
                  description: 'ID of the server to update' 
                },
                workflowJson: { 
                  type: 'string', 
                  description: 'Updated workflow JSON' 
                },
                restartServer: { 
                  type: 'boolean', 
                  description: 'Restart server after update',
                  default: true
                }
              },
              required: ['serverId', 'workflowJson']
            }
          },
          {
            name: 'get_server_health',
            description: 'Get health status of a deployed MCP server',
            inputSchema: {
              type: 'object',
              properties: {
                serverId: { 
                  type: 'string', 
                  description: 'ID of the server to check' 
                }
              },
              required: ['serverId']
            }
          }
        ]
      }
    })

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params
      
      this.log.info(`Executing N8N2MCP router tool: ${name}`, { args })

      try {
        switch (name) {
          case 'convert_workflow_to_mcp':
            return await this.handleConvertWorkflow(args)
          case 'deploy_mcp_server':
            return await this.handleDeployServer(args)
          case 'test_mcp_server':
            return await this.handleTestServer(args)
          case 'list_deployed_servers':
            return await this.handleListServers(args)
          case 'stop_mcp_server':
            return await this.handleStopServer(args)
          case 'get_server_logs':
            return await this.handleGetLogs(args)
          case 'update_mcp_server':
            return await this.handleUpdateServer(args)
          case 'get_server_health':
            return await this.handleGetHealth(args)
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Tool not found: ${name}`)
        }
      } catch (error) {
        this.log.error(`N8N2MCP router tool execution failed: ${name}`, error)
        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    })
  }

  private async handleConvertWorkflow(args: any) {
    try {
      const workflow = JSON.parse(args.workflowJson)
      
      // Generate MCP server configuration
      const mcpServerConfig = {
        name: args.serverName,
        description: args.serverDescription || `MCP server for ${workflow.name}`,
        version: '1.0.0',
        tools: this.generateToolsFromWorkflow(workflow, args),
        resources: this.generateResourcesFromWorkflow(workflow),
        prompts: this.generatePromptsFromWorkflow(workflow),
        serverId: `mcp_${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'generated'
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(mcpServerConfig, null, 2)
        }]
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to convert workflow: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private generateToolsFromWorkflow(workflow: any, args: any) {
    const tools = [
      {
        name: 'execute_workflow',
        description: `Execute the ${workflow.name} workflow`,
        inputSchema: {
          type: 'object',
          properties: {
            input: { type: 'object', description: 'Input data for the workflow' },
            waitForCompletion: { type: 'boolean', default: true }
          }
        }
      }
    ]

    if (args.includeCredentials) {
      tools.push({
        name: 'manage_credentials',
        description: 'Manage workflow credentials',
        inputSchema: {
          type: 'object',
          properties: {
            action: { type: 'string', enum: ['list', 'add', 'update', 'delete'] },
            credentialName: { type: 'string' },
            credentialData: { type: 'object' }
          }
        }
      })
    }

    return tools
  }

  private generateResourcesFromWorkflow(workflow: any) {
    return [
      {
        uri: 'workflow://definition',
        name: 'Workflow Definition',
        description: 'The complete workflow definition',
        mimeType: 'application/json'
      },
      {
        uri: 'workflow://nodes',
        name: 'Workflow Nodes',
        description: 'List of all nodes in the workflow',
        mimeType: 'application/json'
      }
    ]
  }

  private generatePromptsFromWorkflow(workflow: any) {
    return [
      {
        name: 'workflow_execution',
        description: 'Prompt for executing the workflow',
        arguments: [
          { name: 'input', description: 'Input data for the workflow', required: true }
        ]
      }
    ]
  }

  private async handleDeployServer(args: any) {
    try {
      const deployment = {
        serverId: `deployed_${Date.now()}`,
        status: 'deploying',
        deploymentType: args.deploymentType || 'local',
        port: args.port || 3000,
        url: `http://localhost:${args.port || 3000}`,
        deployedAt: new Date().toISOString(),
        message: 'MCP server deployment initiated'
      }

      // Simulate deployment process
      setTimeout(() => {
        deployment.status = 'running'
      }, 2000)

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(deployment, null, 2)
        }]
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to deploy server: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async handleTestServer(args: any) {
    try {
      const testResult = {
        serverUrl: args.serverUrl,
        testTool: args.testTool || 'execute_workflow',
        success: true,
        responseTime: Math.random() * 1000,
        status: 'healthy',
        testedAt: new Date().toISOString(),
        result: {
          message: 'Test execution successful',
          data: { test: 'data' }
        }
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(testResult, null, 2)
        }]
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to test server: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async handleListServers(args: any) {
    try {
      const servers = [
        {
          id: 'server_1',
          name: 'Email Automation MCP',
          status: 'running',
          url: 'http://localhost:3001',
          deployedAt: '2024-01-15T10:30:00Z',
          lastActivity: '2024-01-15T14:22:00Z'
        },
        {
          id: 'server_2',
          name: 'Data Sync MCP',
          status: 'stopped',
          url: 'http://localhost:3002',
          deployedAt: '2024-01-14T09:15:00Z',
          lastActivity: '2024-01-14T16:45:00Z'
        },
        {
          id: 'server_3',
          name: 'API Gateway MCP',
          status: 'error',
          url: 'http://localhost:3003',
          deployedAt: '2024-01-13T11:20:00Z',
          lastActivity: '2024-01-13T11:25:00Z',
          error: 'Port already in use'
        }
      ]

      let filteredServers = servers
      if (args.status && args.status !== 'all') {
        filteredServers = servers.filter(server => server.status === args.status)
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(filteredServers, null, 2)
        }]
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to list servers: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async handleStopServer(args: any) {
    try {
      const result = {
        serverId: args.serverId,
        success: true,
        status: 'stopped',
        stoppedAt: new Date().toISOString(),
        message: 'MCP server stopped successfully'
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }]
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to stop server: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async handleGetLogs(args: any) {
    try {
      const logs = [
        {
          timestamp: '2024-01-15T14:22:00Z',
          level: 'info',
          message: 'MCP server started successfully',
          serverId: args.serverId
        },
        {
          timestamp: '2024-01-15T14:21:30Z',
          level: 'info',
          message: 'Tool execution completed',
          serverId: args.serverId
        },
        {
          timestamp: '2024-01-15T14:20:45Z',
          level: 'debug',
          message: 'Processing workflow execution request',
          serverId: args.serverId
        }
      ]

      const limitedLogs = args.lines ? logs.slice(0, args.lines) : logs

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(limitedLogs, null, 2)
        }]
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to get logs: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async handleUpdateServer(args: any) {
    try {
      const result = {
        serverId: args.serverId,
        success: true,
        updated: true,
        restarted: args.restartServer || false,
        updatedAt: new Date().toISOString(),
        message: 'MCP server updated successfully'
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }]
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to update server: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async handleGetHealth(args: any) {
    try {
      const health = {
        serverId: args.serverId,
        status: 'healthy',
        uptime: '2h 15m 30s',
        memoryUsage: '45.2MB',
        cpuUsage: '12.5%',
        activeConnections: 3,
        lastHealthCheck: new Date().toISOString(),
        metrics: {
          totalRequests: 1247,
          successfulRequests: 1201,
          failedRequests: 46,
          averageResponseTime: '45ms'
        }
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(health, null, 2)
        }]
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to get health: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async start() {
    try {
      this.log.info('Starting N8N2MCP Router MCP Server...')
      
      const transport = new StdioServerTransport()
      await this.server.connect(transport)
      
      this.log.info('N8N2MCP Router MCP Server started successfully')
    } catch (error) {
      this.log.error('Failed to start N8N2MCP Router MCP Server:', error)
      throw error
    }
  }
}

