import { getDB } from './indexedDB';

// ==========================================
// TRAINING TYPES
// ==========================================

export const trainingTypeService = {
  generateCode: async () => {
    const db = await getDB();
    const count = await db.count('trainingTypes');
    return `TT-${String(count + 1).padStart(4, '0')}`;
  },

  create: async (data) => {
    const db = await getDB();
    const code = data.code || await trainingTypeService.generateCode();
    const trainingType = {
      ...data,
      code,
      isActive: data.isActive ?? true,
      isMandatory: data.isMandatory ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('trainingTypes', trainingType);
    return { ...trainingType, id };
  },

  getAll: async () => {
    const db = await getDB();
    const items = await db.getAll('trainingTypes');
    return items.sort((a, b) => a.name?.localeCompare(b.name));
  },

  getActive: async () => {
    const db = await getDB();
    const index = db.transaction('trainingTypes').store.index('isActive');
    return await index.getAll(true);
  },

  getById: async (id) => {
    const db = await getDB();
    return await db.get('trainingTypes', id);
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('trainingTypes', id);
    if (!existing) throw new Error('Training type not found');
    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    await db.put('trainingTypes', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('trainingTypes', id);
    return true;
  },

  getByCategory: async (category) => {
    const db = await getDB();
    const index = db.transaction('trainingTypes').store.index('category');
    return await index.getAll(category);
  },

  getMandatory: async () => {
    const db = await getDB();
    const index = db.transaction('trainingTypes').store.index('isMandatory');
    return await index.getAll(true);
  },
};

// ==========================================
// TRAINING PROGRAMS
// ==========================================

export const trainingProgramService = {
  generateCode: async () => {
    const db = await getDB();
    const count = await db.count('trainingPrograms');
    return `TP-${String(count + 1).padStart(4, '0')}`;
  },

  create: async (data) => {
    const db = await getDB();
    const programCode = data.programCode || await trainingProgramService.generateCode();
    const program = {
      ...data,
      programCode,
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('trainingPrograms', program);
    return { ...program, id };
  },

  getAll: async () => {
    const db = await getDB();
    const items = await db.getAll('trainingPrograms');
    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getActive: async () => {
    const db = await getDB();
    const index = db.transaction('trainingPrograms').store.index('isActive');
    return await index.getAll(true);
  },

  getById: async (id) => {
    const db = await getDB();
    return await db.get('trainingPrograms', id);
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('trainingPrograms', id);
    if (!existing) throw new Error('Training program not found');
    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    await db.put('trainingPrograms', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('trainingPrograms', id);
    return true;
  },

  getByType: async (trainingTypeId) => {
    const db = await getDB();
    const index = db.transaction('trainingPrograms').store.index('trainingTypeId');
    return await index.getAll(trainingTypeId);
  },
};

// ==========================================
// TRAINING NEEDS ASSESSMENTS (TNA)
// ==========================================

export const tnaService = {
  generateNumber: async () => {
    const db = await getDB();
    const count = await db.count('trainingNeedsAssessments');
    const year = new Date().getFullYear();
    return `TNA-${year}-${String(count + 1).padStart(4, '0')}`;
  },

  calculateTrainingLevel: (percentageScore) => {
    if (percentageScore <= 20) return 'complete';
    if (percentageScore <= 40) return 'targeted';
    if (percentageScore <= 60) return 'regular';
    if (percentageScore <= 80) return 'refresher';
    return 'expert';
  },

  calculateScores: (data) => {
    const scoreFields = [
      'jobKnowledgeScore', 'qualityOfWorkScore', 'productivityScore',
      'fieldManagementScore', 'localLanguageScore', 'englishScore',
      'communicationScore', 'teamworkScore', 'initiativeScore',
      'publicRelationsScore', 'punctualityScore', 'adaptabilityScore',
      'overallPerformanceScore', 'aapScore', 'pseahScore', 'safeguardingScore',
      'childProtectionScore', 'codeOfConductScore', 'confidentialityScore',
      'policyAdherenceScore', 'conflictManagementScore', 'expertiseScore',
      'commitmentScore', 'sustainabilityScore', 'behaviorScore'
    ];

    const totalScore = scoreFields.reduce((sum, field) => sum + (data[field] || 0), 0);
    const maxScore = 125; // 25 criteria * 5 max
    const percentageScore = Math.round((totalScore / maxScore) * 100);
    const trainingLevel = tnaService.calculateTrainingLevel(percentageScore);

    return { totalScore, maxScore, percentageScore, trainingLevel };
  },

  create: async (data) => {
    const db = await getDB();
    const assessmentNumber = data.assessmentNumber || await tnaService.generateNumber();
    const scores = tnaService.calculateScores(data);

    const tna = {
      ...data,
      ...scores,
      assessmentNumber,
      status: data.status || 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('trainingNeedsAssessments', tna);
    return { ...tna, id };
  },

  getAll: async () => {
    const db = await getDB();
    const items = await db.getAll('trainingNeedsAssessments');
    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getById: async (id) => {
    const db = await getDB();
    return await db.get('trainingNeedsAssessments', id);
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('trainingNeedsAssessments', id);
    if (!existing) throw new Error('TNA not found');

    const scores = tnaService.calculateScores({ ...existing, ...data });
    const updated = {
      ...existing,
      ...data,
      ...scores,
      id,
      updatedAt: new Date().toISOString(),
    };
    await db.put('trainingNeedsAssessments', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('trainingNeedsAssessments', id);
    return true;
  },

  getByEmployee: async (employeeId) => {
    const db = await getDB();
    const index = db.transaction('trainingNeedsAssessments').store.index('employeeId');
    return await index.getAll(employeeId);
  },

  getByStatus: async (status) => {
    const db = await getDB();
    const index = db.transaction('trainingNeedsAssessments').store.index('status');
    return await index.getAll(status);
  },

  getByPeriod: async (period) => {
    const db = await getDB();
    const index = db.transaction('trainingNeedsAssessments').store.index('assessmentPeriod');
    return await index.getAll(period);
  },
};

// ==========================================
// TNA TRAINING NEEDS
// ==========================================

export const tnaTrainingNeedsService = {
  create: async (data) => {
    const db = await getDB();
    const need = {
      ...data,
      status: data.status || 'identified',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('tnaTrainingNeeds', need);
    return { ...need, id };
  },

  getAll: async () => {
    const db = await getDB();
    return await db.getAll('tnaTrainingNeeds');
  },

  getById: async (id) => {
    const db = await getDB();
    return await db.get('tnaTrainingNeeds', id);
  },

  getByTna: async (tnaId) => {
    const db = await getDB();
    const index = db.transaction('tnaTrainingNeeds').store.index('tnaId');
    return await index.getAll(tnaId);
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('tnaTrainingNeeds', id);
    if (!existing) throw new Error('Training need not found');
    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    await db.put('tnaTrainingNeeds', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('tnaTrainingNeeds', id);
    return true;
  },
};

// ==========================================
// TRAINING CALENDAR
// ==========================================

export const trainingCalendarService = {
  create: async (data) => {
    const db = await getDB();
    const entry = {
      ...data,
      status: data.status || 'planned',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('trainingCalendar', entry);
    return { ...entry, id };
  },

  getAll: async () => {
    const db = await getDB();
    const items = await db.getAll('trainingCalendar');
    return items.sort((a, b) => new Date(a.plannedStartDate) - new Date(b.plannedStartDate));
  },

  getById: async (id) => {
    const db = await getDB();
    return await db.get('trainingCalendar', id);
  },

  getByYear: async (fiscalYear) => {
    const db = await getDB();
    const index = db.transaction('trainingCalendar').store.index('fiscalYear');
    return await index.getAll(fiscalYear);
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('trainingCalendar', id);
    if (!existing) throw new Error('Calendar entry not found');
    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    await db.put('trainingCalendar', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('trainingCalendar', id);
    return true;
  },
};

// ==========================================
// TRAINING BUDGET PROPOSALS
// ==========================================

export const trainingBudgetService = {
  generateNumber: async () => {
    const db = await getDB();
    const count = await db.count('trainingBudgetProposals');
    const year = new Date().getFullYear();
    return `TBP-${year}-${String(count + 1).padStart(4, '0')}`;
  },

  calculateTotals: (data) => {
    const subtotal = (parseFloat(data.trainerFees) || 0) +
      (parseFloat(data.materialsCost) || 0) +
      (parseFloat(data.venueCost) || 0) +
      (parseFloat(data.travelAccommodation) || 0) +
      (parseFloat(data.refreshmentsCost) || 0) +
      (parseFloat(data.technologyCost) || 0) +
      (parseFloat(data.miscellaneousCost) || 0);

    const contingencyPercentage = parseFloat(data.contingencyPercentage) || 5;
    const contingencyAmount = subtotal * (contingencyPercentage / 100);
    const totalBudget = subtotal + contingencyAmount;

    return { subtotal, contingencyAmount, totalBudget };
  },

  create: async (data) => {
    const db = await getDB();
    const proposalNumber = data.proposalNumber || await trainingBudgetService.generateNumber();
    const totals = trainingBudgetService.calculateTotals(data);

    const proposal = {
      ...data,
      ...totals,
      proposalNumber,
      status: data.status || 'draft',
      currency: data.currency || 'AFN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('trainingBudgetProposals', proposal);
    return { ...proposal, id };
  },

  getAll: async () => {
    const db = await getDB();
    const items = await db.getAll('trainingBudgetProposals');
    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getById: async (id) => {
    const db = await getDB();
    return await db.get('trainingBudgetProposals', id);
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('trainingBudgetProposals', id);
    if (!existing) throw new Error('Budget proposal not found');

    const totals = trainingBudgetService.calculateTotals({ ...existing, ...data });
    const updated = {
      ...existing,
      ...data,
      ...totals,
      id,
      updatedAt: new Date().toISOString(),
    };
    await db.put('trainingBudgetProposals', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('trainingBudgetProposals', id);
    return true;
  },

  getByStatus: async (status) => {
    const db = await getDB();
    const index = db.transaction('trainingBudgetProposals').store.index('status');
    return await index.getAll(status);
  },
};

// ==========================================
// TRAININGS (SESSIONS/EVENTS)
// ==========================================

export const trainingService = {
  generateCode: async () => {
    const db = await getDB();
    const count = await db.count('trainings');
    const year = new Date().getFullYear();
    return `TRN-${year}-${String(count + 1).padStart(3, '0')}`;
  },

  create: async (data) => {
    const db = await getDB();
    const trainingCode = data.trainingCode || await trainingService.generateCode();

    const training = {
      ...data,
      trainingCode,
      status: data.status || 'draft',
      actualParticipants: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('trainings', training);
    return { ...training, id };
  },

  getAll: async () => {
    const db = await getDB();
    const items = await db.getAll('trainings');
    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getById: async (id) => {
    const db = await getDB();
    return await db.get('trainings', id);
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('trainings', id);
    if (!existing) throw new Error('Training not found');
    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    await db.put('trainings', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('trainings', id);
    return true;
  },

  getByStatus: async (status) => {
    const db = await getDB();
    const index = db.transaction('trainings').store.index('status');
    return await index.getAll(status);
  },

  getUpcoming: async () => {
    const db = await getDB();
    const all = await db.getAll('trainings');
    const today = new Date().toISOString().split('T')[0];
    return all.filter(t => t.startDate >= today && ['scheduled', 'confirmed'].includes(t.status));
  },
};

// ==========================================
// TRAINING PARTICIPANTS
// ==========================================

export const trainingParticipantService = {
  create: async (data) => {
    const db = await getDB();
    const participant = {
      ...data,
      invitationStatus: data.invitationStatus || 'pending',
      attended: false,
      feedbackSubmitted: false,
      certificateEligible: false,
      certificateIssued: false,
      invitedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('trainingParticipants', participant);

    // Update training participant count
    const training = await db.get('trainings', data.trainingId);
    if (training) {
      await db.put('trainings', {
        ...training,
        actualParticipants: (training.actualParticipants || 0) + 1,
        updatedAt: new Date().toISOString(),
      });
    }

    return { ...participant, id };
  },

  getAll: async () => {
    const db = await getDB();
    return await db.getAll('trainingParticipants');
  },

  getById: async (id) => {
    const db = await getDB();
    return await db.get('trainingParticipants', id);
  },

  getByTraining: async (trainingId) => {
    const db = await getDB();
    const index = db.transaction('trainingParticipants').store.index('trainingId');
    return await index.getAll(trainingId);
  },

  getByEmployee: async (employeeId) => {
    const db = await getDB();
    const index = db.transaction('trainingParticipants').store.index('employeeId');
    return await index.getAll(employeeId);
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('trainingParticipants', id);
    if (!existing) throw new Error('Participant not found');
    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    await db.put('trainingParticipants', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    const participant = await db.get('trainingParticipants', id);
    if (participant) {
      // Update training participant count
      const training = await db.get('trainings', participant.trainingId);
      if (training && training.actualParticipants > 0) {
        await db.put('trainings', {
          ...training,
          actualParticipants: training.actualParticipants - 1,
          updatedAt: new Date().toISOString(),
        });
      }
    }
    await db.delete('trainingParticipants', id);
    return true;
  },

  recordAttendance: async (id, attended, attendancePercentage = 100) => {
    const db = await getDB();
    const existing = await db.get('trainingParticipants', id);
    if (!existing) throw new Error('Participant not found');
    const updated = {
      ...existing,
      attended,
      attendancePercentage,
      updatedAt: new Date().toISOString(),
    };
    await db.put('trainingParticipants', updated);
    return updated;
  },

  submitAssessment: async (id, preScore, postScore, passed) => {
    const db = await getDB();
    const existing = await db.get('trainingParticipants', id);
    if (!existing) throw new Error('Participant not found');

    const improvementPercentage = preScore > 0
      ? Math.round(((postScore - preScore) / preScore) * 100)
      : 0;

    const certificateEligible = (existing.attendancePercentage || 0) >= 80 && passed;

    const updated = {
      ...existing,
      preAssessmentScore: preScore,
      postAssessmentScore: postScore,
      improvementPercentage,
      passed,
      certificateEligible,
      updatedAt: new Date().toISOString(),
    };
    await db.put('trainingParticipants', updated);
    return updated;
  },
};

// ==========================================
// TRAINING SESSIONS (Multi-day)
// ==========================================

export const trainingSessionService = {
  create: async (data) => {
    const db = await getDB();
    const session = {
      ...data,
      status: data.status || 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('trainingSessions', session);
    return { ...session, id };
  },

  getAll: async () => {
    const db = await getDB();
    return await db.getAll('trainingSessions');
  },

  getById: async (id) => {
    const db = await getDB();
    return await db.get('trainingSessions', id);
  },

  getByTraining: async (trainingId) => {
    const db = await getDB();
    const index = db.transaction('trainingSessions').store.index('trainingId');
    const sessions = await index.getAll(trainingId);
    return sessions.sort((a, b) => a.sessionNumber - b.sessionNumber);
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('trainingSessions', id);
    if (!existing) throw new Error('Session not found');
    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    await db.put('trainingSessions', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('trainingSessions', id);
    return true;
  },
};

// ==========================================
// TRAINING EVALUATIONS
// ==========================================

export const trainingEvaluationService = {
  create: async (data) => {
    const db = await getDB();
    const evaluation = {
      ...data,
      evaluationDate: data.evaluationDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('trainingEvaluations', evaluation);

    // Update participant feedback status
    if (data.participantId) {
      const participant = await db.get('trainingParticipants', data.participantId);
      if (participant) {
        await db.put('trainingParticipants', {
          ...participant,
          feedbackSubmitted: true,
          feedbackRating: data.overallRating,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return { ...evaluation, id };
  },

  getAll: async () => {
    const db = await getDB();
    return await db.getAll('trainingEvaluations');
  },

  getById: async (id) => {
    const db = await getDB();
    return await db.get('trainingEvaluations', id);
  },

  getByTraining: async (trainingId) => {
    const db = await getDB();
    const index = db.transaction('trainingEvaluations').store.index('trainingId');
    return await index.getAll(trainingId);
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('trainingEvaluations', id);
    if (!existing) throw new Error('Evaluation not found');
    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    await db.put('trainingEvaluations', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('trainingEvaluations', id);
    return true;
  },

  getAverageRatings: async (trainingId) => {
    const db = await getDB();
    const index = db.transaction('trainingEvaluations').store.index('trainingId');
    const evaluations = await index.getAll(trainingId);

    if (evaluations.length === 0) return null;

    const sum = (field) => evaluations.reduce((acc, e) => acc + (e[field] || 0), 0);
    const avg = (field) => Math.round((sum(field) / evaluations.length) * 10) / 10;

    return {
      averageContentRating: avg('contentQualityRating'),
      averageTrainerRating: avg('trainerDeliveryRating'),
      averageOverallRating: avg('overallRating'),
      totalResponses: evaluations.length,
      recommendationRate: Math.round((evaluations.filter(e => e.wouldRecommend).length / evaluations.length) * 100),
    };
  },
};

// ==========================================
// TRAINING CERTIFICATES
// ==========================================

export const trainingCertificateService = {
  generateNumber: async () => {
    const db = await getDB();
    const count = await db.count('trainingCertificates');
    const year = new Date().getFullYear();
    return `CERT-${year}-${String(count + 1).padStart(5, '0')}`;
  },

  create: async (data) => {
    const db = await getDB();
    const certificateNumber = data.certificateNumber || await trainingCertificateService.generateNumber();

    const certificate = {
      ...data,
      certificateNumber,
      status: data.status || 'draft',
      issueDate: data.issueDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('trainingCertificates', certificate);
    return { ...certificate, id };
  },

  getAll: async () => {
    const db = await getDB();
    const items = await db.getAll('trainingCertificates');
    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getById: async (id) => {
    const db = await getDB();
    return await db.get('trainingCertificates', id);
  },

  getByTraining: async (trainingId) => {
    const db = await getDB();
    const index = db.transaction('trainingCertificates').store.index('trainingId');
    return await index.getAll(trainingId);
  },

  getByEmployee: async (employeeId) => {
    const db = await getDB();
    const index = db.transaction('trainingCertificates').store.index('employeeId');
    return await index.getAll(employeeId);
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('trainingCertificates', id);
    if (!existing) throw new Error('Certificate not found');
    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    await db.put('trainingCertificates', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('trainingCertificates', id);
    return true;
  },

  issue: async (id) => {
    const db = await getDB();
    const existing = await db.get('trainingCertificates', id);
    if (!existing) throw new Error('Certificate not found');

    const updated = {
      ...existing,
      status: 'issued',
      issueDate: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    };
    await db.put('trainingCertificates', updated);

    // Update participant certificate status
    if (existing.participantId) {
      const participant = await db.get('trainingParticipants', existing.participantId);
      if (participant) {
        await db.put('trainingParticipants', {
          ...participant,
          certificateIssued: true,
          certificateId: id,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return updated;
  },
};

// ==========================================
// TRAINING BONDS
// ==========================================

export const trainingBondService = {
  generateNumber: async () => {
    const db = await getDB();
    const count = await db.count('trainingBonds');
    const year = new Date().getFullYear();
    return `BOND-${year}-${String(count + 1).padStart(4, '0')}`;
  },

  create: async (data) => {
    const db = await getDB();
    const bondNumber = data.bondNumber || await trainingBondService.generateNumber();

    const bond = {
      ...data,
      bondNumber,
      status: data.status || 'draft',
      currency: data.currency || 'AFN',
      employeeSigned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('trainingBonds', bond);
    return { ...bond, id };
  },

  getAll: async () => {
    const db = await getDB();
    const items = await db.getAll('trainingBonds');
    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getById: async (id) => {
    const db = await getDB();
    return await db.get('trainingBonds', id);
  },

  getByEmployee: async (employeeId) => {
    const db = await getDB();
    const index = db.transaction('trainingBonds').store.index('employeeId');
    return await index.getAll(employeeId);
  },

  getByStatus: async (status) => {
    const db = await getDB();
    const index = db.transaction('trainingBonds').store.index('status');
    return await index.getAll(status);
  },

  getActive: async () => {
    return await trainingBondService.getByStatus('active');
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('trainingBonds', id);
    if (!existing) throw new Error('Bond not found');
    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    await db.put('trainingBonds', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('trainingBonds', id);
    return true;
  },

  sign: async (id) => {
    const db = await getDB();
    const existing = await db.get('trainingBonds', id);
    if (!existing) throw new Error('Bond not found');

    const updated = {
      ...existing,
      employeeSigned: true,
      employeeSignedAt: new Date().toISOString(),
      status: 'signed',
      updatedAt: new Date().toISOString(),
    };
    await db.put('trainingBonds', updated);
    return updated;
  },

  activate: async (id) => {
    const db = await getDB();
    const existing = await db.get('trainingBonds', id);
    if (!existing) throw new Error('Bond not found');

    const updated = {
      ...existing,
      status: 'active',
      updatedAt: new Date().toISOString(),
    };
    await db.put('trainingBonds', updated);
    return updated;
  },

  calculateRecovery: (bond, terminationDate) => {
    const startDate = new Date(bond.bondStartDate);
    const endDate = new Date(bond.bondEndDate);
    const termDate = new Date(terminationDate);

    const totalMonths = bond.bondDurationMonths;
    const servedMonths = Math.floor((termDate - startDate) / (1000 * 60 * 60 * 24 * 30));
    const remainingMonths = Math.max(0, totalMonths - servedMonths);

    const recoveryAmount = (bond.trainingCost / totalMonths) * remainingMonths;

    return {
      totalMonths,
      servedMonths,
      remainingMonths,
      recoveryAmount: Math.round(recoveryAmount * 100) / 100,
    };
  },
};

// ==========================================
// EMPLOYEE TRAINING HISTORY
// ==========================================

export const employeeTrainingHistoryService = {
  create: async (data) => {
    const db = await getDB();
    const history = {
      ...data,
      isExternal: data.isExternal ?? false,
      certificateObtained: data.certificateObtained ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('employeeTrainingHistory', history);
    return { ...history, id };
  },

  getAll: async () => {
    const db = await getDB();
    return await db.getAll('employeeTrainingHistory');
  },

  getById: async (id) => {
    const db = await getDB();
    return await db.get('employeeTrainingHistory', id);
  },

  getByEmployee: async (employeeId) => {
    const db = await getDB();
    const index = db.transaction('employeeTrainingHistory').store.index('employeeId');
    const items = await index.getAll(employeeId);
    return items.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('employeeTrainingHistory', id);
    if (!existing) throw new Error('Training history not found');
    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    await db.put('employeeTrainingHistory', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('employeeTrainingHistory', id);
    return true;
  },
};

// ==========================================
// TRAINING REPORTS
// ==========================================

export const trainingReportService = {
  generateNumber: async () => {
    const db = await getDB();
    const count = await db.count('trainingReports');
    const year = new Date().getFullYear();
    return `TRPT-${year}-${String(count + 1).padStart(4, '0')}`;
  },

  create: async (data) => {
    const db = await getDB();
    const reportNumber = data.reportNumber || await trainingReportService.generateNumber();

    const report = {
      ...data,
      reportNumber,
      status: data.status || 'draft',
      reportDate: data.reportDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('trainingReports', report);
    return { ...report, id };
  },

  getAll: async () => {
    const db = await getDB();
    const items = await db.getAll('trainingReports');
    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getById: async (id) => {
    const db = await getDB();
    return await db.get('trainingReports', id);
  },

  getByTraining: async (trainingId) => {
    const db = await getDB();
    const index = db.transaction('trainingReports').store.index('trainingId');
    return await index.getAll(trainingId);
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('trainingReports', id);
    if (!existing) throw new Error('Report not found');
    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    await db.put('trainingReports', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('trainingReports', id);
    return true;
  },

  generateFromTraining: async (trainingId) => {
    const db = await getDB();
    const training = await db.get('trainings', trainingId);
    if (!training) throw new Error('Training not found');

    const participants = await trainingParticipantService.getByTraining(trainingId);
    const evaluations = await trainingEvaluationService.getByTraining(trainingId);
    const evalRatings = await trainingEvaluationService.getAverageRatings(trainingId);

    const attended = participants.filter(p => p.attended);
    const passed = participants.filter(p => p.passed);

    const avgPreScore = attended.length > 0
      ? attended.reduce((sum, p) => sum + (p.preAssessmentScore || 0), 0) / attended.length
      : 0;
    const avgPostScore = attended.length > 0
      ? attended.reduce((sum, p) => sum + (p.postAssessmentScore || 0), 0) / attended.length
      : 0;

    const reportData = {
      trainingId,
      totalInvited: participants.length,
      totalAttended: attended.length,
      attendanceRate: participants.length > 0 ? Math.round((attended.length / participants.length) * 100) : 0,
      averagePreScore: Math.round(avgPreScore * 10) / 10,
      averagePostScore: Math.round(avgPostScore * 10) / 10,
      averageImprovement: Math.round((avgPostScore - avgPreScore) * 10) / 10,
      passRate: attended.length > 0 ? Math.round((passed.length / attended.length) * 100) : 0,
      ...evalRatings,
    };

    return await trainingReportService.create(reportData);
  },
};

// ==========================================
// DASHBOARD STATISTICS
// ==========================================

export const trainingDashboardService = {
  getStats: async () => {
    const db = await getDB();

    const [trainings, tnas, budgets, certificates, bonds] = await Promise.all([
      db.getAll('trainings'),
      db.getAll('trainingNeedsAssessments'),
      db.getAll('trainingBudgetProposals'),
      db.getAll('trainingCertificates'),
      db.getAll('trainingBonds'),
    ]);

    const today = new Date().toISOString().split('T')[0];
    const currentYear = new Date().getFullYear();
    const thisYearTrainings = trainings.filter(t => t.startDate?.startsWith(currentYear));

    return {
      totalTrainings: trainings.length,
      upcomingTrainings: trainings.filter(t => t.startDate >= today && ['scheduled', 'confirmed'].includes(t.status)).length,
      completedTrainings: trainings.filter(t => t.status === 'completed').length,
      inProgressTrainings: trainings.filter(t => t.status === 'in_progress').length,
      totalTNAs: tnas.length,
      pendingTNAs: tnas.filter(t => t.status === 'draft' || t.status === 'submitted').length,
      totalBudgetProposals: budgets.length,
      pendingBudgets: budgets.filter(b => b.status === 'submitted').length,
      approvedBudgets: budgets.filter(b => b.status === 'approved').length,
      totalCertificates: certificates.length,
      issuedCertificates: certificates.filter(c => c.status === 'issued').length,
      activeBonds: bonds.filter(b => b.status === 'active').length,
      thisYearTrainings: thisYearTrainings.length,
      thisYearCompleted: thisYearTrainings.filter(t => t.status === 'completed').length,
    };
  },

  getRecentTrainings: async (limit = 5) => {
    const trainings = await trainingService.getAll();
    return trainings.slice(0, limit);
  },

  getUpcomingTrainings: async (limit = 5) => {
    const upcoming = await trainingService.getUpcoming();
    return upcoming.slice(0, limit);
  },
};
