import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Scale,
  Plus,
  Search,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  FileText,
  AlertTriangle,
  Gavel
} from 'lucide-react';
import { initDisciplinaryDB, appealsDB, disciplinaryActionsDB } from '../../services/db/disciplinaryService';
import { employeeDB } from '../../services/db/indexedDB';

const Appeals = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [appeals, setAppeals] = useState([]);
  const [filteredAppeals, setFilteredAppeals] = useState([]);
  const [actions, setActions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || ''
  });
  const [showNewModal, setShowNewModal] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const [newAppeal, setNewAppeal] = useState({
    disciplinaryActionId: '',
    appealGrounds: '',
    appealStatement: ''
  });
  const [decision, setDecision] = useState({
    outcome: '',
    decisionRationale: '',
    modifiedAction: ''
  });

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'reviewing', label: 'Under Review' },
    { value: 'hearing_scheduled', label: 'Hearing Scheduled' },
    { value: 'decided', label: 'Decided' },
    { value: 'withdrawn', label: 'Withdrawn' }
  ];

  const appealGroundsOptions = [
    { value: 'procedural_error', label: 'Procedural Error' },
    { value: 'new_evidence', label: 'New Evidence' },
    { value: 'disproportionate', label: 'Disproportionate Sanction' },
    { value: 'factual_error', label: 'Factual Error' },
    { value: 'mitigating_circumstances', label: 'Mitigating Circumstances' },
    { value: 'other', label: 'Other' }
  ];

  const outcomeOptions = [
    { value: 'upheld', label: 'Appeal Upheld - Action Overturned' },
    { value: 'partially_upheld', label: 'Partially Upheld - Action Modified' },
    { value: 'dismissed', label: 'Appeal Dismissed - Action Stands' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAppeals();
  }, [appeals, searchTerm, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      await initDisciplinaryDB();
      const [appealsData, actionsData, employeesData] = await Promise.all([
        appealsDB.getAll(),
        disciplinaryActionsDB.getAll(),
        employeeDB.getAll()
      ]);
      setAppeals(appealsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setActions(actionsData);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error loading appeals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAppeals = () => {
    let filtered = [...appeals];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.appealNumber?.toLowerCase().includes(term) ||
        a.employeeName?.toLowerCase().includes(term) ||
        a.actionNumber?.toLowerCase().includes(term)
      );
    }

    if (filters.status) {
      if (filters.status === 'pending') {
        filtered = filtered.filter(a => ['submitted', 'reviewing', 'hearing_scheduled'].includes(a.status));
      } else {
        filtered = filtered.filter(a => a.status === filters.status);
      }
    }

    setFilteredAppeals(filtered);
  };

  const handleCreateAppeal = async () => {
    try {
      const action = actions.find(a => a.id === Number(newAppeal.disciplinaryActionId));
      const employee = employees.find(e => e.id === action?.employeeId);
      const appealNumber = await appealsDB.generateAppealNumber();

      await appealsDB.create({
        ...newAppeal,
        appealNumber,
        disciplinaryActionId: Number(newAppeal.disciplinaryActionId),
        actionNumber: action?.actionNumber,
        employeeId: action?.employeeId,
        employeeName: action?.employeeName || (employee ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim() : ''),
        appealDate: new Date().toISOString().split('T')[0],
        status: 'submitted'
      });

      // Update the action status
      if (action) {
        await disciplinaryActionsDB.update(action.id, { status: 'appealed' });
      }

      setShowNewModal(false);
      setNewAppeal({ disciplinaryActionId: '', appealGrounds: '', appealStatement: '' });
      loadData();
    } catch (error) {
      console.error('Error creating appeal:', error);
    }
  };

  const handleDecision = async () => {
    if (!selectedAppeal) return;
    try {
      await appealsDB.decide(selectedAppeal.id, {
        outcome: decision.outcome,
        decisionRationale: decision.decisionRationale,
        modifiedAction: decision.modifiedAction
      });

      // Update the original action based on decision
      const action = actions.find(a => a.id === selectedAppeal.disciplinaryActionId);
      if (action) {
        if (decision.outcome === 'upheld') {
          await disciplinaryActionsDB.update(action.id, { status: 'overturned' });
        } else if (decision.outcome === 'partially_upheld') {
          await disciplinaryActionsDB.update(action.id, { status: 'modified', modifiedAction: decision.modifiedAction });
        } else {
          await disciplinaryActionsDB.update(action.id, { status: 'acknowledged' }); // Appeal dismissed
        }
      }

      setShowDecisionModal(false);
      setSelectedAppeal(null);
      setDecision({ outcome: '', decisionRationale: '', modifiedAction: '' });
      loadData();
    } catch (error) {
      console.error('Error recording decision:', error);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      reviewing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      hearing_scheduled: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      decided: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      withdrawn: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    };
    const icons = {
      submitted: FileText,
      reviewing: Search,
      hearing_scheduled: Calendar,
      decided: Gavel,
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

  const getOutcomeBadge = (outcome) => {
    const styles = {
      upheld: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      partially_upheld: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      dismissed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    const labels = {
      upheld: 'Upheld',
      partially_upheld: 'Partially Upheld',
      dismissed: 'Dismissed'
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${styles[outcome] || 'bg-gray-100 text-gray-800'}`}>
        {labels[outcome] || outcome}
      </span>
    );
  };

  // Get actions that can be appealed (acknowledged)
  const appealableActions = actions.filter(a => a.status === 'acknowledged' || a.status === 'issued');

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appeals</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredAppeals.length} of {appeals.length} appeals
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          disabled={appealableActions.length === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>File Appeal</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Review', count: appeals.filter(a => ['submitted', 'reviewing'].includes(a.status)).length, color: 'bg-blue-500' },
          { label: 'Hearing Scheduled', count: appeals.filter(a => a.status === 'hearing_scheduled').length, color: 'bg-purple-500' },
          { label: 'Upheld', count: appeals.filter(a => a.outcome === 'upheld').length, color: 'bg-green-500' },
          { label: 'Dismissed', count: appeals.filter(a => a.outcome === 'dismissed').length, color: 'bg-red-500' }
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
              placeholder="Search by appeal number, employee, or action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Appeals List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredAppeals.length === 0 ? (
          <div className="text-center py-12">
            <Scale className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No appeals found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || filters.status ? 'Try adjusting your filters' : 'No appeals have been filed yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Appeal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action Appealed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Grounds</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Outcome</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAppeals.map((appeal) => (
                  <tr key={appeal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{appeal.appealNumber}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(appeal.appealDate).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white">{appeal.employeeName || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 dark:text-white">{appeal.actionNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{appeal.appealGrounds?.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(appeal.status)}
                    </td>
                    <td className="px-6 py-4">
                      {appeal.outcome ? getOutcomeBadge(appeal.outcome) : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {['submitted', 'reviewing', 'hearing_scheduled'].includes(appeal.status) && (
                          <button
                            onClick={() => {
                              setSelectedAppeal(appeal);
                              setShowDecisionModal(true);
                            }}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                            title="Record Decision"
                          >
                            <Gavel className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/disciplinary/appeals/${appeal.id}`)}
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

      {/* New Appeal Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <Scale className="w-5 h-5 text-indigo-500" />
              <span>File Appeal</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Disciplinary Action <span className="text-red-500">*</span>
                </label>
                <select
                  value={newAppeal.disciplinaryActionId}
                  onChange={(e) => setNewAppeal({ ...newAppeal, disciplinaryActionId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select action to appeal...</option>
                  {appealableActions.map(action => (
                    <option key={action.id} value={action.id}>
                      {action.actionNumber} - {action.employeeName} ({action.actionType?.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Grounds for Appeal <span className="text-red-500">*</span>
                </label>
                <select
                  value={newAppeal.appealGrounds}
                  onChange={(e) => setNewAppeal({ ...newAppeal, appealGrounds: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select grounds...</option>
                  {appealGroundsOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Appeal Statement <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newAppeal.appealStatement}
                  onChange={(e) => setNewAppeal({ ...newAppeal, appealStatement: e.target.value })}
                  rows={4}
                  placeholder="Explain why you believe the disciplinary action should be reviewed..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-400">
                  Appeals must be filed within 5 working days of receiving the disciplinary action.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowNewModal(false);
                  setNewAppeal({ disciplinaryActionId: '', appealGrounds: '', appealStatement: '' });
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAppeal}
                disabled={!newAppeal.disciplinaryActionId || !newAppeal.appealGrounds || !newAppeal.appealStatement}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                Submit Appeal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decision Modal */}
      {showDecisionModal && selectedAppeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <Gavel className="w-5 h-5 text-indigo-500" />
              <span>Record Appeal Decision</span>
            </h3>

            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Appeal: <span className="font-medium text-gray-900 dark:text-white">{selectedAppeal.appealNumber}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Employee: <span className="font-medium text-gray-900 dark:text-white">{selectedAppeal.employeeName}</span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Decision <span className="text-red-500">*</span>
                </label>
                <select
                  value={decision.outcome}
                  onChange={(e) => setDecision({ ...decision, outcome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select decision...</option>
                  {outcomeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {decision.outcome === 'partially_upheld' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Modified Action
                  </label>
                  <input
                    type="text"
                    value={decision.modifiedAction}
                    onChange={(e) => setDecision({ ...decision, modifiedAction: e.target.value })}
                    placeholder="e.g., Reduced to verbal warning"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Decision Rationale <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={decision.decisionRationale}
                  onChange={(e) => setDecision({ ...decision, decisionRationale: e.target.value })}
                  rows={4}
                  placeholder="Explain the reasoning behind the decision..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowDecisionModal(false);
                  setSelectedAppeal(null);
                  setDecision({ outcome: '', decisionRationale: '', modifiedAction: '' });
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDecision}
                disabled={!decision.outcome || !decision.decisionRationale}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                Record Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appeals;
