# VDO Performance Appraisal System Design
## Laravel + Livewire Implementation

---

## 1. Performance Appraisal Overview

### Types of Appraisals
| Type | Frequency | Purpose | Outcome |
|------|-----------|---------|---------|
| **Probation Appraisal** | End of probation (3-6 months) | Assess job fit, initial performance | Confirm / Extend / Terminate |
| **Annual Performance Appraisal** | Yearly | Evaluate achievements, competencies | Renew / Promote / PIP / Terminate |
| **Contract Renewal Review** | Before contract end | Assess for renewal | Renew / Not Renew |
| **Performance Improvement Review** | After PIP period | Monitor improvement | Continue / Terminate |

### Rating Scale (0-5)
| Score | Rating | Description |
|-------|--------|-------------|
| 0 | Unsatisfactory | Performance significantly below expectations |
| 1 | Needs Improvement | Performance below expectations, requires development |
| 2 | Basic | Meets minimum requirements |
| 3 | Good | Meets expectations consistently |
| 4 | Satisfactory | Above expectations in most areas |
| 5 | Outstanding | Exceeds expectations, exceptional performance |

### Final Score Interpretation
| Score Range | Performance Level | Recommendation |
|-------------|------------------|----------------|
| 1-20 | Below Average | Do not extend contract |
| 20-40 | Average | Extend contract |
| 40-60 | Good Performance | Recommended for promotion |

---

## 2. Process Workflows

### 2.1 Annual Performance Appraisal (7 Steps)

```
Step 1: CYCLE INITIATION
┌─────────────────────────────────────────────────────────────┐
│  HR Department                                              │
│  - Define appraisal period (fiscal year)                    │
│  - Set deadlines for each stage                             │
│  - Notify all employees and managers                        │
│  - Distribute appraisal forms                               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 2: EMPLOYEE SELF-ASSESSMENT
┌─────────────────────────────────────────────────────────────┐
│  Employee                                                   │
│  - Complete self-assessment section                         │
│  - List achievements and contributions                      │
│  - Identify challenges faced                                │
│  - Rate own performance (optional)                          │
│  - Submit to Line Manager                                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 3: LINE MANAGER INPUT
┌─────────────────────────────────────────────────────────────┐
│  Line Manager                                               │
│  - Review employee self-assessment                          │
│  - Rate employee on all competency areas                    │
│  - Provide evidence/comments for each rating                │
│  - Identify strengths and areas for improvement             │
│  - Recommend training/development needs                     │
│  - Conduct face-to-face appraisal meeting                   │
│  - Make preliminary recommendation                          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 4: APPRAISAL COMMITTEE EVALUATION
┌─────────────────────────────────────────────────────────────┐
│  Appraisal Committee (HR + Department Head + Manager)       │
│  - Review all appraisal forms                               │
│  - Ensure consistency and fairness                          │
│  - Validate ratings against evidence                        │
│  - Discuss borderline cases                                 │
│  - Finalize recommendations                                 │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 5: MANAGEMENT APPROVAL
┌─────────────────────────────────────────────────────────────┐
│  ED / DD / HOP                                              │
│  - Review committee recommendations                         │
│  - Approve/modify decisions                                 │
│  - Sign off on promotions/terminations                      │
│  - Authorize salary increments (if applicable)              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 6: COMMUNICATION AND FOLLOW-UP
┌─────────────────────────────────────────────────────────────┐
│  HR + Line Manager                                          │
│  - Communicate decision to employee                         │
│  - Issue confirmation/promotion/PIP letter                  │
│  - Create development plan if needed                        │
│  - Set goals for next period                                │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 7: DOCUMENTATION AND FILING
┌─────────────────────────────────────────────────────────────┐
│  HR Department                                              │
│  - File signed appraisal forms                              │
│  - Update employee records                                  │
│  - Process contract renewals/terminations                   │
│  - Schedule training programs                               │
│  - Archive in personnel file                                │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Probation Appraisal (6 Steps)

```
Step 1: PROBATION TRACKING
┌─────────────────────────────────────────────────────────────┐
│  HR System                                                  │
│  - Track probation end dates                                │
│  - Send reminder 30 days before end                         │
│  - Notify manager to begin evaluation                       │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 2: PROBATION EVALUATION
┌─────────────────────────────────────────────────────────────┐
│  Line Manager                                               │
│  - Complete probation appraisal form                        │
│  - Rate performance (1-4 scale)                             │
│  - Identify training needs                                  │
│  - Make recommendation:                                     │
│    • Confirm employment                                     │
│    • Extend probation (with KPIs)                           │
│    • Terminate employment                                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 3: HR REVIEW & RECOMMENDATION
┌─────────────────────────────────────────────────────────────┐
│  HR Department                                              │
│  - Verify completeness of evaluation                        │
│  - Check compliance with policy                             │
│  - Review recommendation                                    │
│  - Forward to approving authority                           │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 4: APPROVAL
┌─────────────────────────────────────────────────────────────┐
│  ED / DD                                                    │
│  - Review evaluation and recommendation                     │
│  - Approve or modify decision                               │
│  - Sign appraisal form                                      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 5: COMMUNICATION TO EMPLOYEE
┌─────────────────────────────────────────────────────────────┐
│  HR + Line Manager                                          │
│  - Issue appropriate letter:                                │
│    • Confirmation Letter                                    │
│    • Probation Extension Letter (with KPIs)                 │
│    • Termination Letter                                     │
│  - Conduct feedback meeting                                 │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
Step 6: POST-DECISION ACTIONS
┌─────────────────────────────────────────────────────────────┐
│  HR Department                                              │
│  - Update employee status in system                         │
│  - Process benefits (if confirmed)                          │
│  - Set next review date (if extended)                       │
│  - Initiate offboarding (if terminated)                     │
│  - File documentation                                       │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Performance Improvement Plan (PIP) Workflow

```
[Low Performance Identified]
           │
           ▼
   [Create PIP Document]
   - Specific improvement areas
   - Measurable goals
   - Timeline (30-90 days)
   - Support/resources provided
   - Consequences of non-improvement
           │
           ▼
   [Employee Acknowledgment]
   - Review with employee
   - Answer questions
   - Get signature
           │
           ▼
   [Regular Check-ins]
   - Weekly/bi-weekly meetings
   - Document progress
   - Provide feedback
           │
           ▼
   [PIP End Review]
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
[Improved]   [Not Improved]
     │           │
     ▼           ▼
[Continue    [Extend PIP or
Employment]  Terminate]
```

---

## 3. Database Schema

### Core Tables

#### 3.1 `appraisal_cycles` (Appraisal Periods)
```sql
- id (PK)
- name (e.g., "Annual Appraisal 2025")
- cycle_type (enum: 'annual', 'mid_year', 'quarterly')
- fiscal_year (int)
- start_date (date)
- end_date (date)
- self_assessment_deadline (date)
- manager_review_deadline (date)
- committee_review_deadline (date)
- final_approval_deadline (date)
- status (enum: 'draft', 'active', 'in_review', 'completed', 'archived')
- created_by (FK -> users)
- created_at
- updated_at
```

#### 3.2 `appraisal_templates` (Evaluation Templates)
```sql
- id (PK)
- name
- template_type (enum: 'annual', 'probation', 'pip_review', 'contract_renewal')
- description (text)
- is_active (boolean, default true)
- requires_self_assessment (boolean, default true)
- requires_committee_review (boolean, default true)
- version (int, default 1)
- created_at
- updated_at
```

#### 3.3 `appraisal_sections` (Sections in Template)
```sql
- id (PK)
- template_id (FK -> appraisal_templates)
- name (e.g., "Core Job Performance", "Compliance", "Competencies")
- description (text)
- weight_percentage (decimal, default 0 - for weighted scoring)
- display_order (int)
- is_required (boolean, default true)
- created_at
- updated_at
```

#### 3.4 `appraisal_criteria` (Individual Rating Items)
```sql
- id (PK)
- section_id (FK -> appraisal_sections)
- name (e.g., "Job Knowledge & Technical Skills")
- description (text)
- min_rating (int, default 0)
- max_rating (int, default 5)
- weight (decimal, default 1)
- display_order (int)
- is_required (boolean, default true)
- requires_comment (boolean, default false)
- applicable_positions (json, nullable - null means all)
- created_at
- updated_at
```

#### 3.5 `employee_appraisals` (Main Appraisal Record)
```sql
- id (PK)
- appraisal_number (unique, e.g., 'APR-2025-00001')
- employee_id (FK -> employees)
- appraisal_cycle_id (FK -> appraisal_cycles, nullable for probation)
- template_id (FK -> appraisal_templates)
- appraisal_type (enum: 'annual', 'probation', 'pip_review',
                  'contract_renewal', 'promotion_review')
- period_start (date)
- period_end (date)
- line_manager_id (FK -> employees)
- department_id (FK -> departments)
- status (enum: 'draft', 'self_assessment', 'manager_review',
         'committee_review', 'pending_approval', 'approved',
         'communicated', 'completed', 'cancelled')
-- Self Assessment
- self_assessment_submitted (boolean, default false)
- self_assessment_date (datetime, nullable)
- employee_achievements (text, nullable)
- employee_challenges (text, nullable)
- employee_comments (text, nullable)
-- Manager Review
- manager_review_submitted (boolean, default false)
- manager_review_date (datetime, nullable)
- manager_overall_comments (text, nullable)
- manager_strengths (text, nullable)
- manager_improvements (text, nullable)
- manager_training_recommendations (text, nullable)
-- Scores
- total_score (decimal, nullable)
- max_possible_score (decimal, nullable)
- percentage_score (decimal, nullable)
- performance_level (enum: 'unsatisfactory', 'needs_improvement',
                     'meets_expectations', 'exceeds_expectations',
                     'outstanding', nullable)
-- Recommendation
- manager_recommendation (enum: 'confirm', 'extend_probation',
                          'renew_contract', 'promote', 'pip',
                          'terminate', 'salary_increment', nullable)
- committee_recommendation (enum: same as above, nullable)
- final_decision (enum: same as above, nullable)
-- Approvals
- committee_reviewed (boolean, default false)
- committee_reviewed_at (datetime, nullable)
- committee_comments (text, nullable)
- approved_by (FK -> users, nullable)
- approved_at (datetime, nullable)
- approval_comments (text, nullable)
-- Communication
- communicated_to_employee (boolean, default false)
- communicated_at (datetime, nullable)
- employee_acknowledged (boolean, default false)
- employee_acknowledged_at (datetime, nullable)
- employee_feedback (text, nullable)
-- Signatures
- employee_signature_path (string, nullable)
- manager_signature_path (string, nullable)
- approver_signature_path (string, nullable)
- created_at
- updated_at
```

#### 3.6 `appraisal_ratings` (Individual Criterion Ratings)
```sql
- id (PK)
- appraisal_id (FK -> employee_appraisals)
- criteria_id (FK -> appraisal_criteria)
- self_rating (int, nullable - employee's self-assessment)
- manager_rating (int)
- weighted_score (decimal, computed)
- manager_comments (text, nullable)
- evidence (text, nullable)
- created_at
- updated_at
```

#### 3.7 `appraisal_committee_members` (Committee Composition)
```sql
- id (PK)
- appraisal_id (FK -> employee_appraisals)
- member_id (FK -> users)
- role (enum: 'hr_representative', 'department_head', 'line_manager',
       'technical_expert', 'additional')
- reviewed (boolean, default false)
- reviewed_at (datetime, nullable)
- comments (text, nullable)
- recommendation (enum: same as manager_recommendation, nullable)
- created_at
- updated_at
```

#### 3.8 `appraisal_goals` (Goals/Objectives for Next Period)
```sql
- id (PK)
- appraisal_id (FK -> employee_appraisals)
- goal_title
- description (text)
- success_criteria (text)
- target_date (date)
- priority (enum: 'high', 'medium', 'low')
- status (enum: 'pending', 'in_progress', 'achieved', 'not_achieved')
- achievement_notes (text, nullable)
- created_at
- updated_at
```

#### 3.9 `appraisal_training_needs` (Identified Training)
```sql
- id (PK)
- appraisal_id (FK -> employee_appraisals)
- training_area (string)
- training_type (enum: 'technical', 'leadership', 'safeguarding',
                 'it_skills', 'language', 'project_management', 'other')
- priority (enum: 'required', 'recommended', 'optional')
- notes (text, nullable)
- training_completed (boolean, default false)
- training_id (FK -> trainings, nullable - link to actual training)
- created_at
- updated_at
```

#### 3.10 `probation_records` (Probation Tracking)
```sql
- id (PK)
- employee_id (FK -> employees)
- start_date (date)
- original_end_date (date)
- current_end_date (date)
- extension_count (int, default 0)
- status (enum: 'active', 'confirmed', 'extended', 'terminated')
- final_appraisal_id (FK -> employee_appraisals, nullable)
- created_at
- updated_at
```

#### 3.11 `probation_extensions` (Extension History)
```sql
- id (PK)
- probation_id (FK -> probation_records)
- appraisal_id (FK -> employee_appraisals)
- extension_number (int)
- previous_end_date (date)
- new_end_date (date)
- extension_reason (text)
- approved_by (FK -> users)
- approved_at (datetime)
- created_at
- updated_at
```

#### 3.12 `probation_kpis` (KPIs for Extended Probation)
```sql
- id (PK)
- extension_id (FK -> probation_extensions)
- kpi_area (string)
- expected_performance (text)
- measurement_indicator (text)
- timeline (string)
- achieved (boolean, nullable)
- achievement_notes (text, nullable)
- reviewed_at (datetime, nullable)
- created_at
- updated_at
```

#### 3.13 `performance_improvement_plans` (PIP)
```sql
- id (PK)
- employee_id (FK -> employees)
- appraisal_id (FK -> employee_appraisals, nullable - triggering appraisal)
- pip_number (unique)
- start_date (date)
- end_date (date)
- duration_days (int)
- reason (text)
- improvement_areas (json)
- support_provided (text)
- consequences (text)
- status (enum: 'draft', 'active', 'extended', 'completed_success',
         'completed_failure', 'cancelled')
- employee_acknowledged (boolean, default false)
- employee_acknowledged_at (datetime, nullable)
- manager_id (FK -> employees)
- hr_representative_id (FK -> users)
- created_at
- updated_at
```

#### 3.14 `pip_goals` (PIP Objectives)
```sql
- id (PK)
- pip_id (FK -> performance_improvement_plans)
- goal_area (string)
- current_performance (text)
- expected_performance (text)
- measurement_criteria (text)
- target_date (date)
- status (enum: 'pending', 'in_progress', 'achieved', 'not_achieved')
- progress_notes (text, nullable)
- created_at
- updated_at
```

#### 3.15 `pip_check_ins` (PIP Progress Meetings)
```sql
- id (PK)
- pip_id (FK -> performance_improvement_plans)
- check_in_date (date)
- check_in_number (int)
- progress_summary (text)
- goals_reviewed (json - array of goal statuses)
- manager_feedback (text)
- employee_comments (text, nullable)
- next_steps (text)
- conducted_by (FK -> users)
- created_at
- updated_at
```

#### 3.16 `appraisal_outcomes` (Outcome Letters/Actions)
```sql
- id (PK)
- appraisal_id (FK -> employee_appraisals)
- outcome_type (enum: 'confirmation', 'probation_extension',
                'contract_renewal', 'promotion', 'salary_increment',
                'pip_initiation', 'termination')
- letter_reference (string, unique)
- letter_date (date)
- effective_date (date)
- details (json - promotion: new_position, new_salary; increment: amount, %)
- letter_path (string, nullable)
- issued_by (FK -> users)
- issued_at (datetime)
- employee_received (boolean, default false)
- employee_received_at (datetime, nullable)
- created_at
- updated_at
```

---

## 4. State Machines

### 4.1 Appraisal Status Flow

```
                      [DRAFT]
                         │
                         │ HR initiates cycle
                         ▼
                 [SELF_ASSESSMENT]
                         │
                         │ Employee submits
                         ▼
                  [MANAGER_REVIEW]
                         │
                         │ Manager submits
                         ▼
                [COMMITTEE_REVIEW]
                         │
                         │ Committee submits
                         ▼
                [PENDING_APPROVAL]
                         │
            ┌────────────┼────────────┐
            │            │            │
            ▼            ▼            ▼
      [APPROVED]    [RETURNED]   [REJECTED]
            │            │
            │            └──► Back to MANAGER_REVIEW
            ▼
      [COMMUNICATED]
            │
            │ Employee acknowledges
            ▼
       [COMPLETED]
```

### 4.2 Probation Status Flow

```
         [ACTIVE]
             │
             │ End of probation
             ▼
      [Under Evaluation]
             │
    ┌────────┼────────┐
    │        │        │
    ▼        ▼        ▼
[CONFIRMED] [EXTENDED] [TERMINATED]
                │
                │ End of extension
                ▼
         [Re-evaluation]
                │
         ┌──────┴──────┐
         │             │
         ▼             ▼
    [CONFIRMED]  [TERMINATED]
```

### 4.3 PIP Status Flow

```
        [DRAFT]
           │
           │ Manager creates
           ▼
       [ACTIVE]
           │
           │ Duration ends
           ▼
      [REVIEW]
           │
    ┌──────┼──────┐
    │      │      │
    ▼      ▼      ▼
[SUCCESS] [EXTENDED] [FAILURE]
    │         │          │
    ▼         │          ▼
[Continue     │    [TERMINATED or
Employment]   │     Further Action]
              │
              └──► [ACTIVE] (extended)
```

---

## 5. Evaluation Criteria (From Forms)

### 5.1 Core Job Performance (Section 1)
| # | Criteria | Description |
|---|----------|-------------|
| 1 | Job Knowledge & Technical Skills | Knowledge of duties, accuracy, expertise |
| 2 | Quality of Work | Accuracy, thoroughness, reliability |
| 3 | Productivity & Efficiency | Timeliness, workload management |
| 4 | Field Management | Planning, coordination, supervision |
| 5 | Local Language Proficiency | Communication with communities |
| 6 | English Proficiency | Reporting, documentation |
| 7 | Communication Skills | Reporting, oral communication, listening |
| 8 | Teamwork & Collaboration | Cooperation, cross-departmental work |
| 9 | Initiative & Creativity | Decision-making, innovation |
| 10 | Public Relations | Conduct with beneficiaries, partners |
| 11 | Attendance & Punctuality | Regularity, timeliness |
| 12 | Adaptability & Learning | Professional development |
| 13 | Overall Performance | Overall delivery, value, growth |

### 5.2 Compliance (Section 2)
| # | Criteria | Description |
|---|----------|-------------|
| 1 | AAP - Accountability to Affected Populations | Dignity, equality, transparency |
| 2 | PSEAH Compliance | Respectful behavior, no harassment |
| 3 | Safeguarding | Safety and respect for vulnerable groups |
| 4 | Child Protection | No harm to children, reporting |
| 5 | Code of Conduct | Ethical conduct, neutrality |
| 6 | Confidentiality & Data Privacy | Handling sensitive information |

### 5.3 Organizational Competencies (Section 3)
| # | Criteria | Description |
|---|----------|-------------|
| 1 | Compliance & Policy Adherence | HR, Finance, Procurement policies |
| 2 | Conflict Management | Resolution, emotional control |
| 3 | Professional Competence | Skills aligned with job requirements |
| 4 | Commitment to Organization | Dedication, reliability, enthusiasm |
| 5 | Contribution to Sustainability | Cost control, resource management |
| 6 | Communication & Behavior | Professional conduct, cultural sensitivity |

---

## 6. Business Rules

### 6.1 Appraisal Rules

```php
// Rule 1: Self-Assessment Deadline
if (today > appraisal_cycle.self_assessment_deadline) {
    if (!appraisal.self_assessment_submitted) {
        send_reminder(employee);
        // Allow grace period of 3 days
        if (today > deadline + 3) {
            escalate_to_manager();
        }
    }
}

// Rule 2: Rating Validation
foreach (rating in appraisal.ratings) {
    if (rating.manager_rating < criteria.min_rating ||
        rating.manager_rating > criteria.max_rating) {
        throw ValidationException("Rating must be between {min} and {max}");
    }
    if (criteria.requires_comment && empty(rating.manager_comments)) {
        throw ValidationException("Comments required for {criteria.name}");
    }
}

// Rule 3: Score Calculation
total_score = 0;
max_score = 0;
foreach (section in template.sections) {
    section_score = 0;
    section_max = 0;
    foreach (criteria in section.criteria) {
        rating = get_rating(appraisal, criteria);
        weighted = rating.manager_rating * criteria.weight;
        section_score += weighted;
        section_max += criteria.max_rating * criteria.weight;
    }
    // Apply section weight
    total_score += (section_score / section_max) * section.weight_percentage;
    max_score += section.weight_percentage;
}
percentage = (total_score / max_score) * 100;

// Rule 4: Performance Level Assignment
if (percentage >= 80) {
    level = 'outstanding';
} else if (percentage >= 70) {
    level = 'exceeds_expectations';
} else if (percentage >= 50) {
    level = 'meets_expectations';
} else if (percentage >= 30) {
    level = 'needs_improvement';
} else {
    level = 'unsatisfactory';
}

// Rule 5: Recommendation Validation
if (recommendation == 'promote') {
    if (percentage < 70) {
        throw ValidationException("Promotion requires minimum 70% score");
    }
    if (employee.tenure_months < 12) {
        throw ValidationException("Minimum 12 months tenure for promotion");
    }
}

// Rule 6: Probation Extension Limit
if (probation.extension_count >= 2) {
    throw ValidationException("Maximum 2 probation extensions allowed");
}
```

### 6.2 Committee Review Rules

```php
// Rule 1: Minimum Committee Size
if (committee_members.count < 3) {
    throw ValidationException("Minimum 3 committee members required");
}

// Rule 2: Required Roles
if (!has_role(committee, 'hr_representative')) {
    throw ValidationException("HR representative required in committee");
}

// Rule 3: All Must Review
if (!all_members_reviewed(appraisal)) {
    cannot_proceed_to_approval();
}

// Rule 4: Consensus on Termination
if (final_decision == 'terminate') {
    if (committee_votes_for_terminate < committee.count * 0.67) {
        require_escalation_to_ED();
    }
}
```

---

## 7. API Endpoints (Laravel Routes)

```php
Route::prefix('api/appraisal')->group(function () {

    // Appraisal Cycles
    Route::apiResource('cycles', AppraisalCycleController::class);
    Route::post('cycles/{id}/activate', [AppraisalCycleController::class, 'activate']);
    Route::post('cycles/{id}/close', [AppraisalCycleController::class, 'close']);
    Route::get('cycles/{id}/progress', [AppraisalCycleController::class, 'progress']);

    // Templates
    Route::apiResource('templates', AppraisalTemplateController::class);
    Route::apiResource('templates.sections', AppraisalSectionController::class);
    Route::apiResource('sections.criteria', AppraisalCriteriaController::class);

    // Employee Appraisals
    Route::apiResource('appraisals', EmployeeAppraisalController::class);
    Route::prefix('appraisals/{id}')->group(function () {
        // Self Assessment
        Route::post('self-assessment', [AppraisalController::class, 'submitSelfAssessment']);

        // Manager Review
        Route::post('manager-review', [AppraisalController::class, 'submitManagerReview']);
        Route::post('ratings', [AppraisalController::class, 'saveRatings']);

        // Committee
        Route::post('committee-review', [AppraisalController::class, 'submitCommitteeReview']);
        Route::get('committee', [AppraisalController::class, 'getCommittee']);
        Route::post('committee/add-member', [AppraisalController::class, 'addCommitteeMember']);

        // Approval
        Route::post('approve', [AppraisalController::class, 'approve']);
        Route::post('reject', [AppraisalController::class, 'reject']);
        Route::post('return', [AppraisalController::class, 'returnForRevision']);

        // Communication
        Route::post('communicate', [AppraisalController::class, 'communicateDecision']);
        Route::post('acknowledge', [AppraisalController::class, 'employeeAcknowledge']);

        // Goals & Training
        Route::apiResource('goals', AppraisalGoalController::class);
        Route::apiResource('training-needs', TrainingNeedController::class);

        // Outcome
        Route::post('issue-outcome', [AppraisalController::class, 'issueOutcome']);
    });

    // My Appraisals (Employee View)
    Route::prefix('my')->group(function () {
        Route::get('appraisals', [MyAppraisalController::class, 'index']);
        Route::get('current', [MyAppraisalController::class, 'current']);
        Route::get('history', [MyAppraisalController::class, 'history']);
    });

    // Team Appraisals (Manager View)
    Route::prefix('team')->group(function () {
        Route::get('appraisals', [TeamAppraisalController::class, 'index']);
        Route::get('pending', [TeamAppraisalController::class, 'pending']);
    });

    // Probation
    Route::apiResource('probations', ProbationController::class);
    Route::post('probations/{id}/confirm', [ProbationController::class, 'confirm']);
    Route::post('probations/{id}/extend', [ProbationController::class, 'extend']);
    Route::get('probations/upcoming', [ProbationController::class, 'upcoming']);

    // PIP
    Route::apiResource('pips', PipController::class);
    Route::prefix('pips/{id}')->group(function () {
        Route::post('activate', [PipController::class, 'activate']);
        Route::post('check-in', [PipController::class, 'recordCheckIn']);
        Route::post('complete', [PipController::class, 'complete']);
        Route::post('extend', [PipController::class, 'extend']);
        Route::apiResource('goals', PipGoalController::class);
    });

    // Reports
    Route::prefix('reports')->group(function () {
        Route::get('cycle-summary/{cycleId}', [AppraisalReportController::class, 'cycleSummary']);
        Route::get('department/{deptId}', [AppraisalReportController::class, 'byDepartment']);
        Route::get('performance-distribution', [AppraisalReportController::class, 'distribution']);
        Route::get('probation-status', [AppraisalReportController::class, 'probationStatus']);
        Route::get('pip-status', [AppraisalReportController::class, 'pipStatus']);
    });
});
```

---

## 8. Livewire Components Structure

```
app/Livewire/Appraisal/
├── Dashboard.php                    # Appraisal overview
├── Cycles/
│   ├── CycleList.php               # All appraisal cycles
│   ├── CycleForm.php               # Create/edit cycle
│   └── CycleProgress.php           # Cycle completion tracking
├── Templates/
│   ├── TemplateBuilder.php         # Build appraisal templates
│   ├── SectionManager.php          # Manage sections
│   └── CriteriaManager.php         # Manage criteria
├── Employee/
│   ├── MyAppraisals.php            # Employee's appraisals
│   ├── SelfAssessmentForm.php      # Self-assessment entry
│   ├── ViewAppraisal.php           # View completed appraisal
│   └── AcknowledgeForm.php         # Acknowledge decision
├── Manager/
│   ├── TeamAppraisals.php          # Team appraisals list
│   ├── AppraisalForm.php           # Complete appraisal
│   ├── RatingForm.php              # Rate employee
│   └── RecommendationForm.php      # Make recommendation
├── Committee/
│   ├── PendingReviews.php          # Committee queue
│   ├── CommitteeReviewForm.php     # Committee evaluation
│   └── CommitteeDecision.php       # Final recommendation
├── Approvals/
│   ├── PendingApprovals.php        # Approval queue
│   └── ApprovalForm.php            # Approve/reject
├── Probation/
│   ├── ProbationList.php           # All probations
│   ├── UpcomingProbations.php      # Ending soon
│   ├── ProbationAppraisalForm.php  # Probation evaluation
│   ├── ExtensionForm.php           # Extend with KPIs
│   └── ConfirmationForm.php        # Confirm employee
├── PIP/
│   ├── PipList.php                 # All PIPs
│   ├── PipForm.php                 # Create/edit PIP
│   ├── PipGoals.php                # Manage PIP goals
│   ├── CheckInForm.php             # Record check-in
│   └── PipReview.php               # Final review
├── Outcomes/
│   ├── ConfirmationLetter.php      # Generate confirmation
│   ├── PromotionLetter.php         # Generate promotion
│   └── OutcomeHistory.php          # Outcome letters list
└── Reports/
    ├── CycleSummary.php            # Cycle statistics
    ├── PerformanceDistribution.php # Score distribution
    └── DepartmentReport.php        # By department
```

---

## 9. Notifications & Alerts

| Event | Recipients | Timing |
|-------|------------|--------|
| Appraisal cycle started | All employees | Immediately |
| Self-assessment reminder | Employee | 7 days, 3 days, 1 day before deadline |
| Self-assessment submitted | Manager | Immediately |
| Manager review reminder | Manager | 5 days, 2 days before deadline |
| Manager review submitted | Committee, HR | Immediately |
| Committee review required | Committee members | Immediately |
| Pending approval | Approver (ED/DD) | Immediately |
| Appraisal approved | Employee, Manager, HR | Immediately |
| Probation ending | Manager, HR | 30 days, 14 days, 7 days before |
| Probation decision | Employee | Immediately |
| PIP created | Employee | Immediately |
| PIP check-in due | Manager, Employee | 1 day before |
| PIP ending | Manager, HR | 7 days before |

---

## 10. Form Fields Summary

### Annual Appraisal Form
| Section | Fields |
|---------|--------|
| Header | Employee Name, Position, Department, Manager, Dates |
| Self-Assessment | Achievements, Challenges, Self-ratings (optional), Comments |
| Manager Ratings | 25 criteria across 3 sections (0-5 scale) |
| Manager Comments | Strengths, Improvements, Training needs |
| Recommendation | Renew/Promote/PIP/Terminate |
| Committee | Review, Final recommendation |
| Approval | ED/DD decision |
| Signatures | Employee, Manager, HR, Approver |

### Probation Extension KPIs
| Field | Type | Required |
|-------|------|----------|
| KPI Area | Text | Yes |
| Expected Performance | Text | Yes |
| Measurement Indicator | Text | Yes |
| Timeline | Text | Yes |

---

## 11. Dashboard Metrics

### HR Dashboard
- Active appraisal cycles
- Completion rate by stage
- Pending approvals count
- Probations ending (30 days)
- Active PIPs
- Performance distribution chart

### Manager Dashboard
- Team appraisals pending
- Overdue reviews
- Team performance average
- Probations in team
- PIPs in team

### Employee Dashboard
- Current appraisal status
- Self-assessment deadline
- Previous appraisal scores
- Goals progress
- Training needs status
