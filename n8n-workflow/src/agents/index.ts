/**
 * ADK-TS Compliant Agent Exports
 * 
 * This file exports all agents following ADK-TS conventions for easy import
 * and integration with the framework.
 */

// Main orchestrator agent (default export for ADK web interface)
export { getOrchestratorAgent as agent, getOrchestratorAgent } from './orchestrator';

// Specialized agents
export { WorkflowAnalyzerAgent } from './workflow-analyzer';
export { WorkflowBuilderAgent } from './workflow-builder';
export { WorkflowOptimizerAgent } from './workflow-optimizer';
export { WorkflowValidatorAgent } from './workflow-validator';

