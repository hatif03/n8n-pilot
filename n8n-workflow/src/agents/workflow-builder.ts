import { LlmAgent, InMemoryMemoryService, InMemorySessionService, InMemoryArtifactService } from "@iqai/adk";
import { N8nService } from "../services/n8nService";
import { VectorSearchService } from "../services/vectorSearchService";
import { MCPToolsManager } from "../tools";
import { logger } from "../utils/logger";

/**
 * Workflow Builder Agent - Specialized agent for creating n8n workflows
 * 
 * This agent focuses on workflow creation, node management, and workflow construction
 * following ADK-TS best practices.
 */
export class WorkflowBuilderAgent extends LlmAgent {
  constructor(
    private n8nService: N8nService,
    private vectorSearchService: VectorSearchService
  ) {
    const toolsManager = new MCPToolsManager(n8nService);
    
    super({
      name: "workflow-builder",
      description: "Specialized agent for creating, modifying, and managing n8n workflows",
      model: 'gemini-2.5-flash',
      instruction: `
        You are a specialized workflow builder agent. Your primary responsibilities include:
        
        - Creating new n8n workflows from requirements
        - Adding, editing, and removing workflow nodes
        - Managing node connections and workflow structure
        - Searching for appropriate nodes and their configurations
        - Validating workflow structure and connections
        - Optimizing workflow layout and organization
        
        Always create well-structured, efficient workflows that follow n8n best practices.
        Use the available tools to search for nodes and validate your work.
      `,
      tools: [
        ...toolsManager.getNodeDiscoveryTools(),
        ...toolsManager.getCredentialTools(),
        ...toolsManager.getTagTools()
      ],
      memoryService: new InMemoryMemoryService(),
      sessionService: new InMemorySessionService(),
      artifactService: new InMemoryArtifactService(),
      beforeAgentCallback: (ctx) => {
        logger.info(`Starting workflow builder for session: ${ctx.invocationId}`);
        return undefined;
      },
      afterAgentCallback: (ctx) => {
        logger.info(`Completed workflow builder for session: ${ctx.invocationId}`);
        return undefined;
      }
    });
  }
}
