/**
 * Property Dependencies Service
 *
 * Analyzes property dependencies and visibility conditions.
 * Helps AI agents understand which properties affect others.
 */
export interface PropertyDependency {
    property: string;
    displayName: string;
    dependsOn: DependencyCondition[];
    showWhen?: Record<string, any>;
    hideWhen?: Record<string, any>;
    enablesProperties?: string[];
    disablesProperties?: string[];
    notes?: string[];
}
export interface DependencyCondition {
    property: string;
    values: any[];
    condition: 'equals' | 'not_equals' | 'includes' | 'not_includes';
    description?: string;
}
export interface DependencyAnalysis {
    totalProperties: number;
    propertiesWithDependencies: number;
    dependencies: PropertyDependency[];
    dependencyGraph: Record<string, string[]>;
    suggestions: string[];
}
export declare class PropertyDependencies {
    /**
     * Analyze property dependencies for a node
     */
    static analyze(properties: any[]): DependencyAnalysis;
    /**
     * Extract dependency information from a property
     */
    private static extractDependency;
    /**
     * Parse display conditions into dependency conditions
     */
    private static parseDisplayConditions;
    /**
     * Convert conditions to object format
     */
    private static conditionsToObject;
    /**
     * Find complex dependencies (e.g., conditional logic)
     */
    private static findComplexDependencies;
    /**
     * Find properties that depend on a given property
     */
    private static findDependentProperties;
    /**
     * Check if a property is referenced in conditions
     */
    private static propertyInConditions;
    /**
     * Generate suggestions based on dependencies
     */
    private static generateSuggestions;
    /**
     * Topological sort for dependency ordering
     */
    private static topologicalSort;
    /**
     * Get dependencies for a specific property
     */
    static getPropertyDependencies(propertyName: string, properties: any[]): PropertyDependency | null;
    /**
     * Check if a property configuration is valid based on dependencies
     */
    static validatePropertyConfiguration(propertyName: string, value: any, allProperties: any[], currentValues: Record<string, any>): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
        suggestions: string[];
    };
    /**
     * Check if conditions are met
     */
    private static checkConditions;
    /**
     * Get dependency chain for a property
     */
    static getDependencyChain(propertyName: string, properties: any[]): string[];
    /**
     * Get properties that should be configured together
     */
    static getPropertyGroups(properties: any[]): Array<{
        name: string;
        properties: string[];
        description: string;
    }>;
}
