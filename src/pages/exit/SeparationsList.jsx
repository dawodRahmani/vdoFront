import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserMinus,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  MoreVertical,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { separationService, initializeExitModule } from '../../services/db/exitService';

const SeparationsList = () => {
  const navigate = useNavigate();
  const [separations, setSeparations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSeparation, setSelectedSeparation] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);

  useEffect(() => {
    loadSeparations();
  }, [search, statusFilter, typeFilter]);

  const loadSeparations = async () => {
    try {
      setLoading(true);
      await initializeExitModule();
      const data = await separationService.getAll({
        search,
        status: statusFilter,
        separationType: typeFilter,
      });
      setSeparations(data);
    } catch (error) {
      console.error('Error loading separations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await separationService.approve(id, 'current_user', 'Approved');
      loadSeparations();
    } catch (error) {
      console.error('Error approving separation:', error);
    }
    setActionMenu(null);
  };

  const handleReject = async (id) => {
    try {
      await separationService.reject(id, 'current_user', 'Rejected');
      loadSeparations();
    } catch (error) {
      console.error('Error rejecting separation:', error);
    }
    setActionMenu(null);
  };

  const handleDelete = async () => {
    if (!selectedSeparation) return;
    try {
      await separationService.delete(selectedSeparation.id);
      setShowDeleteModal(false);
      setSelectedSeparation(null);
      loadSeparations();
    } catch (error) {
      console.error('Error deleting separation:', error);
    }
  };

  const handleStartClearance = async (id) => {
    try {
      await separationService.startClearance(id, 'current_user');
      loadSeparations();
    } catch (error) {
      console.error('Error starting clearance:', error);
    }
    setActionMenu(null);
  };

  const getStatusBadge = (status) => {
    const config = {
      pending_approval: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Pending Approval', icon: Clock },
      approved: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Approved', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Rejected', icon: XCircle },
      clearance_pending: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', label: 'In Clearance', icon: FileText },
      exit_interview: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', label: 'Exit Interview', icon: FileText },
      settlement_pending: { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', label: 'Settlement Pending', icon: Clock },
      completed: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Completed', icon: CheckCircle },
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

  const getTypeBadge = (type) => {
    const config = {
      resignation: { color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400', label: 'Resignation' },
      contract_expiry: { color: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400', label: 'Contract Expiry' },
      project_end: { color: 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400', label: 'Project End' },
      termination_without_cause: { color: 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400', label: 'Termination (No Cause)' },
      termination_with_cause: { color: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400', label: 'Termination (With Cause)' },
      probation_failed: { color: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400', label: 'Probation Failed' },
      retirement: { color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400', label: 'Retirement' },
    };
    const typeConfig = config[type] || { color: 'bg-gray-50 text-gray-700', label: type };
    return (
      <span className={`px-2 py-0.5 text-xs rounded ${typeConfig.color}`}>
        {typeConfig.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UserMinus className="w-7 h-7" />
            Separations
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage employee separations and resignations
          </p>
        </div>
        <Link
          to="/exit/separations/new"
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Separation
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
          >
            <option value="">All Statuses</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="clearance_pending">In Clearance</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
          >
            <option value="">All Types</option>
            <option value="resignation">Resignation</option>
            <option value="contract_expiry">Contract Expiry</option>
            <option value="project_end">Project End</option>
            <option value="termination_without_cause">Termination (No Cause)</option>
            <option value="termination_with_cause">Termination (With Cause)</option>
            <option value="retirement">Retirement</option>
          </select>
          <button
            onClick={loadSeparations}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-red-500" />
          </div>
        ) : separations.length === 0 ? (
          <div className="text-center py-12">
            <UserMinus className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No separations found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Start by creating a new separation record
            </p>
            <Link
              to="/exit/separations/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Plus className="w-4 h-4" />
              New Separation
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Separation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Working Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {separations.map((sep) => (
                  <tr key={sep.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {sep.separationNumber}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(sep.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {sep.employeeName || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {sep.department || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(sep.separationType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {sep.proposedLastDay ? new Date(sep.proposedLastDay).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(sep.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="relative">
                        <button
                          onClick={() => setActionMenu(actionMenu === sep.id ? null : sep.id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                        {actionMenu === sep.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                            <button
                              onClick={() => {
                                navigate(`/exit/separations/${sep.id}`);
                                setActionMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" /> View Details
                            </button>
                            {sep.status === 'pending_approval' && (
                              <>
                                <button
                                  onClick={() => handleApprove(sep.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <CheckCircle className="w-4 h-4" /> Approve
                                </button>
                                <button
                                  onClick={() => handleReject(sep.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <XCircle className="w-4 h-4" /> Reject
                                </button>
                              </>
                            )}
                            {sep.status === 'approved' && (
                              <button
                                onClick={() => handleStartClearance(sep.id)}
                                className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <FileText className="w-4 h-4" /> Start Clearance
                              </button>
                            )}
                            <button
                              onClick={() => {
                                navigate(`/exit/separations/${sep.id}/edit`);
                                setActionMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" /> Edit
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSeparation(sep);
                                setShowDeleteModal(true);
                                setActionMenu(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Separation
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete separation{' '}
              <span className="font-semibold">{selectedSeparation?.separationNumber}</span>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedSeparation(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeparationsList;
