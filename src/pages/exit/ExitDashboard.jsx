import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  UserMinus,
  ClipboardCheck,
  MessageSquare,
  DollarSign,
  Award,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  ArrowRight,
  Users,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { exitDashboardService, separationService, initializeExitModule } from '../../services/db/exitService';

const ExitDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingActions, setPendingActions] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      await initializeExitModule();

      const [overview, pending, activity] = await Promise.all([
        exitDashboardService.getOverview(),
        exitDashboardService.getPendingActions(),
        exitDashboardService.getRecentActivity(5),
      ]);

      setStats(overview);
      setPendingActions(pending);
      setRecentActivity(activity);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'New Separation', path: '/exit/separations/new', icon: UserMinus, color: 'bg-red-500' },
    { label: 'View Clearances', path: '/exit/clearances', icon: ClipboardCheck, color: 'bg-blue-500' },
    { label: 'Exit Interviews', path: '/exit/interviews', icon: MessageSquare, color: 'bg-purple-500' },
    { label: 'Settlements', path: '/exit/settlements', icon: DollarSign, color: 'bg-green-500' },
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending_approval: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Approval' },
      approved: { color: 'bg-blue-100 text-blue-800', label: 'Approved' },
      clearance_pending: { color: 'bg-orange-100 text-orange-800', label: 'In Clearance' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
    };
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>{config.label}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LayoutDashboard className="w-7 h-7" />
            Exit & Termination Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage employee separations, clearances, and settlements
          </p>
        </div>
        <button
          onClick={loadDashboard}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.path}
            to={action.path}
            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
          >
            <div className={`p-3 rounded-lg ${action.color}`}>
              <action.icon className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium text-gray-900 dark:text-white">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Separations Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Separations</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats?.separations?.total || 0}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <UserMinus className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-yellow-600">
              <Clock className="w-4 h-4" />
              {stats?.separations?.pendingApproval || 0} pending
            </span>
            <span className="flex items-center gap-1 text-blue-600">
              <TrendingUp className="w-4 h-4" />
              {stats?.separations?.thisMonth || 0} this month
            </span>
          </div>
        </div>

        {/* Clearances Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Clearances</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {pendingActions?.pendingClearances?.length || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ClipboardCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Awaiting department approvals
          </div>
        </div>

        {/* Settlements Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Settlements</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {pendingActions?.pendingSettlements?.length || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            {stats?.settlements?.paid || 0} paid this year
          </div>
        </div>

        {/* Certificates Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Certificates Issued</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats?.certificates?.issued || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            {stats?.certificates?.draft || 0} pending issuance
          </div>
        </div>
      </div>

      {/* Separation Types Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Separations by Type
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Resignations', value: stats?.separations?.byType?.resignation || 0, color: 'bg-blue-500' },
              { label: 'Contract Expiry', value: stats?.separations?.byType?.contractExpiry || 0, color: 'bg-green-500' },
              { label: 'Terminations', value: stats?.separations?.byType?.termination || 0, color: 'bg-red-500' },
              { label: 'Retirements', value: stats?.separations?.byType?.retirement || 0, color: 'bg-purple-500' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                <span className="flex-1 text-gray-700 dark:text-gray-300">{item.label}</span>
                <span className="font-semibold text-gray-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pending Approvals
            </h3>
            <Link
              to="/exit/separations"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {pendingActions?.pendingApprovals?.length > 0 ? (
            <div className="space-y-3">
              {pendingActions.pendingApprovals.slice(0, 5).map((sep) => (
                <div
                  key={sep.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {sep.employeeName || 'Unknown Employee'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {sep.separationNumber}
                    </p>
                  </div>
                  {getStatusBadge(sep.status)}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No pending approvals</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div
                key={activity.id || index}
                className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">
                    Status changed from <span className="font-medium">{activity.fromStatus || 'New'}</span> to{' '}
                    <span className="font-medium">{activity.toStatus}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.changeReason} - {new Date(activity.changedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
          </div>
        )}
      </div>

      {/* Exit Interview Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Exit Interview Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.interviews?.total || 0}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Interviews</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats?.interviews?.completed || 0}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats?.interviews?.scheduled || 0}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Scheduled</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats?.interviews?.averageRating || '0.00'}/5
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Rating</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitDashboard;
