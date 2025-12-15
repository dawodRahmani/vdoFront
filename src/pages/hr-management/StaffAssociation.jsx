import React, { useState, useEffect } from 'react';
import {
  Users, DollarSign, Heart, CreditCard, Plus, Search, Filter,
  Edit2, Trash2, Eye, X, Save, ChevronLeft, ChevronRight, UserPlus,
  CheckCircle, XCircle, Clock, AlertTriangle, TrendingUp, Wallet
} from 'lucide-react';
import {
  staffAssociationMemberDB, staffAssociationContributionDB,
  staffWelfareRequestDB, staffWelfarePaymentDB
} from '../../services/db/indexedDB';

const StaffAssociation = () => {
  const [activeTab, setActiveTab] = useState('members');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const itemsPerPage = 10;

  // Data states
  const [members, setMembers] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [welfareRequests, setWelfareRequests] = useState([]);
  const [welfarePayments, setWelfarePayments] = useState([]);

  // Statistics
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    pendingWelfare: 0,
    paidWelfare: 0,
    totalContributions: 0
  });

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [members, contributions, welfareRequests, welfarePayments]);

  const loadAllData = async () => {
    try {
      const [membersData, contribData, requestsData, paymentsData] = await Promise.all([
        staffAssociationMemberDB.getAll(),
        staffAssociationContributionDB.getAll(),
        staffWelfareRequestDB.getAll(),
        staffWelfarePaymentDB.getAll()
      ]);
      setMembers(membersData || []);
      setContributions(contribData || []);
      setWelfareRequests(requestsData || []);
      setWelfarePayments(paymentsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Error loading data', 'error');
    }
  };

  const calculateStats = () => {
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === 'active').length;
    const pendingWelfare = welfareRequests.filter(w => w.status === 'pending').length;
    const paidWelfare = welfarePayments.length;
    const totalContributions = contributions.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

    setStats({ totalMembers, activeMembers, pendingWelfare, paidWelfare, totalContributions });
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
      case 'members': return staffAssociationMemberDB;
      case 'contributions': return staffAssociationContributionDB;
      case 'welfare-requests': return staffWelfareRequestDB;
      case 'welfare-payments': return staffWelfarePaymentDB;
      default: return staffAssociationMemberDB;
    }
  };

  const getActiveData = () => {
    let data = [];
    switch (activeTab) {
      case 'members': data = members; break;
      case 'contributions': data = contributions; break;
      case 'welfare-requests': data = welfareRequests; break;
      case 'welfare-payments': data = welfarePayments; break;
      default: data = [];
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(item => JSON.stringify(item).toLowerCase().includes(term));
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
    { id: 'members', label: 'Members', icon: Users },
    { id: 'contributions', label: 'Contributions', icon: DollarSign },
    { id: 'welfare-requests', label: 'Welfare Requests', icon: Heart },
    { id: 'welfare-payments', label: 'Welfare Payments', icon: CreditCard }
  ];

  const getStatusBadge = (status) => {
    const statusStyles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      paid: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      suspended: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    };
    return statusStyles[status] || statusStyles.pending;
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Association</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage membership, contributions, and welfare programs</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Members</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMembers}</p>
            </div>
            <Users className="w-10 h-10 text-blue-500 opacity-80" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Members</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeMembers}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500 opacity-80" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Welfare</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingWelfare}</p>
            </div>
            <Clock className="w-10 h-10 text-yellow-500 opacity-80" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Welfare Paid</p>
              <p className="text-2xl font-bold text-purple-600">{stats.paidWelfare}</p>
            </div>
            <Heart className="w-10 h-10 text-purple-500 opacity-80" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Contributions</p>
              <p className="text-2xl font-bold text-blue-600">${stats.totalContributions.toLocaleString()}</p>
            </div>
            <Wallet className="w-10 h-10 text-blue-500 opacity-80" />
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
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="paid">Paid</option>
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
          {activeTab === 'members' && <MembersTable data={getPaginatedData()} onEdit={handleEdit} onView={handleView} onDelete={handleDelete} getStatusBadge={getStatusBadge} />}
          {activeTab === 'contributions' && <ContributionsTable data={getPaginatedData()} onEdit={handleEdit} onView={handleView} onDelete={handleDelete} getStatusBadge={getStatusBadge} />}
          {activeTab === 'welfare-requests' && <WelfareRequestsTable data={getPaginatedData()} onEdit={handleEdit} onView={handleView} onDelete={handleDelete} getStatusBadge={getStatusBadge} />}
          {activeTab === 'welfare-payments' && <WelfarePaymentsTable data={getPaginatedData()} onEdit={handleEdit} onView={handleView} onDelete={handleDelete} getStatusBadge={getStatusBadge} />}
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
          members={members}
        />
      )}
    </div>
  );
};

// Members Table Component
const MembersTable = ({ data, onEdit, onView, onDelete, getStatusBadge }) => (
  <table className="w-full">
    <thead className="bg-gray-50 dark:bg-gray-700">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Member</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee ID</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Department</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Join Date</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Monthly Contribution</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      {data.length === 0 ? (
        <tr>
          <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
            No members found
          </td>
        </tr>
      ) : (
        data.map((item) => (
          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{item.employeeName || 'N/A'}</span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
              {item.employeeId || 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
              {item.department || 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
              {item.joinDate ? new Date(item.joinDate).toLocaleDateString() : 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white font-medium">
              ${item.monthlyContribution || 0}
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

// Contributions Table Component
const ContributionsTable = ({ data, onEdit, onView, onDelete, getStatusBadge }) => (
  <table className="w-full">
    <thead className="bg-gray-50 dark:bg-gray-700">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Member</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Period</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment Date</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment Method</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      {data.length === 0 ? (
        <tr>
          <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
            No contributions found
          </td>
        </tr>
      ) : (
        data.map((item) => (
          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{item.memberName || 'N/A'}</span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
              {item.period || 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white font-medium">
              ${item.amount || 0}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
              {item.paymentDate ? new Date(item.paymentDate).toLocaleDateString() : 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
              {item.paymentMethod || 'N/A'}
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

// Welfare Requests Table Component
const WelfareRequestsTable = ({ data, onEdit, onView, onDelete, getStatusBadge }) => (
  <table className="w-full">
    <thead className="bg-gray-50 dark:bg-gray-700">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Member</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Request Type</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount Requested</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Request Date</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      {data.length === 0 ? (
        <tr>
          <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
            No welfare requests found
          </td>
        </tr>
      ) : (
        data.map((item) => (
          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{item.memberName || 'N/A'}</span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded text-sm">
                {item.requestType || 'N/A'}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white font-medium">
              ${item.amountRequested || 0}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
              {item.requestDate ? new Date(item.requestDate).toLocaleDateString() : 'N/A'}
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

// Welfare Payments Table Component
const WelfarePaymentsTable = ({ data, onEdit, onView, onDelete, getStatusBadge }) => (
  <table className="w-full">
    <thead className="bg-gray-50 dark:bg-gray-700">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Member</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Request Reference</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount Paid</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment Date</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment Method</th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      {data.length === 0 ? (
        <tr>
          <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
            No welfare payments found
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
                <span className="font-medium text-gray-900 dark:text-white">{item.memberName || 'N/A'}</span>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400 font-mono">
              {item.requestReference || 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white font-medium">
              ${item.amountPaid || 0}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
              {item.paymentDate ? new Date(item.paymentDate).toLocaleDateString() : 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
              {item.paymentMethod || 'N/A'}
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
const Modal = ({ mode, item, onClose, onSave, activeTab, members }) => {
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
      case 'members':
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee ID *</label>
                <input
                  type="text"
                  value={formData.employeeId || ''}
                  onChange={(e) => handleChange('employeeId', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department || ''}
                  onChange={(e) => handleChange('department', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position</label>
                <input
                  type="text"
                  value={formData.position || ''}
                  onChange={(e) => handleChange('position', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Join Date *</label>
                <input
                  type="date"
                  value={formData.joinDate || ''}
                  onChange={(e) => handleChange('joinDate', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Contribution ($) *</label>
                <input
                  type="number"
                  value={formData.monthlyContribution || ''}
                  onChange={(e) => handleChange('monthlyContribution', parseFloat(e.target.value))}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Membership Type</label>
                <select
                  value={formData.membershipType || 'regular'}
                  onChange={(e) => handleChange('membershipType', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                >
                  <option value="regular">Regular</option>
                  <option value="executive">Executive</option>
                  <option value="honorary">Honorary</option>
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
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </>
        );

      case 'contributions':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Member *</label>
                <select
                  value={formData.memberId || ''}
                  onChange={(e) => {
                    const member = members.find(m => m.id === parseInt(e.target.value));
                    handleChange('memberId', e.target.value);
                    if (member) handleChange('memberName', member.employeeName);
                  }}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  required
                >
                  <option value="">Select Member</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.employeeName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Period *</label>
                <input
                  type="month"
                  value={formData.period || ''}
                  onChange={(e) => handleChange('period', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount ($) *</label>
                <input
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) => handleChange('amount', parseFloat(e.target.value))}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Date *</label>
                <input
                  type="date"
                  value={formData.paymentDate || ''}
                  onChange={(e) => handleChange('paymentDate', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method *</label>
                <select
                  value={formData.paymentMethod || 'salary_deduction'}
                  onChange={(e) => handleChange('paymentMethod', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                >
                  <option value="salary_deduction">Salary Deduction</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status *</label>
                <select
                  value={formData.status || 'paid'}
                  onChange={(e) => handleChange('status', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </>
        );

      case 'welfare-requests':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Member *</label>
                <select
                  value={formData.memberId || ''}
                  onChange={(e) => {
                    const member = members.find(m => m.id === parseInt(e.target.value));
                    handleChange('memberId', e.target.value);
                    if (member) handleChange('memberName', member.employeeName);
                  }}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  required
                >
                  <option value="">Select Member</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.employeeName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Request Type *</label>
                <select
                  value={formData.requestType || ''}
                  onChange={(e) => handleChange('requestType', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="medical">Medical Assistance</option>
                  <option value="death">Death/Funeral</option>
                  <option value="marriage">Marriage</option>
                  <option value="childbirth">Childbirth</option>
                  <option value="disaster">Natural Disaster</option>
                  <option value="education">Education Support</option>
                  <option value="emergency">Emergency Loan</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount Requested ($) *</label>
                <input
                  type="number"
                  value={formData.amountRequested || ''}
                  onChange={(e) => handleChange('amountRequested', parseFloat(e.target.value))}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Request Date *</label>
                <input
                  type="date"
                  value={formData.requestDate || ''}
                  onChange={(e) => handleChange('requestDate', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description/Reason *</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                disabled={mode === 'view'}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount Approved ($)</label>
                <input
                  type="number"
                  value={formData.amountApproved || ''}
                  onChange={(e) => handleChange('amountApproved', parseFloat(e.target.value))}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status *</label>
                <select
                  value={formData.status || 'pending'}
                  onChange={(e) => handleChange('status', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
          </>
        );

      case 'welfare-payments':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Member *</label>
                <select
                  value={formData.memberId || ''}
                  onChange={(e) => {
                    const member = members.find(m => m.id === parseInt(e.target.value));
                    handleChange('memberId', e.target.value);
                    if (member) handleChange('memberName', member.employeeName);
                  }}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  required
                >
                  <option value="">Select Member</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.employeeName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Request Reference</label>
                <input
                  type="text"
                  value={formData.requestReference || ''}
                  onChange={(e) => handleChange('requestReference', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount Paid ($) *</label>
                <input
                  type="number"
                  value={formData.amountPaid || ''}
                  onChange={(e) => handleChange('amountPaid', parseFloat(e.target.value))}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Date *</label>
                <input
                  type="date"
                  value={formData.paymentDate || ''}
                  onChange={(e) => handleChange('paymentDate', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method *</label>
                <select
                  value={formData.paymentMethod || 'bank_transfer'}
                  onChange={(e) => handleChange('paymentMethod', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status *</label>
                <select
                  value={formData.status || 'paid'}
                  onChange={(e) => handleChange('status', e.target.value)}
                  disabled={mode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                disabled={mode === 'view'}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
              />
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
      members: 'Member',
      contributions: 'Contribution',
      'welfare-requests': 'Welfare Request',
      'welfare-payments': 'Welfare Payment'
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

export default StaffAssociation;
