import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Search,
  Eye,
  Edit,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  User,
  Building2,
  Calendar,
  FileText,
  ArrowRight,
  UserCheck
} from 'lucide-react';

const HIRING_TYPES = {
  temporary_replacement: 'Temporary Replacement',
  gap_filling: 'Gap Filling',
  project_urgency: 'Project Urgency',
  donor_requirement: 'Donor Requirement',
  other: 'Other'
};

const CONTRACT_TYPES = {
  short_term: 'Short-Term Contract',
  temporary: 'Temporary Employment',
  local_consultant: 'Local Consultant',
  international_consultant: 'International Consultant',
  daily_worker: 'Daily Worker',
  outsourced_lta: 'Outsourced (LTA)',
  intern_volunteer: 'Intern/Volunteer',
  other: 'Other'
};

const URGENCY_LEVELS = {
  immediate: { label: 'Immediate (0-5 days)', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  urgent: { label: 'Urgent (1-2 weeks)', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
  normal: { label: 'Normal (3-4 weeks)', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' }
};

const REQUEST_STATUSES = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: FileText },
  pending_dept_head: { label: 'Pending Dept Head', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
  pending_hr: { label: 'Pending HR', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
  pending_finance: { label: 'Pending Finance', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
  pending_edd: { label: 'Pending EDD', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  fulfilled: { label: 'Fulfilled', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: UserCheck },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400', icon: XCircle }
};

const InterimHiring = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    fulfilled: 0,
    rejected: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      setStatistics({
        total: 24,
        pending: 5,
        approved: 3,
        fulfilled: 15,
        rejected: 1
      });

      setRequests([
        {
          id: 1,
          request_number: 'INT-2024-001',
          position_title: 'Program Officer',
          department: 'Programs',
          project: 'Education Support Project',
          hiring_type: 'temporary_replacement',
          recommended_contract_type: 'short_term',
          urgency_level: 'urgent',
          contract_duration_from: '2024-02-01',
          contract_duration_to: '2024-05-31',
          duration_months: 4,
          status: 'pending_hr',
          requested_by: 'Sara Mohammadi',
          request_date: '2024-01-18',
          detailed_justification: 'Required to cover maternity leave of current Program Officer. Project deliverables must continue without interruption.',
          risk_factors: ['program_delay', 'donor_timeline'],
          budget_confirmed: true,
          funding_source: 'Project Budget',
          approvals: {
            dept_head: { approved: true, by: 'Mohammad Ahmadi', at: '2024-01-19' },
            hr: { approved: null, by: null, at: null },
            finance: { approved: null, by: null, at: null },
            edd: { approved: null, by: null, at: null }
          }
        },
        {
          id: 2,
          request_number: 'INT-2024-002',
          position_title: 'Driver',
          department: 'Operations',
          project: null,
          hiring_type: 'gap_filling',
          recommended_contract_type: 'daily_worker',
          urgency_level: 'immediate',
          contract_duration_from: '2024-01-25',
          contract_duration_to: '2024-03-31',
          duration_months: 2,
          status: 'approved',
          requested_by: 'Ali Rezaei',
          request_date: '2024-01-15',
          detailed_justification: 'Current driver resigned with immediate effect. Need replacement urgently for field operations.',
          risk_factors: ['operational_disruption', 'security'],
          budget_confirmed: true,
          funding_source: 'Core Budget',
          approvals: {
            dept_head: { approved: true, by: 'Karim Naseri', at: '2024-01-15' },
            hr: { approved: true, by: 'Zahra Mohammadi', at: '2024-01-16' },
            finance: { approved: true, by: 'Fatima Nazari', at: '2024-01-17' },
            edd: { approved: true, by: 'Ahmad Shah', at: '2024-01-18' }
          }
        },
        {
          id: 3,
          request_number: 'INT-2024-003',
          position_title: 'Data Entry Clerk',
          department: 'Monitoring & Evaluation',
          project: 'Health Initiative',
          hiring_type: 'project_urgency',
          recommended_contract_type: 'temporary',
          urgency_level: 'normal',
          contract_duration_from: '2024-02-15',
          contract_duration_to: '2024-08-14',
          duration_months: 6,
          status: 'pending_dept_head',
          requested_by: 'Mariam Akbari',
          request_date: '2024-01-20',
          detailed_justification: 'Large-scale data collection campaign requires additional data entry support. Volume of data exceeds current capacity.',
          risk_factors: ['meal_delay'],
          budget_confirmed: true,
          funding_source: 'Project Budget',
          approvals: {
            dept_head: { approved: null, by: null, at: null },
            hr: { approved: null, by: null, at: null },
            finance: { approved: null, by: null, at: null },
            edd: { approved: null, by: null, at: null }
          }
        }
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : '-';

  const getApprovalProgress = (request) => {
    const steps = ['dept_head', 'hr', 'finance', 'edd'];
    const completed = steps.filter(step => request.approvals[step]?.approved === true).length;
    return { completed, total: steps.length };
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = searchTerm === '' ||
      req.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.position_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || req.status === statusFilter;
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Interim Hiring Requests</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage temporary and interim staff hiring requests
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={loadData} className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <RefreshCw className="w-5 h-5" />
          </button>
          <button onClick={() => setShowNewRequestModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            <Plus className="w-5 h-5" />
            <span>New Request</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Requests', value: statistics.total, color: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400', icon: FileText },
          { label: 'Pending', value: statistics.pending, color: 'bg-yellow-100 dark:bg-yellow-900/30', iconColor: 'text-yellow-600 dark:text-yellow-400', icon: Clock },
          { label: 'Approved', value: statistics.approved, color: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-600 dark:text-green-400', icon: CheckCircle },
          { label: 'Fulfilled', value: statistics.fulfilled, color: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600 dark:text-purple-400', icon: UserCheck },
          { label: 'Rejected', value: statistics.rejected, color: 'bg-red-100 dark:bg-red-900/30', iconColor: 'text-red-600 dark:text-red-400', icon: XCircle }
        ].map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by request number or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="">All Status</option>
            {Object.entries(REQUEST_STATUSES).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Request List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No interim hiring requests found</p>
          </div>
        ) : (
          filteredRequests.map((request) => {
            const statusConfig = REQUEST_STATUSES[request.status];
            const urgencyConfig = URGENCY_LEVELS[request.urgency_level];
            const progress = getApprovalProgress(request);

            return (
              <div key={request.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Request Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  onClick={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                        <Briefcase className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{request.position_title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig?.color || ''}`}>
                            {statusConfig?.label || request.status}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${urgencyConfig?.color || ''}`}>
                            {urgencyConfig?.label?.split(' ')[0] || request.urgency_level}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {request.request_number} | {request.department} | {HIRING_TYPES[request.hiring_type]}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {/* Approval Progress */}
                      <div className="hidden md:flex items-center space-x-2">
                        {['dept_head', 'hr', 'finance', 'edd'].map((step, index) => {
                          const approval = request.approvals[step];
                          return (
                            <div key={step} className="flex items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                approval?.approved === true ? 'bg-green-500' :
                                approval?.approved === false ? 'bg-red-500' :
                                'bg-gray-300 dark:bg-gray-600'
                              }`}>
                                {approval?.approved === true ? (
                                  <CheckCircle className="w-4 h-4 text-white" />
                                ) : approval?.approved === false ? (
                                  <XCircle className="w-4 h-4 text-white" />
                                ) : (
                                  <span className="text-xs text-white">{index + 1}</span>
                                )}
                              </div>
                              {index < 3 && (
                                <div className={`w-4 h-0.5 ${
                                  approval?.approved === true ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                                }`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="text-sm text-gray-500">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {formatDate(request.contract_duration_from)} - {formatDate(request.contract_duration_to)}
                      </div>
                      {expandedRequest === request.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedRequest === request.id && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Request Details</h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-gray-500">Requested by:</span> <span className="text-gray-900 dark:text-white">{request.requested_by}</span></p>
                          <p><span className="text-gray-500">Request Date:</span> <span className="text-gray-900 dark:text-white">{formatDate(request.request_date)}</span></p>
                          <p><span className="text-gray-500">Contract Type:</span> <span className="text-gray-900 dark:text-white">{CONTRACT_TYPES[request.recommended_contract_type]}</span></p>
                          <p><span className="text-gray-500">Duration:</span> <span className="text-gray-900 dark:text-white">{request.duration_months} months</span></p>
                          <p><span className="text-gray-500">Funding Source:</span> <span className="text-gray-900 dark:text-white">{request.funding_source}</span></p>
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Justification</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg p-3">
                          {request.detailed_justification}
                        </p>
                        <div className="mt-3">
                          <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Risk Factors</h5>
                          <div className="flex flex-wrap gap-2">
                            {request.risk_factors.map((risk) => (
                              <span key={risk} className="px-2 py-1 text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 rounded-full">
                                {risk.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Approval History */}
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Approval Workflow</h4>
                      <div className="grid grid-cols-4 gap-4">
                        {[
                          { key: 'dept_head', label: 'Dept Head' },
                          { key: 'hr', label: 'HR' },
                          { key: 'finance', label: 'Finance' },
                          { key: 'edd', label: 'EDD' }
                        ].map(({ key, label }) => {
                          const approval = request.approvals[key];
                          return (
                            <div key={key} className={`p-3 rounded-lg border ${
                              approval?.approved === true ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                              approval?.approved === false ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                              'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                            }`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                                {approval?.approved === true ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : approval?.approved === false ? (
                                  <XCircle className="w-4 h-4 text-red-600" />
                                ) : (
                                  <Clock className="w-4 h-4 text-gray-400" />
                                )}
                              </div>
                              {approval?.by && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">{approval.by}</p>
                              )}
                              {approval?.at && (
                                <p className="text-xs text-gray-400">{formatDate(approval.at)}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                      {request.status === 'approved' && (
                        <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                          <UserCheck className="w-4 h-4" />
                          <span>Mark as Fulfilled</span>
                        </button>
                      )}
                      {request.status.startsWith('pending') && (
                        <>
                          <button className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            <CheckCircle className="w-4 h-4" />
                            <span>Approve</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default InterimHiring;
