import { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  User,
  RefreshCw,
  Percent,
  TrendingDown
} from 'lucide-react';
import payrollService from '../../services/db/payrollService';

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    department: '',
    loanType: 'personal',
    requestedAmount: 0,
    interestRate: 0,
    tenure: 12,
    purpose: '',
    guarantorName: '',
    guarantorEmployeeId: ''
  });

  useEffect(() => {
    loadLoans();
  }, []);

  useEffect(() => {
    filterLoans();
  }, [loans, searchTerm, statusFilter]);

  const loadLoans = async () => {
    try {
      setLoading(true);
      const data = await payrollService.employeeLoans.getAll();
      const sorted = data.sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate));
      setLoans(sorted);
    } catch (error) {
      console.error('Error loading loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLoans = () => {
    let filtered = [...loans];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(l =>
        l.employeeName?.toLowerCase().includes(search) ||
        l.employeeId?.toLowerCase().includes(search)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(l => l.status === statusFilter);
    }

    setFilteredLoans(filtered);
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
      active: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
      defaulted: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return colors[status] || colors.pending;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      disbursed: 'Disbursed',
      active: 'Active',
      completed: 'Completed',
      defaulted: 'Defaulted'
    };
    return labels[status] || status;
  };

  const getLoanTypeLabel = (type) => {
    const types = {
      personal: 'Personal Loan',
      emergency: 'Emergency Loan',
      education: 'Education Loan',
      housing: 'Housing Loan',
      medical: 'Medical Loan'
    };
    return types[type] || type;
  };

  const calculateEMI = (principal, rate, tenure) => {
    if (rate === 0) return principal / tenure;
    const monthlyRate = rate / 100 / 12;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
    return Math.round(emi);
  };

  const handleAdd = () => {
    setFormData({
      employeeId: '',
      employeeName: '',
      department: '',
      loanType: 'personal',
      requestedAmount: 0,
      interestRate: 0,
      tenure: 12,
      purpose: '',
      guarantorName: '',
      guarantorEmployeeId: ''
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      const emi = calculateEMI(formData.requestedAmount, formData.interestRate, formData.tenure);
      const totalPayable = emi * formData.tenure;
      const loan = {
        ...formData,
        applicationDate: new Date().toISOString(),
        status: 'pending',
        approvedAmount: 0,
        monthlyDeduction: 0,
        totalPayable: 0,
        paidAmount: 0,
        remainingAmount: 0,
        installmentsPaid: 0,
        estimatedEMI: emi,
        estimatedTotal: totalPayable,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await payrollService.employeeLoans.create(loan);
      await loadLoans();
      setShowModal(false);
    } catch (error) {
      console.error('Error creating loan:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleApprove = async (loan, approved = true) => {
    try {
      setActionLoading(true);
      if (approved) {
        await payrollService.approveLoan(loan.id, loan.requestedAmount, loan.tenure, 'admin');
      } else {
        await payrollService.employeeLoans.update(loan.id, {
          ...loan,
          status: 'rejected',
          rejectedBy: 'admin',
          rejectedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      await loadLoans();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error processing loan:', error);
      alert('Error: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisburse = async (loan) => {
    try {
      setActionLoading(true);
      await payrollService.disburseLoan(loan.id, 'admin');
      await loadLoans();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error disbursing loan:', error);
      alert('Error: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetail = (loan) => {
    setSelectedLoan(loan);
    setShowDetailModal(true);
  };

  const summaryStats = {
    total: loans.length,
    pending: loans.filter(l => l.status === 'pending').length,
    active: loans.filter(l => ['active', 'disbursed'].includes(l.status)).length,
    totalDisbursed: loans.filter(l => ['active', 'disbursed', 'completed'].includes(l.status))
                         .reduce((sum, l) => sum + (l.approvedAmount || 0), 0),
    totalOutstanding: loans.filter(l => ['active', 'disbursed'].includes(l.status))
                          .reduce((sum, l) => sum + (l.remainingAmount || 0), 0)
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Loans</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage employee loan applications and repayments</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Application
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Applications</p>
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
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <TrendingDown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Loans</p>
              <p className="text-xl font-bold text-purple-600">{summaryStats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Disbursed</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(summaryStats.totalDisbursed)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <DollarSign className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Outstanding</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(summaryStats.totalOutstanding)}</p>
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
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400">
                <th className="px-6 py-3 font-medium">Employee</th>
                <th className="px-6 py-3 font-medium">Loan Type</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Tenure</th>
                <th className="px-6 py-3 font-medium">EMI</th>
                <th className="px-6 py-3 font-medium">Progress</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {filteredLoans.map((loan) => (
                <tr key={loan.id} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-full">
                        <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{loan.employeeName}</p>
                        <p className="text-sm text-gray-500">{loan.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">{getLoanTypeLabel(loan.loanType)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{formatCurrency(loan.approvedAmount || loan.requestedAmount)}</p>
                      {loan.interestRate > 0 && (
                        <p className="text-xs text-gray-500">{loan.interestRate}% interest</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">{loan.tenure} months</td>
                  <td className="px-6 py-4">{formatCurrency(loan.monthlyDeduction || loan.estimatedEMI)}</td>
                  <td className="px-6 py-4">
                    {['active', 'disbursed'].includes(loan.status) ? (
                      <div className="w-24">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{loan.installmentsPaid || 0}/{loan.tenure}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${((loan.installmentsPaid || 0) / loan.tenure) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                      {getStatusLabel(loan.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewDetail(loan)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLoans.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No loan applications found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full mx-4 my-8">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New Loan Application</h3>
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

              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loan Type</label>
                  <select
                    value={formData.loanType}
                    onChange={(e) => setFormData({...formData, loanType: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="personal">Personal Loan</option>
                    <option value="emergency">Emergency Loan</option>
                    <option value="education">Education Loan</option>
                    <option value="housing">Housing Loan</option>
                    <option value="medical">Medical Loan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (AFN)</label>
                  <input
                    type="number"
                    value={formData.requestedAmount}
                    onChange={(e) => setFormData({...formData, requestedAmount: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({...formData, interestRate: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tenure (months)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formData.tenure}
                    onChange={(e) => setFormData({...formData, tenure: parseInt(e.target.value) || 12})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purpose</label>
                <textarea
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Guarantor Name</label>
                  <input
                    type="text"
                    value={formData.guarantorName}
                    onChange={(e) => setFormData({...formData, guarantorName: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Guarantor Employee ID</label>
                  <input
                    type="text"
                    value={formData.guarantorEmployeeId}
                    onChange={(e) => setFormData({...formData, guarantorEmployeeId: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              {/* EMI Preview */}
              {formData.requestedAmount > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Estimated Repayment</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Monthly EMI</p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(calculateEMI(formData.requestedAmount, formData.interestRate, formData.tenure))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Total Payable</p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(calculateEMI(formData.requestedAmount, formData.interestRate, formData.tenure) * formData.tenure)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
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
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedLoan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full mx-4 my-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Loan Details</h3>
                <p className="text-gray-500">{selectedLoan.employeeName}</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loan Type</p>
                  <p className="font-medium text-gray-900 dark:text-white">{getLoanTypeLabel(selectedLoan.loanType)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Application Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedLoan.applicationDate)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">Requested</p>
                  <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">{formatCurrency(selectedLoan.requestedAmount)}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                  <p className="text-sm text-green-600 dark:text-green-400">Approved</p>
                  <p className="text-xl font-bold text-green-700 dark:text-green-300">{formatCurrency(selectedLoan.approvedAmount)}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tenure</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedLoan.tenure} months</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Interest Rate</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedLoan.interestRate}%</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Monthly EMI</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedLoan.monthlyDeduction || selectedLoan.estimatedEMI)}</p>
                </div>
              </div>

              {selectedLoan.purpose && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Purpose</p>
                  <p className="text-gray-900 dark:text-white">{selectedLoan.purpose}</p>
                </div>
              )}

              {selectedLoan.guarantorName && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Guarantor</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedLoan.guarantorName} ({selectedLoan.guarantorEmployeeId})
                  </p>
                </div>
              )}

              {['active', 'disbursed'].includes(selectedLoan.status) && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-purple-600 dark:text-purple-400">Repayment Progress</span>
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      {selectedLoan.installmentsPaid || 0} / {selectedLoan.tenure} installments
                    </span>
                  </div>
                  <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-3 mb-2">
                    <div
                      className="bg-purple-600 h-3 rounded-full"
                      style={{ width: `${((selectedLoan.installmentsPaid || 0) / selectedLoan.tenure) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Paid: {formatCurrency(selectedLoan.paidAmount || 0)}</span>
                    <span className="text-gray-600 dark:text-gray-400">Remaining: {formatCurrency(selectedLoan.remainingAmount || 0)}</span>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedLoan.status)}`}>
                  {getStatusLabel(selectedLoan.status)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border rounded-lg dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>

              {selectedLoan.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleApprove(selectedLoan, false)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {actionLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Reject'}
                  </button>
                  <button
                    onClick={() => handleApprove(selectedLoan, true)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {actionLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Approve'}
                  </button>
                </>
              )}

              {selectedLoan.status === 'approved' && (
                <button
                  onClick={() => handleDisburse(selectedLoan)}
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

export default Loans;
