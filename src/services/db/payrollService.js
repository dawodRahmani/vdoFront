import { openDB } from 'idb';

const DB_NAME = 'vdo-erp-db';
const DB_VERSION = 33; // Synchronized version across all services

// Get database connection
const getDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      console.log(`IndexedDB: Upgrading from v${oldVersion} to v${newVersion} for Payroll Module`);

      // ========== PAYROLL MODULE STORES ==========

      // Payroll Periods store
      if (!db.objectStoreNames.contains('payrollPeriods')) {
        const store = db.createObjectStore('payrollPeriods', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('periodCode', 'periodCode', { unique: true });
        store.createIndex('year', 'year', { unique: false });
        store.createIndex('month', 'month', { unique: false });
        store.createIndex('status', 'status', { unique: false });
      }

      // Salary Structures store
      if (!db.objectStoreNames.contains('salaryStructures')) {
        const store = db.createObjectStore('salaryStructures', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('componentCode', 'componentCode', { unique: true });
        store.createIndex('componentType', 'componentType', { unique: false });
        store.createIndex('isActive', 'isActive', { unique: false });
      }

      // Employee Salary Details store
      if (!db.objectStoreNames.contains('employeeSalaryDetails')) {
        const store = db.createObjectStore('employeeSalaryDetails', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('employeeId', 'employeeId', { unique: false });
        store.createIndex('isCurrent', 'isCurrent', { unique: false });
      }

      // Employee Allowances store
      if (!db.objectStoreNames.contains('employeeAllowances')) {
        const store = db.createObjectStore('employeeAllowances', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('employeeId', 'employeeId', { unique: false });
        store.createIndex('salaryComponentId', 'salaryComponentId', { unique: false });
        store.createIndex('isActive', 'isActive', { unique: false });
      }

      // Payroll Entries store
      if (!db.objectStoreNames.contains('payrollEntries')) {
        const store = db.createObjectStore('payrollEntries', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('payrollPeriodId', 'payrollPeriodId', { unique: false });
        store.createIndex('employeeId', 'employeeId', { unique: false });
        store.createIndex('status', 'status', { unique: false });
      }

      // Salary Advances store
      if (!db.objectStoreNames.contains('salaryAdvances')) {
        const store = db.createObjectStore('salaryAdvances', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('advanceNumber', 'advanceNumber', { unique: true });
        store.createIndex('employeeId', 'employeeId', { unique: false });
        store.createIndex('status', 'status', { unique: false });
      }

      // Advance Repayments store
      if (!db.objectStoreNames.contains('advanceRepayments')) {
        const store = db.createObjectStore('advanceRepayments', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('advanceId', 'advanceId', { unique: false });
        store.createIndex('payrollEntryId', 'payrollEntryId', { unique: false });
      }

      // Employee Loans store
      if (!db.objectStoreNames.contains('employeeLoans')) {
        const store = db.createObjectStore('employeeLoans', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('loanNumber', 'loanNumber', { unique: true });
        store.createIndex('employeeId', 'employeeId', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('loanType', 'loanType', { unique: false });
      }

      // Loan Repayments store
      if (!db.objectStoreNames.contains('loanRepayments')) {
        const store = db.createObjectStore('loanRepayments', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('loanId', 'loanId', { unique: false });
        store.createIndex('payrollEntryId', 'payrollEntryId', { unique: false });
      }

      // Overtime Records store
      if (!db.objectStoreNames.contains('overtimeRecords')) {
        const store = db.createObjectStore('overtimeRecords', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('employeeId', 'employeeId', { unique: false });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('overtimeType', 'overtimeType', { unique: false });
      }

      // Payslips store
      if (!db.objectStoreNames.contains('payslips')) {
        const store = db.createObjectStore('payslips', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('payslipNumber', 'payslipNumber', { unique: true });
        store.createIndex('payrollEntryId', 'payrollEntryId', { unique: false });
        store.createIndex('employeeId', 'employeeId', { unique: false });
        store.createIndex('periodMonth', 'periodMonth', { unique: false });
        store.createIndex('periodYear', 'periodYear', { unique: false });
      }

      // Bank Transfers store
      if (!db.objectStoreNames.contains('bankTransfers')) {
        const store = db.createObjectStore('bankTransfers', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('batchNumber', 'batchNumber', { unique: true });
        store.createIndex('payrollPeriodId', 'payrollPeriodId', { unique: false });
        store.createIndex('status', 'status', { unique: false });
      }

      // Cash Payments store
      if (!db.objectStoreNames.contains('cashPayments')) {
        const store = db.createObjectStore('cashPayments', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('payrollEntryId', 'payrollEntryId', { unique: false });
        store.createIndex('voucherNumber', 'voucherNumber', { unique: true });
        store.createIndex('status', 'status', { unique: false });
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

// ========== PAYROLL PERIODS ==========
export const payrollPeriodsDB = {
  ...createCRUD('payrollPeriods'),

  generatePeriodCode: (year, month) => {
    return `${year}-${String(month).padStart(2, '0')}`;
  },

  getByStatus: async (status) => {
    const db = await getDB();
    return db.getAllFromIndex('payrollPeriods', 'status', status);
  },

  getByYear: async (year) => {
    const db = await getDB();
    return db.getAllFromIndex('payrollPeriods', 'year', year);
  },

  getCurrent: async () => {
    const db = await getDB();
    const all = await db.getAll('payrollPeriods');
    return all.find(p => ['draft', 'collecting', 'processing', 'hr_review', 'finance_review', 'pending_approval', 'approved', 'disbursing'].includes(p.status));
  },

  initiate: async (id) => {
    const db = await getDB();
    const period = await db.get('payrollPeriods', Number(id));
    if (!period) throw new Error('Period not found');
    period.status = 'collecting';
    period.initiatedAt = new Date().toISOString();
    period.updatedAt = new Date().toISOString();
    await db.put('payrollPeriods', period);
    return period;
  },

  hrSubmit: async (id) => {
    const db = await getDB();
    const period = await db.get('payrollPeriods', Number(id));
    if (!period) throw new Error('Period not found');
    period.status = 'finance_review';
    period.hrSubmittedAt = new Date().toISOString();
    period.updatedAt = new Date().toISOString();
    await db.put('payrollPeriods', period);
    return period;
  },

  financeVerify: async (id) => {
    const db = await getDB();
    const period = await db.get('payrollPeriods', Number(id));
    if (!period) throw new Error('Period not found');
    period.status = 'pending_approval';
    period.financeVerifiedAt = new Date().toISOString();
    period.updatedAt = new Date().toISOString();
    await db.put('payrollPeriods', period);
    return period;
  },

  approve: async (id) => {
    const db = await getDB();
    const period = await db.get('payrollPeriods', Number(id));
    if (!period) throw new Error('Period not found');
    period.status = 'approved';
    period.approvedAt = new Date().toISOString();
    period.updatedAt = new Date().toISOString();
    await db.put('payrollPeriods', period);
    return period;
  },

  complete: async (id) => {
    const db = await getDB();
    const period = await db.get('payrollPeriods', Number(id));
    if (!period) throw new Error('Period not found');
    period.status = 'completed';
    period.disbursedAt = new Date().toISOString();
    period.updatedAt = new Date().toISOString();
    await db.put('payrollPeriods', period);
    return period;
  },

  lock: async (id) => {
    const db = await getDB();
    const period = await db.get('payrollPeriods', Number(id));
    if (!period) throw new Error('Period not found');
    period.status = 'locked';
    period.lockedAt = new Date().toISOString();
    period.updatedAt = new Date().toISOString();
    await db.put('payrollPeriods', period);
    return period;
  },
};

// ========== SALARY STRUCTURES ==========
export const salaryStructuresDB = {
  ...createCRUD('salaryStructures'),

  getActive: async () => {
    const db = await getDB();
    return db.getAllFromIndex('salaryStructures', 'isActive', true);
  },

  getByType: async (type) => {
    const db = await getDB();
    return db.getAllFromIndex('salaryStructures', 'componentType', type);
  },

  getEarnings: async () => {
    const db = await getDB();
    const all = await db.getAll('salaryStructures');
    return all.filter(s => s.componentType === 'earning' && s.isActive);
  },

  getDeductions: async () => {
    const db = await getDB();
    const all = await db.getAll('salaryStructures');
    return all.filter(s => s.componentType === 'deduction' && s.isActive);
  },
};

// ========== EMPLOYEE SALARY DETAILS ==========
export const employeeSalaryDB = {
  ...createCRUD('employeeSalaryDetails'),

  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('employeeSalaryDetails', 'employeeId', Number(employeeId));
  },

  getCurrentByEmployee: async (employeeId) => {
    const db = await getDB();
    const salaries = await db.getAllFromIndex('employeeSalaryDetails', 'employeeId', Number(employeeId));
    return salaries.find(s => s.isCurrent);
  },
};

// ========== EMPLOYEE ALLOWANCES ==========
export const employeeAllowancesDB = {
  ...createCRUD('employeeAllowances'),

  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('employeeAllowances', 'employeeId', Number(employeeId));
  },

  getActiveByEmployee: async (employeeId) => {
    const db = await getDB();
    const allowances = await db.getAllFromIndex('employeeAllowances', 'employeeId', Number(employeeId));
    return allowances.filter(a => a.isActive);
  },
};

// ========== PAYROLL ENTRIES ==========
export const payrollEntriesDB = {
  ...createCRUD('payrollEntries'),

  getByPeriod: async (periodId) => {
    const db = await getDB();
    return db.getAllFromIndex('payrollEntries', 'payrollPeriodId', Number(periodId));
  },

  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('payrollEntries', 'employeeId', Number(employeeId));
  },

  getByStatus: async (status) => {
    const db = await getDB();
    return db.getAllFromIndex('payrollEntries', 'status', status);
  },

  calculateTax: (grossSalary) => {
    let tax = 0;
    if (grossSalary <= 5000) {
      tax = 0;
    } else if (grossSalary <= 12500) {
      tax = (grossSalary - 5000) * 0.02;
    } else if (grossSalary <= 100000) {
      tax = (7500 * 0.02) + (grossSalary - 12500) * 0.10;
    } else {
      tax = (7500 * 0.02) + (87500 * 0.10) + (grossSalary - 100000) * 0.20;
    }
    return Math.round(tax);
  },

  calculate: async (id) => {
    const db = await getDB();
    const entry = await db.get('payrollEntries', Number(id));
    if (!entry) throw new Error('Entry not found');

    // Calculate prorated salary
    const dailyRate = entry.basicSalary / entry.workingDays;
    const proratedSalary = dailyRate * entry.presentDays;

    // Calculate overtime
    const hourlyRate = entry.basicSalary / entry.workingDays / 8;
    const overtimeAmount = entry.overtimeHours * hourlyRate * 1.5;

    // Calculate gross
    const grossSalary = proratedSalary + (entry.transportationAllowance || 0) + overtimeAmount + (entry.otherAllowances || 0);

    // Calculate tax
    const taxAmount = payrollEntriesDB.calculateTax(grossSalary);

    // Calculate total deductions
    const totalDeductions = taxAmount + (entry.advanceDeduction || 0) + (entry.loanDeduction || 0) + (entry.absenceDeduction || 0) + (entry.otherDeductions || 0);

    // Calculate net
    const netSalary = grossSalary - totalDeductions;

    const updated = {
      ...entry,
      proratedSalary: Math.round(proratedSalary),
      overtimeAmount: Math.round(overtimeAmount),
      grossSalary: Math.round(grossSalary),
      taxAmount,
      totalDeductions: Math.round(totalDeductions),
      netSalary: Math.round(netSalary),
      status: 'calculated',
      updatedAt: new Date().toISOString(),
    };

    await db.put('payrollEntries', updated);
    return updated;
  },

  markPaid: async (id, paymentReference) => {
    const db = await getDB();
    const entry = await db.get('payrollEntries', Number(id));
    if (!entry) throw new Error('Entry not found');
    entry.status = 'paid';
    entry.paymentReference = paymentReference;
    entry.paidAt = new Date().toISOString();
    entry.updatedAt = new Date().toISOString();
    await db.put('payrollEntries', entry);
    return entry;
  },
};

// ========== SALARY ADVANCES ==========
export const advancesDB = {
  ...createCRUD('salaryAdvances'),

  generateAdvanceNumber: async () => {
    const db = await getDB();
    const all = await db.getAll('salaryAdvances');
    const year = new Date().getFullYear();
    const count = all.filter(a => a.advanceNumber?.startsWith(`ADV-${year}`)).length + 1;
    return `ADV-${year}-${String(count).padStart(3, '0')}`;
  },

  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('salaryAdvances', 'employeeId', Number(employeeId));
  },

  getByStatus: async (status) => {
    const db = await getDB();
    return db.getAllFromIndex('salaryAdvances', 'status', status);
  },

  getPending: async () => {
    const db = await getDB();
    return db.getAllFromIndex('salaryAdvances', 'status', 'pending');
  },

  getActiveByEmployee: async (employeeId) => {
    const db = await getDB();
    const advances = await db.getAllFromIndex('salaryAdvances', 'employeeId', Number(employeeId));
    return advances.filter(a => ['approved', 'disbursed', 'repaying'].includes(a.status));
  },

  approve: async (id, approvedAmount) => {
    const db = await getDB();
    const advance = await db.get('salaryAdvances', Number(id));
    if (!advance) throw new Error('Advance not found');
    const monthlyDeduction = Math.ceil(approvedAmount / advance.repaymentMonths);
    advance.amountApproved = approvedAmount;
    advance.monthlyDeduction = monthlyDeduction;
    advance.balanceRemaining = approvedAmount;
    advance.status = 'approved';
    advance.approvedAt = new Date().toISOString();
    advance.updatedAt = new Date().toISOString();
    await db.put('salaryAdvances', advance);
    return advance;
  },

  reject: async (id, reason) => {
    const db = await getDB();
    const advance = await db.get('salaryAdvances', Number(id));
    if (!advance) throw new Error('Advance not found');
    advance.status = 'rejected';
    advance.rejectionReason = reason;
    advance.updatedAt = new Date().toISOString();
    await db.put('salaryAdvances', advance);
    return advance;
  },

  disburse: async (id) => {
    const db = await getDB();
    const advance = await db.get('salaryAdvances', Number(id));
    if (!advance) throw new Error('Advance not found');
    advance.status = 'disbursed';
    advance.disbursedAt = new Date().toISOString();
    advance.updatedAt = new Date().toISOString();
    await db.put('salaryAdvances', advance);
    return advance;
  },
};

// ========== EMPLOYEE LOANS ==========
export const loansDB = {
  ...createCRUD('employeeLoans'),

  generateLoanNumber: async () => {
    const db = await getDB();
    const all = await db.getAll('employeeLoans');
    const year = new Date().getFullYear();
    const count = all.filter(l => l.loanNumber?.startsWith(`LN-${year}`)).length + 1;
    return `LN-${year}-${String(count).padStart(3, '0')}`;
  },

  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('employeeLoans', 'employeeId', Number(employeeId));
  },

  getByStatus: async (status) => {
    const db = await getDB();
    return db.getAllFromIndex('employeeLoans', 'status', status);
  },

  getActiveByEmployee: async (employeeId) => {
    const db = await getDB();
    const loans = await db.getAllFromIndex('employeeLoans', 'employeeId', Number(employeeId));
    return loans.filter(l => l.status === 'active');
  },

  approve: async (id) => {
    const db = await getDB();
    const loan = await db.get('employeeLoans', Number(id));
    if (!loan) throw new Error('Loan not found');
    loan.status = 'active';
    loan.balanceRemaining = loan.totalAmount;
    loan.approvedAt = new Date().toISOString();
    loan.updatedAt = new Date().toISOString();
    await db.put('employeeLoans', loan);
    return loan;
  },
};

// ========== OVERTIME RECORDS ==========
export const overtimeDB = {
  ...createCRUD('overtimeRecords'),

  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('overtimeRecords', 'employeeId', Number(employeeId));
  },

  getByStatus: async (status) => {
    const db = await getDB();
    return db.getAllFromIndex('overtimeRecords', 'status', status);
  },

  getPending: async () => {
    const db = await getDB();
    return db.getAllFromIndex('overtimeRecords', 'status', 'pending');
  },

  approve: async (id) => {
    const db = await getDB();
    const overtime = await db.get('overtimeRecords', Number(id));
    if (!overtime) throw new Error('Overtime not found');
    overtime.status = 'approved';
    overtime.approvedAt = new Date().toISOString();
    overtime.updatedAt = new Date().toISOString();
    await db.put('overtimeRecords', overtime);
    return overtime;
  },

  reject: async (id) => {
    const db = await getDB();
    const overtime = await db.get('overtimeRecords', Number(id));
    if (!overtime) throw new Error('Overtime not found');
    overtime.status = 'rejected';
    overtime.updatedAt = new Date().toISOString();
    await db.put('overtimeRecords', overtime);
    return overtime;
  },
};

// ========== PAYSLIPS ==========
export const payslipsDB = {
  ...createCRUD('payslips'),

  generatePayslipNumber: async (year, month) => {
    const db = await getDB();
    const all = await db.getAll('payslips');
    const prefix = `PS-${year}${String(month).padStart(2, '0')}`;
    const count = all.filter(p => p.payslipNumber?.startsWith(prefix)).length + 1;
    return `${prefix}-${String(count).padStart(4, '0')}`;
  },

  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('payslips', 'employeeId', Number(employeeId));
  },

  getByPeriod: async (year, month) => {
    const db = await getDB();
    const all = await db.getAll('payslips');
    return all.filter(p => p.periodYear === year && p.periodMonth === month);
  },
};

// ========== BANK TRANSFERS ==========
export const bankTransfersDB = {
  ...createCRUD('bankTransfers'),

  generateBatchNumber: async () => {
    const db = await getDB();
    const all = await db.getAll('bankTransfers');
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const count = all.filter(b => b.batchNumber?.startsWith(`BT-${date}`)).length + 1;
    return `BT-${date}-${String(count).padStart(3, '0')}`;
  },

  getByPeriod: async (periodId) => {
    const db = await getDB();
    return db.getAllFromIndex('bankTransfers', 'payrollPeriodId', Number(periodId));
  },

  getByStatus: async (status) => {
    const db = await getDB();
    return db.getAllFromIndex('bankTransfers', 'status', status);
  },

  markCompleted: async (id, bankReference) => {
    const db = await getDB();
    const transfer = await db.get('bankTransfers', Number(id));
    if (!transfer) throw new Error('Transfer not found');
    transfer.status = 'completed';
    transfer.bankReference = bankReference;
    transfer.processedAt = new Date().toISOString();
    transfer.updatedAt = new Date().toISOString();
    await db.put('bankTransfers', transfer);
    return transfer;
  },
};

// ========== CASH PAYMENTS ==========
export const cashPaymentsDB = {
  ...createCRUD('cashPayments'),

  generateVoucherNumber: async () => {
    const db = await getDB();
    const all = await db.getAll('cashPayments');
    const year = new Date().getFullYear();
    const count = all.filter(c => c.voucherNumber?.startsWith(`CV-${year}`)).length + 1;
    return `CV-${year}-${String(count).padStart(4, '0')}`;
  },

  getByStatus: async (status) => {
    const db = await getDB();
    return db.getAllFromIndex('cashPayments', 'status', status);
  },

  verify: async (id) => {
    const db = await getDB();
    const payment = await db.get('cashPayments', Number(id));
    if (!payment) throw new Error('Payment not found');
    payment.status = 'verified';
    payment.verifiedAt = new Date().toISOString();
    payment.updatedAt = new Date().toISOString();
    await db.put('cashPayments', payment);
    return payment;
  },
};

// ========== SEED DEFAULT DATA ==========
export const seedPayrollDefaults = async () => {
  const db = await getDB();

  // Seed salary structures
  const structures = await db.getAll('salaryStructures');
  if (structures.length === 0) {
    const defaultStructures = [
      { componentCode: 'BASIC', componentName: 'Basic Salary', componentType: 'earning', calculationType: 'fixed', isTaxable: true, isRecurring: true, applicableTo: 'all', displayOrder: 1, isActive: true },
      { componentCode: 'TA', componentName: 'Transportation Allowance', componentType: 'earning', calculationType: 'fixed', defaultAmount: 3000, isTaxable: true, isRecurring: true, applicableTo: 'all', displayOrder: 2, isActive: true },
      { componentCode: 'OT', componentName: 'Overtime', componentType: 'earning', calculationType: 'formula', isTaxable: true, isRecurring: false, applicableTo: 'all', displayOrder: 3, isActive: true },
      { componentCode: 'LUNCH', componentName: 'Lunch Allowance', componentType: 'earning', calculationType: 'fixed', defaultAmount: 2000, isTaxable: true, isRecurring: true, applicableTo: 'all', displayOrder: 4, isActive: true },
      { componentCode: 'MAHRAM', componentName: 'Mahram Allowance', componentType: 'earning', calculationType: 'fixed', isTaxable: true, isRecurring: true, applicableTo: 'specific', displayOrder: 5, isActive: true },
      { componentCode: 'TOPUP', componentName: 'Top-up Card', componentType: 'earning', calculationType: 'fixed', defaultAmount: 500, isTaxable: true, isRecurring: true, applicableTo: 'all', displayOrder: 6, isActive: true },
      { componentCode: 'TAX', componentName: 'Income Tax', componentType: 'deduction', calculationType: 'formula', isTaxable: false, isRecurring: true, applicableTo: 'all', displayOrder: 10, isActive: true },
      { componentCode: 'ADV', componentName: 'Advance Recovery', componentType: 'deduction', calculationType: 'manual', isTaxable: false, isRecurring: false, applicableTo: 'all', displayOrder: 11, isActive: true },
      { componentCode: 'LOAN', componentName: 'Loan Recovery', componentType: 'deduction', calculationType: 'manual', isTaxable: false, isRecurring: true, applicableTo: 'all', displayOrder: 12, isActive: true },
      { componentCode: 'ABS', componentName: 'Absence Deduction', componentType: 'deduction', calculationType: 'formula', isTaxable: false, isRecurring: false, applicableTo: 'all', displayOrder: 13, isActive: true },
    ];

    for (const structure of defaultStructures) {
      await db.add('salaryStructures', { ...structure, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    console.log('Seeded salary structures');
  }

  // Seed sample payroll period
  const periods = await db.getAll('payrollPeriods');
  if (periods.length === 0) {
    const now = new Date();
    const samplePeriod = {
      periodCode: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      periodName: `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0],
      workingDays: 22,
      status: 'draft',
      totalGross: 0,
      totalDeductions: 0,
      totalNet: 0,
      totalEmployees: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.add('payrollPeriods', samplePeriod);
    console.log('Seeded sample payroll period');
  }

  // Seed sample advance
  const advances = await db.getAll('salaryAdvances');
  if (advances.length === 0) {
    const sampleAdvance = {
      advanceNumber: 'ADV-2024-001',
      employeeId: 1,
      employeeName: 'Ahmad Khan',
      requestDate: '2024-11-15',
      amountRequested: 20000,
      currency: 'AFN',
      reason: 'Medical emergency for family member',
      repaymentMonths: 4,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.add('salaryAdvances', sampleAdvance);
    console.log('Seeded sample advance');
  }
};

// Initialize database
export const initPayrollDB = async () => {
  await getDB();
  await seedPayrollDefaults();
  console.log('Payroll DB initialized');
};

export default {
  payrollPeriodsDB,
  salaryStructuresDB,
  employeeSalaryDB,
  employeeAllowancesDB,
  payrollEntriesDB,
  advancesDB,
  loansDB,
  overtimeDB,
  payslipsDB,
  bankTransfersDB,
  cashPaymentsDB,
  initPayrollDB,
  seedPayrollDefaults,
};
