// n8n API Types - Enhanced from n8n-mcp-main
// These types define the structure of n8n API requests and responses

// Resource Locator Types
export interface ResourceLocatorValue {
  __rl: true;
  value: string;
  mode: 'id' | 'url' | 'expression' | string;
}

// Expression Format Types
export type ExpressionValue = string | ResourceLocatorValue;

// Workflow Node Types
export interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, unknown>;
  credentials?: Record<string, unknown>;
  disabled?: boolean;
  notes?: string;
  notesInFlow?: boolean;
  continueOnFail?: boolean;
  onError?: 'continueRegularOutput' | 'continueErrorOutput' | 'stopWorkflow';
  retryOnFail?: boolean;
  maxTries?: number;
  waitBetweenTries?: number;
  alwaysOutputData?: boolean;
  executeOnce?: boolean;
}

export interface WorkflowConnection {
  [sourceNodeId: string]: {
    [outputType: string]: Array<Array<{
      node: string;
      type: string;
      index: number;
    }>>;
  };
}

export interface WorkflowSettings {
  executionOrder?: 'v0' | 'v1';
  timezone?: string;
  saveDataErrorExecution?: 'all' | 'none';
  saveDataSuccessExecution?: 'all' | 'none';
  saveManualExecutions?: boolean;
  saveExecutionProgress?: boolean;
  executionTimeout?: number;
  errorWorkflow?: string;
}

export interface Workflow {
  id?: string;
  name: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection;
  active?: boolean;
  isArchived?: boolean;
  settings?: WorkflowSettings;
  staticData?: Record<string, unknown>;
  tags?: string[];
  updatedAt?: string;
  createdAt?: string;
  versionId?: string;
  meta?: {
    instanceId?: string;
  };
}

// Execution Types
export enum ExecutionStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  WAITING = 'waiting',
}

export interface ExecutionSummary {
  id: string;
  finished: boolean;
  mode: string;
  retryOf?: string;
  retrySuccessId?: string;
  status: ExecutionStatus;
  startedAt: string;
  stoppedAt?: string;
  workflowId: string;
  workflowName?: string;
  waitTill?: string;
}

export interface ExecutionData {
  startData?: Record<string, unknown>;
  resultData: {
    runData: Record<string, unknown>;
    lastNodeExecuted?: string;
  };
}

export interface Execution {
  id: string;
  finished: boolean;
  mode: string;
  retryOf?: string;
  retrySuccessId?: string;
  status: ExecutionStatus;
  startedAt: string;
  stoppedAt?: string;
  workflowId: string;
  workflowName?: string;
  waitTill?: string;
  data?: ExecutionData;
}

// API Request/Response Types
export interface WorkflowListParams {
  limit?: number;
  offset?: number;
  tags?: string[];
  active?: boolean;
}

export interface WorkflowListResponse {
  data: Workflow[];
  total: number;
}

export interface ExecutionListParams {
  workflowId?: string;
  limit?: number;
  offset?: number;
  status?: ExecutionStatus;
}

export interface ExecutionListResponse {
  data: Execution[];
  total: number;
}

// Credential Types
export interface Credential {
  id: string;
  name: string;
  type: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CredentialListParams {
  limit?: number;
  offset?: number;
}

export interface CredentialListResponse {
  data: Credential[];
  total: number;
}

// Tag Types
export interface Tag {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface TagListParams {
  limit?: number;
  offset?: number;
}

export interface TagListResponse {
  data: Tag[];
  total: number;
}

// Health Check Types
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  version?: string;
  uptime?: number;
}

// Variable Types
export interface Variable {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean';
  createdAt: string;
  updatedAt: string;
}

// Webhook Types
export interface WebhookRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
  query: Record<string, string>;
}

// Import/Export Types
export interface WorkflowExport {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection;
  active: boolean;
  settings: WorkflowSettings;
  staticData: Record<string, unknown>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowImport {
  name: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection;
  settings?: WorkflowSettings;
  staticData?: Record<string, unknown>;
  tags?: string[];
}

// Source Control Types
export interface SourceControlStatus {
  status: 'connected' | 'disconnected' | 'error';
  branch?: string;
  commit?: string;
  lastSync?: string;
}

export interface SourceControlPullResult {
  success: boolean;
  message: string;
  changes?: {
    workflows: number;
    credentials: number;
    tags: number;
  };
}

export interface SourceControlPushResult {
  success: boolean;
  message: string;
  commit?: string;
}
