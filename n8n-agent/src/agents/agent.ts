import { AgentBuilder } from "@iqai/adk";
import { env } from "../env";
import { getJokeAgent } from "./joke-agent/agent";
import { getWeatherAgent } from "./weather-agent/agent";
import { getN8nWorkflowAgent } from "./n8n-workflow-agent/agent";

/**
 * Creates and configures the root agent for the telegram bot.
 *
 * This agent is responsible for handling every incoming telegram message received by the sampling handler.
 * It delegates tasks to sub-agents, specifically for telling jokes, providing weather information,
 * and creating n8n workflows. The root agent uses the "gemini-2.5-flash" model and maintains 
 * session state using a SQLite-backed session service.
 *
 * @returns The fully constructed root agent instance, ready to process and route user requests to the appropriate sub-agent.
 */
export const getRootAgent = async (samplingHandler: any) => {
	const jokeAgent = getJokeAgent();
	const weatherAgent = getWeatherAgent();
	const n8nWorkflowAgent = getN8nWorkflowAgent();

	return AgentBuilder.create("root_agent")
		.withDescription(
			"Root agent that delegates tasks to sub-agents for telling jokes, providing weather information, and creating n8n workflows.",
		)
		.withInstruction(
			`Use the appropriate sub-agent based on the user's request:
			- Use the joke sub-agent for humor requests
			- Use the weather sub-agent for weather-related queries
			- Use the n8n workflow sub-agent for workflow creation, automation, and n8n-related tasks
			
			For n8n workflow requests, the agent can:
			- Create new workflows from descriptions
			- Add, edit, and remove nodes in workflows
			- Manage connections between nodes
			- Validate workflow structure
			- List available n8n node types
			- Provide workflow templates and best practices
			
			Route user requests to the appropriate sub-agent based on the content and intent.`,
		)
		.withModel(env.LLM_MODEL)
		.withSubAgents([jokeAgent, weatherAgent, n8nWorkflowAgent])
		.build();
};
