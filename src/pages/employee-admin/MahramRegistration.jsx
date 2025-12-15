import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Plus,
  Search,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Phone,
  CreditCard,
  MapPin,
  Calendar,
  AlertTriangle,
  FileText,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

const RELATIONSHIPS = {
  father: 'Father',
  husband: 'Husband',
  brother: 'Brother',
  son: 'Son',
  uncle: 'Uncle',
  nephew: 'Nephew'
};

const AVAILABILITY_OPTIONS = {
  full_time: { label: 'Full-Time', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  part_time: { label: 'Part-Time', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  on_call: { label: 'On-Call', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' }
};

const STATUSES = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400' },
  pending_verification: { label: 'Pending Verification', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
};

const MahramRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    pending: 0,
    expired: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    mahram_name: '',
    relationship: 'husband',
    national_id_number: '',
    contact_number: '',
    address: '',
    availability: 'full_time',
    availability_notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      setStatistics({
        total: 45,
        active: 38,
        pending: 5,
        expired: 2
      });

      setRegistrations([
        {
          id: 1,
          employee: { id: 2, name: 'Fatima Nazari', employee_code: 'VDO-EMP-0002', position: 'Finance Officer', department: 'Finance' },
          mahram_name: 'Ali Nazari',
          relationship: 'father',
          national_id_number: '1234-5678-0001',
          contact_number: '+93700111222',
          address: 'House 45, Street 5, Karte-e-Char, Kabul',
          availability: 'full_time',
          availability_notes: null,
          status: 'active',
          employee_declaration_signed: true,
          mahram_consent_signed: true,
          verified_by: 'Zahra Mohammadi',
          verified_at: '2024-01-05',
          effective_from: '2024-01-05',
          effective_until: null
        },
        {
          id: 2,
          employee: { id: 6, name: 'Sara Rezaei', employee_code: 'VDO-EMP-0006', position: 'M&E Officer', department: 'Monitoring & Evaluation' },
          mahram_name: 'Hassan Rezaei',
          relationship: 'husband',
          national_id_number: '1234-5678-0002',
          contact_number: '+93700222333',
          address: 'House 12, Street 3, District 4, Kabul',
          availability: 'part_time',
          availability_notes: 'Available on weekends and after 4pm on weekdays',
          status: 'pending_verification',
          employee_declaration_signed: true,
          mahram_consent_signed: true,
          verified_by: null,
          verified_at: null,
          effective_from: null,
          effective_until: null
        },
        {
          id: 3,
          employee: { id: 8, name: 'Mariam Akbari', employee_code: 'VDO-EMP-0008', position: 'Program Officer', department: 'Programs' },
          mahram_name: 'Akbar Akbari',
          relationship: 'brother',
          national_id_number: '1234-5678-0003',
          contact_number: '+93700333444',
          address: 'House 78, Street 9, Karte-e-Mamorin, Kabul',
          availability: 'on_call',
          availability_notes: 'Student - available for field visits only',
          status: 'active',
          employee_declaration_signed: true,
          mahram_consent_signed: true,
          verified_by: 'Zahra Mohammadi',
          verified_at: '2023-08-20',
          effective_from: '2021-08-20',
          effective_until: null
        },
        {
          id: 4,
          employee: { id: 4, name: 'Zahra Mohammadi', employee_code: 'VDO-EMP-0004', position: 'HR Assistant', department: 'HR & Administration' },
          mahram_name: 'Mohammad Mohammadi',
          relationship: 'father',
          national_id_number: '1234-5678-0004',
          contact_number: '+93700444555',
          address: 'House 23, Street 7, Kart-e-Se, Kabul',
          availability: 'full_time',
          availability_notes: null,
          status: 'active',
          employee_declaration_signed: true,
          mahram_consent_signed: true,
          verified_by: 'HR Manager',
          verified_at: '2022-02-25',
          effective_from: '2022-02-20',
          effective_until: null
        }
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : '-';

  const handleSubmit = async () => {
    console.log('Submitting:', formData);
    setShowModal(false);
    setFormData({
      employee_id: '',
      mahram_name: '',
      relationship: 'husband',
      national_id_number: '',
      contact_number: '',
      address: '',
      availability: 'full_time',
      availability_notes: ''
    });
  };

  const handleVerify = async (id) => {
    console.log('Verifying:', id);
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = searchTerm === '' ||
      reg.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.mahram_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || reg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mahram Registration</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage mahram information for female staff (Afghanistan requirement)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={loadData} className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <RefreshCw className="w-5 h-5" />
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            <Plus className="w-5 h-5" />
            <span>New Registration</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.total}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Registrations</p>
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
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.pending}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pending Verification</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.expired}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Expired</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee or mahram name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="">All Status</option>
            {Object.entries(STATUSES).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Registrations List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mahram</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Relationship</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Availability</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRegistrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                        <span className="text-sm font-medium text-pink-600 dark:text-pink-400">
                          {reg.employee.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{reg.employee.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{reg.employee.employee_code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900 dark:text-white">{reg.mahram_name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{reg.contact_number}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {RELATIONSHIPS[reg.relationship]}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${AVAILABILITY_OPTIONS[reg.availability]?.color || ''}`}>
                      {AVAILABILITY_OPTIONS[reg.availability]?.label || reg.availability}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUSES[reg.status]?.color || ''}`}>
                      {STATUSES[reg.status]?.label || reg.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => navigate(`/employee-admin/employees/${reg.employee.id}`)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="View Employee">
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                      {reg.status === 'pending_verification' && (
                        <button onClick={() => handleVerify(reg.id)} className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg" title="Verify">
                          <ShieldCheck className="w-4 h-4 text-green-600" />
                        </button>
                      )}
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Edit">
                        <Edit className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">New Mahram Registration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mahram Name</label>
                <input type="text" value={formData.mahram_name} onChange={(e) => setFormData(f => ({ ...f, mahram_name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Full name of mahram" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Relationship</label>
                <select value={formData.relationship} onChange={(e) => setFormData(f => ({ ...f, relationship: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  {Object.entries(RELATIONSHIPS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">National ID Number</label>
                <input type="text" value={formData.national_id_number} onChange={(e) => setFormData(f => ({ ...f, national_id_number: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Tazkira number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Number</label>
                <input type="tel" value={formData.contact_number} onChange={(e) => setFormData(f => ({ ...f, contact_number: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="+93..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                <textarea value={formData.address} onChange={(e) => setFormData(f => ({ ...f, address: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Full address" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Availability</label>
                <select value={formData.availability} onChange={(e) => setFormData(f => ({ ...f, availability: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  {Object.entries(AVAILABILITY_OPTIONS).map(([value, { label }]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Availability Notes</label>
                <textarea value={formData.availability_notes} onChange={(e) => setFormData(f => ({ ...f, availability_notes: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Any notes about availability..." />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                Cancel
              </button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                Register
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MahramRegistration;
