import React, { useState, useEffect } from 'react';
import {
  UserCheck, Search, Filter, Plus, Eye, Edit, Trash2,
  Calendar, Clock, CheckCircle, XCircle, AlertTriangle,
  RefreshCw, User, ChevronDown, ChevronRight, Target, X
} from 'lucide-react';
import performanceService from '../../services/db/performanceService';
import { employeeDB } from '../../services/db/indexedDB';

const ProbationTracking = () => {
  const [probationRecords, setProbationRecords] = useState([]);
  const [extensions, setExtensions] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [showKPIModal, setShowKPIModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [expandedRecords, setExpandedRecords] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recordsData, extensionsData, kpisData, employeesData] = await Promise.all([
        performanceService.probationRecords.getAll(),
        performanceService.probationExtensions.getAll(),
        performanceService.probationKpis.getAll(),
        employeeDB.getAll()
      ]);
      setProbationRecords(recordsData);
      setExtensions(extensionsData);
      setKpis(kpisData);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEmployee = (id) => employees.find(e => e.id === id);
  const getRecordExtensions = (recordId) => extensions.filter(e => e.probationId === recordId);
  const getRecordKPIs = (recordId) => kpis.filter(k => k.probationId === recordId);

  const filteredRecords = probationRecords.filter(record => {
    const employee = getEmployee(record.employeeId);
    const employeeName = employee ? `${employee.firstName} ${employee.lastName}`.toLowerCase() : '';

    const matchesSearch = employeeName.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status) => {
    const configs = {
      active: {
        label: 'Active',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        icon: Clock
      },
      extended: {
        label: 'Extended',
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: RefreshCw
      },
      confirmed: {
        label: 'Confirmed',
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        icon: CheckCircle
      },
      terminated: {
        label: 'Terminated',
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

  const getProgressColor = (daysRemaining, totalDays) => {
    const progress = ((totalDays - daysRemaining) / totalDays) * 100;
    if (daysRemaining < 0) return 'bg-red-500';
    if (daysRemaining <= 7) return 'bg-red-500';
    if (daysRemaining <= 14) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  // Probation Record Modal
  const ProbationModal = () => {
    const [formData, setFormData] = useState(
      editingRecord || {
        employeeId: '',
        startDate: new Date().toISOString().split('T')[0],
        originalEndDate: '',
        currentEndDate: '',
        probationPeriodMonths: 3,
        status: 'active',
        notes: ''
      }
    );

    useEffect(() => {
      if (formData.startDate && formData.probationPeriodMonths && !editingRecord) {
        const start = new Date(formData.startDate);
        start.setMonth(start.getMonth() + parseInt(formData.probationPeriodMonths));
        const endDate = start.toISOString().split('T')[0];
        setFormData(prev => ({
          ...prev,
          originalEndDate: endDate,
          currentEndDate: endDate
        }));
      }
    }, [formData.startDate, formData.probationPeriodMonths]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if (editingRecord?.id) {
          await performanceService.probationRecords.update(editingRecord.id, formData);
        } else {
          await performanceService.probationRecords.create(formData);
        }
        await loadData();
        setShowModal(false);
        setEditingRecord(null);
      } catch (error) {
        console.error('Error saving record:', error);
        alert('Error saving record');
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingRecord ? 'Edit Probation Record' : 'New Probation Record'}
            </h3>
            <button
              onClick={() => { setShowModal(false); setEditingRecord(null); }}
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
                  Period (Months)
                </label>
                <select
                  value={formData.probationPeriodMonths}
                  onChange={(e) => setFormData({ ...formData, probationPeriodMonths: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={1}>1 Month</option>
                  <option value={2}>2 Months</option>
                  <option value={3}>3 Months</option>
                  <option value={6}>6 Months</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.currentEndDate}
                onChange={(e) => setFormData({ ...formData, currentEndDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="extended">Extended</option>
                <option value="confirmed">Confirmed</option>
                <option value="terminated">Terminated</option>
              </select>
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
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => { setShowModal(false); setEditingRecord(null); }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingRecord ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Extension Modal
  const ExtensionModal = () => {
    const [formData, setFormData] = useState({
      probationId: selectedRecord?.id,
      extensionNumber: getRecordExtensions(selectedRecord?.id).length + 1,
      extensionMonths: 1,
      newEndDate: '',
      reason: '',
      approvedBy: '',
      approvedAt: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
      if (selectedRecord && formData.extensionMonths) {
        const currentEnd = new Date(selectedRecord.currentEndDate);
        currentEnd.setMonth(currentEnd.getMonth() + parseInt(formData.extensionMonths));
        setFormData(prev => ({
          ...prev,
          newEndDate: currentEnd.toISOString().split('T')[0]
        }));
      }
    }, [selectedRecord, formData.extensionMonths]);

    const handleSubmit = async (e) => {
      e.preventDefault();

      // Check max extensions (2)
      const currentExtensions = getRecordExtensions(selectedRecord.id);
      if (currentExtensions.length >= 2) {
        alert('Maximum of 2 extensions allowed');
        return;
      }

      try {
        await performanceService.extendProbation(
          selectedRecord.id,
          parseInt(formData.extensionMonths),
          formData.reason
        );
        await loadData();
        setShowExtensionModal(false);
        setSelectedRecord(null);
      } catch (error) {
        console.error('Error creating extension:', error);
        alert(error.message || 'Error creating extension');
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Extend Probation
            </h3>
            <button
              onClick={() => { setShowExtensionModal(false); setSelectedRecord(null); }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Extension #{getRecordExtensions(selectedRecord?.id).length + 1} of max 2
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Extension Period
              </label>
              <select
                value={formData.extensionMonths}
                onChange={(e) => setFormData({ ...formData, extensionMonths: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={1}>1 Month</option>
                <option value={2}>2 Months</option>
                <option value={3}>3 Months</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New End Date
              </label>
              <input
                type="date"
                value={formData.newEndDate}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reason for Extension
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => { setShowExtensionModal(false); setSelectedRecord(null); }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Extend Probation
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // KPI Modal
  const KPIModal = () => {
    const [formData, setFormData] = useState({
      probationId: selectedRecord?.id,
      title: '',
      description: '',
      targetValue: '',
      actualValue: '',
      weight: 10,
      status: 'pending'
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await performanceService.probationKpis.create(formData);
        await loadData();
        setShowKPIModal(false);
      } catch (error) {
        console.error('Error creating KPI:', error);
        alert('Error creating KPI');
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Add KPI
            </h3>
            <button
              onClick={() => setShowKPIModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                KPI Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Value
                </label>
                <input
                  type="text"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Weight (%)
                </label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowKPIModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add KPI
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const handleConfirm = async (record) => {
    if (!confirm('Confirm this employee has successfully completed probation?')) return;
    try {
      await performanceService.confirmProbation(record.id, 'Probation completed successfully');
      await loadData();
    } catch (error) {
      console.error('Error confirming probation:', error);
      alert('Error confirming probation');
    }
  };

  const handleTerminate = async (record) => {
    const reason = prompt('Enter reason for termination:');
    if (!reason) return;
    try {
      await performanceService.probationRecords.update(record.id, {
        status: 'terminated',
        terminationReason: reason,
        terminatedAt: new Date().toISOString()
      });
      await loadData();
    } catch (error) {
      console.error('Error terminating:', error);
      alert('Error terminating probation');
    }
  };

  const handleDeleteKPI = async (kpiId) => {
    if (!confirm('Delete this KPI?')) return;
    try {
      await performanceService.probationKpis.delete(kpiId);
      await loadData();
    } catch (error) {
      console.error('Error deleting KPI:', error);
    }
  };

  const toggleRecord = (recordId) => {
    setExpandedRecords(prev => ({
      ...prev,
      [recordId]: !prev[recordId]
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Probation Tracking</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor and manage employee probation periods</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setEditingRecord(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Record
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active', value: probationRecords.filter(r => r.status === 'active').length, color: 'blue', icon: Clock },
          { label: 'Extended', value: probationRecords.filter(r => r.status === 'extended').length, color: 'yellow', icon: RefreshCw },
          { label: 'Confirmed', value: probationRecords.filter(r => r.status === 'confirmed').length, color: 'green', icon: CheckCircle },
          { label: 'Ending Soon', value: probationRecords.filter(r => r.status === 'active' && getDaysRemaining(r.currentEndDate) <= 14 && getDaysRemaining(r.currentEndDate) > 0).length, color: 'orange', icon: AlertTriangle }
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
          <option value="active">Active</option>
          <option value="extended">Extended</option>
          <option value="confirmed">Confirmed</option>
          <option value="terminated">Terminated</option>
        </select>
      </div>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Probation Records</h3>
          <p className="text-gray-500">Create a new probation record to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => {
            const employee = getEmployee(record.employeeId);
            const statusConfig = getStatusConfig(record.status);
            const StatusIcon = statusConfig.icon;
            const daysRemaining = getDaysRemaining(record.currentEndDate);
            const recordExtensions = getRecordExtensions(record.id);
            const recordKPIs = getRecordKPIs(record.id);
            const isExpanded = expandedRecords[record.id];
            const totalDays = Math.ceil(
              (new Date(record.currentEndDate) - new Date(record.startDate)) / (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={record.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
              >
                {/* Main Row */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleRecord(record.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </button>
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(record.startDate).toLocaleDateString()} - {new Date(record.currentEndDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Days Remaining */}
                      {record.status === 'active' && (
                        <div className="text-center">
                          <div className={`text-xl font-bold ${
                            daysRemaining < 0 ? 'text-red-600' :
                            daysRemaining <= 7 ? 'text-red-600' :
                            daysRemaining <= 14 ? 'text-yellow-600' : 'text-blue-600'
                          }`}>
                            {daysRemaining < 0 ? 'Overdue' : `${daysRemaining} days`}
                          </div>
                          <p className="text-xs text-gray-500">remaining</p>
                        </div>
                      )}

                      {/* Extensions Badge */}
                      {recordExtensions.length > 0 && (
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
                          {recordExtensions.length}x Extended
                        </span>
                      )}

                      {/* Status */}
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${statusConfig.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{statusConfig.label}</span>
                      </div>

                      {/* Actions */}
                      {record.status === 'active' && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleConfirm(record)}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded"
                            title="Confirm"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => { setSelectedRecord(record); setShowExtensionModal(true); }}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded"
                            title="Extend"
                            disabled={recordExtensions.length >= 2}
                          >
                            <RefreshCw className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleTerminate(record)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                            title="Terminate"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {record.status === 'active' && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{Math.max(0, Math.round(((totalDays - daysRemaining) / totalDays) * 100))}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getProgressColor(daysRemaining, totalDays)} transition-all`}
                          style={{ width: `${Math.min(100, Math.max(0, ((totalDays - daysRemaining) / totalDays) * 100))}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                    {/* Extensions */}
                    {recordExtensions.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Extensions</h4>
                        <div className="space-y-2">
                          {recordExtensions.map((ext) => (
                            <div
                              key={ext.id}
                              className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded"
                            >
                              <div>
                                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                  Extension #{ext.extensionNumber}
                                </span>
                                <span className="text-xs text-yellow-600 dark:text-yellow-300 ml-2">
                                  +{ext.extensionMonths} month(s)
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">{ext.reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* KPIs */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">KPIs</h4>
                        {record.status === 'active' && (
                          <button
                            onClick={() => { setSelectedRecord(record); setShowKPIModal(true); }}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            Add KPI
                          </button>
                        )}
                      </div>
                      {recordKPIs.length === 0 ? (
                        <p className="text-sm text-gray-500">No KPIs defined</p>
                      ) : (
                        <div className="space-y-2">
                          {recordKPIs.map((kpi) => (
                            <div
                              key={kpi.id}
                              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded"
                            >
                              <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-900 dark:text-white">{kpi.title}</span>
                                <span className="text-xs text-gray-500">({kpi.weight}%)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  kpi.status === 'achieved' ? 'bg-green-100 text-green-800' :
                                  kpi.status === 'not_achieved' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {kpi.status}
                                </span>
                                <button
                                  onClick={() => handleDeleteKPI(kpi.id)}
                                  className="text-gray-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {record.notes && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{record.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showModal && <ProbationModal />}
      {showExtensionModal && selectedRecord && <ExtensionModal />}
      {showKPIModal && selectedRecord && <KPIModal />}
    </div>
  );
};

export default ProbationTracking;
