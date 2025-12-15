import { useState, useEffect } from 'react';
import {
  Save,
  Send,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  AlertCircle,
  FileText,
  Edit3,
  X,
} from 'lucide-react';
import {
  torDB,
  EDUCATION_LEVEL,
  TOR_STATUS,
} from '../../../services/db/recruitmentService';
import { ApprovalBadge } from '../../../components/recruitment/StatusBadge';

const Step1TOR = ({ recruitment, onAdvance, isCurrentStep }) => {
  const [tor, setTor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    positionTitle: recruitment.positionTitle || '',
    donorId: '',
    projectId: '',
    departmentId: '',
    location: recruitment.location || '',
    reportsToPositionId: '',
    jobPurpose: '',
    tasksResponsibilities: [{ task: '', objective: '' }],
    requiredQualifications: '',
    requiredEducation: EDUCATION_LEVEL.BACHELORS,
    educationSpecialization: '',
    minExperienceYears: 2,
    languageDari: true,
    languagePashto: true,
    languageEnglish: true,
    languageOther: '',
    commitmentNotes: '',
  });

  // Load existing TOR
  useEffect(() => {
    const loadTOR = async () => {
      try {
        const existingTor = await torDB.getByRecruitmentId(recruitment.id);
        if (existingTor) {
          setTor(existingTor);
          setFormData({
            positionTitle: existingTor.positionTitle || '',
            donorId: existingTor.donorId || '',
            projectId: existingTor.projectId || '',
            departmentId: existingTor.departmentId || '',
            location: existingTor.location || '',
            reportsToPositionId: existingTor.reportsToPositionId || '',
            jobPurpose: existingTor.jobPurpose || '',
            tasksResponsibilities: existingTor.tasksResponsibilities || [{ task: '', objective: '' }],
            requiredQualifications: existingTor.requiredQualifications || '',
            requiredEducation: existingTor.requiredEducation || EDUCATION_LEVEL.BACHELORS,
            educationSpecialization: existingTor.educationSpecialization || '',
            minExperienceYears: existingTor.minExperienceYears || 2,
            languageDari: existingTor.languageDari ?? true,
            languagePashto: existingTor.languagePashto ?? true,
            languageEnglish: existingTor.languageEnglish ?? true,
            languageOther: existingTor.languageOther || '',
            commitmentNotes: existingTor.commitmentNotes || '',
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadTOR();
  }, [recruitment.id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleTaskChange = (index, field, value) => {
    setFormData(prev => {
      const tasks = [...prev.tasksResponsibilities];
      tasks[index] = { ...tasks[index], [field]: value };
      return { ...prev, tasksResponsibilities: tasks };
    });
  };

  const addTask = () => {
    setFormData(prev => ({
      ...prev,
      tasksResponsibilities: [...prev.tasksResponsibilities, { task: '', objective: '' }],
    }));
  };

  const removeTask = (index) => {
    setFormData(prev => ({
      ...prev,
      tasksResponsibilities: prev.tasksResponsibilities.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const data = {
        ...formData,
        recruitmentId: recruitment.id,
      };

      if (tor) {
        await torDB.update(tor.id, data);
      } else {
        const newTor = await torDB.create(data);
        setTor(newTor);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForApproval = async () => {
    setSaving(true);
    setError(null);
    try {
      await handleSave();
      if (tor) {
        await torDB.update(tor.id, { status: TOR_STATUS.PENDING_APPROVAL });
        const updated = await torDB.getByRecruitmentId(recruitment.id);
        setTor(updated);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    setSaving(true);
    try {
      await torDB.approve(tor.id, 1); // User ID 1 for demo
      const updated = await torDB.getByRecruitmentId(recruitment.id);
      setTor(updated);
      // Advance to next step
      if (onAdvance) {
        await onAdvance();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    setSaving(true);
    try {
      await torDB.reject(tor.id, 1, 'Needs revision'); // User ID 1 for demo
      const updated = await torDB.getByRecruitmentId(recruitment.id);
      setTor(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isApproved = tor?.status === TOR_STATUS.APPROVED;
  const isPendingApproval = tor?.status === TOR_STATUS.PENDING_APPROVAL;
  const isRejected = tor?.status === TOR_STATUS.REJECTED;
  const canEdit = editMode || (!isApproved && !isPendingApproval && isCurrentStep);
  const showEditButton = !isCurrentStep || (isApproved && !editMode);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Terms of Reference (TOR)
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Define the position requirements and qualifications
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {tor && <ApprovalBadge status={tor.status} />}
            {showEditButton && (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50"
              >
                <Edit3 className="w-4 h-4" />
                Enable Editing
              </button>
            )}
            {editMode && (
              <button
                onClick={() => setEditMode(false)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <X className="w-4 h-4" />
                Cancel Edit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Approval Actions */}
      {isPendingApproval && isCurrentStep && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-3">
            TOR is pending approval
          </h3>
          <div className="flex gap-3">
            <button
              onClick={handleApprove}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              Approve TOR
            </button>
            <button
              onClick={handleReject}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Approved Message */}
      {isApproved && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <p className="text-green-700 dark:text-green-400">
            TOR has been approved. Proceed to Staff Requisition.
          </p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 space-y-6">
          {/* Position Details */}
          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Position Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Position Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="positionTitle"
                  value={formData.positionTitle}
                  onChange={handleChange}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location / Duty Station
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Job Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Job Purpose <span className="text-red-500">*</span>
            </label>
            <textarea
              name="jobPurpose"
              value={formData.jobPurpose}
              onChange={handleChange}
              disabled={!canEdit}
              rows={3}
              placeholder="Brief description of the position's main purpose..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
            />
          </div>

          {/* Tasks & Responsibilities */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tasks & Responsibilities (SMART Objectives)
              </label>
              {canEdit && (
                <button
                  type="button"
                  onClick={addTask}
                  className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
              )}
            </div>
            <div className="space-y-3">
              {formData.tasksResponsibilities.map((item, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={item.task}
                      onChange={(e) => handleTaskChange(index, 'task', e.target.value)}
                      disabled={!canEdit}
                      placeholder="Task description"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    />
                    <input
                      type="text"
                      value={item.objective}
                      onChange={(e) => handleTaskChange(index, 'objective', e.target.value)}
                      disabled={!canEdit}
                      placeholder="SMART objective"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    />
                  </div>
                  {canEdit && formData.tasksResponsibilities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTask(index)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Education Requirements */}
          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Education & Experience
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Required Education Level
                </label>
                <select
                  name="requiredEducation"
                  value={formData.requiredEducation}
                  onChange={handleChange}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                >
                  {Object.entries(EDUCATION_LEVEL).map(([key, value]) => (
                    <option key={value} value={value}>
                      {key.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Education Specialization
                </label>
                <input
                  type="text"
                  name="educationSpecialization"
                  value={formData.educationSpecialization}
                  onChange={handleChange}
                  disabled={!canEdit}
                  placeholder="e.g., Computer Science, Business Administration"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Minimum Experience (Years)
                </label>
                <input
                  type="number"
                  name="minExperienceYears"
                  value={formData.minExperienceYears}
                  onChange={handleChange}
                  disabled={!canEdit}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Language Requirements */}
          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Language Requirements
            </h3>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="languageDari"
                  checked={formData.languageDari}
                  onChange={handleChange}
                  disabled={!canEdit}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Dari</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="languagePashto"
                  checked={formData.languagePashto}
                  onChange={handleChange}
                  disabled={!canEdit}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Pashto</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="languageEnglish"
                  checked={formData.languageEnglish}
                  onChange={handleChange}
                  disabled={!canEdit}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">English</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">Other:</span>
                <input
                  type="text"
                  name="languageOther"
                  value={formData.languageOther}
                  onChange={handleChange}
                  disabled={!canEdit}
                  placeholder="Specify"
                  className="w-32 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Additional Qualifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Additional Required Qualifications
            </label>
            <textarea
              name="requiredQualifications"
              value={formData.requiredQualifications}
              onChange={handleChange}
              disabled={!canEdit}
              rows={3}
              placeholder="Any additional qualifications, certifications, or skills required..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
            />
          </div>

          {/* Commitment Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Commitment Notes
            </label>
            <textarea
              name="commitmentNotes"
              value={formData.commitmentNotes}
              onChange={handleChange}
              disabled={!canEdit}
              rows={2}
              placeholder="Any special commitments or expectations..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
            />
          </div>
        </div>

        {/* Actions */}
        {canEdit && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {tor ? 'Last saved: ' + new Date(tor.updatedAt).toLocaleString() : 'Not saved yet'}
              {editMode && <span className="ml-2 text-amber-600 dark:text-amber-400">(Edit Mode)</span>}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              {isCurrentStep && !isApproved && (
                <button
                  onClick={handleSubmitForApproval}
                  disabled={saving || !formData.positionTitle || !formData.jobPurpose}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Submit for Approval
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step1TOR;
