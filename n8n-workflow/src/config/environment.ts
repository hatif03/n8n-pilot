import { z } from 'zod';
import { logger } from '../utils/logger';

// Environment validation schema
const EnvironmentSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // N8N Configuration
  N8N_HOST: z.string().url().default('http://localhost:5678'),
  N8N_API_KEY: z.string().min(1, 'N8N_API_KEY is required'),

  // Database Services
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_KEY: z.string().optional(),

  NEO4J_URI: z.string().url().default('bolt://localhost:7687'),
  NEO4J_USERNAME: z.string().default('neo4j'),
  NEO4J_PASSWORD: z.string().min(1, 'NEO4J_PASSWORD is required'),

  // Vector Database
  QDRANT_URL: z.string().url().default('http://localhost:6333'),
  QDRANT_API_KEY: z.string().optional(),

  // AI Services
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),

  // MCP Configuration
  MCP_SERVER_PORT: z.string().transform(Number).default('3001'),
  MCP_SERVER_HOST: z.string().default('localhost'),

  // Security
  JWT_SECRET: z.string().optional(),
  ENCRYPTION_KEY: z.string().optional(),

  // Feature Flags
  ENABLE_VECTOR_SEARCH: z.string().transform(val => val === 'true').default('true'),
  ENABLE_GRAPH_DB: z.string().transform(val => val === 'true').default('true'),
  ENABLE_MCP_SERVERS: z.string().transform(val => val === 'true').default('true'),
  ENABLE_AGENT_COLLABORATION: z.string().transform(val => val === 'true').default('true'),
});

export type Environment = z.infer<typeof EnvironmentSchema>;

export class EnvironmentConfig {
  private config: Environment;
  private logger = logger.child({ context: 'EnvironmentConfig' });

  constructor() {
    this.config = this.loadAndValidate();
  }

  private loadAndValidate(): Environment {
    try {
      const rawEnv = process.env;
      const validatedEnv = EnvironmentSchema.parse(rawEnv);
      
      this.logger.info('Environment configuration loaded successfully');
      this.logger.debug('Environment variables:', {
        NODE_ENV: validatedEnv.NODE_ENV,
        PORT: validatedEnv.PORT,
        LOG_LEVEL: validatedEnv.LOG_LEVEL,
        N8N_HOST: validatedEnv.N8N_HOST,
        ENABLE_VECTOR_SEARCH: validatedEnv.ENABLE_VECTOR_SEARCH,
        ENABLE_GRAPH_DB: validatedEnv.ENABLE_GRAPH_DB,
        ENABLE_MCP_SERVERS: validatedEnv.ENABLE_MCP_SERVERS,
        ENABLE_AGENT_COLLABORATION: validatedEnv.ENABLE_AGENT_COLLABORATION,
      });

      return validatedEnv;
    } catch (error) {
      this.logger.error('Environment validation failed:', error);
      
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        throw new Error(`Environment validation failed: ${errorMessages}`);
      }
      
      throw new Error(`Failed to load environment configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public getConfig(): Environment {
    return this.config;
  }

  public isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  public isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  public isTest(): boolean {
    return this.config.NODE_ENV === 'test';
  }

  public getN8nConfig() {
    return {
      host: this.config.N8N_HOST,
      apiKey: this.config.N8N_API_KEY,
    };
  }

  public getSupabaseConfig() {
    if (!this.config.SUPABASE_URL || !this.config.SUPABASE_ANON_KEY) {
      return null;
    }

    return {
      url: this.config.SUPABASE_URL,
      anonKey: this.config.SUPABASE_ANON_KEY,
      serviceKey: this.config.SUPABASE_SERVICE_KEY,
    };
  }

  public getNeo4jConfig() {
    return {
      uri: this.config.NEO4J_URI,
      username: this.config.NEO4J_USERNAME,
      password: this.config.NEO4J_PASSWORD,
    };
  }

  public getQdrantConfig() {
    return {
      url: this.config.QDRANT_URL,
      apiKey: this.config.QDRANT_API_KEY,
    };
  }

  public getAIConfig() {
    return {
      openai: this.config.OPENAI_API_KEY ? { apiKey: this.config.OPENAI_API_KEY } : null,
      gemini: this.config.GEMINI_API_KEY ? { apiKey: this.config.GEMINI_API_KEY } : null,
    };
  }

  public getMCPConfig() {
    return {
      port: this.config.MCP_SERVER_PORT,
      host: this.config.MCP_SERVER_HOST,
    };
  }

  public getSecurityConfig() {
    return {
      jwtSecret: this.config.JWT_SECRET,
      encryptionKey: this.config.ENCRYPTION_KEY,
    };
  }

  public getFeatureFlags() {
    return {
      vectorSearch: this.config.ENABLE_VECTOR_SEARCH,
      graphDb: this.config.ENABLE_GRAPH_DB,
      mcpServers: this.config.ENABLE_MCP_SERVERS,
      agentCollaboration: this.config.ENABLE_AGENT_COLLABORATION,
    };
  }

  public validateRequiredServices(): { valid: boolean; missing: string[] } {
    const missing: string[] = [];

    // N8N is always required
    if (!this.config.N8N_API_KEY) {
      missing.push('N8N_API_KEY');
    }

    // At least one AI service should be available
    if (!this.config.OPENAI_API_KEY && !this.config.GEMINI_API_KEY) {
      missing.push('OPENAI_API_KEY or GEMINI_API_KEY');
    }

    // Neo4J is required for graph functionality
    if (this.config.ENABLE_GRAPH_DB && !this.config.NEO4J_PASSWORD) {
      missing.push('NEO4J_PASSWORD');
    }

    return {
      valid: missing.length === 0,
      missing
    };
  }

  public getServiceHealthChecks() {
    return {
      n8n: {
        enabled: true,
        config: this.getN8nConfig(),
        required: true
      },
      supabase: {
        enabled: !!this.getSupabaseConfig(),
        config: this.getSupabaseConfig(),
        required: false
      },
      neo4j: {
        enabled: this.config.ENABLE_GRAPH_DB,
        config: this.getNeo4jConfig(),
        required: this.config.ENABLE_GRAPH_DB
      },
      qdrant: {
        enabled: this.config.ENABLE_VECTOR_SEARCH,
        config: this.getQdrantConfig(),
        required: this.config.ENABLE_VECTOR_SEARCH
      },
      openai: {
        enabled: !!this.config.OPENAI_API_KEY,
        config: this.getAIConfig().openai,
        required: false
      },
      gemini: {
        enabled: !!this.config.GEMINI_API_KEY,
        config: this.getAIConfig().gemini,
        required: false
      }
    };
  }
}

// Export singleton instance
export const environmentConfig = new EnvironmentConfig();

