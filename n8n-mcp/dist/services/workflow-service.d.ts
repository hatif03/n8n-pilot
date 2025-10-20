import { N8nWorkflow } from '../types.js';
export declare class WorkflowService {
    private workflowsDir;
    constructor(workflowsDir?: string);
    /**
     * Ensure the workflows directory exists
     */
    private ensureWorkflowsDir;
    /**
     * Get the file path for a workflow
     */
    private getWorkflowPath;
    /**
     * Create a new workflow
     */
    createWorkflow(name: string, description?: string, active?: boolean, settings?: Record<string, any>): Promise<N8nWorkflow>;
    /**
     * Load a workflow from file
     */
    loadWorkflow(workflowName: string): Promise<N8nWorkflow | null>;
    /**
     * Save a workflow to file
     */
    saveWorkflow(workflow: N8nWorkflow): Promise<void>;
    /**
     * List all workflows
     */
    listWorkflows(): Promise<string[]>;
    /**
     * Delete a workflow
     */
    deleteWorkflow(workflowName: string): Promise<boolean>;
    /**
     * Check if a workflow exists
     */
    workflowExists(workflowName: string): Promise<boolean>;
    /**
     * Get workflow details
     */
    getWorkflowDetails(workflowName: string): Promise<{
        exists: boolean;
        workflow?: N8nWorkflow;
        stats?: any;
    }>;
}
