#!/usr/bin/env node
import { FastMCP } from "fastmcp";
import { z } from "zod";
import { logger } from "./utils/logger.js";
import { isN8nApiConfigured } from "./config/n8n-api.js";
// Import workflow tools
import { createWorkflowTool, listWorkflowsTool, getWorkflowDetailsTool, deleteWorkflowTool, validateWorkflowTool, } from "./tools/workflow-tools.js";
// Import node tools
import { addNodeTool, editNodeTool, deleteNodeTool, listAvailableNodesTool, getN8nVersionInfoTool, } from "./tools/node-tools.js";
// Import connection tools
import { addConnectionTool, removeConnectionTool, addAiConnectionsTool, } from "./tools/connection-tools.js";
// Import AI workflow tools
import { composeAiWorkflowTool, } from "./tools/ai-workflow-tools.js";
// Import template tools
import { templateTools, } from "./tools/template-tools.js";
// Import advanced services tools
import { getNodeExamplesTool, searchNodeExamplesTool, validateNodeConfigurationTool, scoreResourceLocatorTool, scoreNodeTypeSuggestionTool, scoreWorkflowValidationTool, analyzePropertyDependenciesTool, getPropertyGroupsTool, validatePropertyConfigurationTool, } from "./tools/advanced-services-tools.js";
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
    // Add template management tools
    templateTools.forEach(tool => server.addTool(tool));
    // Add advanced services tools
    server.addTool(getNodeExamplesTool);
    server.addTool(searchNodeExamplesTool);
    server.addTool(validateNodeConfigurationTool);
    server.addTool(scoreResourceLocatorTool);
    server.addTool(scoreNodeTypeSuggestionTool);
    server.addTool(scoreWorkflowValidationTool);
    server.addTool(analyzePropertyDependenciesTool);
    server.addTool(getPropertyGroupsTool);
    server.addTool(validatePropertyConfigurationTool);
    // Add system information tool
    server.addTool({
        name: "get_system_info",
        description: "Get system information and configuration status",
        parameters: z.object({}),
        execute: async () => {
            const n8nConfigured = isN8nApiConfigured();
            return `n8n MCP Server v0.1.0

System Status:
- n8n API Integration: ${n8nConfigured ? '✅ Configured' : '❌ Not configured'}
- Available Tools: 29
- Workflow Tools: 5
- Node Tools: 5
- Connection Tools: 3
- AI Workflow Tools: 1
- Template Tools: 6
- Advanced Services Tools: 9
- System Tools: 2

${!n8nConfigured ? `
To enable full n8n integration, set these environment variables:
- N8N_API_URL: Your n8n instance URL
- N8N_API_KEY: Your n8n API key

Without these, only documentation and validation tools are available.
` : ''}

For help with specific tools, use the get_tool_documentation tool.`;
        },
    });
    // Add tool documentation tool
    server.addTool({
        name: "get_tool_documentation",
        description: "Get detailed documentation for a specific tool",
        parameters: z.object({
            tool_name: z.string().describe("Name of the tool to get documentation for")
        }),
        execute: async (args) => {
            const allTools = [
                createWorkflowTool, listWorkflowsTool, getWorkflowDetailsTool, deleteWorkflowTool, validateWorkflowTool,
                addNodeTool, editNodeTool, deleteNodeTool, listAvailableNodesTool, getN8nVersionInfoTool,
                addConnectionTool, removeConnectionTool, addAiConnectionsTool, composeAiWorkflowTool,
                ...templateTools,
                getNodeExamplesTool, searchNodeExamplesTool, validateNodeConfigurationTool,
                scoreResourceLocatorTool, scoreNodeTypeSuggestionTool, scoreWorkflowValidationTool,
                analyzePropertyDependenciesTool, getPropertyGroupsTool, validatePropertyConfigurationTool
            ];
            const tool = allTools.find(t => t.name === args.tool_name);
            if (!tool) {
                return `Tool '${args.tool_name}' not found. Available tools: ${allTools.map(t => t.name).join(', ')}`;
            }
            return `Tool: ${tool.name}
Description: ${tool.description}
Parameters: ${JSON.stringify(tool.parameters, null, 2)}`;
        },
    });
    // Log startup information
    logger.info("Starting n8n MCP Server...");
    logger.info(`n8n API Integration: ${isN8nApiConfigured() ? 'Enabled' : 'Disabled'}`);
    logger.info(`Total tools loaded: 29`);
    try {
        await server.start({
            transportType: "stdio",
        });
        logger.info("✅ n8n MCP Server started successfully over stdio.");
        logger.info("   You can now connect to it using an MCP client.");
        logger.info("   Available tools: workflow management, node operations, and AI workflow composition!");
    }
    catch (error) {
        logger.error("❌ Failed to start n8n MCP Server:", error);
        process.exit(1);
    }
}
main().catch((error) => {
    console.error("❌ An unexpected error occurred in the n8n MCP Server:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map