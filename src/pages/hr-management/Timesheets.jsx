import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  RefreshCw,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  FileText,
  User,
  Eye,
  Check,
  AlertCircle,
} from 'lucide-react';
import { timesheetService } from '../../services/db/leaveManagementService';
import { employeeDB, departmentDB, seedAllDefaults } from '../../services/db/indexedDB';

const Timesheets = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterStatus, setFilterStatus] = useState('');

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [generateEmployeeId, setGenerateEmployeeId] = useState('');

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  const statusConfig = {
    draft: { label: 'Draft', color: 'gray', icon: FileText },
    submitted: { label: 'Submitted', color: 'blue', icon: Send },
    manager_approved: { label: 'Manager Approved', color: 'yellow', icon: Check },
    hr_verified: { label: 'HR Verified', color: 'green', icon: CheckCircle },
    sent_to_payroll: { label: 'Sent to Payroll', color: 'purple', icon: CheckCircle },
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await seedAllDefaults();

      const [timesheetsData, employeesData, departmentsData] = await Promise.all([
        timesheetService.getAll(),
        employeeDB.getAll(),
        departmentDB.getAll(),
      ]);

      setTimesheets(timesheetsData);
      setEmployees(employeesData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const getEmployeeName = (id) => {
    const employee = employees.find(e => e.id === id);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
  };

  const getEmployeeDepartment = (id) => {
    const employee = employees.find(e => e.id === id);
    if (!employee) return 'Unknown';
    const dept = departments.find(d => d.id === employee.departmentId || d.id === employee.department);
    return dept?.name || 'Unknown';
  };

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!generateEmployeeId) {
      showToast('Please select an employee', 'error');
      return;
    }

    try {
      await timesheetService.generate(Number(generateEmployeeId), filterMonth, filterYear);
      showToast('Timesheet generated successfully');
      setShowGenerateModal(false);
      setGenerateEmployeeId('');
      loadData();
    } catch (error) {
      console.error('Error generating timesheet:', error);
      showToast(error.message || 'Failed to generate timesheet', 'error');
    }
  };

  const handleSubmit = async (id) => {
    try {
      await timesheetService.submit(id);
      showToast('Timesheet submitted successfully');
      loadData();
    } catch (error) {
      console.error('Error submitting timesheet:', error);
      showToast('Failed to submit timesheet', 'error');
    }
  };

  const handleManagerApprove = async (id) => {
    try {
      await timesheetService.managerApprove(id, 'Manager');
      showToast('Timesheet approved by manager');
      loadData();
    } catch (error) {
      console.error('Error approving timesheet:', error);
      showToast('Failed to approve timesheet', 'error');
    }
  };

  const handleHRVerify = async (id) => {
    try {
      await timesheetService.hrVerify(id, 'HR Admin');
      showToast('Timesheet verified by HR');
      loadData();
    } catch (error) {
      console.error('Error verifying timesheet:', error);
      showToast('Failed to verify timesheet', 'error');
    }
  };

  const handleSendToPayroll = async (id) => {
    try {
      await timesheetService.sendToPayroll(id);
      showToast('Timesheet sent to payroll');
      loadData();
    } catch (error) {
      console.error('Error sending to payroll:', error);
      showToast('Failed to send to payroll', 'error');
    }
  };

  const filteredTimesheets = timesheets.filter(ts => {
    const employeeName = getEmployeeName(ts.employeeId).toLowerCase();
    const matchesSearch = employeeName.includes(searchTerm.toLowerCase());
    const matchesMonth = ts.month === filterMonth;
    const matchesYear = ts.year === filterYear;
    const matchesStatus = !filterStatus || ts.status === filterStatus;
    return matchesSearch && matchesMonth && matchesYear && matchesStatus;
  });

  // Statistics
  const stats = {
    total: filteredTimesheets.length,
    draft: filteredTimesheets.filter(t => t.status === 'draft').length,
    submitted: filteredTimesheets.filter(t => t.status === 'submitted').length,
    verified: filteredTimesheets.filter(t => t.status === 'hr_verified' || t.status === 'sent_to_payroll').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Timesheets</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage employee monthly timesheets
          </p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Generate Timesheet
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Draft</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.draft}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.submitted}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Verified</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.verified}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Status</option>
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          {(searchTerm || filterStatus) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('');
              }}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Timesheets Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Working Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Present / Leave / Absent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTimesheets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No timesheets found for the selected period
                  </td>
                </tr>
              ) : (
                filteredTimesheets.map(ts => {
                  const status = statusConfig[ts.status] || statusConfig.draft;
                  const StatusIcon = status.icon;

                  return (
                    <tr key={ts.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                            <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {getEmployeeName(ts.employeeId)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {getEmployeeDepartment(ts.employeeId)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900 dark:text-white">
                            {months.find(m => m.value === ts.month)?.label} {ts.year}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900 dark:text-white">{ts.totalWorkingDays}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-green-600">{ts.totalPresentDays || 0}</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-blue-600">{ts.totalLeaveDays || 0}</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-red-600">{ts.totalAbsentDays || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-800 dark:bg-${status.color}-900/30 dark:text-${status.color}-400`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedTimesheet(ts);
                              setShowViewModal(true);
                            }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </button>
                          {ts.status === 'draft' && (
                            <button
                              onClick={() => handleSubmit(ts.id)}
                              className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Submit"
                            >
                              <Send className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                            </button>
                          )}
                          {ts.status === 'submitted' && (
                            <button
                              onClick={() => handleManagerApprove(ts.id)}
                              className="p-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                              title="Manager Approve"
                            >
                              <Check className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                            </button>
                          )}
                          {ts.status === 'manager_approved' && (
                            <button
                              onClick={() => handleHRVerify(ts.id)}
                              className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              title="HR Verify"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                            </button>
                          )}
                          {ts.status === 'hr_verified' && (
                            <button
                              onClick={() => handleSendToPayroll(ts.id)}
                              className="p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                              title="Send to Payroll"
                            >
                              <Send className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md m-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Generate Timesheet</h2>
            </div>
            <form onSubmit={handleGenerate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Employee *
                </label>
                <select
                  value={generateEmployeeId}
                  onChange={(e) => setGenerateEmployeeId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select Employee</option>
                  {employees.filter(e => e.status === 'active').map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Month
                  </label>
                  <select
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {months.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Year
                  </label>
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  This will generate a timesheet based on attendance records for the selected period.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowGenerateModal(false);
                    setGenerateEmployeeId('');
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                >
                  Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedTimesheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Timesheet Details</h2>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-${statusConfig[selectedTimesheet.status]?.color || 'gray'}-100 text-${statusConfig[selectedTimesheet.status]?.color || 'gray'}-800`}>
                  {statusConfig[selectedTimesheet.status]?.label || 'Unknown'}
                </span>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Employee</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {getEmployeeName(selectedTimesheet.employeeId)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Period</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {months.find(m => m.value === selectedTimesheet.month)?.label} {selectedTimesheet.year}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Working Days</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedTimesheet.totalWorkingDays || 0}</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400">Present</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{selectedTimesheet.totalPresentDays || 0}</p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-600 dark:text-blue-400">Leave</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{selectedTimesheet.totalLeaveDays || 0}</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">Absent</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">{selectedTimesheet.totalAbsentDays || 0}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Holidays</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedTimesheet.totalHolidays || 0}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Weekends</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedTimesheet.totalWeekends || 0}</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-purple-600 dark:text-purple-400">Overtime Hours</p>
                  <p className="text-xl font-bold text-purple-700 dark:text-purple-300">{selectedTimesheet.totalOvertimeHours || 0}</p>
                </div>
              </div>

              {selectedTimesheet.managerApprovedAt && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Manager Approved: {new Date(selectedTimesheet.managerApprovedAt).toLocaleString()}
                  </p>
                </div>
              )}

              {selectedTimesheet.hrVerifiedAt && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    HR Verified: {new Date(selectedTimesheet.hrVerifiedAt).toLocaleString()}
                  </p>
                </div>
              )}

              {selectedTimesheet.sentToPayrollAt && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Sent to Payroll: {new Date(selectedTimesheet.sentToPayrollAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedTimesheet(null);
                }}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timesheets;
