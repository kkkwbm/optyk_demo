import api from '../config/api';

/**
 * History Service
 * Handles all operation history and audit trail API calls
 */
export const historyService = {
  /**
   * Get operation history with optional filters
   * @param {Object} params - Query parameters (page, size, sort, operationType, entityType, userId, locationId, startDate, endDate)
   * @returns {Promise} Response with history entries and pagination
   */
  getHistory: (params = {}) => {
    return api.get('/history', { params });
  },

  /**
   * Get history entry by ID
   * @param {string} id - History entry ID
   * @returns {Promise} Response with detailed history entry
   */
  getHistoryById: (id) => {
    return api.get(`/history/${id}`);
  },

  /**
   * Get history for a specific entity
   * @param {string} entityType - Entity type (FRAME, CONTACT_LENS, SOLUTION, OTHER, USER, LOCATION, etc.)
   * @param {string} entityId - Entity ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with entity history
   */
  getEntityHistory: (entityType, entityId, params = {}) => {
    return api.get(`/history/${entityType}/${entityId}`, { params });
  },

  /**
   * Get history by operation type
   * @param {string} operationType - Operation type (CREATE, UPDATE, DELETE, TRANSFER, SALE, etc.)
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with filtered history
   */
  getHistoryByOperation: (operationType, params = {}) => {
    return api.get('/history', { params: { operationType, ...params } });
  },

  /**
   * Get history by user
   * @param {string} userId - User ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with user's operations history
   */
  getUserHistory: (userId, params = {}) => {
    return api.get(`/history/users/${userId}`, { params });
  },

  /**
   * Get history by location
   * @param {string} locationId - Location ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with location's operations history
   */
  getLocationHistory: (locationId, params = {}) => {
    return api.get(`/history/locations/${locationId}`, { params });
  },

  /**
   * Revert operation
   * @param {string} id - History entry ID to revert
   * @param {string} reason - Reason for reverting
   * @returns {Promise} Response with revert result
   */
  revertOperation: (id, reason) => {
    return api.post(`/history/${id}/revert`, { reason });
  },

  /**
   * Check if operation can be reverted
   * @param {string} id - History entry ID
   * @returns {Promise} Response with revertibility status and reason
   */
  canRevert: (id) => {
    return api.get(`/history/${id}/can-revert`);
  },

  /**
   * Get revertible operations
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with revertible operations
   */
  getRevertibleOperations: (params = {}) => {
    return api.get('/history/revertible', { params });
  },

  /**
   * Get history statistics
   * @param {Object} params - Query parameters (locationId, startDate, endDate)
   * @returns {Promise} Response with history statistics
   */
  getHistoryStats: (params = {}) => {
    return api.get('/history/stats', { params });
  },

  /**
   * Get recent operations
   * @param {number} limit - Number of recent operations to fetch
   * @param {string} locationId - Location ID (optional)
   * @returns {Promise} Response with recent operations
   */
  getRecentOperations: (limit = 20, locationId = null) => {
    const params = { limit };
    if (locationId) params.locationId = locationId;
    return api.get('/history/recent', { params });
  },

  /**
   * Search history
   * @param {string} query - Search query
   * @param {Object} params - Additional query parameters
   * @returns {Promise} Response with search results
   */
  searchHistory: (query, params = {}) => {
    return api.get('/history/search', { params: { query, ...params } });
  },

  /**
   * Export history report
   * @param {Object} params - Export parameters
   * @returns {Promise} Response with file blob
   */
  exportHistory: (params = {}) => {
    return api.get('/history/export', {
      params,
      responseType: 'blob'
    });
  },

  /**
   * Get history by date range
   * @param {string} startDate - Start date (ISO format)
   * @param {string} endDate - End date (ISO format)
   * @param {Object} params - Additional query parameters
   * @returns {Promise} Response with history in date range
   */
  getHistoryByDateRange: (startDate, endDate, params = {}) => {
    return api.get('/history', {
      params: { startDate, endDate, ...params }
    });
  },

  /**
   * Get operation changes (diff between old and new values)
   * @param {string} id - History entry ID
   * @returns {Promise} Response with changes details
   */
  getOperationChanges: (id) => {
    return api.get(`/history/${id}/changes`);
  },
};

export default historyService;
