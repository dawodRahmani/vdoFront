# VDO Training & Capacity Building System Design
## Laravel + Livewire Implementation

---

## 1. Training & Capacity Building Overview

### Training Types
| Type | Description | Duration | Funding |
|------|-------------|----------|---------|
| **Induction/Orientation** | New employee onboarding | 1-3 days | Organization |
| **Technical Skills** | Job-specific skills | Varies | Project/Organization |
| **Soft Skills** | Communication, leadership | 1-5 days | Organization |
| **Compliance/Mandatory** | PSEAH, Safeguarding, Code of Conduct | 1-2 days | Organization |
| **Professional Development** | Career growth, certifications | Varies | Shared/Bond |
| **External Training** | Workshops, conferences | Varies | Project/Donor |
| **On-the-Job Training** | Mentoring, shadowing | Ongoing | N/A |

### Training Categories (From TNA)
| Category | Areas |
|----------|-------|
| **Core Job Performance** | Technical skills, quality, productivity, field management |
| **Compliance** | PSEAH, safeguarding, child protection, code of conduct |
| **Organizational** | Policy adherence, conflict management, communication |
| **Language** | English, Dari, Pashto proficiency |
| **IT Skills** | Computer, software, systems |
| **Leadership** | Management, decision-making, team building |

### TNA Score Interpretation
| Score Range | Level | Action |
|-------------|-------|--------|
| 1-20 | Very Weak | Complete training required |
| 21-40 | Average | Multiple targeted trainings |
| 41-60 | Good | Regular trainings |
| 61-80 | Proficient | Refresher only |
| 81-100 | Expert | Can be trainer |

---

## 2. Process Workflows

### 2.1 Training Needs Assessment (TNA) Process

```
Step 1: INITIATE TNA
┌─────────────────────────────────────────────────────────────┐
│  HR Department (Annual or as needed)                        │
│  - Set TNA period                                           │
│  - Distribute TNA forms to managers                         │
│  - Define assessment criteria                               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 2: MANAGER ASSESSMENT
┌─────────────────────────────────────────────────────────────┐
│  Line Managers                                              │
│  - Assess each team member on 25 competencies               │
│  - Rate skills (1-5 scale)                                  │
│  - Identify training needs                                  │
│  - Set priority (High/Medium/Low)                           │
│  - Submit to HR                                             │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 3: HR CONSOLIDATION
┌─────────────────────────────────────────────────────────────┐
│  HR Department                                              │
│  - Collect all TNA forms                                    │
│  - Analyze organization-wide gaps                           │
│  - Identify common training needs                           │
│  - Prioritize trainings                                     │
│  - Create training plan                                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 4: TRAINING PLAN APPROVAL
┌─────────────────────────────────────────────────────────────┐
│  Management                                                 │
│  - Review training plan                                     │
│  - Approve budget                                           │
│  - Set annual calendar                                      │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Training Program Planning

```
Step 1: TRAINING REQUEST/IDENTIFICATION
┌─────────────────────────────────────────────────────────────┐
│  Sources:                                                   │
│  - TNA results                                              │
│  - Manager request                                          │
│  - Employee request                                         │
│  - Compliance requirements                                  │
│  - Project requirements                                     │
│  - Performance appraisal recommendations                    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 2: BUDGET PROPOSAL
┌─────────────────────────────────────────────────────────────┐
│  HR/Requesting Department                                   │
│  - Define training objectives                               │
│  - Identify trainer (internal/external)                     │
│  - Estimate costs:                                          │
│    • Trainer fees                                           │
│    • Materials                                              │
│    • Venue                                                  │
│    • Travel/Accommodation                                   │
│    • Refreshments                                           │
│    • Technology/Tools                                       │
│  - Add contingency (5-10%)                                  │
│  - Submit for approval                                      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 3: APPROVAL & SCHEDULING
┌─────────────────────────────────────────────────────────────┐
│  Management/Finance                                         │
│  - Review budget proposal                                   │
│  - Approve/modify budget                                    │
│  - Allocate funding source                                  │
│  - Add to training calendar                                 │
│  - Assign responsible person                                │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Training Implementation

```
Step 1: PRE-TRAINING
┌─────────────────────────────────────────────────────────────┐
│  HR/Training Coordinator                                    │
│  - Finalize participant list                                │
│  - Send invitations/notifications                           │
│  - Book venue                                               │
│  - Arrange trainer                                          │
│  - Prepare materials                                        │
│  - Conduct pre-training assessment (if applicable)          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 2: TRAINING DELIVERY
┌─────────────────────────────────────────────────────────────┐
│  Trainer                                                    │
│  - Conduct training sessions                                │
│  - Record attendance                                        │
│  - Engage participants                                      │
│  - Conduct assessments/tests                                │
│  - Collect feedback                                         │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 3: POST-TRAINING
┌─────────────────────────────────────────────────────────────┐
│  HR/Training Coordinator                                    │
│  - Collect attendance records                               │
│  - Collect training evaluations                             │
│  - Issue certificates                                       │
│  - Update employee training records                         │
│  - Conduct post-training assessment                         │
│  - Prepare training report                                  │
└─────────────────────────────────────────────────────────────┘
```

### 2.4 Training Follow-Up

```
Step 1: IMMEDIATE FOLLOW-UP (1-2 weeks)
┌─────────────────────────────────────────────────────────────┐
│  - Post-training evaluation (Level 1: Reaction)             │
│  - Knowledge test (Level 2: Learning)                       │
│  - Trainer feedback review                                  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 2: APPLICATION MONITORING (1-3 months)
┌─────────────────────────────────────────────────────────────┐
│  Line Manager                                               │
│  - Observe skill application (Level 3: Behavior)            │
│  - Provide feedback                                         │
│  - Support implementation                                   │
│  - Report progress to HR                                    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 3: IMPACT ASSESSMENT (6-12 months)
┌─────────────────────────────────────────────────────────────┐
│  HR/Management                                              │
│  - Measure performance improvement (Level 4: Results)       │
│  - ROI analysis (if applicable)                             │
│  - Update TNA records                                       │
│  - Plan follow-up trainings                                 │
└─────────────────────────────────────────────────────────────┘
```

### 2.5 Training Bond Process

```
For expensive external trainings:

┌─────────────────────────────────────────────────────────────┐
│  PRE-TRAINING                                               │
│  - Calculate training cost                                  │
│  - Determine bond duration (typically 1-2 years)            │
│  - Employee signs training bond agreement                   │
│  - Specifies recovery terms if leaving early                │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  IF EMPLOYEE LEAVES BEFORE BOND PERIOD                      │
│  - Calculate remaining bond period                          │
│  - Pro-rate recovery amount                                 │
│  - Deduct from final settlement                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema

### Core Tables

#### 3.1 `training_needs_assessments` (TNA Records)
```sql
- id (PK)
- assessment_number (unique)
- employee_id (FK -> employees)
- assessor_id (FK -> users - usually manager)
- assessment_date (date)
- assessment_period (string, e.g., '2025')
-- Scores (each 1-5)
- job_knowledge_score (int)
- quality_of_work_score (int)
- productivity_score (int)
- field_management_score (int)
- local_language_score (int)
- english_score (int)
- communication_score (int)
- teamwork_score (int)
- initiative_score (int)
- public_relations_score (int)
- punctuality_score (int)
- adaptability_score (int)
- overall_performance_score (int)
-- Compliance Scores
- aap_score (int)
- pseah_score (int)
- safeguarding_score (int)
- child_protection_score (int)
- code_of_conduct_score (int)
- confidentiality_score (int)
-- Organizational Competency Scores
- policy_adherence_score (int)
- conflict_management_score (int)
- expertise_score (int)
- commitment_score (int)
- sustainability_score (int)
- behavior_score (int)
-- Totals
- total_score (int, computed)
- max_score (int, default 125 for 25 criteria * 5)
- percentage_score (decimal, computed)
- training_level (enum: 'complete', 'targeted', 'regular', 'refresher', 'expert')
-- Action Plan
- training_priority (enum: 'high', 'medium', 'low')
- suggested_training_date (date, nullable)
- responsible_person_id (FK -> users, nullable)
- remarks (text, nullable)
-- Signatures
- employee_signature_path (string, nullable)
- supervisor_signature_path (string, nullable)
- hr_signature_path (string, nullable)
- status (enum: 'draft', 'submitted', 'reviewed', 'approved')
- created_at
- updated_at
```

#### 3.2 `tna_training_needs` (Identified Training Needs)
```sql
- id (PK)
- tna_id (FK -> training_needs_assessments)
- competency_area (string)
- current_level (int, 1-5)
- target_level (int, 1-5)
- training_type_id (FK -> training_types)
- priority (enum: 'high', 'medium', 'low')
- target_completion_date (date, nullable)
- notes (text, nullable)
- status (enum: 'identified', 'planned', 'completed')
- created_at
- updated_at
```

#### 3.3 `training_types` (Training Categories)
```sql
- id (PK)
- code (unique)
- name
- category (enum: 'technical', 'soft_skills', 'compliance',
           'leadership', 'it', 'language', 'professional', 'other')
- description (text)
- is_mandatory (boolean, default false)
- recurrence_months (int, nullable - for mandatory refreshers)
- default_duration_days (decimal, nullable)
- is_active (boolean, default true)
- created_at
- updated_at
```

#### 3.4 `training_programs` (Training Courses/Programs)
```sql
- id (PK)
- program_code (unique)
- title
- training_type_id (FK -> training_types)
- description (text)
- objectives (text)
- target_audience (text)
- prerequisites (text, nullable)
- duration_days (decimal)
- duration_hours (decimal)
- delivery_method (enum: 'classroom', 'online', 'hybrid',
                   'on_the_job', 'self_paced')
- max_participants (int, nullable)
- min_participants (int, nullable)
- is_certified (boolean, default false)
- certification_validity_months (int, nullable)
- is_active (boolean, default true)
- created_at
- updated_at
```

#### 3.5 `training_calendar` (Annual Training Schedule)
```sql
- id (PK)
- fiscal_year (int)
- quarter (int, nullable)
- month (int, nullable)
- week (int, nullable)
- training_program_id (FK -> training_programs)
- planned_start_date (date)
- planned_end_date (date)
- status (enum: 'planned', 'confirmed', 'in_progress',
         'completed', 'postponed', 'cancelled')
- notes (text, nullable)
- created_at
- updated_at
```

#### 3.6 `training_budget_proposals` (Budget Requests)
```sql
- id (PK)
- proposal_number (unique)
- training_program_id (FK -> training_programs, nullable)
- title
- department_id (FK -> departments)
- prepared_by (FK -> users)
- preparation_date (date)
- training_purpose (text)
- training_objectives (text)
-- Cost Items
- trainer_fees (decimal, default 0)
- materials_cost (decimal, default 0)
- venue_cost (decimal, default 0)
- travel_accommodation (decimal, default 0)
- refreshments_cost (decimal, default 0)
- technology_cost (decimal, default 0)
- miscellaneous_cost (decimal, default 0)
- subtotal (decimal, computed)
- contingency_percentage (decimal, default 5)
- contingency_amount (decimal, computed)
- total_budget (decimal, computed)
- currency (enum: 'AFN', 'USD')
-- Funding
- funding_source (enum: 'organization', 'project', 'donor', 'shared')
- project_id (FK -> projects, nullable)
- donor_id (FK -> donors, nullable)
-- Approval
- status (enum: 'draft', 'submitted', 'approved', 'rejected', 'revised')
- approved_by (FK -> users, nullable)
- approved_at (datetime, nullable)
- approval_comments (text, nullable)
- created_at
- updated_at
```

#### 3.7 `trainings` (Training Sessions/Events)
```sql
- id (PK)
- training_code (unique, e.g., 'TRN-2025-001')
- training_program_id (FK -> training_programs)
- calendar_id (FK -> training_calendar, nullable)
- budget_proposal_id (FK -> training_budget_proposals, nullable)
- title
- description (text)
- objectives (text)
-- Schedule
- start_date (date)
- end_date (date)
- start_time (time)
- end_time (time)
- total_hours (decimal)
-- Location
- venue_type (enum: 'internal', 'external', 'online')
- venue_name (string, nullable)
- venue_address (text, nullable)
- online_platform (string, nullable)
- online_link (string, nullable)
-- Trainer
- trainer_type (enum: 'internal', 'external')
- trainer_id (FK -> users, nullable - for internal)
- external_trainer_name (string, nullable)
- external_trainer_organization (string, nullable)
- external_trainer_contact (string, nullable)
-- Participants
- target_participants (int)
- actual_participants (int, default 0)
- department_id (FK -> departments, nullable - if dept specific)
- project_id (FK -> projects, nullable)
-- Status
- status (enum: 'draft', 'scheduled', 'confirmed', 'in_progress',
         'completed', 'cancelled', 'postponed')
- cancellation_reason (text, nullable)
- completed_at (datetime, nullable)
- created_by (FK -> users)
- created_at
- updated_at
```

#### 3.8 `training_participants` (Attendance)
```sql
- id (PK)
- training_id (FK -> trainings)
- employee_id (FK -> employees)
- tna_need_id (FK -> tna_training_needs, nullable - links to TNA)
- invited_at (datetime)
- invitation_status (enum: 'pending', 'accepted', 'declined')
- decline_reason (text, nullable)
-- Attendance
- attended (boolean, default false)
- attendance_percentage (decimal, nullable)
- attendance_notes (text, nullable)
-- Assessment
- pre_assessment_score (decimal, nullable)
- post_assessment_score (decimal, nullable)
- improvement_percentage (decimal, nullable)
- passed (boolean, nullable)
-- Feedback
- feedback_submitted (boolean, default false)
- feedback_rating (int, nullable - 1-5)
- feedback_comments (text, nullable)
-- Certificate
- certificate_eligible (boolean, default false)
- certificate_issued (boolean, default false)
- certificate_id (FK -> training_certificates, nullable)
- created_at
- updated_at
```

#### 3.9 `training_sessions` (Multi-day Session Tracking)
```sql
- id (PK)
- training_id (FK -> trainings)
- session_number (int)
- session_date (date)
- start_time (time)
- end_time (time)
- topic (string)
- description (text, nullable)
- trainer_id (FK -> users, nullable)
- status (enum: 'scheduled', 'completed', 'cancelled')
- created_at
- updated_at
```

#### 3.10 `training_session_attendance` (Per-Session Attendance)
```sql
- id (PK)
- session_id (FK -> training_sessions)
- participant_id (FK -> training_participants)
- present (boolean)
- arrival_time (time, nullable)
- departure_time (time, nullable)
- remarks (text, nullable)
- created_at
- updated_at
```

#### 3.11 `training_materials` (Training Resources)
```sql
- id (PK)
- training_id (FK -> trainings)
- title
- material_type (enum: 'presentation', 'handout', 'video',
                'document', 'exercise', 'assessment', 'other')
- file_path (string, nullable)
- external_link (string, nullable)
- description (text, nullable)
- is_required (boolean, default false)
- uploaded_by (FK -> users)
- created_at
- updated_at
```

#### 3.12 `training_evaluations` (Training Feedback)
```sql
- id (PK)
- training_id (FK -> trainings)
- participant_id (FK -> training_participants)
- evaluation_date (date)
-- Content Ratings (1-5)
- relevance_rating (int)
- content_quality_rating (int)
- materials_rating (int)
-- Delivery Ratings
- trainer_knowledge_rating (int)
- trainer_delivery_rating (int)
- engagement_rating (int)
-- Logistics Ratings
- venue_rating (int)
- duration_rating (int)
- organization_rating (int)
-- Overall
- overall_rating (int)
- would_recommend (boolean)
-- Open Feedback
- most_valuable (text, nullable)
- least_valuable (text, nullable)
- suggestions (text, nullable)
- additional_training_needs (text, nullable)
- created_at
- updated_at
```

#### 3.13 `training_certificates` (Issued Certificates)
```sql
- id (PK)
- certificate_number (unique)
- training_id (FK -> trainings)
- employee_id (FK -> employees)
- certificate_title
- training_title
- training_date (date)
- completion_date (date)
- hours_completed (decimal)
- grade (string, nullable)
- issue_date (date)
- expiry_date (date, nullable)
- issued_by (FK -> users)
- signatory_name (string)
- signatory_title (string)
- certificate_path (string, nullable)
- status (enum: 'draft', 'issued', 'revoked', 'expired')
- created_at
- updated_at
```

#### 3.14 `training_bonds` (Training Agreement)
```sql
- id (PK)
- employee_id (FK -> employees)
- training_id (FK -> trainings)
- bond_number (unique)
- training_cost (decimal)
- currency (enum: 'AFN', 'USD')
- bond_start_date (date)
- bond_end_date (date)
- bond_duration_months (int)
- recovery_terms (text)
- employee_signed (boolean, default false)
- employee_signed_at (datetime, nullable)
- witness_name (string, nullable)
- document_path (string, nullable)
- status (enum: 'draft', 'signed', 'active', 'completed',
         'breached', 'waived')
- breach_date (date, nullable)
- recovery_amount (decimal, nullable)
- recovery_status (enum: 'pending', 'partial', 'full', 'waived', nullable)
- created_at
- updated_at
```

#### 3.15 `employee_training_history` (Training Records)
```sql
- id (PK)
- employee_id (FK -> employees)
- training_type_id (FK -> training_types)
- training_id (FK -> trainings, nullable - for internal)
- training_title
- training_provider (string)
- start_date (date)
- end_date (date)
- hours (decimal)
- is_external (boolean, default false)
- certificate_obtained (boolean, default false)
- certificate_id (FK -> training_certificates, nullable)
- grade (string, nullable)
- cost (decimal, nullable)
- funded_by (enum: 'organization', 'project', 'self', 'donor')
- remarks (text, nullable)
- verified_by (FK -> users, nullable)
- created_at
- updated_at
```

#### 3.16 `training_reports` (Training Summary Reports)
```sql
- id (PK)
- training_id (FK -> trainings)
- report_number (unique)
- prepared_by (FK -> users)
- report_date (date)
-- Summary
- total_invited (int)
- total_attended (int)
- attendance_rate (decimal)
- average_pre_score (decimal, nullable)
- average_post_score (decimal, nullable)
- average_improvement (decimal, nullable)
- pass_rate (decimal, nullable)
-- Evaluation Summary
- average_content_rating (decimal)
- average_trainer_rating (decimal)
- average_overall_rating (decimal)
- recommendation_rate (decimal)
-- Costs
- budgeted_cost (decimal)
- actual_cost (decimal)
- cost_variance (decimal)
- cost_per_participant (decimal)
-- Findings
- key_achievements (text)
- challenges (text)
- recommendations (text)
- follow_up_actions (text)
- document_path (string, nullable)
- status (enum: 'draft', 'submitted', 'approved')
- approved_by (FK -> users, nullable)
- created_at
- updated_at
```

---

## 4. State Machines

### 4.1 Training Status Flow

```
       [DRAFT]
          │
          │ Schedule
          ▼
     [SCHEDULED]
          │
          │ Confirm participants
          ▼
     [CONFIRMED]
          │
          │ Training starts
          ▼
    [IN_PROGRESS]
          │
          │ Training ends
          ▼
     [COMPLETED]
```

### 4.2 Budget Proposal Status Flow

```
      [DRAFT]
         │
         │ Submit
         ▼
    [SUBMITTED]
         │
    ┌────┴────┐
    │         │
    ▼         ▼
[APPROVED] [REJECTED]
              │
              │ Revise and resubmit
              ▼
          [REVISED]
              │
              └──► [SUBMITTED]
```

### 4.3 Participant Status Flow

```
     [INVITED]
         │
    ┌────┴────┐
    │         │
    ▼         ▼
[ACCEPTED] [DECLINED]
    │
    │ Training day
    ▼
[ATTENDED/NOT_ATTENDED]
    │
    │ Complete assessment
    ▼
[PASSED/FAILED]
    │
    │ If passed
    ▼
[CERTIFIED]
```

---

## 5. Business Rules

### 5.1 TNA Rules

```php
// Rule 1: Score Calculation
total_score = sum(all_competency_scores);
max_score = 25 * 5; // 25 criteria, max 5 each
percentage = (total_score / max_score) * 100;

// Rule 2: Training Level Assignment
if (percentage <= 20) {
    level = 'complete'; // Needs complete training
} else if (percentage <= 40) {
    level = 'targeted'; // Multiple targeted trainings
} else if (percentage <= 60) {
    level = 'regular'; // Regular trainings
} else if (percentage <= 80) {
    level = 'refresher'; // Only refresher needed
} else {
    level = 'expert'; // Can be trainer
}

// Rule 3: Mandatory TNA
// All employees must have TNA annually
// New employees within 3 months of joining
```

### 5.2 Training Rules

```php
// Rule 1: Minimum Participants
if (training.actual_participants < training.min_participants) {
    alert_hr_for_cancellation_or_postpone();
}

// Rule 2: Certificate Eligibility
if (participant.attendance_percentage >= 80
    && participant.post_assessment_score >= passing_score) {
    participant.certificate_eligible = true;
}

// Rule 3: Mandatory Training Refresh
if (training_type.is_mandatory && training_type.recurrence_months) {
    last_training = get_last_training(employee, training_type);
    if (months_since(last_training) >= training_type.recurrence_months) {
        create_training_notification(employee);
    }
}

// Rule 4: Training Bond Threshold
bond_threshold = 50000; // AFN
if (training_cost >= bond_threshold) {
    require_training_bond = true;
}
```

### 5.3 Bond Recovery Rules

```php
// Rule 1: Pro-rata Recovery
if (employee.is_leaving && employee.has_active_bond) {
    bond = employee.active_training_bond;
    total_months = bond.bond_duration_months;
    served_months = months_between(bond.start_date, employee.last_day);
    remaining_months = total_months - served_months;

    recovery = (bond.training_cost / total_months) * remaining_months;
    add_to_final_settlement_deduction(recovery);
}

// Rule 2: Bond Waiver
// Only ED/DD can approve bond waiver
// Document reason for waiver
```

---

## 6. API Endpoints (Laravel Routes)

```php
Route::prefix('api/training')->group(function () {

    // TNA
    Route::apiResource('tna', TnaController::class);
    Route::post('tna/{id}/submit', [TnaController::class, 'submit']);
    Route::post('tna/{id}/approve', [TnaController::class, 'approve']);
    Route::get('tna/employee/{employee}', [TnaController::class, 'byEmployee']);
    Route::get('tna/department/{department}', [TnaController::class, 'byDepartment']);
    Route::apiResource('tna.needs', TnaNeedsController::class);

    // Training Types & Programs
    Route::apiResource('types', TrainingTypeController::class);
    Route::apiResource('programs', TrainingProgramController::class);

    // Calendar
    Route::apiResource('calendar', TrainingCalendarController::class);
    Route::get('calendar/year/{year}', [TrainingCalendarController::class, 'byYear']);

    // Budget Proposals
    Route::apiResource('budgets', BudgetProposalController::class);
    Route::post('budgets/{id}/submit', [BudgetProposalController::class, 'submit']);
    Route::post('budgets/{id}/approve', [BudgetProposalController::class, 'approve']);
    Route::post('budgets/{id}/reject', [BudgetProposalController::class, 'reject']);

    // Trainings
    Route::apiResource('trainings', TrainingController::class);
    Route::prefix('trainings/{id}')->group(function () {
        Route::post('schedule', [TrainingController::class, 'schedule']);
        Route::post('confirm', [TrainingController::class, 'confirm']);
        Route::post('start', [TrainingController::class, 'start']);
        Route::post('complete', [TrainingController::class, 'complete']);
        Route::post('cancel', [TrainingController::class, 'cancel']);
        Route::post('postpone', [TrainingController::class, 'postpone']);

        // Participants
        Route::apiResource('participants', ParticipantController::class);
        Route::post('participants/invite-bulk', [ParticipantController::class, 'inviteBulk']);
        Route::post('participants/{pid}/attendance', [ParticipantController::class, 'recordAttendance']);
        Route::post('participants/{pid}/assessment', [ParticipantController::class, 'submitAssessment']);

        // Sessions
        Route::apiResource('sessions', TrainingSessionController::class);
        Route::post('sessions/{sid}/attendance', [TrainingSessionController::class, 'recordAttendance']);

        // Materials
        Route::apiResource('materials', TrainingMaterialController::class);

        // Evaluations
        Route::apiResource('evaluations', TrainingEvaluationController::class);

        // Report
        Route::get('report', [TrainingReportController::class, 'show']);
        Route::post('report', [TrainingReportController::class, 'generate']);
    });

    // Certificates
    Route::apiResource('certificates', CertificateController::class);
    Route::post('certificates/{id}/issue', [CertificateController::class, 'issue']);
    Route::get('certificates/{id}/download', [CertificateController::class, 'download']);
    Route::post('certificates/bulk-issue/{trainingId}', [CertificateController::class, 'bulkIssue']);

    // Bonds
    Route::apiResource('bonds', TrainingBondController::class);
    Route::post('bonds/{id}/sign', [TrainingBondController::class, 'sign']);
    Route::post('bonds/{id}/complete', [TrainingBondController::class, 'complete']);
    Route::post('bonds/{id}/breach', [TrainingBondController::class, 'recordBreach']);
    Route::post('bonds/{id}/waive', [TrainingBondController::class, 'waive']);

    // Employee Training History
    Route::get('employees/{employee}/history', [TrainingHistoryController::class, 'index']);
    Route::post('employees/{employee}/external', [TrainingHistoryController::class, 'addExternal']);
    Route::get('employees/{employee}/certificates', [TrainingHistoryController::class, 'certificates']);
    Route::get('employees/{employee}/pending-mandatory', [TrainingHistoryController::class, 'pendingMandatory']);

    // My Training (Employee)
    Route::prefix('my')->group(function () {
        Route::get('trainings', [MyTrainingController::class, 'upcoming']);
        Route::get('history', [MyTrainingController::class, 'history']);
        Route::get('certificates', [MyTrainingController::class, 'certificates']);
        Route::post('trainings/{id}/accept', [MyTrainingController::class, 'acceptInvitation']);
        Route::post('trainings/{id}/decline', [MyTrainingController::class, 'declineInvitation']);
        Route::post('trainings/{id}/feedback', [MyTrainingController::class, 'submitFeedback']);
    });

    // Reports
    Route::prefix('reports')->group(function () {
        Route::get('annual/{year}', [TrainingReportController::class, 'annual']);
        Route::get('department/{department}', [TrainingReportController::class, 'byDepartment']);
        Route::get('tna-summary', [TrainingReportController::class, 'tnaSummary']);
        Route::get('budget-utilization', [TrainingReportController::class, 'budgetUtilization']);
        Route::get('mandatory-compliance', [TrainingReportController::class, 'mandatoryCompliance']);
    });
});
```

---

## 7. Livewire Components Structure

```
app/Livewire/Training/
├── Dashboard.php                    # Training overview
├── TNA/
│   ├── TnaList.php                 # All TNAs
│   ├── TnaForm.php                 # Conduct TNA
│   ├── TnaSummary.php              # Department summary
│   └── TnaApproval.php             # Review/approve
├── Programs/
│   ├── ProgramList.php             # Training programs
│   ├── ProgramForm.php             # Create/edit program
│   └── TypeManager.php             # Manage types
├── Calendar/
│   ├── CalendarView.php            # Annual calendar
│   ├── CalendarEntry.php           # Add to calendar
│   └── MonthlyView.php             # Monthly breakdown
├── Budget/
│   ├── BudgetList.php              # All proposals
│   ├── BudgetForm.php              # Create proposal
│   └── BudgetApproval.php          # Approve/reject
├── Trainings/
│   ├── TrainingList.php            # All trainings
│   ├── TrainingForm.php            # Create/edit training
│   ├── TrainingDetail.php          # View training
│   ├── ParticipantManager.php      # Manage participants
│   ├── AttendanceSheet.php         # Record attendance
│   ├── SessionManager.php          # Multi-day sessions
│   └── MaterialUpload.php          # Upload materials
├── Evaluation/
│   ├── EvaluationForm.php          # Feedback form
│   ├── EvaluationSummary.php       # Summary view
│   └── AssessmentForm.php          # Pre/post test
├── Certificates/
│   ├── CertificateList.php         # All certificates
│   ├── CertificateGenerator.php    # Generate certificate
│   └── BulkIssue.php               # Bulk issue
├── Bonds/
│   ├── BondList.php                # All bonds
│   ├── BondForm.php                # Create bond
│   └── BondStatus.php              # Track status
├── Employee/
│   ├── MyTrainings.php             # Employee's trainings
│   ├── MyHistory.php               # Training history
│   ├── MyCertificates.php          # My certificates
│   └── FeedbackForm.php            # Submit feedback
└── Reports/
    ├── AnnualReport.php            # Yearly summary
    ├── TnaReport.php               # TNA analysis
    ├── BudgetReport.php            # Budget utilization
    └── ComplianceReport.php        # Mandatory tracking
```

---

## 8. Notifications & Alerts

| Event | Recipients | Channel |
|-------|------------|---------|
| TNA due | Manager | Email |
| Training scheduled | Participants | Email |
| Training reminder (3 days) | Participants | Email |
| Training tomorrow | Participants | Email/SMS |
| Feedback request | Participants | Email |
| Certificate ready | Employee | Email |
| Mandatory training due | Employee, Manager | Email |
| Mandatory training overdue | Employee, Manager, HR | Email |
| Bond expiring (30 days) | Employee, HR | Email |
| Budget approval required | Approver | Email |

---

## 9. Dashboard Metrics

### HR Dashboard
- Upcoming trainings this month
- TNA completion rate
- Training budget utilization
- Mandatory training compliance %
- Average evaluation scores
- Certificates issued this year

### Manager Dashboard
- Team TNA status
- Team training attendance
- Pending mandatory trainings
- Training requests pending

### Employee Dashboard
- Upcoming trainings
- Completed trainings this year
- Certificates earned
- Mandatory trainings due
- Training history
