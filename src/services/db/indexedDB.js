import { openDB } from 'idb';

const DB_NAME = 'vdo-erp-db';
const DB_VERSION = 33; // Synchronized version across all services

// Initialize the database
export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      console.log(`IndexedDB: Upgrading from v${oldVersion} to v${newVersion}`);

      // v28: Delete old interview stores (conflicted with HR module) and create new ones
      const oldInterviewStores = [
        'interviewCandidates',
        'interviewEvaluations',
        'interviewResults',
      ];

      oldInterviewStores.forEach(storeName => {
        if (db.objectStoreNames.contains(storeName)) {
          console.log(`IndexedDB: Deleting old store ${storeName}`);
          db.deleteObjectStore(storeName);
        }
      });

      // v27: Force delete ALL recruitment stores to fix index issues
      const allRecruitmentStores = [
        'recruitments',
        'termsOfReferences',
        'staffRequisitions',
        'vacancyAnnouncements',
        'recruitmentCandidates',
        'candidateApplications',
        'candidateEducations',
        'candidateExperiences',
        'recruitmentCommittees',
        'committeeMembers',
        'coiDeclarations',
        'longlistings',
        'longlistingCandidates',
        'shortlistings',
        'shortlistingCandidates',
        'writtenTests',
        'writtenTestCandidates',
        'recruitmentInterviews',
        'recruitmentInterviewCandidates',
        'recruitmentInterviewEvaluations',
        'recruitmentInterviewResults',
        'recruitmentReports',
        'reportCandidates',
        'offerLetters',
        'sanctionClearances',
        'backgroundChecks',
        'referenceChecks',
        'guaranteeLetters',
        'homeAddressVerifications',
        'criminalChecks',
        'employmentContracts',
        'fileChecklists',
        'provinces',
      ];

      // Always delete recruitment stores on any upgrade to ensure correct indexes
      allRecruitmentStores.forEach(storeName => {
        if (db.objectStoreNames.contains(storeName)) {
          console.log(`IndexedDB: Deleting store ${storeName}`);
          db.deleteObjectStore(storeName);
        }
      });

      // Employees store
      if (!db.objectStoreNames.contains('employees')) {
        const employeeStore = db.createObjectStore('employees', {
          keyPath: 'id',
          autoIncrement: true,
        });
        employeeStore.createIndex('employeeId', 'employeeId', { unique: true });
        employeeStore.createIndex('email', 'email', { unique: false });
        employeeStore.createIndex('department', 'department', { unique: false });
        employeeStore.createIndex('status', 'status', { unique: false });
        employeeStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Departments store
      if (!db.objectStoreNames.contains('departments')) {
        const deptStore = db.createObjectStore('departments', {
          keyPath: 'id',
          autoIncrement: true,
        });
        deptStore.createIndex('name', 'name', { unique: true });
      }

      // Positions store
      if (!db.objectStoreNames.contains('positions')) {
        const posStore = db.createObjectStore('positions', {
          keyPath: 'id',
          autoIncrement: true,
        });
        posStore.createIndex('title', 'title', { unique: false });
        posStore.createIndex('department', 'department', { unique: false });
      }

      // Offices store
      if (!db.objectStoreNames.contains('offices')) {
        const officeStore = db.createObjectStore('offices', {
          keyPath: 'id',
          autoIncrement: true,
        });
        officeStore.createIndex('name', 'name', { unique: true });
      }

      // Grades store
      if (!db.objectStoreNames.contains('grades')) {
        const gradeStore = db.createObjectStore('grades', {
          keyPath: 'id',
          autoIncrement: true,
        });
        gradeStore.createIndex('name', 'name', { unique: true });
      }

      // Employee Types store
      if (!db.objectStoreNames.contains('employeeTypes')) {
        const typeStore = db.createObjectStore('employeeTypes', {
          keyPath: 'id',
          autoIncrement: true,
        });
        typeStore.createIndex('name', 'name', { unique: true });
      }

      // Work Schedules store
      if (!db.objectStoreNames.contains('workSchedules')) {
        const scheduleStore = db.createObjectStore('workSchedules', {
          keyPath: 'id',
          autoIncrement: true,
        });
        scheduleStore.createIndex('name', 'name', { unique: true });
      }

      // Document Types store
      if (!db.objectStoreNames.contains('documentTypes')) {
        const docTypeStore = db.createObjectStore('documentTypes', {
          keyPath: 'id',
          autoIncrement: true,
        });
        docTypeStore.createIndex('name', 'name', { unique: true });
      }

      // Template Documents store (for downloadable templates)
      if (!db.objectStoreNames.contains('templateDocuments')) {
        const templateStore = db.createObjectStore('templateDocuments', {
          keyPath: 'id',
          autoIncrement: true,
        });
        templateStore.createIndex('name', 'name', { unique: false });
        templateStore.createIndex('category', 'category', { unique: false });
        templateStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Users store
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', {
          keyPath: 'id',
          autoIncrement: true,
        });
        userStore.createIndex('email', 'email', { unique: true });
        userStore.createIndex('username', 'username', { unique: true });
        userStore.createIndex('roleId', 'roleId', { unique: false });
        userStore.createIndex('status', 'status', { unique: false });
        userStore.createIndex('employeeId', 'employeeId', { unique: false });
      }

      // Roles store
      if (!db.objectStoreNames.contains('roles')) {
        const roleStore = db.createObjectStore('roles', {
          keyPath: 'id',
          autoIncrement: true,
        });
        roleStore.createIndex('name', 'name', { unique: true });
      }

      // Permissions store
      if (!db.objectStoreNames.contains('permissions')) {
        const permStore = db.createObjectStore('permissions', {
          keyPath: 'id',
          autoIncrement: true,
        });
        permStore.createIndex('name', 'name', { unique: true });
        permStore.createIndex('module', 'module', { unique: false });
      }

      // Role Permissions store (junction table)
      if (!db.objectStoreNames.contains('rolePermissions')) {
        const rpStore = db.createObjectStore('rolePermissions', {
          keyPath: 'id',
          autoIncrement: true,
        });
        rpStore.createIndex('roleId', 'roleId', { unique: false });
        rpStore.createIndex('permissionId', 'permissionId', { unique: false });
      }

      // Attendance store
      if (!db.objectStoreNames.contains('attendance')) {
        const attendanceStore = db.createObjectStore('attendance', {
          keyPath: 'id',
          autoIncrement: true,
        });
        attendanceStore.createIndex('employeeId', 'employeeId', { unique: false });
        attendanceStore.createIndex('date', 'date', { unique: false });
        attendanceStore.createIndex('status', 'status', { unique: false });
        // Compound index for employee + date (to ensure one record per day per employee)
        attendanceStore.createIndex('employeeDate', ['employeeId', 'date'], { unique: true });
      }

      // Leave Types store
      if (!db.objectStoreNames.contains('leaveTypes')) {
        const leaveTypeStore = db.createObjectStore('leaveTypes', {
          keyPath: 'id',
          autoIncrement: true,
        });
        leaveTypeStore.createIndex('name', 'name', { unique: true });
        leaveTypeStore.createIndex('status', 'status', { unique: false });
      }

      // Leave Requests store
      if (!db.objectStoreNames.contains('leaveRequests')) {
        const leaveRequestStore = db.createObjectStore('leaveRequests', {
          keyPath: 'id',
          autoIncrement: true,
        });
        leaveRequestStore.createIndex('employeeId', 'employeeId', { unique: false });
        leaveRequestStore.createIndex('leaveTypeId', 'leaveTypeId', { unique: false });
        leaveRequestStore.createIndex('status', 'status', { unique: false });
        leaveRequestStore.createIndex('startDate', 'startDate', { unique: false });
        leaveRequestStore.createIndex('endDate', 'endDate', { unique: false });
      }

      // Job Requisitions store
      if (!db.objectStoreNames.contains('jobRequisitions')) {
        const reqStore = db.createObjectStore('jobRequisitions', {
          keyPath: 'id',
          autoIncrement: true,
        });
        reqStore.createIndex('requisitionId', 'requisitionId', { unique: true });
        reqStore.createIndex('department', 'department', { unique: false });
        reqStore.createIndex('position', 'position', { unique: false });
        reqStore.createIndex('status', 'status', { unique: false });
        reqStore.createIndex('priority', 'priority', { unique: false });
        reqStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Candidates store
      if (!db.objectStoreNames.contains('candidates')) {
        const candidateStore = db.createObjectStore('candidates', {
          keyPath: 'id',
          autoIncrement: true,
        });
        candidateStore.createIndex('email', 'email', { unique: true });
        candidateStore.createIndex('requisitionId', 'requisitionId', { unique: false });
        candidateStore.createIndex('status', 'status', { unique: false });
        candidateStore.createIndex('stage', 'stage', { unique: false });
        candidateStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Interviews store
      if (!db.objectStoreNames.contains('interviews')) {
        const interviewStore = db.createObjectStore('interviews', {
          keyPath: 'id',
          autoIncrement: true,
        });
        interviewStore.createIndex('candidateId', 'candidateId', { unique: false });
        interviewStore.createIndex('requisitionId', 'requisitionId', { unique: false });
        interviewStore.createIndex('interviewerId', 'interviewerId', { unique: false });
        interviewStore.createIndex('scheduledDate', 'scheduledDate', { unique: false });
        interviewStore.createIndex('status', 'status', { unique: false });
      }

      // Job Offers store
      if (!db.objectStoreNames.contains('jobOffers')) {
        const offerStore = db.createObjectStore('jobOffers', {
          keyPath: 'id',
          autoIncrement: true,
        });
        offerStore.createIndex('candidateId', 'candidateId', { unique: false });
        offerStore.createIndex('requisitionId', 'requisitionId', { unique: false });
        offerStore.createIndex('status', 'status', { unique: false });
        offerStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Job Announcements store
      if (!db.objectStoreNames.contains('jobAnnouncements')) {
        const announcementStore = db.createObjectStore('jobAnnouncements', {
          keyPath: 'id',
          autoIncrement: true,
        });
        announcementStore.createIndex('announcementId', 'announcementId', { unique: true });
        announcementStore.createIndex('requisitionId', 'requisitionId', { unique: false });
        announcementStore.createIndex('status', 'status', { unique: false });
        announcementStore.createIndex('publishDate', 'publishDate', { unique: false });
        announcementStore.createIndex('closingDate', 'closingDate', { unique: false });
        announcementStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // ========== HR MODULE EXTENDED TABLES (Policy Compliance) ==========

      // ========== CONTRACT MANAGEMENT (Chapter 4) ==========

      // Contract Types store
      if (!db.objectStoreNames.contains('contractTypes')) {
        const contractTypeStore = db.createObjectStore('contractTypes', {
          keyPath: 'id',
          autoIncrement: true,
        });
        contractTypeStore.createIndex('name', 'name', { unique: true });
        contractTypeStore.createIndex('category', 'category', { unique: false }); // permanent, project, consultant
        contractTypeStore.createIndex('isActive', 'isActive', { unique: false });
      }

      // Employee Contracts store
      if (!db.objectStoreNames.contains('employeeContracts')) {
        const empContractStore = db.createObjectStore('employeeContracts', {
          keyPath: 'id',
          autoIncrement: true,
        });
        empContractStore.createIndex('contractNumber', 'contractNumber', { unique: true });
        empContractStore.createIndex('employeeId', 'employeeId', { unique: false });
        empContractStore.createIndex('contractTypeId', 'contractTypeId', { unique: false });
        empContractStore.createIndex('projectId', 'projectId', { unique: false });
        empContractStore.createIndex('startDate', 'startDate', { unique: false });
        empContractStore.createIndex('endDate', 'endDate', { unique: false });
        empContractStore.createIndex('status', 'status', { unique: false }); // draft, active, expired, terminated
        empContractStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Contract Amendments store
      if (!db.objectStoreNames.contains('contractAmendments')) {
        const amendmentStore = db.createObjectStore('contractAmendments', {
          keyPath: 'id',
          autoIncrement: true,
        });
        amendmentStore.createIndex('amendmentNumber', 'amendmentNumber', { unique: true });
        amendmentStore.createIndex('contractId', 'contractId', { unique: false });
        amendmentStore.createIndex('amendmentType', 'amendmentType', { unique: false }); // extension, salary, position, termination
        amendmentStore.createIndex('effectiveDate', 'effectiveDate', { unique: false });
        amendmentStore.createIndex('status', 'status', { unique: false });
        amendmentStore.createIndex('approvedBy', 'approvedBy', { unique: false });
        amendmentStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // ========== PROBATION & ORIENTATION (Chapter 5) ==========

      // Orientation Checklists store
      if (!db.objectStoreNames.contains('orientationChecklists')) {
        const orientationStore = db.createObjectStore('orientationChecklists', {
          keyPath: 'id',
          autoIncrement: true,
        });
        orientationStore.createIndex('employeeId', 'employeeId', { unique: false });
        orientationStore.createIndex('status', 'status', { unique: false }); // pending, in_progress, completed
        orientationStore.createIndex('startDate', 'startDate', { unique: false });
        orientationStore.createIndex('completionDate', 'completionDate', { unique: false });
        orientationStore.createIndex('conductedBy', 'conductedBy', { unique: false });
      }

      // Orientation Items store (checklist items)
      if (!db.objectStoreNames.contains('orientationItems')) {
        const orientationItemStore = db.createObjectStore('orientationItems', {
          keyPath: 'id',
          autoIncrement: true,
        });
        orientationItemStore.createIndex('checklistId', 'checklistId', { unique: false });
        orientationItemStore.createIndex('itemName', 'itemName', { unique: false });
        orientationItemStore.createIndex('category', 'category', { unique: false }); // policies, systems, team, security
        orientationItemStore.createIndex('isCompleted', 'isCompleted', { unique: false });
        orientationItemStore.createIndex('completedDate', 'completedDate', { unique: false });
      }

      // Probation Records store
      if (!db.objectStoreNames.contains('probationRecords')) {
        const probationStore = db.createObjectStore('probationRecords', {
          keyPath: 'id',
          autoIncrement: true,
        });
        probationStore.createIndex('employeeId', 'employeeId', { unique: false });
        probationStore.createIndex('contractId', 'contractId', { unique: false });
        probationStore.createIndex('startDate', 'startDate', { unique: false });
        probationStore.createIndex('endDate', 'endDate', { unique: false });
        probationStore.createIndex('status', 'status', { unique: false }); // active, extended, confirmed, terminated
        probationStore.createIndex('durationMonths', 'durationMonths', { unique: false });
      }

      // Probation Evaluations store
      if (!db.objectStoreNames.contains('probationEvaluations')) {
        const probEvalStore = db.createObjectStore('probationEvaluations', {
          keyPath: 'id',
          autoIncrement: true,
        });
        probEvalStore.createIndex('probationId', 'probationId', { unique: false });
        probEvalStore.createIndex('employeeId', 'employeeId', { unique: false });
        probEvalStore.createIndex('evaluatorId', 'evaluatorId', { unique: false });
        probEvalStore.createIndex('evaluationDate', 'evaluationDate', { unique: false });
        probEvalStore.createIndex('outcome', 'outcome', { unique: false }); // confirm, extend, terminate
        probEvalStore.createIndex('overallRating', 'overallRating', { unique: false });
      }

      // ========== EXTENDED RECRUITMENT (Chapter 3) ==========
      // NOTE: Old recruitment stores removed - now using the new Recruitment Management System stores below

      // Test Results store (legacy - kept for backwards compatibility)
      if (!db.objectStoreNames.contains('testResults')) {
        const testResultStore = db.createObjectStore('testResults', {
          keyPath: 'id',
          autoIncrement: true,
        });
        testResultStore.createIndex('testId', 'testId', { unique: false });
        testResultStore.createIndex('candidateId', 'candidateId', { unique: false });
        testResultStore.createIndex('score', 'score', { unique: false });
        testResultStore.createIndex('isPassed', 'isPassed', { unique: false });
        testResultStore.createIndex('evaluatedBy', 'evaluatedBy', { unique: false });
      }

      // Legacy shortlistingScores store (kept for backwards compatibility)
      if (!db.objectStoreNames.contains('shortlistingScores')) {
        const shortlistStore = db.createObjectStore('shortlistingScores', {
          keyPath: 'id',
          autoIncrement: true,
        });
        shortlistStore.createIndex('candidateId', 'candidateId', { unique: false });
        shortlistStore.createIndex('requisitionId', 'requisitionId', { unique: false });
        shortlistStore.createIndex('criteriaName', 'criteriaName', { unique: false });
        shortlistStore.createIndex('weight', 'weight', { unique: false });
        shortlistStore.createIndex('score', 'score', { unique: false });
        shortlistStore.createIndex('evaluatorId', 'evaluatorId', { unique: false });
      }

      // ========== COMPENSATION & BENEFITS EXTENDED (Chapter 6) ==========

      // Allowance Types store
      if (!db.objectStoreNames.contains('allowanceTypes')) {
        const allowanceTypeStore = db.createObjectStore('allowanceTypes', {
          keyPath: 'id',
          autoIncrement: true,
        });
        allowanceTypeStore.createIndex('name', 'name', { unique: true });
        allowanceTypeStore.createIndex('code', 'code', { unique: true });
        allowanceTypeStore.createIndex('category', 'category', { unique: false }); // communication, transport, mahram, housing
        allowanceTypeStore.createIndex('isTaxable', 'isTaxable', { unique: false });
        allowanceTypeStore.createIndex('isActive', 'isActive', { unique: false });
      }

      // Employee Allowances store
      if (!db.objectStoreNames.contains('employeeAllowances')) {
        const empAllowanceStore = db.createObjectStore('employeeAllowances', {
          keyPath: 'id',
          autoIncrement: true,
        });
        empAllowanceStore.createIndex('employeeId', 'employeeId', { unique: false });
        empAllowanceStore.createIndex('allowanceTypeId', 'allowanceTypeId', { unique: false });
        empAllowanceStore.createIndex('amount', 'amount', { unique: false });
        empAllowanceStore.createIndex('effectiveFrom', 'effectiveFrom', { unique: false });
        empAllowanceStore.createIndex('effectiveTo', 'effectiveTo', { unique: false });
        empAllowanceStore.createIndex('status', 'status', { unique: false });
      }

      // Salary Advances store
      if (!db.objectStoreNames.contains('salaryAdvances')) {
        const advanceStore = db.createObjectStore('salaryAdvances', {
          keyPath: 'id',
          autoIncrement: true,
        });
        advanceStore.createIndex('advanceNumber', 'advanceNumber', { unique: true });
        advanceStore.createIndex('employeeId', 'employeeId', { unique: false });
        advanceStore.createIndex('amount', 'amount', { unique: false });
        advanceStore.createIndex('requestDate', 'requestDate', { unique: false });
        advanceStore.createIndex('reason', 'reason', { unique: false });
        advanceStore.createIndex('status', 'status', { unique: false }); // pending, approved, rejected, repaid
        advanceStore.createIndex('approvedBy', 'approvedBy', { unique: false });
        advanceStore.createIndex('repaymentStatus', 'repaymentStatus', { unique: false });
      }

      // Employee Rewards store
      if (!db.objectStoreNames.contains('employeeRewards')) {
        const rewardStore = db.createObjectStore('employeeRewards', {
          keyPath: 'id',
          autoIncrement: true,
        });
        rewardStore.createIndex('employeeId', 'employeeId', { unique: false });
        rewardStore.createIndex('rewardType', 'rewardType', { unique: false }); // bonus, certificate, appreciation, increment
        rewardStore.createIndex('awardDate', 'awardDate', { unique: false });
        rewardStore.createIndex('reason', 'reason', { unique: false });
        rewardStore.createIndex('amount', 'amount', { unique: false });
        rewardStore.createIndex('awardedBy', 'awardedBy', { unique: false });
      }

      // ========== LEAVE EXTENDED (Chapter 7) ==========

      // Leave Balances store
      if (!db.objectStoreNames.contains('leaveBalances')) {
        const leaveBalStore = db.createObjectStore('leaveBalances', {
          keyPath: 'id',
          autoIncrement: true,
        });
        leaveBalStore.createIndex('employeeId', 'employeeId', { unique: false });
        leaveBalStore.createIndex('leaveTypeId', 'leaveTypeId', { unique: false });
        leaveBalStore.createIndex('year', 'year', { unique: false });
        leaveBalStore.createIndex('entitled', 'entitled', { unique: false });
        leaveBalStore.createIndex('used', 'used', { unique: false });
        leaveBalStore.createIndex('balance', 'balance', { unique: false });
        leaveBalStore.createIndex('carriedForward', 'carriedForward', { unique: false });
      }

      // CTO Records store (Compensated Time Off)
      if (!db.objectStoreNames.contains('ctoRecords')) {
        const ctoStore = db.createObjectStore('ctoRecords', {
          keyPath: 'id',
          autoIncrement: true,
        });
        ctoStore.createIndex('employeeId', 'employeeId', { unique: false });
        ctoStore.createIndex('earnedDate', 'earnedDate', { unique: false });
        ctoStore.createIndex('hoursEarned', 'hoursEarned', { unique: false });
        ctoStore.createIndex('hoursUsed', 'hoursUsed', { unique: false });
        ctoStore.createIndex('reason', 'reason', { unique: false });
        ctoStore.createIndex('approvedBy', 'approvedBy', { unique: false });
        ctoStore.createIndex('expiryDate', 'expiryDate', { unique: false });
        ctoStore.createIndex('status', 'status', { unique: false }); // earned, partially_used, fully_used, expired
      }

      // Leave Approvals store (multi-level approval)
      if (!db.objectStoreNames.contains('leaveApprovals')) {
        const leaveAppStore = db.createObjectStore('leaveApprovals', {
          keyPath: 'id',
          autoIncrement: true,
        });
        leaveAppStore.createIndex('leaveRequestId', 'leaveRequestId', { unique: false });
        leaveAppStore.createIndex('approverId', 'approverId', { unique: false });
        leaveAppStore.createIndex('approvalLevel', 'approvalLevel', { unique: false });
        leaveAppStore.createIndex('status', 'status', { unique: false });
        leaveAppStore.createIndex('approvalDate', 'approvalDate', { unique: false });
        leaveAppStore.createIndex('comments', 'comments', { unique: false });
      }

      // ========== PERFORMANCE MANAGEMENT (Chapter 8) ==========

      // Appraisal Periods store
      if (!db.objectStoreNames.contains('appraisalPeriods')) {
        const periodStore = db.createObjectStore('appraisalPeriods', {
          keyPath: 'id',
          autoIncrement: true,
        });
        periodStore.createIndex('name', 'name', { unique: false });
        periodStore.createIndex('year', 'year', { unique: false });
        periodStore.createIndex('startDate', 'startDate', { unique: false });
        periodStore.createIndex('endDate', 'endDate', { unique: false });
        periodStore.createIndex('status', 'status', { unique: false }); // draft, active, completed
      }

      // Appraisal Criteria store
      if (!db.objectStoreNames.contains('appraisalCriteria')) {
        const criteriaStore = db.createObjectStore('appraisalCriteria', {
          keyPath: 'id',
          autoIncrement: true,
        });
        criteriaStore.createIndex('name', 'name', { unique: false });
        criteriaStore.createIndex('category', 'category', { unique: false }); // technical, behavioral, organizational
        criteriaStore.createIndex('weight', 'weight', { unique: false });
        criteriaStore.createIndex('isActive', 'isActive', { unique: false });
      }

      // Performance Appraisals store
      if (!db.objectStoreNames.contains('performanceAppraisals')) {
        const appraisalStore = db.createObjectStore('performanceAppraisals', {
          keyPath: 'id',
          autoIncrement: true,
        });
        appraisalStore.createIndex('appraisalId', 'appraisalId', { unique: true });
        appraisalStore.createIndex('employeeId', 'employeeId', { unique: false });
        appraisalStore.createIndex('periodId', 'periodId', { unique: false });
        appraisalStore.createIndex('evaluatorId', 'evaluatorId', { unique: false });
        appraisalStore.createIndex('status', 'status', { unique: false }); // draft, self_assessment, supervisor_review, completed
        appraisalStore.createIndex('overallRating', 'overallRating', { unique: false });
        appraisalStore.createIndex('submissionDate', 'submissionDate', { unique: false });
      }

      // Appraisal Scores store
      if (!db.objectStoreNames.contains('appraisalScores')) {
        const scoreStore = db.createObjectStore('appraisalScores', {
          keyPath: 'id',
          autoIncrement: true,
        });
        scoreStore.createIndex('appraisalId', 'appraisalId', { unique: false });
        scoreStore.createIndex('criteriaId', 'criteriaId', { unique: false });
        scoreStore.createIndex('selfScore', 'selfScore', { unique: false });
        scoreStore.createIndex('supervisorScore', 'supervisorScore', { unique: false });
        scoreStore.createIndex('finalScore', 'finalScore', { unique: false });
      }

      // Performance Improvement Plans store
      if (!db.objectStoreNames.contains('performanceImprovementPlans')) {
        const pipStore = db.createObjectStore('performanceImprovementPlans', {
          keyPath: 'id',
          autoIncrement: true,
        });
        pipStore.createIndex('pipId', 'pipId', { unique: true });
        pipStore.createIndex('employeeId', 'employeeId', { unique: false });
        pipStore.createIndex('appraisalId', 'appraisalId', { unique: false });
        pipStore.createIndex('startDate', 'startDate', { unique: false });
        pipStore.createIndex('endDate', 'endDate', { unique: false });
        pipStore.createIndex('status', 'status', { unique: false }); // active, completed, extended, failed
        pipStore.createIndex('supervisorId', 'supervisorId', { unique: false });
      }

      // PIP Goals store
      if (!db.objectStoreNames.contains('pipGoals')) {
        const pipGoalStore = db.createObjectStore('pipGoals', {
          keyPath: 'id',
          autoIncrement: true,
        });
        pipGoalStore.createIndex('pipId', 'pipId', { unique: false });
        pipGoalStore.createIndex('goalDescription', 'goalDescription', { unique: false });
        pipGoalStore.createIndex('targetDate', 'targetDate', { unique: false });
        pipGoalStore.createIndex('status', 'status', { unique: false });
        pipGoalStore.createIndex('progressPercentage', 'progressPercentage', { unique: false });
      }

      // PIP Progress Reviews store
      if (!db.objectStoreNames.contains('pipProgressReviews')) {
        const pipReviewStore = db.createObjectStore('pipProgressReviews', {
          keyPath: 'id',
          autoIncrement: true,
        });
        pipReviewStore.createIndex('pipId', 'pipId', { unique: false });
        pipReviewStore.createIndex('reviewDate', 'reviewDate', { unique: false });
        pipReviewStore.createIndex('reviewerId', 'reviewerId', { unique: false });
        pipReviewStore.createIndex('overallProgress', 'overallProgress', { unique: false });
        pipReviewStore.createIndex('recommendation', 'recommendation', { unique: false });
      }

      // ========== TRAINING & DEVELOPMENT (Chapter 9) ==========

      // Training Types store
      if (!db.objectStoreNames.contains('trainingTypes')) {
        const trainTypeStore = db.createObjectStore('trainingTypes', {
          keyPath: 'id',
          autoIncrement: true,
        });
        trainTypeStore.createIndex('name', 'name', { unique: true });
        trainTypeStore.createIndex('category', 'category', { unique: false }); // in_house, external, overseas
        trainTypeStore.createIndex('requiresBond', 'requiresBond', { unique: false });
        trainTypeStore.createIndex('bondDurationMonths', 'bondDurationMonths', { unique: false });
        trainTypeStore.createIndex('isActive', 'isActive', { unique: false });
      }

      // Training Programs store
      if (!db.objectStoreNames.contains('trainingPrograms')) {
        const trainProgStore = db.createObjectStore('trainingPrograms', {
          keyPath: 'id',
          autoIncrement: true,
        });
        trainProgStore.createIndex('programId', 'programId', { unique: true });
        trainProgStore.createIndex('title', 'title', { unique: false });
        trainProgStore.createIndex('trainingTypeId', 'trainingTypeId', { unique: false });
        trainProgStore.createIndex('startDate', 'startDate', { unique: false });
        trainProgStore.createIndex('endDate', 'endDate', { unique: false });
        trainProgStore.createIndex('location', 'location', { unique: false });
        trainProgStore.createIndex('trainer', 'trainer', { unique: false });
        trainProgStore.createIndex('status', 'status', { unique: false }); // planned, in_progress, completed, cancelled
        trainProgStore.createIndex('budget', 'budget', { unique: false });
      }

      // Training Attendance store
      if (!db.objectStoreNames.contains('trainingAttendance')) {
        const trainAttendStore = db.createObjectStore('trainingAttendance', {
          keyPath: 'id',
          autoIncrement: true,
        });
        trainAttendStore.createIndex('programId', 'programId', { unique: false });
        trainAttendStore.createIndex('employeeId', 'employeeId', { unique: false });
        trainAttendStore.createIndex('attendanceStatus', 'attendanceStatus', { unique: false }); // registered, attended, completed, dropped
        trainAttendStore.createIndex('completionDate', 'completionDate', { unique: false });
        trainAttendStore.createIndex('certificateIssued', 'certificateIssued', { unique: false });
        trainAttendStore.createIndex('rating', 'rating', { unique: false });
      }

      // Training Needs Assessments store
      if (!db.objectStoreNames.contains('trainingNeedsAssessments')) {
        const tnaStore = db.createObjectStore('trainingNeedsAssessments', {
          keyPath: 'id',
          autoIncrement: true,
        });
        tnaStore.createIndex('tnaId', 'tnaId', { unique: true });
        tnaStore.createIndex('employeeId', 'employeeId', { unique: false });
        tnaStore.createIndex('departmentId', 'departmentId', { unique: false });
        tnaStore.createIndex('assessmentYear', 'assessmentYear', { unique: false });
        tnaStore.createIndex('assessorId', 'assessorId', { unique: false });
        tnaStore.createIndex('status', 'status', { unique: false });
      }

      // TNA Items store
      if (!db.objectStoreNames.contains('tnaItems')) {
        const tnaItemStore = db.createObjectStore('tnaItems', {
          keyPath: 'id',
          autoIncrement: true,
        });
        tnaItemStore.createIndex('tnaId', 'tnaId', { unique: false });
        tnaItemStore.createIndex('skillGap', 'skillGap', { unique: false });
        tnaItemStore.createIndex('priority', 'priority', { unique: false }); // high, medium, low
        tnaItemStore.createIndex('recommendedTraining', 'recommendedTraining', { unique: false });
        tnaItemStore.createIndex('status', 'status', { unique: false });
      }

      // Individual Development Plans store
      if (!db.objectStoreNames.contains('individualDevelopmentPlans')) {
        const idpStore = db.createObjectStore('individualDevelopmentPlans', {
          keyPath: 'id',
          autoIncrement: true,
        });
        idpStore.createIndex('idpId', 'idpId', { unique: true });
        idpStore.createIndex('employeeId', 'employeeId', { unique: false });
        idpStore.createIndex('year', 'year', { unique: false });
        idpStore.createIndex('status', 'status', { unique: false });
        idpStore.createIndex('supervisorId', 'supervisorId', { unique: false });
        idpStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // IDP Goals store
      if (!db.objectStoreNames.contains('idpGoals')) {
        const idpGoalStore = db.createObjectStore('idpGoals', {
          keyPath: 'id',
          autoIncrement: true,
        });
        idpGoalStore.createIndex('idpId', 'idpId', { unique: false });
        idpGoalStore.createIndex('goalType', 'goalType', { unique: false }); // career, skill, certification
        idpGoalStore.createIndex('targetDate', 'targetDate', { unique: false });
        idpGoalStore.createIndex('status', 'status', { unique: false });
        idpGoalStore.createIndex('progressPercentage', 'progressPercentage', { unique: false });
      }

      // Training Bonds store
      if (!db.objectStoreNames.contains('trainingBonds')) {
        const bondStore = db.createObjectStore('trainingBonds', {
          keyPath: 'id',
          autoIncrement: true,
        });
        bondStore.createIndex('bondId', 'bondId', { unique: true });
        bondStore.createIndex('employeeId', 'employeeId', { unique: false });
        bondStore.createIndex('programId', 'programId', { unique: false });
        bondStore.createIndex('bondAmount', 'bondAmount', { unique: false });
        bondStore.createIndex('startDate', 'startDate', { unique: false });
        bondStore.createIndex('endDate', 'endDate', { unique: false });
        bondStore.createIndex('status', 'status', { unique: false }); // active, completed, breached
      }

      // ========== CODE OF CONDUCT & DISCIPLINE (Chapter 10) ==========

      // Conduct Acknowledgments store
      if (!db.objectStoreNames.contains('conductAcknowledgments')) {
        const conductStore = db.createObjectStore('conductAcknowledgments', {
          keyPath: 'id',
          autoIncrement: true,
        });
        conductStore.createIndex('employeeId', 'employeeId', { unique: false });
        conductStore.createIndex('documentType', 'documentType', { unique: false }); // code_of_conduct, hr_policy, confidentiality, data_protection
        conductStore.createIndex('acknowledgmentDate', 'acknowledgmentDate', { unique: false });
        conductStore.createIndex('version', 'version', { unique: false });
        conductStore.createIndex('witnessedBy', 'witnessedBy', { unique: false });
      }

      // PSEA Declarations store
      if (!db.objectStoreNames.contains('pseaDeclarations')) {
        const pseaStore = db.createObjectStore('pseaDeclarations', {
          keyPath: 'id',
          autoIncrement: true,
        });
        pseaStore.createIndex('employeeId', 'employeeId', { unique: false });
        pseaStore.createIndex('declarationDate', 'declarationDate', { unique: false });
        pseaStore.createIndex('trainingCompleted', 'trainingCompleted', { unique: false });
        pseaStore.createIndex('trainingDate', 'trainingDate', { unique: false });
        pseaStore.createIndex('validUntil', 'validUntil', { unique: false });
      }

      // Conflict of Interest Declarations store
      if (!db.objectStoreNames.contains('coiDeclarations')) {
        const coiStore = db.createObjectStore('coiDeclarations', {
          keyPath: 'id',
          autoIncrement: true,
        });
        coiStore.createIndex('employeeId', 'employeeId', { unique: false });
        coiStore.createIndex('declarationDate', 'declarationDate', { unique: false });
        coiStore.createIndex('hasConflict', 'hasConflict', { unique: false });
        coiStore.createIndex('resolutionStatus', 'resolutionStatus', { unique: false });
        coiStore.createIndex('reviewedBy', 'reviewedBy', { unique: false });
      }

      // Disciplinary Types store
      if (!db.objectStoreNames.contains('disciplinaryTypes')) {
        const discTypeStore = db.createObjectStore('disciplinaryTypes', {
          keyPath: 'id',
          autoIncrement: true,
        });
        discTypeStore.createIndex('name', 'name', { unique: true });
        discTypeStore.createIndex('severity', 'severity', { unique: false }); // minor, moderate, major, gross
        discTypeStore.createIndex('defaultAction', 'defaultAction', { unique: false }); // verbal_warning, written_warning, suspension, termination
        discTypeStore.createIndex('isActive', 'isActive', { unique: false });
      }

      // Disciplinary Actions store
      if (!db.objectStoreNames.contains('disciplinaryActions')) {
        const discActionStore = db.createObjectStore('disciplinaryActions', {
          keyPath: 'id',
          autoIncrement: true,
        });
        discActionStore.createIndex('caseNumber', 'caseNumber', { unique: true });
        discActionStore.createIndex('employeeId', 'employeeId', { unique: false });
        discActionStore.createIndex('disciplinaryTypeId', 'disciplinaryTypeId', { unique: false });
        discActionStore.createIndex('incidentDate', 'incidentDate', { unique: false });
        discActionStore.createIndex('reportedDate', 'reportedDate', { unique: false });
        discActionStore.createIndex('actionTaken', 'actionTaken', { unique: false });
        discActionStore.createIndex('status', 'status', { unique: false }); // reported, investigating, action_taken, closed, appealed
        discActionStore.createIndex('issuedBy', 'issuedBy', { unique: false });
        discActionStore.createIndex('witnessId', 'witnessId', { unique: false });
      }

      // ========== GRIEVANCE MECHANISM (Chapter 12) ==========

      // Grievance Types store
      if (!db.objectStoreNames.contains('grievanceTypes')) {
        const grievTypeStore = db.createObjectStore('grievanceTypes', {
          keyPath: 'id',
          autoIncrement: true,
        });
        grievTypeStore.createIndex('name', 'name', { unique: true });
        grievTypeStore.createIndex('category', 'category', { unique: false }); // workplace, management, harassment, discrimination, safety
        grievTypeStore.createIndex('isActive', 'isActive', { unique: false });
      }

      // Grievances store
      if (!db.objectStoreNames.contains('grievances')) {
        const grievanceStore = db.createObjectStore('grievances', {
          keyPath: 'id',
          autoIncrement: true,
        });
        grievanceStore.createIndex('grievanceNumber', 'grievanceNumber', { unique: true });
        grievanceStore.createIndex('employeeId', 'employeeId', { unique: false });
        grievanceStore.createIndex('grievanceTypeId', 'grievanceTypeId', { unique: false });
        grievanceStore.createIndex('submissionDate', 'submissionDate', { unique: false });
        grievanceStore.createIndex('status', 'status', { unique: false }); // submitted, acknowledged, investigating, resolved, appealed, closed
        grievanceStore.createIndex('priority', 'priority', { unique: false });
        grievanceStore.createIndex('isConfidential', 'isConfidential', { unique: false });
        grievanceStore.createIndex('assignedTo', 'assignedTo', { unique: false });
      }

      // Grievance Investigations store
      if (!db.objectStoreNames.contains('grievanceInvestigations')) {
        const grievInvStore = db.createObjectStore('grievanceInvestigations', {
          keyPath: 'id',
          autoIncrement: true,
        });
        grievInvStore.createIndex('grievanceId', 'grievanceId', { unique: false });
        grievInvStore.createIndex('investigatorId', 'investigatorId', { unique: false });
        grievInvStore.createIndex('startDate', 'startDate', { unique: false });
        grievInvStore.createIndex('endDate', 'endDate', { unique: false });
        grievInvStore.createIndex('status', 'status', { unique: false });
        grievInvStore.createIndex('findings', 'findings', { unique: false });
      }

      // Grievance Resolutions store
      if (!db.objectStoreNames.contains('grievanceResolutions')) {
        const grievResStore = db.createObjectStore('grievanceResolutions', {
          keyPath: 'id',
          autoIncrement: true,
        });
        grievResStore.createIndex('grievanceId', 'grievanceId', { unique: false });
        grievResStore.createIndex('resolutionDate', 'resolutionDate', { unique: false });
        grievResStore.createIndex('resolutionType', 'resolutionType', { unique: false }); // mediation, corrective_action, disciplinary, dismissed
        grievResStore.createIndex('resolvedBy', 'resolvedBy', { unique: false });
        grievResStore.createIndex('appealable', 'appealable', { unique: false });
        grievResStore.createIndex('appealDeadline', 'appealDeadline', { unique: false });
      }

      // ========== ASSET & ID MANAGEMENT (Chapter 13) ==========

      // Asset Types store
      if (!db.objectStoreNames.contains('assetTypes')) {
        const assetTypeStore = db.createObjectStore('assetTypes', {
          keyPath: 'id',
          autoIncrement: true,
        });
        assetTypeStore.createIndex('name', 'name', { unique: true });
        assetTypeStore.createIndex('category', 'category', { unique: false }); // IT, furniture, vehicle, communication
        assetTypeStore.createIndex('requiresReturn', 'requiresReturn', { unique: false });
        assetTypeStore.createIndex('isActive', 'isActive', { unique: false });
      }

      // Employee Assets store
      if (!db.objectStoreNames.contains('employeeAssets')) {
        const empAssetStore = db.createObjectStore('employeeAssets', {
          keyPath: 'id',
          autoIncrement: true,
        });
        empAssetStore.createIndex('assetTag', 'assetTag', { unique: true });
        empAssetStore.createIndex('employeeId', 'employeeId', { unique: false });
        empAssetStore.createIndex('assetTypeId', 'assetTypeId', { unique: false });
        empAssetStore.createIndex('assignedDate', 'assignedDate', { unique: false });
        empAssetStore.createIndex('returnedDate', 'returnedDate', { unique: false });
        empAssetStore.createIndex('status', 'status', { unique: false }); // assigned, returned, lost, damaged
        empAssetStore.createIndex('condition', 'condition', { unique: false });
        empAssetStore.createIndex('issuedBy', 'issuedBy', { unique: false });
      }

      // ID Cards store
      if (!db.objectStoreNames.contains('idCards')) {
        const idCardStore = db.createObjectStore('idCards', {
          keyPath: 'id',
          autoIncrement: true,
        });
        idCardStore.createIndex('cardNumber', 'cardNumber', { unique: true });
        idCardStore.createIndex('employeeId', 'employeeId', { unique: false });
        idCardStore.createIndex('cardType', 'cardType', { unique: false }); // probation, regular
        idCardStore.createIndex('issueDate', 'issueDate', { unique: false });
        idCardStore.createIndex('expiryDate', 'expiryDate', { unique: false });
        idCardStore.createIndex('status', 'status', { unique: false }); // active, expired, lost, returned
        idCardStore.createIndex('replacementFee', 'replacementFee', { unique: false });
      }

      // SIM Cards store
      if (!db.objectStoreNames.contains('simCards')) {
        const simStore = db.createObjectStore('simCards', {
          keyPath: 'id',
          autoIncrement: true,
        });
        simStore.createIndex('simNumber', 'simNumber', { unique: true });
        simStore.createIndex('phoneNumber', 'phoneNumber', { unique: true });
        simStore.createIndex('employeeId', 'employeeId', { unique: false });
        simStore.createIndex('provider', 'provider', { unique: false });
        simStore.createIndex('assignedDate', 'assignedDate', { unique: false });
        simStore.createIndex('returnedDate', 'returnedDate', { unique: false });
        simStore.createIndex('monthlyLimit', 'monthlyLimit', { unique: false });
        simStore.createIndex('status', 'status', { unique: false }); // active, suspended, returned
      }

      // Employee Emails store
      if (!db.objectStoreNames.contains('employeeEmails')) {
        const emailStore = db.createObjectStore('employeeEmails', {
          keyPath: 'id',
          autoIncrement: true,
        });
        emailStore.createIndex('emailAddress', 'emailAddress', { unique: true });
        emailStore.createIndex('employeeId', 'employeeId', { unique: false });
        emailStore.createIndex('createdDate', 'createdDate', { unique: false });
        emailStore.createIndex('deactivatedDate', 'deactivatedDate', { unique: false });
        emailStore.createIndex('status', 'status', { unique: false }); // active, suspended, deactivated
      }

      // ========== EXIT MANAGEMENT (Chapter 14) ==========

      // Separation Types store
      if (!db.objectStoreNames.contains('separationTypes')) {
        const sepTypeStore = db.createObjectStore('separationTypes', {
          keyPath: 'id',
          autoIncrement: true,
        });
        sepTypeStore.createIndex('name', 'name', { unique: true });
        sepTypeStore.createIndex('category', 'category', { unique: false }); // voluntary, involuntary, natural
        sepTypeStore.createIndex('noticePeriodDays', 'noticePeriodDays', { unique: false });
        sepTypeStore.createIndex('eligibleForCertificate', 'eligibleForCertificate', { unique: false });
        sepTypeStore.createIndex('isActive', 'isActive', { unique: false });
      }

      // Separation Records store
      if (!db.objectStoreNames.contains('separationRecords')) {
        const separationStore = db.createObjectStore('separationRecords', {
          keyPath: 'id',
          autoIncrement: true,
        });
        separationStore.createIndex('separationNumber', 'separationNumber', { unique: true });
        separationStore.createIndex('employeeId', 'employeeId', { unique: false });
        separationStore.createIndex('separationTypeId', 'separationTypeId', { unique: false });
        separationStore.createIndex('requestDate', 'requestDate', { unique: false });
        separationStore.createIndex('effectiveDate', 'effectiveDate', { unique: false });
        separationStore.createIndex('lastWorkingDay', 'lastWorkingDay', { unique: false });
        separationStore.createIndex('status', 'status', { unique: false }); // pending, approved, rejected, in_clearance, completed
        separationStore.createIndex('approvedBy', 'approvedBy', { unique: false });
      }

      // Exit Clearance Departments store
      if (!db.objectStoreNames.contains('exitClearanceDepartments')) {
        const clearDeptStore = db.createObjectStore('exitClearanceDepartments', {
          keyPath: 'id',
          autoIncrement: true,
        });
        clearDeptStore.createIndex('name', 'name', { unique: true });
        clearDeptStore.createIndex('sequence', 'sequence', { unique: false });
        clearDeptStore.createIndex('isRequired', 'isRequired', { unique: false });
        clearDeptStore.createIndex('isActive', 'isActive', { unique: false });
      }

      // Exit Clearances store
      if (!db.objectStoreNames.contains('exitClearances')) {
        const exitClearStore = db.createObjectStore('exitClearances', {
          keyPath: 'id',
          autoIncrement: true,
        });
        exitClearStore.createIndex('separationId', 'separationId', { unique: false });
        exitClearStore.createIndex('departmentId', 'departmentId', { unique: false });
        exitClearStore.createIndex('clearedBy', 'clearedBy', { unique: false });
        exitClearStore.createIndex('clearanceDate', 'clearanceDate', { unique: false });
        exitClearStore.createIndex('status', 'status', { unique: false }); // pending, cleared, outstanding
        exitClearStore.createIndex('outstandingItems', 'outstandingItems', { unique: false });
        exitClearStore.createIndex('outstandingAmount', 'outstandingAmount', { unique: false });
      }

      // Exit Interviews store
      if (!db.objectStoreNames.contains('exitInterviews')) {
        const exitIntStore = db.createObjectStore('exitInterviews', {
          keyPath: 'id',
          autoIncrement: true,
        });
        exitIntStore.createIndex('separationId', 'separationId', { unique: false });
        exitIntStore.createIndex('employeeId', 'employeeId', { unique: false });
        exitIntStore.createIndex('interviewDate', 'interviewDate', { unique: false });
        exitIntStore.createIndex('interviewerId', 'interviewerId', { unique: false });
        exitIntStore.createIndex('reasonForLeaving', 'reasonForLeaving', { unique: false });
        exitIntStore.createIndex('wouldRecommend', 'wouldRecommend', { unique: false });
        exitIntStore.createIndex('wouldReturn', 'wouldReturn', { unique: false });
      }

      // Final Settlements store
      if (!db.objectStoreNames.contains('finalSettlements')) {
        const settlementStore = db.createObjectStore('finalSettlements', {
          keyPath: 'id',
          autoIncrement: true,
        });
        settlementStore.createIndex('settlementNumber', 'settlementNumber', { unique: true });
        settlementStore.createIndex('separationId', 'separationId', { unique: false });
        settlementStore.createIndex('employeeId', 'employeeId', { unique: false });
        settlementStore.createIndex('grossAmount', 'grossAmount', { unique: false });
        settlementStore.createIndex('deductions', 'deductions', { unique: false });
        settlementStore.createIndex('netAmount', 'netAmount', { unique: false });
        settlementStore.createIndex('status', 'status', { unique: false }); // calculated, approved, paid
        settlementStore.createIndex('paymentDate', 'paymentDate', { unique: false });
        settlementStore.createIndex('approvedBy', 'approvedBy', { unique: false });
      }

      // Work Certificates store
      if (!db.objectStoreNames.contains('workCertificates')) {
        const certStore = db.createObjectStore('workCertificates', {
          keyPath: 'id',
          autoIncrement: true,
        });
        certStore.createIndex('certificateNumber', 'certificateNumber', { unique: true });
        certStore.createIndex('employeeId', 'employeeId', { unique: false });
        certStore.createIndex('separationId', 'separationId', { unique: false });
        certStore.createIndex('issueDate', 'issueDate', { unique: false });
        certStore.createIndex('issuedBy', 'issuedBy', { unique: false });
        certStore.createIndex('certificateType', 'certificateType', { unique: false }); // experience, service, employment
      }

      // ========== OFFICIAL TRIPS (Chapter 16) ==========

      // Travel Requests store
      if (!db.objectStoreNames.contains('travelRequests')) {
        const travelStore = db.createObjectStore('travelRequests', {
          keyPath: 'id',
          autoIncrement: true,
        });
        travelStore.createIndex('requestNumber', 'requestNumber', { unique: true });
        travelStore.createIndex('employeeId', 'employeeId', { unique: false });
        travelStore.createIndex('projectId', 'projectId', { unique: false });
        travelStore.createIndex('destination', 'destination', { unique: false });
        travelStore.createIndex('departureDate', 'departureDate', { unique: false });
        travelStore.createIndex('returnDate', 'returnDate', { unique: false });
        travelStore.createIndex('travelMode', 'travelMode', { unique: false }); // road, air
        travelStore.createIndex('status', 'status', { unique: false }); // pending, approved, rejected, completed, cancelled
        travelStore.createIndex('approvedBy', 'approvedBy', { unique: false });
      }

      // Travel Approvals store
      if (!db.objectStoreNames.contains('travelApprovals')) {
        const travelAppStore = db.createObjectStore('travelApprovals', {
          keyPath: 'id',
          autoIncrement: true,
        });
        travelAppStore.createIndex('travelRequestId', 'travelRequestId', { unique: false });
        travelAppStore.createIndex('approverId', 'approverId', { unique: false });
        travelAppStore.createIndex('approvalLevel', 'approvalLevel', { unique: false });
        travelAppStore.createIndex('status', 'status', { unique: false });
        travelAppStore.createIndex('approvalDate', 'approvalDate', { unique: false });
      }

      // DSA Rates store
      if (!db.objectStoreNames.contains('dsaRates')) {
        const dsaRateStore = db.createObjectStore('dsaRates', {
          keyPath: 'id',
          autoIncrement: true,
        });
        dsaRateStore.createIndex('location', 'location', { unique: false });
        dsaRateStore.createIndex('locationType', 'locationType', { unique: false }); // domestic, international
        dsaRateStore.createIndex('dailyRate', 'dailyRate', { unique: false });
        dsaRateStore.createIndex('accommodationRate', 'accommodationRate', { unique: false });
        dsaRateStore.createIndex('effectiveFrom', 'effectiveFrom', { unique: false });
        dsaRateStore.createIndex('effectiveTo', 'effectiveTo', { unique: false });
        dsaRateStore.createIndex('isActive', 'isActive', { unique: false });
      }

      // DSA Payments store
      if (!db.objectStoreNames.contains('dsaPayments')) {
        const dsaPayStore = db.createObjectStore('dsaPayments', {
          keyPath: 'id',
          autoIncrement: true,
        });
        dsaPayStore.createIndex('paymentNumber', 'paymentNumber', { unique: true });
        dsaPayStore.createIndex('travelRequestId', 'travelRequestId', { unique: false });
        dsaPayStore.createIndex('employeeId', 'employeeId', { unique: false });
        dsaPayStore.createIndex('numberOfDays', 'numberOfDays', { unique: false });
        dsaPayStore.createIndex('dailyRate', 'dailyRate', { unique: false });
        dsaPayStore.createIndex('totalAmount', 'totalAmount', { unique: false });
        dsaPayStore.createIndex('advanceAmount', 'advanceAmount', { unique: false });
        dsaPayStore.createIndex('settlementAmount', 'settlementAmount', { unique: false });
        dsaPayStore.createIndex('status', 'status', { unique: false }); // advance_paid, settled
      }

      // Mahram Travel store
      if (!db.objectStoreNames.contains('mahramTravel')) {
        const mahramStore = db.createObjectStore('mahramTravel', {
          keyPath: 'id',
          autoIncrement: true,
        });
        mahramStore.createIndex('travelRequestId', 'travelRequestId', { unique: false });
        mahramStore.createIndex('employeeId', 'employeeId', { unique: false });
        mahramStore.createIndex('mahramName', 'mahramName', { unique: false });
        mahramStore.createIndex('relationship', 'relationship', { unique: false }); // husband, father, brother, son
        mahramStore.createIndex('accommodationAllowance', 'accommodationAllowance', { unique: false });
        mahramStore.createIndex('dsaAmount', 'dsaAmount', { unique: false });
        mahramStore.createIndex('verificationStatus', 'verificationStatus', { unique: false });
      }

      // Work Related Injuries store
      if (!db.objectStoreNames.contains('workRelatedInjuries')) {
        const injuryStore = db.createObjectStore('workRelatedInjuries', {
          keyPath: 'id',
          autoIncrement: true,
        });
        injuryStore.createIndex('incidentNumber', 'incidentNumber', { unique: true });
        injuryStore.createIndex('employeeId', 'employeeId', { unique: false });
        injuryStore.createIndex('incidentDate', 'incidentDate', { unique: false });
        injuryStore.createIndex('incidentLocation', 'incidentLocation', { unique: false }); // office, travel, field
        injuryStore.createIndex('injuryType', 'injuryType', { unique: false });
        injuryStore.createIndex('reportedDate', 'reportedDate', { unique: false });
        injuryStore.createIndex('status', 'status', { unique: false }); // reported, investigating, approved, rejected, settled
        injuryStore.createIndex('claimAmount', 'claimAmount', { unique: false });
        injuryStore.createIndex('approvedAmount', 'approvedAmount', { unique: false });
      }

      // ========== STAFF ASSOCIATION (Chapter 17) ==========

      // Staff Association Positions store
      if (!db.objectStoreNames.contains('staffAssociationPositions')) {
        const assocPosStore = db.createObjectStore('staffAssociationPositions', {
          keyPath: 'id',
          autoIncrement: true,
        });
        assocPosStore.createIndex('title', 'title', { unique: true }); // president, vice_president, secretary, treasurer
        assocPosStore.createIndex('isExecutive', 'isExecutive', { unique: false });
        assocPosStore.createIndex('isActive', 'isActive', { unique: false });
      }

      // Staff Association Members store
      if (!db.objectStoreNames.contains('staffAssociationMembers')) {
        const assocMemStore = db.createObjectStore('staffAssociationMembers', {
          keyPath: 'id',
          autoIncrement: true,
        });
        assocMemStore.createIndex('employeeId', 'employeeId', { unique: false });
        assocMemStore.createIndex('positionId', 'positionId', { unique: false });
        assocMemStore.createIndex('termStart', 'termStart', { unique: false });
        assocMemStore.createIndex('termEnd', 'termEnd', { unique: false });
        assocMemStore.createIndex('status', 'status', { unique: false }); // active, resigned, term_ended
        assocMemStore.createIndex('electionDate', 'electionDate', { unique: false });
      }

      // Association Meetings store
      if (!db.objectStoreNames.contains('associationMeetings')) {
        const meetingStore = db.createObjectStore('associationMeetings', {
          keyPath: 'id',
          autoIncrement: true,
        });
        meetingStore.createIndex('meetingNumber', 'meetingNumber', { unique: true });
        meetingStore.createIndex('meetingType', 'meetingType', { unique: false }); // regular, agm, special
        meetingStore.createIndex('meetingDate', 'meetingDate', { unique: false });
        meetingStore.createIndex('status', 'status', { unique: false }); // scheduled, completed, cancelled
        meetingStore.createIndex('attendeeCount', 'attendeeCount', { unique: false });
      }

      // Association Activities store
      if (!db.objectStoreNames.contains('associationActivities')) {
        const activityStore = db.createObjectStore('associationActivities', {
          keyPath: 'id',
          autoIncrement: true,
        });
        activityStore.createIndex('activityType', 'activityType', { unique: false }); // social_event, team_building, welfare, training
        activityStore.createIndex('activityDate', 'activityDate', { unique: false });
        activityStore.createIndex('organizedBy', 'organizedBy', { unique: false });
        activityStore.createIndex('status', 'status', { unique: false });
        activityStore.createIndex('budget', 'budget', { unique: false });
        activityStore.createIndex('participantCount', 'participantCount', { unique: false });
      }

      // Staff Association Contributions store
      if (!db.objectStoreNames.contains('staffAssociationContributions')) {
        const contribStore = db.createObjectStore('staffAssociationContributions', {
          keyPath: 'id',
          autoIncrement: true,
        });
        contribStore.createIndex('memberId', 'memberId', { unique: false });
        contribStore.createIndex('memberName', 'memberName', { unique: false });
        contribStore.createIndex('period', 'period', { unique: false });
        contribStore.createIndex('amount', 'amount', { unique: false });
        contribStore.createIndex('paymentDate', 'paymentDate', { unique: false });
        contribStore.createIndex('paymentMethod', 'paymentMethod', { unique: false });
        contribStore.createIndex('status', 'status', { unique: false }); // paid, pending, overdue
      }

      // Staff Welfare Requests store
      if (!db.objectStoreNames.contains('staffWelfareRequests')) {
        const welfareReqStore = db.createObjectStore('staffWelfareRequests', {
          keyPath: 'id',
          autoIncrement: true,
        });
        welfareReqStore.createIndex('memberId', 'memberId', { unique: false });
        welfareReqStore.createIndex('memberName', 'memberName', { unique: false });
        welfareReqStore.createIndex('requestType', 'requestType', { unique: false }); // medical, death, marriage, childbirth, disaster, education, emergency
        welfareReqStore.createIndex('amountRequested', 'amountRequested', { unique: false });
        welfareReqStore.createIndex('amountApproved', 'amountApproved', { unique: false });
        welfareReqStore.createIndex('requestDate', 'requestDate', { unique: false });
        welfareReqStore.createIndex('status', 'status', { unique: false }); // pending, approved, rejected, paid
      }

      // Staff Welfare Payments store
      if (!db.objectStoreNames.contains('staffWelfarePayments')) {
        const welfarePayStore = db.createObjectStore('staffWelfarePayments', {
          keyPath: 'id',
          autoIncrement: true,
        });
        welfarePayStore.createIndex('memberId', 'memberId', { unique: false });
        welfarePayStore.createIndex('memberName', 'memberName', { unique: false });
        welfarePayStore.createIndex('requestId', 'requestId', { unique: false });
        welfarePayStore.createIndex('requestReference', 'requestReference', { unique: false });
        welfarePayStore.createIndex('amountPaid', 'amountPaid', { unique: false });
        welfarePayStore.createIndex('paymentDate', 'paymentDate', { unique: false });
        welfarePayStore.createIndex('paymentMethod', 'paymentMethod', { unique: false });
        welfarePayStore.createIndex('status', 'status', { unique: false }); // paid, pending, cancelled
      }

      // ========== COMPLIANCE & AUDIT (Chapter 15) ==========

      // Policy Versions store
      if (!db.objectStoreNames.contains('policyVersions')) {
        const policyStore = db.createObjectStore('policyVersions', {
          keyPath: 'id',
          autoIncrement: true,
        });
        policyStore.createIndex('policyName', 'policyName', { unique: false });
        policyStore.createIndex('version', 'version', { unique: false });
        policyStore.createIndex('effectiveDate', 'effectiveDate', { unique: false });
        policyStore.createIndex('approvedBy', 'approvedBy', { unique: false });
        policyStore.createIndex('status', 'status', { unique: false }); // draft, active, superseded
      }

      // HR Audit Logs store
      if (!db.objectStoreNames.contains('hrAuditLogs')) {
        const auditStore = db.createObjectStore('hrAuditLogs', {
          keyPath: 'id',
          autoIncrement: true,
        });
        auditStore.createIndex('entityType', 'entityType', { unique: false });
        auditStore.createIndex('entityId', 'entityId', { unique: false });
        auditStore.createIndex('action', 'action', { unique: false }); // create, update, delete, approve, reject
        auditStore.createIndex('performedBy', 'performedBy', { unique: false });
        auditStore.createIndex('performedAt', 'performedAt', { unique: false });
        auditStore.createIndex('ipAddress', 'ipAddress', { unique: false });
      }

      // ========== FINANCE MODULE TABLES ==========

      // Donors store
      if (!db.objectStoreNames.contains('donors')) {
        const donorStore = db.createObjectStore('donors', {
          keyPath: 'id',
          autoIncrement: true,
        });
        donorStore.createIndex('name', 'name', { unique: true });
        donorStore.createIndex('code', 'code', { unique: true });
        donorStore.createIndex('isActive', 'isActive', { unique: false });
        donorStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Projects store
      if (!db.objectStoreNames.contains('projects')) {
        const projectStore = db.createObjectStore('projects', {
          keyPath: 'id',
          autoIncrement: true,
        });
        projectStore.createIndex('donorId', 'donorId', { unique: false });
        projectStore.createIndex('projectCode', 'projectCode', { unique: true });
        projectStore.createIndex('status', 'status', { unique: false });
        projectStore.createIndex('startDate', 'startDate', { unique: false });
        projectStore.createIndex('endDate', 'endDate', { unique: false });
        projectStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Banks store
      if (!db.objectStoreNames.contains('banks')) {
        const bankStore = db.createObjectStore('banks', {
          keyPath: 'id',
          autoIncrement: true,
        });
        bankStore.createIndex('bankName', 'bankName', { unique: false });
        bankStore.createIndex('bankCode', 'bankCode', { unique: true });
        bankStore.createIndex('isActive', 'isActive', { unique: false });
      }

      // Bank Accounts store
      if (!db.objectStoreNames.contains('bankAccounts')) {
        const bankAccountStore = db.createObjectStore('bankAccounts', {
          keyPath: 'id',
          autoIncrement: true,
        });
        bankAccountStore.createIndex('bankId', 'bankId', { unique: false });
        bankAccountStore.createIndex('accountNumber', 'accountNumber', { unique: false });
        bankAccountStore.createIndex('currency', 'currency', { unique: false });
        bankAccountStore.createIndex('isActive', 'isActive', { unique: false });
      }

      // Bank Signatories store
      if (!db.objectStoreNames.contains('bankSignatories')) {
        const signatoryStore = db.createObjectStore('bankSignatories', {
          keyPath: 'id',
          autoIncrement: true,
        });
        signatoryStore.createIndex('bankAccountId', 'bankAccountId', { unique: false });
        signatoryStore.createIndex('employeeId', 'employeeId', { unique: false });
        signatoryStore.createIndex('signatoryType', 'signatoryType', { unique: false });
        signatoryStore.createIndex('isActive', 'isActive', { unique: false });
      }

      // Budget Categories store
      if (!db.objectStoreNames.contains('budgetCategories')) {
        const budgetCatStore = db.createObjectStore('budgetCategories', {
          keyPath: 'id',
          autoIncrement: true,
        });
        budgetCatStore.createIndex('categoryName', 'categoryName', { unique: false });
        budgetCatStore.createIndex('categoryCode', 'categoryCode', { unique: true });
        budgetCatStore.createIndex('parentId', 'parentId', { unique: false });
        budgetCatStore.createIndex('isActive', 'isActive', { unique: false });
      }

      // Project Budgets store
      if (!db.objectStoreNames.contains('projectBudgets')) {
        const projBudgetStore = db.createObjectStore('projectBudgets', {
          keyPath: 'id',
          autoIncrement: true,
        });
        projBudgetStore.createIndex('projectId', 'projectId', { unique: false });
        projBudgetStore.createIndex('budgetCategoryId', 'budgetCategoryId', { unique: false });
        projBudgetStore.createIndex('fiscalYear', 'fiscalYear', { unique: false });
      }

      // Budget Expenditures store
      if (!db.objectStoreNames.contains('budgetExpenditures')) {
        const expenditureStore = db.createObjectStore('budgetExpenditures', {
          keyPath: 'id',
          autoIncrement: true,
        });
        expenditureStore.createIndex('projectBudgetId', 'projectBudgetId', { unique: false });
        expenditureStore.createIndex('expenditureDate', 'expenditureDate', { unique: false });
        expenditureStore.createIndex('createdBy', 'createdBy', { unique: false });
      }

      // Project Staff Costs store
      if (!db.objectStoreNames.contains('projectStaffCosts')) {
        const staffCostStore = db.createObjectStore('projectStaffCosts', {
          keyPath: 'id',
          autoIncrement: true,
        });
        staffCostStore.createIndex('projectId', 'projectId', { unique: false });
        staffCostStore.createIndex('employeeId', 'employeeId', { unique: false });
        staffCostStore.createIndex('amendmentNumber', 'amendmentNumber', { unique: false });
        staffCostStore.createIndex('gradeLevel', 'gradeLevel', { unique: false });
      }

      // Project Operational Costs store
      if (!db.objectStoreNames.contains('projectOperationalCosts')) {
        const opsCostStore = db.createObjectStore('projectOperationalCosts', {
          keyPath: 'id',
          autoIncrement: true,
        });
        opsCostStore.createIndex('projectId', 'projectId', { unique: false });
        opsCostStore.createIndex('costCategory', 'costCategory', { unique: false });
        opsCostStore.createIndex('amendmentNumber', 'amendmentNumber', { unique: false });
      }

      // Cash Requests store
      if (!db.objectStoreNames.contains('cashRequests')) {
        const cashReqStore = db.createObjectStore('cashRequests', {
          keyPath: 'id',
          autoIncrement: true,
        });
        cashReqStore.createIndex('requestNumber', 'requestNumber', { unique: true });
        cashReqStore.createIndex('requestMonth', 'requestMonth', { unique: false });
        cashReqStore.createIndex('status', 'status', { unique: false });
        cashReqStore.createIndex('preparedBy', 'preparedBy', { unique: false });
        cashReqStore.createIndex('approvedBy', 'approvedBy', { unique: false });
      }

      // Cash Request Items store
      if (!db.objectStoreNames.contains('cashRequestItems')) {
        const cashItemStore = db.createObjectStore('cashRequestItems', {
          keyPath: 'id',
          autoIncrement: true,
        });
        cashItemStore.createIndex('cashRequestId', 'cashRequestId', { unique: false });
        cashItemStore.createIndex('projectId', 'projectId', { unique: false });
        cashItemStore.createIndex('costType', 'costType', { unique: false });
      }

      // Installment Requests store
      if (!db.objectStoreNames.contains('installmentRequests')) {
        const instReqStore = db.createObjectStore('installmentRequests', {
          keyPath: 'id',
          autoIncrement: true,
        });
        instReqStore.createIndex('projectId', 'projectId', { unique: false });
        instReqStore.createIndex('status', 'status', { unique: false });
        instReqStore.createIndex('dateRequested', 'dateRequested', { unique: false });
        instReqStore.createIndex('amendmentNumber', 'amendmentNumber', { unique: false });
      }

      // Installment Receipts store
      if (!db.objectStoreNames.contains('installmentReceipts')) {
        const instReceiptStore = db.createObjectStore('installmentReceipts', {
          keyPath: 'id',
          autoIncrement: true,
        });
        instReceiptStore.createIndex('installmentRequestId', 'installmentRequestId', { unique: false });
        instReceiptStore.createIndex('receiptDate', 'receiptDate', { unique: false });
        instReceiptStore.createIndex('bankAccountId', 'bankAccountId', { unique: false });
      }

      // Staff Salary Allocations store
      if (!db.objectStoreNames.contains('staffSalaryAllocations')) {
        const allocStore = db.createObjectStore('staffSalaryAllocations', {
          keyPath: 'id',
          autoIncrement: true,
        });
        allocStore.createIndex('employeeId', 'employeeId', { unique: false });
        allocStore.createIndex('projectId', 'projectId', { unique: false });
        allocStore.createIndex('allocationMonth', 'allocationMonth', { unique: false });
      }

      // Donor Reporting Schedules store
      if (!db.objectStoreNames.contains('donorReportingSchedules')) {
        const reportScheduleStore = db.createObjectStore('donorReportingSchedules', {
          keyPath: 'id',
          autoIncrement: true,
        });
        reportScheduleStore.createIndex('projectId', 'projectId', { unique: false });
        reportScheduleStore.createIndex('dueDate', 'dueDate', { unique: false });
        reportScheduleStore.createIndex('status', 'status', { unique: false });
      }

      // Donor Report Periods store
      if (!db.objectStoreNames.contains('donorReportPeriods')) {
        const reportPeriodStore = db.createObjectStore('donorReportPeriods', {
          keyPath: 'id',
          autoIncrement: true,
        });
        reportPeriodStore.createIndex('reportingScheduleId', 'reportingScheduleId', { unique: false });
        reportPeriodStore.createIndex('status', 'status', { unique: false });
        reportPeriodStore.createIndex('submittedBy', 'submittedBy', { unique: false });
      }

      // Government Reporting store
      if (!db.objectStoreNames.contains('governmentReporting')) {
        const govReportStore = db.createObjectStore('governmentReporting', {
          keyPath: 'id',
          autoIncrement: true,
        });
        govReportStore.createIndex('projectId', 'projectId', { unique: false });
        govReportStore.createIndex('ministryName', 'ministryName', { unique: false });
        govReportStore.createIndex('status', 'status', { unique: false });
        govReportStore.createIndex('dueDate', 'dueDate', { unique: false });
      }

      // Project Amendments store
      if (!db.objectStoreNames.contains('projectAmendments')) {
        const amendStore = db.createObjectStore('projectAmendments', {
          keyPath: 'id',
          autoIncrement: true,
        });
        amendStore.createIndex('projectId', 'projectId', { unique: false });
        amendStore.createIndex('amendmentNumber', 'amendmentNumber', { unique: false });
        amendStore.createIndex('amendmentDate', 'amendmentDate', { unique: false });
      }

      // Signatory Assignments store
      if (!db.objectStoreNames.contains('signatoryAssignments')) {
        const sigAssignStore = db.createObjectStore('signatoryAssignments', {
          keyPath: 'id',
          autoIncrement: true,
        });
        sigAssignStore.createIndex('projectId', 'projectId', { unique: false });
        sigAssignStore.createIndex('assignmentMonth', 'assignmentMonth', { unique: false });
      }

      // ========== COMPLIANCE MODULE TABLES ==========

      // Compliance Projects store
      if (!db.objectStoreNames.contains('complianceProjects')) {
        const compProjStore = db.createObjectStore('complianceProjects', {
          keyPath: 'id',
          autoIncrement: true,
        });
        compProjStore.createIndex('donorName', 'donorName', { unique: false });
        compProjStore.createIndex('projectName', 'projectName', { unique: false });
        compProjStore.createIndex('status', 'status', { unique: false });
        compProjStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Compliance Amendments store
      if (!db.objectStoreNames.contains('complianceAmendments')) {
        const compAmendStore = db.createObjectStore('complianceAmendments', {
          keyPath: 'id',
          autoIncrement: true,
        });
        compAmendStore.createIndex('projectId', 'projectId', { unique: false });
        compAmendStore.createIndex('status', 'status', { unique: false });
      }

      // Proposals store
      if (!db.objectStoreNames.contains('proposals')) {
        const proposalStore = db.createObjectStore('proposals', {
          keyPath: 'id',
          autoIncrement: true,
        });
        proposalStore.createIndex('donorName', 'donorName', { unique: false });
        proposalStore.createIndex('status', 'status', { unique: false });
        proposalStore.createIndex('result', 'result', { unique: false });
        proposalStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // DD Tracking store (Due Diligence Tracking)
      if (!db.objectStoreNames.contains('dueDiligence')) {
        const ddStore = db.createObjectStore('dueDiligence', {
          keyPath: 'id',
          autoIncrement: true,
        });
        ddStore.createIndex('donorName', 'donorName', { unique: false });
        ddStore.createIndex('status', 'status', { unique: false });
        ddStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Registrations store (VDO Registration)
      if (!db.objectStoreNames.contains('registrations')) {
        const regStore = db.createObjectStore('registrations', {
          keyPath: 'id',
          autoIncrement: true,
        });
        regStore.createIndex('organizationPlatform', 'organizationPlatform', { unique: false });
        regStore.createIndex('status', 'status', { unique: false });
        regStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Memberships store (VDO's Membership and Representation)
      if (!db.objectStoreNames.contains('memberships')) {
        const memberStore = db.createObjectStore('memberships', {
          keyPath: 'id',
          autoIncrement: true,
        });
        memberStore.createIndex('nameMembershipPlatform', 'nameMembershipPlatform', { unique: false });
        memberStore.createIndex('platformType', 'platformType', { unique: false });
        memberStore.createIndex('status', 'status', { unique: false });
        memberStore.createIndex('createdAt', 'createdAt', { unique: false });
      }


      // Certificates store (VDO's Acknowledgement/Certification Documents)
      if (!db.objectStoreNames.contains('certificates')) {
        const certStore = db.createObjectStore('certificates', {
          keyPath: 'id',
          autoIncrement: true,
        });
        certStore.createIndex('nameOfInstitution', 'nameOfInstitution', { unique: false });
        certStore.createIndex('agency', 'agency', { unique: false });
        certStore.createIndex('typeOfDocument', 'typeOfDocument', { unique: false });
        certStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Board of Directors store
      if (!db.objectStoreNames.contains('boardOfDirectors')) {
        const bodStore = db.createObjectStore('boardOfDirectors', {
          keyPath: 'id',
          autoIncrement: true,
        });
        bodStore.createIndex('name', 'name', { unique: false });
        bodStore.createIndex('roleInBoard', 'roleInBoard', { unique: false });
        bodStore.createIndex('status', 'status', { unique: false });
      }

      // Partners store (VDO Partners Tracking Sheet)
      if (!db.objectStoreNames.contains('partners')) {
        const partnerStore = db.createObjectStore('partners', {
          keyPath: 'id',
          autoIncrement: true,
        });
        partnerStore.createIndex('namePartner', 'namePartner', { unique: false });
        partnerStore.createIndex('status', 'status', { unique: false });
        partnerStore.createIndex('location', 'location', { unique: false });
        partnerStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Donor Outreach store
      if (!db.objectStoreNames.contains('donorOutreach')) {
        const doStore = db.createObjectStore('donorOutreach', {
          keyPath: 'id',
          autoIncrement: true,
        });
        doStore.createIndex('donorName', 'donorName', { unique: false });
      }

      // Government Outreach store
      if (!db.objectStoreNames.contains('governmentOutreach')) {
        const goStore = db.createObjectStore('governmentOutreach', {
          keyPath: 'id',
          autoIncrement: true,
        });
        goStore.createIndex('govtEntityName', 'govtEntityName', { unique: false });
      }

      // Compliance Documents store
      if (!db.objectStoreNames.contains('complianceDocuments')) {
        const compDocStore = db.createObjectStore('complianceDocuments', {
          keyPath: 'id',
          autoIncrement: true,
        });
        compDocStore.createIndex('name', 'name', { unique: false });
        compDocStore.createIndex('category', 'category', { unique: false });
        compDocStore.createIndex('year', 'year', { unique: false });
      }

      // Restricted List store (VDO's Restricted List)
      if (!db.objectStoreNames.contains('blacklist')) {
        const blacklistStore = db.createObjectStore('blacklist', {
          keyPath: 'id',
          autoIncrement: true,
        });
        blacklistStore.createIndex('name', 'name', { unique: false });
        blacklistStore.createIndex('category', 'category', { unique: false });
        blacklistStore.createIndex('access', 'access', { unique: false });
        blacklistStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Payroll Records store
      if (!db.objectStoreNames.contains('payrollRecords')) {
        const payrollStore = db.createObjectStore('payrollRecords', {
          keyPath: 'id',
          autoIncrement: true,
        });
        payrollStore.createIndex('payrollId', 'payrollId', { unique: true });
        payrollStore.createIndex('employeeId', 'employeeId', { unique: false });
        payrollStore.createIndex('month', 'month', { unique: false });
        payrollStore.createIndex('year', 'year', { unique: false });
        payrollStore.createIndex('status', 'status', { unique: false });
        payrollStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Salary Components store (allowances, deductions)
      if (!db.objectStoreNames.contains('salaryComponents')) {
        const componentStore = db.createObjectStore('salaryComponents', {
          keyPath: 'id',
          autoIncrement: true,
        });
        componentStore.createIndex('name', 'name', { unique: true });
        componentStore.createIndex('type', 'type', { unique: false });
        componentStore.createIndex('status', 'status', { unique: false });
      }

      // ============ PROCUREMENT MODULE STORES ============

      // Vendors store
      if (!db.objectStoreNames.contains('vendors')) {
        const vendorStore = db.createObjectStore('vendors', {
          keyPath: 'id',
          autoIncrement: true,
        });
        vendorStore.createIndex('vendorCode', 'vendorCode', { unique: true });
        vendorStore.createIndex('companyName', 'companyName', { unique: false });
        vendorStore.createIndex('category', 'category', { unique: false });
        vendorStore.createIndex('status', 'status', { unique: false });
        vendorStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Item Categories store
      if (!db.objectStoreNames.contains('itemCategories')) {
        const categoryStore = db.createObjectStore('itemCategories', {
          keyPath: 'id',
          autoIncrement: true,
        });
        categoryStore.createIndex('name', 'name', { unique: false });
        categoryStore.createIndex('code', 'code', { unique: true });
        categoryStore.createIndex('parent', 'parent', { unique: false });
      }

      // Purchase Requests store
      if (!db.objectStoreNames.contains('purchaseRequests')) {
        const prStore = db.createObjectStore('purchaseRequests', {
          keyPath: 'id',
          autoIncrement: true,
        });
        prStore.createIndex('prNumber', 'prNumber', { unique: true });
        prStore.createIndex('requestedBy', 'requestedBy', { unique: false });
        prStore.createIndex('department', 'department', { unique: false });
        prStore.createIndex('status', 'status', { unique: false });
        prStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // RFQs (Request for Quotations) store
      if (!db.objectStoreNames.contains('rfqs')) {
        const rfqStore = db.createObjectStore('rfqs', {
          keyPath: 'id',
          autoIncrement: true,
        });
        rfqStore.createIndex('rfqNumber', 'rfqNumber', { unique: true });
        rfqStore.createIndex('prId', 'prId', { unique: false });
        rfqStore.createIndex('status', 'status', { unique: false });
        rfqStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Purchase Orders store
      if (!db.objectStoreNames.contains('purchaseOrders')) {
        const poStore = db.createObjectStore('purchaseOrders', {
          keyPath: 'id',
          autoIncrement: true,
        });
        poStore.createIndex('poNumber', 'poNumber', { unique: true });
        poStore.createIndex('vendorId', 'vendorId', { unique: false });
        poStore.createIndex('prId', 'prId', { unique: false });
        poStore.createIndex('status', 'status', { unique: false });
        poStore.createIndex('orderDate', 'orderDate', { unique: false });
        poStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Goods Receipts store
      if (!db.objectStoreNames.contains('goodsReceipts')) {
        const grStore = db.createObjectStore('goodsReceipts', {
          keyPath: 'id',
          autoIncrement: true,
        });
        grStore.createIndex('grNumber', 'grNumber', { unique: true });
        grStore.createIndex('poId', 'poId', { unique: false });
        grStore.createIndex('vendorId', 'vendorId', { unique: false });
        grStore.createIndex('status', 'status', { unique: false });
        grStore.createIndex('receiptDate', 'receiptDate', { unique: false });
      }

      // Inventory Items store
      if (!db.objectStoreNames.contains('inventoryItems')) {
        const invStore = db.createObjectStore('inventoryItems', {
          keyPath: 'id',
          autoIncrement: true,
        });
        invStore.createIndex('itemCode', 'itemCode', { unique: true });
        invStore.createIndex('itemName', 'itemName', { unique: false });
        invStore.createIndex('category', 'category', { unique: false });
        invStore.createIndex('status', 'status', { unique: false });
      }

      // Contracts store
      if (!db.objectStoreNames.contains('contracts')) {
        const contractStore = db.createObjectStore('contracts', {
          keyPath: 'id',
          autoIncrement: true,
        });
        contractStore.createIndex('contractNumber', 'contractNumber', { unique: true });
        contractStore.createIndex('vendorId', 'vendorId', { unique: false });
        contractStore.createIndex('status', 'status', { unique: false });
        contractStore.createIndex('startDate', 'startDate', { unique: false });
        contractStore.createIndex('endDate', 'endDate', { unique: false });
      }

      // ============ PROGRAMM MODULE STORES ============

      // Program Work Plans store
      if (!db.objectStoreNames.contains('programWorkPlans')) {
        const workPlanStore = db.createObjectStore('programWorkPlans', {
          keyPath: 'id',
          autoIncrement: true,
        });
        workPlanStore.createIndex('donor', 'donor', { unique: false });
        workPlanStore.createIndex('project', 'project', { unique: false });
        workPlanStore.createIndex('status', 'status', { unique: false });
        workPlanStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // DNR Tracking (Donor Reporting Tracking) store
      if (!db.objectStoreNames.contains('dnrTracking')) {
        const dnrStore = db.createObjectStore('dnrTracking', {
          keyPath: 'id',
          autoIncrement: true,
        });
        dnrStore.createIndex('donor', 'donor', { unique: false });
        dnrStore.createIndex('projectName', 'projectName', { unique: false });
        dnrStore.createIndex('projectStatus', 'projectStatus', { unique: false });
        dnrStore.createIndex('reportType', 'reportType', { unique: false });
        dnrStore.createIndex('startDate', 'startDate', { unique: false });
        dnrStore.createIndex('endDate', 'endDate', { unique: false });
        dnrStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // MOU Tracking store
      if (!db.objectStoreNames.contains('mouTracking')) {
        const mouStore = db.createObjectStore('mouTracking', {
          keyPath: 'id',
          autoIncrement: true,
        });
        mouStore.createIndex('sectoralAuthority', 'sectoralAuthority', { unique: false });
        mouStore.createIndex('project', 'project', { unique: false });
        mouStore.createIndex('donor', 'donor', { unique: false });
        mouStore.createIndex('status', 'status', { unique: false });
        mouStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // In-Out Document Tracking store
      if (!db.objectStoreNames.contains('inOutTracking')) {
        const inOutStore = db.createObjectStore('inOutTracking', {
          keyPath: 'id',
          autoIncrement: true,
        });
        inOutStore.createIndex('documentType', 'documentType', { unique: false });
        inOutStore.createIndex('referenceNumber', 'referenceNumber', { unique: false });
        inOutStore.createIndex('from', 'from', { unique: false });
        inOutStore.createIndex('to', 'to', { unique: false });
        inOutStore.createIndex('date', 'date', { unique: false });
        inOutStore.createIndex('status', 'status', { unique: false });
        inOutStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Access Tracking store
      if (!db.objectStoreNames.contains('accessTracking')) {
        const accessStore = db.createObjectStore('accessTracking', {
          keyPath: 'id',
          autoIncrement: true,
        });
        accessStore.createIndex('donor', 'donor', { unique: false });
        accessStore.createIndex('projectName', 'projectName', { unique: false });
        accessStore.createIndex('lineMinistry', 'lineMinistry', { unique: false });
        accessStore.createIndex('startDate', 'startDate', { unique: false });
        accessStore.createIndex('endDate', 'endDate', { unique: false });
        accessStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // ============================================
      // RECRUITMENT MANAGEMENT SYSTEM STORES
      // ============================================

      // Recruitments store (Main recruitment request)
      if (!db.objectStoreNames.contains('recruitments')) {
        const recruitmentStore = db.createObjectStore('recruitments', {
          keyPath: 'id',
          autoIncrement: true,
        });
        recruitmentStore.createIndex('recruitmentCode', 'recruitmentCode', { unique: true });
        recruitmentStore.createIndex('status', 'status', { unique: false });
        recruitmentStore.createIndex('currentStep', 'currentStep', { unique: false });
        recruitmentStore.createIndex('hiringApproach', 'hiringApproach', { unique: false });
        recruitmentStore.createIndex('createdBy', 'createdBy', { unique: false });
        recruitmentStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Terms of References (TOR) store
      if (!db.objectStoreNames.contains('termsOfReferences')) {
        const torStore = db.createObjectStore('termsOfReferences', {
          keyPath: 'id',
          autoIncrement: true,
        });
        torStore.createIndex('recruitmentId', 'recruitmentId', { unique: false });
        torStore.createIndex('positionTitle', 'positionTitle', { unique: false });
        torStore.createIndex('departmentId', 'departmentId', { unique: false });
        torStore.createIndex('status', 'status', { unique: false });
        torStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Staff Requisitions (SRF) store
      if (!db.objectStoreNames.contains('staffRequisitions')) {
        const srfStore = db.createObjectStore('staffRequisitions', {
          keyPath: 'id',
          autoIncrement: true,
        });
        srfStore.createIndex('recruitmentId', 'recruitmentId', { unique: false });
        srfStore.createIndex('torId', 'torId', { unique: false });
        srfStore.createIndex('jobTitle', 'jobTitle', { unique: false });
        srfStore.createIndex('departmentId', 'departmentId', { unique: false });
        srfStore.createIndex('status', 'status', { unique: false });
        srfStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Vacancy Announcements store
      if (!db.objectStoreNames.contains('vacancyAnnouncements')) {
        const vacancyStore = db.createObjectStore('vacancyAnnouncements', {
          keyPath: 'id',
          autoIncrement: true,
        });
        vacancyStore.createIndex('recruitmentId', 'recruitmentId', { unique: false });
        vacancyStore.createIndex('announcementMethod', 'announcementMethod', { unique: false });
        vacancyStore.createIndex('status', 'status', { unique: false });
        vacancyStore.createIndex('closingDate', 'closingDate', { unique: false });
        vacancyStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Recruitment Candidates store (master candidate records)
      if (!db.objectStoreNames.contains('recruitmentCandidates')) {
        const rcStore = db.createObjectStore('recruitmentCandidates', {
          keyPath: 'id',
          autoIncrement: true,
        });
        rcStore.createIndex('candidateCode', 'candidateCode', { unique: true });
        rcStore.createIndex('fullName', 'fullName', { unique: false });
        rcStore.createIndex('email', 'email', { unique: false });
        rcStore.createIndex('phone', 'phone', { unique: false });
        rcStore.createIndex('gender', 'gender', { unique: false });
        rcStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Candidate Applications store (applications per recruitment)
      if (!db.objectStoreNames.contains('candidateApplications')) {
        const appStore = db.createObjectStore('candidateApplications', {
          keyPath: 'id',
          autoIncrement: true,
        });
        appStore.createIndex('candidateId', 'candidateId', { unique: false });
        appStore.createIndex('recruitmentId', 'recruitmentId', { unique: false });
        appStore.createIndex('applicationCode', 'applicationCode', { unique: true });
        appStore.createIndex('applicationMethod', 'applicationMethod', { unique: false });
        appStore.createIndex('status', 'status', { unique: false });
        appStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Candidate Educations store
      if (!db.objectStoreNames.contains('candidateEducations')) {
        const eduStore = db.createObjectStore('candidateEducations', {
          keyPath: 'id',
          autoIncrement: true,
        });
        eduStore.createIndex('candidateId', 'candidateId', { unique: false });
        eduStore.createIndex('degree', 'degree', { unique: false });
        eduStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Candidate Experiences store
      if (!db.objectStoreNames.contains('candidateExperiences')) {
        const expStore = db.createObjectStore('candidateExperiences', {
          keyPath: 'id',
          autoIncrement: true,
        });
        expStore.createIndex('candidateId', 'candidateId', { unique: false });
        expStore.createIndex('organizationName', 'organizationName', { unique: false });
        expStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Recruitment Committees store
      if (!db.objectStoreNames.contains('recruitmentCommittees')) {
        const commStore = db.createObjectStore('recruitmentCommittees', {
          keyPath: 'id',
          autoIncrement: true,
        });
        commStore.createIndex('recruitmentId', 'recruitmentId', { unique: false });
        commStore.createIndex('status', 'status', { unique: false });
        commStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Recruitment Committee Members store
      if (!db.objectStoreNames.contains('committeeMembers')) {
        const memberStore = db.createObjectStore('committeeMembers', {
          keyPath: 'id',
          autoIncrement: true,
        });
        memberStore.createIndex('committeeId', 'committeeId', { unique: false });
        memberStore.createIndex('userId', 'userId', { unique: false });
        memberStore.createIndex('role', 'role', { unique: false });
        memberStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Conflict of Interest Declarations store
      if (!db.objectStoreNames.contains('coiDeclarations')) {
        const coiStore = db.createObjectStore('coiDeclarations', {
          keyPath: 'id',
          autoIncrement: true,
        });
        coiStore.createIndex('committeeMemberId', 'committeeMemberId', { unique: false });
        coiStore.createIndex('recruitmentId', 'recruitmentId', { unique: false });
        coiStore.createIndex('hrDecision', 'hrDecision', { unique: false });
        coiStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Longlistings store
      if (!db.objectStoreNames.contains('longlistings')) {
        const llStore = db.createObjectStore('longlistings', {
          keyPath: 'id',
          autoIncrement: true,
        });
        llStore.createIndex('recruitmentId', 'recruitmentId', { unique: false });
        llStore.createIndex('status', 'status', { unique: false });
        llStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Longlisting Candidates store
      if (!db.objectStoreNames.contains('longlistingCandidates')) {
        const llcStore = db.createObjectStore('longlistingCandidates', {
          keyPath: 'id',
          autoIncrement: true,
        });
        llcStore.createIndex('longlistingId', 'longlistingId', { unique: false });
        llcStore.createIndex('candidateApplicationId', 'candidateApplicationId', { unique: false });
        llcStore.createIndex('isLonglisted', 'isLonglisted', { unique: false });
        llcStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Shortlistings store
      if (!db.objectStoreNames.contains('shortlistings')) {
        const slStore = db.createObjectStore('shortlistings', {
          keyPath: 'id',
          autoIncrement: true,
        });
        slStore.createIndex('recruitmentId', 'recruitmentId', { unique: false });
        slStore.createIndex('status', 'status', { unique: false });
        slStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Shortlisting Candidates store
      if (!db.objectStoreNames.contains('shortlistingCandidates')) {
        const slcStore = db.createObjectStore('shortlistingCandidates', {
          keyPath: 'id',
          autoIncrement: true,
        });
        slcStore.createIndex('shortlistingId', 'shortlistingId', { unique: false });
        slcStore.createIndex('candidateApplicationId', 'candidateApplicationId', { unique: false });
        slcStore.createIndex('isShortlisted', 'isShortlisted', { unique: false });
        slcStore.createIndex('totalScore', 'totalScore', { unique: false });
        slcStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Written Tests store
      if (!db.objectStoreNames.contains('writtenTests')) {
        const wtStore = db.createObjectStore('writtenTests', {
          keyPath: 'id',
          autoIncrement: true,
        });
        wtStore.createIndex('recruitmentId', 'recruitmentId', { unique: false });
        wtStore.createIndex('testDate', 'testDate', { unique: false });
        wtStore.createIndex('status', 'status', { unique: false });
        wtStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Written Test Candidates store
      if (!db.objectStoreNames.contains('writtenTestCandidates')) {
        const wtcStore = db.createObjectStore('writtenTestCandidates', {
          keyPath: 'id',
          autoIncrement: true,
        });
        wtcStore.createIndex('writtenTestId', 'writtenTestId', { unique: false });
        wtcStore.createIndex('candidateApplicationId', 'candidateApplicationId', { unique: false });
        wtcStore.createIndex('uniqueCode', 'uniqueCode', { unique: true });
        wtcStore.createIndex('isPassed', 'isPassed', { unique: false });
        wtcStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Recruitment Interviews store (separate from HR interviews)
      if (!db.objectStoreNames.contains('recruitmentInterviews')) {
        const intStore = db.createObjectStore('recruitmentInterviews', {
          keyPath: 'id',
          autoIncrement: true,
        });
        intStore.createIndex('recruitmentId', 'recruitmentId', { unique: false });
        intStore.createIndex('interviewDate', 'interviewDate', { unique: false });
        intStore.createIndex('status', 'status', { unique: false });
        intStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Recruitment Interview Candidates store
      if (!db.objectStoreNames.contains('recruitmentInterviewCandidates')) {
        const icStore = db.createObjectStore('recruitmentInterviewCandidates', {
          keyPath: 'id',
          autoIncrement: true,
        });
        icStore.createIndex('interviewId', 'interviewId', { unique: false });
        icStore.createIndex('candidateApplicationId', 'candidateApplicationId', { unique: false });
        icStore.createIndex('attended', 'attended', { unique: false });
        icStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Recruitment Interview Evaluations store
      if (!db.objectStoreNames.contains('recruitmentInterviewEvaluations')) {
        const ieStore = db.createObjectStore('recruitmentInterviewEvaluations', {
          keyPath: 'id',
          autoIncrement: true,
        });
        ieStore.createIndex('interviewCandidateId', 'interviewCandidateId', { unique: false });
        ieStore.createIndex('evaluatorId', 'evaluatorId', { unique: false });
        ieStore.createIndex('recommendation', 'recommendation', { unique: false });
        ieStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Recruitment Interview Results store
      if (!db.objectStoreNames.contains('recruitmentInterviewResults')) {
        const irStore = db.createObjectStore('recruitmentInterviewResults', {
          keyPath: 'id',
          autoIncrement: true,
        });
        irStore.createIndex('interviewCandidateId', 'interviewCandidateId', { unique: false });
        irStore.createIndex('finalRank', 'finalRank', { unique: false });
        irStore.createIndex('isSelected', 'isSelected', { unique: false });
        irStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Recruitment Reports store
      if (!db.objectStoreNames.contains('recruitmentReports')) {
        const rrStore = db.createObjectStore('recruitmentReports', {
          keyPath: 'id',
          autoIncrement: true,
        });
        rrStore.createIndex('recruitmentId', 'recruitmentId', { unique: false });
        rrStore.createIndex('reportNumber', 'reportNumber', { unique: true });
        rrStore.createIndex('status', 'status', { unique: false });
        rrStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Recruitment Report Candidates store (Top 3)
      if (!db.objectStoreNames.contains('reportCandidates')) {
        const rrcStore = db.createObjectStore('reportCandidates', {
          keyPath: 'id',
          autoIncrement: true,
        });
        rrcStore.createIndex('reportId', 'reportId', { unique: false });
        rrcStore.createIndex('candidateApplicationId', 'candidateApplicationId', { unique: false });
        rrcStore.createIndex('rank', 'rank', { unique: false });
        rrcStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Offer Letters store
      if (!db.objectStoreNames.contains('offerLetters')) {
        const olStore = db.createObjectStore('offerLetters', {
          keyPath: 'id',
          autoIncrement: true,
        });
        olStore.createIndex('recruitmentId', 'recruitmentId', { unique: false });
        olStore.createIndex('candidateApplicationId', 'candidateApplicationId', { unique: false });
        olStore.createIndex('status', 'status', { unique: false });
        olStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Sanction Clearances store
      if (!db.objectStoreNames.contains('sanctionClearances')) {
        const scStore = db.createObjectStore('sanctionClearances', {
          keyPath: 'id',
          autoIncrement: true,
        });
        scStore.createIndex('recruitmentId', 'recruitmentId', { unique: false });
        scStore.createIndex('candidateApplicationId', 'candidateApplicationId', { unique: false });
        scStore.createIndex('status', 'status', { unique: false });
        scStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Background Checks store (master)
      if (!db.objectStoreNames.contains('backgroundChecks')) {
        const bcStore = db.createObjectStore('backgroundChecks', {
          keyPath: 'id',
          autoIncrement: true,
        });
        bcStore.createIndex('recruitmentId', 'recruitmentId', { unique: false });
        bcStore.createIndex('candidateApplicationId', 'candidateApplicationId', { unique: false });
        bcStore.createIndex('overallStatus', 'overallStatus', { unique: false });
        bcStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Reference Checks store
      if (!db.objectStoreNames.contains('referenceChecks')) {
        const refStore = db.createObjectStore('referenceChecks', {
          keyPath: 'id',
          autoIncrement: true,
        });
        refStore.createIndex('backgroundCheckId', 'backgroundCheckId', { unique: false });
        refStore.createIndex('referenceName', 'referenceName', { unique: false });
        refStore.createIndex('status', 'status', { unique: false });
        refStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Guarantee Letters store
      if (!db.objectStoreNames.contains('guaranteeLetters')) {
        const glStore = db.createObjectStore('guaranteeLetters', {
          keyPath: 'id',
          autoIncrement: true,
        });
        glStore.createIndex('backgroundCheckId', 'backgroundCheckId', { unique: false });
        glStore.createIndex('status', 'status', { unique: false });
        glStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Home Address Verifications store
      if (!db.objectStoreNames.contains('homeAddressVerifications')) {
        const havStore = db.createObjectStore('homeAddressVerifications', {
          keyPath: 'id',
          autoIncrement: true,
        });
        havStore.createIndex('backgroundCheckId', 'backgroundCheckId', { unique: false });
        havStore.createIndex('status', 'status', { unique: false });
        havStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Criminal Background Checks store
      if (!db.objectStoreNames.contains('criminalChecks')) {
        const cbcStore = db.createObjectStore('criminalChecks', {
          keyPath: 'id',
          autoIncrement: true,
        });
        cbcStore.createIndex('backgroundCheckId', 'backgroundCheckId', { unique: false });
        cbcStore.createIndex('status', 'status', { unique: false });
        cbcStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Employment Contracts store
      if (!db.objectStoreNames.contains('employmentContracts')) {
        const ecStore = db.createObjectStore('employmentContracts', {
          keyPath: 'id',
          autoIncrement: true,
        });
        ecStore.createIndex('recruitmentId', 'recruitmentId', { unique: false });
        ecStore.createIndex('candidateApplicationId', 'candidateApplicationId', { unique: false });
        ecStore.createIndex('contractNumber', 'contractNumber', { unique: true });
        ecStore.createIndex('status', 'status', { unique: false });
        ecStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Recruitment File Checklists store
      if (!db.objectStoreNames.contains('fileChecklists')) {
        const fcStore = db.createObjectStore('fileChecklists', {
          keyPath: 'id',
          autoIncrement: true,
        });
        fcStore.createIndex('recruitmentId', 'recruitmentId', { unique: false });
        fcStore.createIndex('employeeId', 'employeeId', { unique: false });
        fcStore.createIndex('status', 'status', { unique: false });
        fcStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Provinces lookup store (for Afghanistan)
      if (!db.objectStoreNames.contains('provinces')) {
        const provStore = db.createObjectStore('provinces', {
          keyPath: 'id',
          autoIncrement: true,
        });
        provStore.createIndex('name', 'name', { unique: true });
      }

      // Donors lookup store
      if (!db.objectStoreNames.contains('donors')) {
        const donorStore = db.createObjectStore('donors', {
          keyPath: 'id',
          autoIncrement: true,
        });
        donorStore.createIndex('name', 'name', { unique: true });
        donorStore.createIndex('code', 'code', { unique: true });
      }

      // Projects lookup store
      if (!db.objectStoreNames.contains('projects')) {
        const projStore = db.createObjectStore('projects', {
          keyPath: 'id',
          autoIncrement: true,
        });
        projStore.createIndex('name', 'name', { unique: false });
        projStore.createIndex('code', 'code', { unique: true });
        projStore.createIndex('donorId', 'donorId', { unique: false });
        projStore.createIndex('status', 'status', { unique: false });
      }

      // Salary Grades lookup store
      if (!db.objectStoreNames.contains('salaryGrades')) {
        const sgStore = db.createObjectStore('salaryGrades', {
          keyPath: 'id',
          autoIncrement: true,
        });
        sgStore.createIndex('gradeCode', 'gradeCode', { unique: true });
        sgStore.createIndex('gradeName', 'gradeName', { unique: false });
      }

      // ==========================================
      // TRAINING MODULE STORES
      // ==========================================

      // Training Types store
      if (!db.objectStoreNames.contains('trainingTypes')) {
        const ttStore = db.createObjectStore('trainingTypes', {
          keyPath: 'id',
          autoIncrement: true,
        });
        ttStore.createIndex('code', 'code', { unique: true });
        ttStore.createIndex('name', 'name', { unique: false });
        ttStore.createIndex('category', 'category', { unique: false });
        ttStore.createIndex('isMandatory', 'isMandatory', { unique: false });
        ttStore.createIndex('isActive', 'isActive', { unique: false });
      }

      // Training Programs store
      if (!db.objectStoreNames.contains('trainingPrograms')) {
        const tpStore = db.createObjectStore('trainingPrograms', {
          keyPath: 'id',
          autoIncrement: true,
        });
        tpStore.createIndex('programCode', 'programCode', { unique: true });
        tpStore.createIndex('title', 'title', { unique: false });
        tpStore.createIndex('trainingTypeId', 'trainingTypeId', { unique: false });
        tpStore.createIndex('deliveryMethod', 'deliveryMethod', { unique: false });
        tpStore.createIndex('isActive', 'isActive', { unique: false });
      }

      // Training Needs Assessments (TNA) store
      if (!db.objectStoreNames.contains('trainingNeedsAssessments')) {
        const tnaStore = db.createObjectStore('trainingNeedsAssessments', {
          keyPath: 'id',
          autoIncrement: true,
        });
        tnaStore.createIndex('assessmentNumber', 'assessmentNumber', { unique: true });
        tnaStore.createIndex('employeeId', 'employeeId', { unique: false });
        tnaStore.createIndex('assessorId', 'assessorId', { unique: false });
        tnaStore.createIndex('assessmentPeriod', 'assessmentPeriod', { unique: false });
        tnaStore.createIndex('status', 'status', { unique: false });
        tnaStore.createIndex('trainingLevel', 'trainingLevel', { unique: false });
      }

      // TNA Training Needs store
      if (!db.objectStoreNames.contains('tnaTrainingNeeds')) {
        const ttnStore = db.createObjectStore('tnaTrainingNeeds', {
          keyPath: 'id',
          autoIncrement: true,
        });
        ttnStore.createIndex('tnaId', 'tnaId', { unique: false });
        ttnStore.createIndex('trainingTypeId', 'trainingTypeId', { unique: false });
        ttnStore.createIndex('priority', 'priority', { unique: false });
        ttnStore.createIndex('status', 'status', { unique: false });
      }

      // Training Calendar store
      if (!db.objectStoreNames.contains('trainingCalendar')) {
        const tcStore = db.createObjectStore('trainingCalendar', {
          keyPath: 'id',
          autoIncrement: true,
        });
        tcStore.createIndex('fiscalYear', 'fiscalYear', { unique: false });
        tcStore.createIndex('trainingProgramId', 'trainingProgramId', { unique: false });
        tcStore.createIndex('plannedStartDate', 'plannedStartDate', { unique: false });
        tcStore.createIndex('status', 'status', { unique: false });
      }

      // Training Budget Proposals store
      if (!db.objectStoreNames.contains('trainingBudgetProposals')) {
        const tbpStore = db.createObjectStore('trainingBudgetProposals', {
          keyPath: 'id',
          autoIncrement: true,
        });
        tbpStore.createIndex('proposalNumber', 'proposalNumber', { unique: true });
        tbpStore.createIndex('trainingProgramId', 'trainingProgramId', { unique: false });
        tbpStore.createIndex('departmentId', 'departmentId', { unique: false });
        tbpStore.createIndex('status', 'status', { unique: false });
        tbpStore.createIndex('fundingSource', 'fundingSource', { unique: false });
      }

      // Trainings (Sessions/Events) store
      if (!db.objectStoreNames.contains('trainings')) {
        const trStore = db.createObjectStore('trainings', {
          keyPath: 'id',
          autoIncrement: true,
        });
        trStore.createIndex('trainingCode', 'trainingCode', { unique: true });
        trStore.createIndex('trainingProgramId', 'trainingProgramId', { unique: false });
        trStore.createIndex('calendarId', 'calendarId', { unique: false });
        trStore.createIndex('budgetProposalId', 'budgetProposalId', { unique: false });
        trStore.createIndex('startDate', 'startDate', { unique: false });
        trStore.createIndex('status', 'status', { unique: false });
        trStore.createIndex('venueType', 'venueType', { unique: false });
        trStore.createIndex('trainerType', 'trainerType', { unique: false });
      }

      // Training Participants store
      if (!db.objectStoreNames.contains('trainingParticipants')) {
        const tprtStore = db.createObjectStore('trainingParticipants', {
          keyPath: 'id',
          autoIncrement: true,
        });
        tprtStore.createIndex('trainingId', 'trainingId', { unique: false });
        tprtStore.createIndex('employeeId', 'employeeId', { unique: false });
        tprtStore.createIndex('invitationStatus', 'invitationStatus', { unique: false });
        tprtStore.createIndex('attended', 'attended', { unique: false });
        tprtStore.createIndex('passed', 'passed', { unique: false });
      }

      // Training Sessions store (for multi-day trainings)
      if (!db.objectStoreNames.contains('trainingSessions')) {
        const tsStore = db.createObjectStore('trainingSessions', {
          keyPath: 'id',
          autoIncrement: true,
        });
        tsStore.createIndex('trainingId', 'trainingId', { unique: false });
        tsStore.createIndex('sessionDate', 'sessionDate', { unique: false });
        tsStore.createIndex('status', 'status', { unique: false });
      }

      // Training Session Attendance store
      if (!db.objectStoreNames.contains('trainingSessionAttendance')) {
        const tsaStore = db.createObjectStore('trainingSessionAttendance', {
          keyPath: 'id',
          autoIncrement: true,
        });
        tsaStore.createIndex('sessionId', 'sessionId', { unique: false });
        tsaStore.createIndex('participantId', 'participantId', { unique: false });
      }

      // Training Materials store
      if (!db.objectStoreNames.contains('trainingMaterials')) {
        const tmStore = db.createObjectStore('trainingMaterials', {
          keyPath: 'id',
          autoIncrement: true,
        });
        tmStore.createIndex('trainingId', 'trainingId', { unique: false });
        tmStore.createIndex('materialType', 'materialType', { unique: false });
      }

      // Training Evaluations store
      if (!db.objectStoreNames.contains('trainingEvaluations')) {
        const teStore = db.createObjectStore('trainingEvaluations', {
          keyPath: 'id',
          autoIncrement: true,
        });
        teStore.createIndex('trainingId', 'trainingId', { unique: false });
        teStore.createIndex('participantId', 'participantId', { unique: false });
      }

      // Training Certificates store
      if (!db.objectStoreNames.contains('trainingCertificates')) {
        const tcertStore = db.createObjectStore('trainingCertificates', {
          keyPath: 'id',
          autoIncrement: true,
        });
        tcertStore.createIndex('certificateNumber', 'certificateNumber', { unique: true });
        tcertStore.createIndex('trainingId', 'trainingId', { unique: false });
        tcertStore.createIndex('employeeId', 'employeeId', { unique: false });
        tcertStore.createIndex('status', 'status', { unique: false });
      }

      // Training Bonds store
      if (!db.objectStoreNames.contains('trainingBonds')) {
        const tbStore = db.createObjectStore('trainingBonds', {
          keyPath: 'id',
          autoIncrement: true,
        });
        tbStore.createIndex('bondNumber', 'bondNumber', { unique: true });
        tbStore.createIndex('employeeId', 'employeeId', { unique: false });
        tbStore.createIndex('trainingId', 'trainingId', { unique: false });
        tbStore.createIndex('status', 'status', { unique: false });
      }

      // Employee Training History store
      if (!db.objectStoreNames.contains('employeeTrainingHistory')) {
        const ethStore = db.createObjectStore('employeeTrainingHistory', {
          keyPath: 'id',
          autoIncrement: true,
        });
        ethStore.createIndex('employeeId', 'employeeId', { unique: false });
        ethStore.createIndex('trainingTypeId', 'trainingTypeId', { unique: false });
        ethStore.createIndex('trainingId', 'trainingId', { unique: false });
        ethStore.createIndex('isExternal', 'isExternal', { unique: false });
      }

      // Training Reports store
      if (!db.objectStoreNames.contains('trainingReports')) {
        const trptStore = db.createObjectStore('trainingReports', {
          keyPath: 'id',
          autoIncrement: true,
        });
        trptStore.createIndex('reportNumber', 'reportNumber', { unique: true });
        trptStore.createIndex('trainingId', 'trainingId', { unique: false });
        trptStore.createIndex('status', 'status', { unique: false });
      }

      // ========== EXIT & TERMINATION MODULE (Extended) ==========

      // Clearance Items store (Individual items to return)
      if (!db.objectStoreNames.contains('clearanceItems')) {
        const ciStore = db.createObjectStore('clearanceItems', {
          keyPath: 'id',
          autoIncrement: true,
        });
        ciStore.createIndex('clearanceId', 'clearanceId', { unique: false });
        ciStore.createIndex('itemName', 'itemName', { unique: false });
        ciStore.createIndex('itemCategory', 'itemCategory', { unique: false });
        ciStore.createIndex('isReturned', 'isReturned', { unique: false });
        ciStore.createIndex('returnCondition', 'returnCondition', { unique: false });
      }

      // Exit Compliance Checks store
      if (!db.objectStoreNames.contains('exitComplianceChecks')) {
        const eccStore = db.createObjectStore('exitComplianceChecks', {
          keyPath: 'id',
          autoIncrement: true,
        });
        eccStore.createIndex('exitInterviewId', 'exitInterviewId', { unique: false });
        eccStore.createIndex('checkArea', 'checkArea', { unique: false });
        eccStore.createIndex('requiresFollowup', 'requiresFollowup', { unique: false });
      }

      // Exit Interview Summaries store (HR Analysis)
      if (!db.objectStoreNames.contains('exitInterviewSummaries')) {
        const eisStore = db.createObjectStore('exitInterviewSummaries', {
          keyPath: 'id',
          autoIncrement: true,
        });
        eisStore.createIndex('exitInterviewId', 'exitInterviewId', { unique: false });
        eisStore.createIndex('preparedBy', 'preparedBy', { unique: false });
        eisStore.createIndex('exitCategory', 'exitCategory', { unique: false });
        eisStore.createIndex('riskLevel', 'riskLevel', { unique: false });
      }

      // Settlement Payments store
      if (!db.objectStoreNames.contains('settlementPayments')) {
        const spStore = db.createObjectStore('settlementPayments', {
          keyPath: 'id',
          autoIncrement: true,
        });
        spStore.createIndex('settlementId', 'settlementId', { unique: false });
        spStore.createIndex('paymentReference', 'paymentReference', { unique: true });
        spStore.createIndex('paymentDate', 'paymentDate', { unique: false });
        spStore.createIndex('paymentMethod', 'paymentMethod', { unique: false });
        spStore.createIndex('status', 'status', { unique: false });
      }

      // Termination Records store (For Cause)
      if (!db.objectStoreNames.contains('terminationRecords')) {
        const trStore = db.createObjectStore('terminationRecords', {
          keyPath: 'id',
          autoIncrement: true,
        });
        trStore.createIndex('separationId', 'separationId', { unique: false });
        trStore.createIndex('terminationType', 'terminationType', { unique: false });
        trStore.createIndex('causeCategory', 'causeCategory', { unique: false });
        trStore.createIndex('terminationDate', 'terminationDate', { unique: false });
        trStore.createIndex('appealAllowed', 'appealAllowed', { unique: false });
        trStore.createIndex('appealOutcome', 'appealOutcome', { unique: false });
      }

      // Handover Records store
      if (!db.objectStoreNames.contains('handoverRecords')) {
        const hrStore = db.createObjectStore('handoverRecords', {
          keyPath: 'id',
          autoIncrement: true,
        });
        hrStore.createIndex('separationId', 'separationId', { unique: false });
        hrStore.createIndex('handoverToEmployeeId', 'handoverToEmployeeId', { unique: false });
        hrStore.createIndex('status', 'status', { unique: false });
        hrStore.createIndex('supervisorVerified', 'supervisorVerified', { unique: false });
      }

      // Handover Items store
      if (!db.objectStoreNames.contains('handoverItems')) {
        const hiStore = db.createObjectStore('handoverItems', {
          keyPath: 'id',
          autoIncrement: true,
        });
        hiStore.createIndex('handoverId', 'handoverId', { unique: false });
        hiStore.createIndex('itemType', 'itemType', { unique: false });
        hiStore.createIndex('priority', 'priority', { unique: false });
        hiStore.createIndex('handoverStatus', 'handoverStatus', { unique: false });
      }

      // Separation History store (Audit Trail)
      if (!db.objectStoreNames.contains('separationHistory')) {
        const shStore = db.createObjectStore('separationHistory', {
          keyPath: 'id',
          autoIncrement: true,
        });
        shStore.createIndex('separationId', 'separationId', { unique: false });
        shStore.createIndex('fromStatus', 'fromStatus', { unique: false });
        shStore.createIndex('toStatus', 'toStatus', { unique: false });
        shStore.createIndex('changedBy', 'changedBy', { unique: false });
        shStore.createIndex('changedAt', 'changedAt', { unique: false });
      }

      // ========== LEAVE MANAGEMENT EXTENDED (Chapter 7 Enhanced) ==========

      // Leave Policies store
      if (!db.objectStoreNames.contains('leavePolicies')) {
        const policyStore = db.createObjectStore('leavePolicies', {
          keyPath: 'id',
          autoIncrement: true,
        });
        policyStore.createIndex('fiscalYear', 'fiscalYear', { unique: false });
        policyStore.createIndex('leaveTypeId', 'leaveTypeId', { unique: false });
        policyStore.createIndex('employeeType', 'employeeType', { unique: false });
        policyStore.createIndex('isActive', 'isActive', { unique: false });
        policyStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Employee Leave Balances store (comprehensive)
      if (!db.objectStoreNames.contains('employeeLeaveBalances')) {
        const balanceStore = db.createObjectStore('employeeLeaveBalances', {
          keyPath: 'id',
          autoIncrement: true,
        });
        balanceStore.createIndex('employeeId', 'employeeId', { unique: false });
        balanceStore.createIndex('leaveTypeId', 'leaveTypeId', { unique: false });
        balanceStore.createIndex('fiscalYear', 'fiscalYear', { unique: false });
        balanceStore.createIndex('createdAt', 'createdAt', { unique: false });
        // Compound index for employee + type + year
        balanceStore.createIndex('employeeTypeYear', ['employeeId', 'leaveTypeId', 'fiscalYear'], { unique: true });
      }

      // Holidays store
      if (!db.objectStoreNames.contains('holidays')) {
        const holidayStore = db.createObjectStore('holidays', {
          keyPath: 'id',
          autoIncrement: true,
        });
        holidayStore.createIndex('name', 'name', { unique: false });
        holidayStore.createIndex('date', 'date', { unique: false });
        holidayStore.createIndex('holidayType', 'holidayType', { unique: false });
        holidayStore.createIndex('fiscalYear', 'fiscalYear', { unique: false });
        holidayStore.createIndex('isActive', 'isActive', { unique: false });
        holidayStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Leave Request Days store (individual days breakdown)
      if (!db.objectStoreNames.contains('leaveRequestDays')) {
        const lrdStore = db.createObjectStore('leaveRequestDays', {
          keyPath: 'id',
          autoIncrement: true,
        });
        lrdStore.createIndex('leaveRequestId', 'leaveRequestId', { unique: false });
        lrdStore.createIndex('date', 'date', { unique: false });
        lrdStore.createIndex('dayType', 'dayType', { unique: false });
        lrdStore.createIndex('counted', 'counted', { unique: false });
      }

      // Timesheets store
      if (!db.objectStoreNames.contains('timesheets')) {
        const tsStore = db.createObjectStore('timesheets', {
          keyPath: 'id',
          autoIncrement: true,
        });
        tsStore.createIndex('employeeId', 'employeeId', { unique: false });
        tsStore.createIndex('month', 'month', { unique: false });
        tsStore.createIndex('year', 'year', { unique: false });
        tsStore.createIndex('status', 'status', { unique: false });
        tsStore.createIndex('managerId', 'managerId', { unique: false });
        tsStore.createIndex('createdAt', 'createdAt', { unique: false });
        // Compound index for employee + month + year
        tsStore.createIndex('employeeMonthYear', ['employeeId', 'month', 'year'], { unique: true });
      }

      // OIC Assignments store (Officer in Charge)
      if (!db.objectStoreNames.contains('oicAssignments')) {
        const oicStore = db.createObjectStore('oicAssignments', {
          keyPath: 'id',
          autoIncrement: true,
        });
        oicStore.createIndex('leaveRequestId', 'leaveRequestId', { unique: false });
        oicStore.createIndex('absentEmployeeId', 'absentEmployeeId', { unique: false });
        oicStore.createIndex('oicEmployeeId', 'oicEmployeeId', { unique: false });
        oicStore.createIndex('status', 'status', { unique: false });
        oicStore.createIndex('startDate', 'startDate', { unique: false });
        oicStore.createIndex('endDate', 'endDate', { unique: false });
      }

      // Leave Adjustments store (manual balance adjustments)
      if (!db.objectStoreNames.contains('leaveAdjustments')) {
        const adjStore = db.createObjectStore('leaveAdjustments', {
          keyPath: 'id',
          autoIncrement: true,
        });
        adjStore.createIndex('employeeId', 'employeeId', { unique: false });
        adjStore.createIndex('leaveTypeId', 'leaveTypeId', { unique: false });
        adjStore.createIndex('fiscalYear', 'fiscalYear', { unique: false });
        adjStore.createIndex('adjustmentType', 'adjustmentType', { unique: false });
        adjStore.createIndex('status', 'status', { unique: false });
        adjStore.createIndex('adjustedBy', 'adjustedBy', { unique: false });
        adjStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Leave Carryover Records store (year-end carryover)
      if (!db.objectStoreNames.contains('leaveCarryoverRecords')) {
        const coStore = db.createObjectStore('leaveCarryoverRecords', {
          keyPath: 'id',
          autoIncrement: true,
        });
        coStore.createIndex('employeeId', 'employeeId', { unique: false });
        coStore.createIndex('leaveTypeId', 'leaveTypeId', { unique: false });
        coStore.createIndex('fromYear', 'fromYear', { unique: false });
        coStore.createIndex('toYear', 'toYear', { unique: false });
        coStore.createIndex('processedBy', 'processedBy', { unique: false });
        coStore.createIndex('processedAt', 'processedAt', { unique: false });
      }
    },
  });
};

// Get database instance
let dbInstance = null;

export const getDB = async () => {
  if (!dbInstance) {
    try {
      dbInstance = await initDB();
    } catch (error) {
      // If there's a version error, close and reset
      if (dbInstance) {
        dbInstance.close();
      }
      dbInstance = null;
      throw error;
    }
  }
  return dbInstance;
};

// Reset database connection (useful when version changes)
export const resetDB = () => {
  if (dbInstance) {
    dbInstance.close();
  }
  dbInstance = null;
};

// Delete and recreate database (use when upgrade fails)
export const deleteAndRecreateDB = async () => {
  // Close existing connection
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }

  // Delete the database
  await new Promise((resolve, reject) => {
    const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
    deleteRequest.onsuccess = () => resolve();
    deleteRequest.onerror = () => reject(deleteRequest.error);
    deleteRequest.onblocked = () => {
      console.warn('Database deletion blocked - close other tabs using this database');
      resolve(); // Continue anyway
    };
  });

  // Reinitialize
  dbInstance = await initDB();
  return dbInstance;
};

// Expose deleteAndRecreateDB globally for debugging
if (typeof window !== 'undefined') {
  window.resetVDODatabase = async () => {
    console.log('Resetting VDO ERP database...');
    await deleteAndRecreateDB();
    console.log('Database reset complete! Please refresh the page.');
    return 'Database reset successful. Please refresh the page.';
  };
}

// Employee operations
export const employeeDB = {
  // Generate employee ID
  generateEmployeeId: async () => {
    const db = await getDB();
    const count = await db.count('employees');
    const year = new Date().getFullYear();
    return `EMP-${year}-${String(count + 1).padStart(4, '0')}`;
  },

  // Create employee
  create: async (employeeData) => {
    const db = await getDB();
    const employeeId = await employeeDB.generateEmployeeId();
    const now = new Date().toISOString();

    const employee = {
      ...employeeData,
      employeeId,
      createdAt: now,
      updatedAt: now,
      profileComplete: false,
    };

    const id = await db.add('employees', employee);
    return { ...employee, id };
  },

  // Get all employees with optional filters
  getAll: async (filters = {}) => {
    const db = await getDB();
    let employees = await db.getAll('employees');

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      employees = employees.filter(emp =>
        emp.firstName?.toLowerCase().includes(searchLower) ||
        emp.lastName?.toLowerCase().includes(searchLower) ||
        emp.email?.toLowerCase().includes(searchLower) ||
        emp.employeeId?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      employees = employees.filter(emp => emp.status === filters.status);
    }

    if (filters.department) {
      employees = employees.filter(emp => emp.department === filters.department);
    }

    if (filters.office) {
      employees = employees.filter(emp => emp.office === filters.office);
    }

    // Sort by creation date (newest first)
    employees.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return employees;
  },

  // Get single employee by ID
  getById: async (id) => {
    const db = await getDB();
    return db.get('employees', Number(id));
  },

  // Get employee by employee ID string
  getByEmployeeId: async (employeeId) => {
    const db = await getDB();
    const index = db.transaction('employees').store.index('employeeId');
    return index.get(employeeId);
  },

  // Update employee
  update: async (id, employeeData) => {
    const db = await getDB();
    const existing = await db.get('employees', Number(id));

    if (!existing) {
      throw new Error('Employee not found');
    }

    const updated = {
      ...existing,
      ...employeeData,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };

    await db.put('employees', updated);
    return updated;
  },

  // Delete employee
  delete: async (id) => {
    const db = await getDB();
    await db.delete('employees', Number(id));
    return true;
  },

  // Get statistics
  getStatistics: async () => {
    const db = await getDB();
    const employees = await db.getAll('employees');

    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      total: employees.length,
      active: employees.filter(e => e.status === 'active').length,
      onLeave: employees.filter(e => e.status === 'on_leave').length,
      newThisMonth: employees.filter(e => new Date(e.createdAt) >= firstOfMonth).length,
      profileComplete: employees.filter(e => e.profileComplete).length,
      profileIncomplete: employees.filter(e => !e.profileComplete).length,
    };
  },

  // Check if profile is complete
  checkProfileComplete: (employee) => {
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone',
      'dateOfBirth', 'gender', 'nationality',
      'currentAddress', 'department', 'position',
      'hireDate', 'employmentType', 'basicSalary'
    ];

    return requiredFields.every(field =>
      employee[field] !== undefined &&
      employee[field] !== null &&
      employee[field] !== ''
    );
  },

  // Seed default employees
  seedDefaults: async () => {
    const db = await getDB();
    const existing = await db.count('employees');
    if (existing > 0) return; // Already seeded

    const defaultEmployees = [
      {
        firstName: 'Ahmad',
        lastName: 'Karimi',
        email: 'ahmad.karimi@vdo.org',
        phone: '+93 700 123 456',
        dateOfBirth: '1990-05-15',
        gender: 'male',
        nationality: 'Afghan',
        currentAddress: 'Kabul, Afghanistan',
        department: 'Program',
        position: 'Program Manager',
        office: 'Kabul',
        grade: 'Grade 5',
        hireDate: '2020-01-15',
        employmentType: 'full-time',
        workSchedule: 'monday_friday',
        basicSalary: 1200,
        status: 'active',
        profileComplete: true,
      },
      {
        firstName: 'Fatima',
        lastName: 'Ahmadi',
        email: 'fatima.ahmadi@vdo.org',
        phone: '+93 700 234 567',
        dateOfBirth: '1992-08-22',
        gender: 'female',
        nationality: 'Afghan',
        currentAddress: 'Herat, Afghanistan',
        department: 'Finance',
        position: 'Finance Officer',
        office: 'Herat',
        grade: 'Grade 4',
        hireDate: '2021-03-10',
        employmentType: 'full-time',
        workSchedule: 'monday_friday',
        basicSalary: 900,
        status: 'active',
        profileComplete: true,
      },
      {
        firstName: 'Hassan',
        lastName: 'Nazari',
        email: 'hassan.nazari@vdo.org',
        phone: '+93 700 345 678',
        dateOfBirth: '1988-12-05',
        gender: 'male',
        nationality: 'Afghan',
        currentAddress: 'Mazar-e-Sharif, Afghanistan',
        department: 'HR',
        position: 'HR Coordinator',
        office: 'Mazar',
        grade: 'Grade 3',
        hireDate: '2019-06-20',
        employmentType: 'full-time',
        workSchedule: 'monday_friday',
        basicSalary: 800,
        status: 'active',
        profileComplete: true,
      },
    ];

    for (const empData of defaultEmployees) {
      await employeeDB.create(empData);
    }
  },
};

// Department operations
export const departmentDB = {
  create: async (data) => {
    const db = await getDB();
    const id = await db.add('departments', {
      ...data,
      createdAt: new Date().toISOString(),
    });
    return { ...data, id };
  },

  getAll: async () => {
    const db = await getDB();
    return db.getAll('departments');
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('departments', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('departments', Number(id));
    const updated = { ...existing, ...data, id: Number(id) };
    await db.put('departments', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('departments', Number(id));
    return true;
  },

  // Seed default departments
  seedDefaults: async () => {
    const db = await getDB();
    const existing = await db.getAll('departments');

    if (existing.length === 0) {
      const defaults = [
        { name: 'Human Resources', code: 'HR', description: 'Human Resources Department' },
        { name: 'Information Technology', code: 'IT', description: 'IT Department' },
        { name: 'Finance', code: 'FIN', description: 'Finance Department' },
        { name: 'Operations', code: 'OPS', description: 'Operations Department' },
        { name: 'Sales', code: 'SALES', description: 'Sales Department' },
        { name: 'Marketing', code: 'MKT', description: 'Marketing Department' },
      ];

      for (const dept of defaults) {
        await departmentDB.create(dept);
      }
    }
  },
};

// Position operations
export const positionDB = {
  create: async (data) => {
    const db = await getDB();
    const id = await db.add('positions', {
      ...data,
      createdAt: new Date().toISOString(),
    });
    return { ...data, id };
  },

  getAll: async () => {
    const db = await getDB();
    return db.getAll('positions');
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('positions', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('positions', Number(id));
    const updated = { ...existing, ...data, id: Number(id) };
    await db.put('positions', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('positions', Number(id));
    return true;
  },

  // Seed default positions
  seedDefaults: async () => {
    const db = await getDB();
    const existing = await db.getAll('positions');

    if (existing.length === 0) {
      const defaults = [
        { title: 'Software Engineer', department: 'Information Technology', level: 'Mid' },
        { title: 'Senior Software Engineer', department: 'Information Technology', level: 'Senior' },
        { title: 'HR Manager', department: 'Human Resources', level: 'Manager' },
        { title: 'HR Specialist', department: 'Human Resources', level: 'Mid' },
        { title: 'Financial Analyst', department: 'Finance', level: 'Mid' },
        { title: 'Accountant', department: 'Finance', level: 'Junior' },
        { title: 'Operations Manager', department: 'Operations', level: 'Manager' },
        { title: 'Sales Representative', department: 'Sales', level: 'Junior' },
        { title: 'Marketing Specialist', department: 'Marketing', level: 'Mid' },
      ];

      for (const pos of defaults) {
        await positionDB.create(pos);
      }
    }
  },
};

// Office operations
export const officeDB = {
  create: async (data) => {
    const db = await getDB();
    const id = await db.add('offices', {
      ...data,
      createdAt: new Date().toISOString(),
    });
    return { ...data, id };
  },

  getAll: async () => {
    const db = await getDB();
    return db.getAll('offices');
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('offices', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('offices', Number(id));
    const updated = { ...existing, ...data, id: Number(id) };
    await db.put('offices', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('offices', Number(id));
    return true;
  },

  // Seed default offices
  seedDefaults: async () => {
    const db = await getDB();
    const existing = await db.getAll('offices');

    if (existing.length === 0) {
      const defaults = [
        { name: 'Head Office', city: 'Kabul', country: 'Afghanistan', address: 'Main Street, Kabul' },
        { name: 'Branch Office - Herat', city: 'Herat', country: 'Afghanistan', address: 'Central Road, Herat' },
        { name: 'Branch Office - Mazar', city: 'Mazar-i-Sharif', country: 'Afghanistan', address: 'Business District, Mazar' },
      ];

      for (const office of defaults) {
        await officeDB.create(office);
      }
    }
  },
};

// Grade operations
export const gradeDB = {
  create: async (data) => {
    const db = await getDB();
    const id = await db.add('grades', {
      ...data,
      createdAt: new Date().toISOString(),
    });
    return { ...data, id };
  },

  getAll: async () => {
    const db = await getDB();
    return db.getAll('grades');
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('grades', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('grades', Number(id));
    const updated = { ...existing, ...data, id: Number(id) };
    await db.put('grades', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('grades', Number(id));
    return true;
  },

  // Seed default grades
  seedDefaults: async () => {
    const db = await getDB();
    const existing = await db.getAll('grades');

    if (existing.length === 0) {
      const defaults = [
        { name: 'Grade 1', level: 1, minSalary: 15000, maxSalary: 25000 },
        { name: 'Grade 2', level: 2, minSalary: 25000, maxSalary: 40000 },
        { name: 'Grade 3', level: 3, minSalary: 40000, maxSalary: 60000 },
        { name: 'Grade 4', level: 4, minSalary: 60000, maxSalary: 85000 },
        { name: 'Grade 5', level: 5, minSalary: 85000, maxSalary: 120000 },
        { name: 'Grade 6', level: 6, minSalary: 120000, maxSalary: 180000 },
      ];

      for (const grade of defaults) {
        await gradeDB.create(grade);
      }
    }
  },
};

// Employee Type operations
export const employeeTypeDB = {
  create: async (data) => {
    const db = await getDB();
    const id = await db.add('employeeTypes', {
      ...data,
      createdAt: new Date().toISOString(),
    });
    return { ...data, id };
  },

  getAll: async () => {
    const db = await getDB();
    return db.getAll('employeeTypes');
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('employeeTypes', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('employeeTypes', Number(id));
    const updated = { ...existing, ...data, id: Number(id) };
    await db.put('employeeTypes', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('employeeTypes', Number(id));
    return true;
  },

  // Seed default employee types
  seedDefaults: async () => {
    const db = await getDB();
    const existing = await db.getAll('employeeTypes');

    if (existing.length === 0) {
      const defaults = [
        { name: 'Full Time', code: 'FT', description: 'Full-time permanent employee' },
        { name: 'Part Time', code: 'PT', description: 'Part-time employee' },
        { name: 'Contract', code: 'CT', description: 'Contract-based employee' },
        { name: 'Intern', code: 'IN', description: 'Intern or trainee' },
        { name: 'Temporary', code: 'TP', description: 'Temporary employee' },
        { name: 'Consultant', code: 'CN', description: 'External consultant' },
      ];

      for (const type of defaults) {
        await employeeTypeDB.create(type);
      }
    }
  },
};

// Work Schedule operations
export const workScheduleDB = {
  create: async (data) => {
    const db = await getDB();
    const id = await db.add('workSchedules', {
      ...data,
      createdAt: new Date().toISOString(),
    });
    return { ...data, id };
  },

  getAll: async () => {
    const db = await getDB();
    return db.getAll('workSchedules');
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('workSchedules', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('workSchedules', Number(id));
    const updated = { ...existing, ...data, id: Number(id) };
    await db.put('workSchedules', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('workSchedules', Number(id));
    return true;
  },

  // Seed default work schedules
  seedDefaults: async () => {
    const db = await getDB();
    const existing = await db.getAll('workSchedules');

    if (existing.length === 0) {
      const defaults = [
        {
          name: 'Standard (9 AM - 5 PM)',
          code: 'STD',
          startTime: '09:00',
          endTime: '17:00',
          workingDays: 'Monday to Friday',
          hoursPerWeek: 40,
          description: 'Standard 9 to 5 work schedule'
        },
        {
          name: 'Flexible',
          code: 'FLX',
          startTime: null,
          endTime: null,
          workingDays: 'Flexible',
          hoursPerWeek: 40,
          description: 'Flexible working hours'
        },
        {
          name: 'Shift Based',
          code: 'SFT',
          startTime: null,
          endTime: null,
          workingDays: 'Rotational',
          hoursPerWeek: 40,
          description: 'Rotating shift schedule'
        },
        {
          name: 'Remote',
          code: 'RMT',
          startTime: null,
          endTime: null,
          workingDays: 'Monday to Friday',
          hoursPerWeek: 40,
          description: 'Remote work schedule'
        },
        {
          name: 'Part-Time Morning',
          code: 'PTM',
          startTime: '09:00',
          endTime: '13:00',
          workingDays: 'Monday to Friday',
          hoursPerWeek: 20,
          description: 'Part-time morning shift'
        },
        {
          name: 'Part-Time Evening',
          code: 'PTE',
          startTime: '14:00',
          endTime: '18:00',
          workingDays: 'Monday to Friday',
          hoursPerWeek: 20,
          description: 'Part-time evening shift'
        },
      ];

      for (const schedule of defaults) {
        await workScheduleDB.create(schedule);
      }
    }
  },
};

// Document Type operations
export const documentTypeDB = {
  create: async (data) => {
    const db = await getDB();
    const id = await db.add('documentTypes', {
      ...data,
      createdAt: new Date().toISOString(),
    });
    return { ...data, id };
  },

  getAll: async () => {
    const db = await getDB();
    return db.getAll('documentTypes');
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('documentTypes', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('documentTypes', Number(id));
    const updated = { ...existing, ...data, id: Number(id) };
    await db.put('documentTypes', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('documentTypes', Number(id));
    return true;
  },

  // Seed default document types
  seedDefaults: async () => {
    const db = await getDB();
    const existing = await db.getAll('documentTypes');

    if (existing.length === 0) {
      const defaults = [
        { name: 'National ID / Tazkira', code: 'NID', required: true, description: 'National identification card or Tazkira' },
        { name: 'Passport', code: 'PAS', required: false, description: 'Passport document' },
        { name: 'Resume / CV', code: 'CV', required: true, description: 'Curriculum Vitae or Resume' },
        { name: 'Educational Certificate', code: 'EDU', required: true, description: 'Educational degree or certificate' },
        { name: 'Experience Letter', code: 'EXP', required: false, description: 'Previous employment experience letter' },
        { name: 'Medical Certificate', code: 'MED', required: false, description: 'Medical fitness certificate' },
        { name: 'Police Clearance', code: 'POL', required: false, description: 'Police clearance certificate' },
        { name: 'Bank Account Details', code: 'BNK', required: true, description: 'Bank account information' },
        { name: 'Photo', code: 'PHO', required: true, description: 'Passport size photograph' },
        { name: 'Contract Agreement', code: 'CON', required: false, description: 'Employment contract' },
      ];

      for (const type of defaults) {
        await documentTypeDB.create(type);
      }
    }
  },
};

// Template Document operations
export const templateDocumentDB = {
  create: async (data) => {
    const db = await getDB();
    const id = await db.add('templateDocuments', {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return { ...data, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let templates = await db.getAll('templateDocuments');

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      templates = templates.filter(template =>
        template.name?.toLowerCase().includes(searchLower) ||
        template.description?.toLowerCase().includes(searchLower) ||
        template.category?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category) {
      templates = templates.filter(template => template.category === filters.category);
    }

    // Sort by creation date (newest first)
    templates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return templates;
  },

  getById: async (id) => {
    const db = await getDB();
    return await db.get('templateDocuments', id);
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('templateDocuments', id);
    if (!existing) {
      throw new Error('Template document not found');
    }

    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };

    await db.put('templateDocuments', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('templateDocuments', id);
    return true;
  },

  seedDefaults: async () => {
    const db = await getDB();
    const existing = await db.getAll('templateDocuments');

    if (existing.length === 0) {
      const defaults = [
        {
          name: 'Employment Contract Template',
          category: 'Contract',
          description: 'Standard employment contract template',
          fileName: 'employment_contract_template.docx',
          fileSize: 0,
          fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
        {
          name: 'NDA Template',
          category: 'Agreement',
          description: 'Non-disclosure agreement template',
          fileName: 'nda_template.docx',
          fileSize: 0,
          fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
        {
          name: 'Leave Request Form',
          category: 'Form',
          description: 'Standard leave request form',
          fileName: 'leave_request_form.pdf',
          fileSize: 0,
          fileType: 'application/pdf',
        },
        {
          name: 'Offer Letter Template',
          category: 'Letter',
          description: 'Job offer letter template',
          fileName: 'offer_letter_template.docx',
          fileSize: 0,
          fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
        {
          name: 'Resignation Letter Template',
          category: 'Letter',
          description: 'Employee resignation letter template',
          fileName: 'resignation_letter_template.docx',
          fileSize: 0,
          fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
      ];

      for (const template of defaults) {
        await templateDocumentDB.create(template);
      }
    }
  },
};

// ============ PROCUREMENT MODULE OPERATIONS ============

// Vendor operations
export const vendorDB = {
  create: async (data) => {
    const db = await getDB();

    // Generate vendor code if not provided
    if (!data.vendorCode) {
      const allVendors = await db.getAll('vendors');
      const nextNumber = allVendors.length + 1;
      data.vendorCode = `VEN-${String(nextNumber).padStart(4, '0')}`;
    }

    const id = await db.add('vendors', {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return { ...data, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let vendors = await db.getAll('vendors');

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      vendors = vendors.filter(vendor =>
        vendor.companyName?.toLowerCase().includes(searchLower) ||
        vendor.vendorCode?.toLowerCase().includes(searchLower) ||
        vendor.contactPerson?.toLowerCase().includes(searchLower) ||
        vendor.email?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category) {
      vendors = vendors.filter(vendor => vendor.category === filters.category);
    }

    if (filters.status) {
      vendors = vendors.filter(vendor => vendor.status === filters.status);
    }

    // Sort by creation date (newest first)
    vendors.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return vendors;
  },

  getById: async (id) => {
    const db = await getDB();
    return await db.get('vendors', id);
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('vendors', id);
    if (!existing) {
      throw new Error('Vendor not found');
    }

    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };

    await db.put('vendors', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('vendors', id);
    return true;
  },

  seedDefaults: async () => {
    const db = await getDB();
    const existing = await db.getAll('vendors');

    if (existing.length === 0) {
      const defaults = [
        {
          vendorCode: 'VEN-0001',
          companyName: 'Afghan Tech Solutions',
          contactPerson: 'Ahmad Khalid',
          email: 'ahmad@afghantech.com',
          phone: '+93-700-123-456',
          address: 'Shar-e-Naw, Charahi Ansari',
          city: 'Kabul',
          country: 'Afghanistan',
          taxId: 'TIN-1001234567',
          bankName: 'Afghanistan International Bank',
          bankAccountNumber: 'AF12-3456-7890-1234',
          category: 'Both',
          status: 'Active',
          rating: 5,
          paymentTerms: 'Net 30',
          creditLimit: 100000,
        },
        {
          vendorCode: 'VEN-0002',
          companyName: 'Kabul Office Supplies',
          contactPerson: 'Fatima Rezaei',
          email: 'fatima@kabuloffice.com',
          phone: '+93-700-234-567',
          address: 'Mandawi Market, Shop 45',
          city: 'Kabul',
          country: 'Afghanistan',
          taxId: 'TIN-1001234568',
          bankName: 'Azizi Bank',
          bankAccountNumber: 'AF12-3456-7890-5678',
          category: 'Goods',
          status: 'Active',
          rating: 4,
          paymentTerms: 'Net 30',
          creditLimit: 50000,
        },
        {
          vendorCode: 'VEN-0003',
          companyName: 'Herat Furniture Industries',
          contactPerson: 'Mohammad Amin',
          email: 'amin@heratfurniture.com',
          phone: '+93-700-345-678',
          address: 'Industrial Park, Zone 2',
          city: 'Herat',
          country: 'Afghanistan',
          taxId: 'TIN-1001234569',
          bankName: 'Maiwand Bank',
          bankAccountNumber: 'AF12-3456-7890-9012',
          category: 'Goods',
          status: 'Active',
          rating: 5,
          paymentTerms: 'Net 60',
          creditLimit: 75000,
        },
        {
          vendorCode: 'VEN-0004',
          companyName: 'IT Services Afghanistan',
          contactPerson: 'Rahimullah Safi',
          email: 'rahim@itservices.af',
          phone: '+93-700-456-789',
          address: 'Wazir Akbar Khan, Street 15',
          city: 'Kabul',
          country: 'Afghanistan',
          taxId: 'TIN-1001234570',
          bankName: 'Ghazanfar Bank',
          bankAccountNumber: 'AF12-3456-7890-3456',
          category: 'Services',
          status: 'Active',
          rating: 4,
          paymentTerms: 'Net 30',
          creditLimit: 60000,
        },
        {
          vendorCode: 'VEN-0005',
          companyName: 'Mazar Auto Parts',
          contactPerson: 'Hassan Ahmadi',
          email: 'hassan@mazarauto.com',
          phone: '+93-700-567-890',
          address: 'Blue Mosque Road, Block A',
          city: 'Mazar-i-Sharif',
          country: 'Afghanistan',
          taxId: 'TIN-1001234571',
          bankName: 'First MicroFinance Bank',
          bankAccountNumber: 'AF12-3456-7890-7890',
          category: 'Goods',
          status: 'Active',
          rating: 4,
          paymentTerms: 'Net 30',
          creditLimit: 40000,
        },
        {
          vendorCode: 'VEN-0006',
          companyName: 'Kandahar Construction Materials',
          contactPerson: 'Abdul Wahab',
          email: 'wahab@kandaharcm.com',
          phone: '+93-700-678-901',
          address: 'Highway Road, Km 5',
          city: 'Kandahar',
          country: 'Afghanistan',
          taxId: 'TIN-1001234572',
          bankName: 'Pashtany Bank',
          bankAccountNumber: 'AF12-3456-7890-2345',
          category: 'Goods',
          status: 'Active',
          rating: 3,
          paymentTerms: 'Net 60',
          creditLimit: 80000,
        },
        {
          vendorCode: 'VEN-0007',
          companyName: 'Jalalabad Electronics',
          contactPerson: 'Noorullah Khan',
          email: 'noor@jalalabadelectronics.com',
          phone: '+93-700-789-012',
          address: 'City Center, Floor 2',
          city: 'Jalalabad',
          country: 'Afghanistan',
          taxId: 'TIN-1001234573',
          bankName: 'Bakhtar Bank',
          bankAccountNumber: 'AF12-3456-7890-6789',
          category: 'Goods',
          status: 'Active',
          rating: 5,
          paymentTerms: 'Net 30',
          creditLimit: 55000,
        },
        {
          vendorCode: 'VEN-0008',
          companyName: 'Professional Cleaning Services',
          contactPerson: 'Zainab Hussaini',
          email: 'zainab@pcsafghan.com',
          phone: '+93-700-890-123',
          address: 'Karte Seh, Street 8',
          city: 'Kabul',
          country: 'Afghanistan',
          taxId: 'TIN-1001234574',
          bankName: 'New Kabul Bank',
          bankAccountNumber: 'AF12-3456-7890-4567',
          category: 'Services',
          status: 'Active',
          rating: 4,
          paymentTerms: 'Net 15',
          creditLimit: 25000,
        },
        {
          vendorCode: 'VEN-0009',
          companyName: 'Medical Supplies Afghanistan',
          contactPerson: 'Dr. Bashir Ahmadzai',
          email: 'bashir@medsupply.af',
          phone: '+93-700-901-234',
          address: 'Mikrorayon, District 4',
          city: 'Kabul',
          country: 'Afghanistan',
          taxId: 'TIN-1001234575',
          bankName: 'Afghanistan International Bank',
          bankAccountNumber: 'AF12-3456-7890-8901',
          category: 'Goods',
          status: 'Active',
          rating: 5,
          paymentTerms: 'Net 30',
          creditLimit: 120000,
        },
        {
          vendorCode: 'VEN-0010',
          companyName: 'Security Equipment Traders',
          contactPerson: 'Dawood Karimi',
          email: 'dawood@securityequip.af',
          phone: '+93-700-012-345',
          address: 'Industrial Zone, Plot 12',
          city: 'Kabul',
          country: 'Afghanistan',
          taxId: 'TIN-1001234576',
          bankName: 'Azizi Bank',
          bankAccountNumber: 'AF12-3456-7890-0123',
          category: 'Both',
          status: 'Active',
          rating: 4,
          paymentTerms: 'Net 60',
          creditLimit: 90000,
        },
      ];

      for (const vendor of defaults) {
        await vendorDB.create(vendor);
      }
    }
  },
};

// Item Category operations
export const itemCategoryDB = {
  create: async (data) => {
    const db = await getDB();
    const id = await db.add('itemCategories', {
      ...data,
      createdAt: new Date().toISOString(),
    });
    return { ...data, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let categories = await db.getAll('itemCategories');

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      categories = categories.filter(cat =>
        cat.name?.toLowerCase().includes(searchLower) ||
        cat.code?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.parent !== undefined) {
      categories = categories.filter(cat => cat.parent === filters.parent);
    }

    return categories;
  },

  getById: async (id) => {
    const db = await getDB();
    return await db.get('itemCategories', id);
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('itemCategories', id);
    if (!existing) {
      throw new Error('Category not found');
    }

    const updated = { ...existing, ...data, id };
    await db.put('itemCategories', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('itemCategories', id);
    return true;
  },

  seedDefaults: async () => {
    const db = await getDB();
    const existing = await db.getAll('itemCategories');

    if (existing.length === 0) {
      const defaults = [
        // Main Categories
        { name: 'Office Supplies', code: 'OFF', parent: null, icon: 'FileText', active: true, description: 'General office supplies and consumables' },
        { name: 'IT Equipment', code: 'IT', parent: null, icon: 'Monitor', active: true, description: 'Information technology equipment' },
        { name: 'Furniture', code: 'FUR', parent: null, icon: 'Armchair', active: true, description: 'Office and building furniture' },
        { name: 'Vehicles', code: 'VEH', parent: null, icon: 'Car', active: true, description: 'Transportation vehicles' },
        { name: 'Medical Supplies', code: 'MED', parent: null, icon: 'Heart', active: true, description: 'Medical and health supplies' },
        { name: 'Security Equipment', code: 'SEC', parent: null, icon: 'Shield', active: true, description: 'Security and safety equipment' },
        { name: 'Cleaning Supplies', code: 'CLN', parent: null, icon: 'Sparkles', active: true, description: 'Cleaning and janitorial supplies' },
        { name: 'Construction Materials', code: 'CON', parent: null, icon: 'Hammer', active: true, description: 'Building and construction materials' },

        // Office Supplies Subcategories
        { name: 'Stationery', code: 'STA', parent: 1, icon: 'Pen', active: true, description: 'Pens, pencils, paper, notebooks' },
        { name: 'Filing & Storage', code: 'FIL', parent: 1, icon: 'FolderOpen', active: true, description: 'Files, folders, storage boxes' },
        { name: 'Printing Supplies', code: 'PRT', parent: 1, icon: 'Printer', active: true, description: 'Ink, toner, paper' },

        // IT Equipment Subcategories
        { name: 'Computers', code: 'COM', parent: 2, icon: 'Laptop', active: true, description: 'Desktop and laptop computers' },
        { name: 'Networking', code: 'NET', parent: 2, icon: 'Network', active: true, description: 'Routers, switches, cables' },
        { name: 'Accessories', code: 'ACC', parent: 2, icon: 'Mouse', active: true, description: 'Keyboards, mice, monitors' },

        // Furniture Subcategories
        { name: 'Office Furniture', code: 'OFF-FUR', parent: 3, icon: 'Armchair', active: true, description: 'Desks, chairs, cabinets' },
        { name: 'Conference Furniture', code: 'CNF-FUR', parent: 3, icon: 'Table', active: true, description: 'Meeting tables and chairs' },

        // Vehicle Subcategories
        { name: 'Cars', code: 'CAR', parent: 4, icon: 'Car', active: true, description: 'Passenger cars' },
        { name: 'Motorcycles', code: 'MOTO', parent: 4, icon: 'Bike', active: true, description: 'Motorcycles and scooters' },
        { name: 'Vehicle Parts', code: 'VEH-PRT', parent: 4, icon: 'Wrench', active: true, description: 'Spare parts and accessories' },
      ];

      for (const category of defaults) {
        await itemCategoryDB.create(category);
      }
    }
  },
};

// Purchase Request operations
export const purchaseRequestDB = {
  create: async (data) => {
    const db = await getDB();

    // Generate PR number
    if (!data.prNumber) {
      const allPRs = await db.getAll('purchaseRequests');
      const year = new Date().getFullYear();
      const nextNumber = allPRs.filter(pr => pr.prNumber?.startsWith(`PR-${year}`)).length + 1;
      data.prNumber = `PR-${year}-${String(nextNumber).padStart(4, '0')}`;
    }

    const id = await db.add('purchaseRequests', {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return { ...data, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let requests = await db.getAll('purchaseRequests');

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      requests = requests.filter(pr =>
        pr.prNumber?.toLowerCase().includes(searchLower) ||
        pr.title?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      requests = requests.filter(pr => pr.status === filters.status);
    }

    if (filters.requestedBy) {
      requests = requests.filter(pr => pr.requestedBy === filters.requestedBy);
    }

    if (filters.department) {
      requests = requests.filter(pr => pr.department === filters.department);
    }

    requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return requests;
  },

  getById: async (id) => {
    const db = await getDB();
    return await db.get('purchaseRequests', id);
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('purchaseRequests', id);
    if (!existing) {
      throw new Error('Purchase Request not found');
    }

    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };

    await db.put('purchaseRequests', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('purchaseRequests', id);
    return true;
  },

  seedDefaults: async () => {
    const db = await getDB();
    const existingPRs = await db.getAll('purchaseRequests');
    if (existingPRs.length > 0) {
      console.log('Purchase requests already seeded');
      return;
    }

    // Get employees and departments for realistic data
    const employees = await db.getAll('employees');
    const departments = await db.getAll('departments');
    const categories = await db.getAll('itemCategories');

    if (employees.length === 0 || departments.length === 0) {
      console.log('Skipping PR seed - no employees or departments found');
      return;
    }

    const defaults = [
      {
        prNumber: 'PR-2024-0001',
        title: 'Office Supplies for Q1 2024',
        description: 'Replenishment of essential office supplies including paper, pens, and folders',
        requestedBy: employees[0]?.id,
        department: departments[0]?.id,
        priority: 'Medium',
        requiredDate: '2024-12-30',
        items: [
          {
            itemName: 'A4 Paper (Ream)',
            description: 'White, 80gsm',
            quantity: 100,
            unit: 'Ream',
            estimatedUnitPrice: 5.50,
            category: categories.find(c => c.name === 'Paper Products')?.id,
            specifications: '80gsm, 500 sheets per ream',
            estimatedTotal: 550,
          },
          {
            itemName: 'Blue Pens',
            description: 'Ballpoint pens',
            quantity: 200,
            unit: 'Piece',
            estimatedUnitPrice: 0.50,
            category: categories.find(c => c.name === 'Writing Instruments')?.id,
            specifications: 'Blue ink, medium point',
            estimatedTotal: 100,
          },
        ],
        totalEstimatedAmount: 650,
        status: 'Approved',
        notes: 'Urgent need for project documentation',
        createdAt: new Date('2024-11-01').toISOString(),
        updatedAt: new Date('2024-11-02').toISOString(),
      },
      {
        prNumber: 'PR-2024-0002',
        title: 'Computer Equipment Upgrade',
        description: 'New laptops and monitors for development team',
        requestedBy: employees[1]?.id || employees[0]?.id,
        department: departments[1]?.id || departments[0]?.id,
        priority: 'High',
        requiredDate: '2024-12-20',
        items: [
          {
            itemName: 'Laptop - Dell Latitude 5540',
            description: 'i7, 16GB RAM, 512GB SSD',
            quantity: 5,
            unit: 'Unit',
            estimatedUnitPrice: 1200,
            category: categories.find(c => c.name === 'Computers')?.id,
            specifications: 'Intel Core i7-1365U, 16GB DDR4, 512GB NVMe SSD, 15.6" FHD',
            estimatedTotal: 6000,
          },
          {
            itemName: '27" Monitor - Dell P2723D',
            description: 'QHD IPS Monitor',
            quantity: 5,
            unit: 'Unit',
            estimatedUnitPrice: 350,
            category: categories.find(c => c.name === 'Monitors')?.id,
            specifications: '27 inch, 2560x1440, IPS, USB-C',
            estimatedTotal: 1750,
          },
        ],
        totalEstimatedAmount: 7750,
        status: 'Approved',
        notes: 'Critical for development team productivity',
        createdAt: new Date('2024-11-05').toISOString(),
        updatedAt: new Date('2024-11-06').toISOString(),
      },
      {
        prNumber: 'PR-2024-0003',
        title: 'Cleaning Supplies for Main Office',
        description: 'Monthly cleaning supplies replenishment',
        requestedBy: employees[2]?.id || employees[0]?.id,
        department: departments[0]?.id,
        priority: 'Low',
        requiredDate: '2024-12-25',
        items: [
          {
            itemName: 'Disinfectant Spray',
            description: 'Multi-surface cleaner',
            quantity: 20,
            unit: 'Bottle',
            estimatedUnitPrice: 8,
            category: categories.find(c => c.name === 'Cleaning Supplies')?.id,
            specifications: '750ml bottle, kills 99.9% germs',
            estimatedTotal: 160,
          },
          {
            itemName: 'Paper Towels',
            description: 'Absorbent paper towels',
            quantity: 30,
            unit: 'Roll',
            estimatedUnitPrice: 2.50,
            category: categories.find(c => c.name === 'Cleaning Supplies')?.id,
            specifications: '2-ply, perforated',
            estimatedTotal: 75,
          },
        ],
        totalEstimatedAmount: 235,
        status: 'Pending',
        notes: 'Regular monthly order',
        createdAt: new Date('2024-11-10').toISOString(),
        updatedAt: new Date('2024-11-10').toISOString(),
      },
      {
        prNumber: 'PR-2024-0004',
        title: 'Furniture for New Office Space',
        description: 'Desks, chairs, and filing cabinets for expansion',
        requestedBy: employees[0]?.id,
        department: departments[0]?.id,
        priority: 'Urgent',
        requiredDate: '2024-12-15',
        items: [
          {
            itemName: 'Office Desk',
            description: 'L-shaped executive desk',
            quantity: 10,
            unit: 'Unit',
            estimatedUnitPrice: 450,
            category: categories.find(c => c.name === 'Furniture')?.id,
            specifications: '160cm x 140cm, wood finish, with cable management',
            estimatedTotal: 4500,
          },
          {
            itemName: 'Ergonomic Office Chair',
            description: 'Adjustable mesh back chair',
            quantity: 10,
            unit: 'Unit',
            estimatedUnitPrice: 250,
            category: categories.find(c => c.name === 'Furniture')?.id,
            specifications: 'Adjustable height, lumbar support, breathable mesh',
            estimatedTotal: 2500,
          },
        ],
        totalEstimatedAmount: 7000,
        status: 'Approved',
        notes: 'New office opening next month',
        createdAt: new Date('2024-11-08').toISOString(),
        updatedAt: new Date('2024-11-09').toISOString(),
      },
      {
        prNumber: 'PR-2024-0005',
        title: 'Printer Supplies',
        description: 'Toner cartridges and printer maintenance',
        requestedBy: employees[1]?.id || employees[0]?.id,
        department: departments[0]?.id,
        priority: 'Medium',
        requiredDate: '2024-12-18',
        items: [
          {
            itemName: 'HP Toner Cartridge 26A',
            description: 'Black toner for HP LaserJet',
            quantity: 10,
            unit: 'Unit',
            estimatedUnitPrice: 85,
            category: categories.find(c => c.name === 'Printer Supplies')?.id,
            specifications: 'CF226A, yields ~3,100 pages',
            estimatedTotal: 850,
          },
        ],
        totalEstimatedAmount: 850,
        status: 'Draft',
        notes: 'Check inventory before ordering',
        createdAt: new Date('2024-11-12').toISOString(),
        updatedAt: new Date('2024-11-12').toISOString(),
      },
    ];

    for (const pr of defaults) {
      try {
        await db.add('purchaseRequests', pr);
      } catch (error) {
        if (error.name !== 'ConstraintError') {
          console.error('Error seeding purchase request:', error);
        }
      }
    }

    console.log('Purchase requests seeded successfully');
  },
};

// Purchase Order operations
export const purchaseOrderDB = {
  create: async (data) => {
    const db = await getDB();

    // Generate PO number
    if (!data.poNumber) {
      const allPOs = await db.getAll('purchaseOrders');
      const year = new Date().getFullYear();
      const nextNumber = allPOs.filter(po => po.poNumber?.startsWith(`PO-${year}`)).length + 1;
      data.poNumber = `PO-${year}-${String(nextNumber).padStart(4, '0')}`;
    }

    const id = await db.add('purchaseOrders', {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return { ...data, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let orders = await db.getAll('purchaseOrders');

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      orders = orders.filter(po =>
        po.poNumber?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      orders = orders.filter(po => po.status === filters.status);
    }

    if (filters.vendorId) {
      orders = orders.filter(po => po.vendorId === filters.vendorId);
    }

    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return orders;
  },

  getById: async (id) => {
    const db = await getDB();
    return await db.get('purchaseOrders', id);
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('purchaseOrders', id);
    if (!existing) {
      throw new Error('Purchase Order not found');
    }

    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };

    await db.put('purchaseOrders', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('purchaseOrders', id);
    return true;
  },

  seedDefaults: async () => {
    const db = await getDB();
    const existingPOs = await db.getAll('purchaseOrders');
    if (existingPOs.length > 0) {
      console.log('Purchase orders already seeded');
      return;
    }

    // Get vendors for realistic data
    const vendors = await db.getAll('vendors');

    if (vendors.length === 0) {
      console.log('Skipping PO seed - no vendors found');
      return;
    }

    const defaults = [
      {
        poNumber: 'PO-2024-0001',
        prNumber: 'PR-2024-0001',
        vendorId: vendors[0]?.id,
        orderDate: '2024-11-15',
        expectedDeliveryDate: '2024-11-25',
        deliveryAddress: 'Main Office, Shar-e-Naw, Kabul, Afghanistan',
        paymentTerms: 'Net 30',
        items: [
          {
            itemName: 'A4 Paper (Ream)',
            description: 'White, 80gsm',
            quantity: 100,
            unit: 'Ream',
            unitPrice: 5.25,
            taxRate: 0,
            discount: 5,
            specifications: '80gsm, 500 sheets per ream',
            itemTotal: 498.75,
          },
          {
            itemName: 'Blue Pens',
            description: 'Ballpoint pens',
            quantity: 200,
            unit: 'Piece',
            unitPrice: 0.45,
            taxRate: 0,
            discount: 10,
            specifications: 'Blue ink, medium point',
            itemTotal: 81,
          },
        ],
        subtotal: 575,
        taxAmount: 0,
        discountAmount: 54.25,
        shippingCost: 25,
        totalAmount: 545.75,
        status: 'Approved',
        notes: 'Deliver to main warehouse',
        createdAt: new Date('2024-11-15').toISOString(),
        updatedAt: new Date('2024-11-15').toISOString(),
      },
      {
        poNumber: 'PO-2024-0002',
        prNumber: 'PR-2024-0002',
        vendorId: vendors.find(v => v.companyName.includes('Tech'))?.id || vendors[1]?.id,
        orderDate: '2024-11-12',
        expectedDeliveryDate: '2024-11-22',
        deliveryAddress: 'IT Department, Building A, Kabul',
        paymentTerms: '50% Advance',
        items: [
          {
            itemName: 'Laptop - Dell Latitude 5540',
            description: 'i7, 16GB RAM, 512GB SSD',
            quantity: 5,
            unit: 'Unit',
            unitPrice: 1150,
            taxRate: 0,
            discount: 3,
            specifications: 'Intel Core i7-1365U, 16GB DDR4, 512GB NVMe SSD, 15.6" FHD',
            itemTotal: 5577.5,
          },
          {
            itemName: '27" Monitor - Dell P2723D',
            description: 'QHD IPS Monitor',
            quantity: 5,
            unit: 'Unit',
            unitPrice: 340,
            taxRate: 0,
            discount: 3,
            specifications: '27 inch, 2560x1440, IPS, USB-C',
            itemTotal: 1649,
          },
        ],
        subtotal: 7450,
        taxAmount: 0,
        discountAmount: 223.5,
        shippingCost: 50,
        totalAmount: 7276.5,
        status: 'In Transit',
        notes: 'Fragile - handle with care. Include original packaging and warranty cards.',
        createdAt: new Date('2024-11-12').toISOString(),
        updatedAt: new Date('2024-11-18').toISOString(),
      },
      {
        poNumber: 'PO-2024-0003',
        prNumber: 'PR-2024-0004',
        vendorId: vendors.find(v => v.companyName.includes('Furniture'))?.id || vendors[2]?.id,
        orderDate: '2024-11-10',
        expectedDeliveryDate: '2024-11-20',
        deliveryAddress: 'New Office Space, 4th Floor, Central Plaza, Kabul',
        paymentTerms: 'Net 45',
        items: [
          {
            itemName: 'Office Desk',
            description: 'L-shaped executive desk',
            quantity: 10,
            unit: 'Unit',
            unitPrice: 425,
            taxRate: 0,
            discount: 8,
            specifications: '160cm x 140cm, wood finish, with cable management',
            itemTotal: 3910,
          },
          {
            itemName: 'Ergonomic Office Chair',
            description: 'Adjustable mesh back chair',
            quantity: 10,
            unit: 'Unit',
            unitPrice: 240,
            taxRate: 0,
            discount: 8,
            specifications: 'Adjustable height, lumbar support, breathable mesh',
            itemTotal: 2208,
          },
        ],
        subtotal: 6650,
        taxAmount: 0,
        discountAmount: 532,
        shippingCost: 100,
        totalAmount: 6218,
        status: 'Delivered',
        notes: 'Assembly required - vendor will provide installation team',
        createdAt: new Date('2024-11-10').toISOString(),
        updatedAt: new Date('2024-11-20').toISOString(),
      },
      {
        poNumber: 'PO-2024-0004',
        prNumber: '',
        vendorId: vendors[3]?.id || vendors[0]?.id,
        orderDate: '2024-11-18',
        expectedDeliveryDate: '2024-11-28',
        deliveryAddress: 'Main Office, Shar-e-Naw, Kabul, Afghanistan',
        paymentTerms: 'Net 30',
        items: [
          {
            itemName: 'Wireless Mouse',
            description: 'Ergonomic wireless mouse',
            quantity: 20,
            unit: 'Unit',
            unitPrice: 15,
            taxRate: 0,
            discount: 0,
            specifications: '2.4GHz wireless, ergonomic design, 3 buttons',
            itemTotal: 300,
          },
          {
            itemName: 'Keyboard',
            description: 'Wired USB keyboard',
            quantity: 20,
            unit: 'Unit',
            unitPrice: 25,
            taxRate: 0,
            discount: 0,
            specifications: 'Full-size, silent keys, USB connection',
            itemTotal: 500,
          },
        ],
        subtotal: 800,
        taxAmount: 0,
        discountAmount: 0,
        shippingCost: 20,
        totalAmount: 820,
        status: 'Approved',
        notes: 'Standard order - no rush',
        createdAt: new Date('2024-11-18').toISOString(),
        updatedAt: new Date('2024-11-18').toISOString(),
      },
      {
        poNumber: 'PO-2024-0005',
        prNumber: '',
        vendorId: vendors.find(v => v.companyName.includes('Supplies'))?.id || vendors[0]?.id,
        orderDate: '2024-11-20',
        expectedDeliveryDate: '2024-11-30',
        deliveryAddress: 'Main Office, Shar-e-Naw, Kabul, Afghanistan',
        paymentTerms: 'Due on Receipt',
        items: [
          {
            itemName: 'Whiteboard Markers',
            description: 'Assorted colors',
            quantity: 50,
            unit: 'Box',
            unitPrice: 12,
            taxRate: 0,
            discount: 5,
            specifications: '4 colors per box, dry-erase',
            itemTotal: 570,
          },
        ],
        subtotal: 600,
        taxAmount: 0,
        discountAmount: 30,
        shippingCost: 15,
        totalAmount: 585,
        status: 'Draft',
        notes: 'Waiting for budget approval',
        createdAt: new Date('2024-11-20').toISOString(),
        updatedAt: new Date('2024-11-20').toISOString(),
      },
    ];

    for (const po of defaults) {
      try {
        await db.add('purchaseOrders', po);
      } catch (error) {
        if (error.name !== 'ConstraintError') {
          console.error('Error seeding purchase order:', error);
        }
      }
    }

    console.log('Purchase orders seeded successfully');
  },
};

// Goods Receipt operations
export const goodsReceiptDB = {
  create: async (data) => {
    const db = await getDB();

    // Generate GR number
    if (!data.grNumber) {
      const allGRs = await db.getAll('goodsReceipts');
      const year = new Date().getFullYear();
      const nextNumber = allGRs.filter(gr => gr.grNumber?.startsWith(`GR-${year}`)).length + 1;
      data.grNumber = `GR-${year}-${String(nextNumber).padStart(4, '0')}`;
    }

    const id = await db.add('goodsReceipts', {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return { ...data, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let receipts = await db.getAll('goodsReceipts');

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      receipts = receipts.filter(gr =>
        gr.grNumber?.toLowerCase().includes(searchLower) ||
        gr.poNumber?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      receipts = receipts.filter(gr => gr.status === filters.status);
    }

    if (filters.poId) {
      receipts = receipts.filter(gr => gr.poId === filters.poId);
    }

    receipts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return receipts;
  },

  getById: async (id) => {
    const db = await getDB();
    return await db.get('goodsReceipts', id);
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('goodsReceipts', id);
    if (!existing) {
      throw new Error('Goods Receipt not found');
    }

    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };

    await db.put('goodsReceipts', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('goodsReceipts', id);
    return true;
  },
};

// Inventory Item operations
export const inventoryItemDB = {
  create: async (data) => {
    const db = await getDB();

    // Generate item code if not provided
    if (!data.itemCode) {
      const allItems = await db.getAll('inventoryItems');
      const nextNumber = allItems.length + 1;
      data.itemCode = `ITEM-${String(nextNumber).padStart(5, '0')}`;
    }

    const id = await db.add('inventoryItems', {
      ...data,
      quantityAvailable: data.quantityOnHand - (data.quantityReserved || 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return { ...data, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let items = await db.getAll('inventoryItems');

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      items = items.filter(item =>
        item.itemCode?.toLowerCase().includes(searchLower) ||
        item.itemName?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category) {
      items = items.filter(item => item.category === filters.category);
    }

    if (filters.status) {
      items = items.filter(item => item.status === filters.status);
    }

    if (filters.lowStock) {
      items = items.filter(item => item.quantityOnHand <= item.reorderLevel);
    }

    return items;
  },

  getById: async (id) => {
    const db = await getDB();
    return await db.get('inventoryItems', id);
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('inventoryItems', id);
    if (!existing) {
      throw new Error('Inventory Item not found');
    }

    const updated = {
      ...existing,
      ...data,
      id,
      quantityAvailable: (data.quantityOnHand || existing.quantityOnHand) - (data.quantityReserved || existing.quantityReserved || 0),
      updatedAt: new Date().toISOString(),
    };

    await db.put('inventoryItems', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('inventoryItems', id);
    return true;
  },

  seedDefaults: async () => {
    const db = await getDB();
    const existing = await db.getAll('inventoryItems');

    if (existing.length === 0) {
      const defaults = [
        // Office Supplies
        {
          itemCode: 'ITEM-00001',
          itemName: 'A4 Paper (Ream)',
          description: 'White A4 80gsm paper, 500 sheets per ream',
          category: 'Office Supplies',
          subcategory: 'Stationery',
          unit: 'Ream',
          quantityOnHand: 150,
          quantityReserved: 20,
          reorderLevel: 50,
          reorderQuantity: 100,
          maxStockLevel: 300,
          lastPurchasePrice: 5.50,
          averagePrice: 5.50,
          warehouseLocation: 'A-01-01',
          status: 'Active',
        },
        {
          itemCode: 'ITEM-00002',
          itemName: 'Blue Ballpoint Pen',
          description: 'Blue ink ballpoint pen',
          category: 'Office Supplies',
          subcategory: 'Stationery',
          unit: 'Box (50pcs)',
          quantityOnHand: 45,
          quantityReserved: 5,
          reorderLevel: 20,
          reorderQuantity: 30,
          maxStockLevel: 100,
          lastPurchasePrice: 12.00,
          averagePrice: 12.00,
          warehouseLocation: 'A-01-02',
          status: 'Active',
        },
        {
          itemCode: 'ITEM-00003',
          itemName: 'File Folder',
          description: 'Manila file folder with tab',
          category: 'Office Supplies',
          subcategory: 'Filing & Storage',
          unit: 'Box (100pcs)',
          quantityOnHand: 30,
          quantityReserved: 0,
          reorderLevel: 15,
          reorderQuantity: 25,
          maxStockLevel: 75,
          lastPurchasePrice: 25.00,
          averagePrice: 25.00,
          warehouseLocation: 'A-01-03',
          status: 'Active',
        },

        // IT Equipment
        {
          itemCode: 'ITEM-00004',
          itemName: 'Dell Latitude 5420 Laptop',
          description: 'Intel i5, 8GB RAM, 256GB SSD, 14" Display',
          category: 'IT Equipment',
          subcategory: 'Computers',
          unit: 'Unit',
          quantityOnHand: 12,
          quantityReserved: 3,
          reorderLevel: 5,
          reorderQuantity: 10,
          maxStockLevel: 25,
          lastPurchasePrice: 850.00,
          averagePrice: 850.00,
          warehouseLocation: 'B-01-01',
          isSerialized: true,
          status: 'Active',
        },
        {
          itemCode: 'ITEM-00005',
          itemName: 'HP LaserJet Pro Printer',
          description: 'Black & white laser printer with network',
          category: 'IT Equipment',
          subcategory: 'Accessories',
          unit: 'Unit',
          quantityOnHand: 8,
          quantityReserved: 1,
          reorderLevel: 3,
          reorderQuantity: 5,
          maxStockLevel: 15,
          lastPurchasePrice: 320.00,
          averagePrice: 320.00,
          warehouseLocation: 'B-01-02',
          isSerialized: true,
          status: 'Active',
        },
        {
          itemCode: 'ITEM-00006',
          itemName: 'CAT6 Network Cable (305m)',
          description: 'CAT6 UTP network cable, 305 meter roll',
          category: 'IT Equipment',
          subcategory: 'Networking',
          unit: 'Roll',
          quantityOnHand: 15,
          quantityReserved: 2,
          reorderLevel: 5,
          reorderQuantity: 10,
          maxStockLevel: 30,
          lastPurchasePrice: 85.00,
          averagePrice: 85.00,
          warehouseLocation: 'B-01-03',
          status: 'Active',
        },

        // Furniture
        {
          itemCode: 'ITEM-00007',
          itemName: 'Executive Office Desk',
          description: 'Wooden office desk 160x80cm with drawers',
          category: 'Furniture',
          subcategory: 'Office Furniture',
          unit: 'Unit',
          quantityOnHand: 6,
          quantityReserved: 0,
          reorderLevel: 2,
          reorderQuantity: 5,
          maxStockLevel: 15,
          lastPurchasePrice: 280.00,
          averagePrice: 280.00,
          warehouseLocation: 'C-01-01',
          status: 'Active',
        },
        {
          itemCode: 'ITEM-00008',
          itemName: 'Office Chair (Ergonomic)',
          description: 'Ergonomic office chair with lumbar support',
          category: 'Furniture',
          subcategory: 'Office Furniture',
          unit: 'Unit',
          quantityOnHand: 25,
          quantityReserved: 5,
          reorderLevel: 10,
          reorderQuantity: 15,
          maxStockLevel: 40,
          lastPurchasePrice: 120.00,
          averagePrice: 120.00,
          warehouseLocation: 'C-01-02',
          status: 'Active',
        },

        // Medical Supplies
        {
          itemCode: 'ITEM-00009',
          itemName: 'First Aid Kit (Complete)',
          description: 'Complete first aid kit with all essentials',
          category: 'Medical Supplies',
          subcategory: 'Safety',
          unit: 'Kit',
          quantityOnHand: 20,
          quantityReserved: 0,
          reorderLevel: 10,
          reorderQuantity: 15,
          maxStockLevel: 35,
          lastPurchasePrice: 45.00,
          averagePrice: 45.00,
          warehouseLocation: 'D-01-01',
          status: 'Active',
        },

        // Cleaning Supplies
        {
          itemCode: 'ITEM-00010',
          itemName: 'Disinfectant Spray (5L)',
          description: 'Multi-surface disinfectant spray, 5 liter',
          category: 'Cleaning Supplies',
          subcategory: 'Chemicals',
          unit: 'Bottle',
          quantityOnHand: 40,
          quantityReserved: 10,
          reorderLevel: 20,
          reorderQuantity: 30,
          maxStockLevel: 80,
          lastPurchasePrice: 15.00,
          averagePrice: 15.00,
          warehouseLocation: 'E-01-01',
          isBatchTracked: true,
          status: 'Active',
        },
      ];

      for (const item of defaults) {
        await inventoryItemDB.create(item);
      }
    }
  },
};

// Contract operations
export const contractDB = {
  create: async (data) => {
    const db = await getDB();

    // Generate contract number
    if (!data.contractNumber) {
      const allContracts = await db.getAll('contracts');
      const year = new Date().getFullYear();
      const nextNumber = allContracts.filter(c => c.contractNumber?.startsWith(`CON-${year}`)).length + 1;
      data.contractNumber = `CON-${year}-${String(nextNumber).padStart(4, '0')}`;
    }

    const id = await db.add('contracts', {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return { ...data, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let contracts = await db.getAll('contracts');

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      contracts = contracts.filter(c =>
        c.contractNumber?.toLowerCase().includes(searchLower) ||
        c.title?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      contracts = contracts.filter(c => c.status === filters.status);
    }

    if (filters.vendorId) {
      contracts = contracts.filter(c => c.vendorId === filters.vendorId);
    }

    contracts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return contracts;
  },

  getById: async (id) => {
    const db = await getDB();
    return await db.get('contracts', id);
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('contracts', id);
    if (!existing) {
      throw new Error('Contract not found');
    }

    const updated = {
      ...existing,
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };

    await db.put('contracts', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('contracts', id);
    return true;
  },
};

// User operations
export const userDB = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const user = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.add('users', user);
    return { ...user, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let users = await db.getAll('users');

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      users = users.filter(user =>
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.username?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      users = users.filter(user => user.status === filters.status);
    }

    if (filters.roleId) {
      users = users.filter(user => user.roleId === filters.roleId);
    }

    // Sort by creation date (newest first)
    users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return users;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('users', Number(id));
  },

  getByEmail: async (email) => {
    const db = await getDB();
    const index = db.transaction('users').store.index('email');
    return index.get(email);
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('users', Number(id));
    if (!existing) {
      throw new Error('User not found');
    }
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };
    await db.put('users', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('users', Number(id));
    return true;
  },

  toggleStatus: async (id) => {
    const db = await getDB();
    const user = await db.get('users', Number(id));
    if (!user) {
      throw new Error('User not found');
    }
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    return userDB.update(id, { status: newStatus });
  },

  // Seed default admin user
  seedDefaults: async () => {
    const db = await getDB();
    const existing = await db.getAll('users');

    if (existing.length === 0) {
      const roles = await db.getAll('roles');
      const adminRole = roles.find(r => r.name === 'Administrator');

      await userDB.create({
        name: 'System Admin',
        email: 'admin@vdo-erp.com',
        username: 'admin',
        password: 'admin123', // In production, this should be hashed
        roleId: adminRole?.id || 1,
        status: 'active',
        employeeId: null,
      });
    }
  },
};

// Role operations
export const roleDB = {
  create: async (data) => {
    const db = await getDB();
    const role = {
      ...data,
      createdAt: new Date().toISOString(),
    };
    const id = await db.add('roles', role);
    return { ...role, id };
  },

  getAll: async () => {
    const db = await getDB();
    const roles = await db.getAll('roles');

    // Get user count for each role
    const users = await db.getAll('users');
    return roles.map(role => ({
      ...role,
      userCount: users.filter(u => u.roleId === role.id).length,
    }));
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('roles', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('roles', Number(id));
    if (!existing) {
      throw new Error('Role not found');
    }
    const updated = { ...existing, ...data, id: Number(id) };
    await db.put('roles', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    // Check if any users have this role
    const users = await db.getAll('users');
    const usersWithRole = users.filter(u => u.roleId === Number(id));
    if (usersWithRole.length > 0) {
      throw new Error('Cannot delete role with assigned users');
    }
    await db.delete('roles', Number(id));
    // Also delete role permissions
    const rolePerms = await db.getAll('rolePermissions');
    for (const rp of rolePerms.filter(rp => rp.roleId === Number(id))) {
      await db.delete('rolePermissions', rp.id);
    }
    return true;
  },

  // Seed default roles
  seedDefaults: async () => {
    const db = await getDB();
    const existing = await db.getAll('roles');

    if (existing.length === 0) {
      const defaults = [
        { name: 'Administrator', description: 'Full system access', color: 'red' },
        { name: 'Manager', description: 'Department management access', color: 'blue' },
        { name: 'HR Manager', description: 'Human resources management', color: 'purple' },
        { name: 'Employee', description: 'Basic employee access', color: 'green' },
      ];

      for (const role of defaults) {
        await roleDB.create(role);
      }
    }
  },
};

// Permission operations
export const permissionDB = {
  create: async (data) => {
    const db = await getDB();
    const permission = {
      ...data,
      status: data.status !== undefined ? data.status : true,
      createdAt: new Date().toISOString(),
    };
    const id = await db.add('permissions', permission);
    return { ...permission, id };
  },

  getAll: async () => {
    const db = await getDB();
    return db.getAll('permissions');
  },

  getAllGrouped: async () => {
    const db = await getDB();
    const permissions = await db.getAll('permissions');

    // Group by module
    const grouped = permissions.reduce((acc, perm) => {
      const module = perm.module || 'Other';
      if (!acc[module]) {
        acc[module] = [];
      }
      acc[module].push(perm);
      return acc;
    }, {});

    return Object.entries(grouped).map(([module, permissions]) => ({
      module,
      permissions,
    }));
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('permissions', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('permissions', Number(id));
    if (!existing) {
      throw new Error('Permission not found');
    }
    const updated = { ...existing, ...data, id: Number(id) };
    await db.put('permissions', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('permissions', Number(id));
    // Also delete from rolePermissions
    const rolePerms = await db.getAll('rolePermissions');
    for (const rp of rolePerms.filter(rp => rp.permissionId === Number(id))) {
      await db.delete('rolePermissions', rp.id);
    }
    return true;
  },

  toggleStatus: async (id) => {
    const db = await getDB();
    const perm = await db.get('permissions', Number(id));
    if (!perm) {
      throw new Error('Permission not found');
    }
    return permissionDB.update(id, { status: !perm.status });
  },

  // Seed default permissions
  seedDefaults: async () => {
    const db = await getDB();
    const existing = await db.getAll('permissions');

    if (existing.length === 0) {
      const defaults = [
        // User Management
        { name: 'users.view', description: 'View users', module: 'User Management' },
        { name: 'users.create', description: 'Create new users', module: 'User Management' },
        { name: 'users.edit', description: 'Edit user details', module: 'User Management' },
        { name: 'users.delete', description: 'Delete users', module: 'User Management' },
        // HR Management
        { name: 'employees.view', description: 'View employees', module: 'HR Management' },
        { name: 'employees.create', description: 'Add new employees', module: 'HR Management' },
        { name: 'employees.edit', description: 'Edit employee details', module: 'HR Management' },
        { name: 'departments.manage', description: 'Manage departments', module: 'HR Management' },
        // Payroll
        { name: 'payroll.view', description: 'View payroll data', module: 'Payroll' },
        { name: 'payroll.process', description: 'Process payroll', module: 'Payroll' },
        { name: 'payroll.approve', description: 'Approve payroll', module: 'Payroll' },
      ];

      for (const perm of defaults) {
        await permissionDB.create(perm);
      }
    }
  },
};

// Role Permission operations
export const rolePermissionDB = {
  assign: async (roleId, permissionId) => {
    const db = await getDB();
    // Check if already assigned
    const existing = await db.getAll('rolePermissions');
    const found = existing.find(
      rp => rp.roleId === Number(roleId) && rp.permissionId === Number(permissionId)
    );
    if (found) {
      return found;
    }
    const id = await db.add('rolePermissions', {
      roleId: Number(roleId),
      permissionId: Number(permissionId),
      createdAt: new Date().toISOString(),
    });
    return { id, roleId: Number(roleId), permissionId: Number(permissionId) };
  },

  remove: async (roleId, permissionId) => {
    const db = await getDB();
    const existing = await db.getAll('rolePermissions');
    const found = existing.find(
      rp => rp.roleId === Number(roleId) && rp.permissionId === Number(permissionId)
    );
    if (found) {
      await db.delete('rolePermissions', found.id);
    }
    return true;
  },

  toggle: async (roleId, permissionId) => {
    const db = await getDB();
    const existing = await db.getAll('rolePermissions');
    const found = existing.find(
      rp => rp.roleId === Number(roleId) && rp.permissionId === Number(permissionId)
    );
    if (found) {
      await db.delete('rolePermissions', found.id);
      return false;
    } else {
      await rolePermissionDB.assign(roleId, permissionId);
      return true;
    }
  },

  getByRole: async (roleId) => {
    const db = await getDB();
    const all = await db.getAll('rolePermissions');
    return all.filter(rp => rp.roleId === Number(roleId));
  },

  isAssigned: async (roleId, permissionId) => {
    const db = await getDB();
    const all = await db.getAll('rolePermissions');
    return all.some(
      rp => rp.roleId === Number(roleId) && rp.permissionId === Number(permissionId)
    );
  },

  // Get all permissions with assignment status for a role
  getPermissionsForRole: async (roleId) => {
    const db = await getDB();
    const permissions = await db.getAll('permissions');
    const rolePerms = await db.getAll('rolePermissions');
    const assignedIds = rolePerms
      .filter(rp => rp.roleId === Number(roleId))
      .map(rp => rp.permissionId);

    return permissions.map(perm => ({
      ...perm,
      assigned: assignedIds.includes(perm.id),
    }));
  },

  // Seed default role permissions
  seedDefaults: async () => {
    const db = await getDB();
    const existing = await db.getAll('rolePermissions');

    if (existing.length === 0) {
      const roles = await db.getAll('roles');
      const permissions = await db.getAll('permissions');

      const adminRole = roles.find(r => r.name === 'Administrator');
      const managerRole = roles.find(r => r.name === 'Manager');
      const hrRole = roles.find(r => r.name === 'HR Manager');
      const employeeRole = roles.find(r => r.name === 'Employee');

      // Admin gets all permissions
      if (adminRole) {
        for (const perm of permissions) {
          await rolePermissionDB.assign(adminRole.id, perm.id);
        }
      }

      // Manager permissions
      if (managerRole) {
        const managerPerms = ['users.view', 'users.edit', 'employees.view', 'employees.edit', 'payroll.view', 'payroll.approve'];
        for (const perm of permissions.filter(p => managerPerms.includes(p.name))) {
          await rolePermissionDB.assign(managerRole.id, perm.id);
        }
      }

      // HR Manager permissions
      if (hrRole) {
        const hrPerms = ['employees.view', 'employees.create', 'employees.edit', 'departments.manage', 'payroll.view', 'payroll.process'];
        for (const perm of permissions.filter(p => hrPerms.includes(p.name))) {
          await rolePermissionDB.assign(hrRole.id, perm.id);
        }
      }

      // Employee permissions
      if (employeeRole) {
        const empPerms = ['employees.view'];
        for (const perm of permissions.filter(p => empPerms.includes(p.name))) {
          await rolePermissionDB.assign(employeeRole.id, perm.id);
        }
      }
    }
  },
};

// Attendance operations
export const attendanceDB = {
  // Mark attendance for an employee
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const attendance = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.add('attendance', attendance);
    return { ...attendance, id };
  },

  // Get all attendance records with filters
  getAll: async (filters = {}) => {
    const db = await getDB();
    let records = await db.getAll('attendance');

    // Filter by date
    if (filters.date) {
      records = records.filter(r => r.date === filters.date);
    }

    // Filter by date range
    if (filters.startDate && filters.endDate) {
      records = records.filter(r => r.date >= filters.startDate && r.date <= filters.endDate);
    }

    // Filter by employee
    if (filters.employeeId) {
      records = records.filter(r => r.employeeId === Number(filters.employeeId));
    }

    // Filter by status
    if (filters.status) {
      records = records.filter(r => r.status === filters.status);
    }

    // Sort by date (newest first)
    records.sort((a, b) => new Date(b.date) - new Date(a.date));

    return records;
  },

  // Get attendance for a specific date
  getByDate: async (date) => {
    const db = await getDB();
    const index = db.transaction('attendance').store.index('date');
    return index.getAll(date);
  },

  // Get attendance for an employee
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    const index = db.transaction('attendance').store.index('employeeId');
    return index.getAll(Number(employeeId));
  },

  // Get single attendance record
  getById: async (id) => {
    const db = await getDB();
    return db.get('attendance', Number(id));
  },

  // Check if attendance exists for employee on date
  getByEmployeeAndDate: async (employeeId, date) => {
    const db = await getDB();
    const records = await db.getAll('attendance');
    return records.find(r => r.employeeId === Number(employeeId) && r.date === date);
  },

  // Update attendance
  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('attendance', Number(id));
    if (!existing) {
      throw new Error('Attendance record not found');
    }
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };
    await db.put('attendance', updated);
    return updated;
  },

  // Delete attendance
  delete: async (id) => {
    const db = await getDB();
    await db.delete('attendance', Number(id));
    return true;
  },

  // Mark or update attendance (upsert)
  markAttendance: async (employeeId, date, data) => {
    const existing = await attendanceDB.getByEmployeeAndDate(employeeId, date);
    if (existing) {
      return attendanceDB.update(existing.id, data);
    } else {
      return attendanceDB.create({
        employeeId: Number(employeeId),
        date,
        ...data,
      });
    }
  },

  // Get attendance statistics for a date
  getStatsByDate: async (date) => {
    const records = await attendanceDB.getByDate(date);
    return {
      total: records.length,
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length,
      halfDay: records.filter(r => r.status === 'half_day').length,
      onLeave: records.filter(r => r.status === 'on_leave').length,
    };
  },

  // Get employee attendance summary for a month
  getEmployeeMonthlySummary: async (employeeId, year, month) => {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const records = await attendanceDB.getAll({
      employeeId,
      startDate,
      endDate,
    });

    return {
      totalDays: records.length,
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length,
      halfDay: records.filter(r => r.status === 'half_day').length,
      onLeave: records.filter(r => r.status === 'on_leave').length,
    };
  },
};

// Leave Type operations
export const leaveTypeDB = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const leaveType = {
      ...data,
      status: data.status !== undefined ? data.status : 'active',
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.add('leaveTypes', leaveType);
    return { ...leaveType, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let leaveTypes = await db.getAll('leaveTypes');

    if (filters.status) {
      leaveTypes = leaveTypes.filter(lt => lt.status === filters.status);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      leaveTypes = leaveTypes.filter(lt =>
        lt.name?.toLowerCase().includes(searchLower) ||
        lt.description?.toLowerCase().includes(searchLower)
      );
    }

    return leaveTypes;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('leaveTypes', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('leaveTypes', Number(id));
    if (!existing) {
      throw new Error('Leave type not found');
    }
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };
    await db.put('leaveTypes', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    // Check if any leave requests use this type
    const requests = await db.getAll('leaveRequests');
    const hasRequests = requests.some(r => r.leaveTypeId === Number(id));
    if (hasRequests) {
      throw new Error('Cannot delete leave type with existing requests');
    }
    await db.delete('leaveTypes', Number(id));
    return true;
  },

  toggleStatus: async (id) => {
    const db = await getDB();
    const leaveType = await db.get('leaveTypes', Number(id));
    if (!leaveType) {
      throw new Error('Leave type not found');
    }
    const newStatus = leaveType.status === 'active' ? 'inactive' : 'active';
    return leaveTypeDB.update(id, { status: newStatus });
  },

  // Seed default leave types
  seedDefaults: async () => {
    const db = await getDB();
    const existing = await db.getAll('leaveTypes');

    if (existing.length === 0) {
      const defaults = [
        {
          name: 'Annual Leave',
          description: 'Regular paid annual leave',
          daysAllowed: 20,
          isPaid: true,
          requiresApproval: true,
          color: 'blue'
        },
        {
          name: 'Sick Leave',
          description: 'Leave due to illness or medical reasons',
          daysAllowed: 15,
          isPaid: true,
          requiresApproval: true,
          color: 'red'
        },
        {
          name: 'Hajj Leave',
          description: 'Leave for Hajj pilgrimage',
          daysAllowed: 30,
          isPaid: true,
          requiresApproval: true,
          color: 'green'
        },
        {
          name: 'Maternity Leave',
          description: 'Leave for childbirth and newborn care',
          daysAllowed: 90,
          isPaid: true,
          requiresApproval: true,
          color: 'pink'
        },
        {
          name: 'Paternity Leave',
          description: 'Leave for fathers after childbirth',
          daysAllowed: 5,
          isPaid: true,
          requiresApproval: true,
          color: 'purple'
        },
        {
          name: 'Unpaid Leave',
          description: 'Leave without pay',
          daysAllowed: 30,
          isPaid: false,
          requiresApproval: true,
          color: 'gray'
        },
        {
          name: 'Emergency Leave',
          description: 'Leave for emergency situations',
          daysAllowed: 5,
          isPaid: true,
          requiresApproval: true,
          color: 'orange'
        },
        {
          name: 'Marriage Leave',
          description: 'Leave for employee marriage',
          daysAllowed: 5,
          isPaid: true,
          requiresApproval: true,
          color: 'yellow'
        },
        {
          name: 'Bereavement Leave',
          description: 'Leave due to death of family member',
          daysAllowed: 3,
          isPaid: true,
          requiresApproval: true,
          color: 'indigo'
        },
      ];

      for (const leaveType of defaults) {
        await leaveTypeDB.create(leaveType);
      }
    }
  },
};

// Leave Request operations
export const leaveRequestDB = {
  // Generate request ID
  generateRequestId: async () => {
    const db = await getDB();
    const count = await db.count('leaveRequests');
    const year = new Date().getFullYear();
    return `LR-${year}-${String(count + 1).padStart(4, '0')}`;
  },

  create: async (data) => {
    const db = await getDB();
    const requestId = await leaveRequestDB.generateRequestId();
    const now = new Date().toISOString();

    const leaveRequest = {
      ...data,
      requestId,
      status: 'pending', // pending, approved, rejected, cancelled
      createdAt: now,
      updatedAt: now,
    };

    const id = await db.add('leaveRequests', leaveRequest);
    return { ...leaveRequest, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let requests = await db.getAll('leaveRequests');

    // Filter by employee
    if (filters.employeeId) {
      requests = requests.filter(r => r.employeeId === Number(filters.employeeId));
    }

    // Filter by status
    if (filters.status) {
      requests = requests.filter(r => r.status === filters.status);
    }

    // Filter by leave type
    if (filters.leaveTypeId) {
      requests = requests.filter(r => r.leaveTypeId === Number(filters.leaveTypeId));
    }

    // Filter by date range
    if (filters.startDate && filters.endDate) {
      requests = requests.filter(r =>
        r.startDate >= filters.startDate && r.endDate <= filters.endDate
      );
    }

    // Search by request ID
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      requests = requests.filter(r =>
        r.requestId?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by creation date (newest first)
    requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return requests;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('leaveRequests', Number(id));
  },

  getByRequestId: async (requestId) => {
    const db = await getDB();
    const all = await db.getAll('leaveRequests');
    return all.find(r => r.requestId === requestId);
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('leaveRequests', Number(id));
    if (!existing) {
      throw new Error('Leave request not found');
    }
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };
    await db.put('leaveRequests', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('leaveRequests', Number(id));
    return true;
  },

  // Approve request
  approve: async (id, approverData) => {
    return leaveRequestDB.update(id, {
      status: 'approved',
      approvedBy: approverData.approvedBy,
      approvedAt: new Date().toISOString(),
      approverComments: approverData.comments || '',
    });
  },

  // Reject request
  reject: async (id, approverData) => {
    return leaveRequestDB.update(id, {
      status: 'rejected',
      rejectedBy: approverData.rejectedBy,
      rejectedAt: new Date().toISOString(),
      rejectionReason: approverData.reason || '',
    });
  },

  // Cancel request (by employee)
  cancel: async (id) => {
    const existing = await leaveRequestDB.getById(id);
    if (existing.status !== 'pending') {
      throw new Error('Only pending requests can be cancelled');
    }
    return leaveRequestDB.update(id, {
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
    });
  },

  // Get statistics
  getStatistics: async (filters = {}) => {
    const requests = await leaveRequestDB.getAll(filters);

    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
      cancelled: requests.filter(r => r.status === 'cancelled').length,
    };
  },

  // Get employee leave balance
  getEmployeeLeaveBalance: async (employeeId, year) => {
    const db = await getDB();
    const leaveTypes = await db.getAll('leaveTypes');
    const requests = await leaveRequestDB.getAll({ employeeId });

    // Filter approved requests for the given year
    const yearRequests = requests.filter(r => {
      const requestYear = new Date(r.startDate).getFullYear();
      return r.status === 'approved' && requestYear === year;
    });

    // Calculate balance for each leave type
    return leaveTypes.map(lt => {
      const usedDays = yearRequests
        .filter(r => r.leaveTypeId === lt.id)
        .reduce((sum, r) => sum + (r.totalDays || 0), 0);

      return {
        leaveTypeId: lt.id,
        leaveTypeName: lt.name,
        totalAllowed: lt.daysAllowed || 0,
        used: usedDays,
        remaining: (lt.daysAllowed || 0) - usedDays,
        color: lt.color,
      };
    });
  },

  // Calculate total days between dates
  calculateDays: (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  },
};

// Job Requisition operations
export const jobRequisitionDB = {
  // Generate requisition ID
  generateRequisitionId: async () => {
    const db = await getDB();
    const count = await db.count('jobRequisitions');
    const year = new Date().getFullYear();
    return `REQ-${year}-${String(count + 1).padStart(4, '0')}`;
  },

  create: async (data) => {
    const db = await getDB();
    const requisitionId = await jobRequisitionDB.generateRequisitionId();
    const now = new Date().toISOString();
    const requisition = {
      ...data,
      requisitionId,
      status: data.status || 'draft',
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.add('jobRequisitions', requisition);
    return { ...requisition, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let requisitions = await db.getAll('jobRequisitions');

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      requisitions = requisitions.filter(r =>
        r.title?.toLowerCase().includes(searchLower) ||
        r.requisitionId?.toLowerCase().includes(searchLower) ||
        r.department?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      requisitions = requisitions.filter(r => r.status === filters.status);
    }

    if (filters.department) {
      requisitions = requisitions.filter(r => r.department === filters.department);
    }

    if (filters.priority) {
      requisitions = requisitions.filter(r => r.priority === filters.priority);
    }

    requisitions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return requisitions;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('jobRequisitions', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('jobRequisitions', Number(id));
    if (!existing) throw new Error('Requisition not found');
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };
    await db.put('jobRequisitions', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('jobRequisitions', Number(id));
    return true;
  },

  getStatistics: async () => {
    const db = await getDB();
    const requisitions = await db.getAll('jobRequisitions');
    return {
      total: requisitions.length,
      draft: requisitions.filter(r => r.status === 'draft').length,
      open: requisitions.filter(r => r.status === 'open').length,
      inProgress: requisitions.filter(r => r.status === 'in_progress').length,
      filled: requisitions.filter(r => r.status === 'filled').length,
      cancelled: requisitions.filter(r => r.status === 'cancelled').length,
    };
  },
};

// Candidate operations
export const candidateDB = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const candidate = {
      ...data,
      stage: data.stage || 'applied',
      status: data.status || 'active',
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.add('candidates', candidate);
    return { ...candidate, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let candidates = await db.getAll('candidates');

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      candidates = candidates.filter(c =>
        c.firstName?.toLowerCase().includes(searchLower) ||
        c.lastName?.toLowerCase().includes(searchLower) ||
        c.email?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.requisitionId) {
      candidates = candidates.filter(c => c.requisitionId === Number(filters.requisitionId));
    }

    if (filters.stage) {
      candidates = candidates.filter(c => c.stage === filters.stage);
    }

    if (filters.status) {
      candidates = candidates.filter(c => c.status === filters.status);
    }

    candidates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return candidates;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('candidates', Number(id));
  },

  getByRequisition: async (requisitionId) => {
    const db = await getDB();
    const index = db.transaction('candidates').store.index('requisitionId');
    return index.getAll(Number(requisitionId));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('candidates', Number(id));
    if (!existing) throw new Error('Candidate not found');
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };
    await db.put('candidates', updated);
    return updated;
  },

  updateStage: async (id, stage, notes = '') => {
    return candidateDB.update(id, {
      stage,
      stageHistory: [
        ...(await candidateDB.getById(id))?.stageHistory || [],
        { stage, date: new Date().toISOString(), notes }
      ]
    });
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('candidates', Number(id));
    return true;
  },
};

// Interview operations
export const interviewDB = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const interview = {
      ...data,
      status: data.status || 'scheduled',
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.add('interviews', interview);
    return { ...interview, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let interviews = await db.getAll('interviews');

    if (filters.candidateId) {
      interviews = interviews.filter(i => i.candidateId === Number(filters.candidateId));
    }

    if (filters.requisitionId) {
      interviews = interviews.filter(i => i.requisitionId === Number(filters.requisitionId));
    }

    if (filters.interviewerId) {
      interviews = interviews.filter(i => i.interviewerId === Number(filters.interviewerId));
    }

    if (filters.status) {
      interviews = interviews.filter(i => i.status === filters.status);
    }

    if (filters.date) {
      interviews = interviews.filter(i => i.scheduledDate?.startsWith(filters.date));
    }

    interviews.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
    return interviews;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('interviews', Number(id));
  },

  getByCandidate: async (candidateId) => {
    const db = await getDB();
    const index = db.transaction('interviews').store.index('candidateId');
    return index.getAll(Number(candidateId));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('interviews', Number(id));
    if (!existing) throw new Error('Interview not found');
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };
    await db.put('interviews', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('interviews', Number(id));
    return true;
  },
};

// Job Offer operations
export const jobOfferDB = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const offer = {
      ...data,
      status: data.status || 'draft',
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.add('jobOffers', offer);
    return { ...offer, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let offers = await db.getAll('jobOffers');

    if (filters.candidateId) {
      offers = offers.filter(o => o.candidateId === Number(filters.candidateId));
    }

    if (filters.requisitionId) {
      offers = offers.filter(o => o.requisitionId === Number(filters.requisitionId));
    }

    if (filters.status) {
      offers = offers.filter(o => o.status === filters.status);
    }

    offers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return offers;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('jobOffers', Number(id));
  },

  getByCandidate: async (candidateId) => {
    const db = await getDB();
    const index = db.transaction('jobOffers').store.index('candidateId');
    return index.getAll(Number(candidateId));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('jobOffers', Number(id));
    if (!existing) throw new Error('Offer not found');
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };
    await db.put('jobOffers', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('jobOffers', Number(id));
    return true;
  },
};

// Job Announcement operations
export const jobAnnouncementDB = {
  // Generate announcement ID
  generateAnnouncementId: async () => {
    const db = await getDB();
    const count = await db.count('jobAnnouncements');
    const year = new Date().getFullYear();
    return `ANN-${year}-${String(count + 1).padStart(4, '0')}`;
  },

  create: async (data) => {
    const db = await getDB();
    const announcementId = await jobAnnouncementDB.generateAnnouncementId();
    const now = new Date().toISOString();
    const announcement = {
      ...data,
      announcementId,
      status: data.status || 'draft',
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.add('jobAnnouncements', announcement);
    return { ...announcement, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let announcements = await db.getAll('jobAnnouncements');

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      announcements = announcements.filter(a =>
        a.title?.toLowerCase().includes(searchLower) ||
        a.announcementId?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.requisitionId) {
      announcements = announcements.filter(a => a.requisitionId === Number(filters.requisitionId));
    }

    if (filters.status) {
      announcements = announcements.filter(a => a.status === filters.status);
    }

    announcements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return announcements;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('jobAnnouncements', Number(id));
  },

  getByRequisition: async (requisitionId) => {
    const db = await getDB();
    const index = db.transaction('jobAnnouncements').store.index('requisitionId');
    return index.getAll(Number(requisitionId));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('jobAnnouncements', Number(id));
    if (!existing) throw new Error('Announcement not found');
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };
    await db.put('jobAnnouncements', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('jobAnnouncements', Number(id));
    return true;
  },

  // Publish announcement
  publish: async (id) => {
    return jobAnnouncementDB.update(id, {
      status: 'published',
      publishDate: new Date().toISOString().split('T')[0],
    });
  },

  // Close announcement
  close: async (id) => {
    return jobAnnouncementDB.update(id, {
      status: 'closed',
      closedAt: new Date().toISOString(),
    });
  },

  getStatistics: async () => {
    const db = await getDB();
    const announcements = await db.getAll('jobAnnouncements');
    return {
      total: announcements.length,
      draft: announcements.filter(a => a.status === 'draft').length,
      published: announcements.filter(a => a.status === 'published').length,
      closed: announcements.filter(a => a.status === 'closed').length,
    };
  },
};

// Salary Component operations
export const salaryComponentDB = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const component = {
      ...data,
      status: data.status || 'active',
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.add('salaryComponents', component);
    return { ...component, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let components = await db.getAll('salaryComponents');

    if (filters.type) {
      components = components.filter(c => c.type === filters.type);
    }

    if (filters.status) {
      components = components.filter(c => c.status === filters.status);
    }

    return components;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('salaryComponents', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('salaryComponents', Number(id));
    if (!existing) throw new Error('Component not found');
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };
    await db.put('salaryComponents', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('salaryComponents', Number(id));
    return true;
  },

  seedDefaults: async () => {
    const db = await getDB();
    const existing = await db.getAll('salaryComponents');

    if (existing.length === 0) {
      const defaults = [
        { name: 'Housing Allowance', type: 'allowance', calculationType: 'percentage', value: 10, description: 'Housing allowance' },
        { name: 'Transport Allowance', type: 'allowance', calculationType: 'fixed', value: 2000, description: 'Transportation allowance' },
        { name: 'Meal Allowance', type: 'allowance', calculationType: 'fixed', value: 1500, description: 'Meal allowance' },
        { name: 'Tax', type: 'deduction', calculationType: 'percentage', value: 5, description: 'Income tax' },
        { name: 'Pension', type: 'deduction', calculationType: 'percentage', value: 3, description: 'Pension contribution' },
        { name: 'Health Insurance', type: 'deduction', calculationType: 'fixed', value: 1000, description: 'Health insurance' },
      ];

      for (const component of defaults) {
        await salaryComponentDB.create(component);
      }
    }
  },
};

// Payroll Record operations
export const payrollDB = {
  generatePayrollId: async () => {
    const db = await getDB();
    const count = await db.count('payrollRecords');
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    return `PAY-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  },

  create: async (data) => {
    const db = await getDB();
    const payrollId = await payrollDB.generatePayrollId();
    const now = new Date().toISOString();
    const record = {
      ...data,
      payrollId,
      status: data.status || 'draft',
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.add('payrollRecords', record);
    return { ...record, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let records = await db.getAll('payrollRecords');

    if (filters.employeeId) {
      records = records.filter(r => r.employeeId === Number(filters.employeeId));
    }

    if (filters.month) {
      records = records.filter(r => r.month === filters.month);
    }

    if (filters.year) {
      records = records.filter(r => r.year === filters.year);
    }

    if (filters.status) {
      records = records.filter(r => r.status === filters.status);
    }

    records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return records;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('payrollRecords', Number(id));
  },

  getByMonthYear: async (month, year) => {
    const db = await getDB();
    const records = await db.getAll('payrollRecords');
    return records.filter(r => r.month === month && r.year === year);
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('payrollRecords', Number(id));
    if (!existing) throw new Error('Payroll record not found');
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };
    await db.put('payrollRecords', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('payrollRecords', Number(id));
    return true;
  },

  approve: async (id, approverName) => {
    return payrollDB.update(id, {
      status: 'approved',
      approvedBy: approverName,
      approvedAt: new Date().toISOString(),
    });
  },

  markAsPaid: async (id) => {
    return payrollDB.update(id, {
      status: 'paid',
      paidAt: new Date().toISOString(),
    });
  },

  getStatistics: async (month, year) => {
    const records = await payrollDB.getByMonthYear(month, year);
    return {
      totalEmployees: records.length,
      totalGross: records.reduce((sum, r) => sum + (r.grossSalary || 0), 0),
      totalDeductions: records.reduce((sum, r) => sum + (r.totalDeductions || 0), 0),
      totalNet: records.reduce((sum, r) => sum + (r.netSalary || 0), 0),
      processed: records.filter(r => r.status === 'processed').length,
      approved: records.filter(r => r.status === 'approved').length,
      paid: records.filter(r => r.status === 'paid').length,
    };
  },

  calculateSalary: (employee, components) => {
    const basicSalary = employee.basicSalary || 0;
    let totalAllowances = 0;
    let totalDeductions = 0;
    const allowanceDetails = [];
    const deductionDetails = [];

    for (const comp of components.filter(c => c.type === 'allowance' && c.status === 'active')) {
      const amount = comp.calculationType === 'percentage' ? (basicSalary * comp.value) / 100 : comp.value;
      totalAllowances += amount;
      allowanceDetails.push({ name: comp.name, amount });
    }

    const grossSalary = basicSalary + totalAllowances;

    for (const comp of components.filter(c => c.type === 'deduction' && c.status === 'active')) {
      const amount = comp.calculationType === 'percentage' ? (grossSalary * comp.value) / 100 : comp.value;
      totalDeductions += amount;
      deductionDetails.push({ name: comp.name, amount });
    }

    return {
      basicSalary,
      allowances: allowanceDetails,
      totalAllowances,
      grossSalary,
      deductions: deductionDetails,
      totalDeductions,
      netSalary: grossSalary - totalDeductions,
    };
  },
};

// ========== FINANCE MODULE DB OPERATIONS ==========

// Donor operations
export const donorDB = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const donor = {
      ...data,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.add('donors', donor);
    return { ...donor, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let donors = await db.getAll('donors');

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      donors = donors.filter(d =>
        d.name?.toLowerCase().includes(searchLower) ||
        d.code?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.isActive !== undefined) {
      donors = donors.filter(d => d.isActive === filters.isActive);
    }

    donors.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return donors;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('donors', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('donors', Number(id));
    if (!existing) throw new Error('Donor not found');
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };
    await db.put('donors', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('donors', Number(id));
    return true;
  },

  seedDefaults: async () => {
    const db = await getDB();
    const existing = await db.getAll('donors');
    if (existing.length === 0) {
      const defaults = [
        { name: 'UNICEF', code: 'UNICEF', contactPerson: 'John Smith', contactEmail: 'john@unicef.org' },
        { name: 'World Food Programme', code: 'WFP', contactPerson: 'Jane Doe', contactEmail: 'jane@wfp.org' },
        { name: 'UN Women', code: 'UNW', contactPerson: 'Mary Johnson', contactEmail: 'mary@unwomen.org' },
      ];
      for (const donor of defaults) {
        await donorDB.create(donor);
      }
    }
  },
};

// Project operations
export const projectDB = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const project = {
      ...data,
      status: data.status || 'ongoing',
      currency: data.currency || 'AFN',
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.add('projects', project);
    return { ...project, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let projects = await db.getAll('projects');

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      projects = projects.filter(p =>
        p.projectName?.toLowerCase().includes(searchLower) ||
        p.projectCode?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.donorId) {
      projects = projects.filter(p => p.donorId === Number(filters.donorId));
    }

    if (filters.status) {
      projects = projects.filter(p => p.status === filters.status);
    }

    projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return projects;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('projects', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('projects', Number(id));
    if (!existing) throw new Error('Project not found');
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };
    await db.put('projects', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('projects', Number(id));
    return true;
  },

  getStatistics: async () => {
    const db = await getDB();
    const projects = await db.getAll('projects');
    return {
      total: projects.length,
      ongoing: projects.filter(p => p.status === 'ongoing').length,
      closed: projects.filter(p => p.status === 'closed').length,
      pending: projects.filter(p => p.status === 'pending').length,
      totalBudget: projects.reduce((sum, p) => sum + (p.totalBudget || 0), 0),
    };
  },

  seedDefaults: async () => {
    const db = await getDB();
    const existing = await db.count('projects');
    if (existing > 0) return;

    // Get donor IDs from seeded donors
    const donors = await db.getAll('donors');
    const donorMap = {
      'USAID': donors.find(d => d.name === 'USAID')?.id || 1,
      'World Bank': donors.find(d => d.name === 'World Bank')?.id || 2,
      'UNDP': donors.find(d => d.name === 'UNDP')?.id || 3,
    };

    const defaultProjects = [
      {
        projectName: 'Livelihoods Enhancement Initiative',
        projectCode: 'LEI-2024-F001',
        donorId: donorMap['USAID'],
        startDate: '2024-01-01',
        endDate: '2026-12-31',
        totalBudget: 800000,
        spentBudget: 250000,
        remainingBudget: 550000,
        currency: 'USD',
        status: 'ongoing',
        description: 'Supporting smallholder farmers with agricultural inputs and training',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        projectName: 'Vocational Training for Youth',
        projectCode: 'VTY-2024-F002',
        donorId: donorMap['World Bank'],
        startDate: '2024-02-15',
        endDate: '2027-02-14',
        totalBudget: 1500000,
        spentBudget: 400000,
        remainingBudget: 1100000,
        currency: 'USD',
        status: 'ongoing',
        description: 'Providing vocational skills training to unemployed youth',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        projectName: 'Rural Energy Access Program',
        projectCode: 'REAP-2023-F003',
        donorId: donorMap['UNDP'],
        startDate: '2023-07-01',
        endDate: '2025-06-30',
        totalBudget: 950000,
        spentBudget: 600000,
        remainingBudget: 350000,
        currency: 'USD',
        status: 'ongoing',
        description: 'Installing solar power systems in off-grid rural communities',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const project of defaultProjects) {
      await db.add('projects', project);
    }
  },
};

// Bank operations
export const bankDB = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const bank = {
      ...data,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.add('banks', bank);
    return { ...bank, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let banks = await db.getAll('banks');

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      banks = banks.filter(b =>
        b.bankName?.toLowerCase().includes(searchLower) ||
        b.bankCode?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.isActive !== undefined) {
      banks = banks.filter(b => b.isActive === filters.isActive);
    }

    return banks;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('banks', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('banks', Number(id));
    if (!existing) throw new Error('Bank not found');
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };
    await db.put('banks', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('banks', Number(id));
    return true;
  },

  seedDefaults: async () => {
    const db = await getDB();
    const existing = await db.getAll('banks');
    if (existing.length === 0) {
      const defaults = [
        { bankName: 'Afghanistan International Bank', bankCode: 'AIB', address: 'Kabul, Afghanistan' },
        { bankName: 'Azizi Bank', bankCode: 'AZIZI', address: 'Kabul, Afghanistan' },
        { bankName: 'First MicroFinance Bank', bankCode: 'FMFB', address: 'Kabul, Afghanistan' },
      ];
      for (const bank of defaults) {
        await bankDB.create(bank);
      }
    }
  },
};

// Bank Account operations
export const bankAccountDB = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const account = {
      ...data,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.add('bankAccounts', account);
    return { ...account, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let accounts = await db.getAll('bankAccounts');

    if (filters.bankId) {
      accounts = accounts.filter(a => a.bankId === Number(filters.bankId));
    }

    if (filters.currency) {
      accounts = accounts.filter(a => a.currency === filters.currency);
    }

    if (filters.isActive !== undefined) {
      accounts = accounts.filter(a => a.isActive === filters.isActive);
    }

    return accounts;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('bankAccounts', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('bankAccounts', Number(id));
    if (!existing) throw new Error('Bank account not found');
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };
    await db.put('bankAccounts', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('bankAccounts', Number(id));
    return true;
  },
};

// Bank Signatory operations
export const bankSignatoryDB = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const signatory = {
      ...data,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.add('bankSignatories', signatory);
    return { ...signatory, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let signatories = await db.getAll('bankSignatories');

    if (filters.bankAccountId) {
      signatories = signatories.filter(s => s.bankAccountId === Number(filters.bankAccountId));
    }

    if (filters.isActive !== undefined) {
      signatories = signatories.filter(s => s.isActive === filters.isActive);
    }

    return signatories;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('bankSignatories', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('bankSignatories', Number(id));
    if (!existing) throw new Error('Signatory not found');
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };
    await db.put('bankSignatories', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('bankSignatories', Number(id));
    return true;
  },
};

// Budget Category operations
export const budgetCategoryDB = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const category = {
      ...data,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.add('budgetCategories', category);
    return { ...category, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let categories = await db.getAll('budgetCategories');

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      categories = categories.filter(c =>
        c.categoryName?.toLowerCase().includes(searchLower) ||
        c.categoryCode?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.isActive !== undefined) {
      categories = categories.filter(c => c.isActive === filters.isActive);
    }

    return categories;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('budgetCategories', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('budgetCategories', Number(id));
    if (!existing) throw new Error('Budget category not found');
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };
    await db.put('budgetCategories', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('budgetCategories', Number(id));
    return true;
  },

  seedDefaults: async () => {
    const db = await getDB();
    const existing = await db.getAll('budgetCategories');
    if (existing.length === 0) {
      const defaults = [
        { categoryName: 'Personnel Costs', categoryCode: 'PERS', description: 'Staff salaries and benefits' },
        { categoryName: 'Office Rent', categoryCode: 'RENT', description: 'Office space rental costs' },
        { categoryName: 'Equipment and Supplies', categoryCode: 'EQUIP', description: 'Equipment and office supplies' },
        { categoryName: 'Training and Workshops', categoryCode: 'TRAIN', description: 'Training and workshop expenses' },
        { categoryName: 'Transportation', categoryCode: 'TRANS', description: 'Vehicle and travel costs' },
        { categoryName: 'Monitoring and Evaluation', categoryCode: 'ME', description: 'M&E activities' },
        { categoryName: 'Administrative Costs', categoryCode: 'ADMIN', description: 'General administrative expenses' },
      ];
      for (const cat of defaults) {
        await budgetCategoryDB.create(cat);
      }
    }
  },
};

// Project Budget operations
export const projectBudgetDB = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const budget = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.add('projectBudgets', budget);
    return { ...budget, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let budgets = await db.getAll('projectBudgets');

    if (filters.projectId) {
      budgets = budgets.filter(b => b.projectId === Number(filters.projectId));
    }

    if (filters.fiscalYear) {
      budgets = budgets.filter(b => b.fiscalYear === filters.fiscalYear);
    }

    return budgets;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('projectBudgets', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('projectBudgets', Number(id));
    if (!existing) throw new Error('Project budget not found');
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };
    await db.put('projectBudgets', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('projectBudgets', Number(id));
    return true;
  },
};

// Budget Expenditure operations
export const budgetExpenditureDB = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const expenditure = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.add('budgetExpenditures', expenditure);
    return { ...expenditure, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let expenditures = await db.getAll('budgetExpenditures');

    if (filters.projectBudgetId) {
      expenditures = expenditures.filter(e => e.projectBudgetId === Number(filters.projectBudgetId));
    }

    if (filters.startDate && filters.endDate) {
      expenditures = expenditures.filter(e =>
        e.expenditureDate >= filters.startDate && e.expenditureDate <= filters.endDate
      );
    }

    expenditures.sort((a, b) => new Date(b.expenditureDate) - new Date(a.expenditureDate));
    return expenditures;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('budgetExpenditures', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('budgetExpenditures', Number(id));
    if (!existing) throw new Error('Expenditure not found');
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };
    await db.put('budgetExpenditures', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('budgetExpenditures', Number(id));
    return true;
  },
};

// Project Staff Cost operations
export const projectStaffCostDB = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const cost = {
      ...data,
      amendmentNumber: data.amendmentNumber || 0,
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.add('projectStaffCosts', cost);
    return { ...cost, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let costs = await db.getAll('projectStaffCosts');

    if (filters.projectId) {
      costs = costs.filter(c => c.projectId === Number(filters.projectId));
    }

    if (filters.amendmentNumber !== undefined) {
      costs = costs.filter(c => c.amendmentNumber === filters.amendmentNumber);
    }

    return costs;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('projectStaffCosts', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('projectStaffCosts', Number(id));
    if (!existing) throw new Error('Staff cost not found');
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };
    await db.put('projectStaffCosts', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('projectStaffCosts', Number(id));
    return true;
  },
};

// Project Operational Cost operations
export const projectOperationalCostDB = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const cost = {
      ...data,
      amendmentNumber: data.amendmentNumber || 0,
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.add('projectOperationalCosts', cost);
    return { ...cost, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let costs = await db.getAll('projectOperationalCosts');

    if (filters.projectId) {
      costs = costs.filter(c => c.projectId === Number(filters.projectId));
    }

    if (filters.amendmentNumber !== undefined) {
      costs = costs.filter(c => c.amendmentNumber === filters.amendmentNumber);
    }

    return costs;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('projectOperationalCosts', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('projectOperationalCosts', Number(id));
    if (!existing) throw new Error('Operational cost not found');
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };
    await db.put('projectOperationalCosts', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('projectOperationalCosts', Number(id));
    return true;
  },
};

// Cash Request operations
export const cashRequestDB = {
  generateRequestNumber: async () => {
    const db = await getDB();
    const count = await db.count('cashRequests');
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    return `CR-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  },

  create: async (data) => {
    const db = await getDB();
    const requestNumber = await cashRequestDB.generateRequestNumber();
    const now = new Date().toISOString();
    const request = {
      ...data,
      requestNumber,
      status: data.status || 'draft',
      currency: data.currency || 'AFN',
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.add('cashRequests', request);
    return { ...request, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let requests = await db.getAll('cashRequests');

    if (filters.status) {
      requests = requests.filter(r => r.status === filters.status);
    }

    if (filters.requestMonth) {
      requests = requests.filter(r => r.requestMonth === filters.requestMonth);
    }

    requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return requests;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('cashRequests', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('cashRequests', Number(id));
    if (!existing) throw new Error('Cash request not found');
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };
    await db.put('cashRequests', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('cashRequests', Number(id));
    return true;
  },

  approve: async (id, approverData) => {
    return cashRequestDB.update(id, {
      status: 'approved',
      approvedBy: approverData.approvedBy,
      approvedAt: new Date().toISOString(),
    });
  },
};

// Cash Request Item operations
export const cashRequestItemDB = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const item = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.add('cashRequestItems', item);
    return { ...item, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let items = await db.getAll('cashRequestItems');

    if (filters.cashRequestId) {
      items = items.filter(i => i.cashRequestId === Number(filters.cashRequestId));
    }

    if (filters.projectId) {
      items = items.filter(i => i.projectId === Number(filters.projectId));
    }

    return items;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('cashRequestItems', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('cashRequestItems', Number(id));
    if (!existing) throw new Error('Cash request item not found');
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };
    await db.put('cashRequestItems', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('cashRequestItems', Number(id));
    return true;
  },

  deleteByRequestId: async (cashRequestId) => {
    const db = await getDB();
    const items = await cashRequestItemDB.getAll({ cashRequestId });
    for (const item of items) {
      await db.delete('cashRequestItems', item.id);
    }
    return true;
  },
};

// Installment Request operations
export const installmentRequestDB = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const request = {
      ...data,
      status: data.status || 'pending',
      currency: data.currency || 'AFN',
      amendmentNumber: data.amendmentNumber || 0,
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.add('installmentRequests', request);
    return { ...request, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let requests = await db.getAll('installmentRequests');

    if (filters.projectId) {
      requests = requests.filter(r => r.projectId === Number(filters.projectId));
    }

    if (filters.status) {
      requests = requests.filter(r => r.status === filters.status);
    }

    requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return requests;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('installmentRequests', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('installmentRequests', Number(id));
    if (!existing) throw new Error('Installment request not found');
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };
    await db.put('installmentRequests', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('installmentRequests', Number(id));
    return true;
  },
};

// Installment Receipt operations
export const installmentReceiptDB = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const receipt = {
      ...data,
      currency: data.currency || 'AFN',
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.add('installmentReceipts', receipt);
    return { ...receipt, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let receipts = await db.getAll('installmentReceipts');

    if (filters.installmentRequestId) {
      receipts = receipts.filter(r => r.installmentRequestId === Number(filters.installmentRequestId));
    }

    receipts.sort((a, b) => new Date(b.receiptDate) - new Date(a.receiptDate));
    return receipts;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('installmentReceipts', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('installmentReceipts', Number(id));
    if (!existing) throw new Error('Installment receipt not found');
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };
    await db.put('installmentReceipts', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('installmentReceipts', Number(id));
    return true;
  },
};

// Staff Salary Allocation operations
export const staffSalaryAllocationDB = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const allocation = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.add('staffSalaryAllocations', allocation);
    return { ...allocation, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let allocations = await db.getAll('staffSalaryAllocations');

    if (filters.employeeId) {
      allocations = allocations.filter(a => a.employeeId === Number(filters.employeeId));
    }

    if (filters.projectId) {
      allocations = allocations.filter(a => a.projectId === Number(filters.projectId));
    }

    if (filters.allocationMonth) {
      allocations = allocations.filter(a => a.allocationMonth === filters.allocationMonth);
    }

    return allocations;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('staffSalaryAllocations', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('staffSalaryAllocations', Number(id));
    if (!existing) throw new Error('Allocation not found');
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };
    await db.put('staffSalaryAllocations', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('staffSalaryAllocations', Number(id));
    return true;
  },
};

// Donor Reporting Schedule operations
export const donorReportingScheduleDB = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const schedule = {
      ...data,
      status: data.status || 'pending',
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.add('donorReportingSchedules', schedule);
    return { ...schedule, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let schedules = await db.getAll('donorReportingSchedules');

    if (filters.projectId) {
      schedules = schedules.filter(s => s.projectId === Number(filters.projectId));
    }

    if (filters.status) {
      schedules = schedules.filter(s => s.status === filters.status);
    }

    schedules.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    return schedules;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('donorReportingSchedules', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('donorReportingSchedules', Number(id));
    if (!existing) throw new Error('Reporting schedule not found');
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };
    await db.put('donorReportingSchedules', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('donorReportingSchedules', Number(id));
    return true;
  },
};

// Government Reporting operations
export const governmentReportingDB = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const report = {
      ...data,
      status: data.status || 'pending',
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.add('governmentReporting', report);
    return { ...report, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let reports = await db.getAll('governmentReporting');

    if (filters.projectId) {
      reports = reports.filter(r => r.projectId === Number(filters.projectId));
    }

    if (filters.status) {
      reports = reports.filter(r => r.status === filters.status);
    }

    reports.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    return reports;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('governmentReporting', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('governmentReporting', Number(id));
    if (!existing) throw new Error('Government report not found');
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };
    await db.put('governmentReporting', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('governmentReporting', Number(id));
    return true;
  },
};

// Project Amendment operations
export const projectAmendmentDB = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const amendment = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.add('projectAmendments', amendment);
    return { ...amendment, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let amendments = await db.getAll('projectAmendments');

    if (filters.projectId) {
      amendments = amendments.filter(a => a.projectId === Number(filters.projectId));
    }

    amendments.sort((a, b) => b.amendmentNumber - a.amendmentNumber);
    return amendments;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('projectAmendments', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('projectAmendments', Number(id));
    if (!existing) throw new Error('Amendment not found');
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };
    await db.put('projectAmendments', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('projectAmendments', Number(id));
    return true;
  },

  getNextAmendmentNumber: async (projectId) => {
    const amendments = await projectAmendmentDB.getAll({ projectId });
    if (amendments.length === 0) return 1;
    return Math.max(...amendments.map(a => a.amendmentNumber)) + 1;
  },
};

// Signatory Assignment operations
export const signatoryAssignmentDB = {
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const assignment = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.add('signatoryAssignments', assignment);
    return { ...assignment, id };
  },

  getAll: async (filters = {}) => {
    const db = await getDB();
    let assignments = await db.getAll('signatoryAssignments');

    if (filters.projectId) {
      assignments = assignments.filter(a => a.projectId === Number(filters.projectId));
    }

    if (filters.assignmentMonth) {
      assignments = assignments.filter(a => a.assignmentMonth === filters.assignmentMonth);
    }

    return assignments;
  },

  getById: async (id) => {
    const db = await getDB();
    return db.get('signatoryAssignments', Number(id));
  },

  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get('signatoryAssignments', Number(id));
    if (!existing) throw new Error('Assignment not found');
    const updated = {
      ...existing,
      ...data,
      id: Number(id),
      updatedAt: new Date().toISOString(),
    };
    await db.put('signatoryAssignments', updated);
    return updated;
  },

  delete: async (id) => {
    const db = await getDB();
    await db.delete('signatoryAssignments', Number(id));
    return true;
  },
};

// ========== COMPLIANCE MODULE DB OPERATIONS ==========

// Generic CRUD factory for compliance tables
const createComplianceCRUD = (storeName) => ({
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const record = { ...data, createdAt: now, updatedAt: now };
    const id = await db.add(storeName, record);
    return { ...record, id };
  },
  getAll: async () => {
    const db = await getDB();
    const records = await db.getAll(storeName);
    return records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  getById: async (id) => {
    const db = await getDB();
    return db.get(storeName, Number(id));
  },
  update: async (id, data) => {
    const db = await getDB();
    const existing = await db.get(storeName, Number(id));
    if (!existing) throw new Error('Record not found');
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

// Compliance Projects operations
export const complianceProjectDB = {
  ...createComplianceCRUD('complianceProjects'),
  getAll: async (filters = {}) => {
    const db = await getDB();
    let projects = await db.getAll('complianceProjects');
    if (filters.status) projects = projects.filter(p => p.status === filters.status);
    if (filters.search) {
      const s = filters.search.toLowerCase();
      projects = projects.filter(p => p.projectName?.toLowerCase().includes(s) || p.donorName?.toLowerCase().includes(s));
    }
    return projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  seedDefaults: async () => {
    const db = await getDB();
    const existing = await db.count('complianceProjects');
    if (existing > 0) return;

    const defaultProjects = [
      {
        projectName: 'Community Health and Nutrition Program',
        projectCode: 'CHNP-2024-001',
        donorName: 'World Health Organization',
        startDate: '2024-01-01',
        endDate: '2026-12-31',
        totalBudget: 500000,
        currency: 'USD',
        status: 'active',
        description: 'Improving maternal and child health services in rural areas',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        projectName: 'Education Access for Girls',
        projectCode: 'EAG-2024-002',
        donorName: 'UNICEF',
        startDate: '2024-03-15',
        endDate: '2027-03-14',
        totalBudget: 750000,
        currency: 'USD',
        status: 'active',
        description: 'Increasing enrollment and retention of girls in primary schools',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        projectName: 'WASH Infrastructure Development',
        projectCode: 'WASH-2023-003',
        donorName: 'European Union',
        startDate: '2023-06-01',
        endDate: '2025-05-31',
        totalBudget: 1200000,
        currency: 'EUR',
        status: 'active',
        description: 'Building water wells and sanitation facilities in underserved communities',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const project of defaultProjects) {
      await db.add('complianceProjects', project);
    }
  },
};

// Compliance Amendments operations
export const complianceAmendmentDB = {
  ...createComplianceCRUD('complianceAmendments'),
  getAll: async (filters = {}) => {
    const db = await getDB();
    let amendments = await db.getAll('complianceAmendments');
    if (filters.projectId) amendments = amendments.filter(a => a.projectId === Number(filters.projectId));
    return amendments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  deleteByProjectId: async (projectId) => {
    const db = await getDB();
    const amendments = await db.getAll('complianceAmendments');
    for (const a of amendments.filter(a => a.projectId === projectId)) {
      await db.delete('complianceAmendments', a.id);
    }
  },
};

// Proposals operations
export const proposalDB = {
  ...createComplianceCRUD('proposals'),
  getAll: async (filters = {}) => {
    const db = await getDB();
    let proposals = await db.getAll('proposals');
    if (filters.status) proposals = proposals.filter(p => p.status === filters.status);
    if (filters.result) proposals = proposals.filter(p => p.result === filters.result);
    return proposals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
};

// DD Tracking operations (Due Diligence Tracking)
export const dueDiligenceDB = {
  ...createComplianceCRUD('dueDiligence'),
  getAll: async (filters = {}) => {
    const db = await getDB();
    let records = await db.getAll('dueDiligence');
    if (filters.status) records = records.filter(r => r.status === filters.status);
    if (filters.donorName) records = records.filter(r => r.donorName?.toLowerCase().includes(filters.donorName.toLowerCase()));
    return records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  seedDefaults: async () => {
    const db = await getDB();
    const existing = await db.count('dueDiligence');
    if (existing > 0) return; // Already seeded

    const defaultDDRecords = [
      {
        donorName: 'World Health Organization (WHO)',
        ddDeadline: '2024-12-31',
        officeVisitDate: '2024-11-15',
        ddStartDate: '2024-11-01',
        ddCompletionDate: '2024-12-20',
        status: 'completed',
        ddDocumentsLink: 'https://drive.google.com/folder/who-dd-2024',
        createdAt: new Date().toISOString(),
      },
      {
        donorName: 'UNICEF Afghanistan',
        ddDeadline: '2025-01-15',
        officeVisitDate: '2024-12-10',
        ddStartDate: '2024-12-01',
        ddCompletionDate: '',
        status: 'in_progress',
        ddDocumentsLink: 'https://drive.google.com/folder/unicef-dd-2025',
        createdAt: new Date().toISOString(),
      },
      {
        donorName: 'European Union Delegation',
        ddDeadline: '2024-11-30',
        officeVisitDate: '2024-10-20',
        ddStartDate: '2024-10-15',
        ddCompletionDate: '2024-11-25',
        status: 'completed',
        ddDocumentsLink: 'https://drive.google.com/folder/eu-dd-2024',
        createdAt: new Date().toISOString(),
      },
      {
        donorName: 'USAID Afghanistan',
        ddDeadline: '2025-02-28',
        officeVisitDate: '',
        ddStartDate: '2024-12-15',
        ddCompletionDate: '',
        status: 'in_progress',
        ddDocumentsLink: '',
        createdAt: new Date().toISOString(),
      },
      {
        donorName: 'Norwegian Refugee Council',
        ddDeadline: '2024-10-31',
        officeVisitDate: '2024-09-15',
        ddStartDate: '2024-09-01',
        ddCompletionDate: '',
        status: 'rejected',
        ddDocumentsLink: 'https://drive.google.com/folder/nrc-dd-2024',
        createdAt: new Date().toISOString(),
      },
      {
        donorName: 'Asian Development Bank',
        ddDeadline: '2025-03-31',
        officeVisitDate: '',
        ddStartDate: '',
        ddCompletionDate: '',
        status: 'status_unknown',
        ddDocumentsLink: '',
        createdAt: new Date().toISOString(),
      },
      {
        donorName: 'UN Women Afghanistan',
        ddDeadline: '2025-01-31',
        officeVisitDate: '2024-12-05',
        ddStartDate: '2024-11-20',
        ddCompletionDate: '',
        status: 'in_progress',
        ddDocumentsLink: 'https://drive.google.com/folder/unwomen-dd-2025',
        createdAt: new Date().toISOString(),
      },
      {
        donorName: 'International Rescue Committee',
        ddDeadline: '2024-12-15',
        officeVisitDate: '2024-11-10',
        ddStartDate: '2024-11-01',
        ddCompletionDate: '2024-12-10',
        status: 'completed',
        ddDocumentsLink: 'https://drive.google.com/folder/irc-dd-2024',
        createdAt: new Date().toISOString(),
      },
    ];

    for (const record of defaultDDRecords) {
      await db.add('dueDiligence', record);
    }
  },
};

// Registrations operations (VDO Registration)
export const registrationDB = {
  ...createComplianceCRUD('registrations'),
  getAll: async (filters = {}) => {
    const db = await getDB();
    let records = await db.getAll('registrations');
    if (filters.status) records = records.filter(r => r.status === filters.status);
    if (filters.organizationPlatform) records = records.filter(r => r.organizationPlatform?.toLowerCase().includes(filters.organizationPlatform.toLowerCase()));
    return records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
};

// Memberships operations (VDO's Membership and Representation)
export const membershipDB = {
  ...createComplianceCRUD('memberships'),
  getAll: async (filters = {}) => {
    const db = await getDB();
    let records = await db.getAll('memberships');
    if (filters.status) records = records.filter(r => r.status === filters.status);
    if (filters.platformType) records = records.filter(r => r.platformType === filters.platformType);
    if (filters.nameMembershipPlatform) records = records.filter(r => r.nameMembershipPlatform?.toLowerCase().includes(filters.nameMembershipPlatform.toLowerCase()));
    return records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
};


// Certificates operations (VDO's Acknowledgement/Certification Documents)
export const certificateDB = {
  ...createComplianceCRUD('certificates'),
  getAll: async (filters = {}) => {
    const db = await getDB();
    let records = await db.getAll('certificates');
    if (filters.typeOfDocument) records = records.filter(r => r.typeOfDocument === filters.typeOfDocument);
    if (filters.agency) records = records.filter(r => r.agency === filters.agency);
    if (filters.nameOfInstitution) records = records.filter(r => r.nameOfInstitution?.toLowerCase().includes(filters.nameOfInstitution.toLowerCase()));
    return records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
};

// Board of Directors operations
export const boardOfDirectorsDB = {
  ...createComplianceCRUD('boardOfDirectors'),
  getAll: async (filters = {}) => {
    const db = await getDB();
    let members = await db.getAll('boardOfDirectors');
    if (filters.status) members = members.filter(m => m.status === filters.status);
    return members.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
};

// Partners operations
export const partnerDB = {
  ...createComplianceCRUD('partners'),
  getAll: async (filters = {}) => {
    const db = await getDB();
    let partners = await db.getAll('partners');
    if (filters.status) partners = partners.filter(p => p.status === filters.status);
    if (filters.location) partners = partners.filter(p => p.location?.toLowerCase().includes(filters.location.toLowerCase()));
    if (filters.namePartner) partners = partners.filter(p => p.namePartner?.toLowerCase().includes(filters.namePartner.toLowerCase()));
    return partners.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
};

// Donor Outreach operations
export const donorOutreachDB = createComplianceCRUD('donorOutreach');

// Government Outreach operations
export const govtOutreachDB = createComplianceCRUD('governmentOutreach');

// Compliance Documents operations
export const complianceDocumentDB = {
  ...createComplianceCRUD('complianceDocuments'),
  getAll: async (filters = {}) => {
    const db = await getDB();
    let docs = await db.getAll('complianceDocuments');
    if (filters.category) docs = docs.filter(d => d.category === filters.category);
    if (filters.year) docs = docs.filter(d => d.year === filters.year);
    return docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
};

// Blacklist operations
// Restricted List operations (VDO's Restricted List)
export const blacklistDB = {
  ...createComplianceCRUD('blacklist'),
  getAll: async (filters = {}) => {
    const db = await getDB();
    let records = await db.getAll('blacklist');
    if (filters.category) records = records.filter(r => r.category === filters.category);
    if (filters.access) records = records.filter(r => r.access === filters.access);
    if (filters.name) records = records.filter(r => r.name?.toLowerCase().includes(filters.name.toLowerCase()));
    return records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
};

// ========== HR POLICY COMPLIANCE MODULE EXPORTS ==========

// Helper function for HR module CRUD operations
const createHRModuleCRUD = (storeName, uniqueIdField = null) => ({
  create: async (data) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const record = { ...data, createdAt: now, updatedAt: now };
    const id = await db.add(storeName, record);
    return { ...record, id };
  },
  getAll: async (filters = {}) => {
    const db = await getDB();
    let records = await db.getAll(storeName);
    // Apply common filters
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '' && filters[key] !== null) {
        records = records.filter(r => r[key] === filters[key]);
      }
    });
    return records.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
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
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    await db.put(storeName, updated);
    return updated;
  },
  delete: async (id) => {
    const db = await getDB();
    await db.delete(storeName, Number(id));
    return true;
  },
  count: async () => {
    const db = await getDB();
    return db.count(storeName);
  },
});

// Contract Management (Chapter 4)
export const contractTypeDB = createHRModuleCRUD('contractTypes');
export const employeeContractDB = {
  ...createHRModuleCRUD('employeeContracts'),
  generateContractNumber: async () => {
    const db = await getDB();
    const count = await db.count('employeeContracts');
    const year = new Date().getFullYear();
    return `CON-${year}-${String(count + 1).padStart(4, '0')}`;
  },
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('employeeContracts', 'employeeId', employeeId);
  },
  getActiveContracts: async () => {
    const db = await getDB();
    const contracts = await db.getAll('employeeContracts');
    return contracts.filter(c => c.status === 'active');
  },
  getExpiringContracts: async (daysAhead = 30) => {
    const db = await getDB();
    const contracts = await db.getAll('employeeContracts');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    return contracts.filter(c =>
      c.status === 'active' &&
      new Date(c.endDate) <= futureDate
    );
  },
};
export const contractAmendmentDB = {
  ...createHRModuleCRUD('contractAmendments'),
  generateAmendmentNumber: async (contractId) => {
    const db = await getDB();
    const amendments = await db.getAllFromIndex('contractAmendments', 'contractId', contractId);
    return `AMD-${contractId}-${String(amendments.length + 1).padStart(2, '0')}`;
  },
  getByContract: async (contractId) => {
    const db = await getDB();
    return db.getAllFromIndex('contractAmendments', 'contractId', contractId);
  },
};

// Probation & Orientation (Chapter 5)
export const orientationChecklistDB = {
  ...createHRModuleCRUD('orientationChecklists'),
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('orientationChecklists', 'employeeId', employeeId);
  },
};
export const orientationItemDB = {
  ...createHRModuleCRUD('orientationItems'),
  getByChecklist: async (checklistId) => {
    const db = await getDB();
    return db.getAllFromIndex('orientationItems', 'checklistId', checklistId);
  },
};
export const probationRecordDB = {
  ...createHRModuleCRUD('probationRecords'),
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('probationRecords', 'employeeId', employeeId);
  },
  getActiveProbations: async () => {
    const db = await getDB();
    const records = await db.getAll('probationRecords');
    return records.filter(r => r.status === 'active');
  },
  getEndingProbations: async (daysAhead = 15) => {
    const db = await getDB();
    const records = await db.getAll('probationRecords');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    return records.filter(r =>
      r.status === 'active' &&
      new Date(r.endDate) <= futureDate
    );
  },
};
export const probationEvaluationDB = {
  ...createHRModuleCRUD('probationEvaluations'),
  getByProbation: async (probationId) => {
    const db = await getDB();
    return db.getAllFromIndex('probationEvaluations', 'probationId', probationId);
  },
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('probationEvaluations', 'employeeId', employeeId);
  },
};

// Extended Recruitment (Chapter 3)
export const recruitmentCommitteeDB = {
  ...createHRModuleCRUD('recruitmentCommittees'),
  generateCommitteeId: async () => {
    const db = await getDB();
    const count = await db.count('recruitmentCommittees');
    const year = new Date().getFullYear();
    return `RC-${year}-${String(count + 1).padStart(3, '0')}`;
  },
  getByRequisition: async (requisitionId) => {
    const db = await getDB();
    return db.getAllFromIndex('recruitmentCommittees', 'requisitionId', requisitionId);
  },
};
export const committeeMemberDB = {
  ...createHRModuleCRUD('committeeMembers'),
  getByCommittee: async (committeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('committeeMembers', 'committeeId', committeeId);
  },
};
export const writtenTestDB = {
  ...createHRModuleCRUD('writtenTests'),
  generateTestId: async () => {
    const db = await getDB();
    const count = await db.count('writtenTests');
    return `TEST-${String(count + 1).padStart(4, '0')}`;
  },
  getByRequisition: async (requisitionId) => {
    const db = await getDB();
    return db.getAllFromIndex('writtenTests', 'requisitionId', requisitionId);
  },
};
export const testResultDB = {
  ...createHRModuleCRUD('testResults'),
  getByTest: async (testId) => {
    const db = await getDB();
    return db.getAllFromIndex('testResults', 'testId', testId);
  },
  getByCandidate: async (candidateId) => {
    const db = await getDB();
    return db.getAllFromIndex('testResults', 'candidateId', candidateId);
  },
};
export const referenceCheckDB = {
  ...createHRModuleCRUD('referenceChecks'),
  getByCandidate: async (candidateId) => {
    const db = await getDB();
    return db.getAllFromIndex('referenceChecks', 'candidateId', candidateId);
  },
};
export const backgroundCheckDB = {
  ...createHRModuleCRUD('backgroundChecks'),
  getByCandidate: async (candidateId) => {
    const db = await getDB();
    return db.getAllFromIndex('backgroundChecks', 'candidateId', candidateId);
  },
};
export const sanctionClearanceDB = {
  ...createHRModuleCRUD('sanctionClearances'),
  getByCandidate: async (candidateId) => {
    const db = await getDB();
    return db.getAllFromIndex('sanctionClearances', 'candidateId', candidateId);
  },
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('sanctionClearances', 'employeeId', employeeId);
  },
  getExpiring: async (daysAhead = 30) => {
    const db = await getDB();
    const records = await db.getAll('sanctionClearances');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    return records.filter(r =>
      r.result === 'cleared' &&
      new Date(r.validUntil) <= futureDate
    );
  },
};
export const shortlistingScoreDB = {
  ...createHRModuleCRUD('shortlistingScores'),
  getByCandidate: async (candidateId) => {
    const db = await getDB();
    return db.getAllFromIndex('shortlistingScores', 'candidateId', candidateId);
  },
  getByRequisition: async (requisitionId) => {
    const db = await getDB();
    return db.getAllFromIndex('shortlistingScores', 'requisitionId', requisitionId);
  },
};

// Compensation & Benefits Extended (Chapter 6)
export const allowanceTypeDB = createHRModuleCRUD('allowanceTypes');
export const employeeAllowanceDB = {
  ...createHRModuleCRUD('employeeAllowances'),
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('employeeAllowances', 'employeeId', employeeId);
  },
  getActiveAllowances: async (employeeId) => {
    const db = await getDB();
    const allowances = await db.getAllFromIndex('employeeAllowances', 'employeeId', employeeId);
    const today = new Date().toISOString().split('T')[0];
    return allowances.filter(a =>
      a.status === 'active' &&
      a.effectiveFrom <= today &&
      (!a.effectiveTo || a.effectiveTo >= today)
    );
  },
};
export const salaryAdvanceDB = {
  ...createHRModuleCRUD('salaryAdvances'),
  generateAdvanceNumber: async () => {
    const db = await getDB();
    const count = await db.count('salaryAdvances');
    const year = new Date().getFullYear();
    return `ADV-${year}-${String(count + 1).padStart(4, '0')}`;
  },
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('salaryAdvances', 'employeeId', employeeId);
  },
  getPendingAdvances: async () => {
    const db = await getDB();
    const advances = await db.getAll('salaryAdvances');
    return advances.filter(a => a.status === 'pending');
  },
};
export const employeeRewardDB = {
  ...createHRModuleCRUD('employeeRewards'),
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('employeeRewards', 'employeeId', employeeId);
  },
};

// Leave Extended (Chapter 7)
export const leaveBalanceDB = {
  ...createHRModuleCRUD('leaveBalances'),
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('leaveBalances', 'employeeId', employeeId);
  },
  getByEmployeeAndYear: async (employeeId, year) => {
    const db = await getDB();
    const balances = await db.getAllFromIndex('leaveBalances', 'employeeId', employeeId);
    return balances.filter(b => b.year === year);
  },
  calculateBalance: async (employeeId, leaveTypeId, year) => {
    const db = await getDB();
    const balances = await db.getAllFromIndex('leaveBalances', 'employeeId', employeeId);
    const balance = balances.find(b => b.leaveTypeId === leaveTypeId && b.year === year);
    return balance ? balance.balance : 0;
  },
};
export const ctoRecordDB = {
  ...createHRModuleCRUD('ctoRecords'),
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('ctoRecords', 'employeeId', employeeId);
  },
  getActiveBalance: async (employeeId) => {
    const db = await getDB();
    const records = await db.getAllFromIndex('ctoRecords', 'employeeId', employeeId);
    const today = new Date().toISOString().split('T')[0];
    const activeRecords = records.filter(r =>
      r.status !== 'expired' &&
      (!r.expiryDate || r.expiryDate >= today)
    );
    return activeRecords.reduce((total, r) => total + (r.hoursEarned - r.hoursUsed), 0);
  },
};
export const leaveApprovalDB = {
  ...createHRModuleCRUD('leaveApprovals'),
  getByLeaveRequest: async (leaveRequestId) => {
    const db = await getDB();
    return db.getAllFromIndex('leaveApprovals', 'leaveRequestId', leaveRequestId);
  },
};

// Performance Management (Chapter 8)
export const appraisalPeriodDB = {
  ...createHRModuleCRUD('appraisalPeriods'),
  getActive: async () => {
    const db = await getDB();
    const periods = await db.getAll('appraisalPeriods');
    return periods.find(p => p.status === 'active');
  },
};
export const appraisalCriteriaDB = {
  ...createHRModuleCRUD('appraisalCriteria'),
  getActive: async () => {
    const db = await getDB();
    const criteria = await db.getAll('appraisalCriteria');
    return criteria.filter(c => c.isActive);
  },
};
export const performanceAppraisalDB = {
  ...createHRModuleCRUD('performanceAppraisals'),
  generateAppraisalId: async () => {
    const db = await getDB();
    const count = await db.count('performanceAppraisals');
    const year = new Date().getFullYear();
    return `PA-${year}-${String(count + 1).padStart(4, '0')}`;
  },
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('performanceAppraisals', 'employeeId', employeeId);
  },
  getByPeriod: async (periodId) => {
    const db = await getDB();
    return db.getAllFromIndex('performanceAppraisals', 'periodId', periodId);
  },
  getPendingAppraisals: async () => {
    const db = await getDB();
    const appraisals = await db.getAll('performanceAppraisals');
    return appraisals.filter(a => a.status !== 'completed');
  },
};
export const appraisalScoreDB = {
  ...createHRModuleCRUD('appraisalScores'),
  getByAppraisal: async (appraisalId) => {
    const db = await getDB();
    return db.getAllFromIndex('appraisalScores', 'appraisalId', appraisalId);
  },
};
export const pipDB = {
  ...createHRModuleCRUD('performanceImprovementPlans'),
  generatePipId: async () => {
    const db = await getDB();
    const count = await db.count('performanceImprovementPlans');
    const year = new Date().getFullYear();
    return `PIP-${year}-${String(count + 1).padStart(4, '0')}`;
  },
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('performanceImprovementPlans', 'employeeId', employeeId);
  },
  getActivePIPs: async () => {
    const db = await getDB();
    const pips = await db.getAll('performanceImprovementPlans');
    return pips.filter(p => p.status === 'active');
  },
};
export const pipGoalDB = {
  ...createHRModuleCRUD('pipGoals'),
  getByPIP: async (pipId) => {
    const db = await getDB();
    return db.getAllFromIndex('pipGoals', 'pipId', pipId);
  },
};
export const pipProgressReviewDB = {
  ...createHRModuleCRUD('pipProgressReviews'),
  getByPIP: async (pipId) => {
    const db = await getDB();
    return db.getAllFromIndex('pipProgressReviews', 'pipId', pipId);
  },
};

// Training & Development (Chapter 9)
export const trainingTypeDB = createHRModuleCRUD('trainingTypes');
export const trainingProgramDB = {
  ...createHRModuleCRUD('trainingPrograms'),
  generateProgramId: async () => {
    const db = await getDB();
    const count = await db.count('trainingPrograms');
    const year = new Date().getFullYear();
    return `TRN-${year}-${String(count + 1).padStart(4, '0')}`;
  },
  getUpcoming: async () => {
    const db = await getDB();
    const programs = await db.getAll('trainingPrograms');
    const today = new Date().toISOString().split('T')[0];
    return programs.filter(p => p.startDate > today && p.status === 'planned');
  },
};
export const trainingAttendanceDB = {
  ...createHRModuleCRUD('trainingAttendance'),
  getByProgram: async (programId) => {
    const db = await getDB();
    return db.getAllFromIndex('trainingAttendance', 'programId', programId);
  },
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('trainingAttendance', 'employeeId', employeeId);
  },
};
export const tnaDB = {
  ...createHRModuleCRUD('trainingNeedsAssessments'),
  generateTnaId: async () => {
    const db = await getDB();
    const count = await db.count('trainingNeedsAssessments');
    const year = new Date().getFullYear();
    return `TNA-${year}-${String(count + 1).padStart(4, '0')}`;
  },
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('trainingNeedsAssessments', 'employeeId', employeeId);
  },
  getByDepartment: async (departmentId) => {
    const db = await getDB();
    return db.getAllFromIndex('trainingNeedsAssessments', 'departmentId', departmentId);
  },
};
export const tnaItemDB = {
  ...createHRModuleCRUD('tnaItems'),
  getByTNA: async (tnaId) => {
    const db = await getDB();
    return db.getAllFromIndex('tnaItems', 'tnaId', tnaId);
  },
};
export const idpDB = {
  ...createHRModuleCRUD('individualDevelopmentPlans'),
  generateIdpId: async () => {
    const db = await getDB();
    const count = await db.count('individualDevelopmentPlans');
    const year = new Date().getFullYear();
    return `IDP-${year}-${String(count + 1).padStart(4, '0')}`;
  },
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('individualDevelopmentPlans', 'employeeId', employeeId);
  },
};
export const idpGoalDB = {
  ...createHRModuleCRUD('idpGoals'),
  getByIDP: async (idpId) => {
    const db = await getDB();
    return db.getAllFromIndex('idpGoals', 'idpId', idpId);
  },
};
export const trainingBondDB = {
  ...createHRModuleCRUD('trainingBonds'),
  generateBondId: async () => {
    const db = await getDB();
    const count = await db.count('trainingBonds');
    const year = new Date().getFullYear();
    return `BOND-${year}-${String(count + 1).padStart(4, '0')}`;
  },
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('trainingBonds', 'employeeId', employeeId);
  },
  getActiveBonds: async () => {
    const db = await getDB();
    const bonds = await db.getAll('trainingBonds');
    return bonds.filter(b => b.status === 'active');
  },
};

// Code of Conduct & Discipline (Chapter 10)
export const conductAcknowledgmentDB = {
  ...createHRModuleCRUD('conductAcknowledgments'),
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('conductAcknowledgments', 'employeeId', employeeId);
  },
};
export const pseaDeclarationDB = {
  ...createHRModuleCRUD('pseaDeclarations'),
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('pseaDeclarations', 'employeeId', employeeId);
  },
  getExpiring: async (daysAhead = 30) => {
    const db = await getDB();
    const declarations = await db.getAll('pseaDeclarations');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    return declarations.filter(d => new Date(d.validUntil) <= futureDate);
  },
};
export const coiDeclarationDB = {
  ...createHRModuleCRUD('coiDeclarations'),
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('coiDeclarations', 'employeeId', employeeId);
  },
};
export const disciplinaryTypeDB = createHRModuleCRUD('disciplinaryTypes');
export const disciplinaryActionDB = {
  ...createHRModuleCRUD('disciplinaryActions'),
  generateCaseNumber: async () => {
    const db = await getDB();
    const count = await db.count('disciplinaryActions');
    const year = new Date().getFullYear();
    return `DISC-${year}-${String(count + 1).padStart(4, '0')}`;
  },
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('disciplinaryActions', 'employeeId', employeeId);
  },
  getOpenCases: async () => {
    const db = await getDB();
    const cases = await db.getAll('disciplinaryActions');
    return cases.filter(c => c.status !== 'closed');
  },
};

// Grievance Mechanism (Chapter 12)
export const grievanceTypeDB = createHRModuleCRUD('grievanceTypes');
export const grievanceDB = {
  ...createHRModuleCRUD('grievances'),
  generateGrievanceNumber: async () => {
    const db = await getDB();
    const count = await db.count('grievances');
    const year = new Date().getFullYear();
    return `GRV-${year}-${String(count + 1).padStart(4, '0')}`;
  },
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('grievances', 'employeeId', employeeId);
  },
  getOpenGrievances: async () => {
    const db = await getDB();
    const grievances = await db.getAll('grievances');
    return grievances.filter(g => !['resolved', 'closed'].includes(g.status));
  },
};
export const grievanceInvestigationDB = {
  ...createHRModuleCRUD('grievanceInvestigations'),
  getByGrievance: async (grievanceId) => {
    const db = await getDB();
    return db.getAllFromIndex('grievanceInvestigations', 'grievanceId', grievanceId);
  },
};
export const grievanceResolutionDB = {
  ...createHRModuleCRUD('grievanceResolutions'),
  getByGrievance: async (grievanceId) => {
    const db = await getDB();
    return db.getAllFromIndex('grievanceResolutions', 'grievanceId', grievanceId);
  },
};

// Asset & ID Management (Chapter 13)
export const assetTypeDB = createHRModuleCRUD('assetTypes');
export const employeeAssetDB = {
  ...createHRModuleCRUD('employeeAssets'),
  generateAssetTag: async (assetTypeId) => {
    const db = await getDB();
    const count = await db.count('employeeAssets');
    const year = new Date().getFullYear();
    return `ASSET-${assetTypeId}-${year}-${String(count + 1).padStart(4, '0')}`;
  },
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('employeeAssets', 'employeeId', employeeId);
  },
  getAssignedAssets: async (employeeId) => {
    const db = await getDB();
    const assets = await db.getAllFromIndex('employeeAssets', 'employeeId', employeeId);
    return assets.filter(a => a.status === 'assigned');
  },
};
export const idCardDB = {
  ...createHRModuleCRUD('idCards'),
  generateCardNumber: async () => {
    const db = await getDB();
    const count = await db.count('idCards');
    const year = new Date().getFullYear();
    return `ID-${year}-${String(count + 1).padStart(4, '0')}`;
  },
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('idCards', 'employeeId', employeeId);
  },
  getExpiring: async (daysAhead = 30) => {
    const db = await getDB();
    const cards = await db.getAll('idCards');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    return cards.filter(c =>
      c.status === 'active' &&
      new Date(c.expiryDate) <= futureDate
    );
  },
};
export const simCardDB = {
  ...createHRModuleCRUD('simCards'),
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('simCards', 'employeeId', employeeId);
  },
  getActiveSims: async () => {
    const db = await getDB();
    const sims = await db.getAll('simCards');
    return sims.filter(s => s.status === 'active');
  },
};
export const employeeEmailDB = {
  ...createHRModuleCRUD('employeeEmails'),
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('employeeEmails', 'employeeId', employeeId);
  },
};

// Exit Management (Chapter 14)
export const separationTypeDB = createHRModuleCRUD('separationTypes');
export const separationRecordDB = {
  ...createHRModuleCRUD('separationRecords'),
  generateSeparationNumber: async () => {
    const db = await getDB();
    const count = await db.count('separationRecords');
    const year = new Date().getFullYear();
    return `SEP-${year}-${String(count + 1).padStart(4, '0')}`;
  },
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('separationRecords', 'employeeId', employeeId);
  },
  getPendingSeparations: async () => {
    const db = await getDB();
    const records = await db.getAll('separationRecords');
    return records.filter(r => r.status === 'pending' || r.status === 'in_clearance');
  },
};
export const exitClearanceDepartmentDB = createHRModuleCRUD('exitClearanceDepartments');
export const exitClearanceDB = {
  ...createHRModuleCRUD('exitClearances'),
  getBySeparation: async (separationId) => {
    const db = await getDB();
    return db.getAllFromIndex('exitClearances', 'separationId', separationId);
  },
  getPendingClearances: async (separationId) => {
    const db = await getDB();
    const clearances = await db.getAllFromIndex('exitClearances', 'separationId', separationId);
    return clearances.filter(c => c.status === 'pending');
  },
};
export const exitInterviewDB = {
  ...createHRModuleCRUD('exitInterviews'),
  getBySeparation: async (separationId) => {
    const db = await getDB();
    return db.getAllFromIndex('exitInterviews', 'separationId', separationId);
  },
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('exitInterviews', 'employeeId', employeeId);
  },
};
export const finalSettlementDB = {
  ...createHRModuleCRUD('finalSettlements'),
  generateSettlementNumber: async () => {
    const db = await getDB();
    const count = await db.count('finalSettlements');
    const year = new Date().getFullYear();
    return `SETTLE-${year}-${String(count + 1).padStart(4, '0')}`;
  },
  getBySeparation: async (separationId) => {
    const db = await getDB();
    return db.getAllFromIndex('finalSettlements', 'separationId', separationId);
  },
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('finalSettlements', 'employeeId', employeeId);
  },
};
export const workCertificateDB = {
  ...createHRModuleCRUD('workCertificates'),
  generateCertificateNumber: async () => {
    const db = await getDB();
    const count = await db.count('workCertificates');
    const year = new Date().getFullYear();
    return `CERT-${year}-${String(count + 1).padStart(4, '0')}`;
  },
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('workCertificates', 'employeeId', employeeId);
  },
};

// Official Trips (Chapter 16)
export const travelRequestDB = {
  ...createHRModuleCRUD('travelRequests'),
  generateRequestNumber: async () => {
    const db = await getDB();
    const count = await db.count('travelRequests');
    const year = new Date().getFullYear();
    return `TR-${year}-${String(count + 1).padStart(4, '0')}`;
  },
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('travelRequests', 'employeeId', employeeId);
  },
  getPendingRequests: async () => {
    const db = await getDB();
    const requests = await db.getAll('travelRequests');
    return requests.filter(r => r.status === 'pending');
  },
  getUpcomingTrips: async () => {
    const db = await getDB();
    const requests = await db.getAll('travelRequests');
    const today = new Date().toISOString().split('T')[0];
    return requests.filter(r => r.status === 'approved' && r.departureDate > today);
  },
};
export const travelApprovalDB = {
  ...createHRModuleCRUD('travelApprovals'),
  getByTravelRequest: async (travelRequestId) => {
    const db = await getDB();
    return db.getAllFromIndex('travelApprovals', 'travelRequestId', travelRequestId);
  },
};
export const dsaRateDB = {
  ...createHRModuleCRUD('dsaRates'),
  getActiveRates: async () => {
    const db = await getDB();
    const rates = await db.getAll('dsaRates');
    return rates.filter(r => r.isActive);
  },
  getRateForLocation: async (location) => {
    const db = await getDB();
    const rates = await db.getAll('dsaRates');
    return rates.find(r => r.location === location && r.isActive);
  },
};
export const dsaPaymentDB = {
  ...createHRModuleCRUD('dsaPayments'),
  generatePaymentNumber: async () => {
    const db = await getDB();
    const count = await db.count('dsaPayments');
    const year = new Date().getFullYear();
    return `DSA-${year}-${String(count + 1).padStart(4, '0')}`;
  },
  getByTravelRequest: async (travelRequestId) => {
    const db = await getDB();
    return db.getAllFromIndex('dsaPayments', 'travelRequestId', travelRequestId);
  },
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('dsaPayments', 'employeeId', employeeId);
  },
};
export const mahramTravelDB = {
  ...createHRModuleCRUD('mahramTravel'),
  getByTravelRequest: async (travelRequestId) => {
    const db = await getDB();
    return db.getAllFromIndex('mahramTravel', 'travelRequestId', travelRequestId);
  },
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('mahramTravel', 'employeeId', employeeId);
  },
};
export const workRelatedInjuryDB = {
  ...createHRModuleCRUD('workRelatedInjuries'),
  generateIncidentNumber: async () => {
    const db = await getDB();
    const count = await db.count('workRelatedInjuries');
    const year = new Date().getFullYear();
    return `INJ-${year}-${String(count + 1).padStart(4, '0')}`;
  },
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('workRelatedInjuries', 'employeeId', employeeId);
  },
  getOpenClaims: async () => {
    const db = await getDB();
    const injuries = await db.getAll('workRelatedInjuries');
    return injuries.filter(i => !['settled', 'rejected'].includes(i.status));
  },
};

// Staff Association (Chapter 17)
export const staffAssociationPositionDB = createHRModuleCRUD('staffAssociationPositions');
export const staffAssociationMemberDB = {
  ...createHRModuleCRUD('staffAssociationMembers'),
  getByEmployee: async (employeeId) => {
    const db = await getDB();
    return db.getAllFromIndex('staffAssociationMembers', 'employeeId', employeeId);
  },
  getActiveMembers: async () => {
    const db = await getDB();
    const members = await db.getAll('staffAssociationMembers');
    return members.filter(m => m.status === 'active');
  },
  getExecutiveCommittee: async () => {
    const db = await getDB();
    const members = await db.getAll('staffAssociationMembers');
    const positions = await db.getAll('staffAssociationPositions');
    const executivePositions = positions.filter(p => p.isExecutive).map(p => p.id);
    return members.filter(m =>
      m.status === 'active' &&
      executivePositions.includes(m.positionId)
    );
  },
};
export const associationMeetingDB = {
  ...createHRModuleCRUD('associationMeetings'),
  generateMeetingNumber: async () => {
    const db = await getDB();
    const count = await db.count('associationMeetings');
    const year = new Date().getFullYear();
    return `MTG-${year}-${String(count + 1).padStart(3, '0')}`;
  },
  getUpcomingMeetings: async () => {
    const db = await getDB();
    const meetings = await db.getAll('associationMeetings');
    const today = new Date().toISOString().split('T')[0];
    return meetings.filter(m => m.meetingDate >= today && m.status === 'scheduled');
  },
};
export const associationActivityDB = {
  ...createHRModuleCRUD('associationActivities'),
  getUpcomingActivities: async () => {
    const db = await getDB();
    const activities = await db.getAll('associationActivities');
    const today = new Date().toISOString().split('T')[0];
    return activities.filter(a => a.activityDate >= today && a.status !== 'cancelled');
  },
};
export const staffAssociationContributionDB = {
  ...createHRModuleCRUD('staffAssociationContributions'),
  getByMember: async (memberId) => {
    const db = await getDB();
    const contributions = await db.getAll('staffAssociationContributions');
    return contributions.filter(c => c.memberId === memberId);
  },
  getByPeriod: async (period) => {
    const db = await getDB();
    const contributions = await db.getAll('staffAssociationContributions');
    return contributions.filter(c => c.period === period);
  },
};
export const staffWelfareRequestDB = {
  ...createHRModuleCRUD('staffWelfareRequests'),
  getByMember: async (memberId) => {
    const db = await getDB();
    const requests = await db.getAll('staffWelfareRequests');
    return requests.filter(r => r.memberId === memberId);
  },
  getPending: async () => {
    const db = await getDB();
    const requests = await db.getAll('staffWelfareRequests');
    return requests.filter(r => r.status === 'pending');
  },
};
export const staffWelfarePaymentDB = {
  ...createHRModuleCRUD('staffWelfarePayments'),
  getByRequest: async (requestId) => {
    const db = await getDB();
    const payments = await db.getAll('staffWelfarePayments');
    return payments.filter(p => p.requestId === requestId);
  },
};

// Compliance & Audit (Chapter 15)
export const policyVersionDB = {
  ...createHRModuleCRUD('policyVersions'),
  getActivePolicy: async (policyName) => {
    const db = await getDB();
    const policies = await db.getAll('policyVersions');
    return policies.find(p => p.policyName === policyName && p.status === 'active');
  },
};
export const hrAuditLogDB = {
  ...createHRModuleCRUD('hrAuditLogs'),
  log: async (entityType, entityId, action, performedBy) => {
    const db = await getDB();
    const now = new Date().toISOString();
    const record = {
      entityType,
      entityId,
      action,
      performedBy,
      performedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.add('hrAuditLogs', record);
    return { ...record, id };
  },
  getByEntity: async (entityType, entityId) => {
    const db = await getDB();
    const logs = await db.getAll('hrAuditLogs');
    return logs.filter(l => l.entityType === entityType && l.entityId === entityId);
  },
  getByUser: async (performedBy) => {
    const db = await getDB();
    return db.getAllFromIndex('hrAuditLogs', 'performedBy', performedBy);
  },
};

// Initialize all default data
export const seedAllDefaults = async () => {
  try {
    // Try to access the database first
    const db = await getDB();

    // Check if all required stores exist
    const requiredStores = ['employees', 'departments', 'positions', 'offices', 'grades', 'employeeTypes', 'workSchedules', 'documentTypes', 'templateDocuments', 'users', 'roles', 'permissions', 'rolePermissions', 'attendance', 'leaveTypes', 'leaveRequests', 'jobRequisitions', 'candidates', 'interviews', 'jobOffers', 'payrollRecords', 'salaryComponents', 'vendors', 'itemCategories', 'purchaseRequests', 'rfqs', 'purchaseOrders', 'goodsReceipts', 'inventoryItems', 'contracts'];
    const missingStores = requiredStores.filter(store => !db.objectStoreNames.contains(store));

    if (missingStores.length > 0) {
      console.log('Missing stores detected, recreating database:', missingStores);
      await deleteAndRecreateDB();
    }

    // Seed in correct order (roles before users, permissions before rolePermissions)
    await departmentDB.seedDefaults();
    await positionDB.seedDefaults();
    await officeDB.seedDefaults();
    await gradeDB.seedDefaults();
    await employeeTypeDB.seedDefaults();
    await workScheduleDB.seedDefaults();
    await documentTypeDB.seedDefaults();
    await templateDocumentDB.seedDefaults();
    await roleDB.seedDefaults();
    await permissionDB.seedDefaults();
    await rolePermissionDB.seedDefaults();
    await userDB.seedDefaults();
    await employeeDB.seedDefaults();
    await leaveTypeDB.seedDefaults();
    await salaryComponentDB.seedDefaults();
    // Finance module defaults
    await donorDB.seedDefaults();
    await bankDB.seedDefaults();
    await budgetCategoryDB.seedDefaults();
    await projectDB.seedDefaults();
    // Compliance module defaults
    await complianceProjectDB.seedDefaults();
    await dueDiligenceDB.seedDefaults();
    // Procurement module defaults
    await vendorDB.seedDefaults();
    await itemCategoryDB.seedDefaults();
    await inventoryItemDB.seedDefaults();
    await purchaseRequestDB.seedDefaults();
    await purchaseOrderDB.seedDefaults();
  } catch (error) {
    // If it's a constraint error, data already exists - that's OK
    if (error.name === 'ConstraintError') {
      console.log('Seed data already exists, skipping...');
      return;
    }

    console.error('Error in seedAllDefaults:', error);

    // For other errors, try to recreate the database
    try {
      await deleteAndRecreateDB();

      // Retry seeding after recreation
      await departmentDB.seedDefaults();
      await positionDB.seedDefaults();
      await officeDB.seedDefaults();
      await gradeDB.seedDefaults();
      await employeeTypeDB.seedDefaults();
      await workScheduleDB.seedDefaults();
      await documentTypeDB.seedDefaults();
      await roleDB.seedDefaults();
      await permissionDB.seedDefaults();
      await rolePermissionDB.seedDefaults();
      await userDB.seedDefaults();
      await leaveTypeDB.seedDefaults();
      await salaryComponentDB.seedDefaults();
      // Finance module defaults
      await donorDB.seedDefaults();
      await bankDB.seedDefaults();
      await budgetCategoryDB.seedDefaults();
    } catch (retryError) {
      console.error('Failed to recreate database:', retryError);
      throw retryError;
    }
  }
};

// Clear all data from a specific store
export const clearStore = async (storeName) => {
  const db = await getDB();
  const tx = db.transaction(storeName, 'readwrite');
  await tx.store.clear();
  await tx.done;
};

// Clear all data from all stores
export const clearAllData = async () => {
  const db = await getDB();
  const storeNames = ['employees', 'departments', 'positions', 'offices', 'grades', 'users', 'roles', 'permissions', 'rolePermissions'];

  for (const storeName of storeNames) {
    if (db.objectStoreNames.contains(storeName)) {
      const tx = db.transaction(storeName, 'readwrite');
      await tx.store.clear();
      await tx.done;
    }
  }
};

export default {
  initDB,
  getDB,
  resetDB,
  deleteAndRecreateDB,
  employeeDB,
  departmentDB,
  positionDB,
  officeDB,
  gradeDB,
  userDB,
  roleDB,
  permissionDB,
  rolePermissionDB,
  attendanceDB,
  leaveTypeDB,
  leaveRequestDB,
  jobRequisitionDB,
  jobAnnouncementDB,
  candidateDB,
  interviewDB,
  jobOfferDB,
  salaryComponentDB,
  payrollDB,
  // Finance module
  donorDB,
  projectDB,
  bankDB,
  bankAccountDB,
  bankSignatoryDB,
  budgetCategoryDB,
  projectBudgetDB,
  budgetExpenditureDB,
  projectStaffCostDB,
  projectOperationalCostDB,
  cashRequestDB,
  cashRequestItemDB,
  installmentRequestDB,
  installmentReceiptDB,
  staffSalaryAllocationDB,
  donorReportingScheduleDB,
  governmentReportingDB,
  projectAmendmentDB,
  signatoryAssignmentDB,
  // Compliance module
  complianceProjectDB,
  complianceAmendmentDB,
  proposalDB,
  dueDiligenceDB,
  registrationDB,
  membershipDB,
  certificateDB,
  boardOfDirectorsDB,
  partnerDB,
  donorOutreachDB,
  govtOutreachDB,
  complianceDocumentDB,
  blacklistDB,
  seedAllDefaults,
};
