# VDO Payroll System Design
## Laravel + Livewire Implementation

---

## 1. Payroll Overview

### Salary Components
| Component | Type | Taxable | Description |
|-----------|------|---------|-------------|
| Basic Salary | Earning | Yes | Base monthly salary per grade |
| Transportation Allowance (TA) | Earning | Yes | Travel allowance |
| Overtime | Earning | Yes | Extra hours worked |
| Lunch Allowance | Earning | Yes | 2,000 AFN (deducted if provided) |
| Mahram Allowance | Earning | Yes | For female staff escorts |
| Top-up Card | Earning | Yes | Mobile/communication |
| DSA (Per Diem) | Earning | Yes | Daily subsistence for travel |
| Tax | Deduction | - | Progressive tax rates |
| Advance Recovery | Deduction | - | Salary advance repayment |
| Loan Recovery | Deduction | - | Employee loan repayment |
| Absence Deduction | Deduction | - | Unpaid leave/absence |
| Other Deductions | Deduction | - | Damages, fines, etc. |

### Tax Brackets (Afghanistan)
| Income Range (AFN/month) | Tax Rate |
|--------------------------|----------|
| 0 - 5,000 | 0% |
| 5,001 - 12,500 | 2% |
| 12,501 - 100,000 | 10% |
| Above 100,000 | 20% |

### Payment Methods
| Method | Use Case |
|--------|----------|
| Bank Transfer | Primary method for all staff |
| Cash | Remote locations, exceptional cases |
| Mobile Money | Field staff in some areas |

---

## 2. Process Workflows

### 2.1 Monthly Payroll Process (10 Steps)

```
Step 1: SALARY PAYMENT INITIATION
┌─────────────────────────────────────────────────────────────┐
│  HR Department (1st of month)                               │
│  - Initiate payroll cycle for the month                     │
│  - Set payroll period (start/end dates)                     │
│  - Notify all departments of deadlines                      │
│  - Lock previous month's attendance                         │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 2: KEY DOCUMENTS COLLECTION
┌─────────────────────────────────────────────────────────────┐
│  HR Department (1st - 5th)                                  │
│  Collect from all sources:                                  │
│  - Verified timesheets (from Leave module)                  │
│  - Overtime approvals                                       │
│  - New hire contracts                                       │
│  - Salary changes/promotions                                │
│  - Termination/separation records                           │
│  - Advance requests                                         │
│  - Loan deduction schedules                                 │
│  - Allowance changes                                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 3: MONTHLY TIMELINE OVERVIEW
┌─────────────────────────────────────────────────────────────┐
│  Timeline:                                                  │
│  Day 1-5:   Document collection                             │
│  Day 6-10:  HR payroll preparation                          │
│  Day 11-15: Finance review                                  │
│  Day 16-18: Management approval                             │
│  Day 19-20: Bank transfer processing                        │
│  Day 21-25: Payment confirmation                            │
│  Day 26-30: Tax reporting & reconciliation                  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 4: STEP-BY-STEP PAYROLL PROCESS
┌─────────────────────────────────────────────────────────────┐
│  For each employee:                                         │
│  1. Get basic salary from contract                          │
│  2. Calculate working days vs present days                  │
│  3. Pro-rate salary if not full month                       │
│  4. Add allowances (TA, overtime, etc.)                     │
│  5. Calculate gross salary                                  │
│  6. Apply tax calculation                                   │
│  7. Apply other deductions                                  │
│  8. Calculate net payable                                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 5: HR PAYROLL PREPARATION
┌─────────────────────────────────────────────────────────────┐
│  HR Department                                              │
│  - Generate payroll sheet with all employees                │
│  - Verify each employee's data                              │
│  - Cross-check with attendance records                      │
│  - Verify new joiners (pro-rata)                            │
│  - Verify separations (final settlement separate)           │
│  - Review and sign off                                      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 6: FINANCE REVIEW & PROCESSING
┌─────────────────────────────────────────────────────────────┐
│  Finance Department                                         │
│  - Verify payroll calculations                              │
│  - Check budget availability per project                    │
│  - Verify bank account details                              │
│  - Prepare payment vouchers                                 │
│  - Allocate costs to projects/donors                        │
│  - Sign off on payroll                                      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 7: FINAL APPROVAL (ED/DD)
┌─────────────────────────────────────────────────────────────┐
│  Executive Director / Deputy Director                       │
│  - Review total payroll amount                              │
│  - Verify against budget                                    │
│  - Approve for disbursement                                 │
│  - Sign payroll sheet                                       │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 8: SALARY DISBURSEMENT (BANK TRANSFER)
┌─────────────────────────────────────────────────────────────┐
│  Finance Department                                         │
│  - Prepare bank transfer file                               │
│  - Submit to bank                                           │
│  - Process transfers                                        │
│  - Receive confirmation                                     │
│  - Update payment status                                    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 9: CASH PAYMENTS (EXCEPTIONAL)
┌─────────────────────────────────────────────────────────────┐
│  Finance Department (for remote/exceptional cases)          │
│  - Prepare cash payment list                                │
│  - Get additional approval                                  │
│  - Disburse cash                                            │
│  - Collect signatures/receipts                              │
│  - Update records                                           │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 10: TAX DEDUCTION & REPORTING
┌─────────────────────────────────────────────────────────────┐
│  Finance Department                                         │
│  - Calculate total tax deducted                             │
│  - Prepare tax report                                       │
│  - Submit to tax authority                                  │
│  - Remit tax payments                                       │
│  - Archive records                                          │
│  - Generate payslips for employees                          │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Salary Calculation Formula

```
┌─────────────────────────────────────────────────────────────┐
│  EARNINGS                                                   │
│  ─────────────────────────────────────────────────────────  │
│  Pro-rated Salary = (Basic Salary / Working Days) × Present │
│  Transportation Allowance = Fixed or per day                │
│  Overtime = (Hourly Rate × 1.5) × Overtime Hours            │
│  Other Allowances = As per policy                           │
│                                                             │
│  GROSS SALARY = Pro-rated + TA + Overtime + Allowances      │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  DEDUCTIONS                                                 │
│  ─────────────────────────────────────────────────────────  │
│  Tax = Calculate based on tax brackets                      │
│  Advance Recovery = Monthly installment                     │
│  Loan Recovery = Monthly installment                        │
│  Absence Deduction = (Daily Rate × Unpaid Leave Days)       │
│  Other Deductions = As applicable                           │
│                                                             │
│  TOTAL DEDUCTIONS = Tax + Advances + Loans + Other          │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  NET SALARY = GROSS SALARY - TOTAL DEDUCTIONS               │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Tax Calculation Logic

```
function calculateTax(grossSalary) {
    tax = 0;

    if (grossSalary <= 5000) {
        tax = 0;
    } else if (grossSalary <= 12500) {
        tax = (grossSalary - 5000) * 0.02;
    } else if (grossSalary <= 100000) {
        tax = (7500 * 0.02) + (grossSalary - 12500) * 0.10;
    } else {
        tax = (7500 * 0.02) + (87500 * 0.10) + (grossSalary - 100000) * 0.20;
    }

    return round(tax);
}
```

---

## 3. Database Schema

### Core Tables

#### 3.1 `payroll_periods` (Monthly Payroll Cycles)
```sql
- id (PK)
- period_code (unique, e.g., '2025-01')
- period_name (e.g., 'January 2025')
- year (int)
- month (int)
- start_date (date)
- end_date (date)
- working_days (int)
- status (enum: 'draft', 'collecting', 'processing', 'hr_review',
         'finance_review', 'pending_approval', 'approved',
         'disbursing', 'completed', 'locked')
- initiated_by (FK -> users)
- initiated_at (datetime)
- hr_submitted_by (FK -> users, nullable)
- hr_submitted_at (datetime, nullable)
- finance_verified_by (FK -> users, nullable)
- finance_verified_at (datetime, nullable)
- approved_by (FK -> users, nullable)
- approved_at (datetime, nullable)
- disbursed_at (datetime, nullable)
- locked_at (datetime, nullable)
- total_gross (decimal, computed)
- total_deductions (decimal, computed)
- total_net (decimal, computed)
- total_employees (int, computed)
- notes (text, nullable)
- created_at
- updated_at
```

#### 3.2 `salary_structures` (Salary Components Configuration)
```sql
- id (PK)
- component_code (unique, e.g., 'BASIC', 'TA', 'OT')
- component_name
- component_type (enum: 'earning', 'deduction', 'employer_contribution')
- calculation_type (enum: 'fixed', 'percentage', 'formula', 'manual')
- calculation_base (enum: 'basic', 'gross', 'fixed_amount', nullable)
- default_amount (decimal, nullable)
- percentage_value (decimal, nullable)
- is_taxable (boolean, default true)
- is_recurring (boolean, default true)
- applicable_to (enum: 'all', 'core', 'project', 'specific')
- display_order (int)
- is_active (boolean, default true)
- created_at
- updated_at
```

#### 3.3 `employee_salary_details` (Employee Salary Info)
```sql
- id (PK)
- employee_id (FK -> employees)
- salary_grade_id (FK -> salary_grades)
- basic_salary (decimal)
- currency (enum: 'AFN', 'USD')
- payment_method (enum: 'bank_transfer', 'cash', 'mobile_money')
- bank_name (string, nullable)
- bank_branch (string, nullable)
- account_number (string, nullable)
- account_title (string, nullable)
- mobile_money_number (string, nullable)
- effective_from (date)
- effective_to (date, nullable)
- is_current (boolean, default true)
- created_at
- updated_at
```

#### 3.4 `employee_allowances` (Employee-specific Allowances)
```sql
- id (PK)
- employee_id (FK -> employees)
- salary_component_id (FK -> salary_structures)
- amount (decimal)
- currency (enum: 'AFN', 'USD')
- frequency (enum: 'monthly', 'one_time', 'per_day')
- effective_from (date)
- effective_to (date, nullable)
- is_active (boolean, default true)
- approved_by (FK -> users)
- remarks (text, nullable)
- created_at
- updated_at
```

#### 3.5 `payroll_entries` (Individual Payroll Records)
```sql
- id (PK)
- payroll_period_id (FK -> payroll_periods)
- employee_id (FK -> employees)
- department_id (FK -> departments)
- project_id (FK -> projects, nullable)
- salary_grade_id (FK -> salary_grades)
-- Basic Info
- basic_salary (decimal)
- working_days (int)
- present_days (decimal)
- absent_days (decimal)
- leave_days (decimal)
- overtime_hours (decimal)
-- Earnings
- prorated_salary (decimal)
- transportation_allowance (decimal, default 0)
- overtime_amount (decimal, default 0)
- other_allowances (decimal, default 0)
- gross_salary (decimal, computed)
-- Deductions
- tax_amount (decimal, default 0)
- advance_deduction (decimal, default 0)
- loan_deduction (decimal, default 0)
- absence_deduction (decimal, default 0)
- other_deductions (decimal, default 0)
- total_deductions (decimal, computed)
-- Net
- net_salary (decimal, computed)
- currency (enum: 'AFN', 'USD')
-- Status
- status (enum: 'draft', 'calculated', 'verified', 'approved', 'paid')
- payment_method (enum: 'bank_transfer', 'cash', 'mobile_money')
- payment_reference (string, nullable)
- paid_at (datetime, nullable)
- remarks (text, nullable)
- created_at
- updated_at
```

#### 3.6 `payroll_entry_details` (Itemized Earnings/Deductions)
```sql
- id (PK)
- payroll_entry_id (FK -> payroll_entries)
- salary_component_id (FK -> salary_structures)
- component_type (enum: 'earning', 'deduction')
- description (string)
- amount (decimal)
- is_taxable (boolean)
- remarks (text, nullable)
- created_at
- updated_at
```

#### 3.7 `salary_advances` (Advance Requests)
```sql
- id (PK)
- advance_number (unique)
- employee_id (FK -> employees)
- request_date (date)
- amount_requested (decimal)
- amount_approved (decimal, nullable)
- currency (enum: 'AFN', 'USD')
- reason (text)
- repayment_months (int)
- monthly_deduction (decimal, computed)
- status (enum: 'pending', 'approved', 'rejected', 'disbursed',
         'repaying', 'completed', 'written_off')
- approved_by (FK -> users, nullable)
- approved_at (datetime, nullable)
- disbursed_at (datetime, nullable)
- balance_remaining (decimal, default 0)
- created_at
- updated_at
```

#### 3.8 `advance_repayments` (Advance Recovery Tracking)
```sql
- id (PK)
- advance_id (FK -> salary_advances)
- payroll_entry_id (FK -> payroll_entries)
- repayment_number (int)
- amount (decimal)
- balance_before (decimal)
- balance_after (decimal)
- repayment_date (date)
- created_at
- updated_at
```

#### 3.9 `employee_loans` (Employee Loans)
```sql
- id (PK)
- loan_number (unique)
- employee_id (FK -> employees)
- loan_type (enum: 'personal', 'emergency', 'education', 'medical')
- principal_amount (decimal)
- interest_rate (decimal, default 0)
- total_amount (decimal)
- currency (enum: 'AFN', 'USD')
- tenure_months (int)
- monthly_installment (decimal)
- disbursement_date (date)
- first_deduction_month (string, e.g., '2025-02')
- status (enum: 'pending', 'approved', 'active', 'completed', 'defaulted')
- balance_remaining (decimal)
- approved_by (FK -> users)
- remarks (text, nullable)
- created_at
- updated_at
```

#### 3.10 `loan_repayments` (Loan Recovery Tracking)
```sql
- id (PK)
- loan_id (FK -> employee_loans)
- payroll_entry_id (FK -> payroll_entries)
- installment_number (int)
- principal_amount (decimal)
- interest_amount (decimal)
- total_amount (decimal)
- balance_before (decimal)
- balance_after (decimal)
- repayment_date (date)
- created_at
- updated_at
```

#### 3.11 `overtime_records` (Overtime Tracking)
```sql
- id (PK)
- employee_id (FK -> employees)
- date (date)
- regular_hours (decimal, default 8)
- overtime_hours (decimal)
- overtime_type (enum: 'regular', 'weekend', 'holiday')
- multiplier (decimal, default 1.5)
- reason (text)
- approved_by (FK -> users)
- approved_at (datetime)
- status (enum: 'pending', 'approved', 'rejected', 'processed')
- payroll_entry_id (FK -> payroll_entries, nullable)
- created_at
- updated_at
```

#### 3.12 `tax_records` (Monthly Tax Records)
```sql
- id (PK)
- payroll_period_id (FK -> payroll_periods)
- employee_id (FK -> employees)
- taxable_income (decimal)
- tax_amount (decimal)
- tax_bracket (string)
- calculation_details (json)
- created_at
- updated_at
```

#### 3.13 `tax_submissions` (Tax Authority Submissions)
```sql
- id (PK)
- payroll_period_id (FK -> payroll_periods)
- submission_date (date)
- total_taxable_income (decimal)
- total_tax_deducted (decimal)
- employee_count (int)
- submission_reference (string, nullable)
- payment_reference (string, nullable)
- payment_date (date, nullable)
- status (enum: 'pending', 'submitted', 'paid', 'confirmed')
- submitted_by (FK -> users)
- document_path (string, nullable)
- remarks (text, nullable)
- created_at
- updated_at
```

#### 3.14 `payslips` (Employee Payslips)
```sql
- id (PK)
- payslip_number (unique)
- payroll_entry_id (FK -> payroll_entries)
- employee_id (FK -> employees)
- period_month (int)
- period_year (int)
- generated_at (datetime)
- generated_by (FK -> users)
- document_path (string, nullable)
- emailed_at (datetime, nullable)
- downloaded_at (datetime, nullable)
- created_at
- updated_at
```

#### 3.15 `payroll_approvals` (Approval Audit Trail)
```sql
- id (PK)
- payroll_period_id (FK -> payroll_periods)
- approval_level (enum: 'hr', 'finance', 'management')
- approver_id (FK -> users)
- action (enum: 'submitted', 'approved', 'rejected', 'returned')
- comments (text, nullable)
- acted_at (datetime)
- created_at
```

#### 3.16 `bank_transfers` (Bank Payment Batches)
```sql
- id (PK)
- payroll_period_id (FK -> payroll_periods)
- batch_number (unique)
- bank_name (string)
- total_amount (decimal)
- currency (enum: 'AFN', 'USD')
- employee_count (int)
- file_path (string, nullable - bank file)
- submitted_to_bank_at (datetime, nullable)
- bank_reference (string, nullable)
- status (enum: 'pending', 'submitted', 'processing', 'completed', 'failed')
- processed_at (datetime, nullable)
- failure_reason (text, nullable)
- created_by (FK -> users)
- created_at
- updated_at
```

#### 3.17 `cash_payments` (Cash Disbursements)
```sql
- id (PK)
- payroll_entry_id (FK -> payroll_entries)
- payment_date (date)
- amount (decimal)
- currency (enum: 'AFN', 'USD')
- voucher_number (string)
- reason_for_cash (text)
- received_by_signature (string, nullable - path)
- witness_name (string, nullable)
- witness_signature (string, nullable)
- disbursed_by (FK -> users)
- verified_by (FK -> users, nullable)
- status (enum: 'pending', 'disbursed', 'verified')
- created_at
- updated_at
```

---

## 4. State Machines

### 4.1 Payroll Period Status Flow

```
        [DRAFT]
           │
           │ Initiate
           ▼
      [COLLECTING]
           │
           │ Documents ready
           ▼
      [PROCESSING]
           │
           │ Calculations done
           ▼
       [HR_REVIEW]
           │
           │ HR submits
           ▼
    [FINANCE_REVIEW]
           │
           │ Finance verifies
           ▼
   [PENDING_APPROVAL]
           │
           │ ED/DD approves
           ▼
       [APPROVED]
           │
           │ Start payments
           ▼
      [DISBURSING]
           │
           │ All paid
           ▼
      [COMPLETED]
           │
           │ Lock period
           ▼
        [LOCKED]
```

### 4.2 Payroll Entry Status Flow

```
     [DRAFT]
        │
        │ System calculates
        ▼
   [CALCULATED]
        │
        │ HR verifies
        ▼
    [VERIFIED]
        │
        │ Approved with period
        ▼
    [APPROVED]
        │
        │ Payment processed
        ▼
      [PAID]
```

### 4.3 Advance Status Flow

```
    [PENDING]
        │
   ┌────┴────┐
   │         │
   ▼         ▼
[APPROVED] [REJECTED]
   │
   │ Cash given
   ▼
[DISBURSED]
   │
   │ Deductions start
   ▼
[REPAYING]
   │
   │ Fully repaid
   ▼
[COMPLETED]
```

---

## 5. Business Rules

### 5.1 Payroll Calculation Rules

```php
// Rule 1: Pro-rata Salary
if (present_days < working_days) {
    daily_rate = basic_salary / working_days;
    prorated_salary = daily_rate * present_days;
} else {
    prorated_salary = basic_salary;
}

// Rule 2: Overtime Calculation
overtime_rate = (basic_salary / working_days / 8) * 1.5; // 1.5x for regular OT
overtime_amount = overtime_hours * overtime_rate;

// Weekend/Holiday OT
if (overtime_type == 'weekend' || overtime_type == 'holiday') {
    overtime_rate = overtime_rate * 2; // 2x multiplier
}

// Rule 3: Tax Calculation
taxable_income = prorated_salary + taxable_allowances;
tax = calculateTax(taxable_income);

// Rule 4: Advance Deduction
if (employee.has_active_advance) {
    advance = employee.active_advance;
    deduction = min(advance.monthly_deduction, advance.balance_remaining);
    advance.balance_remaining -= deduction;
}

// Rule 5: Net Salary Validation
net_salary = gross_salary - total_deductions;
if (net_salary < 0) {
    throw ValidationException("Net salary cannot be negative. Review deductions.");
}

// Rule 6: Minimum Net
minimum_net = basic_salary * 0.30; // At least 30% of basic
if (net_salary < minimum_net) {
    throw Warning("Net salary is less than 30% of basic. Requires approval.");
}
```

### 5.2 Advance Rules

```php
// Rule 1: Maximum Advance
max_advance = employee.basic_salary * 2; // Max 2 months salary
if (amount_requested > max_advance) {
    throw ValidationException("Maximum advance is 2 months salary");
}

// Rule 2: No Multiple Advances
if (employee.has_active_advance) {
    throw ValidationException("Cannot request new advance while previous is pending");
}

// Rule 3: Repayment Period
max_repayment_months = 6;
if (repayment_months > max_repayment_months) {
    throw ValidationException("Maximum repayment period is 6 months");
}

// Rule 4: Probation Check
if (employee.is_on_probation) {
    throw ValidationException("Advances not available during probation");
}
```

### 5.3 Payment Rules

```php
// Rule 1: Bank Transfer Default
if (!employee.bank_account) {
    payment_method = 'cash';
    require_cash_justification = true;
}

// Rule 2: Cash Payment Limit
cash_limit = 50000; // AFN
if (payment_method == 'cash' && net_salary > cash_limit) {
    require_additional_approval = true;
}

// Rule 3: Payment Verification
// Bank transfers must be verified within 3 days
// Cash payments require witness signature
```

---

## 6. API Endpoints (Laravel Routes)

```php
Route::prefix('api/payroll')->group(function () {

    // Payroll Periods
    Route::apiResource('periods', PayrollPeriodController::class);
    Route::prefix('periods/{id}')->group(function () {
        Route::post('initiate', [PayrollPeriodController::class, 'initiate']);
        Route::post('calculate-all', [PayrollPeriodController::class, 'calculateAll']);
        Route::post('hr-submit', [PayrollPeriodController::class, 'hrSubmit']);
        Route::post('finance-verify', [PayrollPeriodController::class, 'financeVerify']);
        Route::post('approve', [PayrollPeriodController::class, 'approve']);
        Route::post('disburse', [PayrollPeriodController::class, 'disburse']);
        Route::post('lock', [PayrollPeriodController::class, 'lock']);
        Route::get('summary', [PayrollPeriodController::class, 'summary']);
    });

    // Payroll Entries
    Route::apiResource('periods.entries', PayrollEntryController::class);
    Route::prefix('entries/{id}')->group(function () {
        Route::post('calculate', [PayrollEntryController::class, 'calculate']);
        Route::post('verify', [PayrollEntryController::class, 'verify']);
        Route::post('mark-paid', [PayrollEntryController::class, 'markPaid']);
    });

    // Salary Structures
    Route::apiResource('salary-structures', SalaryStructureController::class);
    Route::apiResource('salary-grades', SalaryGradeController::class);

    // Employee Salary
    Route::get('employees/{employee}/salary', [EmployeeSalaryController::class, 'show']);
    Route::post('employees/{employee}/salary', [EmployeeSalaryController::class, 'update']);
    Route::apiResource('employees.allowances', EmployeeAllowanceController::class);

    // Advances
    Route::apiResource('advances', AdvanceController::class);
    Route::post('advances/{id}/approve', [AdvanceController::class, 'approve']);
    Route::post('advances/{id}/reject', [AdvanceController::class, 'reject']);
    Route::post('advances/{id}/disburse', [AdvanceController::class, 'disburse']);
    Route::get('advances/pending', [AdvanceController::class, 'pending']);

    // Loans
    Route::apiResource('loans', LoanController::class);
    Route::post('loans/{id}/approve', [LoanController::class, 'approve']);
    Route::get('loans/{id}/schedule', [LoanController::class, 'repaymentSchedule']);

    // Overtime
    Route::apiResource('overtime', OvertimeController::class);
    Route::post('overtime/{id}/approve', [OvertimeController::class, 'approve']);
    Route::get('overtime/pending', [OvertimeController::class, 'pending']);

    // Payslips
    Route::get('payslips', [PayslipController::class, 'index']);
    Route::get('payslips/{id}/download', [PayslipController::class, 'download']);
    Route::post('payslips/generate/{periodId}', [PayslipController::class, 'generate']);
    Route::post('payslips/email/{periodId}', [PayslipController::class, 'emailAll']);

    // My Payroll (Employee)
    Route::prefix('my')->group(function () {
        Route::get('payslips', [MyPayrollController::class, 'payslips']);
        Route::get('salary', [MyPayrollController::class, 'salary']);
        Route::get('advances', [MyPayrollController::class, 'advances']);
        Route::post('advance-request', [MyPayrollController::class, 'requestAdvance']);
    });

    // Tax
    Route::get('tax/monthly/{periodId}', [TaxController::class, 'monthly']);
    Route::get('tax/annual/{year}', [TaxController::class, 'annual']);
    Route::post('tax/submit/{periodId}', [TaxController::class, 'submit']);

    // Bank Transfers
    Route::apiResource('bank-transfers', BankTransferController::class);
    Route::post('bank-transfers/{id}/generate-file', [BankTransferController::class, 'generateFile']);
    Route::post('bank-transfers/{id}/mark-completed', [BankTransferController::class, 'markCompleted']);

    // Cash Payments
    Route::apiResource('cash-payments', CashPaymentController::class);
    Route::post('cash-payments/{id}/verify', [CashPaymentController::class, 'verify']);

    // Reports
    Route::prefix('reports')->group(function () {
        Route::get('monthly/{periodId}', [PayrollReportController::class, 'monthly']);
        Route::get('department/{periodId}', [PayrollReportController::class, 'byDepartment']);
        Route::get('project/{periodId}', [PayrollReportController::class, 'byProject']);
        Route::get('annual/{year}', [PayrollReportController::class, 'annual']);
        Route::get('tax-summary/{year}', [PayrollReportController::class, 'taxSummary']);
        Route::get('variance', [PayrollReportController::class, 'variance']);
    });
});
```

---

## 7. Livewire Components Structure

```
app/Livewire/Payroll/
├── Dashboard.php                    # Payroll overview
├── Periods/
│   ├── PeriodList.php              # All payroll periods
│   ├── PeriodCreate.php            # Create new period
│   ├── PeriodProcess.php           # Process payroll
│   └── PeriodApproval.php          # Approval workflow
├── Entries/
│   ├── PayrollSheet.php            # Full payroll sheet
│   ├── EntryDetail.php             # Individual entry
│   ├── EntryEdit.php               # Edit entry
│   └── BulkActions.php             # Bulk operations
├── Salary/
│   ├── SalaryStructures.php        # Manage components
│   ├── SalaryGrades.php            # Manage grades
│   ├── EmployeeSalary.php          # Employee salary setup
│   └── AllowanceManager.php        # Manage allowances
├── Advances/
│   ├── AdvanceList.php             # All advances
│   ├── AdvanceRequest.php          # Request form
│   ├── AdvanceApproval.php         # Approve advances
│   └── AdvanceHistory.php          # Repayment history
├── Loans/
│   ├── LoanList.php                # All loans
│   ├── LoanForm.php                # Create/edit loan
│   └── LoanSchedule.php            # Repayment schedule
├── Overtime/
│   ├── OvertimeList.php            # All overtime records
│   ├── OvertimeEntry.php           # Enter overtime
│   └── OvertimeApproval.php        # Approve overtime
├── Payments/
│   ├── BankTransfers.php           # Bank payment batches
│   ├── CashPayments.php            # Cash disbursements
│   └── PaymentStatus.php           # Payment tracking
├── Payslips/
│   ├── PayslipList.php             # All payslips
│   ├── PayslipView.php             # View payslip
│   └── PayslipGenerate.php         # Generate payslips
├── Tax/
│   ├── TaxSummary.php              # Monthly tax summary
│   ├── TaxSubmission.php           # Submit to authority
│   └── TaxReports.php              # Tax reports
├── Employee/
│   ├── MyPayslips.php              # Employee's payslips
│   ├── MySalary.php                # View salary details
│   └── MyAdvanceRequest.php        # Request advance
└── Reports/
    ├── MonthlyReport.php           # Monthly payroll report
    ├── DepartmentReport.php        # By department
    ├── ProjectReport.php           # By project
    └── AnnualReport.php            # Year-end summary
```

---

## 8. Notifications & Alerts

| Event | Recipients | Channel |
|-------|------------|---------|
| Payroll period initiated | All departments | Email |
| Timesheet reminder | Employees, Managers | Email |
| Payroll ready for review | HR | Email |
| Payroll ready for finance | Finance | Email |
| Payroll pending approval | ED/DD | Email |
| Payroll approved | HR, Finance | Email |
| Salary credited | Employee | Email/SMS |
| Payslip available | Employee | Email |
| Advance approved | Employee | Email |
| Advance rejected | Employee | Email |
| Tax submission due | Finance | Email |
| Payment failed | Finance, HR | Email |

---

## 9. Integration Points

### 9.1 With Leave/Attendance Module
```php
// Get attendance data for payroll
$attendance = TimesheetService::getVerifiedTimesheet($employeeId, $month, $year);
$presentDays = $attendance->total_present_days;
$leaveDays = $attendance->total_leave_days;
$overtimeHours = $attendance->total_overtime_hours;
```

### 9.2 With Employee Module
```php
// Get employee salary info
$employee = Employee::with(['currentSalary', 'allowances', 'department', 'project'])->find($id);
$basicSalary = $employee->currentSalary->basic_salary;
$bankAccount = $employee->currentSalary->account_number;
```

### 9.3 With Exit Module
```php
// Final settlement (handled separately)
// Do not include in regular payroll
if ($employee->is_exiting && $employee->separation->status == 'settlement_pending') {
    // Process through Exit module, not regular payroll
    skip_regular_payroll($employee);
}
```

---

## 10. Form Fields Summary

### Payroll Entry
| Field | Type | Auto/Manual |
|-------|------|-------------|
| Employee ID | Text | Auto |
| Basic Salary | Number | Auto (from contract) |
| Working Days | Number | Auto (from period) |
| Present Days | Number | Auto (from timesheet) |
| Transportation Allowance | Number | Auto/Manual |
| Overtime Hours | Number | Auto (from overtime) |
| Overtime Amount | Number | Calculated |
| Gross Salary | Number | Calculated |
| Tax | Number | Calculated |
| Advance Deduction | Number | Auto |
| Other Deductions | Number | Manual |
| Net Salary | Number | Calculated |

### Advance Request
| Field | Type | Required |
|-------|------|----------|
| Amount Requested | Number | Yes |
| Reason | Textarea | Yes |
| Repayment Months | Select (1-6) | Yes |

---

## 11. Dashboard Metrics

### HR Dashboard
- Current payroll status
- Pending timesheets
- Pending overtime approvals
- Pending advance requests
- Employee count by payment method

### Finance Dashboard
- Total payroll amount
- Tax liability
- Bank transfers pending
- Cash payments pending
- Budget vs actual by project

### Employee Dashboard
- Current month salary status
- Payslip availability
- Advance balance
- Loan balance
- Year-to-date earnings
