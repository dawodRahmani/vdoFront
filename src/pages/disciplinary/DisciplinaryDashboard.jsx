import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  FileText,
  Search,
  Gavel,
  Scale,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  ArrowRight,
  RefreshCw,
  Shield,
  AlertOctagon,
  FileWarning,
  Users
} from 'lucide-react';
import {
  initDisciplinaryDB,
  misconductReportsDB,
  investigationsDB,
  disciplinaryActionsDB,
  appealsDB,
  grievancesDB,
  suspensionsDB,
  complianceIncidentsDB,
  warningHistoryDB
} from '../../services/db/disciplinaryService';

const DisciplinaryDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      openReports: 0,
      activeInvestigations: 0,
      pendingWarnings: 0,
      activeSuspensions: 0,
      pendingAppeals: 0,
      openGrievances: 0,
      zeroToleranceIncidents: 0,
      warningsExpiringThisMonth: 0
    },
    reportsByCategory: {
      minor: 0,
      misconduct: 0,
      serious: 0,
      gross: 0
    },
    reportsByStatus: {
      received: 0,
      assessing: 0,
      investigating: 0,
      resolved: 0,
      dismissed: 0
    },
    warningsByType: {
      verbal: 0,
      firstWritten: 0,
      finalWritten: 0,
      termination: 0
    },
    recentReports: [],
    activeInvestigationsList: [],
    pendingActionsList: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await initDisciplinaryDB();

      // Load all data
      const [reports, investigations, actions, appeals, grievances, suspensions, complianceIncidents] = await Promise.all([
        misconductReportsDB.getAll(),
        investigationsDB.getAll(),
        disciplinaryActionsDB.getAll(),
        appealsDB.getAll(),
        grievancesDB.getAll(),
        suspensionsDB.getAll(),
        complianceIncidentsDB.getAll()
      ]);

      // Calculate open reports
      const openStatuses = ['received', 'assessing', 'investigating'];
      const openReports = reports.filter(r => openStatuses.includes(r.status));

      // Calculate active investigations
      const activeInvestigations = investigations.filter(i => ['pending', 'in_progress'].includes(i.status));

      // Calculate pending warnings (issued but not acknowledged)
      const pendingWarnings = actions.filter(a => a.status === 'issued' && !a.employeeAcknowledged);

      // Calculate active suspensions
      const activeSuspensions = suspensions.filter(s => s.status === 'active');

      // Calculate pending appeals
      const pendingAppeals = appeals.filter(a => ['submitted', 'reviewing'].includes(a.status));

      // Calculate open grievances
      const openGrievances = grievances.filter(g => ['submitted', 'investigating', 'pending_resolution'].includes(g.status));

      // Calculate warnings expiring this month
      const today = new Date();
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const warningsExpiringThisMonth = actions.filter(a => {
        if (!a.expiryDate) return false;
        const expiry = new Date(a.expiryDate);
        return expiry >= today && expiry <= endOfMonth && a.status === 'acknowledged';
      });

      // Reports by category
      const reportsByCategory = {
        minor: reports.filter(r => r.misconductCategory === 'minor').length,
        misconduct: reports.filter(r => r.misconductCategory === 'misconduct').length,
        serious: reports.filter(r => r.misconductCategory === 'serious').length,
        gross: reports.filter(r => r.misconductCategory === 'gross').length
      };

      // Reports by status
      const reportsByStatus = {
        received: reports.filter(r => r.status === 'received').length,
        assessing: reports.filter(r => r.status === 'assessing').length,
        investigating: reports.filter(r => r.status === 'investigating').length,
        resolved: reports.filter(r => ['action_taken', 'resolved', 'closed'].includes(r.status)).length,
        dismissed: reports.filter(r => r.status === 'dismissed').length
      };

      // Warnings by type
      const warningsByType = {
        verbal: actions.filter(a => a.actionType === 'verbal_warning').length,
        firstWritten: actions.filter(a => a.actionType === 'first_written_warning').length,
        finalWritten: actions.filter(a => a.actionType === 'final_written_warning').length,
        termination: actions.filter(a => a.actionType === 'termination').length
      };

      // Zero tolerance incidents (current year)
      const currentYear = new Date().getFullYear();
      const zeroToleranceIncidents = complianceIncidents.filter(i => {
        const incidentDate = new Date(i.createdAt);
        return incidentDate.getFullYear() === currentYear;
      });

      setDashboardData({
        stats: {
          openReports: openReports.length,
          activeInvestigations: activeInvestigations.length,
          pendingWarnings: pendingWarnings.length,
          activeSuspensions: activeSuspensions.length,
          pendingAppeals: pendingAppeals.length,
          openGrievances: openGrievances.length,
          zeroToleranceIncidents: zeroToleranceIncidents.length,
          warningsExpiringThisMonth: warningsExpiringThisMonth.length
        },
        reportsByCategory,
        reportsByStatus,
        warningsByType,
        recentReports: reports
          .sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate))
          .slice(0, 5),
        activeInvestigationsList: activeInvestigations
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5),
        pendingActionsList: pendingWarnings.slice(0, 5)
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, onClick, badge }) => (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {badge && (
            <span className={`inline-flex items-center px-2 py-0.5 mt-2 text-xs font-medium rounded-full ${badge.color}`}>
              {badge.text}
            </span>
          )}
        </div>
        <div className={`p-4 rounded-xl ${color}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );

  const AlertCard = ({ title, count, icon: Icon, color, path, description, urgency }) => (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl p-5 border ${urgency === 'high' ? 'border-red-300 dark:border-red-600' : 'border-gray-200 dark:border-gray-700'} cursor-pointer hover:shadow-lg transition-shadow`}
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

  const getCategoryColor = (category) => {
    const colors = {
      minor: 'bg-yellow-500',
      misconduct: 'bg-orange-500',
      serious: 'bg-red-500',
      gross: 'bg-red-700'
    };
    return colors[category] || 'bg-gray-500';
  };

  const getStatusColor = (status) => {
    const colors = {
      received: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      assessing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      investigating: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      action_taken: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      dismissed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Disciplinary Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Misconduct tracking, investigations, and disciplinary actions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/disciplinary/reports/new')}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FileWarning className="w-4 h-4" />
            <span>Report Misconduct</span>
          </button>
          <button
            onClick={loadDashboardData}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Open Reports"
          value={dashboardData.stats.openReports}
          icon={FileText}
          color="bg-blue-500"
          onClick={() => navigate('/disciplinary/reports?status=open')}
        />
        <StatCard
          title="Active Investigations"
          value={dashboardData.stats.activeInvestigations}
          icon={Search}
          color="bg-purple-500"
          onClick={() => navigate('/disciplinary/investigations?status=active')}
        />
        <StatCard
          title="Pending Warnings"
          value={dashboardData.stats.pendingWarnings}
          icon={AlertTriangle}
          color="bg-yellow-500"
          onClick={() => navigate('/disciplinary/actions?status=pending')}
          badge={dashboardData.stats.pendingWarnings > 0 ? { text: 'Requires Action', color: 'bg-yellow-100 text-yellow-800' } : null}
        />
        <StatCard
          title="Pending Appeals"
          value={dashboardData.stats.pendingAppeals}
          icon={Scale}
          color="bg-indigo-500"
          onClick={() => navigate('/disciplinary/appeals?status=pending')}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Suspensions"
          value={dashboardData.stats.activeSuspensions}
          icon={XCircle}
          color="bg-red-500"
          onClick={() => navigate('/disciplinary/suspensions')}
        />
        <StatCard
          title="Open Grievances"
          value={dashboardData.stats.openGrievances}
          icon={MessageSquare}
          color="bg-teal-500"
          onClick={() => navigate('/disciplinary/grievances?status=open')}
        />
        <StatCard
          title="Zero Tolerance (YTD)"
          value={dashboardData.stats.zeroToleranceIncidents}
          icon={AlertOctagon}
          color="bg-red-700"
          onClick={() => navigate('/disciplinary/compliance')}
        />
        <StatCard
          title="Warnings Expiring"
          value={dashboardData.stats.warningsExpiringThisMonth}
          icon={Clock}
          color="bg-orange-500"
          onClick={() => navigate('/disciplinary/actions?filter=expiring')}
          badge={dashboardData.stats.warningsExpiringThisMonth > 0 ? { text: 'This Month', color: 'bg-orange-100 text-orange-800' } : null}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports by Category */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reports by Category</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {[
              { label: 'Minor Infractions', value: dashboardData.reportsByCategory.minor, color: 'bg-yellow-500' },
              { label: 'Misconduct', value: dashboardData.reportsByCategory.misconduct, color: 'bg-orange-500' },
              { label: 'Serious Misconduct', value: dashboardData.reportsByCategory.serious, color: 'bg-red-500' },
              { label: 'Gross Misconduct', value: dashboardData.reportsByCategory.gross, color: 'bg-red-700' },
            ].map((item) => {
              const total = Object.values(dashboardData.reportsByCategory).reduce((a, b) => a + b, 0);
              const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{item.value} ({percent}%)</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Warnings by Type */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Disciplinary Actions</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Verbal Warnings', value: dashboardData.warningsByType.verbal, color: 'bg-yellow-100 dark:bg-yellow-900/30', textColor: 'text-yellow-600 dark:text-yellow-400', icon: MessageSquare },
              { label: 'First Written', value: dashboardData.warningsByType.firstWritten, color: 'bg-orange-100 dark:bg-orange-900/30', textColor: 'text-orange-600 dark:text-orange-400', icon: FileText },
              { label: 'Final Written', value: dashboardData.warningsByType.finalWritten, color: 'bg-red-100 dark:bg-red-900/30', textColor: 'text-red-600 dark:text-red-400', icon: FileWarning },
              { label: 'Terminations', value: dashboardData.warningsByType.termination, color: 'bg-gray-100 dark:bg-gray-700', textColor: 'text-gray-600 dark:text-gray-400', icon: XCircle },
            ].map((item) => (
              <div key={item.label} className={`p-4 rounded-xl ${item.color}`}>
                <div className="flex items-center space-x-3">
                  <item.icon className={`w-8 h-8 ${item.textColor}`} />
                  <div>
                    <p className={`text-2xl font-bold ${item.textColor}`}>{item.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attention Required</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AlertCard
            title="Reports Awaiting Assessment"
            count={dashboardData.reportsByStatus.received}
            icon={FileText}
            color="bg-blue-500"
            path="/disciplinary/reports?status=received"
            description="New reports requiring initial assessment"
          />
          <AlertCard
            title="Active Investigations"
            count={dashboardData.stats.activeInvestigations}
            icon={Search}
            color="bg-purple-500"
            path="/disciplinary/investigations?status=active"
            description="Ongoing investigation cases"
          />
          <AlertCard
            title="Unsigned Warnings"
            count={dashboardData.stats.pendingWarnings}
            icon={AlertTriangle}
            color="bg-yellow-500"
            path="/disciplinary/actions?status=issued"
            description="Warnings awaiting employee acknowledgement"
            urgency={dashboardData.stats.pendingWarnings > 0 ? 'high' : 'normal'}
          />
          <AlertCard
            title="Appeals Under Review"
            count={dashboardData.stats.pendingAppeals}
            icon={Scale}
            color="bg-indigo-500"
            path="/disciplinary/appeals?status=pending"
            description="Appeals awaiting panel decision"
          />
          <AlertCard
            title="Open Grievances"
            count={dashboardData.stats.openGrievances}
            icon={MessageSquare}
            color="bg-teal-500"
            path="/disciplinary/grievances?status=open"
            description="Employee grievances pending resolution"
          />
          <AlertCard
            title="Active Suspensions"
            count={dashboardData.stats.activeSuspensions}
            icon={Shield}
            color="bg-red-500"
            path="/disciplinary/suspensions?status=active"
            description="Employees on precautionary suspension"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reports */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Reports</h3>
            <button
              onClick={() => navigate('/disciplinary/reports')}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {dashboardData.recentReports.length > 0 ? dashboardData.recentReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                onClick={() => navigate(`/disciplinary/reports/${report.id}`)}
              >
                <div className={`w-10 h-10 rounded-full ${getCategoryColor(report.misconductCategory)} flex items-center justify-center`}>
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{report.reportNumber}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{report.accusedEmployeeName || 'Unknown'}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                    {report.status?.replace('_', ' ')}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{new Date(report.reportDate).toLocaleDateString()}</p>
                </div>
              </div>
            )) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No recent reports</p>
            )}
          </div>
        </div>

        {/* Active Investigations */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Investigations</h3>
            <button
              onClick={() => navigate('/disciplinary/investigations')}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {dashboardData.activeInvestigationsList.length > 0 ? dashboardData.activeInvestigationsList.map((investigation) => (
              <div
                key={investigation.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                onClick={() => navigate(`/disciplinary/investigations/${investigation.id}`)}
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Search className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{investigation.investigationNumber}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{investigation.leadInvestigatorName || 'Unassigned'}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${investigation.status === 'in_progress' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                    {investigation.status?.replace('_', ' ')}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{investigation.plannedEndDate ? `Due: ${new Date(investigation.plannedEndDate).toLocaleDateString()}` : 'No deadline'}</p>
                </div>
              </div>
            )) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No active investigations</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { label: 'Report Misconduct', icon: FileWarning, path: '/disciplinary/reports/new', color: 'bg-red-500' },
            { label: 'All Reports', icon: FileText, path: '/disciplinary/reports', color: 'bg-blue-500' },
            { label: 'Investigations', icon: Search, path: '/disciplinary/investigations', color: 'bg-purple-500' },
            { label: 'Warnings', icon: AlertTriangle, path: '/disciplinary/actions', color: 'bg-yellow-500' },
            { label: 'Appeals', icon: Scale, path: '/disciplinary/appeals', color: 'bg-indigo-500' },
            { label: 'Grievances', icon: MessageSquare, path: '/disciplinary/grievances', color: 'bg-teal-500' },
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

export default DisciplinaryDashboard;
