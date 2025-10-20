/**
 * Enhanced Workflow Validator for n8n workflows
 * Validates complete workflow structure, connections, and node configurations
 */
import { Workflow } from '../types/n8n-api.js';
interface ValidationError {
    type: 'error' | 'warning';
    message: string;
    nodeId?: string;
    field?: string;
    suggestion?: string;
}
interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
    suggestions: string[];
}
export declare class WorkflowValidator {
    private logger;
    /**
     * Validate a complete workflow
     */
    validateWorkflow(workflow: Workflow): ValidationResult;
    /**
     * Validate workflow structure
     */
    private validateWorkflowStructure;
    /**
     * Validate workflow nodes
     */
    private validateNodes;
    /**
     * Validate individual node
     */
    private validateNode;
    /**
     * Validate node-specific properties
     */
    private validateNodeSpecific;
    /**
     * Validate workflow connections
     */
    private validateConnections;
    /**
     * Validate workflow settings
     */
    private validateWorkflowSettings;
    /**
     * Generate suggestions for workflow improvement
     */
    private generateSuggestions;
}
export {};
