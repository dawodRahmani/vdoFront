import { getDB } from './indexedDB';

// Store names
const STORES = {
  LEAVE_TYPES: 'leaveTypes',
  LEAVE_POLICIES: 'leavePolicies',
  LEAVE_BALANCES: 'employeeLeaveBalances',
  LEAVE_REQUESTS: 'leaveRequests',
  LEAVE_REQUEST_DAYS: 'leaveRequestDays',
  LEAVE_APPROVALS: 'leaveApprovals',
  HOLIDAYS: 'holidays',
  ATTENDANCE: 'attendance',
  TIMESHEETS: 'timesheets',
  OIC_ASSIGNMENTS: 'oicAssignments',
  LEAVE_ADJUSTMENTS: 'leaveAdjustments',
  LEAVE_CARRYOVER: 'leaveCarryoverRecords',
  EMPLOYEES: 'employees',
};

// ==================== LEAVE POLICIES ====================

export const leavePolicyService = {
  async create(data) {
    const db = await getDB();
    const tx = db.transaction(STORES.LEAVE_POLICIES, 'readwrite');
    const store = tx.objectStore(STORES.LEAVE_POLICIES);

    const policy = {
      ...data,
      fiscalYear: data.fiscalYear || new Date().getFullYear(),
      isActive: data.isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const id = await store.add(policy);
    await tx.done;
    return { ...policy, id };
  },

  async getAll() {
    const db = await getDB();
    const policies = await db.getAll(STORES.LEAVE_POLICIES);
    return policies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getById(id) {
    const db = await getDB();
    return db.get(STORES.LEAVE_POLICIES, id);
  },

  async getByFiscalYear(year) {
    const db = await getDB();
    const policies = await db.getAll(STORES.LEAVE_POLICIES);
    return policies.filter(p => p.fiscalYear === year && p.isActive);
  },

  async update(id, data) {
    const db = await getDB();
    const tx = db.transaction(STORES.LEAVE_POLICIES, 'readwrite');
    const store = tx.objectStore(STORES.LEAVE_POLICIES);

    const existing = await store.get(id);
    if (!existing) throw new Error('Policy not found');

    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };

    await store.put(updated);
    await tx.done;
    return updated;
  },

  async delete(id) {
    const db = await getDB();
    await db.delete(STORES.LEAVE_POLICIES, id);
    return true;
  },
};

// ==================== LEAVE BALANCES ====================

export const leaveBalanceService = {
  async create(data) {
    const db = await getDB();
    const tx = db.transaction(STORES.LEAVE_BALANCES, 'readwrite');
    const store = tx.objectStore(STORES.LEAVE_BALANCES);

    const balance = {
      ...data,
      fiscalYear: data.fiscalYear || new Date().getFullYear(),
      openingBalance: data.openingBalance || 0,
      carriedForward: data.carriedForward || 0,
      accrued: data.accrued || 0,
      adjustment: data.adjustment || 0,
      used: data.used || 0,
      pending: data.pending || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const id = await store.add(balance);
    await tx.done;
    return { ...balance, id };
  },

  async getAll() {
    const db = await getDB();
    return db.getAll(STORES.LEAVE_BALANCES);
  },

  async getByEmployee(employeeId, fiscalYear = null) {
    const db = await getDB();
    const balances = await db.getAll(STORES.LEAVE_BALANCES);
    return balances.filter(b =>
      b.employeeId === employeeId &&
      (fiscalYear === null || b.fiscalYear === fiscalYear)
    );
  },

  async getByEmployeeAndType(employeeId, leaveTypeId, fiscalYear) {
    const db = await getDB();
    const balances = await db.getAll(STORES.LEAVE_BALANCES);
    return balances.find(b =>
      b.employeeId === employeeId &&
      b.leaveTypeId === leaveTypeId &&
      b.fiscalYear === fiscalYear
    );
  },

  calculateAvailable(balance) {
    return (
      (balance.openingBalance || 0) +
      (balance.carriedForward || 0) +
      (balance.accrued || 0) +
      (balance.adjustment || 0) -
      (balance.used || 0) -
      (balance.pending || 0)
    );
  },

  async update(id, data) {
    const db = await getDB();
    const tx = db.transaction(STORES.LEAVE_BALANCES, 'readwrite');
    const store = tx.objectStore(STORES.LEAVE_BALANCES);

    const existing = await store.get(id);
    if (!existing) throw new Error('Balance not found');

    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };

    await store.put(updated);
    await tx.done;
    return updated;
  },

  async initializeForEmployee(employeeId, fiscalYear) {
    const db = await getDB();
    const leaveTypes = await db.getAll(STORES.LEAVE_TYPES);
    const policies = await leavePolicyService.getByFiscalYear(fiscalYear);

    const results = [];
    for (const leaveType of leaveTypes.filter(lt => lt.status === 'active')) {
      const policy = policies.find(p => p.leaveTypeId === leaveType.id);
      const entitlement = policy?.entitlementDays || leaveType.daysAllowed || 0;

      const existing = await this.getByEmployeeAndType(employeeId, leaveType.id, fiscalYear);
      if (!existing) {
        const balance = await this.create({
          employeeId,
          leaveTypeId: leaveType.id,
          fiscalYear,
          openingBalance: entitlement,
          carriedForward: 0,
          accrued: 0,
          adjustment: 0,
          used: 0,
          pending: 0,
        });
        results.push(balance);
      }
    }
    return results;
  },

  async adjustBalance(employeeId, leaveTypeId, fiscalYear, days, type = 'debit') {
    const balance = await this.getByEmployeeAndType(employeeId, leaveTypeId, fiscalYear);
    if (!balance) throw new Error('Balance not found');

    const adjustmentValue = type === 'credit' ? Math.abs(days) : -Math.abs(days);
    return this.update(balance.id, {
      adjustment: (balance.adjustment || 0) + adjustmentValue,
    });
  },

  async useLeave(employeeId, leaveTypeId, fiscalYear, days) {
    const balance = await this.getByEmployeeAndType(employeeId, leaveTypeId, fiscalYear);
    if (!balance) throw new Error('Balance not found');

    return this.update(balance.id, {
      used: (balance.used || 0) + days,
    });
  },
};

// ==================== HOLIDAYS ====================

export const holidayService = {
  async create(data) {
    const db = await getDB();
    const tx = db.transaction(STORES.HOLIDAYS, 'readwrite');
    const store = tx.objectStore(STORES.HOLIDAYS);

    const holiday = {
      ...data,
      fiscalYear: data.fiscalYear || new Date().getFullYear(),
      isActive: data.isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const id = await store.add(holiday);
    await tx.done;
    return { ...holiday, id };
  },

  async getAll() {
    const db = await getDB();
    const holidays = await db.getAll(STORES.HOLIDAYS);
    return holidays.sort((a, b) => new Date(a.date) - new Date(b.date));
  },

  async getByYear(year) {
    const db = await getDB();
    const holidays = await db.getAll(STORES.HOLIDAYS);
    return holidays.filter(h => h.fiscalYear === year && h.isActive);
  },

  async getByDateRange(startDate, endDate) {
    const db = await getDB();
    const holidays = await db.getAll(STORES.HOLIDAYS);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return holidays.filter(h => {
      const date = new Date(h.date);
      return date >= start && date <= end && h.isActive;
    });
  },

  async isHoliday(date) {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    const db = await getDB();
    const holidays = await db.getAll(STORES.HOLIDAYS);
    return holidays.some(h => h.date === dateStr && h.isActive);
  },

  async update(id, data) {
    const db = await getDB();
    const tx = db.transaction(STORES.HOLIDAYS, 'readwrite');
    const store = tx.objectStore(STORES.HOLIDAYS);

    const existing = await store.get(id);
    if (!existing) throw new Error('Holiday not found');

    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };

    await store.put(updated);
    await tx.done;
    return updated;
  },

  async delete(id) {
    const db = await getDB();
    await db.delete(STORES.HOLIDAYS, id);
    return true;
  },

  async seedDefaults(year = new Date().getFullYear()) {
    const defaults = [
      { name: 'New Year', date: `${year}-01-01`, holidayType: 'national' },
      { name: 'Independence Day', date: `${year}-08-19`, holidayType: 'national' },
      { name: 'Victory Day', date: `${year}-04-28`, holidayType: 'national' },
      { name: 'Labor Day', date: `${year}-05-01`, holidayType: 'national' },
    ];

    const existing = await this.getByYear(year);
    const results = [];

    for (const holiday of defaults) {
      if (!existing.some(e => e.date === holiday.date)) {
        const created = await this.create({ ...holiday, fiscalYear: year });
        results.push(created);
      }
    }
    return results;
  },
};

// ==================== TIMESHEETS ====================

export const timesheetService = {
  async create(data) {
    const db = await getDB();
    const tx = db.transaction(STORES.TIMESHEETS, 'readwrite');
    const store = tx.objectStore(STORES.TIMESHEETS);

    const timesheet = {
      ...data,
      status: data.status || 'draft',
      totalWorkingDays: data.totalWorkingDays || 0,
      totalPresentDays: data.totalPresentDays || 0,
      totalAbsentDays: data.totalAbsentDays || 0,
      totalLeaveDays: data.totalLeaveDays || 0,
      totalOvertimeHours: data.totalOvertimeHours || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const id = await store.add(timesheet);
    await tx.done;
    return { ...timesheet, id };
  },

  async getAll() {
    const db = await getDB();
    const timesheets = await db.getAll(STORES.TIMESHEETS);
    return timesheets.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  },

  async getByEmployee(employeeId) {
    const db = await getDB();
    const timesheets = await db.getAll(STORES.TIMESHEETS);
    return timesheets.filter(t => t.employeeId === employeeId);
  },

  async getByMonthYear(month, year) {
    const db = await getDB();
    const timesheets = await db.getAll(STORES.TIMESHEETS);
    return timesheets.filter(t => t.month === month && t.year === year);
  },

  async getByEmployeeMonthYear(employeeId, month, year) {
    const db = await getDB();
    const timesheets = await db.getAll(STORES.TIMESHEETS);
    return timesheets.find(t =>
      t.employeeId === employeeId && t.month === month && t.year === year
    );
  },

  async update(id, data) {
    const db = await getDB();
    const tx = db.transaction(STORES.TIMESHEETS, 'readwrite');
    const store = tx.objectStore(STORES.TIMESHEETS);

    const existing = await store.get(id);
    if (!existing) throw new Error('Timesheet not found');

    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };

    await store.put(updated);
    await tx.done;
    return updated;
  },

  async submit(id) {
    return this.update(id, {
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    });
  },

  async managerApprove(id, managerId) {
    return this.update(id, {
      status: 'manager_approved',
      managerId,
      managerApproved: true,
      managerApprovedAt: new Date().toISOString(),
    });
  },

  async hrVerify(id, hrUserId) {
    return this.update(id, {
      status: 'hr_verified',
      hrVerifiedBy: hrUserId,
      hrVerified: true,
      hrVerifiedAt: new Date().toISOString(),
    });
  },

  async sendToPayroll(id) {
    return this.update(id, {
      status: 'sent_to_payroll',
      sentToPayrollAt: new Date().toISOString(),
    });
  },

  async generate(employeeId, month, year) {
    const db = await getDB();

    // Check if already exists
    const existing = await this.getByEmployeeMonthYear(employeeId, month, year);
    if (existing) return existing;

    // Get attendance records for the month
    const attendance = await db.getAll(STORES.ATTENDANCE);
    const monthAttendance = attendance.filter(a => {
      const date = new Date(a.date);
      return a.employeeId === employeeId &&
             date.getMonth() + 1 === month &&
             date.getFullYear() === year;
    });

    // Calculate totals
    const daysInMonth = new Date(year, month, 0).getDate();
    let totalWorkingDays = 0;
    let totalPresentDays = 0;
    let totalAbsentDays = 0;
    let totalLeaveDays = 0;
    let totalOvertimeHours = 0;
    let totalHolidays = 0;
    let totalWeekends = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday-Saturday
      const isHoliday = await holidayService.isHoliday(date);

      if (isWeekend) {
        totalWeekends++;
      } else if (isHoliday) {
        totalHolidays++;
      } else {
        totalWorkingDays++;
        const record = monthAttendance.find(a => new Date(a.date).getDate() === day);
        if (record) {
          if (record.status === 'present') totalPresentDays++;
          else if (record.status === 'absent') totalAbsentDays++;
          else if (record.status === 'leave') totalLeaveDays++;
          totalOvertimeHours += record.overtimeHours || 0;
        }
      }
    }

    return this.create({
      employeeId,
      month,
      year,
      totalWorkingDays,
      totalPresentDays,
      totalAbsentDays,
      totalLeaveDays,
      totalOvertimeHours,
      totalHolidays,
      totalWeekends,
      status: 'draft',
    });
  },

  async delete(id) {
    const db = await getDB();
    await db.delete(STORES.TIMESHEETS, id);
    return true;
  },
};

// ==================== OIC ASSIGNMENTS ====================

export const oicService = {
  async create(data) {
    const db = await getDB();
    const tx = db.transaction(STORES.OIC_ASSIGNMENTS, 'readwrite');
    const store = tx.objectStore(STORES.OIC_ASSIGNMENTS);

    const assignment = {
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const id = await store.add(assignment);
    await tx.done;
    return { ...assignment, id };
  },

  async getAll() {
    const db = await getDB();
    return db.getAll(STORES.OIC_ASSIGNMENTS);
  },

  async getByLeaveRequest(leaveRequestId) {
    const db = await getDB();
    const assignments = await db.getAll(STORES.OIC_ASSIGNMENTS);
    return assignments.find(a => a.leaveRequestId === leaveRequestId);
  },

  async getByOIC(oicEmployeeId) {
    const db = await getDB();
    const assignments = await db.getAll(STORES.OIC_ASSIGNMENTS);
    return assignments.filter(a => a.oicEmployeeId === oicEmployeeId);
  },

  async accept(id) {
    const db = await getDB();
    const tx = db.transaction(STORES.OIC_ASSIGNMENTS, 'readwrite');
    const store = tx.objectStore(STORES.OIC_ASSIGNMENTS);

    const existing = await store.get(id);
    if (!existing) throw new Error('Assignment not found');

    const updated = {
      ...existing,
      status: 'accepted',
      oicAccepted: true,
      oicAcceptedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await store.put(updated);
    await tx.done;
    return updated;
  },

  async decline(id) {
    const db = await getDB();
    const tx = db.transaction(STORES.OIC_ASSIGNMENTS, 'readwrite');
    const store = tx.objectStore(STORES.OIC_ASSIGNMENTS);

    const existing = await store.get(id);
    if (!existing) throw new Error('Assignment not found');

    const updated = {
      ...existing,
      status: 'declined',
      oicAccepted: false,
      updatedAt: new Date().toISOString(),
    };

    await store.put(updated);
    await tx.done;
    return updated;
  },

  async delete(id) {
    const db = await getDB();
    await db.delete(STORES.OIC_ASSIGNMENTS, id);
    return true;
  },
};

// ==================== LEAVE ADJUSTMENTS ====================

export const leaveAdjustmentService = {
  async create(data) {
    const db = await getDB();
    const tx = db.transaction(STORES.LEAVE_ADJUSTMENTS, 'readwrite');
    const store = tx.objectStore(STORES.LEAVE_ADJUSTMENTS);

    const adjustment = {
      ...data,
      fiscalYear: data.fiscalYear || new Date().getFullYear(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const id = await store.add(adjustment);
    await tx.done;
    return { ...adjustment, id };
  },

  async getAll() {
    const db = await getDB();
    return db.getAll(STORES.LEAVE_ADJUSTMENTS);
  },

  async getByEmployee(employeeId) {
    const db = await getDB();
    const adjustments = await db.getAll(STORES.LEAVE_ADJUSTMENTS);
    return adjustments.filter(a => a.employeeId === employeeId);
  },

  async getPending() {
    const db = await getDB();
    const adjustments = await db.getAll(STORES.LEAVE_ADJUSTMENTS);
    return adjustments.filter(a => a.status === 'pending');
  },

  async approve(id, approvedBy) {
    const db = await getDB();
    const tx = db.transaction(STORES.LEAVE_ADJUSTMENTS, 'readwrite');
    const store = tx.objectStore(STORES.LEAVE_ADJUSTMENTS);

    const existing = await store.get(id);
    if (!existing) throw new Error('Adjustment not found');

    const updated = {
      ...existing,
      status: 'approved',
      approvedBy,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await store.put(updated);
    await tx.done;

    // Apply adjustment to balance
    await leaveBalanceService.adjustBalance(
      existing.employeeId,
      existing.leaveTypeId,
      existing.fiscalYear,
      existing.days,
      existing.adjustmentType
    );

    return updated;
  },

  async reject(id, rejectedBy, reason) {
    const db = await getDB();
    const tx = db.transaction(STORES.LEAVE_ADJUSTMENTS, 'readwrite');
    const store = tx.objectStore(STORES.LEAVE_ADJUSTMENTS);

    const existing = await store.get(id);
    if (!existing) throw new Error('Adjustment not found');

    const updated = {
      ...existing,
      status: 'rejected',
      rejectedBy,
      rejectionReason: reason,
      updatedAt: new Date().toISOString(),
    };

    await store.put(updated);
    await tx.done;
    return updated;
  },

  async delete(id) {
    const db = await getDB();
    await db.delete(STORES.LEAVE_ADJUSTMENTS, id);
    return true;
  },
};

// ==================== LEAVE CARRYOVER ====================

export const leaveCarryoverService = {
  async create(data) {
    const db = await getDB();
    const tx = db.transaction(STORES.LEAVE_CARRYOVER, 'readwrite');
    const store = tx.objectStore(STORES.LEAVE_CARRYOVER);

    const record = {
      ...data,
      processedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const id = await store.add(record);
    await tx.done;
    return { ...record, id };
  },

  async getAll() {
    const db = await getDB();
    return db.getAll(STORES.LEAVE_CARRYOVER);
  },

  async getByEmployee(employeeId) {
    const db = await getDB();
    const records = await db.getAll(STORES.LEAVE_CARRYOVER);
    return records.filter(r => r.employeeId === employeeId);
  },

  async processYearEnd(fromYear, toYear, processedBy) {
    const db = await getDB();
    const employees = await db.getAll(STORES.EMPLOYEES);
    const leaveTypes = await db.getAll(STORES.LEAVE_TYPES);

    const results = [];

    for (const employee of employees.filter(e => e.status === 'active')) {
      for (const leaveType of leaveTypes.filter(lt => lt.status === 'active' && lt.maxCarryoverDays > 0)) {
        const balance = await leaveBalanceService.getByEmployeeAndType(
          employee.id,
          leaveType.id,
          fromYear
        );

        if (balance) {
          const available = leaveBalanceService.calculateAvailable(balance);
          const maxCarryover = leaveType.maxCarryoverDays || 0;
          const carriedDays = Math.min(available, maxCarryover);
          const forfeitedDays = Math.max(0, available - maxCarryover);

          // Create carryover record
          const record = await this.create({
            employeeId: employee.id,
            leaveTypeId: leaveType.id,
            fromYear,
            toYear,
            eligibleDays: available,
            carriedDays,
            forfeitedDays,
            processedBy,
          });
          results.push(record);

          // Create new year balance with carryover
          await leaveBalanceService.create({
            employeeId: employee.id,
            leaveTypeId: leaveType.id,
            fiscalYear: toYear,
            carriedForward: carriedDays,
            openingBalance: leaveType.daysAllowed || 0,
          });
        }
      }
    }

    return results;
  },
};

// ==================== LEAVE CALENDAR ====================

export const leaveCalendarService = {
  async getTeamCalendar(employeeIds, startDate, endDate) {
    const db = await getDB();
    const requests = await db.getAll(STORES.LEAVE_REQUESTS);

    const start = new Date(startDate);
    const end = new Date(endDate);

    return requests.filter(r => {
      if (!employeeIds.includes(r.employeeId)) return false;
      if (!['approved', 'taken', 'completed'].includes(r.status)) return false;

      const reqStart = new Date(r.startDate);
      const reqEnd = new Date(r.endDate);

      return (reqStart >= start && reqStart <= end) ||
             (reqEnd >= start && reqEnd <= end) ||
             (reqStart <= start && reqEnd >= end);
    });
  },

  async getWorkingDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let workingDays = 0;

    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
      const isHoliday = await holidayService.isHoliday(current);

      if (!isWeekend && !isHoliday) {
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    return workingDays;
  },
};

// ==================== LEAVE REPORTS ====================

export const leaveReportService = {
  async getLeaveSummary(fiscalYear = new Date().getFullYear()) {
    const db = await getDB();
    const requests = await db.getAll(STORES.LEAVE_REQUESTS);
    const employees = await db.getAll(STORES.EMPLOYEES);
    const leaveTypes = await db.getAll(STORES.LEAVE_TYPES);

    const yearRequests = requests.filter(r => {
      const date = new Date(r.startDate);
      return date.getFullYear() === fiscalYear;
    });

    return {
      totalRequests: yearRequests.length,
      byStatus: {
        pending: yearRequests.filter(r => r.status === 'pending').length,
        approved: yearRequests.filter(r => r.status === 'approved').length,
        rejected: yearRequests.filter(r => r.status === 'rejected').length,
        cancelled: yearRequests.filter(r => r.status === 'cancelled').length,
        taken: yearRequests.filter(r => r.status === 'taken').length,
        completed: yearRequests.filter(r => r.status === 'completed').length,
      },
      byLeaveType: leaveTypes.map(lt => ({
        leaveType: lt.name,
        count: yearRequests.filter(r => r.leaveTypeId === lt.id).length,
        totalDays: yearRequests
          .filter(r => r.leaveTypeId === lt.id)
          .reduce((sum, r) => sum + (r.totalDays || 0), 0),
      })),
      totalDaysTaken: yearRequests
        .filter(r => ['approved', 'taken', 'completed'].includes(r.status))
        .reduce((sum, r) => sum + (r.totalDays || 0), 0),
      employeesOnLeave: [...new Set(
        yearRequests
          .filter(r => r.status === 'taken')
          .map(r => r.employeeId)
      )].length,
    };
  },

  async getEmployeeYearly(employeeId, fiscalYear = new Date().getFullYear()) {
    const db = await getDB();
    const requests = await db.getAll(STORES.LEAVE_REQUESTS);
    const balances = await leaveBalanceService.getByEmployee(employeeId, fiscalYear);
    const leaveTypes = await db.getAll(STORES.LEAVE_TYPES);

    const yearRequests = requests.filter(r => {
      const date = new Date(r.startDate);
      return r.employeeId === employeeId && date.getFullYear() === fiscalYear;
    });

    return {
      requests: yearRequests,
      balances: balances.map(b => {
        const leaveType = leaveTypes.find(lt => lt.id === b.leaveTypeId);
        return {
          ...b,
          leaveTypeName: leaveType?.name || 'Unknown',
          available: leaveBalanceService.calculateAvailable(b),
        };
      }),
      totalDaysTaken: yearRequests
        .filter(r => ['approved', 'taken', 'completed'].includes(r.status))
        .reduce((sum, r) => sum + (r.totalDays || 0), 0),
    };
  },

  async getDepartmentSummary(departmentId, fiscalYear = new Date().getFullYear()) {
    const db = await getDB();
    const employees = await db.getAll(STORES.EMPLOYEES);
    const requests = await db.getAll(STORES.LEAVE_REQUESTS);

    const deptEmployees = employees.filter(e => e.departmentId === departmentId);
    const employeeIds = deptEmployees.map(e => e.id);

    const deptRequests = requests.filter(r => {
      const date = new Date(r.startDate);
      return employeeIds.includes(r.employeeId) && date.getFullYear() === fiscalYear;
    });

    return {
      totalEmployees: deptEmployees.length,
      totalRequests: deptRequests.length,
      totalDaysTaken: deptRequests
        .filter(r => ['approved', 'taken', 'completed'].includes(r.status))
        .reduce((sum, r) => sum + (r.totalDays || 0), 0),
      pendingRequests: deptRequests.filter(r => r.status === 'pending').length,
      employeesCurrentlyOnLeave: deptRequests.filter(r => {
        const today = new Date();
        const start = new Date(r.startDate);
        const end = new Date(r.endDate);
        return r.status === 'taken' && today >= start && today <= end;
      }).length,
    };
  },

  async getAbsenteeismReport(startDate, endDate) {
    const db = await getDB();
    const attendance = await db.getAll(STORES.ATTENDANCE);
    const employees = await db.getAll(STORES.EMPLOYEES);

    const start = new Date(startDate);
    const end = new Date(endDate);

    const periodAttendance = attendance.filter(a => {
      const date = new Date(a.date);
      return date >= start && date <= end;
    });

    const employeeAbsenteeism = employees
      .filter(e => e.status === 'active')
      .map(e => {
        const empAttendance = periodAttendance.filter(a => a.employeeId === e.id);
        const absentDays = empAttendance.filter(a => a.status === 'absent').length;
        const leaveDays = empAttendance.filter(a => a.status === 'leave').length;
        const presentDays = empAttendance.filter(a => a.status === 'present').length;
        const totalRecords = empAttendance.length;

        return {
          employeeId: e.id,
          employeeName: `${e.firstName} ${e.lastName}`,
          department: e.department,
          absentDays,
          leaveDays,
          presentDays,
          totalRecords,
          absenteeismRate: totalRecords > 0
            ? ((absentDays / totalRecords) * 100).toFixed(2)
            : 0,
        };
      })
      .sort((a, b) => b.absentDays - a.absentDays);

    return {
      period: { startDate, endDate },
      totalAbsences: employeeAbsenteeism.reduce((sum, e) => sum + e.absentDays, 0),
      averageAbsenteeismRate: (
        employeeAbsenteeism.reduce((sum, e) => sum + parseFloat(e.absenteeismRate), 0) /
        employeeAbsenteeism.length
      ).toFixed(2),
      employeeBreakdown: employeeAbsenteeism,
    };
  },
};

// Export all services
export default {
  leavePolicy: leavePolicyService,
  leaveBalance: leaveBalanceService,
  holiday: holidayService,
  timesheet: timesheetService,
  oic: oicService,
  leaveAdjustment: leaveAdjustmentService,
  leaveCarryover: leaveCarryoverService,
  leaveCalendar: leaveCalendarService,
  leaveReport: leaveReportService,
};
