import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Megaphone } from 'lucide-react';
import Modal from '../../components/Modal';
import { govtOutreachDB } from '../../services/db/indexedDB';

const GovernmentOutreach = () => {
  const [outreaches, setOutreaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOutreach, setSelectedOutreach] = useState(null);
  const [formData, setFormData] = useState({
    ministryDepartment: '',
    outreachType: 'meeting',
    date: '',
    contactPerson: '',
    purpose: '',
    outcome: '',
    followUpDate: '',
    status: 'planned',
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
      const data = await govtOutreachDB.getAll();
      setOutreaches(data);
    } catch (error) {
      console.error('Error loading outreach records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (outreach = null) => {
    if (outreach) {
      setSelectedOutreach(outreach);
      setFormData({
        ministryDepartment: outreach.ministryDepartment || '',
        outreachType: outreach.outreachType || 'meeting',
        date: outreach.date || '',
        contactPerson: outreach.contactPerson || '',
        purpose: outreach.purpose || '',
        outcome: outreach.outcome || '',
        followUpDate: outreach.followUpDate || '',
        status: outreach.status || 'planned',
        remarks: outreach.remarks || '',
      });
    } else {
      setFormData({
        ministryDepartment: '',
        outreachType: 'meeting',
        date: '',
        contactPerson: '',
        purpose: '',
        outcome: '',
        followUpDate: '',
        status: 'planned',
        remarks: '',
      });
      setSelectedOutreach(null);
    }
    setErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.ministryDepartment.trim()) newErrors.ministryDepartment = 'Ministry/Department is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.purpose.trim()) newErrors.purpose = 'Purpose is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      if (selectedOutreach) {
        await govtOutreachDB.update(selectedOutreach.id, formData);
      } else {
        await govtOutreachDB.create(formData);
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving outreach:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this outreach record?')) {
      await govtOutreachDB.delete(id);
      loadData();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Government Outreach</h1>
        <p className="text-gray-600 dark:text-gray-400">Track government engagement and liaison activities</p>
      </div>

      <div className="mb-6 flex justify-end">
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
          <Plus className="h-5 w-5" />Add Outreach
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : outreaches.length === 0 ? (
        <div className="text-center py-12">
          <Megaphone className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No outreach records found</h3>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ministry/Dept</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Follow-up</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {outreaches.map((outreach) => (
                <tr key={outreach.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{outreach.ministryDepartment}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{outreach.outreachType}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{outreach.date}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-xs">{outreach.purpose}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{outreach.followUpDate || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(outreach.status)}`}>
                      {outreach.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleOpenModal(outreach)} className="p-1 text-gray-500 hover:text-blue-500">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(outreach.id)} className="p-1 text-gray-500 hover:text-red-500 ml-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedOutreach ? 'Edit Outreach' : 'Add Outreach'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Ministry/Department <span className="text-red-500">*</span></label>
            <input type="text" name="ministryDepartment" value={formData.ministryDepartment} onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg ${errors.ministryDepartment ? 'border-red-500' : 'border-gray-300'}`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Outreach Type</label>
              <select name="outreachType" value={formData.outreachType} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="meeting">Meeting</option>
                <option value="call">Phone Call</option>
                <option value="letter">Official Letter</option>
                <option value="visit">Site Visit</option>
                <option value="report">Report Submission</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date <span className="text-red-500">*</span></label>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.date ? 'border-red-500' : 'border-gray-300'}`} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contact Person</label>
            <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Purpose <span className="text-red-500">*</span></label>
            <textarea name="purpose" value={formData.purpose} onChange={handleInputChange} rows={2}
              className={`w-full px-3 py-2 border rounded-lg ${errors.purpose ? 'border-red-500' : 'border-gray-300'}`} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Outcome</label>
            <textarea name="outcome" value={formData.outcome} onChange={handleInputChange} rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Follow-up Date</label>
              <input type="date" name="followUpDate" value={formData.followUpDate} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
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

export default GovernmentOutreach;
