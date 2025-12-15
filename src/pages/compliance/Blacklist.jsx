import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ShieldAlert, Upload, FileText } from 'lucide-react';
import Modal from '../../components/Modal';
import { blacklistDB } from '../../services/db/indexedDB';

const RestrictedList = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    start: '',
    endOption: 'no_expiry',
    end: '',
    reason: '',
    documentLink: '',
    access: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const categoryOptions = [
    'Staff',
    'Supplier/Vendor/Contractor',
    'Partner',
    'Visitor',
    'Participants'
  ];

  const accessOptions = [
    'Department Head',
    'HR Only',
    'Finance Only',
    'All Departments',
    'Senior Management',
    'Restricted - Confidential'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await blacklistDB.getAll();
      setEntries(data);
    } catch (error) {
      console.error('Error loading restricted list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (entry = null) => {
    if (entry) {
      setSelectedEntry(entry);
      setFormData({
        name: entry.name || '',
        description: entry.description || '',
        category: entry.category || '',
        start: entry.start || '',
        endOption: entry.endOption || 'no_expiry',
        end: entry.end || '',
        reason: entry.reason || '',
        documentLink: entry.documentLink || '',
        access: entry.access || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        start: '',
        endOption: 'no_expiry',
        end: '',
        reason: '',
        documentLink: '',
        access: '',
      });
      setSelectedEntry(null);
    }
    setErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.start) newErrors.start = 'Start date is required';
    if (!formData.reason.trim()) newErrors.reason = 'Reason is required';
    if (!formData.access) newErrors.access = 'Access level is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      if (selectedEntry) {
        await blacklistDB.update(selectedEntry.id, formData);
      } else {
        await blacklistDB.create(formData);
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this restricted list entry? This action cannot be undone.')) {
      await blacklistDB.delete(id);
      loadData();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Staff': return 'bg-red-100 text-red-800';
      case 'Supplier/Vendor/Contractor': return 'bg-orange-100 text-orange-800';
      case 'Partner': return 'bg-yellow-100 text-yellow-800';
      case 'Visitor': return 'bg-blue-100 text-blue-800';
      case 'Participants': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccessColor = (access) => {
    if (!access) return '';
    if (access.includes('Confidential')) return 'text-red-600 dark:text-red-400 font-semibold';
    if (access.includes('Senior')) return 'text-purple-600 dark:text-purple-400 font-medium';
    if (access.includes('All')) return 'text-blue-600 dark:text-blue-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getEndDisplay = (entry) => {
    if (entry.endOption === 'no_expiry') return 'No expiry';
    return entry.end || '-';
  };

  const isActive = (entry) => {
    if (entry.endOption === 'no_expiry') return true;
    if (!entry.end) return true;
    const endDate = new Date(entry.end);
    const today = new Date();
    return endDate >= today;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">VDO Restricted List</h1>
        <p className="text-gray-600 dark:text-gray-400">Track restricted individuals and entities across different categories with access control</p>
      </div>

      <div className="mb-6 flex justify-end">
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
          <Plus className="h-5 w-5" />Add Entry
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12">
          <ShieldAlert className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No restricted entries found</h3>
          <p className="text-gray-600 dark:text-gray-400">Start tracking restricted individuals and entities</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sn</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Reason</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Start</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">End</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Access</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Doc</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {entries.map((entry, index) => (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">{entry.name}</div>
                      {entry.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{entry.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(entry.category)}`}>
                        {entry.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {entry.reason ? (
                        <div className="max-w-xs truncate" title={entry.reason}>
                          {entry.reason}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{entry.start || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{getEndDisplay(entry)}</td>
                    <td className={`px-4 py-3 text-sm ${getAccessColor(entry.access)}`}>
                      {entry.access || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isActive(entry) ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Expired
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {entry.documentLink ? (
                        <a href={entry.documentLink} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:text-primary-600">
                          <FileText className="h-4 w-4 inline" />
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleOpenModal(entry)} className="p-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(entry.id)} className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 ml-1">
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedEntry ? 'Edit Restricted Entry' : 'Add Restricted Entry'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>Security Notice:</strong> This is a restricted list with access control. Ensure proper authorization before adding or modifying entries.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Name of restricted entity/person"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Details about restriction"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select category...</option>
                {categoryOptions.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="start"
                value={formData.start}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.start ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.start && <p className="mt-1 text-sm text-red-500">{errors.start}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
            <select
              name="endOption"
              value={formData.endOption}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2"
            >
              <option value="no_expiry">No expiry</option>
              <option value="date_specified">Date specified</option>
            </select>

            {formData.endOption === 'date_specified' && (
              <input
                type="date"
                name="end"
                value={formData.end}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.reason ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Reason for restriction"
            />
            {errors.reason && <p className="mt-1 text-sm text-red-500">{errors.reason}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Access Level <span className="text-red-500">*</span>
            </label>
            <select
              name="access"
              value={formData.access}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.access ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <option value="">Select access level...</option>
              {accessOptions.map(access => (
                <option key={access} value={access}>{access}</option>
              ))}
            </select>
            {errors.access && <p className="mt-1 text-sm text-red-500">{errors.access}</p>}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Defines who can view this restricted entry
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Supporting Documentation
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                name="documentLink"
                value={formData.documentLink}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://example.com/document.pdf"
              />
              <button
                type="button"
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Upload supporting documentation for this restriction
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
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
              className="px-4 py-2 bg-primary-500 text-white rounded-lg disabled:opacity-50 hover:bg-primary-600"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RestrictedList;
