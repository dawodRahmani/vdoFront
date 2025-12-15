import { useState, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  AlertCircle,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  DollarSign,
  Calendar,
  User,
} from 'lucide-react';
import { purchaseRequestDB, departmentDB, employeeDB, itemCategoryDB } from '../../services/db/indexedDB';

const PurchaseRequests = () => {
  const [requests, setRequests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [viewRequest, setViewRequest] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requestedBy: '',
    department: '',
    priority: 'Medium',
    requiredDate: '',
    items: [
      {
        itemName: '',
        description: '',
        quantity: 1,
        unit: 'Unit',
        estimatedUnitPrice: 0,
        category: '',
        specifications: '',
      }
    ],
    status: 'Draft',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  const statuses = ['Draft', 'Pending', 'Approved', 'Rejected', 'Cancelled'];
  const priorities = ['Low', 'Medium', 'High', 'Urgent'];
  const units = ['Unit', 'Box', 'Piece', 'Ream', 'Roll', 'Bottle', 'Kit', 'Set', 'Pair', 'Dozen'];

  useEffect(() => {
    loadData();
  }, [searchTerm, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [requestsData, deptData, empData, catData] = await Promise.all([
        purchaseRequestDB.getAll({ search: searchTerm, status: statusFilter }),
        departmentDB.getAll(),
        employeeDB.getAll(),
        itemCategoryDB.getAll(),
      ]);

      setRequests(requestsData);
      setDepartments(deptData);
      setEmployees(empData);
      setCategories(catData.filter(cat => cat.parent === null)); // Main categories only
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (request = null) => {
    if (request) {
      setCurrentRequest(request);
      setFormData({
        title: request.title,
        description: request.description,
        requestedBy: request.requestedBy,
        department: request.department,
        priority: request.priority,
        requiredDate: request.requiredDate,
        items: request.items || [],
        status: request.status,
        notes: request.notes || '',
      });
    } else {
      setCurrentRequest(null);
      setFormData({
        title: '',
        description: '',
        requestedBy: '',
        department: '',
        priority: 'Medium',
        requiredDate: '',
        items: [
          {
            itemName: '',
            description: '',
            quantity: 1,
            unit: 'Unit',
            estimatedUnitPrice: 0,
            category: '',
            specifications: '',
          }
        ],
        status: 'Draft',
        notes: '',
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentRequest(null);
    setErrors({});
  };

  const handleViewRequest = (request) => {
    setViewRequest(request);
    setShowViewModal(true);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.requestedBy) {
      newErrors.requestedBy = 'Requested by is required';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.requiredDate) {
      newErrors.requiredDate = 'Required date is required';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    }

    formData.items.forEach((item, index) => {
      if (!item.itemName?.trim()) {
        newErrors[`item_${index}_name`] = 'Item name is required';
      }
      if (!item.quantity || item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Valid quantity is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Calculate total estimated amount
      const totalEstimatedAmount = formData.items.reduce((sum, item) => {
        return sum + (item.quantity * item.estimatedUnitPrice);
      }, 0);

      // Calculate estimated total for each item
      const itemsWithTotal = formData.items.map(item => ({
        ...item,
        estimatedTotal: item.quantity * item.estimatedUnitPrice,
      }));

      const requestData = {
        ...formData,
        items: itemsWithTotal,
        totalEstimatedAmount,
      };

      if (currentRequest) {
        await purchaseRequestDB.update(currentRequest.id, requestData);
      } else {
        await purchaseRequestDB.create(requestData);
      }

      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving request:', error);
      setErrors({ submit: 'Failed to save purchase request. Please try again.' });
    }
  };

  const handleDelete = async () => {
    try {
      await purchaseRequestDB.delete(currentRequest.id);
      await loadData();
      setShowDeleteConfirm(false);
      setCurrentRequest(null);
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          itemName: '',
          description: '',
          quantity: 1,
          unit: 'Unit',
          estimatedUnitPrice: 0,
          category: '',
          specifications: '',
        }
      ]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      Draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      Approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      Rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      Cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };

    const statusIcons = {
      Draft: Clock,
      Pending: Clock,
      Approved: CheckCircle,
      Rejected: XCircle,
      Cancelled: XCircle,
    };

    const Icon = statusIcons[status] || Clock;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || statusClasses.Draft}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityClasses = {
      Low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      High: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      Urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${priorityClasses[priority] || priorityClasses.Medium}`}>
        {priority}
      </span>
    );
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'N/A';
  };

  const getDepartmentName = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : 'N/A';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Purchase Requests</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Create and manage purchase requisitions
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Request
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Search requests..."
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Requests Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No purchase requests found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Get started by creating a new purchase request.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    PR Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Requested By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {request.prNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      <div className="max-w-xs truncate">{request.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {getEmployeeName(request.requestedBy)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {getDepartmentName(request.department)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(request.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      ${request.totalEstimatedAmount?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewRequest(request)}
                          className="p-1 text-gray-400 hover:text-primary-600 focus:outline-none"
                          title="View"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(request)}
                          className="p-1 text-gray-400 hover:text-primary-600 focus:outline-none"
                          title="Edit"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setCurrentRequest(request);
                            setShowDeleteConfirm(true);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 focus:outline-none"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen px-4 py-6">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={handleCloseModal}
            ></div>

            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <div className="px-6 pt-5 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {currentRequest ? 'Edit Purchase Request' : 'New Purchase Request'}
                    </h3>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  {errors.submit && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        <p className="ml-2 text-sm text-red-600 dark:text-red-400">
                          {errors.submit}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Basic Information */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                      Basic Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className={`block w-full px-3 py-2 border ${
                            errors.title ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                          } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                          placeholder="e.g., Office Supplies for Q1 2024"
                        />
                        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={2}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Provide additional details..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Requested By <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.requestedBy}
                          onChange={(e) => setFormData({ ...formData, requestedBy: Number(e.target.value) })}
                          className={`block w-full px-3 py-2 border ${
                            errors.requestedBy ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                          } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                        >
                          <option value="">Select employee</option>
                          {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.firstName} {emp.lastName}
                            </option>
                          ))}
                        </select>
                        {errors.requestedBy && <p className="mt-1 text-sm text-red-600">{errors.requestedBy}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Department <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: Number(e.target.value) })}
                          className={`block w-full px-3 py-2 border ${
                            errors.department ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                          } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                        >
                          <option value="">Select department</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                        {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Priority
                        </label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          {priorities.map((priority) => (
                            <option key={priority} value={priority}>
                              {priority}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Required Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={formData.requiredDate}
                          onChange={(e) => setFormData({ ...formData, requiredDate: e.target.value })}
                          className={`block w-full px-3 py-2 border ${
                            errors.requiredDate ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                          } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                        />
                        {errors.requiredDate && <p className="mt-1 text-sm text-red-600">{errors.requiredDate}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white">
                        Items
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-lg text-primary-600 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/30"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Item
                      </button>
                    </div>

                    {errors.items && (
                      <p className="mb-2 text-sm text-red-600">{errors.items}</p>
                    )}

                    <div className="space-y-4">
                      {formData.items.map((item, index) => (
                        <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Item #{index + 1}
                            </h5>
                            {formData.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Item Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={item.itemName}
                                onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                                className={`block w-full px-2 py-1.5 text-sm border ${
                                  errors[`item_${index}_name`] ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                                } rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                                placeholder="e.g., A4 Paper"
                              />
                              {errors[`item_${index}_name`] && (
                                <p className="mt-1 text-xs text-red-600">{errors[`item_${index}_name`]}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Category
                              </label>
                              <select
                                value={item.category}
                                onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                                className="block w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              >
                                <option value="">Select</option>
                                {categories.map((cat) => (
                                  <option key={cat.id} value={cat.name}>
                                    {cat.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="md:col-span-3">
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                              </label>
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                className="block w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Brief description"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Quantity <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                className={`block w-full px-2 py-1.5 text-sm border ${
                                  errors[`item_${index}_quantity`] ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                                } rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                              />
                              {errors[`item_${index}_quantity`] && (
                                <p className="mt-1 text-xs text-red-600">{errors[`item_${index}_quantity`]}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Unit
                              </label>
                              <select
                                value={item.unit}
                                onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                className="block w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              >
                                {units.map((unit) => (
                                  <option key={unit} value={unit}>
                                    {unit}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Est. Unit Price ($)
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.estimatedUnitPrice}
                                onChange={(e) => handleItemChange(index, 'estimatedUnitPrice', parseFloat(e.target.value) || 0)}
                                className="block w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>

                            <div className="md:col-span-3">
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Specifications
                              </label>
                              <textarea
                                value={item.specifications}
                                onChange={(e) => handleItemChange(index, 'specifications', e.target.value)}
                                rows={2}
                                className="block w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Technical specifications or requirements"
                              />
                            </div>

                            <div className="md:col-span-3 bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Estimated Total: <span className="font-semibold">${(item.quantity * item.estimatedUnitPrice).toLocaleString()}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Total Estimated Amount: $
                        {formData.items.reduce((sum, item) => sum + (item.quantity * item.estimatedUnitPrice), 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                      Additional Information
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Status
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Notes
                        </label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          rows={3}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Any additional notes or comments..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    {currentRequest ? 'Update' : 'Create'} Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-6">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75"
              onClick={() => setShowViewModal(false)}
            ></div>

            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="px-6 pt-5 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Purchase Request Details
                  </h3>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">PR Number</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{viewRequest.prNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                      <div className="mt-1">{getStatusBadge(viewRequest.status)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Requested By</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {getEmployeeName(viewRequest.requestedBy)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {getDepartmentName(viewRequest.department)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Priority</p>
                      <div className="mt-1">{getPriorityBadge(viewRequest.priority)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Required Date</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(viewRequest.requiredDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Title</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{viewRequest.title}</p>
                  </div>

                  {viewRequest.description && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
                      <p className="text-sm text-gray-900 dark:text-white">{viewRequest.description}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Items</p>
                    <div className="space-y-2">
                      {viewRequest.items?.map((item, index) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{item.itemName}</p>
                              {item.description && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                              )}
                              {item.specifications && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  Specs: {item.specifications}
                                </p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-sm text-gray-900 dark:text-white">
                                {item.quantity} {item.unit}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                @ ${item.estimatedUnitPrice}
                              </p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                ${item.estimatedTotal?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Total: ${viewRequest.totalEstimatedAmount?.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {viewRequest.notes && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                      <p className="text-sm text-gray-900 dark:text-white">{viewRequest.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex justify-end">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-6">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75"
              onClick={() => setShowDeleteConfirm(false)}
            ></div>

            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
              <div className="px-6 pt-5 pb-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20">
                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Delete Purchase Request
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Are you sure you want to delete "{currentRequest?.title}"? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseRequests;
