/**
 * Enhanced Workflow Validator for n8n workflows
 * Validates complete workflow structure, connections, and node configurations
 */
import { logger } from '../utils/logger.js';
export class WorkflowValidator {
    logger = logger;
    /**
     * Validate a complete workflow
     */
    validateWorkflow(workflow) {
        const errors = [];
        const warnings = [];
        const suggestions = [];
        // Basic workflow validation
        this.validateWorkflowStructure(workflow, errors, warnings);
        // Validate nodes
        this.validateNodes(workflow.nodes, errors, warnings);
        // Validate connections
        this.validateConnections(workflow.connections, workflow.nodes, errors, warnings);
        // Validate workflow settings
        if (workflow.settings) {
            this.validateWorkflowSettings(workflow.settings, errors, warnings);
        }
        // Generate suggestions
        this.generateSuggestions(workflow, suggestions);
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            suggestions
        };
    }
    /**
     * Validate workflow structure
     */
    validateWorkflowStructure(workflow, errors, warnings) {
        if (!workflow.name || workflow.name.trim().length === 0) {
            errors.push({
                type: 'error',
                message: 'Workflow name is required'
            });
        }
        if (!workflow.nodes || workflow.nodes.length === 0) {
            errors.push({
                type: 'error',
                message: 'Workflow must have at least one node'
            });
        }
        if (!workflow.connections) {
            warnings.push({
                type: 'warning',
                message: 'Workflow has no connections - nodes will not execute in sequence'
            });
        }
    }
    /**
     * Validate workflow nodes
     */
    validateNodes(nodes, errors, warnings) {
        const nodeIds = new Set();
        const nodeNames = new Set();
        for (const node of nodes) {
            // Check for duplicate IDs
            if (nodeIds.has(node.id)) {
                errors.push({
                    type: 'error',
                    message: `Duplicate node ID: ${node.id}`,
                    nodeId: node.id
                });
            }
            nodeIds.add(node.id);
            // Check for duplicate names
            if (nodeNames.has(node.name)) {
                warnings.push({
                    type: 'warning',
                    message: `Duplicate node name: ${node.name}`,
                    nodeId: node.id
                });
            }
            nodeNames.add(node.name);
            // Validate individual node
            this.validateNode(node, errors, warnings);
        }
    }
    /**
     * Validate individual node
     */
    validateNode(node, errors, warnings) {
        // Required fields
        if (!node.id || node.id.trim().length === 0) {
            errors.push({
                type: 'error',
                message: 'Node ID is required',
                nodeId: node.id
            });
        }
        if (!node.name || node.name.trim().length === 0) {
            errors.push({
                type: 'error',
                message: 'Node name is required',
                nodeId: node.id
            });
        }
        if (!node.type || node.type.trim().length === 0) {
            errors.push({
                type: 'error',
                message: 'Node type is required',
                nodeId: node.id
            });
        }
        if (!node.typeVersion || node.typeVersion < 1) {
            errors.push({
                type: 'error',
                message: 'Node typeVersion must be at least 1',
                nodeId: node.id
            });
        }
        // Position validation
        if (!node.position || !Array.isArray(node.position) || node.position.length !== 2) {
            errors.push({
                type: 'error',
                message: 'Node position must be an array of two numbers [x, y]',
                nodeId: node.id
            });
        }
        else {
            const [x, y] = node.position;
            if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
                errors.push({
                    type: 'error',
                    message: 'Node position coordinates must be valid numbers',
                    nodeId: node.id
                });
            }
        }
        // Parameters validation
        if (node.parameters === undefined || node.parameters === null) {
            warnings.push({
                type: 'warning',
                message: 'Node has no parameters - this may be intentional for some node types',
                nodeId: node.id
            });
        }
        else if (typeof node.parameters !== 'object' || Array.isArray(node.parameters)) {
            errors.push({
                type: 'error',
                message: 'Node parameters must be an object',
                nodeId: node.id
            });
        }
        // Credentials validation
        if (node.credentials && typeof node.credentials !== 'object') {
            errors.push({
                type: 'error',
                message: 'Node credentials must be an object',
                nodeId: node.id
            });
        }
        // Node-specific validations
        this.validateNodeSpecific(node, errors, warnings);
    }
    /**
     * Validate node-specific properties
     */
    validateNodeSpecific(node, errors, warnings) {
        // Webhook node validation
        if (node.type.includes('webhook')) {
            if (!node.parameters?.httpMethod) {
                errors.push({
                    type: 'error',
                    message: 'Webhook node must have httpMethod parameter',
                    nodeId: node.id,
                    field: 'parameters.httpMethod'
                });
            }
            if (!node.parameters?.path) {
                errors.push({
                    type: 'error',
                    message: 'Webhook node must have path parameter',
                    nodeId: node.id,
                    field: 'parameters.path'
                });
            }
        }
        // HTTP Request node validation
        if (node.type.includes('httpRequest')) {
            if (!node.parameters?.url) {
                errors.push({
                    type: 'error',
                    message: 'HTTP Request node must have url parameter',
                    nodeId: node.id,
                    field: 'parameters.url'
                });
            }
        }
        // Slack node validation
        if (node.type.includes('slack')) {
            if (!node.credentials?.slackApi) {
                errors.push({
                    type: 'error',
                    message: 'Slack node must have slackApi credentials',
                    nodeId: node.id,
                    field: 'credentials.slackApi'
                });
            }
        }
        // Google Sheets node validation
        if (node.type.includes('googleSheets')) {
            if (!node.credentials?.googleSheetsOAuth2Api) {
                errors.push({
                    type: 'error',
                    message: 'Google Sheets node must have googleSheetsOAuth2Api credentials',
                    nodeId: node.id,
                    field: 'credentials.googleSheetsOAuth2Api'
                });
            }
        }
    }
    /**
     * Validate workflow connections
     */
    validateConnections(connections, nodes, errors, warnings) {
        if (!connections)
            return;
        const nodeIds = new Set(nodes.map(n => n.id));
        for (const [sourceNodeId, outputs] of Object.entries(connections)) {
            // Check if source node exists
            if (!nodeIds.has(sourceNodeId)) {
                errors.push({
                    type: 'error',
                    message: `Connection references non-existent source node: ${sourceNodeId}`
                });
                continue;
            }
            // Validate each output
            for (const [outputType, connectionsArray] of Object.entries(outputs)) {
                if (!Array.isArray(connectionsArray)) {
                    errors.push({
                        type: 'error',
                        message: `Output ${outputType} for node ${sourceNodeId} must be an array`,
                        nodeId: sourceNodeId
                    });
                    continue;
                }
                // Validate each connection
                for (const connectionGroup of connectionsArray) {
                    if (!Array.isArray(connectionGroup)) {
                        errors.push({
                            type: 'error',
                            message: `Connection group for ${sourceNodeId} output ${outputType} must be an array`,
                            nodeId: sourceNodeId
                        });
                        continue;
                    }
                    for (const connection of connectionGroup) {
                        if (!connection.node || !nodeIds.has(connection.node)) {
                            errors.push({
                                type: 'error',
                                message: `Connection references non-existent target node: ${connection.node}`,
                                nodeId: sourceNodeId
                            });
                        }
                        if (!connection.type) {
                            errors.push({
                                type: 'error',
                                message: `Connection must have a type`,
                                nodeId: sourceNodeId
                            });
                        }
                        if (typeof connection.index !== 'number' || connection.index < 0) {
                            errors.push({
                                type: 'error',
                                message: `Connection index must be a non-negative number`,
                                nodeId: sourceNodeId
                            });
                        }
                    }
                }
            }
        }
    }
    /**
     * Validate workflow settings
     */
    validateWorkflowSettings(settings, errors, warnings) {
        if (settings.executionOrder && !['v0', 'v1'].includes(settings.executionOrder)) {
            errors.push({
                type: 'error',
                message: 'executionOrder must be either "v0" or "v1"'
            });
        }
        if (settings.timezone && typeof settings.timezone !== 'string') {
            errors.push({
                type: 'error',
                message: 'timezone must be a string'
            });
        }
        if (settings.executionTimeout && (typeof settings.executionTimeout !== 'number' || settings.executionTimeout <= 0)) {
            errors.push({
                type: 'error',
                message: 'executionTimeout must be a positive number'
            });
        }
    }
    /**
     * Generate suggestions for workflow improvement
     */
    generateSuggestions(workflow, suggestions) {
        // Check for common patterns
        const hasWebhook = workflow.nodes.some((n) => n.type.includes('webhook'));
        const hasTrigger = workflow.nodes.some((n) => n.type.includes('trigger'));
        if (!hasWebhook && !hasTrigger) {
            suggestions.push('Consider adding a trigger node (Webhook, Schedule, etc.) to start your workflow');
        }
        // Check for error handling
        const hasErrorHandling = workflow.nodes.some((n) => n.onError);
        if (!hasErrorHandling) {
            suggestions.push('Consider adding error handling to your nodes for better reliability');
        }
        // Check for credentials
        const nodesWithCredentials = workflow.nodes.filter((n) => n.credentials && Object.keys(n.credentials).length > 0);
        if (nodesWithCredentials.length === 0) {
            suggestions.push('Some nodes may require credentials to function properly');
        }
        // Check for naming conventions
        const unnamedNodes = workflow.nodes.filter((n) => !n.name || n.name.trim().length === 0);
        if (unnamedNodes.length > 0) {
            suggestions.push('All nodes should have descriptive names for better workflow readability');
        }
    }
}
//# sourceMappingURL=workflow-validator.js.map