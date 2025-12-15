# VDO Exit & Termination System Design
## Laravel + Livewire Implementation

---

## 1. Exit & Termination Overview

### Types of Separation
| Type | Initiated By | Notice Period | Certificate | Final Settlement |
|------|--------------|---------------|-------------|------------------|
| **Resignation** | Employee | 7-30 days | Yes (if eligible) | Full |
| **Contract Expiry** | Natural | N/A | Yes | Full |
| **Project End** | Organization | As per contract | Yes | Full |
| **Termination Without Cause** | Organization | As per contract | Yes | Full |
| **Termination With Cause** | Organization | Immediate | No | Restricted |
| **Probation Not Passed** | Organization | Immediate | No | Pro-rata |
| **Retirement** | Employee | 30 days | Yes | Full + Benefits |

### Exit Eligibility for Work Certificate
| Condition | Certificate Issued |
|-----------|-------------------|
| Completed probation + good standing | Yes |
| Resigned with proper notice | Yes |
| Contract ended naturally | Yes |
| Terminated without cause | Yes |
| Terminated with cause (misconduct) | No |
| Probation failed | No |
| Absconded / No notice | No |

---

## 2. Process Workflows

### 2.1 Resignation Process (12 Steps)

```
Step 1: SUBMISSION OF RESIGNATION LETTER
┌─────────────────────────────────────────────────────────────┐
│  Employee                                                   │
│  - Submit written resignation letter                        │
│  - State reason for leaving                                 │
│  - Propose last working day                                 │
│  - Submit to Line Manager                                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 2: APPROVAL OR REJECTION OF RESIGNATION
┌─────────────────────────────────────────────────────────────┐
│  Line Manager + HR + Management                             │
│  - Review resignation request                               │
│  - Verify notice period compliance                          │
│  - Attempt retention (if desired)                           │
│  - Accept or negotiate last working date                    │
│  - Forward to HR for processing                             │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 3: EXIT CHECKLIST ISSUANCE
┌─────────────────────────────────────────────────────────────┐
│  HR Department                                              │
│  - Issue exit/clearance checklist to employee               │
│  - Explain clearance process                                │
│  - Set deadlines for each department                        │
│  - Notify all relevant departments                          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 4: CIRCULATION OF CLEARANCE REQUESTS
┌─────────────────────────────────────────────────────────────┐
│  HR Department                                              │
│  - Send clearance requests to:                              │
│    • ICT Department                                         │
│    • Admin & Logistics                                      │
│    • Finance Department                                     │
│    • Supervisor/Department                                  │
│    • Security (if applicable)                               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 5: ICT OFFBOARDING
┌─────────────────────────────────────────────────────────────┐
│  ICT Department                                             │
│  - Collect laptop/computer                                  │
│  - Collect mobile devices (if issued)                       │
│  - Deactivate email account                                 │
│  - Revoke system access                                     │
│  - Backup employee data                                     │
│  - Sign clearance form                                      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 6: ADMIN & LOGISTICS CLEARANCE
┌─────────────────────────────────────────────────────────────┐
│  Admin Department                                           │
│  - Collect ID card                                          │
│  - Collect office keys/access cards                         │
│  - Collect any office equipment                             │
│  - Verify no outstanding advances                           │
│  - Sign clearance form                                      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 7: SUPERVISOR CLEARANCE
┌─────────────────────────────────────────────────────────────┐
│  Line Manager / Supervisor                                  │
│  - Verify work handover completed                           │
│  - Confirm knowledge transfer done                          │
│  - Collect any project documents/files                      │
│  - Verify no pending deliverables                           │
│  - Sign clearance form                                      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 8: EXIT INTERVIEW
┌─────────────────────────────────────────────────────────────┐
│  HR Department                                              │
│  - Schedule exit interview                                  │
│  - Discuss reasons for leaving                              │
│  - Gather feedback on:                                      │
│    • Work environment                                       │
│    • Management & supervision                               │
│    • Compensation & benefits                                │
│    • Growth opportunities                                   │
│  - Check for compliance/safeguarding issues                 │
│  - Document findings                                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 9: FINAL HR CLEARANCE
┌─────────────────────────────────────────────────────────────┐
│  HR Department                                              │
│  - Verify all department clearances received                │
│  - Check no outstanding leave advances                      │
│  - Verify training bond completion (if any)                 │
│  - Update employee status to 'exiting'                      │
│  - Sign final HR clearance                                  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 10: FINAL SETTLEMENT CALCULATION
┌─────────────────────────────────────────────────────────────┐
│  HR + Finance Department                                    │
│  Calculate:                                                 │
│  (+) Salary for days worked in final month                  │
│  (+) Unused annual leave encashment                         │
│  (+) Any pending allowances/reimbursements                  │
│  (+) Gratuity/severance (if applicable)                     │
│  (-) Outstanding advances                                   │
│  (-) Training bond recovery (if applicable)                 │
│  (-) Tax deductions                                         │
│  (-) Any damages/losses                                     │
│  (=) Net payable amount                                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 11: FINAL PAYMENT DISBURSEMENT
┌─────────────────────────────────────────────────────────────┐
│  Finance Department                                         │
│  - Prepare payment voucher                                  │
│  - Get approval from ED/DD                                  │
│  - Process bank transfer or cash payment                    │
│  - Issue payment receipt                                    │
│  - Update finance records                                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 12: WORK CERTIFICATE / EXPERIENCE LETTER
┌─────────────────────────────────────────────────────────────┐
│  HR Department                                              │
│  - Verify eligibility for certificate                       │
│  - Prepare work certificate with:                           │
│    • Employment dates                                       │
│    • Position(s) held                                       │
│    • Brief description of duties                            │
│  - Get authorized signature                                 │
│  - Issue to employee                                        │
│  - Archive in personnel file                                │
│  - Mark separation as complete                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Termination Without Cause

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: NOTICE OF TERMINATION                              │
│  - Issue termination notice (as per contract)               │
│  - State reason (budget, project end, restructuring)        │
│  - Specify last working date                                │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2: EXIT CHECKLIST                                     │
│  - Same as resignation process                              │
│  - All clearances required                                  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 3: CLEARANCE & FINAL SETTLEMENT                       │
│  - Full settlement including notice period pay              │
│  - All entitled benefits                                    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4: CERTIFICATE ISSUED                                 │
│  - Work certificate provided                                │
│  - Reference available                                      │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Termination With Cause (Misconduct)

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: WARNING DOCUMENTATION                              │
│  - Verbal warning (documented)                              │
│  - First written warning                                    │
│  - Final written warning                                    │
│  - OR immediate termination for gross misconduct            │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2: FORMAL TERMINATION LETTER                          │
│  - State specific cause/violation                           │
│  - Reference warning history                                │
│  - Immediate effect                                         │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 3: NO CERTIFICATE                                     │
│  - Work certificate NOT issued                              │
│  - No reference provided                                    │
│  - Noted in personnel file                                  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4: FINAL SETTLEMENT (RESTRICTED)                      │
│  - Only earned salary paid                                  │
│  - No leave encashment (policy dependent)                   │
│  - Deductions for damages if applicable                     │
│  - No gratuity/severance                                    │
└─────────────────────────────────────────────────────────────┘
```

### 2.4 Contract Expiry / Project End

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: END OF CONTRACT NOTIFICATION                       │
│  - Notify 30 days before contract end                       │
│  - Confirm non-renewal (if applicable)                      │
│  - Thank employee for service                               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2-3: EXIT CHECKLIST & EXIT INTERVIEW                  │
│  - Standard clearance process                               │
│  - Conduct exit interview                                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4: FINAL SETTLEMENT                                   │
│  - Full entitlements                                        │
│  - Leave encashment                                         │
│  - Any end-of-contract benefits                             │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 5: CERTIFICATE ISSUED                                 │
│  - Work certificate provided                                │
│  - Positive reference available                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema

### Core Tables

#### 3.1 `separations` (Main Separation Record)
```sql
- id (PK)
- separation_number (unique, e.g., 'SEP-2025-00001')
- employee_id (FK -> employees)
- separation_type (enum: 'resignation', 'contract_expiry', 'project_end',
                   'termination_without_cause', 'termination_with_cause',
                   'probation_failed', 'retirement', 'death', 'absconding')
- initiated_by (enum: 'employee', 'organization')
- request_date (date)
- proposed_last_day (date)
- approved_last_day (date, nullable)
- actual_last_day (date, nullable)
- notice_period_days (int)
- notice_served (boolean, default false)
- reason_category (enum: 'better_opportunity', 'personal', 'career_change',
                   'relocation', 'education', 'compensation', 'management',
                   'workload', 'project_closure', 'budget', 'misconduct',
                   'performance', 'restructuring', 'retirement', 'other')
- reason_details (text, nullable)
- resignation_letter_path (string, nullable)
- termination_letter_path (string, nullable)
- status (enum: 'pending_approval', 'approved', 'rejected', 'withdrawn',
         'clearance_pending', 'exit_interview', 'settlement_pending',
         'payment_pending', 'completed', 'cancelled')
- approved_by (FK -> users, nullable)
- approved_at (datetime, nullable)
- approval_comments (text, nullable)
- eligible_for_certificate (boolean, default true)
- eligible_for_rehire (boolean, default true)
- created_at
- updated_at
```

#### 3.2 `separation_clearances` (Clearance Tracking)
```sql
- id (PK)
- separation_id (FK -> separations)
- department (enum: 'ict', 'admin', 'finance', 'supervisor', 'hr', 'security')
- department_name (string)
- assigned_to (FK -> users)
- items_to_clear (json - list of items)
- items_cleared (json - list with status)
- outstanding_amount (decimal, default 0)
- outstanding_items (text, nullable)
- remarks (text, nullable)
- status (enum: 'pending', 'in_progress', 'cleared', 'issues_found')
- cleared_by (FK -> users, nullable)
- cleared_at (datetime, nullable)
- signature_path (string, nullable)
- created_at
- updated_at
```

#### 3.3 `clearance_items` (Individual Clearance Items)
```sql
- id (PK)
- clearance_id (FK -> separation_clearances)
- item_name (string, e.g., 'Laptop', 'ID Card', 'Office Keys')
- item_category (enum: 'equipment', 'document', 'access', 'financial', 'other')
- asset_tag (string, nullable - for equipment)
- is_returned (boolean, default false)
- return_condition (enum: 'good', 'damaged', 'missing', nullable)
- damage_amount (decimal, default 0)
- return_date (date, nullable)
- received_by (FK -> users, nullable)
- remarks (text, nullable)
- created_at
- updated_at
```

#### 3.4 `exit_interviews` (Exit Interview Records)
```sql
- id (PK)
- separation_id (FK -> separations)
- interview_date (datetime)
- conducted_by (FK -> users)
- interview_type (enum: 'in_person', 'phone', 'video', 'written')
-- Reasons for Leaving
- primary_reasons (json - array of selected reasons)
- reason_details (text, nullable)
-- Work Experience Ratings (1-5)
- rating_job_satisfaction (int, nullable)
- rating_supervision (int, nullable)
- rating_workload (int, nullable)
- rating_training (int, nullable)
- rating_environment (int, nullable)
- rating_teamwork (int, nullable)
- rating_communication_dept (int, nullable)
- rating_communication_org (int, nullable)
- rating_compensation (int, nullable)
- rating_job_clarity (int, nullable)
- rating_decision_making (int, nullable)
- rating_growth_opportunities (int, nullable)
- rating_security (int, nullable)
- overall_rating_average (decimal, computed)
-- Supervisor Feedback
- supervisor_relationship (text, nullable)
- work_valued (text, nullable)
- support_received (text, nullable)
-- Organization Feedback
- liked_most (text, nullable)
- liked_least (text, nullable)
- improvement_suggestions (text, nullable)
-- Recommendations
- hr_process_recommendations (text, nullable)
- management_recommendations (text, nullable)
- program_recommendations (text, nullable)
- compliance_recommendations (text, nullable)
-- Signatures
- employee_signature_path (string, nullable)
- hr_signature_path (string, nullable)
- supervisor_signature_path (string, nullable)
- status (enum: 'scheduled', 'completed', 'declined', 'skipped')
- created_at
- updated_at
```

#### 3.5 `exit_compliance_checks` (Zero Tolerance / Compliance)
```sql
- id (PK)
- exit_interview_id (FK -> exit_interviews)
- check_area (enum: 'pseah', 'safeguarding', 'child_protection',
              'harassment', 'discrimination', 'fraud', 'corruption',
              'confidentiality', 'data_privacy')
- policies_explained (boolean, nullable)
- felt_safe (boolean, nullable)
- issue_witnessed (boolean, nullable)
- issue_experienced (boolean, nullable)
- issue_details (text, nullable)
- requires_followup (boolean, default false)
- followup_notes (text, nullable)
- created_at
- updated_at
```

#### 3.6 `exit_interview_summaries` (HR Analysis)
```sql
- id (PK)
- exit_interview_id (FK -> exit_interviews)
- reporting_period (string)
- prepared_by (FK -> users)
- preparation_date (date)
-- Summary Sections
- positive_aspects (text, nullable)
- negative_aspects (text, nullable)
- compliance_summary (text, nullable)
- supervisor_assessment (text, nullable)
-- HR Analysis
- exit_category (enum: 'voluntary', 'involuntary', 'project_closure',
                 'budget_constraint', 'performance_related')
- risk_level (enum: 'low', 'medium', 'high')
- risk_explanation (text, nullable)
-- Recommendations
- org_improvements (text, nullable)
- team_improvements (text, nullable)
- policy_improvements (text, nullable)
-- Actions
- immediate_actions (json - array of actions)
- hr_signature_path (string, nullable)
- created_at
- updated_at
```

#### 3.7 `final_settlements` (Settlement Calculation)
```sql
- id (PK)
- separation_id (FK -> separations)
- settlement_number (unique)
- calculation_date (date)
- prepared_by (FK -> users)
-- Earnings
- salary_days_worked (int)
- salary_amount (decimal)
- leave_days_encashable (decimal)
- leave_encashment_amount (decimal)
- pending_allowances (decimal, default 0)
- pending_reimbursements (decimal, default 0)
- gratuity_amount (decimal, default 0)
- severance_amount (decimal, default 0)
- other_earnings (decimal, default 0)
- other_earnings_details (text, nullable)
- total_earnings (decimal, computed)
-- Deductions
- outstanding_advances (decimal, default 0)
- training_bond_recovery (decimal, default 0)
- asset_damage_charges (decimal, default 0)
- other_deductions (decimal, default 0)
- other_deductions_details (text, nullable)
- tax_deduction (decimal, default 0)
- total_deductions (decimal, computed)
-- Net Amount
- net_payable (decimal, computed)
- currency (enum: 'AFN', 'USD')
-- Approvals
- hr_verified (boolean, default false)
- hr_verified_by (FK -> users, nullable)
- hr_verified_at (datetime, nullable)
- finance_verified (boolean, default false)
- finance_verified_by (FK -> users, nullable)
- finance_verified_at (datetime, nullable)
- approved_by (FK -> users, nullable)
- approved_at (datetime, nullable)
- status (enum: 'draft', 'pending_hr', 'pending_finance',
         'pending_approval', 'approved', 'paid', 'cancelled')
- created_at
- updated_at
```

#### 3.8 `settlement_payments` (Payment Records)
```sql
- id (PK)
- settlement_id (FK -> final_settlements)
- payment_reference (unique)
- payment_date (date)
- payment_method (enum: 'bank_transfer', 'cash', 'check')
- bank_name (string, nullable)
- account_number (string, nullable)
- amount_paid (decimal)
- currency (enum: 'AFN', 'USD')
- payment_voucher_number (string, nullable)
- payment_voucher_path (string, nullable)
- receipt_path (string, nullable)
- processed_by (FK -> users)
- verified_by (FK -> users, nullable)
- remarks (text, nullable)
- status (enum: 'pending', 'processed', 'verified', 'failed')
- created_at
- updated_at
```

#### 3.9 `work_certificates` (Experience Letters)
```sql
- id (PK)
- separation_id (FK -> separations)
- certificate_number (unique)
- employee_id (FK -> employees)
- employee_name (string)
- position_title (string)
- department (string)
- employment_start_date (date)
- employment_end_date (date)
- duties_summary (text, nullable)
- certificate_type (enum: 'work_certificate', 'experience_letter',
                    'service_certificate')
- issue_date (date)
- issued_by (FK -> users)
- signatory_name (string)
- signatory_title (string)
- signature_path (string, nullable)
- certificate_path (string, nullable)
- status (enum: 'draft', 'issued', 'revoked')
- created_at
- updated_at
```

#### 3.10 `termination_records` (For Cause Terminations)
```sql
- id (PK)
- separation_id (FK -> separations)
- termination_type (enum: 'immediate', 'with_notice')
- cause_category (enum: 'misconduct', 'policy_violation', 'performance',
                  'fraud', 'harassment', 'insubordination', 'absence',
                  'breach_of_contract', 'criminal', 'other')
- cause_details (text)
- warning_history (json - array of warning references)
- investigation_reference (string, nullable)
- investigation_summary (text, nullable)
- termination_date (date)
- termination_letter_date (date)
- termination_letter_path (string, nullable)
- appeal_allowed (boolean, default true)
- appeal_deadline (date, nullable)
- appeal_received (boolean, default false)
- appeal_outcome (enum: 'upheld', 'overturned', 'modified', nullable)
- recommended_by (FK -> users)
- approved_by (FK -> users)
- employee_notified_at (datetime, nullable)
- employee_acknowledged (boolean, default false)
- remarks (text, nullable)
- created_at
- updated_at
```

#### 3.11 `handover_records` (Work Handover)
```sql
- id (PK)
- separation_id (FK -> separations)
- handover_to_employee_id (FK -> employees, nullable)
- handover_to_name (string, nullable - if external/TBD)
- handover_start_date (date)
- handover_end_date (date)
- status (enum: 'pending', 'in_progress', 'completed')
- supervisor_verified (boolean, default false)
- supervisor_verified_at (datetime, nullable)
- notes (text, nullable)
- created_at
- updated_at
```

#### 3.12 `handover_items` (Handover Details)
```sql
- id (PK)
- handover_id (FK -> handover_records)
- item_type (enum: 'project', 'task', 'document', 'system_access',
            'contact', 'knowledge', 'other')
- item_name (string)
- description (text)
- priority (enum: 'high', 'medium', 'low')
- handover_status (enum: 'pending', 'in_progress', 'completed')
- handover_date (date, nullable)
- notes (text, nullable)
- created_at
- updated_at
```

#### 3.13 `separation_history` (Status Audit Trail)
```sql
- id (PK)
- separation_id (FK -> separations)
- from_status (string)
- to_status (string)
- changed_by (FK -> users)
- change_reason (text, nullable)
- changed_at (datetime)
- created_at
```

---

## 4. State Machines

### 4.1 Separation Status Flow

```
                     [PENDING_APPROVAL]
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
         [REJECTED]    [WITHDRAWN]   [APPROVED]
                                         │
                                         ▼
                              [CLEARANCE_PENDING]
                                         │
                          ┌──────────────┴──────────────┐
                          │                             │
                          ▼                             │
                   [EXIT_INTERVIEW]                     │
                          │                             │
                          └──────────────┬──────────────┘
                                         │
                                         ▼
                              [SETTLEMENT_PENDING]
                                         │
                                         ▼
                               [PAYMENT_PENDING]
                                         │
                                         ▼
                                  [COMPLETED]
```

### 4.2 Clearance Status Flow (Per Department)

```
     [PENDING]
         │
         │ Assigned to department
         ▼
    [IN_PROGRESS]
         │
    ┌────┴────┐
    │         │
    ▼         ▼
[CLEARED] [ISSUES_FOUND]
              │
              │ Resolution
              ▼
          [CLEARED]
```

### 4.3 Final Settlement Status Flow

```
     [DRAFT]
        │
        │ HR prepares
        ▼
   [PENDING_HR]
        │
        │ HR verifies
        ▼
 [PENDING_FINANCE]
        │
        │ Finance verifies
        ▼
[PENDING_APPROVAL]
        │
        │ ED/DD approves
        ▼
    [APPROVED]
        │
        │ Payment processed
        ▼
      [PAID]
```

---

## 5. Business Rules

### 5.1 Resignation Rules

```php
// Rule 1: Notice Period
notice_required = employee.contract.notice_period_days; // Default 30 for core, 7 for project
proposed_notice = proposed_last_day - today;

if (proposed_notice < notice_required) {
    // Short notice - calculate deduction
    short_days = notice_required - proposed_notice;
    deduction = (salary / 30) * short_days;
    add_to_settlement_deductions(deduction, 'short_notice');
}

// Rule 2: Probation Resignation
if (employee.is_on_probation) {
    notice_required = 0; // Immediate resignation allowed
}

// Rule 3: Resignation Withdrawal
if (separation.status in ['pending_approval', 'approved']) {
    if (today < separation.approved_last_day - 7) {
        allow_withdrawal();
    } else {
        // Too late to withdraw
        throw ValidationException("Withdrawal deadline passed");
    }
}
```

### 5.2 Clearance Rules

```php
// Rule 1: All Departments Must Clear
required_departments = ['ict', 'admin', 'finance', 'supervisor', 'hr'];
if (employee.has_security_access) {
    required_departments.push('security');
}

foreach (dept in required_departments) {
    clearance = get_clearance(separation, dept);
    if (clearance.status != 'cleared') {
        cannot_proceed_to_settlement();
    }
}

// Rule 2: Outstanding Amounts
total_outstanding = sum(clearances.outstanding_amount);
if (total_outstanding > 0) {
    add_to_settlement_deductions(total_outstanding, 'outstanding_clearance');
}

// Rule 3: Asset Damage
foreach (item in clearance_items) {
    if (item.return_condition == 'damaged') {
        add_to_settlement_deductions(item.damage_amount, 'asset_damage');
    }
    if (item.return_condition == 'missing') {
        add_to_settlement_deductions(item.replacement_cost, 'missing_asset');
    }
}
```

### 5.3 Settlement Calculation Rules

```php
// Rule 1: Leave Encashment
if (separation_type in ['resignation', 'contract_expiry', 'termination_without_cause']) {
    unused_leave = employee.leave_balance.annual;
    if (unused_leave > 0) {
        daily_rate = monthly_salary / 30;
        leave_encashment = unused_leave * daily_rate;
    }
}

// Rule 2: Gratuity (if policy allows)
if (employee.tenure_years >= gratuity_eligibility_years) {
    gratuity = calculate_gratuity(employee);
}

// Rule 3: Training Bond
if (employee.has_active_training_bond) {
    bond = employee.training_bond;
    if (bond.end_date > today) {
        remaining_months = months_between(today, bond.end_date);
        recovery = (bond.total_cost / bond.duration_months) * remaining_months;
        add_to_deductions(recovery, 'training_bond');
    }
}

// Rule 4: Termination With Cause
if (separation_type == 'termination_with_cause') {
    // No leave encashment
    leave_encashment = 0;
    // No gratuity
    gratuity = 0;
    // Only earned salary
}
```

### 5.4 Certificate Eligibility Rules

```php
// Rule 1: Basic Eligibility
eligible = true;

if (separation_type == 'termination_with_cause') {
    eligible = false;
    reason = 'Terminated for misconduct';
}

if (separation_type == 'probation_failed') {
    eligible = false;
    reason = 'Probation not completed';
}

if (separation_type == 'absconding') {
    eligible = false;
    reason = 'Left without notice';
}

// Rule 2: Minimum Service
if (employee.tenure_months < 3) {
    eligible = false;
    reason = 'Minimum service period not completed';
}

// Rule 3: Pending Issues
if (has_pending_disciplinary_action(employee)) {
    eligible = false;
    reason = 'Pending disciplinary matter';
}

separation.eligible_for_certificate = eligible;
```

---

## 6. API Endpoints (Laravel Routes)

```php
Route::prefix('api/separation')->group(function () {

    // Separations
    Route::apiResource('separations', SeparationController::class);
    Route::prefix('separations/{id}')->group(function () {
        Route::post('approve', [SeparationController::class, 'approve']);
        Route::post('reject', [SeparationController::class, 'reject']);
        Route::post('withdraw', [SeparationController::class, 'withdraw']);
        Route::get('status-history', [SeparationController::class, 'statusHistory']);
    });

    // My Separation (Employee)
    Route::prefix('my')->group(function () {
        Route::get('separation', [MySeparationController::class, 'current']);
        Route::post('resign', [MySeparationController::class, 'submitResignation']);
        Route::post('withdraw', [MySeparationController::class, 'withdrawResignation']);
    });

    // Clearances
    Route::apiResource('separations.clearances', ClearanceController::class);
    Route::prefix('clearances/{id}')->group(function () {
        Route::post('clear', [ClearanceController::class, 'markCleared']);
        Route::post('add-item', [ClearanceController::class, 'addItem']);
        Route::post('return-item', [ClearanceController::class, 'returnItem']);
    });

    // My Clearances (Department View)
    Route::get('my-clearances', [ClearanceController::class, 'myPending']);

    // Exit Interviews
    Route::apiResource('separations.exit-interview', ExitInterviewController::class);
    Route::post('exit-interview/{id}/complete', [ExitInterviewController::class, 'complete']);
    Route::apiResource('exit-interview.compliance', ComplianceCheckController::class);
    Route::apiResource('exit-interview.summary', InterviewSummaryController::class);

    // Handover
    Route::apiResource('separations.handover', HandoverController::class);
    Route::apiResource('handover.items', HandoverItemController::class);
    Route::post('handover/{id}/verify', [HandoverController::class, 'verify']);

    // Final Settlement
    Route::apiResource('separations.settlement', SettlementController::class);
    Route::prefix('settlement/{id}')->group(function () {
        Route::post('calculate', [SettlementController::class, 'calculate']);
        Route::post('hr-verify', [SettlementController::class, 'hrVerify']);
        Route::post('finance-verify', [SettlementController::class, 'financeVerify']);
        Route::post('approve', [SettlementController::class, 'approve']);
        Route::post('pay', [SettlementController::class, 'processPayment']);
    });

    // Work Certificates
    Route::apiResource('separations.certificate', CertificateController::class);
    Route::post('certificate/{id}/issue', [CertificateController::class, 'issue']);
    Route::get('certificate/{id}/download', [CertificateController::class, 'download']);

    // Termination (For Cause)
    Route::apiResource('terminations', TerminationController::class);
    Route::post('terminations/{id}/notify', [TerminationController::class, 'notifyEmployee']);
    Route::post('terminations/{id}/appeal', [TerminationController::class, 'recordAppeal']);

    // Reports
    Route::prefix('reports')->group(function () {
        Route::get('separations', [SeparationReportController::class, 'index']);
        Route::get('exit-analysis', [SeparationReportController::class, 'exitAnalysis']);
        Route::get('turnover', [SeparationReportController::class, 'turnover']);
        Route::get('clearance-status', [SeparationReportController::class, 'clearanceStatus']);
        Route::get('settlement-pending', [SeparationReportController::class, 'pendingSettlements']);
    });
});
```

---

## 7. Livewire Components Structure

```
app/Livewire/Exit/
├── Dashboard.php                    # Exit management overview
├── Resignation/
│   ├── SubmitResignation.php       # Employee resignation form
│   ├── ResignationList.php         # All resignations
│   ├── ApprovalForm.php            # Manager/HR approval
│   └── WithdrawalForm.php          # Withdraw resignation
├── Clearance/
│   ├── ClearanceOverview.php       # All clearances for separation
│   ├── DepartmentClearance.php     # Department's pending clearances
│   ├── ClearanceForm.php           # Process clearance
│   ├── ItemReturn.php              # Return individual items
│   └── ClearanceChecklist.php      # Checklist view
├── ExitInterview/
│   ├── InterviewForm.php           # Conduct exit interview
│   ├── ComplianceChecks.php        # Compliance section
│   ├── InterviewSummary.php        # HR summary form
│   └── InterviewReports.php        # Analysis reports
├── Handover/
│   ├── HandoverPlan.php            # Create handover plan
│   ├── HandoverItems.php           # Manage items
│   └── HandoverVerification.php    # Verify completion
├── Settlement/
│   ├── SettlementCalculation.php   # Calculate settlement
│   ├── SettlementApproval.php      # Approval workflow
│   ├── PaymentProcessing.php       # Process payment
│   └── SettlementHistory.php       # Past settlements
├── Certificate/
│   ├── CertificateForm.php         # Generate certificate
│   ├── CertificatePreview.php      # Preview before issue
│   └── CertificateList.php         # Issued certificates
├── Termination/
│   ├── TerminationForm.php         # Process termination
│   ├── WarningHistory.php          # View warnings
│   └── AppealManagement.php        # Handle appeals
└── Reports/
    ├── TurnoverReport.php          # Turnover analysis
    ├── ExitReasonAnalysis.php      # Why people leave
    └── ClearanceDashboard.php      # Clearance status
```

---

## 8. Notifications & Alerts

| Event | Recipients | Channel |
|-------|------------|---------|
| Resignation submitted | Manager, HR | Email |
| Resignation approved | Employee, All Depts | Email |
| Clearance assigned | Department head | Email |
| Clearance reminder | Department | Email (daily if pending > 2 days) |
| All clearances complete | HR, Employee | Email |
| Exit interview scheduled | Employee | Email |
| Settlement ready for review | HR | Email |
| Settlement approved | Finance | Email |
| Payment processed | Employee | Email/SMS |
| Certificate ready | Employee | Email |
| Contract expiring (30 days) | Employee, HR, Manager | Email |
| Probation ending (no confirmation) | Manager, HR | Email |

---

## 9. Exit Interview Analysis

### Reasons for Leaving (Categories)

```
Work Environment & Management:
- Relationship with supervisor
- Conflict with colleagues
- Workplace culture
- Lack of support or recognition
- Harassment or discrimination
- Safety or security concerns

Compensation & Benefits:
- Salary not competitive
- Benefits insufficient
- Inconsistent or unclear incentives
- Increased financial needs

Job Satisfaction:
- Limited growth opportunities
- Responsibilities unclear
- High workload / overtime
- Lack of training
- Job not aligned with expectations

Career & Personal:
- Better job opportunity
- Career change
- Education
- Family reasons
- Relocation

Organizational:
- Lack of job security
- Project closure
- Management/leadership issues
- Poor communication
```

### Experience Rating Areas (1-5)

| Area | Description |
|------|-------------|
| Overall job satisfaction | General happiness with role |
| Supervision & leadership | Manager effectiveness |
| Workload management | Reasonable workload |
| Training & development | Learning opportunities |
| Working environment | Physical workspace |
| Teamwork & collaboration | Team dynamics |
| Communication (dept) | Within department |
| Communication (org) | Across organization |
| Compensation & benefits | Fair pay and benefits |
| Job clarity | Clear expectations |
| Decision making | Involvement in decisions |
| Growth opportunities | Career advancement |
| Security & safety | Workplace safety |

---

## 10. Form Fields Summary

### Resignation Letter
| Field | Type | Required |
|-------|------|----------|
| Employee Name | Auto | Yes |
| Position | Auto | Yes |
| Department | Auto | Yes |
| Resignation Date | Date | Yes |
| Proposed Last Day | Date | Yes |
| Reason | Select + Text | Yes |
| Acknowledgment | Checkbox | Yes |

### Clearance Checklist
| Department | Items |
|------------|-------|
| ICT | Laptop, Desktop, Phone, Email, System Access |
| Admin | ID Card, Keys, Access Cards, Office Equipment |
| Finance | Advances, Loans, Reimbursements |
| Supervisor | Work Handover, Documents, Projects |
| HR | Leave Records, Training Bond, Personnel File |
| Security | Access Badges, Vehicle Permits |

### Final Settlement
| Earnings | Deductions |
|----------|------------|
| Salary (days worked) | Outstanding advances |
| Leave encashment | Training bond |
| Pending allowances | Asset damages |
| Reimbursements | Short notice penalty |
| Gratuity | Tax |
| Severance | Other deductions |

---

## 11. Dashboard Metrics

### HR Dashboard
- Active separations by status
- Pending clearances by department
- Average clearance time
- Exit interviews pending
- Settlements to process
- Certificates to issue
- Monthly turnover rate
- Top exit reasons (chart)

### Department Dashboard
- My pending clearances
- Items to collect
- Outstanding amounts

### Employee Dashboard (Exiting)
- My separation status
- Clearance progress
- Settlement status
- Certificate status
