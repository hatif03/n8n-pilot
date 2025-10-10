import { WorkflowParser } from '../../services/workflowParser';
import { N8nWorkflow } from '../../types/workflow';

describe('WorkflowParser', () => {
  let parser: WorkflowParser;

  beforeEach(() => {
    parser = new WorkflowParser();
  });

  describe('parseWorkflow', () => {
    it('should parse a valid workflow', () => {
      const workflowJson = {
        id: 'test-workflow',
        name: 'Test Workflow',
        nodes: [
          {
            id: 'node1',
            name: 'Start',
            type: 'n8n-nodes-base.manualTrigger',
            position: [100, 100],
            parameters: {},
          },
          {
            id: 'node2',
            name: 'HTTP Request',
            type: 'n8n-nodes-base.httpRequest',
            position: [300, 100],
            parameters: {
              url: 'https://api.example.com',
              method: 'GET',
            },
          },
        ],
        connections: {
          node1: {
            main: [[{ node: 'node2', type: 'main', index: 0 }]],
          },
        },
        active: false,
        settings: {},
        versionId: '1',
      };

      const result = parser.parseWorkflow(workflowJson);

      expect(result.workflow).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.analysis).toBeDefined();
      expect(result.workflow.id).toBe('test-workflow');
      expect(result.workflow.name).toBe('Test Workflow');
      expect(result.workflow.nodes).toHaveLength(2);
    });

    it('should generate ID for workflow without ID', () => {
      const workflowJson = {
        name: 'Test Workflow',
        nodes: [],
        connections: {},
      };

      const result = parser.parseWorkflow(workflowJson);

      expect(result.workflow.id).toBeDefined();
      expect(result.workflow.id).toMatch(/test_workflow_\d+_[a-z0-9]+/);
    });

    it('should normalize node structure', () => {
      const workflowJson = {
        name: 'Test Workflow',
        nodes: [
          {
            id: 'node1',
            type: 'n8n-nodes-base.manualTrigger',
          },
        ],
        connections: {},
      };

      const result = parser.parseWorkflow(workflowJson);

      expect(result.workflow.nodes[0]).toEqual({
        id: 'node1',
        name: 'Node 1',
        type: 'n8n-nodes-base.manualTrigger',
        typeVersion: 1,
        position: [100, 100],
        parameters: {},
        disabled: false,
        notes: '',
        alwaysExecute: false,
      });
    });

    it('should throw error for invalid workflow', () => {
      const invalidWorkflow = null;

      expect(() => parser.parseWorkflow(invalidWorkflow)).toThrow(
        'Workflow JSON is required'
      );
    });

    it('should throw error for workflow without nodes', () => {
      const invalidWorkflow = {
        name: 'Test Workflow',
        connections: {},
      };

      expect(() => parser.parseWorkflow(invalidWorkflow)).toThrow(
        'Workflow must have a nodes array'
      );
    });
  });

  describe('workflow analysis', () => {
    it('should correctly categorize workflow', () => {
      const workflowJson = {
        name: 'API Integration Workflow',
        nodes: [
          {
            id: 'node1',
            type: 'n8n-nodes-base.webhook',
          },
          {
            id: 'node2',
            type: 'n8n-nodes-base.httpRequest',
          },
          {
            id: 'node3',
            type: 'n8n-nodes-base.emailSend',
          },
        ],
        connections: {},
      };

      const result = parser.parseWorkflow(workflowJson);

      expect(result.analysis.categories).toContain('api-integration');
      expect(result.analysis.categories).toContain('notification');
      expect(result.analysis.nodeTypes).toContain('n8n-nodes-base.webhook');
      expect(result.analysis.nodeTypes).toContain('n8n-nodes-base.httpRequest');
      expect(result.analysis.nodeTypes).toContain('n8n-nodes-base.emailSend');
    });

    it('should detect error handling', () => {
      const workflowJson = {
        name: 'Workflow with Error Handling',
        nodes: [
          {
            id: 'node1',
            type: 'n8n-nodes-base.manualTrigger',
          },
          {
            id: 'node2',
            type: 'n8n-nodes-base.httpRequest',
            parameters: {
              continueOnFail: true,
            },
          },
        ],
        connections: {},
      };

      const result = parser.parseWorkflow(workflowJson);

      expect(result.analysis.hasErrorHandling).toBe(true);
    });

    it('should detect loops', () => {
      const workflowJson = {
        name: 'Workflow with Loop',
        nodes: [
          {
            id: 'node1',
            type: 'n8n-nodes-base.manualTrigger',
          },
          {
            id: 'node2',
            type: 'n8n-nodes-base.loopOverItems',
          },
        ],
        connections: {},
      };

      const result = parser.parseWorkflow(workflowJson);

      expect(result.analysis.hasLoops).toBe(true);
    });

    it('should detect conditionals', () => {
      const workflowJson = {
        name: 'Workflow with Conditional',
        nodes: [
          {
            id: 'node1',
            type: 'n8n-nodes-base.manualTrigger',
          },
          {
            id: 'node2',
            type: 'n8n-nodes-base.if',
          },
        ],
        connections: {},
      };

      const result = parser.parseWorkflow(workflowJson);

      expect(result.analysis.hasConditionals).toBe(true);
    });

    it('should calculate complexity correctly', () => {
      const simpleWorkflow = {
        name: 'Simple Workflow',
        nodes: [
          { id: 'node1', type: 'n8n-nodes-base.manualTrigger' },
          { id: 'node2', type: 'n8n-nodes-base.httpRequest' },
        ],
        connections: {
          node1: {
            main: [[{ node: 'node2', type: 'main', index: 0 }]],
          },
        },
      };

      const complexWorkflow = {
        name: 'Complex Workflow',
        nodes: Array.from({ length: 15 }, (_, i) => ({
          id: `node${i}`,
          type: 'n8n-nodes-base.httpRequest',
        })),
        connections: {},
      };

      const simpleResult = parser.parseWorkflow(simpleWorkflow);
      const complexResult = parser.parseWorkflow(complexWorkflow);

      expect(simpleResult.analysis.complexity).toBe('simple');
      expect(complexResult.analysis.complexity).toBe('complex');
    });

    it('should generate recommendations', () => {
      const workflowJson = {
        name: 'Workflow without Error Handling',
        nodes: [
          {
            id: 'node1',
            type: 'n8n-nodes-base.manualTrigger',
          },
          {
            id: 'node2',
            type: 'n8n-nodes-base.httpRequest',
          },
        ],
        connections: {},
      };

      const result = parser.parseWorkflow(workflowJson);

      expect(result.analysis.recommendations).toContain(
        'Add error handling nodes to improve workflow reliability'
      );
    });
  });
});
