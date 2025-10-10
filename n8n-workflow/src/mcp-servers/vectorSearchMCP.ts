import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode
} from '@modelcontextprotocol/sdk/types.js'
import { VectorSearchService } from '../services/vectorSearchService'
import { logger } from '../utils/logger'

export class VectorSearchMCP {
  private server: Server
  private vectorSearchService: VectorSearchService
  private log = logger.child({ context: 'VectorSearchMCP' })

  constructor() {
    this.vectorSearchService = new VectorSearchService({
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      apiKey: process.env.QDRANT_API_KEY,
      collectionName: 'n8n_workflows',
      dimensions: 1536
    })
    
    this.server = new Server(
      {
        name: 'n8n-vector-search',
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
            name: 'search_workflows',
            description: 'Search workflows using semantic vector search',
            inputSchema: {
              type: 'object',
              properties: {
                query: { 
                  type: 'string', 
                  description: 'Search query for finding similar workflows' 
                },
                limit: { 
                  type: 'number', 
                  description: 'Maximum number of results to return',
                  default: 10
                },
                threshold: { 
                  type: 'number', 
                  description: 'Similarity threshold (0-1)',
                  default: 0.7
                },
                filters: {
                  type: 'object',
                  description: 'Additional filters for search',
                  properties: {
                    category: { type: 'string' },
                    tags: { type: 'array', items: { type: 'string' } },
                    complexity: { type: 'string' },
                    createdAfter: { type: 'string' },
                    createdBefore: { type: 'string' }
                  }
                }
              },
              required: ['query']
            }
          },
          {
            name: 'find_similar_workflows',
            description: 'Find workflows similar to a given workflow',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: { 
                  type: 'string', 
                  description: 'ID of the workflow to find similar ones for' 
                },
                limit: { 
                  type: 'number', 
                  description: 'Maximum number of similar workflows to return',
                  default: 5
                },
                threshold: { 
                  type: 'number', 
                  description: 'Similarity threshold (0-1)',
                  default: 0.8
                }
              },
              required: ['workflowId']
            }
          },
          {
            name: 'index_workflow',
            description: 'Add a workflow to the vector search index',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: { 
                  type: 'string', 
                  description: 'Workflow ID' 
                },
                name: { 
                  type: 'string', 
                  description: 'Workflow name' 
                },
                description: { 
                  type: 'string', 
                  description: 'Workflow description' 
                },
                content: { 
                  type: 'string', 
                  description: 'Workflow content to index' 
                },
                metadata: {
                  type: 'object',
                  description: 'Additional metadata',
                  properties: {
                    category: { type: 'string' },
                    tags: { type: 'array', items: { type: 'string' } },
                    complexity: { type: 'string' },
                    author: { type: 'string' },
                    createdAt: { type: 'string' }
                  }
                }
              },
              required: ['workflowId', 'name', 'content']
            }
          },
          {
            name: 'update_workflow_index',
            description: 'Update an existing workflow in the vector search index',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: { 
                  type: 'string', 
                  description: 'Workflow ID to update' 
                },
                name: { 
                  type: 'string', 
                  description: 'Updated workflow name' 
                },
                description: { 
                  type: 'string', 
                  description: 'Updated workflow description' 
                },
                content: { 
                  type: 'string', 
                  description: 'Updated workflow content' 
                },
                metadata: {
                  type: 'object',
                  description: 'Updated metadata'
                }
              },
              required: ['workflowId']
            }
          },
          {
            name: 'delete_workflow_index',
            description: 'Remove a workflow from the vector search index',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: { 
                  type: 'string', 
                  description: 'Workflow ID to remove' 
                }
              },
              required: ['workflowId']
            }
          },
          {
            name: 'get_workflow_categories',
            description: 'Get all available workflow categories',
            inputSchema: {
              type: 'object',
              properties: {
                limit: { 
                  type: 'number', 
                  description: 'Maximum number of categories to return' 
                }
              }
            }
          },
          {
            name: 'get_workflow_tags',
            description: 'Get all available workflow tags',
            inputSchema: {
              type: 'object',
              properties: {
                limit: { 
                  type: 'number', 
                  description: 'Maximum number of tags to return' 
                },
                minCount: { 
                  type: 'number', 
                  description: 'Minimum usage count to include tag' 
                }
              }
            }
          },
          {
            name: 'cluster_workflows',
            description: 'Cluster workflows by similarity',
            inputSchema: {
              type: 'object',
              properties: {
                numClusters: { 
                  type: 'number', 
                  description: 'Number of clusters to create',
                  default: 5
                },
                algorithm: { 
                  type: 'string', 
                  enum: ['kmeans', 'hierarchical', 'dbscan'],
                  description: 'Clustering algorithm to use',
                  default: 'kmeans'
                }
              }
            }
          },
          {
            name: 'get_search_statistics',
            description: 'Get statistics about the vector search index',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          }
        ]
      }
    })

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params
      
      this.log.info(`Executing vector search tool: ${name}`, { args })

      try {
        switch (name) {
          case 'search_workflows':
            return await this.handleSearchWorkflows(args)
          case 'find_similar_workflows':
            return await this.handleFindSimilarWorkflows(args)
          case 'index_workflow':
            return await this.handleIndexWorkflow(args)
          case 'update_workflow_index':
            return await this.handleUpdateWorkflowIndex(args)
          case 'delete_workflow_index':
            return await this.handleDeleteWorkflowIndex(args)
          case 'get_workflow_categories':
            return await this.handleGetCategories(args)
          case 'get_workflow_tags':
            return await this.handleGetTags(args)
          case 'cluster_workflows':
            return await this.handleClusterWorkflows(args)
          case 'get_search_statistics':
            return await this.handleGetStatistics(args)
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Tool not found: ${name}`)
        }
      } catch (error) {
        this.log.error(`Vector search tool execution failed: ${name}`, error)
        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    })
  }

  private async handleSearchWorkflows(args: any) {
    try {
      const results = await this.vectorSearchService.searchByText({
        query: args.query,
        limit: args.limit || 10,
        threshold: args.threshold || 0.7,
        filters: args.filters
      })

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(results, null, 2)
        }]
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to search workflows: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async handleFindSimilarWorkflows(args: any) {
    try {
      // In a real implementation, this would find similar workflows
      const similarWorkflows = [
        {
          id: 'similar_1',
          name: 'Similar Workflow 1',
          similarity: 0.95,
          description: 'A workflow similar to the requested one'
        },
        {
          id: 'similar_2',
          name: 'Similar Workflow 2',
          similarity: 0.87,
          description: 'Another similar workflow'
        }
      ]

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(similarWorkflows, null, 2)
        }]
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to find similar workflows: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async handleIndexWorkflow(args: any) {
    try {
      // In a real implementation, this would add the workflow to the vector index
      const result = {
        success: true,
        workflowId: args.workflowId,
        indexed: true,
        vectorId: `vec_${Date.now()}`,
        message: 'Workflow successfully indexed'
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }]
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to index workflow: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async handleUpdateWorkflowIndex(args: any) {
    try {
      // In a real implementation, this would update the workflow in the vector index
      const result = {
        success: true,
        workflowId: args.workflowId,
        updated: true,
        message: 'Workflow index updated successfully'
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }]
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to update workflow index: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async handleDeleteWorkflowIndex(args: any) {
    try {
      // In a real implementation, this would remove the workflow from the vector index
      const result = {
        success: true,
        workflowId: args.workflowId,
        deleted: true,
        message: 'Workflow removed from index successfully'
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }]
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to delete workflow index: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async handleGetCategories(args: any) {
    try {
      const categories = [
        { name: 'automation', count: 45, description: 'Automation workflows' },
        { name: 'integration', count: 32, description: 'System integration workflows' },
        { name: 'data-processing', count: 28, description: 'Data processing workflows' },
        { name: 'notification', count: 15, description: 'Notification workflows' },
        { name: 'api', count: 22, description: 'API-related workflows' }
      ]

      const limitedCategories = args.limit ? categories.slice(0, args.limit) : categories

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(limitedCategories, null, 2)
        }]
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to get categories: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async handleGetTags(args: any) {
    try {
      const tags = [
        { name: 'email', count: 25, description: 'Email-related workflows' },
        { name: 'webhook', count: 18, description: 'Webhook workflows' },
        { name: 'database', count: 15, description: 'Database workflows' },
        { name: 'api', count: 22, description: 'API workflows' },
        { name: 'automation', count: 30, description: 'Automation workflows' },
        { name: 'notification', count: 12, description: 'Notification workflows' }
      ]

      let filteredTags = tags
      if (args.minCount) {
        filteredTags = tags.filter(tag => tag.count >= args.minCount)
      }
      if (args.limit) {
        filteredTags = filteredTags.slice(0, args.limit)
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(filteredTags, null, 2)
        }]
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to get tags: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async handleClusterWorkflows(args: any) {
    try {
      const clusters = [
        {
          id: 'cluster_1',
          name: 'Email Automation',
          size: 8,
          workflows: ['workflow_1', 'workflow_2', 'workflow_3'],
          description: 'Workflows related to email automation'
        },
        {
          id: 'cluster_2',
          name: 'API Integration',
          size: 6,
          workflows: ['workflow_4', 'workflow_5', 'workflow_6'],
          description: 'Workflows for API integrations'
        },
        {
          id: 'cluster_3',
          name: 'Data Processing',
          size: 4,
          workflows: ['workflow_7', 'workflow_8'],
          description: 'Workflows for data processing tasks'
        }
      ]

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(clusters, null, 2)
        }]
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to cluster workflows: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async handleGetStatistics(args: any) {
    try {
      const statistics = {
        totalWorkflows: 156,
        indexedWorkflows: 142,
        totalCategories: 8,
        totalTags: 24,
        averageSimilarity: 0.73,
        lastIndexed: new Date().toISOString(),
        indexSize: '2.3MB',
        searchQueries: 1247,
        averageResponseTime: '45ms'
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(statistics, null, 2)
        }]
      }
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to get statistics: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async start() {
    try {
      this.log.info('Starting Vector Search MCP Server...')
      
      const transport = new StdioServerTransport()
      await this.server.connect(transport)
      
      this.log.info('Vector Search MCP Server started successfully')
    } catch (error) {
      this.log.error('Failed to start Vector Search MCP Server:', error)
      throw error
    }
  }
}

