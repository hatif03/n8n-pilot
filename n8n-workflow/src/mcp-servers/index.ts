import { WorkflowBuilderMCP } from './workflowBuilderMCP'
import { Agent2AgentMCP } from './agent2agentMCP'
import { WorkflowGeneratorMCP } from './workflowGeneratorMCP'
import { VectorSearchMCP } from './vectorSearchMCP'
import { N8N2MCPRouterMCP } from './n8n2mcpRouterMCP'
import { logger } from '../utils/logger'

export class MCPManager {
  private servers: Map<string, any> = new Map()
  private log = logger.child({ context: 'MCPManager' })

  constructor() {
    this.initializeServers()
  }

  private initializeServers() {
    // Initialize all MCP servers
    this.servers.set('workflow-builder', new WorkflowBuilderMCP())
    this.servers.set('agent2agent', new Agent2AgentMCP())
    this.servers.set('workflow-generator', new WorkflowGeneratorMCP())
    this.servers.set('vector-search', new VectorSearchMCP())
    this.servers.set('n8n2mcp-router', new N8N2MCPRouterMCP())

    this.log.info(`Initialized ${this.servers.size} MCP servers`)
  }

  async startAll() {
    this.log.info('Starting all MCP servers...')
    
    const startPromises = Array.from(this.servers.entries()).map(async ([name, server]) => {
      try {
        await server.start()
        this.log.info(`MCP server '${name}' started successfully`)
      } catch (error) {
        this.log.error(`Failed to start MCP server '${name}':`, error)
        throw error
      }
    })

    await Promise.all(startPromises)
    this.log.info('All MCP servers started successfully')
  }

  async startServer(name: string) {
    const server = this.servers.get(name)
    if (!server) {
      throw new Error(`MCP server '${name}' not found`)
    }

    await server.start()
    this.log.info(`MCP server '${name}' started successfully`)
  }

  getServer(name: string) {
    return this.servers.get(name)
  }

  listServers() {
    return Array.from(this.servers.keys())
  }

  getServerInfo() {
    return Array.from(this.servers.entries()).map(([name, server]) => ({
      name,
      type: server.constructor.name,
      status: 'initialized'
    }))
  }
}

// Export individual MCP servers for direct use
export {
  WorkflowBuilderMCP,
  Agent2AgentMCP,
  WorkflowGeneratorMCP,
  VectorSearchMCP,
  N8N2MCPRouterMCP
}

// Export the manager as default
export default MCPManager

