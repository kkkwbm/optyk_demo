import api from '../config/api';

/**
 * Location Service
 * Handles all location (stores/warehouses) related API calls
 */
export const locationService = {
  /**
   * Get all locations with optional filters
   * @param {Object} params - Query parameters (page, size, sort, type, status, city)
   * @returns {Promise} Response with locations list and pagination
   */
  getLocations: (params = {}) => {
    return api.get('/locations', { params });
  },

  /**
   * Get location by ID
   * @param {string} id - Location ID
   * @returns {Promise} Response with location data
   */
  getLocationById: (id) => {
    return api.get(`/locations/${id}`);
  },

  /**
   * Create new location
   * @param {Object} data - Location data (name, type, address, city, phone, email)
   * @returns {Promise} Response with created location
   */
  createLocation: (data) => {
    return api.post('/locations', data);
  },

  /**
   * Update location
   * @param {string} id - Location ID
   * @param {Object} data - Updated location data
   * @returns {Promise} Response with updated location
   */
  updateLocation: (id, data) => {
    return api.put(`/locations/${id}`, data);
  },

  /**
   * Activate location
   * @param {string} id - Location ID
   * @returns {Promise} Response with success message
   */
  activateLocation: (id) => {
    return api.patch(`/locations/${id}/activate`);
  },

  /**
   * Deactivate location
   * @param {string} id - Location ID
   * @returns {Promise} Response with success message
   */
  deactivateLocation: (id) => {
    return api.patch(`/locations/${id}/deactivate`);
  },

  /**
   * Delete location
   * @param {string} id - Location ID
   * @returns {Promise} Response with success message
   */
  deleteLocation: (id) => {
    return api.delete(`/locations/${id}`);
  },

  /**
   * Get active locations only (for dropdowns)
   * @param {string} type - Location type filter (STORE, WAREHOUSE) - optional
   * @returns {Promise} Response with active locations list
   */
  getActiveLocations: (type = null) => {
    const params = { status: 'ACTIVE' };
    if (type) params.type = type;
    return api.get('/locations', { params });
  },

  /**
   * Get locations by type
   * @param {string} type - Location type (STORE, WAREHOUSE)
   * @param {Object} params - Additional query parameters
   * @returns {Promise} Response with filtered locations
   */
  getLocationsByType: (type, params = {}) => {
    return api.get('/locations', { params: { type, ...params } });
  },

  /**
   * Get location statistics
   * @param {string} id - Location ID
   * @returns {Promise} Response with location statistics (inventory value, sales, etc.)
   */
  getLocationStats: (id) => {
    return api.get(`/locations/${id}/stats`);
  },

  /**
   * Get users assigned to a location
   * @param {string} id - Location ID
   * @returns {Promise} Response with users list
   */
  getLocationUsers: (id) => {
    return api.get(`/locations/${id}/users`);
  },

  /**
   * Get inventory for a location
   * @param {string} id - Location ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with inventory items
   */
  getLocationInventory: (id, params = {}) => {
    return api.get(`/locations/${id}/inventory`, { params });
  },

  /**
   * Search locations
   * @param {string} query - Search query
   * @param {Object} params - Additional query parameters
   * @returns {Promise} Response with search results
   */
  searchLocations: (query, params = {}) => {
    return api.get('/locations/search', { params: { query, ...params } });
  },

  /**
   * Get locations accessible by current user
   * @returns {Promise} Response with accessible locations
   */
  getMyLocations: () => {
    return api.get('/locations/my-locations');
  },

  /**
   * Get location performance report
   * @param {string} id - Location ID
   * @param {Object} params - Date range and other filters
   * @returns {Promise} Response with performance data
   */
  getLocationPerformance: (id, params = {}) => {
    return api.get(`/locations/${id}/performance`, { params });
  },
};

export default locationService;
