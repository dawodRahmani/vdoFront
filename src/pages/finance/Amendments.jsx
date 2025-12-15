import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FileClock, Calendar } from 'lucide-react';
import Modal from '../../components/Modal';
import { projectAmendmentDB, projectDB } from '../../services/db/indexedDB';

const Amendments = () => {
  const [amendments, setAmendments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedAmendment, setSelectedAmendment] = useState(null);
  const [formData, setFormData] = useState({
    projectId: '',
    amendmentNumber: 1,
    amendmentDate: '',
    amendmentType: 'budget',
    description: '',
    budgetChange: '',
    timeExtension: '',
    remarks: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [amendmentsData, projectsData] = await Promise.all([
        projectAmendmentDB.getAll({ projectId: selectedProject || undefined }),
        projectDB.getAll(),
      ]);
      setAmendments(amendmentsData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async (amendment = null) => {
    if (amendment) {
      setSelectedAmendment(amendment);
      setFormData({
        projectId: amendment.projectId || '',
        amendmentNumber: amendment.amendmentNumber || 1,
        amendmentDate: amendment.amendmentDate || '',
        amendmentType: amendment.amendmentType || 'budget',
        description: amendment.description || '',
        budgetChange: amendment.budgetChange || '',
        timeExtension: amendment.timeExtension || '',
        remarks: amendment.remarks || '',
      });
    } else {
      const nextNum = selectedProject ? await projectAmendmentDB.getNextAmendmentNumber(Number(selectedProject)) : 1;
      setFormData({
        projectId: selectedProject || '',
        amendmentNumber: nextNum,
        amendmentDate: new Date().toISOString().split('T')[0],
        amendmentType: 'budget',
        description: '',
        budgetChange: '',
        timeExtension: '',
        remarks: '',
      });
      setSelectedAmendment(null);
    }
    setShowModal(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.projectId) newErrors.projectId = 'Project is required';
    if (!formData.amendmentDate) newErrors.amendmentDate = 'Date is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
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
        projectId: Number(formData.projectId),
        budgetChange: formData.budgetChange ? Number(formData.budgetChange) : 0,
        timeExtension: formData.timeExtension ? Number(formData.timeExtension) : 0,
      };

      if (selectedAmendment) {
        await projectAmendmentDB.update(selectedAmendment.id, dataToSave);
      } else {
        await projectAmendmentDB.create(dataToSave);
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving amendment:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this amendment?')) {
      await projectAmendmentDB.delete(id);
      loadData();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const getProjectName = (id) => projects.find(p => p.id === id)?.projectCode || 'Unknown';

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    const prefix = amount > 0 ? '+' : '';
    return prefix + new Intl.NumberFormat('en-US').format(amount);
  };

  const filteredAmendments = selectedProject
    ? amendments.filter(a => a.projectId === Number(selectedProject))
    : amendments;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Amendments</h1>
        <p className="text-gray-600 dark:text-gray-400">Track project budget and timeline amendments</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.projectCode} - {p.projectName}</option>)}
        </select>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
          <Plus className="h-5 w-5" />Add Amendment
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredAmendments.length === 0 ? (
        <div className="text-center py-12">
          <FileClock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No amendments found</h3>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amendment #</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Budget Change</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Days</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAmendments.map((amendment) => (
                <tr key={amendment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{getProjectName(amendment.projectId)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">#{amendment.amendmentNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{amendment.amendmentDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{amendment.amendmentType}</td>
                  <td className={`px-4 py-3 text-sm font-medium text-right ${amendment.budgetChange > 0 ? 'text-green-600' : amendment.budgetChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {formatCurrency(amendment.budgetChange)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-right">
                    {amendment.timeExtension ? `+${amendment.timeExtension}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleOpenModal(amendment)} className="p-1 text-gray-500 hover:text-blue-500">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(amendment.id)} className="p-1 text-gray-500 hover:text-red-500 ml-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedAmendment ? 'Edit Amendment' : 'Add Amendment'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Project <span className="text-red-500">*</span></label>
              <select name="projectId" value={formData.projectId} onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.projectId ? 'border-red-500' : 'border-gray-300'}`}>
                <option value="">Select</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.projectCode}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amendment #</label>
              <input type="number" name="amendmentNumber" value={formData.amendmentNumber} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="1" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date <span className="text-red-500">*</span></label>
              <input type="date" name="amendmentDate" value={formData.amendmentDate} onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.amendmentDate ? 'border-red-500' : 'border-gray-300'}`} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Amendment Type</label>
            <select name="amendmentType" value={formData.amendmentType} onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="budget">Budget Change</option>
              <option value="time">Time Extension</option>
              <option value="scope">Scope Change</option>
              <option value="combined">Combined</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description <span className="text-red-500">*</span></label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={2}
              className={`w-full px-3 py-2 border rounded-lg ${errors.description ? 'border-red-500' : 'border-gray-300'}`} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Budget Change (AFN)</label>
              <input type="number" name="budgetChange" value={formData.budgetChange} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g., 50000 or -10000" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Time Extension (days)</label>
              <input type="number" name="timeExtension" value={formData.timeExtension} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg" min="0" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Remarks</label>
            <textarea name="remarks" value={formData.remarks} onChange={handleInputChange} rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-500 text-white rounded-lg disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Amendments;
