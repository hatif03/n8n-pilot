import { z } from 'zod';
import { WorkflowService } from '../services/workflow-service.js';
import { NodeDiscoveryService } from '../services/node-discovery-service.js';
import { createWorkflowNode, addNodeToWorkflow, removeNodeFromWorkflow, updateNodeInWorkflow, findNodeById } from '../lib/workflow-utils.js';
const workflowService = new WorkflowService();
const nodeDiscoveryService = new NodeDiscoveryService();
/**
 * Add a node to a workflow tool
 */
export const addNodeTool = {
    name: 'add_node',
    description: 'Add a new node to a workflow',
    parameters: z.object({
        workflow_name: z.string().describe('Name of the workflow'),
        node_type: z.string().describe('Type of the node to add'),
        position: z.tuple([z.number(), z.number()]).optional().describe('Position of the node [x, y]'),
        parameters: z.record(z.string(), z.any()).optional().describe('Node parameters'),
        node_name: z.string().optional().describe('Custom name for the node'),
        typeVersion: z.number().optional().describe('Type version of the node'),
        webhookId: z.string().optional().describe('Webhook ID for webhook nodes'),
        workflow_path: z.string().optional().describe('Path to the workflow file'),
        connect_from: z.string().optional().describe('Node ID to connect from'),
        connect_to: z.string().optional().describe('Node ID to connect to'),
    }),
    execute: async (args) => {
        try {
            // Load the workflow
            const workflow = await workflowService.loadWorkflow(args.workflow_name);
            if (!workflow) {
                return `Error: Workflow '${args.workflow_name}' not found`;
            }
            // Get node definition to validate the node type
            const nodeDef = await nodeDiscoveryService.getNodeDefinition(args.node_type);
            if (!nodeDef) {
                return `Error: Node type '${args.node_type}' not found or not supported`;
            }
            // Create the node
            const node = createWorkflowNode(args.node_type, args.node_name || nodeDef.displayName, args.position || [100, 100], args.parameters || {}, args.typeVersion || nodeDef.version);
            // Add webhook ID if provided
            if (args.webhookId) {
                node.webhookId = args.webhookId;
            }
            // Add the node to the workflow
            const updatedWorkflow = addNodeToWorkflow(workflow, node);
            // Save the updated workflow
            await workflowService.saveWorkflow(updatedWorkflow);
            return `Node '${node.name}' (${args.node_type}) added to workflow '${args.workflow_name}'\n\nNode ID: ${node.id}\nPosition: [${node.position[0]}, ${node.position[1]}]\nType Version: ${node.typeVersion}`;
        }
        catch (error) {
            return `Failed to add node: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    },
};
/**
 * Edit a node in a workflow tool
 */
export const editNodeTool = {
    name: 'edit_node',
    description: 'Edit an existing node in a workflow',
    parameters: z.object({
        workflow_name: z.string().describe('Name of the workflow'),
        node_id: z.string().describe('ID of the node to edit'),
        node_type: z.string().optional().describe('New type of the node'),
        node_name: z.string().optional().describe('New name for the node'),
        position: z.tuple([z.number(), z.number()]).optional().describe('New position of the node [x, y]'),
        parameters: z.record(z.string(), z.any()).optional().describe('New node parameters'),
        typeVersion: z.number().optional().describe('New type version of the node'),
        webhookId: z.string().optional().describe('New webhook ID for webhook nodes'),
        workflow_path: z.string().optional().describe('Path to the workflow file'),
        connect_from: z.string().optional().describe('Node ID to connect from'),
        connect_to: z.string().optional().describe('Node ID to connect to'),
    }),
    execute: async (args) => {
        try {
            // Load the workflow
            const workflow = await workflowService.loadWorkflow(args.workflow_name);
            if (!workflow) {
                return `Error: Workflow '${args.workflow_name}' not found`;
            }
            // Find the node
            const existingNode = findNodeById(workflow, args.node_id);
            if (!existingNode) {
                return `Error: Node with ID '${args.node_id}' not found in workflow`;
            }
            // Validate node type if changing
            if (args.node_type && args.node_type !== existingNode.type) {
                const nodeDef = await nodeDiscoveryService.getNodeDefinition(args.node_type);
                if (!nodeDef) {
                    return `Error: Node type '${args.node_type}' not found or not supported`;
                }
            }
            // Prepare updates
            const updates = {};
            if (args.node_name !== undefined)
                updates.name = args.node_name;
            if (args.position !== undefined)
                updates.position = args.position;
            if (args.parameters !== undefined)
                updates.parameters = args.parameters;
            if (args.typeVersion !== undefined)
                updates.typeVersion = args.typeVersion;
            if (args.webhookId !== undefined)
                updates.webhookId = args.webhookId;
            if (args.node_type !== undefined)
                updates.type = args.node_type;
            // Update the node
            const updatedWorkflow = updateNodeInWorkflow(workflow, args.node_id, updates);
            // Save the updated workflow
            await workflowService.saveWorkflow(updatedWorkflow);
            const updatedNode = findNodeById(updatedWorkflow, args.node_id);
            return `Node '${args.node_id}' updated in workflow '${args.workflow_name}'\n\nUpdated Node:\nName: ${updatedNode?.name}\nType: ${updatedNode?.type}\nPosition: [${updatedNode?.position[0]}, ${updatedNode?.position[1]}]`;
        }
        catch (error) {
            return `Failed to edit node: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    },
};
/**
 * Delete a node from a workflow tool
 */
export const deleteNodeTool = {
    name: 'delete_node',
    description: 'Delete a node from a workflow',
    parameters: z.object({
        workflow_name: z.string().describe('Name of the workflow'),
        node_id: z.string().describe('ID of the node to delete'),
        workflow_path: z.string().optional().describe('Path to the workflow file'),
    }),
    execute: async (args) => {
        try {
            // Load the workflow
            const workflow = await workflowService.loadWorkflow(args.workflow_name);
            if (!workflow) {
                return `Error: Workflow '${args.workflow_name}' not found`;
            }
            // Find the node
            const existingNode = findNodeById(workflow, args.node_id);
            if (!existingNode) {
                return `Error: Node with ID '${args.node_id}' not found in workflow`;
            }
            // Remove the node
            const updatedWorkflow = removeNodeFromWorkflow(workflow, args.node_id);
            // Save the updated workflow
            await workflowService.saveWorkflow(updatedWorkflow);
            return `Node '${args.node_id}' (${existingNode.name}) deleted from workflow '${args.workflow_name}'`;
        }
        catch (error) {
            return `Failed to delete node: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    },
};
/**
 * List available nodes tool
 */
export const listAvailableNodesTool = {
    name: 'list_available_nodes',
    description: 'List available n8n node types with optional filtering',
    parameters: z.object({
        search_term: z.string().optional().describe('Search term to filter nodes'),
        n8n_version: z.string().optional().describe('n8n version to use for node definitions'),
        limit: z.number().optional().default(50).describe('Maximum number of nodes to return'),
        cursor: z.string().optional().describe('Pagination cursor'),
        tags: z.boolean().optional().default(true).describe('Include tags in search'),
        token_logic: z.enum(['or', 'and']).optional().default('or').describe('Logic for combining search tokens'),
    }),
    execute: async (args) => {
        try {
            const result = await nodeDiscoveryService.searchNodes({
                search_term: args.search_term,
                n8n_version: args.n8n_version,
                limit: args.limit,
                cursor: args.cursor,
                tags: args.tags,
                token_logic: args.token_logic,
            });
            const nodeList = result.nodes.map((node, index) => `${index + 1}. ${node.displayName} (${node.name})\n   Description: ${node.description}\n   Version: ${node.version}\n   Categories: ${node.codex?.categories?.join(', ') || 'None'}`).join('\n\n');
            return `Found ${result.total} nodes:\n\n${nodeList}\n\nTotal: ${result.total}\nHas More: ${result.hasMore}\nNext Cursor: ${result.nextCursor || 'None'}`;
        }
        catch (error) {
            return `Failed to list nodes: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    },
};
/**
 * Get n8n version info tool
 */
export const getN8nVersionInfoTool = {
    name: 'get_n8n_version_info',
    description: 'Get current n8n version and capabilities',
    parameters: z.object({
        random_string: z.string().optional().describe('Random string parameter'),
    }),
    execute: async (args) => {
        try {
            const availableVersions = await nodeDiscoveryService.getAvailableVersions();
            const categories = await nodeDiscoveryService.getNodeCategories();
            return `n8n Version Information:\n\n` +
                `Available Versions: ${availableVersions.length}\n` +
                `Latest Version: ${availableVersions[0] || 'None'}\n` +
                `All Versions: ${availableVersions.join(', ')}\n\n` +
                `Categories (${categories.categories.length}):\n${categories.categories.map(cat => `- ${cat}`).join('\n')}\n\n` +
                `Subcategories:\n${Object.entries(categories.subcategories).map(([cat, subs]) => `${cat}: ${subs.join(', ')}`).join('\n')}`;
        }
        catch (error) {
            return `Failed to get n8n version info: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    },
};
//# sourceMappingURL=node-tools.js.map