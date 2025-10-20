import { FunctionTool } from "@iqai/adk";
import { z } from "zod";
import axios from "axios";

// n8n API configuration
const N8N_API_URL = process.env.N8N_API_URL || "http://localhost:5678";
const N8N_API_KEY = process.env.N8N_API_KEY || "";

/**
 * Create a new n8n workflow
 */
export const createWorkflowTool = new FunctionTool({
	name: "create_workflow",
	description: "Create a new n8n workflow with the specified name and configuration",
	parameters: z.object({
		name: z.string().describe("Name of the workflow"),
		description: z.string().optional().describe("Description of the workflow"),
		active: z.boolean().optional().default(false).describe("Whether the workflow should be active"),
		nodes: z.array(z.any()).optional().describe("Array of nodes for the workflow"),
		connections: z.record(z.any()).optional().describe("Connections between nodes"),
	}),
	func: async ({ name, description, active, nodes, connections }) => {
		try {
			const workflowData = {
				name,
				description: description || `Workflow created via AI agent: ${name}`,
				active: active || false,
				nodes: nodes || [],
				connections: connections || {},
				settings: {},
				staticData: {},
				pinData: {},
			};

			const response = await axios.post(
				`${N8N_API_URL}/api/v1/workflows`,
				workflowData,
				{
					headers: {
						"X-N8N-API-KEY": N8N_API_KEY,
						"Content-Type": "application/json",
					},
				}
			);

			return {
				success: true,
				workflowId: response.data.id,
				message: `Workflow '${name}' created successfully with ID: ${response.data.id}`,
				workflow: response.data,
			};
		} catch (error: any) {
			return {
				success: false,
				error: error.response?.data?.message || error.message,
				message: `Failed to create workflow '${name}': ${error.response?.data?.message || error.message}`,
			};
		}
	},
});

/**
 * List all workflows
 */
export const listWorkflowsTool = new FunctionTool({
	name: "list_workflows",
	description: "List all available n8n workflows",
	parameters: z.object({
		limit: z.number().optional().default(50).describe("Maximum number of workflows to return"),
	}),
	func: async ({ limit }) => {
		try {
			const response = await axios.get(`${N8N_API_URL}/api/v1/workflows`, {
				headers: {
					"X-N8N-API-KEY": N8N_API_KEY,
				},
				params: {
					limit,
				},
			});

			const workflows = response.data.data || response.data;
			return {
				success: true,
				workflows: workflows.map((wf: any) => ({
					id: wf.id,
					name: wf.name,
					active: wf.active,
					createdAt: wf.createdAt,
					updatedAt: wf.updatedAt,
					nodeCount: wf.nodes?.length || 0,
				})),
				message: `Found ${workflows.length} workflows`,
			};
		} catch (error: any) {
			return {
				success: false,
				error: error.response?.data?.message || error.message,
				message: `Failed to list workflows: ${error.response?.data?.message || error.message}`,
			};
		}
	},
});

/**
 * Get workflow details
 */
export const getWorkflowTool = new FunctionTool({
	name: "get_workflow",
	description: "Get detailed information about a specific workflow",
	parameters: z.object({
		workflowId: z.string().describe("ID of the workflow to retrieve"),
	}),
	func: async ({ workflowId }) => {
		try {
			const response = await axios.get(`${N8N_API_URL}/api/v1/workflows/${workflowId}`, {
				headers: {
					"X-N8N-API-KEY": N8N_API_KEY,
				},
			});

			const workflow = response.data;
			return {
				success: true,
				workflow: {
					id: workflow.id,
					name: workflow.name,
					description: workflow.description,
					active: workflow.active,
					nodes: workflow.nodes,
					connections: workflow.connections,
					settings: workflow.settings,
					createdAt: workflow.createdAt,
					updatedAt: workflow.updatedAt,
				},
				message: `Retrieved workflow '${workflow.name}' successfully`,
			};
		} catch (error: any) {
			return {
				success: false,
				error: error.response?.data?.message || error.message,
				message: `Failed to get workflow: ${error.response?.data?.message || error.message}`,
			};
		}
	},
});

/**
 * Update a workflow
 */
export const updateWorkflowTool = new FunctionTool({
	name: "update_workflow",
	description: "Update an existing n8n workflow",
	parameters: z.object({
		workflowId: z.string().describe("ID of the workflow to update"),
		name: z.string().optional().describe("New name for the workflow"),
		description: z.string().optional().describe("New description for the workflow"),
		active: z.boolean().optional().describe("Whether the workflow should be active"),
		nodes: z.array(z.any()).optional().describe("Array of nodes for the workflow"),
		connections: z.record(z.any()).optional().describe("Connections between nodes"),
	}),
	func: async ({ workflowId, name, description, active, nodes, connections }) => {
		try {
			// First get the current workflow
			const currentResponse = await axios.get(`${N8N_API_URL}/api/v1/workflows/${workflowId}`, {
				headers: {
					"X-N8N-API-KEY": N8N_API_KEY,
				},
			});

			const currentWorkflow = currentResponse.data;
			const updatedWorkflow = {
				...currentWorkflow,
				...(name && { name }),
				...(description !== undefined && { description }),
				...(active !== undefined && { active }),
				...(nodes && { nodes }),
				...(connections && { connections }),
			};

			const response = await axios.put(
				`${N8N_API_URL}/api/v1/workflows/${workflowId}`,
				updatedWorkflow,
				{
					headers: {
						"X-N8N-API-KEY": N8N_API_KEY,
						"Content-Type": "application/json",
					},
				}
			);

			return {
				success: true,
				workflow: response.data,
				message: `Workflow '${response.data.name}' updated successfully`,
			};
		} catch (error: any) {
			return {
				success: false,
				error: error.response?.data?.message || error.message,
				message: `Failed to update workflow: ${error.response?.data?.message || error.message}`,
			};
		}
	},
});

/**
 * Delete a workflow
 */
export const deleteWorkflowTool = new FunctionTool({
	name: "delete_workflow",
	description: "Delete a workflow",
	parameters: z.object({
		workflowId: z.string().describe("ID of the workflow to delete"),
	}),
	func: async ({ workflowId }) => {
		try {
			await axios.delete(`${N8N_API_URL}/api/v1/workflows/${workflowId}`, {
				headers: {
					"X-N8N-API-KEY": N8N_API_KEY,
				},
			});

			return {
				success: true,
				message: `Workflow with ID ${workflowId} deleted successfully`,
			};
		} catch (error: any) {
			return {
				success: false,
				error: error.response?.data?.message || error.message,
				message: `Failed to delete workflow: ${error.response?.data?.message || error.message}`,
			};
		}
	},
});

/**
 * Create a simple workflow from description
 */
export const createSimpleWorkflowTool = new FunctionTool({
	name: "create_simple_workflow",
	description: "Create a simple n8n workflow from a natural language description",
	parameters: z.object({
		name: z.string().describe("Name of the workflow"),
		description: z.string().describe("Natural language description of what the workflow should do"),
		triggerType: z.string().optional().describe("Type of trigger (webhook, schedule, manual, etc.)"),
	}),
	func: async ({ name, description, triggerType = "manual" }) => {
		try {
			// Create a basic workflow structure based on the description
			const nodes = [];
			const connections = {};

			// Add trigger node based on type
			let triggerNode;
			switch (triggerType.toLowerCase()) {
				case "webhook":
					triggerNode = {
						id: "trigger-webhook",
						name: "Webhook Trigger",
						type: "n8n-nodes-base.webhook",
						typeVersion: 1,
						position: [100, 100],
						parameters: {
							httpMethod: "POST",
							path: name.toLowerCase().replace(/\s+/g, "-"),
							responseMode: "responseNode",
						},
					};
					break;
				case "schedule":
					triggerNode = {
						id: "trigger-schedule",
						name: "Schedule Trigger",
						type: "n8n-nodes-base.scheduleTrigger",
						typeVersion: 1,
						position: [100, 100],
						parameters: {
							rule: {
								interval: [{ field: "cronExpression", expression: "0 0 * * *" }],
							},
						},
					};
					break;
				default:
					triggerNode = {
						id: "trigger-manual",
						name: "Manual Trigger",
						type: "n8n-nodes-base.manualTrigger",
						typeVersion: 1,
						position: [100, 100],
						parameters: {},
					};
			}

			nodes.push(triggerNode);

			// Add a basic HTTP Request node for most workflows
			const httpNode = {
				id: "http-request",
				name: "HTTP Request",
				type: "n8n-nodes-base.httpRequest",
				typeVersion: 4.1,
				position: [300, 100],
				parameters: {
					method: "GET",
					url: "https://api.example.com/data",
					options: {},
				},
			};
			nodes.push(httpNode);

			// Add a response node if it's a webhook
			if (triggerType.toLowerCase() === "webhook") {
				const responseNode = {
					id: "respond-to-webhook",
					name: "Respond to Webhook",
					type: "n8n-nodes-base.respondToWebhook",
					typeVersion: 1,
					position: [500, 100],
					parameters: {
						respondWith: "json",
						responseBody: "={{ $json }}",
					},
				};
				nodes.push(responseNode);

				// Connect nodes
				connections["trigger-webhook"] = {
					main: [
						[
							{
								node: "http-request",
								type: "main",
								index: 0,
							},
						],
					],
				};
				connections["http-request"] = {
					main: [
						[
							{
								node: "respond-to-webhook",
								type: "main",
								index: 0,
							},
						],
					],
				};
			} else {
				// For non-webhook triggers, just connect trigger to HTTP request
				connections["trigger-manual"] = {
					main: [
						[
							{
								node: "http-request",
								type: "main",
								index: 0,
							},
						],
					],
				};
			}

			const workflowData = {
				name,
				description: `AI-generated workflow: ${description}`,
				active: false,
				nodes,
				connections,
				settings: {},
				staticData: {},
				pinData: {},
			};

			const response = await axios.post(
				`${N8N_API_URL}/api/v1/workflows`,
				workflowData,
				{
					headers: {
						"X-N8N-API-KEY": N8N_API_KEY,
						"Content-Type": "application/json",
					},
				}
			);

			return {
				success: true,
				workflowId: response.data.id,
				message: `Simple workflow '${name}' created successfully with ID: ${response.data.id}`,
				workflow: response.data,
				nodes: nodes.map((node) => ({ id: node.id, name: node.name, type: node.type })),
			};
		} catch (error: any) {
			return {
				success: false,
				error: error.response?.data?.message || error.message,
				message: `Failed to create simple workflow: ${error.response?.data?.message || error.message}`,
			};
		}
	},
});

/**
 * Get n8n node types and information
 */
export const getNodeTypesTool = new FunctionTool({
	name: "get_node_types",
	description: "Get information about available n8n node types",
	parameters: z.object({
		category: z.string().optional().describe("Filter by node category"),
		search: z.string().optional().describe("Search term for node types"),
	}),
	func: async ({ category, search }) => {
		try {
			// This is a simplified implementation - in a real scenario, you'd query the n8n API
			// or use the n8n-mcp server for more comprehensive node information
			const commonNodes = [
				{
					name: "Webhook",
					type: "n8n-nodes-base.webhook",
					description: "Trigger workflow via HTTP webhook",
					category: "trigger",
				},
				{
					name: "Schedule Trigger",
					type: "n8n-nodes-base.scheduleTrigger",
					description: "Trigger workflow on a schedule",
					category: "trigger",
				},
				{
					name: "Manual Trigger",
					type: "n8n-nodes-base.manualTrigger",
					description: "Manual trigger for testing",
					category: "trigger",
				},
				{
					name: "HTTP Request",
					type: "n8n-nodes-base.httpRequest",
					description: "Make HTTP requests to APIs",
					category: "action",
				},
				{
					name: "Set",
					type: "n8n-nodes-base.set",
					description: "Set data values",
					category: "transform",
				},
				{
					name: "Code",
					type: "n8n-nodes-base.code",
					description: "Execute JavaScript code",
					category: "transform",
				},
				{
					name: "IF",
					type: "n8n-nodes-base.if",
					description: "Conditional logic",
					category: "transform",
				},
				{
					name: "Respond to Webhook",
					type: "n8n-nodes-base.respondToWebhook",
					description: "Send response back to webhook",
					category: "action",
				},
			];

			let filteredNodes = commonNodes;

			if (category) {
				filteredNodes = filteredNodes.filter((node) =>
					node.category.toLowerCase().includes(category.toLowerCase())
				);
			}

			if (search) {
				filteredNodes = filteredNodes.filter(
					(node) =>
						node.name.toLowerCase().includes(search.toLowerCase()) ||
						node.description.toLowerCase().includes(search.toLowerCase())
				);
			}

			return {
				success: true,
				nodes: filteredNodes,
				message: `Found ${filteredNodes.length} node types`,
			};
		} catch (error: any) {
			return {
				success: false,
				error: error.message,
				message: `Failed to get node types: ${error.message}`,
			};
		}
	},
});

// Export all tools
export const n8nWorkflowTools = [
	createWorkflowTool,
	listWorkflowsTool,
	getWorkflowTool,
	updateWorkflowTool,
	deleteWorkflowTool,
	createSimpleWorkflowTool,
	getNodeTypesTool,
];
