import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FolderOpen, Calendar } from 'lucide-react';
import Modal from '../../components/Modal';
import { complianceProjectDB } from '../../services/db/indexedDB';

const ComplianceProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [formData, setFormData] = useState({
    projectName: '',
    projectCode: '',
    donorName: '',
    startDate: '',
    endDate: '',
    totalBudget: '',
    currency: 'USD',
    customCurrency: '',
    status: 'ongoing',
    description: '',
    targetBeneficiaries: '',
    location: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Afghanistan provinces (34 provinces)
  const afghanistanProvinces = [
    'Badakhshan', 'Badghis', 'Baghlan', 'Balkh', 'Bamyan', 'Daykundi', 'Farah',
    'Faryab', 'Ghazni', 'Ghor', 'Helmand', 'Herat', 'Jowzjan', 'Kabul',
    'Kandahar', 'Kapisa', 'Khost', 'Kunar', 'Kunduz', 'Laghman', 'Logar',
    'Nangarhar', 'Nimroz', 'Nuristan', 'Paktia', 'Paktika', 'Panjshir',
    'Parwan', 'Samangan', 'Sar-e Pol', 'Takhar', 'Uruzgan', 'Wardak', 'Zabul'
  ];

  // Comprehensive currency list
  const currencies = [
    { code: 'AFN', name: 'Afghan Afghani' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'PKR', name: 'Pakistani Rupee' },
    { code: 'IRR', name: 'Iranian Rial' },
    { code: 'TRY', name: 'Turkish Lira' },
    { code: 'SAR', name: 'Saudi Riyal' },
    { code: 'AED', name: 'UAE Dirham' },
    { code: 'QAR', name: 'Qatari Riyal' },
    { code: 'KWD', name: 'Kuwaiti Dinar' },
    { code: 'SEK', name: 'Swedish Krona' },
    { code: 'NOK', name: 'Norwegian Krone' },
    { code: 'DKK', name: 'Danish Krone' },
    { code: 'OTHER', name: 'Other' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await complianceProjectDB.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (project = null) => {
    if (project) {
      setSelectedProject(project);
      // Check if the currency is a custom one (not in the predefined list)
      const isCustomCurrency = project.currency && !currencies.find(c => c.code === project.currency);
      setFormData({
        projectName: project.projectName || '',
        projectCode: project.projectCode || '',
        donorName: project.donorName || '',
        startDate: project.startDate || '',
        endDate: project.endDate || '',
        totalBudget: project.totalBudget || '',
        currency: isCustomCurrency ? 'OTHER' : (project.currency || 'USD'),
        customCurrency: isCustomCurrency ? project.currency : '',
        status: project.status || 'ongoing',
        description: project.description || '',
        targetBeneficiaries: project.targetBeneficiaries || '',
        location: project.location || '',
      });
    } else {
      setFormData({
        projectName: '',
        projectCode: '',
        donorName: '',
        startDate: '',
        endDate: '',
        totalBudget: '',
        currency: 'USD',
        customCurrency: '',
        status: 'ongoing',
        description: '',
        targetBeneficiaries: '',
        location: '',
      });
      setSelectedProject(null);
    }
    setErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.projectName.trim()) newErrors.projectName = 'Project name is required';
    if (!formData.projectCode.trim()) newErrors.projectCode = 'Project code is required';
    if (!formData.donorName.trim()) newErrors.donorName = 'Donor name is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (formData.currency === 'OTHER' && !formData.customCurrency.trim()) {
      newErrors.customCurrency = 'Please specify the currency name';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      const dataToSave = {
        ...formData,
        totalBudget: Number(formData.totalBudget) || 0,
        // Use custom currency if 'OTHER' is selected, otherwise use selected currency
        currency: formData.currency === 'OTHER' ? formData.customCurrency : formData.currency,
      };
      // Remove customCurrency field from saved data
      delete dataToSave.customCurrency;

      if (selectedProject) {
        await complianceProjectDB.update(selectedProject.id, dataToSave);
      } else {
        await complianceProjectDB.create(dataToSave);
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this project?')) {
      await complianceProjectDB.delete(id);
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
      case 'ongoing': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'suspended': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'canceled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'amended': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Init Project</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage compliance project initialization</p>
      </div>

      <div className="mb-6 flex justify-end">
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
          <Plus className="h-5 w-5" />Add Project
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects found</h3>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Project Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Project Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Donor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Beneficiaries</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Duration</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Budget</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{project.projectCode}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{project.projectName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{project.donorName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{project.location || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{project.targetBeneficiaries || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {project.startDate} - {project.endDate}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white text-right">
                      {project.totalBudget?.toLocaleString()} {project.currency}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleOpenModal(project)} className="p-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(project.id)} className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 ml-1">
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedProject ? 'Edit Project' : 'Add Project'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Project Code <span className="text-red-500">*</span></label>
              <input type="text" name="projectCode" value={formData.projectCode} onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.projectCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Project Name <span className="text-red-500">*</span></label>
              <input type="text" name="projectName" value={formData.projectName} onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.projectName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Donor Name <span className="text-red-500">*</span></label>
            <input type="text" name="donorName" value={formData.donorName} onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.donorName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Location</label>
              <select name="location" value={formData.location} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">Select Province</option>
                {afghanistanProvinces.map((province) => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Target Beneficiaries</label>
              <input type="text" name="targetBeneficiaries" value={formData.targetBeneficiaries} onChange={handleInputChange}
                placeholder="e.g., Women, Children, Refugees"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Start Date <span className="text-red-500">*</span></label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.startDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">End Date <span className="text-red-500">*</span></label>
              <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.endDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Total Budget</label>
              <input type="number" name="totalBudget" value={formData.totalBudget} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Currency</label>
              <select name="currency" value={formData.currency} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                {currencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>{curr.code} - {curr.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="suspended">Suspended</option>
                <option value="canceled">Canceled</option>
                <option value="amended">Amended</option>
              </select>
            </div>
          </div>
          {formData.currency === 'OTHER' && (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">
                Custom Currency Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="customCurrency"
                value={formData.customCurrency}
                onChange={handleInputChange}
                placeholder="Enter currency code (e.g., BTC, XYZ)"
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.customCurrency ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              />
              {errors.customCurrency && (
                <p className="mt-1 text-sm text-red-500">{errors.customCurrency}</p>
              )}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-500 text-white rounded-lg disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ComplianceProjects;
