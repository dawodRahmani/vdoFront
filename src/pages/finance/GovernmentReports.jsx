import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Building2, Calendar, CheckCircle } from 'lucide-react';
import Modal from '../../components/Modal';
import { governmentReportingDB, projectDB } from '../../services/db/indexedDB';

const GovernmentReports = () => {
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [formData, setFormData] = useState({
    projectId: '',
    ministryName: '',
    reportType: 'quarterly',
    dueDate: '',
    status: 'pending',
    remarks: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reportsData, projectsData] = await Promise.all([
        governmentReportingDB.getAll(),
        projectDB.getAll(),
      ]);
      setReports(reportsData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (report = null) => {
    if (report) {
      setSelectedReport(report);
      setFormData({
        projectId: report.projectId || '',
        ministryName: report.ministryName || '',
        reportType: report.reportType || 'quarterly',
        dueDate: report.dueDate || '',
        status: report.status || 'pending',
        remarks: report.remarks || '',
      });
    } else {
      setFormData({
        projectId: '',
        ministryName: '',
        reportType: 'quarterly',
        dueDate: '',
        status: 'pending',
        remarks: '',
      });
      setSelectedReport(null);
    }
    setShowModal(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.projectId) newErrors.projectId = 'Project is required';
    if (!formData.ministryName.trim()) newErrors.ministryName = 'Ministry is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      const dataToSave = { ...formData, projectId: Number(formData.projectId) };
      if (selectedReport) {
        await governmentReportingDB.update(selectedReport.id, dataToSave);
      } else {
        await governmentReportingDB.create(dataToSave);
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving report:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this report?')) {
      await governmentReportingDB.delete(id);
      loadData();
    }
  };

  const markAsSubmitted = async (report) => {
    await governmentReportingDB.update(report.id, { status: 'submitted', submittedAt: new Date().toISOString() });
    loadData();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const getProjectName = (id) => projects.find(p => p.id === id)?.projectCode || 'Unknown';
  const getStatusColor = (status) => status === 'submitted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Government Reporting</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage government ministry report submissions</p>
      </div>

      <div className="mb-6 flex justify-end">
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
          <Plus className="h-5 w-5" />Add Report
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No reports found</h3>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ministry</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{getProjectName(report.projectId)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{report.ministryName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{report.reportType}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{report.dueDate}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {report.status === 'pending' && (
                      <button onClick={() => markAsSubmitted(report)} className="p-1 text-gray-500 hover:text-green-500">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => handleOpenModal(report)} className="p-1 text-gray-500 hover:text-blue-500 ml-1">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(report.id)} className="p-1 text-gray-500 hover:text-red-500 ml-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedReport ? 'Edit Report' : 'Add Report'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project <span className="text-red-500">*</span></label>
            <select name="projectId" value={formData.projectId} onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg ${errors.projectId ? 'border-red-500' : 'border-gray-300'}`}>
              <option value="">Select</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.projectCode}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ministry Name <span className="text-red-500">*</span></label>
            <input type="text" name="ministryName" value={formData.ministryName} onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg ${errors.ministryName ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g., Ministry of Economy" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Report Type</label>
              <select name="reportType" value={formData.reportType} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
                <option value="final">Final</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date <span className="text-red-500">*</span></label>
              <input type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.dueDate ? 'border-red-500' : 'border-gray-300'}`} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Remarks</label>
            <textarea name="remarks" value={formData.remarks} onChange={handleInputChange} rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-500 text-white rounded-lg disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GovernmentReports;
