import React, { useState, useEffect } from 'react';
import {
  FileText, Plus, Search, Edit, Trash2, Eye, Copy,
  ChevronDown, ChevronRight, GripVertical, Save, X,
  ListChecks, Target, Award, CheckCircle, AlertCircle
} from 'lucide-react';
import performanceService from '../../services/db/performanceService';

const AppraisalTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [sections, setSections] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [editingCriteria, setEditingCriteria] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // list or detail

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [templatesData, sectionsData, criteriaData] = await Promise.all([
        performanceService.appraisalTemplates.getAll(),
        performanceService.appraisalSections.getAll(),
        performanceService.appraisalCriteria.getAll()
      ]);
      setTemplates(templatesData);
      setSections(sectionsData);
      setCriteria(criteriaData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.appraisalType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTemplateSections = (templateId) => {
    return sections
      .filter(s => s.templateId === templateId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const getSectionCriteria = (sectionId) => {
    return criteria
      .filter(c => c.sectionId === sectionId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const getTotalWeight = (templateId) => {
    const templateSections = getTemplateSections(templateId);
    return templateSections.reduce((total, section) => {
      const sectionCriteria = getSectionCriteria(section.id);
      return total + sectionCriteria.reduce((sum, c) => sum + (c.weight || 0), 0);
    }, 0);
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Template Modal
  const TemplateModal = () => {
    const [formData, setFormData] = useState(
      editingTemplate || {
        name: '',
        appraisalType: 'annual',
        description: '',
        isActive: true
      }
    );

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if (editingTemplate?.id) {
          await performanceService.appraisalTemplates.update(editingTemplate.id, formData);
        } else {
          await performanceService.appraisalTemplates.create(formData);
        }
        await loadData();
        setShowTemplateModal(false);
        setEditingTemplate(null);
      } catch (error) {
        console.error('Error saving template:', error);
        alert('Error saving template');
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingTemplate ? 'Edit Template' : 'New Template'}
            </h3>
            <button
              onClick={() => { setShowTemplateModal(false); setEditingTemplate(null); }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Template Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Appraisal Type
              </label>
              <select
                value={formData.appraisalType}
                onChange={(e) => setFormData({ ...formData, appraisalType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="annual">Annual Performance</option>
                <option value="probation">Probation</option>
                <option value="contract_renewal">Contract Renewal</option>
                <option value="pip_review">PIP Review</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Active Template
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => { setShowTemplateModal(false); setEditingTemplate(null); }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingTemplate ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Section Modal
  const SectionModal = () => {
    const [formData, setFormData] = useState(
      editingSection || {
        templateId: selectedTemplate?.id,
        name: '',
        description: '',
        weight: 0,
        sortOrder: getTemplateSections(selectedTemplate?.id).length + 1
      }
    );

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if (editingSection?.id) {
          await performanceService.appraisalSections.update(editingSection.id, formData);
        } else {
          await performanceService.appraisalSections.create(formData);
        }
        await loadData();
        setShowSectionModal(false);
        setEditingSection(null);
      } catch (error) {
        console.error('Error saving section:', error);
        alert('Error saving section');
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingSection ? 'Edit Section' : 'New Section'}
            </h3>
            <button
              onClick={() => { setShowSectionModal(false); setEditingSection(null); }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Section Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sort Order
              </label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => { setShowSectionModal(false); setEditingSection(null); }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingSection ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Criteria Modal
  const CriteriaModal = () => {
    const [formData, setFormData] = useState(
      editingCriteria || {
        sectionId: editingSection?.id,
        name: '',
        description: '',
        weight: 5,
        sortOrder: getSectionCriteria(editingSection?.id).length + 1
      }
    );

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if (editingCriteria?.id) {
          await performanceService.appraisalCriteria.update(editingCriteria.id, formData);
        } else {
          await performanceService.appraisalCriteria.create(formData);
        }
        await loadData();
        setShowCriteriaModal(false);
        setEditingCriteria(null);
      } catch (error) {
        console.error('Error saving criteria:', error);
        alert('Error saving criteria');
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingCriteria ? 'Edit Criteria' : 'New Criteria'}
            </h3>
            <button
              onClick={() => { setShowCriteriaModal(false); setEditingCriteria(null); }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Criteria Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Weight (Points)
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sort Order
              </label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => { setShowCriteriaModal(false); setEditingCriteria(null); }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingCriteria ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const handleDeleteTemplate = async (template) => {
    if (!confirm(`Delete template "${template.name}"? This will also delete all sections and criteria.`)) return;
    try {
      // Delete criteria first
      const templateSections = getTemplateSections(template.id);
      for (const section of templateSections) {
        const sectionCriteria = getSectionCriteria(section.id);
        for (const c of sectionCriteria) {
          await performanceService.appraisalCriteria.delete(c.id);
        }
        await performanceService.appraisalSections.delete(section.id);
      }
      await performanceService.appraisalTemplates.delete(template.id);
      await loadData();
      if (selectedTemplate?.id === template.id) {
        setSelectedTemplate(null);
        setViewMode('list');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Error deleting template');
    }
  };

  const handleDeleteSection = async (section) => {
    if (!confirm(`Delete section "${section.name}"? This will also delete all criteria.`)) return;
    try {
      const sectionCriteria = getSectionCriteria(section.id);
      for (const c of sectionCriteria) {
        await performanceService.appraisalCriteria.delete(c.id);
      }
      await performanceService.appraisalSections.delete(section.id);
      await loadData();
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Error deleting section');
    }
  };

  const handleDeleteCriteria = async (criteriaItem) => {
    if (!confirm(`Delete criteria "${criteriaItem.name}"?`)) return;
    try {
      await performanceService.appraisalCriteria.delete(criteriaItem.id);
      await loadData();
    } catch (error) {
      console.error('Error deleting criteria:', error);
      alert('Error deleting criteria');
    }
  };

  const duplicateTemplate = async (template) => {
    try {
      const newTemplate = await performanceService.appraisalTemplates.create({
        name: `${template.name} (Copy)`,
        appraisalType: template.appraisalType,
        description: template.description,
        isActive: false
      });

      const templateSections = getTemplateSections(template.id);
      for (const section of templateSections) {
        const newSection = await performanceService.appraisalSections.create({
          templateId: newTemplate.id,
          name: section.name,
          description: section.description,
          weight: section.weight,
          sortOrder: section.sortOrder
        });

        const sectionCriteria = getSectionCriteria(section.id);
        for (const c of sectionCriteria) {
          await performanceService.appraisalCriteria.create({
            sectionId: newSection.id,
            name: c.name,
            description: c.description,
            weight: c.weight,
            sortOrder: c.sortOrder
          });
        }
      }

      await loadData();
    } catch (error) {
      console.error('Error duplicating template:', error);
      alert('Error duplicating template');
    }
  };

  const getAppraisalTypeLabel = (type) => {
    const labels = {
      annual: 'Annual Performance',
      probation: 'Probation',
      contract_renewal: 'Contract Renewal',
      pip_review: 'PIP Review'
    };
    return labels[type] || type;
  };

  const getAppraisalTypeColor = (type) => {
    const colors = {
      annual: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      probation: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      contract_renewal: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      pip_review: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Detail View
  if (viewMode === 'detail' && selectedTemplate) {
    const templateSections = getTemplateSections(selectedTemplate.id);
    const totalWeight = getTotalWeight(selectedTemplate.id);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => { setViewMode('list'); setSelectedTemplate(null); }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedTemplate.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 text-xs rounded-full ${getAppraisalTypeColor(selectedTemplate.appraisalType)}`}>
                  {getAppraisalTypeLabel(selectedTemplate.appraisalType)}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  selectedTemplate.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {selectedTemplate.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => { setShowSectionModal(true); setEditingSection(null); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Section
          </button>
        </div>

        {/* Weight Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900 dark:text-white">Total Weight</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${totalWeight === 100 ? 'text-green-600' : 'text-orange-600'}`}>
                {totalWeight}
              </span>
              <span className="text-gray-500">/ 100 points</span>
              {totalWeight === 100 ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-orange-600" />
              )}
            </div>
          </div>
          {totalWeight !== 100 && (
            <p className="text-sm text-orange-600 mt-2">
              Total weight should equal 100 points for accurate scoring.
            </p>
          )}
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {templateSections.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
              <ListChecks className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Sections</h3>
              <p className="text-gray-500 mb-4">Add sections to define evaluation criteria</p>
              <button
                onClick={() => { setShowSectionModal(true); setEditingSection(null); }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add First Section
              </button>
            </div>
          ) : (
            templateSections.map((section) => {
              const sectionCriteria = getSectionCriteria(section.id);
              const sectionWeight = sectionCriteria.reduce((sum, c) => sum + (c.weight || 0), 0);
              const isExpanded = expandedSections[section.id];

              return (
                <div
                  key={section.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  {/* Section Header */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-5 h-5 text-gray-400" />
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {section.sortOrder}. {section.name}
                        </h3>
                        {section.description && (
                          <p className="text-sm text-gray-500">{section.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {sectionWeight} pts
                        </span>
                        <span className="text-xs text-gray-500 block">
                          {sectionCriteria.length} criteria
                        </span>
                      </div>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setEditingSection(section);
                            setShowSectionModal(true);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSection(section)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Criteria List */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 dark:border-gray-700">
                      {sectionCriteria.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No criteria defined
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                          {sectionCriteria.map((criteriaItem) => (
                            <div
                              key={criteriaItem.id}
                              className="flex items-center justify-between px-4 py-3 pl-16 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                            >
                              <div className="flex items-center gap-3">
                                <Target className="w-4 h-4 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {criteriaItem.name}
                                  </p>
                                  {criteriaItem.description && (
                                    <p className="text-xs text-gray-500">{criteriaItem.description}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {criteriaItem.weight} pts
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingSection(section);
                                      setEditingCriteria(criteriaItem);
                                      setShowCriteriaModal(true);
                                    }}
                                    className="p-1 text-gray-400 hover:text-blue-600"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCriteria(criteriaItem)}
                                    className="p-1 text-gray-400 hover:text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="p-3 pl-16 bg-gray-50 dark:bg-gray-700/30">
                        <button
                          onClick={() => {
                            setEditingSection(section);
                            setEditingCriteria(null);
                            setShowCriteriaModal(true);
                          }}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <Plus className="w-4 h-4" />
                          Add Criteria
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modals */}
        {showSectionModal && <SectionModal />}
        {showCriteriaModal && <CriteriaModal />}
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appraisal Templates</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage evaluation templates and criteria</p>
        </div>
        <button
          onClick={() => { setShowTemplateModal(true); setEditingTemplate(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      {/* Templates List */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Templates Found</h3>
          <p className="text-gray-500">Create your first appraisal template to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTemplates.map((template) => {
            const templateSections = getTemplateSections(template.id);
            const totalWeight = getTotalWeight(template.id);
            const criteriaCount = templateSections.reduce(
              (sum, s) => sum + getSectionCriteria(s.id).length, 0
            );

            return (
              <div
                key={template.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{template.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getAppraisalTypeColor(template.appraisalType)}`}>
                          {getAppraisalTypeLabel(template.appraisalType)}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          template.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{templateSections.length}</p>
                      <p className="text-xs text-gray-500">Sections</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{criteriaCount}</p>
                      <p className="text-xs text-gray-500">Criteria</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-lg font-semibold ${totalWeight === 100 ? 'text-green-600' : 'text-orange-600'}`}>
                        {totalWeight}
                      </p>
                      <p className="text-xs text-gray-500">Weight</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setSelectedTemplate(template); setViewMode('detail'); }}
                        className="p-2 text-gray-400 hover:text-blue-600"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setEditingTemplate(template); setShowTemplateModal(true); }}
                        className="p-2 text-gray-400 hover:text-blue-600"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => duplicateTemplate(template)}
                        className="p-2 text-gray-400 hover:text-blue-600"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template)}
                        className="p-2 text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                {template.description && (
                  <p className="text-sm text-gray-500 mt-2 ml-16">{template.description}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showTemplateModal && <TemplateModal />}
    </div>
  );
};

export default AppraisalTemplates;
