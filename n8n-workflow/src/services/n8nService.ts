import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { N8nWorkflow, N8nNode, N8nConnection } from '../types/workflow';
import { logger } from '../utils/logger';

export interface N8nInstanceConfig {
  name: string;
  host: string;
  apiKey: string;
  enabled: boolean;
}

export interface N8nExecution {
  id: number;
  workflowId: string;
  status: 'running' | 'success' | 'error' | 'cancelled';
  startedAt: string;
  finishedAt?: string;
  data?: any;
  error?: string;
}

export class N8nService {
  private instances: Map<string, AxiosInstance> = new Map();
  private configs: Map<string, N8nInstanceConfig> = new Map();

  constructor(instances: N8nInstanceConfig[] = []) {
    this.initializeInstances(instances);
  }

  private initializeInstances(instances: N8nInstanceConfig[]) {
    for (const config of instances) {
      this.addInstance(config);
    }
  }

  public addInstance(config: N8nInstanceConfig): void {
    const axiosInstance = axios.create({
      baseURL: config.host,
      headers: {
        'X-N8N-API-KEY': config.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Add request interceptor for logging
    axiosInstance.interceptors.request.use(
      (config) => {
        logger.debug(`N8n API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('N8n API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error('N8n API Response Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
        return Promise.reject(error);
      }
    );

    this.instances.set(config.name, axiosInstance);
    this.configs.set(config.name, config);
    logger.info(`Added n8n instance: ${config.name} (${config.host})`);
  }

  public getInstance(name: string): AxiosInstance {
    const instance = this.instances.get(name);
    if (!instance) {
      throw new Error(`N8n instance '${name}' not found`);
    }
    return instance;
  }

  public getDefaultInstance(): AxiosInstance {
    const defaultConfig = Array.from(this.configs.values()).find(config => config.enabled);
    if (!defaultConfig) {
      throw new Error('No enabled n8n instances found');
    }
    return this.getInstance(defaultConfig.name);
  }

  // Workflow Management Methods
  public async listWorkflows(instanceName?: string): Promise<N8nWorkflow[]> {
    const instance = instanceName ? this.getInstance(instanceName) : this.getDefaultInstance();
    
    try {
      const response: AxiosResponse<{ data: N8nWorkflow[] }> = await instance.get('/workflows');
      return response.data.data || [];
    } catch (error) {
      logger.error('Failed to list workflows:', error);
      throw new Error(`Failed to list workflows: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async getWorkflow(id: string, instanceName?: string): Promise<N8nWorkflow> {
    const instance = instanceName ? this.getInstance(instanceName) : this.getDefaultInstance();
    
    try {
      const response: AxiosResponse<N8nWorkflow> = await instance.get(`/workflows/${id}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get workflow ${id}:`, error);
      throw new Error(`Failed to get workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async createWorkflow(workflow: N8nWorkflow, instanceName?: string): Promise<N8nWorkflow> {
    const instance = instanceName ? this.getInstance(instanceName) : this.getDefaultInstance();
    
    try {
      const response: AxiosResponse<N8nWorkflow> = await instance.post('/workflows', workflow);
      logger.info(`Created workflow: ${workflow.name} (ID: ${response.data.id})`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to create workflow ${workflow.name}:`, error);
      throw new Error(`Failed to create workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async updateWorkflow(id: string, workflow: Partial<N8nWorkflow>, instanceName?: string): Promise<N8nWorkflow> {
    const instance = instanceName ? this.getInstance(instanceName) : this.getDefaultInstance();
    
    try {
      const response: AxiosResponse<N8nWorkflow> = await instance.put(`/workflows/${id}`, workflow);
      logger.info(`Updated workflow: ${id}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to update workflow ${id}:`, error);
      throw new Error(`Failed to update workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async deleteWorkflow(id: string, instanceName?: string): Promise<void> {
    const instance = instanceName ? this.getInstance(instanceName) : this.getDefaultInstance();
    
    try {
      await instance.delete(`/workflows/${id}`);
      logger.info(`Deleted workflow: ${id}`);
    } catch (error) {
      logger.error(`Failed to delete workflow ${id}:`, error);
      throw new Error(`Failed to delete workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async activateWorkflow(id: string, instanceName?: string): Promise<N8nWorkflow> {
    const instance = instanceName ? this.getInstance(instanceName) : this.getDefaultInstance();
    
    try {
      const response: AxiosResponse<N8nWorkflow> = await instance.post(`/workflows/${id}/activate`);
      logger.info(`Activated workflow: ${id}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to activate workflow ${id}:`, error);
      throw new Error(`Failed to activate workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async deactivateWorkflow(id: string, instanceName?: string): Promise<N8nWorkflow> {
    const instance = instanceName ? this.getInstance(instanceName) : this.getDefaultInstance();
    
    try {
      const response: AxiosResponse<N8nWorkflow> = await instance.post(`/workflows/${id}/deactivate`);
      logger.info(`Deactivated workflow: ${id}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to deactivate workflow ${id}:`, error);
      throw new Error(`Failed to deactivate workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Execution Management Methods
  public async executeWorkflow(id: string, data?: any, instanceName?: string): Promise<N8nExecution> {
    const instance = instanceName ? this.getInstance(instanceName) : this.getDefaultInstance();
    
    try {
      const response: AxiosResponse<N8nExecution> = await instance.post(`/workflows/${id}/execute`, data);
      logger.info(`Executed workflow: ${id}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to execute workflow ${id}:`, error);
      throw new Error(`Failed to execute workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async listExecutions(workflowId?: string, instanceName?: string): Promise<N8nExecution[]> {
    const instance = instanceName ? this.getInstance(instanceName) : this.getDefaultInstance();
    
    try {
      const params = workflowId ? { workflowId } : {};
      const response: AxiosResponse<{ data: N8nExecution[] }> = await instance.get('/executions', { params });
      return response.data.data || [];
    } catch (error) {
      logger.error('Failed to list executions:', error);
      throw new Error(`Failed to list executions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async getExecution(id: number, instanceName?: string): Promise<N8nExecution> {
    const instance = instanceName ? this.getInstance(instanceName) : this.getDefaultInstance();
    
    try {
      const response: AxiosResponse<N8nExecution> = await instance.get(`/executions/${id}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get execution ${id}:`, error);
      throw new Error(`Failed to get execution: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Health Check
  public async healthCheck(instanceName?: string): Promise<boolean> {
    try {
      const instance = instanceName ? this.getInstance(instanceName) : this.getDefaultInstance();
      await instance.get('/workflows');
      return true;
    } catch (error) {
      logger.error('N8n health check failed:', error);
      return false;
    }
  }

  // Get all available instances
  public getInstances(): string[] {
    return Array.from(this.configs.keys());
  }

  // Get instance configuration
  public getInstanceConfig(name: string): N8nInstanceConfig | undefined {
    return this.configs.get(name);
  }
}

