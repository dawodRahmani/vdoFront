import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  ArrowRight,
  RefreshCw,
  Building2,
  Briefcase,
  FileCheck,
  ClipboardList
} from 'lucide-react';
import { initEmployeeAdminDB, onboardingChecklistsDB, interimHiringRequestsDB } from '../../services/db/employeeAdminService';
import { employeeDB } from '../../services/db/indexedDB';

const HRDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    headcount: {
      total: 0,
      core: 0,
      project: 0,
      consultants: 0,
      interns: 0,
      other: 0,
      male: 0,
      female: 0
    },
    movement: {
      newHires: 0,
      separations: 0,
      resignations: 0,
      terminations: 0
    },
    rates: {
      turnoverRate: 0,
      retentionRate: 0,
      voluntaryTurnover: 0,
      involuntaryTurnover: 0
    },
    pending: {
      onboardings: 0,
      expiringContracts: 0,
      probationsEnding: 0,
      policyCompliance: 0,
      interimRequests: 0
    },
    recentHires: [],
    upcomingBirthdays: [],
    workAnniversaries: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Initialize IndexedDB
      await initEmployeeAdminDB();

      // Load employees from IndexedDB
      const employees = await employeeDB.getAll();

      // Calculate headcount by type and gender
      const headcount = {
        total: employees.length,
        core: employees.filter(e => (e.employmentType || e.employment_type) === 'core').length,
        project: employees.filter(e => (e.employmentType || e.employment_type) === 'project').length,
        consultants: employees.filter(e => (e.employmentType || e.employment_type) === 'consultant').length,
        interns: employees.filter(e => (e.employmentType || e.employment_type) === 'intern').length,
        other: employees.filter(e => !['core', 'project', 'consultant', 'intern'].includes(e.employmentType || e.employment_type)).length,
        male: employees.filter(e => e.gender === 'male').length,
        female: employees.filter(e => e.gender === 'female').length
      };

      // Calculate movement (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentHiresList = employees.filter(e => {
        const hireDate = new Date(e.hireDate || e.date_of_hire);
        return hireDate >= thirtyDaysAgo;
      });

      // Get pending onboardings
      let pendingOnboardings = 0;
      let pendingInterim = 0;
      try {
        const onboardings = await onboardingChecklistsDB.getByStatus('in_progress');
        pendingOnboardings = onboardings?.length || 0;
        const interimRequests = await interimHiringRequestsDB.getByStatus('pending');
        pendingInterim = interimRequests?.length || 0;
      } catch (e) {
        // Stores might not exist yet
      }

      // Count probation employees
      const probationEmployees = employees.filter(e => (e.status || e.employment_status) === 'probation').length;

      setDashboardData({
        headcount,
        movement: {
          newHires: recentHiresList.length,
          separations: employees.filter(e => (e.status || e.employment_status) === 'separated').length,
          resignations: 0,
          terminations: employees.filter(e => (e.status || e.employment_status) === 'terminated').length
        },
        rates: {
          turnoverRate: employees.length > 0 ? ((employees.filter(e => ['separated', 'terminated'].includes(e.status || e.employment_status)).length / employees.length) * 100).toFixed(1) : 0,
          retentionRate: employees.length > 0 ? (100 - ((employees.filter(e => ['separated', 'terminated'].includes(e.status || e.employment_status)).length / employees.length) * 100)).toFixed(1) : 100,
          voluntaryTurnover: 0,
          involuntaryTurnover: 0
        },
        pending: {
          onboardings: employees.filter(e => (e.status || e.employment_status) === 'onboarding').length + pendingOnboardings,
          expiringContracts: 0,
          probationsEnding: probationEmployees,
          policyCompliance: 0,
          interimRequests: pendingInterim
        },
        recentHires: recentHiresList.slice(0, 5).map(e => ({
          id: e.id,
          name: `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.name || 'Unknown',
          position: e.position || 'Not Assigned',
          department: e.department || 'Not Assigned',
          date: e.hireDate || e.date_of_hire || ''
        })),
        upcomingBirthdays: employees
          .filter(e => e.dateOfBirth || e.date_of_birth)
          .slice(0, 3)
          .map(e => ({
            id: e.id,
            name: `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.name || 'Unknown',
            department: e.department || 'Not Assigned',
            date: e.dateOfBirth || e.date_of_birth || ''
          })),
        workAnniversaries: employees
          .filter(e => e.hireDate || e.date_of_hire)
          .slice(0, 3)
          .map(e => {
            const hireDate = new Date(e.hireDate || e.date_of_hire);
            const years = Math.floor((new Date() - hireDate) / (365.25 * 24 * 60 * 60 * 1000));
            return {
              id: e.id,
              name: `${e.firstName || ''} ${e.lastName || ''}`.trim() || e.name || 'Unknown',
              department: e.department || 'Not Assigned',
              years,
              date: e.hireDate || e.date_of_hire || ''
            };
          })
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, onClick }) => (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-xl ${color}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );

  const AlertCard = ({ title, count, icon: Icon, color, path, description }) => (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate(path)}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
            <span className={`px-2 py-1 text-xs font-bold rounded-full ${count > 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
              {count}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">HR Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Employee administration overview and analytics
          </p>
        </div>
        <button
          onClick={loadDashboardData}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Headcount"
          value={dashboardData.headcount.total}
          icon={Users}
          color="bg-blue-500"
          onClick={() => navigate('/employee-admin/employees')}
        />
        <StatCard
          title="New Hires (MTD)"
          value={dashboardData.movement.newHires}
          icon={UserPlus}
          color="bg-green-500"
          trend="up"
          trendValue="+3 from last month"
        />
        <StatCard
          title="Separations (MTD)"
          value={dashboardData.movement.separations}
          icon={UserMinus}
          color="bg-red-500"
          trend="down"
          trendValue="-2 from last month"
        />
        <StatCard
          title="Retention Rate"
          value={`${dashboardData.rates.retentionRate}%`}
          icon={UserCheck}
          color="bg-purple-500"
        />
      </div>

      {/* Headcount Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Employment Type */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Headcount by Type</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {[
              { label: 'Core Staff', value: dashboardData.headcount.core, color: 'bg-blue-500', percent: Math.round((dashboardData.headcount.core / dashboardData.headcount.total) * 100) },
              { label: 'Project Staff', value: dashboardData.headcount.project, color: 'bg-green-500', percent: Math.round((dashboardData.headcount.project / dashboardData.headcount.total) * 100) },
              { label: 'Consultants', value: dashboardData.headcount.consultants, color: 'bg-yellow-500', percent: Math.round((dashboardData.headcount.consultants / dashboardData.headcount.total) * 100) },
              { label: 'Interns', value: dashboardData.headcount.interns, color: 'bg-purple-500', percent: Math.round((dashboardData.headcount.interns / dashboardData.headcount.total) * 100) },
              { label: 'Other', value: dashboardData.headcount.other, color: 'bg-gray-500', percent: Math.round((dashboardData.headcount.other / dashboardData.headcount.total) * 100) },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{item.value} ({item.percent}%)</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Gender */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Gender Distribution</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-center justify-center space-x-12">
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                <div>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{dashboardData.headcount.male}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Male</p>
                </div>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {Math.round((dashboardData.headcount.male / dashboardData.headcount.total) * 100)}%
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-3">
                <div>
                  <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">{dashboardData.headcount.female}</p>
                  <p className="text-sm text-pink-600 dark:text-pink-400">Female</p>
                </div>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {Math.round((dashboardData.headcount.female / dashboardData.headcount.total) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pending Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AlertCard
            title="Pending Onboardings"
            count={dashboardData.pending.onboardings}
            icon={ClipboardList}
            color="bg-blue-500"
            path="/employee-admin/onboarding"
            description="Employees in onboarding process"
          />
          <AlertCard
            title="Expiring Contracts"
            count={dashboardData.pending.expiringContracts}
            icon={FileText}
            color="bg-yellow-500"
            path="/employee-admin/contracts?filter=expiring"
            description="Contracts expiring in 30 days"
          />
          <AlertCard
            title="Probation Ending"
            count={dashboardData.pending.probationsEnding}
            icon={Clock}
            color="bg-orange-500"
            path="/employee-admin/employees?filter=probation"
            description="Probations ending in 14 days"
          />
          <AlertCard
            title="Policy Compliance"
            count={100 - dashboardData.pending.policyCompliance}
            icon={FileCheck}
            color="bg-purple-500"
            path="/employee-admin/policies"
            description={`${dashboardData.pending.policyCompliance}% compliance rate`}
          />
          <AlertCard
            title="Interim Requests"
            count={dashboardData.pending.interimRequests}
            icon={Briefcase}
            color="bg-indigo-500"
            path="/employee-admin/interim-hiring"
            description="Pending approval requests"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Hires */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Hires</h3>
            <button
              onClick={() => navigate('/employee-admin/employees?sort=newest')}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {dashboardData.recentHires.map((hire) => (
              <div key={hire.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer" onClick={() => navigate(`/employee-admin/employees/${hire.id}`)}>
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{hire.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{hire.position}</p>
                </div>
                <span className="text-xs text-gray-400">{new Date(hire.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Birthdays */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Birthdays</h3>
            <button
              onClick={() => navigate('/employee-admin/reports/birthdays')}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {dashboardData.upcomingBirthdays.map((bday) => (
              <div key={bday.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer" onClick={() => navigate(`/employee-admin/employees/${bday.id}`)}>
                <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{bday.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{bday.department}</p>
                </div>
                <span className="text-xs text-gray-400">{new Date(bday.date).toLocaleDateString()}</span>
              </div>
            ))}
            {dashboardData.upcomingBirthdays.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No upcoming birthdays</p>
            )}
          </div>
        </div>

        {/* Work Anniversaries */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Work Anniversaries</h3>
            <button
              onClick={() => navigate('/employee-admin/reports/anniversaries')}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {dashboardData.workAnniversaries.map((anniversary) => (
              <div key={anniversary.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer" onClick={() => navigate(`/employee-admin/employees/${anniversary.id}`)}>
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{anniversary.years}Y</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{anniversary.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{anniversary.department}</p>
                </div>
                <span className="text-xs text-gray-400">{new Date(anniversary.date).toLocaleDateString()}</span>
              </div>
            ))}
            {dashboardData.workAnniversaries.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No upcoming anniversaries</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { label: 'Add Employee', icon: UserPlus, path: '/employee-admin/employees/new', color: 'bg-green-500' },
            { label: 'View All Employees', icon: Users, path: '/employee-admin/employees', color: 'bg-blue-500' },
            { label: 'Onboarding', icon: ClipboardList, path: '/employee-admin/onboarding', color: 'bg-purple-500' },
            { label: 'Contracts', icon: FileText, path: '/employee-admin/contracts', color: 'bg-yellow-500' },
            { label: 'Interim Hiring', icon: Briefcase, path: '/employee-admin/interim-hiring', color: 'bg-indigo-500' },
            { label: 'HR Reports', icon: BarChart3, path: '/employee-admin/reports', color: 'bg-pink-500' },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className={`p-3 rounded-xl ${action.color} mb-2`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
