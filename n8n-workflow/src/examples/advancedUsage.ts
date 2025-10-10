import { N8nWorkflowIntelligencePlatform } from '../index';
import { WorkflowBuilderAgent } from '../agents/workflowBuilder';
import { WorkflowAnalyzerAgent } from '../agents/workflowAnalyzer';
import { logger } from '../utils/logger';

/**
 * Advanced usage examples for the N8n Workflow Intelligence Platform
 */
export class AdvancedUsageExamples {
  private platform: N8nWorkflowIntelligencePlatform;
  private logger = logger.child({ context: 'AdvancedUsageExamples' });

  constructor(platform: N8nWorkflowIntelligencePlatform) {
    this.platform = platform;
  }

  /**
   * Example 1: Create a complex multi-step workflow
   */
  public async createComplexWorkflow(): Promise<void> {
    this.logger.info('Creating a complex multi-step workflow');
    
    try {
      const orchestrator = this.platform.getOrchestrator();
      
      const complexWorkflowDescription = `
        Create a comprehensive data processing workflow that:
        
        1. Triggers on a schedule (every hour)
        2. Fetches data from multiple APIs (GitHub, Jira, Slack)
        3. Transforms and merges the data
        4. Performs data validation and cleaning
        5. Stores the processed data in a database
        6. Generates a report and sends it via email
        7. Handles errors gracefully with retry logic
        8. Logs all operations for monitoring
        
        The workflow should be production-ready with proper error handling,
        security considerations, and performance optimizations.
      `;
      
      const result = await orchestrator.processRequest({
        id: 'advanced_1',
        type: 'create',
        parameters: {
          description: complexWorkflowDescription,
          context: {
            apis: {
              github: { repo: 'myorg/myrepo', token: '{{$env.GITHUB_TOKEN}}' },
              jira: { url: 'https://myorg.atlassian.net', token: '{{$env.JIRA_TOKEN}}' },
              slack: { channel: '#reports', token: '{{$env.SLACK_TOKEN}}' },
            },
            database: {
              type: 'postgresql',
              connection: '{{$env.DATABASE_URL}}',
            },
            email: {
              smtp: '{{$env.SMTP_URL}}',
              to: 'reports@myorg.com',
            },
          },
        },
      });
      
      this.logger.info('Complex workflow created successfully', { result });
    } catch (error) {
      this.logger.error('Failed to create complex workflow:', error);
    }
  }

  /**
   * Example 2: Advanced workflow analysis with pattern detection
   */
  public async performAdvancedAnalysis(workflowId: string): Promise<void> {
    this.logger.info(`Performing advanced analysis on workflow: ${workflowId}`);
    
    try {
      const orchestrator = this.platform.getOrchestrator();
      
      // First, get the workflow
      const workflowResult = await orchestrator.processRequest({
        id: 'advanced_2_get',
        type: 'get',
        parameters: { workflowId },
      });
      
      if (!workflowResult.success) {
        throw new Error('Failed to get workflow');
      }
      
      // Perform comprehensive analysis
      const analysisResult = await orchestrator.processRequest({
        id: 'advanced_2_analyze',
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
      
      // Search for similar workflows for comparison
      const similarResult = await orchestrator.processRequest({
        id: 'advanced_2_similar',
        type: 'search',
        parameters: {
          query: `workflow with similar patterns to ${workflowResult.workflow.name}`,
          limit: 5,
          threshold: 0.6,
        },
      });
      
      // Generate optimization recommendations
      const optimizationResult = await orchestrator.processRequest({
        id: 'advanced_2_optimize',
        type: 'optimize',
        parameters: {
          workflowId,
          optimizationType: 'all',
        },
      });
      
      this.logger.info('Advanced analysis completed', {
        analysis: analysisResult,
        similar: similarResult,
        optimization: optimizationResult,
      });
    } catch (error) {
      this.logger.error('Failed to perform advanced analysis:', error);
    }
  }

  /**
   * Example 3: Workflow template creation and management
   */
  public async createWorkflowTemplate(): Promise<void> {
    this.logger.info('Creating workflow template');
    
    try {
      const orchestrator = this.platform.getOrchestrator();
      
      const templateDescription = `
        Create a reusable workflow template for API integration that:
        
        - Accepts configuration parameters (API URL, authentication, data mapping)
        - Handles common API patterns (GET, POST, PUT, DELETE)
        - Includes standard error handling and retry logic
        - Supports data transformation and validation
        - Can be easily customized for different APIs
        
        The template should be parameterized and reusable across different projects.
      `;
      
      const result = await orchestrator.processRequest({
        id: 'advanced_3',
        type: 'create',
        parameters: {
          description: templateDescription,
          context: {
            template: true,
            parameters: [
              'api_url',
              'auth_type',
              'auth_credentials',
              'data_mapping',
              'error_handling',
              'retry_count',
            ],
            documentation: 'This template provides a standardized way to integrate with REST APIs',
          },
        },
      });
      
      this.logger.info('Workflow template created successfully', { result });
    } catch (error) {
      this.logger.error('Failed to create workflow template:', error);
    }
  }

  /**
   * Example 4: Multi-agent collaboration
   */
  public async demonstrateMultiAgentCollaboration(): Promise<void> {
    this.logger.info('Demonstrating multi-agent collaboration');
    
    try {
      const orchestrator = this.platform.getOrchestrator();
      const workflowBuilder = orchestrator.getWorkflowBuilder();
      const workflowAnalyzer = orchestrator.getWorkflowAnalyzer();
      
      // Step 1: Builder creates a workflow
      const buildResult = await workflowBuilder.buildWorkflow(
        'Create a simple webhook that processes incoming data and stores it in a database',
        { database: 'postgresql', webhook: 'public' }
      );
      
      this.logger.info('Workflow built by WorkflowBuilder agent', { buildResult });
      
      // Step 2: Analyzer analyzes the workflow
      if (buildResult.workflow) {
        const analysisResult = await workflowAnalyzer.analyzeWorkflow(buildResult.workflow, {
          includeValidation: true,
          includePatterns: true,
        });
        
        this.logger.info('Workflow analyzed by WorkflowAnalyzer agent', { analysisResult });
        
        // Step 3: Orchestrator coordinates optimization
        const optimizationResult = await orchestrator.processRequest({
          id: 'advanced_4_optimize',
          type: 'optimize',
          parameters: {
            workflowId: buildResult.workflow.id,
            optimizationType: 'all',
          },
        });
        
        this.logger.info('Workflow optimized by Orchestrator agent', { optimizationResult });
      }
    } catch (error) {
      this.logger.error('Failed to demonstrate multi-agent collaboration:', error);
    }
  }

  /**
   * Example 5: Workflow performance monitoring and optimization
   */
  public async monitorAndOptimizeWorkflow(workflowId: string): Promise<void> {
    this.logger.info(`Monitoring and optimizing workflow: ${workflowId}`);
    
    try {
      const orchestrator = this.platform.getOrchestrator();
      
      // Get current workflow status
      const statusResult = await orchestrator.processRequest({
        id: 'advanced_5_status',
        type: 'status',
        parameters: { workflowId },
      });
      
      this.logger.info('Current workflow status', { status: statusResult });
      
      // Analyze performance
      const analysisResult = await orchestrator.processRequest({
        id: 'advanced_5_analyze',
        type: 'analyze',
        parameters: {
          workflowId,
          options: {
            includeValidation: true,
            includePatterns: true,
          },
        },
      });
      
      // Generate performance optimizations
      const optimizationResult = await orchestrator.processRequest({
        id: 'advanced_5_optimize',
        type: 'optimize',
        parameters: {
          workflowId,
          optimizationType: 'performance',
        },
      });
      
      // If optimizations are available, apply them
      if (optimizationResult.optimizations && optimizationResult.optimizations.length > 0) {
        this.logger.info('Applying performance optimizations', { 
          optimizations: optimizationResult.optimizations 
        });
        
        // In a real implementation, you would apply the optimizations here
        // For now, we'll just log them
        optimizationResult.optimizations.forEach((opt: any, index: number) => {
          this.logger.info(`Optimization ${index + 1}:`, {
            type: opt.type,
            description: opt.description,
            suggestions: opt.suggestions,
          });
        });
      }
      
      this.logger.info('Workflow monitoring and optimization completed');
    } catch (error) {
      this.logger.error('Failed to monitor and optimize workflow:', error);
    }
  }

  /**
   * Example 6: Workflow versioning and migration
   */
  public async demonstrateWorkflowVersioning(): Promise<void> {
    this.logger.info('Demonstrating workflow versioning and migration');
    
    try {
      const orchestrator = this.platform.getOrchestrator();
      
      // Create initial workflow version
      const v1Result = await orchestrator.processRequest({
        id: 'advanced_6_v1',
        type: 'create',
        parameters: {
          description: 'Create a basic data processing workflow (Version 1)',
          context: { version: '1.0', features: ['basic_processing'] },
        },
      });
      
      this.logger.info('Workflow Version 1 created', { v1: v1Result });
      
      // Create improved version
      const v2Result = await orchestrator.processRequest({
        id: 'advanced_6_v2',
        type: 'create',
        parameters: {
          description: 'Create an improved data processing workflow (Version 2) with error handling, retry logic, and performance optimizations',
          context: { 
            version: '2.0', 
            features: ['basic_processing', 'error_handling', 'retry_logic', 'performance_optimization'],
            migrationFrom: v1Result.workflow?.id,
          },
        },
      });
      
      this.logger.info('Workflow Version 2 created', { v2: v2Result });
      
      // Compare versions
      if (v1Result.workflow && v2Result.workflow) {
        const comparisonResult = await orchestrator.processRequest({
          id: 'advanced_6_compare',
          type: 'compare',
          parameters: {
            workflow1Id: v1Result.workflow.id,
            workflow2Id: v2Result.workflow.id,
          },
        });
        
        this.logger.info('Workflow version comparison completed', { comparison: comparisonResult });
      }
    } catch (error) {
      this.logger.error('Failed to demonstrate workflow versioning:', error);
    }
  }

  /**
   * Example 7: Custom agent development
   */
  public async demonstrateCustomAgent(): Promise<void> {
    this.logger.info('Demonstrating custom agent development');
    
    try {
      // Create a custom agent for specific domain logic
      const customAgent = new WorkflowBuilderAgent(this.platform.getN8nService());
      
      // Use the custom agent directly
      const result = await customAgent.buildWorkflow(
        'Create a specialized workflow for financial data processing with compliance checks',
        {
          domain: 'finance',
          compliance: ['SOX', 'GDPR', 'PCI-DSS'],
          dataTypes: ['transactions', 'accounts', 'reports'],
        }
      );
      
      this.logger.info('Custom agent workflow created', { result });
      
      // The custom agent can be integrated into the orchestrator
      // or used independently for specialized tasks
    } catch (error) {
      this.logger.error('Failed to demonstrate custom agent:', error);
    }
  }

  /**
   * Run all advanced examples
   */
  public async runAllAdvancedExamples(): Promise<void> {
    this.logger.info('Running all advanced usage examples');
    
    try {
      await this.createComplexWorkflow();
      await this.createWorkflowTemplate();
      await this.demonstrateMultiAgentCollaboration();
      await this.demonstrateWorkflowVersioning();
      await this.demonstrateCustomAgent();
      
      this.logger.info('All advanced examples completed successfully');
    } catch (error) {
      this.logger.error('Failed to run advanced examples:', error);
    }
  }
}

// Example usage when running this file directly
if (require.main === module) {
  const platform = new N8nWorkflowIntelligencePlatform();
  
  platform.start().then(async () => {
    const examples = new AdvancedUsageExamples(platform);
    await examples.runAllAdvancedExamples();
  }).catch((error) => {
    console.error('Failed to start platform:', error);
    process.exit(1);
  });
}
