import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  FileWarning,
  Scale,
  ShieldCheck,
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
  Users,
} from 'lucide-react';
import {
  conductAcknowledgmentDB,
  pseaDeclarationDB,
  coiDeclarationDB,
  disciplinaryTypeDB,
  disciplinaryActionDB,
  grievanceTypeDB,
  grievanceDB,
  grievanceInvestigationDB,
  grievanceResolutionDB,
  employeeDB,
  seedAllDefaults,
} from '../../services/db/indexedDB';

export default function DisciplinaryGrievance() {
  // Data state
  const [conductAcks, setConductAcks] = useState([]);
  const [pseaDeclarations, setPseaDeclarations] = useState([]);
  const [coiDeclarations, setCoiDeclarations] = useState([]);
  const [disciplinaryTypes, setDisciplinaryTypes] = useState([]);
  const [disciplinaryActions, setDisciplinaryActions] = useState([]);
  const [grievanceTypes, setGrievanceTypes] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [investigations, setInvestigations] = useState([]);
  const [resolutions, setResolutions] = useState([]);
  const [employees, setEmployees] = useState([]);

  // UI state
  const [activeTab, setActiveTab] = useState('disciplinary');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal state
  const [showDisciplinaryModal, setShowDisciplinaryModal] = useState(false);
  const [showGrievanceModal, setShowGrievanceModal] = useState(false);
  const [showConductModal, setShowConductModal] = useState(false);
  const [showPseaModal, setShowPseaModal] = useState(false);
  const [showCoiModal, setShowCoiModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Form states
  const [disciplinaryForm, setDisciplinaryForm] = useState({
    employeeId: '', typeId: '', incidentDate: '', description: '', actionTaken: '', status: 'open', issuedBy: '', issueDate: '',
  });

  const [grievanceForm, setGrievanceForm] = useState({
    employeeId: '', typeId: '', filedDate: '', description: '', status: 'open', priority: 'medium',
  });

  const [conductForm, setConductForm] = useState({
    employeeId: '', acknowledgedDate: '', policyVersion: '', signature: true,
  });

  const [pseaForm, setPseaForm] = useState({
    employeeId: '', declarationDate: '', acknowledged: true, notes: '',
  });

  const [coiForm, setCoiForm] = useState({
    employeeId: '', declarationDate: '', hasConflict: false, conflictDescription: '', status: 'pending',
  });

  // Load data
  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await seedAllDefaults();
      const [acksData, pseaData, coiData, discTypesData, discActionsData, grTypes, grData, invData, resData, empData] = await Promise.all([
        conductAcknowledgmentDB.getAll(), pseaDeclarationDB.getAll(), coiDeclarationDB.getAll(),
        disciplinaryTypeDB.getAll(), disciplinaryActionDB.getAll(), grievanceTypeDB.getAll(),
        grievanceDB.getAll(), grievanceInvestigationDB.getAll(), grievanceResolutionDB.getAll(), employeeDB.getAll(),
      ]);
      setConductAcks(acksData); setPseaDeclarations(pseaData); setCoiDeclarations(coiData);
      setDisciplinaryTypes(discTypesData); setDisciplinaryActions(discActionsData);
      setGrievanceTypes(grTypes); setGrievances(grData); setInvestigations(invData);
      setResolutions(resData); setEmployees(empData);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Error loading data', 'error');
    } finally { setLoading(false); }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Statistics
  const stats = {
    openCases: disciplinaryActions.filter(d => d.status === 'open').length,
    openGrievances: grievances.filter(g => g.status === 'open').length,
    pendingDeclarations: coiDeclarations.filter(c => c.status === 'pending').length,
    resolvedThisMonth: (() => {
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      return resolutions.filter(r => {
        const d = new Date(r.resolutionDate);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      }).length;
    })(),
  };

  const getEmployeeName = (id) => {
    const emp = employees.find(e => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
  };

  const getTypeName = (typeId, types) => {
    const type = types.find(t => t.id === typeId);
    return type ? type.name : 'Unknown';
  };

  // Filter data
  const getFilteredData = () => {
    let filtered = [];
    switch (activeTab) {
      case 'disciplinary': filtered = [...disciplinaryActions]; break;
      case 'grievances': filtered = [...grievances]; break;
      case 'conduct': filtered = [...conductAcks]; break;
      case 'psea': filtered = [...pseaDeclarations]; break;
      case 'coi': filtered = [...coiDeclarations]; break;
      default: break;
    }
    if (statusFilter !== 'all' && ['disciplinary', 'grievances', 'coi'].includes(activeTab)) {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    if (searchTerm) {
      filtered = filtered.filter(r => getEmployeeName(r.employeeId).toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return filtered;
  };

  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // CRUD handlers
  const handleSaveDisciplinary = async () => {
    try {
      if (!disciplinaryForm.employeeId || !disciplinaryForm.incidentDate) { showToast('Please fill required fields', 'error'); return; }
      const data = { ...disciplinaryForm, employeeId: parseInt(disciplinaryForm.employeeId), typeId: disciplinaryForm.typeId ? parseInt(disciplinaryForm.typeId) : null, issuedBy: disciplinaryForm.issuedBy ? parseInt(disciplinaryForm.issuedBy) : null };
      if (isEditing && selectedRecord) { await disciplinaryActionDB.update(selectedRecord.id, data); showToast('Updated successfully'); }
      else { await disciplinaryActionDB.add(data); showToast('Created successfully'); }
      await loadData(); closeDisciplinaryModal();
    } catch (error) { showToast('Error saving', 'error'); }
  };

  const handleSaveGrievance = async () => {
    try {
      if (!grievanceForm.employeeId || !grievanceForm.filedDate) { showToast('Please fill required fields', 'error'); return; }
      const data = { ...grievanceForm, employeeId: parseInt(grievanceForm.employeeId), typeId: grievanceForm.typeId ? parseInt(grievanceForm.typeId) : null };
      if (isEditing && selectedRecord) { await grievanceDB.update(selectedRecord.id, data); showToast('Updated successfully'); }
      else { await grievanceDB.add(data); showToast('Created successfully'); }
      await loadData(); closeGrievanceModal();
    } catch (error) { showToast('Error saving', 'error'); }
  };

  const handleSaveConduct = async () => {
    try {
      if (!conductForm.employeeId || !conductForm.acknowledgedDate) { showToast('Please fill required fields', 'error'); return; }
      const data = { ...conductForm, employeeId: parseInt(conductForm.employeeId) };
      if (isEditing && selectedRecord) { await conductAcknowledgmentDB.update(selectedRecord.id, data); showToast('Updated successfully'); }
      else { await conductAcknowledgmentDB.add(data); showToast('Created successfully'); }
      await loadData(); closeConductModal();
    } catch (error) { showToast('Error saving', 'error'); }
  };

  const handleSavePsea = async () => {
    try {
      if (!pseaForm.employeeId || !pseaForm.declarationDate) { showToast('Please fill required fields', 'error'); return; }
      const data = { ...pseaForm, employeeId: parseInt(pseaForm.employeeId) };
      if (isEditing && selectedRecord) { await pseaDeclarationDB.update(selectedRecord.id, data); showToast('Updated successfully'); }
      else { await pseaDeclarationDB.add(data); showToast('Created successfully'); }
      await loadData(); closePseaModal();
    } catch (error) { showToast('Error saving', 'error'); }
  };

  const handleSaveCoi = async () => {
    try {
      if (!coiForm.employeeId || !coiForm.declarationDate) { showToast('Please fill required fields', 'error'); return; }
      const data = { ...coiForm, employeeId: parseInt(coiForm.employeeId) };
      if (isEditing && selectedRecord) { await coiDeclarationDB.update(selectedRecord.id, data); showToast('Updated successfully'); }
      else { await coiDeclarationDB.add(data); showToast('Created successfully'); }
      await loadData(); closeCoiModal();
    } catch (error) { showToast('Error saving', 'error'); }
  };

  const handleDelete = async () => {
    try {
      switch (activeTab) {
        case 'disciplinary': await disciplinaryActionDB.delete(selectedRecord.id); break;
        case 'grievances': await grievanceDB.delete(selectedRecord.id); break;
        case 'conduct': await conductAcknowledgmentDB.delete(selectedRecord.id); break;
        case 'psea': await pseaDeclarationDB.delete(selectedRecord.id); break;
        case 'coi': await coiDeclarationDB.delete(selectedRecord.id); break;
      }
      showToast('Deleted successfully'); await loadData();
      setShowDeleteModal(false); setSelectedRecord(null);
    } catch (error) { showToast('Error deleting', 'error'); }
  };

  // Modal handlers
  const openDisciplinaryModal = (record = null) => {
    if (record) { setIsEditing(true); setSelectedRecord(record); setDisciplinaryForm({ employeeId: record.employeeId?.toString() || '', typeId: record.typeId?.toString() || '', incidentDate: record.incidentDate || '', description: record.description || '', actionTaken: record.actionTaken || '', status: record.status || 'open', issuedBy: record.issuedBy?.toString() || '', issueDate: record.issueDate || '' }); }
    else { setIsEditing(false); setSelectedRecord(null); setDisciplinaryForm({ employeeId: '', typeId: '', incidentDate: new Date().toISOString().split('T')[0], description: '', actionTaken: '', status: 'open', issuedBy: '', issueDate: '' }); }
    setShowDisciplinaryModal(true);
  };
  const closeDisciplinaryModal = () => { setShowDisciplinaryModal(false); setSelectedRecord(null); setIsEditing(false); };

  const openGrievanceModal = (record = null) => {
    if (record) { setIsEditing(true); setSelectedRecord(record); setGrievanceForm({ employeeId: record.employeeId?.toString() || '', typeId: record.typeId?.toString() || '', filedDate: record.filedDate || '', description: record.description || '', status: record.status || 'open', priority: record.priority || 'medium' }); }
    else { setIsEditing(false); setSelectedRecord(null); setGrievanceForm({ employeeId: '', typeId: '', filedDate: new Date().toISOString().split('T')[0], description: '', status: 'open', priority: 'medium' }); }
    setShowGrievanceModal(true);
  };
  const closeGrievanceModal = () => { setShowGrievanceModal(false); setSelectedRecord(null); setIsEditing(false); };

  const openConductModal = (record = null) => {
    if (record) { setIsEditing(true); setSelectedRecord(record); setConductForm({ employeeId: record.employeeId?.toString() || '', acknowledgedDate: record.acknowledgedDate || '', policyVersion: record.policyVersion || '', signature: record.signature !== false }); }
    else { setIsEditing(false); setSelectedRecord(null); setConductForm({ employeeId: '', acknowledgedDate: new Date().toISOString().split('T')[0], policyVersion: '1.0', signature: true }); }
    setShowConductModal(true);
  };
  const closeConductModal = () => { setShowConductModal(false); setSelectedRecord(null); setIsEditing(false); };

  const openPseaModal = (record = null) => {
    if (record) { setIsEditing(true); setSelectedRecord(record); setPseaForm({ employeeId: record.employeeId?.toString() || '', declarationDate: record.declarationDate || '', acknowledged: record.acknowledged !== false, notes: record.notes || '' }); }
    else { setIsEditing(false); setSelectedRecord(null); setPseaForm({ employeeId: '', declarationDate: new Date().toISOString().split('T')[0], acknowledged: true, notes: '' }); }
    setShowPseaModal(true);
  };
  const closePseaModal = () => { setShowPseaModal(false); setSelectedRecord(null); setIsEditing(false); };

  const openCoiModal = (record = null) => {
    if (record) { setIsEditing(true); setSelectedRecord(record); setCoiForm({ employeeId: record.employeeId?.toString() || '', declarationDate: record.declarationDate || '', hasConflict: record.hasConflict === true, conflictDescription: record.conflictDescription || '', status: record.status || 'pending' }); }
    else { setIsEditing(false); setSelectedRecord(null); setCoiForm({ employeeId: '', declarationDate: new Date().toISOString().split('T')[0], hasConflict: false, conflictDescription: '', status: 'pending' }); }
    setShowCoiModal(true);
  };
  const closeCoiModal = () => { setShowCoiModal(false); setSelectedRecord(null); setIsEditing(false); };

  const openViewModal = (record) => { setSelectedRecord(record); setShowViewModal(true); };
  const openDeleteModal = (record) => { setSelectedRecord(record); setShowDeleteModal(true); };

  const getStatusBadge = (status) => {
    const styles = { open: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', investigating: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.open}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
  };

  const getPriorityBadge = (priority) => {
    const styles = { high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[priority] || styles.medium}`}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</span>;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Disciplinary & Grievance</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage disciplinary cases, grievances, and declarations</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'disciplinary' && <button onClick={() => openDisciplinaryModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" />New Case</button>}
          {activeTab === 'grievances' && <button onClick={() => openGrievanceModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" />New Grievance</button>}
          {activeTab === 'conduct' && <button onClick={() => openConductModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" />New Acknowledgment</button>}
          {activeTab === 'psea' && <button onClick={() => openPseaModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" />New PSEA</button>}
          {activeTab === 'coi' && <button onClick={() => openCoiModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" />New COI</button>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"><div className="flex items-center gap-3"><div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg"><AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" /></div><div><p className="text-sm text-gray-600 dark:text-gray-400">Open Cases</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.openCases}</p></div></div></div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"><div className="flex items-center gap-3"><div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg"><Scale className="w-6 h-6 text-orange-600 dark:text-orange-400" /></div><div><p className="text-sm text-gray-600 dark:text-gray-400">Open Grievances</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.openGrievances}</p></div></div></div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"><div className="flex items-center gap-3"><div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg"><Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" /></div><div><p className="text-sm text-gray-600 dark:text-gray-400">Pending COIs</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingDeclarations}</p></div></div></div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg"><CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" /></div><div><p className="text-sm text-gray-600 dark:text-gray-400">Resolved This Month</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.resolvedThisMonth}</p></div></div></div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[{ id: 'disciplinary', label: 'Disciplinary Cases', icon: AlertTriangle }, { id: 'grievances', label: 'Grievances', icon: Scale }, { id: 'conduct', label: 'Conduct Acknowledgments', icon: FileCheck }, { id: 'psea', label: 'PSEA Declarations', icon: ShieldCheck }, { id: 'coi', label: 'COI Declarations', icon: FileWarning }].map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setCurrentPage(1); setStatusFilter('all'); setSearchTerm(''); }} className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="text" placeholder="Search by employee..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" /></div>
        {['disciplinary', 'grievances', 'coi'].includes(activeTab) && (
          <div className="flex items-center gap-2"><Filter className="w-5 h-5 text-gray-400" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
              {activeTab === 'disciplinary' && <><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Incident Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th></>}
              {activeTab === 'grievances' && <><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Filed Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Priority</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th></>}
              {activeTab === 'conduct' && <><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acknowledged Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Policy Version</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Signed</th></>}
              {activeTab === 'psea' && <><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Declaration Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acknowledged</th></>}
              {activeTab === 'coi' && <><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Declaration Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Has Conflict</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th></>}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.length === 0 ? (<tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No records found.</td></tr>) : (
              paginatedData.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center gap-2"><Users className="w-5 h-5 text-gray-400" /><span className="font-medium text-gray-900 dark:text-white">{getEmployeeName(record.employeeId)}</span></div></td>
                  {activeTab === 'disciplinary' && <><td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{getTypeName(record.typeId, disciplinaryTypes)}</td><td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{record.incidentDate ? new Date(record.incidentDate).toLocaleDateString() : '-'}</td><td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(record.status)}</td></>}
                  {activeTab === 'grievances' && <><td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{getTypeName(record.typeId, grievanceTypes)}</td><td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{record.filedDate ? new Date(record.filedDate).toLocaleDateString() : '-'}</td><td className="px-6 py-4 whitespace-nowrap">{getPriorityBadge(record.priority)}</td><td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(record.status)}</td></>}
                  {activeTab === 'conduct' && <><td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{record.acknowledgedDate ? new Date(record.acknowledgedDate).toLocaleDateString() : '-'}</td><td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{record.policyVersion || '-'}</td><td className="px-6 py-4 whitespace-nowrap">{record.signature ? <CheckCircle className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-gray-400" />}</td></>}
                  {activeTab === 'psea' && <><td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{record.declarationDate ? new Date(record.declarationDate).toLocaleDateString() : '-'}</td><td className="px-6 py-4 whitespace-nowrap">{record.acknowledged ? <CheckCircle className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-gray-400" />}</td></>}
                  {activeTab === 'coi' && <><td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{record.declarationDate ? new Date(record.declarationDate).toLocaleDateString() : '-'}</td><td className="px-6 py-4 whitespace-nowrap">{record.hasConflict ? <span className="text-red-600 font-medium">Yes</span> : <span className="text-green-600">No</span>}</td><td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(record.status)}</td></>}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      {(activeTab === 'disciplinary' || activeTab === 'grievances') && <button onClick={() => openViewModal(record)} className="p-1 text-gray-600 hover:bg-gray-100 rounded dark:text-gray-400 dark:hover:bg-gray-700"><Eye className="w-4 h-4" /></button>}
                      <button onClick={() => { activeTab === 'disciplinary' ? openDisciplinaryModal(record) : activeTab === 'grievances' ? openGrievanceModal(record) : activeTab === 'conduct' ? openConductModal(record) : activeTab === 'psea' ? openPseaModal(record) : openCoiModal(record); }} className="p-1 text-blue-600 hover:bg-blue-100 rounded dark:hover:bg-blue-900"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => openDeleteModal(record)} className="p-1 text-red-600 hover:bg-red-100 rounded dark:hover:bg-red-900"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {totalPages > 1 && (<div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between"><p className="text-sm text-gray-600 dark:text-gray-400">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}</p><div className="flex gap-2"><button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700">Previous</button><button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700">Next</button></div></div>)}
      </div>

      {/* Disciplinary Modal */}
      {showDisciplinaryModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"><div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">{isEditing ? 'Edit Case' : 'New Disciplinary Case'}</h2><button onClick={closeDisciplinaryModal} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><X className="w-5 h-5" /></button></div><div className="p-4 space-y-4"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee *</label><select value={disciplinaryForm.employeeId} onChange={(e) => setDisciplinaryForm({...disciplinaryForm, employeeId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"><option value="">Select</option>{employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}</select></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label><select value={disciplinaryForm.typeId} onChange={(e) => setDisciplinaryForm({...disciplinaryForm, typeId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"><option value="">Select</option>{disciplinaryTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Incident Date *</label><input type="date" value={disciplinaryForm.incidentDate} onChange={(e) => setDisciplinaryForm({...disciplinaryForm, incidentDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" /></div></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label><textarea value={disciplinaryForm.description} onChange={(e) => setDisciplinaryForm({...disciplinaryForm, description: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Action Taken</label><textarea value={disciplinaryForm.actionTaken} onChange={(e) => setDisciplinaryForm({...disciplinaryForm, actionTaken: e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label><select value={disciplinaryForm.status} onChange={(e) => setDisciplinaryForm({...disciplinaryForm, status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"><option value="open">Open</option><option value="investigating">Investigating</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></div></div><div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700"><button onClick={closeDisciplinaryModal} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button><button onClick={handleSaveDisciplinary} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{isEditing ? 'Update' : 'Create'}</button></div></div></div>)}

      {/* Grievance Modal */}
      {showGrievanceModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg"><div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">{isEditing ? 'Edit Grievance' : 'New Grievance'}</h2><button onClick={closeGrievanceModal} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><X className="w-5 h-5" /></button></div><div className="p-4 space-y-4"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee *</label><select value={grievanceForm.employeeId} onChange={(e) => setGrievanceForm({...grievanceForm, employeeId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"><option value="">Select</option>{employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}</select></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label><select value={grievanceForm.typeId} onChange={(e) => setGrievanceForm({...grievanceForm, typeId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"><option value="">Select</option>{grievanceTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filed Date *</label><input type="date" value={grievanceForm.filedDate} onChange={(e) => setGrievanceForm({...grievanceForm, filedDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" /></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label><select value={grievanceForm.priority} onChange={(e) => setGrievanceForm({...grievanceForm, priority: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label><select value={grievanceForm.status} onChange={(e) => setGrievanceForm({...grievanceForm, status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"><option value="open">Open</option><option value="investigating">Investigating</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></div></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label><textarea value={grievanceForm.description} onChange={(e) => setGrievanceForm({...grievanceForm, description: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" /></div></div><div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700"><button onClick={closeGrievanceModal} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button><button onClick={handleSaveGrievance} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{isEditing ? 'Update' : 'Create'}</button></div></div></div>)}

      {/* Conduct Modal */}
      {showConductModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg"><div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">{isEditing ? 'Edit Acknowledgment' : 'New Conduct Acknowledgment'}</h2><button onClick={closeConductModal} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><X className="w-5 h-5" /></button></div><div className="p-4 space-y-4"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee *</label><select value={conductForm.employeeId} onChange={(e) => setConductForm({...conductForm, employeeId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"><option value="">Select</option>{employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}</select></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Acknowledged Date *</label><input type="date" value={conductForm.acknowledgedDate} onChange={(e) => setConductForm({...conductForm, acknowledgedDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Policy Version</label><input type="text" value={conductForm.policyVersion} onChange={(e) => setConductForm({...conductForm, policyVersion: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" /></div></div><div className="flex items-center gap-2"><input type="checkbox" id="signature" checked={conductForm.signature} onChange={(e) => setConductForm({...conductForm, signature: e.target.checked})} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /><label htmlFor="signature" className="text-sm text-gray-700 dark:text-gray-300">Signed</label></div></div><div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700"><button onClick={closeConductModal} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button><button onClick={handleSaveConduct} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{isEditing ? 'Update' : 'Create'}</button></div></div></div>)}

      {/* PSEA Modal */}
      {showPseaModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg"><div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">{isEditing ? 'Edit PSEA' : 'New PSEA Declaration'}</h2><button onClick={closePseaModal} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><X className="w-5 h-5" /></button></div><div className="p-4 space-y-4"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee *</label><select value={pseaForm.employeeId} onChange={(e) => setPseaForm({...pseaForm, employeeId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"><option value="">Select</option>{employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}</select></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Declaration Date *</label><input type="date" value={pseaForm.declarationDate} onChange={(e) => setPseaForm({...pseaForm, declarationDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" /></div><div className="flex items-center gap-2"><input type="checkbox" id="acknowledged" checked={pseaForm.acknowledged} onChange={(e) => setPseaForm({...pseaForm, acknowledged: e.target.checked})} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /><label htmlFor="acknowledged" className="text-sm text-gray-700 dark:text-gray-300">Acknowledged</label></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label><textarea value={pseaForm.notes} onChange={(e) => setPseaForm({...pseaForm, notes: e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" /></div></div><div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700"><button onClick={closePseaModal} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button><button onClick={handleSavePsea} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{isEditing ? 'Update' : 'Create'}</button></div></div></div>)}

      {/* COI Modal */}
      {showCoiModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg"><div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">{isEditing ? 'Edit COI' : 'New COI Declaration'}</h2><button onClick={closeCoiModal} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><X className="w-5 h-5" /></button></div><div className="p-4 space-y-4"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee *</label><select value={coiForm.employeeId} onChange={(e) => setCoiForm({...coiForm, employeeId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"><option value="">Select</option>{employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}</select></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Declaration Date *</label><input type="date" value={coiForm.declarationDate} onChange={(e) => setCoiForm({...coiForm, declarationDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label><select value={coiForm.status} onChange={(e) => setCoiForm({...coiForm, status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></div></div><div className="flex items-center gap-2"><input type="checkbox" id="hasConflict" checked={coiForm.hasConflict} onChange={(e) => setCoiForm({...coiForm, hasConflict: e.target.checked})} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /><label htmlFor="hasConflict" className="text-sm text-gray-700 dark:text-gray-300">Has Conflict of Interest</label></div>{coiForm.hasConflict && <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Conflict Description</label><textarea value={coiForm.conflictDescription} onChange={(e) => setCoiForm({...coiForm, conflictDescription: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" /></div>}</div><div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700"><button onClick={closeCoiModal} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button><button onClick={handleSaveCoi} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{isEditing ? 'Update' : 'Create'}</button></div></div></div>)}

      {/* View Modal */}
      {showViewModal && selectedRecord && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"><div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">{activeTab === 'disciplinary' ? 'Disciplinary Case Details' : 'Grievance Details'}</h2><button onClick={() => setShowViewModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><X className="w-5 h-5" /></button></div><div className="p-4 space-y-4"><div className="grid grid-cols-2 gap-4"><div><p className="text-sm text-gray-500 dark:text-gray-400">Employee</p><p className="font-medium text-gray-900 dark:text-white">{getEmployeeName(selectedRecord.employeeId)}</p></div><div><p className="text-sm text-gray-500 dark:text-gray-400">Status</p><div>{getStatusBadge(selectedRecord.status)}</div></div></div>{selectedRecord.description && <div><p className="text-sm text-gray-500 dark:text-gray-400">Description</p><p className="text-gray-900 dark:text-white">{selectedRecord.description}</p></div>}{activeTab === 'disciplinary' && selectedRecord.actionTaken && <div><p className="text-sm text-gray-500 dark:text-gray-400">Action Taken</p><p className="text-gray-900 dark:text-white">{selectedRecord.actionTaken}</p></div>}</div><div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700"><button onClick={() => setShowViewModal(false)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Close</button></div></div></div>)}

      {/* Delete Modal */}
      {showDeleteModal && selectedRecord && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md"><div className="p-6"><div className="flex items-center gap-3 mb-4"><div className="p-2 bg-red-100 dark:bg-red-900 rounded-full"><AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" /></div><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Delete</h2></div><p className="text-gray-600 dark:text-gray-400">Are you sure you want to delete this record?</p></div><div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700"><button onClick={() => { setShowDeleteModal(false); setSelectedRecord(null); }} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button><button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button></div></div></div>)}

      {/* Toast */}
      {toast.show && (<div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>{toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}{toast.message}</div>)}
    </div>
  );
}
