/**
 * Simple input validation utilities for API routes
 * No external dependencies required
 */

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export interface ValidationRule {
  required?: boolean
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'uuid' | 'email'
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: unknown) => boolean | string
}

export interface ValidationSchema {
  [key: string]: ValidationRule
}

// UUID v4 pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// Basic email pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Validate input data against a schema
 */
export function validate(
  data: Record<string, unknown>,
  schema: ValidationSchema
): ValidationResult {
  const errors: string[] = []

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field]

    // Check required
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`)
      continue
    }

    // Skip further validation if value is not provided and not required
    if (value === undefined || value === null) {
      continue
    }

    // Type validation
    if (rules.type) {
      switch (rules.type) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`${field} must be a string`)
          }
          break
        case 'number':
          if (typeof value !== 'number' || isNaN(value)) {
            errors.push(`${field} must be a number`)
          }
          break
        case 'boolean':
          if (typeof value !== 'boolean') {
            errors.push(`${field} must be a boolean`)
          }
          break
        case 'array':
          if (!Array.isArray(value)) {
            errors.push(`${field} must be an array`)
          }
          break
        case 'object':
          if (typeof value !== 'object' || Array.isArray(value)) {
            errors.push(`${field} must be an object`)
          }
          break
        case 'uuid':
          if (typeof value !== 'string' || !UUID_REGEX.test(value)) {
            errors.push(`${field} must be a valid UUID`)
          }
          break
        case 'email':
          if (typeof value !== 'string' || !EMAIL_REGEX.test(value)) {
            errors.push(`${field} must be a valid email address`)
          }
          break
      }
    }

    // String length validation
    if (typeof value === 'string') {
      if (rules.minLength !== undefined && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`)
      }
      if (rules.maxLength !== undefined && value.length > rules.maxLength) {
        errors.push(`${field} must be at most ${rules.maxLength} characters`)
      }
    }

    // Number range validation
    if (typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`)
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push(`${field} must be at most ${rules.max}`)
      }
    }

    // Pattern validation
    if (rules.pattern && typeof value === 'string') {
      if (!rules.pattern.test(value)) {
        errors.push(`${field} has invalid format`)
      }
    }

    // Custom validation
    if (rules.custom) {
      const result = rules.custom(value)
      if (result !== true) {
        errors.push(typeof result === 'string' ? result : `${field} is invalid`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Create a validation error response
 */
export function validationErrorResponse(result: ValidationResult): Response {
  return new Response(
    JSON.stringify({
      error: 'Validation failed',
      details: result.errors,
    }),
    {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}

/**
 * Sanitize string input - remove potentially dangerous characters
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets (basic XSS prevention)
    .trim()
}

/**
 * Sanitize object - apply sanitization to all string values
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value)
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized as T
}

// Common validation schemas
export const CommonSchemas = {
  uuid: { type: 'uuid' as const, required: true },
  optionalUuid: { type: 'uuid' as const },
  email: { type: 'email' as const, required: true },
  requiredString: { type: 'string' as const, required: true, minLength: 1 },
  optionalString: { type: 'string' as const },
}
