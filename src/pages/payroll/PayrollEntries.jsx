import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Calculator,
  DollarSign,
  Users,
  ChevronDown,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import payrollService from '../../services/db/payrollService';

const PayrollEntries = () => {
  const [searchParams] = useSearchParams();
  const periodIdParam = searchParams.get('periodId');

  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(periodIdParam || 'all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    payrollPeriodId: '',
    employeeId: '',
    employeeName: '',
    department: '',
    basicSalary: 0,
    allowances: 0,
    overtimePay: 0,
    otherEarnings: 0,
    taxDeduction: 0,
    advanceDeduction: 0,
    loanDeduction: 0,
    absenceDeduction: 0,
    otherDeductions: 0,
    paymentMethod: 'bank',
    bankName: '',
    accountNumber: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [entries, searchTerm, selectedPeriod, paymentMethodFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [entriesData, periodsData] = await Promise.all([
        payrollService.payrollEntries.getAll(),
        payrollService.payrollPeriods.getAll()
      ]);
      setEntries(entriesData);
      setPeriods(periodsData.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = [...entries];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(e =>
        e.employeeName?.toLowerCase().includes(search) ||
        e.employeeId?.toLowerCase().includes(search) ||
        e.department?.toLowerCase().includes(search)
      );
    }

    if (selectedPeriod !== 'all') {
      filtered = filtered.filter(e => e.payrollPeriodId === selectedPeriod);
    }

    if (paymentMethodFilter !== 'all') {
      filtered = filtered.filter(e => e.paymentMethod === paymentMethodFilter);
    }

    setFilteredEntries(filtered);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AF', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0) + ' AFN';
  };

  const calculateTotals = (entry) => {
    const grossSalary = (entry.basicSalary || 0) + (entry.allowances || 0) +
                        (entry.overtimePay || 0) + (entry.otherEarnings || 0);
    const totalDeductions = (entry.taxDeduction || 0) + (entry.advanceDeduction || 0) +
                           (entry.loanDeduction || 0) + (entry.absenceDeduction || 0) +
                           (entry.otherDeductions || 0);
    const netSalary = grossSalary - totalDeductions;
    return { grossSalary, totalDeductions, netSalary };
  };

  const handleViewDetail = (entry) => {
    setSelectedEntry(entry);
    setShowDetailModal(true);
  };

  const handleAddEntry = async () => {
    try {
      const totals = calculateTotals(newEntry);
      const entry = {
        ...newEntry,
        grossSalary: totals.grossSalary,
        totalDeductions: totals.totalDeductions,
        netSalary: totals.netSalary,
        status: 'calculated',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await payrollService.payrollEntries.create(entry);
      await loadData();
      setShowAddModal(false);
      setNewEntry({
        payrollPeriodId: '',
        employeeId: '',
        employeeName: '',
        department: '',
        basicSalary: 0,
        allowances: 0,
        overtimePay: 0,
        otherEarnings: 0,
        taxDeduction: 0,
        advanceDeduction: 0,
        loanDeduction: 0,
        absenceDeduction: 0,
        otherDeductions: 0,
        paymentMethod: 'bank',
        bankName: '',
        accountNumber: ''
      });
    } catch (error) {
      console.error('Error adding entry:', error);
      alert('Error adding entry: ' + error.message);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      await payrollService.payrollEntries.delete(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const getPeriodName = (periodId) => {
    const period = periods.find(p => p.id === periodId);
    return period ? period.name : 'Unknown';
  };

  const summaryStats = {
    totalEntries: filteredEntries.length,
    totalGross: filteredEntries.reduce((sum, e) => sum + (e.grossSalary || 0), 0),
    totalDeductions: filteredEntries.reduce((sum, e) => sum + (e.totalDeductions || 0), 0),
    totalNet: filteredEntries.reduce((sum, e) => sum + (e.netSalary || 0), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payroll Entries</h1>
          <p className="text-gray-600 dark:text-gray-400">View and manage employee payroll calculations</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Entry
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Entries</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{summaryStats.totalEntries}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Gross</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(summaryStats.totalGross)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <Calculator className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Deductions</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(summaryStats.totalDeductions)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Net Pay</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(summaryStats.totalNet)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by employee name, ID, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Periods</option>
            {periods.map(period => (
              <option key={period.id} value={period.id}>{period.name}</option>
            ))}
          </select>
          <select
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Payment Methods</option>
            <option value="bank">Bank Transfer</option>
            <option value="cash">Cash</option>
          </select>
        </div>
      </div>

      {/* Entries Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400">
                <th className="px-6 py-3 font-medium">Employee</th>
                <th className="px-6 py-3 font-medium">Period</th>
                <th className="px-6 py-3 font-medium">Basic Salary</th>
                <th className="px-6 py-3 font-medium">Gross Salary</th>
                <th className="px-6 py-3 font-medium">Deductions</th>
                <th className="px-6 py-3 font-medium">Net Pay</th>
                <th className="px-6 py-3 font-medium">Payment</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{entry.employeeName}</p>
                      <p className="text-sm text-gray-500">{entry.employeeId} • {entry.department}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{getPeriodName(entry.payrollPeriodId)}</td>
                  <td className="px-6 py-4">{formatCurrency(entry.basicSalary)}</td>
                  <td className="px-6 py-4 text-green-600 dark:text-green-400 font-medium">{formatCurrency(entry.grossSalary)}</td>
                  <td className="px-6 py-4 text-red-600 dark:text-red-400">{formatCurrency(entry.totalDeductions)}</td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{formatCurrency(entry.netSalary)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      entry.paymentMethod === 'bank'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    }`}>
                      {entry.paymentMethod === 'bank' ? 'Bank' : 'Cash'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetail(entry)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No payroll entries found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 my-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payroll Entry Details</h3>
                <p className="text-gray-600 dark:text-gray-400">{selectedEntry.employeeName} - {getPeriodName(selectedEntry.payrollPeriodId)}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Earnings */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-3">Earnings</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Basic Salary</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedEntry.basicSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Allowances</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedEntry.allowances)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Overtime Pay</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedEntry.overtimePay)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Other Earnings</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedEntry.otherEarnings)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-medium">
                    <span className="text-green-800 dark:text-green-300">Total Gross</span>
                    <span className="text-green-600">{formatCurrency(selectedEntry.grossSalary)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <h4 className="font-medium text-red-800 dark:text-red-300 mb-3">Deductions</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tax</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedEntry.taxDeduction)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Advance</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedEntry.advanceDeduction)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Loan</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedEntry.loanDeduction)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Absence</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedEntry.absenceDeduction)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Other</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedEntry.otherDeductions)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-medium">
                    <span className="text-red-800 dark:text-red-300">Total Deductions</span>
                    <span className="text-red-600">{formatCurrency(selectedEntry.totalDeductions)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Pay */}
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-blue-800 dark:text-blue-300">Net Pay</span>
                <span className="text-2xl font-bold text-blue-600">{formatCurrency(selectedEntry.netSalary)}</span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="mt-4 p-4 border rounded-lg dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Payment Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Method:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">{selectedEntry.paymentMethod === 'bank' ? 'Bank Transfer' : 'Cash'}</span>
                </div>
                {selectedEntry.paymentMethod === 'bank' && (
                  <>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Bank:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{selectedEntry.bankName || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Account:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{selectedEntry.accountNumber || 'N/A'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Payroll Entry</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payroll Period</label>
                  <select
                    value={newEntry.payrollPeriodId}
                    onChange={(e) => setNewEntry({...newEntry, payrollPeriodId: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select Period</option>
                    {periods.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={newEntry.employeeId}
                    onChange={(e) => setNewEntry({...newEntry, employeeId: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="EMP-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee Name</label>
                  <input
                    type="text"
                    value={newEntry.employeeName}
                    onChange={(e) => setNewEntry({...newEntry, employeeName: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={newEntry.department}
                    onChange={(e) => setNewEntry({...newEntry, department: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Department"
                  />
                </div>
              </div>

              {/* Earnings */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-3">Earnings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Basic Salary</label>
                    <input
                      type="number"
                      value={newEntry.basicSalary}
                      onChange={(e) => setNewEntry({...newEntry, basicSalary: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Allowances</label>
                    <input
                      type="number"
                      value={newEntry.allowances}
                      onChange={(e) => setNewEntry({...newEntry, allowances: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Overtime Pay</label>
                    <input
                      type="number"
                      value={newEntry.overtimePay}
                      onChange={(e) => setNewEntry({...newEntry, overtimePay: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Other Earnings</label>
                    <input
                      type="number"
                      value={newEntry.otherEarnings}
                      onChange={(e) => setNewEntry({...newEntry, otherEarnings: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <h4 className="font-medium text-red-800 dark:text-red-300 mb-3">Deductions</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Tax</label>
                    <input
                      type="number"
                      value={newEntry.taxDeduction}
                      onChange={(e) => setNewEntry({...newEntry, taxDeduction: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Advance</label>
                    <input
                      type="number"
                      value={newEntry.advanceDeduction}
                      onChange={(e) => setNewEntry({...newEntry, advanceDeduction: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Loan</label>
                    <input
                      type="number"
                      value={newEntry.loanDeduction}
                      onChange={(e) => setNewEntry({...newEntry, loanDeduction: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Absence</label>
                    <input
                      type="number"
                      value={newEntry.absenceDeduction}
                      onChange={(e) => setNewEntry({...newEntry, absenceDeduction: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                  <select
                    value={newEntry.paymentMethod}
                    onChange={(e) => setNewEntry({...newEntry, paymentMethod: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="bank">Bank Transfer</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
                {newEntry.paymentMethod === 'bank' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={newEntry.bankName}
                        onChange={(e) => setNewEntry({...newEntry, bankName: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Number</label>
                      <input
                        type="text"
                        value={newEntry.accountNumber}
                        onChange={(e) => setNewEntry({...newEntry, accountNumber: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Calculated Totals */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Gross Salary</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(calculateTotals(newEntry).grossSalary)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Deductions</p>
                    <p className="text-lg font-bold text-red-600">{formatCurrency(calculateTotals(newEntry).totalDeductions)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Net Pay</p>
                    <p className="text-lg font-bold text-blue-600">{formatCurrency(calculateTotals(newEntry).netSalary)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border rounded-lg dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEntry}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollEntries;
