import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Plus,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Eye,
  FileText,
  User,
  Calendar,
  Download,
  Printer,
} from 'lucide-react';
import { workCertificateService, separationService, initializeExitModule } from '../../services/db/exitService';

const WorkCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [separations, setSeparations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [stats, setStats] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSeparation, setSelectedSeparation] = useState(null);
  const [certificateForm, setCertificateForm] = useState({
    certificateType: 'work_certificate',
    dutiesSummary: '',
    signatoryName: '',
    signatoryTitle: '',
  });

  useEffect(() => {
    loadData();
  }, [statusFilter, typeFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      await initializeExitModule();

      const [certData, sepData, statsData] = await Promise.all([
        workCertificateService.getAll({ status: statusFilter, certificateType: typeFilter }),
        separationService.getAll(),
        workCertificateService.getStatistics(),
      ]);

      setCertificates(certData);
      setSeparations(sepData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeparationInfo = (separationId) => {
    return separations.find(s => s.id === separationId);
  };

  const handleCreateCertificate = async () => {
    if (!selectedSeparation) return;

    try {
      await workCertificateService.create({
        separationId: selectedSeparation.id,
        employeeId: selectedSeparation.employeeId,
        employeeName: selectedSeparation.employeeName,
        positionTitle: selectedSeparation.position || 'N/A',
        department: selectedSeparation.department || 'N/A',
        employmentStartDate: selectedSeparation.employmentStartDate || '',
        employmentEndDate: selectedSeparation.proposedLastDay || '',
        ...certificateForm,
      });

      setShowCreateModal(false);
      setSelectedSeparation(null);
      setCertificateForm({
        certificateType: 'work_certificate',
        dutiesSummary: '',
        signatoryName: '',
        signatoryTitle: '',
      });
      loadData();
    } catch (error) {
      console.error('Error creating certificate:', error);
    }
  };

  const handleIssueCertificate = async (id) => {
    try {
      await workCertificateService.issue(id, 'current_user');
      loadData();
    } catch (error) {
      console.error('Error issuing certificate:', error);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      draft: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', label: 'Draft', icon: Clock },
      issued: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Issued', icon: CheckCircle },
      revoked: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Revoked', icon: XCircle },
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
      work_certificate: { color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400', label: 'Work Certificate' },
      experience_letter: { color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400', label: 'Experience Letter' },
      service_certificate: { color: 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400', label: 'Service Certificate' },
    };
    const typeConfig = config[type] || { color: 'bg-gray-50 text-gray-700', label: type };
    return (
      <span className={`px-2 py-0.5 text-xs rounded ${typeConfig.color}`}>
        {typeConfig.label}
      </span>
    );
  };

  const eligibleSeparations = separations.filter(s =>
    s.eligibleForCertificate !== false &&
    ['completed', 'settlement_pending', 'clearance_pending'].includes(s.status) &&
    !certificates.find(c => c.separationId === s.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="w-7 h-7" />
            Work Certificates
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Generate and issue work certificates for exiting employees
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          Create Certificate
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Certificates</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total || 0}</p>
            </div>
            <Award className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Draft</p>
              <p className="text-2xl font-bold text-gray-600">{stats?.draft || 0}</p>
            </div>
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Issued</p>
              <p className="text-2xl font-bold text-green-600">{stats?.issued || 0}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Revoked</p>
              <p className="text-2xl font-bold text-red-600">{stats?.revoked || 0}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="issued">Issued</option>
            <option value="revoked">Revoked</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Types</option>
            <option value="work_certificate">Work Certificate</option>
            <option value="experience_letter">Experience Letter</option>
            <option value="service_certificate">Service Certificate</option>
          </select>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Certificates Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : certificates.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
          <Award className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No certificates found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Create work certificates for eligible employees
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
            Create Certificate
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map(cert => {
            const separation = getSeparationInfo(cert.separationId);
            return (
              <div
                key={cert.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {cert.certificateNumber}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {getTypeBadge(cert.certificateType)}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(cert.status)}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {cert.employeeName || separation?.employeeName || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {cert.positionTitle || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {cert.employmentStartDate ? new Date(cert.employmentStartDate).toLocaleDateString() : 'N/A'} -{' '}
                        {cert.employmentEndDate ? new Date(cert.employmentEndDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {cert.status === 'issued' && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      Issued on {new Date(cert.issueDate).toLocaleDateString()}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {cert.status === 'draft' && (
                      <button
                        onClick={() => handleIssueCertificate(cert.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Issue
                      </button>
                    )}
                    {cert.status === 'issued' && (
                      <>
                        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm">
                          <Printer className="w-4 h-4" />
                          Print
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm">
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Certificate Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Award className="w-6 h-6" />
                Create Work Certificate
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {/* Select Separation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Employee
                </label>
                <select
                  value={selectedSeparation?.id || ''}
                  onChange={(e) => {
                    const sep = separations.find(s => s.id === Number(e.target.value));
                    setSelectedSeparation(sep);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select Separation</option>
                  {eligibleSeparations.map(sep => (
                    <option key={sep.id} value={sep.id}>
                      {sep.separationNumber} - {sep.employeeName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Certificate Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Certificate Type
                </label>
                <select
                  value={certificateForm.certificateType}
                  onChange={(e) => setCertificateForm(prev => ({ ...prev, certificateType: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="work_certificate">Work Certificate</option>
                  <option value="experience_letter">Experience Letter</option>
                  <option value="service_certificate">Service Certificate</option>
                </select>
              </div>

              {/* Duties Summary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duties Summary
                </label>
                <textarea
                  value={certificateForm.dutiesSummary}
                  onChange={(e) => setCertificateForm(prev => ({ ...prev, dutiesSummary: e.target.value }))}
                  rows={4}
                  placeholder="Brief description of duties performed..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Signatory */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Signatory Name
                  </label>
                  <input
                    type="text"
                    value={certificateForm.signatoryName}
                    onChange={(e) => setCertificateForm(prev => ({ ...prev, signatoryName: e.target.value }))}
                    placeholder="Authorized signatory name"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Signatory Title
                  </label>
                  <input
                    type="text"
                    value={certificateForm.signatoryTitle}
                    onChange={(e) => setCertificateForm(prev => ({ ...prev, signatoryTitle: e.target.value }))}
                    placeholder="e.g., Executive Director"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedSeparation(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCertificate}
                disabled={!selectedSeparation}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                Create Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkCertificates;
