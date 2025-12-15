import { useState, useEffect } from 'react';
import {
  Users,
  ClipboardCheck,
  Clock,
  CheckCircle,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  X,
  AlertCircle,
  FileText,
  Calendar,
  UserCheck,
  ListChecks,
} from 'lucide-react';
import {
  orientationChecklistDB,
  orientationItemDB,
  probationRecordDB,
  probationEvaluationDB,
  employeeDB,
  seedAllDefaults,
} from '../../services/db/indexedDB';

export default function ProbationOrientation() {
  // Data state
  const [probationRecords, setProbationRecords] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [checklistItems, setChecklistItems] = useState([]);
  const [employees, setEmployees] = useState([]);

  // UI state
  const [activeTab, setActiveTab] = useState('active');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal state
  const [showProbationModal, setShowProbationModal] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Form state for probation record
  const [probationForm, setProbationForm] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    duration: 3,
    status: 'active',
    supervisorId: '',
    orientationChecklistId: '',
    notes: '',
  });

  // Form state for evaluation
  const [evaluationForm, setEvaluationForm] = useState({
    probationRecordId: '',
    evaluationDate: '',
    evaluatorId: '',
    overallRating: '',
    strengths: '',
    areasForImprovement: '',
    recommendation: 'confirm',
    extensionMonths: 0,
    comments: '',
  });

  // Form state for checklist
  const [checklistForm, setChecklistForm] = useState({
    name: '',
    description: '',
    items: [],
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await seedAllDefaults();

      const [recordsData, evalsData, checklistsData, itemsData, employeesData] = await Promise.all([
        probationRecordDB.getAll(),
        probationEvaluationDB.getAll(),
        orientationChecklistDB.getAll(),
        orientationItemDB.getAll(),
        employeeDB.getAll(),
      ]);

      setProbationRecords(recordsData);
      setEvaluations(evalsData);
      setChecklists(checklistsData);
      setChecklistItems(itemsData);
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
    total: probationRecords.length,
    active: probationRecords.filter((r) => r.status === 'active').length,
    endingSoon: probationRecords.filter((r) => {
      if (r.status !== 'active') return false;
      const endDate = new Date(r.endDate);
      const today = new Date();
      const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
      return daysLeft <= 14 && daysLeft > 0;
    }).length,
    confirmed: probationRecords.filter((r) => r.status === 'confirmed').length,
    extended: probationRecords.filter((r) => r.status === 'extended').length,
  };

  // Get employee name
  const getEmployeeName = (employeeId) => {
    const emp = employees.find((e) => e.id === employeeId);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
  };

  // Get checklist name
  const getChecklistName = (checklistId) => {
    const cl = checklists.find((c) => c.id === checklistId);
    return cl ? cl.name : 'Not assigned';
  };

  // Filter records based on active tab
  const getFilteredRecords = () => {
    let filtered = [...probationRecords];

    switch (activeTab) {
      case 'active':
        filtered = filtered.filter((r) => r.status === 'active');
        break;
      case 'pending':
        // Records with pending evaluations
        const recordsWithEvals = new Set(evaluations.map((e) => e.probationRecordId));
        filtered = filtered.filter((r) => r.status === 'active' && !recordsWithEvals.has(r.id));
        break;
      case 'completed':
        filtered = filtered.filter((r) => ['confirmed', 'terminated'].includes(r.status));
        break;
      default:
        break;
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((r) => {
        const empName = getEmployeeName(r.employeeId).toLowerCase();
        return empName.includes(searchTerm.toLowerCase());
      });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    return filtered;
  };

  // Pagination
  const filteredRecords = getFilteredRecords();
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // CRUD handlers for Probation Records
  const handleSaveProbation = async () => {
    try {
      if (!probationForm.employeeId || !probationForm.startDate || !probationForm.endDate) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      const data = {
        ...probationForm,
        employeeId: parseInt(probationForm.employeeId),
        supervisorId: probationForm.supervisorId ? parseInt(probationForm.supervisorId) : null,
        orientationChecklistId: probationForm.orientationChecklistId
          ? parseInt(probationForm.orientationChecklistId)
          : null,
        duration: parseInt(probationForm.duration),
      };

      if (isEditing && selectedRecord) {
        await probationRecordDB.update(selectedRecord.id, data);
        showToast('Probation record updated successfully');
      } else {
        await probationRecordDB.add(data);
        showToast('Probation record created successfully');
      }

      await loadData();
      closeProbationModal();
    } catch (error) {
      console.error('Error saving probation record:', error);
      showToast('Error saving probation record', 'error');
    }
  };

  const handleDeleteProbation = async () => {
    try {
      await probationRecordDB.delete(selectedRecord.id);
      showToast('Probation record deleted successfully');
      await loadData();
      setShowDeleteModal(false);
      setSelectedRecord(null);
    } catch (error) {
      console.error('Error deleting probation record:', error);
      showToast('Error deleting probation record', 'error');
    }
  };

  // CRUD handlers for Evaluations
  const handleSaveEvaluation = async () => {
    try {
      if (
        !evaluationForm.probationRecordId ||
        !evaluationForm.evaluationDate ||
        !evaluationForm.overallRating
      ) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      const data = {
        ...evaluationForm,
        probationRecordId: parseInt(evaluationForm.probationRecordId),
        evaluatorId: evaluationForm.evaluatorId ? parseInt(evaluationForm.evaluatorId) : null,
        extensionMonths: parseInt(evaluationForm.extensionMonths) || 0,
      };

      if (isEditing && selectedRecord) {
        await probationEvaluationDB.update(selectedRecord.id, data);
        showToast('Evaluation updated successfully');
      } else {
        await probationEvaluationDB.add(data);

        // Update probation record status based on recommendation
        const probRecord = probationRecords.find(
          (r) => r.id === parseInt(evaluationForm.probationRecordId)
        );
        if (probRecord) {
          let newStatus = probRecord.status;
          if (evaluationForm.recommendation === 'confirm') {
            newStatus = 'confirmed';
          } else if (evaluationForm.recommendation === 'extend') {
            newStatus = 'extended';
          } else if (evaluationForm.recommendation === 'terminate') {
            newStatus = 'terminated';
          }
          await probationRecordDB.update(probRecord.id, { ...probRecord, status: newStatus });
        }

        showToast('Evaluation submitted successfully');
      }

      await loadData();
      closeEvaluationModal();
    } catch (error) {
      console.error('Error saving evaluation:', error);
      showToast('Error saving evaluation', 'error');
    }
  };

  // CRUD handlers for Checklists
  const handleSaveChecklist = async () => {
    try {
      if (!checklistForm.name) {
        showToast('Please enter a checklist name', 'error');
        return;
      }

      if (isEditing && selectedRecord) {
        await orientationChecklistDB.update(selectedRecord.id, {
          name: checklistForm.name,
          description: checklistForm.description,
        });
        showToast('Checklist updated successfully');
      } else {
        await orientationChecklistDB.add({
          name: checklistForm.name,
          description: checklistForm.description,
          isActive: true,
        });
        showToast('Checklist created successfully');
      }

      await loadData();
      closeChecklistModal();
    } catch (error) {
      console.error('Error saving checklist:', error);
      showToast('Error saving checklist', 'error');
    }
  };

  // Modal handlers
  const openProbationModal = (record = null) => {
    if (record) {
      setIsEditing(true);
      setSelectedRecord(record);
      setProbationForm({
        employeeId: record.employeeId?.toString() || '',
        startDate: record.startDate || '',
        endDate: record.endDate || '',
        duration: record.duration || 3,
        status: record.status || 'active',
        supervisorId: record.supervisorId?.toString() || '',
        orientationChecklistId: record.orientationChecklistId?.toString() || '',
        notes: record.notes || '',
      });
    } else {
      setIsEditing(false);
      setSelectedRecord(null);
      const today = new Date();
      const endDate = new Date(today);
      endDate.setMonth(endDate.getMonth() + 3);
      setProbationForm({
        employeeId: '',
        startDate: today.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        duration: 3,
        status: 'active',
        supervisorId: '',
        orientationChecklistId: '',
        notes: '',
      });
    }
    setShowProbationModal(true);
  };

  const closeProbationModal = () => {
    setShowProbationModal(false);
    setSelectedRecord(null);
    setIsEditing(false);
  };

  const openEvaluationModal = (record = null, probationId = null) => {
    if (record) {
      setIsEditing(true);
      setSelectedRecord(record);
      setEvaluationForm({
        probationRecordId: record.probationRecordId?.toString() || '',
        evaluationDate: record.evaluationDate || '',
        evaluatorId: record.evaluatorId?.toString() || '',
        overallRating: record.overallRating || '',
        strengths: record.strengths || '',
        areasForImprovement: record.areasForImprovement || '',
        recommendation: record.recommendation || 'confirm',
        extensionMonths: record.extensionMonths || 0,
        comments: record.comments || '',
      });
    } else {
      setIsEditing(false);
      setSelectedRecord(null);
      setEvaluationForm({
        probationRecordId: probationId?.toString() || '',
        evaluationDate: new Date().toISOString().split('T')[0],
        evaluatorId: '',
        overallRating: '',
        strengths: '',
        areasForImprovement: '',
        recommendation: 'confirm',
        extensionMonths: 0,
        comments: '',
      });
    }
    setShowEvaluationModal(true);
  };

  const closeEvaluationModal = () => {
    setShowEvaluationModal(false);
    setSelectedRecord(null);
    setIsEditing(false);
  };

  const openChecklistModal = (checklist = null) => {
    if (checklist) {
      setIsEditing(true);
      setSelectedRecord(checklist);
      setChecklistForm({
        name: checklist.name || '',
        description: checklist.description || '',
        items: [],
      });
    } else {
      setIsEditing(false);
      setSelectedRecord(null);
      setChecklistForm({
        name: '',
        description: '',
        items: [],
      });
    }
    setShowChecklistModal(true);
  };

  const closeChecklistModal = () => {
    setShowChecklistModal(false);
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
      active: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      extended: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      terminated: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.active}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Calculate days remaining
  const getDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const days = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return days;
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
            Probation & Orientation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage employee probation periods and orientation checklists
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openChecklistModal()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ListChecks className="w-4 h-4" />
            New Checklist
          </button>
          <button
            onClick={() => openProbationModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Probation
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ending Soon</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.endingSoon}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.confirmed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <RefreshCw className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Extended</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.extended}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'active', label: 'Active Probations', icon: Clock },
            { id: 'pending', label: 'Pending Evaluations', icon: ClipboardCheck },
            { id: 'checklists', label: 'Orientation Checklists', icon: ListChecks },
            { id: 'completed', label: 'Completed', icon: CheckCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
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
      {activeTab !== 'checklists' && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by employee name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="confirmed">Confirmed</option>
              <option value="extended">Extended</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
        </div>
      )}

      {/* Checklists Tab Content */}
      {activeTab === 'checklists' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Items
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
              {checklists.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No orientation checklists found. Create one to get started.
                  </td>
                </tr>
              ) : (
                checklists.map((checklist) => {
                  const itemCount = checklistItems.filter(
                    (i) => i.checklistId === checklist.id
                  ).length;
                  return (
                    <tr key={checklist.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <ListChecks className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {checklist.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600 dark:text-gray-400">
                          {checklist.description || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-600 dark:text-gray-400">{itemCount} items</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            checklist.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {checklist.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openChecklistModal(checklist)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded dark:hover:bg-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(checklist)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded dark:hover:bg-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Probation Records Table */}
      {activeTab !== 'checklists' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Days Left
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Checklist
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No probation records found.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => {
                  const daysLeft = getDaysRemaining(record.endDate);
                  return (
                    <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {getEmployeeName(record.employeeId)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(record.startDate).toLocaleDateString()} -{' '}
                          {new Date(record.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-600 dark:text-gray-400">
                          {record.duration} months
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`font-medium ${
                            daysLeft <= 0
                              ? 'text-red-600 dark:text-red-400'
                              : daysLeft <= 14
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {daysLeft <= 0 ? 'Ended' : `${daysLeft} days`}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(record.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-600 dark:text-gray-400">
                          {getChecklistName(record.orientationChecklistId)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openViewModal(record)}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded dark:text-gray-400 dark:hover:bg-gray-700"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {record.status === 'active' && (
                            <button
                              onClick={() => openEvaluationModal(null, record.id)}
                              className="p-1 text-green-600 hover:bg-green-100 rounded dark:hover:bg-green-900"
                              title="Add Evaluation"
                            >
                              <ClipboardCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => openProbationModal(record)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded dark:hover:bg-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(record)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded dark:hover:bg-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of{' '}
                {filteredRecords.length} records
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
      )}

      {/* Probation Modal */}
      {showProbationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Probation Record' : 'New Probation Record'}
              </h2>
              <button
                onClick={closeProbationModal}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Employee *
                  </label>
                  <select
                    value={probationForm.employeeId}
                    onChange={(e) => setProbationForm({ ...probationForm, employeeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
                    Supervisor
                  </label>
                  <select
                    value={probationForm.supervisorId}
                    onChange={(e) => setProbationForm({ ...probationForm, supervisorId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Supervisor</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={probationForm.startDate}
                    onChange={(e) => {
                      const start = new Date(e.target.value);
                      const end = new Date(start);
                      end.setMonth(end.getMonth() + probationForm.duration);
                      setProbationForm({
                        ...probationForm,
                        startDate: e.target.value,
                        endDate: end.toISOString().split('T')[0],
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Duration (months)
                  </label>
                  <select
                    value={probationForm.duration}
                    onChange={(e) => {
                      const duration = parseInt(e.target.value);
                      const start = new Date(probationForm.startDate);
                      const end = new Date(start);
                      end.setMonth(end.getMonth() + duration);
                      setProbationForm({
                        ...probationForm,
                        duration,
                        endDate: end.toISOString().split('T')[0],
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={3}>3 months</option>
                    <option value={6}>6 months</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={probationForm.endDate}
                    onChange={(e) => setProbationForm({ ...probationForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={probationForm.status}
                    onChange={(e) => setProbationForm({ ...probationForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="extended">Extended</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Orientation Checklist
                  </label>
                  <select
                    value={probationForm.orientationChecklistId}
                    onChange={(e) =>
                      setProbationForm({ ...probationForm, orientationChecklistId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No Checklist</option>
                    {checklists.map((cl) => (
                      <option key={cl.id} value={cl.id}>
                        {cl.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={probationForm.notes}
                  onChange={(e) => setProbationForm({ ...probationForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={closeProbationModal}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProbation}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {isEditing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Evaluation Modal */}
      {showEvaluationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Evaluation' : 'New Probation Evaluation'}
              </h2>
              <button
                onClick={closeEvaluationModal}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Probation Record *
                  </label>
                  <select
                    value={evaluationForm.probationRecordId}
                    onChange={(e) =>
                      setEvaluationForm({ ...evaluationForm, probationRecordId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Probation</option>
                    {probationRecords
                      .filter((r) => r.status === 'active')
                      .map((record) => (
                        <option key={record.id} value={record.id}>
                          {getEmployeeName(record.employeeId)}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Evaluation Date *
                  </label>
                  <input
                    type="date"
                    value={evaluationForm.evaluationDate}
                    onChange={(e) =>
                      setEvaluationForm({ ...evaluationForm, evaluationDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Evaluator
                  </label>
                  <select
                    value={evaluationForm.evaluatorId}
                    onChange={(e) =>
                      setEvaluationForm({ ...evaluationForm, evaluatorId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Evaluator</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Overall Rating *
                  </label>
                  <select
                    value={evaluationForm.overallRating}
                    onChange={(e) =>
                      setEvaluationForm({ ...evaluationForm, overallRating: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Rating</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="satisfactory">Satisfactory</option>
                    <option value="needs_improvement">Needs Improvement</option>
                    <option value="unsatisfactory">Unsatisfactory</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Strengths
                </label>
                <textarea
                  value={evaluationForm.strengths}
                  onChange={(e) => setEvaluationForm({ ...evaluationForm, strengths: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Key strengths observed..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Areas for Improvement
                </label>
                <textarea
                  value={evaluationForm.areasForImprovement}
                  onChange={(e) =>
                    setEvaluationForm({ ...evaluationForm, areasForImprovement: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Areas needing improvement..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Recommendation *
                  </label>
                  <select
                    value={evaluationForm.recommendation}
                    onChange={(e) =>
                      setEvaluationForm({ ...evaluationForm, recommendation: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="confirm">Confirm Employment</option>
                    <option value="extend">Extend Probation</option>
                    <option value="terminate">Terminate</option>
                  </select>
                </div>
                {evaluationForm.recommendation === 'extend' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Extension (months)
                    </label>
                    <select
                      value={evaluationForm.extensionMonths}
                      onChange={(e) =>
                        setEvaluationForm({
                          ...evaluationForm,
                          extensionMonths: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>1 month</option>
                      <option value={2}>2 months</option>
                      <option value={3}>3 months</option>
                    </select>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Additional Comments
                </label>
                <textarea
                  value={evaluationForm.comments}
                  onChange={(e) => setEvaluationForm({ ...evaluationForm, comments: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional comments..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={closeEvaluationModal}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEvaluation}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {isEditing ? 'Update' : 'Submit Evaluation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checklist Modal */}
      {showChecklistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Checklist' : 'New Orientation Checklist'}
              </h2>
              <button
                onClick={closeChecklistModal}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Checklist Name *
                </label>
                <input
                  type="text"
                  value={checklistForm.name}
                  onChange={(e) => setChecklistForm({ ...checklistForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Standard Orientation Checklist"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={checklistForm.description}
                  onChange={(e) => setChecklistForm({ ...checklistForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe this orientation checklist..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={closeChecklistModal}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChecklist}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {isEditing ? 'Update' : 'Create'}
              </button>
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
                Probation Details
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Employee</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {getEmployeeName(selectedRecord.employeeId)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <div>{getStatusBadge(selectedRecord.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(selectedRecord.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">End Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(selectedRecord.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedRecord.duration} months
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Supervisor</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedRecord.supervisorId
                      ? getEmployeeName(selectedRecord.supervisorId)
                      : 'Not assigned'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Orientation Checklist</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {getChecklistName(selectedRecord.orientationChecklistId)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Days Remaining</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {getDaysRemaining(selectedRecord.endDate)} days
                  </p>
                </div>
              </div>
              {selectedRecord.notes && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
                  <p className="text-gray-900 dark:text-white">{selectedRecord.notes}</p>
                </div>
              )}

              {/* Evaluations for this record */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Evaluations</h3>
                {evaluations.filter((e) => e.probationRecordId === selectedRecord.id).length ===
                0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No evaluations yet.</p>
                ) : (
                  <div className="space-y-2">
                    {evaluations
                      .filter((e) => e.probationRecordId === selectedRecord.id)
                      .map((eval_) => (
                        <div
                          key={eval_.id}
                          className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {new Date(eval_.evaluationDate).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Rating: {eval_.overallRating}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                eval_.recommendation === 'confirm'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                  : eval_.recommendation === 'extend'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                              }`}
                            >
                              {eval_.recommendation === 'confirm'
                                ? 'Confirm'
                                : eval_.recommendation === 'extend'
                                ? 'Extend'
                                : 'Terminate'}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
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
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Confirm Delete
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete this record? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedRecord(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProbation}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 ${
            toast.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}
