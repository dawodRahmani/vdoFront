# Compliance Management System - Tables Documentation

## Overview

This is a React-based compliance management system that uses client-side storage (localStorage + IndexedDB) to persist data. There is **no backend database** - all data is stored locally in the browser.

### Storage Architecture

- **Storage Keys**: All data uses prefix `compliance_` (e.g., `compliance_projects`)
- **Database**: IndexedDB named `ComplianceDB`
- **Persistence**: Dual storage - localStorage + IndexedDB

---

## Tables Summary

| # | Table Name | Storage Key | Purpose |
|---|------------|-------------|---------|
| 1 | Projects | `compliance_projects` | Track funded projects from donors |
| 2 | Amendments | `compliance_amendments` | Track project modifications |
| 3 | Proposals | `compliance_proposals` | Track proposal submissions |
| 4 | Due Diligence | `compliance_due_diligence` | Track due diligence processes |
| 5 | Registrations | `compliance_registrations` | Track platform registrations |
| 6 | Memberships | `compliance_memberships` | Track platform memberships |
| 7 | Donors | `compliance_donors` | Maintain donor directory |
| 8 | Correspondence | `compliance_correspondences` | Track sectoral authority correspondence |
| 9 | Certificates | `compliance_certificates` | Track MOUs, LOIs, agreements |
| 10 | BOD | `compliance_bod` | Track board member information |
| 11 | Partners | `compliance_partners` | Track implementing partners |
| 12 | Donor Outreach | `compliance_donor_outreach` | Track donor outreach efforts |
| 13 | Government Outreach | `compliance_govt_outreach` | Track government entity outreach |
| 14 | Compliance Documents | `compliance_documents` | Store organizational documents |
| 15 | Blacklist | `compliance_blacklist` | Track blacklisted individuals/entities |

---

## Detailed Table Schemas

### 1. Projects Table

**Storage Key**: `compliance_projects`

| Field | Type | Description |
|-------|------|-------------|
| id | number | Auto-generated (Date.now()) |
| donor_name | string | Name of funding donor (required) |
| project_name | string | Project title (required) |
| target_beneficiaries | string | Who benefits from the project |
| location | string | Geographic location |
| project_budget_euro | number | Budget in Euros |
| project_budget_usd | number | Budget in US Dollars |
| project_budget_afg | number | Budget in Afghan Afghani |
| start_date | date | Project start date |
| end_date | date | Project end date |
| status | enum | 'Other', 'Active', 'Completed', 'Pending', 'Cancelled', 'On Hold' |
| created_at | datetime | Creation timestamp |
| updated_at | datetime | Last update timestamp |

---

### 2. Amendments Table

**Storage Key**: `compliance_amendments`
**Relationship**: Belongs to Projects (via `project_id`)

| Field | Type | Description |
|-------|------|-------------|
| id | number | Auto-generated (Date.now()) |
| project_id | number | Foreign key to Projects (required) |
| target_beneficiaries | string | Updated beneficiaries |
| location | string | Updated location |
| project_budget_euro | number | Amended budget (EUR) |
| project_budget_usd | number | Amended budget (USD) |
| project_budget_afg | number | Amended budget (AFG) |
| amendment_start_date | date | When amendment takes effect |
| status | enum | 'Other', 'Active', 'Completed', 'Pending', 'Cancelled', 'On Hold' |
| created_at | datetime | Creation timestamp |
| updated_at | datetime | Last update timestamp |

---

### 3. Proposals Table

**Storage Key**: `compliance_proposals`

| Field | Type | Description |
|-------|------|-------------|
| id | number | Auto-generated (Date.now()) |
| donor_name | string | Target donor (required) |
| activities_description | string | Description of proposed activities |
| beneficiaries | string | Target beneficiaries |
| proposal_deadline | date | Submission deadline |
| budget | number | Requested budget (USD) |
| duration | string | Project duration (e.g., "6 months") |
| location | string | Implementation location |
| announced_platform | enum | 'unpp', 'ungm', 'acbar', 'solesource', 'other' |
| submission_platform | string | Where proposal was submitted |
| status | enum | 'draft', 'submitted', 'under_review', 'accepted', 'rejected' |
| result | enum | 'pending', 'approved', 'rejected', 'cancelled' |
| result_end_date | date | Result announcement date |
| rejection_reason | string | Reason if rejected |
| multiple_documents | array | Array of uploaded document objects |
| created_at | datetime | Creation timestamp |
| updated_at | datetime | Last update timestamp |

---

### 4. DD Tracking (Due Diligence Tracking)

**Storage Key**: `dueDiligence`

**Purpose**: Track due diligence processes with donors

| Field | Type | Description |
|-------|------|-------------|
| id | number | Auto-generated serial number (autoIncrement) |
| donorName | string | Name of donor organization (required) |
| ddDeadline | date | Due diligence deadline (required) |
| officeVisitDate | date | Date of office visit |
| ddStartDate | date | When DD process started |
| ddCompletionDate | date | When DD process completed |
| status | enum | 'rejected', 'completed', 'status_unknown', 'in_progress' |
| ddDocumentsLink | string | Link to submitted DD documents |
| createdAt | datetime | Creation timestamp |
| updatedAt | datetime | Last update timestamp |

**Notes**:
- Extractable in Excel sheet
- Tracks complete DD lifecycle from start to completion
- Links to document repository

---

### 5. Registration - VDO Registration

**Storage Key**: `registrations`

**Purpose**: Track VDO's registration and accounts on various platforms and organizations

| Field | Type | Description |
|-------|------|-------------|
| id | number | Auto-generated serial number (autoIncrement) |
| organizationPlatform | string | Name of organization/platform (required) |
| status | string | Registration status (flexible text) |
| websiteLink | string | Link to platform website (URL) |
| registrationId | string | Unique registration identifier |
| userName | string | Login username (required) |
| currentPassword | string | Current password (stored in browser, security warning displayed) |
| recoveryEmail | string | Email for password recovery |
| recoveryNumber | string | Phone number for recovery |
| dateRegistrationStarted | date | When registration process began |
| dateRegistrationCompleted | date | When registration was completed |
| remarks | string | Additional notes |
| createdAt | datetime | Creation timestamp |
| updatedAt | datetime | Last update timestamp |

**Notes**:
- Extractable in Excel sheet
- Secure storage of credentials required (currently browser-based, production needs backend encryption)
- Track registration lifecycle from start to completion
- Website links are clickable in table view
- Password field includes show/hide toggle
- Status uses smart color coding (active=green, pending=yellow, expired=red)

---

### 6. Membership - VDO's Membership and Representation in Different Platforms

**Storage Key**: `memberships`

**Purpose**: Track VDO's memberships, roles, and representation across various platforms and organizations

| Field | Type | Description |
|-------|------|-------------|
| id | number | Auto-generated serial number (autoIncrement) |
| nameMembershipPlatform | string | Name of the platform/organization (required) |
| platformType | enum | Platform type: 'Coordination Body', 'UN Platform', 'Cluster', 'Network', 'Working Group' |
| vdoRole | enum | VDO's role: 'Member', 'Lead/Chair', 'Co-lead', 'Facilitator', 'Co-Facilitator', 'Steering Committee Member', 'Strategic Advisory Group Member', 'SC Member', 'Others' |
| status | enum | Membership status: 'Member', 'Lead/Chair', 'Co-lead', 'Non-Active', 'Platform Deactivated', 'Suspended', 'Completed', 'Active', '1 year completed', 'Re-elected', 'TBC', 'Others' |
| durationMembership | enum | Duration type: 'Long term', 'Ad-hoc', 'Annually', 'Other' |
| year | string | Year of membership |
| dateMembershipStarted | date | Manual date selection for start date (required) |
| membershipCompletionOption | enum | Completion type: 'no_expiry', 'on_going', '1_year_completed', 'date_specified' |
| membershipCompletionDate | date | Specific completion date (if date_specified option selected) |
| hasCertificate | enum | Certificate availability: 'yes', 'no' |
| membershipCertificate | string | Certificate file URL/link (for upload functionality) |
| createdAt | datetime | Creation timestamp |
| updatedAt | datetime | Last update timestamp |

**Notes**:
- Upload membership certificate functionality (URL-based currently, file upload with backend)
- Each field is filterable
- Option for "no expiry" on completion date
- Date manual selection for start dates
- Role-based color coding (Lead/Chair highlighted, Facilitators, Committee members)
- Status smart color coding (Active=green, Completed=blue, Non-Active/Suspended=red, TBC=yellow)
- Certificate icon indicator in table view

---

### 7. Donors Table

**Storage Key**: `compliance_donors`

| Field | Type | Description |
|-------|------|-------------|
| id | number | Auto-generated (Date.now()) |
| donor_name | string | Donor name (required) |
| donor_type | enum | 'governmental', 'non-governmental', 'private' (required) |
| country | string | Donor's country |
| website_link | string | Donor website URL |
| contact_person_name | string | Primary contact name |
| contact_person_email | string | Contact email |
| contact_person_phone | string | Contact phone |
| notes | string | Additional notes |
| created_at | datetime | Creation timestamp |
| updated_at | datetime | Last update timestamp |

---

### 8. Correspondence Table

**Storage Key**: `compliance_correspondences`

| Field | Type | Description |
|-------|------|-------------|
| id | number | Auto-generated (Date.now()) |
| name_of_sectoral_authority | string | Authority name (required) |
| project | string | Related project name (required) |
| donor | string | Related donor |
| location | string | Location |
| status | enum | 'pending', 'approved', 'rejected', 'other' |
| upload_documents | array | Array of uploaded document objects |
| created_at | datetime | Creation timestamp |
| updated_at | datetime | Last update timestamp |

---

### 9. Certificates - VDO's Acknowledgement/Certification Documents

**Storage Key**: `certificates`

**Purpose**: Track appreciation letters, certificates, and acknowledgements received from various organizations

| Field | Type | Description |
|-------|------|-------------|
| id | number | Auto-generated serial number (autoIncrement) |
| nameOfInstitution | string | Name of issuing institution (required) |
| institutionDescription | string | Description of the institution |
| agency | enum | Agency type: 'Donor', 'Partners', 'Authority', 'Stakeholder', 'Others' (required) |
| typeOfDocument | enum | Document type: 'Appreciation Letter', 'Work Completion Certificate', 'Project Completion Certificate', 'Recommendation Letter', 'Any Other' (required) |
| date | date | Date of certificate/letter (required) |
| areasOfCollaboration | string | Description of collaboration areas |
| documentLink | string | Document file URL/link (for upload functionality) |
| createdAt | datetime | Creation timestamp |
| updatedAt | datetime | Last update timestamp |

**Access Control Notes**:
- **Add/Edit**: Program and CDG departments can add (to be enforced with backend)
- **Delete/Edit**: No one can delete/edit once added (policy enforcement note displayed)
- **View**: Both departments can view

**Notes**:
- Agency color coding: Donor=blue, Partners=green, Authority=purple, Stakeholder=yellow
- Document type icons: Certificates show award icon, Letters show document icon
- Warning displayed when editing existing records about access control policy
- File upload placeholder for backend integration

---

### 10. Board of Directors (BOD) Table

**Storage Key**: `compliance_bod`

| Field | Type | Description |
|-------|------|-------------|
| id | number | Auto-generated (Date.now()) |
| name | string | Board member name (required) |
| role_in_board | enum | 'Chairman', 'Vice Chairman', 'Secretary', 'Treasurer', 'Director', etc. (required) |
| start_date | date | Term start date |
| end_date | date | Term end date |
| education_qualification | array | Array of education objects |
| nid_file | string | National ID file (base64) |
| picture | string | General picture (base64) |
| passport_file | string | Passport file (base64) |
| profile_picture | string | Profile picture (base64) |
| mobile_number | string | Mobile phone |
| whatsapp_number | string | WhatsApp number |
| email | string | Email address |
| status | enum | 'active', 'inactive', 'retired', 'other' |
| additional_files | array | Array of additional file objects |
| created_at | datetime | Creation timestamp |
| updated_at | datetime | Last update timestamp |

---

### 11. VDO Partners - VDO's Partners Tracking Sheet

**Storage Key**: `partners`

**Purpose**: Track partnership agreements and their status

| Field | Type | Description |
|-------|------|-------------|
| id | number | Auto-generated serial number (autoIncrement) |
| namePartner | string | Name of partner organization (required) |
| areaCollaboration | string | Description of collaboration area |
| location | string | Partnership location |
| budget | number | Partnership budget in USD |
| startDate | date | Partnership start date (required) |
| endDate | date | Partnership end date |
| status | enum | Status: 'Active', 'Non active', 'Amended', 'Suspended', 'Extended', 'Terminated' |
| documentLink | string | Partnership agreement document URL/link |
| createdAt | datetime | Creation timestamp |
| updatedAt | datetime | Last update timestamp |

**Notes**:
- Budget displayed with currency formatting and dollar sign icon
- Period column shows start and end dates (stacked display)
- Duration automatically calculated in months based on start/end dates
- Status color coding: Active=green, Extended=blue, Amended=yellow, Non active=gray, Suspended=orange, Terminated=red
- Document link clickable when provided
- Collaboration area truncated in table with hover tooltip
- Budget right-aligned with green dollar sign icon

---

### 12. Donor Outreach Table

**Storage Key**: `compliance_donor_outreach`

| Field | Type | Description |
|-------|------|-------------|
| id | number | Auto-generated (Date.now()) |
| donor_name | string | Potential donor name (required) |
| categories | string | Donor interest categories |
| location | string | Donor location |
| area_of_collaboration | string | Proposed collaboration areas |
| point_of_contact | string | Contact person |
| first_meeting_outcome | string | First meeting results |
| second_meeting_outcome | string | Second meeting results |
| third_meeting_outcome | string | Third meeting results |
| final_outcome | string | Final partnership outcome |
| created_at | datetime | Creation timestamp |
| updated_at | datetime | Last update timestamp |

---

### 13. Government Outreach Table

**Storage Key**: `compliance_govt_outreach`

| Field | Type | Description |
|-------|------|-------------|
| id | number | Auto-generated (Date.now()) |
| govt_entity_name | string | Government entity name (required) |
| meeting_with | string | Person/position met with |
| meeting_agenda | string | Meeting agenda description |
| expected_outcome | string | Expected outcomes |
| first_meeting_date | date | First meeting date |
| second_meeting_date | date | Second meeting date |
| third_meeting_date | date | Third meeting date |
| fourth_meeting_date | date | Fourth meeting date |
| created_at | datetime | Creation timestamp |
| updated_at | datetime | Last update timestamp |

---

### 14. Compliance Documents Table

**Storage Key**: `compliance_documents`

| Field | Type | Description |
|-------|------|-------------|
| id | number | Auto-generated (Date.now()) |
| year | number | Document year (required) |
| name | string | Document name (required) |
| file | string | File path or URL |
| description | string | Document description |
| category | enum | 'financial', 'legal', 'administrative', 'other' |
| created_at | datetime | Creation timestamp |
| updated_at | datetime | Last update timestamp |

---

### 15. Restricted List - VDO's Restricted List

**Storage Key**: `blacklist`

**Purpose**: Track restricted individuals and entities across different categories with access control

| Field | Type | Description |
|-------|------|-------------|
| id | number | Auto-generated serial number (autoIncrement) |
| name | string | Name of restricted entity/person (required) |
| description | string | Details about restriction |
| category | enum | Category: 'Staff', 'Supplier/Vendor/Contractor', 'Partner', 'Visitor', 'Participants' (required) |
| start | date | Restriction start date (required) |
| endOption | enum | End option: 'no_expiry', 'date_specified' |
| end | date | Restriction end date (if date_specified option selected) |
| reason | string | Reason for restriction (required) |
| documentLink | string | Supporting documentation URL/link |
| access | enum | Access level: 'Department Head', 'HR Only', 'Finance Only', 'All Departments', 'Senior Management', 'Restricted - Confidential' (required) |
| createdAt | datetime | Creation timestamp |
| updatedAt | datetime | Last update timestamp |

**Notes**:
- Security notice displayed when adding/editing entries
- Category color coding: Staff=red, Supplier/Vendor/Contractor=orange, Partner=yellow, Visitor=blue, Participants=purple
- Access level color coding: Confidential=red bold, Senior Management=purple medium, All Departments=blue, Others=gray
- Status automatically calculated: Active (if no expiry or end date in future), Expired (if end date passed)
- End date displays "No expiry" when no_expiry option selected
- Access control defines who can view restricted entries
- Reason field truncated in table with hover tooltip
- Name can include optional description (shown below name in smaller text)
- Security-focused with access control enforcement

---

## Data Flow and Relationships

### Primary Relationship

**Projects -> Amendments**: One-to-Many relationship via `project_id`
- When a project is deleted, all related amendments are automatically deleted
- Amendments can be filtered by project

### Workflow Relationships

```
                    +------------------+
                    |     Donors       |
                    +--------+---------+
                             |
              +--------------+--------------+
              |                             |
    +---------v---------+         +---------v---------+
    |  Donor Outreach   |         |   Due Diligence   |
    +-------------------+         +---------+---------+
                                            |
                                  +---------v---------+
                                  |    Proposals      |
                                  +---------+---------+
                                            |
                                  +---------v---------+
                                  |    Projects       |
                                  +---------+---------+
                                            |
                                  +---------v---------+
                                  |   Amendments      |
                                  +-------------------+
```

### Key Workflows

1. **Proposal Lifecycle**:
   - Status: draft -> submitted -> under_review -> accepted/rejected
   - Result: pending -> approved/rejected/cancelled
   - If approved, can become a Project

2. **Due Diligence Flow**:
   - Linked to Donors by name
   - Status progression: in_progress -> completed/rejected

3. **Donor Management**:
   - Donors table = master directory
   - Donor Outreach = relationship building
   - Projects reference donor_name

4. **Partnership Flow**:
   - Partners = implementing partners
   - Certificates = formal agreements
   - Government Outreach = public sector

5. **Compliance Tracking**:
   - Registrations = platform credentials
   - Memberships = active memberships
   - Compliance Documents = organizational records
   - Blacklist = risk management

---

## Navigation Tabs

1. Init Project (Projects)
2. Amendment Project (Amendments)
3. Proposals Concept Tracking (Proposals)
4. Due Diligence Tracking (Due Diligence)
5. Registration (Registrations)
6. Membership in Platforms (Memberships)
7. Donors (Donors Directory)
8. Correspondence (Approved Correspondence)
9. Certificates (Certificates & Agreements)
10. BOD (Board of Directors)
11. Partners (Partners)
12. Donor Outreach (Donor Outreach)
13. Government Outreach (Government Outreach)
14. Compliance Documents (Compliance Documents)
15. Blacklist (Blacklist)

---

## Key Source Files

| File | Description |
|------|-------------|
| `src/App.jsx` | Main application component |
| `src/utils/storage.js` | Storage utilities (localStorage + IndexedDB) |
| `src/utils/sampleData.js` | Sample data for testing |
| `src/utils/constants.js` | Status enums and constants |
| `src/hooks/` | One custom hook per table for CRUD operations |
| `src/modules/*/components/*Form.jsx` | Form components for each table |
| `src/modules/*/components/*List.jsx` | List/table display components |
