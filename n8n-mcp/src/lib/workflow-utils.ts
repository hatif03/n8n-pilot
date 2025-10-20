import { v4 as uuidv4 } from 'uuid';
import { N8nWorkflow, N8nWorkflowNode, N8nConnections } from '../types.js';

/**
 * Generate a unique n8n ID
 */
export function generateN8nId(): string {
  return uuidv4();
}

/**
 * Generate a unique instance ID
 */
export function generateInstanceId(): string {
  return uuidv4();
}

/**
 * Create a new empty workflow
 */
export function createEmptyWorkflow(name: string, description?: string): N8nWorkflow {
  return {
    id: generateN8nId(),
    name,
    nodes: [],
    connections: {},
    active: false,
    settings: {},
    staticData: {},
    pinData: {},
    versionId: generateN8nId(),
    meta: {
      instanceId: generateInstanceId(),
    },
    tags: [],
    triggerCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Create a new workflow node
 */
export function createWorkflowNode(
  type: string,
  name: string,
  position: [number, number],
  parameters: Record<string, any> = {},
  typeVersion: number = 1
): N8nWorkflowNode {
  return {
    id: generateN8nId(),
    name,
    type,
    typeVersion,
    position,
    parameters,
    disabled: false,
    continueOnFail: false,
    alwaysOutputData: false,
    executeOnce: false,
    retryOnFail: false,
    maxTries: 3,
    waitBetweenTries: 1000,
    onError: 'stopErroring',
    noExecuteExpression: false,
    settings: {},
  };
}

/**
 * Add a node to a workflow
 */
export function addNodeToWorkflow(
  workflow: N8nWorkflow,
  node: N8nWorkflowNode
): N8nWorkflow {
  return {
    ...workflow,
    nodes: [...workflow.nodes, node],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Remove a node from a workflow
 */
export function removeNodeFromWorkflow(
  workflow: N8nWorkflow,
  nodeId: string
): N8nWorkflow {
  const updatedWorkflow = {
    ...workflow,
    nodes: workflow.nodes.filter(node => node.id !== nodeId),
    updatedAt: new Date().toISOString(),
  };

  // Remove connections involving this node
  const updatedConnections: N8nConnections = {};
  for (const [sourceNodeId, outputs] of Object.entries(workflow.connections)) {
    if (sourceNodeId !== nodeId) {
      updatedConnections[sourceNodeId] = {};
      for (const [outputName, connections] of Object.entries(outputs)) {
        updatedConnections[sourceNodeId][outputName] = connections.filter(
          conn => conn.node !== nodeId
        );
      }
    }
  }

  return {
    ...updatedWorkflow,
    connections: updatedConnections,
  };
}

/**
 * Add a connection between two nodes
 */
export function addConnectionToWorkflow(
  workflow: N8nWorkflow,
  sourceNodeId: string,
  sourceOutputName: string,
  targetNodeId: string,
  targetInputName: string,
  targetInputIndex: number = 0
): N8nWorkflow {
  const connections = { ...workflow.connections };
  
  if (!connections[sourceNodeId]) {
    connections[sourceNodeId] = {};
  }
  
  if (!connections[sourceNodeId][sourceOutputName]) {
    connections[sourceNodeId][sourceOutputName] = [];
  }
  
  connections[sourceNodeId][sourceOutputName].push({
    node: targetNodeId,
    type: targetInputName,
    index: targetInputIndex,
  });

  return {
    ...workflow,
    connections,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Remove a connection between two nodes
 */
export function removeConnectionFromWorkflow(
  workflow: N8nWorkflow,
  sourceNodeId: string,
  sourceOutputName: string,
  targetNodeId: string,
  targetInputName: string,
  targetInputIndex: number = 0
): N8nWorkflow {
  const connections = { ...workflow.connections };
  
  if (connections[sourceNodeId] && connections[sourceNodeId][sourceOutputName]) {
    connections[sourceNodeId][sourceOutputName] = connections[sourceNodeId][sourceOutputName].filter(
      conn => !(conn.node === targetNodeId && conn.type === targetInputName && conn.index === targetInputIndex)
    );
  }

  return {
    ...workflow,
    connections,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Find a node by ID in a workflow
 */
export function findNodeById(workflow: N8nWorkflow, nodeId: string): N8nWorkflowNode | undefined {
  return workflow.nodes.find(node => node.id === nodeId);
}

/**
 * Find a node by name in a workflow
 */
export function findNodeByName(workflow: N8nWorkflow, name: string): N8nWorkflowNode | undefined {
  return workflow.nodes.find(node => node.name === name);
}

/**
 * Update a node in a workflow
 */
export function updateNodeInWorkflow(
  workflow: N8nWorkflow,
  nodeId: string,
  updates: Partial<N8nWorkflowNode>
): N8nWorkflow {
  return {
    ...workflow,
    nodes: workflow.nodes.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Validate workflow structure
 */
export function validateWorkflow(workflow: N8nWorkflow): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!workflow.id) errors.push('Workflow ID is required');
  if (!workflow.name) errors.push('Workflow name is required');
  if (!Array.isArray(workflow.nodes)) errors.push('Workflow nodes must be an array');
  if (!workflow.connections || typeof workflow.connections !== 'object') {
    errors.push('Workflow connections must be an object');
  }

  // Check nodes
  workflow.nodes.forEach((node, index) => {
    if (!node.id) errors.push(`Node ${index}: ID is required`);
    if (!node.name) errors.push(`Node ${index}: Name is required`);
    if (!node.type) errors.push(`Node ${index}: Type is required`);
    if (!Array.isArray(node.position) || node.position.length !== 2) {
      errors.push(`Node ${index}: Position must be an array of two numbers`);
    }
  });

  // Check connections
  for (const [sourceNodeId, outputs] of Object.entries(workflow.connections)) {
    const sourceNode = findNodeById(workflow, sourceNodeId);
    if (!sourceNode) {
      errors.push(`Connection source node ${sourceNodeId} not found`);
    }

    for (const [outputName, connections] of Object.entries(outputs)) {
      if (!Array.isArray(connections)) {
        errors.push(`Connections for ${sourceNodeId}.${outputName} must be an array`);
        continue;
      }

      connections.forEach((conn, index) => {
        if (!conn.node) {
          errors.push(`Connection ${sourceNodeId}.${outputName}[${index}]: Target node is required`);
        } else {
          const targetNode = findNodeById(workflow, conn.node);
          if (!targetNode) {
            errors.push(`Connection ${sourceNodeId}.${outputName}[${index}]: Target node ${conn.node} not found`);
          }
        }
        if (!conn.type) {
          errors.push(`Connection ${sourceNodeId}.${outputName}[${index}]: Connection type is required`);
        }
        if (typeof conn.index !== 'number') {
          errors.push(`Connection ${sourceNodeId}.${outputName}[${index}]: Connection index must be a number`);
        }
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get workflow statistics
 */
export function getWorkflowStats(workflow: N8nWorkflow) {
  const nodeTypes = new Set(workflow.nodes.map(node => node.type));
  const connectionCount = Object.values(workflow.connections).reduce(
    (total, outputs) => total + Object.values(outputs).reduce(
      (outputTotal, connections) => outputTotal + connections.length, 0
    ), 0
  );

  return {
    nodeCount: workflow.nodes.length,
    nodeTypes: Array.from(nodeTypes),
    connectionCount,
    isActive: workflow.active,
    lastUpdated: workflow.updatedAt,
  };
}
