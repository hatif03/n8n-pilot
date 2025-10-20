/**
 * Confidence Scorer for node-specific validations
 *
 * Provides confidence scores for node-specific recommendations,
 * allowing users to understand the reliability of suggestions.
 */
export interface ConfidenceScore {
    value: number;
    reason: string;
    factors: ConfidenceFactor[];
}
export interface ConfidenceFactor {
    name: string;
    weight: number;
    matched: boolean;
    description: string;
}
export declare class ConfidenceScorer {
    /**
     * Calculate confidence score for resource locator recommendation
     */
    static scoreResourceLocatorRecommendation(fieldName: string, nodeType: string, value: string): ConfidenceScore;
    /**
     * Calculate confidence score for node type suggestion
     */
    static scoreNodeTypeSuggestion(searchTerm: string, suggestedNodeType: string, context: string): ConfidenceScore;
    /**
     * Calculate confidence score for workflow validation
     */
    static scoreWorkflowValidation(workflow: any, validationResults: any[]): ConfidenceScore;
    /**
     * Check if field name exactly matches known resource locator fields
     */
    private static checkExactFieldMatch;
    /**
     * Check if field name matches common resource locator patterns
     */
    private static checkFieldPattern;
    /**
     * Check if value format suggests resource locator usage
     */
    private static checkValueFormat;
    /**
     * Check exact name match
     */
    private static checkExactNameMatch;
    /**
     * Check partial name match
     */
    private static checkPartialNameMatch;
    /**
     * Check context relevance
     */
    private static checkContextRelevance;
    /**
     * Check common usage
     */
    private static checkCommonUsage;
    /**
     * Check complete structure
     */
    private static checkCompleteStructure;
    /**
     * Check best practices
     */
    private static checkBestPractices;
    /**
     * Generate reason based on score and factors
     */
    private static generateReason;
    /**
     * Get confidence level description
     */
    static getConfidenceLevel(score: number): string;
    /**
     * Get confidence color for UI
     */
    static getConfidenceColor(score: number): string;
}
