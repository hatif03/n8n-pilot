import { CredentialTools } from './credentialTools'
import { NodeDiscoveryTools } from './nodeDiscoveryTools'
import { ExecutionTools } from './executionTools'
import { TagTools } from './tagTools'
import { PromptTools } from './promptTools'
import { MCPTools } from './mcpTools'
import { N8nService } from '../services/n8nService'

export class MCPToolsManager {
  private credentialTools: CredentialTools
  private nodeDiscoveryTools: NodeDiscoveryTools
  private executionTools: ExecutionTools
  private tagTools: TagTools
  private promptTools: PromptTools
  private mcpTools: MCPTools

  constructor(n8nService: N8nService) {
    this.credentialTools = new CredentialTools()
    this.nodeDiscoveryTools = new NodeDiscoveryTools()
    this.executionTools = new ExecutionTools(n8nService)
    this.tagTools = new TagTools(n8nService)
    this.promptTools = new PromptTools()
    this.mcpTools = new MCPTools()
  }

  // Get all credential tools
  getCredentialTools() {
    return [
      this.credentialTools.createStoreCredentialTool(),
      this.credentialTools.createGetCredentialTool(),
      this.credentialTools.createUpdateCredentialTool(),
      this.credentialTools.createDeleteCredentialTool(),
      this.credentialTools.createListCredentialsTool(),
      this.credentialTools.createRotateEncryptionKeyTool()
    ]
  }

  // Get all node discovery tools
  getNodeDiscoveryTools() {
    return [
      this.nodeDiscoveryTools.createSearchNodesTool(),
      this.nodeDiscoveryTools.createGetNodeDetailsTool(),
      this.nodeDiscoveryTools.createListNodeCategoriesTool(),
      this.nodeDiscoveryTools.createGetN8nVersionInfoTool()
    ]
  }

  // Get all execution tools
  getExecutionTools() {
    return [
      this.executionTools.createListExecutionsTool(),
      this.executionTools.createGetExecutionTool(),
      this.executionTools.createDeleteExecutionTool(),
      this.executionTools.createGetExecutionStatsTool(),
      this.executionTools.createMonitorExecutionTool(),
      this.executionTools.createRetryExecutionTool()
    ]
  }

  // Get all tag tools
  getTagTools() {
    return [
      this.tagTools.createCreateTagTool(),
      this.tagTools.createGetTagsTool(),
      this.tagTools.createGetTagTool(),
      this.tagTools.createUpdateTagTool(),
      this.tagTools.createDeleteTagTool(),
      this.tagTools.createTagWorkflowTool(),
      this.tagTools.createUntagWorkflowTool(),
      this.tagTools.createGetWorkflowsByTagTool()
    ]
  }

  // Get all prompt tools
  getPromptTools() {
    return [
      this.promptTools.createListPromptsTool(),
      this.promptTools.createFillPromptTool(),
      this.promptTools.createCreateCustomPromptTool(),
      this.promptTools.createGetPromptTool()
    ]
  }

  // Get all MCP tools
  getMCPTools() {
    return [
      this.mcpTools.createMCPCallTool(),
      this.mcpTools.createListMCPServersTool(),
      this.mcpTools.createGetMCPServerInfoTool(),
      this.mcpTools.createStartMCPServerTool(),
      this.mcpTools.createStartAllMCPServersTool()
    ]
  }

  // Get all tools
  getAllTools() {
    return [
      ...this.getCredentialTools(),
      ...this.getNodeDiscoveryTools(),
      ...this.getExecutionTools(),
      ...this.getTagTools(),
      ...this.getPromptTools(),
      ...this.getMCPTools()
    ]
  }
}

