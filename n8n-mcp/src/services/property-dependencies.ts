/**
 * Property Dependencies Service
 * 
 * Analyzes property dependencies and visibility conditions.
 * Helps AI agents understand which properties affect others.
 */

export interface PropertyDependency {
  property: string;
  displayName: string;
  dependsOn: DependencyCondition[];
  showWhen?: Record<string, any>;
  hideWhen?: Record<string, any>;
  enablesProperties?: string[];
  disablesProperties?: string[];
  notes?: string[];
}

export interface DependencyCondition {
  property: string;
  values: any[];
  condition: 'equals' | 'not_equals' | 'includes' | 'not_includes';
  description?: string;
}

export interface DependencyAnalysis {
  totalProperties: number;
  propertiesWithDependencies: number;
  dependencies: PropertyDependency[];
  dependencyGraph: Record<string, string[]>;
  suggestions: string[];
}

export class PropertyDependencies {
  /**
   * Analyze property dependencies for a node
   */
  static analyze(properties: any[]): DependencyAnalysis {
    const dependencies: PropertyDependency[] = [];
    const dependencyGraph: Record<string, string[]> = {};
    const suggestions: string[] = [];
    
    // First pass: Find all properties with display conditions
    for (const prop of properties) {
      if (prop.displayOptions?.show || prop.displayOptions?.hide) {
        const dependency = this.extractDependency(prop, properties);
        dependencies.push(dependency);
        
        // Build dependency graph
        for (const condition of dependency.dependsOn) {
          if (!dependencyGraph[condition.property]) {
            dependencyGraph[condition.property] = [];
          }
          dependencyGraph[condition.property].push(prop.name);
        }
      }
    }

    // Second pass: Analyze complex dependencies
    const complexDependencies = this.findComplexDependencies(properties);
    dependencies.push(...complexDependencies);

    // Generate suggestions
    suggestions.push(...this.generateSuggestions(dependencies, dependencyGraph));

    return {
      totalProperties: properties.length,
      propertiesWithDependencies: dependencies.length,
      dependencies,
      dependencyGraph,
      suggestions
    };
  }

  /**
   * Extract dependency information from a property
   */
  private static extractDependency(prop: any, allProperties: any[]): PropertyDependency {
    const dependency: PropertyDependency = {
      property: prop.name,
      displayName: prop.displayName || prop.name,
      dependsOn: [],
      showWhen: {},
      hideWhen: {},
      enablesProperties: [],
      disablesProperties: [],
      notes: []
    };

    // Extract show conditions
    if (prop.displayOptions?.show) {
      const showConditions = this.parseDisplayConditions(prop.displayOptions.show);
      dependency.dependsOn.push(...showConditions);
      dependency.showWhen = this.conditionsToObject(showConditions);
    }

    // Extract hide conditions
    if (prop.displayOptions?.hide) {
      const hideConditions = this.parseDisplayConditions(prop.displayOptions.hide);
      dependency.dependsOn.push(...hideConditions);
      dependency.hideWhen = this.conditionsToObject(hideConditions);
    }

    // Find properties this enables/disables
    for (const otherProp of allProperties) {
      if (otherProp.name !== prop.name && otherProp.displayOptions?.show) {
        const otherConditions = this.parseDisplayConditions(otherProp.displayOptions.show);
        if (otherConditions.some(cond => cond.property === prop.name)) {
          dependency.enablesProperties?.push(otherProp.name);
        }
      }
      if (otherProp.name !== prop.name && otherProp.displayOptions?.hide) {
        const otherConditions = this.parseDisplayConditions(otherProp.displayOptions.hide);
        if (otherConditions.some(cond => cond.property === prop.name)) {
          dependency.disablesProperties?.push(otherProp.name);
        }
      }
    }

    return dependency;
  }

  /**
   * Parse display conditions into dependency conditions
   */
  private static parseDisplayConditions(conditions: any): DependencyCondition[] {
    const result: DependencyCondition[] = [];

    if (typeof conditions === 'object' && conditions !== null) {
      for (const [property, value] of Object.entries(conditions)) {
        if (Array.isArray(value)) {
          result.push({
            property,
            values: value,
            condition: 'includes',
            description: `Property '${property}' must include one of: ${value.join(', ')}`
          });
        } else {
          result.push({
            property,
            values: [value],
            condition: 'equals',
            description: `Property '${property}' must equal: ${value}`
          });
        }
      }
    }

    return result;
  }

  /**
   * Convert conditions to object format
   */
  private static conditionsToObject(conditions: DependencyCondition[]): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const condition of conditions) {
      if (condition.values.length === 1) {
        result[condition.property] = condition.values[0];
      } else {
        result[condition.property] = condition.values;
      }
    }
    
    return result;
  }

  /**
   * Find complex dependencies (e.g., conditional logic)
   */
  private static findComplexDependencies(properties: any[]): PropertyDependency[] {
    const complexDependencies: PropertyDependency[] = [];

    // Look for properties that affect multiple others
    const propertyMap = new Map<string, any>();
    properties.forEach(prop => propertyMap.set(prop.name, prop));

    for (const prop of properties) {
      const dependents = this.findDependentProperties(prop.name, properties);
      if (dependents.length > 2) {
        complexDependencies.push({
          property: prop.name,
          displayName: prop.displayName || prop.name,
          dependsOn: [],
          enablesProperties: dependents,
          notes: [`This property affects ${dependents.length} other properties`]
        });
      }
    }

    return complexDependencies;
  }

  /**
   * Find properties that depend on a given property
   */
  private static findDependentProperties(propertyName: string, properties: any[]): string[] {
    const dependents: string[] = [];

    for (const prop of properties) {
      if (prop.name !== propertyName) {
        const hasShowDependency = prop.displayOptions?.show && 
          this.propertyInConditions(propertyName, prop.displayOptions.show);
        const hasHideDependency = prop.displayOptions?.hide && 
          this.propertyInConditions(propertyName, prop.displayOptions.hide);
        
        if (hasShowDependency || hasHideDependency) {
          dependents.push(prop.name);
        }
      }
    }

    return dependents;
  }

  /**
   * Check if a property is referenced in conditions
   */
  private static propertyInConditions(propertyName: string, conditions: any): boolean {
    if (typeof conditions === 'object' && conditions !== null) {
      return Object.keys(conditions).includes(propertyName);
    }
    return false;
  }

  /**
   * Generate suggestions based on dependencies
   */
  private static generateSuggestions(
    dependencies: PropertyDependency[], 
    dependencyGraph: Record<string, string[]>
  ): string[] {
    const suggestions: string[] = [];

    // Suggest grouping related properties
    const highDependencyProperties = Object.entries(dependencyGraph)
      .filter(([_, dependents]) => dependents.length > 2)
      .map(([property]) => property);

    if (highDependencyProperties.length > 0) {
      suggestions.push(
        `Consider grouping these high-impact properties: ${highDependencyProperties.join(', ')}`
      );
    }

    // Suggest property order
    const orderedProperties = this.topologicalSort(dependencyGraph);
    if (orderedProperties.length > 0) {
      suggestions.push(
        `Recommended property order: ${orderedProperties.join(' → ')}`
      );
    }

    // Suggest validation rules
    const requiredProperties = dependencies
      .filter(dep => dep.dependsOn.length > 0)
      .map(dep => dep.property);

    if (requiredProperties.length > 0) {
      suggestions.push(
        `These properties have dependencies and should be validated: ${requiredProperties.join(', ')}`
      );
    }

    return suggestions;
  }

  /**
   * Topological sort for dependency ordering
   */
  private static topologicalSort(graph: Record<string, string[]>): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: string[] = [];

    const visit = (node: string) => {
      if (visiting.has(node)) {
        return; // Circular dependency
      }
      if (visited.has(node)) {
        return;
      }

      visiting.add(node);
      const dependents = graph[node] || [];
      for (const dependent of dependents) {
        visit(dependent);
      }
      visiting.delete(node);
      visited.add(node);
      result.push(node);
    };

    for (const node of Object.keys(graph)) {
      if (!visited.has(node)) {
        visit(node);
      }
    }

    return result;
  }

  /**
   * Get dependencies for a specific property
   */
  static getPropertyDependencies(propertyName: string, properties: any[]): PropertyDependency | null {
    const analysis = this.analyze(properties);
    return analysis.dependencies.find(dep => dep.property === propertyName) || null;
  }

  /**
   * Check if a property configuration is valid based on dependencies
   */
  static validatePropertyConfiguration(
    propertyName: string,
    value: any,
    allProperties: any[],
    currentValues: Record<string, any>
  ): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  } {
    const dependency = this.getPropertyDependencies(propertyName, allProperties);
    if (!dependency) {
      return {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: []
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check show conditions
    if (dependency.showWhen) {
      const showConditionsMet = this.checkConditions(dependency.showWhen, currentValues);
      if (!showConditionsMet) {
        warnings.push(`Property '${propertyName}' may not be visible due to unmet show conditions`);
      }
    }

    // Check hide conditions
    if (dependency.hideWhen) {
      const hideConditionsMet = this.checkConditions(dependency.hideWhen, currentValues);
      if (hideConditionsMet) {
        warnings.push(`Property '${propertyName}' may be hidden due to hide conditions`);
      }
    }

    // Check if this enables other properties
    if (dependency.enablesProperties && dependency.enablesProperties.length > 0) {
      suggestions.push(
        `Setting '${propertyName}' will enable these properties: ${dependency.enablesProperties.join(', ')}`
      );
    }

    // Check if this disables other properties
    if (dependency.disablesProperties && dependency.disablesProperties.length > 0) {
      suggestions.push(
        `Setting '${propertyName}' will disable these properties: ${dependency.disablesProperties.join(', ')}`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Check if conditions are met
   */
  private static checkConditions(conditions: Record<string, any>, values: Record<string, any>): boolean {
    for (const [property, expectedValue] of Object.entries(conditions)) {
      const actualValue = values[property];
      
      if (Array.isArray(expectedValue)) {
        if (!expectedValue.includes(actualValue)) {
          return false;
        }
      } else {
        if (actualValue !== expectedValue) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Get dependency chain for a property
   */
  static getDependencyChain(propertyName: string, properties: any[]): string[] {
    const analysis = this.analyze(properties);
    const chain: string[] = [];
    const visited = new Set<string>();

    const buildChain = (prop: string) => {
      if (visited.has(prop)) return;
      visited.add(prop);

      const dependents = analysis.dependencyGraph[prop] || [];
      for (const dependent of dependents) {
        buildChain(dependent);
      }
      chain.push(prop);
    };

    buildChain(propertyName);
    return chain;
  }

  /**
   * Get properties that should be configured together
   */
  static getPropertyGroups(properties: any[]): Array<{
    name: string;
    properties: string[];
    description: string;
  }> {
    const analysis = this.analyze(properties);
    const groups: Array<{ name: string; properties: string[]; description: string }> = [];

    // Group properties by their dependencies
    const processed = new Set<string>();
    
    for (const dependency of analysis.dependencies) {
      if (processed.has(dependency.property)) continue;
      
      const group = [dependency.property];
      const related = analysis.dependencyGraph[dependency.property] || [];
      group.push(...related);
      
      // Add properties that depend on this one
      for (const [prop, dependents] of Object.entries(analysis.dependencyGraph)) {
        if (dependents.includes(dependency.property)) {
          group.push(prop);
        }
      }
      
      if (group.length > 1) {
        groups.push({
          name: `${dependency.displayName} Group`,
          properties: [...new Set(group)],
          description: `Properties that work together: ${group.join(', ')}`
        });
        
        group.forEach(prop => processed.add(prop));
      }
    }

    return groups;
  }
}
