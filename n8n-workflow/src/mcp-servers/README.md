# MCP Servers for n8n Workflow Intelligence Platform

This directory contains multiple Model Context Protocol (MCP) servers that provide specialized functionality for n8n workflow management and AI integration.

## Available MCP Servers

### 1. Workflow Builder MCP (`workflowBuilderMCP.ts`)
**Purpose**: Create, modify, and manage n8n workflows programmatically

**Tools**:
- `create_workflow` - Create a new n8n workflow with nodes and connections
- `add_node` - Add a node to an existing workflow
- `edit_node` - Edit an existing node in a workflow
- `delete_node` - Delete a node from a workflow
- `add_connection` - Add a connection between nodes
- `remove_connection` - Remove a connection between nodes
- `validate_workflow` - Validate a workflow for errors and best practices
- `search_nodes` - Search for available n8n nodes

### 2. Agent2Agent MCP (`agent2agentMCP.ts`)
**Purpose**: Enable communication between AI agents using Google's A2A protocol

**Tools**:
- `discover_agent` - Discover and parse an agent's public Agent Card
- `send_task` - Send a task to an A2A agent
- `get_task` - Get the status and details of a specific task
- `cancel_task` - Cancel an ongoing task
- `list_agents` - List available A2A agents in the network
- `test_agent_connection` - Test connection to an A2A agent

### 3. Workflow Generator MCP (`workflowGeneratorMCP.ts`)
**Purpose**: Generate n8n workflows from natural language descriptions

**Tools**:
- `generate_workflow` - Generate a complete n8n workflow from a description
- `validate_workflow_json` - Validate a generated workflow JSON
- `optimize_workflow` - Optimize a workflow for performance
- `security_review` - Perform security review of a workflow
- `generate_documentation` - Generate documentation for a workflow
- `get_workflow_templates` - Get available workflow templates
- `analyze_workflow_requirements` - Analyze requirements and suggest structure

### 4. Vector Search MCP (`vectorSearchMCP.ts`)
**Purpose**: Semantic search and similarity matching for workflows

**Tools**:
- `search_workflows` - Search workflows using semantic vector search
- `find_similar_workflows` - Find workflows similar to a given workflow
- `index_workflow` - Add a workflow to the vector search index
- `update_workflow_index` - Update an existing workflow in the index
- `delete_workflow_index` - Remove a workflow from the index
- `get_workflow_categories` - Get all available workflow categories
- `get_workflow_tags` - Get all available workflow tags
- `cluster_workflows` - Cluster workflows by similarity
- `get_search_statistics` - Get statistics about the vector search index

### 5. N8N2MCP Router MCP (`n8n2mcpRouterMCP.ts`)
**Purpose**: Convert n8n workflows into deployable MCP servers

**Tools**:
- `convert_workflow_to_mcp` - Convert an n8n workflow to an MCP server
- `deploy_mcp_server` - Deploy a generated MCP server
- `test_mcp_server` - Test a deployed MCP server
- `list_deployed_servers` - List all deployed MCP servers
- `stop_mcp_server` - Stop a running MCP server
- `get_server_logs` - Get logs from a deployed MCP server
- `update_mcp_server` - Update an existing MCP server
- `get_server_health` - Get health status of a deployed MCP server

## Usage

### Starting Individual MCP Servers

```typescript
import { WorkflowBuilderMCP } from './mcp-servers/workflowBuilderMCP';

const mcpServer = new WorkflowBuilderMCP();
await mcpServer.start();
```

### Starting All MCP Servers

```typescript
import { MCPManager } from './mcp-servers';

const mcpManager = new MCPManager();
await mcpManager.startAll();
```

### Using MCP Servers in Claude Desktop

Add the following to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "n8n-workflow-builder": {
      "command": "node",
      "args": ["dist/mcp-servers/workflowBuilderMCP.js"],
      "env": {
        "N8N_HOST": "http://localhost:5678",
        "N8N_API_KEY": "your-api-key"
      }
    },
    "n8n-agent2agent": {
      "command": "node",
      "args": ["dist/mcp-servers/agent2agentMCP.js"]
    },
    "n8n-workflow-generator": {
      "command": "node",
      "args": ["dist/mcp-servers/workflowGeneratorMCP.js"],
      "env": {
        "OPENAI_API_KEY": "your-openai-key"
      }
    },
    "n8n-vector-search": {
      "command": "node",
      "args": ["dist/mcp-servers/vectorSearchMCP.js"],
      "env": {
        "QDRANT_URL": "http://localhost:6333",
        "OPENAI_API_KEY": "your-openai-key"
      }
    },
    "n8n2mcp-router": {
      "command": "node",
      "args": ["dist/mcp-servers/n8n2mcpRouterMCP.js"],
      "env": {
        "N8N_HOST": "http://localhost:5678",
        "N8N_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Environment Variables

### Required
- `N8N_HOST` - n8n instance URL
- `N8N_API_KEY` - n8n API key

### Optional
- `QDRANT_URL` - Qdrant vector database URL (default: http://localhost:6333)
- `QDRANT_API_KEY` - Qdrant API key
- `OPENAI_API_KEY` - OpenAI API key for embeddings
- `GEMINI_API_KEY` - Google Gemini API key
- `LOG_LEVEL` - Logging level (default: info)

## Development

### Building MCP Servers

```bash
npm run build
```

### Running Individual MCP Servers

```bash
# Workflow Builder MCP
node dist/mcp-servers/workflowBuilderMCP.js

# Agent2Agent MCP
node dist/mcp-servers/agent2agentMCP.js

# Workflow Generator MCP
node dist/mcp-servers/workflowGeneratorMCP.js

# Vector Search MCP
node dist/mcp-servers/vectorSearchMCP.js

# N8N2MCP Router MCP
node dist/mcp-servers/n8n2mcpRouterMCP.js
```

### Testing MCP Servers

```bash
npm test
```

## Architecture

Each MCP server follows the Model Context Protocol specification and provides:

1. **Tool Definitions** - Structured tool schemas with input/output specifications
2. **Request Handlers** - Async handlers for tool execution
3. **Error Handling** - Proper error codes and messages
4. **Logging** - Structured logging for debugging and monitoring
5. **Configuration** - Environment-based configuration management

## Integration with ADK-TS

The MCP servers are designed to work seamlessly with the ADK-TS framework:

- **FunctionTool Integration** - MCP tools can be wrapped as ADK-TS FunctionTools
- **Agent Communication** - MCP servers can communicate with ADK-TS agents
- **Session Management** - Shared session context across MCP servers and agents
- **Memory Services** - Integration with ADK-TS memory and artifact services

## Monitoring and Health Checks

Each MCP server provides health check endpoints and logging for monitoring:

- Server status and uptime
- Tool execution statistics
- Error rates and performance metrics
- Resource usage monitoring

## Security Considerations

- **API Key Management** - Secure handling of API keys and credentials
- **Input Validation** - Comprehensive input validation for all tools
- **Error Sanitization** - Safe error messages without sensitive information
- **Rate Limiting** - Built-in rate limiting for tool execution
- **Authentication** - Optional authentication for MCP server access

