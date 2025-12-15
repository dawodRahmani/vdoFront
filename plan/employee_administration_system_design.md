# VDO Employee Administration System Design
## Laravel + Livewire Implementation

---

## 1. Module Overview

This module covers employee lifecycle management including:
- Employee Master Data Management
- Employee Onboarding/Induction
- Personnel File Management
- Contract Management & Amendments
- Interim/Temporary Hiring
- Mahram Registration (Afghanistan-specific)
- HR Analytics & Dashboard

---

## 2. Employee Master Data

### 2.1 Personal Information Categories

| Category | Fields |
|----------|--------|
| **Basic Info** | Full Name, Employee ID, Position, Department, Date of Hire, Employment Type |
| **Personal** | Date of Birth, Gender, Nationality, National ID/Passport, Tax ID, Marital Status |
| **Contact** | Home Address, City/Region, Phone, Secondary Phone, Personal Email |
| **Emergency Contacts** | Name, Relationship, Phone, Secondary Phone, Address (Primary & Secondary) |
| **Education** | Degree, Institution, Year Completed (multiple entries) |
| **Employment History** | Organization, Position, Duration, Reason for Leaving |
| **Skills** | Technical Skills, Languages, Professional Certifications |
| **Medical** | Known Conditions, Allergies, Medications, Special Needs (Confidential) |
| **Banking** | Bank Name, Account Name, Account Number, Branch, Mobile Money |

### 2.2 Employee Types

| Type | Code | Description |
|------|------|-------------|
| Core Staff | `core` | Permanent organizational staff |
| Project Staff | `project` | Tied to specific project funding |
| Consultant | `consultant` | Professional services contract |
| Part-Time | `part_time` | Reduced hours employment |
| Intern | `intern` | Learning/training position |
| Volunteer | `volunteer` | Unpaid volunteer |
| Daily Wage | `daily_wage` | Day labor |
| Temporary | `temporary` | Short-term contract |

---

## 3. Process Workflows

### 3.1 Employee Onboarding Process (10 Steps)

```
Step 1: PRE-BOARDING PREPARATION
┌─────────────────────────────────────────────────────────────┐
│  HR Department (Before Day 1)                               │
│  - Create employee record in system                         │
│  - Assign Employee ID                                       │
│  - Request IT setup (email, system access)                  │
│  - Request Admin setup (desk, equipment)                    │
│  - Prepare induction pack                                   │
│  - Schedule orientation sessions                            │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 2: DAY 1 - DOCUMENT COLLECTION
┌─────────────────────────────────────────────────────────────┐
│  HR Department                                              │
│  Collect & verify:                                          │
│  - Signed Offer Letter                                      │
│  - Signed Employment Contract                               │
│  - Job Description (signed)                                 │
│  - National ID / Passport copy                              │
│  - Educational certificates (verified)                      │
│  - Bank account details                                     │
│  - Emergency contact information                            │
│  - Personal information form                                │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 3: POLICY ACKNOWLEDGEMENTS
┌─────────────────────────────────────────────────────────────┐
│  HR Department                                              │
│  Employee signs:                                            │
│  - Confidentiality / NDA                                    │
│  - Code of Conduct acknowledgement                          │
│  - Safeguarding & PSEAH Policy acknowledgement              │
│  - Whistleblowing Policy acknowledgement                    │
│  - Conflict of Interest declaration                         │
│  - Probation Period agreement                               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 4: IT & EQUIPMENT SETUP
┌─────────────────────────────────────────────────────────────┐
│  IT Department                                              │
│  - Create email account                                     │
│  - Setup system access credentials                          │
│  - Issue laptop/desktop                                     │
│  - Issue phone/SIM card (if applicable)                     │
│  - Complete IT onboarding checklist                         │
│                                                             │
│  Admin Department                                           │
│  - Allocate workspace/desk                                  │
│  - Issue office equipment (keyboard, mouse, headset)        │
│  - Issue Staff ID card                                      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 5: ORIENTATION MATERIALS
┌─────────────────────────────────────────────────────────────┐
│  HR Department                                              │
│  Provide orientation materials:                             │
│  - VDO Staff Handbook                                       │
│  - Organizational Chart                                     │
│  - Vision, Mission & Core Values                            │
│  - HR Policy Manual                                         │
│  - Security & Safety Guidelines                             │
│  - IT & Communications Policy                               │
│  - Health & Safety Policy                                   │
│  - Contact list of key staff                                │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 6: DEPARTMENT-SPECIFIC ORIENTATION
┌─────────────────────────────────────────────────────────────┐
│  Line Manager / Department Head                             │
│  - Introduce to team members                                │
│  - Explain department structure                             │
│  - Review job responsibilities                              │
│  - Set initial objectives/KPIs                              │
│  - Assign buddy/mentor                                      │
│  - Project/Program overview                                 │
│  - Donor compliance requirements (if applicable)            │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 7: HR ORIENTATION SESSION
┌─────────────────────────────────────────────────────────────┐
│  HR Department                                              │
│  - Organization overview presentation                       │
│  - HR policies walkthrough                                  │
│  - Leave and attendance system training                     │
│  - Payroll and benefits explanation                         │
│  - Performance management overview                          │
│  - Training and development opportunities                   │
│  - Grievance mechanisms                                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 8: TRAINING NEEDS ASSESSMENT
┌─────────────────────────────────────────────────────────────┐
│  HR + Line Manager                                          │
│  - Complete Training Needs Assessment form                  │
│  - Identify mandatory trainings                             │
│  - Schedule initial training sessions                       │
│  - Plan capacity building activities                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 9: MAHRAM REGISTRATION (Female Staff Only - Afghanistan)
┌─────────────────────────────────────────────────────────────┐
│  HR Department                                              │
│  - Complete Mahram Information Form                         │
│  - Collect Mahram ID copy                                   │
│  - Verify Mahram availability                               │
│  - File in employee record                                  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 10: ONBOARDING COMPLETION
┌─────────────────────────────────────────────────────────────┐
│  HR Department                                              │
│  - Verify all checklist items complete                      │
│  - Employee signs induction completion form                 │
│  - HR signs off on induction                                │
│  - File all documents in personnel file                     │
│  - Update employee status to 'Active'                       │
│  - Set probation review date                                │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Contract Amendment Process (5 Steps)

```
Step 1: AMENDMENT REQUEST
┌─────────────────────────────────────────────────────────────┐
│  Supervisor / HR                                            │
│  Reasons for amendment:                                     │
│  - Position change (promotion/transfer)                     │
│  - Salary adjustment                                        │
│  - Contract extension                                       │
│  - Change in terms (location, hours, etc.)                  │
│  - Project/funding change                                   │
│  - Reporting line change                                    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 2: HR REVIEW
┌─────────────────────────────────────────────────────────────┐
│  HR Department                                              │
│  - Verify amendment is within policy                        │
│  - Check budget availability (if salary change)             │
│  - Review employee history                                  │
│  - Prepare amendment documentation                          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 3: APPROVAL
┌─────────────────────────────────────────────────────────────┐
│  Approving Authority                                        │
│  - Review amendment request                                 │
│  - Approve or reject                                        │
│  - Sign amendment letter                                    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 4: EMPLOYEE NOTIFICATION
┌─────────────────────────────────────────────────────────────┐
│  HR Department                                              │
│  - Present amendment letter to employee                     │
│  - Explain changes                                          │
│  - Employee signs acceptance                                │
│  - Update original contract reference                       │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 5: SYSTEM UPDATE & FILING
┌─────────────────────────────────────────────────────────────┐
│  HR Department                                              │
│  - Update employee record in system                         │
│  - Update payroll (if applicable)                           │
│  - Notify relevant departments                              │
│  - File amendment in personnel file                         │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Interim Hiring Process (7 Steps)

```
Step 1: INTERIM HIRING JUSTIFICATION
┌─────────────────────────────────────────────────────────────┐
│  Requesting Manager                                         │
│  Complete justification form:                               │
│  - Reason: Staff absence, project need, specialized skills  │
│  - Detailed explanation of need                             │
│  - Workload assessment                                      │
│  - Risk assessment                                          │
│  - Recommended hiring type                                  │
│  - Required timeline                                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 2: BUDGET & POSITION VERIFICATION
┌─────────────────────────────────────────────────────────────┐
│  HR + Finance                                               │
│  - Verify JD exists or draft new                            │
│  - Confirm position in organogram                           │
│  - Verify budget availability                               │
│  - Validate grade/salary scale                              │
│  - Confirm donor/project code                               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 3: APPROVAL CHAIN
┌─────────────────────────────────────────────────────────────┐
│  Approval Required From:                                    │
│  - Department Head                                          │
│  - HR Specialist                                            │
│  - Finance Manager                                          │
│  - Executive Deputy Director                                │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 4: CANDIDATE SOURCING
┌─────────────────────────────────────────────────────────────┐
│  HR Department                                              │
│  Based on urgency level:                                    │
│  - Immediate (0-5 days): Internal/waiting list              │
│  - Urgent (1-2 weeks): Limited external search              │
│  - Normal (3-4 weeks): Standard recruitment                 │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 5: SELECTION & OFFER
┌─────────────────────────────────────────────────────────────┐
│  HR + Manager                                               │
│  - Quick assessment/interview                               │
│  - Reference check (abbreviated if urgent)                  │
│  - Prepare interim contract                                 │
│  - Issue offer                                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 6: CONTRACT TYPE DETERMINATION
┌─────────────────────────────────────────────────────────────┐
│  Contract Options:                                          │
│  - Short-Term Contract (STC)                                │
│  - Temporary Employment Contract (TEC)                      │
│  - Local Consultant                                         │
│  - International Consultant                                 │
│  - Daily Worker / Monthly Service Provider                  │
│  - Outsourced via LTA                                       │
│  - Intern / Volunteer                                       │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 7: ONBOARDING & MONITORING
┌─────────────────────────────────────────────────────────────┐
│  HR Department                                              │
│  - Abbreviated onboarding                                   │
│  - Track contract end date                                  │
│  - Monitor performance                                      │
│  - Plan for transition/extension/permanent hire             │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 Personnel File Management

```
PERSONNEL FILE SECTIONS
┌─────────────────────────────────────────────────────────────┐
│  Section 1: RECRUITMENT & SELECTION                         │
│  - Job Application Form / CV                                │
│  - Job Advertisement copy                                   │
│  - Shortlisting Form & Notes                                │
│  - Interview Assessment Form                                │
│  - Reference Check Form                                     │
│  - Background & Sanction List Check                         │
│  - Selection Approval Form                                  │
├─────────────────────────────────────────────────────────────┤
│  Section 2: EMPLOYMENT DOCUMENTATION                        │
│  - Signed Employment Contract                               │
│  - Job Description (signed)                                 │
│  - Probation Period Terms                                   │
│  - Offer Letter (signed)                                    │
│  - Confidentiality / NDA                                    │
│  - Code of Conduct Acknowledgement                          │
│  - Safeguarding/PSEAH Acknowledgement                       │
│  - Whistleblowing Acknowledgement                           │
│  - Conflict of Interest Declaration                         │
├─────────────────────────────────────────────────────────────┤
│  Section 3: IDENTITY & LEGAL DOCUMENTS                      │
│  - National ID / Passport copy                              │
│  - Educational Certificates (verified)                      │
│  - Professional Licenses/Certifications                     │
│  - Previous Employment Letters                              │
│  - Work Permit (foreign nationals)                          │
├─────────────────────────────────────────────────────────────┤
│  Section 4: PAYROLL & BENEFITS                              │
│  - Bank Account Details Form                                │
│  - Tax Identification Number                                │
│  - Salary Scale Confirmation                                │
│  - Allowances & Benefits Approval                           │
├─────────────────────────────────────────────────────────────┤
│  Section 5: PERFORMANCE & DEVELOPMENT                       │
│  - Probation Evaluation Forms                               │
│  - Annual Performance Appraisals                            │
│  - Training Records                                         │
│  - Certificates                                             │
│  - Promotion Letters                                        │
├─────────────────────────────────────────────────────────────┤
│  Section 6: LEAVE & ATTENDANCE                              │
│  - Leave Request Forms                                      │
│  - Attendance/Timesheet Records                             │
│  - Medical Certificates                                     │
├─────────────────────────────────────────────────────────────┤
│  Section 7: DISCIPLINARY & GRIEVANCES                       │
│  - Warning Notices                                          │
│  - Disciplinary Records                                     │
│  - Grievance Forms                                          │
│  - Resolution Reports                                       │
├─────────────────────────────────────────────────────────────┤
│  Section 8: SEPARATION & EXIT                               │
│  - Resignation Letter                                       │
│  - Exit Interview Form                                      │
│  - Clearance Form                                           │
│  - Final Settlement Form                                    │
│  - Termination Letter                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Database Schema

### Core Tables

#### 4.1 `employees` (Master Employee Record)
```sql
- id (PK)
- employee_code (unique, e.g., 'VDO-EMP-0001')
- user_id (FK -> users, nullable - for system access)
-- Basic Info
- full_name
- father_name
- position_id (FK -> positions)
- department_id (FK -> departments)
- project_id (FK -> projects, nullable)
- reporting_to_id (FK -> employees, nullable)
- date_of_hire (date)
- employment_type (enum: 'core', 'project', 'consultant', 'part_time',
                   'intern', 'volunteer', 'daily_wage', 'temporary')
- employment_status (enum: 'pre_boarding', 'onboarding', 'probation',
                     'active', 'suspended', 'on_leave', 'notice_period',
                     'separated', 'terminated')
-- Personal Info
- date_of_birth (date)
- gender (enum: 'male', 'female')
- nationality
- national_id_type (enum: 'tazkira', 'passport', 'other')
- national_id_number
- tax_id (string, nullable)
- marital_status (enum: 'single', 'married', 'divorced', 'widowed')
-- Contact
- phone_primary
- phone_secondary (nullable)
- personal_email (nullable)
- current_address (text)
- current_city
- current_province_id (FK -> provinces)
- permanent_address (text, nullable)
- permanent_city (nullable)
- permanent_province_id (FK -> provinces, nullable)
-- Banking
- bank_name
- bank_branch
- account_name
- account_number
- mobile_money_number (nullable)
-- Photos & Documents
- photo_path (string, nullable)
- national_id_path (string, nullable)
- contract_path (string, nullable)
-- Metadata
- created_by (FK -> users)
- created_at
- updated_at
- deleted_at (soft delete)
```

#### 4.2 `employee_emergency_contacts`
```sql
- id (PK)
- employee_id (FK -> employees)
- contact_type (enum: 'primary', 'secondary')
- full_name
- relationship (enum: 'spouse', 'parent', 'sibling', 'child', 'friend', 'other')
- relationship_other (string, nullable)
- phone_primary
- phone_secondary (nullable)
- address (text, nullable)
- created_at
- updated_at
```

#### 4.3 `employee_educations`
```sql
- id (PK)
- employee_id (FK -> employees)
- degree_level (enum: 'high_school', 'diploma', 'bachelors', 'masters', 'phd', 'other')
- degree_name
- specialization
- institution_name
- country
- graduation_year
- is_verified (boolean, default false)
- verified_by (FK -> users, nullable)
- verified_at (datetime, nullable)
- certificate_path (string, nullable)
- created_at
- updated_at
```

#### 4.4 `employee_work_experiences`
```sql
- id (PK)
- employee_id (FK -> employees)
- organization_name
- position_held
- start_date (date)
- end_date (date, nullable)
- is_current (boolean, default false)
- responsibilities (text, nullable)
- reason_for_leaving (text, nullable)
- reference_name (string, nullable)
- reference_contact (string, nullable)
- verification_status (enum: 'pending', 'verified', 'unverifiable')
- verified_by (FK -> users, nullable)
- experience_letter_path (string, nullable)
- created_at
- updated_at
```

#### 4.5 `employee_skills`
```sql
- id (PK)
- employee_id (FK -> employees)
- skill_type (enum: 'technical', 'language', 'certification', 'other')
- skill_name
- proficiency_level (enum: 'basic', 'intermediate', 'advanced', 'expert', 'native')
- certificate_name (nullable)
- certificate_issuer (nullable)
- certificate_date (date, nullable)
- expiry_date (date, nullable)
- certificate_path (string, nullable)
- created_at
- updated_at
```

#### 4.6 `employee_medical_info` (Confidential)
```sql
- id (PK)
- employee_id (FK -> employees)
- blood_type (enum: 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown')
- known_conditions (text, encrypted, nullable)
- allergies (text, encrypted, nullable)
- current_medications (text, encrypted, nullable)
- special_needs (text, nullable)
- medical_clearance_date (date, nullable)
- medical_clearance_path (string, nullable)
- updated_by (FK -> users)
- created_at
- updated_at
```

#### 4.7 `onboarding_checklists`
```sql
- id (PK)
- employee_id (FK -> employees)
- checklist_type (enum: 'standard', 'interim', 'consultant', 'intern')
- start_date (date)
- target_completion_date (date)
- actual_completion_date (date, nullable)
- status (enum: 'not_started', 'in_progress', 'completed', 'cancelled')
- assigned_hr_id (FK -> users)
- notes (text, nullable)
- created_at
- updated_at
```

#### 4.8 `onboarding_checklist_items`
```sql
- id (PK)
- checklist_id (FK -> onboarding_checklists)
- section (enum: 'pre_employment', 'identity_verification', 'payroll_benefits',
           'induction_orientation', 'it_access', 'department_specific',
           'policy_acknowledgements', 'mahram')
- item_name
- item_description (text, nullable)
- is_mandatory (boolean, default true)
- responsible_party (enum: 'hr', 'it', 'admin', 'finance', 'manager', 'employee')
- status (enum: 'pending', 'in_progress', 'completed', 'waived', 'not_applicable')
- completed_at (datetime, nullable)
- completed_by (FK -> users, nullable)
- document_path (string, nullable)
- notes (text, nullable)
- sort_order (int)
- created_at
- updated_at
```

#### 4.9 `policy_acknowledgements`
```sql
- id (PK)
- employee_id (FK -> employees)
- policy_type (enum: 'confidentiality_nda', 'code_of_conduct', 'safeguarding_pseah',
               'whistleblowing', 'conflict_of_interest', 'it_policy',
               'health_safety', 'anti_fraud', 'data_protection')
- policy_version (string)
- acknowledged_at (datetime)
- signature_path (string, nullable)
- ip_address (string, nullable)
- notes (text, nullable)
- created_at
- updated_at
```

#### 4.10 `employment_contracts`
```sql
- id (PK)
- employee_id (FK -> employees)
- contract_number (unique)
- contract_type (enum: 'core', 'project', 'consultant', 'temporary',
                 'intern', 'volunteer', 'daily_wage')
- start_date (date)
- end_date (date, nullable)
- is_indefinite (boolean, default false)
- position_id (FK -> positions)
- department_id (FK -> departments)
- project_id (FK -> projects, nullable)
- salary_grade_id (FK -> salary_grades)
- base_salary (decimal)
- probation_period_months (int, nullable)
- notice_period_days (int)
- work_location
- reporting_to_id (FK -> employees, nullable)
- working_hours_per_week (int)
- terms_and_conditions (text)
- status (enum: 'draft', 'pending_signature', 'active', 'amended',
         'expired', 'terminated', 'cancelled')
- signed_by_employee_at (datetime, nullable)
- signed_by_employer_at (datetime, nullable)
- employer_signatory_id (FK -> users)
- contract_document_path (string)
- created_by (FK -> users)
- created_at
- updated_at
```

#### 4.11 `contract_amendments`
```sql
- id (PK)
- amendment_number (unique, e.g., 'AMD-2025-001')
- contract_id (FK -> employment_contracts)
- employee_id (FK -> employees)
- amendment_type (enum: 'extension', 'position_change', 'salary_change',
                  'location_change', 'hours_change', 'reporting_change',
                  'project_change', 'terms_change', 'other')
- effective_date (date)
- reason (text)
-- Previous Values
- previous_position_id (FK -> positions, nullable)
- previous_department_id (FK -> departments, nullable)
- previous_salary (decimal, nullable)
- previous_end_date (date, nullable)
- previous_location (string, nullable)
- previous_reporting_to_id (FK -> employees, nullable)
-- New Values
- new_position_id (FK -> positions, nullable)
- new_department_id (FK -> departments, nullable)
- new_salary (decimal, nullable)
- new_end_date (date, nullable)
- new_location (string, nullable)
- new_reporting_to_id (FK -> employees, nullable)
- new_terms (text, nullable)
-- Approval
- requested_by (FK -> users)
- requested_at (datetime)
- approved_by (FK -> users, nullable)
- approved_at (datetime, nullable)
- status (enum: 'draft', 'pending_approval', 'approved', 'rejected',
         'pending_signature', 'signed', 'cancelled')
- rejection_reason (text, nullable)
-- Signature
- employee_signed_at (datetime, nullable)
- employer_signed_at (datetime, nullable)
- employer_signatory_id (FK -> users, nullable)
- amendment_document_path (string, nullable)
- created_at
- updated_at
```

#### 4.12 `interim_hiring_requests`
```sql
- id (PK)
- request_number (unique, e.g., 'INT-2025-001')
- position_title
- department_id (FK -> departments)
- project_id (FK -> projects, nullable)
- donor_id (FK -> donors, nullable)
- duty_station
-- Request Details
- hiring_type (enum: 'temporary_replacement', 'gap_filling', 'project_urgency',
               'donor_requirement', 'other')
- hiring_type_other (string, nullable)
- contract_duration_from (date)
- contract_duration_to (date)
- duration_months (int)
- requested_by (FK -> users)
- request_date (date)
-- Justification
- reason_category (json) -- Array of: maternity_leave, sick_leave, annual_leave,
                         -- resignation, transfer, suspension, project_setup,
                         -- urgent_startup, donor_timeline, emergency_ops,
                         -- surge_support, new_task, technical_expertise,
                         -- consultant, specialized_function, advisory
- detailed_justification (text)
- workload_assessment (text)
- support_description (text)
-- Risk Assessment
- risk_factors (json) -- Array of: program_delay, compliance_donor, meal_delay,
                      -- operational_disruption, safeguarding, financial_backlog,
                      -- reputational, security, no_major_risk
- risk_details (text, nullable)
-- Position & Budget
- job_description_available (boolean)
- job_description_path (string, nullable)
- in_organogram (boolean)
- budget_confirmed (boolean)
- funding_source
- project_code (string, nullable)
-- Recommended Contract Type
- recommended_contract_type (enum: 'short_term', 'temporary', 'local_consultant',
                             'international_consultant', 'daily_worker',
                             'outsourced_lta', 'intern_volunteer', 'other')
- recommended_type_other (string, nullable)
-- Timeline
- date_needed (date)
- last_working_day_current (date, nullable)
- urgency_level (enum: 'immediate', 'urgent', 'normal')
-- HR Review
- jd_verified (boolean, default false)
- budget_verified (boolean, default false)
- recruitment_modality_aligned (boolean, default false)
- grade_validated (boolean, default false)
- hr_comments (text, nullable)
- hr_reviewed_by (FK -> users, nullable)
- hr_reviewed_at (datetime, nullable)
-- Approvals
- status (enum: 'draft', 'pending_dept_head', 'pending_hr', 'pending_finance',
         'pending_edd', 'approved', 'rejected', 'cancelled', 'fulfilled')
- dept_head_approved_by (FK -> users, nullable)
- dept_head_approved_at (datetime, nullable)
- hr_approved_by (FK -> users, nullable)
- hr_approved_at (datetime, nullable)
- finance_approved_by (FK -> users, nullable)
- finance_approved_at (datetime, nullable)
- edd_approved_by (FK -> users, nullable)
- edd_approved_at (datetime, nullable)
- rejection_reason (text, nullable)
-- Fulfillment
- fulfilled_by_employee_id (FK -> employees, nullable)
- fulfilled_at (datetime, nullable)
- created_at
- updated_at
```

#### 4.13 `mahram_registrations` (Afghanistan-specific)
```sql
- id (PK)
- employee_id (FK -> employees)
- mahram_name
- relationship (enum: 'father', 'husband', 'brother', 'son', 'uncle', 'nephew')
- national_id_number
- national_id_path (string)
- contact_number
- address (text)
- availability (enum: 'full_time', 'part_time', 'on_call')
- availability_notes (text, nullable)
-- Consent
- employee_declaration_signed (boolean, default false)
- employee_signed_at (datetime, nullable)
- mahram_consent_signed (boolean, default false)
- mahram_signed_at (datetime, nullable)
- consent_form_path (string, nullable)
-- Status
- status (enum: 'active', 'inactive', 'pending_verification', 'expired')
- verified_by (FK -> users, nullable)
- verified_at (datetime, nullable)
- effective_from (date)
- effective_until (date, nullable)
- deactivation_reason (text, nullable)
- created_at
- updated_at
```

#### 4.14 `personnel_files`
```sql
- id (PK)
- employee_id (FK -> employees)
- file_number (unique)
- physical_location (string, nullable) -- For physical files
- status (enum: 'active', 'archived', 'transferred', 'destroyed')
- created_at (date)
- last_audit_date (date, nullable)
- last_audited_by (FK -> users, nullable)
- notes (text, nullable)
- updated_at
```

#### 4.15 `personnel_file_documents`
```sql
- id (PK)
- personnel_file_id (FK -> personnel_files)
- employee_id (FK -> employees)
- section (enum: 'recruitment', 'employment', 'identity', 'payroll',
           'performance', 'leave', 'disciplinary', 'separation')
- document_type (string) -- e.g., 'offer_letter', 'contract', 'warning', etc.
- document_name
- document_date (date)
- file_path (string)
- file_size (int)
- mime_type (string)
- is_confidential (boolean, default false)
- is_verified (boolean, default false)
- verified_by (FK -> users, nullable)
- expiry_date (date, nullable)
- uploaded_by (FK -> users)
- notes (text, nullable)
- created_at
- updated_at
```

#### 4.16 `employee_status_history`
```sql
- id (PK)
- employee_id (FK -> employees)
- previous_status (enum: same as employees.employment_status)
- new_status (enum: same as employees.employment_status)
- effective_date (date)
- reason (text)
- reference_type (string, nullable) -- e.g., 'separation', 'suspension', etc.
- reference_id (int, nullable)
- changed_by (FK -> users)
- created_at
```

#### 4.17 `hr_analytics_snapshots` (Monthly Metrics)
```sql
- id (PK)
- snapshot_date (date)
- snapshot_month (int)
- snapshot_year (int)
-- Headcount
- total_staff (int)
- core_staff (int)
- project_staff (int)
- consultants (int)
- interns (int)
- other_staff (int)
-- Demographics
- male_count (int)
- female_count (int)
-- Movement
- new_hires (int)
- separations (int)
- resignations (int)
- terminations (int)
- contract_expirations (int)
-- Rates
- turnover_rate (decimal)
- retention_rate (decimal)
- voluntary_turnover_rate (decimal)
- involuntary_turnover_rate (decimal)
-- By Department (JSON)
- department_breakdown (json)
-- By Project (JSON)
- project_breakdown (json)
-- Leave Metrics
- avg_leave_balance (decimal)
- sick_leave_days_taken (int)
- annual_leave_days_taken (int)
-- Performance
- avg_performance_score (decimal, nullable)
- employees_on_pip (int)
-- Training
- training_hours_total (int)
- employees_trained (int)
- created_at
- updated_at
```

#### 4.18 `organization_structure`
```sql
- id (PK)
- name
- type (enum: 'organization', 'division', 'department', 'unit', 'team')
- parent_id (FK -> organization_structure, nullable)
- head_position_id (FK -> positions, nullable)
- code (string, unique)
- description (text, nullable)
- is_active (boolean, default true)
- sort_order (int)
- created_at
- updated_at
```

---

## 5. State Machines

### 5.1 Employee Status Flow

```
      [PRE_BOARDING]
            │
            │ Documents collected, onboarding started
            ▼
      [ONBOARDING]
            │
            │ Onboarding complete
            ▼
      [PROBATION]
            │
     ┌──────┼──────┐
     │      │      │
     │      │      ▼
     │      │  [TERMINATED]
     │      │  (Failed probation)
     │      │
     │      ▼
     │  [ACTIVE]
     │      │
     │   ┌──┴──┬─────────┬─────────┐
     │   │     │         │         │
     │   ▼     ▼         ▼         ▼
     │ [ON_LEAVE] [SUSPENDED] [NOTICE_PERIOD]
     │   │     │         │         │
     │   │     │         │         │
     │   └──┬──┘         │         │
     │      │            │         │
     │      ▼            │         │
     │  [ACTIVE]◄────────┘         │
     │                             │
     └─────────────────────────────┤
                                   │
                                   ▼
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
              [SEPARATED]                   [TERMINATED]
              (Voluntary)                   (Involuntary)
```

### 5.2 Onboarding Status Flow

```
     [NOT_STARTED]
            │
            │ Checklist created
            ▼
     [IN_PROGRESS]
            │
     ┌──────┴──────┐
     │             │
     ▼             ▼
[COMPLETED]   [CANCELLED]
```

### 5.3 Contract Amendment Status Flow

```
        [DRAFT]
           │
           │ Submit for approval
           ▼
   [PENDING_APPROVAL]
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
[APPROVED]   [REJECTED]
    │
    │ Send to employee
    ▼
[PENDING_SIGNATURE]
    │
    │ Employee signs
    ▼
  [SIGNED]
```

### 5.4 Interim Hiring Status Flow

```
        [DRAFT]
           │
           │ Submit
           ▼
  [PENDING_DEPT_HEAD]
           │
           │ Dept Head approves
           ▼
    [PENDING_HR]
           │
           │ HR approves
           ▼
  [PENDING_FINANCE]
           │
           │ Finance approves
           ▼
   [PENDING_EDD]
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
[APPROVED]   [REJECTED]
    │
    │ Candidate hired
    ▼
[FULFILLED]
```

---

## 6. Business Rules

### 6.1 Onboarding Rules

```php
// Rule 1: Mandatory documents by employment type
$mandatoryDocuments = [
    'core' => ['contract', 'nda', 'code_of_conduct', 'safeguarding', 'national_id'],
    'project' => ['contract', 'nda', 'code_of_conduct', 'safeguarding', 'national_id'],
    'consultant' => ['contract', 'nda', 'tax_id'],
    'intern' => ['contract', 'code_of_conduct', 'safeguarding', 'national_id'],
    'daily_wage' => ['contract', 'national_id'],
];

// Rule 2: Onboarding completion requirement
function canCompleteOnboarding($checklist) {
    $mandatoryItems = $checklist->items->where('is_mandatory', true);
    return $mandatoryItems->every(fn($item) =>
        in_array($item->status, ['completed', 'waived', 'not_applicable'])
    );
}

// Rule 3: Mahram requirement for female staff in Afghanistan
if ($employee->gender === 'female' && $employee->work_country === 'Afghanistan') {
    $onboarding->addItem([
        'section' => 'mahram',
        'item_name' => 'Mahram Registration',
        'is_mandatory' => true,
        'responsible_party' => 'hr'
    ]);
}

// Rule 4: Probation start after onboarding
if ($onboarding->status === 'completed' && $employee->employment_status === 'onboarding') {
    $employee->employment_status = 'probation';
    $employee->probation_start_date = now();
    $employee->probation_end_date = now()->addMonths($contract->probation_period_months);
}
```

### 6.2 Contract Amendment Rules

```php
// Rule 1: Salary change requires Finance approval
if ($amendment->amendment_type === 'salary_change') {
    $amendment->requires_finance_approval = true;
}

// Rule 2: Position change requires updated JD
if ($amendment->amendment_type === 'position_change') {
    $amendment->requires_new_job_description = true;
}

// Rule 3: Extension cannot exceed project end date
if ($amendment->amendment_type === 'extension' && $contract->project_id) {
    $project = Project::find($contract->project_id);
    if ($amendment->new_end_date > $project->end_date) {
        throw new ValidationException('Contract cannot extend beyond project end date');
    }
}

// Rule 4: Maximum contract extensions
$extensionCount = ContractAmendment::where('contract_id', $contract->id)
    ->where('amendment_type', 'extension')
    ->count();
if ($extensionCount >= 3) {
    // Requires special approval or conversion to core
    $amendment->requires_special_approval = true;
}
```

### 6.3 Interim Hiring Rules

```php
// Rule 1: Urgency determines approval speed
$approvalDeadlines = [
    'immediate' => 1, // 1 day turnaround
    'urgent' => 3,    // 3 days
    'normal' => 7,    // 7 days
];

// Rule 2: Budget must be confirmed before approval
if (!$request->budget_confirmed) {
    throw new ValidationException('Budget must be confirmed before approval');
}

// Rule 3: Maximum interim contract duration
$maxDuration = [
    'short_term' => 6,        // 6 months
    'temporary' => 12,        // 12 months
    'daily_worker' => 3,      // 3 months
    'intern_volunteer' => 6,  // 6 months
];

if ($request->duration_months > $maxDuration[$request->recommended_contract_type]) {
    throw new ValidationException('Duration exceeds maximum for this contract type');
}

// Rule 4: Replacement requires reference to original position
if ($request->hiring_type === 'temporary_replacement') {
    if (!$request->replacing_employee_id) {
        throw new ValidationException('Must specify employee being replaced');
    }
}
```

### 6.4 Turnover Calculation Rules

```php
// Monthly Turnover Rate
function calculateMonthlyTurnover($month, $year) {
    $separations = Separation::whereMonth('effective_date', $month)
        ->whereYear('effective_date', $year)
        ->count();

    $startCount = Employee::whereDate('date_of_hire', '<', Carbon::create($year, $month, 1))
        ->where('employment_status', '!=', 'separated')
        ->count();

    $endCount = Employee::where('employment_status', 'active')
        ->whereDate('created_at', '<=', Carbon::create($year, $month)->endOfMonth())
        ->count();

    $avgHeadcount = ($startCount + $endCount) / 2;

    return $avgHeadcount > 0 ? ($separations / $avgHeadcount) * 100 : 0;
}

// Annual Retention Rate
function calculateAnnualRetention($year) {
    $startOfYear = Employee::whereDate('date_of_hire', '<', Carbon::create($year, 1, 1))
        ->where('employment_status', '!=', 'separated')
        ->get();

    $stillEmployed = $startOfYear->filter(fn($emp) =>
        $emp->employment_status === 'active' ||
        Carbon::parse($emp->separation_date)->year > $year
    )->count();

    return count($startOfYear) > 0 ? ($stillEmployed / count($startOfYear)) * 100 : 100;
}
```

---

## 7. API Endpoints (Laravel Routes)

```php
Route::prefix('api/employees')->group(function () {

    // Employee Master Data
    Route::apiResource('/', EmployeeController::class);
    Route::get('{id}/profile', [EmployeeController::class, 'profile']);
    Route::put('{id}/personal-info', [EmployeeController::class, 'updatePersonalInfo']);
    Route::put('{id}/contact-info', [EmployeeController::class, 'updateContactInfo']);
    Route::put('{id}/banking-info', [EmployeeController::class, 'updateBankingInfo']);
    Route::get('{id}/status-history', [EmployeeController::class, 'statusHistory']);
    Route::post('{id}/change-status', [EmployeeController::class, 'changeStatus']);

    // Emergency Contacts
    Route::apiResource('{employee}/emergency-contacts', EmergencyContactController::class);

    // Education
    Route::apiResource('{employee}/educations', EmployeeEducationController::class);
    Route::post('{employee}/educations/{id}/verify', [EmployeeEducationController::class, 'verify']);

    // Work Experience
    Route::apiResource('{employee}/experiences', WorkExperienceController::class);
    Route::post('{employee}/experiences/{id}/verify', [WorkExperienceController::class, 'verify']);

    // Skills
    Route::apiResource('{employee}/skills', EmployeeSkillController::class);

    // Medical Info (Restricted Access)
    Route::get('{employee}/medical', [MedicalInfoController::class, 'show']);
    Route::put('{employee}/medical', [MedicalInfoController::class, 'update']);

    // Personnel File
    Route::get('{employee}/personnel-file', [PersonnelFileController::class, 'show']);
    Route::apiResource('{employee}/personnel-file/documents', PersonnelFileDocumentController::class);
    Route::post('{employee}/personnel-file/audit', [PersonnelFileController::class, 'audit']);
});

// Onboarding
Route::prefix('api/onboarding')->group(function () {
    Route::apiResource('checklists', OnboardingChecklistController::class);
    Route::get('checklists/{id}/items', [OnboardingChecklistController::class, 'items']);
    Route::put('checklists/{id}/items/{itemId}', [OnboardingChecklistController::class, 'updateItem']);
    Route::post('checklists/{id}/complete', [OnboardingChecklistController::class, 'complete']);
    Route::get('pending', [OnboardingChecklistController::class, 'pending']);
    Route::get('statistics', [OnboardingChecklistController::class, 'statistics']);
});

// Policy Acknowledgements
Route::prefix('api/policy-acknowledgements')->group(function () {
    Route::get('employee/{employee}', [PolicyAcknowledgementController::class, 'byEmployee']);
    Route::post('acknowledge', [PolicyAcknowledgementController::class, 'acknowledge']);
    Route::get('pending/{employee}', [PolicyAcknowledgementController::class, 'pending']);
    Route::get('report', [PolicyAcknowledgementController::class, 'report']);
});

// Contracts
Route::prefix('api/contracts')->group(function () {
    Route::apiResource('/', ContractController::class);
    Route::get('employee/{employee}', [ContractController::class, 'byEmployee']);
    Route::get('expiring', [ContractController::class, 'expiring']);
    Route::post('{id}/sign', [ContractController::class, 'sign']);

    // Amendments
    Route::apiResource('{contract}/amendments', ContractAmendmentController::class);
    Route::post('amendments/{id}/approve', [ContractAmendmentController::class, 'approve']);
    Route::post('amendments/{id}/reject', [ContractAmendmentController::class, 'reject']);
    Route::post('amendments/{id}/sign', [ContractAmendmentController::class, 'sign']);
});

// Interim Hiring
Route::prefix('api/interim-hiring')->group(function () {
    Route::apiResource('requests', InterimHiringController::class);
    Route::post('requests/{id}/submit', [InterimHiringController::class, 'submit']);
    Route::post('requests/{id}/approve/{level}', [InterimHiringController::class, 'approve']);
    Route::post('requests/{id}/reject', [InterimHiringController::class, 'reject']);
    Route::post('requests/{id}/fulfill', [InterimHiringController::class, 'fulfill']);
    Route::get('pending-approvals', [InterimHiringController::class, 'pendingApprovals']);
});

// Mahram (Afghanistan)
Route::prefix('api/mahram')->group(function () {
    Route::apiResource('registrations', MahramController::class);
    Route::get('employee/{employee}', [MahramController::class, 'byEmployee']);
    Route::post('registrations/{id}/verify', [MahramController::class, 'verify']);
    Route::post('registrations/{id}/deactivate', [MahramController::class, 'deactivate']);
});

// Organization Structure
Route::prefix('api/organization')->group(function () {
    Route::apiResource('structure', OrganizationStructureController::class);
    Route::get('chart', [OrganizationStructureController::class, 'chart']);
    Route::get('departments', [OrganizationStructureController::class, 'departments']);
});

// HR Analytics
Route::prefix('api/hr-analytics')->group(function () {
    Route::get('dashboard', [HRAnalyticsController::class, 'dashboard']);
    Route::get('headcount', [HRAnalyticsController::class, 'headcount']);
    Route::get('turnover', [HRAnalyticsController::class, 'turnover']);
    Route::get('retention', [HRAnalyticsController::class, 'retention']);
    Route::get('demographics', [HRAnalyticsController::class, 'demographics']);
    Route::get('by-department', [HRAnalyticsController::class, 'byDepartment']);
    Route::get('by-project', [HRAnalyticsController::class, 'byProject']);
    Route::get('trends', [HRAnalyticsController::class, 'trends']);
    Route::post('snapshot', [HRAnalyticsController::class, 'generateSnapshot']);
});

// Reports
Route::prefix('api/employee-reports')->group(function () {
    Route::get('staff-list', [EmployeeReportController::class, 'staffList']);
    Route::get('directory', [EmployeeReportController::class, 'directory']);
    Route::get('birthdays', [EmployeeReportController::class, 'birthdays']);
    Route::get('anniversaries', [EmployeeReportController::class, 'anniversaries']);
    Route::get('expiring-contracts', [EmployeeReportController::class, 'expiringContracts']);
    Route::get('probation-ending', [EmployeeReportController::class, 'probationEnding']);
    Route::get('headcount-history', [EmployeeReportController::class, 'headcountHistory']);
});
```

---

## 8. Livewire Components Structure

```
app/Livewire/EmployeeAdmin/
├── Dashboard.php                       # HR Admin overview
├── Employees/
│   ├── EmployeeList.php               # All employees with filters
│   ├── EmployeeCreate.php             # New employee form
│   ├── EmployeeProfile.php            # Full employee profile
│   ├── PersonalInfoForm.php           # Edit personal info
│   ├── ContactInfoForm.php            # Edit contact info
│   ├── BankingInfoForm.php            # Edit banking info
│   ├── EmergencyContactsManager.php   # Manage emergency contacts
│   ├── EducationManager.php           # Manage education records
│   ├── ExperienceManager.php          # Manage work experience
│   ├── SkillsManager.php              # Manage skills/certifications
│   ├── MedicalInfoForm.php            # Medical info (restricted)
│   └── StatusHistory.php              # View status changes
├── Onboarding/
│   ├── OnboardingDashboard.php        # Onboarding overview
│   ├── ChecklistManager.php           # Manage onboarding checklists
│   ├── ChecklistDetail.php            # Single checklist view
│   ├── ChecklistItemForm.php          # Update checklist item
│   ├── NewEmployeeOnboarding.php      # Start new onboarding
│   └── OnboardingReports.php          # Onboarding statistics
├── Policies/
│   ├── PolicyAcknowledgementForm.php  # Sign policies
│   ├── PendingAcknowledgements.php    # Pending signatures
│   └── AcknowledgementReport.php      # Compliance report
├── Contracts/
│   ├── ContractList.php               # All contracts
│   ├── ContractDetail.php             # View contract
│   ├── ContractCreate.php             # Create new contract
│   ├── ContractAmendmentForm.php      # Create amendment
│   ├── AmendmentApproval.php          # Approve amendments
│   ├── ExpiringContracts.php          # Contracts ending soon
│   └── ContractHistory.php            # Employee contract history
├── InterimHiring/
│   ├── RequestList.php                # All interim requests
│   ├── RequestForm.php                # Create request
│   ├── RequestDetail.php              # View request
│   ├── ApprovalWorkflow.php           # Multi-level approval
│   └── FulfillmentForm.php            # Mark as fulfilled
├── Mahram/
│   ├── MahramList.php                 # All registrations
│   ├── MahramForm.php                 # Register/update mahram
│   ├── MahramVerification.php         # Verify registration
│   └── MahramReport.php               # Female staff mahram report
├── PersonnelFiles/
│   ├── FileManager.php                # Manage personnel file
│   ├── DocumentUpload.php             # Upload documents
│   ├── DocumentViewer.php             # View documents
│   ├── FileAudit.php                  # Audit checklist
│   └── MissingDocuments.php           # Report missing docs
├── Organization/
│   ├── OrgChart.php                   # Interactive org chart
│   ├── StructureManager.php           # Manage structure
│   └── DepartmentList.php             # Department listing
├── Analytics/
│   ├── HRDashboard.php                # Main analytics dashboard
│   ├── HeadcountChart.php             # Headcount over time
│   ├── TurnoverChart.php              # Turnover trends
│   ├── DemographicsChart.php          # Gender, age breakdown
│   ├── DepartmentBreakdown.php        # By department
│   └── ProjectBreakdown.php           # By project
├── Reports/
│   ├── StaffDirectory.php             # Staff directory
│   ├── BirthdayList.php               # Birthday calendar
│   ├── AnniversaryList.php            # Work anniversaries
│   └── CustomReport.php               # Custom report builder
└── Employee/
    ├── MyProfile.php                  # Employee self-service
    ├── MyDocuments.php                # View own documents
    ├── UpdateMyInfo.php               # Update own info
    └── MyPolicies.php                 # Acknowledge policies
```

---

## 9. Notifications & Alerts

| Event | Recipients | Channel |
|-------|------------|---------|
| New employee created | HR, IT, Admin | Email |
| Onboarding started | Employee, Manager, HR | Email |
| Onboarding item pending | Responsible party | Email |
| Onboarding completed | HR, Manager | Email |
| Policy acknowledgement pending | Employee | Email (daily) |
| Contract expiring (30 days) | HR, Manager, Employee | Email |
| Contract expiring (7 days) | HR, Manager | Email (urgent) |
| Amendment pending approval | Approver | Email |
| Amendment approved | Employee, HR | Email |
| Interim hiring request submitted | Approvers | Email |
| Interim hiring approved | Requester, HR | Email |
| Mahram registration expiring | HR, Employee | Email |
| Probation ending (14 days) | HR, Manager | Email |
| Birthday today | Team, HR | System notification |
| Work anniversary | Manager, HR | System notification |

---

## 10. Dashboard Metrics

### HR Admin Dashboard

| Metric | Description |
|--------|-------------|
| Total Headcount | Current active employees |
| New Hires (MTD) | Month-to-date new hires |
| Separations (MTD) | Month-to-date separations |
| Turnover Rate | Monthly/Annual turnover % |
| Retention Rate | Annual retention % |
| Pending Onboardings | Employees in onboarding |
| Expiring Contracts | Contracts expiring in 30 days |
| Pending Probations | Probations ending in 14 days |
| Policy Compliance | % with all policies acknowledged |
| Interim Requests | Pending interim hiring requests |

### Employee Demographics

| Chart | Breakdown |
|-------|-----------|
| By Gender | Male / Female |
| By Employment Type | Core / Project / Consultant / etc. |
| By Department | All departments |
| By Location | All duty stations |
| By Tenure | <1yr, 1-3yr, 3-5yr, 5+yr |
| By Age | 20-30, 30-40, 40-50, 50+ |

### Turnover Analysis

| Metric | Description |
|--------|-------------|
| Monthly Turnover Trend | Last 12 months |
| Voluntary vs Involuntary | Breakdown by type |
| By Department | Highest turnover departments |
| By Tenure | When employees leave |
| Exit Reasons | Top reasons for leaving |

---

## 11. Document Templates

### System-Generated Documents

| Document | Trigger | Template |
|----------|---------|----------|
| Employment Contract | New hire | `contracts/employment_contract.blade.php` |
| Contract Amendment | Amendment approved | `contracts/amendment_letter.blade.php` |
| Onboarding Checklist | Onboarding start | `onboarding/checklist.blade.php` |
| Policy Acknowledgement | Policy sign | `policies/acknowledgement.blade.php` |
| Staff ID Card | ID request | `admin/id_card.blade.php` |
| Employee Directory | Report request | `reports/directory.blade.php` |
| Turnover Report | Monthly | `reports/turnover.blade.php` |

---

## 12. Integration Points

### With Other Modules

| Module | Integration |
|--------|-------------|
| **Recruitment** | New hire → Create employee → Start onboarding |
| **Leave Management** | Employee data, leave balance on profile |
| **Payroll** | Banking info, salary from contract |
| **Performance** | Probation tracking, appraisal history |
| **Training** | Training records, certificates |
| **Disciplinary** | Warning history, status changes |
| **Exit** | Separation → Update status → Archive file |

### External Systems

| System | Data |
|--------|------|
| Active Directory | User account sync |
| Email System | Email account provisioning |
| Biometric/Attendance | Employee ID sync |
| Payroll System | Employee & salary sync |

---

## 13. Security & Access Control

### Role-Based Access

| Role | Access Level |
|------|--------------|
| Employee | Own profile, documents, policies |
| Manager | Team profiles (limited), onboarding items |
| HR Officer | All employees, onboarding, contracts |
| HR Manager | Full access including medical, analytics |
| IT Admin | System access provisioning |
| Finance | Banking info, contract costs |
| Executive | Analytics, reports |

### Data Protection

| Data Type | Protection |
|-----------|------------|
| Medical Information | Encrypted, restricted access |
| Banking Details | Encrypted, audit logged |
| National ID | Encrypted storage |
| Salary Information | Role-based access |
| Personnel Files | Access logged |

---

## 14. Scheduled Jobs

```php
// app/Console/Kernel.php

// Daily
$schedule->command('onboarding:send-reminders')->dailyAt('09:00');
$schedule->command('contracts:check-expiring')->dailyAt('08:00');
$schedule->command('probation:check-ending')->dailyAt('08:00');
$schedule->command('policies:send-reminders')->dailyAt('10:00');
$schedule->command('birthdays:send-notifications')->dailyAt('08:30');

// Weekly
$schedule->command('mahram:check-expiring')->weeklyOn(1, '09:00');
$schedule->command('personnel-files:check-missing')->weeklyOn(1, '10:00');

// Monthly
$schedule->command('analytics:generate-snapshot')->monthlyOn(1, '00:00');
$schedule->command('turnover:calculate-monthly')->monthlyOn(1, '01:00');
$schedule->command('contracts:expiry-report')->monthlyOn(1, '08:00');

// Yearly
$schedule->command('retention:calculate-annual')->yearlyOn(1, 1, '00:00');
```

---

## Summary

**Total Tables: 18**

| # | Table | Purpose |
|---|-------|---------|
| 1 | `employees` | Master employee record |
| 2 | `employee_emergency_contacts` | Emergency contacts |
| 3 | `employee_educations` | Education history |
| 4 | `employee_work_experiences` | Work history |
| 5 | `employee_skills` | Skills & certifications |
| 6 | `employee_medical_info` | Medical data (confidential) |
| 7 | `onboarding_checklists` | Onboarding master |
| 8 | `onboarding_checklist_items` | Checklist items |
| 9 | `policy_acknowledgements` | Policy signatures |
| 10 | `employment_contracts` | Employment contracts |
| 11 | `contract_amendments` | Contract changes |
| 12 | `interim_hiring_requests` | Temporary hiring |
| 13 | `mahram_registrations` | Mahram info (Afghanistan) |
| 14 | `personnel_files` | File management |
| 15 | `personnel_file_documents` | File documents |
| 16 | `employee_status_history` | Status audit trail |
| 17 | `hr_analytics_snapshots` | Monthly metrics |
| 18 | `organization_structure` | Org hierarchy |

This module serves as the **central hub** for all employee data, connecting to all other HR modules.
