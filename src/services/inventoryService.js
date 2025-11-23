import api from '../config/api';

/**
 * Inventory Service
 * Handles all inventory and stock management API calls
 */
export const inventoryService = {
  /**
   * Get inventory for a specific location
   * @param {string} locationId - Location ID
   * @param {Object} params - Query parameters (page, size, sort, productType)
   * @returns {Promise} Response with inventory items and pagination
   */
  getInventory: (locationId, params = {}) => {
    if (locationId) {
      return api.get(`/inventory/location/${locationId}`, { params });
    }
    // If locationId is null, we are fetching all inventory (possibly filtered by locationType in params)
    return api.get('/inventory', { params });
  },

  /**
   * Get inventory item by product and location
   * @param {string} productId - Product ID
   * @param {string} locationId - Location ID
   * @returns {Promise} Response with inventory item
   */
  getInventoryItem: (productId, locationId) => {
    return api.get(`/inventory/products/${productId}/locations/${locationId}`);
  },

  /**
   * Adjust stock level
   * @param {Object} data - Stock adjustment data (productId, locationId, quantity, reason, type: ADD|REMOVE)
   * @returns {Promise} Response with updated inventory
   */
  adjustStock: (data) => {
    return api.post('/inventory/adjust', data);
  },

  /**
   * Reserve stock for a sale
   * @param {Object} data - Reserve data (productId, locationId, quantity)
   * @returns {Promise} Response with updated inventory
   */
  reserveStock: (data) => {
    return api.post('/inventory/reserve', data);
  },

  /**
   * Release reserved stock
   * @param {Object} data - Release data (productId, locationId, quantity)
   * @returns {Promise} Response with updated inventory
   */
  releaseStock: (data) => {
    return api.post('/inventory/release', data);
  },

  /**
   * Get inventory dashboard statistics
   * @param {string} locationId - Location ID
   * @returns {Promise} Response with dashboard stats
   */
  getInventoryStats: (locationId) => {
    return api.get(`/inventory/locations/${locationId}/stats`);
  },

  /**
   * Get inventory value by location
   * @param {string} locationId - Location ID
   * @returns {Promise} Response with total inventory value
   */
  getInventoryValue: (locationId) => {
    return api.get(`/inventory/locations/${locationId}/value`);
  },

  /**
   * Get stock history for a product
   * @param {string} productId - Product ID
   * @param {string} locationId - Location ID (optional)
   * @param {Object} params - Query parameters (startDate, endDate, page, size)
   * @returns {Promise} Response with stock movement history
   */
  getStockHistory: (productId, locationId = null, params = {}) => {
    const url = locationId
      ? `/inventory/products/${productId}/locations/${locationId}/history`
      : `/inventory/products/${productId}/history`;
    return api.get(url, { params });
  },

  /**
   * Get all inventory across all locations (admin/owner)
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with all inventory data
   */
  getAllInventory: (params = {}) => {
    return api.get('/inventory', { params });
  },

  /**
   * Set minimum stock level for a product at a location
   * @param {string} productId - Product ID
   * @param {string} locationId - Location ID
   * @param {number} minStock - Minimum stock level
   * @returns {Promise} Response with updated settings
   */
  setMinimumStock: (productId, locationId, minStock) => {
    return api.patch(`/inventory/products/${productId}/locations/${locationId}/min-stock`, {
      minStock
    });
  },

  /**
   * Batch stock adjustment
   * @param {Array} adjustments - Array of adjustment objects
   * @returns {Promise} Response with batch results
   */
  batchAdjustStock: (adjustments) => {
    return api.post('/inventory/batch-adjust', { adjustments });
  },

  /**
   * Export inventory report
   * @param {string} locationId - Location ID
   * @param {Object} params - Export parameters
   * @returns {Promise} Response with file blob
   */
  exportInventory: (locationId, params = {}) => {
    return api.get(`/inventory/locations/${locationId}/export`, {
      params,
      responseType: 'blob'
    });
  },
};

export default inventoryService;
