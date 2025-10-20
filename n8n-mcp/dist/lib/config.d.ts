/**
 * Configuration object for the MCP weather server.
 *
 * Centralizes all configuration values including API endpoints,
 * authentication keys, and default settings. Reads sensitive values
 * from environment variables for security.
 */
export declare const config: {
    weatherApi: {
        baseUrl: string;
        apiKey: string;
        defaultUnits: string;
    };
};
