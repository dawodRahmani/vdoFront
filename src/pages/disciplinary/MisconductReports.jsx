import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  Download,
  MoreVertical,
  User,
  Calendar,
  Building2,
  Tag
} from 'lucide-react';
import { initDisciplinaryDB, misconductReportsDB } from '../../services/db/disciplinaryService';
import { employeeDB } from '../../services/db/indexedDB';

const MisconductReports = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    category: '',
    source: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'received', label: 'Received' },
    { value: 'assessing', label: 'Assessing' },
    { value: 'investigating', label: 'Investigating' },
    { value: 'action_taken', label: 'Action Taken' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'dismissed', label: 'Dismissed' },
    { value: 'closed', label: 'Closed' }
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'minor', label: 'Minor Infraction' },
    { value: 'misconduct', label: 'Misconduct' },
    { value: 'serious', label: 'Serious Misconduct' },
    { value: 'gross', label: 'Gross Misconduct' }
  ];

  const sourceOptions = [
    { value: '', label: 'All Sources' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'hr', label: 'HR Department' },
    { value: 'colleague', label: 'Colleague' },
    { value: 'self', label: 'Self Report' },
    { value: 'anonymous', label: 'Anonymous' },
    { value: 'external', label: 'External Party' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      await initDisciplinaryDB();
      const [reportsData, employeesData] = await Promise.all([
        misconductReportsDB.getAll(),
        employeeDB.getAll()
      ]);
      setReports(reportsData.sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate)));
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = [...reports];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.reportNumber?.toLowerCase().includes(term) ||
        r.accusedEmployeeName?.toLowerCase().includes(term) ||
        r.incidentDescription?.toLowerCase().includes(term) ||
        r.misconductType?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (filters.status) {
      if (filters.status === 'open') {
        filtered = filtered.filter(r => ['received', 'assessing', 'investigating'].includes(r.status));
      } else {
        filtered = filtered.filter(r => r.status === filters.status);
      }
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(r => r.misconductCategory === filters.category);
    }

    // Source filter
    if (filters.source) {
      filtered = filtered.filter(r => r.reportSource === filters.source);
    }

    // Date filters
    if (filters.dateFrom) {
      filtered = filtered.filter(r => new Date(r.reportDate) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(r => new Date(r.reportDate) <= new Date(filters.dateTo));
    }

    setFilteredReports(filtered);
  };

  const handleDelete = async () => {
    if (!selectedReport) return;
    try {
      await misconductReportsDB.delete(selectedReport.id);
      setReports(reports.filter(r => r.id !== selectedReport.id));
      setShowDeleteModal(false);
      setSelectedReport(null);
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  const getCategoryBadge = (category) => {
    const styles = {
      minor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      misconduct: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      serious: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      gross: 'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-300'
    };
    const labels = {
      minor: 'Minor',
      misconduct: 'Misconduct',
      serious: 'Serious',
      gross: 'Gross'
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${styles[category] || 'bg-gray-100 text-gray-800'}`}>
        {labels[category] || category}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      received: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      assessing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      investigating: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      action_taken: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      dismissed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    };
    const icons = {
      received: Clock,
      assessing: Search,
      investigating: Search,
      action_taken: CheckCircle,
      resolved: CheckCircle,
      dismissed: XCircle,
      closed: CheckCircle
    };
    const Icon = icons[status] || Clock;
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        <Icon className="w-3 h-3" />
        <span>{status?.replace('_', ' ')}</span>
      </span>
    );
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      category: '',
      source: '',
      dateFrom: '',
      dateTo: ''
    });
    setSearchTerm('');
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Misconduct Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredReports.length} of {reports.length} reports
          </p>
        </div>
        <button
          onClick={() => navigate('/disciplinary/reports/new')}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Report Misconduct</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by report number, employee, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center space-x-2">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-3 py-2 border rounded-lg transition-colors ${showFilters ? 'border-primary-500 text-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {(searchTerm || filters.status || filters.category || filters.source || filters.dateFrom || filters.dateTo) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source</label>
              <select
                value={filters.source}
                onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {sourceOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Reports List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No reports found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || filters.status || filters.category ? 'Try adjusting your filters' : 'No misconduct reports have been filed yet'}
            </p>
            <button
              onClick={() => navigate('/disciplinary/reports/new')}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>File New Report</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Report</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Accused Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{report.reportNumber}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{report.misconductType?.replace('_', ' ')}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{report.accusedEmployeeName || 'Unknown'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{report.accusedDepartment || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getCategoryBadge(report.misconductCategory)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(report.reportDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/disciplinary/reports/${report.id}`)}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/disciplinary/reports/${report.id}/edit`)}
                          className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedReport(report);
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 text-red-600 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Delete Report</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete report <span className="font-semibold">{selectedReport?.reportNumber}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedReport(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisconductReports;
