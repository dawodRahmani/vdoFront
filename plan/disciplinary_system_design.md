# VDO Misconduct & Disciplinary System Design
## Laravel + Livewire Implementation

---

## 1. Misconduct & Disciplinary Overview

### Misconduct Categories
| Category | Severity | Examples |
|----------|----------|----------|
| **Minor Misconduct** | Low | Tardiness, dress code violation, minor negligence |
| **Misconduct** | Medium | Repeated minor issues, insubordination, policy violation |
| **Serious Misconduct** | High | Fraud, theft, harassment, safety violations |
| **Gross Misconduct** | Critical | SEA, violence, criminal acts, severe fraud |

### Zero Tolerance Policy Areas
| Area | Description | Consequence |
|------|-------------|-------------|
| **SEA** | Sexual Exploitation & Abuse | Immediate termination |
| **PSEAH** | Protection from Sexual Exploitation, Abuse & Harassment | Immediate termination |
| **Child Protection** | Any harm to children | Immediate termination |
| **Fraud/Corruption** | Financial misconduct, bribery | Immediate termination |
| **Violence** | Physical assault, threats | Immediate termination |
| **Discrimination** | Based on gender, ethnicity, religion | Progressive discipline |

### Warning Types
| Warning | Level | Validity | Next Step if Repeated |
|---------|-------|----------|----------------------|
| Verbal Warning | 1 | 3 months | First Written Warning |
| First Written Warning | 2 | 6 months | Final Written Warning |
| Final Written Warning | 3 | 12 months | Termination |

### Disciplinary Outcomes
| Outcome | Description |
|---------|-------------|
| **No Action** | Allegation unfounded |
| **Counseling** | Informal guidance |
| **Verbal Warning** | Documented verbal warning |
| **Written Warning** | Formal written warning |
| **Final Warning** | Last chance before termination |
| **Suspension** | Temporary removal (with/without pay) |
| **Demotion** | Reduction in grade/position |
| **Salary Reduction** | Temporary pay cut |
| **Termination** | End of employment |

---

## 2. Process Workflows

### 2.1 Misconduct Reporting Process

```
Step 1: INCIDENT OCCURS / REPORT RECEIVED
┌─────────────────────────────────────────────────────────────┐
│  Reporting Channels:                                        │
│  - Direct report to supervisor                              │
│  - Report to HR                                             │
│  - Anonymous hotline/email                                  │
│  - CFRM (Community Feedback & Response Mechanism)           │
│  - Whistleblower report                                     │
│  - External complaint                                       │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 2: INITIAL ASSESSMENT
┌─────────────────────────────────────────────────────────────┐
│  HR Department (within 24-48 hours)                         │
│  - Log complaint/report                                     │
│  - Assess severity and category                             │
│  - Determine if immediate action needed                     │
│  - Assign case reference number                             │
│  - Decide investigation level:                              │
│    • Minor: Manager handles                                 │
│    • Serious: HR investigation                              │
│    • Gross: Investigation committee                         │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 3: PRECAUTIONARY MEASURES (if needed)
┌─────────────────────────────────────────────────────────────┐
│  For serious allegations:                                   │
│  - Precautionary suspension (not punishment)                │
│  - Restrict system access                                   │
│  - Separate parties involved                                │
│  - Preserve evidence                                        │
│  - Notify legal/compliance if required                      │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Investigation Process

```
Step 1: INVESTIGATION INITIATION
┌─────────────────────────────────────────────────────────────┐
│  HR / Investigation Committee                               │
│  - Appoint investigator(s)                                  │
│  - Define scope and timeline                                │
│  - Inform accused of allegations (right to respond)         │
│  - Identify witnesses                                       │
│  - Gather documents/evidence                                │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 2: EVIDENCE GATHERING
┌─────────────────────────────────────────────────────────────┐
│  Investigator(s)                                            │
│  - Interview complainant                                    │
│  - Interview accused                                        │
│  - Interview witnesses                                      │
│  - Review documents/records                                 │
│  - Review CCTV/digital evidence (if applicable)             │
│  - Collect written statements                               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 3: INVESTIGATION REPORT
┌─────────────────────────────────────────────────────────────┐
│  Investigator(s)                                            │
│  - Document findings                                        │
│  - Assess credibility of evidence                           │
│  - Determine if misconduct occurred                         │
│  - Recommend disciplinary action                            │
│  - Submit report to HR/Management                           │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 4: DECISION
┌─────────────────────────────────────────────────────────────┐
│  HR + Management                                            │
│  - Review investigation report                              │
│  - Consider mitigating factors                              │
│  - Review employee's history                                │
│  - Determine appropriate action                             │
│  - Document decision rationale                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Progressive Discipline Process (5 Steps)

```
Step 1: VERBAL WARNING
┌─────────────────────────────────────────────────────────────┐
│  Line Manager (with HR awareness)                           │
│  - Meet with employee privately                             │
│  - Explain the issue/misconduct                             │
│  - Listen to employee's response                            │
│  - Set expectations for improvement                         │
│  - Document in employee file                                │
│  - Set review period (typically 3 months)                   │
└─────────────────────────────────────────────────────────────┘
                           │
        If issue repeats or new issue within validity period
                           │
                           ▼
Step 2: FIRST WRITTEN WARNING
┌─────────────────────────────────────────────────────────────┐
│  Line Manager + HR                                          │
│  - Formal meeting with employee                             │
│  - Present written warning letter                           │
│  - Detail specific misconduct                               │
│  - Reference previous verbal warning                        │
│  - State expected improvement                               │
│  - Warn of consequences if repeated                         │
│  - Employee signs acknowledgment                            │
│  - Valid for 6 months                                       │
└─────────────────────────────────────────────────────────────┘
                           │
        If issue repeats or new issue within validity period
                           │
                           ▼
Step 3: FINAL WRITTEN WARNING
┌─────────────────────────────────────────────────────────────┐
│  HR + Department Head                                       │
│  - Formal disciplinary meeting                              │
│  - Employee may bring witness/representative                │
│  - Present final warning letter                             │
│  - Reference all previous warnings                          │
│  - Clearly state: next violation = termination              │
│  - May include additional sanctions:                        │
│    • Suspension                                             │
│    • Performance Improvement Plan (PIP)                     │
│  - Valid for 12 months                                      │
└─────────────────────────────────────────────────────────────┘
                           │
        If issue repeats or new issue within validity period
                           │
                           ▼
Step 4: DISCIPLINARY ACTION FORM
┌─────────────────────────────────────────────────────────────┐
│  HR Department                                              │
│  - Complete disciplinary action form                        │
│  - Document complete history                                │
│  - Recommendation for termination                           │
│  - Submit to Management for approval                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 5: FILING
┌─────────────────────────────────────────────────────────────┐
│  HR Department                                              │
│  - File all documents in employee record                    │
│  - Update HR system                                         │
│  - If termination: initiate exit process                    │
│  - Archive case file                                        │
└─────────────────────────────────────────────────────────────┘
```

### 2.4 Termination for Gross Misconduct (5 Steps)

```
Step 1: RECOMMENDATION FOR TERMINATION
┌─────────────────────────────────────────────────────────────┐
│  Investigation Committee / HR                               │
│  - Complete investigation                                   │
│  - Document findings proving gross misconduct               │
│  - Prepare termination recommendation                       │
│  - Submit to ED/DD for approval                             │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 2: TERMINATION DECISION
┌─────────────────────────────────────────────────────────────┐
│  Executive Director / Deputy Director                       │
│  - Review investigation report                              │
│  - Review recommendation                                    │
│  - Consider legal implications                              │
│  - Make final decision                                      │
│  - Sign termination approval                                │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 3: PREPARE TERMINATION DOCUMENTS
┌─────────────────────────────────────────────────────────────┐
│  HR Department                                              │
│  - Prepare termination letter                               │
│  - Detail reason for termination                            │
│  - Reference investigation findings                         │
│  - State effective date (usually immediate)                 │
│  - Outline final settlement terms                           │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 4: EMPLOYEE NOTIFICATION
┌─────────────────────────────────────────────────────────────┐
│  HR + Management                                            │
│  - Meet with employee                                       │
│  - Present termination letter                               │
│  - Explain reason and decision                              │
│  - Inform of appeal rights (if any)                         │
│  - Collect company property                                 │
│  - Revoke access immediately                                │
│  - Escort from premises (if required)                       │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 5: FILING & CLOSURE
┌─────────────────────────────────────────────────────────────┐
│  HR Department                                              │
│  - File all investigation documents                         │
│  - Update employee status                                   │
│  - Process restricted final settlement                      │
│  - No work certificate issued                               │
│  - Mark as not eligible for rehire                          │
│  - Report to authorities if criminal (SEA, fraud, etc.)     │
│  - Archive case                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.5 Appeal Process

```
┌─────────────────────────────────────────────────────────────┐
│  Employee submits written appeal within 7 days              │
│  - State grounds for appeal                                 │
│  - Provide supporting evidence                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Appeal Committee (different from original investigators)   │
│  - Review case documents                                    │
│  - Consider new evidence                                    │
│  - May conduct additional interviews                        │
│  - Make recommendation                                      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Final Decision (ED/Board)                                  │
│  - Uphold original decision                                 │
│  - Modify sanction                                          │
│  - Overturn decision                                        │
│  - Decision is final                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema

### Core Tables

#### 3.1 `misconduct_reports` (Initial Reports/Complaints)
```sql
- id (PK)
- report_number (unique, e.g., 'MIS-2025-001')
- report_date (datetime)
- report_source (enum: 'supervisor', 'hr', 'employee', 'anonymous',
                 'hotline', 'cfrm', 'whistleblower', 'external')
- reporter_id (FK -> users, nullable - for anonymous)
- reporter_name (string, nullable - for external)
- reporter_contact (string, nullable)
- is_anonymous (boolean, default false)
- accused_employee_id (FK -> employees)
- accused_department_id (FK -> departments)
-- Incident Details
- incident_date (date)
- incident_time (time, nullable)
- incident_location (string)
- incident_description (text)
- misconduct_category (enum: 'minor', 'misconduct', 'serious', 'gross')
- misconduct_type (enum: 'sea', 'harassment', 'fraud', 'theft',
                   'violence', 'discrimination', 'policy_violation',
                   'insubordination', 'negligence', 'attendance',
                   'confidentiality_breach', 'safety_violation', 'other')
- zero_tolerance_area (enum: 'sea', 'pseah', 'child_protection',
                       'fraud', 'violence', nullable)
-- Witnesses
- witnesses (json, nullable - array of names/contacts)
- evidence_description (text, nullable)
-- Initial Assessment
- severity_level (enum: 'low', 'medium', 'high', 'critical')
- immediate_action_required (boolean, default false)
- assigned_to (FK -> users)
- assessment_notes (text, nullable)
- status (enum: 'received', 'assessing', 'investigation_required',
         'no_action', 'resolved', 'escalated')
- received_by (FK -> users)
- created_at
- updated_at
```

#### 3.2 `misconduct_evidence` (Evidence Attachments)
```sql
- id (PK)
- report_id (FK -> misconduct_reports)
- investigation_id (FK -> investigations, nullable)
- evidence_type (enum: 'document', 'photo', 'video', 'audio',
                'email', 'statement', 'cctv', 'other')
- title
- description (text)
- file_path (string, nullable)
- external_reference (string, nullable)
- collected_by (FK -> users)
- collected_date (datetime)
- chain_of_custody (json, nullable - who handled it)
- is_confidential (boolean, default true)
- created_at
- updated_at
```

#### 3.3 `investigations` (Investigation Cases)
```sql
- id (PK)
- investigation_number (unique, e.g., 'INV-2025-001')
- report_id (FK -> misconduct_reports)
- accused_employee_id (FK -> employees)
- investigation_type (enum: 'informal', 'formal', 'committee')
- investigation_scope (text)
- start_date (date)
- target_end_date (date)
- actual_end_date (date, nullable)
-- Investigators
- lead_investigator_id (FK -> users)
- investigation_committee (json, nullable - array of user IDs)
-- Status
- status (enum: 'pending', 'in_progress', 'interviews_complete',
         'report_drafting', 'review', 'completed', 'closed')
-- Findings
- findings_summary (text, nullable)
- misconduct_proven (boolean, nullable)
- evidence_assessment (text, nullable)
- mitigating_factors (text, nullable)
- aggravating_factors (text, nullable)
-- Recommendation
- recommended_action (enum: 'no_action', 'counseling', 'verbal_warning',
                      'written_warning', 'final_warning', 'suspension',
                      'demotion', 'termination', nullable)
- recommendation_rationale (text, nullable)
-- Report
- investigation_report_path (string, nullable)
- submitted_at (datetime, nullable)
- submitted_to (FK -> users, nullable)
- created_at
- updated_at
```

#### 3.4 `investigation_interviews` (Interview Records)
```sql
- id (PK)
- investigation_id (FK -> investigations)
- interview_type (enum: 'complainant', 'accused', 'witness', 'expert')
- interviewee_type (enum: 'employee', 'external')
- interviewee_employee_id (FK -> employees, nullable)
- interviewee_name (string, nullable - for external)
- interviewee_contact (string, nullable)
- interview_date (datetime)
- interview_location (string)
- interviewer_id (FK -> users)
- second_interviewer_id (FK -> users, nullable)
- questions_asked (text)
- responses (text)
- key_points (text)
- credibility_assessment (text, nullable)
- statement_signed (boolean, default false)
- statement_path (string, nullable)
- recording_path (string, nullable)
- notes (text, nullable)
- created_at
- updated_at
```

#### 3.5 `precautionary_suspensions` (Temporary Suspension During Investigation)
```sql
- id (PK)
- report_id (FK -> misconduct_reports)
- investigation_id (FK -> investigations, nullable)
- employee_id (FK -> employees)
- suspension_type (enum: 'with_pay', 'without_pay')
- start_date (date)
- expected_end_date (date)
- actual_end_date (date, nullable)
- reason (text)
- restrictions (json - e.g., no system access, no contact with staff)
- approved_by (FK -> users)
- status (enum: 'active', 'extended', 'lifted', 'converted_to_disciplinary')
- outcome_notes (text, nullable)
- created_at
- updated_at
```

#### 3.6 `disciplinary_actions` (Warnings & Actions)
```sql
- id (PK)
- action_number (unique, e.g., 'DA-2025-001')
- employee_id (FK -> employees)
- report_id (FK -> misconduct_reports, nullable)
- investigation_id (FK -> investigations, nullable)
- action_type (enum: 'counseling', 'verbal_warning', 'first_written_warning',
               'final_written_warning', 'suspension', 'demotion',
               'salary_reduction', 'termination')
- action_level (int - 0:counseling, 1:verbal, 2:first_written,
                3:final_written, 4:termination)
-- Details
- issue_date (date)
- effective_date (date)
- expiry_date (date, nullable - for warnings)
- misconduct_description (text)
- previous_actions_referenced (json, nullable - array of action IDs)
- expected_improvement (text)
- consequences_if_repeated (text)
-- For Suspension
- suspension_days (int, nullable)
- suspension_with_pay (boolean, nullable)
-- For Demotion
- previous_position_id (FK -> positions, nullable)
- new_position_id (FK -> positions, nullable)
- previous_salary (decimal, nullable)
- new_salary (decimal, nullable)
-- For Salary Reduction
- reduction_percentage (decimal, nullable)
- reduction_duration_months (int, nullable)
-- Meeting
- meeting_date (datetime)
- meeting_attendees (json)
- employee_response (text, nullable)
- employee_representative (string, nullable)
-- Signatures
- employee_acknowledged (boolean, default false)
- employee_acknowledged_at (datetime, nullable)
- employee_signature_path (string, nullable)
- refused_to_sign (boolean, default false)
- refusal_witnessed_by (FK -> users, nullable)
- issued_by (FK -> users)
- approved_by (FK -> users)
- letter_path (string, nullable)
- status (enum: 'draft', 'issued', 'acknowledged', 'appealed',
         'appeal_upheld', 'appeal_overturned', 'expired', 'superseded')
- created_at
- updated_at
```

#### 3.7 `disciplinary_appeals` (Appeal Records)
```sql
- id (PK)
- appeal_number (unique)
- disciplinary_action_id (FK -> disciplinary_actions)
- employee_id (FK -> employees)
- appeal_date (date)
- appeal_deadline (date)
- grounds_for_appeal (text)
- supporting_evidence (text, nullable)
- evidence_paths (json, nullable)
-- Committee
- appeal_committee (json - array of user IDs)
- committee_chair_id (FK -> users)
-- Review
- review_date (date, nullable)
- committee_findings (text, nullable)
- committee_recommendation (enum: 'uphold', 'modify', 'overturn', nullable)
- recommended_modification (text, nullable)
-- Decision
- final_decision (enum: 'upheld', 'modified', 'overturned', nullable)
- decision_rationale (text, nullable)
- new_action_id (FK -> disciplinary_actions, nullable - if modified)
- decided_by (FK -> users, nullable)
- decision_date (date, nullable)
- decision_letter_path (string, nullable)
- status (enum: 'submitted', 'under_review', 'decided', 'withdrawn')
- created_at
- updated_at
```

#### 3.8 `employee_warning_history` (Warning Tracker)
```sql
- id (PK)
- employee_id (FK -> employees)
- warning_type (enum: 'verbal', 'first_written', 'final_written')
- disciplinary_action_id (FK -> disciplinary_actions)
- issue_date (date)
- expiry_date (date)
- is_active (boolean, default true)
- expired_at (datetime, nullable)
- superseded_by_id (FK -> disciplinary_actions, nullable)
- created_at
- updated_at
```

#### 3.9 `confidentiality_agreements` (NDA/Confidentiality)
```sql
- id (PK)
- employee_id (FK -> employees)
- agreement_type (enum: 'employment', 'investigation', 'project', 'termination')
- reference_id (string, nullable - e.g., investigation ID)
- signed_date (date)
- effective_from (date)
- effective_until (date, nullable)
- terms (text)
- document_path (string)
- signed (boolean, default false)
- witness_name (string, nullable)
- witness_signature_path (string, nullable)
- status (enum: 'draft', 'pending', 'signed', 'expired', 'breached')
- breach_date (date, nullable)
- breach_details (text, nullable)
- created_at
- updated_at
```

#### 3.10 `misconduct_case_notes` (Case Management Notes)
```sql
- id (PK)
- case_type (enum: 'report', 'investigation', 'disciplinary')
- case_id (int - polymorphic reference)
- note_type (enum: 'general', 'meeting', 'communication', 'decision', 'follow_up')
- note (text)
- is_confidential (boolean, default true)
- created_by (FK -> users)
- created_at
- updated_at
```

#### 3.11 `whistleblower_protections` (Protection Records)
```sql
- id (PK)
- report_id (FK -> misconduct_reports)
- whistleblower_id (FK -> users, nullable)
- protection_status (enum: 'active', 'monitoring', 'closed')
- identity_protected (boolean, default true)
- protection_measures (json)
- monitoring_notes (text, nullable)
- retaliation_reported (boolean, default false)
- retaliation_details (text, nullable)
- retaliation_action_taken (text, nullable)
- created_at
- updated_at
```

#### 3.12 `grievances` (Employee Grievances)
```sql
- id (PK)
- grievance_number (unique)
- employee_id (FK -> employees)
- grievance_date (date)
- grievance_type (enum: 'workplace', 'harassment', 'discrimination',
                  'unfair_treatment', 'policy', 'safety', 'other')
- against_employee_id (FK -> employees, nullable)
- against_department_id (FK -> departments, nullable)
- description (text)
- desired_resolution (text)
- supporting_documents (json, nullable)
-- Process
- assigned_to (FK -> users)
- acknowledged_at (datetime, nullable)
- investigation_required (boolean, default false)
- investigation_id (FK -> investigations, nullable)
-- Resolution
- resolution_date (date, nullable)
- resolution_summary (text, nullable)
- employee_satisfied (boolean, nullable)
- follow_up_required (boolean, default false)
- follow_up_notes (text, nullable)
- status (enum: 'submitted', 'acknowledged', 'investigating',
         'resolved', 'appealed', 'closed')
- created_at
- updated_at
```

#### 3.13 `compliance_incidents` (Zero Tolerance Incidents)
```sql
- id (PK)
- incident_number (unique)
- report_id (FK -> misconduct_reports)
- incident_type (enum: 'sea', 'pseah', 'child_protection',
                'fraud', 'corruption', 'violence')
- severity (enum: 'minor', 'major', 'critical')
- reported_to_authorities (boolean, default false)
- authority_name (string, nullable)
- authority_report_date (date, nullable)
- authority_reference (string, nullable)
- reported_to_donor (boolean, default false)
- donor_name (string, nullable)
- donor_report_date (date, nullable)
- internal_actions (text)
- external_actions (text, nullable)
- lessons_learned (text, nullable)
- preventive_measures (text, nullable)
- status (enum: 'open', 'under_investigation', 'reported', 'closed')
- closed_date (date, nullable)
- closed_by (FK -> users, nullable)
- created_at
- updated_at
```

---

## 4. State Machines

### 4.1 Misconduct Report Status Flow

```
        [RECEIVED]
            │
            │ HR assesses
            ▼
       [ASSESSING]
            │
     ┌──────┼──────┬──────────┐
     │      │      │          │
     ▼      ▼      ▼          ▼
[NO_ACTION] │ [RESOLVED] [ESCALATED]
            │      │          │
            ▼      │          │
   [INVESTIGATION_REQUIRED]   │
            │      │          │
            └──────┴──────────┘
                   │
                   ▼
             [COMPLETED]
```

### 4.2 Investigation Status Flow

```
       [PENDING]
           │
           │ Investigation starts
           ▼
     [IN_PROGRESS]
           │
           │ Interviews complete
           ▼
  [INTERVIEWS_COMPLETE]
           │
           │ Drafting report
           ▼
   [REPORT_DRAFTING]
           │
           │ Submit for review
           ▼
       [REVIEW]
           │
           │ Approved
           ▼
     [COMPLETED]
           │
           │ Action taken
           ▼
       [CLOSED]
```

### 4.3 Disciplinary Action Status Flow

```
        [DRAFT]
           │
           │ Approve and issue
           ▼
       [ISSUED]
           │
           │ Employee acknowledges
           ▼
    [ACKNOWLEDGED]
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
[APPEALED]   [ACTIVE/ENFORCED]
    │             │
    │             │ Validity expires
    │             ▼
    │        [EXPIRED]
    │
    │ Appeal decided
    ├─────────────────┐
    │                 │
    ▼                 ▼
[APPEAL_UPHELD] [APPEAL_OVERTURNED]
```

---

## 5. Business Rules

### 5.1 Progressive Discipline Rules

```php
// Rule 1: Check Warning History
function getNextWarningLevel(employee) {
    active_warnings = employee.active_warnings;

    if (has_active(active_warnings, 'final_written')) {
        return 'termination';
    }
    if (has_active(active_warnings, 'first_written')) {
        return 'final_written';
    }
    if (has_active(active_warnings, 'verbal')) {
        return 'first_written';
    }
    return 'verbal';
}

// Rule 2: Warning Expiry
function checkWarningExpiry() {
    expired_warnings = Warning::where('expiry_date', '<', today())
                              ->where('is_active', true)
                              ->get();

    foreach (expired_warnings as warning) {
        warning.is_active = false;
        warning.expired_at = now();
        warning.save();
    }
}

// Rule 3: Gross Misconduct - Skip Progressive Discipline
if (misconduct_category == 'gross' || in_array(type, zero_tolerance_areas)) {
    // Direct to termination process
    skip_progressive_discipline = true;
}

// Rule 4: Severity Determines Process
switch (severity_level) {
    case 'low':
        handler = 'manager';
        max_action = 'verbal_warning';
        break;
    case 'medium':
        handler = 'hr';
        max_action = 'written_warning';
        break;
    case 'high':
        handler = 'hr_committee';
        max_action = 'final_warning_or_termination';
        break;
    case 'critical':
        handler = 'investigation_committee';
        max_action = 'termination';
        immediate_suspension = true;
        break;
}
```

### 5.2 Investigation Rules

```php
// Rule 1: Investigation Timeline
max_investigation_days = 30; // Can be extended with approval
if (today() > investigation.start_date + max_investigation_days) {
    if (!investigation.extension_approved) {
        send_escalation_alert();
    }
}

// Rule 2: Right to Respond
// Accused must be informed within 48 hours
// Accused has right to respond before decision
// Accused can bring representative to hearings

// Rule 3: Conflict of Interest
function validateInvestigator(investigator, accused) {
    if (investigator.department_id == accused.department_id) {
        return false; // Conflict
    }
    if (investigator.reports_to == accused.id) {
        return false; // Conflict
    }
    return true;
}

// Rule 4: Confidentiality
// All parties must sign confidentiality agreement
// Anonymous reports - identity protected
```

### 5.3 Appeal Rules

```php
// Rule 1: Appeal Deadline
appeal_deadline_days = 7;
if (today() > action.issue_date + appeal_deadline_days) {
    appeal_not_allowed = true;
}

// Rule 2: Appeal Committee Independence
// Committee members cannot be original investigators
// Committee must include HR and senior management

// Rule 3: Appeal Outcomes
// Uphold - Original decision stands
// Modify - Change severity of sanction
// Overturn - Cancel original action
```

---

## 6. API Endpoints (Laravel Routes)

```php
Route::prefix('api/disciplinary')->group(function () {

    // Misconduct Reports
    Route::apiResource('reports', MisconductReportController::class);
    Route::post('reports/{id}/assess', [MisconductReportController::class, 'assess']);
    Route::post('reports/{id}/escalate', [MisconductReportController::class, 'escalate']);
    Route::post('reports/anonymous', [MisconductReportController::class, 'anonymous']);
    Route::apiResource('reports.evidence', EvidenceController::class);

    // Investigations
    Route::apiResource('investigations', InvestigationController::class);
    Route::prefix('investigations/{id}')->group(function () {
        Route::post('start', [InvestigationController::class, 'start']);
        Route::post('assign-committee', [InvestigationController::class, 'assignCommittee']);
        Route::apiResource('interviews', InterviewController::class);
        Route::post('submit-report', [InvestigationController::class, 'submitReport']);
        Route::post('complete', [InvestigationController::class, 'complete']);
    });

    // Precautionary Suspensions
    Route::apiResource('suspensions', SuspensionController::class);
    Route::post('suspensions/{id}/extend', [SuspensionController::class, 'extend']);
    Route::post('suspensions/{id}/lift', [SuspensionController::class, 'lift']);

    // Disciplinary Actions
    Route::apiResource('actions', DisciplinaryActionController::class);
    Route::prefix('actions/{id}')->group(function () {
        Route::post('issue', [DisciplinaryActionController::class, 'issue']);
        Route::post('acknowledge', [DisciplinaryActionController::class, 'acknowledge']);
        Route::post('refuse-sign', [DisciplinaryActionController::class, 'refuseSign']);
    });

    // Appeals
    Route::apiResource('appeals', AppealController::class);
    Route::post('appeals/{id}/submit-review', [AppealController::class, 'submitReview']);
    Route::post('appeals/{id}/decide', [AppealController::class, 'decide']);

    // Grievances
    Route::apiResource('grievances', GrievanceController::class);
    Route::post('grievances/{id}/acknowledge', [GrievanceController::class, 'acknowledge']);
    Route::post('grievances/{id}/resolve', [GrievanceController::class, 'resolve']);

    // Employee Warning History
    Route::get('employees/{employee}/warnings', [WarningHistoryController::class, 'index']);
    Route::get('employees/{employee}/active-warnings', [WarningHistoryController::class, 'active']);
    Route::get('employees/{employee}/disciplinary-history', [WarningHistoryController::class, 'fullHistory']);

    // Compliance Incidents
    Route::apiResource('compliance-incidents', ComplianceIncidentController::class);
    Route::post('compliance-incidents/{id}/report-authority', [ComplianceIncidentController::class, 'reportToAuthority']);
    Route::post('compliance-incidents/{id}/report-donor', [ComplianceIncidentController::class, 'reportToDonor']);

    // Confidentiality
    Route::apiResource('confidentiality-agreements', ConfidentialityController::class);
    Route::post('confidentiality-agreements/{id}/sign', [ConfidentialityController::class, 'sign']);
    Route::post('confidentiality-agreements/{id}/breach', [ConfidentialityController::class, 'recordBreach']);

    // Whistleblower
    Route::get('whistleblower/reports', [WhistleblowerController::class, 'reports']);
    Route::post('whistleblower/report-retaliation', [WhistleblowerController::class, 'reportRetaliation']);

    // Reports & Analytics
    Route::prefix('reports')->group(function () {
        Route::get('summary', [DisciplinaryReportController::class, 'summary']);
        Route::get('by-type', [DisciplinaryReportController::class, 'byType']);
        Route::get('by-department', [DisciplinaryReportController::class, 'byDepartment']);
        Route::get('trends', [DisciplinaryReportController::class, 'trends']);
        Route::get('compliance', [DisciplinaryReportController::class, 'compliance']);
    });
});
```

---

## 7. Livewire Components Structure

```
app/Livewire/Disciplinary/
├── Dashboard.php                    # Disciplinary overview
├── Reports/
│   ├── ReportList.php              # All misconduct reports
│   ├── ReportForm.php              # Submit report
│   ├── AnonymousReport.php         # Anonymous submission
│   ├── ReportAssessment.php        # Initial assessment
│   └── ReportDetail.php            # View report details
├── Investigations/
│   ├── InvestigationList.php       # All investigations
│   ├── InvestigationForm.php       # Create investigation
│   ├── InvestigationDetail.php     # View investigation
│   ├── InterviewForm.php           # Record interview
│   ├── EvidenceManager.php         # Manage evidence
│   └── InvestigationReport.php     # Generate report
├── Actions/
│   ├── ActionList.php              # All disciplinary actions
│   ├── WarningForm.php             # Issue warning
│   ├── ActionDetail.php            # View action
│   ├── AcknowledgmentForm.php      # Employee acknowledgment
│   └── WarningHistory.php          # Employee warning history
├── Appeals/
│   ├── AppealList.php              # All appeals
│   ├── AppealForm.php              # Submit appeal
│   ├── AppealReview.php            # Review appeal
│   └── AppealDecision.php          # Record decision
├── Suspensions/
│   ├── SuspensionList.php          # All suspensions
│   ├── SuspensionForm.php          # Create suspension
│   └── SuspensionManagement.php    # Extend/lift
├── Grievances/
│   ├── GrievanceList.php           # All grievances
│   ├── GrievanceForm.php           # Submit grievance
│   └── GrievanceResolution.php     # Resolve grievance
├── Compliance/
│   ├── IncidentList.php            # Compliance incidents
│   ├── IncidentForm.php            # Record incident
│   └── AuthorityReporting.php      # Report to authorities
├── Employee/
│   ├── MyWarnings.php              # Employee's warnings
│   ├── MyGrievances.php            # My grievances
│   └── SubmitGrievance.php         # Submit grievance
└── Reports/
    ├── SummaryReport.php           # Summary statistics
    ├── TrendAnalysis.php           # Trends over time
    └── ComplianceReport.php        # Zero tolerance compliance
```

---

## 8. Notifications & Alerts

| Event | Recipients | Channel |
|-------|------------|---------|
| Misconduct report received | HR | Email |
| Investigation assigned | Investigator | Email |
| Interview scheduled | Interviewee | Email |
| Warning issued | Employee, HR | Email |
| Warning acknowledgment pending | Employee | Email (daily) |
| Appeal submitted | HR, Committee | Email |
| Appeal decision | Employee | Email |
| Suspension started | Employee, Manager, HR | Email |
| Warning expiring (7 days) | HR | Email |
| Zero tolerance incident | ED, HR Director | Urgent Email |
| Grievance submitted | HR | Email |
| Grievance resolution | Employee | Email |

---

## 9. Dashboard Metrics

### HR Dashboard
- Open misconduct reports
- Active investigations
- Pending warnings (unsigned)
- Active suspensions
- Pending appeals
- Warning expiry alerts
- Zero tolerance incidents (YTD)
- Misconduct by type (chart)
- Trend analysis

### Management Dashboard
- Department disciplinary summary
- High-risk employees
- Investigation status
- Compliance metrics

### Employee Dashboard
- My active warnings
- Warning history
- My grievances
- Appeal status

---

## 10. Confidentiality & Access Control

### Access Levels
| Role | Access |
|------|--------|
| Employee | Own records only |
| Manager | Team records (limited) |
| HR Officer | All standard cases |
| HR Director | All cases including sensitive |
| Investigation Committee | Assigned cases only |
| ED/DD | Full access |

### Data Protection
- Anonymous report identity protected
- Investigation details restricted
- Sealed records after case closure
- Audit trail for all access
- Encryption for sensitive documents
