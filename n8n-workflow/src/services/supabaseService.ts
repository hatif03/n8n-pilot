import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';
import { N8nWorkflow, WorkflowMetadata } from '../types/workflow';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceKey?: string;
}

export class SupabaseService {
  private client: SupabaseClient;
  private logger = logger.child({ context: 'SupabaseService' });

  constructor(config: SupabaseConfig) {
    this.client = createClient(config.url, config.anonKey);
  }

  public async initialize(): Promise<void> {
    try {
      // Test connection
      const { data, error } = await this.client.from('workflows').select('count').limit(1);
      
      if (error) {
        this.logger.warn('Supabase connection test failed, but service initialized:', error.message);
      } else {
        this.logger.info('Supabase service initialized successfully');
      }
    } catch (error) {
      this.logger.error('Failed to initialize Supabase service:', error);
      throw new Error(`Failed to initialize Supabase service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async storeWorkflow(workflow: N8nWorkflow, metadata: WorkflowMetadata): Promise<void> {
    try {
      const { error } = await this.client
        .from('workflows')
        .upsert({
          id: workflow.id,
          name: workflow.name,
          description: metadata.description,
          category: metadata.category,
          tags: metadata.tags,
          complexity: metadata.complexity,
          nodes: workflow.nodes,
          connections: workflow.connections,
          active: workflow.active,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw new Error(`Failed to store workflow: ${error.message}`);
      }

      this.logger.info(`Workflow ${workflow.id} stored successfully`);
    } catch (error) {
      this.logger.error('Failed to store workflow:', error);
      throw error;
    }
  }

  public async getWorkflow(id: string): Promise<N8nWorkflow | null> {
    try {
      const { data, error } = await this.client
        .from('workflows')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to get workflow: ${error.message}`);
      }

      return data as N8nWorkflow;
    } catch (error) {
      this.logger.error('Failed to get workflow:', error);
      throw error;
    }
  }

  public async searchWorkflows(filters: {
    category?: string;
    tags?: string[];
    complexity?: string;
    limit?: number;
    offset?: number;
  }): Promise<N8nWorkflow[]> {
    try {
      let query = this.client.from('workflows').select('*');

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      if (filters.complexity) {
        query = query.eq('complexity', filters.complexity);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to search workflows: ${error.message}`);
      }

      return data as N8nWorkflow[];
    } catch (error) {
      this.logger.error('Failed to search workflows:', error);
      throw error;
    }
  }

  public async getWorkflowCategories(): Promise<string[]> {
    try {
      const { data, error } = await this.client
        .from('workflows')
        .select('category')
        .not('category', 'is', null);

      if (error) {
        throw new Error(`Failed to get categories: ${error.message}`);
      }

      const categories = [...new Set(data.map(item => item.category))];
      return categories;
    } catch (error) {
      this.logger.error('Failed to get workflow categories:', error);
      throw error;
    }
  }

  public async getWorkflowTags(): Promise<string[]> {
    try {
      const { data, error } = await this.client
        .from('workflows')
        .select('tags')
        .not('tags', 'is', null);

      if (error) {
        throw new Error(`Failed to get tags: ${error.message}`);
      }

      const allTags = data.flatMap(item => item.tags || []);
      const uniqueTags = [...new Set(allTags)];
      return uniqueTags;
    } catch (error) {
      this.logger.error('Failed to get workflow tags:', error);
      throw error;
    }
  }

  public async deleteWorkflow(id: string): Promise<void> {
    try {
      const { error } = await this.client
        .from('workflows')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete workflow: ${error.message}`);
      }

      this.logger.info(`Workflow ${id} deleted successfully`);
    } catch (error) {
      this.logger.error('Failed to delete workflow:', error);
      throw error;
    }
  }

  public async getWorkflowStats(): Promise<{
    total: number;
    byCategory: Record<string, number>;
    byComplexity: Record<string, number>;
    lastUpdated: string;
  }> {
    try {
      const { data: workflows, error } = await this.client
        .from('workflows')
        .select('category, complexity, updated_at');

      if (error) {
        throw new Error(`Failed to get workflow stats: ${error.message}`);
      }

      const stats = {
        total: workflows.length,
        byCategory: {} as Record<string, number>,
        byComplexity: {} as Record<string, number>,
        lastUpdated: new Date().toISOString()
      };

      workflows.forEach(workflow => {
        // Count by category
        const category = workflow.category || 'unknown';
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

        // Count by complexity
        const complexity = workflow.complexity || 'unknown';
        stats.byComplexity[complexity] = (stats.byComplexity[complexity] || 0) + 1;

        // Track last updated
        if (workflow.updated_at && workflow.updated_at > stats.lastUpdated) {
          stats.lastUpdated = workflow.updated_at;
        }
      });

      return stats;
    } catch (error) {
      this.logger.error('Failed to get workflow stats:', error);
      throw error;
    }
  }
}



