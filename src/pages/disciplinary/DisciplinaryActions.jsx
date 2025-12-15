import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  MessageSquare,
  FileWarning,
  Pen
} from 'lucide-react';
import { initDisciplinaryDB, disciplinaryActionsDB, investigationsDB } from '../../services/db/disciplinaryService';
import { employeeDB } from '../../services/db/indexedDB';

const DisciplinaryActions = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState([]);
  const [filteredActions, setFilteredActions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    actionType: '',
    filter: searchParams.get('filter') || ''
  });
  const [showNewModal, setShowNewModal] = useState(false);
  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [newAction, setNewAction] = useState({
    employeeId: '',
    actionType: 'verbal_warning',
    misconductDescription: '',
    expectedImprovement: '',
    consequencesIfRepeated: ''
  });

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'issued', label: 'Issued (Pending Signature)' },
    { value: 'acknowledged', label: 'Acknowledged' },
    { value: 'appealed', label: 'Appealed' },
    { value: 'expired', label: 'Expired' }
  ];

  const actionTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'verbal_warning', label: 'Verbal Warning' },
    { value: 'first_written_warning', label: 'First Written Warning' },
    { value: 'final_written_warning', label: 'Final Written Warning' },
    { value: 'termination', label: 'Termination' }
  ];

  const warningValidityPeriods = {
    verbal_warning: 90, // 3 months
    first_written_warning: 180, // 6 months
    final_written_warning: 365 // 12 months
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterActions();
  }, [actions, searchTerm, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      await initDisciplinaryDB();
      const [actionsData, employeesData] = await Promise.all([
        disciplinaryActionsDB.getAll(),
        employeeDB.getAll()
      ]);
      setActions(actionsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error loading actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterActions = () => {
    let filtered = [...actions];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.actionNumber?.toLowerCase().includes(term) ||
        a.employeeName?.toLowerCase().includes(term) ||
        a.misconductDescription?.toLowerCase().includes(term)
      );
    }

    if (filters.status) {
      if (filters.status === 'pending') {
        filtered = filtered.filter(a => a.status === 'issued' && !a.employeeAcknowledged);
      } else {
        filtered = filtered.filter(a => a.status === filters.status);
      }
    }

    if (filters.actionType) {
      filtered = filtered.filter(a => a.actionType === filters.actionType);
    }

    // Special filter for expiring warnings
    if (filters.filter === 'expiring') {
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      filtered = filtered.filter(a => {
        if (!a.expiryDate || a.status !== 'acknowledged') return false;
        const expiry = new Date(a.expiryDate);
        return expiry >= today && expiry <= thirtyDaysFromNow;
      });
    }

    setFilteredActions(filtered);
  };

  const calculateExpiryDate = (issueDate, actionType) => {
    const days = warningValidityPeriods[actionType];
    if (!days) return null;
    const expiry = new Date(issueDate);
    expiry.setDate(expiry.getDate() + days);
    return expiry.toISOString().split('T')[0];
  };

  const handleCreateAction = async () => {
    try {
      const employee = employees.find(e => e.id === Number(newAction.employeeId));
      const actionNumber = await disciplinaryActionsDB.generateActionNumber();
      const issueDate = new Date().toISOString().split('T')[0];
      const expiryDate = calculateExpiryDate(issueDate, newAction.actionType);

      // Determine action level based on type
      const actionLevels = {
        verbal_warning: 1,
        first_written_warning: 2,
        final_written_warning: 3,
        termination: 4
      };

      await disciplinaryActionsDB.create({
        ...newAction,
        actionNumber,
        employeeId: Number(newAction.employeeId),
        employeeName: employee ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.name : '',
        department: employee?.department || '',
        actionLevel: actionLevels[newAction.actionType] || 1,
        issueDate,
        effectiveDate: issueDate,
        expiryDate,
        status: 'draft',
        issuedBy: 'HR Manager' // Would come from auth context
      });

      setShowNewModal(false);
      setNewAction({
        employeeId: '',
        actionType: 'verbal_warning',
        misconductDescription: '',
        expectedImprovement: '',
        consequencesIfRepeated: ''
      });
      loadData();
    } catch (error) {
      console.error('Error creating action:', error);
    }
  };

  const handleIssueAction = async (action) => {
    try {
      await disciplinaryActionsDB.issue(action.id);
      loadData();
    } catch (error) {
      console.error('Error issuing action:', error);
    }
  };

  const handleAcknowledge = async () => {
    if (!selectedAction) return;
    try {
      await disciplinaryActionsDB.acknowledge(selectedAction.id);
      setShowAcknowledgeModal(false);
      setSelectedAction(null);
      loadData();
    } catch (error) {
      console.error('Error acknowledging action:', error);
    }
  };

  const getActionTypeBadge = (type) => {
    const styles = {
      verbal_warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      first_written_warning: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      final_written_warning: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      termination: 'bg-gray-800 text-white dark:bg-gray-900 dark:text-gray-100'
    };
    const icons = {
      verbal_warning: MessageSquare,
      first_written_warning: FileText,
      final_written_warning: FileWarning,
      termination: XCircle
    };
    const labels = {
      verbal_warning: 'Verbal',
      first_written_warning: '1st Written',
      final_written_warning: 'Final',
      termination: 'Termination'
    };
    const Icon = icons[type] || AlertTriangle;
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 text-xs font-medium rounded-full ${styles[type] || 'bg-gray-100 text-gray-800'}`}>
        <Icon className="w-3 h-3" />
        <span>{labels[type] || type}</span>
      </span>
    );
  };

  const getStatusBadge = (status, acknowledged) => {
    if (status === 'issued' && !acknowledged) {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          <Pen className="w-3 h-3" />
          <span>Pending Signature</span>
        </span>
      );
    }
    const styles = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      issued: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      acknowledged: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      appealed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      expired: 'bg-gray-100 text-gray-500 dark:bg-gray-900/30 dark:text-gray-500'
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.replace('_', ' ')}
      </span>
    );
  };

  const getExpiryStatus = (expiryDate, status) => {
    if (!expiryDate || status !== 'acknowledged') return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { text: 'Expired', color: 'text-gray-400' };
    } else if (daysUntilExpiry <= 30) {
      return { text: `Expires in ${daysUntilExpiry} days`, color: 'text-orange-600' };
    }
    return { text: `Expires: ${new Date(expiryDate).toLocaleDateString()}`, color: 'text-gray-500' };
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Disciplinary Actions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredActions.length} of {actions.length} actions
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Issue Warning</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Signature', count: actions.filter(a => a.status === 'issued' && !a.employeeAcknowledged).length, color: 'bg-yellow-500' },
          { label: 'Active Warnings', count: actions.filter(a => a.status === 'acknowledged' && ['verbal_warning', 'first_written_warning', 'final_written_warning'].includes(a.actionType)).length, color: 'bg-orange-500' },
          { label: 'Under Appeal', count: actions.filter(a => a.status === 'appealed').length, color: 'bg-purple-500' },
          { label: 'Terminations', count: actions.filter(a => a.actionType === 'termination').length, color: 'bg-red-500' }
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
              placeholder="Search by action number, employee, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, filter: '' })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select
              value={filters.actionType}
              onChange={(e) => setFilters({ ...filters, actionType: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {actionTypeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Actions List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredActions.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No actions found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || filters.status || filters.actionType ? 'Try adjusting your filters' : 'No disciplinary actions have been issued yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Issue Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expiry</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredActions.map((action) => {
                  const expiryStatus = getExpiryStatus(action.expiryDate, action.status);
                  return (
                    <tr key={action.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 dark:text-white">{action.actionNumber}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{action.employeeName || 'Unknown'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{action.department || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getActionTypeBadge(action.actionType)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(action.status, action.employeeAcknowledged)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{action.issueDate ? new Date(action.issueDate).toLocaleDateString() : '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {expiryStatus ? (
                          <span className={`text-sm ${expiryStatus.color}`}>{expiryStatus.text}</span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {action.status === 'draft' && (
                            <button
                              onClick={() => handleIssueAction(action)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Issue to Employee"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          )}
                          {action.status === 'issued' && !action.employeeAcknowledged && (
                            <button
                              onClick={() => {
                                setSelectedAction(action);
                                setShowAcknowledgeModal(true);
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              title="Record Acknowledgement"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/disciplinary/actions/${action.id}`)}
                            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Action Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <span>Issue Disciplinary Action</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Employee <span className="text-red-500">*</span>
                </label>
                <select
                  value={newAction.employeeId}
                  onChange={(e) => setNewAction({ ...newAction, employeeId: e.target.value })}
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
                  Action Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={newAction.actionType}
                  onChange={(e) => setNewAction({ ...newAction, actionType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="verbal_warning">Verbal Warning (3 months validity)</option>
                  <option value="first_written_warning">First Written Warning (6 months validity)</option>
                  <option value="final_written_warning">Final Written Warning (12 months validity)</option>
                  <option value="termination">Termination</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Misconduct Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newAction.misconductDescription}
                  onChange={(e) => setNewAction({ ...newAction, misconductDescription: e.target.value })}
                  rows={3}
                  placeholder="Describe the misconduct that led to this action..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expected Improvement
                </label>
                <textarea
                  value={newAction.expectedImprovement}
                  onChange={(e) => setNewAction({ ...newAction, expectedImprovement: e.target.value })}
                  rows={2}
                  placeholder="What improvement is expected from the employee..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Consequences if Repeated
                </label>
                <textarea
                  value={newAction.consequencesIfRepeated}
                  onChange={(e) => setNewAction({ ...newAction, consequencesIfRepeated: e.target.value })}
                  rows={2}
                  placeholder="What will happen if the behavior continues..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowNewModal(false);
                  setNewAction({
                    employeeId: '',
                    actionType: 'verbal_warning',
                    misconductDescription: '',
                    expectedImprovement: '',
                    consequencesIfRepeated: ''
                  });
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAction}
                disabled={!newAction.employeeId || !newAction.misconductDescription}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
              >
                Create Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Acknowledge Modal */}
      {showAcknowledgeModal && selectedAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Record Acknowledgement</span>
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Confirm that <span className="font-semibold">{selectedAction.employeeName}</span> has acknowledged and signed {selectedAction.actionNumber}.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800 dark:text-yellow-400">
                This will set the warning as active and start the validity period of {warningValidityPeriods[selectedAction.actionType]} days.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAcknowledgeModal(false);
                  setSelectedAction(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAcknowledge}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Confirm Acknowledgement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisciplinaryActions;
