import { z } from 'zod';
/**
 * Add a connection between two nodes tool
 */
export declare const addConnectionTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        workflow_name: z.ZodString;
        source_node_id: z.ZodString;
        source_node_output_name: z.ZodString;
        target_node_id: z.ZodString;
        target_node_input_name: z.ZodString;
        target_node_input_index: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        workflow_path: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    execute: (args: {
        workflow_name: string;
        source_node_id: string;
        source_node_output_name: string;
        target_node_id: string;
        target_node_input_name: string;
        target_node_input_index?: number;
        workflow_path?: string;
    }) => Promise<string>;
};
/**
 * Remove a connection between two nodes tool
 */
export declare const removeConnectionTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        workflow_name: z.ZodString;
        source_node_id: z.ZodString;
        source_node_output_name: z.ZodString;
        target_node_id: z.ZodString;
        target_node_input_name: z.ZodString;
        target_node_input_index: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        workflow_path: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    execute: (args: {
        workflow_name: string;
        source_node_id: string;
        source_node_output_name: string;
        target_node_id: string;
        target_node_input_name: string;
        target_node_input_index?: number;
        workflow_path?: string;
    }) => Promise<string>;
};
/**
 * Add AI connections tool (for connecting AI components)
 */
export declare const addAiConnectionsTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        workflow_name: z.ZodString;
        agent_node_id: z.ZodString;
        model_node_id: z.ZodOptional<z.ZodString>;
        tool_node_ids: z.ZodOptional<z.ZodArray<z.ZodString>>;
        memory_node_id: z.ZodOptional<z.ZodString>;
        embeddings_node_id: z.ZodOptional<z.ZodString>;
        vector_store_node_id: z.ZodOptional<z.ZodString>;
        vector_insert_node_id: z.ZodOptional<z.ZodString>;
        vector_tool_node_id: z.ZodOptional<z.ZodString>;
        workflow_path: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    execute: (args: {
        workflow_name: string;
        agent_node_id: string;
        model_node_id?: string;
        tool_node_ids?: string[];
        memory_node_id?: string;
        embeddings_node_id?: string;
        vector_store_node_id?: string;
        vector_insert_node_id?: string;
        vector_tool_node_id?: string;
        workflow_path?: string;
    }) => Promise<string>;
};
