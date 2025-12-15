import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, ClipboardList, CheckCircle, XCircle, Clock } from 'lucide-react';
import Modal from '../../components/Modal';
import { cashRequestDB, cashRequestItemDB, projectDB } from '../../services/db/indexedDB';

const CashRequests = () => {
  const [requests, setRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestItems, setRequestItems] = useState([]);
  const [formData, setFormData] = useState({
    requestMonth: '',
    requestYear: new Date().getFullYear(),
    currency: 'AFN',
    preparedBy: '',
    remarks: '',
  });
  const [items, setItems] = useState([{ projectId: '', costType: 'staff', description: '', amount: '' }]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [requestsData, projectsData] = await Promise.all([
        cashRequestDB.getAll({ status: statusFilter || undefined }),
        projectDB.getAll({ status: 'ongoing' }),
      ]);
      setRequests(requestsData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      const data = await cashRequestDB.getAll({ status: statusFilter || undefined });
      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      requestMonth: '',
      requestYear: new Date().getFullYear(),
      currency: 'AFN',
      preparedBy: '',
      remarks: '',
    });
    setItems([{ projectId: '', costType: 'staff', description: '', amount: '' }]);
    setErrors({});
    setSelectedRequest(null);
  };

  const handleOpenModal = async (request = null) => {
    if (request) {
      setSelectedRequest(request);
      setFormData({
        requestMonth: request.requestMonth || '',
        requestYear: request.requestYear || new Date().getFullYear(),
        currency: request.currency || 'AFN',
        preparedBy: request.preparedBy || '',
        remarks: request.remarks || '',
      });
      const reqItems = await cashRequestItemDB.getAll({ cashRequestId: request.id });
      setItems(reqItems.length > 0 ? reqItems.map(i => ({
        id: i.id,
        projectId: i.projectId || '',
        costType: i.costType || 'staff',
        description: i.description || '',
        amount: i.amount || '',
      })) : [{ projectId: '', costType: 'staff', description: '', amount: '' }]);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleViewRequest = async (request) => {
    setSelectedRequest(request);
    const items = await cashRequestItemDB.getAll({ cashRequestId: request.id });
    setRequestItems(items);
    setShowViewModal(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.requestMonth) newErrors.requestMonth = 'Month is required';
    if (!formData.preparedBy.trim()) newErrors.preparedBy = 'Prepared by is required';

    const validItems = items.filter(i => i.projectId && i.amount);
    if (validItems.length === 0) newErrors.items = 'At least one valid item is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      const totalAmount = items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
      const requestData = { ...formData, totalAmount };

      let requestId;
      if (selectedRequest) {
        await cashRequestDB.update(selectedRequest.id, requestData);
        requestId = selectedRequest.id;
        await cashRequestItemDB.deleteByRequestId(requestId);
      } else {
        const newRequest = await cashRequestDB.create(requestData);
        requestId = newRequest.id;
      }

      for (const item of items) {
        if (item.projectId && item.amount) {
          await cashRequestItemDB.create({
            cashRequestId: requestId,
            projectId: Number(item.projectId),
            costType: item.costType,
            description: item.description,
            amount: Number(item.amount),
          });
        }
      }

      setShowModal(false);
      resetForm();
      loadRequests();
    } catch (error) {
      console.error('Error saving request:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      await cashRequestItemDB.deleteByRequestId(selectedRequest.id);
      await cashRequestDB.delete(selectedRequest.id);
      setShowDeleteModal(false);
      setSelectedRequest(null);
      loadRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (request) => {
    try {
      await cashRequestDB.approve(request.id, { approvedBy: 'Current User' });
      loadRequests();
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
    if (errors.items) setErrors(prev => ({ ...prev, items: '' }));
  };

  const addItem = () => {
    setItems([...items, { projectId: '', costType: 'staff', description: '', amount: '' }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? `${project.projectCode} - ${project.projectName}` : 'Unknown';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount, currency = 'AFN') => {
    return new Intl.NumberFormat('en-US').format(amount) + ' ' + currency;
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cash Requests</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage monthly cash requests for projects</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
          <Plus className="h-5 w-5" />New Request
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardList className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No requests found</h3>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request #</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prepared By</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{request.requestNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {months[parseInt(request.requestMonth) - 1]} {request.requestYear}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(request.totalAmount || 0, request.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      {request.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{request.preparedBy}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleViewRequest(request)} className="p-1 text-gray-500 hover:text-primary-500">
                      <Eye className="h-4 w-4" />
                    </button>
                    {request.status === 'draft' && (
                      <>
                        <button onClick={() => handleOpenModal(request)} className="p-1 text-gray-500 hover:text-blue-500 ml-1">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => { setSelectedRequest(request); setShowDeleteModal(true); }} className="p-1 text-gray-500 hover:text-red-500 ml-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    {request.status === 'submitted' && (
                      <button onClick={() => handleApprove(request)} className="p-1 text-gray-500 hover:text-green-500 ml-1" title="Approve">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={selectedRequest ? 'Edit Cash Request' : 'New Cash Request'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month <span className="text-red-500">*</span></label>
              <select name="requestMonth" value={formData.requestMonth} onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 ${errors.requestMonth ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
                <option value="">Select</option>
                {months.map((m, i) => <option key={i} value={String(i + 1).padStart(2, '0')}>{m}</option>)}
              </select>
              {errors.requestMonth && <p className="text-red-500 text-sm mt-1">{errors.requestMonth}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
              <input type="number" name="requestYear" value={formData.requestYear} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
              <select name="currency" value={formData.currency} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                <option value="AFN">AFN</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prepared By <span className="text-red-500">*</span></label>
              <input type="text" name="preparedBy" value={formData.preparedBy} onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 ${errors.preparedBy ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
              {errors.preparedBy && <p className="text-red-500 text-sm mt-1">{errors.preparedBy}</p>}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Request Items</label>
              <button type="button" onClick={addItem} className="text-sm text-primary-500 hover:text-primary-600">+ Add Item</button>
            </div>
            {errors.items && <p className="text-red-500 text-sm mb-2">{errors.items}</p>}
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-start">
                  <select value={item.projectId} onChange={(e) => handleItemChange(index, 'projectId', e.target.value)}
                    className="col-span-4 px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                    <option value="">Select Project</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.projectCode}</option>)}
                  </select>
                  <select value={item.costType} onChange={(e) => handleItemChange(index, 'costType', e.target.value)}
                    className="col-span-2 px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                    <option value="staff">Staff</option>
                    <option value="ops">Operations</option>
                  </select>
                  <input type="text" placeholder="Description" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="col-span-3 px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" />
                  <input type="number" placeholder="Amount" value={item.amount} onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                    className="col-span-2 px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" />
                  <button type="button" onClick={() => removeItem(index)} className="col-span-1 p-2 text-red-500 hover:bg-red-50 rounded" disabled={items.length === 1}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 text-right text-sm font-medium text-gray-900 dark:text-white">
              Total: {formatCurrency(items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0), formData.currency)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remarks</label>
            <textarea name="remarks" value={formData.remarks} onChange={handleInputChange} rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-500 text-white rounded-lg disabled:opacity-50">
              {saving ? 'Saving...' : selectedRequest ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Cash Request Details" size="lg">
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Request #</p>
                <p className="font-medium">{selectedRequest.requestNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Period</p>
                <p className="font-medium">{months[parseInt(selectedRequest.requestMonth) - 1]} {selectedRequest.requestYear}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(selectedRequest.status)}`}>
                  {selectedRequest.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="font-medium">{formatCurrency(selectedRequest.totalAmount || 0, selectedRequest.currency)}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Items</h4>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-left">Project</th>
                    <th className="px-3 py-2 text-left">Type</th>
                    <th className="px-3 py-2 text-left">Description</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {requestItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2">{getProjectName(item.projectId)}</td>
                      <td className="px-3 py-2 capitalize">{item.costType}</td>
                      <td className="px-3 py-2">{item.description || '-'}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(item.amount, selectedRequest.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Request" size="sm">
        <div className="space-y-4">
          <p className="text-gray-600">Are you sure you want to delete request <strong>{selectedRequest?.requestNumber}</strong>?</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={handleDelete} disabled={saving} className="px-4 py-2 bg-red-500 text-white rounded-lg disabled:opacity-50">
              {saving ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CashRequests;
