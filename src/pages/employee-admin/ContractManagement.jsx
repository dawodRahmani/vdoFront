import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Building2,
  DollarSign,
  FileEdit,
  ArrowRight,
  History
} from 'lucide-react';

const CONTRACT_TYPES = {
  core: { label: 'Core Staff', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  project: { label: 'Project Staff', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  consultant: { label: 'Consultant', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
  temporary: { label: 'Temporary', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  intern: { label: 'Intern', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400' },
  volunteer: { label: 'Volunteer', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
  daily_wage: { label: 'Daily Wage', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' }
};

const CONTRACT_STATUSES = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
  pending_signature: { label: 'Pending Signature', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  active: { label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  amended: { label: 'Amended', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  terminated: { label: 'Terminated', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400' }
};

const AMENDMENT_TYPES = {
  extension: 'Contract Extension',
  position_change: 'Position Change',
  salary_change: 'Salary Adjustment',
  location_change: 'Location Change',
  hours_change: 'Working Hours Change',
  reporting_change: 'Reporting Line Change',
  project_change: 'Project Change',
  terms_change: 'Terms & Conditions',
  other: 'Other'
};

const ContractManagement = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('contracts');
  const [contracts, setContracts] = useState([]);
  const [amendments, setAmendments] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    expiring: 0,
    expired: 0,
    pendingAmendments: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showExpiring, setShowExpiring] = useState(filterParam === 'expiring');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [showAmendmentModal, setShowAmendmentModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [amendmentForm, setAmendmentForm] = useState({
    amendment_type: 'extension',
    effective_date: '',
    reason: '',
    new_end_date: '',
    new_salary: '',
    new_position: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      setStatistics({
        total: 156,
        active: 142,
        expiring: 12,
        expired: 8,
        pendingAmendments: 5
      });

      setContracts([
        { id: 1, contract_number: 'CTR-2020-001', employee: { id: 1, name: 'Ahmad Shah Ahmadi', employee_code: 'VDO-EMP-0001' }, contract_type: 'core', position: 'Program Manager', department: 'Programs', start_date: '2020-03-15', end_date: null, is_indefinite: true, base_salary: 85000, status: 'active', amendments_count: 2 },
        { id: 2, contract_number: 'CTR-2021-015', employee: { id: 2, name: 'Fatima Nazari', employee_code: 'VDO-EMP-0002' }, contract_type: 'core', position: 'Finance Officer', department: 'Finance', start_date: '2021-06-01', end_date: '2025-05-31', is_indefinite: false, base_salary: 65000, status: 'active', amendments_count: 1 },
        { id: 3, contract_number: 'CTR-2024-001', employee: { id: 3, name: 'Mohammad Karimi', employee_code: 'VDO-EMP-0003' }, contract_type: 'project', position: 'Driver', department: 'Operations', start_date: '2024-01-10', end_date: '2024-12-31', is_indefinite: false, base_salary: 25000, status: 'active', amendments_count: 0 },
        { id: 4, contract_number: 'CTR-2023-042', employee: { id: 5, name: 'Karim Rahimi', employee_code: 'VDO-EMP-0005' }, contract_type: 'consultant', position: 'IT Specialist', department: 'IT', start_date: '2023-09-01', end_date: '2024-02-28', is_indefinite: false, base_salary: 120000, status: 'active', amendments_count: 0 },
        { id: 5, contract_number: 'CTR-2024-002', employee: { id: 6, name: 'Sara Rezaei', employee_code: 'VDO-EMP-0006' }, contract_type: 'project', position: 'M&E Officer', department: 'Monitoring & Evaluation', start_date: '2024-01-15', end_date: '2025-01-14', is_indefinite: false, base_salary: 55000, status: 'pending_signature', amendments_count: 0 }
      ]);

      setAmendments([
        { id: 1, amendment_number: 'AMD-2024-001', contract: { id: 1, contract_number: 'CTR-2020-001' }, employee: { id: 1, name: 'Ahmad Shah Ahmadi' }, amendment_type: 'salary_change', effective_date: '2024-01-01', status: 'signed', previous_salary: 75000, new_salary: 85000, reason: 'Annual salary increment' },
        { id: 2, amendment_number: 'AMD-2024-002', contract: { id: 2, contract_number: 'CTR-2021-015' }, employee: { id: 2, name: 'Fatima Nazari' }, amendment_type: 'extension', effective_date: '2024-06-01', status: 'pending_approval', previous_end_date: '2024-05-31', new_end_date: '2025-05-31', reason: 'Contract renewal' },
        { id: 3, amendment_number: 'AMD-2024-003', contract: { id: 1, contract_number: 'CTR-2020-001' }, employee: { id: 1, name: 'Ahmad Shah Ahmadi' }, amendment_type: 'position_change', effective_date: '2023-01-01', status: 'signed', previous_position: 'Senior Program Officer', new_position: 'Program Manager', reason: 'Promotion' }
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : '-';
  const formatCurrency = (amount) => amount ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'AFN', minimumFractionDigits: 0 }).format(amount) : '-';

  const getDaysUntilExpiry = (endDate) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const today = new Date();
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const handleCreateAmendment = async () => {
    // API call to create amendment
    console.log('Creating amendment:', amendmentForm);
    setShowAmendmentModal(false);
    setSelectedContract(null);
    setAmendmentForm({
      amendment_type: 'extension',
      effective_date: '',
      reason: '',
      new_end_date: '',
      new_salary: '',
      new_position: ''
    });
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = searchTerm === '' ||
      contract.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contract_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || contract.status === statusFilter;
    const matchesType = typeFilter === '' || contract.contract_type === typeFilter;
    const matchesExpiring = !showExpiring || (getDaysUntilExpiry(contract.end_date) !== null && getDaysUntilExpiry(contract.end_date) <= 30 && getDaysUntilExpiry(contract.end_date) >= 0);
    return matchesSearch && matchesStatus && matchesType && matchesExpiring;
  });

  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const paginatedContracts = filteredContracts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contract Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage employment contracts and amendments
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={loadData} className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Plus className="w-5 h-5" />
            <span>New Contract</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.total}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Contracts</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.active}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 cursor-pointer" onClick={() => setShowExpiring(!showExpiring)}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.expiring}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Expiring (30d)</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.expired}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Expired</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FileEdit className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.pendingAmendments}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pending Amendments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('contracts')}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'contracts'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Contracts
          </button>
          <button
            onClick={() => setActiveTab('amendments')}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'amendments'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Amendments
          </button>
        </nav>
      </div>

      {/* Contracts Tab */}
      {activeTab === 'contracts' && (
        <>
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by employee or contract number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">All Status</option>
                {Object.entries(CONTRACT_STATUSES).map(([value, { label }]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">All Types</option>
                {Object.entries(CONTRACT_TYPES).map(([value, { label }]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={showExpiring} onChange={(e) => setShowExpiring(e.target.checked)} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Expiring Soon</span>
              </label>
            </div>
          </div>

          {/* Contracts Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Contract</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Salary</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedContracts.map((contract) => {
                    const daysUntilExpiry = getDaysUntilExpiry(contract.end_date);
                    return (
                      <tr key={contract.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900 dark:text-white">{contract.contract_number}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{contract.position}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-900 dark:text-white">{contract.employee.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{contract.employee.employee_code}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${CONTRACT_TYPES[contract.contract_type]?.color || ''}`}>
                            {CONTRACT_TYPES[contract.contract_type]?.label || contract.contract_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <p className="text-gray-900 dark:text-white">{formatDate(contract.start_date)}</p>
                          <p className="text-gray-500 dark:text-gray-400">
                            {contract.is_indefinite ? 'Indefinite' : `to ${formatDate(contract.end_date)}`}
                          </p>
                          {daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 30 && (
                            <span className="text-xs text-yellow-600 dark:text-yellow-400">
                              {daysUntilExpiry} days remaining
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-900 dark:text-white">
                          {formatCurrency(contract.base_salary)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${CONTRACT_STATUSES[contract.status]?.color || ''}`}>
                            {CONTRACT_STATUSES[contract.status]?.label || contract.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button onClick={() => navigate(`/employee-admin/employees/${contract.employee.id}`)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="View Employee">
                              <Eye className="w-4 h-4 text-gray-500" />
                            </button>
                            <button onClick={() => { setSelectedContract(contract); setShowAmendmentModal(true); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Create Amendment">
                              <FileEdit className="w-4 h-4 text-gray-500" />
                            </button>
                            {contract.amendments_count > 0 && (
                              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="View History">
                                <History className="w-4 h-4 text-gray-500" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <p className="text-sm text-gray-500">Page {currentPage} of {totalPages}</p>
                <div className="flex items-center space-x-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border rounded-lg disabled:opacity-50">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border rounded-lg disabled:opacity-50">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Amendments Tab */}
      {activeTab === 'amendments' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amendment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Changes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Effective Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {amendments.map((amendment) => (
                  <tr key={amendment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">{amendment.amendment_number}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{amendment.contract.contract_number}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">{amendment.employee.name}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{AMENDMENT_TYPES[amendment.amendment_type]}</td>
                    <td className="px-6 py-4 text-sm">
                      {amendment.amendment_type === 'salary_change' && (
                        <p>{formatCurrency(amendment.previous_salary)} → {formatCurrency(amendment.new_salary)}</p>
                      )}
                      {amendment.amendment_type === 'extension' && (
                        <p>{formatDate(amendment.previous_end_date)} → {formatDate(amendment.new_end_date)}</p>
                      )}
                      {amendment.amendment_type === 'position_change' && (
                        <p>{amendment.previous_position} → {amendment.new_position}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{formatDate(amendment.effective_date)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        amendment.status === 'signed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        amendment.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {amendment.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Amendment Modal */}
      {showAmendmentModal && selectedContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Contract Amendment</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Contract: {selectedContract.contract_number} | {selectedContract.employee.name}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amendment Type</label>
                <select value={amendmentForm.amendment_type} onChange={(e) => setAmendmentForm(f => ({ ...f, amendment_type: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  {Object.entries(AMENDMENT_TYPES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Effective Date</label>
                <input type="date" value={amendmentForm.effective_date} onChange={(e) => setAmendmentForm(f => ({ ...f, effective_date: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              {amendmentForm.amendment_type === 'extension' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New End Date</label>
                  <input type="date" value={amendmentForm.new_end_date} onChange={(e) => setAmendmentForm(f => ({ ...f, new_end_date: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
              )}
              {amendmentForm.amendment_type === 'salary_change' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Salary</label>
                  <input type="number" value={amendmentForm.new_salary} onChange={(e) => setAmendmentForm(f => ({ ...f, new_salary: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Enter new salary" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                <textarea value={amendmentForm.reason} onChange={(e) => setAmendmentForm(f => ({ ...f, reason: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Reason for amendment..." />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => { setShowAmendmentModal(false); setSelectedContract(null); }} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                Cancel
              </button>
              <button onClick={handleCreateAmendment} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                Create Amendment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractManagement;
