import { config } from "dotenv";
import { z } from "zod";

config();

/**
 * Environment variable schema definition for the n8n Workflow Intelligence Platform.
 *
 * Defines and validates required environment variables including:
 * - GOOGLE_API_KEY: Required API key for Google/Gemini model access
 * - N8N_API_KEY: Required API key for n8n instance access
 * - N8N_HOST: n8n instance host URL
 * - Optional database and service configurations
 */
export const envSchema = z.object({
	// Application
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
	LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

	// N8N Configuration
	N8N_HOST: z.string().url().default('http://localhost:5678'),
	N8N_API_KEY: z.string().min(1, 'N8N_API_KEY is required'),

	// AI Services
	GOOGLE_API_KEY: z.string().min(1, 'GOOGLE_API_KEY is required'),
	LLM_MODEL: z.string().default("gemini-2.5-flash"),

	// Optional Database Services
	SUPABASE_URL: z.string().url().optional(),
	SUPABASE_ANON_KEY: z.string().optional(),
	NEO4J_URI: z.string().url().default('bolt://localhost:7687'),
	NEO4J_USERNAME: z.string().default('neo4j'),
	NEO4J_PASSWORD: z.string().optional(),
	QDRANT_URL: z.string().url().default('http://localhost:6333'),
	QDRANT_API_KEY: z.string().optional(),

	// Feature Flags
	ENABLE_VECTOR_SEARCH: z.string().transform(val => val === 'true').default('true'),
	ENABLE_GRAPH_DB: z.string().transform(val => val === 'true').default('true'),
});

/**
 * Validated environment variables parsed from process.env.
 * Throws an error if required environment variables are missing or invalid.
 */
export const env = envSchema.parse(process.env);
