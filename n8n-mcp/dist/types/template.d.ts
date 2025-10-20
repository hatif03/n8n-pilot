export interface TemplateInfo {
    id: string;
    name: string;
    description: string;
    author: {
        name: string;
        username: string;
        verified: boolean;
    };
    nodes: string[];
    views: number;
    created: string;
    url: string;
    metadata?: {
        categories: string[];
        complexity: 'simple' | 'medium' | 'complex';
        use_cases: string[];
        estimated_setup_minutes: number;
        required_services: string[];
        key_features: string[];
        target_audience: string[];
    };
}
export interface TemplateWithWorkflow extends TemplateInfo {
    workflow: any;
}
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
}
export interface TemplateMinimal {
    id: string;
    name: string;
    description: string;
    views: number;
    nodeCount: number;
    metadata?: {
        categories: string[];
        complexity: 'simple' | 'medium' | 'complex';
        use_cases: string[];
        estimated_setup_minutes: number;
        required_services: string[];
        key_features: string[];
        target_audience: string[];
    };
}
export type TemplateField = 'id' | 'name' | 'description' | 'author' | 'nodes' | 'views' | 'created' | 'url' | 'metadata';
export type PartialTemplateInfo = Partial<TemplateInfo>;
export interface TemplateSearchParams {
    query?: string;
    categories?: string[];
    complexity?: 'simple' | 'medium' | 'complex';
    use_cases?: string[];
    required_services?: string[];
    target_audience?: string[];
    limit?: number;
    offset?: number;
}
export interface TemplateFilter {
    field: TemplateField;
    operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'in' | 'gt' | 'lt' | 'gte' | 'lte';
    value: any;
}
