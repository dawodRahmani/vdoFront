# VDO Recruitment System - React + IndexedDB Implementation Plan

## Overview
Converting the Laravel + Livewire design to a React frontend with IndexedDB for offline-first data persistence.

---

## Phase 1: Foundation & Infrastructure

### 1.1 IndexedDB Setup
- [ ] Create `recruitmentDB.js` - Database initialization and configuration
- [ ] Define object stores (tables) with indexes
- [ ] Create database service layer with CRUD operations
- [ ] Implement data sync service for future backend integration

### 1.2 Core Database Stores (IndexedDB Object Stores)
```
Primary Stores:
- recruitments
- termsOfReferences (TOR)
- staffRequisitions
- vacancyAnnouncements
- candidates
- candidateApplications
- candidateEducations
- candidateExperiences
- recruitmentCommittees
- committeMembers
- conflictOfInterestDeclarations
- longlistings
- longlistingCandidates
- shortlistings
- shortlistingCandidates
- writtenTests
- writtenTestCandidates
- interviews
- interviewCandidates
- interviewEvaluations
- interviewResults
- recruitmentReports
- reportCandidates
- offerLetters
- sanctionClearances
- backgroundChecks
- referenceChecks
- guaranteeLetters
- homeAddressVerifications
- criminalBackgroundChecks
- employmentContracts
- fileChecklists

Lookup Stores:
- departments
- projects
- donors
- provinces
- salaryGrades
- positions
- users
```

### 1.3 State Management
- [ ] Create RecruitmentContext for global state
- [ ] Implement workflow state machine
- [ ] Create custom hooks for each entity

---

## Phase 2: Core Components & Layout

### 2.1 Directory Structure
```
src/modules/recruitment/
├── index.js                     # Module exports
├── db/
│   ├── recruitmentDB.js         # IndexedDB setup
│   ├── stores/                  # Store-specific operations
│   │   ├── recruitmentStore.js
│   │   ├── torStore.js
│   │   ├── requisitionStore.js
│   │   └── ... (one per store)
│   └── seedData.js              # Initial lookup data
├── context/
│   └── RecruitmentContext.jsx
├── hooks/
│   ├── useRecruitment.js
│   ├── useCandidate.js
│   ├── useWorkflow.js
│   └── ... (custom hooks)
├── services/
│   ├── workflowService.js       # State machine logic
│   ├── codeGenerator.js         # Generate unique codes
│   └── scoreCalculator.js       # Scoring logic
├── components/
│   ├── common/
│   │   ├── StepIndicator.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── ApprovalButtons.jsx
│   │   └── FileUpload.jsx
│   ├── dashboard/
│   │   ├── RecruitmentDashboard.jsx
│   │   └── RecruitmentStats.jsx
│   └── wizard/
│       └── RecruitmentWizard.jsx
├── pages/
│   ├── RecruitmentListPage.jsx
│   ├── RecruitmentDetailPage.jsx
│   ├── NewRecruitmentPage.jsx
│   └── CandidatesPage.jsx
└── steps/
    ├── Step1_TOR.jsx
    ├── Step2_Requisition.jsx
    ├── Step3_Verification.jsx
    ├── Step4_Vacancy.jsx
    ├── Step5_Applications.jsx
    ├── Step6_Committee.jsx
    ├── Step7_Longlisting.jsx
    ├── Step8_Shortlisting.jsx
    ├── Step9_WrittenTest.jsx
    ├── Step10_Interview.jsx
    ├── Step11_Report.jsx
    ├── Step12_Offer.jsx
    ├── Step13_SanctionClearance.jsx
    ├── Step14_BackgroundCheck.jsx
    └── Step15_Contract.jsx
```

---

## Phase 3: Step-by-Step Implementation

### Step 1: TOR Development (Terms of Reference)
- [ ] TOR form component with all fields
- [ ] Validation rules
- [ ] Save to IndexedDB
- [ ] Submit for approval workflow
- [ ] Approval/rejection handling

### Step 2-3: Staff Requisition & Verification
- [ ] SRF form with equipment checklist
- [ ] HR verification interface
- [ ] Finance verification interface
- [ ] Multi-level approval flow

### Step 4: Vacancy Announcement
- [ ] Announcement form
- [ ] Multiple channel support (ACBAR, website, etc.)
- [ ] Publish/close actions
- [ ] View count tracking

### Step 5: Application Receipt
- [ ] Candidate registration form
- [ ] Education records (multiple)
- [ ] Experience records (multiple)
- [ ] Document uploads
- [ ] Application tracking table

### Step 6: Committee Formation
- [ ] Committee creation form
- [ ] Member selection (from users)
- [ ] COI declaration form for each member
- [ ] COI review interface

### Step 7: Longlisting
- [ ] Candidate evaluation table
- [ ] Criteria checkboxes (education, experience, language)
- [ ] Bulk actions
- [ ] Statistics summary

### Step 8: Shortlisting
- [ ] Scoring interface (academic, experience, other)
- [ ] Weighted score calculator
- [ ] Ranking display
- [ ] Selection interface

### Step 9: Written Test
- [ ] Test scheduling form
- [ ] Anonymous code generation
- [ ] Attendance recording
- [ ] Score entry interface
- [ ] Pass/fail calculation

### Step 10: Interview
- [ ] Interview scheduling
- [ ] Attendance tracking
- [ ] Evaluation forms (per evaluator)
- [ ] Score aggregation
- [ ] Final ranking calculation

### Step 11: Recruitment Report
- [ ] Auto-populated summary
- [ ] Top 3 candidates section
- [ ] Committee recommendation
- [ ] Approval workflow

### Step 12: Conditional Offer
- [ ] Offer letter generator
- [ ] Send/track offer
- [ ] Accept/decline handling
- [ ] Fallback to next candidate

### Step 13: Sanction Clearance
- [ ] Declaration form
- [ ] UN sanction list verification UI
- [ ] Clear/flag status

### Step 14: Background Checks
- [ ] Reference check forms (2-3)
- [ ] Guarantee letter form
- [ ] Address verification form
- [ ] Criminal check (MOI) form
- [ ] Overall status tracking

### Step 15: Employment Contract
- [ ] Contract generator
- [ ] Signature capture
- [ ] File checklist
- [ ] Completion workflow

---

## Phase 4: Features & Enhancements

### 4.1 Dashboard & Reporting
- [ ] Recruitment overview dashboard
- [ ] Statistics by status/step
- [ ] Gender distribution charts
- [ ] Timeline visualization

### 4.2 Search & Filters
- [ ] Search recruitments
- [ ] Filter by status, step, date
- [ ] Search candidates
- [ ] Advanced filters

### 4.3 Notifications (UI-based)
- [ ] Pending approvals indicator
- [ ] Step completion alerts
- [ ] Deadline reminders

### 4.4 Export & Print
- [ ] Export to PDF (reports, offer letters, contracts)
- [ ] Print templates for each annexure

---

## Implementation Order (Priority)

1. **Database Layer** (Phase 1.1, 1.2)
2. **Basic Routing & Layout** (Phase 2)
3. **Recruitment List & Create**
4. **Step 1: TOR**
5. **Step 2-3: Requisition**
6. **Step 4: Vacancy**
7. **Step 5: Applications & Candidates**
8. **Step 6: Committee**
9. **Step 7-8: Longlisting & Shortlisting**
10. **Step 9-10: Testing & Interview**
11. **Step 11-12: Report & Offer**
12. **Step 13-15: Background & Contract**
13. **Dashboard & Reports**
14. **Polish & Enhancements**

---

## Key Constants & Enums

```javascript
// Recruitment Status
export const RECRUITMENT_STATUS = {
  DRAFT: 'draft',
  TOR_PENDING: 'tor_pending',
  REQUISITION_PENDING: 'requisition_pending',
  ANNOUNCED: 'announced',
  APPLICATIONS_OPEN: 'applications_open',
  COMMITTEE_FORMED: 'committee_formed',
  LONGLISTING: 'longlisting',
  SHORTLISTING: 'shortlisting',
  TESTING: 'testing',
  INTERVIEWING: 'interviewing',
  REPORT_PENDING: 'report_pending',
  OFFER_SENT: 'offer_sent',
  BACKGROUND_CHECK: 'background_check',
  CONTRACT_PENDING: 'contract_pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Application Status
export const APPLICATION_STATUS = {
  RECEIVED: 'received',
  LONGLISTED: 'longlisted',
  SHORTLISTED: 'shortlisted',
  TESTED: 'tested',
  INTERVIEWED: 'interviewed',
  SELECTED: 'selected',
  OFFERED: 'offered',
  HIRED: 'hired',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn'
};

// Default Scoring Weights
export const DEFAULT_WEIGHTS = {
  ACADEMIC: 0.20,
  EXPERIENCE: 0.30,
  OTHER: 0.50,
  WRITTEN_TEST: 0.50,
  INTERVIEW: 0.50
};
```

---

## Notes

- IndexedDB provides offline-first capability
- All data persists in browser storage
- Future: Add sync layer to push/pull from Laravel backend
- Consider using Dexie.js as IndexedDB wrapper for easier API
