/**
 * Validation schemas for MCP tool parameters
 * Provides robust input validation with detailed error messages
 */
export declare class ValidationError extends Error {
    field?: string | undefined;
    value?: any | undefined;
    constructor(message: string, field?: string | undefined, value?: any | undefined);
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
export declare class Validator {
    /**
     * Validate that a value is a non-empty string
     */
    static validateString(value: any, fieldName: string, required?: boolean): ValidationResult;
    /**
     * Validate that a value is a number
     */
    static validateNumber(value: any, fieldName: string, required?: boolean, min?: number, max?: number): ValidationResult;
    /**
     * Validate that a value is a boolean
     */
    static validateBoolean(value: any, fieldName: string, required?: boolean): ValidationResult;
    /**
     * Validate that a value is an array
     */
    static validateArray(value: any, fieldName: string, required?: boolean, minLength?: number, maxLength?: number): ValidationResult;
    /**
     * Validate that a value is an object
     */
    static validateObject(value: any, fieldName: string, required?: boolean): ValidationResult;
    /**
     * Validate that a value is one of the allowed values
     */
    static validateEnum(value: any, fieldName: string, allowedValues: any[], required?: boolean): ValidationResult;
    /**
     * Validate multiple fields at once
     */
    static validateMultiple(validations: ValidationResult[]): ValidationResult;
}
/**
 * Tool validation utilities
 */
export declare class ToolValidation {
    /**
     * Validate workflow creation parameters
     */
    static validateCreateWorkflow(params: any): ValidationResult;
    /**
     * Validate workflow update parameters
     */
    static validateUpdateWorkflow(params: any): ValidationResult;
    /**
     * Validate node addition parameters
     */
    static validateAddNode(params: any): ValidationResult;
    /**
     * Validate connection parameters
     */
    static validateAddConnection(params: any): ValidationResult;
}
