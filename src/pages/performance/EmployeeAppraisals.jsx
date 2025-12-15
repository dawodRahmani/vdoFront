import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList, Search, Filter, Plus, Eye, Edit,
  ChevronRight, User, Calendar, Star, Clock, CheckCircle,
  AlertCircle, XCircle, MessageSquare, FileText, Send
} from 'lucide-react';
import performanceService from '../../services/db/performanceService';
import { employeeDB } from '../../services/db/indexedDB';

const EmployeeAppraisals = () => {
  const navigate = useNavigate();
  const [appraisals, setAppraisals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cycleFilter, setCycleFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appraisalsData, employeesData, cyclesData, templatesData] = await Promise.all([
        performanceService.employeeAppraisals.getAll(),
        employeeDB.getAll(),
        performanceService.appraisalCycles.getAll(),
        performanceService.appraisalTemplates.getAll()
      ]);
      setAppraisals(appraisalsData);
      setEmployees(employeesData);
      setCycles(cyclesData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEmployee = (id) => employees.find(e => e.id === id);
  const getCycle = (id) => cycles.find(c => c.id === id);
  const getTemplate = (id) => templates.find(t => t.id === id);

  const filteredAppraisals = appraisals.filter(appraisal => {
    const employee = getEmployee(appraisal.employeeId);
    const employeeName = employee ? `${employee.firstName} ${employee.lastName}`.toLowerCase() : '';

    const matchesSearch = employeeName.includes(searchTerm.toLowerCase()) ||
      appraisal.employeeId?.toString().includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || appraisal.status === statusFilter;
    const matchesCycle = cycleFilter === 'all' || appraisal.cycleId === cycleFilter;

    return matchesSearch && matchesStatus && matchesCycle;
  });

  const getStatusConfig = (status) => {
    const configs = {
      draft: {
        label: 'Draft',
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        icon: FileText
      },
      self_assessment: {
        label: 'Self Assessment',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        icon: Edit
      },
      manager_review: {
        label: 'Manager Review',
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        icon: User
      },
      committee_review: {
        label: 'Committee Review',
        color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
        icon: ClipboardList
      },
      pending_approval: {
        label: 'Pending Approval',
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: Clock
      },
      approved: {
        label: 'Approved',
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        icon: CheckCircle
      },
      communicated: {
        label: 'Communicated',
        color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
        icon: MessageSquare
      },
      completed: {
        label: 'Completed',
        color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
        icon: CheckCircle
      },
      rejected: {
        label: 'Rejected',
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        icon: XCircle
      }
    };
    return configs[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: FileText };
  };

  const getPerformanceLevel = (score) => {
    if (!score) return null;
    if (score >= 80) return { level: 'Outstanding', color: 'text-emerald-600' };
    if (score >= 70) return { level: 'Exceeds Expectations', color: 'text-green-600' };
    if (score >= 50) return { level: 'Meets Expectations', color: 'text-blue-600' };
    if (score >= 30) return { level: 'Needs Improvement', color: 'text-yellow-600' };
    return { level: 'Unsatisfactory', color: 'text-red-600' };
  };

  const getWorkflowSteps = (status) => {
    const steps = [
      'draft',
      'self_assessment',
      'manager_review',
      'committee_review',
      'pending_approval',
      'approved',
      'communicated',
      'completed'
    ];
    const currentIndex = steps.indexOf(status);
    return steps.map((step, index) => ({
      step,
      label: getStatusConfig(step).label,
      completed: index < currentIndex,
      current: index === currentIndex,
      pending: index > currentIndex
    }));
  };

  // Create Modal Component
  const CreateModal = () => {
    const [formData, setFormData] = useState({
      employeeId: '',
      cycleId: '',
      templateId: '',
      appraisalType: 'annual'
    });
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [bulkMode, setBulkMode] = useState(false);

    const activeCycles = cycles.filter(c => c.status === 'active');
    const activeTemplates = templates.filter(t => t.isActive);

    const handleSingleCreate = async (e) => {
      e.preventDefault();
      try {
        await performanceService.employeeAppraisals.create({
          ...formData,
          status: 'draft',
          selfAssessmentScore: null,
          managerScore: null,
          committeeScore: null,
          finalScore: null,
          performanceLevel: null,
          recommendation: null
        });
        await loadData();
        setShowCreateModal(false);
      } catch (error) {
        console.error('Error creating appraisal:', error);
        alert('Error creating appraisal');
      }
    };

    const handleBulkCreate = async () => {
      if (!formData.cycleId || !formData.templateId || selectedEmployees.length === 0) {
        alert('Please select cycle, template, and at least one employee');
        return;
      }

      try {
        for (const empId of selectedEmployees) {
          // Check if appraisal already exists for this employee in this cycle
          const existing = appraisals.find(
            a => a.employeeId === empId && a.cycleId === formData.cycleId
          );
          if (!existing) {
            await performanceService.employeeAppraisals.create({
              employeeId: empId,
              cycleId: formData.cycleId,
              templateId: formData.templateId,
              appraisalType: formData.appraisalType,
              status: 'draft',
              selfAssessmentScore: null,
              managerScore: null,
              committeeScore: null,
              finalScore: null,
              performanceLevel: null,
              recommendation: null
            });
          }
        }
        await loadData();
        setShowCreateModal(false);
      } catch (error) {
        console.error('Error creating appraisals:', error);
        alert('Error creating appraisals');
      }
    };

    const toggleEmployee = (empId) => {
      setSelectedEmployees(prev =>
        prev.includes(empId)
          ? prev.filter(id => id !== empId)
          : [...prev, empId]
      );
    };

    const selectAllEmployees = () => {
      const eligibleEmployees = employees.filter(emp => {
        const existing = appraisals.find(
          a => a.employeeId === emp.id && a.cycleId === formData.cycleId
        );
        return !existing;
      });
      setSelectedEmployees(eligibleEmployees.map(e => e.id));
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Create Appraisal
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBulkMode(false)}
                  className={`px-3 py-1 text-sm rounded ${
                    !bulkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  Single
                </button>
                <button
                  type="button"
                  onClick={() => setBulkMode(true)}
                  className={`px-3 py-1 text-sm rounded ${
                    bulkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  Bulk
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Appraisal Cycle
                  </label>
                  <select
                    value={formData.cycleId}
                    onChange={(e) => setFormData({ ...formData, cycleId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select Cycle</option>
                    {activeCycles.map(cycle => (
                      <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Template
                  </label>
                  <select
                    value={formData.templateId}
                    onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select Template</option>
                    {activeTemplates.map(template => (
                      <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Appraisal Type
                </label>
                <select
                  value={formData.appraisalType}
                  onChange={(e) => setFormData({ ...formData, appraisalType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="annual">Annual Performance</option>
                  <option value="probation">Probation</option>
                  <option value="contract_renewal">Contract Renewal</option>
                  <option value="pip_review">PIP Review</option>
                </select>
              </div>

              {!bulkMode ? (
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
                        {emp.firstName} {emp.lastName} ({emp.employeeId})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select Employees ({selectedEmployees.length} selected)
                    </label>
                    <button
                      type="button"
                      onClick={selectAllEmployees}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Select All Eligible
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg">
                    {employees.map(emp => {
                      const existing = appraisals.find(
                        a => a.employeeId === emp.id && a.cycleId === formData.cycleId
                      );
                      return (
                        <label
                          key={emp.id}
                          className={`flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
                            existing ? 'opacity-50' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedEmployees.includes(emp.id)}
                            onChange={() => !existing && toggleEmployee(emp.id)}
                            disabled={existing}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-900 dark:text-white">
                            {emp.firstName} {emp.lastName}
                          </span>
                          {existing && (
                            <span className="ml-auto text-xs text-gray-500">Already exists</span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={bulkMode ? handleBulkCreate : handleSingleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {bulkMode ? `Create ${selectedEmployees.length} Appraisals` : 'Create Appraisal'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleStartSelfAssessment = async (appraisal) => {
    try {
      await performanceService.employeeAppraisals.update(appraisal.id, {
        status: 'self_assessment',
        selfAssessmentStartedAt: new Date().toISOString()
      });
      await loadData();
    } catch (error) {
      console.error('Error starting self assessment:', error);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Appraisals</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage performance appraisals for all employees</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Appraisal
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: appraisals.length, color: 'blue' },
          { label: 'In Progress', value: appraisals.filter(a => !['draft', 'completed'].includes(a.status)).length, color: 'yellow' },
          { label: 'Completed', value: appraisals.filter(a => a.status === 'completed').length, color: 'green' },
          { label: 'Pending Start', value: appraisals.filter(a => a.status === 'draft').length, color: 'gray' }
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
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
          value={cycleFilter}
          onChange={(e) => setCycleFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">All Cycles</option>
          {cycles.map(cycle => (
            <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="self_assessment">Self Assessment</option>
          <option value="manager_review">Manager Review</option>
          <option value="committee_review">Committee Review</option>
          <option value="pending_approval">Pending Approval</option>
          <option value="approved">Approved</option>
          <option value="communicated">Communicated</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Appraisals List */}
      {filteredAppraisals.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Appraisals Found</h3>
          <p className="text-gray-500">Create new appraisals or adjust your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppraisals.map((appraisal) => {
            const employee = getEmployee(appraisal.employeeId);
            const cycle = getCycle(appraisal.cycleId);
            const template = getTemplate(appraisal.templateId);
            const statusConfig = getStatusConfig(appraisal.status);
            const StatusIcon = statusConfig.icon;
            const performanceLevel = getPerformanceLevel(appraisal.finalScore);

            return (
              <div
                key={appraisal.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee'}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <span>{cycle?.name || 'Unknown Cycle'}</span>
                        <span>•</span>
                        <span>{template?.name || 'Unknown Template'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Score Display */}
                    {appraisal.finalScore && (
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${performanceLevel?.color || 'text-gray-600'}`}>
                          {appraisal.finalScore}%
                        </div>
                        <div className="text-xs text-gray-500">{performanceLevel?.level}</div>
                      </div>
                    )}

                    {/* Status */}
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${statusConfig.color}`}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{statusConfig.label}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {appraisal.status === 'draft' && (
                        <button
                          onClick={() => handleStartSelfAssessment(appraisal)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                        >
                          <Send className="w-4 h-4" />
                          Start
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/hr/performance/appraisal/${appraisal.id}`)}
                        className="p-2 text-gray-400 hover:text-blue-600"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Workflow Progress */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    {getWorkflowSteps(appraisal.status).slice(0, 6).map((step, index) => (
                      <div key={step.step} className="flex items-center">
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                          step.completed
                            ? 'bg-green-600 text-white'
                            : step.current
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-500 dark:bg-gray-700'
                        }`}>
                          {step.completed ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        {index < 5 && (
                          <div className={`w-8 md:w-16 h-0.5 mx-1 ${
                            step.completed
                              ? 'bg-green-600'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    {getWorkflowSteps(appraisal.status).slice(0, 6).map((step) => (
                      <span
                        key={step.step}
                        className={`text-xs ${
                          step.current
                            ? 'text-blue-600 font-medium'
                            : 'text-gray-400'
                        }`}
                        style={{ width: '60px', textAlign: 'center' }}
                      >
                        {step.label.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Additional Info */}
                {(appraisal.selfAssessmentScore || appraisal.managerScore || appraisal.committeeScore) && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Self Assessment</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {appraisal.selfAssessmentScore ? `${appraisal.selfAssessmentScore}%` : '-'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Manager Score</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {appraisal.managerScore ? `${appraisal.managerScore}%` : '-'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Committee Score</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {appraisal.committeeScore ? `${appraisal.committeeScore}%` : '-'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && <CreateModal />}
    </div>
  );
};

export default EmployeeAppraisals;
