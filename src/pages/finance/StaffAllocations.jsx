import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, UsersRound } from 'lucide-react';
import Modal from '../../components/Modal';
import { staffSalaryAllocationDB, projectDB, employeeDB } from '../../services/db/indexedDB';

const StaffAllocations = () => {
  const [allocations, setAllocations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    projectId: '',
    allocationMonth: '',
    allocationPercentage: '',
    allocatedAmount: '',
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
      const [allocationsData, projectsData, employeesData] = await Promise.all([
        staffSalaryAllocationDB.getAll({ allocationMonth: selectedMonth || undefined }),
        projectDB.getAll({ status: 'ongoing' }),
        employeeDB.getAll(),
      ]);
      setAllocations(allocationsData);
      setProjects(projectsData);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (allocation = null) => {
    if (allocation) {
      setSelectedAllocation(allocation);
      setFormData({
        employeeId: allocation.employeeId || '',
        projectId: allocation.projectId || '',
        allocationMonth: allocation.allocationMonth || '',
        allocationPercentage: allocation.allocationPercentage || '',
        allocatedAmount: allocation.allocatedAmount || '',
        remarks: allocation.remarks || '',
      });
    } else {
      setFormData({
        employeeId: '',
        projectId: '',
        allocationMonth: new Date().toISOString().slice(0, 7),
        allocationPercentage: '',
        allocatedAmount: '',
        remarks: '',
      });
      setSelectedAllocation(null);
    }
    setShowModal(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.employeeId) newErrors.employeeId = 'Employee is required';
    if (!formData.projectId) newErrors.projectId = 'Project is required';
    if (!formData.allocationMonth) newErrors.allocationMonth = 'Month is required';
    if (!formData.allocationPercentage) newErrors.allocationPercentage = 'Percentage is required';
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
        employeeId: Number(formData.employeeId),
        projectId: Number(formData.projectId),
        allocationPercentage: Number(formData.allocationPercentage),
        allocatedAmount: Number(formData.allocatedAmount) || 0,
      };

      if (selectedAllocation) {
        await staffSalaryAllocationDB.update(selectedAllocation.id, dataToSave);
      } else {
        await staffSalaryAllocationDB.create(dataToSave);
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving allocation:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this allocation?')) {
      await staffSalaryAllocationDB.delete(id);
      loadData();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const getEmployeeName = (id) => {
    const emp = employees.find(e => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
  };

  const getProjectName = (id) => projects.find(p => p.id === id)?.projectCode || 'Unknown';

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Salary Allocations</h1>
        <p className="text-gray-600 dark:text-gray-400">Allocate staff salaries across projects</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" />
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
          <Plus className="h-5 w-5" />Add Allocation
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : allocations.length === 0 ? (
        <div className="text-center py-12">
          <UsersRound className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No allocations found</h3>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">%</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {allocations.map((alloc) => (
                <tr key={alloc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{getEmployeeName(alloc.employeeId)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{getProjectName(alloc.projectId)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{alloc.allocationMonth}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-right">{alloc.allocationPercentage}%</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{alloc.allocatedAmount?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleOpenModal(alloc)} className="p-1 text-gray-500 hover:text-blue-500">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(alloc.id)} className="p-1 text-gray-500 hover:text-red-500 ml-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedAllocation ? 'Edit Allocation' : 'Add Allocation'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Employee <span className="text-red-500">*</span></label>
            <select name="employeeId" value={formData.employeeId} onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg ${errors.employeeId ? 'border-red-500' : 'border-gray-300'}`}>
              <option value="">Select</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Project <span className="text-red-500">*</span></label>
            <select name="projectId" value={formData.projectId} onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg ${errors.projectId ? 'border-red-500' : 'border-gray-300'}`}>
              <option value="">Select</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.projectCode}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Month <span className="text-red-500">*</span></label>
              <input type="month" name="allocationMonth" value={formData.allocationMonth} onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.allocationMonth ? 'border-red-500' : 'border-gray-300'}`} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Percentage <span className="text-red-500">*</span></label>
              <input type="number" name="allocationPercentage" value={formData.allocationPercentage} onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.allocationPercentage ? 'border-red-500' : 'border-gray-300'}`} min="0" max="100" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input type="number" name="allocatedAmount" value={formData.allocatedAmount} onChange={handleInputChange}
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

export default StaffAllocations;
