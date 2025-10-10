import { LlmAgent, InMemoryMemoryService, InMemorySessionService, InMemoryArtifactService } from "@iqai/adk";
import { N8nService } from "../services/n8nService";
import { VectorSearchService } from "../services/vectorSearchService";
import { MCPToolsManager } from "../tools";
import { logger } from "../utils/logger";

/**
 * Workflow Validator Agent - Specialized agent for validating n8n workflows
 * 
 * This agent focuses on workflow validation, security analysis, and best practices enforcement
 * following ADK-TS best practices.
 */
export class WorkflowValidatorAgent extends LlmAgent {
  constructor(
    private n8nService: N8nService,
    private vectorSearchService: VectorSearchService
  ) {
    const toolsManager = new MCPToolsManager(n8nService);
    
    super({
      name: "workflow-validator",
      description: "Specialized agent for validating n8n workflows for security and best practices",
      model: 'gemini-2.5-flash',
      instruction: `
        You are a specialized workflow validator agent. Your primary responsibilities include:
        
        - Validating workflow structure and connections
        - Checking for security vulnerabilities and best practices
        - Ensuring proper error handling and edge cases
        - Validating node configurations and parameters
        - Checking for potential performance issues
        - Verifying credential usage and security
        - Ensuring compliance with organizational standards
        
        Always provide detailed validation reports with specific issues and recommendations
        for improvement. Prioritize security and reliability concerns.
      `,
      tools: [
        ...toolsManager.getCredentialTools(),
        ...toolsManager.getExecutionTools(),
        ...toolsManager.getNodeDiscoveryTools()
      ],
      memoryService: new InMemoryMemoryService(),
      sessionService: new InMemorySessionService(),
      artifactService: new InMemoryArtifactService(),
      beforeAgentCallback: (ctx) => {
        logger.info(`Starting workflow validator for session: ${ctx.invocationId}`);
        return undefined;
      },
      afterAgentCallback: (ctx) => {
        logger.info(`Completed workflow validator for session: ${ctx.invocationId}`);
        return undefined;
      }
    });
  }
}
