import axios from '../../config/axios';

/**
 * User Management Service
 * Handles users, roles, and permissions API calls
 */

const userManagementService = {
  // ==================== USERS ====================

  /**
   * Get all users with optional filters
   * @param {Object} params - Query parameters (page, per_page, search, etc.)
   * @returns {Promise}
   */
  getUsers: async (params = {}) => {
    try {
      const response = await axios.get('/users', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get single user by ID
   * @param {number} userId
   * @returns {Promise}
   */
  getUser: async (userId) => {
    try {
      const response = await axios.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new user
   * @param {Object} userData
   * @returns {Promise}
   */
  createUser: async (userData) => {
    try {
      const response = await axios.post('/users', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update user
   * @param {number} userId
   * @param {Object} userData
   * @returns {Promise}
   */
  updateUser: async (userId, userData) => {
    try {
      const response = await axios.put(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete user
   * @param {number} userId
   * @returns {Promise}
   */
  deleteUser: async (userId) => {
    try {
      const response = await axios.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Activate/Deactivate user
   * @param {number} userId
   * @param {boolean} active
   * @returns {Promise}
   */
  toggleUserStatus: async (userId, active) => {
    try {
      const response = await axios.patch(`/users/${userId}/status`, { active });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ==================== ROLES ====================

  /**
   * Get all roles
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  getRoles: async (params = {}) => {
    try {
      const response = await axios.get('/roles', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get single role by ID
   * @param {number} roleId
   * @returns {Promise}
   */
  getRole: async (roleId) => {
    try {
      const response = await axios.get(`/roles/${roleId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new role
   * @param {Object} roleData
   * @returns {Promise}
   */
  createRole: async (roleData) => {
    try {
      const response = await axios.post('/roles', roleData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update role
   * @param {number} roleId
   * @param {Object} roleData
   * @returns {Promise}
   */
  updateRole: async (roleId, roleData) => {
    try {
      const response = await axios.put(`/roles/${roleId}`, roleData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete role
   * @param {number} roleId
   * @returns {Promise}
   */
  deleteRole: async (roleId) => {
    try {
      const response = await axios.delete(`/roles/${roleId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ==================== PERMISSIONS ====================

  /**
   * Get all permissions
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  getPermissions: async (params = {}) => {
    try {
      const response = await axios.get('/permissions', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new permission
   * @param {Object} permissionData
   * @returns {Promise}
   */
  createPermission: async (permissionData) => {
    try {
      const response = await axios.post('/permissions', permissionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update permission
   * @param {number} permissionId
   * @param {Object} permissionData
   * @returns {Promise}
   */
  updatePermission: async (permissionId, permissionData) => {
    try {
      const response = await axios.put(`/permissions/${permissionId}`, permissionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete permission
   * @param {number} permissionId
   * @returns {Promise}
   */
  deletePermission: async (permissionId) => {
    try {
      const response = await axios.delete(`/permissions/${permissionId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ==================== ROLE PERMISSIONS ====================

  /**
   * Get permissions for a specific role
   * @param {number} roleId
   * @returns {Promise}
   */
  getRolePermissions: async (roleId) => {
    try {
      const response = await axios.get(`/roles/${roleId}/permissions`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Assign permissions to role
   * @param {number} roleId
   * @param {Array} permissionIds - Array of permission IDs
   * @returns {Promise}
   */
  assignPermissionsToRole: async (roleId, permissionIds) => {
    try {
      const response = await axios.post(`/roles/${roleId}/permissions`, {
        permission_ids: permissionIds,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Remove permission from role
   * @param {number} roleId
   * @param {number} permissionId
   * @returns {Promise}
   */
  removePermissionFromRole: async (roleId, permissionId) => {
    try {
      const response = await axios.delete(`/roles/${roleId}/permissions/${permissionId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Sync role permissions (replace all)
   * @param {number} roleId
   * @param {Array} permissionIds
   * @returns {Promise}
   */
  syncRolePermissions: async (roleId, permissionIds) => {
    try {
      const response = await axios.put(`/roles/${roleId}/permissions/sync`, {
        permission_ids: permissionIds,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ==================== USER ROLES ====================

  /**
   * Assign role to user
   * @param {number} userId
   * @param {number} roleId
   * @returns {Promise}
   */
  assignRoleToUser: async (userId, roleId) => {
    try {
      const response = await axios.post(`/users/${userId}/roles`, { role_id: roleId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Remove role from user
   * @param {number} userId
   * @param {number} roleId
   * @returns {Promise}
   */
  removeRoleFromUser: async (userId, roleId) => {
    try {
      const response = await axios.delete(`/users/${userId}/roles/${roleId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default userManagementService;
