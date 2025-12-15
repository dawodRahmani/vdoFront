import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  User,
  Building2,
  Briefcase,
  FileSignature,
  CalendarDays,
  Filter,
  X,
} from 'lucide-react';
import {
  contractTypeDB,
  employeeContractDB,
  contractAmendmentDB,
  employeeDB,
  departmentDB,
  positionDB,
  seedAllDefaults,
} from '../../services/db/indexedDB';

const ContractManagement = () => {
  // Active tab
  const [activeTab, setActiveTab] = useState('contracts');

  // Data state
  const [contracts, setContracts] = useState([]);
  const [contractTypes, setContractTypes] = useState([]);
  const [amendments, setAmendments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Statistics
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    expiringSoon: 0,
    expired: 0,
    draft: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    contractTypeId: '',
    employeeId: '',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modals
  const [showContractModal, setShowContractModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showAmendmentModal, setShowAmendmentModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state - Contract
  const [contractForm, setContractForm] = useState({
    employeeId: '',
    contractTypeId: '',
    projectId: '',
    startDate: '',
    endDate: '',
    basicSalary: '',
    currency: 'AFN',
    probationPeriod: '3',
    noticePeriod: '30',
    terms: '',
    status: 'draft',
  });

  // Form state - Contract Type
  const [typeForm, setTypeForm] = useState({
    name: '',
    category: 'permanent',
    description: '',
    isActive: true,
  });

  // Form state - Amendment
  const [amendmentForm, setAmendmentForm] = useState({
    contractId: '',
    amendmentType: 'extension',
    effectiveDate: '',
    previousValue: '',
    newValue: '',
    reason: '',
    status: 'pending',
  });

  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await seedAllDefaults();

      const [contractsData, typesData, amendmentsData, employeesData, deptsData, posData] = await Promise.all([
        employeeContractDB.getAll(),
        contractTypeDB.getAll(),
        contractAmendmentDB.getAll(),
        employeeDB.getAll(),
        departmentDB.getAll(),
        positionDB.getAll(),
      ]);

      setContracts(contractsData);
      setContractTypes(typesData);
      setAmendments(amendmentsData);
      setEmployees(employeesData);
      setDepartments(deptsData);
      setPositions(posData);

      // Calculate statistics
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const stats = {
        total: contractsData.length,
        active: contractsData.filter(c => c.status === 'active').length,
        expiringSoon: contractsData.filter(c => {
          if (c.status !== 'active') return false;
          const endDate = new Date(c.endDate);
          return endDate <= thirtyDaysFromNow && endDate >= now;
        }).length,
        expired: contractsData.filter(c => c.status === 'expired').length,
        draft: contractsData.filter(c => c.status === 'draft').length,
      };
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Helper functions
  const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
  };

  const getContractTypeName = (typeId) => {
    const type = contractTypes.find(t => t.id === typeId);
    return type ? type.name : 'Unknown';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount, currency = 'AFN') => {
    if (!amount) return '-';
    return `${currency} ${Number(amount).toLocaleString()}`;
  };

  const getDaysUntilExpiry = (endDate) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Status badge
  const getStatusBadge = (status) => {
    const badges = {
      draft: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', icon: FileText },
      active: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
      expired: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
      terminated: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', icon: AlertTriangle },
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
    };
    const badge = badges[status] || badges.draft;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Filter data based on active tab and filters
  const getFilteredData = () => {
    let data = [];

    if (activeTab === 'contracts') {
      data = contracts.filter(contract => {
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const employeeName = getEmployeeName(contract.employeeId).toLowerCase();
          const contractNum = (contract.contractNumber || '').toLowerCase();
          if (!employeeName.includes(searchLower) && !contractNum.includes(searchLower)) {
            return false;
          }
        }
        if (filters.status && contract.status !== filters.status) return false;
        if (filters.contractTypeId && contract.contractTypeId !== Number(filters.contractTypeId)) return false;
        if (filters.employeeId && contract.employeeId !== Number(filters.employeeId)) return false;
        return true;
      });
    } else if (activeTab === 'expiring') {
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      data = contracts.filter(c => {
        if (c.status !== 'active') return false;
        const endDate = new Date(c.endDate);
        return endDate <= thirtyDaysFromNow && endDate >= now;
      });
    } else if (activeTab === 'types') {
      data = contractTypes.filter(type => {
        if (filters.search && !type.name.toLowerCase().includes(filters.search.toLowerCase())) {
          return false;
        }
        return true;
      });
    } else if (activeTab === 'amendments') {
      data = amendments.filter(amendment => {
        if (filters.status && amendment.status !== filters.status) return false;
        return true;
      });
    }

    return data;
  };

  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset forms
  const resetContractForm = () => {
    setContractForm({
      employeeId: '',
      contractTypeId: '',
      projectId: '',
      startDate: '',
      endDate: '',
      basicSalary: '',
      currency: 'AFN',
      probationPeriod: '3',
      noticePeriod: '30',
      terms: '',
      status: 'draft',
    });
    setIsEditing(false);
    setSelectedItem(null);
  };

  const resetTypeForm = () => {
    setTypeForm({
      name: '',
      category: 'permanent',
      description: '',
      isActive: true,
    });
    setIsEditing(false);
    setSelectedItem(null);
  };

  const resetAmendmentForm = () => {
    setAmendmentForm({
      contractId: '',
      amendmentType: 'extension',
      effectiveDate: '',
      previousValue: '',
      newValue: '',
      reason: '',
      status: 'pending',
    });
    setIsEditing(false);
    setSelectedItem(null);
  };

  // Handle contract submit
  const handleContractSubmit = async (e) => {
    e.preventDefault();

    if (!contractForm.employeeId || !contractForm.contractTypeId || !contractForm.startDate || !contractForm.endDate) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      if (isEditing && selectedItem) {
        await employeeContractDB.update(selectedItem.id, {
          ...contractForm,
          employeeId: Number(contractForm.employeeId),
          contractTypeId: Number(contractForm.contractTypeId),
          basicSalary: Number(contractForm.basicSalary) || 0,
        });
        showToast('Contract updated successfully');
      } else {
        const contractNumber = await employeeContractDB.generateContractNumber();
        await employeeContractDB.create({
          ...contractForm,
          contractNumber,
          employeeId: Number(contractForm.employeeId),
          contractTypeId: Number(contractForm.contractTypeId),
          basicSalary: Number(contractForm.basicSalary) || 0,
        });
        showToast('Contract created successfully');
      }

      setShowContractModal(false);
      resetContractForm();
      loadData();
    } catch (error) {
      console.error('Error saving contract:', error);
      showToast('Failed to save contract', 'error');
    }
  };

  // Handle type submit
  const handleTypeSubmit = async (e) => {
    e.preventDefault();

    if (!typeForm.name) {
      showToast('Please enter a name', 'error');
      return;
    }

    try {
      if (isEditing && selectedItem) {
        await contractTypeDB.update(selectedItem.id, typeForm);
        showToast('Contract type updated successfully');
      } else {
        await contractTypeDB.create(typeForm);
        showToast('Contract type created successfully');
      }

      setShowTypeModal(false);
      resetTypeForm();
      loadData();
    } catch (error) {
      console.error('Error saving contract type:', error);
      showToast('Failed to save contract type', 'error');
    }
  };

  // Handle amendment submit
  const handleAmendmentSubmit = async (e) => {
    e.preventDefault();

    if (!amendmentForm.contractId || !amendmentForm.effectiveDate) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      if (isEditing && selectedItem) {
        await contractAmendmentDB.update(selectedItem.id, {
          ...amendmentForm,
          contractId: Number(amendmentForm.contractId),
        });
        showToast('Amendment updated successfully');
      } else {
        const amendmentNumber = await contractAmendmentDB.generateAmendmentNumber(amendmentForm.contractId);
        await contractAmendmentDB.create({
          ...amendmentForm,
          amendmentNumber,
          contractId: Number(amendmentForm.contractId),
        });
        showToast('Amendment created successfully');
      }

      setShowAmendmentModal(false);
      resetAmendmentForm();
      loadData();
    } catch (error) {
      console.error('Error saving amendment:', error);
      showToast('Failed to save amendment', 'error');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      if (activeTab === 'contracts') {
        await employeeContractDB.delete(selectedItem.id);
        showToast('Contract deleted successfully');
      } else if (activeTab === 'types') {
        await contractTypeDB.delete(selectedItem.id);
        showToast('Contract type deleted successfully');
      } else if (activeTab === 'amendments') {
        await contractAmendmentDB.delete(selectedItem.id);
        showToast('Amendment deleted successfully');
      }

      setShowDeleteModal(false);
      setSelectedItem(null);
      loadData();
    } catch (error) {
      console.error('Error deleting:', error);
      showToast('Failed to delete', 'error');
    }
  };

  // Edit handlers
  const handleEditContract = (contract) => {
    setContractForm({
      employeeId: contract.employeeId?.toString() || '',
      contractTypeId: contract.contractTypeId?.toString() || '',
      projectId: contract.projectId || '',
      startDate: contract.startDate || '',
      endDate: contract.endDate || '',
      basicSalary: contract.basicSalary?.toString() || '',
      currency: contract.currency || 'AFN',
      probationPeriod: contract.probationPeriod?.toString() || '3',
      noticePeriod: contract.noticePeriod?.toString() || '30',
      terms: contract.terms || '',
      status: contract.status || 'draft',
    });
    setSelectedItem(contract);
    setIsEditing(true);
    setShowContractModal(true);
  };

  const handleEditType = (type) => {
    setTypeForm({
      name: type.name || '',
      category: type.category || 'permanent',
      description: type.description || '',
      isActive: type.isActive !== false,
    });
    setSelectedItem(type);
    setIsEditing(true);
    setShowTypeModal(true);
  };

  const handleEditAmendment = (amendment) => {
    setAmendmentForm({
      contractId: amendment.contractId?.toString() || '',
      amendmentType: amendment.amendmentType || 'extension',
      effectiveDate: amendment.effectiveDate || '',
      previousValue: amendment.previousValue || '',
      newValue: amendment.newValue || '',
      reason: amendment.reason || '',
      status: amendment.status || 'pending',
    });
    setSelectedItem(amendment);
    setIsEditing(true);
    setShowAmendmentModal(true);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      contractTypeId: '',
      employeeId: '',
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = filters.search || filters.status || filters.contractTypeId || filters.employeeId;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contract Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage employee contracts, types, and amendments</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          {activeTab === 'contracts' && (
            <button
              onClick={() => { resetContractForm(); setShowContractModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Contract
            </button>
          )}
          {activeTab === 'types' && (
            <button
              onClick={() => { resetTypeForm(); setShowTypeModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Type
            </button>
          )}
          {activeTab === 'amendments' && (
            <button
              onClick={() => { resetAmendmentForm(); setShowAmendmentModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Amendment
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{statistics.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{statistics.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Expiring Soon</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{statistics.expiringSoon}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Expired</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{statistics.expired}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-900/30 rounded-lg">
              <FileSignature className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Draft</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{statistics.draft}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4">
          {[
            { id: 'contracts', label: 'All Contracts', icon: FileText },
            { id: 'expiring', label: 'Expiring Soon', icon: AlertTriangle },
            { id: 'types', label: 'Contract Types', icon: Briefcase },
            { id: 'amendments', label: 'Amendments', icon: FileSignature },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Filter Bar */}
      {(activeTab === 'contracts' || activeTab === 'amendments') && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="terminated">Terminated</option>
            </select>
            {activeTab === 'contracts' && (
              <>
                <select
                  value={filters.contractTypeId}
                  onChange={(e) => setFilters(prev => ({ ...prev, contractTypeId: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Types</option>
                  {contractTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
                <select
                  value={filters.employeeId}
                  onChange={(e) => setFilters(prev => ({ ...prev, employeeId: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Employees</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </select>
              </>
            )}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center justify-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          {/* Contracts Table */}
          {(activeTab === 'contracts' || activeTab === 'expiring') && (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contract #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No contracts found
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((contract) => {
                    const daysUntilExpiry = getDaysUntilExpiry(contract.endDate);
                    return (
                      <tr key={contract.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900 dark:text-white">{contract.contractNumber || '-'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                            </div>
                            <span className="text-gray-900 dark:text-white">{getEmployeeName(contract.employeeId)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                          {getContractTypeName(contract.contractTypeId)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <p className="text-gray-900 dark:text-white">{formatDate(contract.startDate)} - {formatDate(contract.endDate)}</p>
                            {daysUntilExpiry !== null && contract.status === 'active' && (
                              <p className={`text-xs ${daysUntilExpiry <= 30 ? 'text-red-500' : 'text-gray-500'}`}>
                                {daysUntilExpiry > 0 ? `${daysUntilExpiry} days remaining` : 'Expired'}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                          {formatCurrency(contract.basicSalary, contract.currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(contract.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => { setSelectedItem(contract); setShowViewModal(true); }}
                              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditContract(contract)}
                              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setSelectedItem(contract); setShowDeleteModal(true); }}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
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
          )}

          {/* Contract Types Table */}
          {activeTab === 'types' && (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No contract types found
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((type) => (
                    <tr key={type.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{type.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize text-gray-600 dark:text-gray-300">{type.category}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{type.description || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          type.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {type.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEditType(type)}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setSelectedItem(type); setShowDeleteModal(true); }}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* Amendments Table */}
          {activeTab === 'amendments' && (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amendment #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contract</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Effective Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No amendments found
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((amendment) => {
                    const contract = contracts.find(c => c.id === amendment.contractId);
                    return (
                      <tr key={amendment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{amendment.amendmentNumber || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{contract?.contractNumber || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap capitalize text-gray-600 dark:text-gray-300">{amendment.amendmentType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{formatDate(amendment.effectiveDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(amendment.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEditAmendment(amendment)}
                              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setSelectedItem(amendment); setShowDeleteModal(true); }}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
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
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contract Modal */}
      {showContractModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? 'Edit Contract' : 'New Contract'}
                </h2>
                <button
                  onClick={() => { setShowContractModal(false); resetContractForm(); }}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleContractSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Employee <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="employeeId"
                    value={contractForm.employeeId}
                    onChange={(e) => setContractForm(prev => ({ ...prev, employeeId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contract Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="contractTypeId"
                    value={contractForm.contractTypeId}
                    onChange={(e) => setContractForm(prev => ({ ...prev, contractTypeId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select Type</option>
                    {contractTypes.filter(t => t.isActive).map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={contractForm.startDate}
                    onChange={(e) => setContractForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={contractForm.endDate}
                    onChange={(e) => setContractForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Basic Salary
                  </label>
                  <div className="flex gap-2">
                    <select
                      name="currency"
                      value={contractForm.currency}
                      onChange={(e) => setContractForm(prev => ({ ...prev, currency: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="AFN">AFN</option>
                      <option value="USD">USD</option>
                    </select>
                    <input
                      type="number"
                      name="basicSalary"
                      value={contractForm.basicSalary}
                      onChange={(e) => setContractForm(prev => ({ ...prev, basicSalary: e.target.value }))}
                      placeholder="0.00"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={contractForm.status}
                    onChange={(e) => setContractForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Probation Period (months)
                  </label>
                  <input
                    type="number"
                    name="probationPeriod"
                    value={contractForm.probationPeriod}
                    onChange={(e) => setContractForm(prev => ({ ...prev, probationPeriod: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notice Period (days)
                  </label>
                  <input
                    type="number"
                    name="noticePeriod"
                    value={contractForm.noticePeriod}
                    onChange={(e) => setContractForm(prev => ({ ...prev, noticePeriod: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Terms & Conditions
                </label>
                <textarea
                  name="terms"
                  value={contractForm.terms}
                  onChange={(e) => setContractForm(prev => ({ ...prev, terms: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter contract terms and conditions..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowContractModal(false); resetContractForm(); }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {isEditing ? 'Update Contract' : 'Create Contract'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contract Type Modal */}
      {showTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md m-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? 'Edit Contract Type' : 'New Contract Type'}
                </h2>
                <button
                  onClick={() => { setShowTypeModal(false); resetTypeForm(); }}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleTypeSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={typeForm.name}
                  onChange={(e) => setTypeForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Permanent Staff"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={typeForm.category}
                  onChange={(e) => setTypeForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="permanent">Permanent Staff</option>
                  <option value="project">Project-Based</option>
                  <option value="consultant">Consultant</option>
                  <option value="intern">Intern/Volunteer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={typeForm.description}
                  onChange={(e) => setTypeForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={typeForm.isActive}
                  onChange={(e) => setTypeForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                  Active
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowTypeModal(false); resetTypeForm(); }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {isEditing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Amendment Modal */}
      {showAmendmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg m-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? 'Edit Amendment' : 'New Amendment'}
                </h2>
                <button
                  onClick={() => { setShowAmendmentModal(false); resetAmendmentForm(); }}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleAmendmentSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contract <span className="text-red-500">*</span>
                </label>
                <select
                  value={amendmentForm.contractId}
                  onChange={(e) => setAmendmentForm(prev => ({ ...prev, contractId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select Contract</option>
                  {contracts.filter(c => c.status === 'active').map(contract => (
                    <option key={contract.id} value={contract.id}>
                      {contract.contractNumber} - {getEmployeeName(contract.employeeId)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amendment Type
                  </label>
                  <select
                    value={amendmentForm.amendmentType}
                    onChange={(e) => setAmendmentForm(prev => ({ ...prev, amendmentType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="extension">Extension</option>
                    <option value="salary">Salary Change</option>
                    <option value="position">Position Change</option>
                    <option value="terms">Terms Change</option>
                    <option value="termination">Early Termination</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Effective Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={amendmentForm.effectiveDate}
                    onChange={(e) => setAmendmentForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Previous Value
                  </label>
                  <input
                    type="text"
                    value={amendmentForm.previousValue}
                    onChange={(e) => setAmendmentForm(prev => ({ ...prev, previousValue: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Value
                  </label>
                  <input
                    type="text"
                    value={amendmentForm.newValue}
                    onChange={(e) => setAmendmentForm(prev => ({ ...prev, newValue: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason
                </label>
                <textarea
                  value={amendmentForm.reason}
                  onChange={(e) => setAmendmentForm(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={amendmentForm.status}
                  onChange={(e) => setAmendmentForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowAmendmentModal(false); resetAmendmentForm(); }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {isEditing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Contract Modal */}
      {showViewModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Contract Details</h2>
                <button
                  onClick={() => { setShowViewModal(false); setSelectedItem(null); }}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Contract Number</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedItem.contractNumber}</p>
                </div>
                {getStatusBadge(selectedItem.status)}
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Employee</p>
                  <p className="font-medium text-gray-900 dark:text-white">{getEmployeeName(selectedItem.employeeId)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Contract Type</p>
                  <p className="font-medium text-gray-900 dark:text-white">{getContractTypeName(selectedItem.contractTypeId)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedItem.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">End Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedItem.endDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Basic Salary</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(selectedItem.basicSalary, selectedItem.currency)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Probation Period</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedItem.probationPeriod || 3} months</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Notice Period</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedItem.noticePeriod || 30} days</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedItem.createdAt)}</p>
                </div>
              </div>
              {selectedItem.terms && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Terms & Conditions</p>
                  <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    {selectedItem.terms}
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => { setShowViewModal(false); setSelectedItem(null); }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => { setShowViewModal(false); handleEditContract(selectedItem); }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Edit Contract
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md m-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-2">
                Confirm Delete
              </h3>
              <p className="text-center text-gray-500 dark:text-gray-400">
                Are you sure you want to delete this {activeTab === 'types' ? 'contract type' : activeTab === 'amendments' ? 'amendment' : 'contract'}? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => { setShowDeleteModal(false); setSelectedItem(null); }}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractManagement;
