import { Workflow, WorkflowListParams, WorkflowListResponse, Execution, ExecutionListParams, ExecutionListResponse, Credential, CredentialListParams, CredentialListResponse, TagListParams, TagListResponse, HealthCheckResponse, Variable, WorkflowExport, WorkflowImport, SourceControlStatus, SourceControlPullResult, SourceControlPushResult } from '../types/n8n-api.js';
export interface N8nApiClientConfig {
    baseUrl: string;
    apiKey: string;
    timeout?: number;
    maxRetries?: number;
}
export declare class N8nApiClient {
    private client;
    private maxRetries;
    constructor(config: N8nApiClientConfig);
    /**
     * Health check
     */
    healthCheck(): Promise<HealthCheckResponse>;
    /**
     * Workflow operations
     */
    listWorkflows(params?: WorkflowListParams): Promise<WorkflowListResponse>;
    getWorkflow(id: string): Promise<Workflow>;
    createWorkflow(workflow: Workflow): Promise<Workflow>;
    updateWorkflow(id: string, workflow: Partial<Workflow>): Promise<Workflow>;
    deleteWorkflow(id: string): Promise<void>;
    activateWorkflow(id: string): Promise<Workflow>;
    deactivateWorkflow(id: string): Promise<Workflow>;
    /**
     * Execution operations
     */
    listExecutions(params?: ExecutionListParams): Promise<ExecutionListResponse>;
    getExecution(id: string): Promise<Execution>;
    deleteExecution(id: string): Promise<void>;
    /**
     * Credential operations
     */
    listCredentials(params?: CredentialListParams): Promise<CredentialListResponse>;
    getCredential(id: string): Promise<Credential>;
    /**
     * Tag operations
     */
    listTags(params?: TagListParams): Promise<TagListResponse>;
    /**
     * Variable operations
     */
    listVariables(): Promise<Variable[]>;
    /**
     * Webhook operations
     */
    testWebhook(webhookUrl: string, data: any): Promise<any>;
    /**
     * Export/Import operations
     */
    exportWorkflow(id: string): Promise<WorkflowExport>;
    importWorkflow(workflow: WorkflowImport): Promise<Workflow>;
    /**
     * Source control operations
     */
    getSourceControlStatus(): Promise<SourceControlStatus>;
    pullFromSourceControl(): Promise<SourceControlPullResult>;
    pushToSourceControl(): Promise<SourceControlPushResult>;
}
