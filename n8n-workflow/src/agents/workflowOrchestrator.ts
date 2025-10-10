import { AgentBuilder, LlmAgent, FunctionTool } from '@iqai/adk';
import { N8nWorkflow, WorkflowRequest, AgentMessage } from '../types/workflow';
import { WorkflowBuilderAgent } from './workflowBuilder';
import { WorkflowAnalyzerAgent } from './workflowAnalyzer';
import { WorkflowValidatorAgent } from './workflowValidatorAgent';
import { WorkflowOptimizerAgent } from './workflowOptimizerAgent';
import { N8nService } from '../services/n8nService';
import { VectorSearchService } from '../services/vectorSearchService';
import { MCPToolsManager } from '../tools';
import { logger } from '../utils/logger';

export class WorkflowOrchestratorAgent {
	private agent: LlmAgent;
	private n8nService: N8nService;
	private vectorSearchService: VectorSearchService;
	private workflowBuilder: WorkflowBuilderAgent;
	private workflowAnalyzer: WorkflowAnalyzerAgent;
	private workflowValidator: WorkflowValidatorAgent;
	private workflowOptimizer: WorkflowOptimizerAgent;
	private mcpToolsManager: MCPToolsManager;
	private logger = logger.child({ context: 'WorkflowOrchestratorAgent' });

	constructor(n8nService: N8nService, vectorSearchService: VectorSearchService) {
		this.n8nService = n8nService;
		this.vectorSearchService = vectorSearchService;
		this.workflowAnalyzer = new WorkflowAnalyzerAgent(vectorSearchService);
		this.workflowBuilder = new WorkflowBuilderAgent(n8nService);
		this.workflowValidator = new WorkflowValidatorAgent();
		this.workflowOptimizer = new WorkflowOptimizerAgent(this.workflowAnalyzer);
		this.mcpToolsManager = new MCPToolsManager(n8nService);
		this.agent = this.createAgent();
	}

	private createAgent(): LlmAgent {
		return new LlmAgent({
			name: 'workflow_orchestrator',
			model: 'gemini-2.5-flash',
			description: 'Master orchestrator agent that coordinates all workflow operations and manages the AI agent ecosystem',
			instruction: `You are the master orchestrator for the n8n Workflow Intelligence Platform. Coordinate agents and delegate tasks to achieve the requested outcome.`,
			tools: [
				// Core workflow tools
				this.createWorkflowTool(),
				this.analyzeWorkflowTool(),
				this.optimizeWorkflowTool(),
				this.searchWorkflowsTool(),
				this.validateWorkflowTool(),
				this.executeWorkflowTool(),
				this.manageWorkflowTool(),
				this.getWorkflowStatusTool(),
				this.listWorkflowsTool(),
				// MCP tools from existing projects
				...this.mcpToolsManager.getAllMCPTools(),
			],
		});
	}

	private createWorkflowTool(): FunctionTool {
		return new FunctionTool(async (params: {
			description: string;
			context?: Record<string, any>;
			instanceName?: string;
		}) => {
			try {
				this.logger.info(`Creating workflow from description: ${params.description}`);
				const result = await this.workflowBuilder.buildWorkflow(params.description, params.context);
				return { success: true, result, message: 'Workflow creation completed' };
			} catch (error) {
				this.logger.error('Failed to create workflow:', error);
				return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
			}
		}, { name: 'createWorkflow', description: 'Create a new n8n workflow from a natural language description' });
	}

	private analyzeWorkflowTool(): FunctionTool {
		return new FunctionTool(async (params: {
			workflowId: string;
			instanceName?: string;
			options?: { includeValidation?: boolean; includePatterns?: boolean; includeSimilar?: boolean }
		}) => {
			try {
				this.logger.info(`Analyzing workflow: ${params.workflowId}`);
				const workflow = await this.n8nService.getWorkflow(params.workflowId, params.instanceName);
				const result = await this.workflowAnalyzer.analyzeWorkflow(workflow, params.options);
				return { success: true, result, message: 'Workflow analysis completed' };
			} catch (error) {
				this.logger.error('Failed to analyze workflow:', error);
				return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
			}
		}, { name: 'analyzeWorkflow', description: 'Analyze a workflow for patterns, performance, and optimization opportunities' });
	}

	private optimizeWorkflowTool(): FunctionTool {
		return new FunctionTool(async (params: {
			workflowId: string;
			instanceName?: string;
			optimizationType?: 'performance' | 'maintainability' | 'security' | 'all';
		}) => {
			try {
				this.logger.info(`Optimizing workflow: ${params.workflowId}`);
				const workflow = await this.n8nService.getWorkflow(params.workflowId, params.instanceName);
				const optimization = await this.workflowOptimizer.getAgent().tools.find(t => t.name === 'optimizeWorkflow') as any;
				const result = optimization ? await optimization.func({ workflow, type: params.optimizationType || 'all' }) : null;
				return { success: true, result, message: 'Workflow optimization analysis completed' };
			} catch (error) {
				this.logger.error('Failed to optimize workflow:', error);
				return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
			}
		}, { name: 'optimizeWorkflow', description: 'Optimize a workflow for performance, maintainability, and security' });
	}

	private searchWorkflowsTool(): FunctionTool {
		return new FunctionTool(async (params: { query: string; limit?: number; threshold?: number }) => {
			try {
				this.logger.info(`Searching workflows with query: ${params.query}`);
				const results = await this.vectorSearchService.searchByText(params.query, params.limit || 10);
				return { success: true, results, message: `Found ${results.length} matching workflows` };
			} catch (error) {
				this.logger.error('Failed to search workflows:', error);
				return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
			}
		}, { name: 'searchWorkflows', description: 'Search for workflows using semantic search' });
	}

	private validateWorkflowTool(): FunctionTool {
		return new FunctionTool(async (params: { workflowId: string; instanceName?: string; strictness?: 'low' | 'medium' | 'high' }) => {
			try {
				this.logger.info(`Validating workflow: ${params.workflowId}`);
				const workflow = await this.n8nService.getWorkflow(params.workflowId, params.instanceName);
				const tool = this.workflowValidator.getAgent().tools.find(t => t.name === 'validateWorkflow') as any;
				const validation = tool ? await tool.func({ workflow, strictness: params.strictness || 'medium' }) : null;
				return { success: true, validation, message: 'Workflow validation completed' };
			} catch (error) {
				this.logger.error('Failed to validate workflow:', error);
				return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
			}
		}, { name: 'validateWorkflow', description: 'Validate workflows for best practices and compliance' });
	}

	private executeWorkflowTool(): FunctionTool {
		return new FunctionTool(async (params: { workflowId: string; instanceName?: string; data?: any }) => {
			try {
				this.logger.info(`Executing workflow: ${params.workflowId}`);
				const execution = await this.n8nService.executeWorkflow(params.workflowId, params.data, params.instanceName);
				return { success: true, execution, message: 'Workflow execution initiated' };
			} catch (error) {
				this.logger.error('Failed to execute workflow:', error);
				return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
			}
		}, { name: 'executeWorkflow', description: 'Execute a workflow on an n8n instance' });
	}

	private manageWorkflowTool(): FunctionTool {
		return new FunctionTool(async (params: { action: 'update' | 'delete' | 'activate' | 'deactivate'; workflowId: string; instanceName?: string; workflowData?: Partial<N8nWorkflow> }) => {
			try {
				this.logger.info(`Managing workflow ${params.workflowId}: ${params.action}`);
				let result: any;
				switch (params.action) {
					case 'update':
						if (!params.workflowData) throw new Error('Workflow data required for update operation');
						result = await this.n8nService.updateWorkflow(params.workflowId, params.workflowData, params.instanceName);
						break;
					case 'delete':
						await this.n8nService.deleteWorkflow(params.workflowId, params.instanceName);
						result = { deleted: true };
						break;
					case 'activate':
						result = await this.n8nService.activateWorkflow(params.workflowId, params.instanceName);
						break;
					case 'deactivate':
						result = await this.n8nService.deactivateWorkflow(params.workflowId, params.instanceName);
						break;
					default:
						throw new Error(`Unknown action: ${params.action}`);
				}
				return { success: true, result, message: `Workflow ${params.action} completed successfully` };
			} catch (error) {
				this.logger.error(`Failed to ${params.action} workflow:`, error);
				return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
			}
		}, { name: 'manageWorkflow', description: 'Manage workflow lifecycle operations' });
	}

	private getWorkflowStatusTool(): FunctionTool {
		return new FunctionTool(async (params: { workflowId: string; instanceName?: string }) => {
			try {
				this.logger.info(`Getting workflow status: ${params.workflowId}`);
				const workflow = await this.n8nService.getWorkflow(params.workflowId, params.instanceName);
				const executions = await this.n8nService.listExecutions(params.workflowId, params.instanceName);
				const status = {
					workflow: { id: workflow.id, name: workflow.name, active: workflow.active, nodeCount: workflow.nodes?.length || 0, lastUpdated: workflow.updatedAt },
					executions: { total: executions.length, recent: executions.slice(0, 5).map(exec => ({ id: exec.id, status: exec.status, startedAt: exec.startedAt, finishedAt: exec.finishedAt })) },
					health: await this.n8nService.healthCheck(params.instanceName),
				};
				return { success: true, status, message: 'Workflow status retrieved successfully' };
			} catch (error) {
				this.logger.error('Failed to get workflow status:', error);
				return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
			}
		}, { name: 'getWorkflowStatus', description: 'Get the current status and health of a workflow' });
	}

	private listWorkflowsTool(): FunctionTool {
		return new FunctionTool(async (params: { instanceName?: string; limit?: number }) => {
			try {
				this.logger.info('Listing workflows');
				const workflows = await this.n8nService.listWorkflows(params.instanceName);
				const limited = params.limit ? workflows.slice(0, params.limit) : workflows;
				return {
					success: true,
					workflows: limited.map(wf => ({ id: wf.id, name: wf.name, active: wf.active, nodeCount: wf.nodes?.length || 0, lastUpdated: wf.updatedAt })),
					total: workflows.length,
					message: `Retrieved ${limited.length} workflows`,
				};
			} catch (error) {
				this.logger.error('Failed to list workflows:', error);
				return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
			}
		}, { name: 'listWorkflows', description: 'List workflows from n8n instances' });
	}

	public getAgent(): LlmAgent { return this.agent }
	public getWorkflowBuilder(): WorkflowBuilderAgent { return this.workflowBuilder }
	public getWorkflowAnalyzer(): WorkflowAnalyzerAgent { return this.workflowAnalyzer }
	public getWorkflowValidator(): WorkflowValidatorAgent { return this.workflowValidator }
	public getWorkflowOptimizer(): WorkflowOptimizerAgent { return this.workflowOptimizer }
	
	public getTools() {
		return this.agent.tools || [];
	}
}

