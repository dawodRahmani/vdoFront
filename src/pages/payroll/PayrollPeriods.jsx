import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Eye,
  Play,
  Send,
  CheckCircle,
  Lock,
  Clock,
  DollarSign,
  Users,
  ArrowRight,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  FileText
} from 'lucide-react';
import payrollService from '../../services/db/payrollService';

const PayrollPeriods = () => {
  const navigate = useNavigate();
  const [periods, setPeriods] = useState([]);
  const [filteredPeriods, setFilteredPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadPeriods();
  }, []);

  useEffect(() => {
    filterPeriods();
  }, [periods, searchTerm, statusFilter, yearFilter]);

  const loadPeriods = async () => {
    try {
      setLoading(true);
      const data = await payrollService.payrollPeriods.getAll();
      const sortedData = data.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      setPeriods(sortedData);
    } catch (error) {
      console.error('Error loading periods:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPeriods = () => {
    let filtered = [...periods];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.month.toLowerCase().includes(search)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    if (yearFilter !== 'all') {
      filtered = filtered.filter(p => p.year.toString() === yearFilter);
    }

    setFilteredPeriods(filtered);
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

  const getNextAction = (status) => {
    const actions = {
      draft: { label: 'Initiate', action: 'initiate', icon: Play, color: 'bg-blue-600 hover:bg-blue-700' },
      collecting: { label: 'Process', action: 'process', icon: RefreshCw, color: 'bg-yellow-600 hover:bg-yellow-700' },
      processing: { label: 'Submit to HR', action: 'hrSubmit', icon: Send, color: 'bg-purple-600 hover:bg-purple-700' },
      hr_review: { label: 'Submit to Finance', action: 'financeSubmit', icon: Send, color: 'bg-indigo-600 hover:bg-indigo-700' },
      finance_review: { label: 'Request Approval', action: 'requestApproval', icon: FileText, color: 'bg-orange-600 hover:bg-orange-700' },
      pending_approval: { label: 'Approve', action: 'approve', icon: CheckCircle, color: 'bg-green-600 hover:bg-green-700' },
      approved: { label: 'Start Disbursement', action: 'disburse', icon: DollarSign, color: 'bg-cyan-600 hover:bg-cyan-700' },
      disbursing: { label: 'Complete', action: 'complete', icon: CheckCircle, color: 'bg-emerald-600 hover:bg-emerald-700' },
      completed: { label: 'Lock', action: 'lock', icon: Lock, color: 'bg-slate-600 hover:bg-slate-700' },
      locked: null
    };
    return actions[status];
  };

  const handleAction = async (period) => {
    setSelectedPeriod(period);
    setShowActionModal(true);
  };

  const executeAction = async () => {
    if (!selectedPeriod) return;

    const action = getNextAction(selectedPeriod.status);
    if (!action) return;

    try {
      setActionLoading(true);
      let updated;

      switch (action.action) {
        case 'initiate':
          updated = await payrollService.initiatePayroll(selectedPeriod.id);
          break;
        case 'process':
          updated = { ...selectedPeriod, status: 'processing', updatedAt: new Date().toISOString() };
          await payrollService.payrollPeriods.update(selectedPeriod.id, updated);
          break;
        case 'hrSubmit':
          updated = await payrollService.hrSubmitPayroll(selectedPeriod.id);
          break;
        case 'financeSubmit':
          updated = { ...selectedPeriod, status: 'finance_review', updatedAt: new Date().toISOString() };
          await payrollService.payrollPeriods.update(selectedPeriod.id, updated);
          break;
        case 'requestApproval':
          updated = { ...selectedPeriod, status: 'pending_approval', updatedAt: new Date().toISOString() };
          await payrollService.payrollPeriods.update(selectedPeriod.id, updated);
          break;
        case 'approve':
          updated = await payrollService.approvePayroll(selectedPeriod.id, 'admin');
          break;
        case 'disburse':
          updated = { ...selectedPeriod, status: 'disbursing', updatedAt: new Date().toISOString() };
          await payrollService.payrollPeriods.update(selectedPeriod.id, updated);
          break;
        case 'complete':
          updated = await payrollService.completePayroll(selectedPeriod.id);
          break;
        case 'lock':
          updated = await payrollService.lockPayroll(selectedPeriod.id);
          break;
        default:
          break;
      }

      await loadPeriods();
      setShowActionModal(false);
      setSelectedPeriod(null);
    } catch (error) {
      console.error('Error executing action:', error);
      alert('Error: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AF', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0) + ' AFN';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUniqueYears = () => {
    const years = [...new Set(periods.map(p => p.year))];
    return years.sort((a, b) => b - a);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payroll Periods</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage monthly payroll processing cycles</p>
        </div>
        <Link
          to="/payroll/periods/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Period
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search periods..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="collecting">Collecting</option>
            <option value="processing">Processing</option>
            <option value="hr_review">HR Review</option>
            <option value="finance_review">Finance Review</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="disbursing">Disbursing</option>
            <option value="completed">Completed</option>
            <option value="locked">Locked</option>
          </select>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Years</option>
            {getUniqueYears().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Periods List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400">
                <th className="px-6 py-3 font-medium">Period</th>
                <th className="px-6 py-3 font-medium">Date Range</th>
                <th className="px-6 py-3 font-medium">Payment Date</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Employees</th>
                <th className="px-6 py-3 font-medium">Total Amount</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {filteredPeriods.map((period) => {
                const nextAction = getNextAction(period.status);
                return (
                  <tr key={period.id} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{period.name}</p>
                          <p className="text-sm text-gray-500">{period.month} {period.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p>{formatDate(period.startDate)}</p>
                      <p className="text-sm text-gray-500">to {formatDate(period.endDate)}</p>
                    </td>
                    <td className="px-6 py-4">{formatDate(period.paymentDate)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(period.status)}`}>
                        {getStatusLabel(period.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        {period.employeeCount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{formatCurrency(period.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/payroll/periods/${period.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {nextAction && (
                          <button
                            onClick={() => handleAction(period)}
                            className={`flex items-center gap-1 px-3 py-1 text-white rounded-lg text-sm ${nextAction.color}`}
                          >
                            <nextAction.icon className="h-4 w-4" />
                            {nextAction.label}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredPeriods.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No payroll periods found</p>
                    <Link
                      to="/payroll/periods/new"
                      className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:underline"
                    >
                      <Plus className="h-4 w-4" />
                      Create new period
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Legend */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Workflow Status Legend</h3>
        <div className="flex flex-wrap gap-2">
          {['draft', 'collecting', 'processing', 'hr_review', 'finance_review', 'pending_approval', 'approved', 'disbursing', 'completed', 'locked'].map(status => (
            <span key={status} className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
              {getStatusLabel(status)}
            </span>
          ))}
        </div>
      </div>

      {/* Action Confirmation Modal */}
      {showActionModal && selectedPeriod && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Action
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to <strong>{getNextAction(selectedPeriod.status)?.label.toLowerCase()}</strong> the payroll period <strong>{selectedPeriod.name}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setSelectedPeriod(null);
                }}
                className="px-4 py-2 border rounded-lg dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                className={`px-4 py-2 text-white rounded-lg ${getNextAction(selectedPeriod.status)?.color}`}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  getNextAction(selectedPeriod.status)?.label
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollPeriods;
