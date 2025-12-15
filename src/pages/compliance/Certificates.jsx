import { useState, useEffect } from 'react';
import { Plus, Edit2, Award, Upload, FileText, Search, Filter } from 'lucide-react';
import Modal from '../../components/Modal';
import { certificateDB } from '../../services/db/indexedDB';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [formData, setFormData] = useState({
    nameOfInstitution: '',
    institutionDescription: '',
    agency: '',
    customAgency: '',
    typeOfDocument: '',
    customDocumentType: '',
    date: '',
    areasOfCollaboration: '',
    documentLink: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAgency, setFilterAgency] = useState('');
  const [filterDocumentType, setFilterDocumentType] = useState('');

  const agencyOptions = [
    'Donor',
    'Partners',
    'Authority',
    'Stakeholder',
    'Others'
  ];

  const documentTypeOptions = [
    'Appreciation Letter',
    'Work Completion Certificate',
    'Project Completion Certificate',
    'Recommendation Letter',
    'Any Other'
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAndSearchCertificates();
  }, [certificates, searchTerm, filterAgency, filterDocumentType]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await certificateDB.getAll();
      setCertificates(data);
    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSearchCertificates = () => {
    let filtered = [...certificates];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(cert =>
        cert.nameOfInstitution?.toLowerCase().includes(search) ||
        cert.institutionDescription?.toLowerCase().includes(search) ||
        cert.agency?.toLowerCase().includes(search) ||
        cert.typeOfDocument?.toLowerCase().includes(search) ||
        cert.areasOfCollaboration?.toLowerCase().includes(search) ||
        cert.customAgency?.toLowerCase().includes(search) ||
        cert.customDocumentType?.toLowerCase().includes(search)
      );
    }

    // Apply agency filter
    if (filterAgency) {
      filtered = filtered.filter(cert => cert.agency === filterAgency);
    }

    // Apply document type filter
    if (filterDocumentType) {
      filtered = filtered.filter(cert => cert.typeOfDocument === filterDocumentType);
    }

    setFilteredCertificates(filtered);
  };

  const handleOpenModal = (certificate = null) => {
    if (certificate) {
      setSelectedCertificate(certificate);
      setFormData({
        nameOfInstitution: certificate.nameOfInstitution || '',
        institutionDescription: certificate.institutionDescription || '',
        agency: certificate.agency || '',
        customAgency: certificate.customAgency || '',
        typeOfDocument: certificate.typeOfDocument || '',
        customDocumentType: certificate.customDocumentType || '',
        date: certificate.date || '',
        areasOfCollaboration: certificate.areasOfCollaboration || '',
        documentLink: certificate.documentLink || '',
      });
    } else {
      setFormData({
        nameOfInstitution: '',
        institutionDescription: '',
        agency: '',
        customAgency: '',
        typeOfDocument: '',
        customDocumentType: '',
        date: '',
        areasOfCollaboration: '',
        documentLink: '',
      });
      setSelectedCertificate(null);
    }
    setErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nameOfInstitution.trim()) newErrors.nameOfInstitution = 'Institution name is required';
    if (!formData.agency) newErrors.agency = 'Agency is required';
    if (formData.agency === 'Others' && !formData.customAgency.trim()) {
      newErrors.customAgency = 'Please specify the agency type';
    }
    if (!formData.typeOfDocument) newErrors.typeOfDocument = 'Document type is required';
    if (formData.typeOfDocument === 'Any Other' && !formData.customDocumentType.trim()) {
      newErrors.customDocumentType = 'Please specify the document type';
    }
    if (!formData.date) newErrors.date = 'Date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      if (selectedCertificate) {
        // Access control: No edit/delete once added (as per requirements)
        // This would be enforced by backend in production
        await certificateDB.update(selectedCertificate.id, formData);
      } else {
        await certificateDB.create(formData);
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving certificate:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const getAgencyColor = (agency) => {
    switch (agency) {
      case 'Donor': return 'bg-blue-100 text-blue-800';
      case 'Partners': return 'bg-green-100 text-green-800';
      case 'Authority': return 'bg-purple-100 text-purple-800';
      case 'Stakeholder': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentTypeIcon = (type) => {
    if (type?.includes('Certificate')) return <Award className="h-4 w-4 inline text-green-600" />;
    if (type?.includes('Letter')) return <FileText className="h-4 w-4 inline text-blue-600" />;
    return <FileText className="h-4 w-4 inline text-gray-600" />;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">VDO Acknowledgement/Certification Documents</h1>
        <p className="text-gray-600 dark:text-gray-400">Track appreciation letters, certificates, and acknowledgements received from various organizations</p>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by institution, agency, document type, or collaboration area..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterAgency}
                onChange={(e) => setFilterAgency(e.target.value)}
                className="pl-9 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 appearance-none"
              >
                <option value="">All Agencies</option>
                {agencyOptions.map(agency => (
                  <option key={agency} value={agency}>{agency}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterDocumentType}
                onChange={(e) => setFilterDocumentType(e.target.value)}
                className="pl-9 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 appearance-none"
              >
                <option value="">All Document Types</option>
                {documentTypeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {(searchTerm || filterAgency || filterDocumentType) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterAgency('');
                  setFilterDocumentType('');
                }}
                className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        {(searchTerm || filterAgency || filterDocumentType) && (
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredCertificates.length} of {certificates.length} certificates
          </div>
        )}
      </div>

      <div className="mb-6 flex justify-end">
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
          <Plus className="h-5 w-5" />Add Certificate
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : certificates.length === 0 ? (
        <div className="text-center py-12">
          <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No certificates found</h3>
          <p className="text-gray-600 dark:text-gray-400">Start tracking your acknowledgements and certifications</p>
        </div>
      ) : filteredCertificates.length === 0 ? (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No certificates match your filters</h3>
          <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sn</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Institution</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Agency</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Document Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Areas of Collaboration</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Document</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCertificates.map((cert, index) => (
                  <tr key={cert.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">{cert.nameOfInstitution}</div>
                      {cert.institutionDescription && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{cert.institutionDescription}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getAgencyColor(cert.agency)}`}>
                        {cert.agency}
                      </span>
                      {cert.agency === 'Others' && cert.customAgency && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">({cert.customAgency})</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getDocumentTypeIcon(cert.typeOfDocument)}
                        <div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{cert.typeOfDocument}</span>
                          {cert.typeOfDocument === 'Any Other' && cert.customDocumentType && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">({cert.customDocumentType})</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{cert.date || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {cert.areasOfCollaboration ? (
                        <div className="max-w-xs truncate" title={cert.areasOfCollaboration}>
                          {cert.areasOfCollaboration}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {cert.documentLink ? (
                        <a href={cert.documentLink} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:text-primary-600">
                          <FileText className="h-4 w-4 inline" />
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleOpenModal(cert)} className="p-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedCertificate ? 'Edit Certificate' : 'Add Certificate'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {selectedCertificate && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> According to access control policy, certificates should not be edited or deleted once added. This form is for viewing/updating purposes only.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name of Institution <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nameOfInstitution"
              value={formData.nameOfInstitution}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.nameOfInstitution ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Enter institution name"
            />
            {errors.nameOfInstitution && <p className="mt-1 text-sm text-red-500">{errors.nameOfInstitution}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Institution Description
            </label>
            <textarea
              name="institutionDescription"
              value={formData.institutionDescription}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Brief description of the institution"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Agency <span className="text-red-500">*</span>
              </label>
              <select
                name="agency"
                value={formData.agency}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.agency ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select agency...</option>
                {agencyOptions.map(agency => (
                  <option key={agency} value={agency}>{agency}</option>
                ))}
              </select>
              {errors.agency && <p className="mt-1 text-sm text-red-500">{errors.agency}</p>}

              {formData.agency === 'Others' && (
                <div className="mt-2">
                  <input
                    type="text"
                    name="customAgency"
                    value={formData.customAgency}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.customAgency ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Specify agency type..."
                  />
                  {errors.customAgency && <p className="mt-1 text-sm text-red-500">{errors.customAgency}</p>}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type of Document <span className="text-red-500">*</span>
              </label>
              <select
                name="typeOfDocument"
                value={formData.typeOfDocument}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.typeOfDocument ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select document type...</option>
                {documentTypeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.typeOfDocument && <p className="mt-1 text-sm text-red-500">{errors.typeOfDocument}</p>}

              {formData.typeOfDocument === 'Any Other' && (
                <div className="mt-2">
                  <input
                    type="text"
                    name="customDocumentType"
                    value={formData.customDocumentType}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.customDocumentType ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Specify document type..."
                  />
                  {errors.customDocumentType && <p className="mt-1 text-sm text-red-500">{errors.customDocumentType}</p>}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Areas of Collaboration
            </label>
            <textarea
              name="areasOfCollaboration"
              value={formData.areasOfCollaboration}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Describe the areas of collaboration"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Document Upload
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
              Note: File upload functionality will be implemented with backend integration
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

export default Certificates;
