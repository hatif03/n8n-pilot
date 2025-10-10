import * as dotenv from "dotenv";
import { getOrchestratorAgent } from "./agents/orchestrator";
import { logger } from "./utils/logger";
import { MCPManager } from "./mcp-servers";
import { environmentConfig } from "./config/environment";

dotenv.config();

/**
 * ADK-TS Compliant Main Entry Point
 * 
 * This is the main entry point for the n8n Workflow Intelligence Platform,
 * following ADK-TS best practices and conventions.
 */
async function main() {
  try {
    logger.info("Starting n8n Workflow Intelligence Platform");

    // Validate environment configuration
    const validation = environmentConfig.validateRequiredServices();
    if (!validation.valid) {
      logger.error('Missing required environment variables:', validation.missing.join(', '));
      console.error('❌ Missing required environment variables:', validation.missing.join(', '));
      process.exit(1);
    }

    logger.info('Environment configuration validated');
    console.log('✅ Environment configuration validated');
    
    // Get service health checks
    const healthChecks = environmentConfig.getServiceHealthChecks();
    console.log('📊 Service Status:');
    Object.entries(healthChecks).forEach(([service, status]) => {
      const statusIcon = status.enabled ? '✅' : '❌';
      const requiredText = status.required ? ' (required)' : ' (optional)';
      console.log(`  ${statusIcon} ${service}${requiredText}`);
    });

    // Initialize MCP servers
    logger.info('Initializing MCP servers...');
    console.log('🔌 Initializing MCP servers...');
    const mcpManager = new MCPManager();
    const serverInfo = mcpManager.getServerInfo();
    console.log('📡 Available MCP servers:');
    serverInfo.forEach(server => {
      console.log(`  ✅ ${server.name} (${server.type})`);
    });

    // Create the orchestrator agent following ADK-TS patterns
    const orchestrator = await getOrchestratorAgent();
    
    // Create a session for the demo
    const session = await orchestrator.sessionService?.createSession(
      'n8n-workflow-demo',
      'demo-user',
      {
        'demo:started_at': new Date().toISOString(),
        'demo:version': '1.0.0'
      }
    );

    console.log('🎯 n8n Workflow Intelligence Platform is ready!');
    console.log('🔧 Available MCP tools: Workflow Builder, Vector Search, Agent2Agent, Workflow Generator, N8N2MCP Router');
    console.log('🤖 ADK-TS services: Session, Memory, Artifact management enabled');

    // Demo questions to showcase the platform
    const questions = [
      "Create a workflow that fetches data from an API every hour and sends it to a Slack channel",
      "Analyze the complexity of my existing workflows",
      "Find workflows similar to 'data processing'",
      "Optimize my workflow for better performance"
    ];

    // Process each question through the orchestrator
    for (const question of questions) {
      logger.info(`📝 Question: ${question}`);
      console.log(`\n📝 Question: ${question}`);
      
      try {
        // Use the agent's ask method for simple queries
        const response = await orchestrator.ask(question);
        logger.info(`🤖 Response: ${response}`);
        console.log(`🤖 Response: ${response}\n`);
      } catch (error) {
        logger.error(`Failed to process question: ${question}`, error);
        console.error(`❌ Error processing question: ${error}\n`);
      }
    }

    logger.info("n8n Workflow Intelligence Platform demo completed");
    console.log('✅ Demo completed successfully!');
    
  } catch (error) {
    logger.error("Failed to run main function:", error);
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

// Run the main function
main().catch(console.error);