import { useState, useEffect } from 'react';
import { FileText, CheckCircle, AlertCircle, Send, Edit3, X } from 'lucide-react';
import { reportDB, applicationDB, interviewResultDB } from '../../../services/db/recruitmentService';

const Step11Report = ({ recruitment, onAdvance, isCurrentStep }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const canEdit = editMode || isCurrentStep;
  const showEditButton = !isCurrentStep && !editMode;

  useEffect(() => {
    const load = async () => {
      try {
        let existing = await reportDB.getByRecruitmentId(recruitment.id);
        if (!existing) {
          const apps = await applicationDB.getByRecruitmentId(recruitment.id);
          const stats = await applicationDB.getStatsByRecruitment(recruitment.id);
          existing = await reportDB.create({
            recruitmentId: recruitment.id,
            positionTitle: recruitment.positionTitle,
            announcementStartDate: new Date().toISOString().split('T')[0],
            announcementEndDate: new Date().toISOString().split('T')[0],
            announcementMethods: ['acbar', 'website'],
            totalApplications: stats.total,
            totalMaleApplications: stats.male,
            totalFemaleApplications: stats.female,
            longlistingCriteria: 'Minimum education and experience requirements',
            longlistedCount: Math.floor(stats.total * 0.7),
            shortlistingCriteria: 'Weighted scoring on academic, experience, and other criteria',
            shortlistedCount: Math.floor(stats.total * 0.3),
            interviewDates: [new Date().toISOString().split('T')[0]],
            interviewMethod: 'in_person',
            committeeRecommendation: 'The committee recommends the top candidate for the position.',
          });
        }
        setReport(existing);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [recruitment.id, recruitment.positionTitle]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await reportDB.submit(report.id);
      const updated = await reportDB.getByRecruitmentId(recruitment.id);
      setReport(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    setSaving(true);
    try {
      await reportDB.approve(report.id, 1);
      const updated = await reportDB.getByRecruitmentId(recruitment.id);
      setReport(updated);
      if (onAdvance) await onAdvance();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recruitment Report</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Report #{report?.reportNumber}</p>
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
            <span className={`px-3 py-1 rounded-full text-sm ${
              report?.status === 'approved' ? 'bg-green-100 text-green-700' :
              report?.status === 'submitted' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
            }`}>{report?.status}</span>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-500" /><p className="text-red-700 dark:text-red-400">{error}</p>
      </div>}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div><span className="text-gray-500 text-sm">Position:</span><p className="font-medium text-gray-900 dark:text-white">{report?.positionTitle}</p></div>
          <div><span className="text-gray-500 text-sm">Total Applications:</span><p className="font-medium text-gray-900 dark:text-white">{report?.totalApplications}</p></div>
          <div><span className="text-gray-500 text-sm">Male/Female:</span><p className="font-medium text-gray-900 dark:text-white">{report?.totalMaleApplications} / {report?.totalFemaleApplications}</p></div>
          <div><span className="text-gray-500 text-sm">Shortlisted:</span><p className="font-medium text-gray-900 dark:text-white">{report?.shortlistedCount}</p></div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Committee Recommendation</h4>
          <p className="text-gray-600 dark:text-gray-400">{report?.committeeRecommendation}</p>
        </div>
      </div>

      {canEdit && (
        <div className="flex justify-end gap-3">
          {report?.status === 'draft' && (
            <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Send className="w-4 h-4" /> Submit for Approval
            </button>
          )}
          {report?.status === 'submitted' && (
            <button onClick={handleApprove} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <CheckCircle className="w-4 h-4" /> Approve & Proceed to Offer
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Step11Report;
