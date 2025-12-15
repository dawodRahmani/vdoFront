import axios from '../../config/axios';

/**
 * HR Management Service
 * Handles all HR-related API calls
 */

const hrService = {
  // ==================== EMPLOYEES ====================

  /**
   * Get all employees
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  getEmployees: async (params = {}) => {
    try {
      const response = await axios.get('/hr/employees', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get single employee
   * @param {number} employeeId
   * @returns {Promise}
   */
  getEmployee: async (employeeId) => {
    try {
      const response = await axios.get(`/hr/employees/${employeeId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new employee
   * @param {Object} employeeData
   * @returns {Promise}
   */
  createEmployee: async (employeeData) => {
    try {
      const response = await axios.post('/hr/employees', employeeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update employee
   * @param {number} employeeId
   * @param {Object} employeeData
   * @returns {Promise}
   */
  updateEmployee: async (employeeId, employeeData) => {
    try {
      const response = await axios.put(`/hr/employees/${employeeId}`, employeeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete employee
   * @param {number} employeeId
   * @returns {Promise}
   */
  deleteEmployee: async (employeeId) => {
    try {
      const response = await axios.delete(`/hr/employees/${employeeId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get employee statistics
   * @returns {Promise}
   */
  getEmployeeStatistics: async () => {
    try {
      const response = await axios.get('/hr/employees/statistics');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ==================== OFFICES ====================

  /**
   * Get all offices
   * @param {Object} params
   * @returns {Promise}
   */
  getOffices: async (params = {}) => {
    try {
      const response = await axios.get('/hr/offices', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ==================== GRADES ====================

  /**
   * Get all grades
   * @param {Object} params
   * @returns {Promise}
   */
  getGrades: async (params = {}) => {
    try {
      const response = await axios.get('/hr/grades', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ==================== POSITIONS ====================

  /**
   * Get all positions
   * @param {Object} params
   * @returns {Promise}
   */
  getPositions: async (params = {}) => {
    try {
      const response = await axios.get('/hr/positions', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ==================== DEPARTMENTS ====================

  /**
   * Get all departments
   * @param {Object} params
   * @returns {Promise}
   */
  getDepartments: async (params = {}) => {
    try {
      const response = await axios.get('/hr/departments', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create department
   * @param {Object} departmentData
   * @returns {Promise}
   */
  createDepartment: async (departmentData) => {
    try {
      const response = await axios.post('/hr/departments', departmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update department
   * @param {number} departmentId
   * @param {Object} departmentData
   * @returns {Promise}
   */
  updateDepartment: async (departmentId, departmentData) => {
    try {
      const response = await axios.put(`/hr/departments/${departmentId}`, departmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete department
   * @param {number} departmentId
   * @returns {Promise}
   */
  deleteDepartment: async (departmentId) => {
    try {
      const response = await axios.delete(`/hr/departments/${departmentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ==================== ATTENDANCE ====================

  /**
   * Get attendance records
   * @param {Object} params
   * @returns {Promise}
   */
  getAttendance: async (params = {}) => {
    try {
      const response = await axios.get('/hr/attendance', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Mark attendance
   * @param {Object} attendanceData
   * @returns {Promise}
   */
  markAttendance: async (attendanceData) => {
    try {
      const response = await axios.post('/hr/attendance', attendanceData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ==================== LEAVE MANAGEMENT ====================

  /**
   * Get leave requests
   * @param {Object} params
   * @returns {Promise}
   */
  getLeaveRequests: async (params = {}) => {
    try {
      const response = await axios.get('/hr/leave-requests', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create leave request
   * @param {Object} leaveData
   * @returns {Promise}
   */
  createLeaveRequest: async (leaveData) => {
    try {
      const response = await axios.post('/hr/leave-requests', leaveData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Approve/Reject leave request
   * @param {number} leaveId
   * @param {string} status - 'approved' or 'rejected'
   * @param {string} comments
   * @returns {Promise}
   */
  updateLeaveStatus: async (leaveId, status, comments = '') => {
    try {
      const response = await axios.patch(`/hr/leave-requests/${leaveId}/status`, {
        status,
        comments,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ==================== PAYROLL ====================

  /**
   * Get payroll records
   * @param {Object} params
   * @returns {Promise}
   */
  getPayroll: async (params = {}) => {
    try {
      const response = await axios.get('/hr/payroll', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Process payroll
   * @param {Object} payrollData
   * @returns {Promise}
   */
  processPayroll: async (payrollData) => {
    try {
      const response = await axios.post('/hr/payroll/process', payrollData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default hrService;
