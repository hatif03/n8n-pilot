import { LlmAgent, FunctionTool, AgentBuilder } from '@iqai/adk'
import { N8nWorkflow } from '../types/workflow'
import { WorkflowAnalyzerAgent } from './workflowAnalyzer'
import { logger } from '../utils/logger'

export class WorkflowOptimizerAgent {
	private agent: LlmAgent
	private analyzer: WorkflowAnalyzerAgent
	private log = logger.child({ context: 'WorkflowOptimizerAgent' })

	constructor(analyzer: WorkflowAnalyzerAgent) {
		this.analyzer = analyzer
		this.agent = this.createAgent()
	}

	private createAgent(): LlmAgent {
		return new LlmAgent({
			name: 'workflow_optimizer',
			description: 'Generates concrete optimization suggestions for performance, maintainability, and security',
			model: 'gemini-2.5-flash',
			tools: [this.optimizeWorkflowTool()],
		})
	}

	private optimizeWorkflowTool(): FunctionTool {
		return new FunctionTool(async (params: {
			workflow: N8nWorkflow
			type?: 'performance' | 'maintainability' | 'security' | 'all'
		}) => {
			try {
				// Leverage analyzer for baseline insights
				const analysis = await this.analyzer.analyzeWorkflow(params.workflow, {
					includeValidation: true,
					includePatterns: true,
				})

				// Ask the LLM to propose concrete optimizations based on analysis
				const { runner } = await AgentBuilder.create('optimizer').withAgent(this.agent).build()
				const prompt = `You are an expert in n8n workflow optimization.
Given this analysis, produce concrete optimization suggestions for ${params.type || 'all'} domains.
Return JSON with: optimizations[{type, description, impact, effort, steps[]}].

Analysis:
${typeof analysis === 'string' ? analysis : JSON.stringify(analysis, null, 2)}`
				const suggestions = await runner.ask(prompt)

				return { success: true, analysis, suggestions }
			} catch (error) {
				this.log.error('Optimization error', error)
				return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
			}
		}, {
			name: 'optimizeWorkflow',
			description: 'Generate concrete optimization suggestions for a workflow',
		})
	}

	public getAgent(): LlmAgent {
		return this.agent
	}
}

