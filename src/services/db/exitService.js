import { getDB } from './indexedDB';

// ============================================
// SEPARATION SERVICE
// ============================================
export const separationService = {
  generateNumber: async () => {
    const db = await getDB();
    const count = await db.count('separationRecords');
    const year = new Date().getFullYear();
    return `SEP-${year}-${String(count + 1).padStart(5, '0')}`;
  },

  create: async (data) => {
    const db = await getDB();
    const separationNumber = await separationService.generateNumber();
    const now = new Date().toISOString();

    const separation = {
      ...data,
      separationNumber,
      status: data.status || 'pending_approval',
      createdAt: now,
      updatedAt: now,
    };

    const id = await db.add('separationRecords', separation);

    // Add to history
    await separationHistoryService.create({
      separationId: id,
      fromStatus: null,
      toStatus: 'pending_approval',
      changedBy: data.createdBy || 'system',
      changeReason: 'Separation initiated',
    });

    return { ...separation, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let separations = await db.getAll('separationRecords');

    if (filters.status) {
      separations = separations.filter(s => s.status === filters.status);
    }
    if (filters.separationType) {
      separations = separations.filter(s => s.separationType === filters.separationType);
    }
    if (filters.employeeId) {
      separations = separations.filter(s => s.employeeId === filters.employeeId);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      separations = separations.filter(s =>
        s.separationNumber?.toLowerCase().includes(searchLower) ||
        s.employeeName?.toLowerCase().includes(searchLower)
      );
    }

    separations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return separations;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('separationRecords', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('separationRecords', Number(id));
    if (!existing) throw new Error('Separation not found');

    const oldStatus = existing.status;
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };

    await db.put('separationRecords', updated);

    // Track status change
    if (data.status && data.status !== oldStatus) {
      await separationHistoryService.create({
        separationId: id,
        fromStatus: oldStatus,
        toStatus: data.status,
        changedBy: data.updatedBy || 'system',
        changeReason: data.statusChangeReason || '',
      });
    }

    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('separationRecords', Number(id));
    return true;
  },

  approve: async (id, approvedBy, comments = '') => {
    return separationService.update(id, {
      status: 'approved',
      approvedBy,
      approvedAt: new Date().toISOString(),
      approvalComments: comments,
      updatedBy: approvedBy,
      statusChangeReason: 'Separation approved',
    });
  },

  reject: async (id, rejectedBy, comments = '') => {
    return separationService.update(id, {
      status: 'rejected',
      approvedBy: rejectedBy,
      approvedAt: new Date().toISOString(),
      approvalComments: comments,
      updatedBy: rejectedBy,
      statusChangeReason: 'Separation rejected',
    });
  },

  startClearance: async (id, userId) => {
    return separationService.update(id, {
      status: 'clearance_pending',
      updatedBy: userId,
      statusChangeReason: 'Clearance process started',
    });
  },

  getStatistics: async () => {
    const db = await getDB();
    const separations = await db.getAll('separationRecords');

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);

    return {
      total: separations.length,
      pendingApproval: separations.filter(s => s.status === 'pending_approval').length,
      approved: separations.filter(s => s.status === 'approved').length,
      inClearance: separations.filter(s => s.status === 'clearance_pending').length,
      completed: separations.filter(s => s.status === 'completed').length,
      thisMonth: separations.filter(s => new Date(s.createdAt) >= thisMonth).length,
      thisYear: separations.filter(s => new Date(s.createdAt) >= thisYear).length,
      byType: {
        resignation: separations.filter(s => s.separationType === 'resignation').length,
        contractExpiry: separations.filter(s => s.separationType === 'contract_expiry').length,
        termination: separations.filter(s => s.separationType === 'termination_with_cause' || s.separationType === 'termination_without_cause').length,
        retirement: separations.filter(s => s.separationType === 'retirement').length,
      },
    };
  },
};

// ============================================
// CLEARANCE SERVICE
// ============================================
export const clearanceService = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();

    const clearance = {
      ...data,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    const id = await db.add('exitClearances', clearance);
    return { ...clearance, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let clearances = await db.getAll('exitClearances');

    if (filters.separationId) {
      clearances = clearances.filter(c => c.separationId === filters.separationId);
    }
    if (filters.departmentId) {
      clearances = clearances.filter(c => c.departmentId === filters.departmentId);
    }
    if (filters.status) {
      clearances = clearances.filter(c => c.status === filters.status);
    }

    return clearances;
  },

  getBySeparation: async (separationId) => {
    const db = await getDB();
    const clearances = await db.getAll('exitClearances');
    return clearances.filter(c => c.separationId === Number(separationId));
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('exitClearances', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('exitClearances', Number(id));
    if (!existing) throw new Error('Clearance not found');

    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };

    await db.put('exitClearances', updated);
    return updated;
  },

  markCleared: async (id, clearedBy, remarks = '') => {
    return clearanceService.update(id, {
      status: 'cleared',
      clearedBy,
      clearanceDate: new Date().toISOString(),
      remarks,
    });
  },

  markIssues: async (id, outstandingItems, outstandingAmount = 0) => {
    return clearanceService.update(id, {
      status: 'issues_found',
      outstandingItems,
      outstandingAmount,
    });
  },

  initializeClearances: async (separationId) => {
    const db = await getDB();
    const departments = await db.getAll('exitClearanceDepartments');

    const clearances = [];
    for (const dept of departments.filter(d => d.isActive)) {
      const clearance = await clearanceService.create({
        separationId: Number(separationId),
        departmentId: dept.id,
        departmentName: dept.name,
        status: 'pending',
      });
      clearances.push(clearance);
    }

    return clearances;
  },

  checkAllCleared: async (separationId) => {
    const clearances = await clearanceService.getBySeparation(separationId);
    return clearances.every(c => c.status === 'cleared');
  },
};

// ============================================
// CLEARANCE ITEMS SERVICE
// ============================================
export const clearanceItemService = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();

    const item = {
      ...data,
      isReturned: false,
      createdAt: now,
      updatedAt: now,
    };

    const id = await db.add('clearanceItems', item);
    return { ...item, id };
  },

  getByClearance: async (clearanceId) => {
    const db = await getDB();
    const items = await db.getAll('clearanceItems');
    return items.filter(i => i.clearanceId === Number(clearanceId));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('clearanceItems', Number(id));
    if (!existing) throw new Error('Clearance item not found');

    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };

    await db.put('clearanceItems', updated);
    return updated;
  },

  markReturned: async (id, condition, receivedBy, damageAmount = 0) => {
    return clearanceItemService.update(id, {
      isReturned: true,
      returnCondition: condition,
      returnDate: new Date().toISOString(),
      receivedBy,
      damageAmount,
    });
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('clearanceItems', Number(id));
    return true;
  },
};

// ============================================
// EXIT INTERVIEW SERVICE
// ============================================
export const exitInterviewService = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();

    const interview = {
      ...data,
      status: data.status || 'scheduled',
      createdAt: now,
      updatedAt: now,
    };

    const id = await db.add('exitInterviews', interview);
    return { ...interview, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let interviews = await db.getAll('exitInterviews');

    if (filters.separationId) {
      interviews = interviews.filter(i => i.separationId === filters.separationId);
    }
    if (filters.status) {
      interviews = interviews.filter(i => i.status === filters.status);
    }
    if (filters.interviewerId) {
      interviews = interviews.filter(i => i.interviewerId === filters.interviewerId);
    }

    interviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return interviews;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('exitInterviews', Number(id));
  },

  getBySeparation: async (separationId) => {
    const db = await getDB();
    const interviews = await db.getAll('exitInterviews');
    return interviews.find(i => i.separationId === Number(separationId));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('exitInterviews', Number(id));
    if (!existing) throw new Error('Exit interview not found');

    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };

    await db.put('exitInterviews', updated);
    return updated;
  },

  complete: async (id, ratings) => {
    // Calculate average rating
    const ratingFields = Object.keys(ratings).filter(k => k.startsWith('rating_'));
    const avgRating = ratingFields.reduce((sum, key) => sum + (ratings[key] || 0), 0) / ratingFields.length;

    return exitInterviewService.update(id, {
      ...ratings,
      overallRatingAverage: avgRating.toFixed(2),
      status: 'completed',
    });
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('exitInterviews', Number(id));
    return true;
  },

  getStatistics: async () => {
    const db = await getDB();
    const interviews = await db.getAll('exitInterviews');

    const completed = interviews.filter(i => i.status === 'completed');
    const avgRating = completed.length > 0
      ? completed.reduce((sum, i) => sum + parseFloat(i.overallRatingAverage || 0), 0) / completed.length
      : 0;

    return {
      total: interviews.length,
      scheduled: interviews.filter(i => i.status === 'scheduled').length,
      completed: completed.length,
      declined: interviews.filter(i => i.status === 'declined').length,
      averageRating: avgRating.toFixed(2),
    };
  },
};

// ============================================
// EXIT COMPLIANCE CHECK SERVICE
// ============================================
export const complianceCheckService = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();

    const check = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    const id = await db.add('exitComplianceChecks', check);
    return { ...check, id };
  },

  getByInterview: async (exitInterviewId) => {
    const db = await getDB();
    const checks = await db.getAll('exitComplianceChecks');
    return checks.filter(c => c.exitInterviewId === Number(exitInterviewId));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('exitComplianceChecks', Number(id));
    if (!existing) throw new Error('Compliance check not found');

    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };

    await db.put('exitComplianceChecks', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('exitComplianceChecks', Number(id));
    return true;
  },
};

// ============================================
// FINAL SETTLEMENT SERVICE
// ============================================
export const settlementService = {
  generateNumber: async () => {
    const db = await getDB();
    const count = await db.count('finalSettlements');
    const year = new Date().getFullYear();
    return `SET-${year}-${String(count + 1).padStart(5, '0')}`;
  },

  create: async (data) => {
    const db = await getDB();
    const settlementNumber = await settlementService.generateNumber();
    const now = new Date().toISOString();

    const settlement = {
      ...data,
      settlementNumber,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };

    const id = await db.add('finalSettlements', settlement);
    return { ...settlement, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let settlements = await db.getAll('finalSettlements');

    if (filters.status) {
      settlements = settlements.filter(s => s.status === filters.status);
    }
    if (filters.separationId) {
      settlements = settlements.filter(s => s.separationId === filters.separationId);
    }
    if (filters.employeeId) {
      settlements = settlements.filter(s => s.employeeId === filters.employeeId);
    }

    settlements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return settlements;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('finalSettlements', Number(id));
  },

  getBySeparation: async (separationId) => {
    const db = await getDB();
    const settlements = await db.getAll('finalSettlements');
    return settlements.find(s => s.separationId === Number(separationId));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('finalSettlements', Number(id));
    if (!existing) throw new Error('Settlement not found');

    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };

    await db.put('finalSettlements', updated);
    return updated;
  },

  calculate: async (id, earnings, deductions) => {
    const totalEarnings = Object.values(earnings).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
    const totalDeductions = Object.values(deductions).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
    const netPayable = totalEarnings - totalDeductions;

    return settlementService.update(id, {
      ...earnings,
      ...deductions,
      totalEarnings,
      totalDeductions,
      netPayable,
      calculationDate: new Date().toISOString(),
      status: 'pending_hr',
    });
  },

  hrVerify: async (id, verifiedBy) => {
    return settlementService.update(id, {
      hrVerified: true,
      hrVerifiedBy: verifiedBy,
      hrVerifiedAt: new Date().toISOString(),
      status: 'pending_finance',
    });
  },

  financeVerify: async (id, verifiedBy) => {
    return settlementService.update(id, {
      financeVerified: true,
      financeVerifiedBy: verifiedBy,
      financeVerifiedAt: new Date().toISOString(),
      status: 'pending_approval',
    });
  },

  approve: async (id, approvedBy) => {
    return settlementService.update(id, {
      approvedBy,
      approvedAt: new Date().toISOString(),
      status: 'approved',
    });
  },

  markPaid: async (id, paymentData) => {
    const settlement = await settlementService.update(id, {
      status: 'paid',
      paymentDate: new Date().toISOString(),
    });

    // Create payment record
    await settlementPaymentService.create({
      settlementId: id,
      ...paymentData,
    });

    return settlement;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('finalSettlements', Number(id));
    return true;
  },

  getStatistics: async () => {
    const db = await getDB();
    const settlements = await db.getAll('finalSettlements');

    const paid = settlements.filter(s => s.status === 'paid');
    const totalPaid = paid.reduce((sum, s) => sum + (parseFloat(s.netPayable) || 0), 0);

    return {
      total: settlements.length,
      draft: settlements.filter(s => s.status === 'draft').length,
      pendingHR: settlements.filter(s => s.status === 'pending_hr').length,
      pendingFinance: settlements.filter(s => s.status === 'pending_finance').length,
      pendingApproval: settlements.filter(s => s.status === 'pending_approval').length,
      approved: settlements.filter(s => s.status === 'approved').length,
      paid: paid.length,
      totalAmountPaid: totalPaid,
    };
  },
};

// ============================================
// SETTLEMENT PAYMENT SERVICE
// ============================================
export const settlementPaymentService = {
  generateReference: async () => {
    const db = await getDB();
    const count = await db.count('settlementPayments');
    const year = new Date().getFullYear();
    return `PAY-${year}-${String(count + 1).padStart(5, '0')}`;
  },

  create: async (data) => {
    const db = await getDB();
    const paymentReference = await settlementPaymentService.generateReference();
    const now = new Date().toISOString();

    const payment = {
      ...data,
      paymentReference,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    const id = await db.add('settlementPayments', payment);
    return { ...payment, id };
  },

  getBySettlement: async (settlementId) => {
    const db = await getDB();
    const payments = await db.getAll('settlementPayments');
    return payments.filter(p => p.settlementId === Number(settlementId));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('settlementPayments', Number(id));
    if (!existing) throw new Error('Payment not found');

    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };

    await db.put('settlementPayments', updated);
    return updated;
  },

  process: async (id, processedBy) => {
    return settlementPaymentService.update(id, {
      status: 'processed',
      processedBy,
      paymentDate: new Date().toISOString(),
    });
  },

  verify: async (id, verifiedBy) => {
    return settlementPaymentService.update(id, {
      status: 'verified',
      verifiedBy,
    });
  },
};

// ============================================
// WORK CERTIFICATE SERVICE
// ============================================
export const workCertificateService = {
  generateNumber: async () => {
    const db = await getDB();
    const count = await db.count('workCertificates');
    const year = new Date().getFullYear();
    return `CERT-${year}-${String(count + 1).padStart(5, '0')}`;
  },

  create: async (data) => {
    const db = await getDB();
    const certificateNumber = await workCertificateService.generateNumber();
    const now = new Date().toISOString();

    const certificate = {
      ...data,
      certificateNumber,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };

    const id = await db.add('workCertificates', certificate);
    return { ...certificate, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let certificates = await db.getAll('workCertificates');

    if (filters.status) {
      certificates = certificates.filter(c => c.status === filters.status);
    }
    if (filters.employeeId) {
      certificates = certificates.filter(c => c.employeeId === filters.employeeId);
    }
    if (filters.certificateType) {
      certificates = certificates.filter(c => c.certificateType === filters.certificateType);
    }

    certificates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return certificates;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('workCertificates', Number(id));
  },

  getBySeparation: async (separationId) => {
    const db = await getDB();
    const certificates = await db.getAll('workCertificates');
    return certificates.find(c => c.separationId === Number(separationId));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('workCertificates', Number(id));
    if (!existing) throw new Error('Certificate not found');

    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };

    await db.put('workCertificates', updated);
    return updated;
  },

  issue: async (id, issuedBy) => {
    return workCertificateService.update(id, {
      status: 'issued',
      issuedBy,
      issueDate: new Date().toISOString(),
    });
  },

  revoke: async (id, reason) => {
    return workCertificateService.update(id, {
      status: 'revoked',
      revokeReason: reason,
      revokedAt: new Date().toISOString(),
    });
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('workCertificates', Number(id));
    return true;
  },

  getStatistics: async () => {
    const db = await getDB();
    const certificates = await db.getAll('workCertificates');

    return {
      total: certificates.length,
      draft: certificates.filter(c => c.status === 'draft').length,
      issued: certificates.filter(c => c.status === 'issued').length,
      revoked: certificates.filter(c => c.status === 'revoked').length,
    };
  },
};

// ============================================
// TERMINATION RECORD SERVICE
// ============================================
export const terminationRecordService = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();

    const record = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    const id = await db.add('terminationRecords', record);
    return { ...record, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let records = await db.getAll('terminationRecords');

    if (filters.causeCategory) {
      records = records.filter(r => r.causeCategory === filters.causeCategory);
    }
    if (filters.terminationType) {
      records = records.filter(r => r.terminationType === filters.terminationType);
    }

    records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return records;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('terminationRecords', Number(id));
  },

  getBySeparation: async (separationId) => {
    const db = await getDB();
    const records = await db.getAll('terminationRecords');
    return records.find(r => r.separationId === Number(separationId));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('terminationRecords', Number(id));
    if (!existing) throw new Error('Termination record not found');

    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };

    await db.put('terminationRecords', updated);
    return updated;
  },

  recordAppeal: async (id, appealOutcome) => {
    return terminationRecordService.update(id, {
      appealReceived: true,
      appealOutcome,
    });
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('terminationRecords', Number(id));
    return true;
  },
};

// ============================================
// HANDOVER SERVICE
// ============================================
export const handoverService = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();

    const handover = {
      ...data,
      status: 'pending',
      supervisorVerified: false,
      createdAt: now,
      updatedAt: now,
    };

    const id = await db.add('handoverRecords', handover);
    return { ...handover, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let handovers = await db.getAll('handoverRecords');

    if (filters.separationId) {
      handovers = handovers.filter(h => h.separationId === filters.separationId);
    }
    if (filters.status) {
      handovers = handovers.filter(h => h.status === filters.status);
    }

    handovers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return handovers;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('handoverRecords', Number(id));
  },

  getBySeparation: async (separationId) => {
    const db = await getDB();
    const handovers = await db.getAll('handoverRecords');
    return handovers.find(h => h.separationId === Number(separationId));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('handoverRecords', Number(id));
    if (!existing) throw new Error('Handover not found');

    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };

    await db.put('handoverRecords', updated);
    return updated;
  },

  verify: async (id, supervisorId) => {
    return handoverService.update(id, {
      status: 'completed',
      supervisorVerified: true,
      supervisorVerifiedAt: new Date().toISOString(),
      supervisorVerifiedBy: supervisorId,
    });
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('handoverRecords', Number(id));
    return true;
  },
};

// ============================================
// HANDOVER ITEM SERVICE
// ============================================
export const handoverItemService = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();

    const item = {
      ...data,
      handoverStatus: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    const id = await db.add('handoverItems', item);
    return { ...item, id };
  },

  getByHandover: async (handoverId) => {
    const db = await getDB();
    const items = await db.getAll('handoverItems');
    return items.filter(i => i.handoverId === Number(handoverId));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('handoverItems', Number(id));
    if (!existing) throw new Error('Handover item not found');

    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };

    await db.put('handoverItems', updated);
    return updated;
  },

  markComplete: async (id) => {
    return handoverItemService.update(id, {
      handoverStatus: 'completed',
      handoverDate: new Date().toISOString(),
    });
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('handoverItems', Number(id));
    return true;
  },
};

// ============================================
// SEPARATION HISTORY SERVICE
// ============================================
export const separationHistoryService = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();

    const history = {
      ...data,
      changedAt: now,
      createdAt: now,
    };

    const id = await db.add('separationHistory', history);
    return { ...history, id };
  },

  getBySeparation: async (separationId) => {
    const db = await getDB();
    const history = await db.getAll('separationHistory');
    return history
      .filter(h => h.separationId === Number(separationId))
      .sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt));
  },
};

// ============================================
// EXIT DASHBOARD SERVICE
// ============================================
export const exitDashboardService = {
  getOverview: async () => {
    const [separationStats, settlementStats, certificateStats, interviewStats] = await Promise.all([
      separationService.getStatistics(),
      settlementService.getStatistics(),
      workCertificateService.getStatistics(),
      exitInterviewService.getStatistics(),
    ]);

    return {
      separations: separationStats,
      settlements: settlementStats,
      certificates: certificateStats,
      interviews: interviewStats,
    };
  },

  getPendingActions: async () => {
    const db = await getDB();

    const [separations, clearances, settlements, certificates] = await Promise.all([
      db.getAll('separationRecords'),
      db.getAll('exitClearances'),
      db.getAll('finalSettlements'),
      db.getAll('workCertificates'),
    ]);

    return {
      pendingApprovals: separations.filter(s => s.status === 'pending_approval'),
      pendingClearances: clearances.filter(c => c.status === 'pending'),
      pendingSettlements: settlements.filter(s => ['pending_hr', 'pending_finance', 'pending_approval'].includes(s.status)),
      pendingCertificates: certificates.filter(c => c.status === 'draft'),
    };
  },

  getRecentActivity: async (limit = 10) => {
    const db = await getDB();
    const history = await db.getAll('separationHistory');
    return history
      .sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt))
      .slice(0, limit);
  },
};

// ============================================
// CLEARANCE DEPARTMENT SERVICE
// ============================================
export const clearanceDepartmentService = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();

    const dept = {
      ...data,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const id = await db.add('exitClearanceDepartments', dept);
    return { ...dept, id };
  },

  getAll: async () => {
    const db = await getDB();
    const depts = await db.getAll('exitClearanceDepartments');
    return depts.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('exitClearanceDepartments', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('exitClearanceDepartments', Number(id));
    if (!existing) throw new Error('Clearance department not found');

    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };

    await db.put('exitClearanceDepartments', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('exitClearanceDepartments', Number(id));
    return true;
  },

  seedDefaults: async () => {
    const db = await getDB();
    const existing = await db.count('exitClearanceDepartments');
    if (existing > 0) return;

    const defaults = [
      { name: 'ICT Department', sequence: 1, isRequired: true },
      { name: 'Admin & Logistics', sequence: 2, isRequired: true },
      { name: 'Finance Department', sequence: 3, isRequired: true },
      { name: 'Supervisor/Department', sequence: 4, isRequired: true },
      { name: 'HR Department', sequence: 5, isRequired: true },
      { name: 'Security', sequence: 6, isRequired: false },
    ];

    for (const dept of defaults) {
      await clearanceDepartmentService.create(dept);
    }
  },
};

// ============================================
// SEPARATION TYPE SERVICE
// ============================================
export const separationTypeService = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();

    const type = {
      ...data,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const id = await db.add('separationTypes', type);
    return { ...type, id };
  },

  getAll: async () => {
    const db = await getDB();
    const types = await db.getAll('separationTypes');
    return types.filter(t => t.isActive !== false);
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('separationTypes', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('separationTypes', Number(id));
    if (!existing) throw new Error('Separation type not found');

    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };

    await db.put('separationTypes', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('separationTypes', Number(id));
    return true;
  },

  seedDefaults: async () => {
    const db = await getDB();
    const existing = await db.count('separationTypes');
    if (existing > 0) return;

    const defaults = [
      { name: 'Resignation', category: 'voluntary', noticePeriodDays: 30, eligibleForCertificate: true },
      { name: 'Contract Expiry', category: 'natural', noticePeriodDays: 0, eligibleForCertificate: true },
      { name: 'Project End', category: 'natural', noticePeriodDays: 0, eligibleForCertificate: true },
      { name: 'Termination Without Cause', category: 'involuntary', noticePeriodDays: 30, eligibleForCertificate: true },
      { name: 'Termination With Cause', category: 'involuntary', noticePeriodDays: 0, eligibleForCertificate: false },
      { name: 'Probation Not Passed', category: 'involuntary', noticePeriodDays: 0, eligibleForCertificate: false },
      { name: 'Retirement', category: 'voluntary', noticePeriodDays: 30, eligibleForCertificate: true },
    ];

    for (const type of defaults) {
      await separationTypeService.create(type);
    }
  },
};

// Initialize defaults
export const initializeExitModule = async () => {
  await separationTypeService.seedDefaults();
  await clearanceDepartmentService.seedDefaults();
};
