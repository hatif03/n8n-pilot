import fs from 'fs/promises';
import path from 'path';
import { createEmptyWorkflow, validateWorkflow } from '../lib/workflow-utils.js';
export class WorkflowService {
    workflowsDir;
    constructor(workflowsDir = './workflows') {
        this.workflowsDir = workflowsDir;
    }
    /**
     * Ensure the workflows directory exists
     */
    async ensureWorkflowsDir() {
        try {
            await fs.access(this.workflowsDir);
        }
        catch {
            await fs.mkdir(this.workflowsDir, { recursive: true });
        }
    }
    /**
     * Get the file path for a workflow
     */
    getWorkflowPath(workflowName) {
        return path.join(this.workflowsDir, `${workflowName}.json`);
    }
    /**
     * Create a new workflow
     */
    async createWorkflow(name, description, active = false, settings = {}) {
        await this.ensureWorkflowsDir();
        const workflow = createEmptyWorkflow(name, description);
        workflow.active = active;
        workflow.settings = settings;
        const workflowPath = this.getWorkflowPath(name);
        await fs.writeFile(workflowPath, JSON.stringify(workflow, null, 2));
        return workflow;
    }
    /**
     * Load a workflow from file
     */
    async loadWorkflow(workflowName) {
        try {
            const workflowPath = this.getWorkflowPath(workflowName);
            const content = await fs.readFile(workflowPath, 'utf-8');
            return JSON.parse(content);
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Save a workflow to file
     */
    async saveWorkflow(workflow) {
        await this.ensureWorkflowsDir();
        const validation = validateWorkflow(workflow);
        if (!validation.valid) {
            throw new Error(`Invalid workflow: ${validation.errors.join(', ')}`);
        }
        const workflowPath = this.getWorkflowPath(workflow.name);
        await fs.writeFile(workflowPath, JSON.stringify(workflow, null, 2));
    }
    /**
     * List all workflows
     */
    async listWorkflows() {
        try {
            await this.ensureWorkflowsDir();
            const files = await fs.readdir(this.workflowsDir);
            return files
                .filter(file => file.endsWith('.json'))
                .map(file => path.basename(file, '.json'));
        }
        catch {
            return [];
        }
    }
    /**
     * Delete a workflow
     */
    async deleteWorkflow(workflowName) {
        try {
            const workflowPath = this.getWorkflowPath(workflowName);
            await fs.unlink(workflowPath);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Check if a workflow exists
     */
    async workflowExists(workflowName) {
        try {
            const workflowPath = this.getWorkflowPath(workflowName);
            await fs.access(workflowPath);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Get workflow details
     */
    async getWorkflowDetails(workflowName) {
        const workflow = await this.loadWorkflow(workflowName);
        if (!workflow) {
            return { exists: false };
        }
        const stats = {
            nodeCount: workflow.nodes.length,
            nodeTypes: [...new Set(workflow.nodes.map(node => node.type))],
            connectionCount: Object.values(workflow.connections).reduce((total, outputs) => total + Object.values(outputs).reduce((outputTotal, connections) => outputTotal + connections.length, 0), 0),
            isActive: workflow.active,
            lastUpdated: workflow.updatedAt,
        };
        return {
            exists: true,
            workflow,
            stats,
        };
    }
}
//# sourceMappingURL=workflow-service.js.map