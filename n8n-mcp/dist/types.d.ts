export interface N8nWorkflow {
    id: string;
    name: string;
    nodes: N8nWorkflowNode[];
    connections: N8nConnections;
    active: boolean;
    settings: Record<string, any>;
    staticData?: Record<string, any>;
    pinData?: Record<string, any>;
    versionId?: string;
    meta?: Record<string, any>;
    tags?: string[];
    triggerCount?: number;
    createdAt?: string;
    updatedAt?: string;
}
export interface N8nWorkflowNode {
    id: string;
    name: string;
    type: string;
    typeVersion: number;
    position: [number, number];
    parameters: Record<string, any>;
    credentials?: Record<string, string>;
    webhookId?: string;
    disabled?: boolean;
    notes?: string;
    continueOnFail?: boolean;
    alwaysOutputData?: boolean;
    executeOnce?: boolean;
    retryOnFail?: boolean;
    maxTries?: number;
    waitBetweenTries?: number;
    onError?: string;
    noExecuteExpression?: boolean;
    settings?: Record<string, any>;
    color?: string;
    icon?: string;
    iconData?: string;
    iconUrl?: string;
}
export interface N8nConnections {
    [sourceNodeId: string]: {
        [outputName: string]: N8nConnectionDetail[];
    };
}
export interface N8nConnectionDetail {
    node: string;
    type: string;
    index: number;
}
export interface N8nNodeDefinition {
    name: string;
    displayName: string;
    description: string;
    version: number;
    defaults: {
        name: string;
        color: string;
    };
    inputs: string[];
    outputs: string[];
    credentials?: string[];
    properties: N8nNodeProperty[];
    codex?: {
        categories: string[];
        subcategories: Record<string, string[]>;
    };
    documentationUrl?: string;
    icon?: string;
    iconUrl?: string;
    group?: string[];
    webhooks?: N8nWebhookDefinition[];
    pollInterval?: number;
    requestDefaults?: {
        baseURL?: string;
        headers?: Record<string, string>;
    };
    authentication?: string;
    request?: N8nRequestDefinition;
    response?: N8nResponseDefinition;
    routing?: N8nRoutingDefinition;
    settings?: N8nNodeProperty[];
    subtitle?: string;
    badge?: string;
    outputsUI?: Record<string, any>;
    inputPanel?: Record<string, any>;
    outputPanel?: Record<string, any>;
}
export interface N8nNodeProperty {
    displayName: string;
    name: string;
    type: string;
    default?: any;
    description?: string;
    required?: boolean;
    options?: Array<{
        name: string;
        value: any;
    }>;
    displayOptions?: {
        show?: Record<string, any>;
        hide?: Record<string, any>;
    };
    typeOptions?: Record<string, any>;
    placeholder?: string;
    hint?: string;
    noDataExpression?: boolean;
    expression?: boolean;
}
export interface N8nWebhookDefinition {
    name: string;
    httpMethod: string;
    path: string;
    responseMode: string;
    responseData?: string;
    responseBinaryPropertyName?: string;
    responseHeaders?: Record<string, string>;
    responseContentType?: string;
    responseStatusCode?: number;
    responseBody?: string;
}
export interface N8nRequestDefinition {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: any;
    qs?: Record<string, any>;
    json?: boolean;
    form?: Record<string, any>;
    formData?: Record<string, any>;
    timeout?: number;
    followRedirect?: boolean;
    maxRedirects?: number;
    rejectUnauthorized?: boolean;
    agent?: any;
    proxy?: string;
    auth?: {
        username: string;
        password: string;
    };
    oauth1?: Record<string, any>;
    oauth2?: Record<string, any>;
    aws?: Record<string, any>;
    digest?: Record<string, any>;
    hawk?: Record<string, any>;
    ntlm?: Record<string, any>;
    jwt?: Record<string, any>;
    mqtt?: Record<string, any>;
    socketio?: Record<string, any>;
    grpc?: Record<string, any>;
    graphql?: Record<string, any>;
    soap?: Record<string, any>;
    xml?: Record<string, any>;
    csv?: Record<string, any>;
}
export interface N8nResponseDefinition {
    statusCode: number;
    headers?: Record<string, string>;
    body?: any;
    binary?: boolean;
    binaryPropertyName?: string;
    contentType?: string;
    encoding?: string;
    compression?: string;
    chunked?: boolean;
    keepAlive?: boolean;
    timeout?: number;
    maxAge?: number;
    etag?: string;
    lastModified?: string;
    cacheControl?: string;
    expires?: string;
    vary?: string;
    allow?: string;
    contentLocation?: string;
    contentDisposition?: string;
    contentEncoding?: string;
    contentLanguage?: string;
    contentLength?: number;
    contentRange?: string;
    contentSecurityPolicy?: string;
    contentSecurityPolicyReportOnly?: string;
    crossOriginEmbedderPolicy?: string;
    crossOriginOpenerPolicy?: string;
    crossOriginResourcePolicy?: string;
    expectCt?: string;
    featurePolicy?: string;
    permissionsPolicy?: string;
    referrerPolicy?: string;
    strictTransportSecurity?: string;
    upgradeInsecureRequests?: string;
    xContentTypeOptions?: string;
    xDnsPrefetchControl?: string;
    xDownloadOptions?: string;
    xFrameOptions?: string;
    xPermittedCrossDomainPolicies?: string;
    xPoweredBy?: string;
    xXssProtection?: string;
}
export interface N8nRoutingDefinition {
    rules: Array<{
        condition: string;
        output: string;
    }>;
    defaultOutput?: string;
}
export interface WorkflowSearchParams {
    search_term?: string;
    n8n_version?: string;
    limit?: number;
    cursor?: string;
    tags?: boolean;
    token_logic?: 'or' | 'and';
}
export interface WorkflowCreateParams {
    workflow_name: string;
    workspace_dir?: string;
    description?: string;
    active?: boolean;
    settings?: Record<string, any>;
}
export interface NodeAddParams {
    workflow_name: string;
    node_type: string;
    position?: [number, number];
    parameters?: Record<string, any>;
    node_name?: string;
    typeVersion?: number;
    webhookId?: string;
    workflow_path?: string;
    connect_from?: string;
    connect_to?: string;
}
export interface ConnectionParams {
    workflow_name: string;
    source_node_id: string;
    source_node_output_name: string;
    target_node_id: string;
    target_node_input_name: string;
    target_node_input_index?: number;
    workflow_path?: string;
}
export interface UserContext {
    userId?: string;
    sessionId?: string;
}
