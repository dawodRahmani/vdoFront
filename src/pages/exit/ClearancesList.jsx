import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardCheck,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Eye,
  Building,
  User,
} from 'lucide-react';
import { clearanceService, separationService, clearanceDepartmentService, initializeExitModule } from '../../services/db/exitService';

const ClearancesList = () => {
  const [clearances, setClearances] = useState([]);
  const [separations, setSeparations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  useEffect(() => {
    loadData();
  }, [statusFilter, departmentFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      await initializeExitModule();

      const [clearanceData, sepData, deptData] = await Promise.all([
        clearanceService.getAll({ status: statusFilter, departmentId: departmentFilter ? Number(departmentFilter) : undefined }),
        separationService.getAll({ status: 'clearance_pending' }),
        clearanceDepartmentService.getAll(),
      ]);

      setClearances(clearanceData);
      setSeparations(sepData);
      setDepartments(deptData);
    } catch (error) {
      console.error('Error loading clearances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCleared = async (clearanceId) => {
    try {
      await clearanceService.markCleared(clearanceId, 'current_user', 'Cleared successfully');
      loadData();
    } catch (error) {
      console.error('Error marking clearance:', error);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Pending', icon: Clock },
      in_progress: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'In Progress', icon: RefreshCw },
      cleared: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Cleared', icon: CheckCircle },
      issues_found: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Issues Found', icon: AlertTriangle },
    };
    const statusConfig = config[status] || { color: 'bg-gray-100 text-gray-800', label: status, icon: Clock };
    const Icon = statusConfig.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${statusConfig.color}`}>
        <Icon className="w-3 h-3" />
        {statusConfig.label}
      </span>
    );
  };

  const getSeparationInfo = (separationId) => {
    return separations.find(s => s.id === separationId);
  };

  // Group clearances by separation
  const groupedClearances = clearances.reduce((acc, clearance) => {
    const key = clearance.separationId;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(clearance);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7" />
            Clearances
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track department clearances for exiting employees
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{clearances.length}</p>
            </div>
            <ClipboardCheck className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{clearances.filter(c => c.status === 'pending').length}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Cleared</p>
              <p className="text-2xl font-bold text-green-600">{clearances.filter(c => c.status === 'cleared').length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Issues</p>
              <p className="text-2xl font-bold text-red-600">{clearances.filter(c => c.status === 'issues_found').length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="cleared">Cleared</option>
            <option value="issues_found">Issues Found</option>
          </select>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
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

      {/* Clearances by Separation */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : Object.keys(groupedClearances).length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
          <ClipboardCheck className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No clearances found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Clearances will appear here when separations enter the clearance phase
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedClearances).map(([separationId, sepClearances]) => {
            const separation = getSeparationInfo(Number(separationId));
            return (
              <div
                key={separationId}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Separation Header */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <User className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {separation?.employeeName || 'Unknown Employee'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {separation?.separationNumber || `Separation #${separationId}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Last Working Day</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {separation?.proposedLastDay ? new Date(separation.proposedLastDay).toLocaleDateString() : 'TBD'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Department Clearances */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sepClearances.map(clearance => (
                      <div
                        key={clearance.id}
                        className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {clearance.departmentName || 'Unknown Department'}
                            </span>
                          </div>
                          {getStatusBadge(clearance.status)}
                        </div>
                        {clearance.status === 'issues_found' && clearance.outstandingItems && (
                          <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                            Issues: {clearance.outstandingItems}
                          </p>
                        )}
                        {clearance.status === 'pending' && (
                          <button
                            onClick={() => handleMarkCleared(clearance.id)}
                            className="mt-2 w-full px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                          >
                            Mark as Cleared
                          </button>
                        )}
                        {clearance.status === 'cleared' && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Cleared on {new Date(clearance.clearanceDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-500 dark:text-gray-400">Clearance Progress</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {sepClearances.filter(c => c.status === 'cleared').length} / {sepClearances.length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${(sepClearances.filter(c => c.status === 'cleared').length / sepClearances.length) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClearancesList;
