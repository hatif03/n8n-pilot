/**
 * Validation schemas for MCP tool parameters
 * Provides robust input validation with detailed error messages
 */

export class ValidationError extends Error {
  constructor(message: string, public field?: string, public value?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
}

/**
 * Basic validation utilities
 */
export class Validator {
  /**
   * Validate that a value is a non-empty string
   */
  static validateString(value: any, fieldName: string, required: boolean = true): ValidationResult {
    const errors: Array<{field: string, message: string, value?: any}> = [];
    
    if (required && (value === undefined || value === null)) {
      errors.push({
        field: fieldName,
        message: `${fieldName} is required`,
        value
      });
    } else if (value !== undefined && value !== null && typeof value !== 'string') {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be a string, got ${typeof value}`,
        value
      });
    } else if (required && typeof value === 'string' && value.trim().length === 0) {
      errors.push({
        field: fieldName,
        message: `${fieldName} cannot be empty`,
        value
      });
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate that a value is a number
   */
  static validateNumber(value: any, fieldName: string, required: boolean = true, min?: number, max?: number): ValidationResult {
    const errors: Array<{field: string, message: string, value?: any}> = [];
    
    if (required && (value === undefined || value === null)) {
      errors.push({
        field: fieldName,
        message: `${fieldName} is required`,
        value
      });
    } else if (value !== undefined && value !== null) {
      const num = Number(value);
      if (isNaN(num)) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be a valid number, got ${typeof value}`,
          value
        });
      } else {
        if (min !== undefined && num < min) {
          errors.push({
            field: fieldName,
            message: `${fieldName} must be at least ${min}`,
            value
          });
        }
        if (max !== undefined && num > max) {
          errors.push({
            field: fieldName,
            message: `${fieldName} must be at most ${max}`,
            value
          });
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate that a value is a boolean
   */
  static validateBoolean(value: any, fieldName: string, required: boolean = true): ValidationResult {
    const errors: Array<{field: string, message: string, value?: any}> = [];
    
    if (required && (value === undefined || value === null)) {
      errors.push({
        field: fieldName,
        message: `${fieldName} is required`,
        value
      });
    } else if (value !== undefined && value !== null && typeof value !== 'boolean') {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be a boolean, got ${typeof value}`,
        value
      });
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate that a value is an array
   */
  static validateArray(value: any, fieldName: string, required: boolean = true, minLength?: number, maxLength?: number): ValidationResult {
    const errors: Array<{field: string, message: string, value?: any}> = [];
    
    if (required && (value === undefined || value === null)) {
      errors.push({
        field: fieldName,
        message: `${fieldName} is required`,
        value
      });
    } else if (value !== undefined && value !== null) {
      if (!Array.isArray(value)) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be an array, got ${typeof value}`,
          value
        });
      } else {
        if (minLength !== undefined && value.length < minLength) {
          errors.push({
            field: fieldName,
            message: `${fieldName} must have at least ${minLength} items`,
            value
          });
        }
        if (maxLength !== undefined && value.length > maxLength) {
          errors.push({
            field: fieldName,
            message: `${fieldName} must have at most ${maxLength} items`,
            value
          });
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate that a value is an object
   */
  static validateObject(value: any, fieldName: string, required: boolean = true): ValidationResult {
    const errors: Array<{field: string, message: string, value?: any}> = [];
    
    if (required && (value === undefined || value === null)) {
      errors.push({
        field: fieldName,
        message: `${fieldName} is required`,
        value
      });
    } else if (value !== undefined && value !== null) {
      if (typeof value !== 'object' || Array.isArray(value)) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be an object, got ${Array.isArray(value) ? 'array' : typeof value}`,
          value
        });
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate that a value is one of the allowed values
   */
  static validateEnum(value: any, fieldName: string, allowedValues: any[], required: boolean = true): ValidationResult {
    const errors: Array<{field: string, message: string, value?: any}> = [];
    
    if (required && (value === undefined || value === null)) {
      errors.push({
        field: fieldName,
        message: `${fieldName} is required`,
        value
      });
    } else if (value !== undefined && value !== null) {
      if (!allowedValues.includes(value)) {
        errors.push({
          field: fieldName,
          message: `${fieldName} must be one of: ${allowedValues.join(', ')}, got ${value}`,
          value
        });
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate multiple fields at once
   */
  static validateMultiple(validations: ValidationResult[]): ValidationResult {
    const allErrors = validations.flatMap(v => v.errors);
    return {
      valid: allErrors.length === 0,
      errors: allErrors
    };
  }
}

/**
 * Tool validation utilities
 */
export class ToolValidation {
  /**
   * Validate workflow creation parameters
   */
  static validateCreateWorkflow(params: any): ValidationResult {
    const validations = [
      Validator.validateString(params.name, 'name'),
      Validator.validateArray(params.nodes, 'nodes', true, 1),
      Validator.validateObject(params.connections, 'connections')
    ];

    return Validator.validateMultiple(validations);
  }

  /**
   * Validate workflow update parameters
   */
  static validateUpdateWorkflow(params: any): ValidationResult {
    const validations = [
      Validator.validateString(params.id, 'id'),
      Validator.validateString(params.name, 'name'),
      Validator.validateArray(params.nodes, 'nodes', true, 1),
      Validator.validateObject(params.connections, 'connections')
    ];

    return Validator.validateMultiple(validations);
  }

  /**
   * Validate node addition parameters
   */
  static validateAddNode(params: any): ValidationResult {
    const validations = [
      Validator.validateString(params.workflowId, 'workflowId'),
      Validator.validateString(params.nodeType, 'nodeType'),
      Validator.validateString(params.name, 'name'),
      Validator.validateObject(params.position, 'position'),
      Validator.validateObject(params.parameters, 'parameters')
    ];

    return Validator.validateMultiple(validations);
  }

  /**
   * Validate connection parameters
   */
  static validateAddConnection(params: any): ValidationResult {
    const validations = [
      Validator.validateString(params.workflowId, 'workflowId'),
      Validator.validateString(params.sourceNodeId, 'sourceNodeId'),
      Validator.validateString(params.targetNodeId, 'targetNodeId'),
      Validator.validateString(params.sourceOutputType, 'sourceOutputType'),
      Validator.validateString(params.targetInputType, 'targetInputType')
    ];

    return Validator.validateMultiple(validations);
  }
}
