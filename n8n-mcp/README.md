# n8n MCP Server

A comprehensive Model Context Protocol (MCP) server for building and managing n8n workflows using FastMCP. This server provides AI assistants with deep knowledge about n8n's workflow automation platform and enables them to create, manage, and validate n8n workflows programmatically.

## 🚀 Features

### Core Workflow Management
- **Create Workflows**: Build new n8n workflows with proper structure and validation
- **List & Search**: Discover and filter workflows in your n8n instance
- **Get Details**: Retrieve comprehensive workflow information including nodes and connections
- **Delete Workflows**: Safely remove workflows with confirmation
- **Validate Workflows**: Comprehensive validation with error detection and fix suggestions

### Advanced Node Management
- **Add Nodes**: Insert new nodes into workflows with proper configuration
- **Edit Nodes**: Modify existing node parameters and settings
- **Delete Nodes**: Remove nodes while maintaining workflow integrity
- **Discover Nodes**: List and search through 500+ available n8n node types
- **Version Info**: Get current n8n version and capability information

### Connection Management
- **Add Connections**: Create data flow connections between nodes
- **Remove Connections**: Break connections while preserving workflow structure
- **AI Connections**: Wire AI components to agents and models

### AI Workflow Composition
- **Compose AI Workflows**: Build complete AI workflows with agents, models, memory, and tools
- **Template Generation**: Create workflows from common patterns and templates
- **Smart Suggestions**: Get recommendations for workflow improvements

### Enhanced Validation & Error Handling
- **Comprehensive Validation**: Check workflow structure, node configurations, and connections
- **Error Detection**: Identify common issues and provide fix suggestions
- **Best Practices**: Enforce n8n workflow best practices and conventions

## 📦 Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

## 🛠️ Development

```bash
# Start development server with hot reload
npm run dev

# Build the project
npm run build

# Start production server
npm start

# Run tests
npm test
```

## 🔧 Configuration

### Environment Variables

Set the following environment variables for full n8n integration:

```bash
# Required for n8n API integration
N8N_API_URL=https://your-n8n-instance.com
N8N_API_KEY=your-api-key

# Optional configuration
N8N_API_TIMEOUT=30000
N8N_API_MAX_RETRIES=3
LOG_LEVEL=info
DISABLE_CONSOLE_OUTPUT=false
```

### MCP Client Configuration

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "N8N_API_URL": "https://your-n8n-instance.com",
        "N8N_API_KEY": "your-api-key",
        "LOG_LEVEL": "error",
        "DISABLE_CONSOLE_OUTPUT": "true"
      }
    }
  }
}
```

## 🎯 Usage

The server provides 14 comprehensive tools organized into categories:

### Workflow Management Tools (5)
- `create_workflow` - Create a new n8n workflow with validation
- `list_workflows` - List all workflows with filtering and pagination
- `get_workflow_details` - Get detailed workflow information including nodes and connections
- `delete_workflow` - Delete a workflow with confirmation
- `validate_workflow` - Validate workflow structure, connections, and node configurations

### Node Management Tools (5)
- `add_node` - Add a new node to a workflow with proper configuration
- `edit_node` - Edit existing node parameters and settings
- `delete_node` - Remove a node from a workflow
- `list_available_nodes` - Discover available n8n node types with filtering
- `get_n8n_version_info` - Get current n8n version and capabilities

### Connection Management Tools (3)
- `add_connection` - Create connections between workflow nodes
- `remove_connection` - Remove connections between nodes
- `add_ai_connections` - Wire AI components to agents and models

### AI Workflow Tools (1)
- `compose_ai_workflow` - Create complete AI workflows with agents, models, memory, and tools

### System Tools (2)
- `get_system_info` - Get system information and configuration status
- `get_tool_documentation` - Get detailed documentation for specific tools

## 🔍 Validation Features

The server includes comprehensive validation capabilities:

- **Workflow Structure**: Validates workflow name, nodes, and basic structure
- **Node Configuration**: Checks required fields, parameters, and credentials
- **Connection Validation**: Ensures connections reference valid nodes and outputs
- **Expression Validation**: Validates n8n expressions and syntax
- **Best Practices**: Enforces n8n workflow conventions and patterns

## 🚨 Safety Features

- **Validation First**: All workflows are validated before creation or updates
- **Error Handling**: Comprehensive error detection with actionable suggestions
- **Backup Recommendations**: Suggests making backups before modifications
- **Development Mode**: Encourages testing in development environments

## 📚 Examples

### Creating a Simple Webhook Workflow

```javascript
// Create a webhook to Slack workflow
const workflow = {
  name: "Webhook to Slack",
  nodes: [
    {
      id: "webhook_1",
      name: "Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 1,
      position: [250, 300],
      parameters: {
        httpMethod: "POST",
        path: "slack-notify"
      }
    },
    {
      id: "slack_1",
      name: "Slack",
      type: "n8n-nodes-base.slack",
      typeVersion: 1,
      position: [450, 300],
      parameters: {
        resource: "message",
        operation: "post",
        channel: "#general",
        text: "New webhook received!"
      }
    }
  ],
  connections: {
    "webhook_1": {
      "main": [[{
        "node": "slack_1",
        "type": "main",
        "index": 0
      }]]
    }
  }
};
```

### Validating a Workflow

```javascript
// Validate workflow before creating
const validation = await validateWorkflow(workflow);
if (!validation.isValid) {
  console.log("Validation errors:", validation.errors);
  console.log("Suggestions:", validation.suggestions);
}
```

## 🏗️ Architecture

The server is built with a modular architecture:

- **FastMCP Framework**: Provides the MCP protocol implementation
- **Service Layer**: Handles n8n API integration and business logic
- **Validation Layer**: Comprehensive workflow and node validation
- **Tool Layer**: Individual tool implementations for specific operations
- **Utility Layer**: Common utilities for logging, validation, and configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with [FastMCP](https://github.com/punkpeye/fastmcp) framework
- Inspired by the comprehensive [n8n-mcp-main](https://github.com/czlonkowski/n8n-mcp) project
- Uses [n8n](https://github.com/n8n-io/n8n) workflow automation platform