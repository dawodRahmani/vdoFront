import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, BadgeDollarSign, TrendingUp } from 'lucide-react';
import Modal from '../../components/Modal';
import { projectBudgetDB, projectDB, budgetCategoryDB } from '../../services/db/indexedDB';

const ProjectBudgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [formData, setFormData] = useState({
    projectId: '',
    budgetCategoryId: '',
    fiscalYear: new Date().getFullYear(),
    allocatedAmount: '',
    remarks: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadBudgets();
  }, [selectedProject]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [budgetsData, projectsData, categoriesData] = await Promise.all([
        projectBudgetDB.getAll(),
        projectDB.getAll(),
        budgetCategoryDB.getAll({ isActive: true }),
      ]);
      setBudgets(budgetsData);
      setProjects(projectsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBudgets = async () => {
    try {
      const data = await projectBudgetDB.getAll({ projectId: selectedProject || undefined });
      setBudgets(data);
    } catch (error) {
      console.error('Error loading budgets:', error);
    }
  };

  const handleOpenModal = (budget = null) => {
    if (budget) {
      setSelectedBudget(budget);
      setFormData({
        projectId: budget.projectId || '',
        budgetCategoryId: budget.budgetCategoryId || '',
        fiscalYear: budget.fiscalYear || new Date().getFullYear(),
        allocatedAmount: budget.allocatedAmount || '',
        remarks: budget.remarks || '',
      });
    } else {
      setFormData({
        projectId: selectedProject || '',
        budgetCategoryId: '',
        fiscalYear: new Date().getFullYear(),
        allocatedAmount: '',
        remarks: '',
      });
      setSelectedBudget(null);
    }
    setShowModal(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.projectId) newErrors.projectId = 'Project is required';
    if (!formData.budgetCategoryId) newErrors.budgetCategoryId = 'Category is required';
    if (!formData.allocatedAmount) newErrors.allocatedAmount = 'Amount is required';
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
        budgetCategoryId: Number(formData.budgetCategoryId),
        allocatedAmount: Number(formData.allocatedAmount),
      };

      if (selectedBudget) {
        await projectBudgetDB.update(selectedBudget.id, dataToSave);
      } else {
        await projectBudgetDB.create(dataToSave);
      }
      setShowModal(false);
      loadBudgets();
    } catch (error) {
      console.error('Error saving budget:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this budget line?')) {
      await projectBudgetDB.delete(id);
      loadBudgets();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const getProjectName = (id) => projects.find(p => p.id === id)?.projectCode || 'Unknown';
  const getCategoryName = (id) => categories.find(c => c.id === id)?.categoryName || 'Unknown';

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US').format(amount);

  const filteredBudgets = selectedProject
    ? budgets.filter(b => b.projectId === Number(selectedProject))
    : budgets;

  const totalBudget = filteredBudgets.reduce((sum, b) => sum + (b.allocatedAmount || 0), 0);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Budgets</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage budget allocations by project and category</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.projectCode} - {p.projectName}</option>)}
        </select>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
          <Plus className="h-5 w-5" />Add Budget Line
        </button>
      </div>

      {totalBudget > 0 && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Total Allocated Budget</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalBudget)} AFN</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredBudgets.length === 0 ? (
        <div className="text-center py-12">
          <BadgeDollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No budget allocations</h3>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Allocated</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredBudgets.map((budget) => (
                <tr key={budget.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{getProjectName(budget.projectId)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{getCategoryName(budget.budgetCategoryId)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{budget.fiscalYear}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white text-right">
                    {formatCurrency(budget.allocatedAmount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleOpenModal(budget)} className="p-1 text-gray-500 hover:text-blue-500">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(budget.id)} className="p-1 text-gray-500 hover:text-red-500 ml-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedBudget ? 'Edit Budget' : 'Add Budget Line'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project <span className="text-red-500">*</span></label>
            <select name="projectId" value={formData.projectId} onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 ${errors.projectId ? 'border-red-500' : 'border-gray-300'}`}>
              <option value="">Select Project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.projectCode} - {p.projectName}</option>)}
            </select>
            {errors.projectId && <p className="text-red-500 text-sm mt-1">{errors.projectId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category <span className="text-red-500">*</span></label>
            <select name="budgetCategoryId" value={formData.budgetCategoryId} onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 ${errors.budgetCategoryId ? 'border-red-500' : 'border-gray-300'}`}>
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.categoryCode} - {c.categoryName}</option>)}
            </select>
            {errors.budgetCategoryId && <p className="text-red-500 text-sm mt-1">{errors.budgetCategoryId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fiscal Year</label>
              <input type="number" name="fiscalYear" value={formData.fiscalYear} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Allocated Amount <span className="text-red-500">*</span></label>
              <input type="number" name="allocatedAmount" value={formData.allocatedAmount} onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 ${errors.allocatedAmount ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.allocatedAmount && <p className="text-red-500 text-sm mt-1">{errors.allocatedAmount}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remarks</label>
            <textarea name="remarks" value={formData.remarks} onChange={handleInputChange} rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-500 text-white rounded-lg disabled:opacity-50">
              {saving ? 'Saving...' : selectedBudget ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectBudgets;
