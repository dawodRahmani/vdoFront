import { useState, useEffect } from 'react';
import {
  UserMinus,
  ClipboardCheck,
  DollarSign,
  FileText,
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
  Users,
  Building,
  Calendar,
} from 'lucide-react';
import {
  separationTypeDB,
  separationRecordDB,
  exitClearanceDepartmentDB,
  exitClearanceDB,
  exitInterviewDB,
  finalSettlementDB,
  workCertificateDB,
  employeeDB,
  departmentDB,
  seedAllDefaults,
} from '../../services/db/indexedDB';

export default function ExitManagement() {
  // Data state
  const [separationTypes, setSeparationTypes] = useState([]);
  const [separations, setSeparations] = useState([]);
  const [clearanceDepts, setClearanceDepts] = useState([]);
  const [clearances, setClearances] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  // UI state
  const [activeTab, setActiveTab] = useState('separations');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal state
  const [showSeparationModal, setShowSeparationModal] = useState(false);
  const [showClearanceModal, setShowClearanceModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Form state for separation
  const [separationForm, setSeparationForm] = useState({
    employeeId: '',
    separationTypeId: '',
    requestDate: '',
    effectiveDate: '',
    lastWorkingDay: '',
    reason: '',
    status: 'pending',
    noticePeriodDays: 30,
  });

  // Form state for clearance
  const [clearanceForm, setClearanceForm] = useState({
    separationId: '',
    departmentId: '',
    status: 'pending',
    clearedBy: '',
    clearedDate: '',
    remarks: '',
  });

  // Form state for settlement
  const [settlementForm, setSettlementForm] = useState({
    separationId: '',
    basicSalary: 0,
    leaveEncashment: 0,
    gratuity: 0,
    deductions: 0,
    totalAmount: 0,
    status: 'draft',
    paymentDate: '',
  });

  // Form state for certificate
  const [certificateForm, setCertificateForm] = useState({
    separationId: '',
    certificateType: 'experience',
    issueDate: '',
    content: '',
    issuedBy: '',
  });

  // Form state for interview
  const [interviewForm, setInterviewForm] = useState({
    separationId: '',
    interviewDate: '',
    interviewerId: '',
    reasonForLeaving: '',
    feedback: '',
    suggestions: '',
    wouldRecommend: true,
    wouldRejoin: true,
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
        separationsData,
        deptData,
        clearancesData,
        interviewsData,
        settlementsData,
        certificatesData,
        employeesData,
        departmentsData,
      ] = await Promise.all([
        separationTypeDB.getAll(),
        separationRecordDB.getAll(),
        exitClearanceDepartmentDB.getAll(),
        exitClearanceDB.getAll(),
        exitInterviewDB.getAll(),
        finalSettlementDB.getAll(),
        workCertificateDB.getAll(),
        employeeDB.getAll(),
        departmentDB.getAll(),
      ]);

      setSeparationTypes(typesData);
      setSeparations(separationsData);
      setClearanceDepts(deptData);
      setClearances(clearancesData);
      setInterviews(interviewsData);
      setSettlements(settlementsData);
      setCertificates(certificatesData);
      setEmployees(employeesData);
      setDepartments(departmentsData);
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
    total: separations.length,
    inProcess: separations.filter((s) => ['pending', 'approved', 'clearance'].includes(s.status)).length,
    pendingClearance: separations.filter((s) => s.status === 'clearance').length,
    settled: settlements.filter((s) => s.status === 'paid').length,
    certificates: certificates.length,
  };

  // Get employee name
  const getEmployeeName = (employeeId) => {
    const emp = employees.find((e) => e.id === employeeId);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
  };

  // Get department name
  const getDepartmentName = (deptId) => {
    const dept = departments.find((d) => d.id === deptId);
    return dept ? dept.name : 'Unknown';
  };

  // Get separation type name
  const getSeparationTypeName = (typeId) => {
    const type = separationTypes.find((t) => t.id === typeId);
    return type ? type.name : 'Unknown';
  };

  // Filter data based on active tab
  const getFilteredData = () => {
    let filtered = [];

    switch (activeTab) {
      case 'separations':
        filtered = [...separations];
        if (statusFilter !== 'all') {
          filtered = filtered.filter((s) => s.status === statusFilter);
        }
        if (typeFilter !== 'all') {
          filtered = filtered.filter((s) => s.separationTypeId === parseInt(typeFilter));
        }
        if (searchTerm) {
          filtered = filtered.filter((s) => {
            const empName = getEmployeeName(s.employeeId).toLowerCase();
            return empName.includes(searchTerm.toLowerCase());
          });
        }
        break;
      case 'clearances':
        filtered = [...clearances];
        if (statusFilter !== 'all') {
          filtered = filtered.filter((c) => c.status === statusFilter);
        }
        break;
      case 'settlements':
        filtered = [...settlements];
        if (statusFilter !== 'all') {
          filtered = filtered.filter((s) => s.status === statusFilter);
        }
        break;
      case 'certificates':
        filtered = [...certificates];
        if (searchTerm) {
          filtered = filtered.filter((c) => {
            const sep = separations.find((s) => s.id === c.separationId);
            if (!sep) return false;
            const empName = getEmployeeName(sep.employeeId).toLowerCase();
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

  // CRUD handlers for Separations
  const handleSaveSeparation = async () => {
    try {
      if (!separationForm.employeeId || !separationForm.separationTypeId || !separationForm.effectiveDate) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      const data = {
        ...separationForm,
        employeeId: parseInt(separationForm.employeeId),
        separationTypeId: parseInt(separationForm.separationTypeId),
        noticePeriodDays: parseInt(separationForm.noticePeriodDays),
      };

      if (isEditing && selectedRecord) {
        await separationRecordDB.update(selectedRecord.id, data);
        showToast('Separation record updated successfully');
      } else {
        await separationRecordDB.add(data);
        showToast('Separation record created successfully');
      }

      await loadData();
      closeSeparationModal();
    } catch (error) {
      console.error('Error saving separation:', error);
      showToast('Error saving separation record', 'error');
    }
  };

  // CRUD handlers for Clearances
  const handleSaveClearance = async () => {
    try {
      if (!clearanceForm.separationId || !clearanceForm.departmentId) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      const data = {
        ...clearanceForm,
        separationId: parseInt(clearanceForm.separationId),
        departmentId: parseInt(clearanceForm.departmentId),
        clearedBy: clearanceForm.clearedBy ? parseInt(clearanceForm.clearedBy) : null,
      };

      if (isEditing && selectedRecord) {
        await exitClearanceDB.update(selectedRecord.id, data);
        showToast('Clearance updated successfully');
      } else {
        await exitClearanceDB.add(data);
        showToast('Clearance added successfully');
      }

      await loadData();
      closeClearanceModal();
    } catch (error) {
      console.error('Error saving clearance:', error);
      showToast('Error saving clearance', 'error');
    }
  };

  // CRUD handlers for Settlements
  const handleSaveSettlement = async () => {
    try {
      if (!settlementForm.separationId) {
        showToast('Please select a separation record', 'error');
        return;
      }

      const data = {
        ...settlementForm,
        separationId: parseInt(settlementForm.separationId),
        basicSalary: parseFloat(settlementForm.basicSalary) || 0,
        leaveEncashment: parseFloat(settlementForm.leaveEncashment) || 0,
        gratuity: parseFloat(settlementForm.gratuity) || 0,
        deductions: parseFloat(settlementForm.deductions) || 0,
        totalAmount:
          parseFloat(settlementForm.basicSalary || 0) +
          parseFloat(settlementForm.leaveEncashment || 0) +
          parseFloat(settlementForm.gratuity || 0) -
          parseFloat(settlementForm.deductions || 0),
      };

      if (isEditing && selectedRecord) {
        await finalSettlementDB.update(selectedRecord.id, data);
        showToast('Settlement updated successfully');
      } else {
        await finalSettlementDB.add(data);
        showToast('Settlement created successfully');
      }

      await loadData();
      closeSettlementModal();
    } catch (error) {
      console.error('Error saving settlement:', error);
      showToast('Error saving settlement', 'error');
    }
  };

  // CRUD handlers for Certificates
  const handleSaveCertificate = async () => {
    try {
      if (!certificateForm.separationId || !certificateForm.issueDate) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      const data = {
        ...certificateForm,
        separationId: parseInt(certificateForm.separationId),
        issuedBy: certificateForm.issuedBy ? parseInt(certificateForm.issuedBy) : null,
      };

      if (isEditing && selectedRecord) {
        await workCertificateDB.update(selectedRecord.id, data);
        showToast('Certificate updated successfully');
      } else {
        await workCertificateDB.add(data);
        showToast('Certificate created successfully');
      }

      await loadData();
      closeCertificateModal();
    } catch (error) {
      console.error('Error saving certificate:', error);
      showToast('Error saving certificate', 'error');
    }
  };

  // CRUD handlers for Interviews
  const handleSaveInterview = async () => {
    try {
      if (!interviewForm.separationId || !interviewForm.interviewDate) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      const data = {
        ...interviewForm,
        separationId: parseInt(interviewForm.separationId),
        interviewerId: interviewForm.interviewerId ? parseInt(interviewForm.interviewerId) : null,
      };

      if (isEditing && selectedRecord) {
        await exitInterviewDB.update(selectedRecord.id, data);
        showToast('Interview updated successfully');
      } else {
        await exitInterviewDB.add(data);
        showToast('Exit interview recorded successfully');
      }

      await loadData();
      closeInterviewModal();
    } catch (error) {
      console.error('Error saving interview:', error);
      showToast('Error saving interview', 'error');
    }
  };

  // Delete handler
  const handleDelete = async () => {
    try {
      switch (activeTab) {
        case 'separations':
          await separationRecordDB.delete(selectedRecord.id);
          break;
        case 'clearances':
          await exitClearanceDB.delete(selectedRecord.id);
          break;
        case 'settlements':
          await finalSettlementDB.delete(selectedRecord.id);
          break;
        case 'certificates':
          await workCertificateDB.delete(selectedRecord.id);
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
  const openSeparationModal = (separation = null) => {
    if (separation) {
      setIsEditing(true);
      setSelectedRecord(separation);
      setSeparationForm({
        employeeId: separation.employeeId?.toString() || '',
        separationTypeId: separation.separationTypeId?.toString() || '',
        requestDate: separation.requestDate || '',
        effectiveDate: separation.effectiveDate || '',
        lastWorkingDay: separation.lastWorkingDay || '',
        reason: separation.reason || '',
        status: separation.status || 'pending',
        noticePeriodDays: separation.noticePeriodDays || 30,
      });
    } else {
      setIsEditing(false);
      setSelectedRecord(null);
      const today = new Date().toISOString().split('T')[0];
      setSeparationForm({
        employeeId: '',
        separationTypeId: '',
        requestDate: today,
        effectiveDate: '',
        lastWorkingDay: '',
        reason: '',
        status: 'pending',
        noticePeriodDays: 30,
      });
    }
    setShowSeparationModal(true);
  };

  const closeSeparationModal = () => {
    setShowSeparationModal(false);
    setSelectedRecord(null);
    setIsEditing(false);
  };

  const openClearanceModal = (clearance = null, separationId = null) => {
    if (clearance) {
      setIsEditing(true);
      setSelectedRecord(clearance);
      setClearanceForm({
        separationId: clearance.separationId?.toString() || '',
        departmentId: clearance.departmentId?.toString() || '',
        status: clearance.status || 'pending',
        clearedBy: clearance.clearedBy?.toString() || '',
        clearedDate: clearance.clearedDate || '',
        remarks: clearance.remarks || '',
      });
    } else {
      setIsEditing(false);
      setSelectedRecord(null);
      setClearanceForm({
        separationId: separationId?.toString() || '',
        departmentId: '',
        status: 'pending',
        clearedBy: '',
        clearedDate: '',
        remarks: '',
      });
    }
    setShowClearanceModal(true);
  };

  const closeClearanceModal = () => {
    setShowClearanceModal(false);
    setSelectedRecord(null);
    setIsEditing(false);
  };

  const openSettlementModal = (settlement = null, separationId = null) => {
    if (settlement) {
      setIsEditing(true);
      setSelectedRecord(settlement);
      setSettlementForm({
        separationId: settlement.separationId?.toString() || '',
        basicSalary: settlement.basicSalary || 0,
        leaveEncashment: settlement.leaveEncashment || 0,
        gratuity: settlement.gratuity || 0,
        deductions: settlement.deductions || 0,
        totalAmount: settlement.totalAmount || 0,
        status: settlement.status || 'draft',
        paymentDate: settlement.paymentDate || '',
      });
    } else {
      setIsEditing(false);
      setSelectedRecord(null);
      setSettlementForm({
        separationId: separationId?.toString() || '',
        basicSalary: 0,
        leaveEncashment: 0,
        gratuity: 0,
        deductions: 0,
        totalAmount: 0,
        status: 'draft',
        paymentDate: '',
      });
    }
    setShowSettlementModal(true);
  };

  const closeSettlementModal = () => {
    setShowSettlementModal(false);
    setSelectedRecord(null);
    setIsEditing(false);
  };

  const openCertificateModal = (certificate = null, separationId = null) => {
    if (certificate) {
      setIsEditing(true);
      setSelectedRecord(certificate);
      setCertificateForm({
        separationId: certificate.separationId?.toString() || '',
        certificateType: certificate.certificateType || 'experience',
        issueDate: certificate.issueDate || '',
        content: certificate.content || '',
        issuedBy: certificate.issuedBy?.toString() || '',
      });
    } else {
      setIsEditing(false);
      setSelectedRecord(null);
      setCertificateForm({
        separationId: separationId?.toString() || '',
        certificateType: 'experience',
        issueDate: new Date().toISOString().split('T')[0],
        content: '',
        issuedBy: '',
      });
    }
    setShowCertificateModal(true);
  };

  const closeCertificateModal = () => {
    setShowCertificateModal(false);
    setSelectedRecord(null);
    setIsEditing(false);
  };

  const openInterviewModal = (interview = null, separationId = null) => {
    if (interview) {
      setIsEditing(true);
      setSelectedRecord(interview);
      setInterviewForm({
        separationId: interview.separationId?.toString() || '',
        interviewDate: interview.interviewDate || '',
        interviewerId: interview.interviewerId?.toString() || '',
        reasonForLeaving: interview.reasonForLeaving || '',
        feedback: interview.feedback || '',
        suggestions: interview.suggestions || '',
        wouldRecommend: interview.wouldRecommend !== false,
        wouldRejoin: interview.wouldRejoin !== false,
      });
    } else {
      setIsEditing(false);
      setSelectedRecord(null);
      setInterviewForm({
        separationId: separationId?.toString() || '',
        interviewDate: new Date().toISOString().split('T')[0],
        interviewerId: '',
        reasonForLeaving: '',
        feedback: '',
        suggestions: '',
        wouldRecommend: true,
        wouldRejoin: true,
      });
    }
    setShowInterviewModal(true);
  };

  const closeInterviewModal = () => {
    setShowInterviewModal(false);
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
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      clearance: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      cleared: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    };
    const labels = {
      pending: 'Pending',
      approved: 'Approved',
      clearance: 'Clearance',
      completed: 'Completed',
      cancelled: 'Cancelled',
      cleared: 'Cleared',
      draft: 'Draft',
      paid: 'Paid',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Calculate clearance progress
  const getClearanceProgress = (separationId) => {
    const sepClearances = clearances.filter((c) => c.separationId === separationId);
    if (sepClearances.length === 0) return { total: 0, cleared: 0 };
    const cleared = sepClearances.filter((c) => c.status === 'cleared').length;
    return { total: sepClearances.length, cleared };
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exit Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage employee separations, clearances, and final settlements
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'separations' && (
            <button
              onClick={() => openSeparationModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Separation
            </button>
          )}
          {activeTab === 'clearances' && (
            <button
              onClick={() => openClearanceModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Clearance
            </button>
          )}
          {activeTab === 'settlements' && (
            <button
              onClick={() => openSettlementModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Settlement
            </button>
          )}
          {activeTab === 'certificates' && (
            <button
              onClick={() => openCertificateModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Issue Certificate
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <UserMinus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">In Process</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inProcess}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <ClipboardCheck className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Clearance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingClearance}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Settled</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.settled}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Certificates</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.certificates}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'separations', label: 'Active Separations', icon: UserMinus },
            { id: 'clearances', label: 'Exit Clearances', icon: ClipboardCheck },
            { id: 'settlements', label: 'Final Settlements', icon: DollarSign },
            { id: 'certificates', label: 'Certificates Issued', icon: FileText },
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
        {(activeTab === 'separations' || activeTab === 'certificates') && (
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
        )}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          {activeTab === 'separations' && (
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {separationTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          )}
          {(activeTab === 'separations' || activeTab === 'clearances' || activeTab === 'settlements') && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              {activeTab === 'separations' && (
                <>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="clearance">Clearance</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </>
              )}
              {activeTab === 'clearances' && (
                <>
                  <option value="pending">Pending</option>
                  <option value="cleared">Cleared</option>
                </>
              )}
              {activeTab === 'settlements' && (
                <>
                  <option value="draft">Draft</option>
                  <option value="paid">Paid</option>
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
              {activeTab === 'separations' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Effective Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Clearance</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </>
              )}
              {activeTab === 'clearances' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cleared By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </>
              )}
              {activeTab === 'settlements' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </>
              )}
              {activeTab === 'certificates' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Issue Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Issued By</th>
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
              paginatedData.map((record) => {
                // Get employee for this record
                let employeeId = record.employeeId;
                if (activeTab !== 'separations') {
                  const sep = separations.find((s) => s.id === record.separationId);
                  employeeId = sep?.employeeId;
                }

                return (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    {activeTab === 'separations' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {getEmployeeName(record.employeeId)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                          {getSeparationTypeName(record.separationTypeId)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                          {record.effectiveDate ? new Date(record.effectiveDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(record.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(() => {
                            const progress = getClearanceProgress(record.id);
                            if (progress.total === 0) return <span className="text-gray-400">-</span>;
                            return (
                              <span className="text-gray-600 dark:text-gray-400">
                                {progress.cleared}/{progress.total} cleared
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openViewModal(record)}
                              className="p-1 text-gray-600 hover:bg-gray-100 rounded dark:text-gray-400 dark:hover:bg-gray-700"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openInterviewModal(null, record.id)}
                              className="p-1 text-purple-600 hover:bg-purple-100 rounded dark:hover:bg-purple-900"
                              title="Exit Interview"
                            >
                              <ClipboardCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openSeparationModal(record)}
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
                      </>
                    )}
                    {activeTab === 'clearances' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {getEmployeeName(employeeId)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            {getDepartmentName(record.departmentId)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(record.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                          {record.clearedBy ? getEmployeeName(record.clearedBy) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                          {record.clearedDate ? new Date(record.clearedDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openClearanceModal(record)}
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
                      </>
                    )}
                    {activeTab === 'settlements' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {getEmployeeName(employeeId)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900 dark:text-white">
                            ${record.totalAmount?.toLocaleString() || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(record.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                          {record.paymentDate ? new Date(record.paymentDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openViewModal(record)}
                              className="p-1 text-gray-600 hover:bg-gray-100 rounded dark:text-gray-400 dark:hover:bg-gray-700"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openSettlementModal(record)}
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
                      </>
                    )}
                    {activeTab === 'certificates' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {getEmployeeName(employeeId)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400 capitalize">
                          {record.certificateType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                          {record.issueDate ? new Date(record.issueDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                          {record.issuedBy ? getEmployeeName(record.issuedBy) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openCertificateModal(record)}
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
                      </>
                    )}
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
              {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} records
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

      {/* Separation Modal */}
      {showSeparationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Separation' : 'New Separation Record'}
              </h2>
              <button onClick={closeSeparationModal} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee *</label>
                  <select
                    value={separationForm.employeeId}
                    onChange={(e) => setSeparationForm({ ...separationForm, employeeId: e.target.value })}
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Separation Type *</label>
                  <select
                    value={separationForm.separationTypeId}
                    onChange={(e) => setSeparationForm({ ...separationForm, separationTypeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Type</option>
                    {separationTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Request Date</label>
                  <input
                    type="date"
                    value={separationForm.requestDate}
                    onChange={(e) => setSeparationForm({ ...separationForm, requestDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Effective Date *</label>
                  <input
                    type="date"
                    value={separationForm.effectiveDate}
                    onChange={(e) => setSeparationForm({ ...separationForm, effectiveDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Working Day</label>
                  <input
                    type="date"
                    value={separationForm.lastWorkingDay}
                    onChange={(e) => setSeparationForm({ ...separationForm, lastWorkingDay: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={separationForm.status}
                    onChange={(e) => setSeparationForm({ ...separationForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="clearance">Clearance</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notice Period (days)</label>
                  <input
                    type="number"
                    value={separationForm.noticePeriodDays}
                    onChange={(e) => setSeparationForm({ ...separationForm, noticePeriodDays: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                <textarea
                  value={separationForm.reason}
                  onChange={(e) => setSeparationForm({ ...separationForm, reason: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Reason for separation..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={closeSeparationModal} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={handleSaveSeparation} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{isEditing ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Clearance Modal */}
      {showClearanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Clearance' : 'Add Exit Clearance'}
              </h2>
              <button onClick={closeClearanceModal} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Separation Record *</label>
                <select
                  value={clearanceForm.separationId}
                  onChange={(e) => setClearanceForm({ ...clearanceForm, separationId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Separation</option>
                  {separations.map((sep) => (
                    <option key={sep.id} value={sep.id}>
                      {getEmployeeName(sep.employeeId)} - {getSeparationTypeName(sep.separationTypeId)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department *</label>
                <select
                  value={clearanceForm.departmentId}
                  onChange={(e) => setClearanceForm({ ...clearanceForm, departmentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={clearanceForm.status}
                    onChange={(e) => setClearanceForm({ ...clearanceForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="cleared">Cleared</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cleared Date</label>
                  <input
                    type="date"
                    value={clearanceForm.clearedDate}
                    onChange={(e) => setClearanceForm({ ...clearanceForm, clearedDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cleared By</label>
                <select
                  value={clearanceForm.clearedBy}
                  onChange={(e) => setClearanceForm({ ...clearanceForm, clearedBy: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remarks</label>
                <textarea
                  value={clearanceForm.remarks}
                  onChange={(e) => setClearanceForm({ ...clearanceForm, remarks: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Any remarks..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={closeClearanceModal} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={handleSaveClearance} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{isEditing ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Settlement Modal */}
      {showSettlementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Settlement' : 'New Final Settlement'}
              </h2>
              <button onClick={closeSettlementModal} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Separation Record *</label>
                <select
                  value={settlementForm.separationId}
                  onChange={(e) => setSettlementForm({ ...settlementForm, separationId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Separation</option>
                  {separations.map((sep) => (
                    <option key={sep.id} value={sep.id}>
                      {getEmployeeName(sep.employeeId)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Basic Salary</label>
                  <input
                    type="number"
                    value={settlementForm.basicSalary}
                    onChange={(e) => setSettlementForm({ ...settlementForm, basicSalary: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Leave Encashment</label>
                  <input
                    type="number"
                    value={settlementForm.leaveEncashment}
                    onChange={(e) => setSettlementForm({ ...settlementForm, leaveEncashment: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gratuity</label>
                  <input
                    type="number"
                    value={settlementForm.gratuity}
                    onChange={(e) => setSettlementForm({ ...settlementForm, gratuity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deductions</label>
                  <input
                    type="number"
                    value={settlementForm.deductions}
                    onChange={(e) => setSettlementForm({ ...settlementForm, deductions: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Total Amount</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    ${(
                      parseFloat(settlementForm.basicSalary || 0) +
                      parseFloat(settlementForm.leaveEncashment || 0) +
                      parseFloat(settlementForm.gratuity || 0) -
                      parseFloat(settlementForm.deductions || 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={settlementForm.status}
                    onChange={(e) => setSettlementForm({ ...settlementForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={settlementForm.paymentDate}
                    onChange={(e) => setSettlementForm({ ...settlementForm, paymentDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={closeSettlementModal} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={handleSaveSettlement} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{isEditing ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Certificate' : 'Issue Work Certificate'}
              </h2>
              <button onClick={closeCertificateModal} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Separation Record *</label>
                <select
                  value={certificateForm.separationId}
                  onChange={(e) => setCertificateForm({ ...certificateForm, separationId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Separation</option>
                  {separations.map((sep) => (
                    <option key={sep.id} value={sep.id}>
                      {getEmployeeName(sep.employeeId)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Certificate Type</label>
                  <select
                    value={certificateForm.certificateType}
                    onChange={(e) => setCertificateForm({ ...certificateForm, certificateType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="experience">Experience Certificate</option>
                    <option value="service">Service Certificate</option>
                    <option value="relieving">Relieving Letter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Date *</label>
                  <input
                    type="date"
                    value={certificateForm.issueDate}
                    onChange={(e) => setCertificateForm({ ...certificateForm, issueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issued By</label>
                <select
                  value={certificateForm.issuedBy}
                  onChange={(e) => setCertificateForm({ ...certificateForm, issuedBy: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
                <textarea
                  value={certificateForm.content}
                  onChange={(e) => setCertificateForm({ ...certificateForm, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Certificate content..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={closeCertificateModal} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={handleSaveCertificate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{isEditing ? 'Update' : 'Issue'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Interview Modal */}
      {showInterviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Exit Interview' : 'Exit Interview Form'}
              </h2>
              <button onClick={closeInterviewModal} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Separation Record *</label>
                  <select
                    value={interviewForm.separationId}
                    onChange={(e) => setInterviewForm({ ...interviewForm, separationId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Separation</option>
                    {separations.map((sep) => (
                      <option key={sep.id} value={sep.id}>
                        {getEmployeeName(sep.employeeId)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interview Date *</label>
                  <input
                    type="date"
                    value={interviewForm.interviewDate}
                    onChange={(e) => setInterviewForm({ ...interviewForm, interviewDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interviewer</label>
                <select
                  value={interviewForm.interviewerId}
                  onChange={(e) => setInterviewForm({ ...interviewForm, interviewerId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Interviewer</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason for Leaving</label>
                <textarea
                  value={interviewForm.reasonForLeaving}
                  onChange={(e) => setInterviewForm({ ...interviewForm, reasonForLeaving: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Main reason for leaving..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Feedback about Organization</label>
                <textarea
                  value={interviewForm.feedback}
                  onChange={(e) => setInterviewForm({ ...interviewForm, feedback: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="General feedback..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Suggestions for Improvement</label>
                <textarea
                  value={interviewForm.suggestions}
                  onChange={(e) => setInterviewForm({ ...interviewForm, suggestions: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Suggestions..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="wouldRecommend"
                    checked={interviewForm.wouldRecommend}
                    onChange={(e) => setInterviewForm({ ...interviewForm, wouldRecommend: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="wouldRecommend" className="text-sm text-gray-700 dark:text-gray-300">Would recommend to others</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="wouldRejoin"
                    checked={interviewForm.wouldRejoin}
                    onChange={(e) => setInterviewForm({ ...interviewForm, wouldRejoin: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="wouldRejoin" className="text-sm text-gray-700 dark:text-gray-300">Would consider rejoining</label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={closeInterviewModal} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={handleSaveInterview} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{isEditing ? 'Update' : 'Save'}</button>
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
                {activeTab === 'separations' ? 'Separation Details' : 'Settlement Details'}
              </h2>
              <button onClick={() => setShowViewModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {activeTab === 'separations' && (
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
                      <p className="text-sm text-gray-500 dark:text-gray-400">Separation Type</p>
                      <p className="font-medium text-gray-900 dark:text-white">{getSeparationTypeName(selectedRecord.separationTypeId)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Effective Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedRecord.effectiveDate ? new Date(selectedRecord.effectiveDate).toLocaleDateString() : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Last Working Day</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedRecord.lastWorkingDay ? new Date(selectedRecord.lastWorkingDay).toLocaleDateString() : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Notice Period</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedRecord.noticePeriodDays} days</p>
                    </div>
                  </div>
                  {selectedRecord.reason && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Reason</p>
                      <p className="text-gray-900 dark:text-white">{selectedRecord.reason}</p>
                    </div>
                  )}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Clearance Status</h3>
                    {clearances.filter((c) => c.separationId === selectedRecord.id).length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400">No clearances initiated.</p>
                    ) : (
                      <div className="space-y-2">
                        {clearances.filter((c) => c.separationId === selectedRecord.id).map((cl) => (
                          <div key={cl.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <span className="text-gray-900 dark:text-white">{getDepartmentName(cl.departmentId)}</span>
                            {getStatusBadge(cl.status)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
              {activeTab === 'settlements' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Employee</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {(() => {
                          const sep = separations.find((s) => s.id === selectedRecord.separationId);
                          return sep ? getEmployeeName(sep.employeeId) : '-';
                        })()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                      <div>{getStatusBadge(selectedRecord.status)}</div>
                    </div>
                  </div>
                  <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Basic Salary</span>
                      <span className="text-gray-900 dark:text-white">${selectedRecord.basicSalary?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Leave Encashment</span>
                      <span className="text-gray-900 dark:text-white">${selectedRecord.leaveEncashment?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Gratuity</span>
                      <span className="text-gray-900 dark:text-white">${selectedRecord.gratuity?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Deductions</span>
                      <span>-${selectedRecord.deductions?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-300 dark:border-gray-600 pt-2 font-bold">
                      <span className="text-gray-900 dark:text-white">Total</span>
                      <span className="text-gray-900 dark:text-white">${selectedRecord.totalAmount?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                  {selectedRecord.paymentDate && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Payment Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">{new Date(selectedRecord.paymentDate).toLocaleDateString()}</p>
                    </div>
                  )}
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
