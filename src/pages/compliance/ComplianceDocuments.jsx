import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FolderArchive, Upload, Search, Filter, X } from 'lucide-react';
import Modal from '../../components/Modal';
import { complianceDocumentDB } from '../../services/db/indexedDB';

const ComplianceDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    uploadedFile: '',
    documentDate: '',
    status: 'active',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Categories with their required documents
  const categoryDocuments = {
    Governance: [
      'Governance Policy/Bylaws',
      'Approved Board of Directors list (certified by respective authority)',
      'Strategy Plan',
      'Board Charter (roles, mandates, and meeting minutes archive)',
      'Organizational Constitution/Statutes of Association',
      'Certificate of Registration with Ministry of Economy (scan copy - original + updated if renewed)',
      'License/renewal letters (annual or periodic, scan copies)',
      'Annual Plan',
      'Organizational Organogram (approved copy)',
    ],
    Compliance: [
      'Risk Management Policy',
      'Compliance Policy (with SOPs)',
      'Risk Management Policy (with institutionalization mechanism)',
      'Conflict of Interest Policy',
      'Anti-Fraud & Anti-Corruption Policy',
      'Counter-terrorism and Anti money laundering policy and procedures',
      'Signatory Matrix (updated version for bank, procurement, approvals)',
      'Master Compliance Register (tracking policies, renewal dates, status)',
      'Donor Reporting Requirements Matrix',
      'Partnership & Consortium Guidelines',
      'KPI Tracking Sheets for Compliance Monitoring',
      'Grant Agreements with Donors (scan copies)',
      'Compliance checklists from donors (e.g., UN, INGO partners)',
      'List of Donors (name, period, amount)',
      'List of Partners (name, address, contact person details)',
      'Recommendation letters from donors, partners, authorities',
      'CVs of Management staff (General Manager, Program Manager, Finance Manager, HR Manager)',
      'Annual Work Plan of Compliance Department',
      'Environmental/Climate & Sustainability Policy',
      'Committee ToRs (PSEA, Staff Association, Quality Assurance, Accountability & Anti-Corruption, Rapid Response, etc.)',
    ],
    Program: [
      'Safeguarding & Child Protection Policy',
      'Protection from Sexual Exploitation, Abuse and Harassment (PSEAH) Policy',
      'Whistleblowing Policy',
      'Program Policy',
      'Annual Program Reports',
      'Program Management Cycle Policy',
      'Gender Equality & Diversity Policy',
    ],
    Access: [
      'MoUs with sectoral ministries (Education, Health, Economy, Women\'s Affairs/Successor Entities)',
      'Clearance letter from regulating government authority if applicable',
    ],
    MEAL: [
      'Last Evaluation report for the organisation Program or Project',
      'MEAL Policy & Framework',
    ],
    HR: [
      'Employee Induction Pack (National Staff)',
      'Recruitment Policy & SOPs',
      'HR Policy (National Staff)',
      'HR Policy (International Staff)',
      'Code of Conduct and Ethics (with signed staff acknowledgements)',
      'Employee Induction Pack (International Staff)',
      'Performance Appraisal Tools & Guidelines',
    ],
    Procurement: [
      'Bank Guarantee & Performance Guarantee Templates (with supplier submissions)',
      'Procurement Policy (with procurement cycle, thresholds, templates)',
      'Procurement Ethics Code',
    ],
    Admin: [
      'Admin Policy',
      'Asset Evaluation Report',
    ],
    IT: [
      'IT Policy (digital security, backups, data storage)',
      'Data Protection & Privacy Policy',
    ],
    Security: [
      'Security Policy (with movement/evacuation protocols)',
    ],
    Communication: [
      'Communications & Branding Policy',
      'The Organization Profile',
      'The Organization Brochure',
    ],
    Finance: [
      'Finance Policy',
      'Annual Budget Endorsed by Board',
      'Cost Share policy',
      'Annual Tax Clearance Certificates',
      'Budgeting Guidelines (annual and project-based)',
      'Finance and Accounting Policy',
      'Cash Management SOP',
    ],
    'Internal Audit': [
      'Internal Audit Policy (with formats/templates)',
      'Annual External Audit Reports',
      'Management Letter',
    ],
    Others: [],
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [documents, searchTerm, filterCategory, filterDateFrom, filterDateTo]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await complianceDocumentDB.getAll();
      setDocuments(data);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...documents];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory) {
      filtered = filtered.filter(doc => doc.category === filterCategory);
    }

    // Date range filter
    if (filterDateFrom) {
      filtered = filtered.filter(doc => doc.documentDate >= filterDateFrom);
    }

    if (filterDateTo) {
      filtered = filtered.filter(doc => doc.documentDate <= filterDateTo);
    }

    setFilteredDocuments(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setShowFilters(false);
  };

  const handleOpenModal = (document = null) => {
    if (document) {
      setSelectedDocument(document);
      setFormData({
        category: document.category || '',
        description: document.description || '',
        uploadedFile: document.uploadedFile || '',
        documentDate: document.documentDate || '',
        status: document.status || 'active',
      });
    } else {
      setFormData({
        category: '',
        description: '',
        uploadedFile: '',
        documentDate: '',
        status: 'active',
      });
      setSelectedDocument(null);
    }
    setErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.documentDate) newErrors.documentDate = 'Document date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      if (selectedDocument) {
        await complianceDocumentDB.update(selectedDocument.id, formData);
      } else {
        await complianceDocumentDB.create(formData);
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this document entry?')) {
      await complianceDocumentDB.delete(id);
      loadData();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real implementation, you would upload the file to a server
      // For now, we'll just store the file name
      setFormData(prev => ({ ...prev, uploadedFile: file.name }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const displayDocuments = filteredDocuments.length > 0 ? filteredDocuments : documents;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Compliance Documents Tracking</h1>
        <p className="text-gray-600 dark:text-gray-400">Track organizational compliance documents across all departments</p>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by description or category..."
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

          {/* Add Document Button */}
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            <Plus className="h-5 w-5" />
            Add Document
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Categories</option>
                  {Object.keys(categoryDocuments).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date From
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
                  Date To
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
        {(searchTerm || filterCategory || filterDateFrom || filterDateTo) && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Active filters:</span>
            {searchTerm && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                Search: "{searchTerm}"
              </span>
            )}
            {filterCategory && (
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                Category: {filterCategory}
              </span>
            )}
            {(filterDateFrom || filterDateTo) && (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                Date: {filterDateFrom || '...'} to {filterDateTo || '...'}
              </span>
            )}
            <span className="text-gray-500">
              ({displayDocuments.length} result{displayDocuments.length !== 1 ? 's' : ''})
            </span>
          </div>
        )}
      </div>

      {/* Documents Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : displayDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FolderArchive className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No documents found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || filterCategory || filterDateFrom || filterDateTo
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first compliance document'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sn</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category/Dept</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Document</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {displayDocuments.map((doc, index) => (
                  <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{doc.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-md truncate">
                      {doc.description}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {doc.uploadedFile ? (
                        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          <Upload className="h-4 w-4" />
                          <span className="truncate max-w-[150px]">{doc.uploadedFile}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">No file</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {formatDate(doc.documentDate)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleOpenModal(doc)}
                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 ml-1"
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
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedDocument ? 'Edit Document' : 'Add Document'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">
                Category/Department <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select Category</option>
                {Object.keys(categoryDocuments).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-500">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">
                Document Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="documentDate"
                value={formData.documentDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.documentDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.documentDate && (
                <p className="mt-1 text-sm text-red-500">{errors.documentDate}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            {formData.category && formData.category !== 'Others' ? (
              <select
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select Document</option>
                {categoryDocuments[formData.category]?.map((doc, idx) => (
                  <option key={idx} value={doc}>{doc}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter document description"
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
            )}
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">
              Upload Document
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            {formData.uploadedFile && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Upload className="h-4 w-4" />
                Current file: {formData.uploadedFile}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="pending">Pending</option>
            </select>
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
              {saving ? 'Saving...' : selectedDocument ? 'Update Document' : 'Save Document'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ComplianceDocuments;
