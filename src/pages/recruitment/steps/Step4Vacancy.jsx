import { useState, useEffect } from 'react';
import { Save, Send, Globe, CheckCircle, AlertCircle, Edit3, X } from 'lucide-react';
import { vacancyDB, ANNOUNCEMENT_METHOD } from '../../../services/db/recruitmentService';

const Step4Vacancy = ({ recruitment, onAdvance, isCurrentStep }) => {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const hasPublished = vacancies.some(v => v.status === 'published');
  const canEdit = editMode || isCurrentStep;
  const showEditButton = !isCurrentStep && !editMode;

  const [formData, setFormData] = useState({
    announcementTitle: `${recruitment.positionTitle || 'Position'} - ${recruitment.recruitmentCode}`,
    announcementMethod: ANNOUNCEMENT_METHOD.ACBAR,
    externalLink: '',
    closingDate: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const existing = await vacancyDB.getByRecruitmentId(recruitment.id);
        setVacancies(existing || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [recruitment.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const data = {
        ...formData,
        recruitmentId: recruitment.id,
      };
      await vacancyDB.create(data);
      const updated = await vacancyDB.getByRecruitmentId(recruitment.id);
      setVacancies(updated);
      setFormData({
        announcementTitle: '',
        announcementMethod: ANNOUNCEMENT_METHOD.ACBAR,
        externalLink: '',
        closingDate: '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (id) => {
    setSaving(true);
    try {
      await vacancyDB.publish(id);
      const updated = await vacancyDB.getByRecruitmentId(recruitment.id);
      setVacancies(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAdvanceStep = async () => {
    const hasPublished = vacancies.some(v => v.status === 'published');
    if (hasPublished && onAdvance) {
      await onAdvance();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Vacancy Announcement
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create and publish job announcements across multiple channels
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

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Existing Announcements */}
      {vacancies.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Created Announcements
          </h3>
          <div className="space-y-3">
            {vacancies.map((vacancy) => (
              <div
                key={vacancy.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {vacancy.announcementTitle}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {vacancy.announcementMethod?.toUpperCase()} - {vacancy.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  {vacancy.status === 'draft' && (
                    <button
                      onClick={() => handlePublish(vacancy.id)}
                      disabled={saving}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                    >
                      Publish
                    </button>
                  )}
                  {vacancy.status === 'published' && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                      Published
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Announcement Form */}
      {canEdit && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Add New Announcement
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Announcement Title
              </label>
              <input
                type="text"
                name="announcementTitle"
                value={formData.announcementTitle}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Announcement Channel
              </label>
              <select
                name="announcementMethod"
                value={formData.announcementMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {Object.entries(ANNOUNCEMENT_METHOD).map(([key, value]) => (
                  <option key={value} value={value}>
                    {key.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Closing Date
              </label>
              <input
                type="date"
                name="closingDate"
                value={formData.closingDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                External Link (Optional)
              </label>
              <input
                type="url"
                name="externalLink"
                value={formData.externalLink}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              Add Announcement
            </button>
          </div>
        </div>
      )}

      {/* Advance Button */}
      {isCurrentStep && hasPublished && (
        <div className="flex justify-end">
          <button
            onClick={handleAdvanceStep}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4" />
            Complete & Proceed to Applications
          </button>
        </div>
      )}
    </div>
  );
};

export default Step4Vacancy;
