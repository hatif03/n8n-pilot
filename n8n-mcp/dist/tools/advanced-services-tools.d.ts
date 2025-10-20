import { z } from "zod";
/**
 * Get node configuration examples
 */
export declare const getNodeExamplesTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        node_type: z.ZodString;
        example_type: z.ZodDefault<z.ZodEnum<{
            common: "common";
            advanced: "advanced";
            minimal: "minimal";
            all: "all";
        }>>;
    }, z.core.$strip>;
    execute: (args: any) => Promise<string>;
};
/**
 * Search for node examples by pattern
 */
export declare const searchNodeExamplesTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        pattern: z.ZodString;
    }, z.core.$strip>;
    execute: (args: any) => Promise<string>;
};
/**
 * Validate node configuration against examples
 */
export declare const validateNodeConfigurationTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        node_type: z.ZodString;
        configuration: z.ZodRecord<z.ZodString, z.ZodAny>;
    }, z.core.$strip>;
    execute: (args: any) => Promise<string>;
};
/**
 * Calculate confidence score for resource locator recommendation
 */
export declare const scoreResourceLocatorTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        field_name: z.ZodString;
        node_type: z.ZodString;
        value: z.ZodString;
    }, z.core.$strip>;
    execute: (args: any) => Promise<string>;
};
/**
 * Calculate confidence score for node type suggestion
 */
export declare const scoreNodeTypeSuggestionTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        search_term: z.ZodString;
        suggested_node_type: z.ZodString;
        context: z.ZodString;
    }, z.core.$strip>;
    execute: (args: any) => Promise<string>;
};
/**
 * Calculate confidence score for workflow validation
 */
export declare const scoreWorkflowValidationTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        workflow: z.ZodRecord<z.ZodString, z.ZodAny>;
        validation_results: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, z.core.$strip>;
    execute: (args: any) => Promise<string>;
};
/**
 * Analyze property dependencies
 */
export declare const analyzePropertyDependenciesTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        properties: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, z.core.$strip>;
    execute: (args: any) => Promise<string>;
};
/**
 * Get property groups
 */
export declare const getPropertyGroupsTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        properties: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, z.core.$strip>;
    execute: (args: any) => Promise<string>;
};
/**
 * Validate property configuration
 */
export declare const validatePropertyConfigurationTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        property_name: z.ZodString;
        value: z.ZodAny;
        all_properties: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodAny>>;
        current_values: z.ZodRecord<z.ZodString, z.ZodAny>;
    }, z.core.$strip>;
    execute: (args: any) => Promise<string>;
};
export declare const advancedServicesTools: ({
    name: string;
    description: string;
    parameters: z.ZodObject<{
        node_type: z.ZodString;
        example_type: z.ZodDefault<z.ZodEnum<{
            common: "common";
            advanced: "advanced";
            minimal: "minimal";
            all: "all";
        }>>;
    }, z.core.$strip>;
    execute: (args: any) => Promise<string>;
} | {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        pattern: z.ZodString;
    }, z.core.$strip>;
    execute: (args: any) => Promise<string>;
} | {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        node_type: z.ZodString;
        configuration: z.ZodRecord<z.ZodString, z.ZodAny>;
    }, z.core.$strip>;
    execute: (args: any) => Promise<string>;
} | {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        field_name: z.ZodString;
        node_type: z.ZodString;
        value: z.ZodString;
    }, z.core.$strip>;
    execute: (args: any) => Promise<string>;
} | {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        search_term: z.ZodString;
        suggested_node_type: z.ZodString;
        context: z.ZodString;
    }, z.core.$strip>;
    execute: (args: any) => Promise<string>;
} | {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        workflow: z.ZodRecord<z.ZodString, z.ZodAny>;
        validation_results: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, z.core.$strip>;
    execute: (args: any) => Promise<string>;
} | {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        properties: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, z.core.$strip>;
    execute: (args: any) => Promise<string>;
} | {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        property_name: z.ZodString;
        value: z.ZodAny;
        all_properties: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodAny>>;
        current_values: z.ZodRecord<z.ZodString, z.ZodAny>;
    }, z.core.$strip>;
    execute: (args: any) => Promise<string>;
})[];
