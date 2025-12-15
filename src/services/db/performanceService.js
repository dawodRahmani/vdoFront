import { openDB } from 'idb';

const DB_NAME = 'vdo-erp-db';
const DB_VERSION = 33;

// Performance Appraisal stores
const STORES = {
  appraisalCycles: 'appraisalCycles',
  appraisalTemplates: 'appraisalTemplates',
  appraisalSections: 'appraisalSections',
  appraisalCriteria: 'appraisalCriteria',
  employeeAppraisals: 'employeeAppraisals',
  appraisalRatings: 'appraisalRatings',
  appraisalCommitteeMembers: 'appraisalCommitteeMembers',
  appraisalGoals: 'appraisalGoals',
  appraisalTrainingNeeds: 'appraisalTrainingNeeds',
  probationRecords: 'probationRecords',
  probationExtensions: 'probationExtensions',
  probationKpis: 'probationKpis',
  performanceImprovementPlans: 'performanceImprovementPlans',
  pipGoals: 'pipGoals',
  pipCheckIns: 'pipCheckIns',
  appraisalOutcomes: 'appraisalOutcomes'
};

const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Appraisal Cycles
      if (!db.objectStoreNames.contains(STORES.appraisalCycles)) {
        const store = db.createObjectStore(STORES.appraisalCycles, { keyPath: 'id', autoIncrement: true });
        store.createIndex('by_status', 'status');
        store.createIndex('by_year', 'fiscalYear');
        store.createIndex('by_type', 'cycleType');
      }

      // Appraisal Templates
      if (!db.objectStoreNames.contains(STORES.appraisalTemplates)) {
        const store = db.createObjectStore(STORES.appraisalTemplates, { keyPath: 'id', autoIncrement: true });
        store.createIndex('by_type', 'templateType');
        store.createIndex('by_active', 'isActive');
      }

      // Appraisal Sections
      if (!db.objectStoreNames.contains(STORES.appraisalSections)) {
        const store = db.createObjectStore(STORES.appraisalSections, { keyPath: 'id', autoIncrement: true });
        store.createIndex('by_template', 'templateId');
      }

      // Appraisal Criteria
      if (!db.objectStoreNames.contains(STORES.appraisalCriteria)) {
        const store = db.createObjectStore(STORES.appraisalCriteria, { keyPath: 'id', autoIncrement: true });
        store.createIndex('by_section', 'sectionId');
      }

      // Employee Appraisals
      if (!db.objectStoreNames.contains(STORES.employeeAppraisals)) {
        const store = db.createObjectStore(STORES.employeeAppraisals, { keyPath: 'id', autoIncrement: true });
        store.createIndex('by_employee', 'employeeId');
        store.createIndex('by_cycle', 'appraisalCycleId');
        store.createIndex('by_status', 'status');
        store.createIndex('by_type', 'appraisalType');
        store.createIndex('by_manager', 'lineManagerId');
      }

      // Appraisal Ratings
      if (!db.objectStoreNames.contains(STORES.appraisalRatings)) {
        const store = db.createObjectStore(STORES.appraisalRatings, { keyPath: 'id', autoIncrement: true });
        store.createIndex('by_appraisal', 'appraisalId');
        store.createIndex('by_criteria', 'criteriaId');
      }

      // Appraisal Committee Members
      if (!db.objectStoreNames.contains(STORES.appraisalCommitteeMembers)) {
        const store = db.createObjectStore(STORES.appraisalCommitteeMembers, { keyPath: 'id', autoIncrement: true });
        store.createIndex('by_appraisal', 'appraisalId');
        store.createIndex('by_member', 'memberId');
      }

      // Appraisal Goals
      if (!db.objectStoreNames.contains(STORES.appraisalGoals)) {
        const store = db.createObjectStore(STORES.appraisalGoals, { keyPath: 'id', autoIncrement: true });
        store.createIndex('by_appraisal', 'appraisalId');
        store.createIndex('by_status', 'status');
      }

      // Appraisal Training Needs
      if (!db.objectStoreNames.contains(STORES.appraisalTrainingNeeds)) {
        const store = db.createObjectStore(STORES.appraisalTrainingNeeds, { keyPath: 'id', autoIncrement: true });
        store.createIndex('by_appraisal', 'appraisalId');
        store.createIndex('by_type', 'trainingType');
      }

      // Probation Records
      if (!db.objectStoreNames.contains(STORES.probationRecords)) {
        const store = db.createObjectStore(STORES.probationRecords, { keyPath: 'id', autoIncrement: true });
        store.createIndex('by_employee', 'employeeId');
        store.createIndex('by_status', 'status');
      }

      // Probation Extensions
      if (!db.objectStoreNames.contains(STORES.probationExtensions)) {
        const store = db.createObjectStore(STORES.probationExtensions, { keyPath: 'id', autoIncrement: true });
        store.createIndex('by_probation', 'probationId');
      }

      // Probation KPIs
      if (!db.objectStoreNames.contains(STORES.probationKpis)) {
        const store = db.createObjectStore(STORES.probationKpis, { keyPath: 'id', autoIncrement: true });
        store.createIndex('by_extension', 'extensionId');
      }

      // Performance Improvement Plans
      if (!db.objectStoreNames.contains(STORES.performanceImprovementPlans)) {
        const store = db.createObjectStore(STORES.performanceImprovementPlans, { keyPath: 'id', autoIncrement: true });
        store.createIndex('by_employee', 'employeeId');
        store.createIndex('by_status', 'status');
        store.createIndex('by_manager', 'managerId');
      }

      // PIP Goals
      if (!db.objectStoreNames.contains(STORES.pipGoals)) {
        const store = db.createObjectStore(STORES.pipGoals, { keyPath: 'id', autoIncrement: true });
        store.createIndex('by_pip', 'pipId');
        store.createIndex('by_status', 'status');
      }

      // PIP Check-ins
      if (!db.objectStoreNames.contains(STORES.pipCheckIns)) {
        const store = db.createObjectStore(STORES.pipCheckIns, { keyPath: 'id', autoIncrement: true });
        store.createIndex('by_pip', 'pipId');
      }

      // Appraisal Outcomes
      if (!db.objectStoreNames.contains(STORES.appraisalOutcomes)) {
        const store = db.createObjectStore(STORES.appraisalOutcomes, { keyPath: 'id', autoIncrement: true });
        store.createIndex('by_appraisal', 'appraisalId');
        store.createIndex('by_type', 'outcomeType');
      }
    }
  });
};

// Generic CRUD operations
const createCRUD = (storeName) => ({
  async getAll() {
    const db = await initDB();
    return db.getAll(storeName);
  },

  async getById(id) {
    const db = await initDB();
    return db.get(storeName, id);
  },

  async create(data) {
    const db = await initDB();
    const id = await db.add(storeName, {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { ...data, id };
  },

  async update(id, data) {
    const db = await initDB();
    await db.put(storeName, {
      ...data,
      id,
      updatedAt: new Date().toISOString()
    });
    return { ...data, id };
  },

  async delete(id) {
    const db = await initDB();
    await db.delete(storeName, id);
    return id;
  },

  async getByIndex(indexName, value) {
    const db = await initDB();
    return db.getAllFromIndex(storeName, indexName, value);
  }
});

// Rating scale definitions
const RATING_SCALE = [
  { score: 0, rating: 'Unsatisfactory', description: 'Performance significantly below expectations' },
  { score: 1, rating: 'Needs Improvement', description: 'Performance below expectations, requires development' },
  { score: 2, rating: 'Basic', description: 'Meets minimum requirements' },
  { score: 3, rating: 'Good', description: 'Meets expectations consistently' },
  { score: 4, rating: 'Satisfactory', description: 'Above expectations in most areas' },
  { score: 5, rating: 'Outstanding', description: 'Exceeds expectations, exceptional performance' }
];

// Performance level thresholds
const getPerformanceLevel = (percentageScore) => {
  if (percentageScore >= 80) return { level: 'outstanding', label: 'Outstanding', recommendation: 'Recommended for promotion' };
  if (percentageScore >= 70) return { level: 'exceeds_expectations', label: 'Exceeds Expectations', recommendation: 'Recommended for promotion' };
  if (percentageScore >= 50) return { level: 'meets_expectations', label: 'Meets Expectations', recommendation: 'Extend contract' };
  if (percentageScore >= 30) return { level: 'needs_improvement', label: 'Needs Improvement', recommendation: 'Extend contract with PIP' };
  return { level: 'unsatisfactory', label: 'Unsatisfactory', recommendation: 'Do not extend contract' };
};

// Calculate appraisal score
const calculateAppraisalScore = async (appraisalId) => {
  const db = await initDB();
  const ratings = await db.getAllFromIndex(STORES.appraisalRatings, 'by_appraisal', appraisalId);

  if (ratings.length === 0) return { totalScore: 0, maxScore: 0, percentage: 0 };

  let totalScore = 0;
  let maxScore = 0;

  for (const rating of ratings) {
    const criteria = await db.get(STORES.appraisalCriteria, rating.criteriaId);
    if (criteria) {
      const weight = criteria.weight || 1;
      totalScore += (rating.managerRating || 0) * weight;
      maxScore += (criteria.maxRating || 5) * weight;
    }
  }

  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  return { totalScore, maxScore, percentage };
};

// Appraisal workflow actions
const submitSelfAssessment = async (appraisalId, data) => {
  const db = await initDB();
  const appraisal = await db.get(STORES.employeeAppraisals, appraisalId);
  if (!appraisal) throw new Error('Appraisal not found');

  const updated = {
    ...appraisal,
    selfAssessmentSubmitted: true,
    selfAssessmentDate: new Date().toISOString(),
    employeeAchievements: data.achievements,
    employeeChallenges: data.challenges,
    employeeComments: data.comments,
    status: 'manager_review',
    updatedAt: new Date().toISOString()
  };

  await db.put(STORES.employeeAppraisals, updated);
  return updated;
};

const submitManagerReview = async (appraisalId, data) => {
  const db = await initDB();
  const appraisal = await db.get(STORES.employeeAppraisals, appraisalId);
  if (!appraisal) throw new Error('Appraisal not found');

  // Calculate scores
  const scores = await calculateAppraisalScore(appraisalId);
  const performanceLevel = getPerformanceLevel(scores.percentage);

  const updated = {
    ...appraisal,
    managerReviewSubmitted: true,
    managerReviewDate: new Date().toISOString(),
    managerOverallComments: data.overallComments,
    managerStrengths: data.strengths,
    managerImprovements: data.improvements,
    managerTrainingRecommendations: data.trainingRecommendations,
    managerRecommendation: data.recommendation,
    totalScore: scores.totalScore,
    maxPossibleScore: scores.maxScore,
    percentageScore: scores.percentage,
    performanceLevel: performanceLevel.level,
    status: 'committee_review',
    updatedAt: new Date().toISOString()
  };

  await db.put(STORES.employeeAppraisals, updated);
  return updated;
};

const submitCommitteeReview = async (appraisalId, data) => {
  const db = await initDB();
  const appraisal = await db.get(STORES.employeeAppraisals, appraisalId);
  if (!appraisal) throw new Error('Appraisal not found');

  const updated = {
    ...appraisal,
    committeeReviewed: true,
    committeeReviewedAt: new Date().toISOString(),
    committeeComments: data.comments,
    committeeRecommendation: data.recommendation,
    status: 'pending_approval',
    updatedAt: new Date().toISOString()
  };

  await db.put(STORES.employeeAppraisals, updated);
  return updated;
};

const approveAppraisal = async (appraisalId, approvedBy, decision, comments) => {
  const db = await initDB();
  const appraisal = await db.get(STORES.employeeAppraisals, appraisalId);
  if (!appraisal) throw new Error('Appraisal not found');

  const updated = {
    ...appraisal,
    approvedBy,
    approvedAt: new Date().toISOString(),
    approvalComments: comments,
    finalDecision: decision,
    status: 'approved',
    updatedAt: new Date().toISOString()
  };

  await db.put(STORES.employeeAppraisals, updated);
  return updated;
};

const communicateDecision = async (appraisalId) => {
  const db = await initDB();
  const appraisal = await db.get(STORES.employeeAppraisals, appraisalId);
  if (!appraisal) throw new Error('Appraisal not found');

  const updated = {
    ...appraisal,
    communicatedToEmployee: true,
    communicatedAt: new Date().toISOString(),
    status: 'communicated',
    updatedAt: new Date().toISOString()
  };

  await db.put(STORES.employeeAppraisals, updated);
  return updated;
};

const acknowledgeAppraisal = async (appraisalId, feedback) => {
  const db = await initDB();
  const appraisal = await db.get(STORES.employeeAppraisals, appraisalId);
  if (!appraisal) throw new Error('Appraisal not found');

  const updated = {
    ...appraisal,
    employeeAcknowledged: true,
    employeeAcknowledgedAt: new Date().toISOString(),
    employeeFeedback: feedback,
    status: 'completed',
    updatedAt: new Date().toISOString()
  };

  await db.put(STORES.employeeAppraisals, updated);
  return updated;
};

// Probation actions
const confirmProbation = async (probationId, appraisalId) => {
  const db = await initDB();
  const probation = await db.get(STORES.probationRecords, probationId);
  if (!probation) throw new Error('Probation record not found');

  const updated = {
    ...probation,
    status: 'confirmed',
    finalAppraisalId: appraisalId,
    updatedAt: new Date().toISOString()
  };

  await db.put(STORES.probationRecords, updated);
  return updated;
};

const extendProbation = async (probationId, extensionData) => {
  const db = await initDB();
  const probation = await db.get(STORES.probationRecords, probationId);
  if (!probation) throw new Error('Probation record not found');

  if (probation.extensionCount >= 2) {
    throw new Error('Maximum 2 probation extensions allowed');
  }

  // Create extension record
  const extension = await db.add(STORES.probationExtensions, {
    probationId,
    appraisalId: extensionData.appraisalId,
    extensionNumber: probation.extensionCount + 1,
    previousEndDate: probation.currentEndDate,
    newEndDate: extensionData.newEndDate,
    extensionReason: extensionData.reason,
    approvedBy: extensionData.approvedBy,
    approvedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // Update probation record
  const updated = {
    ...probation,
    currentEndDate: extensionData.newEndDate,
    extensionCount: probation.extensionCount + 1,
    status: 'extended',
    updatedAt: new Date().toISOString()
  };

  await db.put(STORES.probationRecords, updated);
  return { probation: updated, extensionId: extension };
};

// PIP actions
const activatePIP = async (pipId) => {
  const db = await initDB();
  const pip = await db.get(STORES.performanceImprovementPlans, pipId);
  if (!pip) throw new Error('PIP not found');

  const updated = {
    ...pip,
    status: 'active',
    updatedAt: new Date().toISOString()
  };

  await db.put(STORES.performanceImprovementPlans, updated);
  return updated;
};

const recordPIPCheckIn = async (pipId, checkInData) => {
  const db = await initDB();
  const pip = await db.get(STORES.performanceImprovementPlans, pipId);
  if (!pip) throw new Error('PIP not found');

  const existingCheckIns = await db.getAllFromIndex(STORES.pipCheckIns, 'by_pip', pipId);

  const checkIn = await db.add(STORES.pipCheckIns, {
    pipId,
    checkInDate: new Date().toISOString(),
    checkInNumber: existingCheckIns.length + 1,
    progressSummary: checkInData.progressSummary,
    goalsReviewed: checkInData.goalsReviewed,
    managerFeedback: checkInData.managerFeedback,
    employeeComments: checkInData.employeeComments,
    nextSteps: checkInData.nextSteps,
    conductedBy: checkInData.conductedBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  return checkIn;
};

const completePIP = async (pipId, outcome) => {
  const db = await initDB();
  const pip = await db.get(STORES.performanceImprovementPlans, pipId);
  if (!pip) throw new Error('PIP not found');

  const status = outcome === 'success' ? 'completed_success' : 'completed_failure';

  const updated = {
    ...pip,
    status,
    completedAt: new Date().toISOString(),
    outcome,
    updatedAt: new Date().toISOString()
  };

  await db.put(STORES.performanceImprovementPlans, updated);
  return updated;
};

// Generate appraisal number
const generateAppraisalNumber = async () => {
  const db = await initDB();
  const appraisals = await db.getAll(STORES.employeeAppraisals);
  const year = new Date().getFullYear();
  const count = appraisals.filter(a => a.appraisalNumber?.includes(`APR-${year}`)).length + 1;
  return `APR-${year}-${String(count).padStart(5, '0')}`;
};

// Generate PIP number
const generatePIPNumber = async () => {
  const db = await initDB();
  const pips = await db.getAll(STORES.performanceImprovementPlans);
  const year = new Date().getFullYear();
  const count = pips.filter(p => p.pipNumber?.includes(`PIP-${year}`)).length + 1;
  return `PIP-${year}-${String(count).padStart(5, '0')}`;
};

// Seed data
const seedPerformanceData = async () => {
  const db = await initDB();

  // Check if data already exists
  const existingTemplates = await db.getAll(STORES.appraisalTemplates);
  if (existingTemplates.length > 0) return;

  // Create default template
  const templateId = await db.add(STORES.appraisalTemplates, {
    name: 'Annual Performance Appraisal',
    templateType: 'annual',
    description: 'Standard annual performance evaluation template',
    isActive: true,
    requiresSelfAssessment: true,
    requiresCommitteeReview: true,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // Section 1: Core Job Performance
  const section1Id = await db.add(STORES.appraisalSections, {
    templateId,
    name: 'Core Job Performance',
    description: 'Evaluation of core job responsibilities and performance',
    weightPercentage: 50,
    displayOrder: 1,
    isRequired: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const corePerformanceCriteria = [
    { name: 'Job Knowledge & Technical Skills', description: 'Knowledge of duties, accuracy, expertise' },
    { name: 'Quality of Work', description: 'Accuracy, thoroughness, reliability' },
    { name: 'Productivity & Efficiency', description: 'Timeliness, workload management' },
    { name: 'Communication Skills', description: 'Reporting, oral communication, listening' },
    { name: 'Teamwork & Collaboration', description: 'Cooperation, cross-departmental work' },
    { name: 'Initiative & Creativity', description: 'Decision-making, innovation' },
    { name: 'Attendance & Punctuality', description: 'Regularity, timeliness' }
  ];

  for (let i = 0; i < corePerformanceCriteria.length; i++) {
    await db.add(STORES.appraisalCriteria, {
      sectionId: section1Id,
      name: corePerformanceCriteria[i].name,
      description: corePerformanceCriteria[i].description,
      minRating: 0,
      maxRating: 5,
      weight: 1,
      displayOrder: i + 1,
      isRequired: true,
      requiresComment: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // Section 2: Compliance
  const section2Id = await db.add(STORES.appraisalSections, {
    templateId,
    name: 'Compliance',
    description: 'Adherence to organizational policies and standards',
    weightPercentage: 25,
    displayOrder: 2,
    isRequired: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const complianceCriteria = [
    { name: 'AAP - Accountability to Affected Populations', description: 'Dignity, equality, transparency' },
    { name: 'PSEAH Compliance', description: 'Respectful behavior, no harassment' },
    { name: 'Safeguarding', description: 'Safety and respect for vulnerable groups' },
    { name: 'Code of Conduct', description: 'Ethical conduct, neutrality' },
    { name: 'Confidentiality & Data Privacy', description: 'Handling sensitive information' }
  ];

  for (let i = 0; i < complianceCriteria.length; i++) {
    await db.add(STORES.appraisalCriteria, {
      sectionId: section2Id,
      name: complianceCriteria[i].name,
      description: complianceCriteria[i].description,
      minRating: 0,
      maxRating: 5,
      weight: 1,
      displayOrder: i + 1,
      isRequired: true,
      requiresComment: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // Section 3: Organizational Competencies
  const section3Id = await db.add(STORES.appraisalSections, {
    templateId,
    name: 'Organizational Competencies',
    description: 'General organizational skills and competencies',
    weightPercentage: 25,
    displayOrder: 3,
    isRequired: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const orgCompetenciesCriteria = [
    { name: 'Compliance & Policy Adherence', description: 'HR, Finance, Procurement policies' },
    { name: 'Conflict Management', description: 'Resolution, emotional control' },
    { name: 'Professional Competence', description: 'Skills aligned with job requirements' },
    { name: 'Commitment to Organization', description: 'Dedication, reliability, enthusiasm' },
    { name: 'Contribution to Sustainability', description: 'Cost control, resource management' }
  ];

  for (let i = 0; i < orgCompetenciesCriteria.length; i++) {
    await db.add(STORES.appraisalCriteria, {
      sectionId: section3Id,
      name: orgCompetenciesCriteria[i].name,
      description: orgCompetenciesCriteria[i].description,
      minRating: 0,
      maxRating: 5,
      weight: 1,
      displayOrder: i + 1,
      isRequired: true,
      requiresComment: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // Create probation template
  await db.add(STORES.appraisalTemplates, {
    name: 'Probation Appraisal',
    templateType: 'probation',
    description: 'Probation period evaluation template',
    isActive: true,
    requiresSelfAssessment: false,
    requiresCommitteeReview: false,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // Create sample appraisal cycle
  await db.add(STORES.appraisalCycles, {
    name: 'Annual Appraisal 2025',
    cycleType: 'annual',
    fiscalYear: 2025,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    selfAssessmentDeadline: '2025-01-15',
    managerReviewDeadline: '2025-01-31',
    committeeReviewDeadline: '2025-02-15',
    finalApprovalDeadline: '2025-02-28',
    status: 'active',
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  console.log('Performance appraisal seed data created');
};

// Initialize seed data
seedPerformanceData().catch(console.error);

const performanceService = {
  // CRUD operations
  appraisalCycles: createCRUD(STORES.appraisalCycles),
  appraisalTemplates: createCRUD(STORES.appraisalTemplates),
  appraisalSections: createCRUD(STORES.appraisalSections),
  appraisalCriteria: createCRUD(STORES.appraisalCriteria),
  employeeAppraisals: createCRUD(STORES.employeeAppraisals),
  appraisalRatings: createCRUD(STORES.appraisalRatings),
  appraisalCommitteeMembers: createCRUD(STORES.appraisalCommitteeMembers),
  appraisalGoals: createCRUD(STORES.appraisalGoals),
  appraisalTrainingNeeds: createCRUD(STORES.appraisalTrainingNeeds),
  probationRecords: createCRUD(STORES.probationRecords),
  probationExtensions: createCRUD(STORES.probationExtensions),
  probationKpis: createCRUD(STORES.probationKpis),
  performanceImprovementPlans: createCRUD(STORES.performanceImprovementPlans),
  pipGoals: createCRUD(STORES.pipGoals),
  pipCheckIns: createCRUD(STORES.pipCheckIns),
  appraisalOutcomes: createCRUD(STORES.appraisalOutcomes),

  // Constants
  RATING_SCALE,
  getPerformanceLevel,

  // Workflow actions
  submitSelfAssessment,
  submitManagerReview,
  submitCommitteeReview,
  approveAppraisal,
  communicateDecision,
  acknowledgeAppraisal,

  // Probation actions
  confirmProbation,
  extendProbation,

  // PIP actions
  activatePIP,
  recordPIPCheckIn,
  completePIP,

  // Utilities
  calculateAppraisalScore,
  generateAppraisalNumber,
  generatePIPNumber,

  // Get sections with criteria for a template
  async getTemplateWithSections(templateId) {
    const db = await initDB();
    const template = await db.get(STORES.appraisalTemplates, templateId);
    if (!template) return null;

    const sections = await db.getAllFromIndex(STORES.appraisalSections, 'by_template', templateId);

    for (const section of sections) {
      section.criteria = await db.getAllFromIndex(STORES.appraisalCriteria, 'by_section', section.id);
      section.criteria.sort((a, b) => a.displayOrder - b.displayOrder);
    }

    sections.sort((a, b) => a.displayOrder - b.displayOrder);
    template.sections = sections;

    return template;
  },

  // Get appraisal with all related data
  async getAppraisalWithDetails(appraisalId) {
    const db = await initDB();
    const appraisal = await db.get(STORES.employeeAppraisals, appraisalId);
    if (!appraisal) return null;

    appraisal.ratings = await db.getAllFromIndex(STORES.appraisalRatings, 'by_appraisal', appraisalId);
    appraisal.committeeMembers = await db.getAllFromIndex(STORES.appraisalCommitteeMembers, 'by_appraisal', appraisalId);
    appraisal.goals = await db.getAllFromIndex(STORES.appraisalGoals, 'by_appraisal', appraisalId);
    appraisal.trainingNeeds = await db.getAllFromIndex(STORES.appraisalTrainingNeeds, 'by_appraisal', appraisalId);

    return appraisal;
  },

  // Get PIP with all related data
  async getPIPWithDetails(pipId) {
    const db = await initDB();
    const pip = await db.get(STORES.performanceImprovementPlans, pipId);
    if (!pip) return null;

    pip.goals = await db.getAllFromIndex(STORES.pipGoals, 'by_pip', pipId);
    pip.checkIns = await db.getAllFromIndex(STORES.pipCheckIns, 'by_pip', pipId);
    pip.checkIns.sort((a, b) => a.checkInNumber - b.checkInNumber);

    return pip;
  }
};

export default performanceService;
