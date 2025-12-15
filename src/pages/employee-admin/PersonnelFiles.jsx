import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Folder,
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Briefcase,
  CreditCard,
  Award,
  Calendar,
  Shield,
  LogOut,
  AlertTriangle,
  RefreshCw,
  Plus,
  FolderOpen,
  File
} from 'lucide-react';

const FILE_SECTIONS = {
  recruitment: { label: 'Recruitment & Selection', icon: User, color: 'bg-blue-500' },
  employment: { label: 'Employment Documentation', icon: Briefcase, color: 'bg-green-500' },
  identity: { label: 'Identity & Legal Documents', icon: Shield, color: 'bg-purple-500' },
  payroll: { label: 'Payroll & Benefits', icon: CreditCard, color: 'bg-yellow-500' },
  performance: { label: 'Performance & Development', icon: Award, color: 'bg-indigo-500' },
  leave: { label: 'Leave & Attendance', icon: Calendar, color: 'bg-pink-500' },
  disciplinary: { label: 'Disciplinary & Grievances', icon: AlertTriangle, color: 'bg-red-500' },
  separation: { label: 'Separation & Exit', icon: LogOut, color: 'bg-gray-500' }
};

const PersonnelFiles = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [activeSection, setActiveSection] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    section: 'employment',
    document_type: '',
    document_name: '',
    document_date: '',
    is_confidential: false,
    file: null
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Simulated data
      setEmployee({
        id: 1,
        employee_code: 'VDO-EMP-0001',
        full_name: 'Ahmad Shah Ahmadi',
        position: 'Program Manager',
        department: 'Programs',
        personnel_file_number: 'PF-2020-001',
        file_status: 'active',
        last_audit_date: '2024-01-10'
      });

      setDocuments([
        { id: 1, section: 'recruitment', document_type: 'cv', document_name: 'CV - Ahmad Shah Ahmadi.pdf', document_date: '2020-03-01', file_size: 245000, is_verified: true, is_confidential: false, uploaded_by: 'HR Admin', created_at: '2020-03-10' },
        { id: 2, section: 'recruitment', document_type: 'interview_form', document_name: 'Interview Assessment.pdf', document_date: '2020-03-05', file_size: 125000, is_verified: true, is_confidential: false, uploaded_by: 'HR Admin', created_at: '2020-03-10' },
        { id: 3, section: 'employment', document_type: 'contract', document_name: 'Employment Contract.pdf', document_date: '2020-03-15', file_size: 350000, is_verified: true, is_confidential: false, uploaded_by: 'HR Manager', created_at: '2020-03-15' },
        { id: 4, section: 'employment', document_type: 'offer_letter', document_name: 'Offer Letter.pdf', document_date: '2020-03-10', file_size: 180000, is_verified: true, is_confidential: false, uploaded_by: 'HR Manager', created_at: '2020-03-10' },
        { id: 5, section: 'identity', document_type: 'tazkira', document_name: 'Tazkira Copy.pdf', document_date: '2020-03-15', file_size: 520000, is_verified: true, is_confidential: false, uploaded_by: 'HR Admin', created_at: '2020-03-15' },
        { id: 6, section: 'identity', document_type: 'education', document_name: 'MBA Certificate.pdf', document_date: '2015-06-15', file_size: 680000, is_verified: true, is_confidential: false, uploaded_by: 'HR Admin', created_at: '2020-03-15' },
        { id: 7, section: 'payroll', document_type: 'bank_details', document_name: 'Bank Account Form.pdf', document_date: '2020-03-15', file_size: 95000, is_verified: true, is_confidential: true, uploaded_by: 'Finance', created_at: '2020-03-16' },
        { id: 8, section: 'performance', document_type: 'appraisal', document_name: 'Annual Appraisal 2023.pdf', document_date: '2024-01-05', file_size: 420000, is_verified: false, is_confidential: true, uploaded_by: 'HR Manager', created_at: '2024-01-10' },
        { id: 9, section: 'employment', document_type: 'nda', document_name: 'Signed NDA.pdf', document_date: '2020-03-15', file_size: 150000, is_verified: true, is_confidential: false, uploaded_by: 'HR Admin', created_at: '2020-03-15' },
        { id: 10, section: 'employment', document_type: 'code_of_conduct', document_name: 'Code of Conduct Acknowledgement.pdf', document_date: '2024-01-15', file_size: 85000, is_verified: true, is_confidential: false, uploaded_by: 'HR Admin', created_at: '2024-01-15' }
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : '-';

  const handleUpload = async () => {
    console.log('Uploading:', uploadForm);
    setShowUploadModal(false);
    setUploadForm({
      section: 'employment',
      document_type: '',
      document_name: '',
      document_date: '',
      is_confidential: false,
      file: null
    });
  };

  const getSectionStats = () => {
    const stats = {};
    Object.keys(FILE_SECTIONS).forEach(key => {
      stats[key] = documents.filter(d => d.section === key).length;
    });
    return stats;
  };

  const sectionStats = getSectionStats();

  const filteredDocuments = documents.filter(doc => {
    const matchesSection = activeSection === 'all' || doc.section === activeSection;
    const matchesSearch = searchTerm === '' ||
      doc.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.document_type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSection && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">Employee not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(`/employee-admin/employees/${id}`)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Personnel File</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {employee.full_name} ({employee.employee_code})
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={loadData} className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <RefreshCw className="w-5 h-5" />
          </button>
          <button onClick={() => setShowUploadModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            <Upload className="w-5 h-5" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* File Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
              <Folder className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                File #{employee.personnel_file_number}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {employee.position} | {employee.department}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{documents.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Documents</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{documents.filter(d => d.is_verified).length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Verified</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Last Audit</p>
              <p className="font-medium text-gray-900 dark:text-white">{formatDate(employee.last_audit_date)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Sections</h3>
            <div className="space-y-1">
              <button
                onClick={() => setActiveSection('all')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  activeSection === 'all' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <FolderOpen className="w-4 h-4" />
                  <span>All Documents</span>
                </span>
                <span className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{documents.length}</span>
              </button>
              {Object.entries(FILE_SECTIONS).map(([key, { label, icon: Icon, color }]) => (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    activeSection === key ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{label}</span>
                  </span>
                  <span className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{sectionStats[key]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            {/* Search */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Documents */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDocuments.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No documents found</p>
                </div>
              ) : (
                filteredDocuments.map((doc) => {
                  const sectionConfig = FILE_SECTIONS[doc.section];
                  const SectionIcon = sectionConfig?.icon || FileText;
                  return (
                    <div key={doc.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${sectionConfig?.color || 'bg-gray-500'}`}>
                            <File className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-gray-900 dark:text-white">{doc.document_name}</p>
                              {doc.is_verified && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                              {doc.is_confidential && (
                                <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded">
                                  Confidential
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {sectionConfig?.label} | {formatDate(doc.document_date)} | {formatFileSize(doc.file_size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="View">
                            <Eye className="w-4 h-4 text-gray-500" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Download">
                            <Download className="w-4 h-4 text-gray-500" />
                          </button>
                          <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upload Document</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section</label>
                <select value={uploadForm.section} onChange={(e) => setUploadForm(f => ({ ...f, section: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  {Object.entries(FILE_SECTIONS).map(([value, { label }]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Document Name</label>
                <input type="text" value={uploadForm.document_name} onChange={(e) => setUploadForm(f => ({ ...f, document_name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Enter document name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Document Date</label>
                <input type="date" value={uploadForm.document_date} onChange={(e) => setUploadForm(f => ({ ...f, document_date: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="confidential" checked={uploadForm.is_confidential} onChange={(e) => setUploadForm(f => ({ ...f, is_confidential: e.target.checked }))} className="rounded border-gray-300 text-primary-600" />
                <label htmlFor="confidential" className="text-sm text-gray-700 dark:text-gray-300">Mark as confidential</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Drag and drop or click to upload</p>
                  <input type="file" className="hidden" />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                Cancel
              </button>
              <button onClick={handleUpload} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonnelFiles;
