import { openDB } from 'idb';

const DB_NAME = 'vdo-erp-db';
const DB_VERSION = 33; // Synchronized version across all services

// Get database connection
const getDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      console.log(`IndexedDB: Upgrading from v${oldVersion} to v${newVersion} for Disciplinary Module`);

      // ========== DISCIPLINARY MODULE STORES ==========

      // Misconduct Reports store
      if (!db.objectStoreNames.contains('misconductReports')) {
        const store = db.createObjectStore('misconductReports', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('reportNumber', 'reportNumber', { unique: true });
        store.createIndex('accusedEmployeeId', 'accusedEmployeeId', { unique: false });
        store.createIndex('reportSource', 'reportSource', { unique: false });
        store.createIndex('misconductCategory', 'misconductCategory', { unique: false });
        store.createIndex('misconductType', 'misconductType', { unique: false });
        store.createIndex('severityLevel', 'severityLevel', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('reportDate', 'reportDate', { unique: false });
      }

      // Misconduct Evidence store
      if (!db.objectStoreNames.contains('misconductEvidence')) {
        const store = db.createObjectStore('misconductEvidence', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('reportId', 'reportId', { unique: false });
        store.createIndex('investigationId', 'investigationId', { unique: false });
        store.createIndex('evidenceType', 'evidenceType', { unique: false });
      }

      // Investigations store
      if (!db.objectStoreNames.contains('disciplinaryInvestigations')) {
        const store = db.createObjectStore('disciplinaryInvestigations', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('investigationNumber', 'investigationNumber', { unique: true });
        store.createIndex('reportId', 'reportId', { unique: false });
        store.createIndex('accusedEmployeeId', 'accusedEmployeeId', { unique: false });
        store.createIndex('investigationType', 'investigationType', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('leadInvestigatorId', 'leadInvestigatorId', { unique: false });
      }

      // Investigation Interviews store
      if (!db.objectStoreNames.contains('investigationInterviews')) {
        const store = db.createObjectStore('investigationInterviews', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('investigationId', 'investigationId', { unique: false });
        store.createIndex('interviewType', 'interviewType', { unique: false });
        store.createIndex('interviewDate', 'interviewDate', { unique: false });
      }

      // Precautionary Suspensions store
      if (!db.objectStoreNames.contains('precautionarySuspensions')) {
        const store = db.createObjectStore('precautionarySuspensions', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('employeeId', 'employeeId', { unique: false });
        store.createIndex('reportId', 'reportId', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('suspensionType', 'suspensionType', { unique: false });
      }

      // Disciplinary Actions store
      if (!db.objectStoreNames.contains('disciplinaryActions')) {
        const store = db.createObjectStore('disciplinaryActions', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('actionNumber', 'actionNumber', { unique: true });
        store.createIndex('employeeId', 'employeeId', { unique: false });
        store.createIndex('actionType', 'actionType', { unique: false });
        store.createIndex('actionLevel', 'actionLevel', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('issueDate', 'issueDate', { unique: false });
        store.createIndex('expiryDate', 'expiryDate', { unique: false });
      }

      // Disciplinary Appeals store
      if (!db.objectStoreNames.contains('disciplinaryAppeals')) {
        const store = db.createObjectStore('disciplinaryAppeals', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('appealNumber', 'appealNumber', { unique: true });
        store.createIndex('disciplinaryActionId', 'disciplinaryActionId', { unique: false });
        store.createIndex('employeeId', 'employeeId', { unique: false });
        store.createIndex('status', 'status', { unique: false });
      }

      // Employee Warning History store
      if (!db.objectStoreNames.contains('employeeWarningHistory')) {
        const store = db.createObjectStore('employeeWarningHistory', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('employeeId', 'employeeId', { unique: false });
        store.createIndex('warningType', 'warningType', { unique: false });
        store.createIndex('isActive', 'isActive', { unique: false });
        store.createIndex('expiryDate', 'expiryDate', { unique: false });
      }

      // Grievances store
      if (!db.objectStoreNames.contains('employeeGrievances')) {
        const store = db.createObjectStore('employeeGrievances', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('grievanceNumber', 'grievanceNumber', { unique: true });
        store.createIndex('employeeId', 'employeeId', { unique: false });
        store.createIndex('grievanceType', 'grievanceType', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('assignedTo', 'assignedTo', { unique: false });
      }

      // Compliance Incidents store
      if (!db.objectStoreNames.contains('complianceIncidents')) {
        const store = db.createObjectStore('complianceIncidents', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('incidentNumber', 'incidentNumber', { unique: true });
        store.createIndex('reportId', 'reportId', { unique: false });
        store.createIndex('incidentType', 'incidentType', { unique: false });
        store.createIndex('severity', 'severity', { unique: false });
        store.createIndex('status', 'status', { unique: false });
      }

      // Case Notes store
      if (!db.objectStoreNames.contains('misconductCaseNotes')) {
        const store = db.createObjectStore('misconductCaseNotes', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('caseType', 'caseType', { unique: false });
        store.createIndex('caseId', 'caseId', { unique: false });
        store.createIndex('noteType', 'noteType', { unique: false });
      }
    },
  });
};

// Helper to create standard CRUD operations
const createCRUD = (storeName) => ({
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const record = { ...data, createdAt: now, updatedAt: now };
    const id = await db.add(storeName, record);
    return { ...record, id };
  },

  getAll: async () => {
    const db = await getDB();
    return db.getAll(storeName);
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get(storeName, Number(id));
  },

  getByIndex: async (indexName, value) => {
    const db = await getDB();
    return db.getAllFromIndex(storeName, indexName, value);
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get(storeName, Number(id));
    if (!existing) throw new Error(`Record not found in ${storeName}`);
    const updated = { ...existing, ...data, id: Number(id), updatedAt: new Date().toISOString() };
    await db.put(storeName, updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete(storeName, Number(id));
    return true;
  },
});

// ========== MISCONDUCT REPORTS ==========
export const misconductReportsDB = {
  ...createCRUD('misconductReports'),

  generateReportNumber: async () => {
    const db = await getDB();
    const all = await db.getAll('misconductReports');
    const year = new Date().getFullYear();
    const count = all.filter(r => r.reportNumber?.startsWith(`MIS-${year}`)).length + 1;
    return `MIS-${year}-${String(count).padStart(3, '0')}`;
  },

  getByStatus: async (status) => {
    const db = await getDB();
    return db.getAllFromIndex('misconductReports', 'status', status);
  },

  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('misconductReports', 'accusedEmployeeId', Number(employeeId));
  },

  getByCategory: async (category) => {
    const db = await getDB();
    return db.getAllFromIndex('misconductReports', 'misconductCategory', category);
  },

  assess: async (id, assessmentData) => {
    const db = await getDB();
    const report = await db.get('misconductReports', Number(id));
    if (!report) throw new Error('Report not found');
    const updated = {
      ...report,
      ...assessmentData,
      status: assessmentData.status || 'assessing',
      assessedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put('misconductReports', updated);
    return updated;
  },
};

// ========== MISCONDUCT EVIDENCE ==========
export const misconductEvidenceDB = {
  ...createCRUD('misconductEvidence'),

  getByReport: async (reportId) => {
    const db = await getDB();
    return db.getAllFromIndex('misconductEvidence', 'reportId', Number(reportId));
  },

  getByInvestigation: async (investigationId) => {
    const db = await getDB();
    return db.getAllFromIndex('misconductEvidence', 'investigationId', Number(investigationId));
  },
};

// ========== INVESTIGATIONS ==========
export const investigationsDB = {
  ...createCRUD('disciplinaryInvestigations'),

  generateInvestigationNumber: async () => {
    const db = await getDB();
    const all = await db.getAll('disciplinaryInvestigations');
    const year = new Date().getFullYear();
    const count = all.filter(r => r.investigationNumber?.startsWith(`INV-${year}`)).length + 1;
    return `INV-${year}-${String(count).padStart(3, '0')}`;
  },

  getByStatus: async (status) => {
    const db = await getDB();
    return db.getAllFromIndex('disciplinaryInvestigations', 'status', status);
  },

  getByReport: async (reportId) => {
    const db = await getDB();
    return db.getAllFromIndex('disciplinaryInvestigations', 'reportId', Number(reportId));
  },

  start: async (id) => {
    const db = await getDB();
    const investigation = await db.get('disciplinaryInvestigations', Number(id));
    if (!investigation) throw new Error('Investigation not found');
    investigation.status = 'in_progress';
    investigation.startDate = new Date().toISOString().split('T')[0];
    investigation.updatedAt = new Date().toISOString();
    await db.put('disciplinaryInvestigations', investigation);
    return investigation;
  },

  complete: async (id, findings) => {
    const db = await getDB();
    const investigation = await db.get('disciplinaryInvestigations', Number(id));
    if (!investigation) throw new Error('Investigation not found');
    Object.assign(investigation, {
      ...findings,
      status: 'completed',
      actualEndDate: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    });
    await db.put('disciplinaryInvestigations', investigation);
    return investigation;
  },
};

// ========== INVESTIGATION INTERVIEWS ==========
export const investigationInterviewsDB = {
  ...createCRUD('investigationInterviews'),

  getByInvestigation: async (investigationId) => {
    const db = await getDB();
    return db.getAllFromIndex('investigationInterviews', 'investigationId', Number(investigationId));
  },
};

// ========== PRECAUTIONARY SUSPENSIONS ==========
export const suspensionsDB = {
  ...createCRUD('precautionarySuspensions'),

  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('precautionarySuspensions', 'employeeId', Number(employeeId));
  },

  getActive: async () => {
    const db = await getDB();
    return db.getAllFromIndex('precautionarySuspensions', 'status', 'active');
  },

  lift: async (id, notes) => {
    const db = await getDB();
    const suspension = await db.get('precautionarySuspensions', Number(id));
    if (!suspension) throw new Error('Suspension not found');
    suspension.status = 'lifted';
    suspension.actualEndDate = new Date().toISOString().split('T')[0];
    suspension.outcomeNotes = notes;
    suspension.updatedAt = new Date().toISOString();
    await db.put('precautionarySuspensions', suspension);
    return suspension;
  },
};

// ========== DISCIPLINARY ACTIONS ==========
export const disciplinaryActionsDB = {
  ...createCRUD('disciplinaryActions'),

  generateActionNumber: async () => {
    const db = await getDB();
    const all = await db.getAll('disciplinaryActions');
    const year = new Date().getFullYear();
    const count = all.filter(r => r.actionNumber?.startsWith(`DA-${year}`)).length + 1;
    return `DA-${year}-${String(count).padStart(3, '0')}`;
  },

  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('disciplinaryActions', 'employeeId', Number(employeeId));
  },

  getByStatus: async (status) => {
    const db = await getDB();
    return db.getAllFromIndex('disciplinaryActions', 'status', status);
  },

  getActiveWarnings: async (employeeId) => {
    const db = await getDB();
    const actions = await db.getAllFromIndex('disciplinaryActions', 'employeeId', Number(employeeId));
    const today = new Date().toISOString().split('T')[0];
    return actions.filter(a =>
      ['verbal_warning', 'first_written_warning', 'final_written_warning'].includes(a.actionType) &&
      a.status === 'acknowledged' &&
      (!a.expiryDate || a.expiryDate >= today)
    );
  },

  issue: async (id) => {
    const db = await getDB();
    const action = await db.get('disciplinaryActions', Number(id));
    if (!action) throw new Error('Action not found');
    action.status = 'issued';
    action.issueDate = new Date().toISOString().split('T')[0];
    action.updatedAt = new Date().toISOString();
    await db.put('disciplinaryActions', action);
    return action;
  },

  acknowledge: async (id) => {
    const db = await getDB();
    const action = await db.get('disciplinaryActions', Number(id));
    if (!action) throw new Error('Action not found');
    action.employeeAcknowledged = true;
    action.employeeAcknowledgedAt = new Date().toISOString();
    action.status = 'acknowledged';
    action.updatedAt = new Date().toISOString();
    await db.put('disciplinaryActions', action);
    return action;
  },
};

// ========== APPEALS ==========
export const appealsDB = {
  ...createCRUD('disciplinaryAppeals'),

  generateAppealNumber: async () => {
    const db = await getDB();
    const all = await db.getAll('disciplinaryAppeals');
    const year = new Date().getFullYear();
    const count = all.filter(r => r.appealNumber?.startsWith(`APL-${year}`)).length + 1;
    return `APL-${year}-${String(count).padStart(3, '0')}`;
  },

  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('disciplinaryAppeals', 'employeeId', Number(employeeId));
  },

  getByStatus: async (status) => {
    const db = await getDB();
    return db.getAllFromIndex('disciplinaryAppeals', 'status', status);
  },

  decide: async (id, decision) => {
    const db = await getDB();
    const appeal = await db.get('disciplinaryAppeals', Number(id));
    if (!appeal) throw new Error('Appeal not found');
    Object.assign(appeal, {
      ...decision,
      status: 'decided',
      decisionDate: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    });
    await db.put('disciplinaryAppeals', appeal);
    return appeal;
  },
};

// ========== WARNING HISTORY ==========
export const warningHistoryDB = {
  ...createCRUD('employeeWarningHistory'),

  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('employeeWarningHistory', 'employeeId', Number(employeeId));
  },

  getActiveByEmployee: async (employeeId) => {
    const db = await getDB();
    const history = await db.getAllFromIndex('employeeWarningHistory', 'employeeId', Number(employeeId));
    const today = new Date().toISOString().split('T')[0];
    return history.filter(w => w.isActive && (!w.expiryDate || w.expiryDate >= today));
  },

  expireWarnings: async () => {
    const db = await getDB();
    const all = await db.getAll('employeeWarningHistory');
    const today = new Date().toISOString().split('T')[0];
    const expired = all.filter(w => w.isActive && w.expiryDate && w.expiryDate < today);
    for (const warning of expired) {
      warning.isActive = false;
      warning.expiredAt = new Date().toISOString();
      await db.put('employeeWarningHistory', warning);
    }
    return expired.length;
  },
};

// ========== GRIEVANCES ==========
export const grievancesDB = {
  ...createCRUD('employeeGrievances'),

  generateGrievanceNumber: async () => {
    const db = await getDB();
    const all = await db.getAll('employeeGrievances');
    const year = new Date().getFullYear();
    const count = all.filter(r => r.grievanceNumber?.startsWith(`GRV-${year}`)).length + 1;
    return `GRV-${year}-${String(count).padStart(3, '0')}`;
  },

  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('employeeGrievances', 'employeeId', Number(employeeId));
  },

  getByStatus: async (status) => {
    const db = await getDB();
    return db.getAllFromIndex('employeeGrievances', 'status', status);
  },

  resolve: async (id, resolution) => {
    const db = await getDB();
    const grievance = await db.get('employeeGrievances', Number(id));
    if (!grievance) throw new Error('Grievance not found');
    Object.assign(grievance, {
      ...resolution,
      status: 'resolved',
      resolutionDate: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    });
    await db.put('employeeGrievances', grievance);
    return grievance;
  },
};

// ========== COMPLIANCE INCIDENTS ==========
export const complianceIncidentsDB = {
  ...createCRUD('complianceIncidents'),

  generateIncidentNumber: async () => {
    const db = await getDB();
    const all = await db.getAll('complianceIncidents');
    const year = new Date().getFullYear();
    const count = all.filter(r => r.incidentNumber?.startsWith(`ZT-${year}`)).length + 1;
    return `ZT-${year}-${String(count).padStart(3, '0')}`;
  },

  getByType: async (type) => {
    const db = await getDB();
    return db.getAllFromIndex('complianceIncidents', 'incidentType', type);
  },

  getByStatus: async (status) => {
    const db = await getDB();
    return db.getAllFromIndex('complianceIncidents', 'status', status);
  },
};

// ========== CASE NOTES ==========
export const caseNotesDB = {
  ...createCRUD('misconductCaseNotes'),

  getByCase: async (caseType, caseId) => {
    const db = await getDB();
    const notes = await db.getAll('misconductCaseNotes');
    return notes.filter(n => n.caseType === caseType && n.caseId === Number(caseId));
  },
};

// ========== SEED DEFAULT DATA ==========
export const seedDisciplinaryDefaults = async () => {
  const db = await getDB();

  // Seed sample misconduct reports
  const reports = await db.getAll('misconductReports');
  if (reports.length === 0) {
    const sampleReports = [
      {
        reportNumber: 'MIS-2024-001',
        reportDate: '2024-11-15',
        reportSource: 'supervisor',
        reporterId: 1,
        isAnonymous: false,
        accusedEmployeeId: 3,
        accusedEmployeeName: 'Mohammad Karimi',
        accusedDepartment: 'Operations',
        incidentDate: '2024-11-14',
        incidentLocation: 'Kabul Office',
        incidentDescription: 'Employee was found to be consistently late for work over the past two weeks without valid justification.',
        misconductCategory: 'minor',
        misconductType: 'attendance',
        severityLevel: 'low',
        immediateActionRequired: false,
        status: 'received',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        reportNumber: 'MIS-2024-002',
        reportDate: '2024-11-20',
        reportSource: 'hr',
        reporterId: 2,
        isAnonymous: false,
        accusedEmployeeId: 5,
        accusedEmployeeName: 'Ali Mohammadi',
        accusedDepartment: 'IT',
        incidentDate: '2024-11-19',
        incidentLocation: 'Server Room',
        incidentDescription: 'Violation of IT security policy by sharing admin credentials with unauthorized personnel.',
        misconductCategory: 'misconduct',
        misconductType: 'policy_violation',
        severityLevel: 'medium',
        immediateActionRequired: false,
        status: 'assessing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const report of sampleReports) {
      await db.add('misconductReports', report);
    }
    console.log('Seeded sample misconduct reports');
  }

  // Seed sample disciplinary actions
  const actions = await db.getAll('disciplinaryActions');
  if (actions.length === 0) {
    const sampleActions = [
      {
        actionNumber: 'DA-2024-001',
        employeeId: 3,
        employeeName: 'Mohammad Karimi',
        department: 'Operations',
        actionType: 'verbal_warning',
        actionLevel: 1,
        issueDate: '2024-10-01',
        effectiveDate: '2024-10-01',
        expiryDate: '2025-01-01',
        misconductDescription: 'Multiple instances of tardiness in September 2024.',
        expectedImprovement: 'Arrive at work on time consistently for the next 3 months.',
        consequencesIfRepeated: 'Further disciplinary action up to and including written warning.',
        employeeAcknowledged: true,
        employeeAcknowledgedAt: '2024-10-02T10:30:00Z',
        issuedBy: 'HR Manager',
        status: 'acknowledged',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const action of sampleActions) {
      await db.add('disciplinaryActions', action);
    }
    console.log('Seeded sample disciplinary actions');
  }

  // Seed sample grievances
  const grievances = await db.getAll('employeeGrievances');
  if (grievances.length === 0) {
    const sampleGrievances = [
      {
        grievanceNumber: 'GRV-2024-001',
        employeeId: 2,
        employeeName: 'Fatima Ahmadi',
        department: 'Finance',
        grievanceDate: '2024-11-10',
        grievanceType: 'workplace',
        description: 'Request for improved office heating system as current temperature affects productivity.',
        desiredResolution: 'Installation of better heating system or provision of space heaters.',
        assignedTo: 'Admin Manager',
        status: 'submitted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const grievance of sampleGrievances) {
      await db.add('employeeGrievances', grievance);
    }
    console.log('Seeded sample grievances');
  }
};

// Initialize database
export const initDisciplinaryDB = async () => {
  await getDB();
  await seedDisciplinaryDefaults();
  console.log('Disciplinary DB initialized');
};

export default {
  misconductReportsDB,
  misconductEvidenceDB,
  investigationsDB,
  investigationInterviewsDB,
  suspensionsDB,
  disciplinaryActionsDB,
  appealsDB,
  warningHistoryDB,
  grievancesDB,
  complianceIncidentsDB,
  caseNotesDB,
  initDisciplinaryDB,
  seedDisciplinaryDefaults,
};
