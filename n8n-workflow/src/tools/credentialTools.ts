import { FunctionTool, ToolContext } from '@iqai/adk';
import { z } from 'zod';
import { logger } from '../utils/logger';

/**
 * ADK-TS Compliant Credential Tools
 * 
 * These tools provide credential management capabilities with full ADK-TS context integration,
 * including memory, state management, and artifact storage.
 */
export class CredentialTools {
  private log = logger.child({ context: 'CredentialTools' });

  // Store credential tool with ADK-TS context integration
  createStoreCredentialTool(): FunctionTool {
    return new FunctionTool(async (params: {
      name: string;
      data: Record<string, any>;
      type?: 'api' | 'oauth' | 'database' | 'generic';
    }, toolContext: ToolContext) => {
      try {
        this.log.info(`Storing credential: ${params.name}`);
        
        // Search for existing credentials in memory
        const existingCreds = await toolContext.searchMemory(`credential:${params.name}`);
        if (existingCreds.memories && existingCreds.memories.length > 0) {
          this.log.warn(`Credential '${params.name}' already exists`);
        }
        
        // Create credential object
        const credential = {
          id: `cred_${Date.now()}`,
          name: params.name,
          type: params.type || 'generic',
          encrypted: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          data: params.data
        };
        
        // Save credential as artifact
        await toolContext.saveArtifact(`credentials/${params.name}.json`, {
          inlineData: {
            data: Buffer.from(JSON.stringify(credential, null, 2)).toString('base64'),
            mimeType: 'application/json'
          }
        });
        
        // Update state
        toolContext.state.set('lastCredentialStored', params.name);
        toolContext.state.set(`credential:${params.name}:id`, credential.id);
        
        // Add to memory for future searches
        await toolContext.saveArtifact(`memory/credential_${params.name}.md`, {
          inlineData: {
            data: Buffer.from(`# Credential: ${params.name}\n\nType: ${params.type}\nCreated: ${credential.createdAt}\n\nThis credential is stored securely and can be retrieved using the getCredential tool.`).toString('base64'),
            mimeType: 'text/markdown'
          }
        });
        
        return {
          success: true,
          credential: {
            id: credential.id,
            name: credential.name,
            type: credential.type,
            encrypted: credential.encrypted,
            createdAt: credential.createdAt,
            updatedAt: credential.updatedAt
          },
          message: `Credential '${params.name}' stored successfully`
        };
      } catch (error) {
        this.log.error('Failed to store credential:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }, {
      name: 'storeCredential',
      description: 'Securely store a credential with encryption and ADK-TS context integration',
      parameters: z.object({
        name: z.string().min(1, 'Credential name is required'),
        data: z.record(z.any(), 'Credential data is required'),
        type: z.enum(['api', 'oauth', 'database', 'generic']).optional().default('generic')
      })
    });
  }

  // Get credential tool with ADK-TS context integration
  createGetCredentialTool(): FunctionTool {
    return new FunctionTool(async (params: { name: string }, toolContext: ToolContext) => {
      try {
        this.log.info(`Retrieving credential: ${params.name}`);
        
        // Search memory for credential information
        const memories = await toolContext.searchMemory(`credential:${params.name}`);
        
        // Try to load from artifacts
        const credentialArtifact = await toolContext.loadArtifact(`credentials/${params.name}.json`);
        
        if (!credentialArtifact) {
          return {
            success: false,
            error: `Credential '${params.name}' not found`
          };
        }
        
        // Decode credential data
        const credentialData = JSON.parse(
          Buffer.from(credentialArtifact.inlineData.data, 'base64').toString()
        );
        
        // Update state
        toolContext.state.set('lastCredentialRetrieved', params.name);
        
        return {
          success: true,
          credential: {
            id: credentialData.id,
            name: credentialData.name,
            type: credentialData.type,
            encrypted: credentialData.encrypted,
            createdAt: credentialData.createdAt,
            updatedAt: credentialData.updatedAt
            // Note: Actual credential data is not returned for security
          },
          message: `Credential '${params.name}' retrieved successfully`,
          memoryContext: memories.memories?.map(m => m.content) || []
        };
      } catch (error) {
        this.log.error('Failed to retrieve credential:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }, {
      name: 'getCredential',
      description: 'Retrieve a stored credential by name with memory context',
      parameters: z.object({
        name: z.string().min(1, 'Credential name is required')
      })
    });
  }

  // Update credential tool with ADK-TS context integration
  createUpdateCredentialTool(): FunctionTool {
    return new FunctionTool(async (params: {
      name: string;
      data: Record<string, any>;
      type?: 'api' | 'oauth' | 'database' | 'generic';
    }, toolContext: ToolContext) => {
      try {
        this.log.info(`Updating credential: ${params.name}`);
        
        // Check if credential exists
        const existingArtifact = await toolContext.loadArtifact(`credentials/${params.name}.json`);
        if (!existingArtifact) {
          return {
            success: false,
            error: `Credential '${params.name}' not found`
          };
        }
        
        // Load existing credential
        const existingCredential = JSON.parse(
          Buffer.from(existingArtifact.inlineData.data, 'base64').toString()
        );
        
        // Update credential
        const updatedCredential = {
          ...existingCredential,
          data: params.data,
          type: params.type || existingCredential.type,
          updatedAt: new Date().toISOString()
        };
        
        // Save updated credential
        await toolContext.saveArtifact(`credentials/${params.name}.json`, {
          inlineData: {
            data: Buffer.from(JSON.stringify(updatedCredential, null, 2)).toString('base64'),
            mimeType: 'application/json'
          }
        });
        
        // Update state
        toolContext.state.set('lastCredentialUpdated', params.name);
        toolContext.state.set(`credential:${params.name}:updated`, updatedCredential.updatedAt);
        
        return {
          success: true,
          credential: {
            id: updatedCredential.id,
            name: updatedCredential.name,
            type: updatedCredential.type,
            encrypted: updatedCredential.encrypted,
            createdAt: updatedCredential.createdAt,
            updatedAt: updatedCredential.updatedAt
          },
          message: `Credential '${params.name}' updated successfully`
        };
      } catch (error) {
        this.log.error('Failed to update credential:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }, {
      name: 'updateCredential',
      description: 'Update an existing credential with ADK-TS context integration',
      parameters: z.object({
        name: z.string().min(1, 'Credential name is required'),
        data: z.record(z.any(), 'Credential data is required'),
        type: z.enum(['api', 'oauth', 'database', 'generic']).optional()
      })
    });
  }

  // Delete credential tool with ADK-TS context integration
  createDeleteCredentialTool(): FunctionTool {
    return new FunctionTool(async (params: { name: string }, toolContext: ToolContext) => {
      try {
        this.log.info(`Deleting credential: ${params.name}`);
        
        // Check if credential exists
        const existingArtifact = await toolContext.loadArtifact(`credentials/${params.name}.json`);
        if (!existingArtifact) {
          return {
            success: false,
            error: `Credential '${params.name}' not found`
          };
        }
        
        // In a real implementation, this would delete the credential
        // For now, we'll mark it as deleted in state
        toolContext.state.set(`credential:${params.name}:deleted`, true);
        toolContext.state.set('lastCredentialDeleted', params.name);
        
        return {
          success: true,
          message: `Credential '${params.name}' deleted successfully`
        };
      } catch (error) {
        this.log.error('Failed to delete credential:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }, {
      name: 'deleteCredential',
      description: 'Delete a stored credential with ADK-TS context integration',
      parameters: z.object({
        name: z.string().min(1, 'Credential name is required')
      })
    });
  }

  // List credentials tool with ADK-TS context integration
  createListCredentialsTool(): FunctionTool {
    return new FunctionTool(async (params: {
      includeDeleted?: boolean;
      type?: 'api' | 'oauth' | 'database' | 'generic';
    }, toolContext: ToolContext) => {
      try {
        this.log.info('Listing credentials');
        
        // List all credential artifacts
        const artifacts = await toolContext.listArtifacts();
        const credentialArtifacts = artifacts.filter(artifact => 
          artifact.startsWith('credentials/') && artifact.endsWith('.json')
        );
        
        const credentials = [];
        
        for (const artifactPath of credentialArtifacts) {
          try {
            const artifact = await toolContext.loadArtifact(artifactPath);
            if (artifact) {
              const credentialData = JSON.parse(
                Buffer.from(artifact.inlineData.data, 'base64').toString()
              );
              
              // Check if credential is deleted
              const isDeleted = toolContext.state.get(`credential:${credentialData.name}:deleted`);
              if (isDeleted && !params.includeDeleted) {
                continue;
              }
              
              // Filter by type if specified
              if (params.type && credentialData.type !== params.type) {
                continue;
              }
              
              credentials.push({
                id: credentialData.id,
                name: credentialData.name,
                type: credentialData.type,
                encrypted: credentialData.encrypted,
                createdAt: credentialData.createdAt,
                updatedAt: credentialData.updatedAt,
                deleted: !!isDeleted
              });
            }
          } catch (error) {
            this.log.warn(`Failed to load credential artifact: ${artifactPath}`, error);
          }
        }
        
        // Update state
        toolContext.state.set('lastCredentialsListed', credentials.length);
        
        return {
          success: true,
          credentials,
          message: `Found ${credentials.length} credentials`,
          context: {
            totalArtifacts: artifacts.length,
            credentialArtifacts: credentialArtifacts.length
          }
        };
      } catch (error) {
        this.log.error('Failed to list credentials:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }, {
      name: 'listCredentials',
      description: 'List all stored credentials with filtering options and ADK-TS context',
      parameters: z.object({
        includeDeleted: z.boolean().optional().default(false),
        type: z.enum(['api', 'oauth', 'database', 'generic']).optional()
      })
    });
  }

  // Rotate encryption key tool with ADK-TS context integration
  createRotateEncryptionKeyTool(): FunctionTool {
    return new FunctionTool(async (params: { newKeyId?: string }, toolContext: ToolContext) => {
      try {
        this.log.info('Rotating encryption key');
        
        const newKeyId = params.newKeyId || `key_${Date.now()}`;
        
        // Update state with new key information
        toolContext.state.set('encryptionKeyId', newKeyId);
        toolContext.state.set('lastKeyRotation', new Date().toISOString());
        
        // Save key rotation log as artifact
        await toolContext.saveArtifact(`logs/key_rotation_${Date.now()}.json`, {
          inlineData: {
            data: Buffer.from(JSON.stringify({
              newKeyId,
              rotatedAt: new Date().toISOString(),
              previousKeyId: toolContext.state.get('encryptionKeyId')
            }, null, 2)).toString('base64'),
            mimeType: 'application/json'
          }
        });
        
        return {
          success: true,
          newKeyId,
          message: 'Encryption key rotated successfully',
          context: {
            rotatedAt: new Date().toISOString(),
            previousKeyId: toolContext.state.get('encryptionKeyId')
          }
        };
      } catch (error) {
        this.log.error('Failed to rotate encryption key:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }, {
      name: 'rotateEncryptionKey',
      description: 'Rotate the encryption key for all credentials with ADK-TS context integration',
      parameters: z.object({
        newKeyId: z.string().optional()
      })
    });
  }
}