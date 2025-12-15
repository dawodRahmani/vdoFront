import { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  User,
  Calendar,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
  FileText,
  Filter,
} from 'lucide-react';
import { leaveBalanceService, leaveAdjustmentService } from '../../services/db/leaveManagementService';
import { leaveTypeDB, employeeDB, seedAllDefaults } from '../../services/db/indexedDB';

const LeaveBalances = () => {
  const [balances, setBalances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterLeaveType, setFilterLeaveType] = useState('');

  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showInitModal, setShowInitModal] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState(null);

  const [adjustmentData, setAdjustmentData] = useState({
    adjustmentType: 'credit',
    days: '',
    reason: '',
  });

  const [initEmployeeId, setInitEmployeeId] = useState('');

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await seedAllDefaults();

      const [balancesData, employeesData, leaveTypesData] = await Promise.all([
        leaveBalanceService.getAll(),
        employeeDB.getAll(),
        leaveTypeDB.getAll(),
      ]);

      setBalances(balancesData);
      setEmployees(employeesData);
      setLeaveTypes(leaveTypesData);
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

  const getLeaveTypeName = (id) => {
    const type = leaveTypes.find(lt => lt.id === id);
    return type?.name || 'Unknown';
  };

  const getLeaveTypeColor = (id) => {
    const type = leaveTypes.find(lt => lt.id === id);
    return type?.color || 'gray';
  };

  const calculateAvailable = (balance) => {
    return leaveBalanceService.calculateAvailable(balance);
  };

  const handleAdjustment = async (e) => {
    e.preventDefault();

    if (!adjustmentData.days || !adjustmentData.reason) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      await leaveAdjustmentService.create({
        employeeId: selectedBalance.employeeId,
        leaveTypeId: selectedBalance.leaveTypeId,
        fiscalYear: selectedBalance.fiscalYear,
        adjustmentType: adjustmentData.adjustmentType,
        days: Number(adjustmentData.days),
        reason: adjustmentData.reason,
        adjustedBy: 'HR Admin',
      });

      // Auto-approve for demo
      const adjustments = await leaveAdjustmentService.getPending();
      const latest = adjustments[adjustments.length - 1];
      if (latest) {
        await leaveAdjustmentService.approve(latest.id, 'HR Admin');
      }

      showToast('Balance adjusted successfully');
      setShowAdjustModal(false);
      setAdjustmentData({ adjustmentType: 'credit', days: '', reason: '' });
      loadData();
    } catch (error) {
      console.error('Error adjusting balance:', error);
      showToast('Failed to adjust balance', 'error');
    }
  };

  const handleInitialize = async (e) => {
    e.preventDefault();

    if (!initEmployeeId) {
      showToast('Please select an employee', 'error');
      return;
    }

    try {
      await leaveBalanceService.initializeForEmployee(Number(initEmployeeId), filterYear);
      showToast('Leave balances initialized successfully');
      setShowInitModal(false);
      setInitEmployeeId('');
      loadData();
    } catch (error) {
      console.error('Error initializing balances:', error);
      showToast('Failed to initialize balances', 'error');
    }
  };

  const filteredBalances = balances.filter(balance => {
    const employeeName = getEmployeeName(balance.employeeId).toLowerCase();
    const matchesSearch = employeeName.includes(searchTerm.toLowerCase());
    const matchesYear = balance.fiscalYear === filterYear;
    const matchesEmployee = !filterEmployee || balance.employeeId === Number(filterEmployee);
    const matchesLeaveType = !filterLeaveType || balance.leaveTypeId === Number(filterLeaveType);
    return matchesSearch && matchesYear && matchesEmployee && matchesLeaveType;
  });

  // Group balances by employee
  const groupedBalances = filteredBalances.reduce((acc, balance) => {
    const key = balance.employeeId;
    if (!acc[key]) {
      acc[key] = {
        employeeId: balance.employeeId,
        employeeName: getEmployeeName(balance.employeeId),
        balances: [],
      };
    }
    acc[key].balances.push(balance);
    return acc;
  }, {});

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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Balances</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View and manage employee leave balances
          </p>
        </div>
        <button
          onClick={() => setShowInitModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Initialize Balances
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            value={filterYear}
            onChange={(e) => setFilterYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={filterEmployee}
            onChange={(e) => setFilterEmployee(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Employees</option>
            {employees.filter(e => e.status === 'active').map(emp => (
              <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
            ))}
          </select>
          <select
            value={filterLeaveType}
            onChange={(e) => setFilterLeaveType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Leave Types</option>
            {leaveTypes.filter(lt => lt.status === 'active').map(lt => (
              <option key={lt.id} value={lt.id}>{lt.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {Object.keys(groupedBalances).length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-500 dark:text-gray-400">No leave balances found</p>
          </div>
        ) : (
          Object.values(groupedBalances).map(group => (
            <div key={group.employeeId} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{group.employeeName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Fiscal Year: {filterYear}</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.balances.map(balance => {
                    const available = calculateAvailable(balance);
                    const color = getLeaveTypeColor(balance.leaveTypeId);
                    return (
                      <div
                        key={balance.id}
                        className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full bg-${color}-500`}></div>
                            <span className="font-medium text-gray-900 dark:text-white text-sm">
                              {getLeaveTypeName(balance.leaveTypeId)}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedBalance(balance);
                              setShowAdjustModal(true);
                            }}
                            className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                          >
                            Adjust
                          </button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Opening</span>
                            <span className="text-gray-900 dark:text-white">{balance.openingBalance || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Carried Forward</span>
                            <span className="text-gray-900 dark:text-white">{balance.carriedForward || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Accrued</span>
                            <span className="text-gray-900 dark:text-white">{balance.accrued || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Adjustment</span>
                            <span className={`${balance.adjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {balance.adjustment >= 0 ? '+' : ''}{balance.adjustment || 0}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Used</span>
                            <span className="text-red-600 dark:text-red-400">-{balance.used || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Pending</span>
                            <span className="text-yellow-600 dark:text-yellow-400">-{balance.pending || 0}</span>
                          </div>
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-700 dark:text-gray-300">Available</span>
                              <span className={`text-lg font-bold ${
                                available > 5 ? 'text-green-600' : available > 0 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {available}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAdjustModal && selectedBalance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md m-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Adjust Balance</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {getEmployeeName(selectedBalance.employeeId)} - {getLeaveTypeName(selectedBalance.leaveTypeId)}
              </p>
            </div>
            <form onSubmit={handleAdjustment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Adjustment Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="adjustmentType"
                      value="credit"
                      checked={adjustmentData.adjustmentType === 'credit'}
                      onChange={(e) => setAdjustmentData(prev => ({ ...prev, adjustmentType: e.target.value }))}
                      className="w-4 h-4 text-primary-500"
                    />
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Credit (Add)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="adjustmentType"
                      value="debit"
                      checked={adjustmentData.adjustmentType === 'debit'}
                      onChange={(e) => setAdjustmentData(prev => ({ ...prev, adjustmentType: e.target.value }))}
                      className="w-4 h-4 text-primary-500"
                    />
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Debit (Subtract)</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Days *
                </label>
                <input
                  type="number"
                  value={adjustmentData.days}
                  onChange={(e) => setAdjustmentData(prev => ({ ...prev, days: e.target.value }))}
                  required
                  min="0.5"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason *
                </label>
                <textarea
                  value={adjustmentData.reason}
                  onChange={(e) => setAdjustmentData(prev => ({ ...prev, reason: e.target.value }))}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Provide a reason for this adjustment..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdjustModal(false);
                    setAdjustmentData({ adjustmentType: 'credit', days: '', reason: '' });
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                >
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showInitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md m-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Initialize Leave Balances</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Create leave balances for an employee based on active leave types
              </p>
            </div>
            <form onSubmit={handleInitialize} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Employee *
                </label>
                <select
                  value={initEmployeeId}
                  onChange={(e) => setInitEmployeeId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select Employee</option>
                  {employees.filter(e => e.status === 'active').map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fiscal Year
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
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  This will create leave balances for all active leave types based on their default entitlements.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowInitModal(false);
                    setInitEmployeeId('');
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                >
                  Initialize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveBalances;
