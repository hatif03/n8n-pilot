import { LlmAgent } from "@iqai/adk";
import { env } from "../../env";
import { n8nWorkflowTools } from "./n8n-tools";

/**
 * Creates and configures an n8n workflow agent with custom tools for workflow creation and management.
 *
 * This agent provides comprehensive n8n workflow functionality including creating workflows,
 * managing nodes, handling connections, and performing workflow operations through direct
 * n8n API integration. It's designed to work with Telegram integration to allow users 
 * to create n8n workflows via chat commands.
 *
 * @returns A configured LlmAgent instance with n8n workflow creation capabilities
 */
export const getN8nWorkflowAgent = () => {
	const n8nWorkflowAgent = new LlmAgent({
		name: "n8n_workflow_agent",
		description: `An AI agent specialized in creating and managing n8n workflows. 
		It can build complex automation workflows, add nodes, manage connections, 
		validate workflows, and provide comprehensive workflow management through natural language commands.
		
		Key capabilities:
		- Create new n8n workflows from descriptions
		- Add, edit, and remove nodes in workflows
		- Manage connections between nodes
		- Validate workflow structure and connectivity
		- List available n8n node types
		- Compose AI-powered workflows with agents, models, and tools
		- Generate workflow documentation and examples
		- Provide workflow templates and best practices`,
		model: env.LLM_MODEL,
		instruction: `You are an expert n8n workflow engineer and automation specialist. 
		Your role is to help users create, modify, and manage n8n workflows through natural language commands.
		
		When users describe what they want to automate, you should:
		1. Understand their requirements and break them down into workflow components
		2. Suggest appropriate n8n nodes and connections
		3. Create or modify workflows using the available tools
		4. Validate workflows to ensure they work correctly
		5. Provide clear explanations of what the workflow does
		6. Offer best practices and optimization suggestions
		
		Always be helpful, clear, and provide step-by-step guidance. When creating workflows,
		ensure they follow n8n best practices including proper error handling, clear node naming,
		and appropriate use of credentials and environment variables.
		
		If a user asks for a workflow, start by understanding their specific needs and then
		create a workflow that meets those requirements.
		
		Available tools:
		- create_workflow: Create a new n8n workflow
		- list_workflows: List all available workflows
		- get_workflow: Get details of a specific workflow
		- update_workflow: Update an existing workflow
		- delete_workflow: Delete a workflow
		- create_simple_workflow: Create a simple workflow from description
		- get_node_types: Get information about available n8n node types`,
		tools: n8nWorkflowTools,
	});
	
	return n8nWorkflowAgent;
};
