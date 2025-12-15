import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Search, Plus, Eye, Edit, Trash2, Calendar,
  Clock, CheckCircle, XCircle, AlertTriangle, User, Target,
  MessageSquare, ChevronDown, ChevronRight, X, RefreshCw, Play
} from 'lucide-react';
import performanceService from '../../services/db/performanceService';
import { employeeDB } from '../../services/db/indexedDB';

const PIPs = () => {
  const [pips, setPips] = useState([]);
  const [pipGoals, setPipGoals] = useState([]);
  const [pipCheckIns, setPipCheckIns] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [editingPIP, setEditingPIP] = useState(null);
  const [selectedPIP, setSelectedPIP] = useState(null);
  const [expandedPIPs, setExpandedPIPs] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pipsData, goalsData, checkInsData, employeesData] = await Promise.all([
        performanceService.performanceImprovementPlans.getAll(),
        performanceService.pipGoals.getAll(),
        performanceService.pipCheckIns.getAll(),
        employeeDB.getAll()
      ]);
      setPips(pipsData);
      setPipGoals(goalsData);
      setPipCheckIns(checkInsData);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEmployee = (id) => employees.find(e => e.id === id);
  const getPIPGoals = (pipId) => pipGoals.filter(g => g.pipId === pipId);
  const getPIPCheckIns = (pipId) => pipCheckIns.filter(c => c.pipId === pipId).sort((a, b) =>
    new Date(b.checkInDate) - new Date(a.checkInDate)
  );

  const filteredPIPs = pips.filter(pip => {
    const employee = getEmployee(pip.employeeId);
    const employeeName = employee ? `${employee.firstName} ${employee.lastName}`.toLowerCase() : '';

    const matchesSearch = employeeName.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pip.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status) => {
    const configs = {
      draft: {
        label: 'Draft',
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        icon: Edit
      },
      active: {
        label: 'Active',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        icon: Play
      },
      review: {
        label: 'Under Review',
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: Clock
      },
      extended: {
        label: 'Extended',
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
        icon: RefreshCw
      },
      success: {
        label: 'Successful',
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        icon: CheckCircle
      },
      failure: {
        label: 'Unsuccessful',
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        icon: XCircle
      }
    };
    return configs[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: Clock };
  };

  const getDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const calculateGoalProgress = (pipId) => {
    const goals = getPIPGoals(pipId);
    if (goals.length === 0) return 0;
    const completed = goals.filter(g => g.status === 'achieved').length;
    return Math.round((completed / goals.length) * 100);
  };

  // PIP Modal
  const PIPModal = () => {
    const [formData, setFormData] = useState(
      editingPIP || {
        employeeId: '',
        reason: '',
        startDate: new Date().toISOString().split('T')[0],
        targetEndDate: '',
        durationWeeks: 4,
        managerId: '',
        status: 'draft',
        notes: ''
      }
    );

    useEffect(() => {
      if (formData.startDate && formData.durationWeeks && !editingPIP) {
        const start = new Date(formData.startDate);
        start.setDate(start.getDate() + (parseInt(formData.durationWeeks) * 7));
        setFormData(prev => ({
          ...prev,
          targetEndDate: start.toISOString().split('T')[0]
        }));
      }
    }, [formData.startDate, formData.durationWeeks]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if (editingPIP?.id) {
          await performanceService.performanceImprovementPlans.update(editingPIP.id, formData);
        } else {
          await performanceService.performanceImprovementPlans.create(formData);
        }
        await loadData();
        setShowModal(false);
        setEditingPIP(null);
      } catch (error) {
        console.error('Error saving PIP:', error);
        alert('Error saving PIP');
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingPIP ? 'Edit PIP' : 'New Performance Improvement Plan'}
            </h3>
            <button
              onClick={() => { setShowModal(false); setEditingPIP(null); }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Employee
              </label>
              <select
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reason for PIP
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
                placeholder="Describe the performance issues that led to this PIP..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration (Weeks)
                </label>
                <select
                  value={formData.durationWeeks}
                  onChange={(e) => setFormData({ ...formData, durationWeeks: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={2}>2 Weeks</option>
                  <option value={4}>4 Weeks</option>
                  <option value={6}>6 Weeks</option>
                  <option value={8}>8 Weeks</option>
                  <option value={12}>12 Weeks</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target End Date
              </label>
              <input
                type="date"
                value={formData.targetEndDate}
                onChange={(e) => setFormData({ ...formData, targetEndDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Supervising Manager
              </label>
              <select
                value={formData.managerId}
                onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Manager</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => { setShowModal(false); setEditingPIP(null); }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingPIP ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Goal Modal
  const GoalModal = () => {
    const [formData, setFormData] = useState({
      pipId: selectedPIP?.id,
      description: '',
      targetMetric: '',
      currentProgress: 0,
      targetDate: '',
      status: 'pending'
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await performanceService.pipGoals.create(formData);
        await loadData();
        setShowGoalModal(false);
      } catch (error) {
        console.error('Error creating goal:', error);
        alert('Error creating goal');
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Add PIP Goal
            </h3>
            <button
              onClick={() => setShowGoalModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Goal Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
                placeholder="Describe the specific improvement goal..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Metric
              </label>
              <input
                type="text"
                value={formData.targetMetric}
                onChange={(e) => setFormData({ ...formData, targetMetric: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., 90% attendance, 5 projects completed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Date
              </label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Goal
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Check-In Modal
  const CheckInModal = () => {
    const [formData, setFormData] = useState({
      pipId: selectedPIP?.id,
      checkInDate: new Date().toISOString().split('T')[0],
      notes: '',
      progressRating: 3,
      attendees: '',
      actionItems: ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await performanceService.recordPIPCheckIn(selectedPIP.id, {
          checkInDate: formData.checkInDate,
          notes: formData.notes,
          progressRating: formData.progressRating,
          attendees: formData.attendees,
          actionItems: formData.actionItems
        });
        await loadData();
        setShowCheckInModal(false);
      } catch (error) {
        console.error('Error recording check-in:', error);
        alert('Error recording check-in');
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Record Check-In
            </h3>
            <button
              onClick={() => setShowCheckInModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Check-In Date
              </label>
              <input
                type="date"
                value={formData.checkInDate}
                onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Progress Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFormData({ ...formData, progressRating: rating })}
                    className={`w-10 h-10 rounded-lg border transition ${
                      formData.progressRating === rating
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                        : 'border-gray-300 dark:border-gray-600 text-gray-400'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                1 = No progress, 5 = Excellent progress
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Discussion points, observations..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Action Items
              </label>
              <textarea
                value={formData.actionItems}
                onChange={(e) => setFormData({ ...formData, actionItems: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Follow-up actions for next check-in..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCheckInModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Record Check-In
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const handleActivatePIP = async (pip) => {
    if (!confirm('Activate this PIP? The employee will be notified.')) return;
    try {
      await performanceService.activatePIP(pip.id);
      await loadData();
    } catch (error) {
      console.error('Error activating PIP:', error);
      alert('Error activating PIP');
    }
  };

  const handleCompletePIP = async (pip, outcome) => {
    const message = outcome === 'success'
      ? 'Mark this PIP as successful? Employee has met improvement goals.'
      : 'Mark this PIP as unsuccessful? This may lead to further action.';

    if (!confirm(message)) return;

    try {
      await performanceService.completePIP(pip.id, outcome);
      await loadData();
    } catch (error) {
      console.error('Error completing PIP:', error);
      alert('Error completing PIP');
    }
  };

  const handleExtendPIP = async (pip) => {
    const weeks = prompt('Enter extension period in weeks:', '2');
    if (!weeks) return;

    try {
      const newEndDate = new Date(pip.targetEndDate);
      newEndDate.setDate(newEndDate.getDate() + (parseInt(weeks) * 7));

      await performanceService.performanceImprovementPlans.update(pip.id, {
        targetEndDate: newEndDate.toISOString().split('T')[0],
        status: 'extended'
      });
      await loadData();
    } catch (error) {
      console.error('Error extending PIP:', error);
      alert('Error extending PIP');
    }
  };

  const updateGoalStatus = async (goalId, status) => {
    try {
      await performanceService.pipGoals.update(goalId, { status });
      await loadData();
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const togglePIP = (pipId) => {
    setExpandedPIPs(prev => ({
      ...prev,
      [pipId]: !prev[pipId]
    }));
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Improvement Plans</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage employee PIPs and track improvement progress</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setEditingPIP(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New PIP
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active', value: pips.filter(p => p.status === 'active').length, color: 'blue', icon: Play },
          { label: 'Under Review', value: pips.filter(p => p.status === 'review').length, color: 'yellow', icon: Clock },
          { label: 'Successful', value: pips.filter(p => p.status === 'success').length, color: 'green', icon: CheckCircle },
          { label: 'Unsuccessful', value: pips.filter(p => p.status === 'failure').length, color: 'red', icon: XCircle }
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30 flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="review">Under Review</option>
          <option value="extended">Extended</option>
          <option value="success">Successful</option>
          <option value="failure">Unsuccessful</option>
        </select>
      </div>

      {/* PIPs List */}
      {filteredPIPs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No PIPs Found</h3>
          <p className="text-gray-500">Create a new Performance Improvement Plan to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPIPs.map((pip) => {
            const employee = getEmployee(pip.employeeId);
            const manager = getEmployee(pip.managerId);
            const statusConfig = getStatusConfig(pip.status);
            const StatusIcon = statusConfig.icon;
            const daysRemaining = getDaysRemaining(pip.targetEndDate);
            const goals = getPIPGoals(pip.id);
            const checkIns = getPIPCheckIns(pip.id);
            const isExpanded = expandedPIPs[pip.id];
            const goalProgress = calculateGoalProgress(pip.id);

            return (
              <div
                key={pip.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
              >
                {/* Main Row */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => togglePIP(pip.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </button>
                      <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <User className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(pip.startDate).toLocaleDateString()} - {new Date(pip.targetEndDate).toLocaleDateString()}
                          {manager && ` • Manager: ${manager.firstName} ${manager.lastName}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Goal Progress */}
                      {goals.length > 0 && (
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {goalProgress}%
                          </div>
                          <p className="text-xs text-gray-500">Goals Met</p>
                        </div>
                      )}

                      {/* Days Remaining */}
                      {['active', 'extended'].includes(pip.status) && (
                        <div className="text-center">
                          <div className={`text-lg font-bold ${
                            daysRemaining < 0 ? 'text-red-600' :
                            daysRemaining <= 7 ? 'text-orange-600' : 'text-blue-600'
                          }`}>
                            {daysRemaining < 0 ? 'Overdue' : `${daysRemaining}d`}
                          </div>
                          <p className="text-xs text-gray-500">remaining</p>
                        </div>
                      )}

                      {/* Status */}
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${statusConfig.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{statusConfig.label}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {pip.status === 'draft' && (
                          <button
                            onClick={() => handleActivatePIP(pip)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                            title="Activate"
                          >
                            <Play className="w-5 h-5" />
                          </button>
                        )}
                        {['active', 'extended'].includes(pip.status) && (
                          <>
                            <button
                              onClick={() => { setSelectedPIP(pip); setShowCheckInModal(true); }}
                              className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded"
                              title="Record Check-In"
                            >
                              <MessageSquare className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleExtendPIP(pip)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded"
                              title="Extend"
                            >
                              <RefreshCw className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleCompletePIP(pip, 'success')}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded"
                              title="Mark Successful"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleCompletePIP(pip, 'failure')}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                              title="Mark Unsuccessful"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => { setEditingPIP(pip); setShowModal(true); }}
                          className="p-2 text-gray-400 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Reason Summary */}
                  {pip.reason && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 ml-20 line-clamp-2">
                      {pip.reason}
                    </p>
                  )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                    {/* Goals Section */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Improvement Goals
                        </h4>
                        {['draft', 'active'].includes(pip.status) && (
                          <button
                            onClick={() => { setSelectedPIP(pip); setShowGoalModal(true); }}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            Add Goal
                          </button>
                        )}
                      </div>
                      {goals.length === 0 ? (
                        <p className="text-sm text-gray-500">No goals defined</p>
                      ) : (
                        <div className="space-y-2">
                          {goals.map((goal) => (
                            <div
                              key={goal.id}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                            >
                              <div className="flex-1">
                                <p className="text-sm text-gray-900 dark:text-white">{goal.description}</p>
                                {goal.targetMetric && (
                                  <p className="text-xs text-gray-500 mt-1">Target: {goal.targetMetric}</p>
                                )}
                              </div>
                              <select
                                value={goal.status}
                                onChange={(e) => updateGoalStatus(goal.id, e.target.value)}
                                className={`ml-4 text-xs px-2 py-1 rounded border ${
                                  goal.status === 'achieved' ? 'bg-green-100 text-green-800 border-green-200' :
                                  goal.status === 'not_achieved' ? 'bg-red-100 text-red-800 border-red-200' :
                                  goal.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                  'bg-gray-100 text-gray-800 border-gray-200'
                                }`}
                                disabled={!['draft', 'active', 'extended'].includes(pip.status)}
                              >
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="achieved">Achieved</option>
                                <option value="not_achieved">Not Achieved</option>
                              </select>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Check-Ins Section */}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                        <MessageSquare className="w-4 h-4" />
                        Check-In History ({checkIns.length})
                      </h4>
                      {checkIns.length === 0 ? (
                        <p className="text-sm text-gray-500">No check-ins recorded</p>
                      ) : (
                        <div className="space-y-2">
                          {checkIns.slice(0, 3).map((checkIn) => (
                            <div
                              key={checkIn.id}
                              className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {new Date(checkIn.checkInDate).toLocaleDateString()}
                                </span>
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map(i => (
                                    <div
                                      key={i}
                                      className={`w-2 h-2 rounded-full ${
                                        i <= checkIn.progressRating ? 'bg-blue-600' : 'bg-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              {checkIn.notes && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">{checkIn.notes}</p>
                              )}
                            </div>
                          ))}
                          {checkIns.length > 3 && (
                            <p className="text-sm text-gray-500 text-center">
                              +{checkIns.length - 3} more check-ins
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showModal && <PIPModal />}
      {showGoalModal && selectedPIP && <GoalModal />}
      {showCheckInModal && selectedPIP && <CheckInModal />}
    </div>
  );
};

export default PIPs;
