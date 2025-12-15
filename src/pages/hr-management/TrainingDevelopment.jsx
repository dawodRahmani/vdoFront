import { useState, useEffect } from 'react';
import {
  GraduationCap,
  Calendar,
  Users,
  ClipboardList,
  Target,
  FileCheck,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  UserCheck,
} from 'lucide-react';
import {
  trainingTypeDB,
  trainingProgramDB,
  trainingAttendanceDB,
  tnaDB,
  tnaItemDB,
  idpDB,
  idpGoalDB,
  trainingBondDB,
  employeeDB,
  seedAllDefaults,
} from '../../services/db/indexedDB';

export default function TrainingDevelopment() {
  // Data state
  const [trainingTypes, setTrainingTypes] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [tnas, setTnas] = useState([]);
  const [tnaItems, setTnaItems] = useState([]);
  const [idps, setIdps] = useState([]);
  const [idpGoals, setIdpGoals] = useState([]);
  const [bonds, setBonds] = useState([]);
  const [employees, setEmployees] = useState([]);

  // UI state
  const [activeTab, setActiveTab] = useState('programs');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal state
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showTnaModal, setShowTnaModal] = useState(false);
  const [showIdpModal, setShowIdpModal] = useState(false);
  const [showBondModal, setShowBondModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Form state for program
  const [programForm, setProgramForm] = useState({
    title: '',
    trainingTypeId: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    trainer: '',
    maxParticipants: 20,
    status: 'scheduled',
    cost: 0,
  });

  // Form state for attendance
  const [attendanceForm, setAttendanceForm] = useState({
    programId: '',
    employeeId: '',
    status: 'enrolled',
    completionDate: '',
    score: '',
    feedback: '',
  });

  // Form state for TNA
  const [tnaForm, setTnaForm] = useState({
    employeeId: '',
    assessmentDate: '',
    assessorId: '',
    status: 'pending',
    notes: '',
  });

  // Form state for IDP
  const [idpForm, setIdpForm] = useState({
    employeeId: '',
    supervisorId: '',
    startDate: '',
    endDate: '',
    status: 'active',
    notes: '',
  });

  // Form state for Bond
  const [bondForm, setBondForm] = useState({
    employeeId: '',
    programId: '',
    bondStartDate: '',
    bondEndDate: '',
    bondAmount: 0,
    status: 'active',
    notes: '',
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
        typesData,
        programsData,
        attendanceData,
        tnasData,
        tnaItemsData,
        idpsData,
        idpGoalsData,
        bondsData,
        employeesData,
      ] = await Promise.all([
        trainingTypeDB.getAll(),
        trainingProgramDB.getAll(),
        trainingAttendanceDB.getAll(),
        tnaDB.getAll(),
        tnaItemDB.getAll(),
        idpDB.getAll(),
        idpGoalDB.getAll(),
        trainingBondDB.getAll(),
        employeeDB.getAll(),
      ]);

      setTrainingTypes(typesData);
      setPrograms(programsData);
      setAttendance(attendanceData);
      setTnas(tnasData);
      setTnaItems(tnaItemsData);
      setIdps(idpsData);
      setIdpGoals(idpGoalsData);
      setBonds(bondsData);
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
  const today = new Date();
  const stats = {
    totalPrograms: programs.length,
    upcoming: programs.filter((p) => new Date(p.startDate) > today && p.status === 'scheduled').length,
    completed: programs.filter((p) => p.status === 'completed').length,
    activeTnas: tnas.filter((t) => t.status === 'pending').length,
    activeBonds: bonds.filter((b) => b.status === 'active').length,
  };

  // Get employee name
  const getEmployeeName = (employeeId) => {
    const emp = employees.find((e) => e.id === employeeId);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
  };

  // Get training type name
  const getTypeName = (typeId) => {
    const type = trainingTypes.find((t) => t.id === typeId);
    return type ? type.name : 'Unknown';
  };

  // Get program title
  const getProgramTitle = (programId) => {
    const program = programs.find((p) => p.id === programId);
    return program ? program.title : 'Unknown';
  };

  // Filter data based on active tab
  const getFilteredData = () => {
    let filtered = [];

    switch (activeTab) {
      case 'programs':
        filtered = [...programs];
        if (statusFilter !== 'all') {
          filtered = filtered.filter((p) => p.status === statusFilter);
        }
        if (typeFilter !== 'all') {
          filtered = filtered.filter((p) => p.trainingTypeId === parseInt(typeFilter));
        }
        if (searchTerm) {
          filtered = filtered.filter((p) =>
            p.title.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        break;
      case 'attendance':
        filtered = [...attendance];
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
      case 'tna':
        filtered = [...tnas];
        if (statusFilter !== 'all') {
          filtered = filtered.filter((t) => t.status === statusFilter);
        }
        break;
      case 'idp':
        filtered = [...idps];
        if (statusFilter !== 'all') {
          filtered = filtered.filter((i) => i.status === statusFilter);
        }
        break;
      case 'bonds':
        filtered = [...bonds];
        if (statusFilter !== 'all') {
          filtered = filtered.filter((b) => b.status === statusFilter);
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

  // CRUD handlers
  const handleSaveProgram = async () => {
    try {
      if (!programForm.title || !programForm.startDate) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      const data = {
        ...programForm,
        trainingTypeId: programForm.trainingTypeId ? parseInt(programForm.trainingTypeId) : null,
        maxParticipants: parseInt(programForm.maxParticipants),
        cost: parseFloat(programForm.cost) || 0,
      };

      if (isEditing && selectedRecord) {
        await trainingProgramDB.update(selectedRecord.id, data);
        showToast('Program updated successfully');
      } else {
        await trainingProgramDB.add(data);
        showToast('Program created successfully');
      }

      await loadData();
      closeProgramModal();
    } catch (error) {
      console.error('Error saving program:', error);
      showToast('Error saving program', 'error');
    }
  };

  const handleSaveAttendance = async () => {
    try {
      if (!attendanceForm.programId || !attendanceForm.employeeId) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      const data = {
        ...attendanceForm,
        programId: parseInt(attendanceForm.programId),
        employeeId: parseInt(attendanceForm.employeeId),
        score: attendanceForm.score ? parseFloat(attendanceForm.score) : null,
      };

      if (isEditing && selectedRecord) {
        await trainingAttendanceDB.update(selectedRecord.id, data);
        showToast('Attendance updated successfully');
      } else {
        await trainingAttendanceDB.add(data);
        showToast('Participant enrolled successfully');
      }

      await loadData();
      closeAttendanceModal();
    } catch (error) {
      console.error('Error saving attendance:', error);
      showToast('Error saving attendance', 'error');
    }
  };

  const handleSaveTna = async () => {
    try {
      if (!tnaForm.employeeId || !tnaForm.assessmentDate) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      const data = {
        ...tnaForm,
        employeeId: parseInt(tnaForm.employeeId),
        assessorId: tnaForm.assessorId ? parseInt(tnaForm.assessorId) : null,
      };

      if (isEditing && selectedRecord) {
        await tnaDB.update(selectedRecord.id, data);
        showToast('TNA updated successfully');
      } else {
        await tnaDB.add(data);
        showToast('TNA created successfully');
      }

      await loadData();
      closeTnaModal();
    } catch (error) {
      console.error('Error saving TNA:', error);
      showToast('Error saving TNA', 'error');
    }
  };

  const handleSaveIdp = async () => {
    try {
      if (!idpForm.employeeId || !idpForm.startDate) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      const data = {
        ...idpForm,
        employeeId: parseInt(idpForm.employeeId),
        supervisorId: idpForm.supervisorId ? parseInt(idpForm.supervisorId) : null,
      };

      if (isEditing && selectedRecord) {
        await idpDB.update(selectedRecord.id, data);
        showToast('IDP updated successfully');
      } else {
        await idpDB.add(data);
        showToast('IDP created successfully');
      }

      await loadData();
      closeIdpModal();
    } catch (error) {
      console.error('Error saving IDP:', error);
      showToast('Error saving IDP', 'error');
    }
  };

  const handleSaveBond = async () => {
    try {
      if (!bondForm.employeeId || !bondForm.bondStartDate) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      const data = {
        ...bondForm,
        employeeId: parseInt(bondForm.employeeId),
        programId: bondForm.programId ? parseInt(bondForm.programId) : null,
        bondAmount: parseFloat(bondForm.bondAmount) || 0,
      };

      if (isEditing && selectedRecord) {
        await trainingBondDB.update(selectedRecord.id, data);
        showToast('Bond updated successfully');
      } else {
        await trainingBondDB.add(data);
        showToast('Bond created successfully');
      }

      await loadData();
      closeBondModal();
    } catch (error) {
      console.error('Error saving bond:', error);
      showToast('Error saving bond', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      switch (activeTab) {
        case 'programs':
          await trainingProgramDB.delete(selectedRecord.id);
          break;
        case 'attendance':
          await trainingAttendanceDB.delete(selectedRecord.id);
          break;
        case 'tna':
          await tnaDB.delete(selectedRecord.id);
          break;
        case 'idp':
          await idpDB.delete(selectedRecord.id);
          break;
        case 'bonds':
          await trainingBondDB.delete(selectedRecord.id);
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
  const openProgramModal = (program = null) => {
    if (program) {
      setIsEditing(true);
      setSelectedRecord(program);
      setProgramForm({
        title: program.title || '',
        trainingTypeId: program.trainingTypeId?.toString() || '',
        description: program.description || '',
        startDate: program.startDate || '',
        endDate: program.endDate || '',
        location: program.location || '',
        trainer: program.trainer || '',
        maxParticipants: program.maxParticipants || 20,
        status: program.status || 'scheduled',
        cost: program.cost || 0,
      });
    } else {
      setIsEditing(false);
      setSelectedRecord(null);
      setProgramForm({
        title: '',
        trainingTypeId: '',
        description: '',
        startDate: '',
        endDate: '',
        location: '',
        trainer: '',
        maxParticipants: 20,
        status: 'scheduled',
        cost: 0,
      });
    }
    setShowProgramModal(true);
  };

  const closeProgramModal = () => {
    setShowProgramModal(false);
    setSelectedRecord(null);
    setIsEditing(false);
  };

  const openAttendanceModal = (record = null) => {
    if (record) {
      setIsEditing(true);
      setSelectedRecord(record);
      setAttendanceForm({
        programId: record.programId?.toString() || '',
        employeeId: record.employeeId?.toString() || '',
        status: record.status || 'enrolled',
        completionDate: record.completionDate || '',
        score: record.score?.toString() || '',
        feedback: record.feedback || '',
      });
    } else {
      setIsEditing(false);
      setSelectedRecord(null);
      setAttendanceForm({
        programId: '',
        employeeId: '',
        status: 'enrolled',
        completionDate: '',
        score: '',
        feedback: '',
      });
    }
    setShowAttendanceModal(true);
  };

  const closeAttendanceModal = () => {
    setShowAttendanceModal(false);
    setSelectedRecord(null);
    setIsEditing(false);
  };

  const openTnaModal = (tna = null) => {
    if (tna) {
      setIsEditing(true);
      setSelectedRecord(tna);
      setTnaForm({
        employeeId: tna.employeeId?.toString() || '',
        assessmentDate: tna.assessmentDate || '',
        assessorId: tna.assessorId?.toString() || '',
        status: tna.status || 'pending',
        notes: tna.notes || '',
      });
    } else {
      setIsEditing(false);
      setSelectedRecord(null);
      setTnaForm({
        employeeId: '',
        assessmentDate: new Date().toISOString().split('T')[0],
        assessorId: '',
        status: 'pending',
        notes: '',
      });
    }
    setShowTnaModal(true);
  };

  const closeTnaModal = () => {
    setShowTnaModal(false);
    setSelectedRecord(null);
    setIsEditing(false);
  };

  const openIdpModal = (idp = null) => {
    if (idp) {
      setIsEditing(true);
      setSelectedRecord(idp);
      setIdpForm({
        employeeId: idp.employeeId?.toString() || '',
        supervisorId: idp.supervisorId?.toString() || '',
        startDate: idp.startDate || '',
        endDate: idp.endDate || '',
        status: idp.status || 'active',
        notes: idp.notes || '',
      });
    } else {
      setIsEditing(false);
      setSelectedRecord(null);
      const today = new Date();
      const nextYear = new Date(today);
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      setIdpForm({
        employeeId: '',
        supervisorId: '',
        startDate: today.toISOString().split('T')[0],
        endDate: nextYear.toISOString().split('T')[0],
        status: 'active',
        notes: '',
      });
    }
    setShowIdpModal(true);
  };

  const closeIdpModal = () => {
    setShowIdpModal(false);
    setSelectedRecord(null);
    setIsEditing(false);
  };

  const openBondModal = (bond = null) => {
    if (bond) {
      setIsEditing(true);
      setSelectedRecord(bond);
      setBondForm({
        employeeId: bond.employeeId?.toString() || '',
        programId: bond.programId?.toString() || '',
        bondStartDate: bond.bondStartDate || '',
        bondEndDate: bond.bondEndDate || '',
        bondAmount: bond.bondAmount || 0,
        status: bond.status || 'active',
        notes: bond.notes || '',
      });
    } else {
      setIsEditing(false);
      setSelectedRecord(null);
      setBondForm({
        employeeId: '',
        programId: '',
        bondStartDate: '',
        bondEndDate: '',
        bondAmount: 0,
        status: 'active',
        notes: '',
      });
    }
    setShowBondModal(true);
  };

  const closeBondModal = () => {
    setShowBondModal(false);
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
      scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      ongoing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      enrolled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      attended: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      absent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      fulfilled: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      breached: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Training & Development</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage training programs, assessments, and development plans</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'programs' && (
            <button onClick={() => openProgramModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              New Program
            </button>
          )}
          {activeTab === 'attendance' && (
            <button onClick={() => openAttendanceModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              Enroll Participant
            </button>
          )}
          {activeTab === 'tna' && (
            <button onClick={() => openTnaModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              New TNA
            </button>
          )}
          {activeTab === 'idp' && (
            <button onClick={() => openIdpModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              New IDP
            </button>
          )}
          {activeTab === 'bonds' && (
            <button onClick={() => openBondModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              New Bond
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Programs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPrograms}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcoming}</p>
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
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <ClipboardList className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active TNAs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeTnas}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <FileCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Bonds</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeBonds}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'programs', label: 'Training Programs', icon: GraduationCap },
            { id: 'attendance', label: 'Attendance', icon: UserCheck },
            { id: 'tna', label: 'Training Needs Assessment', icon: ClipboardList },
            { id: 'idp', label: 'Development Plans', icon: Target },
            { id: 'bonds', label: 'Training Bonds', icon: FileCheck },
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
        {(activeTab === 'programs' || activeTab === 'attendance') && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={activeTab === 'programs' ? 'Search programs...' : 'Search by employee...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          {activeTab === 'programs' && (
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {trainingTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          )}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            {activeTab === 'programs' && (
              <>
                <option value="scheduled">Scheduled</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </>
            )}
            {activeTab === 'attendance' && (
              <>
                <option value="enrolled">Enrolled</option>
                <option value="attended">Attended</option>
                <option value="absent">Absent</option>
              </>
            )}
            {(activeTab === 'tna' || activeTab === 'idp') && (
              <>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </>
            )}
            {activeTab === 'bonds' && (
              <>
                <option value="active">Active</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="breached">Breached</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {activeTab === 'programs' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </>
              )}
              {activeTab === 'attendance' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Program</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </>
              )}
              {activeTab === 'tna' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assessment Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assessor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </>
              )}
              {activeTab === 'idp' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Supervisor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Goals</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </>
              )}
              {activeTab === 'bonds' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Program</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bond Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No records found.</td>
              </tr>
            ) : (
              paginatedData.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  {activeTab === 'programs' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">{record.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{getTypeName(record.trainingTypeId)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                        {record.startDate ? new Date(record.startDate).toLocaleDateString() : '-'} - {record.endDate ? new Date(record.endDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{record.location || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(record.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openViewModal(record)} className="p-1 text-gray-600 hover:bg-gray-100 rounded dark:text-gray-400 dark:hover:bg-gray-700"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => openProgramModal(record)} className="p-1 text-blue-600 hover:bg-blue-100 rounded dark:hover:bg-blue-900"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => openDeleteModal(record)} className="p-1 text-red-600 hover:bg-red-100 rounded dark:hover:bg-red-900"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </>
                  )}
                  {activeTab === 'attendance' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900 dark:text-white">{getEmployeeName(record.employeeId)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{getProgramTitle(record.programId)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(record.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{record.score || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openAttendanceModal(record)} className="p-1 text-blue-600 hover:bg-blue-100 rounded dark:hover:bg-blue-900"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => openDeleteModal(record)} className="p-1 text-red-600 hover:bg-red-100 rounded dark:hover:bg-red-900"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </>
                  )}
                  {activeTab === 'tna' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900 dark:text-white">{getEmployeeName(record.employeeId)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{record.assessmentDate ? new Date(record.assessmentDate).toLocaleDateString() : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{record.assessorId ? getEmployeeName(record.assessorId) : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(record.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openTnaModal(record)} className="p-1 text-blue-600 hover:bg-blue-100 rounded dark:hover:bg-blue-900"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => openDeleteModal(record)} className="p-1 text-red-600 hover:bg-red-100 rounded dark:hover:bg-red-900"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </>
                  )}
                  {activeTab === 'idp' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900 dark:text-white">{getEmployeeName(record.employeeId)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                        {record.startDate ? new Date(record.startDate).toLocaleDateString() : '-'} - {record.endDate ? new Date(record.endDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{record.supervisorId ? getEmployeeName(record.supervisorId) : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(record.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{idpGoals.filter((g) => g.idpId === record.id).length} goals</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openViewModal(record)} className="p-1 text-gray-600 hover:bg-gray-100 rounded dark:text-gray-400 dark:hover:bg-gray-700"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => openIdpModal(record)} className="p-1 text-blue-600 hover:bg-blue-100 rounded dark:hover:bg-blue-900"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => openDeleteModal(record)} className="p-1 text-red-600 hover:bg-red-100 rounded dark:hover:bg-red-900"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </>
                  )}
                  {activeTab === 'bonds' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900 dark:text-white">{getEmployeeName(record.employeeId)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{record.programId ? getProgramTitle(record.programId) : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                        {record.bondStartDate ? new Date(record.bondStartDate).toLocaleDateString() : '-'} - {record.bondEndDate ? new Date(record.bondEndDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">${record.bondAmount?.toLocaleString() || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(record.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openBondModal(record)} className="p-1 text-blue-600 hover:bg-blue-100 rounded dark:hover:bg-blue-900"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => openDeleteModal(record)} className="p-1 text-red-600 hover:bg-red-100 rounded dark:hover:bg-red-900"><Trash2 className="w-4 h-4" /></button>
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
            <p className="text-sm text-gray-600 dark:text-gray-400">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} records</p>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700">Previous</button>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Program Modal */}
      {showProgramModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{isEditing ? 'Edit Program' : 'New Training Program'}</h2>
              <button onClick={closeProgramModal} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input type="text" value={programForm.title} onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="Training program title" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Training Type</label>
                  <select value={programForm.trainingTypeId} onChange={(e) => setProgramForm({ ...programForm, trainingTypeId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Type</option>
                    {trainingTypes.map((type) => (<option key={type.id} value={type.id}>{type.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select value={programForm.status} onChange={(e) => setProgramForm({ ...programForm, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                    <option value="scheduled">Scheduled</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date *</label>
                  <input type="date" value={programForm.startDate} onChange={(e) => setProgramForm({ ...programForm, startDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                  <input type="date" value={programForm.endDate} onChange={(e) => setProgramForm({ ...programForm, endDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                  <input type="text" value={programForm.location} onChange={(e) => setProgramForm({ ...programForm, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="Training location" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trainer</label>
                  <input type="text" value={programForm.trainer} onChange={(e) => setProgramForm({ ...programForm, trainer: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="Trainer name" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Participants</label>
                  <input type="number" value={programForm.maxParticipants} onChange={(e) => setProgramForm({ ...programForm, maxParticipants: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cost</label>
                  <input type="number" value={programForm.cost} onChange={(e) => setProgramForm({ ...programForm, cost: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea value={programForm.description} onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="Program description..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={closeProgramModal} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={handleSaveProgram} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{isEditing ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{isEditing ? 'Edit Attendance' : 'Enroll Participant'}</h2>
              <button onClick={closeAttendanceModal} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program *</label>
                <select value={attendanceForm.programId} onChange={(e) => setAttendanceForm({ ...attendanceForm, programId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Program</option>
                  {programs.map((p) => (<option key={p.id} value={p.id}>{p.title}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee *</label>
                <select value={attendanceForm.employeeId} onChange={(e) => setAttendanceForm({ ...attendanceForm, employeeId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (<option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select value={attendanceForm.status} onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                    <option value="enrolled">Enrolled</option>
                    <option value="attended">Attended</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Score</label>
                  <input type="number" value={attendanceForm.score} onChange={(e) => setAttendanceForm({ ...attendanceForm, score: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="0-100" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Feedback</label>
                <textarea value={attendanceForm.feedback} onChange={(e) => setAttendanceForm({ ...attendanceForm, feedback: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="Training feedback..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={closeAttendanceModal} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={handleSaveAttendance} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{isEditing ? 'Update' : 'Enroll'}</button>
            </div>
          </div>
        </div>
      )}

      {/* TNA Modal */}
      {showTnaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{isEditing ? 'Edit TNA' : 'New Training Needs Assessment'}</h2>
              <button onClick={closeTnaModal} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee *</label>
                <select value={tnaForm.employeeId} onChange={(e) => setTnaForm({ ...tnaForm, employeeId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (<option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assessment Date *</label>
                  <input type="date" value={tnaForm.assessmentDate} onChange={(e) => setTnaForm({ ...tnaForm, assessmentDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select value={tnaForm.status} onChange={(e) => setTnaForm({ ...tnaForm, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assessor</label>
                <select value={tnaForm.assessorId} onChange={(e) => setTnaForm({ ...tnaForm, assessorId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Assessor</option>
                  {employees.map((emp) => (<option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea value={tnaForm.notes} onChange={(e) => setTnaForm({ ...tnaForm, notes: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="Assessment notes..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={closeTnaModal} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={handleSaveTna} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{isEditing ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* IDP Modal */}
      {showIdpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{isEditing ? 'Edit IDP' : 'New Individual Development Plan'}</h2>
              <button onClick={closeIdpModal} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee *</label>
                <select value={idpForm.employeeId} onChange={(e) => setIdpForm({ ...idpForm, employeeId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (<option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Supervisor</label>
                <select value={idpForm.supervisorId} onChange={(e) => setIdpForm({ ...idpForm, supervisorId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Supervisor</option>
                  {employees.map((emp) => (<option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date *</label>
                  <input type="date" value={idpForm.startDate} onChange={(e) => setIdpForm({ ...idpForm, startDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                  <input type="date" value={idpForm.endDate} onChange={(e) => setIdpForm({ ...idpForm, endDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select value={idpForm.status} onChange={(e) => setIdpForm({ ...idpForm, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea value={idpForm.notes} onChange={(e) => setIdpForm({ ...idpForm, notes: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="Development plan notes..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={closeIdpModal} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={handleSaveIdp} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{isEditing ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Bond Modal */}
      {showBondModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{isEditing ? 'Edit Bond' : 'New Training Bond'}</h2>
              <button onClick={closeBondModal} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee *</label>
                <select value={bondForm.employeeId} onChange={(e) => setBondForm({ ...bondForm, employeeId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (<option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Training Program</label>
                <select value={bondForm.programId} onChange={(e) => setBondForm({ ...bondForm, programId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Program</option>
                  {programs.map((p) => (<option key={p.id} value={p.id}>{p.title}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bond Start Date *</label>
                  <input type="date" value={bondForm.bondStartDate} onChange={(e) => setBondForm({ ...bondForm, bondStartDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bond End Date</label>
                  <input type="date" value={bondForm.bondEndDate} onChange={(e) => setBondForm({ ...bondForm, bondEndDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bond Amount</label>
                  <input type="number" value={bondForm.bondAmount} onChange={(e) => setBondForm({ ...bondForm, bondAmount: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select value={bondForm.status} onChange={(e) => setBondForm({ ...bondForm, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                    <option value="active">Active</option>
                    <option value="fulfilled">Fulfilled</option>
                    <option value="breached">Breached</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea value={bondForm.notes} onChange={(e) => setBondForm({ ...bondForm, notes: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="Bond notes..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={closeBondModal} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={handleSaveBond} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{isEditing ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{activeTab === 'programs' ? 'Program Details' : 'IDP Details'}</h2>
              <button onClick={() => setShowViewModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              {activeTab === 'programs' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Title</p><p className="font-medium text-gray-900 dark:text-white">{selectedRecord.title}</p></div>
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Status</p><div>{getStatusBadge(selectedRecord.status)}</div></div>
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Type</p><p className="font-medium text-gray-900 dark:text-white">{getTypeName(selectedRecord.trainingTypeId)}</p></div>
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Location</p><p className="font-medium text-gray-900 dark:text-white">{selectedRecord.location || '-'}</p></div>
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Dates</p><p className="font-medium text-gray-900 dark:text-white">{selectedRecord.startDate ? new Date(selectedRecord.startDate).toLocaleDateString() : '-'} - {selectedRecord.endDate ? new Date(selectedRecord.endDate).toLocaleDateString() : '-'}</p></div>
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Trainer</p><p className="font-medium text-gray-900 dark:text-white">{selectedRecord.trainer || '-'}</p></div>
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Max Participants</p><p className="font-medium text-gray-900 dark:text-white">{selectedRecord.maxParticipants}</p></div>
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Cost</p><p className="font-medium text-gray-900 dark:text-white">${selectedRecord.cost?.toLocaleString() || 0}</p></div>
                  </div>
                  {selectedRecord.description && (<div><p className="text-sm text-gray-500 dark:text-gray-400">Description</p><p className="text-gray-900 dark:text-white">{selectedRecord.description}</p></div>)}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Participants ({attendance.filter((a) => a.programId === selectedRecord.id).length})</h3>
                    {attendance.filter((a) => a.programId === selectedRecord.id).length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400">No participants enrolled.</p>
                    ) : (
                      <div className="space-y-2">
                        {attendance.filter((a) => a.programId === selectedRecord.id).map((att) => (
                          <div key={att.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <span className="text-gray-900 dark:text-white">{getEmployeeName(att.employeeId)}</span>
                            {getStatusBadge(att.status)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
              {activeTab === 'idp' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Employee</p><p className="font-medium text-gray-900 dark:text-white">{getEmployeeName(selectedRecord.employeeId)}</p></div>
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Status</p><div>{getStatusBadge(selectedRecord.status)}</div></div>
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Period</p><p className="font-medium text-gray-900 dark:text-white">{selectedRecord.startDate ? new Date(selectedRecord.startDate).toLocaleDateString() : '-'} - {selectedRecord.endDate ? new Date(selectedRecord.endDate).toLocaleDateString() : '-'}</p></div>
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Supervisor</p><p className="font-medium text-gray-900 dark:text-white">{selectedRecord.supervisorId ? getEmployeeName(selectedRecord.supervisorId) : '-'}</p></div>
                  </div>
                  {selectedRecord.notes && (<div><p className="text-sm text-gray-500 dark:text-gray-400">Notes</p><p className="text-gray-900 dark:text-white">{selectedRecord.notes}</p></div>)}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Goals ({idpGoals.filter((g) => g.idpId === selectedRecord.id).length})</h3>
                    {idpGoals.filter((g) => g.idpId === selectedRecord.id).length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400">No goals defined.</p>
                    ) : (
                      <ul className="space-y-2">
                        {idpGoals.filter((g) => g.idpId === selectedRecord.id).map((goal) => (
                          <li key={goal.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded"><p className="text-gray-900 dark:text-white">{goal.description}</p></li>
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

      {/* Delete Modal */}
      {showDeleteModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full"><AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" /></div>
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

      {/* Toast */}
      {toast.show && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
