import { useState, useEffect } from 'react';
import { Mail, Send, CheckCircle, XCircle, AlertCircle, Clock, User, Edit3, X } from 'lucide-react';
import { offerDB, interviewResultDB } from '../../../services/db/recruitmentService';

const Step12Offer = ({ recruitment, onAdvance, isCurrentStep }) => {
  const [offer, setOffer] = useState(null);
  const [topCandidate, setTopCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const canEdit = editMode || isCurrentStep;
  const showEditButton = !isCurrentStep && !editMode;

  useEffect(() => {
    const load = async () => {
      try {
        // Get top candidate from interview results
        const results = await interviewResultDB.getByRecruitmentId(recruitment.id);
        const recommended = results.find(r => r.recommendation === 'hire');
        setTopCandidate(recommended);

        // Check for existing offer
        let existing = await offerDB.getByRecruitmentId(recruitment.id);
        if (!existing && recommended) {
          existing = await offerDB.create({
            recruitmentId: recruitment.id,
            candidateId: recommended.candidateId,
            applicationId: recommended.applicationId,
            positionTitle: recruitment.positionTitle,
            salary: 0,
            startDate: '',
            expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            conditions: 'Subject to background check clearance and sanction verification.',
            benefits: 'Standard benefits package as per VDO policy.',
          });
        }
        setOffer(existing);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [recruitment.id, recruitment.positionTitle]);

  const handleChange = (field, value) => {
    setOffer(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await offerDB.update(offer.id, offer);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSendOffer = async () => {
    setSaving(true);
    try {
      await offerDB.send(offer.id);
      const updated = await offerDB.getByRecruitmentId(recruitment.id);
      setOffer(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAccept = async () => {
    setSaving(true);
    try {
      await offerDB.respond(offer.id, 'accepted');
      const updated = await offerDB.getByRecruitmentId(recruitment.id);
      setOffer(updated);
      if (onAdvance) await onAdvance();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDecline = async () => {
    setSaving(true);
    try {
      await offerDB.respond(offer.id, 'declined');
      const updated = await offerDB.getByRecruitmentId(recruitment.id);
      setOffer(updated);
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

  if (!topCandidate) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-500" />
            <div>
              <h3 className="font-medium text-yellow-800 dark:text-yellow-300">No Candidate Selected</h3>
              <p className="text-yellow-700 dark:text-yellow-400">
                Please complete the interview step and recommend a candidate for hire before proceeding with the offer.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = {
    draft: { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock },
    sent: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Send },
    accepted: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
    declined: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
  };

  const StatusIcon = statusConfig[offer?.status]?.icon || Clock;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conditional Offer Letter</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Offer #{offer?.offerNumber}</p>
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
            <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${statusConfig[offer?.status]?.bg} ${statusConfig[offer?.status]?.text}`}>
              <StatusIcon className="w-4 h-4" />
              {offer?.status}
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

      {/* Candidate Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Selected Candidate</h3>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Candidate #{topCandidate.candidateId}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Final Score: {topCandidate.finalScore}% • Rank: #{topCandidate.rank}
            </p>
          </div>
        </div>
      </div>

      {/* Offer Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Offer Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position</label>
            <input
              type="text"
              value={offer?.positionTitle || ''}
              onChange={(e) => handleChange('positionTitle', e.target.value)}
              disabled={offer?.status !== 'draft'}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Salary (AFN)</label>
            <input
              type="number"
              value={offer?.salary || ''}
              onChange={(e) => handleChange('salary', parseFloat(e.target.value))}
              disabled={offer?.status !== 'draft'}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
            <input
              type="date"
              value={offer?.startDate || ''}
              onChange={(e) => handleChange('startDate', e.target.value)}
              disabled={offer?.status !== 'draft'}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Offer Expiry Date</label>
            <input
              type="date"
              value={offer?.expiryDate || ''}
              onChange={(e) => handleChange('expiryDate', e.target.value)}
              disabled={offer?.status !== 'draft'}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Conditions</label>
          <textarea
            value={offer?.conditions || ''}
            onChange={(e) => handleChange('conditions', e.target.value)}
            disabled={offer?.status !== 'draft'}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Benefits</label>
          <textarea
            value={offer?.benefits || ''}
            onChange={(e) => handleChange('benefits', e.target.value)}
            disabled={offer?.status !== 'draft'}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
          />
        </div>
      </div>

      {/* Actions */}
      {canEdit && (
        <div className="flex justify-end gap-3">
          {offer?.status === 'draft' && (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Save Draft
              </button>
              <button
                onClick={handleSendOffer}
                disabled={saving || !offer?.salary || !offer?.startDate}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4" /> Send Offer
              </button>
            </>
          )}
          {offer?.status === 'sent' && (
            <>
              <button
                onClick={handleDecline}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <XCircle className="w-4 h-4" /> Mark as Declined
              </button>
              <button
                onClick={handleAccept}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4" /> Mark as Accepted
              </button>
            </>
          )}
        </div>
      )}

      {/* Acceptance Status */}
      {offer?.status === 'accepted' && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-300">Offer Accepted</p>
              <p className="text-sm text-green-700 dark:text-green-400">
                The candidate has accepted the conditional offer. Proceeding to sanction clearance.
              </p>
            </div>
          </div>
        </div>
      )}

      {offer?.status === 'declined' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-500" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-300">Offer Declined</p>
              <p className="text-sm text-red-700 dark:text-red-400">
                The candidate has declined the offer. Consider the next ranked candidate.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step12Offer;
