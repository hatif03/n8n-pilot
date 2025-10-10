import { z } from 'zod';

// Agent Configuration Types
export const AgentConfigSchema = z.object({
  name: z.string(),
  description: z.string(),
  model: z.string().optional(),
  tools: z.array(z.string()).default([]),
  memory: z.boolean().default(true),
  session: z.boolean().default(true),
  instruction: z.string().optional(),
  globalInstruction: z.string().optional(),
  maxIterations: z.number().default(10),
  timeout: z.number().default(30000),
});

export const AgentCapabilitySchema = z.object({
  name: z.string(),
  description: z.string(),
  inputSchema: z.record(z.any()),
  outputSchema: z.record(z.any()),
  examples: z.array(z.record(z.any())).default([]),
});

// Agent Communication Types
export const AgentRequestSchema = z.object({
  id: z.string(),
  agent: z.string(),
  action: z.string(),
  parameters: z.record(z.any()),
  context: z.record(z.any()).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  timeout: z.number().optional(),
});

export const AgentResponseSchema = z.object({
  id: z.string(),
  agent: z.string(),
  success: z.boolean(),
  result: z.any().optional(),
  error: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  executionTime: z.number(),
  timestamp: z.string(),
});

// Agent State Types
export const AgentStateSchema = z.object({
  id: z.string(),
  status: z.enum(['idle', 'running', 'error', 'completed']),
  currentTask: z.string().optional(),
  progress: z.number().min(0).max(100).default(0),
  lastActivity: z.string(),
  metrics: z.object({
    tasksCompleted: z.number().default(0),
    tasksFailed: z.number().default(0),
    averageExecutionTime: z.number().default(0),
    successRate: z.number().min(0).max(100).default(0),
  }),
});

// Agent Collaboration Types
export const AgentCollaborationSchema = z.object({
  id: z.string(),
  participants: z.array(z.string()),
  task: z.string(),
  status: z.enum(['planning', 'executing', 'completed', 'failed']),
  roles: z.record(z.string()),
  communication: z.array(z.object({
    from: z.string(),
    to: z.string(),
    message: z.string(),
    timestamp: z.string(),
  })),
  sharedContext: z.record(z.any()),
});

// Export types
export type AgentConfig = z.infer<typeof AgentConfigSchema>;
export type AgentCapability = z.infer<typeof AgentCapabilitySchema>;
export type AgentRequest = z.infer<typeof AgentRequestSchema>;
export type AgentResponse = z.infer<typeof AgentResponseSchema>;
export type AgentState = z.infer<typeof AgentStateSchema>;
export type AgentCollaboration = z.infer<typeof AgentCollaborationSchema>;

// Additional utility types
export interface AgentRegistry {
  [agentName: string]: {
    config: AgentConfig;
    capabilities: AgentCapability[];
    state: AgentState;
    isAvailable: boolean;
  };
}

export interface AgentTask {
  id: string;
  agent: string;
  type: string;
  parameters: Record<string, any>;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  result?: any;
  error?: string;
}

export interface AgentWorkflow {
  id: string;
  name: string;
  description: string;
  steps: Array<{
    id: string;
    agent: string;
    action: string;
    parameters: Record<string, any>;
    dependencies: string[];
    condition?: string;
  }>;
  status: 'draft' | 'active' | 'paused' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// Default export for ADK web interface
export default {
  AgentConfigSchema,
  AgentCapabilitySchema,
  AgentRequestSchema,
  AgentResponseSchema,
  AgentStateSchema,
  AgentCollaborationSchema
};