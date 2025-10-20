import type { z } from "zod";
/**
 * Custom error class for HTTP-related errors.
 *
 * Extends the standard Error class to include HTTP status codes and
 * optional response data for better error handling and debugging.
 */
export declare class HttpError extends Error {
    readonly status: number;
    readonly data?: unknown | undefined;
    constructor(status: number, message: string, data?: unknown | undefined);
}
/**
 * Utility function for making HTTP requests with JSON response parsing and validation.
 *
 * Performs a fetch request and automatically parses the JSON response.
 * Optionally validates the response data against a Zod schema for type safety.
 * Throws HttpError for non-OK responses and validation errors.
 *
 * @param url - URL to fetch from
 * @param options - Optional fetch configuration
 * @param schema - Optional Zod schema for response validation
 * @returns Promise resolving to parsed and validated JSON data
 * @throws HttpError for HTTP errors or validation failures
 */
export declare function fetchJson<T>(url: string, options?: RequestInit, schema?: z.ZodType<T>): Promise<T>;
