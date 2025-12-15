import { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Printer,
  Check,
  X,
  Calendar,
  DollarSign,
  Building,
  User,
  Edit3,
} from 'lucide-react';
import { contractDB, backgroundCheckDB, offerDB, checklistDB } from '../../../services/db/recruitmentService';

const FILE_CHECKLIST_ITEMS = [
  { id: 'tor', name: 'Terms of Reference (TOR)', required: true },
  { id: 'srf', name: 'Staff Requisition Form (SRF)', required: true },
  { id: 'cv', name: 'Curriculum Vitae (CV)', required: true },
  { id: 'cover_letter', name: 'Cover Letter', required: true },
  { id: 'tazkira', name: 'Tazkira / National ID Copy', required: true },
  { id: 'education_docs', name: 'Education Certificates', required: true },
  { id: 'experience_docs', name: 'Experience Letters', required: false },
  { id: 'photo', name: 'Passport Size Photos (2)', required: true },
  { id: 'application_form', name: 'Signed Application Form', required: true },
  { id: 'longlisting_sheet', name: 'Longlisting Score Sheet', required: true },
  { id: 'shortlisting_sheet', name: 'Shortlisting Score Sheet', required: true },
  { id: 'written_test', name: 'Written Test Paper', required: false },
  { id: 'interview_form', name: 'Interview Evaluation Form', required: true },
  { id: 'committee_report', name: 'Committee Recommendation Report', required: true },
  { id: 'offer_letter', name: 'Signed Offer Letter', required: true },
  { id: 'sanction_clearance', name: 'Sanction Clearance Document', required: true },
  { id: 'reference_checks', name: 'Reference Check Forms', required: true },
  { id: 'guarantee_letter', name: 'Guarantee Letter', required: true },
  { id: 'address_verification', name: 'Address Verification Form', required: true },
  { id: 'criminal_clearance', name: 'Criminal Clearance Certificate', required: true },
  { id: 'signed_contract', name: 'Signed Employment Contract', required: true },
  { id: 'code_of_conduct', name: 'Signed Code of Conduct', required: true },
  { id: 'bank_details', name: 'Bank Account Details', required: true },
];

const Step15Contract = ({ recruitment, onAdvance, isCurrentStep }) => {
  const [contract, setContract] = useState(null);
  const [checklist, setChecklist] = useState({});
  const [backgroundCheck, setBackgroundCheck] = useState(null);
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('contract');
  const [editMode, setEditMode] = useState(false);

  const canEdit = editMode || isCurrentStep;
  const showEditButton = !isCurrentStep && !editMode;

  useEffect(() => {
    const load = async () => {
      try {
        const [existingOffer, existingBg] = await Promise.all([
          offerDB.getByRecruitmentId(recruitment.id),
          backgroundCheckDB.getByRecruitmentId(recruitment.id),
        ]);
        setOffer(existingOffer);
        setBackgroundCheck(existingBg);

        let existingContract = await contractDB.getByRecruitmentId(recruitment.id);
        if (!existingContract && existingBg?.status === 'completed') {
          existingContract = await contractDB.create({
            recruitmentId: recruitment.id,
            candidateApplicationId: existingOffer.candidateApplicationId,
            positionTitle: recruitment.positionTitle,
            department: recruitment.department || '',
            location: recruitment.location || '',
            salary: existingOffer.salary,
            contractType: recruitment.contractType || 'fixed_term',
            startDate: existingOffer.startDate,
            endDate: '',
            probationPeriod: 3,
            workingHours: 40,
            reportingTo: '',
          });
        }
        setContract(existingContract);

        // Load checklist
        let existingChecklist = await checklistDB.getByRecruitmentId(recruitment.id);
        if (!existingChecklist && existingContract) {
          existingChecklist = await checklistDB.create({
            recruitmentId: recruitment.id,
            items: FILE_CHECKLIST_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: false }), {}),
          });
        }
        if (existingChecklist) {
          setChecklist(existingChecklist.items || {});
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [recruitment.id, recruitment.positionTitle, recruitment.department, recruitment.location, recruitment.contractType]);

  const handleContractChange = (field, value) => {
    setContract(prev => ({ ...prev, [field]: value }));
  };

  const handleChecklistToggle = async (itemId) => {
    const newChecklist = { ...checklist, [itemId]: !checklist[itemId] };
    setChecklist(newChecklist);
    try {
      const existingChecklist = await checklistDB.getByRecruitmentId(recruitment.id);
      if (existingChecklist) {
        await checklistDB.update(existingChecklist.id, { items: newChecklist });
      }
    } catch (err) {
      console.error('Failed to update checklist:', err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await contractDB.update(contract.id, contract);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSign = async () => {
    setSaving(true);
    try {
      await contractDB.sign(contract.id);
      const updated = await contractDB.getByRecruitmentId(recruitment.id);
      setContract(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async () => {
    // Check if all required checklist items are checked
    const requiredItems = FILE_CHECKLIST_ITEMS.filter(item => item.required);
    const allRequired = requiredItems.every(item => checklist[item.id]);

    if (!allRequired) {
      setError('All required documents must be checked before activating the contract.');
      return;
    }

    setSaving(true);
    try {
      await contractDB.activate(contract.id);
      const updated = await contractDB.getByRecruitmentId(recruitment.id);
      setContract(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!backgroundCheck || backgroundCheck.status !== 'completed') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-500" />
            <div>
              <h3 className="font-medium text-yellow-800 dark:text-yellow-300">Background Check Required</h3>
              <p className="text-yellow-700 dark:text-yellow-400">
                Please complete all background verification checks before generating the employment contract.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = {
    draft: { bg: 'bg-gray-100', text: 'text-gray-700' },
    pending_signature: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    signed: { bg: 'bg-blue-100', text: 'text-blue-700' },
    active: { bg: 'bg-green-100', text: 'text-green-700' },
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const requiredCount = FILE_CHECKLIST_ITEMS.filter(item => item.required).length;
  const requiredCompleted = FILE_CHECKLIST_ITEMS.filter(item => item.required && checklist[item.id]).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Employment Contract</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Contract #{contract?.contractNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {showEditButton && (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Enable Editing
              </button>
            )}
            {editMode && (
              <button
                onClick={() => setEditMode(false)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel Edit
              </button>
            )}
            <span className={`px-3 py-1 rounded-full text-sm ${statusConfig[contract?.status]?.bg} ${statusConfig[contract?.status]?.text}`}>
              {contract?.status?.replace('_', ' ')}
            </span>
            {contract?.status === 'signed' || contract?.status === 'active' ? (
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  <Download className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  <Printer className="w-5 h-5" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700 dark:text-red-400">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">×</button>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('contract')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'contract'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <FileText className="w-4 h-4" /> Contract Details
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'checklist'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <CheckCircle className="w-4 h-4" /> File Checklist
              <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                {completedCount}/{FILE_CHECKLIST_ITEMS.length}
              </span>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Contract Details Tab */}
          {activeTab === 'contract' && (
            <div className="space-y-6">
              {/* Position Info */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Building className="w-4 h-4 inline mr-1" /> Position Title
                  </label>
                  <input
                    type="text"
                    value={contract?.positionTitle || ''}
                    onChange={(e) => handleContractChange('positionTitle', e.target.value)}
                    disabled={contract?.status !== 'draft'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contract Type</label>
                  <select
                    value={contract?.contractType || 'fixed_term'}
                    onChange={(e) => handleContractChange('contractType', e.target.value)}
                    disabled={contract?.status !== 'draft'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  >
                    <option value="fixed_term">Fixed Term</option>
                    <option value="permanent">Permanent</option>
                    <option value="consultant">Consultant</option>
                    <option value="intern">Intern</option>
                  </select>
                </div>
              </div>

              {/* Department & Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={contract?.department || ''}
                    onChange={(e) => handleContractChange('department', e.target.value)}
                    disabled={contract?.status !== 'draft'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={contract?.location || ''}
                    onChange={(e) => handleContractChange('location', e.target.value)}
                    disabled={contract?.status !== 'draft'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" /> Start Date
                  </label>
                  <input
                    type="date"
                    value={contract?.startDate || ''}
                    onChange={(e) => handleContractChange('startDate', e.target.value)}
                    disabled={contract?.status !== 'draft'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={contract?.endDate || ''}
                    onChange={(e) => handleContractChange('endDate', e.target.value)}
                    disabled={contract?.status !== 'draft'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Probation (Months)</label>
                  <input
                    type="number"
                    value={contract?.probationPeriod || 3}
                    onChange={(e) => handleContractChange('probationPeriod', parseInt(e.target.value))}
                    disabled={contract?.status !== 'draft'}
                    min={0}
                    max={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Salary & Hours */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <DollarSign className="w-4 h-4 inline mr-1" /> Monthly Salary (AFN)
                  </label>
                  <input
                    type="number"
                    value={contract?.salary || ''}
                    onChange={(e) => handleContractChange('salary', parseFloat(e.target.value))}
                    disabled={contract?.status !== 'draft'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weekly Hours</label>
                  <input
                    type="number"
                    value={contract?.workingHours || 40}
                    onChange={(e) => handleContractChange('workingHours', parseInt(e.target.value))}
                    disabled={contract?.status !== 'draft'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <User className="w-4 h-4 inline mr-1" /> Reports To
                  </label>
                  <input
                    type="text"
                    value={contract?.reportingTo || ''}
                    onChange={(e) => handleContractChange('reportingTo', e.target.value)}
                    disabled={contract?.status !== 'draft'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Signature Status */}
              {contract?.status === 'signed' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-300">Contract Signed</p>
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        Signed on: {contract.signedDate ? new Date(contract.signedDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {contract?.status === 'active' && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-300">Contract Active</p>
                      <p className="text-sm text-green-700 dark:text-green-400">
                        The recruitment process is complete. The employee has been onboarded.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* File Checklist Tab */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Document checklist for employee file
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Required: {requiredCompleted}/{requiredCount} • Total: {completedCount}/{FILE_CHECKLIST_ITEMS.length}
                  </p>
                </div>
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${(completedCount / FILE_CHECKLIST_ITEMS.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {FILE_CHECKLIST_ITEMS.map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      checklist[item.id]
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checklist[item.id] || false}
                      onChange={() => handleChecklistToggle(item.id)}
                      className="sr-only"
                    />
                    <span className={`w-5 h-5 rounded flex items-center justify-center ${
                      checklist[item.id]
                        ? 'bg-emerald-500 text-white'
                        : 'border-2 border-gray-300 dark:border-gray-600'
                    }`}>
                      {checklist[item.id] && <Check className="w-3 h-3" />}
                    </span>
                    <span className={`flex-1 text-sm ${
                      checklist[item.id]
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {item.name}
                      {item.required && <span className="text-red-500 ml-1">*</span>}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {canEdit && (
        <div className="flex justify-end gap-3">
          {contract?.status === 'draft' && (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Save Draft
              </button>
              <button
                onClick={handleSign}
                disabled={saving || !contract?.startDate || !contract?.salary}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <FileText className="w-4 h-4" /> Generate & Send for Signature
              </button>
            </>
          )}
          {contract?.status === 'pending_signature' && (
            <button
              onClick={handleSign}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <CheckCircle className="w-4 h-4" /> Mark as Signed
            </button>
          )}
          {contract?.status === 'signed' && (
            <button
              onClick={handleActivate}
              disabled={saving || requiredCompleted < requiredCount}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" /> Activate Contract & Complete Recruitment
            </button>
          )}
        </div>
      )}

      {/* Completion Message */}
      {contract?.status === 'active' && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Recruitment Complete!</h3>
              <p className="mt-1 opacity-90">
                The recruitment process for {contract.positionTitle} has been successfully completed.
                The employee file is ready for handover to HR records.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step15Contract;
