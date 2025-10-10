import { FunctionTool, ToolContext } from '@iqai/adk';
import { z } from 'zod';
import { MCPManager } from '../mcp-servers';
import { logger } from '../utils/logger';

/**
 * ADK-TS Compliant MCP Tools
 * 
 * These tools provide MCP server integration capabilities with full ADK-TS context integration,
 * allowing agents to interact with MCP servers through the ADK-TS framework.
 */
export class MCPTools {
  private log = logger.child({ context: 'MCPTools' });
  private mcpManager: MCPManager;

  constructor() {
    this.mcpManager = new MCPManager();
  }

  // Call MCP server tool with ADK-TS context integration
  createMCPCallTool(): FunctionTool {
    return new FunctionTool(async (params: {
      serverName: string;
      toolName: string;
      args: Record<string, any>;
    }, toolContext: ToolContext) => {
      try {
        this.log.info(`Calling MCP tool: ${params.serverName}.${params.toolName}`);
        
        // Get the MCP server
        const server = this.mcpManager.getServer(params.serverName);
        if (!server) {
          return {
            success: false,
            error: `MCP server '${params.serverName}' not found`,
            availableServers: this.mcpManager.listServers()
          };
        }
        
        // Save MCP call as artifact
        await toolContext.saveArtifact(`mcp/calls/${params.serverName}_${params.toolName}_${Date.now()}.json`, {
          inlineData: {
            data: Buffer.from(JSON.stringify({
              serverName: params.serverName,
              toolName: params.toolName,
              args: params.args,
              calledAt: new Date().toISOString()
            }, null, 2)).toString('base64'),
            mimeType: 'application/json'
          }
        });
        
        // Call the MCP tool (simulated - in real implementation, this would call the actual MCP server)
        const result = await this.simulateMCPCall(params.serverName, params.toolName, params.args);
        
        // Update state
        toolContext.state.set(`mcp:${params.serverName}:lastCall`, params.toolName);
        toolContext.state.set(`mcp:${params.serverName}:lastCallTime`, new Date().toISOString());
        
        // Search memory for related MCP calls
        const memoryContext = await toolContext.searchMemory(`mcp:${params.serverName}:${params.toolName}`);
        
        return {
          success: true,
          result,
          message: `MCP tool '${params.toolName}' called successfully on server '${params.serverName}'`,
          context: {
            serverName: params.serverName,
            toolName: params.toolName,
            calledAt: new Date().toISOString(),
            memoryContext: memoryContext.memories?.map(m => m.content) || []
          }
        };
      } catch (error) {
        this.log.error('Failed to call MCP tool:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }, {
      name: 'mcp_call',
      description: 'Call a tool on an MCP server with ADK-TS context integration',
      parameters: z.object({
        serverName: z.string().min(1, 'Server name is required'),
        toolName: z.string().min(1, 'Tool name is required'),
        args: z.record(z.any(), 'Arguments are required')
      })
    });
  }

  // List MCP servers tool with ADK-TS context integration
  createListMCPServersTool(): FunctionTool {
    return new FunctionTool(async (params: {
      includeStatus?: boolean;
    }, toolContext: ToolContext) => {
      try {
        this.log.info('Listing MCP servers');
        
        const servers = this.mcpManager.getServerInfo();
        
        // Save server list as artifact
        await toolContext.saveArtifact(`mcp/servers_list_${Date.now()}.json`, {
          inlineData: {
            data: Buffer.from(JSON.stringify({
              servers,
              listedAt: new Date().toISOString(),
              includeStatus: params.includeStatus
            }, null, 2)).toString('base64'),
            mimeType: 'application/json'
          }
        });
        
        // Update state
        toolContext.state.set('lastMCPServersListed', servers.length);
        toolContext.state.set('lastMCPServersListTime', new Date().toISOString());
        
        return {
          success: true,
          servers,
          message: `Found ${servers.length} MCP servers`,
          context: {
            listedAt: new Date().toISOString(),
            totalServers: servers.length
          }
        };
      } catch (error) {
        this.log.error('Failed to list MCP servers:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }, {
      name: 'list_mcp_servers',
      description: 'List all available MCP servers with ADK-TS context integration',
      parameters: z.object({
        includeStatus: z.boolean().optional().default(true)
      })
    });
  }

  // Get MCP server info tool with ADK-TS context integration
  createGetMCPServerInfoTool(): FunctionTool {
    return new FunctionTool(async (params: {
      serverName: string;
    }, toolContext: ToolContext) => {
      try {
        this.log.info(`Getting MCP server info: ${params.serverName}`);
        
        const server = this.mcpManager.getServer(params.serverName);
        if (!server) {
          return {
            success: false,
            error: `MCP server '${params.serverName}' not found`,
            availableServers: this.mcpManager.listServers()
          };
        }
        
        // Get server info
        const serverInfo = {
          name: params.serverName,
          type: server.constructor.name,
          status: 'initialized',
          capabilities: this.getServerCapabilities(params.serverName)
        };
        
        // Save server info as artifact
        await toolContext.saveArtifact(`mcp/server_info_${params.serverName}_${Date.now()}.json`, {
          inlineData: {
            data: Buffer.from(JSON.stringify({
              serverInfo,
              retrievedAt: new Date().toISOString()
            }, null, 2)).toString('base64'),
            mimeType: 'application/json'
          }
        });
        
        // Update state
        toolContext.state.set(`mcp:${params.serverName}:lastInfoRetrieved`, new Date().toISOString());
        
        return {
          success: true,
          serverInfo,
          message: `MCP server '${params.serverName}' info retrieved successfully`,
          context: {
            retrievedAt: new Date().toISOString()
          }
        };
      } catch (error) {
        this.log.error('Failed to get MCP server info:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }, {
      name: 'get_mcp_server_info',
      description: 'Get detailed information about a specific MCP server with ADK-TS context integration',
      parameters: z.object({
        serverName: z.string().min(1, 'Server name is required')
      })
    });
  }

  // Start MCP server tool with ADK-TS context integration
  createStartMCPServerTool(): FunctionTool {
    return new FunctionTool(async (params: {
      serverName: string;
    }, toolContext: ToolContext) => {
      try {
        this.log.info(`Starting MCP server: ${params.serverName}`);
        
        // Start the server
        await this.mcpManager.startServer(params.serverName);
        
        // Save start log as artifact
        await toolContext.saveArtifact(`mcp/server_start_${params.serverName}_${Date.now()}.json`, {
          inlineData: {
            data: Buffer.from(JSON.stringify({
              serverName: params.serverName,
              startedAt: new Date().toISOString(),
              status: 'started'
            }, null, 2)).toString('base64'),
            mimeType: 'application/json'
          }
        });
        
        // Update state
        toolContext.state.set(`mcp:${params.serverName}:status`, 'started');
        toolContext.state.set(`mcp:${params.serverName}:startedAt`, new Date().toISOString());
        
        return {
          success: true,
          message: `MCP server '${params.serverName}' started successfully`,
          context: {
            serverName: params.serverName,
            startedAt: new Date().toISOString()
          }
        };
      } catch (error) {
        this.log.error('Failed to start MCP server:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }, {
      name: 'start_mcp_server',
      description: 'Start a specific MCP server with ADK-TS context integration',
      parameters: z.object({
        serverName: z.string().min(1, 'Server name is required')
      })
    });
  }

  // Start all MCP servers tool with ADK-TS context integration
  createStartAllMCPServersTool(): FunctionTool {
    return new FunctionTool(async (params: {}, toolContext: ToolContext) => {
      try {
        this.log.info('Starting all MCP servers');
        
        // Start all servers
        await this.mcpManager.startAll();
        
        // Get server info
        const servers = this.mcpManager.getServerInfo();
        
        // Save start log as artifact
        await toolContext.saveArtifact(`mcp/all_servers_start_${Date.now()}.json`, {
          inlineData: {
            data: Buffer.from(JSON.stringify({
              servers,
              startedAt: new Date().toISOString(),
              status: 'all_started'
            }, null, 2)).toString('base64'),
            mimeType: 'application/json'
          }
        });
        
        // Update state
        toolContext.state.set('mcp:allServers:status', 'started');
        toolContext.state.set('mcp:allServers:startedAt', new Date().toISOString());
        
        return {
          success: true,
          servers,
          message: `All ${servers.length} MCP servers started successfully`,
          context: {
            startedAt: new Date().toISOString(),
            totalServers: servers.length
          }
        };
      } catch (error) {
        this.log.error('Failed to start all MCP servers:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }, {
      name: 'start_all_mcp_servers',
      description: 'Start all MCP servers with ADK-TS context integration',
      parameters: z.object({})
    });
  }

  // Private helper method to simulate MCP calls
  private async simulateMCPCall(serverName: string, toolName: string, args: Record<string, any>): Promise<any> {
    // This is a simulation - in a real implementation, this would call the actual MCP server
    const serverCapabilities = this.getServerCapabilities(serverName);
    
    if (serverName === 'workflow-builder') {
      return {
        success: true,
        result: `Simulated workflow builder tool '${toolName}' execution`,
        args,
        serverCapabilities
      };
    } else if (serverName === 'vector-search') {
      return {
        success: true,
        result: `Simulated vector search tool '${toolName}' execution`,
        args,
        serverCapabilities
      };
    } else if (serverName === 'agent2agent') {
      return {
        success: true,
        result: `Simulated agent2agent tool '${toolName}' execution`,
        args,
        serverCapabilities
      };
    } else {
      return {
        success: true,
        result: `Simulated MCP tool '${toolName}' execution on server '${serverName}'`,
        args,
        serverCapabilities
      };
    }
  }

  // Private helper method to get server capabilities
  private getServerCapabilities(serverName: string): string[] {
    const capabilities: Record<string, string[]> = {
      'workflow-builder': ['create_workflow', 'add_node', 'edit_node', 'delete_node', 'add_connection', 'remove_connection', 'validate_workflow', 'search_nodes'],
      'vector-search': ['search_workflows', 'find_similar_workflows', 'index_workflow', 'update_workflow_index', 'delete_workflow_index', 'get_workflow_categories', 'get_workflow_tags', 'cluster_workflows', 'get_search_statistics'],
      'agent2agent': ['send_message', 'broadcast_message', 'get_agent_status', 'list_agents'],
      'workflow-generator': ['generate_workflow', 'suggest_nodes', 'optimize_workflow'],
      'n8n2mcp-router': ['route_request', 'get_routing_info', 'update_routing_rules']
    };
    
    return capabilities[serverName] || [];
  }
}
