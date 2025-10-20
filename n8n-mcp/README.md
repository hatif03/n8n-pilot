# n8n MCP Server

A Model Context Protocol (MCP) server for building and managing n8n workflows using FastMCP. This server provides AI-friendly tools for creating, editing, and managing n8n automation workflows programmatically.

## Features

- **Workflow Management**: Create, edit, delete, and validate n8n workflows
- **Node Operations**: Add, edit, and remove nodes in workflows
- **Connection Management**: Create and manage connections between nodes
- **Node Discovery**: Explore available n8n node types and their capabilities
- **AI Workflow Composition**: Build complex AI workflows with agents, models, memory, and tools
- **Version Support**: Automatic n8n version detection and compatibility handling

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or pnpm

### Setup

1. Clone or navigate to the n8n-mcp directory:
   ```bash
   cd n8n-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

## Usage

### Running the Server

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

#### Using MCP Inspector
```bash
npm run inspect
```

### Integration with MCP Clients

Add the following configuration to your MCP client (e.g., Cursor IDE):

```json
{
  "mcpServers": {
    "n8n-mcp-server": {
      "command": "node",
      "args": ["/path/to/n8n-mcp/dist/index.js"],
      "env": {
        "N8N_API_URL": "http://localhost:5678",
        "N8N_API_KEY": "your-n8n-api-key-here"
      }
    }
  }
}
```

## Available Tools

### Workflow Management

| Tool Name | Description | Key Parameters |
|-----------|-------------|----------------|
| `create_workflow` | Create a new n8n workflow | `workflow_name`, `description`, `active` |
| `list_workflows` | List all workflows in the workspace | `limit`, `cursor` |
| `get_workflow_details` | Get detailed information about a workflow | `workflow_name` |
| `delete_workflow` | Delete a workflow | `workflow_name` |
| `validate_workflow` | Validate workflow structure and connectivity | `workflow_name` |

### Node Management

| Tool Name | Description | Key Parameters |
|-----------|-------------|----------------|
| `add_node` | Add a new node to a workflow | `workflow_name`, `node_type`, `position`, `parameters` |
| `edit_node` | Edit an existing node in a workflow | `workflow_name`, `node_id`, `node_name`, `parameters` |
| `delete_node` | Delete a node from a workflow | `workflow_name`, `node_id` |
| `list_available_nodes` | List available n8n node types | `search_term`, `n8n_version`, `limit` |
| `get_n8n_version_info` | Get n8n version and capabilities | - |

### Connection Management

| Tool Name | Description | Key Parameters |
|-----------|-------------|----------------|
| `add_connection` | Create a connection between two nodes | `workflow_name`, `source_node_id`, `target_node_id` |
| `remove_connection` | Remove a connection between nodes | `workflow_name`, `source_node_id`, `target_node_id` |
| `add_ai_connections` | Wire AI components to an agent | `workflow_name`, `agent_node_id`, `model_node_id` |

### AI Workflow Tools

| Tool Name | Description | Key Parameters |
|-----------|-------------|----------------|
| `compose_ai_workflow` | Create a complete AI workflow | `workflow_name`, `plan`, `n8n_version` |

## Examples

### Creating a Simple Workflow

```typescript
// Create a new workflow
await createWorkflow({
  workflow_name: "my-automation",
  description: "A simple automation workflow",
  active: false
});

// Add a webhook trigger
await addNode({
  workflow_name: "my-automation",
  node_type: "n8n-nodes-base.webhook",
  position: [100, 100],
  parameters: {
    httpMethod: "POST",
    path: "my-webhook"
  }
});

// Add an HTTP request node
await addNode({
  workflow_name: "my-automation",
  node_type: "n8n-nodes-base.httpRequest",
  position: [400, 100],
  parameters: {
    method: "GET",
    url: "https://api.example.com/data"
  }
});

// Connect the nodes
await addConnection({
  workflow_name: "my-automation",
  source_node_id: "webhook-node-id",
  source_node_output_name: "main",
  target_node_id: "http-node-id",
  target_node_input_name: "main"
});
```

### Creating an AI Workflow

```typescript
// Create a complete AI workflow
await composeAiWorkflow({
  workflow_name: "ai-assistant",
  plan: "Create an AI assistant that can answer questions and store memories",
  n8n_version: "1.108.0"
});
```

## Project Structure

```
n8n-mcp/
├── src/
│   ├── lib/
│   │   └── workflow-utils.ts      # Workflow utility functions
│   ├── services/
│   │   ├── workflow-service.ts    # Workflow management service
│   │   └── node-discovery-service.ts # Node discovery service
│   ├── tools/
│   │   ├── workflow-tools.ts      # Workflow management tools
│   │   ├── node-tools.ts          # Node management tools
│   │   ├── connection-tools.ts    # Connection management tools
│   │   └── ai-workflow-tools.ts   # AI workflow composition tools
│   ├── types.ts                   # TypeScript type definitions
│   └── index.ts                   # Main server entry point
├── dist/                          # Compiled JavaScript output
├── package.json
└── README.md
```

## Configuration

### Environment Variables

- `N8N_API_URL`: URL of your n8n instance (default: `http://localhost:5678`)
- `N8N_API_KEY`: API key for n8n authentication
- `N8N_VERSION`: Specific n8n version to use (optional, auto-detected if not set)

### Workflow Storage

Workflows are stored in the `./workflows` directory by default. Each workflow is saved as a JSON file with the workflow name as the filename.

## Development

### Building

```bash
npm run build
```

### Watching for Changes

```bash
npm run watch
```

### Testing

```bash
npm run dev
```

## Dependencies

- **fastmcp**: FastMCP framework for building MCP servers
- **zod**: Schema validation
- **uuid**: UUID generation for workflow and node IDs
- **node-fetch**: HTTP requests for n8n API integration
- **ajv**: JSON schema validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License

## Acknowledgments

- Built with [FastMCP](https://github.com/punkpeye/fastmcp)
- Inspired by the [n8n-workflow-builder-mcp](https://github.com/ifmelate/n8n-workflow-builder-mcp) project
- Uses the [Model Context Protocol](https://modelcontextprotocol.io/) specification