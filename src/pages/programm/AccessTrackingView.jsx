import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calendar, Building2, MapPin } from 'lucide-react';
import {
  getAccessTrackingById,
  deleteAccessTracking,
  groupMonthsByYear,
} from '../../services/db/accessTrackingService';

const AccessTrackingView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [monthsByYear, setMonthsByYear] = useState({});

  useEffect(() => {
    const grouped = groupMonthsByYear();
    setMonthsByYear(grouped);
    loadEntry();
  }, [id]);

  const loadEntry = async () => {
    try {
      setLoading(true);
      const data = await getAccessTrackingById(Number(id));
      setEntry(data);
    } catch (error) {
      console.error('Error loading entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this access tracking entry?')) {
      try {
        await deleteAccessTracking(Number(id));
        navigate('/programm/access-tracking');
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Failed to delete entry');
      }
    }
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
          Access tracking entry not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/programm/access-tracking')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Access Tracking
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Access Tracking Details
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              View access tracking information
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              to={`/programm/access-tracking/${id}/edit`}
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
                Serial Number
              </label>
              <p className="text-gray-900 dark:text-white">{entry.serialNumber}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Donor
            </label>
            <p className="text-gray-900 dark:text-white font-medium">{entry.donor}</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Project Name
            </label>
            <p className="text-gray-900 dark:text-white font-medium">{entry.projectName}</p>
          </div>

          {entry.location && (
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Location
                </label>
                <p className="text-gray-900 dark:text-white">{entry.location}</p>
              </div>
            </div>
          )}

          {entry.lineMinistry && (
            <div className="flex items-start gap-2">
              <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Line Ministry
                </label>
                <p className="text-gray-900 dark:text-white">{entry.lineMinistry}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Project Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Project Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Start Date
            </label>
            <p className="text-gray-900 dark:text-white">
              {entry.startDate
                ? new Date(entry.startDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '-'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              End Date
            </label>
            <p className="text-gray-900 dark:text-white">
              {entry.endDate
                ? new Date(entry.endDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '-'}
            </p>
          </div>

          {entry.reportingFormat && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Reporting Format
              </label>
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                {entry.reportingFormat}
              </p>
            </div>
          )}

          {entry.activities && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Activities
              </label>
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                {entry.activities}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Correspondence Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Correspondence Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {entry.typeOfCorrespondence && entry.typeOfCorrespondence.length > 0 && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Type of Correspondence
              </label>
              <div className="flex flex-wrap gap-2">
                {entry.typeOfCorrespondence.map((type) => (
                  <span
                    key={type}
                    className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 text-sm rounded-full"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {entry.dateProcessStarted && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Date Process Started
              </label>
              <p className="text-gray-900 dark:text-white">
                {new Date(entry.dateProcessStarted).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          )}

          <div></div>

          {entry.mouStartDate && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                MOU Start Date
              </label>
              <p className="text-gray-900 dark:text-white">
                {new Date(entry.mouStartDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          )}

          {entry.mouEndDate && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                MOU End Date
              </label>
              <p className="text-gray-900 dark:text-white">
                {new Date(entry.mouEndDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      {entry.timelineData && Object.keys(entry.timelineData).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Timeline (January 2024 - December 2026)
          </h2>
          <div className="space-y-6">
            {Object.entries(monthsByYear).map(([year, months]) => {
              const selectedMonths = months.filter((month) => entry.timelineData[month.key]);
              if (selectedMonths.length === 0) return null;

              return (
                <div key={year}>
                  <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    {year}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMonths.map((month) => (
                      <span
                        key={month.key}
                        className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm rounded-full"
                      >
                        {new Date(month.year, month.month - 1).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        <p>Created: {new Date(entry.createdAt).toLocaleString()}</p>
        {entry.updatedAt && (
          <p>Last Updated: {new Date(entry.updatedAt).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
};

export default AccessTrackingView;
