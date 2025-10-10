import { N8nWorkflowIntelligencePlatform } from '../index';
import { logger } from '../utils/logger';

/**
 * Basic usage examples for the N8n Workflow Intelligence Platform
 */
export class BasicUsageExamples {
  private platform: N8nWorkflowIntelligencePlatform;
  private logger = logger.child({ context: 'BasicUsageExamples' });

  constructor(platform: N8nWorkflowIntelligencePlatform) {
    this.platform = platform;
  }

  /**
   * Example 1: Create a simple workflow from natural language
   */
  public async createSimpleWorkflow(): Promise<void> {
    this.logger.info('Creating a simple workflow example');
    
    try {
      const orchestrator = this.platform.getOrchestrator();
      
      const result = await orchestrator.processRequest({
        id: 'example_1',
        type: 'create',
        parameters: {
          description: 'Create a workflow that monitors GitHub issues and sends Slack notifications for high-priority items',
          context: {
            githubRepo: 'myorg/myrepo',
            slackChannel: '#alerts',
            priorityLabels: ['high', 'urgent', 'critical'],
          },
        },
      });
      
      this.logger.info('Simple workflow created successfully', { result });
    } catch (error) {
      this.logger.error('Failed to create simple workflow:', error);
    }
  }

  /**
   * Example 2: Analyze an existing workflow
   */
  public async analyzeWorkflow(workflowId: string): Promise<void> {
    this.logger.info(`Analyzing workflow: ${workflowId}`);
    
    try {
      const orchestrator = this.platform.getOrchestrator();
      
      const result = await orchestrator.processRequest({
        id: 'example_2',
        type: 'analyze',
        parameters: {
          workflowId,
          options: {
            includeValidation: true,
            includePatterns: true,
            includeSimilar: true,
          },
        },
      });
      
      this.logger.info('Workflow analysis completed', { result });
    } catch (error) {
      this.logger.error('Failed to analyze workflow:', error);
    }
  }

  /**
   * Example 3: Search for similar workflows
   */
  public async searchSimilarWorkflows(): Promise<void> {
    this.logger.info('Searching for similar workflows');
    
    try {
      const orchestrator = this.platform.getOrchestrator();
      
      const result = await orchestrator.processRequest({
        id: 'example_3',
        type: 'search',
        parameters: {
          query: 'GitHub webhook Slack notification workflow',
          limit: 5,
          threshold: 0.7,
        },
      });
      
      this.logger.info('Similar workflows found', { result });
    } catch (error) {
      this.logger.error('Failed to search workflows:', error);
    }
  }

  /**
   * Example 4: Optimize a workflow
   */
  public async optimizeWorkflow(workflowId: string): Promise<void> {
    this.logger.info(`Optimizing workflow: ${workflowId}`);
    
    try {
      const orchestrator = this.platform.getOrchestrator();
      
      const result = await orchestrator.processRequest({
        id: 'example_4',
        type: 'optimize',
        parameters: {
          workflowId,
          optimizationType: 'all',
        },
      });
      
      this.logger.info('Workflow optimization completed', { result });
    } catch (error) {
      this.logger.error('Failed to optimize workflow:', error);
    }
  }

  /**
   * Example 5: List all workflows
   */
  public async listAllWorkflows(): Promise<void> {
    this.logger.info('Listing all workflows');
    
    try {
      const orchestrator = this.platform.getOrchestrator();
      
      const result = await orchestrator.processRequest({
        id: 'example_5',
        type: 'list',
        parameters: {
          limit: 20,
        },
      });
      
      this.logger.info('Workflows listed successfully', { result });
    } catch (error) {
      this.logger.error('Failed to list workflows:', error);
    }
  }

  /**
   * Example 6: Agent-to-agent communication
   */
  public async demonstrateAgentCommunication(): Promise<void> {
    this.logger.info('Demonstrating agent-to-agent communication');
    
    try {
      const orchestrator = this.platform.getOrchestrator();
      
      // Send a message from one agent to another
      const message = {
        id: 'msg_1',
        from: 'user',
        to: 'workflow_orchestrator',
        type: 'request' as const,
        content: {
          action: 'createWorkflow',
          parameters: {
            description: 'Create a data processing pipeline that extracts data from a CSV file, transforms it, and loads it into a database',
          },
        },
        timestamp: new Date().toISOString(),
      };
      
      const result = await orchestrator.handleMessage(message);
      
      this.logger.info('Agent communication completed', { result });
    } catch (error) {
      this.logger.error('Failed to demonstrate agent communication:', error);
    }
  }

  /**
   * Example 7: Get platform status
   */
  public async getPlatformStatus(): Promise<void> {
    this.logger.info('Getting platform status');
    
    try {
      const n8nService = this.platform.getN8nService();
      const vectorSearchService = this.platform.getVectorSearchService();
      
      // Check n8n health
      const n8nHealth = await n8nService.healthCheck();
      this.logger.info(`N8n health: ${n8nHealth ? 'healthy' : 'unhealthy'}`);
      
      // Get vector search stats
      const vectorStats = await vectorSearchService.getWorkflowStats();
      this.logger.info('Vector search stats', { vectorStats });
      
      // List available n8n instances
      const instances = n8nService.getInstances();
      this.logger.info('Available n8n instances', { instances });
      
    } catch (error) {
      this.logger.error('Failed to get platform status:', error);
    }
  }

  /**
   * Run all examples
   */
  public async runAllExamples(): Promise<void> {
    this.logger.info('Running all basic usage examples');
    
    try {
      await this.getPlatformStatus();
      await this.listAllWorkflows();
      await this.searchSimilarWorkflows();
      await this.createSimpleWorkflow();
      await this.demonstrateAgentCommunication();
      
      this.logger.info('All examples completed successfully');
    } catch (error) {
      this.logger.error('Failed to run examples:', error);
    }
  }
}

// Example usage when running this file directly
if (require.main === module) {
  const platform = new N8nWorkflowIntelligencePlatform();
  
  platform.start().then(async () => {
    const examples = new BasicUsageExamples(platform);
    await examples.runAllExamples();
  }).catch((error) => {
    console.error('Failed to start platform:', error);
    process.exit(1);
  });
}
