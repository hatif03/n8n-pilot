/**
 * Validation schemas for MCP tool parameters
 * Provides robust input validation with detailed error messages
 */
export class ValidationError extends Error {
    field;
    value;
    constructor(message, field, value) {
        super(message);
        this.field = field;
        this.value = value;
        this.name = 'ValidationError';
    }
}
/**
 * Basic validation utilities
 */
export class Validator {
    /**
     * Validate that a value is a non-empty string
     */
    static validateString(value, fieldName, required = true) {
        const errors = [];
        if (required && (value === undefined || value === null)) {
            errors.push({
                field: fieldName,
                message: `${fieldName} is required`,
                value
            });
        }
        else if (value !== undefined && value !== null && typeof value !== 'string') {
            errors.push({
                field: fieldName,
                message: `${fieldName} must be a string, got ${typeof value}`,
                value
            });
        }
        else if (required && typeof value === 'string' && value.trim().length === 0) {
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
    static validateNumber(value, fieldName, required = true, min, max) {
        const errors = [];
        if (required && (value === undefined || value === null)) {
            errors.push({
                field: fieldName,
                message: `${fieldName} is required`,
                value
            });
        }
        else if (value !== undefined && value !== null) {
            const num = Number(value);
            if (isNaN(num)) {
                errors.push({
                    field: fieldName,
                    message: `${fieldName} must be a valid number, got ${typeof value}`,
                    value
                });
            }
            else {
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
    static validateBoolean(value, fieldName, required = true) {
        const errors = [];
        if (required && (value === undefined || value === null)) {
            errors.push({
                field: fieldName,
                message: `${fieldName} is required`,
                value
            });
        }
        else if (value !== undefined && value !== null && typeof value !== 'boolean') {
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
    static validateArray(value, fieldName, required = true, minLength, maxLength) {
        const errors = [];
        if (required && (value === undefined || value === null)) {
            errors.push({
                field: fieldName,
                message: `${fieldName} is required`,
                value
            });
        }
        else if (value !== undefined && value !== null) {
            if (!Array.isArray(value)) {
                errors.push({
                    field: fieldName,
                    message: `${fieldName} must be an array, got ${typeof value}`,
                    value
                });
            }
            else {
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
    static validateObject(value, fieldName, required = true) {
        const errors = [];
        if (required && (value === undefined || value === null)) {
            errors.push({
                field: fieldName,
                message: `${fieldName} is required`,
                value
            });
        }
        else if (value !== undefined && value !== null) {
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
    static validateEnum(value, fieldName, allowedValues, required = true) {
        const errors = [];
        if (required && (value === undefined || value === null)) {
            errors.push({
                field: fieldName,
                message: `${fieldName} is required`,
                value
            });
        }
        else if (value !== undefined && value !== null) {
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
    static validateMultiple(validations) {
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
    static validateCreateWorkflow(params) {
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
    static validateUpdateWorkflow(params) {
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
    static validateAddNode(params) {
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
    static validateAddConnection(params) {
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
//# sourceMappingURL=validation-schemas.js.map