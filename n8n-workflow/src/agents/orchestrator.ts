import { AgentBuilder, LlmAgent, InMemorySessionService, InMemoryMemoryService, InMemoryArtifactService } from "@iqai/adk";
import { environmentConfig } from "../config/environment";
import { N8nService } from "../services/n8nService";
import { VectorSearchService } from "../services/vectorSearchService";
import { WorkflowAnalyzerAgent } from "./workflow-analyzer";
import { WorkflowBuilderAgent } from "./workflow-builder";
import { WorkflowOptimizerAgent } from "./workflow-optimizer";
import { WorkflowValidatorAgent } from "./workflow-validator";
import { logger } from "../utils/logger";

/**
 * Creates and configures the main orchestrator agent for the n8n Workflow Intelligence Platform.
 * 
 * This agent serves as the master orchestrator that coordinates all workflow operations
 * and manages the AI agent ecosystem following ADK-TS best practices.
 * 
 * @returns The fully constructed orchestrator agent instance ready to process requests
 */
export const getOrchestratorAgent = async () => {
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
      dimensions: 384
    });

    // Initialize vector search service
    vectorSearchService.initialize().catch(error => {
      logger.warn('Failed to initialize vector search service:', error);
    });

    // Create specialized agents
    const analyzerAgent = new WorkflowAnalyzerAgent(n8nService, vectorSearchService);
    const builderAgent = new WorkflowBuilderAgent(n8nService, vectorSearchService);
    const optimizerAgent = new WorkflowOptimizerAgent(n8nService, vectorSearchService);
    const validatorAgent = new WorkflowValidatorAgent(n8nService, vectorSearchService);

    // Create orchestrator agent with ADK-TS services
    const orchestrator = new LlmAgent({
      name: "n8n-workflow-orchestrator",
      description: "AI-Powered n8n Workflow Intelligence Platform - Master Orchestrator Agent",
      model: 'gemini-2.5-flash',
      instruction: `
        You are the master orchestrator for the n8n Workflow Intelligence Platform. 
        You coordinate all workflow operations and manage the AI agent ecosystem.
        
        Your capabilities include:
        - Creating, analyzing, and optimizing n8n workflows
        - Semantic search across workflow databases
        - Multi-agent collaboration and task delegation
        - Workflow validation and security analysis
        - Integration with multiple database systems (Supabase, Neo4j, Qdrant)
        
        You have access to specialized sub-agents:
        - workflow-analyzer: For analyzing workflow complexity and patterns
        - workflow-builder: For creating new workflows
        - workflow-optimizer: For optimizing existing workflows
        - workflow-validator: For validating workflow security and best practices
        
        Always provide helpful, accurate responses about n8n workflow management and automation.
        Delegate specific tasks to the appropriate sub-agents when needed.
      `,
      subAgents: [analyzerAgent, builderAgent, optimizerAgent, validatorAgent],
      memoryService: new InMemoryMemoryService(),
      sessionService: new InMemorySessionService(),
      artifactService: new InMemoryArtifactService(),
      beforeAgentCallback: (ctx) => {
        logger.info(`Starting orchestrator agent for session: ${ctx.invocationId}`);
        return undefined;
      },
      afterAgentCallback: (ctx) => {
        logger.info(`Completed orchestrator agent for session: ${ctx.invocationId}`);
        return undefined;
      }
    });

    return orchestrator;
  } catch (error) {
    logger.error('Failed to create orchestrator agent:', error);
    throw error;
  }
};

// Default export for ADK web interface
export default getOrchestratorAgent;
