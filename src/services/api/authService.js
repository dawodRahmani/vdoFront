import axios, { getCsrfCookie } from '../../config/axios';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

const authService = {
  /**
   * Login user
   * @param {Object} credentials - { email, password }
   * @returns {Promise}
   */
  login: async (credentials) => {
    try {
      // Get CSRF cookie first (required by Laravel Sanctum)
      await getCsrfCookie();

      // Send login request
      const response = await axios.post('/login', credentials);

      // Store token if returned
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }

      // Store user data if returned
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Register new user
   * @param {Object} userData - { name, email, password, password_confirmation }
   * @returns {Promise}
   */
  register: async (userData) => {
    try {
      await getCsrfCookie();
      const response = await axios.post('/register', userData);

      // Store token if returned
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }

      // Store user data if returned
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout user
   * @returns {Promise}
   */
  logout: async () => {
    try {
      await axios.post('/logout');

      // Clear stored data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');

      return true;
    } catch (error) {
      // Still clear local data even if API call fails
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      throw error;
    }
  },

  /**
   * Get current authenticated user
   * @returns {Promise}
   */
  getUser: async () => {
    try {
      const response = await axios.get('/user');

      // Update stored user data
      if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update user profile
   * @param {Object} userData - User data to update
   * @returns {Promise}
   */
  updateProfile: async (userData) => {
    try {
      const response = await axios.put('/profile', userData);

      // Update stored user data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Change password
   * @param {Object} passwordData - { current_password, password, password_confirmation }
   * @returns {Promise}
   */
  changePassword: async (passwordData) => {
    try {
      const response = await axios.put('/password', passwordData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Request password reset
   * @param {string} email
   * @returns {Promise}
   */
  forgotPassword: async (email) => {
    try {
      await getCsrfCookie();
      const response = await axios.post('/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reset password
   * @param {Object} resetData - { token, email, password, password_confirmation }
   * @returns {Promise}
   */
  resetPassword: async (resetData) => {
    try {
      await getCsrfCookie();
      const response = await axios.post('/reset-password', resetData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default authService;
