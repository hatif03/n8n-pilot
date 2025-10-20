/**
 * Simplified Template Service
 * Provides template management without database dependency
 */

import { logger } from '../utils/logger.js';
import {
  TemplateInfo,
  TemplateWithWorkflow,
  TemplateMinimal,
  PaginatedResponse,
  TemplateSearchParams,
  TemplateFilter
} from '../types/template.js';

export class TemplateService {
  private templates: Map<string, TemplateInfo> = new Map();
  private workflows: Map<string, any> = new Map();

  constructor() {
    this.initializeSampleTemplates();
  }

  /**
   * Initialize with sample templates
   */
  private initializeSampleTemplates(): void {
    const sampleTemplates: TemplateInfo[] = [
      {
        id: 'webhook-to-slack',
        name: 'Webhook to Slack Notification',
        description: 'Receive webhook data and send formatted notifications to Slack',
        author: {
          name: 'n8n Team',
          username: 'n8n',
          verified: true
        },
        nodes: ['n8n-nodes-base.webhook', 'n8n-nodes-base.slack'],
        views: 1250,
        created: '2024-01-15T10:00:00Z',
        url: 'https://n8n.io/workflows/webhook-to-slack',
        metadata: {
          categories: ['notifications', 'webhooks'],
          complexity: 'simple',
          use_cases: ['alerts', 'notifications', 'monitoring'],
          estimated_setup_minutes: 5,
          required_services: ['Slack'],
          key_features: ['webhook', 'slack integration', 'real-time'],
          target_audience: ['developers', 'devops']
        }
      },
      {
        id: 'data-processing-pipeline',
        name: 'Data Processing Pipeline',
        description: 'Process CSV data, transform it, and store in database',
        author: {
          name: 'n8n Team',
          username: 'n8n',
          verified: true
        },
        nodes: ['n8n-nodes-base.readFile', 'n8n-nodes-base.set', 'n8n-nodes-base.postgres'],
        views: 890,
        created: '2024-01-20T14:30:00Z',
        url: 'https://n8n.io/workflows/data-processing-pipeline',
        metadata: {
          categories: ['data-processing', 'etl'],
          complexity: 'medium',
          use_cases: ['data migration', 'etl', 'data transformation'],
          estimated_setup_minutes: 15,
          required_services: ['PostgreSQL'],
          key_features: ['file processing', 'data transformation', 'database storage'],
          target_audience: ['data engineers', 'developers']
        }
      },
      {
        id: 'ai-chat-assistant',
        name: 'AI Chat Assistant',
        description: 'Create an AI-powered chat assistant with memory and tools',
        author: {
          name: 'n8n Team',
          username: 'n8n',
          verified: true
        },
        nodes: ['n8n-nodes-base.webhook', '@n8n/n8n-nodes-langchain.agent', '@n8n/n8n-nodes-langchain.memoryBuffer'],
        views: 2100,
        created: '2024-02-01T09:15:00Z',
        url: 'https://n8n.io/workflows/ai-chat-assistant',
        metadata: {
          categories: ['ai', 'chat', 'automation'],
          complexity: 'complex',
          use_cases: ['customer support', 'ai assistant', 'chatbot'],
          estimated_setup_minutes: 30,
          required_services: ['OpenAI', 'Vector Database'],
          key_features: ['ai agent', 'memory', 'tools', 'streaming'],
          target_audience: ['ai developers', 'product managers']
        }
      },
      {
        id: 'email-marketing-campaign',
        name: 'Email Marketing Campaign',
        description: 'Automated email marketing campaign with personalization',
        author: {
          name: 'n8n Team',
          username: 'n8n',
          verified: true
        },
        nodes: ['n8n-nodes-base.schedule', 'n8n-nodes-base.googleSheets', 'n8n-nodes-base.sendEmail'],
        views: 1650,
        created: '2024-01-25T16:45:00Z',
        url: 'https://n8n.io/workflows/email-marketing-campaign',
        metadata: {
          categories: ['marketing', 'email', 'automation'],
          complexity: 'medium',
          use_cases: ['email marketing', 'campaigns', 'personalization'],
          estimated_setup_minutes: 20,
          required_services: ['Google Sheets', 'Email Service'],
          key_features: ['scheduling', 'personalization', 'email automation'],
          target_audience: ['marketers', 'business users']
        }
      },
      {
        id: 'file-backup-automation',
        name: 'File Backup Automation',
        description: 'Automatically backup files to cloud storage with versioning',
        author: {
          name: 'n8n Team',
          username: 'n8n',
          verified: true
        },
        nodes: ['n8n-nodes-base.schedule', 'n8n-nodes-base.readFile', 'n8n-nodes-base.googleDrive'],
        views: 750,
        created: '2024-02-05T11:20:00Z',
        url: 'https://n8n.io/workflows/file-backup-automation',
        metadata: {
          categories: ['backup', 'files', 'automation'],
          complexity: 'simple',
          use_cases: ['backup', 'file management', 'cloud storage'],
          estimated_setup_minutes: 10,
          required_services: ['Google Drive'],
          key_features: ['scheduling', 'file backup', 'cloud storage'],
          target_audience: ['business users', 'developers']
        }
      }
    ];

    // Store templates
    sampleTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });

    logger.info(`Initialized ${sampleTemplates.length} sample templates`);
  }

  /**
   * List templates with pagination
   */
  async listTemplates(limit: number = 10, offset: number = 0): Promise<PaginatedResponse<TemplateInfo>> {
    const allTemplates = Array.from(this.templates.values());
    const total = allTemplates.length;
    const items = allTemplates.slice(offset, offset + limit);

    return {
      items,
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    };
  }

  /**
   * Search templates with filters
   */
  async searchTemplates(params: TemplateSearchParams): Promise<PaginatedResponse<TemplateInfo>> {
    let results = Array.from(this.templates.values());

    // Apply text search
    if (params.query) {
      const query = params.query.toLowerCase();
      results = results.filter(template => 
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.author.name.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (params.categories && params.categories.length > 0) {
      results = results.filter(template => 
        template.metadata?.categories?.some(cat => params.categories!.includes(cat))
      );
    }

    // Apply complexity filter
    if (params.complexity) {
      results = results.filter(template => 
        template.metadata?.complexity === params.complexity
      );
    }

    // Apply use case filter
    if (params.use_cases && params.use_cases.length > 0) {
      results = results.filter(template => 
        template.metadata?.use_cases?.some(useCase => params.use_cases!.includes(useCase))
      );
    }

    // Apply required services filter
    if (params.required_services && params.required_services.length > 0) {
      results = results.filter(template => 
        template.metadata?.required_services?.some(service => params.required_services!.includes(service))
      );
    }

    // Apply target audience filter
    if (params.target_audience && params.target_audience.length > 0) {
      results = results.filter(template => 
        template.metadata?.target_audience?.some(audience => params.target_audience!.includes(audience))
      );
    }

    // Sort by views (most popular first)
    results.sort((a, b) => b.views - a.views);

    const total = results.length;
    const limit = params.limit || 10;
    const offset = params.offset || 0;
    const items = results.slice(offset, offset + limit);

    return {
      items,
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    };
  }

  /**
   * Get a specific template
   */
  async getTemplate(templateId: string): Promise<TemplateInfo | null> {
    return this.templates.get(templateId) || null;
  }

  /**
   * Get template with workflow
   */
  async getTemplateWithWorkflow(templateId: string): Promise<TemplateWithWorkflow | null> {
    const template = this.templates.get(templateId);
    if (!template) return null;

    const workflow = this.workflows.get(templateId);
    return {
      ...template,
      workflow: workflow || this.generateSampleWorkflow(template)
    };
  }

  /**
   * List templates that use specific node types
   */
  async listNodeTemplates(nodeTypes: string[], limit: number = 10, offset: number = 0): Promise<PaginatedResponse<TemplateInfo>> {
    const results = Array.from(this.templates.values()).filter(template =>
      nodeTypes.some(nodeType => template.nodes.includes(nodeType))
    );

    const total = results.length;
    const items = results.slice(offset, offset + limit);

    return {
      items,
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    };
  }

  /**
   * Get templates for a specific task
   */
  async getTemplatesForTask(task: string, limit: number = 5): Promise<TemplateInfo[]> {
    const results = Array.from(this.templates.values()).filter(template => {
      const searchText = `${template.name} ${template.description} ${template.metadata?.use_cases?.join(' ')}`.toLowerCase();
      return searchText.includes(task.toLowerCase());
    });

    return results.slice(0, limit);
  }

  /**
   * Get template categories
   */
  async getCategories(): Promise<string[]> {
    const categories = new Set<string>();
    this.templates.forEach(template => {
      template.metadata?.categories?.forEach(cat => categories.add(cat));
    });
    return Array.from(categories).sort();
  }

  /**
   * Get template statistics
   */
  async getStatistics(): Promise<{
    total: number;
    byComplexity: Record<string, number>;
    byCategory: Record<string, number>;
    mostPopular: TemplateInfo[];
  }> {
    const templates = Array.from(this.templates.values());
    
    const byComplexity: Record<string, number> = {};
    const byCategory: Record<string, number> = {};

    templates.forEach(template => {
      // Count by complexity
      const complexity = template.metadata?.complexity || 'unknown';
      byComplexity[complexity] = (byComplexity[complexity] || 0) + 1;

      // Count by category
      template.metadata?.categories?.forEach(cat => {
        byCategory[cat] = (byCategory[cat] || 0) + 1;
      });
    });

    const mostPopular = templates
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    return {
      total: templates.length,
      byComplexity,
      byCategory,
      mostPopular
    };
  }

  /**
   * Generate sample workflow for a template
   */
  private generateSampleWorkflow(template: TemplateInfo): any {
    // This would generate a sample workflow based on the template
    // For now, return a basic structure
    return {
      name: template.name,
      nodes: template.nodes.map((nodeType, index) => ({
        id: `node_${index + 1}`,
        name: nodeType.split('.').pop() || 'Node',
        type: nodeType,
        typeVersion: 1,
        position: [250 + (index * 200), 300],
        parameters: {}
      })),
      connections: {},
      active: false
    };
  }
}
