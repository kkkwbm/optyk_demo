/**
 * API Constants
 * Centralized API endpoints and related constants
 */

// API Base Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
  },

  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id) => `/users/${id}`,
    ACTIVATE: (id) => `/users/${id}/activate`,
    DEACTIVATE: (id) => `/users/${id}/deactivate`,
    RESET_PASSWORD: (id) => `/users/${id}/reset-password`,
    LOCATIONS: (id) => `/users/${id}/locations`,
    REMOVE_LOCATION: (userId, locationId) => `/users/${userId}/locations/${locationId}`,
    SEARCH: '/users/search',
  },

  // Products
  PRODUCTS: {
    BASE: '/products',
    FRAMES: '/products/frames',
    CONTACT_LENSES: '/products/contact-lenses',
    SOLUTIONS: '/products/solutions',
    OTHER: '/products/other',
    BY_ID: (type, id) => {
      const typeMap = {
        FRAME: '/products/frames',
        CONTACT_LENS: '/products/contact-lenses',
        SOLUTION: '/products/solutions',
        OTHER: '/products/other',
      };
      return `${typeMap[type]}/${id}`;
    },
    SEARCH: '/products/search',
    EXPORT: (type) => {
      const typeMap = {
        FRAME: '/products/frames',
        CONTACT_LENS: '/products/contact-lenses',
        SOLUTION: '/products/solutions',
        OTHER: '/products/other',
      };
      return `${typeMap[type]}/export`;
    },
  },

  // Brands
  BRANDS: {
    BASE: '/brands',
    BY_ID: (id) => `/brands/${id}`,
    ACTIVATE: (id) => `/brands/${id}/activate`,
    DEACTIVATE: (id) => `/brands/${id}/deactivate`,
    SEARCH: '/brands/search',
    STATS: (id) => `/brands/${id}/stats`,
  },

  // Inventory
  INVENTORY: {
    BASE: '/inventory',
    BY_LOCATION: (locationId) => `/inventory/locations/${locationId}`,
    BY_PRODUCT_LOCATION: (productId, locationId) => `/inventory/products/${productId}/locations/${locationId}`,
    ADJUST: '/inventory/adjust',
    RESERVE: '/inventory/reserve',
    RELEASE: '/inventory/release',
    LOW_STOCK: (locationId) => `/inventory/locations/${locationId}/low-stock`,
    STATS: (locationId) => `/inventory/locations/${locationId}/stats`,
    VALUE: (locationId) => `/inventory/locations/${locationId}/value`,
    HISTORY: (productId, locationId) => locationId
      ? `/inventory/products/${productId}/locations/${locationId}/history`
      : `/inventory/products/${productId}/history`,
    EXPORT: (locationId) => `/inventory/locations/${locationId}/export`,
  },

  // Sales
  SALES: {
    BASE: '/sales',
    BY_ID: (id) => `/sales/${id}`,
    CANCEL: (id) => `/sales/${id}/cancel`,
    RETURN: (id) => `/sales/${id}/return`,
    BY_LOCATION: (locationId) => `/sales/locations/${locationId}`,
    ITEMS: (id) => `/sales/${id}/items`,
    STATS: '/sales/stats',
    TODAY: '/sales/today',
    RECENT: '/sales/recent',
    SEARCH: '/sales/search',
    EXPORT: '/sales/export',
    DAILY_SUMMARY: '/sales/daily-summary',
  },

  // Transfers
  TRANSFERS: {
    BASE: '/transfers',
    BY_ID: (id) => `/transfers/${id}`,
    CANCEL: (id) => `/transfers/${id}/cancel`,
    COMPLETE: (id) => `/transfers/${id}/complete`,
    BY_LOCATION: (locationId) => `/transfers/locations/${locationId}`,
    PENDING: (locationId) => `/transfers/locations/${locationId}/pending`,
    ITEMS: (id) => `/transfers/${id}/items`,
    STATS: '/transfers/stats',
    RECENT: '/transfers/recent',
    SEARCH: '/transfers/search',
    VALIDATE: '/transfers/validate',
    EXPORT: '/transfers/export',
  },

  // Locations
  LOCATIONS: {
    BASE: '/locations',
    BY_ID: (id) => `/locations/${id}`,
    ACTIVATE: (id) => `/locations/${id}/activate`,
    DEACTIVATE: (id) => `/locations/${id}/deactivate`,
    STATS: (id) => `/locations/${id}/stats`,
    USERS: (id) => `/locations/${id}/users`,
    INVENTORY: (id) => `/locations/${id}/inventory`,
    SEARCH: '/locations/search',
    MY_LOCATIONS: '/locations/my-locations',
    PERFORMANCE: (id) => `/locations/${id}/performance`,
  },

  // History
  HISTORY: {
    BASE: '/history',
    BY_ID: (id) => `/history/${id}`,
    BY_ENTITY: (entityType, entityId) => `/history/${entityType}/${entityId}`,
    BY_USER: (userId) => `/history/users/${userId}`,
    BY_LOCATION: (locationId) => `/history/locations/${locationId}`,
    REVERT: (id) => `/history/${id}/revert`,
    CAN_REVERT: (id) => `/history/${id}/can-revert`,
    REVERTIBLE: '/history/revertible',
    STATS: '/history/stats',
    RECENT: '/history/recent',
    SEARCH: '/history/search',
    EXPORT: '/history/export',
    CHANGES: (id) => `/history/${id}/changes`,
  },

  // Statistics
  STATISTICS: {
    DASHBOARD: '/statistics/dashboard',
    SALES: '/statistics/sales',
    SALES_TREND: '/statistics/sales/trend',
    SALES_BY_LOCATION: '/statistics/sales/by-location',
    SALES_BY_PRODUCT_TYPE: '/statistics/sales/by-product-type',
    INVENTORY: '/statistics/inventory',
    TOP_PRODUCTS: '/statistics/products/top',
    REVENUE: '/statistics/revenue',
    TODAY: '/statistics/today',
    WEEK: '/statistics/week',
    MONTH: '/statistics/month',
    COMPARISON: '/statistics/comparison',
    USER_PERFORMANCE: (userId) => userId
      ? `/statistics/users/${userId}/performance`
      : '/statistics/user/performance',
    STOCK_LEVELS: '/statistics/inventory/stock-levels',
    LOW_STOCK_COUNT: '/statistics/inventory/low-stock-count',
    TRANSFERS: '/statistics/transfers',
    BRAND_PERFORMANCE: '/statistics/brands/performance',
    EXPORT: (reportType) => `/statistics/export/${reportType}`,
    CUSTOM_RANGE: '/statistics/custom-range',
  },
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// API Response Structure
export const API_RESPONSE = {
  SUCCESS_KEY: 'success',
  DATA_KEY: 'data',
  ERROR_KEY: 'error',
  TIMESTAMP_KEY: 'timestamp',
};
