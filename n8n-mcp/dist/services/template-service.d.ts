/**
 * Simplified Template Service
 * Provides template management without database dependency
 */
import { TemplateInfo, TemplateWithWorkflow, PaginatedResponse, TemplateSearchParams } from '../types/template.js';
export declare class TemplateService {
    private templates;
    private workflows;
    constructor();
    /**
     * Initialize with sample templates
     */
    private initializeSampleTemplates;
    /**
     * List templates with pagination
     */
    listTemplates(limit?: number, offset?: number): Promise<PaginatedResponse<TemplateInfo>>;
    /**
     * Search templates with filters
     */
    searchTemplates(params: TemplateSearchParams): Promise<PaginatedResponse<TemplateInfo>>;
    /**
     * Get a specific template
     */
    getTemplate(templateId: string): Promise<TemplateInfo | null>;
    /**
     * Get template with workflow
     */
    getTemplateWithWorkflow(templateId: string): Promise<TemplateWithWorkflow | null>;
    /**
     * List templates that use specific node types
     */
    listNodeTemplates(nodeTypes: string[], limit?: number, offset?: number): Promise<PaginatedResponse<TemplateInfo>>;
    /**
     * Get templates for a specific task
     */
    getTemplatesForTask(task: string, limit?: number): Promise<TemplateInfo[]>;
    /**
     * Get template categories
     */
    getCategories(): Promise<string[]>;
    /**
     * Get template statistics
     */
    getStatistics(): Promise<{
        total: number;
        byComplexity: Record<string, number>;
        byCategory: Record<string, number>;
        mostPopular: TemplateInfo[];
    }>;
    /**
     * Generate sample workflow for a template
     */
    private generateSampleWorkflow;
}
