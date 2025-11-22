import api from '../config/api';

/**
 * Statistics Service
 * Handles all analytics and statistics-related API calls
 */
export const statisticsService = {
  /**
   * Get dashboard statistics
   * @param {Object} params - Query parameters (locationId, startDate, endDate)
   * @returns {Promise} Response with dashboard statistics
   */
  getDashboardStats: (params = {}) => {
    return api.get('/statistics/dashboard', { params });
  },

  /**
   * Get sales statistics
   * @param {Object} params - Query parameters (locationId, startDate, endDate, groupBy)
   * @returns {Promise} Response with sales statistics
   */
  getSalesStats: (params = {}) => {
    return api.get('/statistics/sales', { params });
  },

  /**
   * Get sales trend data
   * @param {Object} params - Query parameters (locationId, period: 'day'|'week'|'month', startDate, endDate)
   * @returns {Promise} Response with sales trend data
   */
  getSalesTrend: (params = {}) => {
    return api.get('/statistics/sales/trend', { params });
  },

  /**
   * Get inventory statistics
   * @param {Object} params - Query parameters (locationId)
   * @returns {Promise} Response with inventory statistics
   */
  getInventoryStats: (params = {}) => {
    return api.get('/statistics/inventory', { params });
  },

  /**
   * Get top selling products
   * @param {Object} params - Query parameters (locationId, limit, startDate, endDate)
   * @returns {Promise} Response with top products list
   */
  getTopProducts: (params = {}) => {
    return api.get('/statistics/products/top', { params });
  },

  /**
   * Get sales by location comparison
   * @param {Object} params - Query parameters (startDate, endDate)
   * @returns {Promise} Response with sales by location
   */
  getSalesByLocation: (params = {}) => {
    return api.get('/statistics/sales/by-location', { params });
  },

  /**
   * Get sales by product type
   * @param {Object} params - Query parameters (locationId, startDate, endDate)
   * @returns {Promise} Response with sales breakdown by product type
   */
  getSalesByProductType: (params = {}) => {
    return api.get('/statistics/sales/by-product-type', { params });
  },

  /**
   * Get revenue statistics
   * @param {Object} params - Query parameters (locationId, startDate, endDate)
   * @returns {Promise} Response with revenue data
   */
  getRevenueStats: (params = {}) => {
    return api.get('/statistics/revenue', { params });
  },

  /**
   * Get today's statistics
   * @param {string} locationId - Location ID (optional)
   * @returns {Promise} Response with today's statistics
   */
  getTodayStats: (locationId = null) => {
    const params = {};
    if (locationId) params.locationId = locationId;
    return api.get('/statistics/today', { params });
  },

  /**
   * Get this week's statistics
   * @param {string} locationId - Location ID (optional)
   * @returns {Promise} Response with this week's statistics
   */
  getWeekStats: (locationId = null) => {
    const params = {};
    if (locationId) params.locationId = locationId;
    return api.get('/statistics/week', { params });
  },

  /**
   * Get this month's statistics
   * @param {string} locationId - Location ID (optional)
   * @returns {Promise} Response with this month's statistics
   */
  getMonthStats: (locationId = null) => {
    const params = {};
    if (locationId) params.locationId = locationId;
    return api.get('/statistics/month', { params });
  },

  /**
   * Get comparison statistics (current vs previous period)
   * @param {Object} params - Query parameters (locationId, period: 'day'|'week'|'month'|'year')
   * @returns {Promise} Response with comparison data
   */
  getComparisonStats: (params = {}) => {
    return api.get('/statistics/comparison', { params });
  },

  /**
   * Get user performance statistics
   * @param {string} userId - User ID (optional, defaults to current user)
   * @param {Object} params - Query parameters (startDate, endDate)
   * @returns {Promise} Response with user performance data
   */
  getUserPerformance: (userId = null, params = {}) => {
    const url = userId ? `/statistics/users/${userId}/performance` : '/statistics/user/performance';
    return api.get(url, { params });
  },

  /**
   * Get stock levels overview
   * @param {Object} params - Query parameters (locationId)
   * @returns {Promise} Response with stock levels by product type
   */
  getStockLevels: (params = {}) => {
    return api.get('/statistics/inventory/stock-levels', { params });
  },

  /**
   * Get low stock alerts count
   * @param {string} locationId - Location ID (optional)
   * @returns {Promise} Response with low stock count
   */
  getLowStockCount: (locationId = null) => {
    const params = {};
    if (locationId) params.locationId = locationId;
    return api.get('/statistics/inventory/low-stock-count', { params });
  },

  /**
   * Get transfer statistics
   * @param {Object} params - Query parameters (locationId, startDate, endDate)
   * @returns {Promise} Response with transfer statistics
   */
  getTransferStats: (params = {}) => {
    return api.get('/statistics/transfers', { params });
  },

  /**
   * Get brand performance statistics
   * @param {Object} params - Query parameters (locationId, startDate, endDate, limit)
   * @returns {Promise} Response with brand performance data
   */
  getBrandPerformance: (params = {}) => {
    return api.get('/statistics/brands/performance', { params });
  },

  /**
   * Export statistics report
   * @param {string} reportType - Report type (sales, inventory, performance, etc.)
   * @param {Object} params - Report parameters
   * @returns {Promise} Response with file blob
   */
  exportReport: (reportType, params = {}) => {
    return api.get(`/statistics/export/${reportType}`, {
      params,
      responseType: 'blob'
    });
  },

  /**
   * Get custom date range statistics
   * @param {string} startDate - Start date (ISO format)
   * @param {string} endDate - End date (ISO format)
   * @param {Object} params - Additional parameters (locationId, metrics)
   * @returns {Promise} Response with statistics for date range
   */
  getCustomRangeStats: (startDate, endDate, params = {}) => {
    return api.get('/statistics/custom-range', {
      params: { startDate, endDate, ...params }
    });
  },
};

export default statisticsService;
