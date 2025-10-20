import { createSamplingHandler } from "@iqai/adk";
import * as dotenv from "dotenv";
import { getRootAgent } from "./agents/agent";
import { getTelegramAgent } from "./agents/telegram-agent/agent";

dotenv.config();

/**
 * Telegram Bot with AI Agent
 *
 * A Telegram bot powered by ADK that can engage with users in servers and direct messages.
 * Customize the persona and instructions below to create your own unique bot.
 */

async function main() {
	console.log("🤖 Initializing Telegram bot agent with n8n workflow capabilities...");

	try {
		// Create a temporary sampling handler for initialization
		const tempSamplingHandler = createSamplingHandler(async () => "Initializing...");

		// Initialize Telegram toolset first
		await getTelegramAgent(tempSamplingHandler);

		// Now create the root agent with the proper sampling handler
		const { runner } = await getRootAgent(tempSamplingHandler);

		// Create the final sampling handler for the Telegram MCP
		const samplingHandler = createSamplingHandler(runner.ask);

		// Re-initialize Telegram toolset with the proper sampling handler
		await getTelegramAgent(samplingHandler);

		console.log("✅ Telegram bot agent with n8n workflow capabilities initialized successfully!");
		console.log("🚀 Bot is now running and ready to receive messages...");
		console.log("📋 Available commands:");
		console.log("   - Tell me a joke");
		console.log("   - What's the weather in [city]?");
		console.log("   - Create a workflow that [description]");
		console.log("   - List available n8n nodes");
		console.log("   - Help with n8n workflow creation");

		// Keep the process running
		await keepAlive();
	} catch (error) {
		console.error("❌ Failed to initialize Telegram bot:", error);
		process.exit(1);
	}
}

/**
 * Keep the process alive
 */
async function keepAlive() {
	// Keep the process running
	process.on("SIGINT", () => {
		console.log("\n👋 Shutting down Telegram bot gracefully...");
		process.exit(0);
	});

	// Prevent the process from exiting
	setInterval(() => {
		// This keeps the event loop active
	}, 1000);
}

main().catch(console.error);
