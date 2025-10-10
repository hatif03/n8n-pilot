import { LlmAgent, InMemoryMemoryService, InMemorySessionService, InMemoryArtifactService } from "@iqai/adk";
import { N8nService } from "../services/n8nService";
import { VectorSearchService } from "../services/vectorSearchService";
import { MCPToolsManager } from "../tools";
import { logger } from "../utils/logger";

/**
 * Workflow Analyzer Agent - Specialized agent for analyzing n8n workflows
 * 
 * This agent focuses on workflow analysis, complexity assessment, and pattern recognition
 * following ADK-TS best practices.
 */
export class WorkflowAnalyzerAgent extends LlmAgent {
  constructor(
    private n8nService: N8nService,
    private vectorSearchService: VectorSearchService
  ) {
    const toolsManager = new MCPToolsManager(n8nService);
    
    super({
      name: "workflow-analyzer",
      description: "Specialized agent for analyzing n8n workflows, complexity assessment, and pattern recognition",
      model: 'gemini-2.5-flash',
      instruction: `
        You are a specialized workflow analyzer agent. Your primary responsibilities include:
        
        - Analyzing workflow complexity and structure
        - Identifying patterns and anti-patterns in workflows
        - Assessing workflow performance and efficiency
        - Providing insights on workflow design
        - Finding similar workflows using semantic search
        - Generating workflow analytics and reports
        
        Always provide detailed, actionable analysis with specific recommendations.
        Use the available tools to gather comprehensive workflow data before analysis.
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
        logger.info(`Starting workflow analyzer for session: ${ctx.invocationId}`);
        return undefined;
      },
      afterAgentCallback: (ctx) => {
        logger.info(`Completed workflow analyzer for session: ${ctx.invocationId}`);
        return undefined;
      }
    });
  }
}
