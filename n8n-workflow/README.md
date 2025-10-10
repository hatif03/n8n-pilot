# n8n Workflow Intelligence Platform

An AI-powered n8n workflow management platform built with **ADK-TS** (Agent Development Kit for TypeScript), featuring intelligent workflow creation, analysis, optimization, and validation.

## 🚀 Features

- **🤖 Multi-Agent Architecture**: Specialized agents for different workflow tasks
- **🛠️ ADK-TS Compliant Tools**: Full integration with ADK-TS context system
- **🔌 MCP Server Integration**: Model Context Protocol servers for extended capabilities
- **📊 Workflow Analysis**: Complexity assessment and performance optimization
- **🔍 Semantic Search**: Vector-based workflow discovery and similarity matching
- **✅ Validation & Testing**: Comprehensive workflow validation and evaluation
- **💾 State Management**: Session, memory, and artifact management

## 🏗️ Architecture

This project follows **ADK-TS best practices** with a clean, modular architecture:

```
src/
├── agents/                 # ADK-TS compliant agents
│   ├── index.ts           # Agent exports following ADK-TS conventions
│   ├── orchestrator.ts    # Main orchestrator agent
│   ├── workflow-analyzer.ts
│   ├── workflow-builder.ts
│   ├── workflow-optimizer.ts
│   └── workflow-validator.ts
├── tools/                 # ADK-TS compliant tools
│   ├── index.ts           # Tool manager
│   ├── credentialTools.ts # With ToolContext integration
│   ├── executionTools.ts  # With ToolContext integration
│   ├── mcpTools.ts        # MCP server integration
│   └── ...
├── mcp-servers/           # MCP server implementations
├── services/              # Business logic services
├── evaluation/            # ADK-TS evaluation framework
│   ├── tests/             # Evaluation test cases
│   ├── test_config.json   # Evaluation configuration
│   └── run_evaluation.ts  # Evaluation runner
└── index.ts               # ADK-TS compliant main entry
```

## 🛠️ ADK-TS Compliance

This project is **fully compliant** with ADK-TS standards:

### ✅ Agent Architecture
- **LlmAgent**: All agents extend ADK-TS LlmAgent
- **Sub-Agents**: Proper agent hierarchy with specialized sub-agents
- **Callbacks**: Before/after agent callbacks for lifecycle management
- **Services**: Integrated session, memory, and artifact services

### ✅ Tool Integration
- **ToolContext**: All tools use ADK-TS ToolContext for rich context access
- **Schema Validation**: Zod schemas for parameter validation
- **Memory Integration**: Tools can search and store memories
- **State Management**: Tools can read/write session state
- **Artifact Storage**: Tools can save/load artifacts

### ✅ Service Integration
- **SessionService**: InMemorySessionService for session management
- **MemoryService**: InMemoryMemoryService for knowledge storage
- **ArtifactService**: InMemoryArtifactService for file management

### ✅ MCP Integration
- **MCP Tools**: MCP servers integrated as ADK-TS tools
- **Context Awareness**: MCP calls include ADK-TS context
- **Artifact Logging**: MCP interactions saved as artifacts

## 🚀 Quick Start

### Prerequisites
- Node.js v22.0 or higher
- pnpm (recommended) or npm
- n8n instance (optional for full functionality)

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd n8n-workflow
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
cp env.example .env
# Edit .env with your configuration
```

3. **Run the platform:**
```bash
# Development mode
pnpm dev

# Production mode
pnpm build
pnpm start
```

### Environment Variables

```bash
# Required
GOOGLE_API_KEY=your_google_api_key_here

# Optional (for full functionality)
N8N_HOST=http://localhost:5678
N8N_API_KEY=your_n8n_api_key
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your_qdrant_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_neo4j_password
```

## 🧪 Testing & Evaluation

### Unit Tests
```bash
pnpm test
```

### ADK-TS Evaluation
```bash
pnpm test:eval
```

The evaluation framework tests:
- Workflow creation capabilities
- Workflow analysis accuracy
- Tool execution reliability
- Agent response quality

## 🤖 Agent Capabilities

### Orchestrator Agent
- **Role**: Master coordinator for all workflow operations
- **Capabilities**: Task delegation, multi-agent coordination
- **Tools**: All available tools from sub-agents

### Workflow Analyzer Agent
- **Role**: Workflow complexity and pattern analysis
- **Capabilities**: Performance analysis, similarity search
- **Tools**: Execution tools, node discovery, prompt tools

### Workflow Builder Agent
- **Role**: Workflow creation and modification
- **Capabilities**: Node management, connection handling
- **Tools**: Node discovery, credential tools, tag tools

### Workflow Optimizer Agent
- **Role**: Performance optimization and efficiency improvement
- **Capabilities**: Bottleneck identification, optimization suggestions
- **Tools**: Execution tools, node discovery, prompt tools

### Workflow Validator Agent
- **Role**: Security and best practices validation
- **Capabilities**: Security analysis, compliance checking
- **Tools**: Credential tools, execution tools, node discovery

## 🔧 Tool Categories

### Credential Tools
- `storeCredential`: Securely store credentials with encryption
- `getCredential`: Retrieve stored credentials
- `updateCredential`: Update existing credentials
- `deleteCredential`: Delete credentials
- `listCredentials`: List all credentials with filtering
- `rotateEncryptionKey`: Rotate encryption keys

### Execution Tools
- `listExecutions`: List workflow executions with filters
- `getExecution`: Get execution details
- `deleteExecution`: Delete executions
- `getExecutionStats`: Get performance statistics
- `monitorExecution`: Monitor execution progress
- `retryExecution`: Retry failed executions

### MCP Tools
- `mcp_call`: Call MCP server tools
- `list_mcp_servers`: List available MCP servers
- `get_mcp_server_info`: Get server information
- `start_mcp_server`: Start specific MCP server
- `start_all_mcp_servers`: Start all MCP servers

## 📊 MCP Servers

### Workflow Builder MCP
- Workflow creation and modification
- Node management and connections
- Workflow validation

### Vector Search MCP
- Semantic workflow search
- Similarity matching
- Workflow clustering

### Agent2Agent MCP
- Inter-agent communication
- Message broadcasting
- Agent status monitoring

### Workflow Generator MCP
- AI-powered workflow generation
- Node suggestions
- Workflow optimization

### N8N2MCP Router MCP
- Request routing
- Load balancing
- Service discovery

## 🔍 ADK-TS Context Features

All tools have access to rich ADK-TS context:

```typescript
// Memory search
const memories = await toolContext.searchMemory('workflow optimization');

// State management
toolContext.state.set('lastWorkflowCreated', workflowId);
const lastWorkflow = toolContext.state.get('lastWorkflowCreated');

// Artifact storage
await toolContext.saveArtifact('workflow.json', workflowData);
const workflow = await toolContext.loadArtifact('workflow.json');

// Credential management
const credential = await toolContext.requestCredential('api-key');
```

## 🏆 Best Practices

This project demonstrates ADK-TS best practices:

1. **Agent Design**: Clear separation of concerns with specialized agents
2. **Tool Integration**: Rich context integration in all tools
3. **Service Usage**: Proper session, memory, and artifact management
4. **Error Handling**: Comprehensive error handling and logging
5. **Type Safety**: Full TypeScript integration with Zod validation
6. **Testing**: Comprehensive evaluation framework
7. **Documentation**: Clear documentation and examples

## 📈 Performance

- **Memory Efficient**: In-memory services for development
- **Scalable**: Ready for production services (Vertex AI, etc.)
- **Fast**: Optimized tool execution and context access
- **Reliable**: Comprehensive error handling and recovery

## 🤝 Contributing

1. Follow ADK-TS conventions
2. Add proper TypeScript types
3. Include comprehensive tests
4. Update documentation
5. Use conventional commits

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- [ADK-TS](https://github.com/IQAICOM/adk) - Agent Development Kit for TypeScript
- [n8n](https://n8n.io) - Workflow automation platform
- [Model Context Protocol](https://modelcontextprotocol.io) - MCP specification