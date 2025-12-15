import React, { useState, useEffect } from 'react';
import {
  Package, CreditCard, Smartphone, Mail, Settings, Plus, Search, Filter,
  Edit2, Trash2, Eye, X, Save, ChevronLeft, ChevronRight, Monitor, Laptop,
  Key, Wifi, CheckCircle, XCircle, Clock, AlertTriangle, RotateCcw
} from 'lucide-react';
import {
  assetTypeDB, employeeAssetDB, idCardDB, simCardDB, employeeEmailDB
} from '../../services/db/indexedDB';

const AssetManagement = () => {
  const [activeTab, setActiveTab] = useState('assets');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const itemsPerPage = 10;

  // Data states
  const [assetTypes, setAssetTypes] = useState([]);
  const [employeeAssets, setEmployeeAssets] = useState([]);
  const [idCards, setIdCards] = useState([]);
  const [simCards, setSimCards] = useState([]);
  const [emailAccounts, setEmailAccounts] = useState([]);

  // Statistics
  const [stats, setStats] = useState({
    totalAssets: 0,
    assignedAssets: 0,
    activeIdCards: 0,
    activeSimCards: 0,
    pendingReturns: 0
  });

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [employeeAssets, idCards, simCards]);

  const loadAllData = async () => {
    try {
      const [types, assets, ids, sims, emails] = await Promise.all([
        assetTypeDB.getAll(),
        employeeAssetDB.getAll(),
        idCardDB.getAll(),
        simCardDB.getAll(),
        employeeEmailDB.getAll()
      ]);
      setAssetTypes(types || []);
      setEmployeeAssets(assets || []);
      setIdCards(ids || []);
      setSimCards(sims || []);
      setEmailAccounts(emails || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Error loading data', 'error');
    }
  };

  const calculateStats = () => {
    const totalAssets = employeeAssets.length;
    const assignedAssets = employeeAssets.filter(a => a.status === 'assigned').length;
    const activeIdCards = idCards.filter(c => c.status === 'active').length;
    const activeSimCards = simCards.filter(s => s.status === 'active').length;
    const pendingReturns = employeeAssets.filter(a => a.status === 'pending_return').length;

    setStats({ totalAssets, assignedAssets, activeIdCards, activeSimCards, pendingReturns });
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setModalMode('add');
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setModalMode('view');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const db = getActiveDB();
      await db.delete(id);
      await loadAllData();
      showToast('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting:', error);
      showToast('Error deleting item', 'error');
    }
  };

  const getActiveDB = () => {
    switch (activeTab) {
      case 'assets': return employeeAssetDB;
      case 'idcards': return idCardDB;
      case 'simcards': return simCardDB;
      case 'emails': return employeeEmailDB;
      case 'types': return assetTypeDB;
      default: return employeeAssetDB;
    }
  };

  const getActiveData = () => {
    let data = [];
    switch (activeTab) {
      case 'assets': data = employeeAssets; break;
      case 'idcards': data = idCards; break;
      case 'simcards': data = simCards; break;
      case 'emails': data = emailAccounts; break;
      case 'types': data = assetTypes; break;
      default: data = [];
    }

    // Apply filters
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(item =>
        JSON.stringify(item).toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      data = data.filter(item => item.status === statusFilter);
    }

    return data;
  };

  const getPaginatedData = () => {
    const data = getActiveData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = Math.ceil(getActiveData().length / itemsPerPage);

  const handleSave = async (formData) => {
    try {
      const db = getActiveDB();
      if (modalMode === 'edit' && selectedItem) {
        await db.update(selectedItem.id, { ...formData, updatedAt: new Date().toISOString() });
        showToast('Item updated successfully');
      } else {
        await db.add({ ...formData, createdAt: new Date().toISOString() });
        showToast('Item added successfully');
      }
      setShowModal(false);
      await loadAllData();
    } catch (error) {
      console.error('Error saving:', error);
      showToast('Error saving item', 'error');
    }
  };

  const tabs = [
    { id: 'assets', label: 'Employee Assets', icon: Package },
    { id: 'idcards', label: 'ID Cards', icon: CreditCard },
    { id: 'simcards', label: 'SIM Cards', icon: Smartphone },
    { id: 'emails', label: 'Email Accounts', icon: Mail },
    { id: 'types', label: 'Asset Types', icon: Settings }
  ];

  const getStatusBadge = (status) => {
    const statusStyles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      available: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      pending_return: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      returned: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      deactivated: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      expired: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      probationary: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300'
    };
    return statusStyles[status] || statusStyles.available;
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Asset & ID Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage employee assets, ID cards, SIM cards, and email accounts</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAssets}</p>
            </div>
            <Package className="w-10 h-10 text-blue-500 opacity-80" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Assigned</p>
              <p className="text-2xl font-bold text-blue-600">{stats.assignedAssets}</p>
            </div>
            <Laptop className="w-10 h-10 text-blue-500 opacity-80" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active ID Cards</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeIdCards}</p>
            </div>
            <CreditCard className="w-10 h-10 text-green-500 opacity-80" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active SIMs</p>
              <p className="text-2xl font-bold text-purple-600">{stats.activeSimCards}</p>
            </div>
            <Smartphone className="w-10 h-10 text-purple-500 opacity-80" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Returns</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingReturns}</p>
            </div>
            <RotateCcw className="w-10 h-10 text-yellow-500 opacity-80" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
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
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="assigned">Assigned</option>
            <option value="available">Available</option>
            <option value="pending_return">Pending Return</option>
            <option value="returned">Returned</option>
            <option value="deactivated">Deactivated</option>
          </select>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {activeTab === 'assets' && <AssetsTable data={getPaginatedData()} onEdit={handleEdit} onView={handleView} onDelete={handleDelete} getStatusBadge={getStatusBadge} assetTypes={assetTypes} />}
          {activeTab === 'idcards' && <IdCardsTable data={getPaginatedData()} onEdit={handleEdit} onView={handleView} onDelete={handleDelete} getStatusBadge={getStatusBadge} />}
          {activeTab === 'simcards' && <SimCardsTable data={getPaginatedData()} onEdit={handleEdit} onView={handleView} onDelete={handleDelete} getStatusBadge={getStatusBadge} />}
          {activeTab === 'emails' && <EmailsTable data={getPaginatedData()} onEdit={handleEdit} onView={handleView} onDelete={handleDelete} getStatusBadge={getStatusBadge} />}
          {activeTab === 'types' && <AssetTypesTable data={getPaginatedData()} onEdit={handleEdit} onView={handleView} onDelete={handleDelete} getStatusBadge={getStatusBadge} />}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, getActiveData().length)} of {getActiveData().length} entries
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-4 py-2 text-gray-900 dark:text-white">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal
          mode={modalMode}
          item={selectedItem}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          activeTab={activeTab}
          assetTypes={assetTypes}
        />
      )}
    </div>
  );
};

// Assets Table Component
const AssetsTable = ({ data, onEdit, onView, onDelete, getStatusBadge, assetTypes }) => (
  <table className="w-full">
    <thead className="bg-gray-50 dark:bg-gray-700">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Asset</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Serial/Tag</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Assigned Date</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      {data.length === 0 ? (
        <tr>
          <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
            No assets found
          </td>
        </tr>
      ) : (
        data.map((item) => (
          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.assetName || 'N/A'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.assetType || 'Unknown'}</p>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
              {item.employeeName || 'Unassigned'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
              {item.serialNumber || item.assetTag || 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
              {item.assignedDate ? new Date(item.assignedDate).toLocaleDateString() : 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                {item.status?.replace('_', ' ') || 'N/A'}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right">
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => onView(item)} className="p-1 text-gray-500 hover:text-blue-600"><Eye className="w-4 h-4" /></button>
                <button onClick={() => onEdit(item)} className="p-1 text-gray-500 hover:text-green-600"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => onDelete(item.id)} className="p-1 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
);

// ID Cards Table Component
const IdCardsTable = ({ data, onEdit, onView, onDelete, getStatusBadge }) => (
  <table className="w-full">
    <thead className="bg-gray-50 dark:bg-gray-700">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Card Number</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Card Type</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Issue Date</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Expiry Date</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      {data.length === 0 ? (
        <tr>
          <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
            No ID cards found
          </td>
        </tr>
      ) : (
        data.map((item) => (
          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{item.employeeName || 'N/A'}</span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white font-mono">
              {item.cardNumber || 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                item.cardType === 'permanent'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300'
              }`}>
                {item.cardType || 'N/A'}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
              {item.issueDate ? new Date(item.issueDate).toLocaleDateString() : 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
              {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                {item.status || 'N/A'}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right">
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => onView(item)} className="p-1 text-gray-500 hover:text-blue-600"><Eye className="w-4 h-4" /></button>
                <button onClick={() => onEdit(item)} className="p-1 text-gray-500 hover:text-green-600"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => onDelete(item.id)} className="p-1 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
);

// SIM Cards Table Component
const SimCardsTable = ({ data, onEdit, onView, onDelete, getStatusBadge }) => (
  <table className="w-full">
    <thead className="bg-gray-50 dark:bg-gray-700">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone Number</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Provider</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Monthly Limit</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Issue Date</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      {data.length === 0 ? (
        <tr>
          <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
            No SIM cards found
          </td>
        </tr>
      ) : (
        data.map((item) => (
          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{item.employeeName || 'N/A'}</span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white font-mono">
              {item.phoneNumber || 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
              {item.provider || 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
              ${item.monthlyLimit || 0}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
              {item.issueDate ? new Date(item.issueDate).toLocaleDateString() : 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                {item.status || 'N/A'}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right">
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => onView(item)} className="p-1 text-gray-500 hover:text-blue-600"><Eye className="w-4 h-4" /></button>
                <button onClick={() => onEdit(item)} className="p-1 text-gray-500 hover:text-green-600"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => onDelete(item.id)} className="p-1 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
);

// Emails Table Component
const EmailsTable = ({ data, onEdit, onView, onDelete, getStatusBadge }) => (
  <table className="w-full">
    <thead className="bg-gray-50 dark:bg-gray-700">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email Address</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Account Type</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created Date</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      {data.length === 0 ? (
        <tr>
          <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
            No email accounts found
          </td>
        </tr>
      ) : (
        data.map((item) => (
          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Mail className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{item.employeeName || 'N/A'}</span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
              {item.emailAddress || 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
              {item.accountType || 'Standard'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
              {item.createdDate ? new Date(item.createdDate).toLocaleDateString() : 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                {item.status || 'N/A'}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right">
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => onView(item)} className="p-1 text-gray-500 hover:text-blue-600"><Eye className="w-4 h-4" /></button>
                <button onClick={() => onEdit(item)} className="p-1 text-gray-500 hover:text-green-600"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => onDelete(item.id)} className="p-1 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
);

// Asset Types Table Component
const AssetTypesTable = ({ data, onEdit, onView, onDelete, getStatusBadge }) => (
  <table className="w-full">
    <thead className="bg-gray-50 dark:bg-gray-700">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type Name</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Depreciation</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      {data.length === 0 ? (
        <tr>
          <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
            No asset types found
          </td>
        </tr>
      ) : (
        data.map((item) => (
          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{item.typeName || 'N/A'}</span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
              {item.category || 'N/A'}
            </td>
            <td className="px-6 py-4 text-gray-600 dark:text-gray-400 max-w-xs truncate">
              {item.description || 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
              {item.depreciationYears ? `${item.depreciationYears} years` : 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                {item.status || 'N/A'}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right">
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => onView(item)} className="p-1 text-gray-500 hover:text-blue-600"><Eye className="w-4 h-4" /></button>
                <button onClick={() => onEdit(item)} className="p-1 text-gray-500 hover:text-green-600"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => onDelete(item.id)} className="p-1 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
);

// Modal Component
const Modal = ({ mode, item, onClose, onSave, activeTab, assetTypes }) => {
  const [formData, setFormData] = useState(item || {});

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'assets':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asset Name *</label>
                <input
                  type="text"
                  value={formData.assetName || ''}
                  onChange={(e) => handleChange('assetName', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asset Type *</label>
                <select
                  value={formData.assetType || ''}
                  onChange={(e) => handleChange('assetType', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  required
                >
                  <option value="">Select Type</option>
                  {assetTypes.map(type => (
                    <option key={type.id} value={type.typeName}>{type.typeName}</option>
                  ))}
                  <option value="Laptop">Laptop</option>
                  <option value="Desktop">Desktop</option>
                  <option value="Monitor">Monitor</option>
                  <option value="Mobile Phone">Mobile Phone</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee Name</label>
                <input
                  type="text"
                  value={formData.employeeName || ''}
                  onChange={(e) => handleChange('employeeName', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee ID</label>
                <input
                  type="text"
                  value={formData.employeeId || ''}
                  onChange={(e) => handleChange('employeeId', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Serial Number</label>
                <input
                  type="text"
                  value={formData.serialNumber || ''}
                  onChange={(e) => handleChange('serialNumber', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asset Tag</label>
                <input
                  type="text"
                  value={formData.assetTag || ''}
                  onChange={(e) => handleChange('assetTag', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned Date</label>
                <input
                  type="date"
                  value={formData.assignedDate || ''}
                  onChange={(e) => handleChange('assignedDate', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status *</label>
                <select
                  value={formData.status || 'available'}
                  onChange={(e) => handleChange('status', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                >
                  <option value="available">Available</option>
                  <option value="assigned">Assigned</option>
                  <option value="pending_return">Pending Return</option>
                  <option value="returned">Returned</option>
                  <option value="maintenance">Under Maintenance</option>
                  <option value="disposed">Disposed</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                disabled={mode === 'view'}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
              />
            </div>
          </>
        );

      case 'idcards':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee Name *</label>
                <input
                  type="text"
                  value={formData.employeeName || ''}
                  onChange={(e) => handleChange('employeeName', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee ID</label>
                <input
                  type="text"
                  value={formData.employeeId || ''}
                  onChange={(e) => handleChange('employeeId', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Card Number *</label>
                <input
                  type="text"
                  value={formData.cardNumber || ''}
                  onChange={(e) => handleChange('cardNumber', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Card Type *</label>
                <select
                  value={formData.cardType || 'probationary'}
                  onChange={(e) => handleChange('cardType', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                >
                  <option value="probationary">Probationary</option>
                  <option value="permanent">Permanent</option>
                  <option value="contractor">Contractor</option>
                  <option value="visitor">Visitor</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Date *</label>
                <input
                  type="date"
                  value={formData.issueDate || ''}
                  onChange={(e) => handleChange('issueDate', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiryDate || ''}
                  onChange={(e) => handleChange('expiryDate', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Access Level</label>
                <select
                  value={formData.accessLevel || 'standard'}
                  onChange={(e) => handleChange('accessLevel', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                >
                  <option value="standard">Standard</option>
                  <option value="restricted">Restricted</option>
                  <option value="elevated">Elevated</option>
                  <option value="full">Full Access</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status *</label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => handleChange('status', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                >
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="deactivated">Deactivated</option>
                  <option value="lost">Lost</option>
                  <option value="replaced">Replaced</option>
                </select>
              </div>
            </div>
          </>
        );

      case 'simcards':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee Name *</label>
                <input
                  type="text"
                  value={formData.employeeName || ''}
                  onChange={(e) => handleChange('employeeName', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee ID</label>
                <input
                  type="text"
                  value={formData.employeeId || ''}
                  onChange={(e) => handleChange('employeeId', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phoneNumber || ''}
                  onChange={(e) => handleChange('phoneNumber', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SIM Serial Number</label>
                <input
                  type="text"
                  value={formData.simSerial || ''}
                  onChange={(e) => handleChange('simSerial', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Provider *</label>
                <select
                  value={formData.provider || ''}
                  onChange={(e) => handleChange('provider', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  required
                >
                  <option value="">Select Provider</option>
                  <option value="Roshan">Roshan</option>
                  <option value="AWCC">AWCC</option>
                  <option value="MTN">MTN</option>
                  <option value="Etisalat">Etisalat</option>
                  <option value="Salaam">Salaam</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan Type</label>
                <select
                  value={formData.planType || 'postpaid'}
                  onChange={(e) => handleChange('planType', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                >
                  <option value="postpaid">Postpaid</option>
                  <option value="prepaid">Prepaid</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Limit ($)</label>
                <input
                  type="number"
                  value={formData.monthlyLimit || ''}
                  onChange={(e) => handleChange('monthlyLimit', parseFloat(e.target.value))}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Date *</label>
                <input
                  type="date"
                  value={formData.issueDate || ''}
                  onChange={(e) => handleChange('issueDate', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status *</label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => handleChange('status', e.target.value)}
                disabled={mode === 'view'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="deactivated">Deactivated</option>
                <option value="lost">Lost/Stolen</option>
              </select>
            </div>
          </>
        );

      case 'emails':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee Name *</label>
                <input
                  type="text"
                  value={formData.employeeName || ''}
                  onChange={(e) => handleChange('employeeName', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee ID</label>
                <input
                  type="text"
                  value={formData.employeeId || ''}
                  onChange={(e) => handleChange('employeeId', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address *</label>
              <input
                type="email"
                value={formData.emailAddress || ''}
                onChange={(e) => handleChange('emailAddress', e.target.value)}
                disabled={mode === 'view'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Type</label>
                <select
                  value={formData.accountType || 'standard'}
                  onChange={(e) => handleChange('accountType', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                >
                  <option value="standard">Standard</option>
                  <option value="admin">Admin</option>
                  <option value="shared">Shared/Generic</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Storage Quota (GB)</label>
                <input
                  type="number"
                  value={formData.storageQuota || ''}
                  onChange={(e) => handleChange('storageQuota', parseInt(e.target.value))}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Created Date *</label>
                <input
                  type="date"
                  value={formData.createdDate || ''}
                  onChange={(e) => handleChange('createdDate', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status *</label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => handleChange('status', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="deactivated">Deactivated</option>
                </select>
              </div>
            </div>
          </>
        );

      case 'types':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type Name *</label>
                <input
                  type="text"
                  value={formData.typeName || ''}
                  onChange={(e) => handleChange('typeName', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => handleChange('category', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="IT Equipment">IT Equipment</option>
                  <option value="Communication">Communication</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Office Equipment">Office Equipment</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                disabled={mode === 'view'}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Depreciation Years</label>
                <input
                  type="number"
                  value={formData.depreciationYears || ''}
                  onChange={(e) => handleChange('depreciationYears', parseInt(e.target.value))}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status *</label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => handleChange('status', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const getModalTitle = () => {
    const prefix = mode === 'add' ? 'Add' : mode === 'edit' ? 'Edit' : 'View';
    const entity = {
      assets: 'Asset',
      idcards: 'ID Card',
      simcards: 'SIM Card',
      emails: 'Email Account',
      types: 'Asset Type'
    }[activeTab];
    return `${prefix} ${entity}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{getModalTitle()}</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {renderForm()}
        </form>
        {mode !== 'view' && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetManagement;
