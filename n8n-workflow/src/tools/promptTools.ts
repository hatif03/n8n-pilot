import { FunctionTool } from '@iqai/adk'
import { logger } from '../utils/logger'

export class PromptTools {
  private log = logger.child({ context: 'PromptTools' })

  // List prompts tool
  createListPromptsTool(): FunctionTool {
    return new FunctionTool(async () => {
      try {
        this.log.info('Listing available prompts')
        
        const prompts = [
          {
            id: 'workflow_generator',
            name: 'Workflow Generator',
            description: 'Generate a complete n8n workflow from a description',
            variables: [
              {
                name: 'description',
                description: 'Description of the workflow to generate',
                required: true,
                defaultValue: ''
              },
              {
                name: 'complexity',
                description: 'Complexity level (simple, medium, complex)',
                required: false,
                defaultValue: 'medium'
              }
            ]
          },
          {
            id: 'node_selector',
            name: 'Node Selector',
            description: 'Help select appropriate nodes for a workflow',
            variables: [
              {
                name: 'useCase',
                description: 'The use case or purpose of the workflow',
                required: true,
                defaultValue: ''
              },
              {
                name: 'dataSource',
                description: 'Type of data source (API, file, database, etc.)',
                required: false,
                defaultValue: 'API'
              }
            ]
          },
          {
            id: 'workflow_optimizer',
            name: 'Workflow Optimizer',
            description: 'Optimize an existing workflow for better performance',
            variables: [
              {
                name: 'workflowJson',
                description: 'The workflow JSON to optimize',
                required: true,
                defaultValue: ''
              },
              {
                name: 'optimizationType',
                description: 'Type of optimization (performance, readability, maintainability)',
                required: false,
                defaultValue: 'performance'
              }
            ]
          },
          {
            id: 'error_handler',
            name: 'Error Handler',
            description: 'Generate error handling patterns for workflows',
            variables: [
              {
                name: 'workflowType',
                description: 'Type of workflow (API, data processing, notification, etc.)',
                required: true,
                defaultValue: 'API'
              },
              {
                name: 'criticality',
                description: 'Criticality level (low, medium, high)',
                required: false,
                defaultValue: 'medium'
              }
            ]
          },
          {
            id: 'testing_strategy',
            name: 'Testing Strategy',
            description: 'Generate testing strategies for workflows',
            variables: [
              {
                name: 'workflowDescription',
                description: 'Description of the workflow to test',
                required: true,
                defaultValue: ''
              },
              {
                name: 'testType',
                description: 'Type of testing (unit, integration, end-to-end)',
                required: false,
                defaultValue: 'integration'
              }
            ]
          }
        ]
        
        return {
          success: true,
          prompts,
          message: `Found ${prompts.length} available prompts`
        }
      } catch (error) {
        this.log.error('Failed to list prompts:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }, {
      name: 'listPrompts',
      description: 'List all available prompt templates'
    })
  }

  // Fill prompt tool
  createFillPromptTool(): FunctionTool {
    return new FunctionTool(async (params: {
      promptId: string
      variables: Record<string, any>
    }) => {
      try {
        this.log.info(`Filling prompt: ${params.promptId}`)
        
        // In a real implementation, this would use a template engine
        const promptTemplates: Record<string, string> = {
          workflow_generator: `Generate a complete n8n workflow based on this description:

Description: {{description}}
Complexity: {{complexity}}

Requirements:
1. Use appropriate trigger nodes
2. Include proper error handling
3. Add data transformation nodes as needed
4. Include output nodes for results
5. Use descriptive node names
6. Add proper connections between nodes

Please provide the complete workflow JSON.`,

          node_selector: `Select appropriate n8n nodes for this use case:

Use Case: {{useCase}}
Data Source: {{dataSource}}

Consider:
1. What trigger node is most appropriate?
2. What action nodes are needed?
3. What transformation nodes are required?
4. What output nodes should be used?
5. Are there any specialized nodes for this use case?

Provide a list of recommended nodes with explanations.`,

          workflow_optimizer: `Optimize this n8n workflow for {{optimizationType}}:

Workflow JSON:
{{workflowJson}}

Optimization focus: {{optimizationType}}

Please provide:
1. Analysis of current issues
2. Specific optimization recommendations
3. Updated workflow JSON with improvements
4. Explanation of changes made`,

          error_handler: `Generate error handling patterns for this workflow type:

Workflow Type: {{workflowType}}
Criticality: {{criticality}}

Include:
1. Error trigger nodes
2. Error handling logic
3. Retry mechanisms
4. Notification patterns
5. Logging strategies
6. Fallback procedures

Provide complete error handling workflow patterns.`,

          testing_strategy: `Create a testing strategy for this workflow:

Workflow Description: {{workflowDescription}}
Test Type: {{testType}}

Include:
1. Test scenarios
2. Test data requirements
3. Validation criteria
4. Edge cases to test
5. Performance benchmarks
6. Monitoring recommendations

Provide a comprehensive testing plan.`
        }
        
        const template = promptTemplates[params.promptId]
        if (!template) {
          return {
            success: false,
            error: `Prompt template '${params.promptId}' not found`
          }
        }
        
        // Simple template replacement
        let filledPrompt = template
        for (const [key, value] of Object.entries(params.variables)) {
          filledPrompt = filledPrompt.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
        }
        
        return {
          success: true,
          prompt: filledPrompt,
          message: `Prompt '${params.promptId}' filled successfully`
        }
      } catch (error) {
        this.log.error('Failed to fill prompt:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }, {
      name: 'fillPrompt',
      description: 'Fill a prompt template with variables'
    })
  }

  // Create custom prompt tool
  createCreateCustomPromptTool(): FunctionTool {
    return new FunctionTool(async (params: {
      name: string
      description: string
      template: string
      variables: Array<{
        name: string
        description: string
        required: boolean
        defaultValue?: string
      }>
    }) => {
      try {
        this.log.info(`Creating custom prompt: ${params.name}`)
        
        const customPrompt = {
          id: `custom_${Date.now()}`,
          name: params.name,
          description: params.description,
          template: params.template,
          variables: params.variables,
          createdAt: new Date().toISOString(),
          type: 'custom'
        }
        
        return {
          success: true,
          prompt: customPrompt,
          message: `Custom prompt '${params.name}' created successfully`
        }
      } catch (error) {
        this.log.error('Failed to create custom prompt:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }, {
      name: 'createCustomPrompt',
      description: 'Create a custom prompt template'
    })
  }

  // Get prompt tool
  createGetPromptTool(): FunctionTool {
    return new FunctionTool(async (params: { promptId: string }) => {
      try {
        this.log.info(`Getting prompt: ${params.promptId}`)
        
        // In a real implementation, this would fetch from storage
        const prompt = {
          id: params.promptId,
          name: 'Sample Prompt',
          description: 'A sample prompt template',
          template: 'This is a sample template with {{variable}}',
          variables: [
            {
              name: 'variable',
              description: 'A sample variable',
              required: true,
              defaultValue: 'default value'
            }
          ],
          createdAt: new Date().toISOString(),
          type: 'builtin'
        }
        
        return {
          success: true,
          prompt,
          message: `Prompt '${params.promptId}' retrieved successfully`
        }
      } catch (error) {
        this.log.error('Failed to get prompt:', error)
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }, {
      name: 'getPrompt',
      description: 'Get a specific prompt template by ID'
    })
  }
}




