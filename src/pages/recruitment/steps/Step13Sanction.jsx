import { useState, useEffect } from 'react';
import { Shield, Search, CheckCircle, XCircle, AlertTriangle, AlertCircle, FileText, ExternalLink, Edit3, X } from 'lucide-react';
import { sanctionDB, offerDB } from '../../../services/db/recruitmentService';

const Step13Sanction = ({ recruitment, onAdvance, isCurrentStep }) => {
  const [sanction, setSanction] = useState(null);
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const canEdit = editMode || isCurrentStep;
  const showEditButton = !isCurrentStep && !editMode;

  useEffect(() => {
    const load = async () => {
      try {
        const existingOffer = await offerDB.getByRecruitmentId(recruitment.id);
        setOffer(existingOffer);

        let existing = await sanctionDB.getByRecruitmentId(recruitment.id);
        if (!existing && existingOffer) {
          existing = await sanctionDB.create({
            recruitmentId: recruitment.id,
            candidateApplicationId: existingOffer.candidateApplicationId,
            candidateFullName: '',
            fatherName: '',
            dateOfBirth: '',
            nationality: '',
          });
        }
        setSanction(existing);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [recruitment.id]);

  const handleChange = (field, value) => {
    setSanction(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setChecking(true);
    try {
      await sanctionDB.update(sanction.id, sanction);
    } catch (err) {
      setError(err.message);
    } finally {
      setChecking(false);
    }
  };

  const handleRunCheck = async () => {
    if (!sanction.candidateFullName || !sanction.fatherName) {
      setError('Please fill in candidate full name and father name before running the check.');
      return;
    }

    setChecking(true);
    try {
      // Simulate sanction check (in real app, this would call an API)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For demo, randomly determine if cleared (90% chance of clearing)
      const cleared = Math.random() > 0.1;

      await sanctionDB.runCheck(sanction.id, cleared);
      const updated = await sanctionDB.getByRecruitmentId(recruitment.id);
      setSanction(updated);

      if (cleared && onAdvance) {
        await onAdvance();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setChecking(false);
    }
  };

  const handleManualClear = async () => {
    setChecking(true);
    try {
      await sanctionDB.runCheck(sanction.id, true);
      const updated = await sanctionDB.getByRecruitmentId(recruitment.id);
      setSanction(updated);
      if (onAdvance) await onAdvance();
    } catch (err) {
      setError(err.message);
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!offer || offer.status !== 'accepted') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-500" />
            <div>
              <h3 className="font-medium text-yellow-800 dark:text-yellow-300">Offer Not Accepted</h3>
              <p className="text-yellow-700 dark:text-yellow-400">
                Please ensure the candidate has accepted the conditional offer before proceeding with sanction clearance.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = {
    pending: { bg: 'bg-gray-100', text: 'text-gray-700', icon: Shield },
    checking: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Search },
    cleared: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
    flagged: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
  };

  const StatusIcon = statusConfig[sanction?.status]?.icon || Shield;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">UN Sanction List Clearance</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Verify candidate against UN sanction lists</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
            <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${statusConfig[sanction?.status]?.bg} ${statusConfig[sanction?.status]?.text}`}>
              <StatusIcon className="w-4 h-4" />
              {sanction?.status}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <p className="text-blue-800 dark:text-blue-300 font-medium">About Sanction Clearance</p>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
              This step verifies the candidate against the UN Security Council Consolidated List to ensure
              compliance with international sanctions. All candidates must be cleared before proceeding with employment.
            </p>
            <a
              href="https://www.un.org/securitycouncil/content/un-sc-consolidated-list"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2"
            >
              <ExternalLink className="w-4 h-4" /> UN SC Consolidated List
            </a>
          </div>
        </div>
      </div>

      {/* Candidate Details Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Candidate Information for Verification</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name (as per ID) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={sanction?.candidateFullName || ''}
              onChange={(e) => handleChange('candidateFullName', e.target.value)}
              disabled={sanction?.status === 'cleared'}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Father's Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={sanction?.fatherName || ''}
              onChange={(e) => handleChange('fatherName', e.target.value)}
              disabled={sanction?.status === 'cleared'}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
              placeholder="Enter father's name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
            <input
              type="date"
              value={sanction?.dateOfBirth || ''}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              disabled={sanction?.status === 'cleared'}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nationality</label>
            <input
              type="text"
              value={sanction?.nationality || ''}
              onChange={(e) => handleChange('nationality', e.target.value)}
              disabled={sanction?.status === 'cleared'}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
              placeholder="e.g., Afghan"
            />
          </div>
        </div>

        {sanction?.checkedDate && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last checked: {new Date(sanction.checkedDate).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Result Display */}
      {sanction?.status === 'cleared' && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">Sanction Check Cleared</h3>
              <p className="text-green-700 dark:text-green-400">
                The candidate has been verified and is not found on the UN Sanction List.
                You may proceed with background checks.
              </p>
            </div>
          </div>
        </div>
      )}

      {sanction?.status === 'flagged' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">Potential Match Found</h3>
              <p className="text-red-700 dark:text-red-400">
                A potential match was found on the sanction list. This requires further review by the
                compliance team before proceeding. The recruitment process cannot continue until this is resolved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {canEdit && sanction?.status !== 'cleared' && (
        <div className="flex justify-end gap-3">
          <button
            onClick={handleSave}
            disabled={checking}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Save
          </button>
          <button
            onClick={handleRunCheck}
            disabled={checking || !sanction?.candidateFullName || !sanction?.fatherName}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {checking ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Checking...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" /> Run Sanction Check
              </>
            )}
          </button>
          {sanction?.status === 'flagged' && (
            <button
              onClick={handleManualClear}
              disabled={checking}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4" /> Manual Override (Clear)
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Step13Sanction;
