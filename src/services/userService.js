import api from '../config/api';

/**
 * User Service
 * Handles all user-related API calls
 */
export const userService = {
  /**
   * Get all users with optional filters
   * @param {Object} params - Query parameters (page, size, sort, role, status, locationId)
   * @returns {Promise} Response with users list and pagination
   */
  getUsers: (params = {}) => {
    return api.get('/users', { params });
  },

  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise} Response with user data
   */
  getUserById: (id) => {
    return api.get(`/users/${id}`);
  },

  /**
   * Create new user
   * @param {Object} data - User data (email, firstName, lastName, phone, role, locationIds)
   * @returns {Promise} Response with created user
   */
  createUser: (data) => {
    return api.post('/users', data);
  },

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} data - Updated user data
   * @returns {Promise} Response with updated user
   */
  updateUser: (id, data) => {
    return api.put(`/users/${id}`, data);
  },

  /**
   * Activate user
   * @param {string} id - User ID
   * @returns {Promise} Response with success message
   */
  activateUser: (id) => {
    return api.patch(`/users/${id}/activate`);
  },

  /**
   * Deactivate user
   * @param {string} id - User ID
   * @returns {Promise} Response with success message
   */
  deactivateUser: (id) => {
    return api.patch(`/users/${id}/deactivate`);
  },

  /**
   * Reset user password (ADMIN only)
   * @param {string} id - User ID
   * @param {Object} data - New password data
   * @returns {Promise} Response with success message
   */
  resetPassword: (id, data) => {
    return api.patch(`/users/${id}/reset-password`, data);
  },

  /**
   * Assign locations to user
   * @param {string} id - User ID
   * @param {Array} locationIds - Array of location IDs
   * @returns {Promise} Response with updated user
   */
  assignLocations: (id, locationIds) => {
    return api.post(`/users/${id}/locations`, { locationIds });
  },

  /**
   * Remove location from user
   * @param {string} userId - User ID
   * @param {string} locationId - Location ID
   * @returns {Promise} Response with success message
   */
  removeLocation: (userId, locationId) => {
    return api.delete(`/users/${userId}/locations/${locationId}`);
  },

  /**
   * Get user's assigned locations
   * @param {string} id - User ID
   * @returns {Promise} Response with locations list
   */
  getUserLocations: (id) => {
    return api.get(`/users/${id}/locations`);
  },

  /**
   * Search users
   * @param {string} query - Search query
   * @param {Object} params - Additional query parameters
   * @returns {Promise} Response with search results
   */
  searchUsers: (query, params = {}) => {
    return api.get('/users/search', { params: { query, ...params } });
  },

  /**
   * Update user theme preference
   * @param {string} themePreference - Theme preference ('light' or 'dark')
   * @returns {Promise} Response with updated user data
   */
  updateThemePreference: (themePreference) => {
    return api.patch('/users/me/theme', { themePreference });
  },
};

export default userService;
