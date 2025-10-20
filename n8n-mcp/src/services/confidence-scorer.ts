/**
 * Confidence Scorer for node-specific validations
 *
 * Provides confidence scores for node-specific recommendations,
 * allowing users to understand the reliability of suggestions.
 */

export interface ConfidenceScore {
  value: number; // 0.0 to 1.0
  reason: string;
  factors: ConfidenceFactor[];
}

export interface ConfidenceFactor {
  name: string;
  weight: number;
  matched: boolean;
  description: string;
}

export class ConfidenceScorer {
  /**
   * Calculate confidence score for resource locator recommendation
   */
  static scoreResourceLocatorRecommendation(
    fieldName: string,
    nodeType: string,
    value: string
  ): ConfidenceScore {
    const factors: ConfidenceFactor[] = [];
    let totalWeight = 0;
    let matchedWeight = 0;

    // Factor 1: Exact field name match (highest confidence)
    const exactFieldMatch = this.checkExactFieldMatch(fieldName, nodeType);
    factors.push({
      name: 'exact-field-match',
      weight: 0.5,
      matched: exactFieldMatch,
      description: `Field name '${fieldName}' is known to use resource locator in ${nodeType}`
    });

    // Factor 2: Field name pattern (medium confidence)
    const patternMatch = this.checkFieldPattern(fieldName);
    factors.push({
      name: 'field-pattern',
      weight: 0.3,
      matched: patternMatch,
      description: `Field name '${fieldName}' matches common resource locator patterns`
    });

    // Factor 3: Value format (medium confidence)
    const valueFormatMatch = this.checkValueFormat(value);
    factors.push({
      name: 'value-format',
      weight: 0.2,
      matched: valueFormatMatch,
      description: `Value format suggests resource locator usage`
    });

    // Calculate weighted score
    for (const factor of factors) {
      totalWeight += factor.weight;
      if (factor.matched) {
        matchedWeight += factor.weight;
      }
    }

    const score = totalWeight > 0 ? matchedWeight / totalWeight : 0;

    return {
      value: Math.round(score * 100) / 100,
      reason: this.generateReason(score, factors),
      factors
    };
  }

  /**
   * Calculate confidence score for node type suggestion
   */
  static scoreNodeTypeSuggestion(
    searchTerm: string,
    suggestedNodeType: string,
    context: string
  ): ConfidenceScore {
    const factors: ConfidenceFactor[] = [];
    let totalWeight = 0;
    let matchedWeight = 0;

    // Factor 1: Exact name match (highest confidence)
    const exactMatch = this.checkExactNameMatch(searchTerm, suggestedNodeType);
    factors.push({
      name: 'exact-name-match',
      weight: 0.4,
      matched: exactMatch,
      description: `Exact match between search term and node type`
    });

    // Factor 2: Partial name match (high confidence)
    const partialMatch = this.checkPartialNameMatch(searchTerm, suggestedNodeType);
    factors.push({
      name: 'partial-name-match',
      weight: 0.3,
      matched: partialMatch,
      description: `Partial match between search term and node type`
    });

    // Factor 3: Context relevance (medium confidence)
    const contextMatch = this.checkContextRelevance(context, suggestedNodeType);
    factors.push({
      name: 'context-relevance',
      weight: 0.2,
      matched: contextMatch,
      description: `Node type is relevant to the given context`
    });

    // Factor 4: Common usage (low confidence)
    const commonUsage = this.checkCommonUsage(suggestedNodeType);
    factors.push({
      name: 'common-usage',
      weight: 0.1,
      matched: commonUsage,
      description: `Node type is commonly used`
    });

    // Calculate weighted score
    for (const factor of factors) {
      totalWeight += factor.weight;
      if (factor.matched) {
        matchedWeight += factor.weight;
      }
    }

    const score = totalWeight > 0 ? matchedWeight / totalWeight : 0;

    return {
      value: Math.round(score * 100) / 100,
      reason: this.generateReason(score, factors),
      factors
    };
  }

  /**
   * Calculate confidence score for workflow validation
   */
  static scoreWorkflowValidation(
    workflow: any,
    validationResults: any[]
  ): ConfidenceScore {
    const factors: ConfidenceFactor[] = [];
    let totalWeight = 0;
    let matchedWeight = 0;

    // Factor 1: No errors (highest confidence)
    const noErrors = validationResults.filter(r => r.type === 'error').length === 0;
    factors.push({
      name: 'no-errors',
      weight: 0.4,
      matched: noErrors,
      description: 'Workflow has no validation errors'
    });

    // Factor 2: No warnings (high confidence)
    const noWarnings = validationResults.filter(r => r.type === 'warning').length === 0;
    factors.push({
      name: 'no-warnings',
      weight: 0.3,
      matched: noWarnings,
      description: 'Workflow has no validation warnings'
    });

    // Factor 3: Complete structure (medium confidence)
    const completeStructure = this.checkCompleteStructure(workflow);
    factors.push({
      name: 'complete-structure',
      weight: 0.2,
      matched: completeStructure,
      description: 'Workflow has complete structure (nodes, connections)'
    });

    // Factor 4: Best practices (low confidence)
    const bestPractices = this.checkBestPractices(workflow);
    factors.push({
      name: 'best-practices',
      weight: 0.1,
      matched: bestPractices,
      description: 'Workflow follows best practices'
    });

    // Calculate weighted score
    for (const factor of factors) {
      totalWeight += factor.weight;
      if (factor.matched) {
        matchedWeight += factor.weight;
      }
    }

    const score = totalWeight > 0 ? matchedWeight / totalWeight : 0;

    return {
      value: Math.round(score * 100) / 100,
      reason: this.generateReason(score, factors),
      factors
    };
  }

  /**
   * Check if field name exactly matches known resource locator fields
   */
  private static checkExactFieldMatch(fieldName: string, nodeType: string): boolean {
    const knownResourceLocatorFields: Record<string, string[]> = {
      'n8n-nodes-base.httpRequest': ['url', 'baseUrl', 'endpoint'],
      'n8n-nodes-base.webhook': ['path', 'webhookUrl'],
      'n8n-nodes-base.slack': ['channel', 'channelId'],
      'n8n-nodes-base.googleSheets': ['documentId', 'sheetName'],
      'n8n-nodes-base.postgres': ['table', 'schema'],
      'n8n-nodes-base.mysql': ['table', 'database'],
      'n8n-nodes-base.mongodb': ['collection', 'database']
    };

    const fields = knownResourceLocatorFields[nodeType] || [];
    return fields.includes(fieldName);
  }

  /**
   * Check if field name matches common resource locator patterns
   */
  private static checkFieldPattern(fieldName: string): boolean {
    const patterns = [
      'url', 'path', 'endpoint', 'table', 'collection', 'sheet',
      'channel', 'database', 'schema', 'id', 'name'
    ];
    
    return patterns.some(pattern => 
      fieldName.toLowerCase().includes(pattern)
    );
  }

  /**
   * Check if value format suggests resource locator usage
   */
  private static checkValueFormat(value: string): boolean {
    // Check for URL patterns
    if (value.match(/^https?:\/\//)) return true;
    
    // Check for path patterns
    if (value.match(/^\/[a-zA-Z0-9_\/-]+$/)) return true;
    
    // Check for ID patterns
    if (value.match(/^[a-zA-Z0-9_-]+$/)) return true;
    
    // Check for expression patterns
    if (value.includes('{{') && value.includes('}}')) return true;
    
    return false;
  }

  /**
   * Check exact name match
   */
  private static checkExactNameMatch(searchTerm: string, nodeType: string): boolean {
    const nodeName = nodeType.split('.').pop() || '';
    return nodeName.toLowerCase() === searchTerm.toLowerCase();
  }

  /**
   * Check partial name match
   */
  private static checkPartialNameMatch(searchTerm: string, nodeType: string): boolean {
    const nodeName = nodeType.split('.').pop() || '';
    return nodeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           searchTerm.toLowerCase().includes(nodeName.toLowerCase());
  }

  /**
   * Check context relevance
   */
  private static checkContextRelevance(context: string, nodeType: string): boolean {
    const contextKeywords = context.toLowerCase().split(' ');
    const nodeKeywords = nodeType.toLowerCase().split('.');
    
    return contextKeywords.some(keyword => 
      nodeKeywords.some(nodeKeyword => 
        nodeKeyword.includes(keyword) || keyword.includes(nodeKeyword)
      )
    );
  }

  /**
   * Check common usage
   */
  private static checkCommonUsage(nodeType: string): boolean {
    const commonNodes = [
      'n8n-nodes-base.httpRequest',
      'n8n-nodes-base.webhook',
      'n8n-nodes-base.set',
      'n8n-nodes-base.if',
      'n8n-nodes-base.slack',
      'n8n-nodes-base.googleSheets'
    ];
    
    return commonNodes.includes(nodeType);
  }

  /**
   * Check complete structure
   */
  private static checkCompleteStructure(workflow: any): boolean {
    return !!(workflow.nodes && 
              workflow.nodes.length > 0 && 
              workflow.connections &&
              Object.keys(workflow.connections).length > 0);
  }

  /**
   * Check best practices
   */
  private static checkBestPractices(workflow: any): boolean {
    if (!workflow.nodes) return false;
    
    // Check for descriptive node names
    const hasDescriptiveNames = workflow.nodes.every((node: any) => 
      node.name && node.name.trim().length > 0
    );
    
    // Check for trigger nodes
    const hasTrigger = workflow.nodes.some((node: any) => 
      node.type.includes('trigger') || node.type.includes('webhook')
    );
    
    return hasDescriptiveNames && hasTrigger;
  }

  /**
   * Generate reason based on score and factors
   */
  private static generateReason(score: number, factors: ConfidenceFactor[]): string {
    const matchedFactors = factors.filter(f => f.matched);
    const unmatchedFactors = factors.filter(f => !f.matched);
    
    if (score >= 0.8) {
      return `High confidence (${Math.round(score * 100)}%) - ${matchedFactors.length} of ${factors.length} factors matched`;
    } else if (score >= 0.6) {
      return `Medium confidence (${Math.round(score * 100)}%) - ${matchedFactors.length} of ${factors.length} factors matched`;
    } else if (score >= 0.4) {
      return `Low confidence (${Math.round(score * 100)}%) - ${matchedFactors.length} of ${factors.length} factors matched`;
    } else {
      return `Very low confidence (${Math.round(score * 100)}%) - ${matchedFactors.length} of ${factors.length} factors matched`;
    }
  }

  /**
   * Get confidence level description
   */
  static getConfidenceLevel(score: number): string {
    if (score >= 0.9) return 'Very High';
    if (score >= 0.8) return 'High';
    if (score >= 0.6) return 'Medium';
    if (score >= 0.4) return 'Low';
    return 'Very Low';
  }

  /**
   * Get confidence color for UI
   */
  static getConfidenceColor(score: number): string {
    if (score >= 0.8) return 'green';
    if (score >= 0.6) return 'yellow';
    if (score >= 0.4) return 'orange';
    return 'red';
  }
}
