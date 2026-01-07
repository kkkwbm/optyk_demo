import api from '../config/api';

/**
 * Company Settings Service
 * Handles company settings (PDF configuration) API calls
 */
export const companySettingsService = {
  /**
   * Get company settings
   * @returns {Promise} Response with company settings
   */
  getSettings: () => {
    return api.get('/company-settings');
  },

  /**
   * Update company settings (name only)
   * @param {Object} data - { companyName: string }
   * @returns {Promise} Response with updated settings
   */
  updateSettings: (data) => {
    return api.put('/company-settings', data);
  },

  /**
   * Upload company logo
   * @param {File} file - Image file (JPEG, PNG, GIF)
   * @returns {Promise} Response with updated settings
   */
  uploadLogo: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/company-settings/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Delete company logo
   * @returns {Promise} Response with updated settings
   */
  deleteLogo: () => {
    return api.delete('/company-settings/logo');
  },
};

export default companySettingsService;
