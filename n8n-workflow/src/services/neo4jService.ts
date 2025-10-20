import neo4j, { Driver, Session } from 'neo4j-driver';
import { logger } from '../utils/logger';
import { N8nWorkflow, WorkflowMetadata } from '../types/workflow';

export interface Neo4jConfig {
  uri: string;
  username: string;
  password: string;
}

export class Neo4jService {
  private driver: Driver;
  private logger = logger.child({ context: 'Neo4jService' });

  constructor(config: Neo4jConfig) {
    this.driver = neo4j.driver(config.uri, neo4j.auth.basic(config.username, config.password));
  }

  public async initialize(): Promise<void> {
    try {
      // Test connection
      const session = this.driver.session();
      await session.run('RETURN 1');
      await session.close();
      
      this.logger.info('Neo4j service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Neo4j service:', error);
      throw new Error(`Failed to initialize Neo4j service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async storeWorkflow(workflow: N8nWorkflow, metadata: WorkflowMetadata): Promise<void> {
    const session = this.driver.session();
    
    try {
      await session.executeWrite(async (txc) => {
        // Create workflow node
        await txc.run(
          `
          MERGE (w:Workflow {id: $id})
          ON CREATE SET 
            w.name = $name,
            w.category = $category,
            w.description = $description,
            w.tags = $tags,
            w.complexity = $complexity,
            w.createdAt = datetime()
          ON MATCH SET 
            w.name = $name,
            w.category = $category,
            w.description = $description,
            w.tags = $tags,
            w.complexity = $complexity,
            w.updatedAt = datetime()
          `,
          {
            id: workflow.id,
            name: workflow.name,
            category: metadata.category || 'unknown',
            description: metadata.description || '',
            tags: metadata.tags || [],
            complexity: metadata.complexity || 'moderate'
          }
        );

        // Create node entities and relationships
        for (const node of workflow.nodes || []) {
          await txc.run(
            `
            MERGE (n:Node {id: $nodeId})
            ON CREATE SET 
              n.name = $name,
              n.type = $type,
              n.position = $position,
              n.parameters = $parameters
            ON MATCH SET 
              n.name = $name,
              n.type = $type,
              n.position = $position,
              n.parameters = $parameters
            `,
            {
              nodeId: node.id,
              name: node.name,
              type: node.type,
              position: node.position,
              parameters: node.parameters || {}
            }
          );

          // Connect workflow to node
          await txc.run(
            `
            MATCH (w:Workflow {id: $workflowId})
            MATCH (n:Node {id: $nodeId})
            MERGE (w)-[:CONTAINS]->(n)
            `,
            {
              workflowId: workflow.id,
              nodeId: node.id
            }
          );
        }

        // Create connections between nodes
        for (const [sourceNodeId, connections] of Object.entries(workflow.connections || {})) {
          for (const connection of connections.main || []) {
            for (const target of connection) {
              await txc.run(
                `
                MATCH (source:Node {id: $sourceId})
                MATCH (target:Node {id: $targetId})
                MERGE (source)-[:CONNECTS_TO {sourceOutput: $sourceOutput, targetInput: $targetInput}]->(target)
                `,
                {
                  sourceId: sourceNodeId,
                  targetId: target.node,
                  sourceOutput: connection[0]?.index || 0,
                  targetInput: target.index || 0
                }
              );
            }
          }
        }
      });

      this.logger.info(`Workflow ${workflow.id} stored in Neo4j successfully`);
    } catch (error) {
      this.logger.error('Failed to store workflow in Neo4j:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  public async getWorkflow(id: string): Promise<N8nWorkflow | null> {
    const session = this.driver.session();
    
    try {
      const result = await session.run(
        `
        MATCH (w:Workflow {id: $id})
        OPTIONAL MATCH (w)-[:CONTAINS]->(n:Node)
        RETURN w, collect(n) as nodes
        `,
        { id }
      );

      if (result.records.length === 0) {
        return null;
      }

      const record = result.records[0];
      const workflowData = record.get('w').properties;
      const nodes = record.get('nodes').map((node: any) => ({
        id: node.properties.id,
        name: node.properties.name,
        type: node.properties.type,
        position: node.properties.position,
        parameters: node.properties.parameters || {}
      }));

      // Get connections
      const connectionsResult = await session.run(
        `
        MATCH (source:Node)-[r:CONNECTS_TO]->(target:Node)
        WHERE source.id IN $nodeIds
        RETURN source.id as sourceId, target.id as targetId, r.sourceOutput as sourceOutput, r.targetInput as targetInput
        `,
        { nodeIds: nodes.map((n: any) => n.id) }
      );

      const connections: any = {};
      connectionsResult.records.forEach(record => {
        const sourceId = record.get('sourceId');
        const targetId = record.get('targetId');
        const sourceOutput = record.get('sourceOutput');
        const targetInput = record.get('targetInput');

        if (!connections[sourceId]) {
          connections[sourceId] = { main: [] };
        }
        connections[sourceId].main.push([{
          node: targetId,
          type: 'main',
          index: targetInput
        }]);
      });

      return {
        id: workflowData.id,
        name: workflowData.name,
        nodes,
        connections,
        active: false,
        settings: {},
        versionId: '1'
      } as N8nWorkflow;
    } catch (error) {
      this.logger.error('Failed to get workflow from Neo4j:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  public async searchWorkflows(filters: {
    category?: string;
    tags?: string[];
    complexity?: string;
    nodeTypes?: string[];
    limit?: number;
  }): Promise<N8nWorkflow[]> {
    const session = this.driver.session();
    
    try {
      let query = `
        MATCH (w:Workflow)
        WHERE 1=1
      `;
      const params: any = {};

      if (filters.category) {
        query += ` AND w.category = $category`;
        params.category = filters.category;
      }

      if (filters.tags && filters.tags.length > 0) {
        query += ` AND ANY(tag IN $tags WHERE tag IN w.tags)`;
        params.tags = filters.tags;
      }

      if (filters.complexity) {
        query += ` AND w.complexity = $complexity`;
        params.complexity = filters.complexity;
      }

      if (filters.nodeTypes && filters.nodeTypes.length > 0) {
        query += `
          AND EXISTS {
            MATCH (w)-[:CONTAINS]->(n:Node)
            WHERE n.type IN $nodeTypes
          }
        `;
        params.nodeTypes = filters.nodeTypes;
      }

      query += `
        OPTIONAL MATCH (w)-[:CONTAINS]->(n:Node)
        RETURN w, collect(n) as nodes
        ORDER BY w.createdAt DESC
      `;

      if (filters.limit) {
        query += ` LIMIT $limit`;
        params.limit = filters.limit;
      }

      const result = await session.run(query, params);
      
      return result.records.map(record => {
        const workflowData = record.get('w').properties;
        const nodes = record.get('nodes').map((node: any) => ({
          id: node.properties.id,
          name: node.properties.name,
          type: node.properties.type,
          position: node.properties.position,
          parameters: node.properties.parameters || {}
        }));

        return {
          id: workflowData.id,
          name: workflowData.name,
          nodes,
          connections: {},
          active: false,
          settings: {},
          versionId: '1'
        } as N8nWorkflow;
      });
    } catch (error) {
      this.logger.error('Failed to search workflows in Neo4j:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  public async getWorkflowRelationships(workflowId: string, relationshipType: 'nodes' | 'similar'): Promise<any> {
    const session = this.driver.session();
    
    try {
      if (relationshipType === 'nodes') {
        const result = await session.run(
          `
          MATCH (w:Workflow {id: $workflowId})-[:CONTAINS]->(n:Node)
          RETURN n
          `,
          { workflowId }
        );

        return result.records.map(record => record.get('n').properties);
      } else if (relationshipType === 'similar') {
        const result = await session.run(
          `
          MATCH (w:Workflow {id: $workflowId})-[:CONTAINS]->(n:Node)-[:CONNECTS_TO]->(target:Node)<-[:CONTAINS]-(similar:Workflow)
          WHERE similar.id <> $workflowId
          RETURN DISTINCT similar, count(*) as similarity
          ORDER BY similarity DESC
          LIMIT 10
          `,
          { workflowId }
        );

        return result.records.map(record => ({
          workflow: record.get('similar').properties,
          similarity: record.get('similarity').toNumber()
        }));
      }
    } catch (error) {
      this.logger.error('Failed to get workflow relationships:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  public async getWorkflowCategories(): Promise<string[]> {
    const session = this.driver.session();
    
    try {
      const result = await session.run(
        `
        MATCH (w:Workflow)
        WHERE w.category IS NOT NULL
        RETURN DISTINCT w.category as category
        ORDER BY category
        `
      );

      return result.records.map(record => record.get('category'));
    } catch (error) {
      this.logger.error('Failed to get workflow categories:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  public async getWorkflowTags(): Promise<string[]> {
    const session = this.driver.session();
    
    try {
      const result = await session.run(
        `
        MATCH (w:Workflow)
        WHERE w.tags IS NOT NULL
        UNWIND w.tags as tag
        RETURN DISTINCT tag
        ORDER BY tag
        `
      );

      return result.records.map(record => record.get('tag'));
    } catch (error) {
      this.logger.error('Failed to get workflow tags:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  public async deleteWorkflow(id: string): Promise<void> {
    const session = this.driver.session();
    
    try {
      await session.executeWrite(async (txc) => {
        // Delete all relationships and nodes
        await txc.run(
          `
          MATCH (w:Workflow {id: $id})
          OPTIONAL MATCH (w)-[:CONTAINS]->(n:Node)
          OPTIONAL MATCH (n)-[r:CONNECTS_TO]-()
          DELETE r, n, w
          `,
          { id }
        );
      });

      this.logger.info(`Workflow ${id} deleted from Neo4j successfully`);
    } catch (error) {
      this.logger.error('Failed to delete workflow from Neo4j:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  public async close(): Promise<void> {
    await this.driver.close();
  }
}



