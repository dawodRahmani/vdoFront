import { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Target,
  TrendingUp,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  X,
  AlertCircle,
  CheckCircle,
  Users,
  Star,
  ClipboardList,
  Clock,
} from 'lucide-react';
import {
  appraisalPeriodDB,
  appraisalCriteriaDB,
  performanceAppraisalDB,
  appraisalScoreDB,
  pipDB,
  pipGoalDB,
  pipProgressReviewDB,
  employeeDB,
  seedAllDefaults,
} from '../../services/db/indexedDB';

export default function PerformanceManagement() {
  // Data state
  const [periods, setPeriods] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [appraisals, setAppraisals] = useState([]);
  const [scores, setScores] = useState([]);
  const [pips, setPips] = useState([]);
  const [pipGoals, setPipGoals] = useState([]);
  const [employees, setEmployees] = useState([]);

  // UI state
  const [activeTab, setActiveTab] = useState('periods');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal state
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);
  const [showAppraisalModal, setShowAppraisalModal] = useState(false);
  const [showPipModal, setShowPipModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Form state for period
  const [periodForm, setPeriodForm] = useState({
    name: '',
    year: new Date().getFullYear(),
    startDate: '',
    endDate: '',
    status: 'draft',
    description: '',
  });

  // Form state for criteria
  const [criteriaForm, setCriteriaForm] = useState({
    name: '',
    category: 'performance',
    weight: 10,
    description: '',
    isActive: true,
  });

  // Form state for appraisal
  const [appraisalForm, setAppraisalForm] = useState({
    periodId: '',
    employeeId: '',
    supervisorId: '',
    status: 'draft',
    selfAssessmentDate: '',
    supervisorReviewDate: '',
    overallRating: '',
    selfComments: '',
    supervisorComments: '',
  });

  // Form state for PIP
  const [pipForm, setPipForm] = useState({
    employeeId: '',
    supervisorId: '',
    startDate: '',
    endDate: '',
    reason: '',
    status: 'active',
    goals: [],
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await seedAllDefaults();

      const [
        periodsData,
        criteriaData,
        appraisalsData,
        scoresData,
        pipsData,
        goalsData,
        employeesData,
      ] = await Promise.all([
        appraisalPeriodDB.getAll(),
        appraisalCriteriaDB.getAll(),
        performanceAppraisalDB.getAll(),
        appraisalScoreDB.getAll(),
        pipDB.getAll(),
        pipGoalDB.getAll(),
        employeeDB.getAll(),
      ]);

      setPeriods(periodsData);
      setCriteria(criteriaData);
      setAppraisals(appraisalsData);
      setScores(scoresData);
      setPips(pipsData);
      setPipGoals(goalsData);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Statistics
  const stats = {
    totalAppraisals: appraisals.length,
    pending: appraisals.filter((a) => ['draft', 'self_assessment', 'supervisor_review'].includes(a.status)).length,
    completed: appraisals.filter((a) => a.status === 'completed').length,
    activePips: pips.filter((p) => p.status === 'active').length,
    avgRating: appraisals.filter((a) => a.overallRating).length > 0
      ? (appraisals.filter((a) => a.overallRating).reduce((sum, a) => {
          const ratingMap = { excellent: 5, good: 4, satisfactory: 3, needs_improvement: 2, unsatisfactory: 1 };
          return sum + (ratingMap[a.overallRating] || 0);
        }, 0) / appraisals.filter((a) => a.overallRating).length).toFixed(1)
      : '-',
  };

  // Get employee name
  const getEmployeeName = (employeeId) => {
    const emp = employees.find((e) => e.id === employeeId);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
  };

  // Get period name
  const getPeriodName = (periodId) => {
    const period = periods.find((p) => p.id === periodId);
    return period ? period.name : 'Unknown';
  };

  // Filter data based on active tab
  const getFilteredData = () => {
    let filtered = [];

    switch (activeTab) {
      case 'periods':
        filtered = [...periods];
        if (statusFilter !== 'all') {
          filtered = filtered.filter((p) => p.status === statusFilter);
        }
        break;
      case 'appraisals':
        filtered = [...appraisals];
        if (periodFilter !== 'all') {
          filtered = filtered.filter((a) => a.periodId === parseInt(periodFilter));
        }
        if (statusFilter !== 'all') {
          filtered = filtered.filter((a) => a.status === statusFilter);
        }
        if (searchTerm) {
          filtered = filtered.filter((a) => {
            const empName = getEmployeeName(a.employeeId).toLowerCase();
            return empName.includes(searchTerm.toLowerCase());
          });
        }
        break;
      case 'criteria':
        filtered = [...criteria];
        if (searchTerm) {
          filtered = filtered.filter((c) =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        break;
      case 'pips':
        filtered = [...pips];
        if (statusFilter !== 'all') {
          filtered = filtered.filter((p) => p.status === statusFilter);
        }
        if (searchTerm) {
          filtered = filtered.filter((p) => {
            const empName = getEmployeeName(p.employeeId).toLowerCase();
            return empName.includes(searchTerm.toLowerCase());
          });
        }
        break;
      default:
        break;
    }

    return filtered;
  };

  // Pagination
  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // CRUD handlers for Periods
  const handleSavePeriod = async () => {
    try {
      if (!periodForm.name || !periodForm.startDate || !periodForm.endDate) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      const data = {
        ...periodForm,
        year: parseInt(periodForm.year),
      };

      if (isEditing && selectedRecord) {
        await appraisalPeriodDB.update(selectedRecord.id, data);
        showToast('Period updated successfully');
      } else {
        await appraisalPeriodDB.add(data);
        showToast('Period created successfully');
      }

      await loadData();
      closePeriodModal();
    } catch (error) {
      console.error('Error saving period:', error);
      showToast('Error saving period', 'error');
    }
  };

  // CRUD handlers for Criteria
  const handleSaveCriteria = async () => {
    try {
      if (!criteriaForm.name) {
        showToast('Please enter a criteria name', 'error');
        return;
      }

      const data = {
        ...criteriaForm,
        weight: parseFloat(criteriaForm.weight),
      };

      if (isEditing && selectedRecord) {
        await appraisalCriteriaDB.update(selectedRecord.id, data);
        showToast('Criteria updated successfully');
      } else {
        await appraisalCriteriaDB.add(data);
        showToast('Criteria created successfully');
      }

      await loadData();
      closeCriteriaModal();
    } catch (error) {
      console.error('Error saving criteria:', error);
      showToast('Error saving criteria', 'error');
    }
  };

  // CRUD handlers for Appraisals
  const handleSaveAppraisal = async () => {
    try {
      if (!appraisalForm.periodId || !appraisalForm.employeeId) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      const data = {
        ...appraisalForm,
        periodId: parseInt(appraisalForm.periodId),
        employeeId: parseInt(appraisalForm.employeeId),
        supervisorId: appraisalForm.supervisorId ? parseInt(appraisalForm.supervisorId) : null,
      };

      if (isEditing && selectedRecord) {
        await performanceAppraisalDB.update(selectedRecord.id, data);
        showToast('Appraisal updated successfully');
      } else {
        await performanceAppraisalDB.add(data);
        showToast('Appraisal created successfully');
      }

      await loadData();
      closeAppraisalModal();
    } catch (error) {
      console.error('Error saving appraisal:', error);
      showToast('Error saving appraisal', 'error');
    }
  };

  // CRUD handlers for PIPs
  const handleSavePip = async () => {
    try {
      if (!pipForm.employeeId || !pipForm.startDate || !pipForm.endDate) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      const data = {
        ...pipForm,
        employeeId: parseInt(pipForm.employeeId),
        supervisorId: pipForm.supervisorId ? parseInt(pipForm.supervisorId) : null,
      };
      delete data.goals;

      if (isEditing && selectedRecord) {
        await pipDB.update(selectedRecord.id, data);
        showToast('PIP updated successfully');
      } else {
        await pipDB.add(data);
        showToast('PIP created successfully');
      }

      await loadData();
      closePipModal();
    } catch (error) {
      console.error('Error saving PIP:', error);
      showToast('Error saving PIP', 'error');
    }
  };

  // Delete handler
  const handleDelete = async () => {
    try {
      switch (activeTab) {
        case 'periods':
          await appraisalPeriodDB.delete(selectedRecord.id);
          break;
        case 'appraisals':
          await performanceAppraisalDB.delete(selectedRecord.id);
          break;
        case 'criteria':
          await appraisalCriteriaDB.delete(selectedRecord.id);
          break;
        case 'pips':
          await pipDB.delete(selectedRecord.id);
          break;
      }
      showToast('Record deleted successfully');
      await loadData();
      setShowDeleteModal(false);
      setSelectedRecord(null);
    } catch (error) {
      console.error('Error deleting record:', error);
      showToast('Error deleting record', 'error');
    }
  };

  // Modal handlers
  const openPeriodModal = (period = null) => {
    if (period) {
      setIsEditing(true);
      setSelectedRecord(period);
      setPeriodForm({
        name: period.name || '',
        year: period.year || new Date().getFullYear(),
        startDate: period.startDate || '',
        endDate: period.endDate || '',
        status: period.status || 'draft',
        description: period.description || '',
      });
    } else {
      setIsEditing(false);
      setSelectedRecord(null);
      const year = new Date().getFullYear();
      setPeriodForm({
        name: `Annual Appraisal ${year}`,
        year: year,
        startDate: `${year}-01-01`,
        endDate: `${year}-12-31`,
        status: 'draft',
        description: '',
      });
    }
    setShowPeriodModal(true);
  };

  const closePeriodModal = () => {
    setShowPeriodModal(false);
    setSelectedRecord(null);
    setIsEditing(false);
  };

  const openCriteriaModal = (crit = null) => {
    if (crit) {
      setIsEditing(true);
      setSelectedRecord(crit);
      setCriteriaForm({
        name: crit.name || '',
        category: crit.category || 'performance',
        weight: crit.weight || 10,
        description: crit.description || '',
        isActive: crit.isActive !== false,
      });
    } else {
      setIsEditing(false);
      setSelectedRecord(null);
      setCriteriaForm({
        name: '',
        category: 'performance',
        weight: 10,
        description: '',
        isActive: true,
      });
    }
    setShowCriteriaModal(true);
  };

  const closeCriteriaModal = () => {
    setShowCriteriaModal(false);
    setSelectedRecord(null);
    setIsEditing(false);
  };

  const openAppraisalModal = (appraisal = null) => {
    if (appraisal) {
      setIsEditing(true);
      setSelectedRecord(appraisal);
      setAppraisalForm({
        periodId: appraisal.periodId?.toString() || '',
        employeeId: appraisal.employeeId?.toString() || '',
        supervisorId: appraisal.supervisorId?.toString() || '',
        status: appraisal.status || 'draft',
        selfAssessmentDate: appraisal.selfAssessmentDate || '',
        supervisorReviewDate: appraisal.supervisorReviewDate || '',
        overallRating: appraisal.overallRating || '',
        selfComments: appraisal.selfComments || '',
        supervisorComments: appraisal.supervisorComments || '',
      });
    } else {
      setIsEditing(false);
      setSelectedRecord(null);
      const activePeriod = periods.find((p) => p.status === 'active');
      setAppraisalForm({
        periodId: activePeriod?.id?.toString() || '',
        employeeId: '',
        supervisorId: '',
        status: 'draft',
        selfAssessmentDate: '',
        supervisorReviewDate: '',
        overallRating: '',
        selfComments: '',
        supervisorComments: '',
      });
    }
    setShowAppraisalModal(true);
  };

  const closeAppraisalModal = () => {
    setShowAppraisalModal(false);
    setSelectedRecord(null);
    setIsEditing(false);
  };

  const openPipModal = (pip = null) => {
    if (pip) {
      setIsEditing(true);
      setSelectedRecord(pip);
      setPipForm({
        employeeId: pip.employeeId?.toString() || '',
        supervisorId: pip.supervisorId?.toString() || '',
        startDate: pip.startDate || '',
        endDate: pip.endDate || '',
        reason: pip.reason || '',
        status: pip.status || 'active',
        goals: [],
      });
    } else {
      setIsEditing(false);
      setSelectedRecord(null);
      const today = new Date();
      const endDate = new Date(today);
      endDate.setMonth(endDate.getMonth() + 3);
      setPipForm({
        employeeId: '',
        supervisorId: '',
        startDate: today.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        reason: '',
        status: 'active',
        goals: [],
      });
    }
    setShowPipModal(true);
  };

  const closePipModal = () => {
    setShowPipModal(false);
    setSelectedRecord(null);
    setIsEditing(false);
  };

  const openViewModal = (record) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const openDeleteModal = (record) => {
    setSelectedRecord(record);
    setShowDeleteModal(true);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      active: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      self_assessment: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      supervisor_review: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      successful: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      unsuccessful: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    const labels = {
      draft: 'Draft',
      active: 'Active',
      self_assessment: 'Self Assessment',
      supervisor_review: 'Supervisor Review',
      completed: 'Completed',
      closed: 'Closed',
      successful: 'Successful',
      unsuccessful: 'Unsuccessful',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Get rating badge
  const getRatingBadge = (rating) => {
    const styles = {
      excellent: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      good: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      satisfactory: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      needs_improvement: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      unsatisfactory: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    const labels = {
      excellent: 'Excellent',
      good: 'Good',
      satisfactory: 'Satisfactory',
      needs_improvement: 'Needs Improvement',
      unsatisfactory: 'Unsatisfactory',
    };
    if (!rating) return <span className="text-gray-400">-</span>;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[rating] || ''}`}>
        {labels[rating] || rating}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Performance Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage employee appraisals and performance improvement plans
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'periods' && (
            <button
              onClick={() => openPeriodModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Period
            </button>
          )}
          {activeTab === 'appraisals' && (
            <button
              onClick={() => openAppraisalModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Appraisal
            </button>
          )}
          {activeTab === 'criteria' && (
            <button
              onClick={() => openCriteriaModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Criteria
            </button>
          )}
          {activeTab === 'pips' && (
            <button
              onClick={() => openPipModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New PIP
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Appraisals</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAppraisals}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active PIPs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activePips}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgRating}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'periods', label: 'Appraisal Periods', icon: Calendar },
            { id: 'appraisals', label: 'Employee Appraisals', icon: ClipboardList },
            { id: 'criteria', label: 'Criteria Setup', icon: Target },
            { id: 'pips', label: 'PIPs', icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
                setStatusFilter('all');
                setSearchTerm('');
              }}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {(activeTab === 'appraisals' || activeTab === 'pips' || activeTab === 'criteria') && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={activeTab === 'criteria' ? 'Search criteria...' : 'Search by employee name...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          {activeTab === 'appraisals' && (
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Periods</option>
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
          {(activeTab === 'periods' || activeTab === 'appraisals' || activeTab === 'pips') && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              {activeTab === 'periods' && (
                <>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </>
              )}
              {activeTab === 'appraisals' && (
                <>
                  <option value="draft">Draft</option>
                  <option value="self_assessment">Self Assessment</option>
                  <option value="supervisor_review">Supervisor Review</option>
                  <option value="completed">Completed</option>
                </>
              )}
              {activeTab === 'pips' && (
                <>
                  <option value="active">Active</option>
                  <option value="successful">Successful</option>
                  <option value="unsuccessful">Unsuccessful</option>
                </>
              )}
            </select>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {activeTab === 'periods' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </>
              )}
              {activeTab === 'appraisals' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Supervisor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </>
              )}
              {activeTab === 'criteria' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Weight</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </>
              )}
              {activeTab === 'pips' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Supervisor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Goals</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No records found.
                </td>
              </tr>
            ) : (
              paginatedData.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  {activeTab === 'periods' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">{record.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{record.year}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                        {new Date(record.startDate).toLocaleDateString()} - {new Date(record.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(record.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openPeriodModal(record)} className="p-1 text-blue-600 hover:bg-blue-100 rounded dark:hover:bg-blue-900">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => openDeleteModal(record)} className="p-1 text-red-600 hover:bg-red-100 rounded dark:hover:bg-red-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                  {activeTab === 'appraisals' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">{getEmployeeName(record.employeeId)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{getPeriodName(record.periodId)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                        {record.supervisorId ? getEmployeeName(record.supervisorId) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(record.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getRatingBadge(record.overallRating)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openViewModal(record)} className="p-1 text-gray-600 hover:bg-gray-100 rounded dark:text-gray-400 dark:hover:bg-gray-700">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => openAppraisalModal(record)} className="p-1 text-blue-600 hover:bg-blue-100 rounded dark:hover:bg-blue-900">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => openDeleteModal(record)} className="p-1 text-red-600 hover:bg-red-100 rounded dark:hover:bg-red-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                  {activeTab === 'criteria' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">{record.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400 capitalize">{record.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{record.weight}%</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${record.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                          {record.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openCriteriaModal(record)} className="p-1 text-blue-600 hover:bg-blue-100 rounded dark:hover:bg-blue-900">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => openDeleteModal(record)} className="p-1 text-red-600 hover:bg-red-100 rounded dark:hover:bg-red-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                  {activeTab === 'pips' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-orange-500" />
                          <span className="font-medium text-gray-900 dark:text-white">{getEmployeeName(record.employeeId)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                        {new Date(record.startDate).toLocaleDateString()} - {new Date(record.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                        {record.supervisorId ? getEmployeeName(record.supervisorId) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(record.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                        {pipGoals.filter((g) => g.pipId === record.id).length} goals
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openViewModal(record)} className="p-1 text-gray-600 hover:bg-gray-100 rounded dark:text-gray-400 dark:hover:bg-gray-700">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => openPipModal(record)} className="p-1 text-blue-600 hover:bg-blue-100 rounded dark:hover:bg-blue-900">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => openDeleteModal(record)} className="p-1 text-red-600 hover:bg-red-100 rounded dark:hover:bg-red-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} records
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Period Modal */}
      {showPeriodModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Appraisal Period' : 'New Appraisal Period'}
              </h2>
              <button onClick={closePeriodModal} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Period Name *</label>
                <input
                  type="text"
                  value={periodForm.name}
                  onChange={(e) => setPeriodForm({ ...periodForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Annual Appraisal 2024"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                  <input
                    type="number"
                    value={periodForm.year}
                    onChange={(e) => setPeriodForm({ ...periodForm, year: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={periodForm.startDate}
                    onChange={(e) => setPeriodForm({ ...periodForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date *</label>
                  <input
                    type="date"
                    value={periodForm.endDate}
                    onChange={(e) => setPeriodForm({ ...periodForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={periodForm.status}
                  onChange={(e) => setPeriodForm({ ...periodForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={periodForm.description}
                  onChange={(e) => setPeriodForm({ ...periodForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional description..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={closePeriodModal} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={handleSavePeriod} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{isEditing ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Criteria Modal */}
      {showCriteriaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Criteria' : 'New Appraisal Criteria'}
              </h2>
              <button onClick={closeCriteriaModal} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Criteria Name *</label>
                <input
                  type="text"
                  value={criteriaForm.name}
                  onChange={(e) => setCriteriaForm({ ...criteriaForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Communication Skills"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select
                    value={criteriaForm.category}
                    onChange={(e) => setCriteriaForm({ ...criteriaForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="performance">Performance</option>
                    <option value="behavior">Behavior</option>
                    <option value="skills">Skills</option>
                    <option value="goals">Goals</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={criteriaForm.weight}
                    onChange={(e) => setCriteriaForm({ ...criteriaForm, weight: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={criteriaForm.description}
                  onChange={(e) => setCriteriaForm({ ...criteriaForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe this criteria..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="criteriaActive"
                  checked={criteriaForm.isActive}
                  onChange={(e) => setCriteriaForm({ ...criteriaForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="criteriaActive" className="text-sm text-gray-700 dark:text-gray-300">Active</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={closeCriteriaModal} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={handleSaveCriteria} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{isEditing ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Appraisal Modal */}
      {showAppraisalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Appraisal' : 'New Performance Appraisal'}
              </h2>
              <button onClick={closeAppraisalModal} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Appraisal Period *</label>
                  <select
                    value={appraisalForm.periodId}
                    onChange={(e) => setAppraisalForm({ ...appraisalForm, periodId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Period</option>
                    {periods.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee *</label>
                  <select
                    value={appraisalForm.employeeId}
                    onChange={(e) => setAppraisalForm({ ...appraisalForm, employeeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Supervisor</label>
                  <select
                    value={appraisalForm.supervisorId}
                    onChange={(e) => setAppraisalForm({ ...appraisalForm, supervisorId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Supervisor</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={appraisalForm.status}
                    onChange={(e) => setAppraisalForm({ ...appraisalForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="self_assessment">Self Assessment</option>
                    <option value="supervisor_review">Supervisor Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Self Assessment Date</label>
                  <input
                    type="date"
                    value={appraisalForm.selfAssessmentDate}
                    onChange={(e) => setAppraisalForm({ ...appraisalForm, selfAssessmentDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Supervisor Review Date</label>
                  <input
                    type="date"
                    value={appraisalForm.supervisorReviewDate}
                    onChange={(e) => setAppraisalForm({ ...appraisalForm, supervisorReviewDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Overall Rating</label>
                <select
                  value={appraisalForm.overallRating}
                  onChange={(e) => setAppraisalForm({ ...appraisalForm, overallRating: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Not Rated</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="satisfactory">Satisfactory</option>
                  <option value="needs_improvement">Needs Improvement</option>
                  <option value="unsatisfactory">Unsatisfactory</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Self Comments</label>
                <textarea
                  value={appraisalForm.selfComments}
                  onChange={(e) => setAppraisalForm({ ...appraisalForm, selfComments: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Employee self-assessment comments..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Supervisor Comments</label>
                <textarea
                  value={appraisalForm.supervisorComments}
                  onChange={(e) => setAppraisalForm({ ...appraisalForm, supervisorComments: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Supervisor evaluation comments..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={closeAppraisalModal} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={handleSaveAppraisal} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{isEditing ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* PIP Modal */}
      {showPipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditing ? 'Edit PIP' : 'New Performance Improvement Plan'}
              </h2>
              <button onClick={closePipModal} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee *</label>
                  <select
                    value={pipForm.employeeId}
                    onChange={(e) => setPipForm({ ...pipForm, employeeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Supervisor</label>
                  <select
                    value={pipForm.supervisorId}
                    onChange={(e) => setPipForm({ ...pipForm, supervisorId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Supervisor</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={pipForm.startDate}
                    onChange={(e) => setPipForm({ ...pipForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date *</label>
                  <input
                    type="date"
                    value={pipForm.endDate}
                    onChange={(e) => setPipForm({ ...pipForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={pipForm.status}
                    onChange={(e) => setPipForm({ ...pipForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="successful">Successful</option>
                    <option value="unsuccessful">Unsuccessful</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason for PIP</label>
                <textarea
                  value={pipForm.reason}
                  onChange={(e) => setPipForm({ ...pipForm, reason: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the reason for placing employee on PIP..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={closePipModal} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={handleSavePip} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{isEditing ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {activeTab === 'appraisals' ? 'Appraisal Details' : 'PIP Details'}
              </h2>
              <button onClick={() => setShowViewModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {activeTab === 'appraisals' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Employee</p>
                      <p className="font-medium text-gray-900 dark:text-white">{getEmployeeName(selectedRecord.employeeId)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                      <div>{getStatusBadge(selectedRecord.status)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Period</p>
                      <p className="font-medium text-gray-900 dark:text-white">{getPeriodName(selectedRecord.periodId)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Supervisor</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedRecord.supervisorId ? getEmployeeName(selectedRecord.supervisorId) : '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Overall Rating</p>
                      <div>{getRatingBadge(selectedRecord.overallRating)}</div>
                    </div>
                  </div>
                  {selectedRecord.selfComments && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Self Comments</p>
                      <p className="text-gray-900 dark:text-white">{selectedRecord.selfComments}</p>
                    </div>
                  )}
                  {selectedRecord.supervisorComments && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Supervisor Comments</p>
                      <p className="text-gray-900 dark:text-white">{selectedRecord.supervisorComments}</p>
                    </div>
                  )}
                </>
              )}
              {activeTab === 'pips' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Employee</p>
                      <p className="font-medium text-gray-900 dark:text-white">{getEmployeeName(selectedRecord.employeeId)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                      <div>{getStatusBadge(selectedRecord.status)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Period</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedRecord.startDate).toLocaleDateString()} - {new Date(selectedRecord.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Supervisor</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedRecord.supervisorId ? getEmployeeName(selectedRecord.supervisorId) : '-'}</p>
                    </div>
                  </div>
                  {selectedRecord.reason && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Reason</p>
                      <p className="text-gray-900 dark:text-white">{selectedRecord.reason}</p>
                    </div>
                  )}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Goals</h3>
                    {pipGoals.filter((g) => g.pipId === selectedRecord.id).length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400">No goals defined.</p>
                    ) : (
                      <ul className="space-y-2">
                        {pipGoals.filter((g) => g.pipId === selectedRecord.id).map((goal) => (
                          <li key={goal.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <p className="text-gray-900 dark:text-white">{goal.description}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => setShowViewModal(false)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Delete</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Are you sure you want to delete this record? This action cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => { setShowDeleteModal(false); setSelectedRecord(null); }} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
