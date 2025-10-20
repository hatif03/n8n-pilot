import { z } from 'zod';
import { WorkflowService } from '../services/workflow-service.js';
import { addConnectionToWorkflow, removeConnectionFromWorkflow, findNodeById } from '../lib/workflow-utils.js';

const workflowService = new WorkflowService();

/**
 * Add a connection between two nodes tool
 */
export const addConnectionTool = {
  name: 'add_connection',
  description: 'Create a connection between two nodes in a workflow',
  parameters: z.object({
    workflow_name: z.string().describe('Name of the workflow'),
    source_node_id: z.string().describe('ID of the source node'),
    source_node_output_name: z.string().describe('Name of the output on the source node'),
    target_node_id: z.string().describe('ID of the target node'),
    target_node_input_name: z.string().describe('Name of the input on the target node'),
    target_node_input_index: z.number().optional().default(0).describe('Index of the input on the target node'),
    workflow_path: z.string().optional().describe('Path to the workflow file'),
  }),
  execute: async (args: {
    workflow_name: string;
    source_node_id: string;
    source_node_output_name: string;
    target_node_id: string;
    target_node_input_name: string;
    target_node_input_index?: number;
    workflow_path?: string;
  }) => {
    try {
      // Load the workflow
      const workflow = await workflowService.loadWorkflow(args.workflow_name);
      if (!workflow) {
        return `Error: Workflow '${args.workflow_name}' not found`;
      }

      // Validate source node exists
      const sourceNode = findNodeById(workflow, args.source_node_id);
      if (!sourceNode) {
        return `Error: Source node '${args.source_node_id}' not found in workflow`;
      }

      // Validate target node exists
      const targetNode = findNodeById(workflow, args.target_node_id);
      if (!targetNode) {
        return `Error: Target node '${args.target_node_id}' not found in workflow`;
      }

      // Add the connection
      const updatedWorkflow = addConnectionToWorkflow(
        workflow,
        args.source_node_id,
        args.source_node_output_name,
        args.target_node_id,
        args.target_node_input_name,
        args.target_node_input_index || 0
      );

      // Save the updated workflow
      await workflowService.saveWorkflow(updatedWorkflow);

      return `Connection added from '${sourceNode.name}' (${args.source_node_output_name}) to '${targetNode.name}' (${args.target_node_input_name})`;
    } catch (error) {
      return `Failed to add connection: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
};

/**
 * Remove a connection between two nodes tool
 */
export const removeConnectionTool = {
  name: 'remove_connection',
  description: 'Remove a connection between two nodes in a workflow',
  parameters: z.object({
    workflow_name: z.string().describe('Name of the workflow'),
    source_node_id: z.string().describe('ID of the source node'),
    source_node_output_name: z.string().describe('Name of the output on the source node'),
    target_node_id: z.string().describe('ID of the target node'),
    target_node_input_name: z.string().describe('Name of the input on the target node'),
    target_node_input_index: z.number().optional().default(0).describe('Index of the input on the target node'),
    workflow_path: z.string().optional().describe('Path to the workflow file'),
  }),
  execute: async (args: {
    workflow_name: string;
    source_node_id: string;
    source_node_output_name: string;
    target_node_id: string;
    target_node_input_name: string;
    target_node_input_index?: number;
    workflow_path?: string;
  }) => {
    try {
      // Load the workflow
      const workflow = await workflowService.loadWorkflow(args.workflow_name);
      if (!workflow) {
        return `Error: Workflow '${args.workflow_name}' not found`;
      }

      // Validate source node exists
      const sourceNode = findNodeById(workflow, args.source_node_id);
      if (!sourceNode) {
        return `Error: Source node '${args.source_node_id}' not found in workflow`;
      }

      // Validate target node exists
      const targetNode = findNodeById(workflow, args.target_node_id);
      if (!targetNode) {
        return `Error: Target node '${args.target_node_id}' not found in workflow`;
      }

      // Remove the connection
      const updatedWorkflow = removeConnectionFromWorkflow(
        workflow,
        args.source_node_id,
        args.source_node_output_name,
        args.target_node_id,
        args.target_node_input_name,
        args.target_node_input_index || 0
      );

      // Save the updated workflow
      await workflowService.saveWorkflow(updatedWorkflow);

      return `Connection removed from '${sourceNode.name}' (${args.source_node_output_name}) to '${targetNode.name}' (${args.target_node_input_name})`;
    } catch (error) {
      return `Failed to remove connection: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
};

/**
 * Add AI connections tool (for connecting AI components)
 */
export const addAiConnectionsTool = {
  name: 'add_ai_connections',
  description: 'Wire AI model, tools, and memory to an agent node',
  parameters: z.object({
    workflow_name: z.string().describe('Name of the workflow'),
    agent_node_id: z.string().describe('ID of the agent node'),
    model_node_id: z.string().optional().describe('ID of the model node'),
    tool_node_ids: z.array(z.string()).optional().describe('Array of tool node IDs'),
    memory_node_id: z.string().optional().describe('ID of the memory node'),
    embeddings_node_id: z.string().optional().describe('ID of the embeddings node'),
    vector_store_node_id: z.string().optional().describe('ID of the vector store node'),
    vector_insert_node_id: z.string().optional().describe('ID of the vector insert node'),
    vector_tool_node_id: z.string().optional().describe('ID of the vector tool node'),
    workflow_path: z.string().optional().describe('Path to the workflow file'),
  }),
  execute: async (args: {
    workflow_name: string;
    agent_node_id: string;
    model_node_id?: string;
    tool_node_ids?: string[];
    memory_node_id?: string;
    embeddings_node_id?: string;
    vector_store_node_id?: string;
    vector_insert_node_id?: string;
    vector_tool_node_id?: string;
    workflow_path?: string;
  }) => {
    try {
      // Load the workflow
      const workflow = await workflowService.loadWorkflow(args.workflow_name);
      if (!workflow) {
        return `Error: Workflow '${args.workflow_name}' not found`;
      }

      // Validate agent node exists
      const agentNode = findNodeById(workflow, args.agent_node_id);
      if (!agentNode) {
        return `Error: Agent node '${args.agent_node_id}' not found in workflow`;
      }

      let updatedWorkflow = workflow;
      const connections = [];

      // Connect model if provided
      if (args.model_node_id) {
        const modelNode = findNodeById(workflow, args.model_node_id);
        if (modelNode) {
          updatedWorkflow = addConnectionToWorkflow(
            updatedWorkflow,
            args.model_node_id,
            'main',
            args.agent_node_id,
            'model',
            0
          );
          connections.push(`Model: ${modelNode.name} -> Agent`);
        }
      }

      // Connect tools if provided
      if (args.tool_node_ids && args.tool_node_ids.length > 0) {
        for (const toolNodeId of args.tool_node_ids) {
          const toolNode = findNodeById(workflow, toolNodeId);
          if (toolNode) {
            updatedWorkflow = addConnectionToWorkflow(
              updatedWorkflow,
              toolNodeId,
              'main',
              args.agent_node_id,
              'tools',
              0
            );
            connections.push(`Tool: ${toolNode.name} -> Agent`);
          }
        }
      }

      // Connect memory if provided
      if (args.memory_node_id) {
        const memoryNode = findNodeById(workflow, args.memory_node_id);
        if (memoryNode) {
          updatedWorkflow = addConnectionToWorkflow(
            updatedWorkflow,
            args.memory_node_id,
            'main',
            args.agent_node_id,
            'memory',
            0
          );
          connections.push(`Memory: ${memoryNode.name} -> Agent`);
        }
      }

      // Connect embeddings if provided
      if (args.embeddings_node_id) {
        const embeddingsNode = findNodeById(workflow, args.embeddings_node_id);
        if (embeddingsNode) {
          updatedWorkflow = addConnectionToWorkflow(
            updatedWorkflow,
            args.embeddings_node_id,
            'main',
            args.agent_node_id,
            'embeddings',
            0
          );
          connections.push(`Embeddings: ${embeddingsNode.name} -> Agent`);
        }
      }

      // Connect vector store if provided
      if (args.vector_store_node_id) {
        const vectorStoreNode = findNodeById(workflow, args.vector_store_node_id);
        if (vectorStoreNode) {
          updatedWorkflow = addConnectionToWorkflow(
            updatedWorkflow,
            args.vector_store_node_id,
            'main',
            args.agent_node_id,
            'vectorStore',
            0
          );
          connections.push(`Vector Store: ${vectorStoreNode.name} -> Agent`);
        }
      }

      // Save the updated workflow
      await workflowService.saveWorkflow(updatedWorkflow);

      return `AI connections added to agent '${agentNode.name}':\n\n${connections.join('\n')}`;
    } catch (error) {
      return `Failed to add AI connections: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
};