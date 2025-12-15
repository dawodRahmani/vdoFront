import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import {
  createAccessTracking,
  updateAccessTracking,
  getAccessTrackingById,
  groupMonthsByYear,
} from '../../services/db/accessTrackingService';

const AccessTrackingForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [monthsByYear, setMonthsByYear] = useState({});
  const [formData, setFormData] = useState({
    serialNumber: '',
    donor: '',
    projectName: '',
    location: '',
    startDate: '',
    endDate: '',
    reportingFormat: '',
    activities: '',
    lineMinistry: '',
    typeOfCorrespondence: [],
    dateProcessStarted: '',
    mouStartDate: '',
    mouEndDate: '',
    timelineData: {},
  });

  useEffect(() => {
    const grouped = groupMonthsByYear();
    setMonthsByYear(grouped);

    if (isEditMode) {
      loadEntry();
    }
  }, [id]);

  const loadEntry = async () => {
    try {
      setLoading(true);
      const entry = await getAccessTrackingById(Number(id));
      if (entry) {
        setFormData({
          serialNumber: entry.serialNumber || '',
          donor: entry.donor || '',
          projectName: entry.projectName || '',
          location: entry.location || '',
          startDate: entry.startDate || '',
          endDate: entry.endDate || '',
          reportingFormat: entry.reportingFormat || '',
          activities: entry.activities || '',
          lineMinistry: entry.lineMinistry || '',
          typeOfCorrespondence: entry.typeOfCorrespondence || [],
          dateProcessStarted: entry.dateProcessStarted || '',
          mouStartDate: entry.mouStartDate || '',
          mouEndDate: entry.mouEndDate || '',
          timelineData: entry.timelineData || {},
        });
      }
    } catch (error) {
      console.error('Error loading entry:', error);
      alert('Failed to load entry');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCorrespondenceChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const updated = checked
        ? [...prev.typeOfCorrespondence, value]
        : prev.typeOfCorrespondence.filter((item) => item !== value);
      return { ...prev, typeOfCorrespondence: updated };
    });
  };

  const handleTimelineChange = (monthKey, checked) => {
    setFormData((prev) => ({
      ...prev,
      timelineData: {
        ...prev.timelineData,
        [monthKey]: checked,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (isEditMode) {
        await updateAccessTracking(Number(id), formData);
      } else {
        await createAccessTracking(formData);
      }

      navigate('/programm/access-tracking');
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  const correspondenceTypes = [
    'Registration Forms',
    'Introduction Letters',
    'Agreements',
    'Proposals',
    'Budgets',
    'Work Plans',
    'MOUs',
  ];

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditMode ? 'Edit Access Tracking Entry' : 'New Access Tracking Entry'}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {isEditMode
            ? 'Update the access tracking details'
            : 'Create a new access tracking entry'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Serial Number
              </label>
              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                placeholder="e.g., AT-001"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Donor <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="donor"
                value={formData.donor}
                onChange={handleChange}
                required
                placeholder="Donor organization"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                required
                placeholder="Project name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., District, Province"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Line Ministry
              </label>
              <input
                type="text"
                name="lineMinistry"
                value={formData.lineMinistry}
                onChange={handleChange}
                placeholder="Government ministry or department"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Project Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reporting Format
              </label>
              <textarea
                name="reportingFormat"
                value={formData.reportingFormat}
                onChange={handleChange}
                rows={2}
                placeholder="Describe the reporting format or requirements"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Activities
              </label>
              <textarea
                name="activities"
                value={formData.activities}
                onChange={handleChange}
                rows={3}
                placeholder="Activities related to access/registration"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Correspondence Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Correspondence Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Type of Correspondence
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {correspondenceTypes.map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <input
                      type="checkbox"
                      value={type}
                      checked={formData.typeOfCorrespondence.includes(type)}
                      onChange={handleCorrespondenceChange}
                      className="w-4 h-4 text-primary-500 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Process Started
              </label>
              <input
                type="date"
                name="dateProcessStarted"
                value={formData.dateProcessStarted}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div></div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                MOU Start Date
              </label>
              <input
                type="date"
                name="mouStartDate"
                value={formData.mouStartDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                MOU End Date
              </label>
              <input
                type="date"
                name="mouEndDate"
                value={formData.mouEndDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Timeline (January 2024 - December 2026)
          </h2>
          <div className="space-y-6">
            {Object.entries(monthsByYear).map(([year, months]) => (
              <div key={year}>
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  {year}
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3">
                  {months.map((month) => (
                    <label
                      key={month.key}
                      className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={formData.timelineData[month.key] || false}
                        onChange={(e) => handleTimelineChange(month.key, e.target.checked)}
                        className="w-4 h-4 text-primary-500 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="text-xs">
                        {new Date(month.year, month.month - 1).toLocaleDateString('en-US', {
                          month: 'short',
                        })}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
            About Access Tracking
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-400">
            This system tracks project access requirements and government coordination processes.
            Use it to monitor registration, permissions, and MOU status with line ministries and
            authorities.
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/programm/access-tracking')}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5" />
            {loading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccessTrackingForm;
