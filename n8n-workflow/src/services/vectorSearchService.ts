import { QdrantClient } from '@qdrant/js-client-rest';
import { VectorSearchRequest, VectorSearchResult, WorkflowMetadata, N8nWorkflow } from '../types/workflow';
import { logger } from '../utils/logger';

export interface VectorSearchConfig {
  url: string;
  apiKey?: string;
  collectionName: string;
  dimensions: number;
}

export class VectorSearchService {
  private client: QdrantClient;
  private collectionName: string;
  private dimensions: number;
  private logger = logger.child({ context: 'VectorSearchService' });

  constructor(config: VectorSearchConfig) {
    this.client = new QdrantClient({
      url: config.url,
      apiKey: config.apiKey,
    });
    this.collectionName = config.collectionName;
    this.dimensions = config.dimensions;
  }

  public async initialize(): Promise<void> {
    try {
      // Check if collection exists
      const collections = await this.client.getCollections();
      const collectionExists = collections.collections.some(
        (col: any) => col.name === this.collectionName
      );

      if (!collectionExists) {
        await this.createCollection();
      }

      this.logger.info(`Vector search service initialized with collection: ${this.collectionName}`);
    } catch (error) {
      this.logger.error('Failed to initialize vector search service:', error);
      throw new Error(`Failed to initialize vector search service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async createCollection(): Promise<void> {
    try {
      await this.client.createCollection(this.collectionName, {
        vectors: {
          size: this.dimensions,
          distance: 'Cosine',
        },
        optimizers_config: {
          default_segment_number: 2,
        },
        replication_factor: 1,
      });
      this.logger.info(`Created vector collection: ${this.collectionName}`);
    } catch (error) {
      this.logger.error(`Failed to create collection ${this.collectionName}:`, error);
      throw error;
    }
  }

  public async indexWorkflow(
    workflow: N8nWorkflow, 
    metadata: WorkflowMetadata,
    embedding: number[]
  ): Promise<void> {
    try {
      if (embedding.length !== this.dimensions) {
        throw new Error(`Embedding dimension mismatch. Expected ${this.dimensions}, got ${embedding.length}`);
      }

      const pointId = workflow.id || `workflow_${Date.now()}`;
      const payload = {
        ...metadata,
        workflow_name: workflow.name,
        node_types: workflow.nodes?.map(node => node.type) || [],
        node_count: workflow.nodes?.length || 0,
        active: workflow.active || false,
        created_at: new Date().toISOString(),
      };

      await this.client.upsert(this.collectionName, {
        wait: true,
        points: [
          {
            id: pointId,
            vector: embedding,
            payload,
          },
        ],
      });

      this.logger.debug(`Indexed workflow: ${workflow.name}`, { workflowId: workflow.id });
    } catch (error) {
      this.logger.error(`Failed to index workflow ${workflow.name}:`, error);
      throw new Error(`Failed to index workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async searchWorkflows(request: VectorSearchRequest): Promise<VectorSearchResult[]> {
    try {
      // For now, we'll use a simple text search approach
      // In a real implementation, you would generate embeddings for the query
      const searchResult = await this.client.search(this.collectionName, {
        vector: new Array(this.dimensions).fill(0), // Placeholder - should be actual query embedding
        limit: request.limit,
        score_threshold: request.threshold,
        with_payload: true,
        with_vector: false,
      });

      return searchResult.map((point: any) => ({
        id: point.id,
        score: point.score,
        metadata: point.payload as WorkflowMetadata,
        content: this.generateContentFromMetadata(point.payload),
      }));
    } catch (error) {
      this.logger.error('Failed to search workflows:', error);
      throw new Error(`Failed to search workflows: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async searchByText(query: string, limit: number = 10): Promise<VectorSearchResult[]> {
    try {
      // This is a simplified text search implementation
      // In production, you would use a proper text embedding model
      const searchResult = await this.client.scroll(this.collectionName, {
        limit: 100, // Get more results to filter
        with_payload: true,
        with_vector: false,
      });

      // Simple text matching (in production, use proper semantic search)
      const filteredResults = searchResult.points
        .filter((point: any) => {
          const payload = point.payload;
          const searchText = `${payload.workflow_name} ${payload.description || ''} ${payload.tags?.join(' ') || ''}`.toLowerCase();
          return searchText.includes(query.toLowerCase());
        })
        .slice(0, limit)
        .map((point: any) => ({
          id: point.id,
          score: 0.8, // Placeholder score
          metadata: point.payload as WorkflowMetadata,
          content: this.generateContentFromMetadata(point.payload),
        }));

      return filteredResults;
    } catch (error) {
      this.logger.error('Failed to search workflows by text:', error);
      throw new Error(`Failed to search workflows by text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async deleteWorkflow(workflowId: string): Promise<void> {
    try {
      await this.client.delete(this.collectionName, {
        points: [workflowId],
      });
      this.logger.debug(`Deleted workflow from vector index: ${workflowId}`);
    } catch (error) {
      this.logger.error(`Failed to delete workflow ${workflowId} from vector index:`, error);
      throw new Error(`Failed to delete workflow from vector index: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async getWorkflowStats(): Promise<{ total: number; lastUpdated: string }> {
    try {
      const collectionInfo = await this.client.getCollection(this.collectionName);
      return {
        total: collectionInfo.points_count || 0,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get workflow stats:', error);
      throw new Error(`Failed to get workflow stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateContentFromMetadata(metadata: any): string {
    const parts = [];
    
    if (metadata.workflow_name) {
      parts.push(`Workflow: ${metadata.workflow_name}`);
    }
    
    if (metadata.description) {
      parts.push(`Description: ${metadata.description}`);
    }
    
    if (metadata.tags && metadata.tags.length > 0) {
      parts.push(`Tags: ${metadata.tags.join(', ')}`);
    }
    
    if (metadata.node_types && metadata.node_types.length > 0) {
      parts.push(`Node Types: ${metadata.node_types.join(', ')}`);
    }
    
    if (metadata.complexity) {
      parts.push(`Complexity: ${metadata.complexity}`);
    }
    
    return parts.join('\n');
  }

  public async generateEmbedding(text: string): Promise<number[]> {
    // This is a placeholder implementation
    // In production, you would use a proper embedding model like OpenAI's text-embedding-ada-002
    // or a local model like sentence-transformers
    
    // For now, return a random vector of the correct dimension
    const embedding = new Array(this.dimensions);
    for (let i = 0; i < this.dimensions; i++) {
      embedding[i] = Math.random() * 2 - 1; // Random values between -1 and 1
    }
    
    return embedding;
  }
}




