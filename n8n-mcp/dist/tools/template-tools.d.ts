import { z } from "zod";
/**
 * List available workflow templates
 */
export declare const listTemplatesTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        limit: z.ZodDefault<z.ZodNumber>;
        offset: z.ZodDefault<z.ZodNumber>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
        complexity: z.ZodOptional<z.ZodEnum<{
            simple: "simple";
            medium: "medium";
            complex: "complex";
        }>>;
        use_cases: z.ZodOptional<z.ZodArray<z.ZodString>>;
        required_services: z.ZodOptional<z.ZodArray<z.ZodString>>;
        target_audience: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>;
    execute: (args: any) => Promise<string>;
};
/**
 * Search templates with advanced filtering
 */
export declare const searchTemplatesTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        query: z.ZodOptional<z.ZodString>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
        complexity: z.ZodOptional<z.ZodEnum<{
            simple: "simple";
            medium: "medium";
            complex: "complex";
        }>>;
        use_cases: z.ZodOptional<z.ZodArray<z.ZodString>>;
        required_services: z.ZodOptional<z.ZodArray<z.ZodString>>;
        target_audience: z.ZodOptional<z.ZodArray<z.ZodString>>;
        limit: z.ZodDefault<z.ZodNumber>;
        offset: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>;
    execute: (args: any) => Promise<string>;
};
/**
 * Get detailed information about a specific template
 */
export declare const getTemplateTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        template_id: z.ZodString;
        include_workflow: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>;
    execute: (args: any) => Promise<string>;
};
/**
 * Find templates that use specific node types
 */
export declare const listNodeTemplatesTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        node_types: z.ZodArray<z.ZodString>;
        limit: z.ZodDefault<z.ZodNumber>;
        offset: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>;
    execute: (args: any) => Promise<string>;
};
/**
 * Get templates for a specific task
 */
export declare const getTemplatesForTaskTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        task: z.ZodString;
        limit: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>;
    execute: (args: any) => Promise<string>;
};
/**
 * Get template categories and statistics
 */
export declare const getTemplateStatsTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{}, z.core.$strip>;
    execute: () => Promise<string>;
};
export declare const templateTools: ({
    name: string;
    description: string;
    parameters: z.ZodObject<{
        limit: z.ZodDefault<z.ZodNumber>;
        offset: z.ZodDefault<z.ZodNumber>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString>>;
        complexity: z.ZodOptional<z.ZodEnum<{
            simple: "simple";
            medium: "medium";
            complex: "complex";
        }>>;
        use_cases: z.ZodOptional<z.ZodArray<z.ZodString>>;
        required_services: z.ZodOptional<z.ZodArray<z.ZodString>>;
        target_audience: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>;
    execute: (args: any) => Promise<string>;
} | {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        template_id: z.ZodString;
        include_workflow: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>;
    execute: (args: any) => Promise<string>;
} | {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        node_types: z.ZodArray<z.ZodString>;
        limit: z.ZodDefault<z.ZodNumber>;
        offset: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>;
    execute: (args: any) => Promise<string>;
} | {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        task: z.ZodString;
        limit: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>;
    execute: (args: any) => Promise<string>;
} | {
    name: string;
    description: string;
    parameters: z.ZodObject<{}, z.core.$strip>;
    execute: () => Promise<string>;
})[];
