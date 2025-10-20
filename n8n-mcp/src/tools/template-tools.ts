import { z } from "zod";
import { TemplateService } from "../services/template-service.js";
import { logger } from "../utils/logger.js";

// Initialize template service
const templateService = new TemplateService();

/**
 * List available workflow templates
 */
export const listTemplatesTool = {
  name: "list_templates",
  description: "List available workflow templates with optional filtering and pagination",
  parameters: z.object({
    limit: z.number().min(1).max(100).default(10).describe("Number of templates to return (1-100)"),
    offset: z.number().min(0).default(0).describe("Number of templates to skip"),
    categories: z.array(z.string()).optional().describe("Filter by template categories"),
    complexity: z.enum(['simple', 'medium', 'complex']).optional().describe("Filter by complexity level"),
    use_cases: z.array(z.string()).optional().describe("Filter by use cases"),
    required_services: z.array(z.string()).optional().describe("Filter by required services"),
    target_audience: z.array(z.string()).optional().describe("Filter by target audience")
  }),
  execute: async (args: any) => {
    try {
      const result = await templateService.listTemplates(args.limit, args.offset);
      
      let response = `Found ${result.total} templates (showing ${result.items.length}):\n\n`;
      
      result.items.forEach((template, index) => {
        response += `${index + 1}. **${template.name}**\n`;
        response += `   Description: ${template.description}\n`;
        response += `   Author: ${template.author.name} (@${template.author.username})\n`;
        response += `   Views: ${template.views}\n`;
        response += `   Complexity: ${template.metadata?.complexity || 'unknown'}\n`;
        response += `   Categories: ${template.metadata?.categories?.join(', ') || 'none'}\n`;
        response += `   Nodes: ${template.nodes.length} (${template.nodes.join(', ')})\n`;
        response += `   Setup Time: ${template.metadata?.estimated_setup_minutes || 'unknown'} minutes\n`;
        response += `   URL: ${template.url}\n\n`;
      });

      if (result.hasMore) {
        response += `... and ${result.total - result.offset - result.items.length} more templates available.`;
      }

      return response;
    } catch (error) {
      logger.error("Error listing templates:", error);
      return `Error listing templates: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
};

/**
 * Search templates with advanced filtering
 */
export const searchTemplatesTool = {
  name: "search_templates",
  description: "Search workflow templates with advanced filtering options",
  parameters: z.object({
    query: z.string().optional().describe("Text search in name, description, and author"),
    categories: z.array(z.string()).optional().describe("Filter by template categories"),
    complexity: z.enum(['simple', 'medium', 'complex']).optional().describe("Filter by complexity level"),
    use_cases: z.array(z.string()).optional().describe("Filter by use cases"),
    required_services: z.array(z.string()).optional().describe("Filter by required services"),
    target_audience: z.array(z.string()).optional().describe("Filter by target audience"),
    limit: z.number().min(1).max(100).default(10).describe("Number of templates to return"),
    offset: z.number().min(0).default(0).describe("Number of templates to skip")
  }),
  execute: async (args: any) => {
    try {
      const result = await templateService.searchTemplates(args);
      
      let response = `Found ${result.total} templates matching your criteria:\n\n`;
      
      if (result.items.length === 0) {
        response += "No templates found matching your search criteria. Try adjusting your filters.";
        return response;
      }

      result.items.forEach((template, index) => {
        response += `${index + 1}. **${template.name}**\n`;
        response += `   Description: ${template.description}\n`;
        response += `   Author: ${template.author.name} (@${template.author.username})\n`;
        response += `   Views: ${template.views}\n`;
        response += `   Complexity: ${template.metadata?.complexity || 'unknown'}\n`;
        response += `   Categories: ${template.metadata?.categories?.join(', ') || 'none'}\n`;
        response += `   Use Cases: ${template.metadata?.use_cases?.join(', ') || 'none'}\n`;
        response += `   Required Services: ${template.metadata?.required_services?.join(', ') || 'none'}\n`;
        response += `   Target Audience: ${template.metadata?.target_audience?.join(', ') || 'none'}\n`;
        response += `   Setup Time: ${template.metadata?.estimated_setup_minutes || 'unknown'} minutes\n`;
        response += `   URL: ${template.url}\n\n`;
      });

      if (result.hasMore) {
        response += `... and ${result.total - result.offset - result.items.length} more templates available.`;
      }

      return response;
    } catch (error) {
      logger.error("Error searching templates:", error);
      return `Error searching templates: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
};

/**
 * Get detailed information about a specific template
 */
export const getTemplateTool = {
  name: "get_template",
  description: "Get detailed information about a specific workflow template",
  parameters: z.object({
    template_id: z.string().describe("ID of the template to retrieve"),
    include_workflow: z.boolean().default(false).describe("Whether to include the workflow JSON")
  }),
  execute: async (args: any) => {
    try {
      const template = args.include_workflow 
        ? await templateService.getTemplateWithWorkflow(args.template_id)
        : await templateService.getTemplate(args.template_id);

      if (!template) {
        return `Template with ID '${args.template_id}' not found.`;
      }

      let response = `**${template.name}**\n\n`;
      response += `**Description:** ${template.description}\n\n`;
      response += `**Author:** ${template.author.name} (@${template.author.username}) ${template.author.verified ? '✓' : ''}\n`;
      response += `**Views:** ${template.views}\n`;
      response += `**Created:** ${new Date(template.created).toLocaleDateString()}\n`;
      response += `**URL:** ${template.url}\n\n`;

      if (template.metadata) {
        response += `**Metadata:**\n`;
        response += `- Complexity: ${template.metadata.complexity}\n`;
        response += `- Categories: ${template.metadata.categories?.join(', ') || 'none'}\n`;
        response += `- Use Cases: ${template.metadata.use_cases?.join(', ') || 'none'}\n`;
        response += `- Required Services: ${template.metadata.required_services?.join(', ') || 'none'}\n`;
        response += `- Target Audience: ${template.metadata.target_audience?.join(', ') || 'none'}\n`;
        response += `- Setup Time: ${template.metadata.estimated_setup_minutes} minutes\n`;
        response += `- Key Features: ${template.metadata.key_features?.join(', ') || 'none'}\n\n`;
      }

      response += `**Nodes Used:** ${template.nodes.join(', ')}\n\n`;

      if (args.include_workflow && 'workflow' in template) {
        response += `**Workflow JSON:**\n\`\`\`json\n${JSON.stringify(template.workflow, null, 2)}\n\`\`\``;
      }

      return response;
    } catch (error) {
      logger.error("Error getting template:", error);
      return `Error getting template: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
};

/**
 * Find templates that use specific node types
 */
export const listNodeTemplatesTool = {
  name: "list_node_templates",
  description: "Find templates that use specific node types",
  parameters: z.object({
    node_types: z.array(z.string()).describe("Array of node types to search for"),
    limit: z.number().min(1).max(100).default(10).describe("Number of templates to return"),
    offset: z.number().min(0).default(0).describe("Number of templates to skip")
  }),
  execute: async (args: any) => {
    try {
      const result = await templateService.listNodeTemplates(args.node_types, args.limit, args.offset);
      
      let response = `Found ${result.total} templates using the specified node types:\n\n`;
      response += `**Searching for nodes:** ${args.node_types.join(', ')}\n\n`;
      
      if (result.items.length === 0) {
        response += "No templates found using these node types.";
        return response;
      }

      result.items.forEach((template, index) => {
        const matchingNodes = template.nodes.filter(node => args.node_types.includes(node));
        response += `${index + 1}. **${template.name}**\n`;
        response += `   Description: ${template.description}\n`;
        response += `   Matching Nodes: ${matchingNodes.join(', ')}\n`;
        response += `   All Nodes: ${template.nodes.join(', ')}\n`;
        response += `   Complexity: ${template.metadata?.complexity || 'unknown'}\n`;
        response += `   Views: ${template.views}\n\n`;
      });

      if (result.hasMore) {
        response += `... and ${result.total - result.offset - result.items.length} more templates available.`;
      }

      return response;
    } catch (error) {
      logger.error("Error listing node templates:", error);
      return `Error listing node templates: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
};

/**
 * Get templates for a specific task
 */
export const getTemplatesForTaskTool = {
  name: "get_templates_for_task",
  description: "Find templates suitable for a specific task or use case",
  parameters: z.object({
    task: z.string().describe("Description of the task or use case"),
    limit: z.number().min(1).max(20).default(5).describe("Number of templates to return")
  }),
  execute: async (args: any) => {
    try {
      const templates = await templateService.getTemplatesForTask(args.task, args.limit);
      
      let response = `Found ${templates.length} templates suitable for "${args.task}":\n\n`;
      
      if (templates.length === 0) {
        response += "No templates found for this task. Try using different keywords or check available templates.";
        return response;
      }

      templates.forEach((template, index) => {
        response += `${index + 1}. **${template.name}**\n`;
        response += `   Description: ${template.description}\n`;
        response += `   Complexity: ${template.metadata?.complexity || 'unknown'}\n`;
        response += `   Setup Time: ${template.metadata?.estimated_setup_minutes || 'unknown'} minutes\n`;
        response += `   Use Cases: ${template.metadata?.use_cases?.join(', ') || 'none'}\n`;
        response += `   URL: ${template.url}\n\n`;
      });

      return response;
    } catch (error) {
      logger.error("Error getting templates for task:", error);
      return `Error getting templates for task: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
};

/**
 * Get template categories and statistics
 */
export const getTemplateStatsTool = {
  name: "get_template_stats",
  description: "Get template categories, statistics, and most popular templates",
  parameters: z.object({}),
  execute: async () => {
    try {
      const [categories, stats] = await Promise.all([
        templateService.getCategories(),
        templateService.getStatistics()
      ]);

      let response = `**Template Statistics:**\n\n`;
      response += `**Total Templates:** ${stats.total}\n\n`;
      
      response += `**By Complexity:**\n`;
      Object.entries(stats.byComplexity).forEach(([complexity, count]) => {
        response += `- ${complexity}: ${count} templates\n`;
      });
      response += `\n`;

      response += `**By Category:**\n`;
      Object.entries(stats.byCategory)
        .sort(([,a], [,b]) => b - a)
        .forEach(([category, count]) => {
          response += `- ${category}: ${count} templates\n`;
        });
      response += `\n`;

      response += `**Available Categories:**\n`;
      response += categories.join(', ') + '\n\n';

      response += `**Most Popular Templates:**\n`;
      stats.mostPopular.forEach((template, index) => {
        response += `${index + 1}. **${template.name}** (${template.views} views)\n`;
        response += `   ${template.description}\n`;
        response += `   Complexity: ${template.metadata?.complexity || 'unknown'}\n\n`;
      });

      return response;
    } catch (error) {
      logger.error("Error getting template stats:", error);
      return `Error getting template stats: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
};

// Export all template tools
export const templateTools = [
  listTemplatesTool,
  searchTemplatesTool,
  getTemplateTool,
  listNodeTemplatesTool,
  getTemplatesForTaskTool,
  getTemplateStatsTool,
];
