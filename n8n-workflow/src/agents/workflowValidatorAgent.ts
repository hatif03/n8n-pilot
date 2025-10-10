import { LlmAgent, FunctionTool } from '@iqai/adk'
import { N8nWorkflow, WorkflowValidationResult } from '../types/workflow'
import { WorkflowValidator } from '../services/workflowValidator'
import { logger } from '../utils/logger'

export class WorkflowValidatorAgent {
	private agent: LlmAgent
	private validator: WorkflowValidator
	private log = logger.child({ context: 'WorkflowValidatorAgent' })

	constructor() {
		this.validator = new WorkflowValidator()
		this.agent = this.createAgent()
	}

	private createAgent(): LlmAgent {
		return new LlmAgent({
			name: 'workflow_validator',
			description: 'Validates n8n workflows against best practices and org standards',
			model: 'gemini-2.5-flash',
			tools: [this.validateWorkflowTool()],
		})
	}

	private validateWorkflowTool(): FunctionTool {
		return new FunctionTool(async (params: {
			workflow: N8nWorkflow
			strictness?: 'low' | 'medium' | 'high'
			categories?: string[]
		}) => {
			try {
				const result: WorkflowValidationResult = this.validator.validateWorkflow(params.workflow, {
					strictness: params.strictness || 'medium',
					categories: params.categories || [
						'naming',
						'security',
						'performance',
						'errorHandling',
						'documentation',
					],
					includeSuggestions: true,
				})
				return { success: true, validation: result }
			} catch (error) {
				this.log.error('Validation error', error)
				return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
			}
		}, {
			name: 'validateWorkflow',
			description: 'Validate a workflow for naming, security, performance, error handling, and documentation',
		})
	}

	public getAgent(): LlmAgent {
		return this.agent
	}
}

