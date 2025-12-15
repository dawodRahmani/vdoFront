import { getDB } from './indexedDB';

// ============================================
// CONSTANTS & ENUMS
// ============================================

export const RECRUITMENT_STATUS = {
  DRAFT: 'draft',
  TOR_PENDING: 'tor_pending',
  REQUISITION_PENDING: 'requisition_pending',
  ANNOUNCED: 'announced',
  APPLICATIONS_OPEN: 'applications_open',
  COMMITTEE_FORMED: 'committee_formed',
  LONGLISTING: 'longlisting',
  SHORTLISTING: 'shortlisting',
  TESTING: 'testing',
  INTERVIEWING: 'interviewing',
  REPORT_PENDING: 'report_pending',
  OFFER_SENT: 'offer_sent',
  BACKGROUND_CHECK: 'background_check',
  CONTRACT_PENDING: 'contract_pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const RECRUITMENT_STATUS_LABELS = {
  [RECRUITMENT_STATUS.DRAFT]: 'Draft',
  [RECRUITMENT_STATUS.TOR_PENDING]: 'TOR Pending Approval',
  [RECRUITMENT_STATUS.REQUISITION_PENDING]: 'Requisition Pending',
  [RECRUITMENT_STATUS.ANNOUNCED]: 'Announced',
  [RECRUITMENT_STATUS.APPLICATIONS_OPEN]: 'Applications Open',
  [RECRUITMENT_STATUS.COMMITTEE_FORMED]: 'Committee Formed',
  [RECRUITMENT_STATUS.LONGLISTING]: 'Longlisting',
  [RECRUITMENT_STATUS.SHORTLISTING]: 'Shortlisting',
  [RECRUITMENT_STATUS.TESTING]: 'Written Test',
  [RECRUITMENT_STATUS.INTERVIEWING]: 'Interviewing',
  [RECRUITMENT_STATUS.REPORT_PENDING]: 'Report Pending',
  [RECRUITMENT_STATUS.OFFER_SENT]: 'Offer Sent',
  [RECRUITMENT_STATUS.BACKGROUND_CHECK]: 'Background Check',
  [RECRUITMENT_STATUS.CONTRACT_PENDING]: 'Contract Pending',
  [RECRUITMENT_STATUS.COMPLETED]: 'Completed',
  [RECRUITMENT_STATUS.CANCELLED]: 'Cancelled',
};

export const APPLICATION_STATUS = {
  RECEIVED: 'received',
  LONGLISTED: 'longlisted',
  SHORTLISTED: 'shortlisted',
  TESTED: 'tested',
  INTERVIEWED: 'interviewed',
  SELECTED: 'selected',
  OFFERED: 'offered',
  HIRED: 'hired',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
};

export const TOR_STATUS = {
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const SRF_STATUS = {
  DRAFT: 'draft',
  HR_REVIEW: 'hr_review',
  FINANCE_REVIEW: 'finance_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const HIRING_APPROACH = {
  OPEN_COMPETITION: 'open_competition',
  INTERNAL_PROMOTION: 'internal_promotion',
  HEADHUNTING: 'headhunting',
  INTERNAL_TRANSFER: 'internal_transfer',
  SOLE_SOURCE: 'sole_source',
  EMPLOYEE_REFERRAL: 'employee_referral',
};

export const CONTRACT_TYPE = {
  CORE: 'core',
  PROJECT: 'project',
  CONSULTANT: 'consultant',
  PART_TIME: 'part_time',
  INTERNSHIP: 'internship',
  VOLUNTEER: 'volunteer',
  DAILY_WAGE: 'daily_wage',
};

export const EDUCATION_LEVEL = {
  HIGH_SCHOOL: 'high_school',
  DIPLOMA: 'diploma',
  BACHELORS: 'bachelors',
  MASTERS: 'masters',
  PHD: 'phd',
};

export const ANNOUNCEMENT_METHOD = {
  ACBAR: 'acbar',
  LOCAL: 'local',
  WEBSITE: 'website',
  REFERRAL: 'referral',
  SOCIAL_MEDIA: 'social_media',
};

export const COMMITTEE_ROLE = {
  HR_REPRESENTATIVE: 'hr_representative',
  TECHNICAL_EXPERT: 'technical_expert',
  DEPARTMENT_REP: 'department_rep',
  ADDITIONAL: 'additional',
};

export const COI_DECISION = {
  NO_CONFLICT: 'no_conflict',
  CONFLICT_RECUSAL: 'conflict_recusal',
  ACTION_TAKEN: 'action_taken',
};

export const DEFAULT_WEIGHTS = {
  ACADEMIC: 0.20,
  EXPERIENCE: 0.30,
  OTHER: 0.50,
  WRITTEN_TEST: 0.50,
  INTERVIEW: 0.50,
};

export const RECOMMENDATION = {
  STRONGLY_RECOMMEND: 'strongly_recommend',
  RECOMMEND: 'recommend',
  NEUTRAL: 'neutral',
  NOT_RECOMMEND: 'not_recommend',
  STRONGLY_NOT_RECOMMEND: 'strongly_not_recommend',
};

// Step definitions
export const RECRUITMENT_STEPS = [
  { step: 1, name: 'TOR Development', status: RECRUITMENT_STATUS.DRAFT },
  { step: 2, name: 'Staff Requisition', status: RECRUITMENT_STATUS.REQUISITION_PENDING },
  { step: 3, name: 'Requisition Review', status: RECRUITMENT_STATUS.REQUISITION_PENDING },
  { step: 4, name: 'Vacancy Announcement', status: RECRUITMENT_STATUS.ANNOUNCED },
  { step: 5, name: 'Application Receipt', status: RECRUITMENT_STATUS.APPLICATIONS_OPEN },
  { step: 6, name: 'Committee Formation', status: RECRUITMENT_STATUS.COMMITTEE_FORMED },
  { step: 7, name: 'Longlisting', status: RECRUITMENT_STATUS.LONGLISTING },
  { step: 8, name: 'Shortlisting', status: RECRUITMENT_STATUS.SHORTLISTING },
  { step: 9, name: 'Written Test', status: RECRUITMENT_STATUS.TESTING },
  { step: 10, name: 'Interview', status: RECRUITMENT_STATUS.INTERVIEWING },
  { step: 11, name: 'Recruitment Report', status: RECRUITMENT_STATUS.REPORT_PENDING },
  { step: 12, name: 'Conditional Offer', status: RECRUITMENT_STATUS.OFFER_SENT },
  { step: 13, name: 'Sanction Clearance', status: RECRUITMENT_STATUS.BACKGROUND_CHECK },
  { step: 14, name: 'Background Checks', status: RECRUITMENT_STATUS.BACKGROUND_CHECK },
  { step: 15, name: 'Employment Contract', status: RECRUITMENT_STATUS.CONTRACT_PENDING },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

// Generate recruitment code
export const generateRecruitmentCode = async () => {
  const db = await getDB();
  const count = await db.count('recruitments');
  const year = new Date().getFullYear();
  return `VDO-${String(count + 1).padStart(4, '0')}-${year}`;
};

// Generate candidate code
export const generateCandidateCode = async () => {
  const db = await getDB();
  const count = await db.count('recruitmentCandidates');
  const year = new Date().getFullYear();
  return `CND-${year}-${String(count + 1).padStart(5, '0')}`;
};

// Generate application code
export const generateApplicationCode = async (recruitmentCode) => {
  const db = await getDB();
  const tx = db.transaction('candidateApplications', 'readonly');
  const store = tx.objectStore('candidateApplications');
  const all = await store.getAll();
  await tx.done;
  const count = all.length + 1;
  return `${recruitmentCode}-APP-${String(count).padStart(3, '0')}`;
};

// Generate unique code for written test (anonymous)
export const generateTestUniqueCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Generate contract number
export const generateContractNumber = async () => {
  const db = await getDB();
  const count = await db.count('employmentContracts');
  const year = new Date().getFullYear();
  return `VDO-CON-${year}-${String(count + 1).padStart(4, '0')}`;
};

// Generate report number
export const generateReportNumber = async () => {
  const db = await getDB();
  const count = await db.count('recruitmentReports');
  const year = new Date().getFullYear();
  return `VDO-RPT-${year}-${String(count + 1).padStart(4, '0')}`;
};

// ============================================
// RECRUITMENT CRUD OPERATIONS
// ============================================

export const recruitmentDB = {
  // Create new recruitment
  create: async (data) => {
    const db = await getDB();
    const recruitmentCode = await generateRecruitmentCode();
    const recruitment = {
      ...data,
      recruitmentCode,
      status: RECRUITMENT_STATUS.DRAFT,
      currentStep: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('recruitments', recruitment);
    return { ...recruitment, id };
  },

  // Get all recruitments
  getAll: async () => {
    const db = await getDB();
    const recruitments = await db.getAll('recruitments');
    return recruitments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // Get recruitment by ID
  getById: async (id) => {
    const db = await getDB();
    return db.get('recruitments', id);
  },

  // Get recruitment by code
  getByCode: async (code) => {
    const db = await getDB();
    const tx = db.transaction('recruitments', 'readonly');
    const store = tx.objectStore('recruitments');
    const index = store.index('recruitmentCode');
    const recruitment = await index.get(code);
    await tx.done;
    return recruitment;
  },

  // Update recruitment
  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('recruitments', id);
    if (!existing) throw new Error('Recruitment not found');
    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    await db.put('recruitments', updated);
    return updated;
  },

  // Delete recruitment
  delete: async (id) => {
    const db = await getDB();
    await db.delete('recruitments', id);
    return true;
  },

  // Advance to next step
  advanceStep: async (id) => {
    const db = await getDB();
    const recruitment = await db.get('recruitments', id);
    if (!recruitment) throw new Error('Recruitment not found');
    if (recruitment.currentStep >= 15) throw new Error('Already at final step');

    const nextStep = recruitment.currentStep + 1;
    const stepInfo = RECRUITMENT_STEPS.find(s => s.step === nextStep);

    const updated = {
      ...recruitment,
      currentStep: nextStep,
      status: stepInfo?.status || recruitment.status,
      updatedAt: new Date().toISOString(),
    };
    await db.put('recruitments', updated);
    return updated;
  },

  // Filter by status
  filterByStatus: async (status) => {
    const db = await getDB();
    const tx = db.transaction('recruitments', 'readonly');
    const store = tx.objectStore('recruitments');
    const index = store.index('status');
    const recruitments = await index.getAll(status);
    await tx.done;
    return recruitments;
  },

  // Search recruitments
  search: async (term) => {
    const all = await recruitmentDB.getAll();
    if (!term) return all;
    const lowerTerm = term.toLowerCase();
    return all.filter(r =>
      r.recruitmentCode?.toLowerCase().includes(lowerTerm) ||
      r.positionTitle?.toLowerCase().includes(lowerTerm)
    );
  },

  // Get statistics
  getStats: async () => {
    const all = await recruitmentDB.getAll();
    const stats = {
      total: all.length,
      draft: all.filter(r => r.status === RECRUITMENT_STATUS.DRAFT).length,
      inProgress: all.filter(r =>
        ![RECRUITMENT_STATUS.DRAFT, RECRUITMENT_STATUS.COMPLETED, RECRUITMENT_STATUS.CANCELLED].includes(r.status)
      ).length,
      completed: all.filter(r => r.status === RECRUITMENT_STATUS.COMPLETED).length,
      cancelled: all.filter(r => r.status === RECRUITMENT_STATUS.CANCELLED).length,
    };
    return stats;
  },
};

// ============================================
// TOR (TERMS OF REFERENCE) OPERATIONS
// ============================================

export const torDB = {
  create: async (data) => {
    const db = await getDB();
    const tor = {
      ...data,
      status: TOR_STATUS.DRAFT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('termsOfReferences', tor);
    return { ...tor, id };
  },

  getAll: async () => {
    const db = await getDB();
    return db.getAll('termsOfReferences');
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('termsOfReferences', id);
  },

  getByRecruitmentId: async (recruitmentId) => {
    const db = await getDB();
    const tx = db.transaction('termsOfReferences', 'readonly');
    const store = tx.objectStore('termsOfReferences');
    const index = store.index('recruitmentId');
    const tor = await index.get(recruitmentId);
    await tx.done;
    return tor;
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('termsOfReferences', id);
    if (!existing) throw new Error('TOR not found');
    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    await db.put('termsOfReferences', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('termsOfReferences', id);
    return true;
  },

  approve: async (id, approvedBy) => {
    const db = await getDB();
    const tor = await db.get('termsOfReferences', id);
    if (!tor) throw new Error('TOR not found');
    const updated = {
      ...tor,
      status: TOR_STATUS.APPROVED,
      approvedBy,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put('termsOfReferences', updated);
    return updated;
  },

  reject: async (id, rejectedBy, reason) => {
    const db = await getDB();
    const tor = await db.get('termsOfReferences', id);
    if (!tor) throw new Error('TOR not found');
    const updated = {
      ...tor,
      status: TOR_STATUS.REJECTED,
      rejectedBy,
      rejectionReason: reason,
      updatedAt: new Date().toISOString(),
    };
    await db.put('termsOfReferences', updated);
    return updated;
  },
};

// ============================================
// STAFF REQUISITION (SRF) OPERATIONS
// ============================================

export const srfDB = {
  create: async (data) => {
    const db = await getDB();
    const srf = {
      ...data,
      status: SRF_STATUS.DRAFT,
      hrVerified: false,
      budgetVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('staffRequisitions', srf);
    return { ...srf, id };
  },

  getAll: async () => {
    const db = await getDB();
    return db.getAll('staffRequisitions');
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('staffRequisitions', id);
  },

  getByRecruitmentId: async (recruitmentId) => {
    const db = await getDB();
    const tx = db.transaction('staffRequisitions', 'readonly');
    const store = tx.objectStore('staffRequisitions');
    const index = store.index('recruitmentId');
    const srf = await index.get(recruitmentId);
    await tx.done;
    return srf;
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('staffRequisitions', id);
    if (!existing) throw new Error('SRF not found');
    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    await db.put('staffRequisitions', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('staffRequisitions', id);
    return true;
  },

  hrVerify: async (id, verifiedBy) => {
    const db = await getDB();
    const srf = await db.get('staffRequisitions', id);
    if (!srf) throw new Error('SRF not found');
    const updated = {
      ...srf,
      hrVerified: true,
      hrVerifiedBy: verifiedBy,
      hrVerifiedAt: new Date().toISOString(),
      status: SRF_STATUS.FINANCE_REVIEW,
      updatedAt: new Date().toISOString(),
    };
    await db.put('staffRequisitions', updated);
    return updated;
  },

  financeVerify: async (id, verifiedBy) => {
    const db = await getDB();
    const srf = await db.get('staffRequisitions', id);
    if (!srf) throw new Error('SRF not found');
    const updated = {
      ...srf,
      budgetVerified: true,
      budgetVerifiedBy: verifiedBy,
      budgetVerifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put('staffRequisitions', updated);
    return updated;
  },

  approve: async (id, approvedBy) => {
    const db = await getDB();
    const srf = await db.get('staffRequisitions', id);
    if (!srf) throw new Error('SRF not found');
    const updated = {
      ...srf,
      status: SRF_STATUS.APPROVED,
      approvedBy,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put('staffRequisitions', updated);
    return updated;
  },
};

// ============================================
// VACANCY ANNOUNCEMENT OPERATIONS
// ============================================

export const vacancyDB = {
  create: async (data) => {
    const db = await getDB();
    const vacancy = {
      ...data,
      status: 'draft',
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('vacancyAnnouncements', vacancy);
    return { ...vacancy, id };
  },

  getAll: async () => {
    const db = await getDB();
    return db.getAll('vacancyAnnouncements');
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('vacancyAnnouncements', id);
  },

  getByRecruitmentId: async (recruitmentId) => {
    const db = await getDB();
    const tx = db.transaction('vacancyAnnouncements', 'readonly');
    const store = tx.objectStore('vacancyAnnouncements');
    const index = store.index('recruitmentId');
    const vacancies = await index.getAll(recruitmentId);
    await tx.done;
    return vacancies;
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('vacancyAnnouncements', id);
    if (!existing) throw new Error('Vacancy not found');
    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    await db.put('vacancyAnnouncements', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('vacancyAnnouncements', id);
    return true;
  },

  publish: async (id) => {
    const db = await getDB();
    const vacancy = await db.get('vacancyAnnouncements', id);
    if (!vacancy) throw new Error('Vacancy not found');
    const updated = {
      ...vacancy,
      status: 'published',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put('vacancyAnnouncements', updated);
    return updated;
  },

  close: async (id) => {
    const db = await getDB();
    const vacancy = await db.get('vacancyAnnouncements', id);
    if (!vacancy) throw new Error('Vacancy not found');
    const updated = {
      ...vacancy,
      status: 'closed',
      closedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put('vacancyAnnouncements', updated);
    return updated;
  },
};

// ============================================
// CANDIDATE OPERATIONS
// ============================================

export const candidateDB = {
  create: async (data) => {
    const db = await getDB();
    const candidateCode = await generateCandidateCode();
    const candidate = {
      ...data,
      candidateCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('recruitmentCandidates', candidate);
    return { ...candidate, id };
  },

  getAll: async () => {
    const db = await getDB();
    return db.getAll('recruitmentCandidates');
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('recruitmentCandidates', id);
  },

  getByCode: async (code) => {
    const db = await getDB();
    const tx = db.transaction('recruitmentCandidates', 'readonly');
    const store = tx.objectStore('recruitmentCandidates');
    const index = store.index('candidateCode');
    const candidate = await index.get(code);
    await tx.done;
    return candidate;
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('recruitmentCandidates', id);
    if (!existing) throw new Error('Candidate not found');
    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    await db.put('recruitmentCandidates', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('recruitmentCandidates', id);
    return true;
  },

  search: async (term) => {
    const all = await candidateDB.getAll();
    if (!term) return all;
    const lowerTerm = term.toLowerCase();
    return all.filter(c =>
      c.fullName?.toLowerCase().includes(lowerTerm) ||
      c.email?.toLowerCase().includes(lowerTerm) ||
      c.candidateCode?.toLowerCase().includes(lowerTerm)
    );
  },
};

// ============================================
// CANDIDATE APPLICATION OPERATIONS
// ============================================

export const applicationDB = {
  create: async (data, recruitmentCode) => {
    const db = await getDB();
    const applicationCode = await generateApplicationCode(recruitmentCode);
    const application = {
      ...data,
      applicationCode,
      status: APPLICATION_STATUS.RECEIVED,
      applicationDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('candidateApplications', application);
    return { ...application, id };
  },

  getAll: async () => {
    const db = await getDB();
    return db.getAll('candidateApplications');
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('candidateApplications', id);
  },

  getByRecruitmentId: async (recruitmentId) => {
    const db = await getDB();
    const tx = db.transaction('candidateApplications', 'readonly');
    const store = tx.objectStore('candidateApplications');
    const index = store.index('recruitmentId');
    const applications = await index.getAll(recruitmentId);
    await tx.done;
    return applications;
  },

  getByCandidateId: async (candidateId) => {
    const db = await getDB();
    const tx = db.transaction('candidateApplications', 'readonly');
    const store = tx.objectStore('candidateApplications');
    const index = store.index('candidateId');
    const applications = await index.getAll(candidateId);
    await tx.done;
    return applications;
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('candidateApplications', id);
    if (!existing) throw new Error('Application not found');
    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    await db.put('candidateApplications', updated);
    return updated;
  },

  updateStatus: async (id, status, reason = null) => {
    const db = await getDB();
    const existing = await db.get('candidateApplications', id);
    if (!existing) throw new Error('Application not found');
    const updated = {
      ...existing,
      status,
      rejectionReason: status === APPLICATION_STATUS.REJECTED ? reason : existing.rejectionReason,
      updatedAt: new Date().toISOString(),
    };
    await db.put('candidateApplications', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('candidateApplications', id);
    return true;
  },

  getStatsByRecruitment: async (recruitmentId) => {
    const applications = await applicationDB.getByRecruitmentId(recruitmentId);
    return {
      total: applications.length,
      male: applications.filter(a => a.gender === 'male').length,
      female: applications.filter(a => a.gender === 'female').length,
      byStatus: Object.values(APPLICATION_STATUS).reduce((acc, status) => {
        acc[status] = applications.filter(a => a.status === status).length;
        return acc;
      }, {}),
    };
  },
};

// ============================================
// CANDIDATE EDUCATION OPERATIONS
// ============================================

export const educationDB = {
  create: async (data) => {
    const db = await getDB();
    const education = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('candidateEducations', education);
    return { ...education, id };
  },

  getByCandidateId: async (candidateId) => {
    const db = await getDB();
    const tx = db.transaction('candidateEducations', 'readonly');
    const store = tx.objectStore('candidateEducations');
    const index = store.index('candidateId');
    const educations = await index.getAll(candidateId);
    await tx.done;
    return educations;
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('candidateEducations', id);
    if (!existing) throw new Error('Education record not found');
    const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    await db.put('candidateEducations', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('candidateEducations', id);
    return true;
  },
};

// ============================================
// CANDIDATE EXPERIENCE OPERATIONS
// ============================================

export const experienceDB = {
  create: async (data) => {
    const db = await getDB();
    const experience = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('candidateExperiences', experience);
    return { ...experience, id };
  },

  getByCandidateId: async (candidateId) => {
    const db = await getDB();
    const tx = db.transaction('candidateExperiences', 'readonly');
    const store = tx.objectStore('candidateExperiences');
    const index = store.index('candidateId');
    const experiences = await index.getAll(candidateId);
    await tx.done;
    return experiences;
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('candidateExperiences', id);
    if (!existing) throw new Error('Experience record not found');
    const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    await db.put('candidateExperiences', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('candidateExperiences', id);
    return true;
  },

  calculateTotalYears: async (candidateId) => {
    const experiences = await experienceDB.getByCandidateId(candidateId);
    let totalMonths = 0;
    experiences.forEach(exp => {
      const start = new Date(exp.startDate);
      const end = exp.isCurrent ? new Date() : new Date(exp.endDate);
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      totalMonths += months;
    });
    return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal
  },
};

// ============================================
// RECRUITMENT COMMITTEE OPERATIONS
// ============================================

export const committeeDB = {
  create: async (data) => {
    const db = await getDB();
    const committee = {
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('recruitmentCommittees', committee);
    return { ...committee, id };
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('recruitmentCommittees', id);
  },

  getByRecruitmentId: async (recruitmentId) => {
    const db = await getDB();
    const tx = db.transaction('recruitmentCommittees', 'readonly');
    const store = tx.objectStore('recruitmentCommittees');
    const index = store.index('recruitmentId');
    const committee = await index.get(recruitmentId);
    await tx.done;
    return committee;
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('recruitmentCommittees', id);
    if (!existing) throw new Error('Committee not found');
    const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    await db.put('recruitmentCommittees', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('recruitmentCommittees', id);
    return true;
  },
};

// ============================================
// COMMITTEE MEMBER OPERATIONS
// ============================================

export const memberDB = {
  create: async (data) => {
    const db = await getDB();
    const member = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('committeeMembers', member);
    return { ...member, id };
  },

  getByCommitteeId: async (committeeId) => {
    const db = await getDB();
    const tx = db.transaction('committeeMembers', 'readonly');
    const store = tx.objectStore('committeeMembers');
    const index = store.index('committeeId');
    const members = await index.getAll(committeeId);
    await tx.done;
    return members;
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('committeeMembers', id);
    if (!existing) throw new Error('Member not found');
    const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    await db.put('committeeMembers', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('committeeMembers', id);
    return true;
  },
};

// ============================================
// COI DECLARATION OPERATIONS
// ============================================

export const coiDB = {
  create: async (data) => {
    const db = await getDB();
    const coi = {
      ...data,
      declarationDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('coiDeclarations', coi);
    return { ...coi, id };
  },

  getByMemberId: async (committeeMemberId) => {
    const db = await getDB();
    const tx = db.transaction('coiDeclarations', 'readonly');
    const store = tx.objectStore('coiDeclarations');
    const index = store.index('committeeMemberId');
    const coi = await index.get(committeeMemberId);
    await tx.done;
    return coi;
  },

  getByRecruitmentId: async (recruitmentId) => {
    const db = await getDB();
    const tx = db.transaction('coiDeclarations', 'readonly');
    const store = tx.objectStore('coiDeclarations');
    const index = store.index('recruitmentId');
    const declarations = await index.getAll(recruitmentId);
    await tx.done;
    return declarations;
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('coiDeclarations', id);
    if (!existing) throw new Error('COI Declaration not found');
    const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    await db.put('coiDeclarations', updated);
    return updated;
  },

  review: async (id, reviewedBy, decision, comments = '') => {
    const db = await getDB();
    const existing = await db.get('coiDeclarations', id);
    if (!existing) throw new Error('COI Declaration not found');
    const updated = {
      ...existing,
      hrReviewedBy: reviewedBy,
      hrDecision: decision,
      hrComments: comments,
      hrReviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put('coiDeclarations', updated);
    return updated;
  },
};

// ============================================
// LONGLISTING OPERATIONS
// ============================================

export const longlistingDB = {
  create: async (data) => {
    const db = await getDB();
    const longlisting = {
      ...data,
      status: 'pending',
      totalApplications: 0,
      totalLonglisted: 0,
      conductedDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('longlistings', longlisting);
    return { ...longlisting, id };
  },

  getByRecruitmentId: async (recruitmentId) => {
    const db = await getDB();
    const tx = db.transaction('longlistings', 'readonly');
    const store = tx.objectStore('longlistings');
    const index = store.index('recruitmentId');
    const longlisting = await index.get(recruitmentId);
    await tx.done;
    return longlisting;
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('longlistings', id);
    if (!existing) throw new Error('Longlisting not found');
    const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    await db.put('longlistings', updated);
    return updated;
  },

  complete: async (id) => {
    const db = await getDB();
    const existing = await db.get('longlistings', id);
    if (!existing) throw new Error('Longlisting not found');

    // Count longlisted candidates
    const tx = db.transaction('longlistingCandidates', 'readonly');
    const store = tx.objectStore('longlistingCandidates');
    const index = store.index('longlistingId');
    const candidates = await index.getAll(id);
    await tx.done;

    const updated = {
      ...existing,
      status: 'completed',
      totalApplications: candidates.length,
      totalLonglisted: candidates.filter(c => c.isLonglisted).length,
      updatedAt: new Date().toISOString(),
    };
    await db.put('longlistings', updated);
    return updated;
  },
};

// ============================================
// LONGLISTING CANDIDATE OPERATIONS
// ============================================

export const longlistingCandidateDB = {
  create: async (data) => {
    const db = await getDB();
    const record = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('longlistingCandidates', record);
    return { ...record, id };
  },

  getByLonglistingId: async (longlistingId) => {
    const db = await getDB();
    const tx = db.transaction('longlistingCandidates', 'readonly');
    const store = tx.objectStore('longlistingCandidates');
    const index = store.index('longlistingId');
    const candidates = await index.getAll(longlistingId);
    await tx.done;
    return candidates;
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('longlistingCandidates', id);
    if (!existing) throw new Error('Longlisting candidate not found');
    const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    await db.put('longlistingCandidates', updated);
    return updated;
  },

  bulkCreate: async (records) => {
    const db = await getDB();
    const tx = db.transaction('longlistingCandidates', 'readwrite');
    const store = tx.objectStore('longlistingCandidates');
    const now = new Date().toISOString();
    const promises = records.map(r => store.add({ ...r, createdAt: now, updatedAt: now }));
    await Promise.all(promises);
    await tx.done;
    return true;
  },
};

// ============================================
// SHORTLISTING OPERATIONS
// ============================================

export const shortlistingDB = {
  create: async (data) => {
    const db = await getDB();
    const shortlisting = {
      ...data,
      status: 'pending',
      academicWeight: data.academicWeight || DEFAULT_WEIGHTS.ACADEMIC,
      experienceWeight: data.experienceWeight || DEFAULT_WEIGHTS.EXPERIENCE,
      otherWeight: data.otherWeight || DEFAULT_WEIGHTS.OTHER,
      passingScore: data.passingScore || 60,
      conductedDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('shortlistings', shortlisting);
    return { ...shortlisting, id };
  },

  getByRecruitmentId: async (recruitmentId) => {
    const db = await getDB();
    const tx = db.transaction('shortlistings', 'readonly');
    const store = tx.objectStore('shortlistings');
    const index = store.index('recruitmentId');
    const shortlisting = await index.get(recruitmentId);
    await tx.done;
    return shortlisting;
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('shortlistings', id);
    if (!existing) throw new Error('Shortlisting not found');
    const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    await db.put('shortlistings', updated);
    return updated;
  },

  complete: async (id) => {
    const db = await getDB();
    const existing = await db.get('shortlistings', id);
    if (!existing) throw new Error('Shortlisting not found');
    const updated = { ...existing, status: 'completed', updatedAt: new Date().toISOString() };
    await db.put('shortlistings', updated);
    return updated;
  },
};

// ============================================
// SHORTLISTING CANDIDATE OPERATIONS
// ============================================

export const shortlistingCandidateDB = {
  create: async (data, shortlisting) => {
    const db = await getDB();
    const totalScore =
      (data.academicScore * shortlisting.academicWeight) +
      (data.experienceScore * shortlisting.experienceWeight) +
      (data.otherCriteriaScore * shortlisting.otherWeight);

    const record = {
      ...data,
      totalScore,
      isShortlisted: totalScore >= shortlisting.passingScore,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('shortlistingCandidates', record);
    return { ...record, id };
  },

  getByShortlistingId: async (shortlistingId) => {
    const db = await getDB();
    const tx = db.transaction('shortlistingCandidates', 'readonly');
    const store = tx.objectStore('shortlistingCandidates');
    const index = store.index('shortlistingId');
    const candidates = await index.getAll(shortlistingId);
    await tx.done;
    return candidates.sort((a, b) => b.totalScore - a.totalScore);
  },

  update: async (id, data, shortlisting) => {
    const db = await getDB();
    const existing = await db.get('shortlistingCandidates', id);
    if (!existing) throw new Error('Shortlisting candidate not found');

    const academicScore = data.academicScore ?? existing.academicScore;
    const experienceScore = data.experienceScore ?? existing.experienceScore;
    const otherCriteriaScore = data.otherCriteriaScore ?? existing.otherCriteriaScore;

    const totalScore =
      (academicScore * shortlisting.academicWeight) +
      (experienceScore * shortlisting.experienceWeight) +
      (otherCriteriaScore * shortlisting.otherWeight);

    const updated = {
      ...existing,
      ...data,
      totalScore,
      isShortlisted: totalScore >= shortlisting.passingScore,
      id,
      updatedAt: new Date().toISOString(),
    };
    await db.put('shortlistingCandidates', updated);
    return updated;
  },
};

// ============================================
// WRITTEN TEST OPERATIONS
// ============================================

export const writtenTestDB = {
  create: async (data) => {
    const db = await getDB();
    const test = {
      ...data,
      status: 'scheduled',
      totalMarks: data.totalMarks || 100,
      passingMarks: data.passingMarks || 50,
      testWeight: data.testWeight || DEFAULT_WEIGHTS.WRITTEN_TEST,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('writtenTests', test);
    return { ...test, id };
  },

  getByRecruitmentId: async (recruitmentId) => {
    const db = await getDB();
    const tx = db.transaction('writtenTests', 'readonly');
    const store = tx.objectStore('writtenTests');
    const index = store.index('recruitmentId');
    const test = await index.get(recruitmentId);
    await tx.done;
    return test;
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('writtenTests', id);
    if (!existing) throw new Error('Written test not found');
    const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    await db.put('writtenTests', updated);
    return updated;
  },

  complete: async (id) => {
    const db = await getDB();
    const existing = await db.get('writtenTests', id);
    if (!existing) throw new Error('Written test not found');
    const updated = { ...existing, status: 'evaluated', updatedAt: new Date().toISOString() };
    await db.put('writtenTests', updated);
    return updated;
  },
};

// ============================================
// WRITTEN TEST CANDIDATE OPERATIONS
// ============================================

export const writtenTestCandidateDB = {
  create: async (data) => {
    const db = await getDB();
    const uniqueCode = generateTestUniqueCode();
    const record = {
      ...data,
      uniqueCode,
      attended: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('writtenTestCandidates', record);
    return { ...record, id };
  },

  getByTestId: async (writtenTestId) => {
    const db = await getDB();
    const tx = db.transaction('writtenTestCandidates', 'readonly');
    const store = tx.objectStore('writtenTestCandidates');
    const index = store.index('writtenTestId');
    const candidates = await index.getAll(writtenTestId);
    await tx.done;
    return candidates;
  },

  recordAttendance: async (id) => {
    const db = await getDB();
    const existing = await db.get('writtenTestCandidates', id);
    if (!existing) throw new Error('Test candidate not found');
    const updated = {
      ...existing,
      attended: true,
      attendanceTime: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put('writtenTestCandidates', updated);
    return updated;
  },

  submitScore: async (id, marks, testData) => {
    const db = await getDB();
    const existing = await db.get('writtenTestCandidates', id);
    if (!existing) throw new Error('Test candidate not found');
    const updated = {
      ...existing,
      marksObtained: marks,
      isPassed: marks >= testData.passingMarks,
      updatedAt: new Date().toISOString(),
    };
    await db.put('writtenTestCandidates', updated);
    return updated;
  },
};

// ============================================
// INTERVIEW OPERATIONS
// ============================================

export const interviewDB = {
  create: async (data) => {
    const db = await getDB();
    const interview = {
      ...data,
      status: 'scheduled',
      totalMarks: data.totalMarks || 100,
      passingMarks: data.passingMarks || 50,
      interviewWeight: data.interviewWeight || DEFAULT_WEIGHTS.INTERVIEW,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('recruitmentInterviews', interview);
    return { ...interview, id };
  },

  getByRecruitmentId: async (recruitmentId) => {
    const db = await getDB();
    const tx = db.transaction('recruitmentInterviews', 'readonly');
    const store = tx.objectStore('recruitmentInterviews');
    const index = store.index('recruitmentId');
    const interview = await index.get(recruitmentId);
    await tx.done;
    return interview;
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('recruitmentInterviews', id);
    if (!existing) throw new Error('Interview not found');
    const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    await db.put('recruitmentInterviews', updated);
    return updated;
  },

  complete: async (id) => {
    const db = await getDB();
    const existing = await db.get('recruitmentInterviews', id);
    if (!existing) throw new Error('Interview not found');
    const updated = { ...existing, status: 'evaluated', updatedAt: new Date().toISOString() };
    await db.put('recruitmentInterviews', updated);
    return updated;
  },
};

// ============================================
// INTERVIEW CANDIDATE OPERATIONS
// ============================================

export const interviewCandidateDB = {
  create: async (data) => {
    const db = await getDB();
    const record = {
      ...data,
      attended: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('recruitmentInterviewCandidates', record);
    return { ...record, id };
  },

  getByInterviewId: async (interviewId) => {
    const db = await getDB();
    const tx = db.transaction('recruitmentInterviewCandidates', 'readonly');
    const store = tx.objectStore('recruitmentInterviewCandidates');
    const index = store.index('interviewId');
    const candidates = await index.getAll(interviewId);
    await tx.done;
    return candidates;
  },

  recordAttendance: async (id) => {
    const db = await getDB();
    const existing = await db.get('recruitmentInterviewCandidates', id);
    if (!existing) throw new Error('Interview candidate not found');
    const updated = {
      ...existing,
      attended: true,
      attendanceTime: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put('recruitmentInterviewCandidates', updated);
    return updated;
  },
};

// ============================================
// INTERVIEW EVALUATION OPERATIONS
// ============================================

export const evaluationDB = {
  create: async (data) => {
    const db = await getDB();
    const totalScore = (
      data.technicalKnowledgeScore +
      data.communicationScore +
      data.problemSolvingScore +
      data.experienceRelevanceScore +
      data.culturalFitScore
    ) / 5 * 20; // Convert 1-5 scale to 0-100

    const evaluation = {
      ...data,
      totalScore,
      evaluatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('recruitmentInterviewEvaluations', evaluation);
    return { ...evaluation, id };
  },

  getByInterviewCandidateId: async (interviewCandidateId) => {
    const db = await getDB();
    const tx = db.transaction('recruitmentInterviewEvaluations', 'readonly');
    const store = tx.objectStore('recruitmentInterviewEvaluations');
    const index = store.index('interviewCandidateId');
    const evaluations = await index.getAll(interviewCandidateId);
    await tx.done;
    return evaluations;
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('recruitmentInterviewEvaluations', id);
    if (!existing) throw new Error('Evaluation not found');

    const totalScore = (
      (data.technicalKnowledgeScore ?? existing.technicalKnowledgeScore) +
      (data.communicationScore ?? existing.communicationScore) +
      (data.problemSolvingScore ?? existing.problemSolvingScore) +
      (data.experienceRelevanceScore ?? existing.experienceRelevanceScore) +
      (data.culturalFitScore ?? existing.culturalFitScore)
    ) / 5 * 20;

    const updated = { ...existing, ...data, totalScore, id, updatedAt: new Date().toISOString() };
    await db.put('recruitmentInterviewEvaluations', updated);
    return updated;
  },
};

// ============================================
// INTERVIEW RESULT OPERATIONS
// ============================================

export const interviewResultDB = {
  create: async (data) => {
    const db = await getDB();
    const result = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('recruitmentInterviewResults', result);
    return { ...result, id };
  },

  calculateAndSave: async (interviewCandidateId, writtenTestScore = null, testWeight = 0.5, interviewWeight = 0.5) => {
    const db = await getDB();
    const evaluations = await evaluationDB.getByInterviewCandidateId(interviewCandidateId);

    if (evaluations.length === 0) throw new Error('No evaluations found');

    const averageScore = evaluations.reduce((sum, e) => sum + e.totalScore, 0) / evaluations.length;

    let combinedScore;
    if (writtenTestScore !== null) {
      combinedScore = (writtenTestScore * testWeight) + (averageScore * interviewWeight);
    } else {
      combinedScore = averageScore;
    }

    const result = {
      interviewCandidateId,
      averageScore,
      writtenTestScore,
      combinedScore,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('recruitmentInterviewResults', result);
    return { ...result, id };
  },

  getByInterviewCandidateId: async (interviewCandidateId) => {
    const db = await getDB();
    const tx = db.transaction('recruitmentInterviewResults', 'readonly');
    const store = tx.objectStore('recruitmentInterviewResults');
    const index = store.index('interviewCandidateId');
    const result = await index.get(interviewCandidateId);
    await tx.done;
    return result;
  },

  rankCandidates: async (interviewId) => {
    const db = await getDB();
    const candidates = await interviewCandidateDB.getByInterviewId(interviewId);
    const results = [];

    for (const candidate of candidates) {
      const result = await interviewResultDB.getByInterviewCandidateId(candidate.id);
      if (result) {
        results.push({ ...result, candidateId: candidate.candidateApplicationId });
      }
    }

    results.sort((a, b) => b.combinedScore - a.combinedScore);

    // Update ranks
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const updated = {
        ...result,
        finalRank: i + 1,
        isSelected: i < 3, // Top 3 selected
        updatedAt: new Date().toISOString(),
      };
      await db.put('recruitmentInterviewResults', updated);
      results[i] = updated;
    }

    return results;
  },

  // Get all interview results for a recruitment
  getByRecruitmentId: async (recruitmentId) => {
    const interview = await interviewDB.getByRecruitmentId(recruitmentId);
    if (!interview) return [];

    const candidates = await interviewCandidateDB.getByInterviewId(interview.id);
    const results = [];

    for (const candidate of candidates) {
      const result = await interviewResultDB.getByInterviewCandidateId(candidate.id);
      if (result) {
        results.push({
          ...result,
          candidateId: candidate.candidateApplicationId,
          rank: result.finalRank,
          finalScore: Math.round(result.combinedScore),
          recommendation: result.isSelected ? 'hire' : 'consider',
        });
      }
    }

    return results.sort((a, b) => (a.rank || 999) - (b.rank || 999));
  },
};

// ============================================
// RECRUITMENT REPORT OPERATIONS
// ============================================

export const reportDB = {
  create: async (data) => {
    const db = await getDB();
    const reportNumber = await generateReportNumber();
    const report = {
      ...data,
      reportNumber,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('recruitmentReports', report);
    return { ...report, id };
  },

  getByRecruitmentId: async (recruitmentId) => {
    const db = await getDB();
    const tx = db.transaction('recruitmentReports', 'readonly');
    const store = tx.objectStore('recruitmentReports');
    const index = store.index('recruitmentId');
    const report = await index.get(recruitmentId);
    await tx.done;
    return report;
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('recruitmentReports', id);
    if (!existing) throw new Error('Report not found');
    const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    await db.put('recruitmentReports', updated);
    return updated;
  },

  submit: async (id) => {
    const db = await getDB();
    const existing = await db.get('recruitmentReports', id);
    if (!existing) throw new Error('Report not found');
    const updated = {
      ...existing,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put('recruitmentReports', updated);
    return updated;
  },

  approve: async (id, approvedBy) => {
    const db = await getDB();
    const existing = await db.get('recruitmentReports', id);
    if (!existing) throw new Error('Report not found');
    const updated = {
      ...existing,
      status: 'approved',
      approvedBy,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put('recruitmentReports', updated);
    return updated;
  },
};

// ============================================
// OFFER LETTER OPERATIONS
// ============================================

export const offerDB = {
  create: async (data) => {
    const db = await getDB();
    const offer = {
      ...data,
      status: 'draft',
      offerDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('offerLetters', offer);
    return { ...offer, id };
  },

  getByRecruitmentId: async (recruitmentId) => {
    const db = await getDB();
    const tx = db.transaction('offerLetters', 'readonly');
    const store = tx.objectStore('offerLetters');
    const index = store.index('recruitmentId');
    const offer = await index.get(recruitmentId);
    await tx.done;
    return offer;
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('offerLetters', id);
    if (!existing) throw new Error('Offer letter not found');
    const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    await db.put('offerLetters', updated);
    return updated;
  },

  send: async (id) => {
    const db = await getDB();
    const existing = await db.get('offerLetters', id);
    if (!existing) throw new Error('Offer letter not found');
    const updated = {
      ...existing,
      status: 'sent',
      sentAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put('offerLetters', updated);
    return updated;
  },

  respond: async (id, accepted, declineReason = null) => {
    const db = await getDB();
    const existing = await db.get('offerLetters', id);
    if (!existing) throw new Error('Offer letter not found');
    const updated = {
      ...existing,
      status: accepted ? 'accepted' : 'declined',
      declineReason: accepted ? null : declineReason,
      respondedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put('offerLetters', updated);
    return updated;
  },
};

// ============================================
// SANCTION CLEARANCE OPERATIONS
// ============================================

export const sanctionDB = {
  create: async (data) => {
    const db = await getDB();
    const clearance = {
      ...data,
      status: 'pending',
      declarationDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('sanctionClearances', clearance);
    return { ...clearance, id };
  },

  getByRecruitmentId: async (recruitmentId) => {
    const db = await getDB();
    const tx = db.transaction('sanctionClearances', 'readonly');
    const store = tx.objectStore('sanctionClearances');
    const index = store.index('recruitmentId');
    const clearance = await index.get(recruitmentId);
    await tx.done;
    return clearance;
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('sanctionClearances', id);
    if (!existing) throw new Error('Sanction clearance not found');
    const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    await db.put('sanctionClearances', updated);
    return updated;
  },

  verify: async (id, verifiedBy, isClear) => {
    const db = await getDB();
    const existing = await db.get('sanctionClearances', id);
    if (!existing) throw new Error('Sanction clearance not found');
    const updated = {
      ...existing,
      status: isClear ? 'cleared' : 'flagged',
      verifiedBy,
      verifiedAt: new Date().toISOString(),
      checkedDate: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    };
    await db.put('sanctionClearances', updated);
    return updated;
  },

  // Alias for verify - runs sanction check
  runCheck: async (id, isClear) => {
    return sanctionDB.verify(id, 'System', isClear);
  },
};

// ============================================
// BACKGROUND CHECK OPERATIONS
// ============================================

export const backgroundCheckDB = {
  create: async (data) => {
    const db = await getDB();
    const check = {
      ...data,
      overallStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('backgroundChecks', check);
    return { ...check, id };
  },

  getByRecruitmentId: async (recruitmentId) => {
    const db = await getDB();
    const tx = db.transaction('backgroundChecks', 'readonly');
    const store = tx.objectStore('backgroundChecks');
    const index = store.index('recruitmentId');
    const check = await index.get(recruitmentId);
    await tx.done;
    return check;
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('backgroundChecks', id);
    if (!existing) throw new Error('Background check not found');
    const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    await db.put('backgroundChecks', updated);
    return updated;
  },

  complete: async (id, passed = true) => {
    const db = await getDB();
    const existing = await db.get('backgroundChecks', id);
    if (!existing) throw new Error('Background check not found');
    const updated = {
      ...existing,
      overallStatus: passed ? 'completed' : 'failed',
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put('backgroundChecks', updated);
    return updated;
  },
};

// ============================================
// EMPLOYMENT CONTRACT OPERATIONS
// ============================================

export const contractDB = {
  create: async (data) => {
    const db = await getDB();
    const contractNumber = await generateContractNumber();
    const contract = {
      ...data,
      contractNumber,
      status: 'draft',
      probationPeriodMonths: data.probationPeriodMonths || 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('employmentContracts', contract);
    return { ...contract, id };
  },

  getByRecruitmentId: async (recruitmentId) => {
    const db = await getDB();
    const tx = db.transaction('employmentContracts', 'readonly');
    const store = tx.objectStore('employmentContracts');
    const index = store.index('recruitmentId');
    const contract = await index.get(recruitmentId);
    await tx.done;
    return contract;
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('employmentContracts', id);
    if (!existing) throw new Error('Contract not found');
    const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    await db.put('employmentContracts', updated);
    return updated;
  },

  signEmployee: async (id, signaturePath = null) => {
    const db = await getDB();
    const existing = await db.get('employmentContracts', id);
    if (!existing) throw new Error('Contract not found');
    const updated = {
      ...existing,
      employeeSignedAt: new Date().toISOString(),
      employeeSignaturePath: signaturePath,
      status: 'pending_signature',
      updatedAt: new Date().toISOString(),
    };
    await db.put('employmentContracts', updated);
    return updated;
  },

  signEmployer: async (id, signatoryId, signaturePath = null) => {
    const db = await getDB();
    const existing = await db.get('employmentContracts', id);
    if (!existing) throw new Error('Contract not found');
    const updated = {
      ...existing,
      employerSignedAt: new Date().toISOString(),
      employerSignatoryId: signatoryId,
      employerSignaturePath: signaturePath,
      status: 'signed',
      updatedAt: new Date().toISOString(),
    };
    await db.put('employmentContracts', updated);
    return updated;
  },

  activate: async (id) => {
    const db = await getDB();
    const existing = await db.get('employmentContracts', id);
    if (!existing) throw new Error('Contract not found');
    const updated = {
      ...existing,
      status: 'active',
      updatedAt: new Date().toISOString(),
    };
    await db.put('employmentContracts', updated);
    return updated;
  },
};

// ============================================
// FILE CHECKLIST OPERATIONS
// ============================================

export const checklistDB = {
  create: async (data) => {
    const db = await getDB();
    const checklist = {
      ...data,
      status: 'incomplete',
      torAttached: false,
      srfAttached: false,
      shortlistFormAttached: false,
      rcFormAttached: false,
      writtenTestPapersAttached: false,
      interviewFormsAttached: false,
      interviewResultAttached: false,
      recruitmentReportAttached: false,
      offerLetterAttached: false,
      sanctionClearanceAttached: false,
      referenceChecksAttached: false,
      guaranteeLetterAttached: false,
      addressVerificationAttached: false,
      criminalCheckAttached: false,
      contractAttached: false,
      personalInfoFormAttached: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('fileChecklists', checklist);
    return { ...checklist, id };
  },

  getByRecruitmentId: async (recruitmentId) => {
    const db = await getDB();
    const tx = db.transaction('fileChecklists', 'readonly');
    const store = tx.objectStore('fileChecklists');
    const index = store.index('recruitmentId');
    const checklist = await index.get(recruitmentId);
    await tx.done;
    return checklist;
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('fileChecklists', id);
    if (!existing) throw new Error('Checklist not found');
    const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() };

    // Check if all items are attached
    const allAttached = [
      'torAttached', 'srfAttached', 'shortlistFormAttached', 'rcFormAttached',
      'writtenTestPapersAttached', 'interviewFormsAttached', 'interviewResultAttached',
      'recruitmentReportAttached', 'offerLetterAttached', 'sanctionClearanceAttached',
      'referenceChecksAttached', 'guaranteeLetterAttached', 'addressVerificationAttached',
      'criminalCheckAttached', 'contractAttached', 'personalInfoFormAttached'
    ].every(field => updated[field]);

    updated.status = allAttached ? 'complete' : 'incomplete';

    await db.put('fileChecklists', updated);
    return updated;
  },

  verify: async (id, verifiedBy) => {
    const db = await getDB();
    const existing = await db.get('fileChecklists', id);
    if (!existing) throw new Error('Checklist not found');
    const updated = {
      ...existing,
      verifiedBy,
      verifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put('fileChecklists', updated);
    return updated;
  },
};

// ============================================
// LOOKUP DATA OPERATIONS
// ============================================

export const provincesDB = {
  getAll: async () => {
    const db = await getDB();
    return db.getAll('provinces');
  },

  create: async (data) => {
    const db = await getDB();
    const id = await db.add('provinces', data);
    return { ...data, id };
  },

  seed: async () => {
    const db = await getDB();
    const existing = await db.getAll('provinces');
    if (existing.length > 0) return existing;

    const afghanistanProvinces = [
      { name: 'Kabul', nameDari: 'کابل', namePashto: 'کابل' },
      { name: 'Herat', nameDari: 'هرات', namePashto: 'هرات' },
      { name: 'Balkh', nameDari: 'بلخ', namePashto: 'بلخ' },
      { name: 'Kandahar', nameDari: 'قندهار', namePashto: 'کندهار' },
      { name: 'Nangarhar', nameDari: 'ننگرهار', namePashto: 'ننګرهار' },
      { name: 'Baghlan', nameDari: 'بغلان', namePashto: 'بغلان' },
      { name: 'Kunduz', nameDari: 'کندز', namePashto: 'کندوز' },
      { name: 'Takhar', nameDari: 'تخار', namePashto: 'تخار' },
      { name: 'Badakhshan', nameDari: 'بدخشان', namePashto: 'بدخشان' },
      { name: 'Ghazni', nameDari: 'غزنی', namePashto: 'غزني' },
      { name: 'Parwan', nameDari: 'پروان', namePashto: 'پروان' },
      { name: 'Bamyan', nameDari: 'بامیان', namePashto: 'بامیان' },
      { name: 'Paktia', nameDari: 'پکتیا', namePashto: 'پکتیا' },
      { name: 'Paktika', nameDari: 'پکتیکا', namePashto: 'پکتیکا' },
      { name: 'Khost', nameDari: 'خوست', namePashto: 'خوست' },
      { name: 'Logar', nameDari: 'لوگر', namePashto: 'لوګر' },
      { name: 'Wardak', nameDari: 'وردک', namePashto: 'وردګ' },
      { name: 'Kapisa', nameDari: 'کاپیسا', namePashto: 'کاپیسا' },
      { name: 'Laghman', nameDari: 'لغمان', namePashto: 'لغمان' },
      { name: 'Kunar', nameDari: 'کنر', namePashto: 'کنړ' },
      { name: 'Nuristan', nameDari: 'نورستان', namePashto: 'نورستان' },
      { name: 'Panjshir', nameDari: 'پنجشیر', namePashto: 'پنجشیر' },
      { name: 'Samangan', nameDari: 'سمنگان', namePashto: 'سمنګان' },
      { name: 'Sar-e Pol', nameDari: 'سرپل', namePashto: 'سرپل' },
      { name: 'Jowzjan', nameDari: 'جوزجان', namePashto: 'جوزجان' },
      { name: 'Faryab', nameDari: 'فاریاب', namePashto: 'فاریاب' },
      { name: 'Badghis', nameDari: 'بادغیس', namePashto: 'بادغیس' },
      { name: 'Ghor', nameDari: 'غور', namePashto: 'غور' },
      { name: 'Daykundi', nameDari: 'دایکندی', namePashto: 'دایکندي' },
      { name: 'Uruzgan', nameDari: 'ارزگان', namePashto: 'اروزګان' },
      { name: 'Zabul', nameDari: 'زابل', namePashto: 'زابل' },
      { name: 'Helmand', nameDari: 'هلمند', namePashto: 'هلمند' },
      { name: 'Farah', nameDari: 'فراه', namePashto: 'فراه' },
      { name: 'Nimroz', nameDari: 'نیمروز', namePashto: 'نیمروز' },
    ];

    const tx = db.transaction('provinces', 'readwrite');
    for (const province of afghanistanProvinces) {
      await tx.store.add(province);
    }
    await tx.done;
    return db.getAll('provinces');
  },
};

export default {
  recruitmentDB,
  torDB,
  srfDB,
  vacancyDB,
  candidateDB,
  applicationDB,
  educationDB,
  experienceDB,
  committeeDB,
  memberDB,
  coiDB,
  longlistingDB,
  longlistingCandidateDB,
  shortlistingDB,
  shortlistingCandidateDB,
  writtenTestDB,
  writtenTestCandidateDB,
  interviewDB,
  interviewCandidateDB,
  evaluationDB,
  interviewResultDB,
  reportDB,
  offerDB,
  sanctionDB,
  backgroundCheckDB,
  contractDB,
  checklistDB,
  provincesDB,
};
