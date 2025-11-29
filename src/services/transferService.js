import api from '../config/api';

/**
 * Transfer Service
 * Handles all product transfer-related API calls
 * Updated for new confirmation/rejection workflow
 */
export const transferService = {
  /**
   * Get all transfers with optional filters
   * @param {Object} params - Query parameters (page, size, sort, fromLocationId, toLocationId, status, startDate, endDate)
   * @returns {Promise} Response with transfers list and pagination
   */
  getTransfers: (params = {}) => {
    return api.get('/transfers', { params });
  },

  /**
   * Get transfer by ID
   * @param {string} id - Transfer ID
   * @returns {Promise} Response with transfer data including items
   */
  getTransferById: (id) => {
    return api.get(`/transfers/${id}`);
  },

  /**
   * Create new transfer (PENDING status)
   * @param {Object} data - Transfer data (fromLocationId, toLocationId, items, reason, notes, parentTransferId)
   * @returns {Promise} Response with created transfer
   */
  createTransfer: (data) => {
    return api.post('/transfers', data);
  },

  /**
   * Confirm pending transfer (destination action)
   * @param {string} id - Transfer ID
   * @param {Object} data - Optional notes
   * @returns {Promise} Response with updated transfer
   */
  confirmTransfer: (id, data = {}) => {
    return api.put(`/transfers/${id}/confirm`, data);
  },

  /**
   * Reject pending transfer (destination action)
   * @param {string} id - Transfer ID
   * @param {Object} data - { rejectionReason: string }
   * @returns {Promise} Response with updated transfer
   */
  rejectTransfer: (id, data) => {
    return api.put(`/transfers/${id}/reject`, data);
  },

  /**
   * Cancel pending transfer (initiator action)
   * @param {string} id - Transfer ID
   * @param {Object} data - Optional cancellation reason
   * @returns {Promise} Response with updated transfer
   */
  cancelTransfer: (id, data = {}) => {
    return api.put(`/transfers/${id}/cancel`, data);
  },

  /**
   * Get incoming transfers for a location (where location is destination)
   * @param {string} locationId - Location ID
   * @param {string} status - Optional status filter (PENDING, COMPLETED, REJECTED, CANCELLED)
   * @returns {Promise} Response with incoming transfers
   */
  getIncomingTransfers: (locationId, status = null) => {
    const params = { locationId };
    if (status) params.status = status;
    return api.get('/transfers/incoming', { params });
  },

  /**
   * Get outgoing transfers for a location (where location is source)
   * @param {string} locationId - Location ID
   * @param {string} status - Optional status filter (PENDING, COMPLETED, REJECTED, CANCELLED)
   * @returns {Promise} Response with outgoing transfers
   */
  getOutgoingTransfers: (locationId, status = null) => {
    const params = { locationId };
    if (status) params.status = status;
    return api.get('/transfers/outgoing', { params });
  },

  /**
   * Get count of pending incoming transfers for a location
   * @param {string} locationId - Location ID
   * @returns {Promise} Response with count
   */
  getPendingIncomingCount: (locationId) => {
    return api.get('/transfers/incoming/pending/count', { params: { locationId } });
  },

  /**
   * Get return transfer for an original transfer
   * @param {string} originalTransferId - Original transfer ID
   * @returns {Promise} Response with return transfer
   */
  getReturnTransfer: (originalTransferId) => {
    return api.get(`/transfers/${originalTransferId}/return-transfer`);
  },

  /**
   * Get transfers by location (legacy - sent from or received at)
   * @param {string} locationId - Location ID
   * @param {Object} params - Query parameters (type: 'sent'|'received')
   * @returns {Promise} Response with transfers list
   */
  getTransfersByLocation: (locationId, params = {}) => {
    const type = params.type || 'all';
    if (type === 'sent') {
      return api.get(`/transfers/from-location/${locationId}`);
    } else if (type === 'received') {
      return api.get(`/transfers/to-location/${locationId}`);
    }
    return api.get(`/transfers`, { params: { locationId } });
  },

  /**
   * Get transfer items
   * @param {string} transferId - Transfer ID
   * @returns {Promise} Response with transfer items
   */
  getTransferItems: (transferId) => {
    return api.get(`/transfers/${transferId}/items`);
  },

  /**
   * Get transfer statistics
   * @param {Object} params - Query parameters (locationId, startDate, endDate)
   * @returns {Promise} Response with transfer statistics
   */
  getTransferStats: (params = {}) => {
    return api.get('/transfers/stats', { params });
  },

  /**
   * Search transfers
   * @param {string} query - Search query
   * @param {Object} params - Additional query parameters
   * @returns {Promise} Response with search results
   */
  searchTransfers: (query, params = {}) => {
    return api.get('/transfers/search', { params: { query, ...params } });
  },

  /**
   * Get recent transfers
   * @param {number} limit - Number of recent transfers to fetch
   * @param {string} locationId - Location ID (optional)
   * @returns {Promise} Response with recent transfers
   */
  getRecentTransfers: (limit = 10, locationId = null) => {
    const params = { limit };
    if (locationId) params.locationId = locationId;
    return api.get('/transfers/recent', { params });
  },

  /**
   * Export transfers report
   * @param {Object} params - Export parameters
   * @returns {Promise} Response with file blob
   */
  exportTransfers: (params = {}) => {
    return api.get('/transfers/export', {
      params,
      responseType: 'blob'
    });
  },

  /**
   * Validate transfer (check stock availability)
   * @param {Object} data - Transfer data to validate
   * @returns {Promise} Response with validation results
   */
  validateTransfer: (data) => {
    return api.post('/transfers/validate', data);
  },

  /**
   * Delete transfer permanently
   * Only allowed for CANCELLED or REJECTED transfers
   * @param {string} id - Transfer ID
   * @returns {Promise} Response with success message
   */
  deleteTransfer: (id) => {
    return api.delete(`/transfers/${id}`);
  },

  /**
   * Get transfers by date range
   * @param {string} startDate - Start date (ISO format)
   * @param {string} endDate - End date (ISO format)
   * @param {Object} params - Additional query parameters
   * @returns {Promise} Response with transfers in date range
   */
  getTransfersByDateRange: (startDate, endDate, params = {}) => {
    return api.get('/transfers', {
      params: { startDate, endDate, ...params }
    });
  },
};

export default transferService;
