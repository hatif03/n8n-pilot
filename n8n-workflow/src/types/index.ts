// Re-export all types for easy importing
export * from './workflow';
export * from '../schemas/agent';

// Common utility types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    timestamp: string;
    requestId: string;
    executionTime: number;
  };
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ServiceConfig {
  name: string;
  enabled: boolean;
  config: Record<string, any>;
  dependencies: string[];
}

export interface DatabaseConfig {
  type: 'supabase' | 'neo4j' | 'qdrant' | 'postgresql';
  connectionString: string;
  options?: Record<string, any>;
}

export interface LogConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text';
  output: 'console' | 'file' | 'both';
  file?: string;
}

export interface PlatformConfig {
  name: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  services: ServiceConfig[];
  databases: DatabaseConfig[];
  logging: LogConfig;
  features: {
    workflowIntelligence: boolean;
    agentCollaboration: boolean;
    vectorSearch: boolean;
    graphAnalysis: boolean;
    realTimeOptimization: boolean;
  };
}



