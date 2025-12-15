import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  UserMinus,
  Save,
  ArrowLeft,
  User,
  Building,
  Calendar,
  FileText,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { separationService, separationTypeService, initializeExitModule } from '../../services/db/exitService';
import { employeeDB } from '../../services/db/indexedDB';

const SeparationForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [separationTypes, setSeparationTypes] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    department: '',
    position: '',
    separationType: 'resignation',
    initiatedBy: 'employee',
    requestDate: new Date().toISOString().split('T')[0],
    proposedLastDay: '',
    noticePeriodDays: 30,
    reasonCategory: '',
    reasonDetails: '',
    eligibleForCertificate: true,
    eligibleForRehire: true,
  });
  const [errors, setErrors] = useState({});

  const reasonCategories = [
    { value: 'better_opportunity', label: 'Better Job Opportunity' },
    { value: 'personal', label: 'Personal Reasons' },
    { value: 'career_change', label: 'Career Change' },
    { value: 'relocation', label: 'Relocation' },
    { value: 'education', label: 'Education / Further Studies' },
    { value: 'compensation', label: 'Compensation Related' },
    { value: 'management', label: 'Management Issues' },
    { value: 'workload', label: 'Workload / Work-Life Balance' },
    { value: 'project_closure', label: 'Project Closure' },
    { value: 'budget', label: 'Budget Constraints' },
    { value: 'misconduct', label: 'Misconduct' },
    { value: 'performance', label: 'Performance Issues' },
    { value: 'restructuring', label: 'Organizational Restructuring' },
    { value: 'retirement', label: 'Retirement' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      await initializeExitModule();

      const [emps, types] = await Promise.all([
        employeeDB.getAll({ status: 'active' }),
        separationTypeService.getAll(),
      ]);

      setEmployees(emps);
      setSeparationTypes(types);

      if (isEdit) {
        const separation = await separationService.getById(Number(id));
        if (separation) {
          setFormData({
            ...separation,
            requestDate: separation.requestDate?.split('T')[0] || '',
            proposedLastDay: separation.proposedLastDay?.split('T')[0] || '',
          });
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleEmployeeChange = async (e) => {
    const employeeId = Number(e.target.value);
    if (employeeId) {
      const employee = employees.find(emp => emp.id === employeeId);
      if (employee) {
        setFormData(prev => ({
          ...prev,
          employeeId,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          department: employee.department || '',
          position: employee.position || '',
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        employeeId: '',
        employeeName: '',
        department: '',
        position: '',
      }));
    }
  };

  const handleSeparationTypeChange = (e) => {
    const typeName = e.target.value;
    const type = separationTypes.find(t => t.name === typeName);

    setFormData(prev => ({
      ...prev,
      separationType: typeName,
      noticePeriodDays: type?.noticePeriodDays || 30,
      eligibleForCertificate: type?.eligibleForCertificate !== false,
      initiatedBy: type?.category === 'voluntary' ? 'employee' : 'organization',
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'Please select an employee';
    }
    if (!formData.separationType) {
      newErrors.separationType = 'Please select separation type';
    }
    if (!formData.requestDate) {
      newErrors.requestDate = 'Request date is required';
    }
    if (!formData.proposedLastDay) {
      newErrors.proposedLastDay = 'Last working day is required';
    }
    if (!formData.reasonCategory) {
      newErrors.reasonCategory = 'Please select a reason category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setSaving(true);

      if (isEdit) {
        await separationService.update(Number(id), formData);
      } else {
        await separationService.create(formData);
      }

      navigate('/exit/separations');
    } catch (error) {
      console.error('Error saving separation:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/exit/separations')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UserMinus className="w-7 h-7" />
            {isEdit ? 'Edit Separation' : 'New Separation'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isEdit ? 'Update separation details' : 'Create a new employee separation record'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Employee Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                name="employeeId"
                value={formData.employeeId}
                onChange={handleEmployeeChange}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 ${
                  errors.employeeId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeId})
                  </option>
                ))}
              </select>
              {errors.employeeId && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.employeeId}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Position
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Separation Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Separation Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Separation Type <span className="text-red-500">*</span>
              </label>
              <select
                name="separationType"
                value={formData.separationType}
                onChange={handleSeparationTypeChange}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 ${
                  errors.separationType ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select Type</option>
                <option value="resignation">Resignation</option>
                <option value="contract_expiry">Contract Expiry</option>
                <option value="project_end">Project End</option>
                <option value="termination_without_cause">Termination Without Cause</option>
                <option value="termination_with_cause">Termination With Cause</option>
                <option value="probation_failed">Probation Not Passed</option>
                <option value="retirement">Retirement</option>
              </select>
              {errors.separationType && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.separationType}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Initiated By
              </label>
              <select
                name="initiatedBy"
                value={formData.initiatedBy}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
              >
                <option value="employee">Employee</option>
                <option value="organization">Organization</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Request Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="requestDate"
                value={formData.requestDate}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 ${
                  errors.requestDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.requestDate && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.requestDate}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Proposed Last Working Day <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="proposedLastDay"
                value={formData.proposedLastDay}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 ${
                  errors.proposedLastDay ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.proposedLastDay && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.proposedLastDay}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notice Period (Days)
              </label>
              <input
                type="number"
                name="noticePeriodDays"
                value={formData.noticePeriodDays}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Reason */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Reason for Separation
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reason Category <span className="text-red-500">*</span>
              </label>
              <select
                name="reasonCategory"
                value={formData.reasonCategory}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 ${
                  errors.reasonCategory ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select Reason</option>
                {reasonCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.reasonCategory && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.reasonCategory}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Additional Details
              </label>
              <textarea
                name="reasonDetails"
                value={formData.reasonDetails}
                onChange={handleChange}
                rows={4}
                placeholder="Provide additional details about the reason for separation..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Eligibility */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Eligibility
          </h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="eligibleForCertificate"
                checked={formData.eligibleForCertificate}
                onChange={handleChange}
                className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
              />
              <span className="text-gray-700 dark:text-gray-300">
                Eligible for Work Certificate
              </span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="eligibleForRehire"
                checked={formData.eligibleForRehire}
                onChange={handleChange}
                className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
              />
              <span className="text-gray-700 dark:text-gray-300">
                Eligible for Rehire
              </span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/exit/separations')}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEdit ? 'Update Separation' : 'Create Separation'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SeparationForm;
