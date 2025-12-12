/**
 * Validation utilities
 * Common validation patterns and error messages
 */

// Email validation pattern
export const EMAIL_PATTERN = {
  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  message: 'Proszę podać prawidłowy adres email',
};

// Phone validation pattern (flexible format)
export const PHONE_PATTERN = {
  value: /^[\d\s\-+()]{7,20}$/,
  message: 'Proszę podać prawidłowy numer telefonu',
};

// Password validation (min 8 chars, uppercase, lowercase, digit)
export const PASSWORD_PATTERN = {
  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  message: 'Hasło musi mieć co najmniej 8 znaków, zawierać wielką literę, małą literę i cyfrę',
};

// Postal code patterns by country
export const POSTAL_CODE_PATTERNS = {
  US: {
    value: /^\d{5}(-\d{4})?$/,
    message: 'Proszę podać prawidłowy kod pocztowy US (np. 12345 lub 12345-6789)',
  },
  CA: {
    value: /^[A-Z]\d[A-Z] \d[A-Z]\d$/i,
    message: 'Proszę podać prawidłowy kanadyjski kod pocztowy (np. A1A 1A1)',
  },
  UK: {
    value: /^[A-Z]{1,2}\d{1,2} \d[A-Z]{2}$/i,
    message: 'Proszę podać prawidłowy kod pocztowy UK (np. SW1A 1AA)',
  },
  PL: {
    value: /^\d{2}-\d{3}$/,
    message: 'Proszę podać prawidłowy kod pocztowy (np. 00-001)',
  },
};

// Price validation
export const priceValidation = {
  min: {
    value: 0,
    message: 'Cena nie może być ujemna',
  },
  validate: {
    twoDecimals: (value) => {
      if (!value) return true;
      const regex = /^\d+(\.\d{1,2})?$/;
      return regex.test(value.toString()) || 'Cena może mieć maksymalnie 2 miejsca po przecinku';
    },
  },
};

// Quantity validation
export const quantityValidation = {
  min: {
    value: 1,
    message: 'Ilość musi wynosić co najmniej 1',
  },
  validate: {
    isInteger: (value) => Number.isInteger(Number(value)) || 'Ilość musi być liczbą całkowitą',
  },
};

// Stock validation
export const stockValidation = {
  min: {
    value: 0,
    message: 'Stan magazynowy nie może być ujemny',
  },
  validate: {
    isInteger: (value) => Number.isInteger(Number(value)) || 'Stan magazynowy musi być liczbą całkowitą',
  },
};

// Max length helper
export const maxLength = (length, fieldName = 'Pole') => ({
  value: length,
  message: `${fieldName} nie może przekraczać ${length} znaków`,
});

// Min length helper
export const minLength = (length, fieldName = 'Pole') => ({
  value: length,
  message: `${fieldName} musi mieć co najmniej ${length} znaków`,
});

// Required field helper
export const required = (fieldName = 'Pole') => ({
  value: true,
  message: `${fieldName} jest wymagane`,
});

// Range validation helper
export const range = (min, max, fieldName = 'Wartość') => ({
  min: {
    value: min,
    message: `${fieldName} musi wynosić co najmniej ${min}`,
  },
  max: {
    value: max,
    message: `${fieldName} nie może przekraczać ${max}`,
  },
});

// URL validation
export const URL_PATTERN = {
  value: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
  message: 'Proszę podać prawidłowy adres URL',
};

// Color hex validation
export const HEX_COLOR_PATTERN = {
  value: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  message: 'Proszę podać prawidłowy kolor hex (np. #FF0000)',
};

// Validate if value is positive number
export const validatePositive = (fieldName = 'Wartość') => (value) => {
  const num = Number(value);
  return num > 0 || `${fieldName} musi być liczbą dodatnią`;
};

// Validate if value is non-negative number
export const validateNonNegative = (fieldName = 'Wartość') => (value) => {
  const num = Number(value);
  return num >= 0 || `${fieldName} nie może być ujemna`;
};

// Validate date is in the future
export const validateFutureDate = (date) => {
  const selected = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected >= today || 'Data musi być dzisiejsza lub przyszła';
};

// Validate date is in the past
export const validatePastDate = (date) => {
  const selected = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return selected <= today || 'Data musi być dzisiejsza lub przeszła';
};

// Validate date range
export const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end || 'Data końcowa musi być po dacie początkowej';
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
