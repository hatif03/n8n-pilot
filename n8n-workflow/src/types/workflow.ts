import { z } from 'zod';

// n8n Workflow Types
export const N8nNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  typeVersion: z.number().optional(),
  position: z.array(z.number()).length(2),
  parameters: z.record(z.any()).optional(),
  webhookId: z.string().optional(),
  disabled: z.boolean().optional(),
  notes: z.string().optional(),
});

export const N8nConnectionSchema = z.object({
  source: z.string(),
  target: z.string(),
  sourceOutput: z.number().default(0),
  targetInput: z.number().default(0),
});

export const N8nWorkflowSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  nodes: z.array(N8nNodeSchema),
  connections: z.record(z.any()).optional(),
  active: z.boolean().default(false),
  settings: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Workflow Analysis Types
export const WorkflowAnalysisSchema = z.object({
  workflowId: z.string(),
  complexityScore: z.number().min(0).max(10),
  performanceScore: z.number().min(0).max(10),
  securityScore: z.number().min(0).max(10),
  maintainabilityScore: z.number().min(0).max(10),
  issues: z.array(z.object({
    type: z.enum(['error', 'warning', 'info']),
    category: z.enum(['naming', 'security', 'performance', 'errorHandling', 'documentation']),
    message: z.string(),
    nodeId: z.string().optional(),
    suggestion: z.string().optional(),
  })),
  recommendations: z.array(z.string()),
  patterns: z.array(z.string()),
  dependencies: z.array(z.string()),
});

export const WorkflowValidationResultSchema = z.object({
  passed: z.boolean(),
  score: z.number().min(0).max(100),
  categories: z.record(z.object({
    passed: z.boolean(),
    score: z.number().min(0).max(100),
    issues: z.array(z.string()),
    suggestions: z.array(z.string()),
  })),
  totalIssues: z.number(),
  criticalIssues: z.number(),
});

// Agent Communication Types
export const AgentMessageSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  type: z.enum(['request', 'response', 'notification']),
  content: z.record(z.any()),
  timestamp: z.string(),
  correlationId: z.string().optional(),
});

export const WorkflowRequestSchema = z.object({
  id: z.string(),
  type: z.enum(['create', 'update', 'analyze', 'validate', 'optimize', 'search', 'list', 'get', 'status', 'compare']),
  workflow: N8nWorkflowSchema.optional(),
  parameters: z.record(z.any()).optional(),
  context: z.record(z.any()).optional(),
});

// Database Types
export const WorkflowMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()),
  complexity: z.enum(['low', 'medium', 'high']),
  nodeTypes: z.array(z.string()),
  connections: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastExecuted: z.string().optional(),
  executionCount: z.number().default(0),
  successRate: z.number().min(0).max(100).optional(),
});

// Vector Search Types
export const VectorSearchResultSchema = z.object({
  id: z.string(),
  score: z.number(),
  metadata: WorkflowMetadataSchema,
  content: z.string(),
});

export const VectorSearchRequestSchema = z.object({
  query: z.string(),
  limit: z.number().default(10),
  threshold: z.number().min(0).max(1).default(0.7),
  filters: z.record(z.any()).optional(),
});

// Export types
export type N8nNode = z.infer<typeof N8nNodeSchema>;
export type N8nConnection = z.infer<typeof N8nConnectionSchema>;
export type N8nWorkflow = z.infer<typeof N8nWorkflowSchema>;
export type WorkflowAnalysis = z.infer<typeof WorkflowAnalysisSchema>;
export type WorkflowValidationResult = z.infer<typeof WorkflowValidationResultSchema>;
export type AgentMessage = z.infer<typeof AgentMessageSchema>;
export type WorkflowRequest = z.infer<typeof WorkflowRequestSchema>;
export type WorkflowMetadata = z.infer<typeof WorkflowMetadataSchema>;
export type VectorSearchResult = z.infer<typeof VectorSearchResultSchema>;
export type VectorSearchRequest = z.infer<typeof VectorSearchRequestSchema>;

// Additional utility types
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  template: N8nWorkflow;
  parameters: Record<string, any>;
  requiredCredentials: string[];
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'success' | 'error' | 'cancelled';
  startedAt: string;
  finishedAt?: string;
  duration?: number;
  data?: any;
  error?: string;
}

export interface WorkflowOptimization {
  workflowId: string;
  optimizations: Array<{
    type: 'performance' | 'cost' | 'maintainability' | 'security';
    description: string;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
    changes: N8nWorkflow;
  }>;
}

