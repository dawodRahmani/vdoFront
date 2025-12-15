import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
} from 'lucide-react';
import { trainingBondService, trainingService } from '../../services/db/trainingService';
import { getDB } from '../../services/db/indexedDB';
import Modal from '../../components/Modal';

const TrainingBonds = () => {
  const [bonds, setBonds] = useState([]);
  const [filteredBonds, setFilteredBonds] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    trainingId: '',
    trainingCost: '',
    currency: 'AFN',
    bondStartDate: '',
    bondEndDate: '',
    bondDurationMonths: '',
    recoveryTerms: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterStatus, bonds]);

  const loadData = async () => {
    try {
      setLoading(true);
      const db = await getDB();
      const [bondsData, trainingsData, employeesData] = await Promise.all([
        trainingBondService.getAll(),
        trainingService.getAll(),
        db.getAll('employees'),
      ]);
      setBonds(bondsData);
      setFilteredBonds(bondsData);
      setTrainings(trainingsData);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bonds];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((b) => {
        const employee = employees.find((e) => e.id === b.employeeId);
        const employeeName = employee
          ? `${employee.firstName} ${employee.lastName}`.toLowerCase()
          : '';
        return b.bondNumber?.toLowerCase().includes(term) || employeeName.includes(term);
      });
    }

    if (filterStatus) {
      filtered = filtered.filter((b) => b.status === filterStatus);
    }

    setFilteredBonds(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        employeeId: parseInt(formData.employeeId),
        trainingId: formData.trainingId ? parseInt(formData.trainingId) : null,
        trainingCost: parseFloat(formData.trainingCost),
        bondDurationMonths: parseInt(formData.bondDurationMonths),
      };

      await trainingBondService.create(data);
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error creating bond:', error);
      alert('Failed to create bond');
    }
  };

  const handleSign = async (id) => {
    if (window.confirm('Mark this bond as signed by employee?')) {
      try {
        await trainingBondService.sign(id);
        loadData();
      } catch (error) {
        console.error('Error signing bond:', error);
        alert('Failed to sign bond');
      }
    }
  };

  const handleActivate = async (id) => {
    if (window.confirm('Activate this bond?')) {
      try {
        await trainingBondService.activate(id);
        loadData();
      } catch (error) {
        console.error('Error activating bond:', error);
        alert('Failed to activate bond');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bond?')) {
      try {
        await trainingBondService.delete(id);
        loadData();
      } catch (error) {
        console.error('Error deleting bond:', error);
        alert('Failed to delete bond');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      trainingId: '',
      trainingCost: '',
      currency: 'AFN',
      bondStartDate: '',
      bondEndDate: '',
      bondDurationMonths: '',
      recoveryTerms: '',
    });
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
  };

  const getTrainingTitle = (trainingId) => {
    const training = trainings.find((t) => t.id === trainingId);
    return training ? training.title : 'External Training';
  };

  const getStatusBadge = (status) => {
    const classes = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      signed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      completed: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      breached: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      waived: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };
    return classes[status] || classes.draft;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount, currency) => {
    if (!amount) return '-';
    return `${currency} ${parseFloat(amount).toLocaleString()}`;
  };

  const calculateEndDate = (startDate, months) => {
    if (!startDate || !months) return '';
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + parseInt(months));
    return date.toISOString().split('T')[0];
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
  };

  // Stats
  const totalValue = bonds.reduce((sum, b) => sum + (parseFloat(b.trainingCost) || 0), 0);
  const activeBonds = bonds.filter((b) => b.status === 'active');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Training Bonds</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage training agreements and recovery terms
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            New Bond
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{bonds.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Bonds</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeBonds.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <DollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {totalValue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Value (AFN)</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {bonds.filter((b) => b.status === 'breached').length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Breached</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bonds..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <Filter className="h-5 w-5" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-4">
                <div className="w-48">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="signed">Signed</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="breached">Breached</option>
                    <option value="waived">Waived</option>
                  </select>
                </div>
                {filterStatus && (
                  <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-700">
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bonds Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Bond #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Training
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredBonds.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No bonds found. Click "New Bond" to create one.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredBonds.map((bond) => (
                  <tr
                    key={bond.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900 dark:text-white">
                        {bond.bondNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {getEmployeeName(bond.employeeId)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      <div className="max-w-xs truncate">
                        {bond.trainingId ? getTrainingTitle(bond.trainingId) : 'External Training'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(bond.trainingCost, bond.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      <div>{bond.bondDurationMonths} months</div>
                      <div className="text-xs">
                        {formatDate(bond.bondStartDate)} - {formatDate(bond.bondEndDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                          bond.status
                        )}`}
                      >
                        {bond.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {bond.status === 'draft' && (
                          <button
                            onClick={() => handleSign(bond.id)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Mark as Signed"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {bond.status === 'signed' && (
                          <button
                            onClick={() => handleActivate(bond.id)}
                            className="text-green-600 hover:text-green-700"
                            title="Activate"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(bond.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      {filteredBonds.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredBonds.length} of {bonds.length} bond(s)
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Training Bond">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Employee *
              </label>
              <select
                required
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Training
              </label>
              <select
                value={formData.trainingId}
                onChange={(e) => setFormData({ ...formData, trainingId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Training (Optional)</option>
                {trainings.map((training) => (
                  <option key={training.id} value={training.id}>
                    {training.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Training Cost *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.trainingCost}
                onChange={(e) => setFormData({ ...formData, trainingCost: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="AFN">AFN</option>
                <option value="USD">USD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bond Duration (Months) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.bondDurationMonths}
                onChange={(e) => {
                  const months = e.target.value;
                  setFormData({
                    ...formData,
                    bondDurationMonths: months,
                    bondEndDate: calculateEndDate(formData.bondStartDate, months),
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bond Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.bondStartDate}
                onChange={(e) => {
                  const startDate = e.target.value;
                  setFormData({
                    ...formData,
                    bondStartDate: startDate,
                    bondEndDate: calculateEndDate(startDate, formData.bondDurationMonths),
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bond End Date
              </label>
              <input
                type="date"
                value={formData.bondEndDate}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Recovery Terms
              </label>
              <textarea
                value={formData.recoveryTerms}
                onChange={(e) => setFormData({ ...formData, recoveryTerms: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Specify recovery terms if employee leaves before bond period..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Bond
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TrainingBonds;
