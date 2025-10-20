import fs from 'fs/promises';
import path from 'path';
import { N8nWorkflow } from '../types.js';
import { createEmptyWorkflow, validateWorkflow } from '../lib/workflow-utils.js';

export class WorkflowService {
  private workflowsDir: string;

  constructor(workflowsDir: string = './workflows') {
    this.workflowsDir = workflowsDir;
  }

  /**
   * Ensure the workflows directory exists
   */
  private async ensureWorkflowsDir(): Promise<void> {
    try {
      await fs.access(this.workflowsDir);
    } catch {
      await fs.mkdir(this.workflowsDir, { recursive: true });
    }
  }

  /**
   * Get the file path for a workflow
   */
  private getWorkflowPath(workflowName: string): string {
    return path.join(this.workflowsDir, `${workflowName}.json`);
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(
    name: string,
    description?: string,
    active: boolean = false,
    settings: Record<string, any> = {}
  ): Promise<N8nWorkflow> {
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
  async loadWorkflow(workflowName: string): Promise<N8nWorkflow | null> {
    try {
      const workflowPath = this.getWorkflowPath(workflowName);
      const content = await fs.readFile(workflowPath, 'utf-8');
      return JSON.parse(content) as N8nWorkflow;
    } catch (error) {
      return null;
    }
  }

  /**
   * Save a workflow to file
   */
  async saveWorkflow(workflow: N8nWorkflow): Promise<void> {
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
  async listWorkflows(): Promise<string[]> {
    try {
      await this.ensureWorkflowsDir();
      const files = await fs.readdir(this.workflowsDir);
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => path.basename(file, '.json'));
    } catch {
      return [];
    }
  }

  /**
   * Delete a workflow
   */
  async deleteWorkflow(workflowName: string): Promise<boolean> {
    try {
      const workflowPath = this.getWorkflowPath(workflowName);
      await fs.unlink(workflowPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if a workflow exists
   */
  async workflowExists(workflowName: string): Promise<boolean> {
    try {
      const workflowPath = this.getWorkflowPath(workflowName);
      await fs.access(workflowPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get workflow details
   */
  async getWorkflowDetails(workflowName: string): Promise<{
    exists: boolean;
    workflow?: N8nWorkflow;
    stats?: any;
  }> {
    const workflow = await this.loadWorkflow(workflowName);
    
    if (!workflow) {
      return { exists: false };
    }

    const stats = {
      nodeCount: workflow.nodes.length,
      nodeTypes: [...new Set(workflow.nodes.map(node => node.type))],
      connectionCount: Object.values(workflow.connections).reduce(
        (total, outputs) => total + Object.values(outputs).reduce(
          (outputTotal, connections) => outputTotal + connections.length, 0
        ), 0
      ),
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
