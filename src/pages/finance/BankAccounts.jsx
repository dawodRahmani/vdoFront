import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, CreditCard } from 'lucide-react';
import Modal from '../../components/Modal';
import { bankAccountDB, bankDB } from '../../services/db/indexedDB';

const BankAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [formData, setFormData] = useState({
    bankId: '',
    accountName: '',
    accountNumber: '',
    accountType: 'main',
    currency: 'AFN',
    location: '',
    remarks: '',
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accountsData, banksData] = await Promise.all([
        bankAccountDB.getAll(),
        bankDB.getAll({ isActive: true }),
      ]);
      setAccounts(accountsData);
      setBanks(banksData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      bankId: '',
      accountName: '',
      accountNumber: '',
      accountType: 'main',
      currency: 'AFN',
      location: '',
      remarks: '',
      isActive: true,
    });
    setErrors({});
    setSelectedAccount(null);
  };

  const handleOpenModal = (account = null) => {
    if (account) {
      setSelectedAccount(account);
      setFormData({
        bankId: account.bankId || '',
        accountName: account.accountName || '',
        accountNumber: account.accountNumber || '',
        accountType: account.accountType || 'main',
        currency: account.currency || 'AFN',
        location: account.location || '',
        remarks: account.remarks || '',
        isActive: account.isActive !== false,
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.bankId) newErrors.bankId = 'Bank is required';
    if (!formData.accountName.trim()) newErrors.accountName = 'Account name is required';
    if (!formData.currency) newErrors.currency = 'Currency is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      const dataToSave = { ...formData, bankId: Number(formData.bankId) };
      if (selectedAccount) {
        await bankAccountDB.update(selectedAccount.id, dataToSave);
      } else {
        await bankAccountDB.create(dataToSave);
      }
      handleCloseModal();
      loadData();
    } catch (error) {
      console.error('Error saving account:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      await bankAccountDB.delete(selectedAccount.id);
      setShowDeleteModal(false);
      setSelectedAccount(null);
      loadData();
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const getBankName = (bankId) => {
    const bank = banks.find(b => b.id === bankId);
    return bank ? bank.bankName : 'Unknown';
  };

  const filteredAccounts = accounts.filter(a =>
    a.accountName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bank Accounts</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage organization bank accounts</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
          <Plus className="h-5 w-5" />
          Add Account
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No accounts found</h3>
          <p className="text-gray-600 dark:text-gray-400">Get started by adding your first bank account.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Account</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Bank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Currency</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-white">{account.accountName}</div>
                    <div className="text-sm text-gray-500">{account.accountNumber}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{getBankName(account.bankId)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 capitalize">{account.accountType}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{account.currency}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      account.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {account.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleOpenModal(account)} className="p-1 text-gray-500 hover:text-blue-500">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => { setSelectedAccount(account); setShowDeleteModal(true); }} className="p-1 text-gray-500 hover:text-red-500 ml-2">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={handleCloseModal} title={selectedAccount ? 'Edit Account' : 'Add Account'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank <span className="text-red-500">*</span></label>
            <select name="bankId" value={formData.bankId} onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.bankId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
              <option value="">Select Bank</option>
              {banks.map(bank => <option key={bank.id} value={bank.id}>{bank.bankName}</option>)}
            </select>
            {errors.bankId && <p className="text-red-500 text-sm mt-1">{errors.bankId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Name <span className="text-red-500">*</span></label>
            <input type="text" name="accountName" value={formData.accountName} onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.accountName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              placeholder="e.g., VDO Main Account" />
            {errors.accountName && <p className="text-red-500 text-sm mt-1">{errors.accountName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Number</label>
            <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Bank account number" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Type</label>
              <select name="accountType" value={formData.accountType} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="main">Main</option>
                <option value="corefund">Core Fund</option>
                <option value="ops">Operations</option>
                <option value="project">Project-Specific</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency <span className="text-red-500">*</span></label>
              <select name="currency" value={formData.currency} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="AFN">AFN</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
            <input type="text" name="location" value={formData.location} onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., Kabul" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remarks</label>
            <textarea name="remarks" value={formData.remarks} onChange={handleInputChange} rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>

          <div className="flex items-center">
            <input type="checkbox" name="isActive" id="isActive" checked={formData.isActive} onChange={handleInputChange}
              className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded" />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50">
              {saving ? 'Saving...' : selectedAccount ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Account" size="sm">
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">Are you sure you want to delete <strong>{selectedAccount?.accountName}</strong>?</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg">Cancel</button>
            <button onClick={handleDelete} disabled={saving} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50">
              {saving ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BankAccounts;
