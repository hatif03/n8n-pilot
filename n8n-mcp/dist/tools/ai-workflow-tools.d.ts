import { z } from 'zod';
/**
 * Compose AI workflow tool
 */
export declare const composeAiWorkflowTool: {
    name: string;
    description: string;
    parameters: z.ZodObject<{
        workflow_name: z.ZodString;
        plan: z.ZodString;
        n8n_version: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    execute: (args: {
        workflow_name: string;
        plan: string;
        n8n_version?: string;
    }) => Promise<string>;
};
