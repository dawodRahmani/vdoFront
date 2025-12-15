import { useState, useEffect } from 'react';
import { Plus, Search, Users, UserPlus, Eye, CheckCircle, AlertCircle, Edit3, X } from 'lucide-react';
import { candidateDB, applicationDB, educationDB, experienceDB, EDUCATION_LEVEL } from '../../../services/db/recruitmentService';
import { ApplicationStatusBadge } from '../../../components/recruitment/StatusBadge';
import Modal from '../../../components/Modal';

const Step5Applications = ({ recruitment, onAdvance, isCurrentStep }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const canEdit = editMode || isCurrentStep;
  const showEditButton = !isCurrentStep && !editMode;

  const [formData, setFormData] = useState({
    fullName: '',
    fatherName: '',
    gender: 'male',
    dateOfBirth: '',
    nationalId: '',
    email: '',
    phonePrimary: '',
    currentAddress: '',
    applicationMethod: 'direct',
    // Education
    degree: EDUCATION_LEVEL.BACHELORS,
    specialization: '',
    institutionName: '',
    graduationYear: '',
    // Experience
    organizationName: '',
    positionTitle: '',
    yearsExperience: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const apps = await applicationDB.getByRecruitmentId(recruitment.id);
        // Enrich with candidate data
        const enriched = await Promise.all(
          apps.map(async (app) => {
            const candidate = await candidateDB.getById(app.candidateId);
            return { ...app, candidate };
          })
        );
        setApplications(enriched);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [recruitment.id]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleAddApplication = async () => {
    setSaving(true);
    setError(null);
    try {
      // Create candidate
      const candidate = await candidateDB.create({
        fullName: formData.fullName,
        fatherName: formData.fatherName,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        nationalId: formData.nationalId,
        email: formData.email,
        phonePrimary: formData.phonePrimary,
        currentAddress: formData.currentAddress,
      });

      // Add education
      if (formData.institutionName) {
        await educationDB.create({
          candidateId: candidate.id,
          degree: formData.degree,
          specialization: formData.specialization,
          institutionName: formData.institutionName,
          graduationYear: formData.graduationYear,
        });
      }

      // Add experience
      if (formData.organizationName) {
        await experienceDB.create({
          candidateId: candidate.id,
          organizationName: formData.organizationName,
          positionTitle: formData.positionTitle,
          startDate: new Date().toISOString().split('T')[0],
          isCurrent: false,
        });
      }

      // Create application
      await applicationDB.create({
        candidateId: candidate.id,
        recruitmentId: recruitment.id,
        applicationMethod: formData.applicationMethod,
        gender: formData.gender,
      }, recruitment.recruitmentCode);

      // Refresh list
      const apps = await applicationDB.getByRecruitmentId(recruitment.id);
      const enriched = await Promise.all(
        apps.map(async (app) => {
          const cand = await candidateDB.getById(app.candidateId);
          return { ...app, candidate: cand };
        })
      );
      setApplications(enriched);

      setShowAddModal(false);
      setFormData({
        fullName: '',
        fatherName: '',
        gender: 'male',
        dateOfBirth: '',
        nationalId: '',
        email: '',
        phonePrimary: '',
        currentAddress: '',
        applicationMethod: 'direct',
        degree: EDUCATION_LEVEL.BACHELORS,
        specialization: '',
        institutionName: '',
        graduationYear: '',
        organizationName: '',
        positionTitle: '',
        yearsExperience: 0,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAdvanceStep = async () => {
    if (applications.length > 0 && onAdvance) {
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

  const stats = {
    total: applications.length,
    male: applications.filter(a => a.gender === 'male' || a.candidate?.gender === 'male').length,
    female: applications.filter(a => a.gender === 'female' || a.candidate?.gender === 'female').length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Application Receipt & Tracking
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage candidate applications for this recruitment
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
            {canEdit && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <UserPlus className="w-4 h-4" />
                Add Application
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Applications</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Male</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.male}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Female</p>
          <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">{stats.female}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Applications List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {applications.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
              No applications yet
            </h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Start adding candidate applications
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 font-mono text-sm text-blue-600">{app.applicationCode}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    {app.candidate?.fullName || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 capitalize">
                    {app.candidate?.gender || app.gender}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{app.candidate?.email || '-'}</td>
                  <td className="px-4 py-3">
                    <ApplicationStatusBadge status={app.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(app.applicationDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Advance Button */}
      {isCurrentStep && applications.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleAdvanceStep}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4" />
            Close Applications & Form Committee
          </button>
        </div>
      )}

      {/* Add Application Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Application">
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Father Name</label>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input
                type="tel"
                name="phonePrimary"
                value={formData.phonePrimary}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">National ID (Tazkira)</label>
              <input
                type="text"
                name="nationalId"
                value={formData.nationalId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <h4 className="font-medium text-gray-900 dark:text-white pt-2">Education</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Degree</label>
              <select
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {Object.entries(EDUCATION_LEVEL).map(([key, value]) => (
                  <option key={value} value={value}>{key.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Institution</label>
              <input
                type="text"
                name="institutionName"
                value={formData.institutionName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleAddApplication}
              disabled={saving || !formData.fullName}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Add Application'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Step5Applications;
