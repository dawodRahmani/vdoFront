import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Calendar,
  Users,
  Clock,
  CreditCard,
  Banknote,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  FileText,
  Calculator,
  Briefcase,
  PiggyBank,
  Receipt,
  Play,
  Send,
  Eye,
  Lock
} from 'lucide-react';
import payrollService from '../../services/db/payrollService';

const PayrollDashboard = () => {
  const [stats, setStats] = useState({
    currentPeriod: null,
    totalPayroll: 0,
    employeeCount: 0,
    pendingAdvances: 0,
    pendingLoans: 0,
    pendingOvertime: 0,
    bankTransfers: 0,
    cashPayments: 0,
    processedPayslips: 0,
    totalDeductions: 0,
    totalEarnings: 0
  });
  const [recentPeriods, setRecentPeriods] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get all payroll periods
      const periods = await payrollService.payrollPeriods.getAll();
      const sortedPeriods = periods.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      setRecentPeriods(sortedPeriods.slice(0, 5));

      // Find current/active period
      const currentPeriod = periods.find(p =>
        ['draft', 'collecting', 'processing', 'hr_review', 'finance_review', 'pending_approval', 'approved', 'disbursing'].includes(p.status)
      ) || sortedPeriods[0];

      // Get payroll entries
      const entries = await payrollService.payrollEntries.getAll();
      const currentEntries = currentPeriod ? entries.filter(e => e.payrollPeriodId === currentPeriod.id) : [];

      // Calculate totals
      const totalPayroll = currentEntries.reduce((sum, e) => sum + (e.netSalary || 0), 0);
      const totalEarnings = currentEntries.reduce((sum, e) => sum + (e.grossSalary || 0), 0);
      const totalDeductions = currentEntries.reduce((sum, e) => sum + (e.totalDeductions || 0), 0);

      // Get advances
      const advances = await payrollService.salaryAdvances.getAll();
      const pendingAdvances = advances.filter(a => a.status === 'pending').length;

      // Get loans
      const loans = await payrollService.employeeLoans.getAll();
      const pendingLoans = loans.filter(l => l.status === 'pending').length;

      // Get overtime
      const overtime = await payrollService.overtimeRecords.getAll();
      const pendingOvertime = overtime.filter(o => o.status === 'pending').length;

      // Get payslips
      const payslips = await payrollService.payslips.getAll();
      const processedPayslips = currentPeriod ? payslips.filter(p => p.payrollPeriodId === currentPeriod.id).length : 0;

      // Payment method breakdown
      const bankTransfers = currentEntries.filter(e => e.paymentMethod === 'bank').length;
      const cashPayments = currentEntries.filter(e => e.paymentMethod === 'cash').length;

      setStats({
        currentPeriod,
        totalPayroll,
        employeeCount: currentEntries.length,
        pendingAdvances,
        pendingLoans,
        pendingOvertime,
        bankTransfers,
        cashPayments,
        processedPayslips,
        totalDeductions,
        totalEarnings
      });

      // Build pending items list
      const items = [];
      if (pendingAdvances > 0) {
        items.push({ type: 'advances', count: pendingAdvances, label: 'Pending Advance Requests', link: '/payroll/advances' });
      }
      if (pendingLoans > 0) {
        items.push({ type: 'loans', count: pendingLoans, label: 'Pending Loan Requests', link: '/payroll/loans' });
      }
      if (pendingOvertime > 0) {
        items.push({ type: 'overtime', count: pendingOvertime, label: 'Pending Overtime Approvals', link: '/payroll/overtime' });
      }
      setPendingItems(items);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      collecting: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      processing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      hr_review: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      finance_review: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      pending_approval: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      disbursing: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
      locked: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
    };
    return colors[status] || colors.draft;
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: 'Draft',
      collecting: 'Collecting Data',
      processing: 'Processing',
      hr_review: 'HR Review',
      finance_review: 'Finance Review',
      pending_approval: 'Pending Approval',
      approved: 'Approved',
      disbursing: 'Disbursing',
      completed: 'Completed',
      locked: 'Locked'
    };
    return labels[status] || status;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AF', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' AFN';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payroll Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage employee compensation and payroll processing</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/payroll/periods/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Play className="h-4 w-4" />
            New Payroll Period
          </Link>
        </div>
      </div>

      {/* Current Period Status */}
      {stats.currentPeriod && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">Current Payroll Period</p>
              <h2 className="text-2xl font-bold mt-1">{stats.currentPeriod.name}</h2>
              <p className="text-blue-100 mt-1">
                {formatDate(stats.currentPeriod.startDate)} - {formatDate(stats.currentPeriod.endDate)}
              </p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(stats.currentPeriod.status)}`}>
                {getStatusLabel(stats.currentPeriod.status)}
              </span>
              <p className="text-blue-100 text-sm mt-2">Payment: {formatDate(stats.currentPeriod.paymentDate)}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-blue-100 text-xs">Total Payroll</p>
              <p className="text-xl font-bold">{formatCurrency(stats.totalPayroll)}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-blue-100 text-xs">Employees</p>
              <p className="text-xl font-bold">{stats.employeeCount}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-blue-100 text-xs">Total Earnings</p>
              <p className="text-xl font-bold">{formatCurrency(stats.totalEarnings)}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-blue-100 text-xs">Total Deductions</p>
              <p className="text-xl font-bold">{formatCurrency(stats.totalDeductions)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Advances</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.pendingAdvances}</p>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <PiggyBank className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <Link to="/payroll/advances" className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 mt-3 hover:underline">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Loans</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.pendingLoans}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <Link to="/payroll/loans" className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 mt-3 hover:underline">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Overtime</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.pendingOvertime}</p>
            </div>
            <div className="p-3 bg-cyan-100 dark:bg-cyan-900 rounded-lg">
              <Clock className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
          <Link to="/payroll/overtime" className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 mt-3 hover:underline">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Payslips Generated</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.processedPayslips}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <Receipt className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <Link to="/payroll/payslips" className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 mt-3 hover:underline">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Pending Actions
          </h3>
          {pendingItems.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400">No pending actions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.link}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 rounded-full font-bold text-sm">
                      {item.count}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Payment Method Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-500" />
            Payment Methods
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Bank Transfer</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stats.bankTransfers} employees</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600">{stats.employeeCount > 0 ? Math.round((stats.bankTransfers / stats.employeeCount) * 100) : 0}%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Banknote className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Cash Payment</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stats.cashPayments} employees</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">{stats.employeeCount > 0 ? Math.round((stats.cashPayments / stats.employeeCount) * 100) : 0}%</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/payroll/periods"
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <Calendar className="h-8 w-8 text-blue-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300 text-center">Payroll Periods</span>
            </Link>
            <Link
              to="/payroll/entries"
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <FileText className="h-8 w-8 text-green-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300 text-center">Payroll Entries</span>
            </Link>
            <Link
              to="/payroll/structures"
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <Calculator className="h-8 w-8 text-purple-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300 text-center">Salary Structures</span>
            </Link>
            <Link
              to="/payroll/payslips"
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <Receipt className="h-8 w-8 text-amber-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300 text-center">View Payslips</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Payroll Periods */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Recent Payroll Periods
          </h3>
          <Link to="/payroll/periods" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                <th className="pb-3 font-medium">Period</th>
                <th className="pb-3 font-medium">Date Range</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Total Amount</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {recentPeriods.map((period) => (
                <tr key={period.id} className="text-gray-700 dark:text-gray-300">
                  <td className="py-3 font-medium">{period.name}</td>
                  <td className="py-3">{formatDate(period.startDate)} - {formatDate(period.endDate)}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(period.status)}`}>
                      {getStatusLabel(period.status)}
                    </span>
                  </td>
                  <td className="py-3">{formatCurrency(period.totalAmount || 0)}</td>
                  <td className="py-3">
                    <Link
                      to={`/payroll/periods/${period.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" /> View
                    </Link>
                  </td>
                </tr>
              ))}
              {recentPeriods.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500 dark:text-gray-400">
                    No payroll periods found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayrollDashboard;
