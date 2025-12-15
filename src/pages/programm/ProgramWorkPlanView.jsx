import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, CheckCircle2 } from 'lucide-react';
import {
  getProgramWorkPlanById,
  deleteProgramWorkPlan,
  generateTimelineMonths,
} from '../../services/db/programWorkPlanService';

const ProgramWorkPlanView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [workPlan, setWorkPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const timelineMonths = generateTimelineMonths();

  useEffect(() => {
    loadWorkPlan();
  }, [id]);

  const loadWorkPlan = async () => {
    try {
      setLoading(true);
      const plan = await getProgramWorkPlanById(Number(id));
      setWorkPlan(plan);
    } catch (error) {
      console.error('Error loading work plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this work plan?')) {
      try {
        await deleteProgramWorkPlan(Number(id));
        navigate('/programm/work-plans');
      } catch (error) {
        console.error('Error deleting work plan:', error);
        alert('Failed to delete work plan');
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return classes[status] || classes.draft;
  };

  // Group months by year
  const monthsByYear = timelineMonths.reduce((acc, month) => {
    if (!acc[month.year]) {
      acc[month.year] = [];
    }
    acc[month.year].push(month);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!workPlan) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-600 dark:text-gray-400">
          Work plan not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/programm/work-plans')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Work Plans
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Work Plan Details
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              View program work plan information
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              to={`/programm/work-plans/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Donor
            </label>
            <p className="text-gray-900 dark:text-white">{workPlan.donor}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Project
            </label>
            <p className="text-gray-900 dark:text-white">{workPlan.project}</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Output
            </label>
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {workPlan.output}
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Activity
            </label>
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {workPlan.activity}
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Implementation Methodology
            </label>
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {workPlan.implementationMethodology || '-'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Location
            </label>
            <p className="text-gray-900 dark:text-white">
              {workPlan.location || '-'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Status
            </label>
            <span
              className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeClass(
                workPlan.status
              )}`}
            >
              {workPlan.status || 'draft'}
            </span>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Additional Details
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Program Compliance Documents
            </label>
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {workPlan.programComplianceDocuments || '-'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Branding/Visibility
            </label>
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {workPlan.brandingVisibility || '-'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Social Media
            </label>
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {workPlan.socialMedia || '-'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Website
            </label>
            <p className="text-gray-900 dark:text-white">
              {workPlan.website || '-'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Target Matrix (MEAL)
            </label>
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {workPlan.targetMatrixMeal || '-'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Remarks
            </label>
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {workPlan.remarks || '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Timeline (July 2024 - December 2026)
        </h2>

        <div className="space-y-6">
          {Object.entries(monthsByYear).map(([year, months]) => (
            <div key={year}>
              <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                {year}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {months.map((month) => {
                  const isMarked = workPlan.timelineData?.[month.key];
                  return (
                    <div
                      key={month.key}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                        isMarked
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      {isMarked && (
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      )}
                      <span
                        className={`text-sm ${
                          isMarked
                            ? 'text-green-900 dark:text-green-300 font-medium'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {month.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        <p>
          Created: {new Date(workPlan.createdAt).toLocaleString()}
        </p>
        {workPlan.updatedAt && (
          <p>
            Last Updated: {new Date(workPlan.updatedAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProgramWorkPlanView;
