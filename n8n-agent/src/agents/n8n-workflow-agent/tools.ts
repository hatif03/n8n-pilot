import { McpGeneric, type SamplingHandler } from "@iqai/adk";
import { env } from "../../env";

/**
 * Initializes and retrieves n8n MCP (Model Context Protocol) tools for workflow management.
 *
 * This function sets up the n8n MCP toolset using the generic MCP client to connect to the n8n-mcp server,
 * enabling the agent to perform n8n workflow operations like creating workflows, managing nodes,
 * and handling connections through the MCP interface.
 *
 * @param samplingHandler - Handler for processing MCP sampling requests
 * @returns Promise resolving to an array of n8n MCP tools for agent use
 */
export const getN8nWorkflowMcpTools = async (samplingHandler: SamplingHandler) => {
	const mcpToolset = McpGeneric("n8n-mcp", {
		samplingHandler,
		env: {
			N8N_API_URL: env.N8N_API_URL || "http://localhost:5678",
			N8N_API_KEY: env.N8N_API_KEY || "",
		},
	}, "n8n-workflow-tools");
	const tools = await mcpToolset.getTools();
	return tools;
};
