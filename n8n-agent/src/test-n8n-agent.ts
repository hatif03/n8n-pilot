import { getN8nWorkflowAgent } from "./agents/n8n-workflow-agent/agent";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Test script for the n8n workflow agent
 * This script demonstrates how to use the agent programmatically
 */
async function testN8nWorkflowAgent() {
	console.log("🧪 Testing n8n Workflow Agent...");

	try {
		// Create the n8n workflow agent
		const { agent, runner } = getN8nWorkflowAgent();

		console.log("✅ n8n Workflow Agent created successfully");
		console.log(`Agent name: ${agent.name}`);
		console.log(`Agent description: ${agent.description}`);

		// Test basic functionality
		console.log("\n📋 Testing basic functionality...");

		// Test 1: List workflows
		console.log("\n1. Testing list workflows...");
		const listResponse = await runner.ask("List all my workflows");
		console.log("Response:", listResponse);

		// Test 2: Get node types
		console.log("\n2. Testing get node types...");
		const nodeTypesResponse = await runner.ask("What n8n nodes are available for HTTP requests?");
		console.log("Response:", nodeTypesResponse);

		// Test 3: Create a simple workflow
		console.log("\n3. Testing create simple workflow...");
		const createResponse = await runner.ask("Create a simple workflow called 'test-workflow' that makes an HTTP request to https://api.example.com/data");
		console.log("Response:", createResponse);

		console.log("\n✅ All tests completed successfully!");

	} catch (error) {
		console.error("❌ Test failed:", error);
	}
}

// Run the test if this file is executed directly
if (require.main === module) {
	testN8nWorkflowAgent().catch(console.error);
}

export { testN8nWorkflowAgent };
