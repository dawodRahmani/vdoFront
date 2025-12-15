import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Save, Send, Star, User, Calendar, Target,
  Plus, Trash2, MessageSquare, FileText, CheckCircle, Clock,
  AlertCircle, Award, BookOpen, ChevronDown, ChevronRight
} from 'lucide-react';
import performanceService from '../../services/db/performanceService';
import { employeeDB } from '../../services/db/indexedDB';

const RATING_SCALE = [
  { value: 0, label: 'Not Rated', description: 'Not yet evaluated' },
  { value: 1, label: 'Unsatisfactory', description: 'Far below expectations' },
  { value: 2, label: 'Needs Improvement', description: 'Below expectations' },
  { value: 3, label: 'Basic', description: 'Meets minimum requirements' },
  { value: 4, label: 'Good', description: 'Meets expectations' },
  { value: 5, label: 'Outstanding', description: 'Exceeds expectations' }
];

const AppraisalForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [appraisal, setAppraisal] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [cycle, setCycle] = useState(null);
  const [template, setTemplate] = useState(null);
  const [sections, setSections] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [goals, setGoals] = useState([]);
  const [trainingNeeds, setTrainingNeeds] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});
  const [activeTab, setActiveTab] = useState('evaluation');
  const [reviewMode, setReviewMode] = useState('self'); // self, manager, committee

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const appraisalData = await performanceService.employeeAppraisals.getById(id);
      if (!appraisalData) {
        navigate('/hr/performance/appraisals');
        return;
      }
      setAppraisal(appraisalData);

      // Determine review mode based on status
      if (appraisalData.status === 'self_assessment') {
        setReviewMode('self');
      } else if (appraisalData.status === 'manager_review') {
        setReviewMode('manager');
      } else if (appraisalData.status === 'committee_review') {
        setReviewMode('committee');
      }

      const [employeeData, cycleData, templateData, ratingsData, goalsData, trainingData] = await Promise.all([
        employeeDB.getById(appraisalData.employeeId),
        performanceService.appraisalCycles.getById(appraisalData.cycleId),
        performanceService.appraisalTemplates.getById(appraisalData.templateId),
        performanceService.appraisalRatings.getAll(),
        performanceService.appraisalGoals.getAll(),
        performanceService.appraisalTrainingNeeds.getAll()
      ]);

      setEmployee(employeeData);
      setCycle(cycleData);
      setTemplate(templateData);

      // Load sections and criteria for the template
      if (templateData) {
        const [sectionsData, criteriaData] = await Promise.all([
          performanceService.appraisalSections.getAll(),
          performanceService.appraisalCriteria.getAll()
        ]);
        setSections(sectionsData.filter(s => s.templateId === templateData.id).sort((a, b) => a.sortOrder - b.sortOrder));
        setCriteria(criteriaData);

        // Expand all sections by default
        const expanded = {};
        sectionsData.filter(s => s.templateId === templateData.id).forEach(s => {
          expanded[s.id] = true;
        });
        setExpandedSections(expanded);
      }

      setRatings(ratingsData.filter(r => r.appraisalId === id));
      setGoals(goalsData.filter(g => g.appraisalId === id));
      setTrainingNeeds(trainingData.filter(t => t.appraisalId === id));
    } catch (error) {
      console.error('Error loading appraisal:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSectionCriteria = (sectionId) => {
    return criteria
      .filter(c => c.sectionId === sectionId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const getRating = (criteriaId) => {
    return ratings.find(r => r.criteriaId === criteriaId) || {};
  };

  const calculateSectionScore = (sectionId) => {
    const sectionCriteria = getSectionCriteria(sectionId);
    let totalScore = 0;
    let maxScore = 0;
    let ratedCount = 0;

    sectionCriteria.forEach(c => {
      const rating = getRating(c.id);
      const ratingValue = reviewMode === 'self'
        ? rating.selfRating
        : reviewMode === 'manager'
        ? rating.managerRating
        : rating.committeeRating;

      if (ratingValue && ratingValue > 0) {
        totalScore += (ratingValue / 5) * c.weight;
        ratedCount++;
      }
      maxScore += c.weight;
    });

    return {
      score: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0,
      rated: ratedCount,
      total: sectionCriteria.length
    };
  };

  const calculateTotalScore = () => {
    let totalScore = 0;
    let maxScore = 0;

    sections.forEach(section => {
      const sectionCriteria = getSectionCriteria(section.id);
      sectionCriteria.forEach(c => {
        const rating = getRating(c.id);
        const ratingValue = reviewMode === 'self'
          ? rating.selfRating
          : reviewMode === 'manager'
          ? rating.managerRating
          : rating.committeeRating;

        if (ratingValue && ratingValue > 0) {
          totalScore += (ratingValue / 5) * c.weight;
        }
        maxScore += c.weight;
      });
    });

    return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  };

  const handleRatingChange = async (criteriaId, value) => {
    const existingRating = getRating(criteriaId);
    const ratingData = {
      appraisalId: id,
      criteriaId,
      selfRating: reviewMode === 'self' ? value : (existingRating.selfRating || null),
      selfComment: existingRating.selfComment || '',
      managerRating: reviewMode === 'manager' ? value : (existingRating.managerRating || null),
      managerComment: existingRating.managerComment || '',
      committeeRating: reviewMode === 'committee' ? value : (existingRating.committeeRating || null),
      committeeComment: existingRating.committeeComment || ''
    };

    try {
      if (existingRating.id) {
        await performanceService.appraisalRatings.update(existingRating.id, ratingData);
      } else {
        await performanceService.appraisalRatings.create(ratingData);
      }
      await loadData();
    } catch (error) {
      console.error('Error saving rating:', error);
    }
  };

  const handleCommentChange = async (criteriaId, comment) => {
    const existingRating = getRating(criteriaId);
    const commentField = `${reviewMode}Comment`;

    const ratingData = {
      ...existingRating,
      appraisalId: id,
      criteriaId,
      [commentField]: comment
    };

    try {
      if (existingRating.id) {
        await performanceService.appraisalRatings.update(existingRating.id, ratingData);
      } else {
        await performanceService.appraisalRatings.create(ratingData);
      }
      // Don't reload data on every keystroke
    } catch (error) {
      console.error('Error saving comment:', error);
    }
  };

  const handleSaveProgress = async () => {
    setSaving(true);
    try {
      const totalScore = calculateTotalScore();
      const scoreField = `${reviewMode}AssessmentScore`;

      await performanceService.employeeAppraisals.update(id, {
        [scoreField]: totalScore
      });
      alert('Progress saved');
    } catch (error) {
      console.error('Error saving progress:', error);
      alert('Error saving progress');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    const totalScore = calculateTotalScore();

    // Check if all criteria are rated
    let allRated = true;
    sections.forEach(section => {
      const sectionCriteria = getSectionCriteria(section.id);
      sectionCriteria.forEach(c => {
        const rating = getRating(c.id);
        const ratingValue = reviewMode === 'self'
          ? rating.selfRating
          : reviewMode === 'manager'
          ? rating.managerRating
          : rating.committeeRating;
        if (!ratingValue || ratingValue === 0) {
          allRated = false;
        }
      });
    });

    if (!allRated) {
      if (!confirm('Some criteria are not rated. Do you want to continue?')) {
        return;
      }
    }

    try {
      setSaving(true);

      if (reviewMode === 'self') {
        await performanceService.submitSelfAssessment(id, totalScore);
      } else if (reviewMode === 'manager') {
        await performanceService.submitManagerReview(id, totalScore);
      } else if (reviewMode === 'committee') {
        await performanceService.submitCommitteeReview(id, totalScore);
      }

      alert('Submitted successfully');
      await loadData();
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Error submitting');
    } finally {
      setSaving(false);
    }
  };

  const addGoal = async () => {
    try {
      await performanceService.appraisalGoals.create({
        appraisalId: id,
        description: '',
        targetDate: null,
        status: 'pending',
        progress: 0
      });
      await loadData();
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const updateGoal = async (goalId, data) => {
    try {
      await performanceService.appraisalGoals.update(goalId, data);
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const deleteGoal = async (goalId) => {
    try {
      await performanceService.appraisalGoals.delete(goalId);
      await loadData();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const addTrainingNeed = async () => {
    try {
      await performanceService.appraisalTrainingNeeds.create({
        appraisalId: id,
        title: '',
        description: '',
        priority: 'medium',
        status: 'identified'
      });
      await loadData();
    } catch (error) {
      console.error('Error adding training need:', error);
    }
  };

  const updateTrainingNeed = async (needId, data) => {
    try {
      await performanceService.appraisalTrainingNeeds.update(needId, data);
    } catch (error) {
      console.error('Error updating training need:', error);
    }
  };

  const deleteTrainingNeed = async (needId) => {
    try {
      await performanceService.appraisalTrainingNeeds.delete(needId);
      await loadData();
    } catch (error) {
      console.error('Error deleting training need:', error);
    }
  };

  const getPerformanceLevel = (score) => {
    if (score >= 80) return { level: 'Outstanding', color: 'text-emerald-600 bg-emerald-100' };
    if (score >= 70) return { level: 'Exceeds Expectations', color: 'text-green-600 bg-green-100' };
    if (score >= 50) return { level: 'Meets Expectations', color: 'text-blue-600 bg-blue-100' };
    if (score >= 30) return { level: 'Needs Improvement', color: 'text-yellow-600 bg-yellow-100' };
    return { level: 'Unsatisfactory', color: 'text-red-600 bg-red-100' };
  };

  const canEdit = () => {
    if (reviewMode === 'self' && appraisal?.status === 'self_assessment') return true;
    if (reviewMode === 'manager' && appraisal?.status === 'manager_review') return true;
    if (reviewMode === 'committee' && appraisal?.status === 'committee_review') return true;
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!appraisal) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Appraisal not found</p>
      </div>
    );
  }

  const totalScore = calculateTotalScore();
  const performanceLevel = getPerformanceLevel(totalScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/hr/performance/appraisals')}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Performance Appraisal
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'} • {cycle?.name || 'Unknown Cycle'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {canEdit() && (
            <>
              <button
                onClick={handleSaveProgress}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Save className="w-4 h-4" />
                Save Progress
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
                Submit {reviewMode === 'self' ? 'Self Assessment' : reviewMode === 'manager' ? 'Manager Review' : 'Committee Review'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Score Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'}
              </h2>
              <p className="text-gray-500">{employee?.position || 'No Position'}</p>
              <p className="text-sm text-gray-400">{employee?.department || 'No Department'}</p>
            </div>
          </div>

          <div className="text-center">
            <div className={`text-4xl font-bold ${totalScore > 0 ? performanceLevel.color.split(' ')[0] : 'text-gray-400'}`}>
              {totalScore}%
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium mt-1 ${
              totalScore > 0 ? performanceLevel.color : 'bg-gray-100 text-gray-500'
            }`}>
              {totalScore > 0 ? performanceLevel.level : 'Not Rated'}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-sm text-gray-500">Self Assessment</p>
              <p className="text-xl font-bold text-blue-600">
                {appraisal.selfAssessmentScore || '-'}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Manager Score</p>
              <p className="text-xl font-bold text-purple-600">
                {appraisal.managerScore || '-'}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Committee Score</p>
              <p className="text-xl font-bold text-indigo-600">
                {appraisal.committeeScore || '-'}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Review Mode Toggle */}
      <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2">
        {['self', 'manager', 'committee'].map((mode) => (
          <button
            key={mode}
            onClick={() => setReviewMode(mode)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
              reviewMode === mode
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {mode === 'self' ? 'Self Assessment' : mode === 'manager' ? 'Manager Review' : 'Committee Review'}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {[
          { key: 'evaluation', label: 'Evaluation', icon: Star },
          { key: 'goals', label: 'Goals', icon: Target },
          { key: 'training', label: 'Training Needs', icon: BookOpen }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 -mb-px transition ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'evaluation' && (
        <div className="space-y-4">
          {sections.map((section) => {
            const sectionScore = calculateSectionScore(section.id);
            const isExpanded = expandedSections[section.id];
            const sectionCriteria = getSectionCriteria(section.id);

            return (
              <div
                key={section.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
              >
                {/* Section Header */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  onClick={() => setExpandedSections(prev => ({ ...prev, [section.id]: !prev[section.id] }))}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {section.sortOrder}. {section.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {sectionScore.rated}/{sectionScore.total} criteria rated
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className={`text-xl font-bold ${
                        sectionScore.score >= 70 ? 'text-green-600' :
                        sectionScore.score >= 50 ? 'text-blue-600' :
                        sectionScore.score > 0 ? 'text-yellow-600' : 'text-gray-400'
                      }`}>
                        {sectionScore.score}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Criteria List */}
                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    {sectionCriteria.map((criteriaItem) => {
                      const rating = getRating(criteriaItem.id);
                      const currentRating = reviewMode === 'self'
                        ? rating.selfRating
                        : reviewMode === 'manager'
                        ? rating.managerRating
                        : rating.committeeRating;
                      const currentComment = reviewMode === 'self'
                        ? rating.selfComment
                        : reviewMode === 'manager'
                        ? rating.managerComment
                        : rating.committeeComment;

                      return (
                        <div
                          key={criteriaItem.id}
                          className="p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {criteriaItem.name}
                              </h4>
                              {criteriaItem.description && (
                                <p className="text-sm text-gray-500 mt-1">{criteriaItem.description}</p>
                              )}
                              <span className="text-xs text-gray-400 mt-1 block">
                                Weight: {criteriaItem.weight} points
                              </span>
                            </div>
                          </div>

                          {/* Rating Stars */}
                          <div className="flex items-center gap-2 mb-3">
                            {RATING_SCALE.slice(1).map((scale) => (
                              <button
                                key={scale.value}
                                onClick={() => canEdit() && handleRatingChange(criteriaItem.id, scale.value)}
                                disabled={!canEdit()}
                                className={`flex items-center justify-center w-10 h-10 rounded-lg border transition ${
                                  currentRating === scale.value
                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                                    : 'border-gray-300 dark:border-gray-600 text-gray-400 hover:border-gray-400'
                                } ${!canEdit() ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                title={`${scale.value} - ${scale.label}`}
                              >
                                <span className="font-semibold">{scale.value}</span>
                              </button>
                            ))}
                            <span className="ml-2 text-sm text-gray-500">
                              {currentRating ? RATING_SCALE.find(r => r.value === currentRating)?.label : 'Not Rated'}
                            </span>
                          </div>

                          {/* Comment */}
                          {canEdit() ? (
                            <textarea
                              placeholder="Add comment..."
                              defaultValue={currentComment || ''}
                              onBlur={(e) => handleCommentChange(criteriaItem.id, e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                              rows={2}
                            />
                          ) : currentComment ? (
                            <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                              {currentComment}
                            </p>
                          ) : null}

                          {/* Other Ratings Display */}
                          {(rating.selfRating || rating.managerRating || rating.committeeRating) && (
                            <div className="flex gap-4 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                              {reviewMode !== 'self' && rating.selfRating && (
                                <span className="text-xs text-gray-500">
                                  Self: {rating.selfRating}/5
                                </span>
                              )}
                              {reviewMode !== 'manager' && rating.managerRating && (
                                <span className="text-xs text-gray-500">
                                  Manager: {rating.managerRating}/5
                                </span>
                              )}
                              {reviewMode !== 'committee' && rating.committeeRating && (
                                <span className="text-xs text-gray-500">
                                  Committee: {rating.committeeRating}/5
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Development Goals</h3>
            <button
              onClick={addGoal}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Goal
            </button>
          </div>

          {goals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No goals defined yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={goal.description}
                        onChange={(e) => updateGoal(goal.id, { description: e.target.value })}
                        placeholder="Goal description..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <div className="flex items-center gap-4 mt-2">
                        <input
                          type="date"
                          value={goal.targetDate || ''}
                          onChange={(e) => updateGoal(goal.id, { targetDate: e.target.value })}
                          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <select
                          value={goal.status}
                          onChange={(e) => updateGoal(goal.id, { status: e.target.value })}
                          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-1 text-gray-400 hover:text-red-600 ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'training' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Training Needs</h3>
            <button
              onClick={addTrainingNeed}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Training Need
            </button>
          </div>

          {trainingNeeds.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No training needs identified yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trainingNeeds.map((need) => (
                <div
                  key={need.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={need.title}
                        onChange={(e) => updateTrainingNeed(need.id, { title: e.target.value })}
                        placeholder="Training title..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <textarea
                        value={need.description || ''}
                        onChange={(e) => updateTrainingNeed(need.id, { description: e.target.value })}
                        placeholder="Description..."
                        rows={2}
                        className="w-full px-3 py-2 mt-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                      />
                      <div className="flex items-center gap-4 mt-2">
                        <select
                          value={need.priority}
                          onChange={(e) => updateTrainingNeed(need.id, { priority: e.target.value })}
                          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                        </select>
                        <select
                          value={need.status}
                          onChange={(e) => updateTrainingNeed(need.id, { status: e.target.value })}
                          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="identified">Identified</option>
                          <option value="planned">Planned</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTrainingNeed(need.id)}
                      className="p-1 text-gray-400 hover:text-red-600 ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppraisalForm;
