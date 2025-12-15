import { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, AlertCircle, Star, Edit3, X } from 'lucide-react';
import { interviewDB, interviewCandidateDB, evaluationDB, interviewResultDB, writtenTestCandidateDB, writtenTestDB, RECOMMENDATION } from '../../../services/db/recruitmentService';

const Step10Interview = ({ recruitment, onAdvance, isCurrentStep }) => {
  const [interview, setInterview] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [scores, setScores] = useState({ technicalKnowledgeScore: 3, communicationScore: 3, problemSolvingScore: 3, experienceRelevanceScore: 3, culturalFitScore: 3, recommendation: RECOMMENDATION.RECOMMEND });
  const [editMode, setEditMode] = useState(false);

  const canEdit = editMode || isCurrentStep;
  const showEditButton = !isCurrentStep && !editMode;

  useEffect(() => {
    const load = async () => {
      try {
        let existing = await interviewDB.getByRecruitmentId(recruitment.id);
        if (!existing) {
          existing = await interviewDB.create({
            recruitmentId: recruitment.id,
            interviewDate: new Date().toISOString(),
            interviewVenue: 'VDO Conference Room',
            interviewMethod: 'in_person',
          });
        }
        setInterview(existing);

        let intCandidates = await interviewCandidateDB.getByInterviewId(existing.id);
        if (intCandidates.length === 0) {
          const test = await writtenTestDB.getByRecruitmentId(recruitment.id);
          if (test) {
            const testCandidates = await writtenTestCandidateDB.getByTestId(test.id);
            const passed = testCandidates.filter(c => c.isPassed);
            for (const tc of passed) {
              await interviewCandidateDB.create({
                interviewId: existing.id,
                candidateApplicationId: tc.candidateApplicationId,
              });
            }
            intCandidates = await interviewCandidateDB.getByInterviewId(existing.id);
          }
        }
        setCandidates(intCandidates);
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
      await interviewCandidateDB.recordAttendance(id);
      const updated = await interviewCandidateDB.getByInterviewId(interview.id);
      setCandidates(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEvaluate = async () => {
    if (!selectedCandidate) return;
    setSaving(true);
    try {
      await evaluationDB.create({
        interviewCandidateId: selectedCandidate.id,
        evaluatorId: 1,
        ...scores,
      });
      await interviewResultDB.calculateAndSave(selectedCandidate.id, null, 0.5, 0.5);
      setSelectedCandidate(null);
      setScores({ technicalKnowledgeScore: 3, communicationScore: 3, problemSolvingScore: 3, experienceRelevanceScore: 3, culturalFitScore: 3, recommendation: RECOMMENDATION.RECOMMEND });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (onAdvance) {
      await interviewResultDB.rankCandidates(interview.id);
      await interviewDB.complete(interview.id);
      await onAdvance();
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
              <MessageSquare className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Interview</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Conduct interviews and evaluate candidates</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4">Candidates</h3>
          <div className="space-y-2">
            {candidates.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">App #{c.candidateApplicationId}</p>
                  <p className="text-xs text-gray-500">{c.attended ? 'Attended' : 'Not attended'}</p>
                </div>
                <div className="flex gap-2">
                  {!c.attended && canEdit && (
                    <button onClick={() => handleAttendance(c.id)} disabled={saving}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded">Attend</button>
                  )}
                  {c.attended && canEdit && (
                    <button onClick={() => setSelectedCandidate(c)} className="px-2 py-1 text-xs bg-green-600 text-white rounded">Evaluate</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedCandidate && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Evaluate App #{selectedCandidate.candidateApplicationId}</h3>
            <div className="space-y-4">
              {['technicalKnowledgeScore', 'communicationScore', 'problemSolvingScore', 'experienceRelevanceScore', 'culturalFitScore'].map((field) => (
                <div key={field} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{field.replace(/Score|([A-Z])/g, ' $1').trim()}</span>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((n) => (
                      <button key={n} onClick={() => setScores(prev => ({ ...prev, [field]: n }))}
                        className={`p-1 ${scores[field] >= n ? 'text-yellow-500' : 'text-gray-300'}`}>
                        <Star className="w-5 h-5" fill={scores[field] >= n ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="pt-2 flex gap-3">
                <button onClick={() => setSelectedCandidate(null)} className="px-3 py-1 border border-gray-300 rounded">Cancel</button>
                <button onClick={handleEvaluate} disabled={saving} className="px-3 py-1 bg-blue-600 text-white rounded">Save Evaluation</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isCurrentStep && candidates.some(c => c.attended) && (
        <div className="flex justify-end">
          <button onClick={handleComplete} className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <CheckCircle className="w-4 h-4" /> Complete & Generate Report
          </button>
        </div>
      )}
    </div>
  );
};

export default Step10Interview;
