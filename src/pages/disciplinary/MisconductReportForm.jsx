import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  FileText,
  User,
  Calendar,
  MapPin,
  AlertTriangle,
  Eye,
  EyeOff,
  Upload,
  X,
  CheckCircle
} from 'lucide-react';
import { initDisciplinaryDB, misconductReportsDB, misconductEvidenceDB } from '../../services/db/disciplinaryService';
import { employeeDB } from '../../services/db/indexedDB';

const MisconductReportForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    reportSource: '',
    reporterId: '',
    isAnonymous: false,
    accusedEmployeeId: '',
    accusedEmployeeName: '',
    accusedDepartment: '',
    incidentDate: '',
    incidentTime: '',
    incidentLocation: '',
    incidentDescription: '',
    misconductCategory: '',
    misconductType: '',
    severityLevel: '',
    witnessNames: '',
    immediateActionRequired: false,
    immediateActionTaken: '',
    additionalNotes: ''
  });

  const reportSourceOptions = [
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'hr', label: 'HR Department' },
    { value: 'colleague', label: 'Colleague' },
    { value: 'self', label: 'Self Report' },
    { value: 'anonymous', label: 'Anonymous' },
    { value: 'external', label: 'External Party' }
  ];

  const categoryOptions = [
    { value: 'minor', label: 'Minor Infraction', description: 'First-time minor issues (tardiness, dress code)' },
    { value: 'misconduct', label: 'Misconduct', description: 'Repeated minor issues or moderate violations' },
    { value: 'serious', label: 'Serious Misconduct', description: 'Significant policy violations, negligence' },
    { value: 'gross', label: 'Gross Misconduct', description: 'Zero tolerance violations (fraud, harassment, violence)' }
  ];

  const misconductTypes = {
    minor: [
      { value: 'attendance', label: 'Attendance Issues' },
      { value: 'dress_code', label: 'Dress Code Violation' },
      { value: 'minor_policy', label: 'Minor Policy Violation' },
      { value: 'workplace_behavior', label: 'Inappropriate Workplace Behavior' }
    ],
    misconduct: [
      { value: 'repeated_attendance', label: 'Repeated Attendance Issues' },
      { value: 'insubordination', label: 'Insubordination' },
      { value: 'policy_violation', label: 'Policy Violation' },
      { value: 'negligence', label: 'Negligence' },
      { value: 'unauthorized_absence', label: 'Unauthorized Absence' }
    ],
    serious: [
      { value: 'gross_negligence', label: 'Gross Negligence' },
      { value: 'conflict_of_interest', label: 'Conflict of Interest' },
      { value: 'data_breach', label: 'Data/Information Breach' },
      { value: 'safety_violation', label: 'Safety Violation' },
      { value: 'misuse_resources', label: 'Misuse of Resources' }
    ],
    gross: [
      { value: 'sea', label: 'Sexual Exploitation & Abuse (SEA)' },
      { value: 'pseah', label: 'PSEAH Violation' },
      { value: 'fraud', label: 'Fraud/Embezzlement' },
      { value: 'theft', label: 'Theft' },
      { value: 'violence', label: 'Violence/Physical Assault' },
      { value: 'harassment', label: 'Harassment' },
      { value: 'discrimination', label: 'Discrimination' },
      { value: 'substance_abuse', label: 'Substance Abuse at Work' }
    ]
  };

  const severityOptions = [
    { value: 'low', label: 'Low', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'medium', label: 'Medium', color: 'bg-orange-100 text-orange-800' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-200 text-red-900' }
  ];

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      await initDisciplinaryDB();
      const employeesData = await employeeDB.getAll();
      setEmployees(employeesData);

      if (isEditing) {
        const report = await misconductReportsDB.getById(Number(id));
        if (report) {
          setFormData({
            reportSource: report.reportSource || '',
            reporterId: report.reporterId || '',
            isAnonymous: report.isAnonymous || false,
            accusedEmployeeId: report.accusedEmployeeId || '',
            accusedEmployeeName: report.accusedEmployeeName || '',
            accusedDepartment: report.accusedDepartment || '',
            incidentDate: report.incidentDate || '',
            incidentTime: report.incidentTime || '',
            incidentLocation: report.incidentLocation || '',
            incidentDescription: report.incidentDescription || '',
            misconductCategory: report.misconductCategory || '',
            misconductType: report.misconductType || '',
            severityLevel: report.severityLevel || '',
            witnessNames: report.witnessNames || '',
            immediateActionRequired: report.immediateActionRequired || false,
            immediateActionTaken: report.immediateActionTaken || '',
            additionalNotes: report.additionalNotes || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-fill employee details when selecting accused employee
    if (name === 'accusedEmployeeId' && value) {
      const employee = employees.find(e => e.id === Number(value));
      if (employee) {
        setFormData(prev => ({
          ...prev,
          accusedEmployeeName: `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.name || '',
          accusedDepartment: employee.department || ''
        }));
      }
    }

    // Reset misconduct type when category changes
    if (name === 'misconductCategory') {
      setFormData(prev => ({
        ...prev,
        misconductType: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const reportData = {
        ...formData,
        reportDate: new Date().toISOString().split('T')[0],
        status: 'received'
      };

      if (isEditing) {
        await misconductReportsDB.update(Number(id), reportData);
      } else {
        const reportNumber = await misconductReportsDB.generateReportNumber();
        await misconductReportsDB.create({
          ...reportData,
          reportNumber
        });
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/disciplinary/reports');
      }, 1500);
    } catch (error) {
      console.error('Error saving report:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Report {isEditing ? 'Updated' : 'Submitted'} Successfully
        </h2>
        <p className="text-gray-500 dark:text-gray-400">Redirecting to reports list...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/disciplinary/reports')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Misconduct Report' : 'Report Misconduct'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isEditing ? 'Update the report details' : 'Submit a new misconduct report'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Reporter Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Reporter Information</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Report Source <span className="text-red-500">*</span>
              </label>
              <select
                name="reportSource"
                value={formData.reportSource}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select source...</option>
                {reportSourceOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reporter (if not anonymous)
              </label>
              <select
                name="reporterId"
                value={formData.reporterId}
                onChange={handleInputChange}
                disabled={formData.isAnonymous}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <option value="">Select reporter...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {`${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  {formData.isAnonymous ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>Anonymous Report</span>
                </span>
              </label>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 ml-7">
                Reporter identity will be protected if checked
              </p>
            </div>
          </div>
        </div>

        {/* Accused Employee */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <span>Accused Employee</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Employee <span className="text-red-500">*</span>
              </label>
              <select
                name="accusedEmployeeId"
                value={formData.accusedEmployeeId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select employee...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {`${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Employee Name
              </label>
              <input
                type="text"
                name="accusedEmployeeName"
                value={formData.accusedEmployeeName}
                onChange={handleInputChange}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Department
              </label>
              <input
                type="text"
                name="accusedDepartment"
                value={formData.accusedDepartment}
                onChange={handleInputChange}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Incident Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Incident Details</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Incident Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="incidentDate"
                value={formData.incidentDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Incident Time
              </label>
              <input
                type="time"
                name="incidentTime"
                value={formData.incidentTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="incidentLocation"
                value={formData.incidentLocation}
                onChange={handleInputChange}
                required
                placeholder="e.g., Kabul Office, Field Site"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Incident Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="incidentDescription"
                value={formData.incidentDescription}
                onChange={handleInputChange}
                required
                rows={4}
                placeholder="Provide a detailed description of what happened..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Witness Names (if any)
              </label>
              <input
                type="text"
                name="witnessNames"
                value={formData.witnessNames}
                onChange={handleInputChange}
                placeholder="Enter names separated by commas"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Misconduct Classification */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Misconduct Classification</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {categoryOptions.map(cat => (
                  <label
                    key={cat.value}
                    className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${formData.misconductCategory === cat.value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                  >
                    <input
                      type="radio"
                      name="misconductCategory"
                      value={cat.value}
                      checked={formData.misconductCategory === cat.value}
                      onChange={handleInputChange}
                      className="mt-1 w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <div className="ml-3">
                      <span className="font-medium text-gray-900 dark:text-white">{cat.label}</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{cat.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type <span className="text-red-500">*</span>
              </label>
              {formData.misconductCategory ? (
                <div className="space-y-2">
                  {misconductTypes[formData.misconductCategory]?.map(type => (
                    <label
                      key={type.value}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${formData.misconductType === type.value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                    >
                      <input
                        type="radio"
                        name="misconductType"
                        value={type.value}
                        checked={formData.misconductType === type.value}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      />
                      <span className="ml-3 text-gray-900 dark:text-white">{type.label}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center text-gray-500 dark:text-gray-400">
                  Select a category first
                </div>
              )}

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Severity Level <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {severityOptions.map(sev => (
                    <label
                      key={sev.value}
                      className={`flex items-center px-4 py-2 border rounded-lg cursor-pointer transition-colors ${formData.severityLevel === sev.value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                    >
                      <input
                        type="radio"
                        name="severityLevel"
                        value={sev.value}
                        checked={formData.severityLevel === sev.value}
                        onChange={handleInputChange}
                        className="hidden"
                      />
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${sev.color}`}>{sev.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Immediate Action */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Immediate Action</h3>
          <div className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="immediateActionRequired"
                checked={formData.immediateActionRequired}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Immediate action required</span>
            </label>

            {formData.immediateActionRequired && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Action Taken
                </label>
                <textarea
                  name="immediateActionTaken"
                  value={formData.immediateActionTaken}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Describe any immediate action taken..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Additional Notes
              </label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any additional information..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/disciplinary/reports')}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Update Report' : 'Submit Report'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MisconductReportForm;
