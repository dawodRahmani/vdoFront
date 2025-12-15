import { useState, useEffect } from 'react';
import {
  PiggyBank,
  Plus,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  User,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import payrollService from '../../services/db/payrollService';

const Advances = () => {
  const [advances, setAdvances] = useState([]);
  const [filteredAdvances, setFilteredAdvances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAdvance, setSelectedAdvance] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    department: '',
    requestedAmount: 0,
    reason: '',
    repaymentMethod: 'single',
    installments: 1
  });

  useEffect(() => {
    loadAdvances();
  }, []);

  useEffect(() => {
    filterAdvances();
  }, [advances, searchTerm, statusFilter]);

  const loadAdvances = async () => {
    try {
      setLoading(true);
      const data = await payrollService.salaryAdvances.getAll();
      const sorted = data.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
      setAdvances(sorted);
    } catch (error) {
      console.error('Error loading advances:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAdvances = () => {
    let filtered = [...advances];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.employeeName?.toLowerCase().includes(search) ||
        a.employeeId?.toLowerCase().includes(search)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }

    setFilteredAdvances(filtered);
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

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      disbursed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      repaying: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
    };
    return colors[status] || colors.pending;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      disbursed: 'Disbursed',
      repaying: 'Repaying',
      completed: 'Completed'
    };
    return labels[status] || status;
  };

  const handleAdd = () => {
    setFormData({
      employeeId: '',
      employeeName: '',
      department: '',
      requestedAmount: 0,
      reason: '',
      repaymentMethod: 'single',
      installments: 1
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      const advance = {
        ...formData,
        requestDate: new Date().toISOString(),
        status: 'pending',
        approvedAmount: 0,
        remainingAmount: 0,
        paidAmount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await payrollService.salaryAdvances.create(advance);
      await loadAdvances();
      setShowModal(false);
    } catch (error) {
      console.error('Error creating advance:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleApprove = async (advance, approved = true) => {
    try {
      setActionLoading(true);
      if (approved) {
        await payrollService.approveAdvance(advance.id, advance.requestedAmount, 'admin');
      } else {
        await payrollService.salaryAdvances.update(advance.id, {
          ...advance,
          status: 'rejected',
          rejectedBy: 'admin',
          rejectedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      await loadAdvances();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error processing advance:', error);
      alert('Error: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisburse = async (advance) => {
    try {
      setActionLoading(true);
      await payrollService.disburseAdvance(advance.id, 'admin');
      await loadAdvances();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error disbursing advance:', error);
      alert('Error: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetail = (advance) => {
    setSelectedAdvance(advance);
    setShowDetailModal(true);
  };

  const summaryStats = {
    total: advances.length,
    pending: advances.filter(a => a.status === 'pending').length,
    approved: advances.filter(a => a.status === 'approved').length,
    disbursed: advances.filter(a => ['disbursed', 'repaying'].includes(a.status)).length,
    totalAmount: advances.filter(a => ['disbursed', 'repaying', 'approved'].includes(a.status))
                        .reduce((sum, a) => sum + (a.approvedAmount || 0), 0)
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Salary Advances</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage employee salary advance requests</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Request
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <PiggyBank className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{summaryStats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-xl font-bold text-yellow-600">{summaryStats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
              <p className="text-xl font-bold text-green-600">{summaryStats.approved}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Disbursed</p>
              <p className="text-xl font-bold text-purple-600">{summaryStats.disbursed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <DollarSign className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
              <p className="text-lg font-bold text-indigo-600">{formatCurrency(summaryStats.totalAmount)}</p>
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
                placeholder="Search by employee name or ID..."
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
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="disbursed">Disbursed</option>
            <option value="repaying">Repaying</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Advances Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400">
                <th className="px-6 py-3 font-medium">Employee</th>
                <th className="px-6 py-3 font-medium">Request Date</th>
                <th className="px-6 py-3 font-medium">Requested Amount</th>
                <th className="px-6 py-3 font-medium">Approved Amount</th>
                <th className="px-6 py-3 font-medium">Repayment</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {filteredAdvances.map((advance) => (
                <tr key={advance.id} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-full">
                        <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{advance.employeeName}</p>
                        <p className="text-sm text-gray-500">{advance.employeeId} • {advance.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{formatDate(advance.requestDate)}</td>
                  <td className="px-6 py-4">{formatCurrency(advance.requestedAmount)}</td>
                  <td className="px-6 py-4">
                    {advance.approvedAmount > 0 ? formatCurrency(advance.approvedAmount) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">
                      {advance.repaymentMethod === 'single' ? 'Single Payment' : `${advance.installments} Installments`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(advance.status)}`}>
                      {getStatusLabel(advance.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewDetail(advance)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredAdvances.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <PiggyBank className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No advance requests found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New Advance Request</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee Name</label>
                  <input
                    type="text"
                    value={formData.employeeName}
                    onChange={(e) => setFormData({...formData, employeeName: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requested Amount (AFN)</label>
                <input
                  type="number"
                  value={formData.requestedAmount}
                  onChange={(e) => setFormData({...formData, requestedAmount: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Repayment Method</label>
                  <select
                    value={formData.repaymentMethod}
                    onChange={(e) => setFormData({...formData, repaymentMethod: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="single">Single Payment</option>
                    <option value="installments">Installments</option>
                  </select>
                </div>
                {formData.repaymentMethod === 'installments' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Number of Installments</label>
                    <input
                      type="number"
                      min="2"
                      max="12"
                      value={formData.installments}
                      onChange={(e) => setFormData({...formData, installments: parseInt(e.target.value) || 2})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedAdvance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advance Details</h3>
                <p className="text-gray-500">{selectedAdvance.employeeName}</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Employee ID</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedAdvance.employeeId}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedAdvance.department}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Request Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedAdvance.requestDate)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAdvance.status)}`}>
                    {getStatusLabel(selectedAdvance.status)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">Requested Amount</p>
                  <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">{formatCurrency(selectedAdvance.requestedAmount)}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                  <p className="text-sm text-green-600 dark:text-green-400">Approved Amount</p>
                  <p className="text-xl font-bold text-green-700 dark:text-green-300">{formatCurrency(selectedAdvance.approvedAmount)}</p>
                </div>
              </div>

              {selectedAdvance.reason && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Reason</p>
                  <p className="text-gray-900 dark:text-white">{selectedAdvance.reason}</p>
                </div>
              )}

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">Repayment</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedAdvance.repaymentMethod === 'single' ? 'Single Payment' : `${selectedAdvance.installments} Monthly Installments`}
                </p>
              </div>

              {['disbursed', 'repaying'].includes(selectedAdvance.status) && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-purple-600 dark:text-purple-400">Repayment Progress</span>
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      {formatCurrency(selectedAdvance.paidAmount || 0)} / {formatCurrency(selectedAdvance.approvedAmount)}
                    </span>
                  </div>
                  <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${((selectedAdvance.paidAmount || 0) / selectedAdvance.approvedAmount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border rounded-lg dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>

              {selectedAdvance.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleApprove(selectedAdvance, false)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {actionLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Reject'}
                  </button>
                  <button
                    onClick={() => handleApprove(selectedAdvance, true)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {actionLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Approve'}
                  </button>
                </>
              )}

              {selectedAdvance.status === 'approved' && (
                <button
                  onClick={() => handleDisburse(selectedAdvance)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Disburse'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Advances;
