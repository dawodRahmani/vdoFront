import { useState, useEffect } from 'react';
import {
  Calculator,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import payrollService from '../../services/db/payrollService';

const SalaryStructures = () => {
  const [structures, setStructures] = useState([]);
  const [filteredStructures, setFilteredStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStructure, setSelectedStructure] = useState(null);

  const [formData, setFormData] = useState({
    gradeName: '',
    gradeCode: '',
    basicSalary: 0,
    transportAllowance: 0,
    lunchAllowance: 0,
    mahramAllowance: 0,
    topUpAllowance: 0,
    overtimeRate: 1.5,
    isActive: true,
    description: ''
  });

  useEffect(() => {
    loadStructures();
  }, []);

  useEffect(() => {
    filterStructures();
  }, [structures, searchTerm, statusFilter]);

  const loadStructures = async () => {
    try {
      setLoading(true);
      const data = await payrollService.salaryStructures.getAll();
      setStructures(data);
    } catch (error) {
      console.error('Error loading structures:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStructures = () => {
    let filtered = [...structures];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.gradeName.toLowerCase().includes(search) ||
        s.gradeCode.toLowerCase().includes(search)
      );
    }

    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(s => s.isActive === isActive);
    }

    setFilteredStructures(filtered);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AF', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0) + ' AFN';
  };

  const calculateTotalPackage = (structure) => {
    return (structure.basicSalary || 0) +
           (structure.transportAllowance || 0) +
           (structure.lunchAllowance || 0) +
           (structure.mahramAllowance || 0) +
           (structure.topUpAllowance || 0);
  };

  const handleAdd = () => {
    setEditingStructure(null);
    setFormData({
      gradeName: '',
      gradeCode: '',
      basicSalary: 0,
      transportAllowance: 0,
      lunchAllowance: 0,
      mahramAllowance: 0,
      topUpAllowance: 0,
      overtimeRate: 1.5,
      isActive: true,
      description: ''
    });
    setShowModal(true);
  };

  const handleEdit = (structure) => {
    setEditingStructure(structure);
    setFormData({
      gradeName: structure.gradeName || '',
      gradeCode: structure.gradeCode || '',
      basicSalary: structure.basicSalary || 0,
      transportAllowance: structure.transportAllowance || 0,
      lunchAllowance: structure.lunchAllowance || 0,
      mahramAllowance: structure.mahramAllowance || 0,
      topUpAllowance: structure.topUpAllowance || 0,
      overtimeRate: structure.overtimeRate || 1.5,
      isActive: structure.isActive !== false,
      description: structure.description || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingStructure) {
        await payrollService.salaryStructures.update(editingStructure.id, {
          ...formData,
          updatedAt: new Date().toISOString()
        });
      } else {
        await payrollService.salaryStructures.create({
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      await loadStructures();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving structure:', error);
      alert('Error saving: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this salary structure?')) return;
    try {
      await payrollService.salaryStructures.delete(id);
      await loadStructures();
    } catch (error) {
      console.error('Error deleting structure:', error);
    }
  };

  const handleViewDetail = (structure) => {
    setSelectedStructure(structure);
    setShowDetailModal(true);
  };

  const toggleStatus = async (structure) => {
    try {
      await payrollService.salaryStructures.update(structure.id, {
        ...structure,
        isActive: !structure.isActive,
        updatedAt: new Date().toISOString()
      });
      await loadStructures();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Salary Structures</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage salary grades and compensation packages</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Structure
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by grade name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Structures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStructures.map((structure) => (
          <div key={structure.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Calculator className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{structure.gradeName}</h3>
                  <p className="text-sm text-gray-500">{structure.gradeCode}</p>
                </div>
              </div>
              <button
                onClick={() => toggleStatus(structure)}
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  structure.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {structure.isActive ? 'Active' : 'Inactive'}
              </button>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Basic Salary</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(structure.basicSalary)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total Package</span>
                <span className="font-bold text-green-600">{formatCurrency(calculateTotalPackage(structure))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Overtime Rate</span>
                <span className="font-medium text-gray-900 dark:text-white">{structure.overtimeRate}x</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
              <button
                onClick={() => handleViewDetail(structure)}
                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleEdit(structure)}
                className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg"
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(structure.id)}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredStructures.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
            <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No salary structures found</p>
            <button
              onClick={handleAdd}
              className="mt-4 text-blue-600 hover:underline flex items-center gap-1 mx-auto"
            >
              <Plus className="h-4 w-4" /> Add new structure
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 my-8">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingStructure ? 'Edit Salary Structure' : 'Add Salary Structure'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grade Name</label>
                  <input
                    type="text"
                    value={formData.gradeName}
                    onChange={(e) => setFormData({...formData, gradeName: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="e.g., Grade A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grade Code</label>
                  <input
                    type="text"
                    value={formData.gradeCode}
                    onChange={(e) => setFormData({...formData, gradeCode: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="e.g., GR-A"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={2}
                  placeholder="Description of this grade..."
                />
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Compensation Components</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Basic Salary (AFN)</label>
                    <input
                      type="number"
                      value={formData.basicSalary}
                      onChange={(e) => setFormData({...formData, basicSalary: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Transport Allowance (AFN)</label>
                    <input
                      type="number"
                      value={formData.transportAllowance}
                      onChange={(e) => setFormData({...formData, transportAllowance: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Lunch Allowance (AFN)</label>
                    <input
                      type="number"
                      value={formData.lunchAllowance}
                      onChange={(e) => setFormData({...formData, lunchAllowance: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Mahram Allowance (AFN)</label>
                    <input
                      type="number"
                      value={formData.mahramAllowance}
                      onChange={(e) => setFormData({...formData, mahramAllowance: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Top-up Allowance (AFN)</label>
                    <input
                      type="number"
                      value={formData.topUpAllowance}
                      onChange={(e) => setFormData({...formData, topUpAllowance: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Overtime Rate Multiplier</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.overtimeRate}
                      onChange={(e) => setFormData({...formData, overtimeRate: parseFloat(e.target.value) || 1.5})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">Active (available for assignment)</label>
              </div>

              {/* Total Preview */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-blue-800 dark:text-blue-300">Total Package</span>
                  <span className="text-2xl font-bold text-blue-600">{formatCurrency(calculateTotalPackage(formData))}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingStructure ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedStructure && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Calculator className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedStructure.gradeName}</h3>
                  <p className="text-gray-500">{selectedStructure.gradeCode}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {selectedStructure.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedStructure.description}</p>
            )}

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Compensation Breakdown</h4>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Basic Salary</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedStructure.basicSalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Transport Allowance</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedStructure.transportAllowance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Lunch Allowance</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedStructure.lunchAllowance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Mahram Allowance</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedStructure.mahramAllowance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Top-up Allowance</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedStructure.topUpAllowance)}</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                  <span className="text-purple-600">Total Package</span>
                  <span className="text-purple-600">{formatCurrency(calculateTotalPackage(selectedStructure))}</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">Overtime Rate</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedStructure.overtimeRate}x hourly rate</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedStructure.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                }`}>
                  {selectedStructure.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 border rounded-lg dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleEdit(selectedStructure);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryStructures;
