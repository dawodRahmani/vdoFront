import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FileText, Search, Filter, X, Calendar } from 'lucide-react';
import Modal from '../../components/Modal';
import { dueDiligenceDB, seedAllDefaults } from '../../services/db/indexedDB';

const DDTracking = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState({
    donorName: '',
    ddDeadline: '',
    officeVisitDate: '',
    ddStartDate: '',
    ddCompletionDate: '',
    status: 'in_progress',
    ddDocumentsLink: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [records, searchTerm, filterStatus, filterDateFrom, filterDateTo]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('DD Tracking: Loading data...');
      // Seed default data if needed
      await seedAllDefaults();
      console.log('DD Tracking: Seeding completed');
      const data = await dueDiligenceDB.getAll();
      console.log('DD Tracking: Loaded records:', data.length, data);
      setRecords(data);
    } catch (error) {
      console.error('DD Tracking: Error loading records:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...records];
    console.log('DD Tracking: Applying filters. Total records:', records.length);

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.donorName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log('DD Tracking: After search filter:', filtered.length);
    }

    // Status filter
    if (filterStatus) {
      filtered = filtered.filter(record => record.status === filterStatus);
      console.log('DD Tracking: After status filter:', filtered.length);
    }

    // Date range filter (using DD Deadline)
    if (filterDateFrom) {
      filtered = filtered.filter(record => record.ddDeadline >= filterDateFrom);
      console.log('DD Tracking: After date from filter:', filtered.length);
    }

    if (filterDateTo) {
      filtered = filtered.filter(record => record.ddDeadline <= filterDateTo);
      console.log('DD Tracking: After date to filter:', filtered.length);
    }

    console.log('DD Tracking: Final filtered records:', filtered.length);
    setFilteredRecords(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setShowFilters(false);
  };

  const handleOpenModal = (record = null) => {
    if (record) {
      setSelectedRecord(record);
      setFormData({
        donorName: record.donorName || '',
        ddDeadline: record.ddDeadline || '',
        officeVisitDate: record.officeVisitDate || '',
        ddStartDate: record.ddStartDate || '',
        ddCompletionDate: record.ddCompletionDate || '',
        status: record.status || 'in_progress',
        ddDocumentsLink: record.ddDocumentsLink || '',
      });
    } else {
      setFormData({
        donorName: '',
        ddDeadline: '',
        officeVisitDate: '',
        ddStartDate: '',
        ddCompletionDate: '',
        status: 'in_progress',
        ddDocumentsLink: '',
      });
      setSelectedRecord(null);
    }
    setErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.donorName.trim()) newErrors.donorName = 'Donor name is required';
    if (!formData.ddDeadline) newErrors.ddDeadline = 'DD deadline is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      if (selectedRecord) {
        await dueDiligenceDB.update(selectedRecord.id, formData);
      } else {
        await dueDiligenceDB.create(formData);
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving record:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this DD tracking record?')) {
      await dueDiligenceDB.delete(id);
      loadData();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'status_unknown': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'in_progress': return 'In Progress';
      case 'status_unknown': return 'Status Unknown';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Determine which records to display
  const hasActiveFilters = searchTerm || filterStatus || filterDateFrom || filterDateTo;
  const displayRecords = hasActiveFilters ? filteredRecords : records;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">DD Tracking (Due Diligence Tracking)</h1>
        <p className="text-gray-600 dark:text-gray-400">Track due diligence processes with donors including deadlines, office visits, and completion status</p>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by donor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            <Filter className="h-5 w-5" />
            Filters
          </button>

          {/* Add DD Record Button */}
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            <Plus className="h-5 w-5" />
            Add DD Record
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Statuses</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                  <option value="status_unknown">Status Unknown</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  DD Deadline From
                </label>
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  DD Deadline To
                </label>
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {(searchTerm || filterStatus || filterDateFrom || filterDateTo) && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Active filters:</span>
            {searchTerm && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                Search: "{searchTerm}"
              </span>
            )}
            {filterStatus && (
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                Status: {formatStatus(filterStatus)}
              </span>
            )}
            {(filterDateFrom || filterDateTo) && (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                Deadline: {filterDateFrom || '...'} to {filterDateTo || '...'}
              </span>
            )}
            <span className="text-gray-500">
              ({displayRecords.length} result{displayRecords.length !== 1 ? 's' : ''})
            </span>
          </div>
        )}
      </div>

      {/* DD Records Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : displayRecords.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No DD tracking records found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || filterStatus || filterDateFrom || filterDateTo
              ? 'Try adjusting your search or filters'
              : 'Start tracking due diligence processes with donors'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sn</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Donor Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">DD Deadline</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Office Visit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">DD Start</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">DD Completion</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {displayRecords.map((record, index) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{record.donorName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        {formatDate(record.ddDeadline)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{formatDate(record.officeVisitDate)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{formatDate(record.ddStartDate)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{formatDate(record.ddCompletionDate)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(record.status)}`}>
                        {formatStatus(record.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {record.ddDocumentsLink && (
                        <a href={record.ddDocumentsLink} target="_blank" rel="noopener noreferrer"
                           className="p-1 text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400"
                           title="View DD Documents">
                          <FileText className="h-4 w-4 inline" />
                        </a>
                      )}
                      <button
                        onClick={() => handleOpenModal(record)}
                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 ml-1"
                        title="Edit Record"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 ml-1"
                        title="Delete Record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedRecord ? 'Edit DD Record' : 'Add DD Record'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Donor Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="donorName"
              value={formData.donorName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.donorName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Enter donor organization name"
            />
            {errors.donorName && <p className="mt-1 text-sm text-red-500">{errors.donorName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                DD Deadline <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="ddDeadline"
                value={formData.ddDeadline}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.ddDeadline ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.ddDeadline && <p className="mt-1 text-sm text-red-500">{errors.ddDeadline}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Office Visit Date
              </label>
              <input
                type="date"
                name="officeVisitDate"
                value={formData.officeVisitDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                DD Start Date
              </label>
              <input
                type="date"
                name="ddStartDate"
                value={formData.ddStartDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                DD Completion Date
              </label>
              <input
                type="date"
                name="ddCompletionDate"
                value={formData.ddCompletionDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="status_unknown">Status Unknown</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Links DD Documents Submitted
            </label>
            <input
              type="url"
              name="ddDocumentsLink"
              value={formData.ddDocumentsLink}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="https://example.com/documents"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Link to document repository (e.g., Google Drive, Dropbox)</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : selectedRecord ? 'Update Record' : 'Save Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DDTracking;
