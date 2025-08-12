// Input validation schemas using Joi
import Joi from 'joi';

// Email validation schema
export const emailSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        })
});

// Send OTP validation schema
export const sendOTPSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    full_name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.min': 'Full name must be at least 2 characters long',
            'string.max': 'Full name cannot exceed 100 characters',
            'any.required': 'Full name is required'
        }),
    phone: Joi.string()
        .pattern(/^[\+]?[1-9][\d]{0,15}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Please provide a valid phone number'
        }),
    date_of_birth: Joi.date()
        .max('now')
        .optional()
        .messages({
            'date.max': 'Date of birth cannot be in the future'
        })
});

// Verify OTP validation schema
export const verifyOTPSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    otp: Joi.string()
        .pattern(/^\d{6}$/)
        .required()
        .messages({
            'string.pattern.base': 'OTP must be a 6-digit number',
            'any.required': 'OTP is required'
        })
});

/**
 * Validate request data against schema
 * @param {Object} data - Data to validate
 * @param {Object} schema - Joi schema
 * @returns {Object} Validation result
 */
export const validateInput = (data, schema) => {
    const { error, value } = schema.validate(data, { 
        abortEarly: false,
        stripUnknown: true 
    });
    
    if (error) {
        const errors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
        }));
        
        return {
            isValid: false,
            errors,
            data: null
        };
    }
    
    return {
        isValid: true,
        errors: null,
        data: value
    };
};

/**
 * Check if email format is valid (simple regex check)
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid format
 */
export const isValidEmailFormat = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
