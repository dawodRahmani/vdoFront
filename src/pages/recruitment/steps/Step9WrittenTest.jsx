import { useState, useEffect } from 'react';
import { FileQuestion, CheckCircle, AlertCircle, Edit3, X } from 'lucide-react';
import { writtenTestDB, writtenTestCandidateDB, shortlistingCandidateDB, shortlistingDB } from '../../../services/db/recruitmentService';

const Step9WrittenTest = ({ recruitment, onAdvance, isCurrentStep }) => {
  const [test, setTest] = useState(null);
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
        let existing = await writtenTestDB.getByRecruitmentId(recruitment.id);
        if (!existing) {
          existing = await writtenTestDB.create({
            recruitmentId: recruitment.id,
            testDate: new Date().toISOString(),
            testVenue: 'VDO Main Office',
            durationMinutes: 120,
          });
        }
        setTest(existing);

        let testCandidates = await writtenTestCandidateDB.getByTestId(existing.id);
        if (testCandidates.length === 0) {
          const sl = await shortlistingDB.getByRecruitmentId(recruitment.id);
          if (sl) {
            const slCandidates = await shortlistingCandidateDB.getByShortlistingId(sl.id);
            const shortlisted = slCandidates.filter(c => c.isShortlisted);
            for (const sc of shortlisted) {
              await writtenTestCandidateDB.create({
                writtenTestId: existing.id,
                candidateApplicationId: sc.candidateApplicationId,
              });
            }
            testCandidates = await writtenTestCandidateDB.getByTestId(existing.id);
          }
        }
        setCandidates(testCandidates);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [recruitment.id]);

  const handleAttendance = async (id) => {
    setSaving(true);
    try {
      await writtenTestCandidateDB.recordAttendance(id);
      const updated = await writtenTestCandidateDB.getByTestId(test.id);
      setCandidates(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleScoreChange = async (id, value) => {
    const marks = Math.min(100, Math.max(0, parseInt(value) || 0));
    setSaving(true);
    try {
      await writtenTestCandidateDB.submitScore(id, marks, test);
      const updated = await writtenTestCandidateDB.getByTestId(test.id);
      setCandidates(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    const passed = candidates.filter(c => c.isPassed);
    if (passed.length > 0 && onAdvance) {
      await writtenTestDB.complete(test.id);
      await onAdvance();
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;

  const passed = candidates.filter(c => c.isPassed).length;
  const attended = candidates.filter(c => c.attended).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <FileQuestion className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Written Test</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Attendance: {attended}/{candidates.length} | Passed: {passed}
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Attended</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Score (/100)</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {candidates.map((c) => (
              <tr key={c.id} className={c.isPassed ? 'bg-green-50 dark:bg-green-900/10' : ''}>
                <td className="px-4 py-3 font-mono text-sm text-blue-600">{c.uniqueCode}</td>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">App #{c.candidateApplicationId}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => handleAttendance(c.id)} disabled={c.attended || !canEdit || saving}
                    className={`px-3 py-1 rounded text-sm ${c.attended ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {c.attended ? 'Present' : 'Mark'}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <input type="number" min="0" max="100" value={c.marksObtained || 0}
                    onChange={(e) => handleScoreChange(c.id, e.target.value)}
                    disabled={!c.attended || !canEdit}
                    className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700" />
                </td>
                <td className="px-4 py-3 text-center">
                  {c.isPassed !== null && (
                    <span className={`px-2 py-1 rounded text-xs ${c.isPassed ? 'bg-green-600 text-white' : 'bg-red-100 text-red-700'}`}>
                      {c.isPassed ? 'Passed' : 'Failed'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isCurrentStep && passed > 0 && (
        <div className="flex justify-end">
          <button onClick={handleComplete} className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <CheckCircle className="w-4 h-4" /> Complete & Proceed to Interview
          </button>
        </div>
      )}
    </div>
  );
};

export default Step9WrittenTest;
