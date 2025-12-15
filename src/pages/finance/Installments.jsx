import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, ArrowDownToLine, CheckCircle } from 'lucide-react';
import Modal from '../../components/Modal';
import { installmentRequestDB, installmentReceiptDB, projectDB } from '../../services/db/indexedDB';

const Installments = () => {
  const [requests, setRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [formData, setFormData] = useState({
    projectId: '',
    installmentNumber: 1,
    amountRequested: '',
    currency: 'AFN',
    dateRequested: '',
    remarks: '',
  });
  const [receiptData, setReceiptData] = useState({
    amountReceived: '',
    receiptDate: '',
    exchangeRate: '1',
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
      const [requestsData, projectsData] = await Promise.all([
        installmentRequestDB.getAll(),
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

  const resetForm = () => {
    setFormData({
      projectId: '',
      installmentNumber: 1,
      amountRequested: '',
      currency: 'AFN',
      dateRequested: new Date().toISOString().split('T')[0],
      remarks: '',
    });
    setErrors({});
    setSelectedRequest(null);
  };

  const handleOpenModal = (request = null) => {
    if (request) {
      setSelectedRequest(request);
      setFormData({
        projectId: request.projectId || '',
        installmentNumber: request.installmentNumber || 1,
        amountRequested: request.amountRequested || '',
        currency: request.currency || 'AFN',
        dateRequested: request.dateRequested || '',
        remarks: request.remarks || '',
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleOpenReceiptModal = (request) => {
    setSelectedRequest(request);
    setReceiptData({
      amountReceived: '',
      receiptDate: new Date().toISOString().split('T')[0],
      exchangeRate: '1',
      remarks: '',
    });
    setShowReceiptModal(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.projectId) newErrors.projectId = 'Project is required';
    if (!formData.amountRequested) newErrors.amountRequested = 'Amount is required';
    if (!formData.dateRequested) newErrors.dateRequested = 'Date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      const dataToSave = {
        ...formData,
        projectId: Number(formData.projectId),
        amountRequested: Number(formData.amountRequested),
      };

      if (selectedRequest) {
        await installmentRequestDB.update(selectedRequest.id, dataToSave);
      } else {
        await installmentRequestDB.create(dataToSave);
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving request:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReceiptSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await installmentReceiptDB.create({
        installmentRequestId: selectedRequest.id,
        amountReceived: Number(receiptData.amountReceived),
        receiptDate: receiptData.receiptDate,
        exchangeRate: Number(receiptData.exchangeRate),
        remarks: receiptData.remarks,
        currency: selectedRequest.currency,
      });
      await installmentRequestDB.update(selectedRequest.id, { status: 'received' });
      setShowReceiptModal(false);
      loadData();
    } catch (error) {
      console.error('Error recording receipt:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? `${project.projectCode}` : 'Unknown';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'received': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatCurrency = (amount, currency = 'AFN') => {
    return new Intl.NumberFormat('en-US').format(amount) + ' ' + currency;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Installment Requests</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage donor fund installment requests and receipts</p>
      </div>

      <div className="mb-6 flex justify-end">
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
          <ArrowDownToLine className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No requests found</h3>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Installment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{getProjectName(request.projectId)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">#{request.installmentNumber}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(request.amountRequested, request.currency)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{request.dateRequested}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {request.status === 'pending' && (
                      <>
                        <button onClick={() => handleOpenModal(request)} className="p-1 text-gray-500 hover:text-blue-500">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleOpenReceiptModal(request)} className="p-1 text-gray-500 hover:text-green-500 ml-1" title="Record Receipt">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={selectedRequest ? 'Edit Request' : 'New Installment Request'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project <span className="text-red-500">*</span></label>
            <select name="projectId" value={formData.projectId} onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 ${errors.projectId ? 'border-red-500' : 'border-gray-300'}`}>
              <option value="">Select Project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.projectCode} - {p.projectName}</option>)}
            </select>
            {errors.projectId && <p className="text-red-500 text-sm mt-1">{errors.projectId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Installment #</label>
              <input type="number" name="installmentNumber" value={formData.installmentNumber} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700" min="1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
              <select name="currency" value={formData.currency} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700">
                <option value="AFN">AFN</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount Requested <span className="text-red-500">*</span></label>
            <input type="number" name="amountRequested" value={formData.amountRequested} onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 ${errors.amountRequested ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.amountRequested && <p className="text-red-500 text-sm mt-1">{errors.amountRequested}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Requested <span className="text-red-500">*</span></label>
            <input type="date" name="dateRequested" value={formData.dateRequested} onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 ${errors.dateRequested ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.dateRequested && <p className="text-red-500 text-sm mt-1">{errors.dateRequested}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remarks</label>
            <textarea name="remarks" value={formData.remarks} onChange={handleInputChange} rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-500 text-white rounded-lg disabled:opacity-50">
              {saving ? 'Saving...' : selectedRequest ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Receipt Modal */}
      <Modal isOpen={showReceiptModal} onClose={() => setShowReceiptModal(false)} title="Record Receipt" size="md">
        <form onSubmit={handleReceiptSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount Received</label>
            <input type="number" value={receiptData.amountReceived} onChange={(e) => setReceiptData(prev => ({ ...prev, amountReceived: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Receipt Date</label>
            <input type="date" value={receiptData.receiptDate} onChange={(e) => setReceiptData(prev => ({ ...prev, receiptDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exchange Rate</label>
            <input type="number" step="0.01" value={receiptData.exchangeRate} onChange={(e) => setReceiptData(prev => ({ ...prev, exchangeRate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remarks</label>
            <textarea value={receiptData.remarks} onChange={(e) => setReceiptData(prev => ({ ...prev, remarks: e.target.value }))} rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setShowReceiptModal(false)} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-green-500 text-white rounded-lg disabled:opacity-50">
              {saving ? 'Saving...' : 'Record Receipt'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Installments;
