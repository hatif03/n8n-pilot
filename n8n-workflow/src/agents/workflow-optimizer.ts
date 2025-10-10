import { LlmAgent, InMemoryMemoryService, InMemorySessionService, InMemoryArtifactService } from "@iqai/adk";
import { N8nService } from "../services/n8nService";
import { VectorSearchService } from "../services/vectorSearchService";
import { MCPToolsManager } from "../tools";
import { logger } from "../utils/logger";

/**
 * Workflow Optimizer Agent - Specialized agent for optimizing n8n workflows
 * 
 * This agent focuses on workflow optimization, performance improvement, and efficiency enhancement
 * following ADK-TS best practices.
 */
export class WorkflowOptimizerAgent extends LlmAgent {
  constructor(
    private n8nService: N8nService,
    private vectorSearchService: VectorSearchService
  ) {
    const toolsManager = new MCPToolsManager(n8nService);
    
    super({
      name: "workflow-optimizer",
      description: "Specialized agent for optimizing n8n workflows for performance and efficiency",
      model: 'gemini-2.5-flash',
      instruction: `
        You are a specialized workflow optimizer agent. Your primary responsibilities include:
        
        - Analyzing workflow performance and identifying bottlenecks
        - Suggesting optimizations for better execution speed
        - Reducing resource usage and improving efficiency
        - Recommending better node configurations
        - Identifying redundant or unnecessary nodes
        - Suggesting parallel processing opportunities
        - Optimizing workflow structure and flow
        
        Always provide specific, actionable optimization recommendations with clear explanations
        of the expected performance improvements.
      `,
      tools: [
        ...toolsManager.getExecutionTools(),
        ...toolsManager.getNodeDiscoveryTools(),
        ...toolsManager.getPromptTools()
      ],
      memoryService: new InMemoryMemoryService(),
      sessionService: new InMemorySessionService(),
      artifactService: new InMemoryArtifactService(),
      beforeAgentCallback: (ctx) => {
        logger.info(`Starting workflow optimizer for session: ${ctx.invocationId}`);
        return undefined;
      },
      afterAgentCallback: (ctx) => {
        logger.info(`Completed workflow optimizer for session: ${ctx.invocationId}`);
        return undefined;
      }
    });
  }
}
