import { useState, useEffect } from 'react';
import { ListFilter, CheckCircle, X, AlertCircle, Edit3 } from 'lucide-react';
import { longlistingDB, longlistingCandidateDB, applicationDB } from '../../../services/db/recruitmentService';

const Step7Longlisting = ({ recruitment, onAdvance, isCurrentStep }) => {
  const [longlisting, setLonglisting] = useState(null);
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
        let existing = await longlistingDB.getByRecruitmentId(recruitment.id);
        if (!existing) {
          existing = await longlistingDB.create({ recruitmentId: recruitment.id, criteriaNotes: 'Minimum requirements check' });
        }
        setLonglisting(existing);

        const apps = await applicationDB.getByRecruitmentId(recruitment.id);
        let llCandidates = await longlistingCandidateDB.getByLonglistingId(existing.id);

        if (llCandidates.length === 0 && apps.length > 0) {
          await longlistingCandidateDB.bulkCreate(apps.map(app => ({
            longlistingId: existing.id,
            candidateApplicationId: app.id,
            meetsEducation: false,
            meetsExperience: false,
            meetsLanguage: false,
            meetsOtherCriteria: false,
            isLonglisted: false,
          })));
          llCandidates = await longlistingCandidateDB.getByLonglistingId(existing.id);
        }
        setCandidates(llCandidates);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [recruitment.id]);

  const handleToggle = async (id, field) => {
    setSaving(true);
    try {
      const candidate = candidates.find(c => c.id === id);
      const newValue = !candidate[field];
      await longlistingCandidateDB.update(id, { [field]: newValue });
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, [field]: newValue } : c));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLonglist = async (id, value) => {
    setSaving(true);
    try {
      await longlistingCandidateDB.update(id, { isLonglisted: value });
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, isLonglisted: value } : c));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (longlisting && onAdvance) {
      await longlistingDB.complete(longlisting.id);
      await onAdvance();
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;

  const longlisted = candidates.filter(c => c.isLonglisted).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
              <ListFilter className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Longlisting</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Evaluate candidates against minimum criteria ({longlisted}/{candidates.length} longlisted)
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
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Education</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Experience</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Language</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Other</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Longlist</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {candidates.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">App #{c.candidateApplicationId}</td>
                {['meetsEducation', 'meetsExperience', 'meetsLanguage', 'meetsOtherCriteria'].map(field => (
                  <td key={field} className="px-4 py-3 text-center">
                    <button onClick={() => handleToggle(c.id, field)} disabled={saving || !canEdit}
                      className={`w-6 h-6 rounded ${c[field] ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                      {c[field] ? <CheckCircle className="w-4 h-4 mx-auto" /> : ''}
                    </button>
                  </td>
                ))}
                <td className="px-4 py-3 text-center">
                  <button onClick={() => handleLonglist(c.id, !c.isLonglisted)} disabled={saving || !canEdit}
                    className={`px-3 py-1 rounded text-sm ${c.isLonglisted ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600'}`}>
                    {c.isLonglisted ? 'Yes' : 'No'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isCurrentStep && longlisted > 0 && (
        <div className="flex justify-end">
          <button onClick={handleComplete} className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <CheckCircle className="w-4 h-4" /> Complete & Proceed to Shortlisting
          </button>
        </div>
      )}
    </div>
  );
};

export default Step7Longlisting;
