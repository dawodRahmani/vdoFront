import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle2 } from 'lucide-react';
import {
  createDNRTracking,
  updateDNRTracking,
  getDNRTrackingById,
  groupMonthsByYearAndQuarter,
} from '../../services/db/dnrTrackingService';

const DNRTrackingForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serialNumber: '',
    donor: '',
    projectName: '',
    location: '',
    startDate: '',
    endDate: '',
    projectStatus: 'active',
    reportType: '',
    reportingDescription: '',
    reportingFormat: '',
    dueDate: '',
    reports: '',
    timelineData: {},
  });

  const monthsByYearQuarter = groupMonthsByYearAndQuarter();

  useEffect(() => {
    if (isEditMode) {
      loadEntry();
    }
  }, [id]);

  const loadEntry = async () => {
    try {
      setLoading(true);
      const entry = await getDNRTrackingById(Number(id));
      if (entry) {
        setFormData({
          serialNumber: entry.serialNumber || '',
          donor: entry.donor || '',
          projectName: entry.projectName || '',
          location: entry.location || '',
          startDate: entry.startDate || '',
          endDate: entry.endDate || '',
          projectStatus: entry.projectStatus || 'active',
          reportType: entry.reportType || '',
          reportingDescription: entry.reportingDescription || '',
          reportingFormat: entry.reportingFormat || '',
          dueDate: entry.dueDate || '',
          reports: entry.reports || '',
          timelineData: entry.timelineData || {},
        });
      }
    } catch (error) {
      console.error('Error loading DNR entry:', error);
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

  const handleTimelineChange = (monthKey, value) => {
    setFormData((prev) => ({
      ...prev,
      timelineData: {
        ...prev.timelineData,
        [monthKey]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (isEditMode) {
        await updateDNRTracking(Number(id), formData);
      } else {
        await createDNRTracking(formData);
      }

      navigate('/programm/dnr-tracking');
    } catch (error) {
      console.error('Error saving DNR entry:', error);
      alert('Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditMode ? 'Edit DNR Entry' : 'New DNR Entry'}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {isEditMode
            ? 'Update the donor reporting tracking details'
            : 'Create a new donor reporting tracking entry'}
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
                Serial Number (S/N)
              </label>
              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Status
              </label>
              <select
                name="projectStatus"
                value={formData.projectStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

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
          </div>
        </div>

        {/* Reporting Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Reporting Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type of Report <span className="text-red-500">*</span>
              </label>
              <select
                name="reportType"
                value={formData.reportType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select type</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annual">Annual</option>
                <option value="Bi-Annual">Bi-Annual</option>
                <option value="Final">Final</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reporting Description
              </label>
              <textarea
                name="reportingDescription"
                value={formData.reportingDescription}
                onChange={handleChange}
                rows={3}
                placeholder="e.g., SitRep, Narrative, Financial, Progress Report"
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
                placeholder="Template or format to be used"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reports (Links or References)
              </label>
              <textarea
                name="reports"
                value={formData.reports}
                onChange={handleChange}
                rows={2}
                placeholder="Links to uploaded documents or report references"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Timeline (June 2022 - January 2027)
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Mark the months when reports are submitted or due
          </p>

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
                          {months.map((month) => (
                            <div
                              key={month.key}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                                formData.timelineData[month.key]
                                  ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                                  : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                              }`}
                              onClick={() =>
                                handleTimelineChange(
                                  month.key,
                                  !formData.timelineData[month.key]
                                )
                              }
                            >
                              {formData.timelineData[month.key] && (
                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                              )}
                              <span
                                className={`text-xs ${
                                  formData.timelineData[month.key]
                                    ? 'text-green-900 dark:text-green-300 font-medium'
                                    : 'text-gray-600 dark:text-gray-400'
                                }`}
                              >
                                {month.label.split(' ')[0]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/programm/dnr-tracking')}
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

export default DNRTrackingForm;
