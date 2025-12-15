import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  Eye,
  ChevronDown,
  ChevronUp,
  FileText,
  Users,
  Briefcase,
  Building2,
  Shield,
  Laptop,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const ONBOARDING_SECTIONS = [
  { key: 'pre_employment', label: 'Pre-Employment', icon: FileText, color: 'bg-blue-500' },
  { key: 'identity_verification', label: 'Identity Verification', icon: Shield, color: 'bg-purple-500' },
  { key: 'payroll_benefits', label: 'Payroll & Benefits', icon: Building2, color: 'bg-green-500' },
  { key: 'induction_orientation', label: 'Induction & Orientation', icon: Users, color: 'bg-yellow-500' },
  { key: 'it_access', label: 'IT & Access', icon: Laptop, color: 'bg-red-500' },
  { key: 'department_specific', label: 'Department Specific', icon: Briefcase, color: 'bg-indigo-500' },
  { key: 'policy_acknowledgements', label: 'Policy Acknowledgements', icon: ClipboardList, color: 'bg-pink-500' },
  { key: 'mahram', label: 'Mahram (Female Staff)', icon: User, color: 'bg-orange-500' }
];

const OnboardingDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [checklists, setChecklists] = useState([]);
  const [statistics, setStatistics] = useState({
    notStarted: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedChecklist, setExpandedChecklist] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Simulated data
      setStatistics({
        notStarted: 2,
        inProgress: 5,
        completed: 48,
        overdue: 1
      });

      setChecklists([
        {
          id: 1,
          employee: { id: 6, name: 'Sara Rezaei', employee_code: 'VDO-EMP-0006', position: 'M&E Officer', department: 'Monitoring & Evaluation', gender: 'female' },
          checklist_type: 'standard',
          start_date: '2024-01-15',
          target_completion_date: '2024-01-29',
          status: 'in_progress',
          progress: 65,
          assigned_hr: 'Zahra Mohammadi',
          items: [
            { id: 1, section: 'pre_employment', item_name: 'Collect signed offer letter', status: 'completed', is_mandatory: true },
            { id: 2, section: 'pre_employment', item_name: 'Collect signed contract', status: 'completed', is_mandatory: true },
            { id: 3, section: 'identity_verification', item_name: 'Verify Tazkira/ID', status: 'completed', is_mandatory: true },
            { id: 4, section: 'identity_verification', item_name: 'Verify education certificates', status: 'in_progress', is_mandatory: true },
            { id: 5, section: 'payroll_benefits', item_name: 'Collect bank details', status: 'completed', is_mandatory: true },
            { id: 6, section: 'induction_orientation', item_name: 'HR orientation session', status: 'pending', is_mandatory: true },
            { id: 7, section: 'it_access', item_name: 'Create email account', status: 'completed', is_mandatory: true },
            { id: 8, section: 'it_access', item_name: 'Issue laptop/equipment', status: 'pending', is_mandatory: true },
            { id: 9, section: 'policy_acknowledgements', item_name: 'Sign NDA', status: 'pending', is_mandatory: true },
            { id: 10, section: 'policy_acknowledgements', item_name: 'Sign Code of Conduct', status: 'pending', is_mandatory: true },
            { id: 11, section: 'mahram', item_name: 'Complete Mahram registration', status: 'pending', is_mandatory: true }
          ]
        },
        {
          id: 2,
          employee: { id: 3, name: 'Mohammad Karimi', employee_code: 'VDO-EMP-0003', position: 'Driver', department: 'Operations', gender: 'male' },
          checklist_type: 'standard',
          start_date: '2024-01-10',
          target_completion_date: '2024-01-24',
          status: 'in_progress',
          progress: 80,
          assigned_hr: 'Zahra Mohammadi',
          items: [
            { id: 1, section: 'pre_employment', item_name: 'Collect signed offer letter', status: 'completed', is_mandatory: true },
            { id: 2, section: 'pre_employment', item_name: 'Collect signed contract', status: 'completed', is_mandatory: true },
            { id: 3, section: 'identity_verification', item_name: 'Verify Tazkira/ID', status: 'completed', is_mandatory: true },
            { id: 4, section: 'payroll_benefits', item_name: 'Collect bank details', status: 'completed', is_mandatory: true },
            { id: 5, section: 'induction_orientation', item_name: 'HR orientation session', status: 'completed', is_mandatory: true },
            { id: 6, section: 'policy_acknowledgements', item_name: 'Sign NDA', status: 'completed', is_mandatory: true },
            { id: 7, section: 'policy_acknowledgements', item_name: 'Sign Code of Conduct', status: 'pending', is_mandatory: true }
          ]
        },
        {
          id: 3,
          employee: { id: 9, name: 'Fahim Naseri', employee_code: 'VDO-EMP-0009', position: 'Finance Assistant', department: 'Finance', gender: 'male' },
          checklist_type: 'standard',
          start_date: '2024-01-18',
          target_completion_date: '2024-02-01',
          status: 'not_started',
          progress: 0,
          assigned_hr: 'Zahra Mohammadi',
          items: []
        }
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      not_started: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    const labels = {
      not_started: 'Not Started',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.not_started}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getItemStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'waived':
        return <XCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />;
    }
  };

  const filteredChecklists = checklists.filter(checklist => {
    const matchesSearch = searchTerm === '' ||
      checklist.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checklist.employee.employee_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || checklist.status === statusFilter;
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Onboarding Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track and manage employee onboarding checklists
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md" onClick={() => setStatusFilter('not_started')}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.notStarted}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Not Started</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md" onClick={() => setStatusFilter('in_progress')}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.inProgress}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md" onClick={() => setStatusFilter('completed')}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.completed}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md" onClick={() => setStatusFilter('')}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.overdue}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Overdue</p>
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
              placeholder="Search by employee name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          {(searchTerm || statusFilter) && (
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter(''); }}
              className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Onboarding Checklists */}
      <div className="space-y-4">
        {filteredChecklists.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No onboarding checklists found</p>
          </div>
        ) : (
          filteredChecklists.map((checklist) => (
            <div key={checklist.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Checklist Header */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => setExpandedChecklist(expandedChecklist === checklist.id ? null : checklist.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      checklist.employee.gender === 'female' ? 'bg-pink-100 dark:bg-pink-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      <span className={`text-sm font-bold ${
                        checklist.employee.gender === 'female' ? 'text-pink-600 dark:text-pink-400' : 'text-blue-600 dark:text-blue-400'
                      }`}>
                        {checklist.employee.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{checklist.employee.name}</h3>
                        {getStatusBadge(checklist.status)}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {checklist.employee.employee_code} | {checklist.employee.position} | {checklist.employee.department}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    {/* Progress Bar */}
                    <div className="hidden md:block w-32">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{checklist.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            checklist.progress === 100 ? 'bg-green-500' : 'bg-primary-500'
                          }`}
                          style={{ width: `${checklist.progress}%` }}
                        />
                      </div>
                    </div>
                    {/* Dates */}
                    <div className="hidden lg:block text-sm text-gray-500 dark:text-gray-400">
                      <p>Started: {new Date(checklist.start_date).toLocaleDateString()}</p>
                      <p>Due: {new Date(checklist.target_completion_date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/employee-admin/employees/${checklist.employee.id}`);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        title="View Employee"
                      >
                        <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                      {expandedChecklist === checklist.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Checklist Items */}
              {expandedChecklist === checklist.id && checklist.items.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/30">
                  <div className="space-y-6">
                    {ONBOARDING_SECTIONS.filter(section =>
                      checklist.items.some(item => item.section === section.key)
                    ).map((section) => {
                      const sectionItems = checklist.items.filter(item => item.section === section.key);
                      const completedCount = sectionItems.filter(item => item.status === 'completed').length;
                      const SectionIcon = section.icon;

                      return (
                        <div key={section.key}>
                          <div className="flex items-center space-x-2 mb-3">
                            <div className={`p-1.5 rounded-lg ${section.color}`}>
                              <SectionIcon className="w-4 h-4 text-white" />
                            </div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{section.label}</h4>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              ({completedCount}/{sectionItems.length})
                            </span>
                          </div>
                          <div className="space-y-2 ml-8">
                            {sectionItems.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                              >
                                <div className="flex items-center space-x-3">
                                  {getItemStatusIcon(item.status)}
                                  <span className={`text-sm ${
                                    item.status === 'completed'
                                      ? 'text-gray-500 dark:text-gray-400 line-through'
                                      : 'text-gray-900 dark:text-white'
                                  }`}>
                                    {item.item_name}
                                  </span>
                                  {item.is_mandatory && (
                                    <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded">
                                      Required
                                    </span>
                                  )}
                                </div>
                                {item.status !== 'completed' && (
                                  <button className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                                    Mark Complete
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Complete Onboarding Button */}
                  {checklist.status === 'in_progress' && checklist.progress === 100 && (
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <CheckCircle className="w-5 h-5" />
                        <span>Complete Onboarding</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OnboardingDashboard;
