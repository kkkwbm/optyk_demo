/**
 * Validation utilities
 * Common validation patterns and error messages
 */

// Email validation pattern
export const EMAIL_PATTERN = {
  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  message: 'Please enter a valid email address',
};

// Phone validation pattern (flexible format)
export const PHONE_PATTERN = {
  value: /^[\d\s\-+()]{7,20}$/,
  message: 'Please enter a valid phone number',
};

// Password validation (min 8 chars, uppercase, lowercase, digit)
export const PASSWORD_PATTERN = {
  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  message: 'Password must be at least 8 characters with uppercase, lowercase, and number',
};

// Postal code patterns by country
export const POSTAL_CODE_PATTERNS = {
  US: {
    value: /^\d{5}(-\d{4})?$/,
    message: 'Please enter a valid US ZIP code (e.g., 12345 or 12345-6789)',
  },
  CA: {
    value: /^[A-Z]\d[A-Z] \d[A-Z]\d$/i,
    message: 'Please enter a valid Canadian postal code (e.g., A1A 1A1)',
  },
  UK: {
    value: /^[A-Z]{1,2}\d{1,2} \d[A-Z]{2}$/i,
    message: 'Please enter a valid UK postcode (e.g., SW1A 1AA)',
  },
  PL: {
    value: /^\d{2}-\d{3}$/,
    message: 'Please enter a valid Polish postal code (e.g., 00-001)',
  },
};

// Price validation
export const priceValidation = {
  min: {
    value: 0,
    message: 'Price cannot be negative',
  },
  validate: {
    twoDecimals: (value) => {
      if (!value) return true;
      const regex = /^\d+(\.\d{1,2})?$/;
      return regex.test(value.toString()) || 'Price can have maximum 2 decimal places';
    },
  },
};

// Quantity validation
export const quantityValidation = {
  min: {
    value: 1,
    message: 'Quantity must be at least 1',
  },
  validate: {
    isInteger: (value) => Number.isInteger(Number(value)) || 'Quantity must be a whole number',
  },
};

// Stock validation
export const stockValidation = {
  min: {
    value: 0,
    message: 'Stock cannot be negative',
  },
  validate: {
    isInteger: (value) => Number.isInteger(Number(value)) || 'Stock must be a whole number',
  },
};

// Max length helper
export const maxLength = (length, fieldName = 'Field') => ({
  value: length,
  message: `${fieldName} must not exceed ${length} characters`,
});

// Min length helper
export const minLength = (length, fieldName = 'Field') => ({
  value: length,
  message: `${fieldName} must be at least ${length} characters`,
});

// Required field helper
export const required = (fieldName = 'Field') => ({
  value: true,
  message: `${fieldName} is required`,
});

// Range validation helper
export const range = (min, max, fieldName = 'Value') => ({
  min: {
    value: min,
    message: `${fieldName} must be at least ${min}`,
  },
  max: {
    value: max,
    message: `${fieldName} must not exceed ${max}`,
  },
});

// URL validation
export const URL_PATTERN = {
  value: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
  message: 'Please enter a valid URL',
};

// Color hex validation
export const HEX_COLOR_PATTERN = {
  value: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  message: 'Please enter a valid hex color (e.g., #FF0000)',
};

// Validate if value is positive number
export const validatePositive = (fieldName = 'Value') => (value) => {
  const num = Number(value);
  return num > 0 || `${fieldName} must be a positive number`;
};

// Validate if value is non-negative number
export const validateNonNegative = (fieldName = 'Value') => (value) => {
  const num = Number(value);
  return num >= 0 || `${fieldName} cannot be negative`;
};

// Validate date is in the future
export const validateFutureDate = (date) => {
  const selected = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected >= today || 'Date must be today or in the future';
};

// Validate date is in the past
export const validatePastDate = (date) => {
  const selected = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return selected <= today || 'Date must be today or in the past';
};

// Validate date range
export const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end || 'End date must be after start date';
};

// Custom validator factory
export const createValidator = (predicate, message) => (value) => {
  return predicate(value) || message;
};

// Combine multiple validators
export const combineValidators = (...validators) => (value) => {
  for (const validator of validators) {
    const result = validator(value);
    if (result !== true) return result;
  }
  return true;
};

export default {
  EMAIL_PATTERN,
  PHONE_PATTERN,
  PASSWORD_PATTERN,
  POSTAL_CODE_PATTERNS,
  URL_PATTERN,
  HEX_COLOR_PATTERN,
  priceValidation,
  quantityValidation,
  stockValidation,
  maxLength,
  minLength,
  required,
  range,
  validatePositive,
  validateNonNegative,
  validateFutureDate,
  validatePastDate,
  validateDateRange,
  createValidator,
  combineValidators,
};
