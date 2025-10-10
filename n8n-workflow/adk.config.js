module.exports = {
  // Agent configuration
  agents: {
    // Main agent entry point
    default: './src/agents/simple-agent.ts',
    
    // Additional agents
    schemas: './src/schemas/agent.ts',
    workflow_manager: './src/agents/assistant/agent.ts'
  },
  
  // Build configuration
  build: {
    // esbuild configuration
    esbuild: {
      target: 'es2022',
      format: 'cjs',
      platform: 'node',
      bundle: true,
      // Only externalize node_modules dependencies, not entry points
      external: [
        // Node.js built-in modules
        'fs',
        'path',
        'crypto',
        'util',
        'stream',
        'events',
        'child_process',
        'os',
        'url',
        'querystring',
        'http',
        'https',
        'net',
        'tls',
        'zlib',
        'buffer',
        'assert',
        'timers',
        'cluster',
        'worker_threads',
        'perf_hooks',
        'async_hooks',
        'inspector',
        'trace_events',
        'v8',
        'vm',
        'readline',
        'repl',
        'tty',
        'dgram',
        'dns',
        'querystring',
        'punycode',
        'string_decoder',
        'sys',
        'tls',
        'tty',
        'url',
        'util',
        'v8',
        'vm',
        'worker_threads',
        'zlib'
      ],
      // Ensure entry points are not externalized
      entryPoints: [
        './src/agents/simple-agent.ts',
        './src/schemas/agent.ts', 
        './src/agents/assistant/agent.ts'
      ],
      // Additional esbuild options
      sourcemap: true,
      minify: false,
      keepNames: true,
      // Don't externalize entry points
      metafile: true
    }
  },
  
  // Runtime configuration
  runtime: {
    // Node.js runtime options
    node: {
      version: '18+',
      experimental: {
        // Enable experimental features if needed
      }
    }
  }
};
