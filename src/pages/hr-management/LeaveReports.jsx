import { useState, useEffect } from 'react';
import {
  RefreshCw,
  BarChart2,
  PieChart,
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { leaveReportService } from '../../services/db/leaveManagementService';
import { employeeDB, departmentDB, leaveTypeDB, seedAllDefaults } from '../../services/db/indexedDB';

const LeaveReports = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [absenteeismReport, setAbsenteeismReport] = useState(null);

  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterDepartment, setFilterDepartment] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  useEffect(() => {
    loadData();
  }, [filterYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      await seedAllDefaults();

      const [summaryData, employeesData, departmentsData, leaveTypesData] = await Promise.all([
        leaveReportService.getLeaveSummary(filterYear),
        employeeDB.getAll(),
        departmentDB.getAll(),
        leaveTypeDB.getAll(),
      ]);

      // Get absenteeism report for last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const absenteeism = await leaveReportService.getAbsenteeismReport(
        startDate.toISOString(),
        endDate.toISOString()
      );

      setSummary(summaryData);
      setEmployees(employeesData);
      setDepartments(departmentsData);
      setLeaveTypes(leaveTypesData);
      setAbsenteeismReport(absenteeism);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Failed to load report data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const getLeaveTypeColor = (name) => {
    const type = leaveTypes.find(lt => lt.name === name);
    return type?.color || 'gray';
  };

  const exportToCSV = () => {
    if (!summary) return;

    const rows = [
      ['Leave Summary Report', filterYear],
      [],
      ['Status', 'Count'],
      ['Total Requests', summary.totalRequests],
      ['Pending', summary.byStatus.pending],
      ['Approved', summary.byStatus.approved],
      ['Rejected', summary.byStatus.rejected],
      ['Cancelled', summary.byStatus.cancelled],
      [],
      ['Leave Type', 'Requests', 'Total Days'],
      ...summary.byLeaveType.map(lt => [lt.leaveType, lt.count, lt.totalDays]),
    ];

    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leave_report_${filterYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Report exported successfully');
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Reports</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Analytics and insights for leave management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('byType')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'byType'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          By Leave Type
        </button>
        <button
          onClick={() => setActiveTab('absenteeism')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'absenteeism'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Absenteeism
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && summary && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalRequests}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Days Taken</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalDaysTaken}</p>
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
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.byStatus.pending}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">On Leave Now</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.employeesOnLeave}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary-500" />
                Request Status Distribution
              </h3>
              <div className="space-y-4">
                {[
                  { key: 'pending', label: 'Pending', color: 'yellow', icon: Clock },
                  { key: 'approved', label: 'Approved', color: 'green', icon: CheckCircle },
                  { key: 'rejected', label: 'Rejected', color: 'red', icon: XCircle },
                  { key: 'cancelled', label: 'Cancelled', color: 'gray', icon: XCircle },
                  { key: 'taken', label: 'Taken', color: 'blue', icon: CheckCircle },
                  { key: 'completed', label: 'Completed', color: 'purple', icon: CheckCircle },
                ].map(status => {
                  const count = summary.byStatus[status.key] || 0;
                  const percentage = summary.totalRequests > 0
                    ? ((count / summary.totalRequests) * 100).toFixed(1)
                    : 0;
                  const StatusIcon = status.icon;

                  return (
                    <div key={status.key} className="flex items-center gap-3">
                      <div className={`p-2 bg-${status.color}-100 dark:bg-${status.color}-900/30 rounded-lg`}>
                        <StatusIcon className={`w-4 h-4 text-${status.color}-600 dark:text-${status.color}-400`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{status.label}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`bg-${status.color}-500 h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">
                        {percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-primary-500" />
                Quick Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                  <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                    {summary.totalRequests > 0
                      ? ((summary.byStatus.approved / summary.totalRequests) * 100).toFixed(0)
                      : 0}%
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">Approval Rate</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                  <p className="text-3xl font-bold text-red-700 dark:text-red-300">
                    {summary.totalRequests > 0
                      ? ((summary.byStatus.rejected / summary.totalRequests) * 100).toFixed(0)
                      : 0}%
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400">Rejection Rate</p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                    {summary.totalRequests > 0
                      ? (summary.totalDaysTaken / summary.totalRequests).toFixed(1)
                      : 0}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Avg Days/Request</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                  <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                    {employees.filter(e => e.status === 'active').length}
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Active Employees</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* By Leave Type Tab */}
      {activeTab === 'byType' && summary && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Leave Type Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Leave Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Requests
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Total Days
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Avg Days/Request
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      % of Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {summary.byLeaveType.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No data available
                      </td>
                    </tr>
                  ) : (
                    summary.byLeaveType.map((lt, idx) => {
                      const color = getLeaveTypeColor(lt.leaveType);
                      const percentage = summary.totalRequests > 0
                        ? ((lt.count / summary.totalRequests) * 100).toFixed(1)
                        : 0;
                      const avgDays = lt.count > 0 ? (lt.totalDays / lt.count).toFixed(1) : 0;

                      return (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full bg-${color}-500`} />
                              <span className="font-medium text-gray-900 dark:text-white">{lt.leaveType}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-900 dark:text-white">{lt.count}</td>
                          <td className="px-6 py-4 text-gray-900 dark:text-white">{lt.totalDays}</td>
                          <td className="px-6 py-4 text-gray-900 dark:text-white">{avgDays}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 max-w-[100px] bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className={`bg-${color}-500 h-2 rounded-full`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">{percentage}%</span>
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

          {/* Visual Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summary.byLeaveType.map((lt, idx) => {
              const color = getLeaveTypeColor(lt.leaveType);
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className={`h-2 bg-${color}-500`} />
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">{lt.leaveType}</h4>
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{lt.count}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Requests</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{lt.totalDays}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Days</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Absenteeism Tab */}
      {activeTab === 'absenteeism' && absenteeismReport && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Absences (30 days)</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{absenteeismReport.totalAbsences}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Avg Absenteeism Rate</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{absenteeismReport.averageAbsenteeismRate}%</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Employees Tracked</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{absenteeismReport.employeeBreakdown?.length || 0}</p>
            </div>
          </div>

          {/* Employee Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Employee Absenteeism (Last 30 Days)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Present
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Leave
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Absent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {(!absenteeismReport.employeeBreakdown || absenteeismReport.employeeBreakdown.length === 0) ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No attendance data available for this period
                      </td>
                    </tr>
                  ) : (
                    absenteeismReport.employeeBreakdown.slice(0, 20).map((emp, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{emp.employeeName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{emp.department || 'No Department'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-green-600 dark:text-green-400">{emp.presentDays}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-blue-600 dark:text-blue-400">{emp.leaveDays}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-red-600 dark:text-red-400">{emp.absentDays}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 max-w-[80px] bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  emp.absenteeismRate > 10 ? 'bg-red-500' :
                                  emp.absenteeismRate > 5 ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(emp.absenteeismRate, 100)}%` }}
                              />
                            </div>
                            <span className={`text-sm font-medium ${
                              emp.absenteeismRate > 10 ? 'text-red-600 dark:text-red-400' :
                              emp.absenteeismRate > 5 ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-green-600 dark:text-green-400'
                            }`}>
                              {emp.absenteeismRate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveReports;
