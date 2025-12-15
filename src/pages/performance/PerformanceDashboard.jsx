import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Award,
  FileText,
  ArrowRight,
  BarChart3,
  UserCheck,
  AlertCircle,
  Play,
  ClipboardList
} from 'lucide-react';
import performanceService from '../../services/db/performanceService';

const PerformanceDashboard = () => {
  const [stats, setStats] = useState({
    activeCycle: null,
    totalAppraisals: 0,
    pendingSelfAssessment: 0,
    pendingManagerReview: 0,
    pendingCommitteeReview: 0,
    pendingApproval: 0,
    completed: 0,
    activeProbations: 0,
    probationsEndingSoon: 0,
    activePIPs: 0,
    performanceDistribution: {
      outstanding: 0,
      exceeds: 0,
      meets: 0,
      needs: 0,
      unsatisfactory: 0
    }
  });
  const [recentAppraisals, setRecentAppraisals] = useState([]);
  const [upcomingProbations, setUpcomingProbations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get cycles
      const cycles = await performanceService.appraisalCycles.getAll();
      const activeCycle = cycles.find(c => c.status === 'active');

      // Get appraisals
      const appraisals = await performanceService.employeeAppraisals.getAll();
      const currentCycleAppraisals = activeCycle
        ? appraisals.filter(a => a.appraisalCycleId === activeCycle.id)
        : appraisals;

      // Count by status
      const pendingSelfAssessment = currentCycleAppraisals.filter(a => a.status === 'self_assessment').length;
      const pendingManagerReview = currentCycleAppraisals.filter(a => a.status === 'manager_review').length;
      const pendingCommitteeReview = currentCycleAppraisals.filter(a => a.status === 'committee_review').length;
      const pendingApproval = currentCycleAppraisals.filter(a => a.status === 'pending_approval').length;
      const completed = currentCycleAppraisals.filter(a => a.status === 'completed').length;

      // Performance distribution
      const completedAppraisals = appraisals.filter(a => a.status === 'completed' && a.performanceLevel);
      const distribution = {
        outstanding: completedAppraisals.filter(a => a.performanceLevel === 'outstanding').length,
        exceeds: completedAppraisals.filter(a => a.performanceLevel === 'exceeds_expectations').length,
        meets: completedAppraisals.filter(a => a.performanceLevel === 'meets_expectations').length,
        needs: completedAppraisals.filter(a => a.performanceLevel === 'needs_improvement').length,
        unsatisfactory: completedAppraisals.filter(a => a.performanceLevel === 'unsatisfactory').length
      };

      // Get probations
      const probations = await performanceService.probationRecords.getAll();
      const activeProbations = probations.filter(p => p.status === 'active');
      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
      const probationsEndingSoon = activeProbations.filter(p => {
        const endDate = new Date(p.currentEndDate);
        return endDate <= thirtyDaysFromNow;
      });

      // Get PIPs
      const pips = await performanceService.performanceImprovementPlans.getAll();
      const activePIPs = pips.filter(p => p.status === 'active').length;

      setStats({
        activeCycle,
        totalAppraisals: currentCycleAppraisals.length,
        pendingSelfAssessment,
        pendingManagerReview,
        pendingCommitteeReview,
        pendingApproval,
        completed,
        activeProbations: activeProbations.length,
        probationsEndingSoon: probationsEndingSoon.length,
        activePIPs,
        performanceDistribution: distribution
      });

      // Recent appraisals
      const sortedAppraisals = [...appraisals].sort((a, b) =>
        new Date(b.updatedAt) - new Date(a.updatedAt)
      ).slice(0, 5);
      setRecentAppraisals(sortedAppraisals);

      // Upcoming probations
      setUpcomingProbations(probationsEndingSoon.slice(0, 5));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      self_assessment: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      manager_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      committee_review: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      pending_approval: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      communicated: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
    };
    return colors[status] || colors.draft;
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: 'Draft',
      self_assessment: 'Self Assessment',
      manager_review: 'Manager Review',
      committee_review: 'Committee Review',
      pending_approval: 'Pending Approval',
      approved: 'Approved',
      communicated: 'Communicated',
      completed: 'Completed'
    };
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Appraisal</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage employee performance evaluations</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/performance/appraisals/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Play className="h-4 w-4" />
            New Appraisal
          </Link>
        </div>
      </div>

      {/* Active Cycle Banner */}
      {stats.activeCycle && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-100 text-sm">Active Appraisal Cycle</p>
              <h2 className="text-2xl font-bold mt-1">{stats.activeCycle.name}</h2>
              <p className="text-indigo-100 mt-1">
                {formatDate(stats.activeCycle.startDate)} - {formatDate(stats.activeCycle.endDate)}
              </p>
            </div>
            <Link
              to={`/performance/cycles/${stats.activeCycle.id}`}
              className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 flex items-center gap-2"
            >
              View Details <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-indigo-100 text-xs">Self Assessment Deadline</p>
              <p className="text-lg font-bold">{formatDate(stats.activeCycle.selfAssessmentDeadline)}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-indigo-100 text-xs">Manager Review Deadline</p>
              <p className="text-lg font-bold">{formatDate(stats.activeCycle.managerReviewDeadline)}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-indigo-100 text-xs">Committee Review Deadline</p>
              <p className="text-lg font-bold">{formatDate(stats.activeCycle.committeeReviewDeadline)}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-indigo-100 text-xs">Final Approval Deadline</p>
              <p className="text-lg font-bold">{formatDate(stats.activeCycle.finalApprovalDeadline)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Self Assessment</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.pendingSelfAssessment}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <Link to="/performance/appraisals?status=self_assessment" className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 mt-3 hover:underline">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Manager Review</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pendingManagerReview}</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <UserCheck className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <Link to="/performance/appraisals?status=manager_review" className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 mt-3 hover:underline">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Approval</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.pendingApproval}</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <CheckCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <Link to="/performance/appraisals?status=pending_approval" className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 mt-3 hover:underline">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <Link to="/performance/appraisals?status=completed" className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 mt-3 hover:underline">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
            Performance Distribution
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Outstanding</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">{stats.performanceDistribution.outstanding}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Exceeds Expectations</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">{stats.performanceDistribution.exceeds}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Meets Expectations</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">{stats.performanceDistribution.meets}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Needs Improvement</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">{stats.performanceDistribution.needs}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Unsatisfactory</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">{stats.performanceDistribution.unsatisfactory}</span>
            </div>
          </div>
        </div>

        {/* Alerts & Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Alerts & Actions
          </h3>
          <div className="space-y-3">
            {stats.probationsEndingSoon > 0 && (
              <Link
                to="/performance/probations"
                className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <span className="text-gray-700 dark:text-gray-300">{stats.probationsEndingSoon} probations ending soon</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </Link>
            )}
            {stats.activePIPs > 0 && (
              <Link
                to="/performance/pips"
                className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="text-gray-700 dark:text-gray-300">{stats.activePIPs} active PIPs</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </Link>
            )}
            {stats.pendingCommitteeReview > 0 && (
              <Link
                to="/performance/appraisals?status=committee_review"
                className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30"
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700 dark:text-gray-300">{stats.pendingCommitteeReview} pending committee review</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </Link>
            )}
            {stats.probationsEndingSoon === 0 && stats.activePIPs === 0 && stats.pendingCommitteeReview === 0 && (
              <div className="text-center py-4">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">No urgent actions required</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/performance/cycles"
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <Calendar className="h-8 w-8 text-blue-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300 text-center">Appraisal Cycles</span>
            </Link>
            <Link
              to="/performance/templates"
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <ClipboardList className="h-8 w-8 text-purple-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300 text-center">Templates</span>
            </Link>
            <Link
              to="/performance/probations"
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <UserCheck className="h-8 w-8 text-amber-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300 text-center">Probations</span>
            </Link>
            <Link
              to="/performance/pips"
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <Target className="h-8 w-8 text-red-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300 text-center">PIPs</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Appraisals */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Recent Appraisals
          </h3>
          <Link to="/performance/appraisals" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                <th className="pb-3 font-medium">Employee</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Period</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Score</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {recentAppraisals.map((appraisal) => (
                <tr key={appraisal.id} className="text-gray-700 dark:text-gray-300">
                  <td className="py-3">
                    <div>
                      <p className="font-medium">{appraisal.employeeName || 'Employee'}</p>
                      <p className="text-sm text-gray-500">{appraisal.department || 'Department'}</p>
                    </div>
                  </td>
                  <td className="py-3 capitalize">{appraisal.appraisalType?.replace('_', ' ')}</td>
                  <td className="py-3">
                    {appraisal.periodStart && appraisal.periodEnd
                      ? `${formatDate(appraisal.periodStart)} - ${formatDate(appraisal.periodEnd)}`
                      : '-'
                    }
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appraisal.status)}`}>
                      {getStatusLabel(appraisal.status)}
                    </span>
                  </td>
                  <td className="py-3">
                    {appraisal.percentageScore ? (
                      <span className="font-medium">{appraisal.percentageScore}%</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-3">
                    <Link
                      to={`/performance/appraisals/${appraisal.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {recentAppraisals.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500 dark:text-gray-400">
                    No appraisals found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
