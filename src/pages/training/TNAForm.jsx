import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { tnaService } from '../../services/db/trainingService';
import { getDB } from '../../services/db/indexedDB';

const SCORE_OPTIONS = [
  { value: 1, label: '1 - Very Weak' },
  { value: 2, label: '2 - Weak' },
  { value: 3, label: '3 - Average' },
  { value: 4, label: '4 - Good' },
  { value: 5, label: '5 - Excellent' },
];

const COMPETENCY_SECTIONS = [
  {
    title: 'Core Job Performance',
    fields: [
      { key: 'jobKnowledgeScore', label: 'Job Knowledge' },
      { key: 'qualityOfWorkScore', label: 'Quality of Work' },
      { key: 'productivityScore', label: 'Productivity' },
      { key: 'fieldManagementScore', label: 'Field Management' },
    ],
  },
  {
    title: 'Communication & Language',
    fields: [
      { key: 'localLanguageScore', label: 'Local Language (Dari/Pashto)' },
      { key: 'englishScore', label: 'English Proficiency' },
      { key: 'communicationScore', label: 'Communication Skills' },
    ],
  },
  {
    title: 'Interpersonal Skills',
    fields: [
      { key: 'teamworkScore', label: 'Teamwork' },
      { key: 'initiativeScore', label: 'Initiative' },
      { key: 'publicRelationsScore', label: 'Public Relations' },
      { key: 'punctualityScore', label: 'Punctuality' },
      { key: 'adaptabilityScore', label: 'Adaptability' },
    ],
  },
  {
    title: 'Overall Performance',
    fields: [{ key: 'overallPerformanceScore', label: 'Overall Performance' }],
  },
  {
    title: 'Compliance & Safeguarding',
    fields: [
      { key: 'aapScore', label: 'AAP (Accountability to Affected Populations)' },
      { key: 'pseahScore', label: 'PSEAH' },
      { key: 'safeguardingScore', label: 'Safeguarding' },
      { key: 'childProtectionScore', label: 'Child Protection' },
      { key: 'codeOfConductScore', label: 'Code of Conduct' },
      { key: 'confidentialityScore', label: 'Confidentiality' },
    ],
  },
  {
    title: 'Organizational Competencies',
    fields: [
      { key: 'policyAdherenceScore', label: 'Policy Adherence' },
      { key: 'conflictManagementScore', label: 'Conflict Management' },
      { key: 'expertiseScore', label: 'Technical Expertise' },
      { key: 'commitmentScore', label: 'Commitment' },
      { key: 'sustainabilityScore', label: 'Sustainability Awareness' },
      { key: 'behaviorScore', label: 'Professional Behavior' },
    ],
  },
];

const TNAForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    assessmentDate: new Date().toISOString().split('T')[0],
    assessmentPeriod: new Date().getFullYear().toString(),
    trainingPriority: 'medium',
    suggestedTrainingDate: '',
    remarks: '',
    status: 'draft',
    // Initialize all score fields
    ...COMPETENCY_SECTIONS.flatMap((s) => s.fields).reduce((acc, field) => {
      acc[field.key] = 3; // Default to "Average"
      return acc;
    }, {}),
  });

  const [calculatedScores, setCalculatedScores] = useState({
    totalScore: 0,
    maxScore: 125,
    percentageScore: 0,
    trainingLevel: 'regular',
  });

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    const scores = tnaService.calculateScores(formData);
    setCalculatedScores(scores);
  }, [formData]);

  const loadData = async () => {
    try {
      setLoading(true);
      const db = await getDB();
      const employeeData = await db.getAll('employees');
      setEmployees(employeeData);

      if (id) {
        const tna = await tnaService.getById(parseInt(id));
        if (tna) {
          setFormData({
            ...tna,
            employeeId: tna.employeeId || '',
            assessmentDate: tna.assessmentDate || new Date().toISOString().split('T')[0],
            assessmentPeriod: tna.assessmentPeriod || new Date().getFullYear().toString(),
          });
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: parseInt(value),
    }));
  };

  const handleSubmit = async (e, submitForReview = false) => {
    e.preventDefault();
    try {
      setSaving(true);
      const data = {
        ...formData,
        employeeId: parseInt(formData.employeeId),
        status: submitForReview ? 'submitted' : formData.status,
      };

      if (isEditing) {
        await tnaService.update(parseInt(id), data);
      } else {
        await tnaService.create(data);
      }
      navigate('/training/tna');
    } catch (error) {
      console.error('Error saving TNA:', error);
      alert('Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  const getLevelLabel = (level) => {
    const labels = {
      complete: 'Complete Training Required (Very Weak)',
      targeted: 'Multiple Targeted Trainings (Average)',
      regular: 'Regular Trainings (Good)',
      refresher: 'Refresher Only (Proficient)',
      expert: 'Expert - Can be Trainer',
    };
    return labels[level] || level;
  };

  const getLevelColor = (level) => {
    const colors = {
      complete: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
      targeted: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
      regular: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
      refresher: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
      expert: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
    };
    return colors[level] || '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/training/tna')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to TNA List
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Edit Training Needs Assessment' : 'New Training Needs Assessment'}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Rate employee competencies on a scale of 1-5
        </p>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Employee *
              </label>
              <select
                required
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Assessment Date *
              </label>
              <input
                type="date"
                required
                value={formData.assessmentDate}
                onChange={(e) => setFormData({ ...formData, assessmentDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Assessment Period *
              </label>
              <input
                type="text"
                required
                value={formData.assessmentPeriod}
                onChange={(e) => setFormData({ ...formData, assessmentPeriod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2025"
              />
            </div>
          </div>
        </div>

        {/* Score Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Score Summary
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Based on 25 competencies rated 1-5
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {calculatedScores.totalScore}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  of {calculatedScores.maxScore}
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {calculatedScores.percentageScore}%
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Score</p>
              </div>
              <div
                className={`px-4 py-2 rounded-lg text-center ${getLevelColor(
                  calculatedScores.trainingLevel
                )}`}
              >
                <p className="font-semibold">{getLevelLabel(calculatedScores.trainingLevel)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Competency Sections */}
        {COMPETENCY_SECTIONS.map((section) => (
          <div key={section.title} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {section.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.fields.map((field) => (
                <div key={field.key} className="flex items-center justify-between gap-4">
                  <label className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                    {field.label}
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => handleScoreChange(field.key, score)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                          formData[field.key] === score
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Action Plan */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Action Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Training Priority
              </label>
              <select
                value={formData.trainingPriority}
                onChange={(e) => setFormData({ ...formData, trainingPriority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Suggested Training Date
              </label>
              <input
                type="date"
                value={formData.suggestedTrainingDate}
                onChange={(e) =>
                  setFormData({ ...formData, suggestedTrainingDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Remarks / Recommended Trainings
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Note specific training needs, observations, or recommendations..."
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/training/tna')}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Save as Draft
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            Submit for Review
          </button>
        </div>
      </form>
    </div>
  );
};

export default TNAForm;
