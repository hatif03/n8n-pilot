import { z } from 'zod';
/**
 * Add a node to a workflow tool
 */
export declare const addNodeTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        workflow_name: z.ZodString;
        node_type: z.ZodString;
        position: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
        parameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        node_name: z.ZodOptional<z.ZodString>;
        typeVersion: z.ZodOptional<z.ZodNumber>;
        webhookId: z.ZodOptional<z.ZodString>;
        workflow_path: z.ZodOptional<z.ZodString>;
        connect_from: z.ZodOptional<z.ZodString>;
        connect_to: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    execute: (args: {
        workflow_name: string;
        node_type: string;
        position?: [number, number];
        parameters?: Record<string, any>;
        node_name?: string;
        typeVersion?: number;
        webhookId?: string;
        workflow_path?: string;
        connect_from?: string;
        connect_to?: string;
    }) => Promise<string>;
};
/**
 * Edit a node in a workflow tool
 */
export declare const editNodeTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        workflow_name: z.ZodString;
        node_id: z.ZodString;
        node_type: z.ZodOptional<z.ZodString>;
        node_name: z.ZodOptional<z.ZodString>;
        position: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
        parameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        typeVersion: z.ZodOptional<z.ZodNumber>;
        webhookId: z.ZodOptional<z.ZodString>;
        workflow_path: z.ZodOptional<z.ZodString>;
        connect_from: z.ZodOptional<z.ZodString>;
        connect_to: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    execute: (args: {
        workflow_name: string;
        node_id: string;
        node_type?: string;
        node_name?: string;
        position?: [number, number];
        parameters?: Record<string, any>;
        typeVersion?: number;
        webhookId?: string;
        workflow_path?: string;
        connect_from?: string;
        connect_to?: string;
    }) => Promise<string>;
};
/**
 * Delete a node from a workflow tool
 */
export declare const deleteNodeTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        workflow_name: z.ZodString;
        node_id: z.ZodString;
        workflow_path: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    execute: (args: {
        workflow_name: string;
        node_id: string;
        workflow_path?: string;
    }) => Promise<string>;
};
/**
 * List available nodes tool
 */
export declare const listAvailableNodesTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        search_term: z.ZodOptional<z.ZodString>;
        n8n_version: z.ZodOptional<z.ZodString>;
        limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        cursor: z.ZodOptional<z.ZodString>;
        tags: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        token_logic: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            or: "or";
            and: "and";
        }>>>;
    }, z.core.$strip>;
    execute: (args: {
        search_term?: string;
        n8n_version?: string;
        limit?: number;
        cursor?: string;
        tags?: boolean;
        token_logic?: "or" | "and";
    }) => Promise<string>;
};
/**
 * Get n8n version info tool
 */
export declare const getN8nVersionInfoTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        random_string: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    execute: (args: {
        random_string?: string;
    }) => Promise<string>;
};
