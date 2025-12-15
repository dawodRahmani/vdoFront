import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  MessageSquare,
  Plus,
  Search,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  AlertTriangle,
  MessageCircle,
  ThumbsUp
} from 'lucide-react';
import { initDisciplinaryDB, grievancesDB } from '../../services/db/disciplinaryService';
import { employeeDB } from '../../services/db/indexedDB';

const Grievances = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [grievances, setGrievances] = useState([]);
  const [filteredGrievances, setFilteredGrievances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    type: ''
  });
  const [showNewModal, setShowNewModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [newGrievance, setNewGrievance] = useState({
    employeeId: '',
    grievanceType: '',
    description: '',
    desiredResolution: ''
  });
  const [resolution, setResolution] = useState({
    resolutionSummary: '',
    actionsTaken: '',
    employeeSatisfied: false
  });

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'acknowledged', label: 'Acknowledged' },
    { value: 'investigating', label: 'Investigating' },
    { value: 'pending_resolution', label: 'Pending Resolution' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'withdrawn', label: 'Withdrawn' }
  ];

  const grievanceTypes = [
    { value: 'workplace', label: 'Workplace Conditions' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'discrimination', label: 'Discrimination' },
    { value: 'management', label: 'Management Issues' },
    { value: 'compensation', label: 'Compensation/Benefits' },
    { value: 'workload', label: 'Workload' },
    { value: 'policy', label: 'Policy Concerns' },
    { value: 'interpersonal', label: 'Interpersonal Conflict' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterGrievances();
  }, [grievances, searchTerm, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      await initDisciplinaryDB();
      const [grievancesData, employeesData] = await Promise.all([
        grievancesDB.getAll(),
        employeeDB.getAll()
      ]);
      setGrievances(grievancesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error loading grievances:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterGrievances = () => {
    let filtered = [...grievances];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(g =>
        g.grievanceNumber?.toLowerCase().includes(term) ||
        g.employeeName?.toLowerCase().includes(term) ||
        g.description?.toLowerCase().includes(term)
      );
    }

    if (filters.status) {
      if (filters.status === 'open') {
        filtered = filtered.filter(g => ['submitted', 'acknowledged', 'investigating', 'pending_resolution'].includes(g.status));
      } else {
        filtered = filtered.filter(g => g.status === filters.status);
      }
    }

    if (filters.type) {
      filtered = filtered.filter(g => g.grievanceType === filters.type);
    }

    setFilteredGrievances(filtered);
  };

  const handleCreateGrievance = async () => {
    try {
      const employee = employees.find(e => e.id === Number(newGrievance.employeeId));
      const grievanceNumber = await grievancesDB.generateGrievanceNumber();

      await grievancesDB.create({
        ...newGrievance,
        grievanceNumber,
        employeeId: Number(newGrievance.employeeId),
        employeeName: employee ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.name : '',
        department: employee?.department || '',
        grievanceDate: new Date().toISOString().split('T')[0],
        status: 'submitted'
      });

      setShowNewModal(false);
      setNewGrievance({ employeeId: '', grievanceType: '', description: '', desiredResolution: '' });
      loadData();
    } catch (error) {
      console.error('Error creating grievance:', error);
    }
  };

  const handleResolve = async () => {
    if (!selectedGrievance) return;
    try {
      await grievancesDB.resolve(selectedGrievance.id, {
        resolutionSummary: resolution.resolutionSummary,
        actionsTaken: resolution.actionsTaken,
        employeeSatisfied: resolution.employeeSatisfied
      });

      setShowResolveModal(false);
      setSelectedGrievance(null);
      setResolution({ resolutionSummary: '', actionsTaken: '', employeeSatisfied: false });
      loadData();
    } catch (error) {
      console.error('Error resolving grievance:', error);
    }
  };

  const handleUpdateStatus = async (grievance, newStatus) => {
    try {
      await grievancesDB.update(grievance.id, { status: newStatus });
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      acknowledged: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      investigating: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      pending_resolution: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      withdrawn: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    };
    const icons = {
      submitted: MessageSquare,
      acknowledged: CheckCircle,
      investigating: Search,
      pending_resolution: Clock,
      resolved: ThumbsUp,
      withdrawn: XCircle
    };
    const Icon = icons[status] || Clock;
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        <Icon className="w-3 h-3" />
        <span>{status?.replace('_', ' ')}</span>
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const styles = {
      harassment: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      discrimination: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      workplace: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      management: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      compensation: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      workload: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      policy: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      interpersonal: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400'
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${styles[type] || 'bg-gray-100 text-gray-800'}`}>
        {grievanceTypes.find(t => t.value === type)?.label || type}
      </span>
    );
  };

  const getDaysSinceSubmission = (date) => {
    const submitted = new Date(date);
    const today = new Date();
    const days = Math.floor((today - submitted) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Grievances</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredGrievances.length} of {grievances.length} grievances
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Grievance</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Open Grievances', count: grievances.filter(g => ['submitted', 'acknowledged', 'investigating', 'pending_resolution'].includes(g.status)).length, color: 'bg-blue-500' },
          { label: 'Under Investigation', count: grievances.filter(g => g.status === 'investigating').length, color: 'bg-purple-500' },
          { label: 'Resolved', count: grievances.filter(g => g.status === 'resolved').length, color: 'bg-green-500' },
          { label: 'Avg. Resolution Time', count: '5 days', color: 'bg-teal-500' }
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</span>
              <span className={`w-3 h-3 rounded-full ${stat.color}`}></span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by grievance number, employee, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Types</option>
              {grievanceTypes.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grievances List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredGrievances.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No grievances found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || filters.status || filters.type ? 'Try adjusting your filters' : 'No grievances have been submitted yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Grievance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredGrievances.map((grievance) => (
                  <tr key={grievance.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{grievance.grievanceNumber}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{grievance.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{grievance.employeeName || 'Unknown'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{grievance.department || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getTypeBadge(grievance.grievanceType)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(grievance.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900 dark:text-white">{new Date(grievance.grievanceDate).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{getDaysSinceSubmission(grievance.grievanceDate)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {grievance.status === 'submitted' && (
                          <button
                            onClick={() => handleUpdateStatus(grievance, 'acknowledged')}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                            title="Acknowledge"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {grievance.status === 'acknowledged' && (
                          <button
                            onClick={() => handleUpdateStatus(grievance, 'investigating')}
                            className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                            title="Start Investigation"
                          >
                            <Search className="w-4 h-4" />
                          </button>
                        )}
                        {['investigating', 'pending_resolution'].includes(grievance.status) && (
                          <button
                            onClick={() => {
                              setSelectedGrievance(grievance);
                              setShowResolveModal(true);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Resolve"
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/disciplinary/grievances/${grievance.id}`)}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Grievance Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-teal-500" />
              <span>Submit Grievance</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Employee <span className="text-red-500">*</span>
                </label>
                <select
                  value={newGrievance.employeeId}
                  onChange={(e) => setNewGrievance({ ...newGrievance, employeeId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select employee...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {`${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Grievance Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={newGrievance.grievanceType}
                  onChange={(e) => setNewGrievance({ ...newGrievance, grievanceType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select type...</option>
                  {grievanceTypes.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newGrievance.description}
                  onChange={(e) => setNewGrievance({ ...newGrievance, description: e.target.value })}
                  rows={4}
                  placeholder="Describe the grievance in detail..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Desired Resolution
                </label>
                <textarea
                  value={newGrievance.desiredResolution}
                  onChange={(e) => setNewGrievance({ ...newGrievance, desiredResolution: e.target.value })}
                  rows={2}
                  placeholder="What outcome would the employee like to see?"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowNewModal(false);
                  setNewGrievance({ employeeId: '', grievanceType: '', description: '', desiredResolution: '' });
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGrievance}
                disabled={!newGrievance.employeeId || !newGrievance.grievanceType || !newGrievance.description}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                Submit Grievance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && selectedGrievance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <ThumbsUp className="w-5 h-5 text-green-500" />
              <span>Resolve Grievance</span>
            </h3>

            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Grievance: <span className="font-medium text-gray-900 dark:text-white">{selectedGrievance.grievanceNumber}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Employee: <span className="font-medium text-gray-900 dark:text-white">{selectedGrievance.employeeName}</span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Resolution Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={resolution.resolutionSummary}
                  onChange={(e) => setResolution({ ...resolution, resolutionSummary: e.target.value })}
                  rows={3}
                  placeholder="Summarize how the grievance was resolved..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Actions Taken
                </label>
                <textarea
                  value={resolution.actionsTaken}
                  onChange={(e) => setResolution({ ...resolution, actionsTaken: e.target.value })}
                  rows={2}
                  placeholder="List specific actions taken to address the grievance..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={resolution.employeeSatisfied}
                  onChange={(e) => setResolution({ ...resolution, employeeSatisfied: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-gray-700 dark:text-gray-300">Employee satisfied with resolution</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowResolveModal(false);
                  setSelectedGrievance(null);
                  setResolution({ resolutionSummary: '', actionsTaken: '', employeeSatisfied: false });
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={!resolution.resolutionSummary}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Grievances;
