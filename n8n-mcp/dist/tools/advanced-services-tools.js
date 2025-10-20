import { z } from "zod";
import { ExampleGenerator } from "../services/example-generator.js";
import { ConfidenceScorer } from "../services/confidence-scorer.js";
import { PropertyDependencies } from "../services/property-dependencies.js";
import { logger } from "../utils/logger.js";
/**
 * Get node configuration examples
 */
export const getNodeExamplesTool = {
    name: "get_node_examples",
    description: "Get configuration examples for n8n nodes (minimal, common, advanced)",
    parameters: z.object({
        node_type: z.string().describe("Node type to get examples for (e.g., 'n8n-nodes-base.httpRequest')"),
        example_type: z.enum(['minimal', 'common', 'advanced', 'all']).default('all').describe("Type of example to retrieve")
    }),
    execute: async (args) => {
        try {
            const { node_type, example_type } = args;
            if (example_type === 'all') {
                const examples = ExampleGenerator.getAllExamples(node_type);
                if (!examples) {
                    return `No examples available for node type '${node_type}'. Available node types: ${ExampleGenerator.getAvailableNodeTypes().join(', ')}`;
                }
                let response = `**Configuration Examples for ${node_type}:**\n\n`;
                if (examples.minimal) {
                    response += `**Minimal Configuration:**\n\`\`\`json\n${JSON.stringify(examples.minimal, null, 2)}\n\`\`\`\n\n`;
                }
                if (examples.common) {
                    response += `**Common Configuration:**\n\`\`\`json\n${JSON.stringify(examples.common, null, 2)}\n\`\`\`\n\n`;
                }
                if (examples.advanced) {
                    response += `**Advanced Configuration:**\n\`\`\`json\n${JSON.stringify(examples.advanced, null, 2)}\n\`\`\`\n\n`;
                }
                return response;
            }
            else {
                let example = null;
                switch (example_type) {
                    case 'minimal':
                        example = ExampleGenerator.getMinimalExample(node_type);
                        break;
                    case 'common':
                        example = ExampleGenerator.getCommonExample(node_type);
                        break;
                    case 'advanced':
                        example = ExampleGenerator.getAdvancedExample(node_type);
                        break;
                }
                if (!example) {
                    return `No ${example_type} example available for node type '${node_type}'. Available node types: ${ExampleGenerator.getAvailableNodeTypes().join(', ')}`;
                }
                return `**${example_type.charAt(0).toUpperCase() + example_type.slice(1)} Configuration for ${node_type}:**\n\`\`\`json\n${JSON.stringify(example, null, 2)}\n\`\`\``;
            }
        }
        catch (error) {
            logger.error("Error getting node examples:", error);
            return `Error getting node examples: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    },
};
/**
 * Search for node examples by pattern
 */
export const searchNodeExamplesTool = {
    name: "search_node_examples",
    description: "Search for node examples by node type pattern",
    parameters: z.object({
        pattern: z.string().describe("Pattern to search for in node types (e.g., 'http', 'slack', 'google')")
    }),
    execute: async (args) => {
        try {
            const results = ExampleGenerator.searchExamples(args.pattern);
            if (results.length === 0) {
                return `No examples found matching pattern '${args.pattern}'. Available node types: ${ExampleGenerator.getAvailableNodeTypes().join(', ')}`;
            }
            let response = `**Found ${results.length} node examples matching '${args.pattern}':**\n\n`;
            results.forEach((result, index) => {
                response += `${index + 1}. **${result.nodeType}**\n`;
                response += `   - Minimal: ${result.examples.minimal ? '✅' : '❌'}\n`;
                response += `   - Common: ${result.examples.common ? '✅' : '❌'}\n`;
                response += `   - Advanced: ${result.examples.advanced ? '✅' : '❌'}\n\n`;
            });
            return response;
        }
        catch (error) {
            logger.error("Error searching node examples:", error);
            return `Error searching node examples: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    },
};
/**
 * Validate node configuration against examples
 */
export const validateNodeConfigurationTool = {
    name: "validate_node_configuration",
    description: "Validate a node configuration against available examples",
    parameters: z.object({
        node_type: z.string().describe("Node type to validate"),
        configuration: z.record(z.string(), z.any()).describe("Configuration object to validate")
    }),
    execute: async (args) => {
        try {
            const validation = ExampleGenerator.validateConfiguration(args.node_type, args.configuration);
            let response = `**Configuration Validation for ${args.node_type}:**\n\n`;
            response += `**Status:** ${validation.isValid ? '✅ Valid' : '❌ Invalid'}\n\n`;
            if (validation.missingFields.length > 0) {
                response += `**Missing Fields:** ${validation.missingFields.join(', ')}\n`;
            }
            if (validation.extraFields.length > 0) {
                response += `**Extra Fields:** ${validation.extraFields.join(', ')}\n`;
            }
            if (validation.suggestions.length > 0) {
                response += `**Suggestions:**\n`;
                validation.suggestions.forEach(suggestion => {
                    response += `- ${suggestion}\n`;
                });
            }
            return response;
        }
        catch (error) {
            logger.error("Error validating node configuration:", error);
            return `Error validating node configuration: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    },
};
/**
 * Calculate confidence score for resource locator recommendation
 */
export const scoreResourceLocatorTool = {
    name: "score_resource_locator",
    description: "Calculate confidence score for resource locator field recommendations",
    parameters: z.object({
        field_name: z.string().describe("Name of the field"),
        node_type: z.string().describe("Node type containing the field"),
        value: z.string().describe("Current value of the field")
    }),
    execute: async (args) => {
        try {
            const score = ConfidenceScorer.scoreResourceLocatorRecommendation(args.field_name, args.node_type, args.value);
            let response = `**Resource Locator Confidence Score:**\n\n`;
            response += `**Score:** ${Math.round(score.value * 100)}% (${ConfidenceScorer.getConfidenceLevel(score.value)})\n`;
            response += `**Reason:** ${score.reason}\n\n`;
            response += `**Detailed Analysis:**\n`;
            score.factors.forEach(factor => {
                const status = factor.matched ? '✅' : '❌';
                response += `${status} **${factor.name}** (Weight: ${Math.round(factor.weight * 100)}%)\n`;
                response += `   ${factor.description}\n\n`;
            });
            return response;
        }
        catch (error) {
            logger.error("Error scoring resource locator:", error);
            return `Error scoring resource locator: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    },
};
/**
 * Calculate confidence score for node type suggestion
 */
export const scoreNodeTypeSuggestionTool = {
    name: "score_node_type_suggestion",
    description: "Calculate confidence score for node type suggestions",
    parameters: z.object({
        search_term: z.string().describe("Search term used"),
        suggested_node_type: z.string().describe("Suggested node type"),
        context: z.string().describe("Context or use case description")
    }),
    execute: async (args) => {
        try {
            const score = ConfidenceScorer.scoreNodeTypeSuggestion(args.search_term, args.suggested_node_type, args.context);
            let response = `**Node Type Suggestion Confidence Score:**\n\n`;
            response += `**Search Term:** ${args.search_term}\n`;
            response += `**Suggested Node:** ${args.suggested_node_type}\n`;
            response += `**Context:** ${args.context}\n\n`;
            response += `**Score:** ${Math.round(score.value * 100)}% (${ConfidenceScorer.getConfidenceLevel(score.value)})\n`;
            response += `**Reason:** ${score.reason}\n\n`;
            response += `**Detailed Analysis:**\n`;
            score.factors.forEach(factor => {
                const status = factor.matched ? '✅' : '❌';
                response += `${status} **${factor.name}** (Weight: ${Math.round(factor.weight * 100)}%)\n`;
                response += `   ${factor.description}\n\n`;
            });
            return response;
        }
        catch (error) {
            logger.error("Error scoring node type suggestion:", error);
            return `Error scoring node type suggestion: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    },
};
/**
 * Calculate confidence score for workflow validation
 */
export const scoreWorkflowValidationTool = {
    name: "score_workflow_validation",
    description: "Calculate confidence score for workflow validation results",
    parameters: z.object({
        workflow: z.record(z.string(), z.any()).describe("Workflow object to validate"),
        validation_results: z.array(z.record(z.string(), z.any())).describe("Array of validation results")
    }),
    execute: async (args) => {
        try {
            const score = ConfidenceScorer.scoreWorkflowValidation(args.workflow, args.validation_results);
            let response = `**Workflow Validation Confidence Score:**\n\n`;
            response += `**Score:** ${Math.round(score.value * 100)}% (${ConfidenceScorer.getConfidenceLevel(score.value)})\n`;
            response += `**Reason:** ${score.reason}\n\n`;
            response += `**Detailed Analysis:**\n`;
            score.factors.forEach(factor => {
                const status = factor.matched ? '✅' : '❌';
                response += `${status} **${factor.name}** (Weight: ${Math.round(factor.weight * 100)}%)\n`;
                response += `   ${factor.description}\n\n`;
            });
            return response;
        }
        catch (error) {
            logger.error("Error scoring workflow validation:", error);
            return `Error scoring workflow validation: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    },
};
/**
 * Analyze property dependencies
 */
export const analyzePropertyDependenciesTool = {
    name: "analyze_property_dependencies",
    description: "Analyze property dependencies and relationships in a node",
    parameters: z.object({
        properties: z.array(z.record(z.string(), z.any())).describe("Array of node properties to analyze")
    }),
    execute: async (args) => {
        try {
            const analysis = PropertyDependencies.analyze(args.properties);
            let response = `**Property Dependencies Analysis:**\n\n`;
            response += `**Total Properties:** ${analysis.totalProperties}\n`;
            response += `**Properties with Dependencies:** ${analysis.propertiesWithDependencies}\n\n`;
            if (analysis.dependencies.length > 0) {
                response += `**Dependencies:**\n`;
                analysis.dependencies.forEach((dep, index) => {
                    response += `${index + 1}. **${dep.displayName}**\n`;
                    if (dep.dependsOn.length > 0) {
                        response += `   Depends on: ${dep.dependsOn.map(d => `${d.property} (${d.condition})`).join(', ')}\n`;
                    }
                    if (dep.enablesProperties && dep.enablesProperties.length > 0) {
                        response += `   Enables: ${dep.enablesProperties.join(', ')}\n`;
                    }
                    if (dep.disablesProperties && dep.disablesProperties.length > 0) {
                        response += `   Disables: ${dep.disablesProperties.join(', ')}\n`;
                    }
                    response += `\n`;
                });
            }
            if (analysis.suggestions.length > 0) {
                response += `**Suggestions:**\n`;
                analysis.suggestions.forEach(suggestion => {
                    response += `- ${suggestion}\n`;
                });
            }
            return response;
        }
        catch (error) {
            logger.error("Error analyzing property dependencies:", error);
            return `Error analyzing property dependencies: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    },
};
/**
 * Get property groups
 */
export const getPropertyGroupsTool = {
    name: "get_property_groups",
    description: "Get properties that should be configured together",
    parameters: z.object({
        properties: z.array(z.record(z.string(), z.any())).describe("Array of node properties to analyze")
    }),
    execute: async (args) => {
        try {
            const groups = PropertyDependencies.getPropertyGroups(args.properties);
            if (groups.length === 0) {
                return `No property groups found. Properties appear to be independent.`;
            }
            let response = `**Property Groups (${groups.length} found):**\n\n`;
            groups.forEach((group, index) => {
                response += `${index + 1}. **${group.name}**\n`;
                response += `   Properties: ${group.properties.join(', ')}\n`;
                response += `   Description: ${group.description}\n\n`;
            });
            return response;
        }
        catch (error) {
            logger.error("Error getting property groups:", error);
            return `Error getting property groups: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    },
};
/**
 * Validate property configuration
 */
export const validatePropertyConfigurationTool = {
    name: "validate_property_configuration",
    description: "Validate a property configuration against its dependencies",
    parameters: z.object({
        property_name: z.string().describe("Name of the property to validate"),
        value: z.any().describe("Value of the property"),
        all_properties: z.array(z.record(z.string(), z.any())).describe("All properties in the node"),
        current_values: z.record(z.string(), z.any()).describe("Current values of all properties")
    }),
    execute: async (args) => {
        try {
            const validation = PropertyDependencies.validatePropertyConfiguration(args.property_name, args.value, args.all_properties, args.current_values);
            let response = `**Property Configuration Validation:**\n\n`;
            response += `**Property:** ${args.property_name}\n`;
            response += `**Value:** ${JSON.stringify(args.value)}\n`;
            response += `**Status:** ${validation.isValid ? '✅ Valid' : '❌ Invalid'}\n\n`;
            if (validation.errors.length > 0) {
                response += `**Errors:**\n`;
                validation.errors.forEach(error => {
                    response += `- ${error}\n`;
                });
                response += `\n`;
            }
            if (validation.warnings.length > 0) {
                response += `**Warnings:**\n`;
                validation.warnings.forEach(warning => {
                    response += `- ${warning}\n`;
                });
                response += `\n`;
            }
            if (validation.suggestions.length > 0) {
                response += `**Suggestions:**\n`;
                validation.suggestions.forEach(suggestion => {
                    response += `- ${suggestion}\n`;
                });
            }
            return response;
        }
        catch (error) {
            logger.error("Error validating property configuration:", error);
            return `Error validating property configuration: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    },
};
// Export all advanced services tools
export const advancedServicesTools = [
    getNodeExamplesTool,
    searchNodeExamplesTool,
    validateNodeConfigurationTool,
    scoreResourceLocatorTool,
    scoreNodeTypeSuggestionTool,
    scoreWorkflowValidationTool,
    analyzePropertyDependenciesTool,
    getPropertyGroupsTool,
    validatePropertyConfigurationTool,
];
//# sourceMappingURL=advanced-services-tools.js.map