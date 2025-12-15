import { useState, useEffect } from 'react';
import { Plane, DollarSign, MapPin, Users, AlertTriangle, Plus, Search, Filter, Eye, Edit, Trash2, X, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { travelRequestDB, travelApprovalDB, dsaRateDB, dsaPaymentDB, mahramTravelDB, workRelatedInjuryDB, employeeDB, seedAllDefaults } from '../../services/db/indexedDB';

export default function TravelDSA() {
  const [travelRequests, setTravelRequests] = useState([]);
  const [dsaRates, setDsaRates] = useState([]);
  const [dsaPayments, setDsaPayments] = useState([]);
  const [mahramRecords, setMahramRecords] = useState([]);
  const [injuries, setInjuries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState('requests');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDsaRateModal, setShowDsaRateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMahramModal, setShowMahramModal] = useState(false);
  const [showInjuryModal, setShowInjuryModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [requestForm, setRequestForm] = useState({ employeeId: '', destination: '', purpose: '', departureDate: '', returnDate: '', estimatedCost: 0, status: 'pending', notes: '' });
  const [dsaRateForm, setDsaRateForm] = useState({ location: '', dailyRate: 0, currency: 'USD', effectiveFrom: '', effectiveTo: '', isActive: true });
  const [paymentForm, setPaymentForm] = useState({ travelRequestId: '', employeeId: '', amount: 0, daysCount: 0, paymentDate: '', status: 'pending' });
  const [mahramForm, setMahramForm] = useState({ employeeId: '', mahramName: '', relationship: '', travelDate: '', destination: '', allowanceAmount: 0, status: 'pending' });
  const [injuryForm, setInjuryForm] = useState({ employeeId: '', incidentDate: '', description: '', location: '', injuryType: '', status: 'reported', treatmentCost: 0 });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true); await seedAllDefaults();
      const [reqData, ratesData, paymentsData, mahramData, injuriesData, empData] = await Promise.all([
        travelRequestDB.getAll(), dsaRateDB.getAll(), dsaPaymentDB.getAll(), mahramTravelDB.getAll(), workRelatedInjuryDB.getAll(), employeeDB.getAll()
      ]);
      setTravelRequests(reqData); setDsaRates(ratesData); setDsaPayments(paymentsData); setMahramRecords(mahramData); setInjuries(injuriesData); setEmployees(empData);
    } catch (error) { console.error('Error loading data:', error); showToast('Error loading data', 'error'); }
    finally { setLoading(false); }
  };

  const showToast = (message, type = 'success') => { setToast({ show: true, message, type }); setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000); };

  const stats = {
    pending: travelRequests.filter(r => r.status === 'pending').length,
    approved: travelRequests.filter(r => r.status === 'approved').length,
    completed: travelRequests.filter(r => r.status === 'completed').length,
    totalDsa: dsaPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0),
    openClaims: injuries.filter(i => i.status === 'reported' || i.status === 'investigating').length,
  };

  const getEmployeeName = (id) => { const emp = employees.find(e => e.id === id); return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown'; };

  const getFilteredData = () => {
    let filtered = [];
    switch (activeTab) {
      case 'requests': filtered = [...travelRequests]; break;
      case 'rates': filtered = [...dsaRates]; break;
      case 'payments': filtered = [...dsaPayments]; break;
      case 'mahram': filtered = [...mahramRecords]; break;
      case 'injuries': filtered = [...injuries]; break;
    }
    if (statusFilter !== 'all' && ['requests', 'payments', 'mahram', 'injuries'].includes(activeTab)) filtered = filtered.filter(r => r.status === statusFilter);
    if (searchTerm && ['requests', 'payments', 'mahram', 'injuries'].includes(activeTab)) filtered = filtered.filter(r => getEmployeeName(r.employeeId).toLowerCase().includes(searchTerm.toLowerCase()));
    if (searchTerm && activeTab === 'rates') filtered = filtered.filter(r => r.location?.toLowerCase().includes(searchTerm.toLowerCase()));
    return filtered;
  };

  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSaveRequest = async () => {
    try {
      if (!requestForm.employeeId || !requestForm.destination || !requestForm.departureDate) { showToast('Please fill required fields', 'error'); return; }
      const data = { ...requestForm, employeeId: parseInt(requestForm.employeeId), estimatedCost: parseFloat(requestForm.estimatedCost) || 0 };
      if (isEditing && selectedRecord) { await travelRequestDB.update(selectedRecord.id, data); showToast('Updated successfully'); }
      else { await travelRequestDB.add(data); showToast('Created successfully'); }
      await loadData(); closeRequestModal();
    } catch (error) { showToast('Error saving', 'error'); }
  };

  const handleSaveDsaRate = async () => {
    try {
      if (!dsaRateForm.location || !dsaRateForm.dailyRate) { showToast('Please fill required fields', 'error'); return; }
      const data = { ...dsaRateForm, dailyRate: parseFloat(dsaRateForm.dailyRate) || 0 };
      if (isEditing && selectedRecord) { await dsaRateDB.update(selectedRecord.id, data); showToast('Updated successfully'); }
      else { await dsaRateDB.add(data); showToast('Created successfully'); }
      await loadData(); closeDsaRateModal();
    } catch (error) { showToast('Error saving', 'error'); }
  };

  const handleSavePayment = async () => {
    try {
      if (!paymentForm.employeeId || !paymentForm.amount) { showToast('Please fill required fields', 'error'); return; }
      const data = { ...paymentForm, employeeId: parseInt(paymentForm.employeeId), travelRequestId: paymentForm.travelRequestId ? parseInt(paymentForm.travelRequestId) : null, amount: parseFloat(paymentForm.amount) || 0, daysCount: parseInt(paymentForm.daysCount) || 0 };
      if (isEditing && selectedRecord) { await dsaPaymentDB.update(selectedRecord.id, data); showToast('Updated successfully'); }
      else { await dsaPaymentDB.add(data); showToast('Created successfully'); }
      await loadData(); closePaymentModal();
    } catch (error) { showToast('Error saving', 'error'); }
  };

  const handleSaveMahram = async () => {
    try {
      if (!mahramForm.employeeId || !mahramForm.mahramName) { showToast('Please fill required fields', 'error'); return; }
      const data = { ...mahramForm, employeeId: parseInt(mahramForm.employeeId), allowanceAmount: parseFloat(mahramForm.allowanceAmount) || 0 };
      if (isEditing && selectedRecord) { await mahramTravelDB.update(selectedRecord.id, data); showToast('Updated successfully'); }
      else { await mahramTravelDB.add(data); showToast('Created successfully'); }
      await loadData(); closeMahramModal();
    } catch (error) { showToast('Error saving', 'error'); }
  };

  const handleSaveInjury = async () => {
    try {
      if (!injuryForm.employeeId || !injuryForm.incidentDate) { showToast('Please fill required fields', 'error'); return; }
      const data = { ...injuryForm, employeeId: parseInt(injuryForm.employeeId), treatmentCost: parseFloat(injuryForm.treatmentCost) || 0 };
      if (isEditing && selectedRecord) { await workRelatedInjuryDB.update(selectedRecord.id, data); showToast('Updated successfully'); }
      else { await workRelatedInjuryDB.add(data); showToast('Created successfully'); }
      await loadData(); closeInjuryModal();
    } catch (error) { showToast('Error saving', 'error'); }
  };

  const handleDelete = async () => {
    try {
      switch (activeTab) {
        case 'requests': await travelRequestDB.delete(selectedRecord.id); break;
        case 'rates': await dsaRateDB.delete(selectedRecord.id); break;
        case 'payments': await dsaPaymentDB.delete(selectedRecord.id); break;
        case 'mahram': await mahramTravelDB.delete(selectedRecord.id); break;
        case 'injuries': await workRelatedInjuryDB.delete(selectedRecord.id); break;
      }
      showToast('Deleted successfully'); await loadData(); setShowDeleteModal(false); setSelectedRecord(null);
    } catch (error) { showToast('Error deleting', 'error'); }
  };

  const openRequestModal = (record = null) => {
    if (record) { setIsEditing(true); setSelectedRecord(record); setRequestForm({ employeeId: record.employeeId?.toString() || '', destination: record.destination || '', purpose: record.purpose || '', departureDate: record.departureDate || '', returnDate: record.returnDate || '', estimatedCost: record.estimatedCost || 0, status: record.status || 'pending', notes: record.notes || '' }); }
    else { setIsEditing(false); setSelectedRecord(null); setRequestForm({ employeeId: '', destination: '', purpose: '', departureDate: '', returnDate: '', estimatedCost: 0, status: 'pending', notes: '' }); }
    setShowRequestModal(true);
  };
  const closeRequestModal = () => { setShowRequestModal(false); setSelectedRecord(null); setIsEditing(false); };

  const openDsaRateModal = (record = null) => {
    if (record) { setIsEditing(true); setSelectedRecord(record); setDsaRateForm({ location: record.location || '', dailyRate: record.dailyRate || 0, currency: record.currency || 'USD', effectiveFrom: record.effectiveFrom || '', effectiveTo: record.effectiveTo || '', isActive: record.isActive !== false }); }
    else { setIsEditing(false); setSelectedRecord(null); setDsaRateForm({ location: '', dailyRate: 0, currency: 'USD', effectiveFrom: new Date().toISOString().split('T')[0], effectiveTo: '', isActive: true }); }
    setShowDsaRateModal(true);
  };
  const closeDsaRateModal = () => { setShowDsaRateModal(false); setSelectedRecord(null); setIsEditing(false); };

  const openPaymentModal = (record = null) => {
    if (record) { setIsEditing(true); setSelectedRecord(record); setPaymentForm({ travelRequestId: record.travelRequestId?.toString() || '', employeeId: record.employeeId?.toString() || '', amount: record.amount || 0, daysCount: record.daysCount || 0, paymentDate: record.paymentDate || '', status: record.status || 'pending' }); }
    else { setIsEditing(false); setSelectedRecord(null); setPaymentForm({ travelRequestId: '', employeeId: '', amount: 0, daysCount: 0, paymentDate: '', status: 'pending' }); }
    setShowPaymentModal(true);
  };
  const closePaymentModal = () => { setShowPaymentModal(false); setSelectedRecord(null); setIsEditing(false); };

  const openMahramModal = (record = null) => {
    if (record) { setIsEditing(true); setSelectedRecord(record); setMahramForm({ employeeId: record.employeeId?.toString() || '', mahramName: record.mahramName || '', relationship: record.relationship || '', travelDate: record.travelDate || '', destination: record.destination || '', allowanceAmount: record.allowanceAmount || 0, status: record.status || 'pending' }); }
    else { setIsEditing(false); setSelectedRecord(null); setMahramForm({ employeeId: '', mahramName: '', relationship: '', travelDate: '', destination: '', allowanceAmount: 0, status: 'pending' }); }
    setShowMahramModal(true);
  };
  const closeMahramModal = () => { setShowMahramModal(false); setSelectedRecord(null); setIsEditing(false); };

  const openInjuryModal = (record = null) => {
    if (record) { setIsEditing(true); setSelectedRecord(record); setInjuryForm({ employeeId: record.employeeId?.toString() || '', incidentDate: record.incidentDate || '', description: record.description || '', location: record.location || '', injuryType: record.injuryType || '', status: record.status || 'reported', treatmentCost: record.treatmentCost || 0 }); }
    else { setIsEditing(false); setSelectedRecord(null); setInjuryForm({ employeeId: '', incidentDate: new Date().toISOString().split('T')[0], description: '', location: '', injuryType: '', status: 'reported', treatmentCost: 0 }); }
    setShowInjuryModal(true);
  };
  const closeInjuryModal = () => { setShowInjuryModal(false); setSelectedRecord(null); setIsEditing(false); };

  const openViewModal = (record) => { setSelectedRecord(record); setShowViewModal(true); };
  const openDeleteModal = (record) => { setSelectedRecord(record); setShowDeleteModal(true); };

  const getStatusBadge = (status) => {
    const styles = { pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', reported: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', investigating: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300', resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>{status?.charAt(0).toUpperCase() + status?.slice(1)}</span>;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Travel & DSA</h1><p className="text-gray-600 dark:text-gray-400">Manage travel requests, DSA payments, and work-related injuries</p></div>
        <div className="flex gap-2">
          {activeTab === 'requests' && <button onClick={() => openRequestModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" />New Request</button>}
          {activeTab === 'rates' && <button onClick={() => openDsaRateModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" />New Rate</button>}
          {activeTab === 'payments' && <button onClick={() => openPaymentModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" />New Payment</button>}
          {activeTab === 'mahram' && <button onClick={() => openMahramModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" />New Mahram</button>}
          {activeTab === 'injuries' && <button onClick={() => openInjuryModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" />Report Injury</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"><div className="flex items-center gap-3"><div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg"><Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" /></div><div><p className="text-sm text-gray-600 dark:text-gray-400">Pending</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p></div></div></div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg"><CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" /></div><div><p className="text-sm text-gray-600 dark:text-gray-400">Approved</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.approved}</p></div></div></div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg"><Plane className="w-6 h-6 text-blue-600 dark:text-blue-400" /></div><div><p className="text-sm text-gray-600 dark:text-gray-400">Completed</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p></div></div></div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"><div className="flex items-center gap-3"><div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg"><DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" /></div><div><p className="text-sm text-gray-600 dark:text-gray-400">DSA Paid</p><p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.totalDsa.toLocaleString()}</p></div></div></div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"><div className="flex items-center gap-3"><div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg"><AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" /></div><div><p className="text-sm text-gray-600 dark:text-gray-400">Open Claims</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.openClaims}</p></div></div></div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[{ id: 'requests', label: 'Travel Requests', icon: Plane }, { id: 'rates', label: 'DSA Rates', icon: MapPin }, { id: 'payments', label: 'DSA Payments', icon: DollarSign }, { id: 'mahram', label: 'Mahram Allowances', icon: Users }, { id: 'injuries', label: 'Work Injuries', icon: AlertTriangle }].map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setCurrentPage(1); setStatusFilter('all'); setSearchTerm(''); }} className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" /></div>
        {['requests', 'payments', 'mahram', 'injuries'].includes(activeTab) && (
          <div className="flex items-center gap-2"><Filter className="w-5 h-5 text-gray-400" /><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"><option value="all">All Status</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="completed">Completed</option><option value="paid">Paid</option></select></div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {activeTab === 'requests' && <><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Employee</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Destination</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Dates</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Est. Cost</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th></>}
              {activeTab === 'rates' && <><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Location</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Daily Rate</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Currency</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Effective</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th></>}
              {activeTab === 'payments' && <><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Employee</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Days</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Payment Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th></>}
              {activeTab === 'mahram' && <><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Employee</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mahram</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Relationship</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th></>}
              {activeTab === 'injuries' && <><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Employee</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Treatment Cost</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th></>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.length === 0 ? (<tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No records found.</td></tr>) : (
              paginatedData.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  {activeTab === 'requests' && <><td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{getEmployeeName(record.employeeId)}</td><td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{record.destination}</td><td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{record.departureDate ? new Date(record.departureDate).toLocaleDateString() : '-'} - {record.returnDate ? new Date(record.returnDate).toLocaleDateString() : '-'}</td><td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">${record.estimatedCost?.toLocaleString() || 0}</td><td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(record.status)}</td></>}
                  {activeTab === 'rates' && <><td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{record.location}</td><td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">${record.dailyRate}</td><td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{record.currency}</td><td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{record.effectiveFrom ? new Date(record.effectiveFrom).toLocaleDateString() : '-'}</td><td className="px-6 py-4 whitespace-nowrap">{record.isActive ? <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span> : <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>}</td></>}
                  {activeTab === 'payments' && <><td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{getEmployeeName(record.employeeId)}</td><td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">${record.amount?.toLocaleString() || 0}</td><td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{record.daysCount || 0}</td><td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{record.paymentDate ? new Date(record.paymentDate).toLocaleDateString() : '-'}</td><td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(record.status)}</td></>}
                  {activeTab === 'mahram' && <><td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{getEmployeeName(record.employeeId)}</td><td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{record.mahramName}</td><td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{record.relationship}</td><td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">${record.allowanceAmount?.toLocaleString() || 0}</td><td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(record.status)}</td></>}
                  {activeTab === 'injuries' && <><td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{getEmployeeName(record.employeeId)}</td><td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{record.incidentDate ? new Date(record.incidentDate).toLocaleDateString() : '-'}</td><td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">{record.injuryType || '-'}</td><td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">${record.treatmentCost?.toLocaleString() || 0}</td><td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(record.status)}</td></>}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      {activeTab === 'requests' && <button onClick={() => openViewModal(record)} className="p-1 text-gray-600 hover:bg-gray-100 rounded dark:text-gray-400 dark:hover:bg-gray-700"><Eye className="w-4 h-4" /></button>}
                      <button onClick={() => { activeTab === 'requests' ? openRequestModal(record) : activeTab === 'rates' ? openDsaRateModal(record) : activeTab === 'payments' ? openPaymentModal(record) : activeTab === 'mahram' ? openMahramModal(record) : openInjuryModal(record); }} className="p-1 text-blue-600 hover:bg-blue-100 rounded dark:hover:bg-blue-900"><Edit className="w-4 h-4" /></button>
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

      {/* Request Modal */}
      {showRequestModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"><div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">{isEditing ? 'Edit Request' : 'New Travel Request'}</h2><button onClick={closeRequestModal} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><X className="w-5 h-5" /></button></div><div className="p-4 space-y-4"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee *</label><select value={requestForm.employeeId} onChange={(e) => setRequestForm({...requestForm, employeeId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"><option value="">Select</option>{employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}</select></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destination *</label><input type="text" value={requestForm.destination} onChange={(e) => setRequestForm({...requestForm, destination: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Departure *</label><input type="date" value={requestForm.departureDate} onChange={(e) => setRequestForm({...requestForm, departureDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Return</label><input type="date" value={requestForm.returnDate} onChange={(e) => setRequestForm({...requestForm, returnDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" /></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Est. Cost</label><input type="number" value={requestForm.estimatedCost} onChange={(e) => setRequestForm({...requestForm, estimatedCost: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label><select value={requestForm.status} onChange={(e) => setRequestForm({...requestForm, status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="completed">Completed</option></select></div></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purpose</label><textarea value={requestForm.purpose} onChange={(e) => setRequestForm({...requestForm, purpose: e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" /></div></div><div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700"><button onClick={closeRequestModal} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button><button onClick={handleSaveRequest} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{isEditing ? 'Update' : 'Create'}</button></div></div></div>)}

      {/* DSA Rate Modal */}
      {showDsaRateModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg"><div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">{isEditing ? 'Edit Rate' : 'New DSA Rate'}</h2><button onClick={closeDsaRateModal} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><X className="w-5 h-5" /></button></div><div className="p-4 space-y-4"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location *</label><input type="text" value={dsaRateForm.location} onChange={(e) => setDsaRateForm({...dsaRateForm, location: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Daily Rate *</label><input type="number" value={dsaRateForm.dailyRate} onChange={(e) => setDsaRateForm({...dsaRateForm, dailyRate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label><select value={dsaRateForm.currency} onChange={(e) => setDsaRateForm({...dsaRateForm, currency: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"><option value="USD">USD</option><option value="EUR">EUR</option><option value="AFN">AFN</option></select></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Effective From</label><input type="date" value={dsaRateForm.effectiveFrom} onChange={(e) => setDsaRateForm({...dsaRateForm, effectiveFrom: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Effective To</label><input type="date" value={dsaRateForm.effectiveTo} onChange={(e) => setDsaRateForm({...dsaRateForm, effectiveTo: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" /></div></div><div className="flex items-center gap-2"><input type="checkbox" id="isActive" checked={dsaRateForm.isActive} onChange={(e) => setDsaRateForm({...dsaRateForm, isActive: e.target.checked})} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /><label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">Active</label></div></div><div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700"><button onClick={closeDsaRateModal} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button><button onClick={handleSaveDsaRate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{isEditing ? 'Update' : 'Create'}</button></div></div></div>)}

      {/* Payment Modal */}
      {showPaymentModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg"><div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">{isEditing ? 'Edit Payment' : 'New DSA Payment'}</h2><button onClick={closePaymentModal} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><X className="w-5 h-5" /></button></div><div className="p-4 space-y-4"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee *</label><select value={paymentForm.employeeId} onChange={(e) => setPaymentForm({...paymentForm, employeeId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"><option value="">Select</option>{employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}</select></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount *</label><input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Days</label><input type="number" value={paymentForm.daysCount} onChange={(e) => setPaymentForm({...paymentForm, daysCount: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" /></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Date</label><input type="date" value={paymentForm.paymentDate} onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label><select value={paymentForm.status} onChange={(e) => setPaymentForm({...paymentForm, status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"><option value="pending">Pending</option><option value="paid">Paid</option></select></div></div></div><div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700"><button onClick={closePaymentModal} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button><button onClick={handleSavePayment} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{isEditing ? 'Update' : 'Create'}</button></div></div></div>)}

      {/* Mahram Modal */}
      {showMahramModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg"><div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">{isEditing ? 'Edit Mahram' : 'New Mahram Allowance'}</h2><button onClick={closeMahramModal} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><X className="w-5 h-5" /></button></div><div className="p-4 space-y-4"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee *</label><select value={mahramForm.employeeId} onChange={(e) => setMahramForm({...mahramForm, employeeId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"><option value="">Select</option>{employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}</select></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mahram Name *</label><input type="text" value={mahramForm.mahramName} onChange={(e) => setMahramForm({...mahramForm, mahramName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Relationship</label><input type="text" value={mahramForm.relationship} onChange={(e) => setMahramForm({...mahramForm, relationship: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="e.g., Husband, Father" /></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label><input type="number" value={mahramForm.allowanceAmount} onChange={(e) => setMahramForm({...mahramForm, allowanceAmount: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label><select value={mahramForm.status} onChange={(e) => setMahramForm({...mahramForm, status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"><option value="pending">Pending</option><option value="approved">Approved</option><option value="paid">Paid</option></select></div></div></div><div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700"><button onClick={closeMahramModal} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button><button onClick={handleSaveMahram} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{isEditing ? 'Update' : 'Create'}</button></div></div></div>)}

      {/* Injury Modal */}
      {showInjuryModal && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg"><div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">{isEditing ? 'Edit Injury' : 'Report Work Injury'}</h2><button onClick={closeInjuryModal} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><X className="w-5 h-5" /></button></div><div className="p-4 space-y-4"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee *</label><select value={injuryForm.employeeId} onChange={(e) => setInjuryForm({...injuryForm, employeeId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"><option value="">Select</option>{employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}</select></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Incident Date *</label><input type="date" value={injuryForm.incidentDate} onChange={(e) => setInjuryForm({...injuryForm, incidentDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Injury Type</label><input type="text" value={injuryForm.injuryType} onChange={(e) => setInjuryForm({...injuryForm, injuryType: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" /></div></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Treatment Cost</label><input type="number" value={injuryForm.treatmentCost} onChange={(e) => setInjuryForm({...injuryForm, treatmentCost: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" /></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label><select value={injuryForm.status} onChange={(e) => setInjuryForm({...injuryForm, status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"><option value="reported">Reported</option><option value="investigating">Investigating</option><option value="resolved">Resolved</option></select></div></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label><textarea value={injuryForm.description} onChange={(e) => setInjuryForm({...injuryForm, description: e.target.value})} rows={2} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" /></div></div><div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700"><button onClick={closeInjuryModal} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button><button onClick={handleSaveInjury} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{isEditing ? 'Update' : 'Report'}</button></div></div></div>)}

      {/* View Modal */}
      {showViewModal && selectedRecord && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg"><div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Travel Request Details</h2><button onClick={() => setShowViewModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><X className="w-5 h-5" /></button></div><div className="p-4 space-y-4"><div className="grid grid-cols-2 gap-4"><div><p className="text-sm text-gray-500 dark:text-gray-400">Employee</p><p className="font-medium text-gray-900 dark:text-white">{getEmployeeName(selectedRecord.employeeId)}</p></div><div><p className="text-sm text-gray-500 dark:text-gray-400">Status</p><div>{getStatusBadge(selectedRecord.status)}</div></div><div><p className="text-sm text-gray-500 dark:text-gray-400">Destination</p><p className="font-medium text-gray-900 dark:text-white">{selectedRecord.destination}</p></div><div><p className="text-sm text-gray-500 dark:text-gray-400">Estimated Cost</p><p className="font-medium text-gray-900 dark:text-white">${selectedRecord.estimatedCost?.toLocaleString() || 0}</p></div></div>{selectedRecord.purpose && <div><p className="text-sm text-gray-500 dark:text-gray-400">Purpose</p><p className="text-gray-900 dark:text-white">{selectedRecord.purpose}</p></div>}</div><div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700"><button onClick={() => setShowViewModal(false)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Close</button></div></div></div>)}

      {/* Delete Modal */}
      {showDeleteModal && selectedRecord && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md"><div className="p-6"><div className="flex items-center gap-3 mb-4"><div className="p-2 bg-red-100 dark:bg-red-900 rounded-full"><AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" /></div><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Delete</h2></div><p className="text-gray-600 dark:text-gray-400">Are you sure you want to delete this record?</p></div><div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700"><button onClick={() => { setShowDeleteModal(false); setSelectedRecord(null); }} className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button><button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button></div></div></div>)}

      {toast.show && (<div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>{toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}{toast.message}</div>)}
    </div>
  );
}
