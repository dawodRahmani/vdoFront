import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import {
  createProgramWorkPlan,
  updateProgramWorkPlan,
  getProgramWorkPlanById,
  generateTimelineMonths,
} from '../../services/db/programWorkPlanService';

const ProgramWorkPlanForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    donor: '',
    project: '',
    output: '',
    activity: '',
    implementationMethodology: '',
    programComplianceDocuments: '',
    location: '',
    brandingVisibility: '',
    socialMedia: '',
    website: '',
    targetMatrixMeal: '',
    timelineData: {},
    remarks: '',
    status: 'draft',
  });

  const timelineMonths = generateTimelineMonths();

  useEffect(() => {
    if (isEditMode) {
      loadWorkPlan();
    }
  }, [id]);

  const loadWorkPlan = async () => {
    try {
      setLoading(true);
      const plan = await getProgramWorkPlanById(Number(id));
      if (plan) {
        setFormData({
          donor: plan.donor || '',
          project: plan.project || '',
          output: plan.output || '',
          activity: plan.activity || '',
          implementationMethodology: plan.implementationMethodology || '',
          programComplianceDocuments: plan.programComplianceDocuments || '',
          location: plan.location || '',
          brandingVisibility: plan.brandingVisibility || '',
          socialMedia: plan.socialMedia || '',
          website: plan.website || '',
          targetMatrixMeal: plan.targetMatrixMeal || '',
          timelineData: plan.timelineData || {},
          remarks: plan.remarks || '',
          status: plan.status || 'draft',
        });
      }
    } catch (error) {
      console.error('Error loading work plan:', error);
      alert('Failed to load work plan');
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
        await updateProgramWorkPlan(Number(id), formData);
      } else {
        await createProgramWorkPlan(formData);
      }

      navigate('/programm/work-plans');
    } catch (error) {
      console.error('Error saving work plan:', error);
      alert('Failed to save work plan');
    } finally {
      setLoading(false);
    }
  };

  // Group months by year for better organization
  const monthsByYear = timelineMonths.reduce((acc, month) => {
    if (!acc[month.year]) {
      acc[month.year] = [];
    }
    acc[month.year].push(month);
    return acc;
  }, {});

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditMode ? 'Edit Work Plan' : 'New Work Plan'}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {isEditMode
            ? 'Update the program work plan details'
            : 'Create a new program work plan'}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="project"
                value={formData.project}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Output <span className="text-red-500">*</span>
              </label>
              <textarea
                name="output"
                value={formData.output}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Activity <span className="text-red-500">*</span>
              </label>
              <textarea
                name="activity"
                value={formData.activity}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Implementation Methodology
              </label>
              <textarea
                name="implementationMethodology"
                value={formData.implementationMethodology}
                onChange={handleChange}
                rows={3}
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
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Additional Details
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Program Compliance Documents
              </label>
              <textarea
                name="programComplianceDocuments"
                value={formData.programComplianceDocuments}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Branding/Visibility
              </label>
              <textarea
                name="brandingVisibility"
                value={formData.brandingVisibility}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Social Media
              </label>
              <textarea
                name="socialMedia"
                value={formData.socialMedia}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website
              </label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Matrix (MEAL)
              </label>
              <textarea
                name="targetMatrixMeal"
                value={formData.targetMatrixMeal}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Timeline (July 2024 - December 2026)
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Mark the months when this activity is planned or completed
          </p>

          <div className="space-y-6">
            {Object.entries(monthsByYear).map(([year, months]) => (
              <div key={year}>
                <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                  {year}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {months.map((month) => (
                    <div key={month.key} className="flex items-center">
                      <input
                        type="checkbox"
                        id={month.key}
                        checked={formData.timelineData[month.key] || false}
                        onChange={(e) =>
                          handleTimelineChange(month.key, e.target.checked)
                        }
                        className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={month.key}
                        className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        {month.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/programm/work-plans')}
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

export default ProgramWorkPlanForm;
