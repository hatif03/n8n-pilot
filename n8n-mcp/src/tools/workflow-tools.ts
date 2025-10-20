import { z } from 'zod';
import { WorkflowService } from '../services/workflow-service.js';
import { N8nWorkflow } from '../types.js';

const workflowService = new WorkflowService();

/**
 * Create a new workflow tool
 */
export const createWorkflowTool = {
  name: 'create_workflow',
  description: 'Create a new n8n workflow',
  parameters: z.object({
    workflow_name: z.string().describe('Name of the workflow'),
    workspace_dir: z.string().optional().describe('Workspace directory path'),
    description: z.string().optional().describe('Description of the workflow'),
    active: z.boolean().optional().default(false).describe('Whether the workflow should be active'),
    settings: z.record(z.string(), z.any()).optional().describe('Custom workflow settings'),
  }),
  execute: async (args: {
    workflow_name: string;
    workspace_dir?: string;
    description?: string;
    active?: boolean;
    settings?: Record<string, any>;
  }) => {
    try {
      // Check if workflow already exists
      const exists = await workflowService.workflowExists(args.workflow_name);
      if (exists) {
        return `Error: Workflow '${args.workflow_name}' already exists`;
      }

      const workflow = await workflowService.createWorkflow(
        args.workflow_name,
        args.description,
        args.active || false,
        args.settings || {}
      );

      return `Workflow '${args.workflow_name}' created successfully.\n\nWorkflow ID: ${workflow.id}\nActive: ${workflow.active}\nNodes: ${workflow.nodes.length}\nConnections: ${Object.keys(workflow.connections).length}`;
    } catch (error) {
      return `Failed to create workflow: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
};

/**
 * List workflows tool
 */
export const listWorkflowsTool = {
  name: 'list_workflows',
  description: 'List all workflows in the workspace',
  parameters: z.object({
    limit: z.number().optional().default(50).describe('Maximum number of workflows to return'),
    cursor: z.string().optional().describe('Pagination cursor'),
  }),
  execute: async (args: { limit?: number; cursor?: string }) => {
    try {
      const workflows = await workflowService.listWorkflows();
      
      // Simple pagination
      const startIndex = args.cursor ? parseInt(args.cursor, 10) : 0;
      const endIndex = startIndex + (args.limit || 50);
      const paginatedWorkflows = workflows.slice(startIndex, endIndex);
      const hasMore = endIndex < workflows.length;
      const nextCursor = hasMore ? endIndex.toString() : undefined;

      return `Found ${workflows.length} workflows:\n\n${paginatedWorkflows.map((name, index) => `${startIndex + index + 1}. ${name}`).join('\n')}\n\nTotal: ${workflows.length}\nHas More: ${hasMore}\nNext Cursor: ${nextCursor || 'None'}`;
    } catch (error) {
      return `Failed to list workflows: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
};

/**
 * Get workflow details tool
 */
export const getWorkflowDetailsTool = {
  name: 'get_workflow_details',
  description: 'Get detailed information about a specific workflow',
  parameters: z.object({
    workflow_name: z.string().describe('Name of the workflow'),
    workflow_path: z.string().optional().describe('Path to the workflow file'),
  }),
  execute: async (args: { workflow_name: string; workflow_path?: string }) => {
    try {
      const details = await workflowService.getWorkflowDetails(args.workflow_name);
      
      if (!details.exists) {
        return `Error: Workflow '${args.workflow_name}' not found`;
      }

      const workflow = details.workflow!;
      const stats = details.stats!;
      
      return `Workflow Details for '${args.workflow_name}':\n\n` +
        `ID: ${workflow.id}\n` +
        `Name: ${workflow.name}\n` +
        `Active: ${workflow.active}\n` +
        `Nodes: ${stats.nodeCount}\n` +
        `Node Types: ${stats.nodeTypes.join(', ')}\n` +
        `Connections: ${stats.connectionCount}\n` +
        `Last Updated: ${stats.lastUpdated}\n\n` +
        `Nodes:\n${workflow.nodes.map(node => `- ${node.name} (${node.type})`).join('\n')}`;
    } catch (error) {
      return `Failed to get workflow details: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
};

/**
 * Delete workflow tool
 */
export const deleteWorkflowTool = {
  name: 'delete_workflow',
  description: 'Delete a workflow',
  parameters: z.object({
    workflow_name: z.string().describe('Name of the workflow to delete'),
  }),
  execute: async (args: { workflow_name: string }) => {
    try {
      const deleted = await workflowService.deleteWorkflow(args.workflow_name);
      
      if (!deleted) {
        return `Error: Workflow '${args.workflow_name}' not found or could not be deleted`;
      }

      return `Workflow '${args.workflow_name}' deleted successfully`;
    } catch (error) {
      return `Failed to delete workflow: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
};

/**
 * Validate workflow tool
 */
export const validateWorkflowTool = {
  name: 'validate_workflow',
  description: 'Validate a workflow file against n8n schema and connectivity',
  parameters: z.object({
    workflow_name: z.string().describe('Name of the workflow to validate'),
    workflow_path: z.string().optional().describe('Path to the workflow file'),
  }),
  execute: async (args: { workflow_name: string; workflow_path?: string }) => {
    try {
      const workflow = await workflowService.loadWorkflow(args.workflow_name);
      
      if (!workflow) {
        return `Error: Workflow '${args.workflow_name}' not found`;
      }

      // Import validation function
      const { validateWorkflow } = await import('../lib/workflow-utils.js');
      const validation = validateWorkflow(workflow);

      if (validation.valid) {
        return `Workflow '${args.workflow_name}' is valid.\n\nNodes: ${workflow.nodes.length}\nConnections: ${Object.keys(workflow.connections).length}`;
      } else {
        return `Workflow '${args.workflow_name}' validation failed:\n\nErrors:\n${validation.errors.map(error => `- ${error}`).join('\n')}`;
      }
    } catch (error) {
      return `Failed to validate workflow: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
};
