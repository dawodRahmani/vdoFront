import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  User,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  FileText,
  Users
} from 'lucide-react';
import { initDisciplinaryDB, investigationsDB, misconductReportsDB } from '../../services/db/disciplinaryService';
import { employeeDB } from '../../services/db/indexedDB';

const Investigations = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [investigations, setInvestigations] = useState([]);
  const [filteredInvestigations, setFilteredInvestigations] = useState([]);
  const [reports, setReports] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    investigator: '',
    type: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInvestigation, setSelectedInvestigation] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newInvestigation, setNewInvestigation] = useState({
    reportId: '',
    investigationType: 'formal',
    leadInvestigatorId: '',
    plannedEndDate: ''
  });

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'informal', label: 'Informal Inquiry' },
    { value: 'formal', label: 'Formal Investigation' },
    { value: 'external', label: 'External Investigation' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterInvestigations();
  }, [investigations, searchTerm, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      await initDisciplinaryDB();
      const [investigationsData, reportsData, employeesData] = await Promise.all([
        investigationsDB.getAll(),
        misconductReportsDB.getAll(),
        employeeDB.getAll()
      ]);
      setInvestigations(investigationsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setReports(reportsData);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error loading investigations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterInvestigations = () => {
    let filtered = [...investigations];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(i =>
        i.investigationNumber?.toLowerCase().includes(term) ||
        i.leadInvestigatorName?.toLowerCase().includes(term) ||
        i.accusedEmployeeName?.toLowerCase().includes(term)
      );
    }

    if (filters.status) {
      if (filters.status === 'active') {
        filtered = filtered.filter(i => ['pending', 'in_progress'].includes(i.status));
      } else {
        filtered = filtered.filter(i => i.status === filters.status);
      }
    }

    if (filters.investigator) {
      filtered = filtered.filter(i => i.leadInvestigatorId === Number(filters.investigator));
    }

    if (filters.type) {
      filtered = filtered.filter(i => i.investigationType === filters.type);
    }

    setFilteredInvestigations(filtered);
  };

  const handleCreateInvestigation = async () => {
    try {
      const report = reports.find(r => r.id === Number(newInvestigation.reportId));
      const investigator = employees.find(e => e.id === Number(newInvestigation.leadInvestigatorId));
      const investigationNumber = await investigationsDB.generateInvestigationNumber();

      await investigationsDB.create({
        ...newInvestigation,
        investigationNumber,
        reportId: Number(newInvestigation.reportId),
        reportNumber: report?.reportNumber,
        accusedEmployeeId: report?.accusedEmployeeId,
        accusedEmployeeName: report?.accusedEmployeeName,
        leadInvestigatorId: Number(newInvestigation.leadInvestigatorId),
        leadInvestigatorName: investigator ? `${investigator.firstName || ''} ${investigator.lastName || ''}`.trim() || investigator.name : '',
        status: 'pending'
      });

      // Update report status
      if (report) {
        await misconductReportsDB.update(report.id, { status: 'investigating' });
      }

      setShowNewModal(false);
      setNewInvestigation({ reportId: '', investigationType: 'formal', leadInvestigatorId: '', plannedEndDate: '' });
      loadData();
    } catch (error) {
      console.error('Error creating investigation:', error);
    }
  };

  const handleStartInvestigation = async (investigation) => {
    try {
      await investigationsDB.start(investigation.id);
      loadData();
    } catch (error) {
      console.error('Error starting investigation:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedInvestigation) return;
    try {
      await investigationsDB.delete(selectedInvestigation.id);
      setInvestigations(investigations.filter(i => i.id !== selectedInvestigation.id));
      setShowDeleteModal(false);
      setSelectedInvestigation(null);
    } catch (error) {
      console.error('Error deleting investigation:', error);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      on_hold: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    };
    const icons = {
      pending: Clock,
      in_progress: Search,
      on_hold: Pause,
      completed: CheckCircle,
      cancelled: AlertTriangle
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
      informal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      formal: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      external: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    const labels = {
      informal: 'Informal',
      formal: 'Formal',
      external: 'External'
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${styles[type] || 'bg-gray-100 text-gray-800'}`}>
        {labels[type] || type}
      </span>
    );
  };

  const getDaysRemaining = (plannedEndDate) => {
    if (!plannedEndDate) return null;
    const today = new Date();
    const end = new Date(plannedEndDate);
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { text: `${Math.abs(diff)} days overdue`, color: 'text-red-600' };
    if (diff === 0) return { text: 'Due today', color: 'text-orange-600' };
    if (diff <= 3) return { text: `${diff} days left`, color: 'text-yellow-600' };
    return { text: `${diff} days left`, color: 'text-gray-500' };
  };

  // Get reports that can be investigated (assessing status)
  const availableReports = reports.filter(r => ['assessing', 'received'].includes(r.status));

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Investigations</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredInvestigations.length} of {investigations.length} investigations
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          disabled={availableReports.length === 0}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>Start Investigation</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by investigation number, investigator, or employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
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
              {typeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Investigations List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredInvestigations.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No investigations found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || filters.status || filters.type ? 'Try adjusting your filters' : 'No investigations have been started yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Investigation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Accused</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lead Investigator</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timeline</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredInvestigations.map((investigation) => {
                  const daysRemaining = getDaysRemaining(investigation.plannedEndDate);
                  return (
                    <tr key={investigation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{investigation.investigationNumber}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Report: {investigation.reportNumber}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white">{investigation.accusedEmployeeName || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <Search className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white">{investigation.leadInvestigatorName || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getTypeBadge(investigation.investigationType)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(investigation.status)}
                      </td>
                      <td className="px-6 py-4">
                        {daysRemaining ? (
                          <span className={`text-sm ${daysRemaining.color}`}>{daysRemaining.text}</span>
                        ) : (
                          <span className="text-sm text-gray-400">No deadline</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {investigation.status === 'pending' && (
                            <button
                              onClick={() => handleStartInvestigation(investigation)}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              title="Start Investigation"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/disciplinary/investigations/${investigation.id}`)}
                            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedInvestigation(investigation);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* New Investigation Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <Search className="w-5 h-5 text-purple-500" />
              <span>Start New Investigation</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Report <span className="text-red-500">*</span>
                </label>
                <select
                  value={newInvestigation.reportId}
                  onChange={(e) => setNewInvestigation({ ...newInvestigation, reportId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select a report...</option>
                  {availableReports.map(report => (
                    <option key={report.id} value={report.id}>
                      {report.reportNumber} - {report.accusedEmployeeName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Investigation Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={newInvestigation.investigationType}
                  onChange={(e) => setNewInvestigation({ ...newInvestigation, investigationType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="informal">Informal Inquiry</option>
                  <option value="formal">Formal Investigation</option>
                  <option value="external">External Investigation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lead Investigator <span className="text-red-500">*</span>
                </label>
                <select
                  value={newInvestigation.leadInvestigatorId}
                  onChange={(e) => setNewInvestigation({ ...newInvestigation, leadInvestigatorId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select investigator...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {`${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Completion Date
                </label>
                <input
                  type="date"
                  value={newInvestigation.plannedEndDate}
                  onChange={(e) => setNewInvestigation({ ...newInvestigation, plannedEndDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowNewModal(false);
                  setNewInvestigation({ reportId: '', investigationType: 'formal', leadInvestigatorId: '', plannedEndDate: '' });
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateInvestigation}
                disabled={!newInvestigation.reportId || !newInvestigation.leadInvestigatorId}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                Create Investigation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 text-red-600 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Delete Investigation</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete investigation <span className="font-semibold">{selectedInvestigation?.investigationNumber}</span>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedInvestigation(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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

export default Investigations;
