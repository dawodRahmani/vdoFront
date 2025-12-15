import { openDB } from 'idb';

const DB_NAME = 'vdo-erp-db';
const DB_VERSION = 33; // Synchronized version across all services

// Get database connection
const getDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      console.log(`IndexedDB: Upgrading from v${oldVersion} to v${newVersion} for Employee Admin`);

      // ========== EMPLOYEE ADMINISTRATION MODULE ==========

      // Emergency Contacts store
      if (!db.objectStoreNames.contains('emergencyContacts')) {
        const store = db.createObjectStore('emergencyContacts', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('employeeId', 'employeeId', { unique: false });
        store.createIndex('relationship', 'relationship', { unique: false });
        store.createIndex('isPrimary', 'isPrimary', { unique: false });
      }

      // Employee Education store
      if (!db.objectStoreNames.contains('employeeEducation')) {
        const store = db.createObjectStore('employeeEducation', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('employeeId', 'employeeId', { unique: false });
        store.createIndex('level', 'level', { unique: false });
        store.createIndex('isVerified', 'isVerified', { unique: false });
      }

      // Employee Experience store
      if (!db.objectStoreNames.contains('employeeExperience')) {
        const store = db.createObjectStore('employeeExperience', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('employeeId', 'employeeId', { unique: false });
        store.createIndex('isVerified', 'isVerified', { unique: false });
      }

      // Employee Skills store
      if (!db.objectStoreNames.contains('employeeSkills')) {
        const store = db.createObjectStore('employeeSkills', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('employeeId', 'employeeId', { unique: false });
        store.createIndex('skillType', 'skillType', { unique: false });
        store.createIndex('proficiency', 'proficiency', { unique: false });
      }

      // Employee Medical Info store
      if (!db.objectStoreNames.contains('employeeMedical')) {
        const store = db.createObjectStore('employeeMedical', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('employeeId', 'employeeId', { unique: true });
        store.createIndex('bloodType', 'bloodType', { unique: false });
      }

      // Personnel Files store
      if (!db.objectStoreNames.contains('personnelFiles')) {
        const store = db.createObjectStore('personnelFiles', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('employeeId', 'employeeId', { unique: true });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('lastAuditDate', 'lastAuditDate', { unique: false });
      }

      // Personnel Documents store
      if (!db.objectStoreNames.contains('personnelDocuments')) {
        const store = db.createObjectStore('personnelDocuments', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('personnelFileId', 'personnelFileId', { unique: false });
        store.createIndex('section', 'section', { unique: false });
        store.createIndex('documentType', 'documentType', { unique: false });
        store.createIndex('isVerified', 'isVerified', { unique: false });
      }

      // Onboarding Checklists store
      if (!db.objectStoreNames.contains('onboardingChecklists')) {
        const store = db.createObjectStore('onboardingChecklists', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('employeeId', 'employeeId', { unique: true });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('startDate', 'startDate', { unique: false });
        store.createIndex('completedDate', 'completedDate', { unique: false });
      }

      // Onboarding Items store
      if (!db.objectStoreNames.contains('onboardingItems')) {
        const store = db.createObjectStore('onboardingItems', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('checklistId', 'checklistId', { unique: false });
        store.createIndex('section', 'section', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('assignedTo', 'assignedTo', { unique: false });
      }

      // Policy Acknowledgements store
      if (!db.objectStoreNames.contains('policyAcknowledgements')) {
        const store = db.createObjectStore('policyAcknowledgements', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('employeeId', 'employeeId', { unique: false });
        store.createIndex('policyName', 'policyName', { unique: false });
        store.createIndex('acknowledgedDate', 'acknowledgedDate', { unique: false });
        store.createIndex('version', 'version', { unique: false });
      }

      // Interim Hiring Requests store
      if (!db.objectStoreNames.contains('interimHiringRequests')) {
        const store = db.createObjectStore('interimHiringRequests', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('requestNumber', 'requestNumber', { unique: true });
        store.createIndex('department', 'department', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('requestedBy', 'requestedBy', { unique: false });
        store.createIndex('requestDate', 'requestDate', { unique: false });
        store.createIndex('urgency', 'urgency', { unique: false });
      }

      // Interim Hiring Approvals store
      if (!db.objectStoreNames.contains('interimHiringApprovals')) {
        const store = db.createObjectStore('interimHiringApprovals', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('requestId', 'requestId', { unique: false });
        store.createIndex('level', 'level', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('approvedBy', 'approvedBy', { unique: false });
        store.createIndex('approvalDate', 'approvalDate', { unique: false });
      }

      // Mahram Registrations store
      if (!db.objectStoreNames.contains('mahramRegistrations')) {
        const store = db.createObjectStore('mahramRegistrations', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('employeeId', 'employeeId', { unique: false });
        store.createIndex('mahramName', 'mahramName', { unique: false });
        store.createIndex('relationship', 'relationship', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('availability', 'availability', { unique: false });
        store.createIndex('isVerified', 'isVerified', { unique: false });
      }

      // Employee Status History store
      if (!db.objectStoreNames.contains('employeeStatusHistory')) {
        const store = db.createObjectStore('employeeStatusHistory', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('employeeId', 'employeeId', { unique: false });
        store.createIndex('fromStatus', 'fromStatus', { unique: false });
        store.createIndex('toStatus', 'toStatus', { unique: false });
        store.createIndex('changedAt', 'changedAt', { unique: false });
        store.createIndex('changedBy', 'changedBy', { unique: false });
      }
    },
  });
};

// Helper to create standard CRUD operations
const createCRUD = (storeName) => ({
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const record = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };
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
    if (!existing) {
      throw new Error(`Record not found in ${storeName}`);
    }
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };
    await db.put(storeName, updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete(storeName, Number(id));
    return true;
  },
});

// ========== EMPLOYEE ADMINISTRATION DATABASE OPERATIONS ==========

// Emergency Contacts
export const emergencyContactsDB = {
  ...createCRUD('emergencyContacts'),

  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('emergencyContacts', 'employeeId', Number(employeeId));
  },
};

// Employee Education
export const employeeEducationDB = {
  ...createCRUD('employeeEducation'),

  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('employeeEducation', 'employeeId', Number(employeeId));
  },

  verify: async (id) => {
    const db = await getDB();
    const record = await db.get('employeeEducation', Number(id));
    if (record) {
      record.isVerified = true;
      record.verifiedAt = new Date().toISOString();
      await db.put('employeeEducation', record);
    }
    return record;
  },
};

// Employee Experience
export const employeeExperienceDB = {
  ...createCRUD('employeeExperience'),

  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('employeeExperience', 'employeeId', Number(employeeId));
  },

  verify: async (id) => {
    const db = await getDB();
    const record = await db.get('employeeExperience', Number(id));
    if (record) {
      record.isVerified = true;
      record.verifiedAt = new Date().toISOString();
      await db.put('employeeExperience', record);
    }
    return record;
  },
};

// Employee Skills
export const employeeSkillsDB = {
  ...createCRUD('employeeSkills'),

  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('employeeSkills', 'employeeId', Number(employeeId));
  },
};

// Employee Medical Info
export const employeeMedicalDB = {
  ...createCRUD('employeeMedical'),

  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getFromIndex('employeeMedical', 'employeeId', Number(employeeId));
  },
};

// Personnel Files
export const personnelFilesDB = {
  ...createCRUD('personnelFiles'),

  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getFromIndex('personnelFiles', 'employeeId', Number(employeeId));
  },
};

// Personnel Documents
export const personnelDocumentsDB = {
  ...createCRUD('personnelDocuments'),

  getByPersonnelFile: async (personnelFileId) => {
    const db = await getDB();
    return db.getAllFromIndex('personnelDocuments', 'personnelFileId', Number(personnelFileId));
  },

  getBySection: async (section) => {
    const db = await getDB();
    return db.getAllFromIndex('personnelDocuments', 'section', section);
  },
};

// Onboarding Checklists
export const onboardingChecklistsDB = {
  ...createCRUD('onboardingChecklists'),

  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getFromIndex('onboardingChecklists', 'employeeId', Number(employeeId));
  },

  getByStatus: async (status) => {
    const db = await getDB();
    return db.getAllFromIndex('onboardingChecklists', 'status', status);
  },

  complete: async (id) => {
    const db = await getDB();
    const checklist = await db.get('onboardingChecklists', Number(id));
    if (checklist) {
      checklist.status = 'completed';
      checklist.completedDate = new Date().toISOString();
      await db.put('onboardingChecklists', checklist);
    }
    return checklist;
  },
};

// Onboarding Items
export const onboardingItemsDB = {
  ...createCRUD('onboardingItems'),

  getByChecklist: async (checklistId) => {
    const db = await getDB();
    return db.getAllFromIndex('onboardingItems', 'checklistId', Number(checklistId));
  },

  getBySection: async (section) => {
    const db = await getDB();
    return db.getAllFromIndex('onboardingItems', 'section', section);
  },

  complete: async (id) => {
    const db = await getDB();
    const item = await db.get('onboardingItems', Number(id));
    if (item) {
      item.status = 'completed';
      item.completedAt = new Date().toISOString();
      await db.put('onboardingItems', item);
    }
    return item;
  },
};

// Policy Acknowledgements
export const policyAcknowledgementsDB = {
  ...createCRUD('policyAcknowledgements'),

  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('policyAcknowledgements', 'employeeId', Number(employeeId));
  },

  acknowledge: async (employeeId, policyName, version) => {
    const db = await getDB();
    const record = {
      employeeId: Number(employeeId),
      policyName,
      version,
      acknowledgedDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('policyAcknowledgements', record);
    return { ...record, id };
  },
};

// Interim Hiring Requests
export const interimHiringRequestsDB = {
  ...createCRUD('interimHiringRequests'),

  getByStatus: async (status) => {
    const db = await getDB();
    return db.getAllFromIndex('interimHiringRequests', 'status', status);
  },

  getByDepartment: async (department) => {
    const db = await getDB();
    return db.getAllFromIndex('interimHiringRequests', 'department', department);
  },

  generateRequestNumber: async () => {
    const db = await getDB();
    const all = await db.getAll('interimHiringRequests');
    const year = new Date().getFullYear();
    const count = all.filter(r => r.requestNumber?.startsWith(`IHR-${year}`)).length + 1;
    return `IHR-${year}-${String(count).padStart(4, '0')}`;
  },
};

// Interim Hiring Approvals
export const interimHiringApprovalsDB = {
  ...createCRUD('interimHiringApprovals'),

  getByRequest: async (requestId) => {
    const db = await getDB();
    return db.getAllFromIndex('interimHiringApprovals', 'requestId', Number(requestId));
  },

  approve: async (requestId, level, approvedBy, comments) => {
    const db = await getDB();
    const record = {
      requestId: Number(requestId),
      level,
      status: 'approved',
      approvedBy,
      comments,
      approvalDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('interimHiringApprovals', record);
    return { ...record, id };
  },

  reject: async (requestId, level, rejectedBy, reason) => {
    const db = await getDB();
    const record = {
      requestId: Number(requestId),
      level,
      status: 'rejected',
      approvedBy: rejectedBy,
      comments: reason,
      approvalDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('interimHiringApprovals', record);
    return { ...record, id };
  },
};

// Mahram Registrations
export const mahramRegistrationsDB = {
  ...createCRUD('mahramRegistrations'),

  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('mahramRegistrations', 'employeeId', Number(employeeId));
  },

  getActive: async () => {
    const db = await getDB();
    return db.getAllFromIndex('mahramRegistrations', 'status', 'active');
  },

  verify: async (id) => {
    const db = await getDB();
    const record = await db.get('mahramRegistrations', Number(id));
    if (record) {
      record.isVerified = true;
      record.verifiedAt = new Date().toISOString();
      await db.put('mahramRegistrations', record);
    }
    return record;
  },

  deactivate: async (id, reason) => {
    const db = await getDB();
    const record = await db.get('mahramRegistrations', Number(id));
    if (record) {
      record.status = 'inactive';
      record.deactivationReason = reason;
      record.deactivatedAt = new Date().toISOString();
      await db.put('mahramRegistrations', record);
    }
    return record;
  },
};

// Employee Status History
export const employeeStatusHistoryDB = {
  ...createCRUD('employeeStatusHistory'),

  getByEmployee: async (employeeId) => {
    const db = await getDB();
    const history = await db.getAllFromIndex('employeeStatusHistory', 'employeeId', Number(employeeId));
    return history.sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt));
  },

  record: async (employeeId, fromStatus, toStatus, changedBy, reason) => {
    const db = await getDB();
    const record = {
      employeeId: Number(employeeId),
      fromStatus,
      toStatus,
      changedBy,
      reason,
      changedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const id = await db.add('employeeStatusHistory', record);
    return { ...record, id };
  },
};

// ========== SEED DEFAULT DATA ==========

export const seedEmployeeAdminDefaults = async () => {
  const db = await getDB();

  // Seed sample employees if none exist
  const employees = await db.getAll('employees');
  if (employees.length === 0) {
    const sampleEmployees = [
      {
        employeeId: 'EMP001',
        firstName: 'Ahmad',
        lastName: 'Rahimi',
        email: 'ahmad.rahimi@vdo.org',
        phone: '+93 700 123 456',
        department: 'Programs',
        position: 'Program Manager',
        office: 'Kabul',
        status: 'active',
        employmentType: 'core',
        gender: 'male',
        hireDate: '2022-03-15',
        dateOfBirth: '1990-05-20',
        nationality: 'Afghan',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        employeeId: 'EMP002',
        firstName: 'Fatima',
        lastName: 'Ahmadi',
        email: 'fatima.ahmadi@vdo.org',
        phone: '+93 700 234 567',
        department: 'Finance',
        position: 'Finance Officer',
        office: 'Kabul',
        status: 'active',
        employmentType: 'core',
        gender: 'female',
        hireDate: '2021-06-01',
        dateOfBirth: '1988-08-15',
        nationality: 'Afghan',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        employeeId: 'EMP003',
        firstName: 'Mohammad',
        lastName: 'Karimi',
        email: 'mohammad.karimi@vdo.org',
        phone: '+93 700 345 678',
        department: 'Operations',
        position: 'Logistics Coordinator',
        office: 'Herat',
        status: 'active',
        employmentType: 'project',
        gender: 'male',
        hireDate: '2023-01-10',
        dateOfBirth: '1992-11-25',
        nationality: 'Afghan',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        employeeId: 'EMP004',
        firstName: 'Zahra',
        lastName: 'Noori',
        email: 'zahra.noori@vdo.org',
        phone: '+93 700 456 789',
        department: 'HR',
        position: 'HR Assistant',
        office: 'Kabul',
        status: 'probation',
        employmentType: 'core',
        gender: 'female',
        hireDate: '2024-10-01',
        dateOfBirth: '1995-03-10',
        nationality: 'Afghan',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        employeeId: 'EMP005',
        firstName: 'Ali',
        lastName: 'Mohammadi',
        email: 'ali.mohammadi@vdo.org',
        phone: '+93 700 567 890',
        department: 'IT',
        position: 'IT Specialist',
        office: 'Mazar-i-Sharif',
        status: 'active',
        employmentType: 'core',
        gender: 'male',
        hireDate: '2022-08-20',
        dateOfBirth: '1993-07-05',
        nationality: 'Afghan',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const emp of sampleEmployees) {
      await db.add('employees', emp);
    }
    console.log('Seeded sample employees');
  }

  // Seed departments if none exist
  const departments = await db.getAll('departments');
  if (departments.length === 0) {
    const sampleDepartments = [
      { name: 'Programs', code: 'PRG', description: 'Program Management', isActive: true },
      { name: 'Finance', code: 'FIN', description: 'Finance & Accounting', isActive: true },
      { name: 'Operations', code: 'OPS', description: 'Operations & Logistics', isActive: true },
      { name: 'HR', code: 'HRM', description: 'Human Resources', isActive: true },
      { name: 'IT', code: 'ITC', description: 'Information Technology', isActive: true },
      { name: 'Admin', code: 'ADM', description: 'Administration', isActive: true },
    ];

    for (const dept of sampleDepartments) {
      await db.add('departments', { ...dept, createdAt: new Date().toISOString() });
    }
    console.log('Seeded sample departments');
  }

  // Seed offices if none exist
  const offices = await db.getAll('offices');
  if (offices.length === 0) {
    const sampleOffices = [
      { name: 'Kabul', code: 'KBL', type: 'main', isActive: true },
      { name: 'Herat', code: 'HRT', type: 'regional', isActive: true },
      { name: 'Mazar-i-Sharif', code: 'MZR', type: 'regional', isActive: true },
      { name: 'Kandahar', code: 'KDH', type: 'regional', isActive: true },
      { name: 'Jalalabad', code: 'JLB', type: 'field', isActive: true },
    ];

    for (const office of sampleOffices) {
      await db.add('offices', { ...office, createdAt: new Date().toISOString() });
    }
    console.log('Seeded sample offices');
  }
};

// Initialize database and seed defaults
export const initEmployeeAdminDB = async () => {
  await getDB();
  await seedEmployeeAdminDefaults();
  console.log('Employee Administration DB initialized');
};

export default {
  emergencyContactsDB,
  employeeEducationDB,
  employeeExperienceDB,
  employeeSkillsDB,
  employeeMedicalDB,
  personnelFilesDB,
  personnelDocumentsDB,
  onboardingChecklistsDB,
  onboardingItemsDB,
  policyAcknowledgementsDB,
  interimHiringRequestsDB,
  interimHiringApprovalsDB,
  mahramRegistrationsDB,
  employeeStatusHistoryDB,
  initEmployeeAdminDB,
  seedEmployeeAdminDefaults,
};
