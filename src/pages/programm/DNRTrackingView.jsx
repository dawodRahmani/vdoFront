import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, CheckCircle2, Calendar } from 'lucide-react';
import {
  getDNRTrackingById,
  deleteDNRTracking,
  groupMonthsByYearAndQuarter,
} from '../../services/db/dnrTrackingService';

const DNRTrackingView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  const monthsByYearQuarter = groupMonthsByYearAndQuarter();

  useEffect(() => {
    loadEntry();
  }, [id]);

  const loadEntry = async () => {
    try {
      setLoading(true);
      const data = await getDNRTrackingById(Number(id));
      setEntry(data);
    } catch (error) {
      console.error('Error loading DNR entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this DNR entry?')) {
      try {
        await deleteDNRTracking(Number(id));
        navigate('/programm/dnr-tracking');
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Failed to delete entry');
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return classes[status?.toLowerCase()] || classes.active;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-600 dark:text-gray-400">
          DNR entry not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/programm/dnr-tracking')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to DNR Tracking
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              DNR Entry Details
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              View donor reporting tracking information
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              to={`/programm/dnr-tracking/${id}/edit`}
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
          {entry.serialNumber && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Serial Number (S/N)
              </label>
              <p className="text-gray-900 dark:text-white">{entry.serialNumber}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Donor
            </label>
            <p className="text-gray-900 dark:text-white">{entry.donor}</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Project Name
            </label>
            <p className="text-gray-900 dark:text-white">{entry.projectName}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Location
            </label>
            <p className="text-gray-900 dark:text-white">{entry.location || '-'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Project Status
            </label>
            <span
              className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeClass(
                entry.projectStatus
              )}`}
            >
              {entry.projectStatus || 'active'}
            </span>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Project Duration
            </label>
            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Calendar className="h-4 w-4 text-gray-400" />
              {entry.startDate && (
                <span>
                  {new Date(entry.startDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              )}
              {entry.startDate && entry.endDate && <span>→</span>}
              {entry.endDate && (
                <span>
                  {new Date(entry.endDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              )}
              {!entry.startDate && !entry.endDate && '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Reporting Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Reporting Details
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Type of Report
              </label>
              <p className="text-gray-900 dark:text-white">{entry.reportType}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Due Date
              </label>
              <p className="text-gray-900 dark:text-white">
                {entry.dueDate
                  ? new Date(entry.dueDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '-'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Reporting Description
            </label>
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {entry.reportingDescription || '-'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Reporting Format
            </label>
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {entry.reportingFormat || '-'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Reports (Links or References)
            </label>
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {entry.reports || '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Timeline (June 2022 - January 2027)
        </h2>

        <div className="space-y-6">
          {Object.entries(monthsByYearQuarter).map(([year, quarters]) => (
            <div key={year} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                {year}
              </h3>
              <div className="space-y-4">
                {Object.entries(quarters).map(([quarter, months]) => {
                  if (months.length === 0) return null;
                  return (
                    <div key={`${year}-${quarter}`}>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {quarter}
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {months.map((month) => {
                          const isMarked = entry.timelineData?.[month.key];
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
                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                              )}
                              <span
                                className={`text-xs ${
                                  isMarked
                                    ? 'text-green-900 dark:text-green-300 font-medium'
                                    : 'text-gray-600 dark:text-gray-400'
                                }`}
                              >
                                {month.label.split(' ')[0]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
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
        <p>Created: {new Date(entry.createdAt).toLocaleString()}</p>
        {entry.updatedAt && (
          <p>Last Updated: {new Date(entry.updatedAt).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
};

export default DNRTrackingView;
