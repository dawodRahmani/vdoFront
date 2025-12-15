import { useState, useEffect } from 'react';
import { BarChart3, CheckCircle, AlertCircle, Edit3, X } from 'lucide-react';
import { shortlistingDB, shortlistingCandidateDB, longlistingCandidateDB, longlistingDB, DEFAULT_WEIGHTS } from '../../../services/db/recruitmentService';

const Step8Shortlisting = ({ recruitment, onAdvance, isCurrentStep }) => {
  const [shortlisting, setShortlisting] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const canEdit = editMode || isCurrentStep;
  const showEditButton = !isCurrentStep && !editMode;

  useEffect(() => {
    const load = async () => {
      try {
        let existing = await shortlistingDB.getByRecruitmentId(recruitment.id);
        if (!existing) {
          existing = await shortlistingDB.create({ recruitmentId: recruitment.id });
        }
        setShortlisting(existing);

        const slCandidates = await shortlistingCandidateDB.getByShortlistingId(existing.id);
        if (slCandidates.length === 0) {
          const ll = await longlistingDB.getByRecruitmentId(recruitment.id);
          if (ll) {
            const llCandidates = await longlistingCandidateDB.getByLonglistingId(ll.id);
            const longlisted = llCandidates.filter(c => c.isLonglisted);
            for (const lc of longlisted) {
              await shortlistingCandidateDB.create({
                shortlistingId: existing.id,
                candidateApplicationId: lc.candidateApplicationId,
                academicScore: 0,
                experienceScore: 0,
                otherCriteriaScore: 0,
              }, existing);
            }
          }
        }
        const updated = await shortlistingCandidateDB.getByShortlistingId(existing.id);
        setCandidates(updated);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [recruitment.id]);

  const handleScoreChange = async (id, field, value) => {
    const numValue = Math.min(100, Math.max(0, parseInt(value) || 0));
    setSaving(true);
    try {
      await shortlistingCandidateDB.update(id, { [field]: numValue }, shortlisting);
      const updated = await shortlistingCandidateDB.getByShortlistingId(shortlisting.id);
      setCandidates(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    const shortlisted = candidates.filter(c => c.isShortlisted);
    if (shortlisted.length > 0 && onAdvance) {
      await shortlistingDB.complete(shortlisting.id);
      await onAdvance();
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;

  const shortlisted = candidates.filter(c => c.isShortlisted).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
              <BarChart3 className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Shortlisting</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Score candidates (passing: 60%) - {shortlisted}/{candidates.length} shortlisted
              </p>
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
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-500" /><p className="text-red-700 dark:text-red-400">{error}</p>
      </div>}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Academic (20%)</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Experience (30%)</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Other (50%)</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {candidates.map((c) => (
              <tr key={c.id} className={c.isShortlisted ? 'bg-green-50 dark:bg-green-900/10' : ''}>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">App #{c.candidateApplicationId}</td>
                {['academicScore', 'experienceScore', 'otherCriteriaScore'].map(field => (
                  <td key={field} className="px-4 py-3 text-center">
                    <input type="number" min="0" max="100" value={c[field] || 0}
                      onChange={(e) => handleScoreChange(c.id, field, e.target.value)}
                      disabled={!canEdit}
                      className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </td>
                ))}
                <td className="px-4 py-3 text-center font-bold text-gray-900 dark:text-white">
                  {(c.totalScore || 0).toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${c.isShortlisted ? 'bg-green-600 text-white' : 'bg-red-100 text-red-700'}`}>
                    {c.isShortlisted ? 'Shortlisted' : 'Not Passed'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isCurrentStep && shortlisted > 0 && (
        <div className="flex justify-end">
          <button onClick={handleComplete} className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <CheckCircle className="w-4 h-4" /> Complete & Proceed to Written Test
          </button>
        </div>
      )}
    </div>
  );
};

export default Step8Shortlisting;
