import { z } from 'zod';
/**
 * Create a new workflow tool
 */
export declare const createWorkflowTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        workflow_name: z.ZodString;
        workspace_dir: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        active: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, z.core.$strip>;
    execute: (args: {
        workflow_name: string;
        workspace_dir?: string;
        description?: string;
        active?: boolean;
        settings?: Record<string, any>;
    }) => Promise<string>;
};
/**
 * List workflows tool
 */
export declare const listWorkflowsTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        cursor: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    execute: (args: {
        limit?: number;
        cursor?: string;
    }) => Promise<string>;
};
/**
 * Get workflow details tool
 */
export declare const getWorkflowDetailsTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        workflow_name: z.ZodString;
        workflow_path: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    execute: (args: {
        workflow_name: string;
        workflow_path?: string;
    }) => Promise<string>;
};
/**
 * Delete workflow tool
 */
export declare const deleteWorkflowTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        workflow_name: z.ZodString;
    }, z.core.$strip>;
    execute: (args: {
        workflow_name: string;
    }) => Promise<string>;
};
/**
 * Validate workflow tool
 */
export declare const validateWorkflowTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        workflow_name: z.ZodString;
        workflow_path: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    execute: (args: {
        workflow_name: string;
        workflow_path?: string;
    }) => Promise<string>;
};
