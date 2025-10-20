#!/usr/bin/env node
import { FastMCP } from "fastmcp";

// Import workflow tools
import {
  createWorkflowTool,
  listWorkflowsTool,
  getWorkflowDetailsTool,
  deleteWorkflowTool,
  validateWorkflowTool,
} from "./tools/workflow-tools.js";

// Import node tools
import {
  addNodeTool,
  editNodeTool,
  deleteNodeTool,
  listAvailableNodesTool,
  getN8nVersionInfoTool,
} from "./tools/node-tools.js";

// Import connection tools
import {
  addConnectionTool,
  removeConnectionTool,
  addAiConnectionsTool,
} from "./tools/connection-tools.js";

// Import AI workflow tools
import {
  composeAiWorkflowTool,
} from "./tools/ai-workflow-tools.js";

/**
 * Initializes and starts the n8n MCP (Model Context Protocol) Server.
 *
 * This function sets up a FastMCP server that provides n8n workflow management tools
 * through the MCP protocol. The server communicates via stdio transport,
 * making it suitable for integration with MCP clients and AI agents.
 */
async function main() {
	console.log("Initializing n8n MCP Server...");

	const server = new FastMCP({
		name: "n8n MCP Server",
		version: "0.1.0",
		instructions: `This MCP server provides tools for building and managing n8n workflows.

Key Features:
- Create, edit, and delete n8n workflows
- Add, edit, and remove nodes in workflows
- Manage connections between nodes
- Discover available n8n node types
- Compose complex AI workflows with agents, models, memory, and tools
- Validate workflow structure and connectivity

The server supports n8n workflow JSON format and provides AI-friendly interfaces
for building automation workflows programmatically.`,
	});

	// Add workflow management tools
	server.addTool(createWorkflowTool);
	server.addTool(listWorkflowsTool);
	server.addTool(getWorkflowDetailsTool);
	server.addTool(deleteWorkflowTool);
	server.addTool(validateWorkflowTool);

	// Add node management tools
	server.addTool(addNodeTool);
	server.addTool(editNodeTool);
	server.addTool(deleteNodeTool);
	server.addTool(listAvailableNodesTool);
	server.addTool(getN8nVersionInfoTool);

	// Add connection management tools
	server.addTool(addConnectionTool);
	server.addTool(removeConnectionTool);
	server.addTool(addAiConnectionsTool);

	// Add AI workflow tools
	server.addTool(composeAiWorkflowTool);

	try {
		await server.start({
			transportType: "stdio",
		});
		console.log("✅ n8n MCP Server started successfully over stdio.");
		console.log("   You can now connect to it using an MCP client.");
		console.log("   Available tools: workflow management, node operations, and AI workflow composition!");
	} catch (error) {
		console.error("❌ Failed to start n8n MCP Server:", error);
		process.exit(1);
	}
}

main().catch((error) => {
	console.error(
		"❌ An unexpected error occurred in the n8n MCP Server:",
		error,
	);
	process.exit(1);
});
