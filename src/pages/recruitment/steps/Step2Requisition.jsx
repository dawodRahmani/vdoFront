import { useState, useEffect } from 'react';
import {
  Save,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  ClipboardList,
  Edit3,
  X,
} from 'lucide-react';
import {
  srfDB,
  SRF_STATUS,
  CONTRACT_TYPE,
  HIRING_APPROACH,
  EDUCATION_LEVEL,
} from '../../../services/db/recruitmentService';
import { ApprovalBadge } from '../../../components/recruitment/StatusBadge';

const Step2Requisition = ({ recruitment, onAdvance, isCurrentStep }) => {
  const [srf, setSrf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    jobTitle: recruitment.positionTitle || '',
    salaryGradeId: '',
    positionsRequired: 1,
    positionsMale: 0,
    positionsFemale: 0,
    dutyStation: recruitment.location || '',
    contractType: CONTRACT_TYPE.PROJECT,
    contractDurationMonths: 12,
    hiringApproach: HIRING_APPROACH.OPEN_COMPETITION,
    projectId: '',
    departmentId: '',
    educationRequired: EDUCATION_LEVEL.BACHELORS,
    educationSpecification: '',
    experienceRequired: '',
    languageDari: true,
    languagePashto: true,
    languageEnglish: true,
    languageOther: '',
    // Equipment
    equipmentLaptop: false,
    equipmentDesktop: false,
    equipmentIdCard: true,
    equipmentBusinessCard: false,
    equipmentHeadset: false,
    equipmentKeyboard: false,
    equipmentMouse: false,
    equipmentSimCard: false,
    equipmentOfficialEmail: true,
    equipmentOfficeDesk: true,
    // Other
    otherQualifications: '',
    applicationClosingDate: '',
    writtenExamRequired: true,
    isNewPosition: true,
  });

  // Load existing SRF
  useEffect(() => {
    const loadSRF = async () => {
      try {
        const existingSrf = await srfDB.getByRecruitmentId(recruitment.id);
        if (existingSrf) {
          setSrf(existingSrf);
          setFormData({
            jobTitle: existingSrf.jobTitle || recruitment.positionTitle || '',
            salaryGradeId: existingSrf.salaryGradeId || '',
            positionsRequired: existingSrf.positionsRequired || 1,
            positionsMale: existingSrf.positionsMale || 0,
            positionsFemale: existingSrf.positionsFemale || 0,
            dutyStation: existingSrf.dutyStation || recruitment.location || '',
            contractType: existingSrf.contractType || CONTRACT_TYPE.PROJECT,
            contractDurationMonths: existingSrf.contractDurationMonths || 12,
            hiringApproach: existingSrf.hiringApproach || HIRING_APPROACH.OPEN_COMPETITION,
            projectId: existingSrf.projectId || '',
            departmentId: existingSrf.departmentId || '',
            educationRequired: existingSrf.educationRequired || EDUCATION_LEVEL.BACHELORS,
            educationSpecification: existingSrf.educationSpecification || '',
            experienceRequired: existingSrf.experienceRequired || '',
            languageDari: existingSrf.languageDari ?? true,
            languagePashto: existingSrf.languagePashto ?? true,
            languageEnglish: existingSrf.languageEnglish ?? true,
            languageOther: existingSrf.languageOther || '',
            equipmentLaptop: existingSrf.equipmentLaptop || false,
            equipmentDesktop: existingSrf.equipmentDesktop || false,
            equipmentIdCard: existingSrf.equipmentIdCard ?? true,
            equipmentBusinessCard: existingSrf.equipmentBusinessCard || false,
            equipmentHeadset: existingSrf.equipmentHeadset || false,
            equipmentKeyboard: existingSrf.equipmentKeyboard || false,
            equipmentMouse: existingSrf.equipmentMouse || false,
            equipmentSimCard: existingSrf.equipmentSimCard || false,
            equipmentOfficialEmail: existingSrf.equipmentOfficialEmail ?? true,
            equipmentOfficeDesk: existingSrf.equipmentOfficeDesk ?? true,
            otherQualifications: existingSrf.otherQualifications || '',
            applicationClosingDate: existingSrf.applicationClosingDate || '',
            writtenExamRequired: existingSrf.writtenExamRequired ?? true,
            isNewPosition: existingSrf.isNewPosition ?? true,
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadSRF();
  }, [recruitment.id, recruitment.positionTitle, recruitment.location]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const data = {
        ...formData,
        recruitmentId: recruitment.id,
        torId: recruitment.tor?.id,
        requestedBy: 1, // Current user ID
      };

      if (srf) {
        await srfDB.update(srf.id, data);
      } else {
        const newSrf = await srfDB.create(data);
        setSrf(newSrf);
      }
      const updated = await srfDB.getByRecruitmentId(recruitment.id);
      setSrf(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    setSaving(true);
    setError(null);
    try {
      await handleSave();
      if (srf) {
        await srfDB.update(srf.id, { status: SRF_STATUS.HR_REVIEW });
        const updated = await srfDB.getByRecruitmentId(recruitment.id);
        setSrf(updated);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleHRVerify = async () => {
    setSaving(true);
    try {
      await srfDB.hrVerify(srf.id, 1); // User ID 1
      const updated = await srfDB.getByRecruitmentId(recruitment.id);
      setSrf(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFinanceVerify = async () => {
    setSaving(true);
    try {
      await srfDB.financeVerify(srf.id, 1); // User ID 1
      const updated = await srfDB.getByRecruitmentId(recruitment.id);
      setSrf(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    setSaving(true);
    try {
      await srfDB.approve(srf.id, 1); // User ID 1
      const updated = await srfDB.getByRecruitmentId(recruitment.id);
      setSrf(updated);
      if (onAdvance) {
        await onAdvance();
      }
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

  const isApproved = srf?.status === SRF_STATUS.APPROVED;
  const isHRReview = srf?.status === SRF_STATUS.HR_REVIEW;
  const isFinanceReview = srf?.status === SRF_STATUS.FINANCE_REVIEW;
  const baseCanEdit = !srf || srf.status === SRF_STATUS.DRAFT || srf.status === SRF_STATUS.REJECTED;
  const canEdit = editMode || (baseCanEdit && isCurrentStep);
  const showEditButton = !isCurrentStep || (isApproved && !editMode);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <ClipboardList className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Staff Requisition Form (SRF)
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Step 2-3: Define staffing requirements and obtain approvals
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {srf && <ApprovalBadge status={srf.status} />}
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

      {/* Approval Workflow */}
      {isCurrentStep && (
        <>
          {isHRReview && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-3">
                HR Review Required
              </h3>
              <button
                onClick={handleHRVerify}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                HR Verify & Forward to Finance
              </button>
            </div>
          )}

          {isFinanceReview && !srf?.budgetVerified && (
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-3">
                Finance Review Required
              </h3>
              <button
                onClick={handleFinanceVerify}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Finance Verify Budget
              </button>
            </div>
          )}

          {isFinanceReview && srf?.budgetVerified && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-300 mb-3">
                Ready for Final Approval
              </h3>
              <p className="text-sm text-green-700 dark:text-green-400 mb-3">
                HR and Finance have verified the requisition. Click below to approve and proceed.
              </p>
              <button
                onClick={handleApprove}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Final Approval & Proceed to Vacancy
              </button>
            </div>
          )}
        </>
      )}

      {isApproved && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-green-700 dark:text-green-400">
              Staff Requisition has been approved. Proceed to Vacancy Announcement.
            </p>
          </div>
          {isCurrentStep && (
            <button
              onClick={onAdvance}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              Proceed to Vacancy
            </button>
          )}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duty Station
                </label>
                <input
                  type="text"
                  name="dutyStation"
                  value={formData.dutyStation}
                  onChange={handleChange}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Number of Positions
                </label>
                <input
                  type="number"
                  name="positionsRequired"
                  value={formData.positionsRequired}
                  onChange={handleChange}
                  disabled={!canEdit}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contract Type
                </label>
                <select
                  name="contractType"
                  value={formData.contractType}
                  onChange={handleChange}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                >
                  {Object.entries(CONTRACT_TYPE).map(([key, value]) => (
                    <option key={value} value={value}>
                      {key.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contract Duration (Months)
                </label>
                <input
                  type="number"
                  name="contractDurationMonths"
                  value={formData.contractDurationMonths}
                  onChange={handleChange}
                  disabled={!canEdit}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Application Closing Date
                </label>
                <input
                  type="date"
                  name="applicationClosingDate"
                  value={formData.applicationClosingDate}
                  onChange={handleChange}
                  disabled={!canEdit}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Equipment Requirements */}
          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Equipment Requirements
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { name: 'equipmentLaptop', label: 'Laptop' },
                { name: 'equipmentDesktop', label: 'Desktop' },
                { name: 'equipmentIdCard', label: 'ID Card' },
                { name: 'equipmentBusinessCard', label: 'Business Card' },
                { name: 'equipmentHeadset', label: 'Headset' },
                { name: 'equipmentKeyboard', label: 'Keyboard' },
                { name: 'equipmentMouse', label: 'Mouse' },
                { name: 'equipmentSimCard', label: 'SIM Card' },
                { name: 'equipmentOfficialEmail', label: 'Official Email' },
                { name: 'equipmentOfficeDesk', label: 'Office Desk' },
              ].map(({ name, label }) => (
                <label key={name} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name={name}
                    checked={formData[name]}
                    onChange={handleChange}
                    disabled={!canEdit}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="writtenExamRequired"
                checked={formData.writtenExamRequired}
                onChange={handleChange}
                disabled={!canEdit}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Written Exam Required</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isNewPosition"
                checked={formData.isNewPosition}
                onChange={handleChange}
                disabled={!canEdit}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">New Position</span>
            </label>
          </div>

          {/* Other Qualifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Other Qualifications / Notes
            </label>
            <textarea
              name="otherQualifications"
              value={formData.otherQualifications}
              onChange={handleChange}
              disabled={!canEdit}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
            />
          </div>
        </div>

        {/* Actions */}
        {canEdit && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {srf ? 'Last saved: ' + new Date(srf.updatedAt).toLocaleString() : 'Not saved yet'}
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
              {isCurrentStep && baseCanEdit && (
                <button
                  onClick={handleSubmitForReview}
                  disabled={saving || !formData.jobTitle}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Submit for HR Review
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step2Requisition;
