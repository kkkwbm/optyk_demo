import api from '../config/api';

/**
 * Sale Service
 * Handles all sales-related API calls
 */
export const saleService = {
  /**
   * Get all sales with optional filters
   * @param {Object} params - Query parameters (page, size, sort, locationId, status, startDate, endDate)
   * @returns {Promise} Response with sales list and pagination
   */
  getSales: (params = {}) => {
    return api.get('/sales', { params });
  },

  /**
   * Get sale by ID
   * @param {string} id - Sale ID
   * @returns {Promise} Response with sale data including items
   */
  getSaleById: (id) => {
    return api.get(`/sales/${id}`);
  },

  /**
   * Create new sale
   * @param {Object} data - Sale data (locationId, items, paymentMethod, notes)
   * @returns {Promise} Response with created sale
   */
  createSale: (data) => {
    return api.post('/sales', data);
  },

  /**
   * Cancel sale (if not completed)
   * @param {string} id - Sale ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise} Response with success message
   */
  cancelSale: (id, reason) => {
    return api.post(`/sales/${id}/cancel`, { reason });
  },

  /**
   * Process return/refund for a sale
   * @param {string} id - Sale ID
   * @param {Object} data - Return data (items, reason)
   * @returns {Promise} Response with return transaction
   */
  returnSale: (id, data) => {
    return api.post(`/sales/${id}/return`, data);
  },

  /**
   * Get sales by location
   * @param {string} locationId - Location ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with sales list
   */
  getSalesByLocation: (locationId, params = {}) => {
    return api.get(`/sales/locations/${locationId}`, { params });
  },

  /**
   * Get sales statistics
   * @param {Object} params - Query parameters (locationId, startDate, endDate)
   * @returns {Promise} Response with sales statistics
   */
  getSalesStats: (params = {}) => {
    return api.get('/sales/stats', { params });
  },

  /**
   * Get today's sales
   * @param {string} locationId - Location ID (optional)
   * @returns {Promise} Response with today's sales
   */
  getTodaySales: (locationId = null) => {
    const params = locationId ? { locationId } : {};
    return api.get('/sales/today', { params });
  },

  /**
   * Get recent sales
   * @param {number} limit - Number of recent sales to fetch
   * @param {string} locationId - Location ID (optional)
   * @returns {Promise} Response with recent sales
   */
  getRecentSales: (limit = 10, locationId = null) => {
    const params = { limit };
    if (locationId) params.locationId = locationId;
    return api.get('/sales/recent', { params });
  },

  /**
   * Get sale items
   * @param {string} saleId - Sale ID
   * @returns {Promise} Response with sale items
   */
  getSaleItems: (saleId) => {
    return api.get(`/sales/${saleId}/items`);
  },

  /**
   * Search sales
   * @param {string} query - Search query
   * @param {Object} params - Additional query parameters
   * @returns {Promise} Response with search results
   */
  searchSales: (query, params = {}) => {
    return api.get('/sales/search', { params: { query, ...params } });
  },

  /**
   * Export sales report
   * @param {Object} params - Export parameters (locationId, startDate, endDate)
   * @returns {Promise} Response with file blob
   */
  exportSales: (params = {}) => {
    return api.get('/sales/export', {
      params,
      responseType: 'blob'
    });
  },

  /**
   * Get sales by date range
   * @param {string} startDate - Start date (ISO format)
   * @param {string} endDate - End date (ISO format)
   * @param {Object} params - Additional query parameters
   * @returns {Promise} Response with sales in date range
   */
  getSalesByDateRange: (startDate, endDate, params = {}) => {
    return api.get('/sales', {
      params: { startDate, endDate, ...params }
    });
  },

  /**
   * Get daily sales summary
   * @param {string} date - Date (ISO format)
   * @param {string} locationId - Location ID (optional)
   * @returns {Promise} Response with daily summary
   */
  getDailySummary: (date, locationId = null) => {
    const params = { date };
    if (locationId) params.locationId = locationId;
    return api.get('/sales/daily-summary', { params });
  },
};

export default saleService;
