import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, Upload, FileCheck, Search, Filter, X } from 'lucide-react';
import Modal from '../../components/Modal';
import { membershipDB } from '../../services/db/indexedDB';

const Memberships = () => {
  const [memberships, setMemberships] = useState([]);
  const [filteredMemberships, setFilteredMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [formData, setFormData] = useState({
    nameMembershipPlatform: '',
    platformType: '',
    vdoRole: '',
    status: '',
    durationMembership: '',
    year: '',
    dateMembershipStarted: '',
    membershipCompletionDate: '',
    membershipCompletionOption: 'no_expiry',
    membershipCertificate: '',
    hasCertificate: 'no',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterPlatformType, setFilterPlatformType] = useState('');
  const [filterVdoRole, setFilterVdoRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDuration, setFilterDuration] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const platformTypes = [
    'Coordination Body',
    'UN Platform',
    'Cluster',
    'Network',
    'Working Group'
  ];

  const vdoRoles = [
    'Member',
    'Lead/Chair',
    'Co-lead',
    'Facilitator',
    'Co-Facilitator',
    'Steering Committee Member',
    'Strategic Advisory Group Member',
    'SC Member',
    'Others'
  ];

  const statusOptions = [
    'Member',
    'Lead/Chair',
    'Co-lead',
    'Non-Active',
    'Platform Deactivated',
    'Suspended',
    'Completed',
    'Active',
    '1 year completed',
    'Re-elected',
    'TBC',
    'Others'
  ];

  const durationOptions = [
    'Long term',
    'Ad-hoc',
    'Annually',
    'Other'
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [memberships, searchTerm, filterPlatformType, filterVdoRole, filterStatus, filterDuration, filterDateFrom, filterDateTo]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await membershipDB.getAll();
      setMemberships(data);
    } catch (error) {
      console.error('Error loading memberships:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...memberships];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(membership =>
        membership.nameMembershipPlatform?.toLowerCase().includes(searchLower) ||
        membership.platformType?.toLowerCase().includes(searchLower) ||
        membership.vdoRole?.toLowerCase().includes(searchLower)
      );
    }

    // Platform type filter
    if (filterPlatformType) {
      filtered = filtered.filter(membership => membership.platformType === filterPlatformType);
    }

    // VDO role filter
    if (filterVdoRole) {
      filtered = filtered.filter(membership => membership.vdoRole === filterVdoRole);
    }

    // Status filter
    if (filterStatus) {
      filtered = filtered.filter(membership => membership.status === filterStatus);
    }

    // Duration filter
    if (filterDuration) {
      filtered = filtered.filter(membership => membership.durationMembership === filterDuration);
    }

    // Date range filter
    if (filterDateFrom) {
      filtered = filtered.filter(membership =>
        membership.dateMembershipStarted && membership.dateMembershipStarted >= filterDateFrom
      );
    }
    if (filterDateTo) {
      filtered = filtered.filter(membership =>
        membership.dateMembershipStarted && membership.dateMembershipStarted <= filterDateTo
      );
    }

    setFilteredMemberships(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterPlatformType('');
    setFilterVdoRole('');
    setFilterStatus('');
    setFilterDuration('');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filterPlatformType) count++;
    if (filterVdoRole) count++;
    if (filterStatus) count++;
    if (filterDuration) count++;
    if (filterDateFrom) count++;
    if (filterDateTo) count++;
    return count;
  };

  const handleOpenModal = (membership = null) => {
    if (membership) {
      setSelectedMembership(membership);
      setFormData({
        nameMembershipPlatform: membership.nameMembershipPlatform || '',
        platformType: membership.platformType || '',
        vdoRole: membership.vdoRole || '',
        status: membership.status || '',
        durationMembership: membership.durationMembership || '',
        year: membership.year || '',
        dateMembershipStarted: membership.dateMembershipStarted || '',
        membershipCompletionDate: membership.membershipCompletionDate || '',
        membershipCompletionOption: membership.membershipCompletionOption || 'no_expiry',
        membershipCertificate: membership.membershipCertificate || '',
        hasCertificate: membership.hasCertificate || 'no',
      });
    } else {
      setFormData({
        nameMembershipPlatform: '',
        platformType: '',
        vdoRole: '',
        status: '',
        durationMembership: '',
        year: '',
        dateMembershipStarted: '',
        membershipCompletionDate: '',
        membershipCompletionOption: 'no_expiry',
        membershipCertificate: '',
        hasCertificate: 'no',
      });
      setSelectedMembership(null);
    }
    setErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nameMembershipPlatform.trim()) newErrors.nameMembershipPlatform = 'Platform name is required';
    if (!formData.dateMembershipStarted) newErrors.dateMembershipStarted = 'Membership start date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      if (selectedMembership) {
        await membershipDB.update(selectedMembership.id, formData);
      } else {
        await membershipDB.create(formData);
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving membership:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this membership record?')) {
      await membershipDB.delete(id);
      loadData();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('active') || statusLower.includes('member') || statusLower.includes('re-elected')) {
      return 'bg-green-100 text-green-800';
    }
    if (statusLower.includes('completed') || statusLower.includes('1 year')) {
      return 'bg-blue-100 text-blue-800';
    }
    if (statusLower.includes('non-active') || statusLower.includes('suspended') || statusLower.includes('deactivated')) {
      return 'bg-red-100 text-red-800';
    }
    if (statusLower.includes('tbc')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getRoleColor = (role) => {
    if (!role) return '';
    const roleLower = role.toLowerCase();
    if (roleLower.includes('lead') || roleLower.includes('chair')) {
      return 'text-primary-600 dark:text-primary-400 font-semibold';
    }
    if (roleLower.includes('facilitator')) {
      return 'text-blue-600 dark:text-blue-400 font-medium';
    }
    if (roleLower.includes('steering') || roleLower.includes('advisory')) {
      return 'text-purple-600 dark:text-purple-400 font-medium';
    }
    return 'text-gray-600 dark:text-gray-400';
  };

  const getCompletionDisplay = (membership) => {
    if (membership.membershipCompletionOption === 'no_expiry') {
      return 'No expiry';
    }
    if (membership.membershipCompletionOption === 'on_going') {
      return 'On going';
    }
    if (membership.membershipCompletionOption === '1_year_completed') {
      return '1 year completed';
    }
    return membership.membershipCompletionDate || '-';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">VDO Membership & Representation</h1>
        <p className="text-gray-600 dark:text-gray-400">Track VDO&apos;s memberships, roles, and representation across various platforms and organizations</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by platform name, type, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filter toggle button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <Filter className="h-5 w-5" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <span className="px-2 py-0.5 text-xs bg-primary-500 text-white rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </button>

          {/* Add button */}
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            <Plus className="h-5 w-5" />
            Add Membership
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Filter Memberships</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-primary-500 hover:text-primary-600"
              >
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Platform Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Platform Type
                </label>
                <select
                  value={filterPlatformType}
                  onChange={(e) => setFilterPlatformType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All types</option>
                  {platformTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* VDO Role Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  VDO Role
                </label>
                <select
                  value={filterVdoRole}
                  onChange={(e) => setFilterVdoRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All roles</option>
                  {vdoRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All statuses</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Duration Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration
                </label>
                <select
                  value={filterDuration}
                  onChange={(e) => setFilterDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All durations</option>
                  {durationOptions.map(duration => (
                    <option key={duration} value={duration}>{duration}</option>
                  ))}
                </select>
              </div>

              {/* Date From Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date From
                </label>
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Date To Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date To
                </label>
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {(searchTerm || getActiveFiltersCount() > 0) && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>

            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm">
                Search: {searchTerm}
                <button onClick={() => setSearchTerm('')} className="hover:text-primary-900 dark:hover:text-primary-100">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {filterPlatformType && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                Type: {filterPlatformType}
                <button onClick={() => setFilterPlatformType('')} className="hover:text-blue-900 dark:hover:text-blue-100">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {filterVdoRole && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                Role: {filterVdoRole}
                <button onClick={() => setFilterVdoRole('')} className="hover:text-purple-900 dark:hover:text-purple-100">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {filterStatus && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm">
                Status: {filterStatus}
                <button onClick={() => setFilterStatus('')} className="hover:text-green-900 dark:hover:text-green-100">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {filterDuration && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-full text-sm">
                Duration: {filterDuration}
                <button onClick={() => setFilterDuration('')} className="hover:text-yellow-900 dark:hover:text-yellow-100">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {filterDateFrom && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 rounded-full text-sm">
                From: {filterDateFrom}
                <button onClick={() => setFilterDateFrom('')} className="hover:text-pink-900 dark:hover:text-pink-100">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {filterDateTo && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-full text-sm">
                To: {filterDateTo}
                <button onClick={() => setFilterDateTo('')} className="hover:text-indigo-900 dark:hover:text-indigo-100">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : memberships.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No memberships found</h3>
          <p className="text-gray-600 dark:text-gray-400">Start tracking your platform memberships and representation</p>
        </div>
      ) : (
        <>
          {/* Results count */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredMemberships.length} of {memberships.length} membership{memberships.length !== 1 ? 's' : ''}
            </p>
          </div>

          {filteredMemberships.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No memberships match your filters</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Try adjusting your search or filter criteria</p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sn</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Platform</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">VDO Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Duration</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Year</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Completion</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cert</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredMemberships.map((membership, index) => (
                      <tr key={membership.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{index + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{membership.nameMembershipPlatform}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{membership.platformType || '-'}</td>
                        <td className={`px-4 py-3 text-sm ${getRoleColor(membership.vdoRole)}`}>{membership.vdoRole || '-'}</td>
                        <td className="px-4 py-3">
                          {membership.status ? (
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(membership.status)}`}>
                              {membership.status}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{membership.durationMembership || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{membership.year || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{getCompletionDisplay(membership)}</td>
                        <td className="px-4 py-3 text-center">
                          {membership.hasCertificate === 'yes' ? (
                            membership.membershipCertificate ? (
                              <a href={membership.membershipCertificate} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700">
                                <FileCheck className="h-4 w-4 inline" />
                              </a>
                            ) : (
                              <FileCheck className="h-4 w-4 inline text-green-600" />
                            )
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleOpenModal(membership)} className="p-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(membership.id)} className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 ml-1">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedMembership ? 'Edit Membership' : 'Add Membership'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name Membership Platform <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nameMembershipPlatform"
              value={formData.nameMembershipPlatform}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.nameMembershipPlatform ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Enter platform/organization name"
            />
            {errors.nameMembershipPlatform && <p className="mt-1 text-sm text-red-500">{errors.nameMembershipPlatform}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform Type</label>
              <select
                name="platformType"
                value={formData.platformType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select type...</option>
                {platformTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">VDO Role</label>
              <select
                name="vdoRole"
                value={formData.vdoRole}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select role...</option>
                {vdoRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select status...</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration Membership</label>
              <select
                name="durationMembership"
                value={formData.durationMembership}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select duration...</option>
                {durationOptions.map(duration => (
                  <option key={duration} value={duration}>{duration}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
              <input
                type="text"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date Membership Started <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dateMembershipStarted"
                value={formData.dateMembershipStarted}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.dateMembershipStarted ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.dateMembershipStarted && <p className="mt-1 text-sm text-red-500">{errors.dateMembershipStarted}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Membership Completion</label>
            <select
              name="membershipCompletionOption"
              value={formData.membershipCompletionOption}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2"
            >
              <option value="no_expiry">No expiry</option>
              <option value="on_going">On going</option>
              <option value="1_year_completed">1 year completed</option>
              <option value="date_specified">Date specified</option>
            </select>

            {formData.membershipCompletionOption === 'date_specified' && (
              <input
                type="date"
                name="membershipCompletionDate"
                value={formData.membershipCompletionDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Membership Certificate/Confirmation</label>
            <div className="flex items-center gap-4 mb-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="hasCertificate"
                  value="yes"
                  checked={formData.hasCertificate === 'yes'}
                  onChange={handleInputChange}
                  className="text-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="hasCertificate"
                  value="no"
                  checked={formData.hasCertificate === 'no'}
                  onChange={handleInputChange}
                  className="text-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">No</span>
              </label>
            </div>

            {formData.hasCertificate === 'yes' && (
              <div className="mt-2">
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Certificate Link/URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    name="membershipCertificate"
                    value={formData.membershipCertificate}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://example.com/certificate.pdf"
                  />
                  <button
                    type="button"
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Note: File upload functionality will be implemented with backend integration
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg disabled:opacity-50 hover:bg-primary-600"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Memberships;
