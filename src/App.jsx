import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { RecruitmentProvider } from './contexts/RecruitmentContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';

// User Management Pages
import Users from './pages/user-management/Users';
import Roles from './pages/user-management/Roles';
import Permissions from './pages/user-management/Permissions';
import RolePermissions from './pages/user-management/RolePermissions';

// Compliance Pages
import {
  ComplianceProjects,
  ComplianceAmendments,
  RFPTracking,
  DueDiligence,
  Registrations,
  Memberships,
  Certificates,
  Partners,
  DonorOutreach,
  ComplianceDocuments,
  Blacklist
} from './pages/compliance';

// Procurement Pages
import {
  PurchaseRequests,
  Vendors,
  PurchaseOrders,
  Contracts,
  Inventory,
  Receiving
} from './pages/procurement';

// Finance Pages
import {
  Donors,
  Projects,
  Banks,
  BankAccounts,
  BudgetCategories,
  ProjectBudgets,
  CashRequests,
  Installments,
  StaffAllocations,
  DonorReports,
  GovernmentReports,
  Amendments,
  FinancialReports
} from './pages/finance';

// Programm Pages
import {
  ProgramWorkPlanList,
  ProgramWorkPlanForm,
  ProgramWorkPlanView,
  DNRTrackingList,
  DNRTrackingForm,
  DNRTrackingView,
  MOUTrackingList,
  MOUTrackingForm,
  MOUTrackingView,
  InOutTrackingList,
  InOutTrackingForm,
  InOutTrackingView,
  AccessTrackingList,
  AccessTrackingForm,
  AccessTrackingView
} from './pages/programm';

// HR Management Pages
import Departments from './pages/hr-management/Departments';
import Positions from './pages/hr-management/Positions';
import Offices from './pages/hr-management/Offices';
import Grades from './pages/hr-management/Grades';
import EmployeeTypes from './pages/hr-management/EmployeeTypes';
import WorkSchedules from './pages/hr-management/WorkSchedules';
import Attendance from './pages/hr-management/Attendance';
import LeaveManagement from './pages/hr-management/LeaveManagement';
import LeaveTypes from './pages/hr-management/LeaveTypes';
import LeavePolicies from './pages/hr-management/LeavePolicies';
import LeaveBalances from './pages/hr-management/LeaveBalances';
import Holidays from './pages/hr-management/Holidays';
import LeaveCalendar from './pages/hr-management/LeaveCalendar';
import Timesheets from './pages/hr-management/Timesheets';
import LeaveReports from './pages/hr-management/LeaveReports';
import Recruitment from './pages/hr-management/Recruitment';
import Payroll from './pages/hr-management/Payroll';
import TemplateDocuments from './pages/hr-management/TemplateDocuments';
import ProbationOrientation from './pages/hr-management/ProbationOrientation';
import PerformanceManagement from './pages/hr-management/PerformanceManagement';
import TrainingDevelopment from './pages/hr-management/TrainingDevelopment';
import DisciplinaryGrievance from './pages/hr-management/DisciplinaryGrievance';
import TravelDSA from './pages/hr-management/TravelDSA';
import AssetManagement from './pages/hr-management/AssetManagement';
import ExitManagement from './pages/hr-management/ExitManagement';
import StaffAssociation from './pages/hr-management/StaffAssociation';

// Employee Administration Module Pages
import {
  HRDashboard,
  EmployeeList,
  EmployeeProfile,
  EmployeeForm,
  OnboardingDashboard,
  ContractManagement,
  InterimHiring,
  PersonnelFiles,
  MahramRegistration,
  HRReports
} from './pages/employee-admin';

// Recruitment Module Pages
import RecruitmentList from './pages/recruitment/RecruitmentList';
import NewRecruitment from './pages/recruitment/NewRecruitment';
import RecruitmentDetail from './pages/recruitment/RecruitmentDetail';

// Training Module Pages
import {
  TrainingDashboard,
  TrainingTypes,
  TrainingPrograms,
  TNAList,
  TNAForm,
  TrainingsList,
  TrainingForm,
  TrainingCalendar,
  TrainingCertificates,
  TrainingBonds,
} from './pages/training';

// Disciplinary Module Pages
import {
  DisciplinaryDashboard,
  MisconductReports,
  MisconductReportForm,
  Investigations,
  DisciplinaryActions,
  Appeals,
  Grievances
} from './pages/disciplinary';

// Exit & Termination Module Pages
import {
  ExitDashboard,
  SeparationsList,
  SeparationForm,
  ClearancesList,
  ExitInterviewList,
  FinalSettlements,
  WorkCertificates,
} from './pages/exit';

// Payroll Module Pages
import {
  PayrollDashboard,
  PayrollPeriods,
  PayrollEntries,
  SalaryStructures,
  Advances,
  Loans,
  OvertimeRecords,
  Payslips
} from './pages/payroll';

// Performance Appraisal Module Pages
import {
  PerformanceDashboard,
  AppraisalCycles,
  AppraisalTemplates,
  EmployeeAppraisals,
  AppraisalForm,
  ProbationTracking,
  PIPs
} from './pages/performance';

function App() {
  return (
    <ThemeProvider>
      <RecruitmentProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />

            {/* User Management Routes */}
            <Route path="user-management/users" element={<Users />} />
            <Route path="user-management/roles" element={<Roles />} />
            <Route path="user-management/permissions" element={<Permissions />} />
            <Route path="user-management/role-permissions" element={<RolePermissions />} />

            {/* Employee Administration Routes */}
            <Route path="employee-admin" element={<HRDashboard />} />
            <Route path="employee-admin/dashboard" element={<HRDashboard />} />
            <Route path="employee-admin/employees" element={<EmployeeList />} />
            <Route path="employee-admin/employees/new" element={<EmployeeForm />} />
            <Route path="employee-admin/employees/:id" element={<EmployeeProfile />} />
            <Route path="employee-admin/employees/:id/edit" element={<EmployeeForm />} />
            <Route path="employee-admin/onboarding" element={<OnboardingDashboard />} />
            <Route path="employee-admin/contracts" element={<ContractManagement />} />
            <Route path="employee-admin/interim-hiring" element={<InterimHiring />} />
            <Route path="employee-admin/personnel-files" element={<PersonnelFiles />} />
            <Route path="employee-admin/personnel-files/:id" element={<PersonnelFiles />} />
            <Route path="employee-admin/mahram" element={<MahramRegistration />} />
            <Route path="employee-admin/reports" element={<HRReports />} />

            {/* HR Settings Routes */}
            <Route path="hr/departments" element={<Departments />} />
            <Route path="hr/positions" element={<Positions />} />
            <Route path="hr/offices" element={<Offices />} />
            <Route path="hr/grades" element={<Grades />} />
            <Route path="hr/employee-types" element={<EmployeeTypes />} />
            <Route path="hr/work-schedules" element={<WorkSchedules />} />
            <Route path="hr/attendance" element={<Attendance />} />
            <Route path="hr/leave-management" element={<LeaveManagement />} />
            <Route path="hr/leave-types" element={<LeaveTypes />} />
            <Route path="hr/leave-policies" element={<LeavePolicies />} />
            <Route path="hr/leave-balances" element={<LeaveBalances />} />
            <Route path="hr/holidays" element={<Holidays />} />
            <Route path="hr/leave-calendar" element={<LeaveCalendar />} />
            <Route path="hr/timesheets" element={<Timesheets />} />
            <Route path="hr/leave-reports" element={<LeaveReports />} />
            <Route path="hr/recruitment" element={<Recruitment />} />
            <Route path="hr/probation-orientation" element={<ProbationOrientation />} />
            <Route path="hr/performance" element={<PerformanceManagement />} />
            <Route path="hr/training" element={<TrainingDevelopment />} />
            <Route path="hr/disciplinary-grievance" element={<DisciplinaryGrievance />} />
            <Route path="hr/travel-dsa" element={<TravelDSA />} />
            <Route path="hr/asset-management" element={<AssetManagement />} />
            <Route path="hr/exit-management" element={<ExitManagement />} />
            <Route path="hr/staff-association" element={<StaffAssociation />} />
            <Route path="hr/payroll" element={<Payroll />} />
            <Route path="hr/template-documents" element={<TemplateDocuments />} />

            {/* Compliance Routes */}
            <Route path="compliance/projects" element={<ComplianceProjects />} />
            <Route path="compliance/amendments" element={<ComplianceAmendments />} />
            <Route path="compliance/rfp-tracking" element={<RFPTracking />} />
            <Route path="compliance/due-diligence" element={<DueDiligence />} />
            <Route path="compliance/registrations" element={<Registrations />} />
            <Route path="compliance/memberships" element={<Memberships />} />
            <Route path="compliance/certificates" element={<Certificates />} />
            <Route path="compliance/partners" element={<Partners />} />
            <Route path="compliance/donor-outreach" element={<DonorOutreach />} />
            <Route path="compliance/documents" element={<ComplianceDocuments />} />
            <Route path="compliance/blacklist" element={<Blacklist />} />

            {/* Procurement Routes */}
            <Route path="procurement/purchase-requests" element={<PurchaseRequests />} />
            <Route path="procurement/vendors" element={<Vendors />} />
            <Route path="procurement/purchase-orders" element={<PurchaseOrders />} />
            <Route path="procurement/contracts" element={<Contracts />} />
            <Route path="procurement/inventory" element={<Inventory />} />
            <Route path="procurement/receiving" element={<Receiving />} />

            {/* Finance Routes */}
            <Route path="finance/donors" element={<Donors />} />
            <Route path="finance/projects" element={<Projects />} />
            <Route path="finance/banks" element={<Banks />} />
            <Route path="finance/bank-accounts" element={<BankAccounts />} />
            <Route path="finance/budget-categories" element={<BudgetCategories />} />
            <Route path="finance/project-budgets" element={<ProjectBudgets />} />
            <Route path="finance/cash-requests" element={<CashRequests />} />
            <Route path="finance/installments" element={<Installments />} />
            <Route path="finance/staff-allocations" element={<StaffAllocations />} />
            <Route path="finance/donor-reports" element={<DonorReports />} />
            <Route path="finance/government-reports" element={<GovernmentReports />} />
            <Route path="finance/amendments" element={<Amendments />} />
            <Route path="finance/reports" element={<FinancialReports />} />

            {/* Programm Routes */}
            <Route path="programm/work-plans" element={<ProgramWorkPlanList />} />
            <Route path="programm/work-plans/new" element={<ProgramWorkPlanForm />} />
            <Route path="programm/work-plans/:id" element={<ProgramWorkPlanView />} />
            <Route path="programm/work-plans/:id/edit" element={<ProgramWorkPlanForm />} />

            <Route path="programm/dnr-tracking" element={<DNRTrackingList />} />
            <Route path="programm/dnr-tracking/new" element={<DNRTrackingForm />} />
            <Route path="programm/dnr-tracking/:id" element={<DNRTrackingView />} />
            <Route path="programm/dnr-tracking/:id/edit" element={<DNRTrackingForm />} />

            <Route path="programm/mou-tracking" element={<MOUTrackingList />} />
            <Route path="programm/mou-tracking/new" element={<MOUTrackingForm />} />
            <Route path="programm/mou-tracking/:id" element={<MOUTrackingView />} />
            <Route path="programm/mou-tracking/:id/edit" element={<MOUTrackingForm />} />

            <Route path="programm/in-out-tracking" element={<InOutTrackingList />} />
            <Route path="programm/in-out-tracking/new" element={<InOutTrackingForm />} />
            <Route path="programm/in-out-tracking/:id" element={<InOutTrackingView />} />
            <Route path="programm/in-out-tracking/:id/edit" element={<InOutTrackingForm />} />

            <Route path="programm/access-tracking" element={<AccessTrackingList />} />
            <Route path="programm/access-tracking/new" element={<AccessTrackingForm />} />
            <Route path="programm/access-tracking/:id" element={<AccessTrackingView />} />
            <Route path="programm/access-tracking/:id/edit" element={<AccessTrackingForm />} />

            {/* Recruitment Module Routes */}
            <Route path="recruitment" element={<RecruitmentList />} />
            <Route path="recruitment/new" element={<NewRecruitment />} />
            <Route path="recruitment/:id" element={<RecruitmentDetail />} />

            {/* Training Module Routes */}
            <Route path="training" element={<TrainingDashboard />} />
            <Route path="training/types" element={<TrainingTypes />} />
            <Route path="training/programs" element={<TrainingPrograms />} />
            <Route path="training/tna" element={<TNAList />} />
            <Route path="training/tna/new" element={<TNAForm />} />
            <Route path="training/tna/:id" element={<TNAForm />} />
            <Route path="training/tna/:id/edit" element={<TNAForm />} />
            <Route path="training/trainings" element={<TrainingsList />} />
            <Route path="training/trainings/new" element={<TrainingForm />} />
            <Route path="training/trainings/:id" element={<TrainingForm />} />
            <Route path="training/trainings/:id/edit" element={<TrainingForm />} />
            <Route path="training/calendar" element={<TrainingCalendar />} />
            <Route path="training/certificates" element={<TrainingCertificates />} />
            <Route path="training/bonds" element={<TrainingBonds />} />

            {/* Disciplinary Module Routes */}
            <Route path="disciplinary" element={<DisciplinaryDashboard />} />
            <Route path="disciplinary/dashboard" element={<DisciplinaryDashboard />} />
            <Route path="disciplinary/reports" element={<MisconductReports />} />
            <Route path="disciplinary/reports/new" element={<MisconductReportForm />} />
            <Route path="disciplinary/reports/:id" element={<MisconductReportForm />} />
            <Route path="disciplinary/reports/:id/edit" element={<MisconductReportForm />} />
            <Route path="disciplinary/investigations" element={<Investigations />} />
            <Route path="disciplinary/investigations/:id" element={<Investigations />} />
            <Route path="disciplinary/actions" element={<DisciplinaryActions />} />
            <Route path="disciplinary/actions/:id" element={<DisciplinaryActions />} />
            <Route path="disciplinary/appeals" element={<Appeals />} />
            <Route path="disciplinary/appeals/:id" element={<Appeals />} />
            <Route path="disciplinary/grievances" element={<Grievances />} />
            <Route path="disciplinary/grievances/:id" element={<Grievances />} />

            {/* Exit & Termination Module Routes */}
            <Route path="exit" element={<ExitDashboard />} />
            <Route path="exit/dashboard" element={<ExitDashboard />} />
            <Route path="exit/separations" element={<SeparationsList />} />
            <Route path="exit/separations/new" element={<SeparationForm />} />
            <Route path="exit/separations/:id" element={<SeparationForm />} />
            <Route path="exit/separations/:id/edit" element={<SeparationForm />} />
            <Route path="exit/clearances" element={<ClearancesList />} />
            <Route path="exit/interviews" element={<ExitInterviewList />} />
            <Route path="exit/interviews/new" element={<ExitInterviewList />} />
            <Route path="exit/interviews/:id" element={<ExitInterviewList />} />
            <Route path="exit/settlements" element={<FinalSettlements />} />
            <Route path="exit/certificates" element={<WorkCertificates />} />

            {/* Payroll Module Routes */}
            <Route path="payroll" element={<PayrollDashboard />} />
            <Route path="payroll/dashboard" element={<PayrollDashboard />} />
            <Route path="payroll/periods" element={<PayrollPeriods />} />
            <Route path="payroll/periods/new" element={<PayrollPeriods />} />
            <Route path="payroll/periods/:id" element={<PayrollPeriods />} />
            <Route path="payroll/entries" element={<PayrollEntries />} />
            <Route path="payroll/structures" element={<SalaryStructures />} />
            <Route path="payroll/advances" element={<Advances />} />
            <Route path="payroll/loans" element={<Loans />} />
            <Route path="payroll/overtime" element={<OvertimeRecords />} />
            <Route path="payroll/payslips" element={<Payslips />} />

            {/* Performance Appraisal Module Routes */}
            <Route path="hr/performance" element={<PerformanceDashboard />} />
            <Route path="hr/performance/dashboard" element={<PerformanceDashboard />} />
            <Route path="hr/performance/cycles" element={<AppraisalCycles />} />
            <Route path="hr/performance/templates" element={<AppraisalTemplates />} />
            <Route path="hr/performance/appraisals" element={<EmployeeAppraisals />} />
            <Route path="hr/performance/appraisal/:id" element={<AppraisalForm />} />
            <Route path="hr/performance/probation" element={<ProbationTracking />} />
            <Route path="hr/performance/pips" element={<PIPs />} />
          </Route>
        </Routes>
        </BrowserRouter>
      </RecruitmentProvider>
    </ThemeProvider>
  );
}

export default App;
