/**
 * Example Generator Service
 * 
 * Provides concrete, working examples for n8n nodes to help AI agents
 * understand how to configure them properly.
 */

export interface NodeExamples {
  minimal: Record<string, any>;
  common?: Record<string, any>;
  advanced?: Record<string, any>;
}

export class ExampleGenerator {
  /**
   * Curated examples for the most commonly used nodes.
   * Each example is a valid configuration that can be used directly.
   */
  private static NODE_EXAMPLES: Record<string, NodeExamples> = {
    // HTTP Request - Most versatile node
    'n8n-nodes-base.httpRequest': {
      minimal: {
        url: 'https://api.example.com/data'
      },
      common: {
        method: 'POST',
        url: 'https://api.example.com/users',
        sendBody: true,
        contentType: 'json',
        specifyBody: 'json',
        jsonBody: '{\n  "name": "John Doe",\n  "email": "john@example.com"\n}'
      },
      advanced: {
        method: 'POST',
        url: 'https://api.example.com/protected/resource',
        authentication: 'genericCredentialType',
        genericAuthType: 'headerAuth',
        sendHeaders: true,
        headerParameters: {
          parameters: [
            {
              name: 'X-API-Version',
              value: 'v2'
            }
          ]
        },
        sendBody: true,
        contentType: 'json',
        specifyBody: 'json',
        jsonBody: '{\n  "action": "update",\n  "data": {}\n}',
        options: {
          timeout: 30000,
          retry: {
            enabled: true,
            maxRetries: 3
          }
        }
      }
    },

    // Webhook - Most common trigger
    'n8n-nodes-base.webhook': {
      minimal: {
        httpMethod: 'POST',
        path: 'webhook'
      },
      common: {
        httpMethod: 'POST',
        path: 'my-webhook',
        responseMode: 'responseNode',
        options: {
          noResponseBody: false
        }
      },
      advanced: {
        httpMethod: 'POST',
        path: 'secure-webhook',
        responseMode: 'responseNode',
        authentication: 'headerAuth',
        headerAuth: {
          name: 'Authorization',
          value: 'Bearer {{ $env.WEBHOOK_TOKEN }}'
        },
        options: {
          noResponseBody: false,
          rawBody: true
        }
      }
    },

    // Slack - Popular integration
    'n8n-nodes-base.slack': {
      minimal: {
        resource: 'message',
        operation: 'post',
        channel: '#general',
        text: 'Hello from n8n!'
      },
      common: {
        resource: 'message',
        operation: 'post',
        channel: '#notifications',
        text: 'New data received: {{ $json.message }}',
        otherOptions: {
          link_names: true,
          unfurl_links: false
        }
      },
      advanced: {
        resource: 'message',
        operation: 'post',
        channel: '#alerts',
        text: 'Alert: {{ $json.title }}',
        attachments: {
          attachments: [
            {
              color: 'danger',
              fields: [
                {
                  title: 'Status',
                  value: '{{ $json.status }}',
                  short: true
                },
                {
                  title: 'Timestamp',
                  value: '{{ $now }}',
                  short: true
                }
              ]
            }
          ]
        }
      }
    },

    // Google Sheets - Data processing
    'n8n-nodes-base.googleSheets': {
      minimal: {
        operation: 'append',
        documentId: '1ABC123DEF456',
        sheetName: 'Sheet1',
        columns: {
          mappingMode: 'defineBelow',
          value: {
            'A': 'Name',
            'B': 'Email'
          }
        }
      },
      common: {
        operation: 'append',
        documentId: '{{ $json.sheetId }}',
        sheetName: 'Data',
        columns: {
          mappingMode: 'defineBelow',
          value: {
            'A': '{{ $json.name }}',
            'B': '{{ $json.email }}',
            'C': '{{ $json.date }}'
          }
        }
      },
      advanced: {
        operation: 'update',
        documentId: '{{ $json.sheetId }}',
        sheetName: 'Users',
        columns: {
          mappingMode: 'defineBelow',
          value: {
            'A': '{{ $json.id }}',
            'B': '{{ $json.name }}',
            'C': '{{ $json.email }}',
            'D': '{{ $json.role }}'
          }
        },
        options: {
          usePathForKeyRow: true,
          keyRow: 1
        }
      }
    },

    // Set - Data transformation
    'n8n-nodes-base.set': {
      minimal: {
        values: {
          string: [
            {
              name: 'greeting',
              value: 'Hello World'
            }
          ]
        }
      },
      common: {
        values: {
          string: [
            {
              name: 'fullName',
              value: '{{ $json.firstName }} {{ $json.lastName }}'
            },
            {
              name: 'timestamp',
              value: '{{ $now }}'
            }
          ],
          number: [
            {
              name: 'count',
              value: '{{ $json.items.length }}'
            }
          ]
        }
      },
      advanced: {
        values: {
          string: [
            {
              name: 'processedData',
              value: '{{ JSON.stringify($json.data) }}'
            }
          ],
          object: [
            {
              name: 'metadata',
              value: {
                source: 'n8n',
                version: '1.0',
                processedAt: '{{ $now }}'
              }
            }
          ]
        },
        options: {
          assignAll: false,
          keepOnlySet: false
        }
      }
    },

    // Code - Custom logic
    'n8n-nodes-base.code': {
      minimal: {
        jsCode: 'return items;'
      },
      common: {
        jsCode: `// Process each item
for (let i = 0; i < items.length; i++) {
  const item = items[i];
  
  // Add processed data
  item.json.processed = true;
  item.json.timestamp = new Date().toISOString();
}

return items;`
      },
      advanced: {
        jsCode: `// Advanced data processing
const results = [];

for (const item of items) {
  try {
    // Validate required fields
    if (!item.json.email || !item.json.name) {
      throw new Error('Missing required fields');
    }
    
    // Process data
    const processed = {
      id: item.json.id || Math.random().toString(36).substr(2, 9),
      name: item.json.name.trim(),
      email: item.json.email.toLowerCase(),
      status: 'processed',
      createdAt: new Date().toISOString()
    };
    
    results.push({ json: processed });
  } catch (error) {
    // Handle errors gracefully
    results.push({
      json: {
        error: error.message,
        originalData: item.json
      }
    });
  }
}

return results;`
      }
    },

    // IF - Conditional logic
    'n8n-nodes-base.if': {
      minimal: {
        conditions: {
          string: [
            {
              value1: '{{ $json.status }}',
              operation: 'equal',
              value2: 'active'
            }
          ]
        }
      },
      common: {
        conditions: {
          number: [
            {
              value1: '{{ $json.count }}',
              operation: 'larger',
              value2: 0
            }
          ]
        }
      },
      advanced: {
        conditions: {
          string: [
            {
              value1: '{{ $json.email }}',
              operation: 'contains',
              value2: '@company.com'
            }
          ],
          number: [
            {
              value1: '{{ $json.score }}',
              operation: 'largerEqual',
              value2: 80
            }
          ]
        },
        options: {
          combineOperation: 'any'
        }
      }
    },

    // Switch - Multiple conditions
    'n8n-nodes-base.switch': {
      minimal: {
        dataType: 'string',
        value1: '{{ $json.category }}',
        rules: {
          rules: [
            {
              value2: 'urgent',
              output: 0
            },
            {
              value2: 'normal',
              output: 1
            }
          ]
        }
      },
      common: {
        dataType: 'number',
        value1: '{{ $json.priority }}',
        rules: {
          rules: [
            {
              value2: 1,
              operation: 'equal',
              output: 0
            },
            {
              value2: 2,
              operation: 'equal',
              output: 1
            },
            {
              value2: 3,
              operation: 'equal',
              output: 2
            }
          ]
        }
      },
      advanced: {
        dataType: 'string',
        value1: '{{ $json.status }}',
        rules: {
          rules: [
            {
              value2: 'pending',
              operation: 'equal',
              output: 0
            },
            {
              value2: 'processing',
              operation: 'equal',
              output: 1
            },
            {
              value2: 'completed',
              operation: 'equal',
              output: 2
            },
            {
              value2: 'error',
              operation: 'equal',
              output: 3
            }
          ]
        },
        options: {
          fallbackOutput: 4
        }
      }
    }
  };

  /**
   * Get examples for a specific node type
   */
  static getExamples(nodeType: string): NodeExamples | null {
    return this.NODE_EXAMPLES[nodeType] || null;
  }

  /**
   * Get all available node types with examples
   */
  static getAvailableNodeTypes(): string[] {
    return Object.keys(this.NODE_EXAMPLES);
  }

  /**
   * Get minimal example for a node
   */
  static getMinimalExample(nodeType: string): Record<string, any> | null {
    const examples = this.getExamples(nodeType);
    return examples?.minimal || null;
  }

  /**
   * Get common example for a node
   */
  static getCommonExample(nodeType: string): Record<string, any> | null {
    const examples = this.getExamples(nodeType);
    return examples?.common || examples?.minimal || null;
  }

  /**
   * Get advanced example for a node
   */
  static getAdvancedExample(nodeType: string): Record<string, any> | null {
    const examples = this.getExamples(nodeType);
    return examples?.advanced || examples?.common || examples?.minimal || null;
  }

  /**
   * Get all examples for a node type
   */
  static getAllExamples(nodeType: string): {
    minimal?: Record<string, any>;
    common?: Record<string, any>;
    advanced?: Record<string, any>;
  } | null {
    const examples = this.getExamples(nodeType);
    if (!examples) return null;

    return {
      minimal: examples.minimal,
      common: examples.common,
      advanced: examples.advanced
    };
  }

  /**
   * Search for examples by node type pattern
   */
  static searchExamples(pattern: string): Array<{ nodeType: string; examples: NodeExamples }> {
    const results: Array<{ nodeType: string; examples: NodeExamples }> = [];
    const searchPattern = pattern.toLowerCase();

    for (const [nodeType, examples] of Object.entries(this.NODE_EXAMPLES)) {
      if (nodeType.toLowerCase().includes(searchPattern)) {
        results.push({ nodeType, examples });
      }
    }

    return results;
  }

  /**
   * Get examples for multiple node types
   */
  static getBulkExamples(nodeTypes: string[]): Record<string, NodeExamples | null> {
    const results: Record<string, NodeExamples | null> = {};
    
    for (const nodeType of nodeTypes) {
      results[nodeType] = this.getExamples(nodeType);
    }

    return results;
  }

  /**
   * Validate if a configuration matches an example
   */
  static validateConfiguration(nodeType: string, config: Record<string, any>): {
    isValid: boolean;
    missingFields: string[];
    extraFields: string[];
    suggestions: string[];
  } {
    const examples = this.getExamples(nodeType);
    if (!examples) {
      return {
        isValid: false,
        missingFields: [],
        extraFields: [],
        suggestions: ['No examples available for this node type']
      };
    }

    const minimalKeys = Object.keys(examples.minimal);
    const configKeys = Object.keys(config);
    
    const missingFields = minimalKeys.filter(key => !configKeys.includes(key));
    const extraFields = configKeys.filter(key => !minimalKeys.includes(key));
    
    const suggestions: string[] = [];
    if (missingFields.length > 0) {
      suggestions.push(`Missing required fields: ${missingFields.join(', ')}`);
    }
    if (extraFields.length > 0) {
      suggestions.push(`Extra fields found: ${extraFields.join(', ')}`);
    }

    return {
      isValid: missingFields.length === 0,
      missingFields,
      extraFields,
      suggestions
    };
  }
}
