import api from '../config/api';

/**
 * Brand Service
 * Handles all brand-related API calls
 */
export const brandService = {
  /**
   * Get all brands with optional filters
   * @param {Object} params - Query parameters (page, size, sort, status)
   * @returns {Promise} Response with brands list and pagination
   */
  getBrands: (params = {}) => {
    return api.get('/brands', { params });
  },

  /**
   * Get brand by ID
   * @param {string} id - Brand ID
   * @returns {Promise} Response with brand data
   */
  getBrandById: (id) => {
    return api.get(`/brands/${id}`);
  },

  /**
   * Create new brand
   * @param {Object} data - Brand data (name)
   * @returns {Promise} Response with created brand
   */
  createBrand: (data) => {
    return api.post('/brands', data);
  },

  /**
   * Update brand
   * @param {string} id - Brand ID
   * @param {Object} data - Updated brand data
   * @returns {Promise} Response with updated brand
   */
  updateBrand: (id, data) => {
    return api.put(`/brands/${id}`, data);
  },

  /**
   * Activate brand
   * @param {string} id - Brand ID
   * @returns {Promise} Response with success message
   */
  activateBrand: (id) => {
    return api.patch(`/brands/${id}/activate`);
  },

  /**
   * Deactivate brand
   * @param {string} id - Brand ID
   * @returns {Promise} Response with success message
   */
  deactivateBrand: (id) => {
    return api.patch(`/brands/${id}/deactivate`);
  },

  /**
   * Delete brand
   * @param {string} id - Brand ID
   * @returns {Promise} Response with success message
   */
  deleteBrand: (id) => {
    return api.delete(`/brands/${id}`);
  },

  /**
   * Get active brands only (for dropdowns)
   * @returns {Promise} Response with active brands list
   */
  getActiveBrands: () => {
    return api.get('/brands/active');
  },

  /**
   * Search brands
   * @param {string} query - Search query
   * @param {Object} params - Additional query parameters
   * @returns {Promise} Response with search results
   */
  searchBrands: (query, params = {}) => {
    return api.get('/brands/search', { params: { query, ...params } });
  },

  /**
   * Get brand statistics (number of products, etc.)
   * @param {string} id - Brand ID
   * @returns {Promise} Response with brand statistics
   */
  getBrandStats: (id) => {
    return api.get(`/brands/${id}/stats`);
  },
};

export default brandService;
