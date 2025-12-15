import { useState, useEffect } from 'react';
import { UsersRound, Plus, CheckCircle, AlertCircle, Edit3, X } from 'lucide-react';
import { committeeDB, memberDB, coiDB, COMMITTEE_ROLE } from '../../../services/db/recruitmentService';

const Step6Committee = ({ recruitment, onAdvance, isCurrentStep }) => {
  const [committee, setCommittee] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const canEdit = editMode || isCurrentStep;
  const showEditButton = !isCurrentStep && !editMode;

  useEffect(() => {
    const load = async () => {
      try {
        const existing = await committeeDB.getByRecruitmentId(recruitment.id);
        if (existing) {
          setCommittee(existing);
          const membs = await memberDB.getByCommitteeId(existing.id);
          setMembers(membs);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [recruitment.id]);

  const handleCreateCommittee = async () => {
    setSaving(true);
    try {
      const newCommittee = await committeeDB.create({
        recruitmentId: recruitment.id,
        establishmentDate: new Date().toISOString().split('T')[0],
        purpose: `Selection committee for ${recruitment.positionTitle}`,
        preparedBy: 1,
      });
      setCommittee(newCommittee);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async (role) => {
    if (!committee) return;
    setSaving(true);
    try {
      await memberDB.create({
        committeeId: committee.id,
        userId: Math.floor(Math.random() * 100) + 1, // Demo user ID
        role,
        isChair: role === COMMITTEE_ROLE.HR_REPRESENTATIVE,
      });
      const membs = await memberDB.getByCommitteeId(committee.id);
      setMembers(membs);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (members.length >= 3 && onAdvance) {
      await committeeDB.update(committee.id, { status: 'coi_completed' });
      await onAdvance();
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <UsersRound className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recruitment Committee Formation</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Form the selection committee and complete COI declarations</p>
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

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" /><p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {!committee ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <UsersRound className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Committee Formed</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Create a recruitment committee to proceed</p>
          {canEdit && (
            <button onClick={handleCreateCommittee} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Create Committee
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">Committee Members ({members.length}/4)</h3>
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Member #{member.userId}</p>
                    <p className="text-sm text-gray-500 capitalize">{member.role?.replace(/_/g, ' ')}</p>
                  </div>
                  {member.isChair && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Chair</span>}
                </div>
              ))}
              {members.length < 4 && canEdit && (
                <div className="flex gap-2 flex-wrap pt-2">
                  {Object.values(COMMITTEE_ROLE).map((role) => (
                    <button key={role} onClick={() => handleAddMember(role)} disabled={saving}
                      className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Plus className="w-3 h-3" /> {role.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {isCurrentStep && members.length >= 3 && (
            <div className="flex justify-end">
              <button onClick={handleComplete} className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <CheckCircle className="w-4 h-4" /> Complete & Proceed to Longlisting
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Step6Committee;
