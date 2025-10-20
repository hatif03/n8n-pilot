import fs from 'fs/promises';
import path from 'path';
import { N8nNodeDefinition } from '../types.js';

export class NodeDiscoveryService {
  private nodesDir: string;
  private nodeCache: Map<string, N8nNodeDefinition[]> = new Map();
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

  constructor(nodesDir: string = '../n8n-workflow-builder-mcp-main/workflow_nodes') {
    this.nodesDir = nodesDir;
  }

  /**
   * Get available n8n versions
   */
  async getAvailableVersions(): Promise<string[]> {
    try {
      const entries = await fs.readdir(this.nodesDir);
      return entries
        .filter(entry => /^\d+\.\d+\.\d+$/.test(entry))
        .sort((a, b) => this.compareVersions(b, a)); // Sort descending
    } catch {
      return [];
    }
  }

  /**
   * Compare two version strings
   */
  private compareVersions(a: string, b: string): number {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;
      
      if (aPart !== bPart) {
        return aPart - bPart;
      }
    }
    
    return 0;
  }

  /**
   * Find the best matching version for a target version
   */
  findBestMatchingVersion(targetVersion: string, availableVersions: string[]): string | null {
    if (availableVersions.length === 0) {
      return null;
    }

    // Check for exact match first
    if (availableVersions.includes(targetVersion)) {
      return targetVersion;
    }

    // Find all versions that are less than or equal to target version
    const candidateVersions = availableVersions.filter(version => {
      return this.compareVersions(version, targetVersion) <= 0;
    });

    if (candidateVersions.length === 0) {
      return null;
    }

    // Return the highest (closest to target) version
    return candidateVersions.sort((a, b) => this.compareVersions(b, a))[0];
  }

  /**
   * Load nodes for a specific version
   */
  async loadNodesForVersion(version: string): Promise<N8nNodeDefinition[]> {
    const cacheKey = version;
    const now = Date.now();

    // Check cache
    if (this.nodeCache.has(cacheKey) && (now - this.cacheTimestamp) < this.CACHE_TTL_MS) {
      return this.nodeCache.get(cacheKey)!;
    }

    try {
      const versionDir = path.join(this.nodesDir, version);
      const files = await fs.readdir(versionDir);
      const nodeFiles = files.filter(file => file.endsWith('.json'));

      const nodes: N8nNodeDefinition[] = [];
      
      for (const file of nodeFiles) {
        try {
          const filePath = path.join(versionDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const nodeDef = JSON.parse(content) as N8nNodeDefinition;
          nodes.push(nodeDef);
        } catch (error) {
          console.warn(`Failed to load node file ${file}:`, error);
        }
      }

      // Update cache
      this.nodeCache.set(cacheKey, nodes);
      this.cacheTimestamp = now;

      return nodes;
    } catch (error) {
      console.warn(`Failed to load nodes for version ${version}:`, error);
      return [];
    }
  }

  /**
   * Search for nodes with various filters
   */
  async searchNodes(params: {
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
  }> {
    const {
      search_term = '',
      n8n_version,
      limit = 50,
      cursor = '0',
      tags = true,
      token_logic = 'or'
    } = params;

    // Get available versions
    const availableVersions = await this.getAvailableVersions();
    let targetVersion = n8n_version;

    // Find best matching version
    if (targetVersion) {
      const bestMatch = this.findBestMatchingVersion(targetVersion, availableVersions);
      if (bestMatch) {
        targetVersion = bestMatch;
      } else {
        targetVersion = availableVersions[0]; // Use latest if no match
      }
    } else {
      targetVersion = availableVersions[0]; // Use latest
    }

    // Load nodes for the target version
    const allNodes = await this.loadNodesForVersion(targetVersion);

    // Apply search filters
    let filteredNodes = allNodes;

    if (search_term) {
      const searchTokens = search_term.toLowerCase().split(/\s+/);
      
      filteredNodes = allNodes.filter(node => {
        const searchableText = [
          node.name,
          node.displayName,
          node.description,
          ...(node.codex?.categories || []),
          ...(node.group || []),
          ...(tags ? Object.keys(node.codex?.subcategories || {}) : [])
        ].join(' ').toLowerCase();

        if (token_logic === 'and') {
          return searchTokens.every(token => searchableText.includes(token));
        } else {
          return searchTokens.some(token => searchableText.includes(token));
        }
      });
    }

    // Apply pagination
    const startIndex = parseInt(cursor, 10);
    const endIndex = startIndex + limit;
    const paginatedNodes = filteredNodes.slice(startIndex, endIndex);
    const hasMore = endIndex < filteredNodes.length;
    const nextCursor = hasMore ? endIndex.toString() : undefined;

    return {
      nodes: paginatedNodes,
      total: filteredNodes.length,
      hasMore,
      nextCursor,
    };
  }

  /**
   * Get node categories
   */
  async getNodeCategories(version?: string): Promise<{
    categories: string[];
    subcategories: Record<string, string[]>;
  }> {
    const availableVersions = await this.getAvailableVersions();
    const targetVersion = version || availableVersions[0];
    
    const nodes = await this.loadNodesForVersion(targetVersion);
    
    const categories = new Set<string>();
    const subcategories: Record<string, Set<string>> = {};

    nodes.forEach(node => {
      if (node.codex?.categories) {
        node.codex.categories.forEach(category => {
          categories.add(category);
        });
      }

      if (node.codex?.subcategories) {
        Object.entries(node.codex.subcategories).forEach(([category, subs]) => {
          if (!subcategories[category]) {
            subcategories[category] = new Set();
          }
          subs.forEach(sub => subcategories[category].add(sub));
        });
      }
    });

    return {
      categories: Array.from(categories).sort(),
      subcategories: Object.fromEntries(
        Object.entries(subcategories).map(([key, value]) => [key, Array.from(value).sort()])
      ),
    };
  }

  /**
   * Get a specific node definition
   */
  async getNodeDefinition(nodeType: string, version?: string): Promise<N8nNodeDefinition | null> {
    const availableVersions = await this.getAvailableVersions();
    const targetVersion = version || availableVersions[0];
    
    const nodes = await this.loadNodesForVersion(targetVersion);
    return nodes.find(node => node.name === nodeType) || null;
  }
}
