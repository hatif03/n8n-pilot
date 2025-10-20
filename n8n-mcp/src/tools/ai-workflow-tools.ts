import { z } from 'zod';
import { WorkflowService } from '../services/workflow-service.js';
import { NodeDiscoveryService } from '../services/node-discovery-service.js';
import { createEmptyWorkflow, createWorkflowNode, addNodeToWorkflow, addConnectionToWorkflow } from '../lib/workflow-utils.js';

const workflowService = new WorkflowService();
const nodeDiscoveryService = new NodeDiscoveryService();

/**
 * Compose AI workflow tool
 */
export const composeAiWorkflowTool = {
  name: 'compose_ai_workflow',
  description: 'Compose a complex AI workflow (agent + model + memory + embeddings + vector + tools + trigger) in one call',
  parameters: z.object({
    workflow_name: z.string().describe('Name of the workflow to create'),
    plan: z.string().describe('Description of the AI workflow plan'),
    n8n_version: z.string().optional().describe('n8n version to use'),
  }),
  execute: async (args: { workflow_name: string; plan: string; n8n_version?: string }) => {
    try {
      // Check if workflow already exists
      const exists = await workflowService.workflowExists(args.workflow_name);
      if (exists) {
        return `Error: Workflow '${args.workflow_name}' already exists`;
      }

      // Create a new workflow
      let workflow = createEmptyWorkflow(args.workflow_name, `AI Workflow: ${args.plan}`);

      // Get available versions
      const availableVersions = await nodeDiscoveryService.getAvailableVersions();
      const targetVersion = args.n8n_version || availableVersions[0];

      // Create nodes for a typical AI workflow
      const nodes = [];

      // 1. Webhook trigger
      const webhookNode = createWorkflowNode(
        'n8n-nodes-base.webhook',
        'Webhook Trigger',
        [100, 100],
        {
          httpMethod: 'POST',
          path: 'ai-workflow',
          responseMode: 'responseNode',
        }
      );
      nodes.push(webhookNode);

      // 2. AI Agent node
      const agentNode = createWorkflowNode(
        'n8n-nodes-base.openAiAgent',
        'AI Agent',
        [400, 100],
        {
          model: 'gpt-4',
          systemMessage: 'You are a helpful AI assistant.',
          options: {},
        }
      );
      nodes.push(agentNode);

      // 3. OpenAI model node
      const modelNode = createWorkflowNode(
        'n8n-nodes-base.openAi',
        'OpenAI Model',
        [400, 300],
        {
          resource: 'chat',
          operation: 'create',
          model: 'gpt-4',
          messages: '={{ $json.messages }}',
        }
      );
      nodes.push(modelNode);

      // 4. Memory node (if available)
      const memoryNode = createWorkflowNode(
        'n8n-nodes-base.memory',
        'Memory',
        [700, 100],
        {
          operation: 'get',
          key: 'conversation',
        }
      );
      nodes.push(memoryNode);

      // 5. Embeddings node
      const embeddingsNode = createWorkflowNode(
        'n8n-nodes-base.openAiEmbeddings',
        'Embeddings',
        [700, 300],
        {
          resource: 'embeddings',
          operation: 'create',
          model: 'text-embedding-ada-002',
          input: '={{ $json.text }}',
        }
      );
      nodes.push(embeddingsNode);

      // 6. Vector store node
      const vectorStoreNode = createWorkflowNode(
        'n8n-nodes-base.pinecone',
        'Vector Store',
        [1000, 100],
        {
          resource: 'vector',
          operation: 'upsert',
          index: 'ai-workflow',
          vectors: '={{ $json.vectors }}',
        }
      );
      nodes.push(vectorStoreNode);

      // 7. Tool node (example: HTTP Request)
      const toolNode = createWorkflowNode(
        'n8n-nodes-base.httpRequest',
        'HTTP Tool',
        [1000, 300],
        {
          method: 'GET',
          url: 'https://api.example.com/data',
          options: {},
        }
      );
      nodes.push(toolNode);

      // 8. Response node
      const responseNode = createWorkflowNode(
        'n8n-nodes-base.respondToWebhook',
        'Response',
        [1300, 100],
        {
          respondWith: 'json',
          responseBody: '={{ $json.response }}',
        }
      );
      nodes.push(responseNode);

      // Add all nodes to the workflow
      for (const node of nodes) {
        workflow = addNodeToWorkflow(workflow, node);
      }

      // Create connections
      // Webhook -> Agent
      workflow = addConnectionToWorkflow(workflow, webhookNode.id, 'main', agentNode.id, 'main', 0);
      
      // Agent -> Model
      workflow = addConnectionToWorkflow(workflow, agentNode.id, 'main', modelNode.id, 'main', 0);
      
      // Agent -> Memory
      workflow = addConnectionToWorkflow(workflow, agentNode.id, 'memory', memoryNode.id, 'main', 0);
      
      // Agent -> Embeddings
      workflow = addConnectionToWorkflow(workflow, agentNode.id, 'embeddings', embeddingsNode.id, 'main', 0);
      
      // Agent -> Vector Store
      workflow = addConnectionToWorkflow(workflow, agentNode.id, 'vectorStore', vectorStoreNode.id, 'main', 0);
      
      // Agent -> Tool
      workflow = addConnectionToWorkflow(workflow, agentNode.id, 'tools', toolNode.id, 'main', 0);
      
      // Agent -> Response
      workflow = addConnectionToWorkflow(workflow, agentNode.id, 'main', responseNode.id, 'main', 0);

      // Save the workflow
      await workflowService.saveWorkflow(workflow);

      const nodeList = nodes.map((node, index) => 
        `${index + 1}. ${node.name} (${node.type})`
      ).join('\n');

      const connectionList = [
        'Webhook -> Agent',
        'Agent -> Model',
        'Agent -> Memory',
        'Agent -> Embeddings',
        'Agent -> Vector Store',
        'Agent -> Tool',
        'Agent -> Response',
      ].join('\n');

      return `AI workflow '${args.workflow_name}' created successfully!\n\n` +
        `Workflow ID: ${workflow.id}\n` +
        `Nodes: ${nodes.length}\n` +
        `Connections: 7\n\n` +
        `Nodes:\n${nodeList}\n\n` +
        `Connections:\n${connectionList}\n\n` +
        `Plan: ${args.plan}`;
    } catch (error) {
      return `Failed to compose AI workflow: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
};