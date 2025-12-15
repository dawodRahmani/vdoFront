import axios from '../../config/axios';

/**
 * Employee Administration Service
 * Handles all Employee Administration API calls based on the VDO design
 */

const employeeAdminService = {
  // ==================== EMPLOYEES ====================

  getEmployees: async (params = {}) => {
    const response = await axios.get('/employees', { params });
    return response.data;
  },

  getEmployee: async (id) => {
    const response = await axios.get(`/employees/${id}`);
    return response.data;
  },

  getEmployeeProfile: async (id) => {
    const response = await axios.get(`/employees/${id}/profile`);
    return response.data;
  },

  createEmployee: async (data) => {
    const response = await axios.post('/employees', data);
    return response.data;
  },

  updateEmployee: async (id, data) => {
    const response = await axios.put(`/employees/${id}`, data);
    return response.data;
  },

  deleteEmployee: async (id) => {
    const response = await axios.delete(`/employees/${id}`);
    return response.data;
  },

  updatePersonalInfo: async (id, data) => {
    const response = await axios.put(`/employees/${id}/personal-info`, data);
    return response.data;
  },

  updateContactInfo: async (id, data) => {
    const response = await axios.put(`/employees/${id}/contact-info`, data);
    return response.data;
  },

  updateBankingInfo: async (id, data) => {
    const response = await axios.put(`/employees/${id}/banking-info`, data);
    return response.data;
  },

  getStatusHistory: async (id) => {
    const response = await axios.get(`/employees/${id}/status-history`);
    return response.data;
  },

  changeStatus: async (id, data) => {
    const response = await axios.post(`/employees/${id}/change-status`, data);
    return response.data;
  },

  // ==================== EMERGENCY CONTACTS ====================

  getEmergencyContacts: async (employeeId) => {
    const response = await axios.get(`/employees/${employeeId}/emergency-contacts`);
    return response.data;
  },

  createEmergencyContact: async (employeeId, data) => {
    const response = await axios.post(`/employees/${employeeId}/emergency-contacts`, data);
    return response.data;
  },

  updateEmergencyContact: async (employeeId, contactId, data) => {
    const response = await axios.put(`/employees/${employeeId}/emergency-contacts/${contactId}`, data);
    return response.data;
  },

  deleteEmergencyContact: async (employeeId, contactId) => {
    const response = await axios.delete(`/employees/${employeeId}/emergency-contacts/${contactId}`);
    return response.data;
  },

  // ==================== EDUCATION ====================

  getEducations: async (employeeId) => {
    const response = await axios.get(`/employees/${employeeId}/educations`);
    return response.data;
  },

  createEducation: async (employeeId, data) => {
    const response = await axios.post(`/employees/${employeeId}/educations`, data);
    return response.data;
  },

  updateEducation: async (employeeId, educationId, data) => {
    const response = await axios.put(`/employees/${employeeId}/educations/${educationId}`, data);
    return response.data;
  },

  deleteEducation: async (employeeId, educationId) => {
    const response = await axios.delete(`/employees/${employeeId}/educations/${educationId}`);
    return response.data;
  },

  verifyEducation: async (employeeId, educationId) => {
    const response = await axios.post(`/employees/${employeeId}/educations/${educationId}/verify`);
    return response.data;
  },

  // ==================== WORK EXPERIENCE ====================

  getExperiences: async (employeeId) => {
    const response = await axios.get(`/employees/${employeeId}/experiences`);
    return response.data;
  },

  createExperience: async (employeeId, data) => {
    const response = await axios.post(`/employees/${employeeId}/experiences`, data);
    return response.data;
  },

  updateExperience: async (employeeId, experienceId, data) => {
    const response = await axios.put(`/employees/${employeeId}/experiences/${experienceId}`, data);
    return response.data;
  },

  deleteExperience: async (employeeId, experienceId) => {
    const response = await axios.delete(`/employees/${employeeId}/experiences/${experienceId}`);
    return response.data;
  },

  verifyExperience: async (employeeId, experienceId) => {
    const response = await axios.post(`/employees/${employeeId}/experiences/${experienceId}/verify`);
    return response.data;
  },

  // ==================== SKILLS ====================

  getSkills: async (employeeId) => {
    const response = await axios.get(`/employees/${employeeId}/skills`);
    return response.data;
  },

  createSkill: async (employeeId, data) => {
    const response = await axios.post(`/employees/${employeeId}/skills`, data);
    return response.data;
  },

  updateSkill: async (employeeId, skillId, data) => {
    const response = await axios.put(`/employees/${employeeId}/skills/${skillId}`, data);
    return response.data;
  },

  deleteSkill: async (employeeId, skillId) => {
    const response = await axios.delete(`/employees/${employeeId}/skills/${skillId}`);
    return response.data;
  },

  // ==================== MEDICAL INFO ====================

  getMedicalInfo: async (employeeId) => {
    const response = await axios.get(`/employees/${employeeId}/medical`);
    return response.data;
  },

  updateMedicalInfo: async (employeeId, data) => {
    const response = await axios.put(`/employees/${employeeId}/medical`, data);
    return response.data;
  },

  // ==================== PERSONNEL FILES ====================

  getPersonnelFile: async (employeeId) => {
    const response = await axios.get(`/employees/${employeeId}/personnel-file`);
    return response.data;
  },

  getPersonnelFileDocuments: async (employeeId) => {
    const response = await axios.get(`/employees/${employeeId}/personnel-file/documents`);
    return response.data;
  },

  uploadPersonnelDocument: async (employeeId, data) => {
    const response = await axios.post(`/employees/${employeeId}/personnel-file/documents`, data);
    return response.data;
  },

  deletePersonnelDocument: async (employeeId, documentId) => {
    const response = await axios.delete(`/employees/${employeeId}/personnel-file/documents/${documentId}`);
    return response.data;
  },

  auditPersonnelFile: async (employeeId) => {
    const response = await axios.post(`/employees/${employeeId}/personnel-file/audit`);
    return response.data;
  },

  // ==================== ONBOARDING ====================

  getOnboardingChecklists: async (params = {}) => {
    const response = await axios.get('/onboarding/checklists', { params });
    return response.data;
  },

  getOnboardingChecklist: async (id) => {
    const response = await axios.get(`/onboarding/checklists/${id}`);
    return response.data;
  },

  createOnboardingChecklist: async (data) => {
    const response = await axios.post('/onboarding/checklists', data);
    return response.data;
  },

  updateOnboardingChecklist: async (id, data) => {
    const response = await axios.put(`/onboarding/checklists/${id}`, data);
    return response.data;
  },

  getOnboardingItems: async (checklistId) => {
    const response = await axios.get(`/onboarding/checklists/${checklistId}/items`);
    return response.data;
  },

  updateOnboardingItem: async (checklistId, itemId, data) => {
    const response = await axios.put(`/onboarding/checklists/${checklistId}/items/${itemId}`, data);
    return response.data;
  },

  completeOnboarding: async (checklistId) => {
    const response = await axios.post(`/onboarding/checklists/${checklistId}/complete`);
    return response.data;
  },

  getPendingOnboardings: async () => {
    const response = await axios.get('/onboarding/pending');
    return response.data;
  },

  getOnboardingStatistics: async () => {
    const response = await axios.get('/onboarding/statistics');
    return response.data;
  },

  // ==================== POLICY ACKNOWLEDGEMENTS ====================

  getPolicyAcknowledgements: async (employeeId) => {
    const response = await axios.get(`/policy-acknowledgements/employee/${employeeId}`);
    return response.data;
  },

  acknowledgePolicy: async (data) => {
    const response = await axios.post('/policy-acknowledgements/acknowledge', data);
    return response.data;
  },

  getPendingPolicies: async (employeeId) => {
    const response = await axios.get(`/policy-acknowledgements/pending/${employeeId}`);
    return response.data;
  },

  getPolicyReport: async () => {
    const response = await axios.get('/policy-acknowledgements/report');
    return response.data;
  },

  // ==================== CONTRACTS ====================

  getContracts: async (params = {}) => {
    const response = await axios.get('/contracts', { params });
    return response.data;
  },

  getContract: async (id) => {
    const response = await axios.get(`/contracts/${id}`);
    return response.data;
  },

  createContract: async (data) => {
    const response = await axios.post('/contracts', data);
    return response.data;
  },

  updateContract: async (id, data) => {
    const response = await axios.put(`/contracts/${id}`, data);
    return response.data;
  },

  getEmployeeContracts: async (employeeId) => {
    const response = await axios.get(`/contracts/employee/${employeeId}`);
    return response.data;
  },

  getExpiringContracts: async (params = {}) => {
    const response = await axios.get('/contracts/expiring', { params });
    return response.data;
  },

  signContract: async (id, data) => {
    const response = await axios.post(`/contracts/${id}/sign`, data);
    return response.data;
  },

  // ==================== CONTRACT AMENDMENTS ====================

  getAmendments: async (contractId) => {
    const response = await axios.get(`/contracts/${contractId}/amendments`);
    return response.data;
  },

  createAmendment: async (contractId, data) => {
    const response = await axios.post(`/contracts/${contractId}/amendments`, data);
    return response.data;
  },

  updateAmendment: async (contractId, amendmentId, data) => {
    const response = await axios.put(`/contracts/${contractId}/amendments/${amendmentId}`, data);
    return response.data;
  },

  approveAmendment: async (amendmentId) => {
    const response = await axios.post(`/contracts/amendments/${amendmentId}/approve`);
    return response.data;
  },

  rejectAmendment: async (amendmentId, data) => {
    const response = await axios.post(`/contracts/amendments/${amendmentId}/reject`, data);
    return response.data;
  },

  signAmendment: async (amendmentId, data) => {
    const response = await axios.post(`/contracts/amendments/${amendmentId}/sign`, data);
    return response.data;
  },

  // ==================== INTERIM HIRING ====================

  getInterimRequests: async (params = {}) => {
    const response = await axios.get('/interim-hiring/requests', { params });
    return response.data;
  },

  getInterimRequest: async (id) => {
    const response = await axios.get(`/interim-hiring/requests/${id}`);
    return response.data;
  },

  createInterimRequest: async (data) => {
    const response = await axios.post('/interim-hiring/requests', data);
    return response.data;
  },

  updateInterimRequest: async (id, data) => {
    const response = await axios.put(`/interim-hiring/requests/${id}`, data);
    return response.data;
  },

  submitInterimRequest: async (id) => {
    const response = await axios.post(`/interim-hiring/requests/${id}/submit`);
    return response.data;
  },

  approveInterimRequest: async (id, level) => {
    const response = await axios.post(`/interim-hiring/requests/${id}/approve/${level}`);
    return response.data;
  },

  rejectInterimRequest: async (id, data) => {
    const response = await axios.post(`/interim-hiring/requests/${id}/reject`, data);
    return response.data;
  },

  fulfillInterimRequest: async (id, data) => {
    const response = await axios.post(`/interim-hiring/requests/${id}/fulfill`, data);
    return response.data;
  },

  getPendingInterimApprovals: async () => {
    const response = await axios.get('/interim-hiring/pending-approvals');
    return response.data;
  },

  // ==================== MAHRAM (AFGHANISTAN) ====================

  getMahramRegistrations: async (params = {}) => {
    const response = await axios.get('/mahram/registrations', { params });
    return response.data;
  },

  getMahramRegistration: async (id) => {
    const response = await axios.get(`/mahram/registrations/${id}`);
    return response.data;
  },

  createMahramRegistration: async (data) => {
    const response = await axios.post('/mahram/registrations', data);
    return response.data;
  },

  updateMahramRegistration: async (id, data) => {
    const response = await axios.put(`/mahram/registrations/${id}`, data);
    return response.data;
  },

  getEmployeeMahram: async (employeeId) => {
    const response = await axios.get(`/mahram/employee/${employeeId}`);
    return response.data;
  },

  verifyMahram: async (id) => {
    const response = await axios.post(`/mahram/registrations/${id}/verify`);
    return response.data;
  },

  deactivateMahram: async (id, data) => {
    const response = await axios.post(`/mahram/registrations/${id}/deactivate`, data);
    return response.data;
  },

  // ==================== ORGANIZATION STRUCTURE ====================

  getOrganizationStructure: async () => {
    const response = await axios.get('/organization/structure');
    return response.data;
  },

  getOrganizationChart: async () => {
    const response = await axios.get('/organization/chart');
    return response.data;
  },

  getOrganizationDepartments: async () => {
    const response = await axios.get('/organization/departments');
    return response.data;
  },

  createOrganizationUnit: async (data) => {
    const response = await axios.post('/organization/structure', data);
    return response.data;
  },

  updateOrganizationUnit: async (id, data) => {
    const response = await axios.put(`/organization/structure/${id}`, data);
    return response.data;
  },

  // ==================== HR ANALYTICS ====================

  getHRDashboard: async () => {
    const response = await axios.get('/hr-analytics/dashboard');
    return response.data;
  },

  getHeadcount: async (params = {}) => {
    const response = await axios.get('/hr-analytics/headcount', { params });
    return response.data;
  },

  getTurnover: async (params = {}) => {
    const response = await axios.get('/hr-analytics/turnover', { params });
    return response.data;
  },

  getRetention: async (params = {}) => {
    const response = await axios.get('/hr-analytics/retention', { params });
    return response.data;
  },

  getDemographics: async () => {
    const response = await axios.get('/hr-analytics/demographics');
    return response.data;
  },

  getAnalyticsByDepartment: async () => {
    const response = await axios.get('/hr-analytics/by-department');
    return response.data;
  },

  getAnalyticsByProject: async () => {
    const response = await axios.get('/hr-analytics/by-project');
    return response.data;
  },

  getHRTrends: async (params = {}) => {
    const response = await axios.get('/hr-analytics/trends', { params });
    return response.data;
  },

  generateAnalyticsSnapshot: async () => {
    const response = await axios.post('/hr-analytics/snapshot');
    return response.data;
  },

  // ==================== REPORTS ====================

  getStaffList: async (params = {}) => {
    const response = await axios.get('/employee-reports/staff-list', { params });
    return response.data;
  },

  getStaffDirectory: async (params = {}) => {
    const response = await axios.get('/employee-reports/directory', { params });
    return response.data;
  },

  getBirthdays: async (params = {}) => {
    const response = await axios.get('/employee-reports/birthdays', { params });
    return response.data;
  },

  getAnniversaries: async (params = {}) => {
    const response = await axios.get('/employee-reports/anniversaries', { params });
    return response.data;
  },

  getExpiringContractsReport: async (params = {}) => {
    const response = await axios.get('/employee-reports/expiring-contracts', { params });
    return response.data;
  },

  getProbationEnding: async (params = {}) => {
    const response = await axios.get('/employee-reports/probation-ending', { params });
    return response.data;
  },

  getHeadcountHistory: async (params = {}) => {
    const response = await axios.get('/employee-reports/headcount-history', { params });
    return response.data;
  },
};

export default employeeAdminService;
