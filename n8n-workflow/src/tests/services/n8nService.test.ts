import { N8nService } from '../../services/n8nService';
import { WorkflowRequest } from '../../types/workflow';

// Mock axios
jest.mock('axios');
const mockedAxios = require('axios');

describe('N8nService', () => {
  let n8nService: N8nService;
  const mockInstances = [
    {
      name: 'test-instance',
      host: 'http://localhost:5678',
      apiKey: 'test-api-key',
      enabled: true,
    },
  ];

  beforeEach(() => {
    n8nService = new N8nService(mockInstances);
    jest.clearAllMocks();
  });

  describe('createWorkflow', () => {
    it('should create a workflow successfully', async () => {
      const mockWorkflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        nodes: [],
        connections: {},
        active: false,
        settings: {},
        versionId: '1',
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: mockWorkflow,
        status: 201,
      });

      const result = await n8nService.createWorkflow({
        name: 'Test Workflow',
        nodes: [],
        connections: {},
      });

      expect(result).toEqual(mockWorkflow);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:5678/api/v1/workflows',
        expect.objectContaining({
          name: 'Test Workflow',
          nodes: [],
          connections: {},
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-N8N-API-KEY': 'test-api-key',
          }),
        })
      );
    });

    it('should handle API errors', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('API Error'));

      await expect(
        n8nService.createWorkflow({
          name: 'Test Workflow',
          nodes: [],
          connections: {},
        })
      ).rejects.toThrow('API Error');
    });
  });

  describe('getWorkflow', () => {
    it('should get a workflow successfully', async () => {
      const mockWorkflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        nodes: [],
        connections: {},
        active: false,
        settings: {},
        versionId: '1',
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: mockWorkflow,
        status: 200,
      });

      const result = await n8nService.getWorkflow('test-workflow');

      expect(result).toEqual(mockWorkflow);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:5678/api/v1/workflows/test-workflow',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-N8N-API-KEY': 'test-api-key',
          }),
        })
      );
    });

    it('should return null for non-existent workflow', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 404 },
      });

      const result = await n8nService.getWorkflow('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('listWorkflows', () => {
    it('should list workflows successfully', async () => {
      const mockWorkflows = [
        {
          id: 'workflow-1',
          name: 'Workflow 1',
          active: true,
        },
        {
          id: 'workflow-2',
          name: 'Workflow 2',
          active: false,
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: { data: mockWorkflows },
        status: 200,
      });

      const result = await n8nService.listWorkflows();

      expect(result).toEqual(mockWorkflows);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:5678/api/v1/workflows',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-N8N-API-KEY': 'test-api-key',
          }),
        })
      );
    });
  });

  describe('healthCheck', () => {
    it('should return true for healthy instance', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
      });

      const result = await n8nService.healthCheck();

      expect(result).toBe(true);
    });

    it('should return false for unhealthy instance', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await n8nService.healthCheck();

      expect(result).toBe(false);
    });
  });
});
