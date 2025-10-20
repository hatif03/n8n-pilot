# n8n MCP Server Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

### Development

1. **Run in development mode:**
   ```bash
   npm run dev
   ```

2. **Inspect with MCP Inspector:**
   ```bash
   npm run inspect
   ```

## 🔧 Configuration

### Environment Variables (Optional)

For full n8n integration, set these environment variables:

```bash
N8N_API_URL=https://your-n8n-instance.com
N8N_API_KEY=your-api-key
N8N_API_TIMEOUT=30000
N8N_API_MAX_RETRIES=3
```

### MCP Client Configuration

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "n8n-mcp-server": {
      "command": "npx",
      "args": ["tsx", "/path/to/n8n-mcp/src/index.ts"],
      "env": {
        "N8N_API_URL": "https://your-n8n-instance.com",
        "N8N_API_KEY": "your-api-key"
      }
    }
  }
}
```

## 🛠️ Available Tools (29 total)

### Workflow Management (5 tools)
- `create_workflow` - Create new n8n workflows
- `list_workflows` - List existing workflows
- `get_workflow_details` - Get detailed workflow information
- `delete_workflow` - Delete workflows
- `validate_workflow` - Validate workflow structure

### Node Management (5 tools)
- `add_node` - Add nodes to workflows
- `edit_node` - Edit existing nodes
- `delete_node` - Remove nodes from workflows
- `list_available_nodes` - Discover available node types
- `get_n8n_version_info` - Get n8n version information

### Connection Management (3 tools)
- `add_connection` - Connect nodes in workflows
- `remove_connection` - Disconnect nodes
- `add_ai_connections` - Add AI-specific connections

### AI Workflow Tools (1 tool)
- `compose_ai_workflow` - Compose complex AI workflows

### Template Management (6 tools)
- `list_templates` - List workflow templates
- `search_templates` - Search templates with filters
- `get_template` - Get detailed template information
- `list_node_templates` - Find templates using specific nodes
- `get_templates_for_task` - Find templates for specific tasks
- `get_template_stats` - Get template statistics

### Advanced Services (9 tools)
- `get_node_examples` - Get configuration examples for nodes
- `search_node_examples` - Search examples by pattern
- `validate_node_configuration` - Validate node configurations
- `score_resource_locator` - Score resource locator recommendations
- `score_node_type_suggestion` - Score node type suggestions
- `score_workflow_validation` - Score workflow validation results
- `analyze_property_dependencies` - Analyze property relationships
- `get_property_groups` - Get related properties
- `validate_property_configuration` - Validate property configurations

### System Tools (2 tools)
- `get_system_info` - Get server status and configuration
- `get_tool_documentation` - Get detailed tool documentation

## 📁 Project Structure

```
n8n-mcp/
├── src/
│   ├── config/           # Configuration management
│   ├── services/         # Business logic services
│   ├── tools/           # MCP tool definitions
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── index.ts         # Main server entry point
├── dist/                # Compiled JavaScript
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md           # Project documentation
```

## 🎯 Key Features

- **29 MCP Tools** for comprehensive n8n workflow management
- **Template System** with 5 sample workflow templates
- **Advanced Services** for configuration examples and validation
- **Zero Dependencies** for core functionality
- **TypeScript** with full type safety
- **FastMCP** framework for easy MCP server development

## 🔍 Usage Examples

### Basic Workflow Creation
```bash
# Create a new workflow
create_workflow({name: "My Workflow", description: "A simple workflow"})

# Add a webhook trigger
add_node({workflow_id: "workflow_id", type: "n8n-nodes-base.webhook", name: "Webhook"})

# Add an HTTP request node
add_node({workflow_id: "workflow_id", type: "n8n-nodes-base.httpRequest", name: "HTTP Request"})

# Connect the nodes
add_connection({workflow_id: "workflow_id", from_node: "Webhook", to_node: "HTTP Request"})
```

### Template Usage
```bash
# List available templates
list_templates({limit: 10})

# Search for AI-related templates
search_templates({query: "ai", categories: ["ai"]})

# Get a specific template
get_template({template_id: "ai-chat-assistant", include_workflow: true})
```

### Advanced Services
```bash
# Get node configuration examples
get_node_examples({node_type: "n8n-nodes-base.httpRequest", example_type: "common"})

# Analyze property dependencies
analyze_property_dependencies({properties: [...]})

# Score a recommendation
score_resource_locator({field_name: "url", node_type: "n8n-nodes-base.httpRequest", value: "https://api.example.com"})
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**: Make sure all dependencies are installed with `npm install`
2. **TypeScript Errors**: Run `npm run build` to check for compilation errors
3. **MCP Connection Issues**: Verify your MCP client configuration
4. **n8n API Issues**: Check your environment variables and n8n instance connectivity

### Debug Mode

Run with debug logging:
```bash
DEBUG=* npm run dev
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the tool documentation with `get_tool_documentation`
3. Check system status with `get_system_info`
