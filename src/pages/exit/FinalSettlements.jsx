import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Plus,
  Search,
  Calculator,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Eye,
  FileText,
  User,
  CreditCard,
  Building,
} from 'lucide-react';
import { settlementService, separationService, initializeExitModule } from '../../services/db/exitService';

const FinalSettlements = () => {
  const navigate = useNavigate();
  const [settlements, setSettlements] = useState([]);
  const [separations, setSeparations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState(null);
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [selectedSeparation, setSelectedSeparation] = useState(null);
  const [calculationForm, setCalculationForm] = useState({
    salaryDaysWorked: 0,
    salaryAmount: 0,
    leaveDaysEncashable: 0,
    leaveEncashmentAmount: 0,
    pendingAllowances: 0,
    pendingReimbursements: 0,
    gratuityAmount: 0,
    severanceAmount: 0,
    otherEarnings: 0,
    outstandingAdvances: 0,
    trainingBondRecovery: 0,
    assetDamageCharges: 0,
    otherDeductions: 0,
    taxDeduction: 0,
  });

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      await initializeExitModule();

      const [settlementData, sepData, statsData] = await Promise.all([
        settlementService.getAll({ status: statusFilter }),
        separationService.getAll(),
        settlementService.getStatistics(),
      ]);

      setSettlements(settlementData);
      setSeparations(sepData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading settlements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeparationInfo = (separationId) => {
    return separations.find(s => s.id === separationId);
  };

  const handleCreateSettlement = async () => {
    if (!selectedSeparation) return;

    try {
      const settlement = await settlementService.create({
        separationId: selectedSeparation.id,
        employeeId: selectedSeparation.employeeId,
        employeeName: selectedSeparation.employeeName,
        currency: 'AFN',
      });

      // Calculate settlement
      const earnings = {
        salaryDaysWorked: calculationForm.salaryDaysWorked,
        salaryAmount: calculationForm.salaryAmount,
        leaveDaysEncashable: calculationForm.leaveDaysEncashable,
        leaveEncashmentAmount: calculationForm.leaveEncashmentAmount,
        pendingAllowances: calculationForm.pendingAllowances,
        pendingReimbursements: calculationForm.pendingReimbursements,
        gratuityAmount: calculationForm.gratuityAmount,
        severanceAmount: calculationForm.severanceAmount,
        otherEarnings: calculationForm.otherEarnings,
      };

      const deductions = {
        outstandingAdvances: calculationForm.outstandingAdvances,
        trainingBondRecovery: calculationForm.trainingBondRecovery,
        assetDamageCharges: calculationForm.assetDamageCharges,
        otherDeductions: calculationForm.otherDeductions,
        taxDeduction: calculationForm.taxDeduction,
      };

      await settlementService.calculate(settlement.id, earnings, deductions);

      setShowCalculateModal(false);
      setSelectedSeparation(null);
      setCalculationForm({
        salaryDaysWorked: 0,
        salaryAmount: 0,
        leaveDaysEncashable: 0,
        leaveEncashmentAmount: 0,
        pendingAllowances: 0,
        pendingReimbursements: 0,
        gratuityAmount: 0,
        severanceAmount: 0,
        otherEarnings: 0,
        outstandingAdvances: 0,
        trainingBondRecovery: 0,
        assetDamageCharges: 0,
        otherDeductions: 0,
        taxDeduction: 0,
      });
      loadData();
    } catch (error) {
      console.error('Error creating settlement:', error);
    }
  };

  const handleVerifyHR = async (id) => {
    try {
      await settlementService.hrVerify(id, 'current_user');
      loadData();
    } catch (error) {
      console.error('Error verifying settlement:', error);
    }
  };

  const handleVerifyFinance = async (id) => {
    try {
      await settlementService.financeVerify(id, 'current_user');
      loadData();
    } catch (error) {
      console.error('Error verifying settlement:', error);
    }
  };

  const handleApprove = async (id) => {
    try {
      await settlementService.approve(id, 'current_user');
      loadData();
    } catch (error) {
      console.error('Error approving settlement:', error);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await settlementService.markPaid(id, {
        paymentMethod: 'bank_transfer',
        amountPaid: settlements.find(s => s.id === id)?.netPayable || 0,
      });
      loadData();
    } catch (error) {
      console.error('Error marking as paid:', error);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      draft: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', label: 'Draft' },
      pending_hr: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Pending HR' },
      pending_finance: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Pending Finance' },
      pending_approval: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', label: 'Pending Approval' },
      approved: { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', label: 'Approved' },
      paid: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Paid' },
    };
    const statusConfig = config[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusConfig.color}`}>
        {statusConfig.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const eligibleSeparations = separations.filter(s =>
    ['clearance_pending', 'exit_interview', 'settlement_pending'].includes(s.status) &&
    !settlements.find(set => set.separationId === s.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-7 h-7" />
            Final Settlements
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Calculate and process employee final settlements
          </p>
        </div>
        <button
          onClick={() => setShowCalculateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Calculator className="w-4 h-4" />
          Calculate Settlement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Settlements</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total || 0}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">
                {(stats?.pendingHR || 0) + (stats?.pendingFinance || 0) + (stats?.pendingApproval || 0)}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Paid</p>
              <p className="text-2xl font-bold text-green-600">{stats?.paid || 0}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Paid Amount</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats?.totalAmountPaid || 0)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending_hr">Pending HR</option>
            <option value="pending_finance">Pending Finance</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
          </select>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Settlements Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-green-500" />
        </div>
      ) : settlements.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
          <DollarSign className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No settlements found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Create a settlement calculation for exiting employees
          </p>
          <button
            onClick={() => setShowCalculateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Calculator className="w-4 h-4" />
            Calculate Settlement
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Settlement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Earnings
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Deductions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Net Payable
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
                {settlements.map(settlement => {
                  const separation = getSeparationInfo(settlement.separationId);
                  return (
                    <tr key={settlement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {settlement.settlementNumber}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(settlement.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {settlement.employeeName || separation?.employeeName || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          +{formatCurrency(settlement.totalEarnings)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">
                          -{formatCurrency(settlement.totalDeductions)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {formatCurrency(settlement.netPayable)} {settlement.currency || 'AFN'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(settlement.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {settlement.status === 'pending_hr' && (
                            <button
                              onClick={() => handleVerifyHR(settlement.id)}
                              className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded text-xs hover:bg-yellow-200"
                            >
                              HR Verify
                            </button>
                          )}
                          {settlement.status === 'pending_finance' && (
                            <button
                              onClick={() => handleVerifyFinance(settlement.id)}
                              className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs hover:bg-blue-200"
                            >
                              Finance Verify
                            </button>
                          )}
                          {settlement.status === 'pending_approval' && (
                            <button
                              onClick={() => handleApprove(settlement.id)}
                              className="px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 rounded text-xs hover:bg-orange-200"
                            >
                              Approve
                            </button>
                          )}
                          {settlement.status === 'approved' && (
                            <button
                              onClick={() => handleMarkPaid(settlement.id)}
                              className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded text-xs hover:bg-green-200"
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Calculate Settlement Modal */}
      {showCalculateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Calculator className="w-6 h-6" />
                Calculate Final Settlement
              </h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Select Separation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Employee Separation
                </label>
                <select
                  value={selectedSeparation?.id || ''}
                  onChange={(e) => {
                    const sep = separations.find(s => s.id === Number(e.target.value));
                    setSelectedSeparation(sep);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select Separation</option>
                  {eligibleSeparations.map(sep => (
                    <option key={sep.id} value={sep.id}>
                      {sep.separationNumber} - {sep.employeeName}
                    </option>
                  ))}
                </select>
              </div>

              {selectedSeparation && (
                <>
                  {/* Earnings */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="text-green-500">+</span> Earnings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Days Worked</label>
                        <input
                          type="number"
                          value={calculationForm.salaryDaysWorked}
                          onChange={(e) => setCalculationForm(prev => ({ ...prev, salaryDaysWorked: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Salary Amount</label>
                        <input
                          type="number"
                          value={calculationForm.salaryAmount}
                          onChange={(e) => setCalculationForm(prev => ({ ...prev, salaryAmount: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Leave Days to Encash</label>
                        <input
                          type="number"
                          value={calculationForm.leaveDaysEncashable}
                          onChange={(e) => setCalculationForm(prev => ({ ...prev, leaveDaysEncashable: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Leave Encashment Amount</label>
                        <input
                          type="number"
                          value={calculationForm.leaveEncashmentAmount}
                          onChange={(e) => setCalculationForm(prev => ({ ...prev, leaveEncashmentAmount: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Pending Allowances</label>
                        <input
                          type="number"
                          value={calculationForm.pendingAllowances}
                          onChange={(e) => setCalculationForm(prev => ({ ...prev, pendingAllowances: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Gratuity Amount</label>
                        <input
                          type="number"
                          value={calculationForm.gratuityAmount}
                          onChange={(e) => setCalculationForm(prev => ({ ...prev, gratuityAmount: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="text-red-500">-</span> Deductions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Outstanding Advances</label>
                        <input
                          type="number"
                          value={calculationForm.outstandingAdvances}
                          onChange={(e) => setCalculationForm(prev => ({ ...prev, outstandingAdvances: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Training Bond Recovery</label>
                        <input
                          type="number"
                          value={calculationForm.trainingBondRecovery}
                          onChange={(e) => setCalculationForm(prev => ({ ...prev, trainingBondRecovery: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Asset Damage Charges</label>
                        <input
                          type="number"
                          value={calculationForm.assetDamageCharges}
                          onChange={(e) => setCalculationForm(prev => ({ ...prev, assetDamageCharges: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Tax Deduction</label>
                        <input
                          type="number"
                          value={calculationForm.taxDeduction}
                          onChange={(e) => setCalculationForm(prev => ({ ...prev, taxDeduction: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Total Earnings</span>
                      <span className="text-green-600 font-medium">
                        +{formatCurrency(
                          calculationForm.salaryAmount +
                          calculationForm.leaveEncashmentAmount +
                          calculationForm.pendingAllowances +
                          calculationForm.pendingReimbursements +
                          calculationForm.gratuityAmount +
                          calculationForm.severanceAmount +
                          calculationForm.otherEarnings
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Total Deductions</span>
                      <span className="text-red-600 font-medium">
                        -{formatCurrency(
                          calculationForm.outstandingAdvances +
                          calculationForm.trainingBondRecovery +
                          calculationForm.assetDamageCharges +
                          calculationForm.otherDeductions +
                          calculationForm.taxDeduction
                        )}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">Net Payable</span>
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(
                          (calculationForm.salaryAmount +
                          calculationForm.leaveEncashmentAmount +
                          calculationForm.pendingAllowances +
                          calculationForm.pendingReimbursements +
                          calculationForm.gratuityAmount +
                          calculationForm.severanceAmount +
                          calculationForm.otherEarnings) -
                          (calculationForm.outstandingAdvances +
                          calculationForm.trainingBondRecovery +
                          calculationForm.assetDamageCharges +
                          calculationForm.otherDeductions +
                          calculationForm.taxDeduction)
                        )} AFN
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowCalculateModal(false);
                  setSelectedSeparation(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSettlement}
                disabled={!selectedSeparation}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Create Settlement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalSettlements;
