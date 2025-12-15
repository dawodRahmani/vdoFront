# VDO Leave Management System Design
## Laravel + Livewire Implementation

---

## 1. Leave Management Overview

### Components
1. **Attendance Tracking** - Daily time in/out, working hours
2. **Leave Request & Approval** - Employee requests, manager/HR approval
3. **Leave Balance Management** - Entitlements, accruals, deductions
4. **Leave Types** - Various leave categories with rules
5. **Holidays Management** - Official/public holidays
6. **Officer in Charge (OIC)** - Delegation during absence
7. **Reports & Analytics** - Leave tracking, attendance reports

### Leave Types (From SOP)

| Leave Type | Days/Year | Accrual | Carryover | Documentation |
|------------|-----------|---------|-----------|---------------|
| Annual Leave | 20 days | 1.67/month | Yes (max 10) | Leave form |
| Sick Leave | 10 days | Full at start | No | Medical certificate (3+ days) |
| Maternity Leave | 90 days | One-time | No | Medical proof |
| Paternity Leave | 3 days | One-time | No | Birth certificate |
| Mourning/Bereavement | 3-7 days | Per event | No | Death certificate |
| Haj Leave | 20 days | Once in service | No | Haj permit |
| Compensatory Time Off | Varies | Earned | Limited | Pre-approval |
| Leave Without Pay | Varies | N/A | N/A | Special approval |
| Urgent/Emergency | 3 days | Per year | No | Post-documentation |
| Work From Home | Varies | N/A | N/A | Manager approval |

---

## 2. Process Workflows

### 2.1 Leave Request Workflow (Standard)

```
[EMPLOYEE]                    [LINE MANAGER]              [HR]
    |                              |                        |
    | 1. Submit Leave Request      |                        |
    |----------------------------->|                        |
    |                              |                        |
    |     2. Review Request        |                        |
    |     - Check team schedule    |                        |
    |     - Assign OIC if needed   |                        |
    |                              |                        |
    |     3a. Approve              |                        |
    |     -------------------------|----------------------->|
    |                              |                        |
    |     3b. Reject (with reason) |                        |
    |<-----------------------------|                        |
    |                              |                        |
    |                              |    4. Verify Balance   |
    |                              |    5. Confirm/Reject   |
    |<----------------------------------------------------------
    |                              |                        |
    | 6. Leave Taken               |                        |
    |                              |                        |
    | 7. Return from Leave         |                        |
    |----------------------------->|----------------------->|
    |                              |    8. Update Records   |
```

### 2.2 Emergency Leave Workflow

```
[EMPLOYEE]                    [LINE MANAGER]              [HR]
    |                              |                        |
    | 1. Notify (call/SMS)         |                        |
    |----------------------------->|                        |
    |                              |                        |
    |     2. Verbal Approval       |                        |
    |<-----------------------------|                        |
    |                              |                        |
    | 3. Take Emergency Leave      |                        |
    |                              |                        |
    | 4. Submit Form (within 3 days after return)           |
    |----------------------------->|----------------------->|
    |                              |                        |
    |                              |    5. Regularize       |
    |<----------------------------------------------------------
```

### 2.3 Attendance Tracking Workflow

```
Daily Flow:
┌─────────────────────────────────────────────────────────────┐
│  8:30 AM                                        4:30 PM     │
│     │                                              │        │
│     ▼                                              ▼        │
│  [Clock In]  ──────── Working Day ────────────  [Clock Out] │
│     │                                              │        │
│     └──────────────────────────────────────────────┘        │
│                         │                                   │
│                         ▼                                   │
│              [Calculate Working Hours]                      │
│                         │                                   │
│         ┌───────────────┼───────────────┐                   │
│         ▼               ▼               ▼                   │
│    [Full Day]     [Half Day]      [Overtime]                │
│     (8 hrs)      (< 4 hrs)       (> 8 hrs)                  │
└─────────────────────────────────────────────────────────────┘

Monthly Consolidation:
┌─────────────────────────────────────────────────────────────┐
│  End of Month                                               │
│        │                                                    │
│        ▼                                                    │
│  [Generate Timesheet]                                       │
│        │                                                    │
│        ├──► Working Days Count                              │
│        ├──► Leave Days (by type)                            │
│        ├──► Overtime Hours                                  │
│        └──► Absences (unexplained)                          │
│                    │                                        │
│                    ▼                                        │
│         [Employee Signature]                                │
│                    │                                        │
│                    ▼                                        │
│         [Manager Approval]                                  │
│                    │                                        │
│                    ▼                                        │
│         [HR Verification]                                   │
│                    │                                        │
│                    ▼                                        │
│         [Send to Payroll]                                   │
└─────────────────────────────────────────────────────────────┘
```

### 2.4 Leave Balance Calculation

```
Annual Leave Accrual (Monthly):
┌────────────────────────────────────────────────────────────┐
│  Monthly Accrual = 20 days / 12 months = 1.67 days/month   │
│                                                            │
│  Available Balance = Carried Forward                       │
│                    + Accrued This Year                     │
│                    - Used This Year                        │
│                    - Pending Requests                      │
│                                                            │
│  Max Carryover = 10 days (expires end of Q1 next year)     │
└────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema

### Core Tables

#### 3.1 `leave_types` (Leave Categories)
```sql
- id (PK)
- code (unique, e.g., 'ANNUAL', 'SICK', 'MATERNITY')
- name
- name_dari (nullable)
- name_pashto (nullable)
- description (text)
- days_per_year (int, nullable - null means unlimited/varies)
- accrual_type (enum: 'yearly', 'monthly', 'one_time', 'earned', 'none')
- accrual_rate (decimal, nullable - days per month)
- max_carryover_days (int, default 0)
- carryover_expiry_months (int, nullable)
- requires_documentation (boolean)
- documentation_type (string, nullable - e.g., 'medical_certificate')
- min_days_advance_notice (int, default 0)
- max_consecutive_days (int, nullable)
- applicable_gender (enum: 'all', 'male', 'female')
- requires_approval_levels (int, default 1 - 1=manager, 2=manager+HR)
- is_paid (boolean, default true)
- is_active (boolean, default true)
- created_at
- updated_at
```

#### 3.2 `leave_policies` (Policy Configuration)
```sql
- id (PK)
- fiscal_year (int, e.g., 2025)
- leave_type_id (FK -> leave_types)
- employee_type (enum: 'core', 'project', 'consultant', 'all')
- entitlement_days (int)
- accrual_start_month (int, default 1)
- probation_eligible (boolean, default false)
- probation_days_allowed (int, default 0)
- min_service_months (int, default 0 - months before eligible)
- max_instances_per_year (int, nullable)
- half_day_allowed (boolean, default true)
- weekend_counted (boolean, default false)
- holiday_counted (boolean, default false)
- notes (text, nullable)
- is_active (boolean, default true)
- created_at
- updated_at
```

#### 3.3 `employee_leave_balances` (Leave Entitlements per Employee)
```sql
- id (PK)
- employee_id (FK -> employees)
- leave_type_id (FK -> leave_types)
- fiscal_year (int)
- opening_balance (decimal, default 0)
- carried_forward (decimal, default 0)
- accrued (decimal, default 0)
- adjustment (decimal, default 0 - manual adjustments)
- used (decimal, default 0)
- pending (decimal, default 0 - approved but not taken)
- available (decimal, computed: opening + carried + accrued + adjustment - used - pending)
- last_accrual_date (date, nullable)
- created_at
- updated_at

-- Unique constraint: (employee_id, leave_type_id, fiscal_year)
```

#### 3.4 `leave_requests` (Leave Applications)
```sql
- id (PK)
- request_number (unique, e.g., 'LR-2025-00001')
- employee_id (FK -> employees)
- leave_type_id (FK -> leave_types)
- start_date (date)
- end_date (date)
- start_half_day (boolean, default false - morning/afternoon)
- end_half_day (boolean, default false)
- total_days (decimal, computed)
- reason (text)
- emergency_contact_name (string, nullable)
- emergency_contact_relationship (string, nullable)
- emergency_contact_phone (string, nullable)
- oic_employee_id (FK -> employees, nullable - Officer in Charge)
- oic_approved (boolean, nullable)
- attachment_path (string, nullable - medical cert, etc.)
- status (enum: 'draft', 'pending_manager', 'pending_hr',
         'approved', 'rejected', 'cancelled', 'taken', 'completed')
- rejection_reason (text, nullable)
- manager_id (FK -> employees)
- manager_approved_at (datetime, nullable)
- manager_comments (text, nullable)
- hr_verified_by (FK -> users, nullable)
- hr_verified_at (datetime, nullable)
- hr_comments (text, nullable)
- is_emergency (boolean, default false)
- regularized (boolean, default true - false for emergency)
- regularized_at (datetime, nullable)
- created_at
- updated_at
```

#### 3.5 `leave_request_days` (Individual Days in Request)
```sql
- id (PK)
- leave_request_id (FK -> leave_requests)
- date (date)
- day_type (enum: 'full', 'half_morning', 'half_afternoon')
- is_weekend (boolean)
- is_holiday (boolean)
- counted (boolean, default true - whether counts against balance)
- created_at
- updated_at
```

#### 3.6 `leave_approvals` (Approval Trail)
```sql
- id (PK)
- leave_request_id (FK -> leave_requests)
- approver_id (FK -> users)
- approval_level (int - 1=manager, 2=HR, 3=ED)
- action (enum: 'approved', 'rejected', 'returned', 'escalated')
- comments (text, nullable)
- acted_at (datetime)
- created_at
```

#### 3.7 `holidays` (Public/Official Holidays)
```sql
- id (PK)
- name
- name_dari (nullable)
- name_pashto (nullable)
- date (date)
- holiday_type (enum: 'national', 'religious', 'organizational')
- is_recurring (boolean, default false)
- recurring_month (int, nullable)
- recurring_day (int, nullable)
- applies_to_locations (json, nullable - null means all)
- fiscal_year (int)
- is_active (boolean, default true)
- created_at
- updated_at
```

#### 3.8 `attendance_records` (Daily Attendance)
```sql
- id (PK)
- employee_id (FK -> employees)
- date (date)
- clock_in_time (time, nullable)
- clock_out_time (time, nullable)
- clock_in_method (enum: 'manual', 'biometric', 'system')
- clock_out_method (enum: 'manual', 'biometric', 'system')
- scheduled_hours (decimal, default 8)
- actual_hours (decimal, nullable, computed)
- overtime_hours (decimal, default 0)
- status (enum: 'present', 'absent', 'leave', 'holiday',
         'weekend', 'half_day', 'work_from_home', 'official_travel')
- leave_request_id (FK -> leave_requests, nullable)
- remarks (text, nullable)
- verified_by (FK -> users, nullable)
- verified_at (datetime, nullable)
- created_at
- updated_at

-- Unique constraint: (employee_id, date)
```

#### 3.9 `timesheets` (Monthly Timesheets)
```sql
- id (PK)
- employee_id (FK -> employees)
- month (int, 1-12)
- year (int)
- project_id (FK -> projects, nullable)
- location (string)
- total_working_days (int)
- total_present_days (int)
- total_absent_days (int)
- total_leave_days (decimal)
- total_annual_leave (decimal)
- total_sick_leave (decimal)
- total_other_leave (decimal)
- total_holidays (int)
- total_weekends (int)
- total_overtime_hours (decimal)
- total_wfh_days (int)
- employee_signature_path (string, nullable)
- employee_signed_at (datetime, nullable)
- manager_id (FK -> employees)
- manager_approved (boolean, default false)
- manager_approved_at (datetime, nullable)
- hr_verified (boolean, default false)
- hr_verified_by (FK -> users, nullable)
- hr_verified_at (datetime, nullable)
- status (enum: 'draft', 'submitted', 'manager_approved',
         'hr_verified', 'sent_to_payroll')
- sent_to_payroll_at (datetime, nullable)
- created_at
- updated_at

-- Unique constraint: (employee_id, month, year)
```

#### 3.10 `oic_assignments` (Officer in Charge)
```sql
- id (PK)
- leave_request_id (FK -> leave_requests)
- absent_employee_id (FK -> employees)
- oic_employee_id (FK -> employees)
- start_date (date)
- end_date (date)
- responsibilities (text, nullable)
- oic_accepted (boolean, nullable)
- oic_accepted_at (datetime, nullable)
- status (enum: 'pending', 'accepted', 'declined', 'active', 'completed')
- created_at
- updated_at
```

#### 3.11 `leave_adjustments` (Manual Balance Adjustments)
```sql
- id (PK)
- employee_id (FK -> employees)
- leave_type_id (FK -> leave_types)
- fiscal_year (int)
- adjustment_type (enum: 'credit', 'debit')
- days (decimal)
- reason (text)
- reference_document (string, nullable)
- adjusted_by (FK -> users)
- approved_by (FK -> users, nullable)
- status (enum: 'pending', 'approved', 'rejected')
- created_at
- updated_at
```

#### 3.12 `leave_carryover_records` (Annual Carryover)
```sql
- id (PK)
- employee_id (FK -> employees)
- leave_type_id (FK -> leave_types)
- from_year (int)
- to_year (int)
- eligible_days (decimal)
- carried_days (decimal)
- forfeited_days (decimal)
- expiry_date (date, nullable)
- processed_by (FK -> users)
- processed_at (datetime)
- created_at
- updated_at
```

---

## 4. State Machines

### 4.1 Leave Request Status Flow

```
                        [DRAFT]
                           |
                           | Submit
                           v
                   [PENDING_MANAGER]
                           |
           +---------------+---------------+
           |                               |
           v                               v
      [REJECTED]                    [PENDING_HR]
           |                               |
           |               +---------------+---------------+
           |               |                               |
           |               v                               v
           |         [REJECTED]                      [APPROVED]
           |               |                               |
           |               |                               v
           |               |                    Employee takes leave
           |               |                               |
           |               |                               v
           |               |                          [TAKEN]
           |               |                               |
           |               |                               v (Return date)
           |               |                        [COMPLETED]
           |               |                               |
           v               v                               v
      [Can resubmit if draft] <----------------------------|
```

### 4.2 Timesheet Status Flow

```
    [DRAFT]
       |
       | Employee submits
       v
   [SUBMITTED]
       |
       | Manager reviews
       v
[MANAGER_APPROVED]
       |
       | HR verifies
       v
  [HR_VERIFIED]
       |
       | Process for payroll
       v
[SENT_TO_PAYROLL]
```

### 4.3 OIC Assignment Status Flow

```
   [PENDING]
       |
       | OIC responds
       +---------------+
       |               |
       v               v
  [ACCEPTED]      [DECLINED]
       |               |
       v               | (Find alternative)
   [ACTIVE]            |
       |               |
       v               |
  [COMPLETED] <--------+
```

---

## 5. Business Rules

### 5.1 Leave Request Rules

```php
// Rule 1: Advance Notice
if (leave_type.min_days_advance_notice > 0) {
    days_until_start = start_date - today;
    if (days_until_start < leave_type.min_days_advance_notice && !is_emergency) {
        throw ValidationException("Minimum {min_days} days advance notice required");
    }
}

// Rule 2: Balance Check
available_balance = get_available_balance(employee, leave_type, fiscal_year);
if (total_days > available_balance) {
    throw ValidationException("Insufficient leave balance. Available: {available_balance} days");
}

// Rule 3: Consecutive Days Limit
if (leave_type.max_consecutive_days && total_days > leave_type.max_consecutive_days) {
    throw ValidationException("Maximum {max_days} consecutive days allowed");
}

// Rule 4: Probation Check
if (employee.is_on_probation && !leave_policy.probation_eligible) {
    throw ValidationException("Leave not available during probation period");
}

// Rule 5: Gender-specific Leave
if (leave_type.applicable_gender != 'all' &&
    leave_type.applicable_gender != employee.gender) {
    throw ValidationException("This leave type is not applicable to you");
}

// Rule 6: Documentation Required
if (leave_type.requires_documentation &&
    total_days >= leave_type.documentation_threshold &&
    !attachment_path) {
    throw ValidationException("{documentation_type} required for {total_days}+ days");
}

// Rule 7: Weekend/Holiday Handling
foreach (day in date_range(start_date, end_date)) {
    if (is_weekend(day) && !leave_policy.weekend_counted) {
        skip_day(day);
    }
    if (is_holiday(day) && !leave_policy.holiday_counted) {
        skip_day(day);
    }
}
```

### 5.2 Attendance Rules

```php
// Rule 1: Working Hours
STANDARD_HOURS = 8;
HALF_DAY_THRESHOLD = 4;

if (actual_hours >= STANDARD_HOURS) {
    status = 'present';
} else if (actual_hours >= HALF_DAY_THRESHOLD) {
    status = 'half_day';
} else if (actual_hours > 0) {
    status = 'present'; // with late/early note
} else {
    status = 'absent';
}

// Rule 2: Overtime
if (actual_hours > STANDARD_HOURS) {
    overtime_hours = actual_hours - STANDARD_HOURS;
    // Overtime requires prior approval
}

// Rule 3: Late Arrival
GRACE_PERIOD_MINUTES = 15;
scheduled_start = '08:30';

if (clock_in_time > scheduled_start + GRACE_PERIOD_MINUTES) {
    mark_as_late(minutes_late);
}

// Rule 4: Auto-leave Marking
// If employee has approved leave for a day, auto-mark attendance
if (has_approved_leave(employee, date)) {
    attendance.status = 'leave';
    attendance.leave_request_id = leave_request.id;
}
```

### 5.3 Accrual Rules

```php
// Monthly Accrual Job (run on 1st of each month)
foreach (employee in active_employees) {
    foreach (leave_type in accrual_leave_types) {
        if (leave_type.accrual_type == 'monthly') {
            balance = get_balance(employee, leave_type, current_year);
            balance.accrued += leave_type.accrual_rate;
            balance.last_accrual_date = today;
            balance.save();
        }
    }
}

// Year-end Carryover Job (run on fiscal year end)
foreach (employee in active_employees) {
    foreach (leave_type in leave_types_with_carryover) {
        balance = get_balance(employee, leave_type, current_year);
        unused = balance.available;

        carryover = min(unused, leave_type.max_carryover_days);
        forfeited = unused - carryover;

        create_carryover_record(employee, leave_type, carryover, forfeited);

        // Create next year balance
        new_balance = create_balance(employee, leave_type, next_year);
        new_balance.carried_forward = carryover;
        new_balance.save();
    }
}
```

---

## 6. API Endpoints (Laravel Routes)

```php
Route::prefix('api/leave')->group(function () {

    // Leave Types & Policies
    Route::apiResource('types', LeaveTypeController::class);
    Route::apiResource('policies', LeavePolicyController::class);

    // Employee Balances
    Route::get('balances', [LeaveBalanceController::class, 'index']);
    Route::get('balances/{employee}', [LeaveBalanceController::class, 'show']);
    Route::get('balances/{employee}/history', [LeaveBalanceController::class, 'history']);
    Route::post('balances/adjust', [LeaveBalanceController::class, 'adjust']);
    Route::post('balances/carryover', [LeaveBalanceController::class, 'processCarryover']);

    // Leave Requests
    Route::apiResource('requests', LeaveRequestController::class);
    Route::post('requests/{id}/submit', [LeaveRequestController::class, 'submit']);
    Route::post('requests/{id}/cancel', [LeaveRequestController::class, 'cancel']);
    Route::get('requests/pending', [LeaveRequestController::class, 'pending']);
    Route::get('requests/calendar', [LeaveRequestController::class, 'calendar']);

    // Approvals
    Route::post('requests/{id}/approve', [LeaveApprovalController::class, 'approve']);
    Route::post('requests/{id}/reject', [LeaveApprovalController::class, 'reject']);
    Route::post('requests/{id}/return', [LeaveApprovalController::class, 'returnForRevision']);
    Route::get('approvals/pending', [LeaveApprovalController::class, 'pendingApprovals']);

    // OIC
    Route::post('requests/{id}/assign-oic', [OicController::class, 'assign']);
    Route::post('oic/{id}/accept', [OicController::class, 'accept']);
    Route::post('oic/{id}/decline', [OicController::class, 'decline']);

    // Holidays
    Route::apiResource('holidays', HolidayController::class);
    Route::get('holidays/year/{year}', [HolidayController::class, 'byYear']);

    // Attendance
    Route::prefix('attendance')->group(function () {
        Route::post('clock-in', [AttendanceController::class, 'clockIn']);
        Route::post('clock-out', [AttendanceController::class, 'clockOut']);
        Route::get('today', [AttendanceController::class, 'today']);
        Route::get('employee/{employee}', [AttendanceController::class, 'byEmployee']);
        Route::get('date/{date}', [AttendanceController::class, 'byDate']);
        Route::post('manual-entry', [AttendanceController::class, 'manualEntry']);
        Route::post('bulk-import', [AttendanceController::class, 'bulkImport']);
    });

    // Timesheets
    Route::apiResource('timesheets', TimesheetController::class);
    Route::post('timesheets/{id}/submit', [TimesheetController::class, 'submit']);
    Route::post('timesheets/{id}/manager-approve', [TimesheetController::class, 'managerApprove']);
    Route::post('timesheets/{id}/hr-verify', [TimesheetController::class, 'hrVerify']);
    Route::post('timesheets/{id}/send-to-payroll', [TimesheetController::class, 'sendToPayroll']);
    Route::get('timesheets/generate/{month}/{year}', [TimesheetController::class, 'generate']);

    // Reports
    Route::prefix('reports')->group(function () {
        Route::get('leave-summary', [LeaveReportController::class, 'summary']);
        Route::get('attendance-summary', [LeaveReportController::class, 'attendanceSummary']);
        Route::get('department/{department}', [LeaveReportController::class, 'byDepartment']);
        Route::get('employee/{employee}/yearly', [LeaveReportController::class, 'employeeYearly']);
        Route::get('absenteeism', [LeaveReportController::class, 'absenteeismReport']);
    });
});
```

---

## 7. Livewire Components Structure

```
app/Livewire/Leave/
├── Dashboard.php                    # Leave management overview
├── LeaveCalendar.php               # Visual calendar view
├── MyLeave/
│   ├── Balance.php                 # Employee's leave balances
│   ├── RequestForm.php             # Submit leave request
│   ├── MyRequests.php              # Employee's request history
│   └── EmergencyRequest.php        # Emergency leave form
├── Approvals/
│   ├── PendingApprovals.php        # Manager's approval queue
│   ├── ApprovalForm.php            # Approve/reject form
│   └── ApprovalHistory.php         # Past approvals
├── Attendance/
│   ├── ClockInOut.php              # Clock in/out widget
│   ├── DailyAttendance.php         # Daily attendance list
│   ├── AttendanceCalendar.php      # Calendar view
│   └── ManualEntry.php             # Manual attendance entry
├── Timesheets/
│   ├── MyTimesheet.php             # Employee's timesheet
│   ├── TimesheetApproval.php       # Manager timesheet approval
│   └── TimesheetList.php           # HR timesheet management
├── Admin/
│   ├── LeaveTypes.php              # Manage leave types
│   ├── LeavePolicies.php           # Policy configuration
│   ├── Holidays.php                # Holiday management
│   ├── Balances/
│   │   ├── BalanceOverview.php     # All employee balances
│   │   ├── AdjustmentForm.php      # Balance adjustment
│   │   └── CarryoverProcess.php    # Year-end carryover
│   └── Reports/
│       ├── LeaveReport.php         # Leave reports
│       └── AttendanceReport.php    # Attendance reports
└── Widgets/
    ├── LeaveBalanceCard.php        # Balance summary card
    ├── UpcomingLeaves.php          # Team upcoming leaves
    └── AttendanceStatus.php        # Today's attendance status
```

---

## 8. Notifications & Alerts

### Email/SMS Triggers

| Event | Recipients | Channel |
|-------|------------|---------|
| Leave Request Submitted | Manager | Email |
| Leave Approved by Manager | Employee, HR | Email |
| Leave Approved by HR | Employee | Email/SMS |
| Leave Rejected | Employee | Email |
| Leave Starting Tomorrow | Employee, Manager | Email |
| Employee Returned from Leave | HR | System |
| Low Leave Balance (< 3 days) | Employee | Email |
| Pending Approval > 2 days | Manager | Email |
| Timesheet Due | Employee | Email |
| Timesheet Overdue | Employee, Manager | Email |
| Attendance Not Recorded | Employee | Push |

---

## 9. Integration Points

### 9.1 With Payroll Module
```php
// Send verified timesheets to payroll
interface PayrollIntegration {
    sendTimesheet(Timesheet $timesheet): void;
    getLeaveDaysForPayroll(Employee $employee, int $month, int $year): array;
}

// Payroll needs:
// - Total working days
// - Leave days (paid vs unpaid)
// - Overtime hours
// - Absences (for deductions)
```

### 9.2 With Employee Module
```php
// Get employee info
interface EmployeeIntegration {
    getManager(Employee $employee): Employee;
    getDepartmentEmployees(Department $department): Collection;
    isOnProbation(Employee $employee): bool;
    getJoiningDate(Employee $employee): Carbon;
}
```

### 9.3 With Recruitment Module
```php
// New employee onboarding
interface RecruitmentIntegration {
    onEmployeeHired(Employee $employee): void;
    // Initialize leave balances based on joining date
    // Pro-rate annual leave for partial year
}
```

---

## 10. Sample Queries

### Get Employee Leave Balance
```php
$balance = EmployeeLeaveBalance::where('employee_id', $employeeId)
    ->where('leave_type_id', $leaveTypeId)
    ->where('fiscal_year', $currentYear)
    ->first();

$available = $balance->opening_balance
           + $balance->carried_forward
           + $balance->accrued
           + $balance->adjustment
           - $balance->used
           - $balance->pending;
```

### Get Team Leave Calendar
```php
$teamLeaves = LeaveRequest::whereIn('employee_id', $teamMemberIds)
    ->whereIn('status', ['approved', 'taken'])
    ->whereBetween('start_date', [$startDate, $endDate])
    ->orWhereBetween('end_date', [$startDate, $endDate])
    ->with('employee', 'leaveType')
    ->get();
```

### Calculate Working Days in Period
```php
$workingDays = 0;
$period = CarbonPeriod::create($startDate, $endDate);

foreach ($period as $date) {
    if (!$date->isWeekend() && !$this->isHoliday($date)) {
        $workingDays++;
    }
}
```

---

## 11. Key Form Fields Summary

### Leave Request Form
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Employee Name | Auto | Yes | From logged-in user |
| Designation | Auto | Yes | From employee record |
| Department | Auto | Yes | From employee record |
| Line Manager | Auto | Yes | From reporting structure |
| Leave Type | Select | Yes | Active leave types |
| Start Date | Date | Yes | >= Today (unless emergency) |
| End Date | Date | Yes | >= Start Date |
| Total Days | Computed | Yes | Auto-calculated |
| Emergency Contact Name | Text | Yes | Required by policy |
| Emergency Contact Relationship | Text | Yes | |
| Emergency Contact Phone | Phone | Yes | |
| Reason | Textarea | Yes | |
| OIC (Officer in Charge) | Select | No | If required |
| Attachment | File | Conditional | Based on leave type |

### Attendance Entry
| Field | Type | Required |
|-------|------|----------|
| Employee | Select | Yes |
| Date | Date | Yes |
| Clock In | Time | Yes |
| Clock Out | Time | Yes |
| Remarks | Text | No |

---

## 12. Dashboard Metrics

### Employee Dashboard
- Current leave balances (all types)
- Upcoming approved leaves
- Pending requests status
- Attendance this month
- Days worked vs target

### Manager Dashboard
- Pending approval count
- Team on leave today
- Team upcoming leaves (7 days)
- Attendance alerts
- Timesheet status

### HR Dashboard
- Organization-wide leave summary
- Pending HR approvals
- Low balance alerts
- Absenteeism trends
- Carryover status (year-end)
