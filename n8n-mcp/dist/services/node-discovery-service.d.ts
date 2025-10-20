import { N8nNodeDefinition } from '../types.js';
export declare class NodeDiscoveryService {
    private nodesDir;
    private nodeCache;
    private cacheTimestamp;
    private readonly CACHE_TTL_MS;
    constructor(nodesDir?: string);
    /**
     * Get available n8n versions
     */
    getAvailableVersions(): Promise<string[]>;
    /**
     * Compare two version strings
     */
    private compareVersions;
    /**
     * Find the best matching version for a target version
     */
    findBestMatchingVersion(targetVersion: string, availableVersions: string[]): string | null;
    /**
     * Load nodes for a specific version
     */
    loadNodesForVersion(version: string): Promise<N8nNodeDefinition[]>;
    /**
     * Search for nodes with various filters
     */
    searchNodes(params: {
        search_term?: string;
        n8n_version?: string;
        limit?: number;
        cursor?: string;
        tags?: boolean;
        token_logic?: 'or' | 'and';
    }): Promise<{
        nodes: N8nNodeDefinition[];
        total: number;
        hasMore: boolean;
        nextCursor?: string;
    }>;
    /**
     * Get node categories
     */
    getNodeCategories(version?: string): Promise<{
        categories: string[];
        subcategories: Record<string, string[]>;
    }>;
    /**
     * Get a specific node definition
     */
    getNodeDefinition(nodeType: string, version?: string): Promise<N8nNodeDefinition | null>;
}
