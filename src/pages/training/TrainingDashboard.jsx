import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ClipboardList,
  Calendar,
  Award,
  Users,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle,
  FileText,
  DollarSign,
  BookOpen,
} from 'lucide-react';
import { trainingDashboardService, trainingService, tnaService } from '../../services/db/trainingService';

const TrainingDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentTrainings, setRecentTrainings] = useState([]);
  const [upcomingTrainings, setUpcomingTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, recentData, upcomingData] = await Promise.all([
        trainingDashboardService.getStats(),
        trainingDashboardService.getRecentTrainings(5),
        trainingDashboardService.getUpcomingTrainings(5),
      ]);
      setStats(statsData);
      setRecentTrainings(recentData);
      setUpcomingTrainings(upcomingData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const classes = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      confirmed: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    };
    return classes[status] || classes.draft;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Training & Capacity Building
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Overview of training activities and metrics
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.totalTrainings || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Trainings</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-100 dark:bg-cyan-900 rounded-lg">
              <Clock className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.upcomingTrainings || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.completedTrainings || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.issuedCertificates || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Certificates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <ClipboardList className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {stats?.totalTNAs || 0}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">TNAs</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {stats?.pendingTNAs || 0}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Pending TNAs</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {stats?.approvedBudgets || 0}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Approved Budgets</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {stats?.activeBonds || 0}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Active Bonds</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <Link
          to="/training/trainings/new"
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow text-center"
        >
          <Calendar className="h-8 w-8 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">New Training</p>
        </Link>
        <Link
          to="/training/tna/new"
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow text-center"
        >
          <ClipboardList className="h-8 w-8 mx-auto text-orange-600 dark:text-orange-400 mb-2" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">New TNA</p>
        </Link>
        <Link
          to="/training/programs"
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow text-center"
        >
          <BookOpen className="h-8 w-8 mx-auto text-purple-600 dark:text-purple-400 mb-2" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">Programs</p>
        </Link>
        <Link
          to="/training/types"
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow text-center"
        >
          <GraduationCap className="h-8 w-8 mx-auto text-green-600 dark:text-green-400 mb-2" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">Types</p>
        </Link>
        <Link
          to="/training/calendar"
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow text-center"
        >
          <Calendar className="h-8 w-8 mx-auto text-cyan-600 dark:text-cyan-400 mb-2" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">Calendar</p>
        </Link>
        <Link
          to="/training/certificates"
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow text-center"
        >
          <Award className="h-8 w-8 mx-auto text-yellow-600 dark:text-yellow-400 mb-2" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">Certificates</p>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Trainings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upcoming Trainings
            </h2>
            <Link
              to="/training/calendar"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {upcomingTrainings.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No upcoming trainings scheduled
              </div>
            ) : (
              upcomingTrainings.map((training) => (
                <Link
                  key={training.id}
                  to={`/training/trainings/${training.id}`}
                  className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{training.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(training.startDate)}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                        training.status
                      )}`}
                    >
                      {training.status?.replace('_', ' ')}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Trainings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Trainings
            </h2>
            <Link
              to="/training/trainings"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentTrainings.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No trainings created yet
              </div>
            ) : (
              recentTrainings.map((training) => (
                <Link
                  key={training.id}
                  to={`/training/trainings/${training.id}`}
                  className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{training.title}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {training.trainingCode}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {training.actualParticipants || 0}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                        training.status
                      )}`}
                    >
                      {training.status?.replace('_', ' ')}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Year Progress */}
      {stats && (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {new Date().getFullYear()} Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Trainings Conducted</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {stats.thisYearCompleted || 0} / {stats.thisYearTrainings || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${
                      stats.thisYearTrainings > 0
                        ? (stats.thisYearCompleted / stats.thisYearTrainings) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Certificates Issued</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {stats.issuedCertificates || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(((stats.issuedCertificates || 0) / 100) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">TNAs Completed</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {stats.totalTNAs - stats.pendingTNAs || 0} / {stats.totalTNAs || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full"
                  style={{
                    width: `${
                      stats.totalTNAs > 0
                        ? ((stats.totalTNAs - stats.pendingTNAs) / stats.totalTNAs) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingDashboard;
