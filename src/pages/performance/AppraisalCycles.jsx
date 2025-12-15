import { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Play,
  CheckCircle,
  XCircle,
  Archive,
  Clock,
  Users
} from 'lucide-react';
import performanceService from '../../services/db/performanceService';

const AppraisalCycles = () => {
  const [cycles, setCycles] = useState([]);
  const [filteredCycles, setFilteredCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCycle, setEditingCycle] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    cycleType: 'annual',
    fiscalYear: new Date().getFullYear(),
    startDate: '',
    endDate: '',
    selfAssessmentDeadline: '',
    managerReviewDeadline: '',
    committeeReviewDeadline: '',
    finalApprovalDeadline: '',
    status: 'draft'
  });

  useEffect(() => {
    loadCycles();
  }, []);

  useEffect(() => {
    filterCycles();
  }, [cycles, searchTerm, statusFilter]);

  const loadCycles = async () => {
    try {
      setLoading(true);
      const data = await performanceService.appraisalCycles.getAll();
      const sorted = data.sort((a, b) => b.fiscalYear - a.fiscalYear);
      setCycles(sorted);
    } catch (error) {
      console.error('Error loading cycles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCycles = () => {
    let filtered = [...cycles];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.fiscalYear.toString().includes(search)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    setFilteredCycles(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      in_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      archived: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
    };
    return colors[status] || colors.draft;
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: 'Draft',
      active: 'Active',
      in_review: 'In Review',
      completed: 'Completed',
      archived: 'Archived'
    };
    return labels[status] || status;
  };

  const getCycleTypeLabel = (type) => {
    const types = {
      annual: 'Annual',
      mid_year: 'Mid-Year',
      quarterly: 'Quarterly'
    };
    return types[type] || type;
  };

  const handleAdd = () => {
    const year = new Date().getFullYear();
    setEditingCycle(null);
    setFormData({
      name: `Annual Appraisal ${year}`,
      cycleType: 'annual',
      fiscalYear: year,
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
      selfAssessmentDeadline: `${year}-01-15`,
      managerReviewDeadline: `${year}-01-31`,
      committeeReviewDeadline: `${year}-02-15`,
      finalApprovalDeadline: `${year}-02-28`,
      status: 'draft'
    });
    setShowModal(true);
  };

  const handleEdit = (cycle) => {
    setEditingCycle(cycle);
    setFormData({
      name: cycle.name || '',
      cycleType: cycle.cycleType || 'annual',
      fiscalYear: cycle.fiscalYear || new Date().getFullYear(),
      startDate: cycle.startDate || '',
      endDate: cycle.endDate || '',
      selfAssessmentDeadline: cycle.selfAssessmentDeadline || '',
      managerReviewDeadline: cycle.managerReviewDeadline || '',
      committeeReviewDeadline: cycle.committeeReviewDeadline || '',
      finalApprovalDeadline: cycle.finalApprovalDeadline || '',
      status: cycle.status || 'draft'
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingCycle) {
        await performanceService.appraisalCycles.update(editingCycle.id, formData);
      } else {
        await performanceService.appraisalCycles.create({
          ...formData,
          createdBy: 'admin'
        });
      }
      await loadCycles();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving cycle:', error);
      alert('Error saving: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this appraisal cycle?')) return;
    try {
      await performanceService.appraisalCycles.delete(id);
      await loadCycles();
    } catch (error) {
      console.error('Error deleting cycle:', error);
    }
  };

  const handleActivate = async (cycle) => {
    try {
      await performanceService.appraisalCycles.update(cycle.id, {
        ...cycle,
        status: 'active'
      });
      await loadCycles();
    } catch (error) {
      console.error('Error activating cycle:', error);
    }
  };

  const handleComplete = async (cycle) => {
    try {
      await performanceService.appraisalCycles.update(cycle.id, {
        ...cycle,
        status: 'completed'
      });
      await loadCycles();
    } catch (error) {
      console.error('Error completing cycle:', error);
    }
  };

  const handleViewDetail = (cycle) => {
    setSelectedCycle(cycle);
    setShowDetailModal(true);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appraisal Cycles</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage performance appraisal periods</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Cycle
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
                placeholder="Search cycles..."
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
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="in_review">In Review</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Cycles List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400">
                <th className="px-6 py-3 font-medium">Cycle</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Year</th>
                <th className="px-6 py-3 font-medium">Period</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {filteredCycles.map((cycle) => (
                <tr key={cycle.id} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                        <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{cycle.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getCycleTypeLabel(cycle.cycleType)}</td>
                  <td className="px-6 py-4 font-medium">{cycle.fiscalYear}</td>
                  <td className="px-6 py-4">
                    <p>{formatDate(cycle.startDate)}</p>
                    <p className="text-sm text-gray-500">to {formatDate(cycle.endDate)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cycle.status)}`}>
                      {getStatusLabel(cycle.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetail(cycle)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(cycle)}
                        className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {cycle.status === 'draft' && (
                        <button
                          onClick={() => handleActivate(cycle)}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                          title="Activate"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      {cycle.status === 'active' && (
                        <button
                          onClick={() => handleComplete(cycle)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg"
                          title="Complete"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(cycle.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCycles.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No appraisal cycles found</p>
                    <button
                      onClick={handleAdd}
                      className="mt-4 text-blue-600 hover:underline flex items-center gap-1 mx-auto"
                    >
                      <Plus className="h-4 w-4" /> Create new cycle
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 my-8">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingCycle ? 'Edit Appraisal Cycle' : 'New Appraisal Cycle'}
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
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cycle Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="e.g., Annual Appraisal 2025"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cycle Type</label>
                  <select
                    value={formData.cycleType}
                    onChange={(e) => setFormData({...formData, cycleType: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="annual">Annual</option>
                    <option value="mid_year">Mid-Year</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fiscal Year</label>
                  <input
                    type="number"
                    value={formData.fiscalYear}
                    onChange={(e) => setFormData({...formData, fiscalYear: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Deadlines</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Self Assessment</label>
                    <input
                      type="date"
                      value={formData.selfAssessmentDeadline}
                      onChange={(e) => setFormData({...formData, selfAssessmentDeadline: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Manager Review</label>
                    <input
                      type="date"
                      value={formData.managerReviewDeadline}
                      onChange={(e) => setFormData({...formData, managerReviewDeadline: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Committee Review</label>
                    <input
                      type="date"
                      value={formData.committeeReviewDeadline}
                      onChange={(e) => setFormData({...formData, committeeReviewDeadline: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Final Approval</label>
                    <input
                      type="date"
                      value={formData.finalApprovalDeadline}
                      onChange={(e) => setFormData({...formData, finalApprovalDeadline: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {editingCycle && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="in_review">In Review</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              )}
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
                {editingCycle ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedCycle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                  <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedCycle.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCycle.status)}`}>
                    {getStatusLabel(selectedCycle.status)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                  <p className="font-medium text-gray-900 dark:text-white">{getCycleTypeLabel(selectedCycle.cycleType)}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Fiscal Year</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedCycle.fiscalYear}</p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">Period</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(selectedCycle.startDate)} - {formatDate(selectedCycle.endDate)}
                </p>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                <h4 className="font-medium text-indigo-800 dark:text-indigo-300 mb-3">Deadlines</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Self Assessment</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatDate(selectedCycle.selfAssessmentDeadline)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Manager Review</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatDate(selectedCycle.managerReviewDeadline)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Committee Review</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatDate(selectedCycle.committeeReviewDeadline)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Final Approval</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatDate(selectedCycle.finalApprovalDeadline)}</span>
                  </div>
                </div>
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
                  handleEdit(selectedCycle);
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

export default AppraisalCycles;
