# HR Management Module Documentation

## Table of Contents

1. [Overview](#overview)
2. [Employee Administration](#employee-administration)
3. [Organization Setup](#organization-setup)
4. [Recruitment](#recruitment)
5. [Time & Attendance](#time--attendance)
6. [Performance Appraisal](#performance-appraisal)
7. [Training & Capacity Building](#training--capacity-building)
8. [Compensation & Benefits](#compensation--benefits)
9. [HR Administration](#hr-administration)
10. [Disciplinary System](#disciplinary-system)
11. [Exit & Termination](#exit--termination)
12. [Payroll System](#payroll-system)

---

## Overview

The HR Management module is a comprehensive human resource management system that handles all aspects of employee lifecycle management, from recruitment to separation. The system uses IndexedDB for local data storage, enabling offline functionality and fast data access.

### Key Features
- Complete employee lifecycle management
- Role-based access control
- Workflow-based approvals
- Offline-capable with IndexedDB
- Dark mode support
- Responsive design

---

## Employee Administration

### Purpose
Manage employee records, personal information, documents, and employment details throughout their tenure.

### Components

#### 1. HR Dashboard (`/employee-admin/dashboard`)
- **Overview**: Central hub displaying HR metrics and statistics
- **Features**:
  - Total employee count by status (Active, On Leave, Probation)
  - Department distribution chart
  - Recent hires list
  - Upcoming contract expirations
  - Quick action buttons

#### 2. Employee List (`/employee-admin/employees`)
- **Purpose**: View and manage all employees
- **Features**:
  - Search by name, employee ID, or department
  - Filter by status, department, office
  - Export to Excel/PDF
  - Bulk actions (status change, department transfer)
- **Data Displayed**:
  - Employee ID, Photo, Name
  - Position, Department, Office
  - Employment Status
  - Join Date

#### 3. Employee Profile (`/employee-admin/employees/:id`)
- **Purpose**: Detailed view of individual employee information
- **Tabs**:
  - **Personal Info**: Name, DOB, gender, contact details, national ID
  - **Employment**: Position, department, grade, supervisor, contract type
  - **Education**: Academic qualifications, certifications
  - **Experience**: Previous employment history
  - **Documents**: Uploaded files (CV, ID copies, contracts)
  - **Emergency Contacts**: Contact persons for emergencies
  - **Dependents**: Family members for benefits

#### 4. Employee Form (`/employee-admin/employees/new`, `/employee-admin/employees/:id/edit`)
- **Purpose**: Create or edit employee records
- **Required Fields**:
  - First Name, Last Name
  - Employee ID (auto-generated)
  - Email, Phone
  - Department, Position
  - Employment Type, Start Date
- **Optional Fields**:
  - Photo, Middle Name
  - Address details
  - Bank account information

#### 5. Onboarding Dashboard (`/employee-admin/onboarding`)
- **Purpose**: Track new employee onboarding progress
- **Features**:
  - Onboarding checklist per employee
  - Document collection status
  - Training schedule
  - Equipment assignment tracking
  - Buddy/mentor assignment

#### 6. Contract Management (`/employee-admin/contracts`)
- **Purpose**: Manage employment contracts
- **Features**:
  - Contract creation and renewal
  - Expiration alerts (30, 60, 90 days)
  - Contract history per employee
  - Amendment tracking
- **Contract Types**:
  - Permanent
  - Fixed-term
  - Consultancy
  - Internship

#### 7. Interim Hiring (`/employee-admin/interim-hiring`)
- **Purpose**: Manage temporary/interim staff
- **Features**:
  - Short-term assignment tracking
  - Agency staff management
  - Daily/hourly rate configuration
  - Assignment extension workflow

#### 8. Personnel Files (`/employee-admin/personnel-files`)
- **Purpose**: Digital document repository for employee files
- **Features**:
  - Document categorization
  - Version control
  - Access logging
  - Secure storage
- **Document Categories**:
  - Personal documents
  - Employment documents
  - Performance records
  - Training certificates
  - Disciplinary records

#### 9. Mahram Registration (`/employee-admin/mahram`)
- **Purpose**: Register and manage Mahram (male guardian) information for female employees
- **Features**:
  - Mahram details registration
  - Relationship documentation
  - Travel authorization tracking

#### 10. HR Reports (`/employee-admin/reports`)
- **Purpose**: Generate HR analytics and reports
- **Available Reports**:
  - Headcount report
  - Turnover analysis
  - Demographics report
  - Contract expiration report
  - Salary distribution report

---

## Organization Setup

### Purpose
Configure organizational structure including departments, positions, offices, grades, and employee types.

### Components

#### 1. Departments (`/hr/departments`)
- **Purpose**: Define organizational departments
- **Fields**:
  - Department Name
  - Department Code
  - Parent Department (for hierarchy)
  - Department Head
  - Description
- **Features**:
  - Hierarchical structure support
  - Department head assignment
  - Employee count per department

#### 2. Positions (`/hr/positions`)
- **Purpose**: Define job positions/titles
- **Fields**:
  - Position Title
  - Position Code
  - Department
  - Grade Range
  - Job Description
  - Qualifications Required
- **Features**:
  - Link to department
  - Salary grade association
  - Headcount tracking

#### 3. Offices (`/hr/offices`)
- **Purpose**: Manage office locations
- **Fields**:
  - Office Name
  - Office Code
  - Address
  - Province/City
  - Contact Information
  - Office Type (HQ, Field, Sub-office)
- **Features**:
  - Geographic distribution
  - Employee assignment per office
  - Office-specific policies

#### 4. Grades (`/hr/grades`)
- **Purpose**: Define salary/job grades
- **Fields**:
  - Grade Name
  - Grade Level
  - Minimum Salary
  - Maximum Salary
  - Benefits Package
- **Features**:
  - Salary bands definition
  - Grade progression rules
  - Benefits association

#### 5. Employee Types (`/hr/employee-types`)
- **Purpose**: Categorize employment types
- **Types**:
  - Regular Full-time
  - Regular Part-time
  - Contract
  - Consultant
  - Intern
  - Volunteer
- **Configuration**:
  - Leave entitlement
  - Benefits eligibility
  - Probation period
  - Notice period

---

## Recruitment

### Purpose
End-to-end recruitment process management from requisition to hiring.

### Workflow

```
Staff Requisition → TOR Approval → Vacancy Announcement →
Application Collection → Longlisting → Shortlisting →
Written Test (optional) → Interview → Selection Report →
Offer Letter → Background Checks → Contract Signing
```

### Components

#### 1. Recruitment List (`/recruitment`)
- **Purpose**: View all recruitment processes
- **Statuses**:
  - Draft
  - Pending Approval
  - Published
  - Applications Open
  - Under Review
  - Interview Stage
  - Selection Made
  - Completed
  - Cancelled

#### 2. New Recruitment (`/recruitment/new`)
- **Purpose**: Initiate new recruitment
- **Steps**:
  1. **Staff Requisition**: Department request for new hire
  2. **Terms of Reference**: Job description and requirements
  3. **Approval Workflow**: Management approval chain

#### 3. Recruitment Detail (`/recruitment/:id`)
- **Purpose**: Manage individual recruitment process
- **Sections**:

  **a. Vacancy Announcement**
  - Position details
  - Qualifications
  - Application deadline
  - Publication channels

  **b. Candidate Management**
  - Application tracking
  - Document verification
  - Education/experience validation

  **c. Longlisting**
  - Initial screening criteria
  - Automated scoring
  - Committee review

  **d. Shortlisting**
  - Detailed evaluation
  - Reference checks
  - Committee scoring

  **e. Written Test** (if applicable)
  - Test scheduling
  - Score recording
  - Pass/fail determination

  **f. Interview**
  - Panel composition
  - COI declarations
  - Interview scheduling
  - Evaluation forms
  - Score compilation

  **g. Selection Report**
  - Candidate ranking
  - Committee recommendation
  - Final selection

  **h. Pre-Employment**
  - Offer letter generation
  - Sanction clearance
  - Background verification
  - Reference checks
  - Medical examination

---

## Time & Attendance

### Purpose
Track employee attendance, work hours, and leave management.

### Components

#### 1. Work Schedules (`/hr/work-schedules`)
- **Purpose**: Define working hour patterns
- **Schedule Types**:
  - Standard (8:00-17:00)
  - Flexible
  - Shift-based
  - Remote
- **Configuration**:
  - Working days
  - Start/end times
  - Break duration
  - Overtime rules

#### 2. Attendance (`/hr/attendance`)
- **Purpose**: Daily attendance tracking
- **Features**:
  - Check-in/check-out recording
  - Manual entry for corrections
  - Absence marking
  - Late arrival tracking
- **Reports**:
  - Daily attendance sheet
  - Monthly summary
  - Attendance rate by department

#### 3. Leave Management (`/hr/leave-management`)
- **Purpose**: Process leave requests
- **Workflow**:
  ```
  Request → Supervisor Approval → HR Review → Approved/Rejected
  ```
- **Features**:
  - Leave application form
  - Balance checking
  - Approval workflow
  - Calendar integration
  - Substitute assignment

#### 4. Leave Types (`/hr/leave-types`)
- **Purpose**: Configure leave categories
- **Standard Types**:
  - Annual Leave
  - Sick Leave
  - Maternity/Paternity Leave
  - Compassionate Leave
  - Study Leave
  - Unpaid Leave
  - Public Holiday
- **Configuration per Type**:
  - Days per year
  - Carry-over rules
  - Documentation required
  - Advance notice required
  - Gender-specific

#### 5. Leave Policies (`/hr/leave-policies`)
- **Purpose**: Define leave rules per employee type
- **Settings**:
  - Accrual rates
  - Maximum accumulation
  - Minimum service requirement
  - Pro-rating rules
  - Encashment policy

#### 6. Leave Balances (`/hr/leave-balances`)
- **Purpose**: View and adjust employee leave balances
- **Features**:
  - Current balance display
  - Used/remaining breakdown
  - Manual adjustments
  - Carry-over processing
  - Year-end calculations

#### 7. Holidays (`/hr/holidays`)
- **Purpose**: Manage public holidays
- **Features**:
  - Holiday calendar
  - Office-specific holidays
  - Substitute days
  - Holiday pay rules

#### 8. Leave Calendar (`/hr/leave-calendar`)
- **Purpose**: Visual calendar of all leaves
- **Views**:
  - Monthly/weekly/daily
  - By department
  - By employee
- **Features**:
  - Conflict detection
  - Coverage planning
  - Export capability

#### 9. Timesheets (`/hr/timesheets`)
- **Purpose**: Project-based time tracking
- **Features**:
  - Daily/weekly entry
  - Project allocation
  - Overtime recording
  - Supervisor approval
  - Billing integration

#### 10. Leave Reports (`/hr/leave-reports`)
- **Purpose**: Leave analytics
- **Reports**:
  - Leave utilization
  - Absence patterns
  - Balance forecast
  - Department comparison

---

## Performance Appraisal

### Purpose
Evaluate employee performance through structured appraisal cycles, manage probation periods, and implement performance improvement plans.

### Components

#### 1. Performance Dashboard (`/hr/performance`)
- **Purpose**: Overview of performance management activities
- **Displays**:
  - Active appraisal cycle status
  - Pending self-assessments count
  - Pending manager reviews count
  - Pending approvals count
  - Completed appraisals count
  - Performance distribution chart
  - Probations ending soon alerts
  - Active PIPs count

#### 2. Appraisal Cycles (`/hr/performance/cycles`)
- **Purpose**: Create and manage appraisal periods
- **Fields**:
  - Cycle Name (e.g., "Annual Review 2025")
  - Start Date / End Date
  - Appraisal Type (Annual, Mid-year, Quarterly)
  - Self-Assessment Deadline
  - Manager Review Deadline
  - Committee Review Deadline
  - Final Approval Deadline
- **Statuses**:
  - Draft
  - Active
  - In Review
  - Completed
  - Archived

#### 3. Appraisal Templates (`/hr/performance/templates`)
- **Purpose**: Define evaluation criteria and scoring
- **Structure**:
  ```
  Template
  └── Sections (e.g., Core Performance, Compliance, Competencies)
      └── Criteria (e.g., Quality of Work, Attendance, Teamwork)
          └── Weight (points)
  ```
- **Template Types**:
  - Annual Performance
  - Probation Review
  - Contract Renewal
  - PIP Review
- **Default Template Sections**:
  1. **Core Job Performance** (40 points)
     - Quality of Work (10)
     - Quantity of Work (10)
     - Technical Skills (10)
     - Problem Solving (10)
  2. **Compliance & Conduct** (30 points)
     - Attendance & Punctuality (10)
     - Policy Compliance (10)
     - Professional Ethics (10)
  3. **Organizational Competencies** (30 points)
     - Teamwork (10)
     - Communication (10)
     - Initiative (10)

#### 4. Employee Appraisals (`/hr/performance/appraisals`)
- **Purpose**: List and manage individual appraisals
- **Features**:
  - Create single or bulk appraisals
  - Filter by cycle, status, department
  - Workflow progress tracking
  - Score display
- **Appraisal Workflow**:
  ```
  Draft → Self Assessment → Manager Review → Committee Review →
  Pending Approval → Approved → Communicated → Completed
  ```

#### 5. Appraisal Form (`/hr/performance/appraisal/:id`)
- **Purpose**: Detailed appraisal evaluation form
- **Tabs**:

  **a. Evaluation**
  - Rating scale: 0-5 (Not Rated to Outstanding)
  - Section-by-section scoring
  - Comments per criteria
  - Self/Manager/Committee views

  **b. Goals**
  - Development goals
  - Target dates
  - Progress tracking
  - Status (Pending, In Progress, Completed)

  **c. Training Needs**
  - Identified training requirements
  - Priority level
  - Status tracking

- **Rating Scale**:
  | Score | Label | Description |
  |-------|-------|-------------|
  | 0 | Not Rated | Not yet evaluated |
  | 1 | Unsatisfactory | Far below expectations |
  | 2 | Needs Improvement | Below expectations |
  | 3 | Basic | Meets minimum requirements |
  | 4 | Good | Meets expectations |
  | 5 | Outstanding | Exceeds expectations |

- **Performance Levels** (Based on percentage):
  | Percentage | Level | Recommendation |
  |------------|-------|----------------|
  | 80%+ | Outstanding | Promotion recommended |
  | 70-79% | Exceeds Expectations | Promotion recommended |
  | 50-69% | Meets Expectations | Contract extension |
  | 30-49% | Needs Improvement | Contract extension with PIP |
  | <30% | Unsatisfactory | Do not extend contract |

#### 6. Probation Tracking (`/hr/performance/probation`)
- **Purpose**: Monitor employees on probation
- **Features**:
  - Probation period setup (1-6 months)
  - Progress tracking
  - KPI definition and monitoring
  - Extension management (max 2 extensions)
  - Confirmation/termination actions
- **Probation Workflow**:
  ```
  Active → Extended (optional, max 2x) → Confirmed/Terminated
  ```
- **KPIs**:
  - Custom KPI creation
  - Target values
  - Weight assignment
  - Achievement tracking

#### 7. PIPs - Performance Improvement Plans (`/hr/performance/pips`)
- **Purpose**: Manage underperforming employees
- **Features**:
  - PIP creation with reason
  - Goal setting
  - Duration (2-12 weeks)
  - Regular check-ins
  - Progress rating
  - Outcome tracking
- **PIP Workflow**:
  ```
  Draft → Active → Under Review → Extended (optional) → Success/Failure
  ```
- **Components**:
  - **Goals**: Specific improvement targets
  - **Check-ins**: Regular progress meetings
    - Progress rating (1-5)
    - Notes and action items
  - **Outcomes**:
    - Successful completion
    - Extended
    - Unsuccessful (may lead to termination)

---

## Training & Capacity Building

### Purpose
Plan, execute, and track employee training and development programs.

### Components

#### 1. Training Dashboard (`/training`)
- **Purpose**: Training overview and metrics
- **Displays**:
  - Upcoming trainings
  - Training completion rates
  - Budget utilization
  - Popular training topics
  - Trainer performance

#### 2. Training Types (`/training/types`)
- **Purpose**: Categorize training programs
- **Types**:
  - Technical Skills
  - Soft Skills
  - Compliance/Mandatory
  - Leadership Development
  - Safety Training
  - Certification Programs
- **Configuration**:
  - Validity period
  - Recertification requirements
  - Target audience

#### 3. Training Programs (`/training/programs`)
- **Purpose**: Define reusable training curriculums
- **Fields**:
  - Program name
  - Description
  - Duration
  - Modules/topics
  - Prerequisites
  - Target positions/departments

#### 4. TNA - Training Needs Assessment (`/training/tna`)
- **Purpose**: Identify training gaps
- **Process**:
  1. Self-assessment by employee
  2. Manager recommendation
  3. Skill gap analysis
  4. Training prioritization
- **Sources**:
  - Performance appraisals
  - New job requirements
  - Technology changes
  - Compliance requirements

#### 5. Trainings (`/training/trainings`)
- **Purpose**: Schedule and manage training sessions
- **Fields**:
  - Training title
  - Type/category
  - Trainer (internal/external)
  - Location (in-person/online)
  - Date and duration
  - Maximum participants
  - Cost per participant
- **Features**:
  - Participant registration
  - Attendance tracking
  - Feedback collection
  - Cost tracking

#### 6. Training Calendar (`/training/calendar`)
- **Purpose**: Visual training schedule
- **Views**:
  - Monthly calendar
  - By department
  - By training type
- **Features**:
  - Drag-and-drop scheduling
  - Conflict detection
  - Resource allocation

#### 7. Training Certificates (`/training/certificates`)
- **Purpose**: Manage training certifications
- **Features**:
  - Certificate generation
  - Validity tracking
  - Expiration alerts
  - Digital certificate storage

#### 8. Training Bonds (`/training/bonds`)
- **Purpose**: Track training bond agreements
- **Fields**:
  - Employee name
  - Training details
  - Bond amount
  - Bond duration
  - Start/end dates
- **Features**:
  - Remaining obligation calculation
  - Early termination cost
  - Bond release processing

---

## Compensation & Benefits

### Purpose
Manage employee compensation, travel allowances, and daily subsistence allowances.

### Components

#### 1. Payroll Overview (`/hr/payroll`)
- **Purpose**: Quick access to payroll functions
- Links to payroll system components

#### 2. Travel & DSA (`/hr/travel-dsa`)
- **Purpose**: Manage travel and per diem allowances
- **Features**:
  - Travel request submission
  - DSA rate configuration by location
  - Advance request
  - Expense reconciliation
  - Reimbursement processing
- **DSA Components**:
  - Daily allowance
  - Accommodation
  - Transportation
  - Meal allowances

---

## HR Administration

### Purpose
Administrative HR functions including asset management, exit processing, and staff welfare.

### Components

#### 1. Asset Management (`/hr/asset-management`)
- **Purpose**: Track assets assigned to employees
- **Asset Types**:
  - IT equipment (laptop, phone)
  - Vehicles
  - Access cards
  - Office equipment
- **Features**:
  - Asset assignment
  - Return tracking
  - Condition reporting
  - Depreciation tracking

#### 2. Exit Management (`/hr/exit-management`)
- **Purpose**: Quick access to exit functions
- Links to exit/termination module

#### 3. Staff Association (`/hr/staff-association`)
- **Purpose**: Manage staff welfare activities
- **Features**:
  - Member registration
  - Contribution tracking
  - Event management
  - Fund management
  - Benefit disbursement

#### 4. Template Documents (`/hr/template-documents`)
- **Purpose**: Manage HR document templates
- **Template Types**:
  - Offer letters
  - Employment contracts
  - Warning letters
  - Termination letters
  - Experience certificates
  - Salary certificates
- **Features**:
  - Variable placeholders
  - Version control
  - Department-specific templates

---

## Disciplinary System

### Purpose
Handle misconduct reports, investigations, disciplinary actions, appeals, and grievances.

### Components

#### 1. Disciplinary Dashboard (`/disciplinary`)
- **Purpose**: Overview of disciplinary matters
- **Displays**:
  - Active cases count
  - Pending investigations
  - Recent actions
  - Appeal status
  - Grievance statistics

#### 2. Misconduct Reports (`/disciplinary/reports`)
- **Purpose**: Log and track misconduct incidents
- **Fields**:
  - Accused employee
  - Reporter
  - Incident date
  - Category (Minor, Major, Gross)
  - Description
  - Witnesses
  - Evidence/documents
- **Statuses**:
  - Draft
  - Submitted
  - Under Investigation
  - Investigation Complete
  - Action Taken
  - Closed

#### 3. Investigations (`/disciplinary/investigations`)
- **Purpose**: Conduct formal investigations
- **Features**:
  - Investigation committee assignment
  - Witness interview scheduling
  - Evidence collection
  - Finding documentation
  - Recommendation submission
- **Process**:
  1. Committee formation
  2. Evidence gathering
  3. Accused statement
  4. Witness interviews
  5. Analysis and findings
  6. Recommendation

#### 4. Disciplinary Actions (`/disciplinary/actions`)
- **Purpose**: Record and track disciplinary measures
- **Action Types**:
  - Verbal warning
  - Written warning (1st, 2nd, Final)
  - Suspension (with/without pay)
  - Demotion
  - Transfer
  - Termination
- **Fields**:
  - Employee
  - Linked misconduct report
  - Action type
  - Effective date
  - Duration (if applicable)
  - Conditions
  - Appeal deadline

#### 5. Appeals (`/disciplinary/appeals`)
- **Purpose**: Handle appeals against disciplinary actions
- **Workflow**:
  ```
  Submitted → Under Review → Hearing Scheduled →
  Decision Made → Upheld/Modified/Overturned
  ```
- **Fields**:
  - Original action
  - Appeal grounds
  - Supporting documents
  - Appeal committee
  - Hearing date
  - Decision

#### 6. Grievances (`/disciplinary/grievances`)
- **Purpose**: Employee complaint management
- **Grievance Types**:
  - Workplace harassment
  - Discrimination
  - Unfair treatment
  - Working conditions
  - Policy disputes
- **Process**:
  1. Grievance submission
  2. Acknowledgment
  3. Investigation (if needed)
  4. Resolution attempt
  5. Formal hearing (if unresolved)
  6. Final decision
  7. Implementation

---

## Exit & Termination

### Purpose
Manage employee separations including resignations, terminations, and retirement.

### Components

#### 1. Exit Dashboard (`/exit`)
- **Purpose**: Overview of separation activities
- **Displays**:
  - Pending clearances
  - Upcoming last days
  - Exit interview status
  - Settlement status
  - Certificate requests

#### 2. Separations (`/exit/separations`)
- **Purpose**: Initiate and track separations
- **Separation Types**:
  - Resignation (voluntary)
  - Termination (involuntary)
  - End of contract
  - Retirement
  - Death
  - Abandonment
- **Fields**:
  - Employee
  - Separation type
  - Reason
  - Notice date
  - Last working day
  - Handover status
- **Workflow**:
  ```
  Initiated → Notice Period → Clearance → Exit Interview →
  Final Settlement → Certificate Issued → Completed
  ```

#### 3. Clearances (`/exit/clearances`)
- **Purpose**: Department-by-department clearance
- **Departments**:
  - IT (equipment return)
  - Finance (advances, loans)
  - Admin (assets, keys, cards)
  - HR (documents, benefits)
  - Direct supervisor (handover)
- **Features**:
  - Checklist per department
  - Pending items tracking
  - Clearance status
  - Outstanding dues calculation

#### 4. Exit Interviews (`/exit/interviews`)
- **Purpose**: Gather feedback from departing employees
- **Topics**:
  - Reason for leaving
  - Job satisfaction
  - Management feedback
  - Suggestions for improvement
  - Would recommend to others
- **Features**:
  - Questionnaire template
  - Confidential submission
  - Analytics and trends

#### 5. Final Settlements (`/exit/settlements`)
- **Purpose**: Calculate and process final payments
- **Components**:

  **Earnings**:
  - Final salary (prorated)
  - Leave encashment
  - Gratuity/severance
  - Bonus (prorated)
  - Other allowances

  **Deductions**:
  - Outstanding advances
  - Loan balance
  - Unreturned assets
  - Notice period buyout
  - Other recoveries

- **Process**:
  1. Calculation
  2. Review and approval
  3. Payment processing
  4. Receipt generation

#### 6. Work Certificates (`/exit/certificates`)
- **Purpose**: Generate employment certificates
- **Types**:
  - Experience certificate
  - Salary certificate
  - No dues certificate
  - Service certificate
- **Features**:
  - Template-based generation
  - Digital signatures
  - QR code verification
  - PDF download

---

## Payroll System

### Purpose
Process employee salaries, manage deductions, advances, loans, and generate payslips.

### Components

#### 1. Payroll Dashboard (`/payroll`)
- **Purpose**: Payroll overview and quick actions
- **Displays**:
  - Current period status
  - Pending approvals
  - Total payroll cost
  - Variance analysis
  - Upcoming deadlines

#### 2. Payroll Periods (`/payroll/periods`)
- **Purpose**: Define and manage pay periods
- **Fields**:
  - Period name
  - Start/end dates
  - Pay date
  - Status
- **Statuses**:
  - Draft
  - Open (data entry)
  - Processing
  - Review
  - Approved
  - Paid
  - Closed
- **Features**:
  - Period locking
  - Rollback capability
  - Period comparison

#### 3. Payroll Entries (`/payroll/entries`)
- **Purpose**: View/edit employee payroll data
- **Sections**:

  **Earnings**:
  - Basic salary
  - Allowances (housing, transport, etc.)
  - Overtime pay
  - Bonuses
  - Incentives

  **Deductions**:
  - Tax withholding
  - Social security
  - Pension contribution
  - Loan installments
  - Advance recovery
  - Other deductions

- **Features**:
  - Bulk import
  - Individual adjustments
  - Calculation preview
  - Audit trail

#### 4. Salary Structures (`/payroll/structures`)
- **Purpose**: Define salary components by grade/position
- **Components**:
  - Basic salary percentage
  - Allowance definitions
  - Deduction rules
  - Calculation formulas
- **Features**:
  - Multiple structures
  - Grade-based assignment
  - Effective date management

#### 5. Advances (`/payroll/advances`)
- **Purpose**: Manage salary advances
- **Workflow**:
  ```
  Request → Manager Approval → Finance Approval → Disbursed → Recovery
  ```
- **Fields**:
  - Employee
  - Amount
  - Reason
  - Repayment plan
  - Deduction start date
- **Features**:
  - Maximum limit rules
  - Auto-deduction setup
  - Balance tracking

#### 6. Loans (`/payroll/loans`)
- **Purpose**: Employee loan management
- **Loan Types**:
  - Emergency loan
  - Housing loan
  - Education loan
  - Vehicle loan
- **Fields**:
  - Loan amount
  - Interest rate
  - Tenure (months)
  - Installment amount
  - Start date
- **Features**:
  - EMI calculator
  - Amortization schedule
  - Prepayment handling
  - Outstanding balance

#### 7. Overtime (`/payroll/overtime`)
- **Purpose**: Track and approve overtime hours
- **Fields**:
  - Employee
  - Date
  - Hours worked
  - Overtime type (weekday, weekend, holiday)
  - Rate multiplier
- **Rates**:
  - Weekday overtime: 1.5x
  - Weekend: 2.0x
  - Holiday: 2.5x
- **Workflow**:
  ```
  Entry → Supervisor Approval → HR Verification → Payroll Processing
  ```

#### 8. Payslips (`/payroll/payslips`)
- **Purpose**: Generate and distribute pay statements
- **Content**:
  - Employee details
  - Pay period
  - Earnings breakdown
  - Deductions breakdown
  - Net pay
  - Year-to-date totals
- **Features**:
  - PDF generation
  - Email distribution
  - Employee self-service access
  - Historical payslips
  - Bulk generation

---

## Data Storage

All HR module data is stored in IndexedDB with the following database structure:

### Database Configuration
- **Name**: `vdo-erp-db`
- **Current Version**: 33

### Key Stores by Module

| Module | Stores |
|--------|--------|
| Employee Admin | employees, emergencyContacts, employeeEducation, employeeExperience, employeeSkills, employeeDocuments, dependents |
| Organization | departments, positions, offices, grades, employeeTypes, workSchedules |
| Recruitment | recruitments, candidates, interviews, termsOfReferences, etc. |
| Leave Management | leaveRequests, leaveTypes, leavePolicies, leaveBalances, holidays |
| Training | trainingTypes, trainingPrograms, trainings, tnaRecords, certificates, bonds |
| Disciplinary | misconductReports, investigations, disciplinaryActions, appeals, grievances |
| Exit | separations, clearances, exitInterviews, settlements, workCertificates |
| Payroll | payrollPeriods, payrollEntries, salaryStructures, advances, loans, overtimeRecords |
| Performance | appraisalCycles, appraisalTemplates, employeeAppraisals, appraisalRatings, probationRecords, pips |

---

## Security & Access Control

### Role-Based Access
- **Super Admin**: Full access to all modules
- **HR Manager**: Full HR module access
- **HR Officer**: Limited HR access (no approvals)
- **Department Manager**: Own department employees
- **Employee**: Self-service only

### Audit Trail
All critical actions are logged:
- Who performed the action
- What was changed
- When it occurred
- Previous and new values

---

## Best Practices

1. **Data Entry**
   - Always complete required fields
   - Use consistent naming conventions
   - Upload supporting documents

2. **Workflow Compliance**
   - Follow approval chains
   - Document reasons for decisions
   - Meet deadlines

3. **Performance Management**
   - Set SMART goals
   - Provide regular feedback
   - Document performance issues

4. **Separation Processing**
   - Complete all clearances
   - Conduct exit interviews
   - Process settlements promptly

---

## Troubleshooting

### Common Issues

1. **Data not loading**
   - Check browser IndexedDB storage
   - Clear cache and reload
   - Check console for errors

2. **Workflow stuck**
   - Verify all required fields
   - Check user permissions
   - Review workflow status

3. **Reports not generating**
   - Ensure date range is valid
   - Check if data exists
   - Verify filter criteria

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 2024 | Initial HR module |
| 1.1 | Dec 2024 | Added Recruitment module |
| 1.2 | Dec 2024 | Added Training module |
| 1.3 | Dec 2024 | Added Disciplinary module |
| 1.4 | Dec 2024 | Added Exit module |
| 1.5 | Dec 2024 | Added Payroll module |
| 1.6 | Dec 2024 | Added Performance Appraisal module |

---

*Documentation Last Updated: December 2024*
