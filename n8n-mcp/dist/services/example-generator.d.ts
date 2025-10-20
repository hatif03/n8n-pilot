/**
 * Example Generator Service
 *
 * Provides concrete, working examples for n8n nodes to help AI agents
 * understand how to configure them properly.
 */
export interface NodeExamples {
    minimal: Record<string, any>;
    common?: Record<string, any>;
    advanced?: Record<string, any>;
}
export declare class ExampleGenerator {
    /**
     * Curated examples for the most commonly used nodes.
     * Each example is a valid configuration that can be used directly.
     */
    private static NODE_EXAMPLES;
    /**
     * Get examples for a specific node type
     */
    static getExamples(nodeType: string): NodeExamples | null;
    /**
     * Get all available node types with examples
     */
    static getAvailableNodeTypes(): string[];
    /**
     * Get minimal example for a node
     */
    static getMinimalExample(nodeType: string): Record<string, any> | null;
    /**
     * Get common example for a node
     */
    static getCommonExample(nodeType: string): Record<string, any> | null;
    /**
     * Get advanced example for a node
     */
    static getAdvancedExample(nodeType: string): Record<string, any> | null;
    /**
     * Get all examples for a node type
     */
    static getAllExamples(nodeType: string): {
        minimal?: Record<string, any>;
        common?: Record<string, any>;
        advanced?: Record<string, any>;
    } | null;
    /**
     * Search for examples by node type pattern
     */
    static searchExamples(pattern: string): Array<{
        nodeType: string;
        examples: NodeExamples;
    }>;
    /**
     * Get examples for multiple node types
     */
    static getBulkExamples(nodeTypes: string[]): Record<string, NodeExamples | null>;
    /**
     * Validate if a configuration matches an example
     */
    static validateConfiguration(nodeType: string, config: Record<string, any>): {
        isValid: boolean;
        missingFields: string[];
        extraFields: string[];
        suggestions: string[];
    };
}
