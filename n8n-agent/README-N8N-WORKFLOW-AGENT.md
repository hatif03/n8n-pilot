# n8n Workflow Agent for Telegram

This document describes the n8n Workflow Agent that has been integrated into the Telegram bot, allowing users to create and manage n8n workflows directly through Telegram chat.

## Overview

The n8n Workflow Agent is an AI-powered assistant that can help users create, modify, and manage n8n workflows through natural language commands in Telegram. It's built using ADK-TS (Agent Development Kit for TypeScript) and integrates directly with the n8n API.

## Features

### Core Capabilities
- **Create Workflows**: Generate new n8n workflows from natural language descriptions
- **List Workflows**: View all available workflows in your n8n instance
- **Get Workflow Details**: Retrieve detailed information about specific workflows
- **Update Workflows**: Modify existing workflows with new nodes and connections
- **Delete Workflows**: Remove workflows you no longer need
- **Node Type Discovery**: Get information about available n8n node types
- **Simple Workflow Creation**: Create basic workflows with common patterns

### Workflow Types Supported
- **Webhook Workflows**: HTTP-triggered automations
- **Scheduled Workflows**: Time-based automations
- **Manual Workflows**: User-triggered workflows for testing
- **API Integration Workflows**: Connect to external services
- **Data Processing Workflows**: Transform and manipulate data

## Setup

### Prerequisites
1. **n8n Instance**: You need a running n8n instance (self-hosted or cloud)
2. **n8n API Key**: Generate an API key from your n8n instance
3. **Environment Variables**: Configure the required environment variables

### Environment Configuration

Add these variables to your `.env` file:

```bash
# Required
GOOGLE_API_KEY=your_google_api_key_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Optional (for n8n integration)
N8N_API_URL=http://localhost:5678  # Your n8n instance URL
N8N_API_KEY=your_n8n_api_key_here  # Your n8n API key
```

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure your environment variables in `.env`

3. Start the bot:
```bash
npm run dev
```

## Usage

### Basic Commands

#### Create a Simple Workflow
```
Create a workflow that sends a daily weather report to my email
```

#### List All Workflows
```
Show me all my workflows
```

#### Get Workflow Details
```
Show me details for workflow "weather-report"
```

#### Create a Webhook Workflow
```
Create a webhook workflow that processes incoming data and saves it to a database
```

#### Get Available Node Types
```
What n8n nodes are available for HTTP requests?
```

### Advanced Usage

#### Complex Workflow Creation
```
Create a workflow that:
1. Triggers when a new email arrives
2. Extracts the subject and body
3. Sends a summary to Slack
4. Saves the email details to a database
```

#### Workflow Modification
```
Update my "data-processor" workflow to include error handling
```

#### Workflow Management
```
Delete the old "test-workflow" and create a new one with better error handling
```

## Available Tools

The agent has access to the following tools:

### 1. `create_workflow`
Creates a new n8n workflow with custom configuration.

**Parameters:**
- `name`: Name of the workflow
- `description`: Description of the workflow
- `active`: Whether the workflow should be active
- `nodes`: Array of nodes for the workflow
- `connections`: Connections between nodes

### 2. `list_workflows`
Lists all available workflows in your n8n instance.

**Parameters:**
- `limit`: Maximum number of workflows to return

### 3. `get_workflow`
Retrieves detailed information about a specific workflow.

**Parameters:**
- `workflowId`: ID of the workflow to retrieve

### 4. `update_workflow`
Updates an existing workflow with new configuration.

**Parameters:**
- `workflowId`: ID of the workflow to update
- `name`: New name for the workflow
- `description`: New description
- `active`: Whether the workflow should be active
- `nodes`: Updated array of nodes
- `connections`: Updated connections

### 5. `delete_workflow`
Deletes a workflow from your n8n instance.

**Parameters:**
- `workflowId`: ID of the workflow to delete

### 6. `create_simple_workflow`
Creates a basic workflow from a natural language description.

**Parameters:**
- `name`: Name of the workflow
- `description`: Natural language description
- `triggerType`: Type of trigger (webhook, schedule, manual)

### 7. `get_node_types`
Retrieves information about available n8n node types.

**Parameters:**
- `category`: Filter by node category
- `search`: Search term for node types

## Examples

### Example 1: Simple Data Processing Workflow
```
User: "Create a workflow that processes CSV files and sends the results to Slack"

Agent: I'll create a workflow that processes CSV files and sends results to Slack. Let me set this up for you.

[Creates workflow with: Manual Trigger → HTTP Request (to process CSV) → Set (to format data) → Slack (to send message)]
```

### Example 2: Webhook Integration
```
User: "I need a webhook that receives form data and saves it to a database"

Agent: I'll create a webhook workflow that receives form data and saves it to a database.

[Creates workflow with: Webhook Trigger → Set (to format data) → Database node (to save data) → Respond to Webhook]
```

### Example 3: Scheduled Automation
```
User: "Create a daily report that fetches data from an API and emails it to me"

Agent: I'll create a scheduled workflow that runs daily to fetch API data and email it to you.

[Creates workflow with: Schedule Trigger → HTTP Request (to fetch data) → Set (to format report) → Email (to send report)]
```

## Best Practices

### When Creating Workflows
1. **Clear Naming**: Use descriptive names for workflows and nodes
2. **Error Handling**: Always include error handling paths
3. **Documentation**: Add descriptions to explain what each workflow does
4. **Testing**: Test workflows before making them active
5. **Security**: Use environment variables for sensitive data

### When Describing Workflows
1. **Be Specific**: Provide clear, detailed descriptions
2. **Include Triggers**: Specify how the workflow should be triggered
3. **Mention Data Sources**: Include information about data sources and destinations
4. **Error Scenarios**: Consider what should happen when things go wrong

## Troubleshooting

### Common Issues

#### "Failed to create workflow"
- Check if your n8n instance is running
- Verify your API key is correct
- Ensure the n8n API URL is accessible

#### "Workflow not found"
- Check if the workflow ID is correct
- Verify the workflow exists in your n8n instance

#### "Invalid node type"
- Use the `get_node_types` tool to see available nodes
- Check the node type name spelling

### Getting Help

If you encounter issues:
1. Check the bot logs for error messages
2. Verify your n8n instance is running and accessible
3. Ensure your API credentials are correct
4. Try creating a simple workflow first to test the connection

## Architecture

The n8n Workflow Agent is built using:

- **ADK-TS**: Agent Development Kit for TypeScript
- **LlmAgent**: Core agent implementation
- **FunctionTool**: Custom tools for n8n API integration
- **Axios**: HTTP client for API requests
- **Zod**: Schema validation

## Contributing

To extend the n8n Workflow Agent:

1. Add new tools in `src/agents/n8n-workflow-agent/n8n-tools.ts`
2. Update the agent description and instructions
3. Test with your n8n instance
4. Update this documentation

## License

This project is part of the n8n-agent project and follows the same license terms.
