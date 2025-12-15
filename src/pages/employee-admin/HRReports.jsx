import { useState, useEffect } from 'react';
import {
  FileText,
  Users,
  Cake,
  Award,
  FileWarning,
  Clock,
  TrendingUp,
  Download,
  Filter,
  Search,
  Calendar,
  Building2,
  Briefcase,
  Phone,
  Mail,
  ChevronRight,
  Printer,
  RefreshCw
} from 'lucide-react';
import employeeAdminService from '../../services/api/employeeAdminService';

const HRReports = () => {
  const [activeReport, setActiveReport] = useState('staff-list');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [filters, setFilters] = useState({
    department: '',
    office: '',
    status: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    days: 30
  });

  const reportTypes = [
    { id: 'staff-list', name: 'Staff List', icon: Users, description: 'Complete list of all employees' },
    { id: 'directory', name: 'Staff Directory', icon: Phone, description: 'Contact information directory' },
    { id: 'birthdays', name: 'Birthdays', icon: Cake, description: 'Upcoming employee birthdays' },
    { id: 'anniversaries', name: 'Work Anniversaries', icon: Award, description: 'Work anniversary dates' },
    { id: 'expiring-contracts', name: 'Expiring Contracts', icon: FileWarning, description: 'Contracts expiring soon' },
    { id: 'probation-ending', name: 'Probation Ending', icon: Clock, description: 'Employees ending probation' },
    { id: 'headcount-history', name: 'Headcount History', icon: TrendingUp, description: 'Historical headcount data' }
  ];

  // Simulated data
  const mockData = {
    'staff-list': [
      { id: 1, employee_id: 'EMP001', name: 'Ahmad Rahimi', department: 'Programs', position: 'Program Manager', office: 'Kabul', status: 'active', hire_date: '2022-03-15', employment_type: 'core' },
      { id: 2, employee_id: 'EMP002', name: 'Fatima Ahmadi', department: 'Finance', position: 'Finance Officer', office: 'Kabul', status: 'active', hire_date: '2021-06-01', employment_type: 'core' },
      { id: 3, employee_id: 'EMP003', name: 'Mohammad Karimi', department: 'Operations', position: 'Logistics Coordinator', office: 'Herat', status: 'active', hire_date: '2023-01-10', employment_type: 'project' },
      { id: 4, employee_id: 'EMP004', name: 'Zahra Noori', department: 'HR', position: 'HR Assistant', office: 'Kabul', status: 'probation', hire_date: '2024-10-01', employment_type: 'core' },
      { id: 5, employee_id: 'EMP005', name: 'Ali Mohammadi', department: 'IT', position: 'IT Specialist', office: 'Mazar', status: 'active', hire_date: '2022-08-20', employment_type: 'core' }
    ],
    'directory': [
      { id: 1, name: 'Ahmad Rahimi', department: 'Programs', position: 'Program Manager', office: 'Kabul', email: 'ahmad.rahimi@vdo.org', phone: '+93 700 123 456', extension: '101' },
      { id: 2, name: 'Fatima Ahmadi', department: 'Finance', position: 'Finance Officer', office: 'Kabul', email: 'fatima.ahmadi@vdo.org', phone: '+93 700 234 567', extension: '102' },
      { id: 3, name: 'Mohammad Karimi', department: 'Operations', position: 'Logistics Coordinator', office: 'Herat', email: 'mohammad.karimi@vdo.org', phone: '+93 700 345 678', extension: '201' },
      { id: 4, name: 'Zahra Noori', department: 'HR', position: 'HR Assistant', office: 'Kabul', email: 'zahra.noori@vdo.org', phone: '+93 700 456 789', extension: '103' },
      { id: 5, name: 'Ali Mohammadi', department: 'IT', position: 'IT Specialist', office: 'Mazar', email: 'ali.mohammadi@vdo.org', phone: '+93 700 567 890', extension: '301' }
    ],
    'birthdays': [
      { id: 1, name: 'Ahmad Rahimi', department: 'Programs', birth_date: '1990-12-15', upcoming_date: 'Dec 15', days_until: 7 },
      { id: 2, name: 'Fatima Ahmadi', department: 'Finance', birth_date: '1988-12-20', upcoming_date: 'Dec 20', days_until: 12 },
      { id: 3, name: 'Mohammad Karimi', department: 'Operations', birth_date: '1992-12-25', upcoming_date: 'Dec 25', days_until: 17 },
      { id: 4, name: 'Ali Mohammadi', department: 'IT', birth_date: '1995-01-05', upcoming_date: 'Jan 05', days_until: 28 }
    ],
    'anniversaries': [
      { id: 1, name: 'Fatima Ahmadi', department: 'Finance', hire_date: '2021-06-01', years: 3, anniversary_date: 'Jun 01' },
      { id: 2, name: 'Ahmad Rahimi', department: 'Programs', hire_date: '2022-03-15', years: 2, anniversary_date: 'Mar 15' },
      { id: 3, name: 'Ali Mohammadi', department: 'IT', hire_date: '2022-08-20', years: 2, anniversary_date: 'Aug 20' },
      { id: 4, name: 'Mohammad Karimi', department: 'Operations', hire_date: '2023-01-10', years: 1, anniversary_date: 'Jan 10' }
    ],
    'expiring-contracts': [
      { id: 1, name: 'Mohammad Karimi', department: 'Operations', position: 'Logistics Coordinator', contract_end: '2024-12-31', days_remaining: 23, contract_type: 'project' },
      { id: 2, name: 'Zahra Noori', department: 'HR', position: 'HR Assistant', contract_end: '2025-01-15', days_remaining: 38, contract_type: 'fixed_term' },
      { id: 3, name: 'Ali Mohammadi', department: 'IT', position: 'IT Specialist', contract_end: '2025-02-28', days_remaining: 82, contract_type: 'fixed_term' }
    ],
    'probation-ending': [
      { id: 1, name: 'Zahra Noori', department: 'HR', position: 'HR Assistant', hire_date: '2024-10-01', probation_end: '2025-01-01', days_remaining: 24, supervisor: 'HR Manager' },
      { id: 2, name: 'New Employee', department: 'Programs', position: 'Field Officer', hire_date: '2024-11-01', probation_end: '2025-02-01', days_remaining: 55, supervisor: 'Program Manager' }
    ],
    'headcount-history': [
      { month: 'Jan 2024', total: 145, core: 80, project: 45, consultant: 12, intern: 8, new_hires: 5, terminations: 2 },
      { month: 'Feb 2024', total: 148, core: 82, project: 46, consultant: 12, intern: 8, new_hires: 4, terminations: 1 },
      { month: 'Mar 2024', total: 150, core: 83, project: 47, consultant: 12, intern: 8, new_hires: 3, terminations: 1 },
      { month: 'Apr 2024', total: 152, core: 84, project: 48, consultant: 12, intern: 8, new_hires: 4, terminations: 2 },
      { month: 'May 2024', total: 155, core: 85, project: 50, consultant: 12, intern: 8, new_hires: 5, terminations: 2 },
      { month: 'Jun 2024', total: 158, core: 86, project: 52, consultant: 12, intern: 8, new_hires: 4, terminations: 1 },
      { month: 'Jul 2024', total: 160, core: 87, project: 53, consultant: 12, intern: 8, new_hires: 3, terminations: 1 },
      { month: 'Aug 2024', total: 163, core: 88, project: 55, consultant: 12, intern: 8, new_hires: 4, terminations: 1 },
      { month: 'Sep 2024', total: 165, core: 89, project: 56, consultant: 12, intern: 8, new_hires: 3, terminations: 1 },
      { month: 'Oct 2024', total: 168, core: 90, project: 58, consultant: 12, intern: 8, new_hires: 4, terminations: 1 },
      { month: 'Nov 2024', total: 170, core: 91, project: 59, consultant: 12, intern: 8, new_hires: 3, terminations: 1 },
      { month: 'Dec 2024', total: 172, core: 92, project: 60, consultant: 12, intern: 8, new_hires: 3, terminations: 1 }
    ]
  };

  useEffect(() => {
    loadReportData();
  }, [activeReport, filters]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      // In production, use actual API calls
      // const data = await employeeAdminService.getStaffList(filters);
      setTimeout(() => {
        setReportData(mockData[activeReport] || []);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading report:', error);
      setLoading(false);
    }
  };

  const handleExport = (format) => {
    // Export functionality
    console.log(`Exporting ${activeReport} as ${format}`);
    alert(`Exporting ${activeReport} report as ${format.toUpperCase()}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      probation: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      on_leave: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      suspended: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return styles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const renderStaffList = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Position</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Office</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hire Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {reportData.map((employee) => (
            <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{employee.employee_id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{employee.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{employee.department}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{employee.position}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{employee.office}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(employee.status)}`}>
                  {employee.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{employee.hire_date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{employee.employment_type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderDirectory = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Position</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Office</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ext</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {reportData.map((person) => (
            <tr key={person.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{person.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{person.department}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{person.position}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{person.office}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400">
                <a href={`mailto:${person.email}`} className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {person.email}
                </a>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {person.phone}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{person.extension}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderBirthdays = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {reportData.map((person) => (
        <div key={person.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 flex items-center gap-4">
          <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center">
            <Cake className="w-6 h-6 text-pink-600 dark:text-pink-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 dark:text-white">{person.name}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{person.department}</p>
            <p className="text-sm text-pink-600 dark:text-pink-400">{person.upcoming_date}</p>
          </div>
          <div className="text-right">
            <span className={`px-2 py-1 text-xs rounded-full ${person.days_until <= 7 ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
              {person.days_until} days
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAnniversaries = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {reportData.map((person) => (
        <div key={person.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
            <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 dark:text-white">{person.name}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{person.department}</p>
            <p className="text-sm text-purple-600 dark:text-purple-400">{person.anniversary_date}</p>
          </div>
          <div className="text-right">
            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 rounded-full">
              {person.years} years
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderExpiringContracts = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Position</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contract Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">End Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Days Remaining</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {reportData.map((contract) => (
            <tr key={contract.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{contract.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{contract.department}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{contract.position}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{contract.contract_type}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{contract.contract_end}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs rounded-full ${contract.days_remaining <= 30 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : contract.days_remaining <= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'}`}>
                  {contract.days_remaining} days
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderProbationEnding = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Position</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hire Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Probation End</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Days Remaining</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Supervisor</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {reportData.map((emp) => (
            <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{emp.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{emp.department}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{emp.position}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{emp.hire_date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{emp.probation_end}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs rounded-full ${emp.days_remaining <= 14 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'}`}>
                  {emp.days_remaining} days
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{emp.supervisor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderHeadcountHistory = () => (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-400">Current Total</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{reportData[reportData.length - 1]?.total || 0}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
          <p className="text-sm text-green-600 dark:text-green-400">Core Staff</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">{reportData[reportData.length - 1]?.core || 0}</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
          <p className="text-sm text-purple-600 dark:text-purple-400">Project Staff</p>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{reportData[reportData.length - 1]?.project || 0}</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg">
          <p className="text-sm text-orange-600 dark:text-orange-400">Consultants</p>
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{reportData[reportData.length - 1]?.consultant || 0}</p>
        </div>
      </div>

      {/* History Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Month</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Core</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Project</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Consultant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Intern</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">New Hires</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Terminations</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {reportData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{row.month}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-semibold">{row.total}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{row.core}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{row.project}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{row.consultant}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{row.intern}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-green-600 dark:text-green-400">+{row.new_hires}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-red-600 dark:text-red-400">-{row.terminations}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      );
    }

    switch (activeReport) {
      case 'staff-list':
        return renderStaffList();
      case 'directory':
        return renderDirectory();
      case 'birthdays':
        return renderBirthdays();
      case 'anniversaries':
        return renderAnniversaries();
      case 'expiring-contracts':
        return renderExpiringContracts();
      case 'probation-ending':
        return renderProbationEnding();
      case 'headcount-history':
        return renderHeadcountHistory();
      default:
        return <p className="text-gray-500">Select a report type</p>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">HR Reports</h1>
          <p className="text-gray-500 dark:text-gray-400">Generate and view HR analytics reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Report Type Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">Report Types</h2>
            </div>
            <nav className="p-2">
              {reportTypes.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setActiveReport(report.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                    activeReport === report.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <report.icon className="w-5 h-5" />
                  <div className="text-left flex-1">
                    <p className="font-medium text-sm">{report.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{report.description}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${activeReport === report.id ? 'text-blue-500' : 'text-gray-400'}`} />
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Report Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            {/* Report Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {reportTypes.find(r => r.id === activeReport)?.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {reportData.length} records found
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadReportData()}
                  className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <div className="relative group">
                  <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hidden group-hover:block z-10">
                    <button
                      onClick={() => handleExport('excel')}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Export as Excel
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Export as PDF
                    </button>
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Export as CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            {(activeReport === 'staff-list' || activeReport === 'directory') && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Filters:</span>
                  </div>
                  <select
                    value={filters.department}
                    onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">All Departments</option>
                    <option value="programs">Programs</option>
                    <option value="finance">Finance</option>
                    <option value="operations">Operations</option>
                    <option value="hr">HR</option>
                    <option value="it">IT</option>
                  </select>
                  <select
                    value={filters.office}
                    onChange={(e) => setFilters({ ...filters, office: e.target.value })}
                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">All Offices</option>
                    <option value="kabul">Kabul</option>
                    <option value="herat">Herat</option>
                    <option value="mazar">Mazar-i-Sharif</option>
                    <option value="kandahar">Kandahar</option>
                  </select>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="probation">Probation</option>
                    <option value="on_leave">On Leave</option>
                  </select>
                </div>
              </div>
            )}

            {/* Report Content */}
            <div className="p-4">
              {renderReportContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRReports;
