import axios from 'axios';
import { logger } from '../utils/logger.js';
export class N8nApiClient {
    client;
    maxRetries;
    constructor(config) {
        const { baseUrl, apiKey, timeout = 30000, maxRetries = 3 } = config;
        this.maxRetries = maxRetries;
        // Ensure baseUrl ends with /api/v1
        const apiUrl = baseUrl.endsWith('/api/v1')
            ? baseUrl
            : `${baseUrl.replace(/\/$/, '')}/api/v1`;
        this.client = axios.create({
            baseURL: apiUrl,
            timeout,
            headers: {
                'X-N8N-API-KEY': apiKey,
                'Content-Type': 'application/json',
            },
        });
        // Add request interceptor for logging
        this.client.interceptors.request.use((config) => {
            logger.debug(`Making request to ${config.method?.toUpperCase()} ${config.url}`);
            return config;
        }, (error) => {
            logger.error('Request interceptor error:', error);
            return Promise.reject(error);
        });
        // Add response interceptor for error handling
        this.client.interceptors.response.use((response) => {
            logger.debug(`Response received: ${response.status} ${response.statusText}`);
            return response;
        }, (error) => {
            logger.error('Response error:', error.response?.status, error.response?.statusText);
            return Promise.reject(error);
        });
    }
    /**
     * Health check
     */
    async healthCheck() {
        try {
            const response = await this.client.get('/health');
            return response.data;
        }
        catch (error) {
            logger.error('Health check failed:', error);
            throw error;
        }
    }
    /**
     * Workflow operations
     */
    async listWorkflows(params = {}) {
        try {
            const response = await this.client.get('/workflows', { params });
            return response.data;
        }
        catch (error) {
            logger.error('Failed to list workflows:', error);
            throw error;
        }
    }
    async getWorkflow(id) {
        try {
            const response = await this.client.get(`/workflows/${id}`);
            return response.data;
        }
        catch (error) {
            logger.error(`Failed to get workflow ${id}:`, error);
            throw error;
        }
    }
    async createWorkflow(workflow) {
        try {
            const response = await this.client.post('/workflows', workflow);
            return response.data;
        }
        catch (error) {
            logger.error('Failed to create workflow:', error);
            throw error;
        }
    }
    async updateWorkflow(id, workflow) {
        try {
            const response = await this.client.put(`/workflows/${id}`, workflow);
            return response.data;
        }
        catch (error) {
            logger.error(`Failed to update workflow ${id}:`, error);
            throw error;
        }
    }
    async deleteWorkflow(id) {
        try {
            await this.client.delete(`/workflows/${id}`);
        }
        catch (error) {
            logger.error(`Failed to delete workflow ${id}:`, error);
            throw error;
        }
    }
    async activateWorkflow(id) {
        try {
            const response = await this.client.post(`/workflows/${id}/activate`);
            return response.data;
        }
        catch (error) {
            logger.error(`Failed to activate workflow ${id}:`, error);
            throw error;
        }
    }
    async deactivateWorkflow(id) {
        try {
            const response = await this.client.post(`/workflows/${id}/deactivate`);
            return response.data;
        }
        catch (error) {
            logger.error(`Failed to deactivate workflow ${id}:`, error);
            throw error;
        }
    }
    /**
     * Execution operations
     */
    async listExecutions(params = {}) {
        try {
            const response = await this.client.get('/executions', { params });
            return response.data;
        }
        catch (error) {
            logger.error('Failed to list executions:', error);
            throw error;
        }
    }
    async getExecution(id) {
        try {
            const response = await this.client.get(`/executions/${id}`);
            return response.data;
        }
        catch (error) {
            logger.error(`Failed to get execution ${id}:`, error);
            throw error;
        }
    }
    async deleteExecution(id) {
        try {
            await this.client.delete(`/executions/${id}`);
        }
        catch (error) {
            logger.error(`Failed to delete execution ${id}:`, error);
            throw error;
        }
    }
    /**
     * Credential operations
     */
    async listCredentials(params = {}) {
        try {
            const response = await this.client.get('/credentials', { params });
            return response.data;
        }
        catch (error) {
            logger.error('Failed to list credentials:', error);
            throw error;
        }
    }
    async getCredential(id) {
        try {
            const response = await this.client.get(`/credentials/${id}`);
            return response.data;
        }
        catch (error) {
            logger.error(`Failed to get credential ${id}:`, error);
            throw error;
        }
    }
    /**
     * Tag operations
     */
    async listTags(params = {}) {
        try {
            const response = await this.client.get('/tags', { params });
            return response.data;
        }
        catch (error) {
            logger.error('Failed to list tags:', error);
            throw error;
        }
    }
    /**
     * Variable operations
     */
    async listVariables() {
        try {
            const response = await this.client.get('/variables');
            return response.data;
        }
        catch (error) {
            logger.error('Failed to list variables:', error);
            throw error;
        }
    }
    /**
     * Webhook operations
     */
    async testWebhook(webhookUrl, data) {
        try {
            const response = await this.client.post('/webhook-test', {
                url: webhookUrl,
                data
            });
            return response.data;
        }
        catch (error) {
            logger.error('Failed to test webhook:', error);
            throw error;
        }
    }
    /**
     * Export/Import operations
     */
    async exportWorkflow(id) {
        try {
            const response = await this.client.get(`/workflows/${id}/export`);
            return response.data;
        }
        catch (error) {
            logger.error(`Failed to export workflow ${id}:`, error);
            throw error;
        }
    }
    async importWorkflow(workflow) {
        try {
            const response = await this.client.post('/workflows/import', workflow);
            return response.data;
        }
        catch (error) {
            logger.error('Failed to import workflow:', error);
            throw error;
        }
    }
    /**
     * Source control operations
     */
    async getSourceControlStatus() {
        try {
            const response = await this.client.get('/source-control/status');
            return response.data;
        }
        catch (error) {
            logger.error('Failed to get source control status:', error);
            throw error;
        }
    }
    async pullFromSourceControl() {
        try {
            const response = await this.client.post('/source-control/pull');
            return response.data;
        }
        catch (error) {
            logger.error('Failed to pull from source control:', error);
            throw error;
        }
    }
    async pushToSourceControl() {
        try {
            const response = await this.client.post('/source-control/push');
            return response.data;
        }
        catch (error) {
            logger.error('Failed to push to source control:', error);
            throw error;
        }
    }
}
//# sourceMappingURL=n8n-api-client.js.map