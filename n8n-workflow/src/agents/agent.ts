import { AgentBuilder } from "@iqai/adk";
import { environmentConfig } from "../config/environment";
import { N8nService } from "../services/n8nService";
import { VectorSearchService } from "../services/vectorSearchService";
import { WorkflowOrchestratorAgent } from "./workflowOrchestrator";
import { logger } from "../utils/logger";

/**
 * Creates and configures the main agent for the n8n Workflow Intelligence Platform.
 *
 * This agent serves as the master orchestrator that coordinates all workflow operations
 * and manages the AI agent ecosystem. It demonstrates the ADK pattern of using a root
 * agent to coordinate multiple specialized agents for different workflow domains.
 *
 * @returns The fully constructed root agent instance ready to process requests
 */
export const getRootAgent = () => {
  try {
    // Initialize services
    const n8nConfig = environmentConfig.getN8nConfig();
    const n8nService = new N8nService([{
      name: 'default',
      host: n8nConfig.host,
      apiKey: n8nConfig.apiKey,
      enabled: true
    }]);

    const qdrantConfig = environmentConfig.getQdrantConfig();
    const vectorSearchService = new VectorSearchService({
      url: qdrantConfig.url,
      apiKey: qdrantConfig.apiKey,
      collectionName: 'n8n-workflows',
      dimensions: 384 // Default embedding dimension
    });

    // Initialize vector search service
    vectorSearchService.initialize().catch(error => {
      logger.warn('Failed to initialize vector search service:', error);
    });

    // Create orchestrator agent
    const orchestrator = new WorkflowOrchestratorAgent(n8nService, vectorSearchService);

    return AgentBuilder.create("n8n-workflow-orchestrator")
      .withDescription("AI-Powered n8n Workflow Intelligence Platform - Master Orchestrator Agent")
      .withInstruction(`
        You are the master orchestrator for the n8n Workflow Intelligence Platform. 
        You coordinate all workflow operations and manage the AI agent ecosystem.
        
        Your capabilities include:
        - Creating, analyzing, and optimizing n8n workflows
        - Semantic search across workflow databases
        - Multi-agent collaboration and task delegation
        - Workflow validation and security analysis
        - Integration with multiple database systems (Supabase, Neo4j, Qdrant)
        
        Always provide helpful, accurate responses about n8n workflow management and automation.
      `)
      .withModel('gemini-2.5-flash')
      .withTools(...orchestrator.getTools())
      .build();
  } catch (error) {
    logger.error('Failed to create root agent:', error);
    throw error;
  }
};

// Default export for ADK web interface
export default getRootAgent;