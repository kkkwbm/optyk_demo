import api from '../config/api';

/**
 * Product Service
 * Handles all product-related API calls for 5 product types:
 * - FRAME
 * - CONTACT_LENS
 * - SOLUTION
 * - OTHER
 * - SUNGLASSES
 */

// Product type endpoints mapping
const PRODUCT_ENDPOINTS = {
  FRAME: '/frames',
  CONTACT_LENS: '/contact-lenses',
  SOLUTION: '/solutions',
  OTHER: '/other-products',
  SUNGLASSES: '/sunglasses',
};

export const productService = {
  /**
   * Get products by type with optional filters
   * @param {string} type - Product type (FRAME, CONTACT_LENS, SOLUTION, OTHER)
   * @param {Object} params - Query parameters (page, size, sort, brandId, status, etc.)
   * @returns {Promise} Response with products list and pagination
   */
  getProducts: (type, params = {}) => {
    const endpoint = PRODUCT_ENDPOINTS[type];
    return api.get(endpoint, { params });
  },

  /**
   * Get product by ID and type
   * @param {string} type - Product type
   * @param {string} id - Product ID
   * @returns {Promise} Response with product data
   */
  getProductById: (type, id) => {
    const endpoint = PRODUCT_ENDPOINTS[type];
    return api.get(`${endpoint}/${id}`);
  },

  /**
   * Create new product
   * @param {string} type - Product type
   * @param {Object} data - Product data
   * @returns {Promise} Response with created product
   */
  createProduct: (type, data) => {
    const endpoint = PRODUCT_ENDPOINTS[type];
    return api.post(endpoint, data);
  },

  /**
   * Update product
   * @param {string} type - Product type
   * @param {string} id - Product ID
   * @param {Object} data - Updated product data
   * @returns {Promise} Response with updated product
   */
  updateProduct: (type, id, data) => {
    const endpoint = PRODUCT_ENDPOINTS[type];
    return api.put(`${endpoint}/${id}`, data);
  },

  /**
   * Delete product (soft delete)
   * @param {string} type - Product type
   * @param {string} id - Product ID
   * @param {string} locationId - Optional location ID for history tracking
   * @returns {Promise} Response with success message
   */
  deleteProduct: (type, id, locationId = null) => {
    const endpoint = PRODUCT_ENDPOINTS[type];
    const params = locationId ? { locationId } : {};
    return api.delete(`${endpoint}/${id}`, { params });
  },

  /**
   * Restore deleted product
   * @param {string} type - Product type
   * @param {string} id - Product ID
   * @returns {Promise} Response with restored product
   */
  restoreProduct: (type, id) => {
    const endpoint = PRODUCT_ENDPOINTS[type];
    return api.patch(`${endpoint}/${id}/restore`);
  },

  /**
   * Advanced search for products
   * @param {string} type - Product type
   * @param {Object} filters - Search filters
   * @returns {Promise} Response with search results
   */
  advancedSearch: (type, filters) => {
    const endpoint = PRODUCT_ENDPOINTS[type];
    return api.post(`${endpoint}/search`, filters);
  },

  /**
   * Get product inventory levels across all locations
   * @param {string} type - Product type
   * @param {string} id - Product ID
   * @returns {Promise} Response with inventory data
   */
  getProductInventory: (type, id) => {
    const endpoint = PRODUCT_ENDPOINTS[type];
    return api.get(`${endpoint}/${id}/inventory`);
  },

  /**
   * Get all products (all types) - for quick lookups
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with all products
   */
  getAllProducts: (params = {}) => {
    return api.get('/products', { params });
  },

  /**
   * Search products across all types
   * @param {string} query - Search query
   * @param {Object} params - Additional query parameters
   * @returns {Promise} Response with search results
   */
  searchAllProducts: (query, params = {}) => {
    return api.get('/products/search', { params: { query, ...params } });
  },

  /**
   * Bulk delete products
   * @param {string} type - Product type
   * @param {Array} ids - Array of product IDs
   * @returns {Promise} Response with success message
   */
  bulkDelete: (type, ids) => {
    const endpoint = PRODUCT_ENDPOINTS[type];
    return api.post(`${endpoint}/bulk-delete`, { ids });
  },

  /**
   * Bulk restore products
   * @param {string} type - Product type
   * @param {Array} ids - Array of product IDs
   * @returns {Promise} Response with success message
   */
  bulkRestore: (type, ids) => {
    const endpoint = PRODUCT_ENDPOINTS[type];
    return api.post(`${endpoint}/bulk-restore`, { ids });
  },

  /**
   * Export products to CSV/Excel
   * @param {string} type - Product type
   * @param {Object} params - Export parameters
   * @returns {Promise} Response with file blob
   */
  exportProducts: (type, params = {}) => {
    const endpoint = PRODUCT_ENDPOINTS[type];
    return api.get(`${endpoint}/export`, {
      params,
      responseType: 'blob'
    });
  },
};

export default productService;
