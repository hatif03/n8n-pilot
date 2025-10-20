import { N8nWorkflow, N8nWorkflowNode } from '../types.js';
/**
 * Generate a unique n8n ID
 */
export declare function generateN8nId(): string;
/**
 * Generate a unique instance ID
 */
export declare function generateInstanceId(): string;
/**
 * Create a new empty workflow
 */
export declare function createEmptyWorkflow(name: string, description?: string): N8nWorkflow;
/**
 * Create a new workflow node
 */
export declare function createWorkflowNode(type: string, name: string, position: [number, number], parameters?: Record<string, any>, typeVersion?: number): N8nWorkflowNode;
/**
 * Add a node to a workflow
 */
export declare function addNodeToWorkflow(workflow: N8nWorkflow, node: N8nWorkflowNode): N8nWorkflow;
/**
 * Remove a node from a workflow
 */
export declare function removeNodeFromWorkflow(workflow: N8nWorkflow, nodeId: string): N8nWorkflow;
/**
 * Add a connection between two nodes
 */
export declare function addConnectionToWorkflow(workflow: N8nWorkflow, sourceNodeId: string, sourceOutputName: string, targetNodeId: string, targetInputName: string, targetInputIndex?: number): N8nWorkflow;
/**
 * Remove a connection between two nodes
 */
export declare function removeConnectionFromWorkflow(workflow: N8nWorkflow, sourceNodeId: string, sourceOutputName: string, targetNodeId: string, targetInputName: string, targetInputIndex?: number): N8nWorkflow;
/**
 * Find a node by ID in a workflow
 */
export declare function findNodeById(workflow: N8nWorkflow, nodeId: string): N8nWorkflowNode | undefined;
/**
 * Find a node by name in a workflow
 */
export declare function findNodeByName(workflow: N8nWorkflow, name: string): N8nWorkflowNode | undefined;
/**
 * Update a node in a workflow
 */
export declare function updateNodeInWorkflow(workflow: N8nWorkflow, nodeId: string, updates: Partial<N8nWorkflowNode>): N8nWorkflow;
/**
 * Validate workflow structure
 */
export declare function validateWorkflow(workflow: N8nWorkflow): {
    valid: boolean;
    errors: string[];
};
/**
 * Get workflow statistics
 */
export declare function getWorkflowStats(workflow: N8nWorkflow): {
    nodeCount: number;
    nodeTypes: string[];
    connectionCount: number;
    isActive: boolean;
    lastUpdated: string | undefined;
};
