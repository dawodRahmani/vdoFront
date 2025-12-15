import { useState, useEffect } from 'react';
import { Key, Plus, Edit, Trash2, X } from 'lucide-react';
import { permissionDB, seedAllDefaults } from '../../services/db/indexedDB';

const Permissions = () => {
  const [permissionGroups, setPermissionGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    module: '',
    status: true,
  });
  const [errors, setErrors] = useState({});

  const moduleOptions = [
    'User Management',
    'HR Management',
    'Payroll',
    'Attendance',
    'Leave Management',
    'Reports',
    'Settings',
    'Other',
  ];

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await seedAllDefaults();
      const groupedData = await permissionDB.getAllGrouped();
      setPermissionGroups(groupedData);
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Permission name is required';
    } else if (!/^[a-z._]+$/.test(formData.name)) {
      newErrors.name = 'Use lowercase letters, dots, and underscores only';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.module) {
      newErrors.module = 'Module is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Open modal for adding
  const handleAdd = () => {
    setEditingPermission(null);
    setFormData({
      name: '',
      description: '',
      module: moduleOptions[0],
      status: true,
    });
    setErrors({});
    setShowModal(true);
  };

  // Open modal for editing
  const handleEdit = (permission) => {
    setEditingPermission(permission);
    setFormData({
      name: permission.name,
      description: permission.description,
      module: permission.module,
      status: permission.status,
    });
    setErrors({});
    setShowModal(true);
  };

  // Save permission
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (editingPermission) {
        await permissionDB.update(editingPermission.id, formData);
      } else {
        await permissionDB.create(formData);
      }

      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving permission:', error);
      if (error.message?.includes('name')) {
        setErrors(prev => ({ ...prev, name: 'Permission name already exists' }));
      }
    }
  };

  // Toggle permission status
  const handleToggleStatus = async (permission) => {
    try {
      await permissionDB.toggleStatus(permission.id);
      loadData();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  // Delete permission
  const handleDelete = async (permissionId) => {
    try {
      await permissionDB.delete(permissionId);
      setShowDeleteConfirm(null);
      loadData();
    } catch (error) {
      console.error('Error deleting permission:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Permissions</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage system permissions and access controls
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-white hover:bg-primary-600 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Permission
        </button>
      </div>

      {/* Permission Groups */}
      <div className="space-y-6">
        {permissionGroups.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No permissions found. Add your first permission.
          </div>
        ) : (
          permissionGroups.map((group, groupIndex) => (
            <div
              key={groupIndex}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden"
            >
              {/* Group Header */}
              <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-primary-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {group.module}
                  </h3>
                  <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                    {group.permissions.length} permissions
                  </span>
                </div>
              </div>

              {/* Permissions List */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {group.permissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <code className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-900 text-sm font-mono text-gray-900 dark:text-gray-300">
                          {permission.name}
                        </code>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {permission.description}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={permission.status}
                          onChange={() => handleToggleStatus(permission)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                      </label>

                      <button
                        onClick={() => handleEdit(permission)}
                        className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="Edit permission"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(permission)}
                        className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete permission"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingPermission ? 'Edit Permission' : 'Add New Permission'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Permission Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono`}
                  placeholder="e.g., users.create"
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                <p className="text-xs text-gray-500">Use format: module.action (e.g., users.create)</p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                  placeholder="e.g., Create new users"
                />
                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
              </div>

              {/* Module */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Module
                </label>
                <select
                  name="module"
                  value={formData.module}
                  onChange={handleInputChange}
                  className={`w-full rounded-lg border ${errors.module ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                >
                  {moduleOptions.map(module => (
                    <option key={module} value={module}>
                      {module}
                    </option>
                  ))}
                </select>
                {errors.module && <p className="text-xs text-red-500">{errors.module}</p>}
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="status"
                    checked={formData.status}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                </label>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Active
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              >
                {editingPermission ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Delete Permission
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">{showDeleteConfirm.name}</code>? This will also remove it from all roles.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm.id)}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Permissions;
