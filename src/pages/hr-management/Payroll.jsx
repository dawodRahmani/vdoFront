import { useState, useEffect } from 'react';
import {
  DollarSign,
  Users,
  Calendar,
  Search,
  Plus,
  Eye,
  Check,
  FileText,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Banknote,
  Calculator,
} from 'lucide-react';
import {
  payrollDB,
  salaryComponentDB,
  employeeDB,
  seedAllDefaults,
} from '../../services/db/indexedDB';

const Payroll = () => {
  // State
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalEmployees: 0,
    totalGross: 0,
    totalDeductions: 0,
    totalNet: 0,
  });

  // Current period
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modals
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [calculatedSalary, setCalculatedSalary] = useState(null);

  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Month names
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Load data
  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      await seedAllDefaults();

      const [recordsData, employeesData, componentsData] = await Promise.all([
        payrollDB.getByMonthYear(selectedMonth, selectedYear),
        employeeDB.getAll({ status: 'active' }),
        salaryComponentDB.getAll(),
      ]);

      const stats = await payrollDB.getStatistics(selectedMonth, selectedYear);

      setPayrollRecords(recordsData);
      setEmployees(employeesData);
      setComponents(componentsData);
      setStatistics(stats);
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

  // Get employee name
  const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
  };

  // Filter records
  const filteredRecords = payrollRecords.filter(record => {
    if (filters.search) {
      const employeeName = getEmployeeName(record.employeeId).toLowerCase();
      if (!employeeName.includes(filters.search.toLowerCase()) &&
          !record.payrollId?.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
    }
    if (filters.status && record.status !== filters.status) {
      return false;
    }
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate salary for selected employee
  const handleEmployeeSelect = (employeeId) => {
    const employee = employees.find(e => e.id === Number(employeeId));
    setSelectedEmployee(employee);

    if (employee) {
      const salary = payrollDB.calculateSalary(employee, components);
      setCalculatedSalary(salary);
    } else {
      setCalculatedSalary(null);
    }
  };

  // Process payroll
  const handleProcessPayroll = async () => {
    if (!selectedEmployee || !calculatedSalary) {
      showToast('Please select an employee', 'error');
      return;
    }

    // Check if already processed
    const existing = payrollRecords.find(r => r.employeeId === selectedEmployee.id);
    if (existing) {
      showToast('Payroll already processed for this employee', 'error');
      return;
    }

    try {
      await payrollDB.create({
        employeeId: selectedEmployee.id,
        month: selectedMonth,
        year: selectedYear,
        ...calculatedSalary,
        status: 'processed',
      });

      showToast('Payroll processed successfully');
      setShowProcessModal(false);
      setSelectedEmployee(null);
      setCalculatedSalary(null);
      loadData();
    } catch (error) {
      console.error('Error processing payroll:', error);
      showToast(error.message || 'Failed to process payroll', 'error');
    }
  };

  // Approve payroll
  const handleApprove = async (record) => {
    try {
      await payrollDB.approve(record.id, 'HR Admin');
      showToast('Payroll approved');
      loadData();
    } catch (error) {
      console.error('Error approving payroll:', error);
      showToast('Failed to approve', 'error');
    }
  };

  // Mark as paid
  const handleMarkPaid = async (record) => {
    try {
      await payrollDB.markAsPaid(record.id);
      showToast('Marked as paid');
      loadData();
    } catch (error) {
      console.error('Error marking as paid:', error);
      showToast('Failed to mark as paid', 'error');
    }
  };

  // Process all employees
  const handleProcessAll = async () => {
    const unprocessedEmployees = employees.filter(emp =>
      !payrollRecords.find(r => r.employeeId === emp.id)
    );

    if (unprocessedEmployees.length === 0) {
      showToast('All employees already processed', 'error');
      return;
    }

    try {
      for (const employee of unprocessedEmployees) {
        const salary = payrollDB.calculateSalary(employee, components);
        await payrollDB.create({
          employeeId: employee.id,
          month: selectedMonth,
          year: selectedYear,
          ...salary,
          status: 'processed',
        });
      }

      showToast(`Processed payroll for ${unprocessedEmployees.length} employees`);
      loadData();
    } catch (error) {
      console.error('Error processing all:', error);
      showToast('Failed to process all', 'error');
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
      processed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      approved: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    };

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badges[status] || badges.draft}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AFN',
      minimumFractionDigits: 0,
    }).format(amount || 0);
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
      {/* Toast */}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payroll Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Process and manage employee salaries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleProcessAll}
            className="inline-flex items-center gap-2 px-4 py-2 border border-primary-500 text-primary-500 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            <Calculator className="w-5 h-5" />
            Process All
          </button>
          <button
            onClick={() => setShowProcessModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Process Individual
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {[2023, 2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Employees</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{statistics.totalEmployees}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Gross</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(statistics.totalGross)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Deductions</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(statistics.totalDeductions)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Banknote className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Net Payable</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(statistics.totalNet)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee or ID..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="processed">Processed</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Basic</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Gross</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Deductions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Net</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No payroll records for this period
                  </td>
                </tr>
              ) : (
                paginatedRecords.map(record => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900 dark:text-white">{record.payrollId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900 dark:text-white">{getEmployeeName(record.employeeId)}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {formatCurrency(record.basicSalary)}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {formatCurrency(record.grossSalary)}
                    </td>
                    <td className="px-6 py-4 text-red-600 dark:text-red-400">
                      -{formatCurrency(record.totalDeductions)}
                    </td>
                    <td className="px-6 py-4 font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(record.netSalary)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => {
                            setSelectedRecord(record);
                            setShowViewModal(true);
                          }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                        {record.status === 'processed' && (
                          <button
                            onClick={() => handleApprove(record)}
                            className="p-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <Check className="w-4 h-4 text-yellow-500" />
                          </button>
                        )}
                        {record.status === 'approved' && (
                          <button
                            onClick={() => handleMarkPaid(record)}
                            className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Mark as Paid"
                          >
                            <DollarSign className="w-4 h-4 text-green-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Process Modal */}
      {showProcessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Process Payroll</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {months[selectedMonth - 1]} {selectedYear}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Employee
                </label>
                <select
                  onChange={(e) => handleEmployeeSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Choose an employee...</option>
                  {employees
                    .filter(emp => !payrollRecords.find(r => r.employeeId === emp.id))
                    .map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} - {formatCurrency(emp.basicSalary)}
                      </option>
                    ))}
                </select>
              </div>

              {calculatedSalary && (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Salary Breakdown</h3>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Basic Salary</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(calculatedSalary.basicSalary)}
                        </span>
                      </div>

                      {calculatedSalary.allowances.length > 0 && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Allowances</p>
                          {calculatedSalary.allowances.map((a, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">{a.name}</span>
                              <span className="text-green-600 dark:text-green-400">+{formatCurrency(a.amount)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Gross Salary</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency(calculatedSalary.grossSalary)}
                        </span>
                      </div>

                      {calculatedSalary.deductions.length > 0 && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deductions</p>
                          {calculatedSalary.deductions.map((d, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">{d.name}</span>
                              <span className="text-red-600 dark:text-red-400">-{formatCurrency(d.amount)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-between pt-2 border-t-2 border-gray-300 dark:border-gray-500">
                        <span className="font-bold text-gray-900 dark:text-white">Net Salary</span>
                        <span className="font-bold text-lg text-green-600 dark:text-green-400">
                          {formatCurrency(calculatedSalary.netSalary)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowProcessModal(false);
                    setSelectedEmployee(null);
                    setCalculatedSalary(null);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessPayroll}
                  disabled={!calculatedSalary}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                >
                  Process Payroll
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payslip Details</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedRecord.payrollId}</p>
                </div>
                {getStatusBadge(selectedRecord.status)}
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Employee</p>
                  <p className="font-medium text-gray-900 dark:text-white">{getEmployeeName(selectedRecord.employeeId)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Period</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {months[selectedRecord.month - 1]} {selectedRecord.year}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Basic Salary</span>
                  <span className="font-medium">{formatCurrency(selectedRecord.basicSalary)}</span>
                </div>

                {selectedRecord.allowances?.map((a, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{a.name}</span>
                    <span className="text-green-600">+{formatCurrency(a.amount)}</span>
                  </div>
                ))}

                <div className="flex justify-between pt-2 border-t">
                  <span className="font-medium">Gross Salary</span>
                  <span className="font-bold">{formatCurrency(selectedRecord.grossSalary)}</span>
                </div>

                {selectedRecord.deductions?.map((d, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{d.name}</span>
                    <span className="text-red-600">-{formatCurrency(d.amount)}</span>
                  </div>
                ))}

                <div className="flex justify-between pt-2 border-t-2">
                  <span className="font-bold">Net Salary</span>
                  <span className="font-bold text-lg text-green-600">{formatCurrency(selectedRecord.netSalary)}</span>
                </div>
              </div>

              {selectedRecord.approvedBy && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Approved by {selectedRecord.approvedBy} on {new Date(selectedRecord.approvedAt).toLocaleDateString()}
                </div>
              )}

              {selectedRecord.paidAt && (
                <div className="text-sm text-green-600 dark:text-green-400">
                  Paid on {new Date(selectedRecord.paidAt).toLocaleDateString()}
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedRecord(null);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
