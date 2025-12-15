import { useState, useEffect } from 'react';
import { Shield, Key, Save, Check } from 'lucide-react';
import { roleDB, permissionDB, rolePermissionDB, seedAllDefaults } from '../../services/db/indexedDB';

const RolePermissions = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissionModules, setPermissionModules] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await seedAllDefaults();
      const [rolesData, permissionsGrouped] = await Promise.all([
        roleDB.getAll(),
        permissionDB.getAllGrouped(),
      ]);

      setRoles(rolesData);
      setPermissionModules(permissionsGrouped);

      // Select first role by default
      if (rolesData.length > 0 && !selectedRole) {
        setSelectedRole(rolesData[0].id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load role permissions when role changes
  useEffect(() => {
    if (selectedRole) {
      loadRolePermissions();
    }
  }, [selectedRole]);

  const loadRolePermissions = async () => {
    try {
      const perms = await rolePermissionDB.getByRole(selectedRole);
      setRolePermissions(perms.map(p => p.permissionId));
      setHasChanges(false);
    } catch (error) {
      console.error('Error loading role permissions:', error);
    }
  };

  // Check if permission is assigned
  const isPermissionAssigned = (permissionId) => {
    return rolePermissions.includes(permissionId);
  };

  // Toggle permission
  const handleTogglePermission = async (permissionId) => {
    if (isPermissionAssigned(permissionId)) {
      setRolePermissions(prev => prev.filter(id => id !== permissionId));
    } else {
      setRolePermissions(prev => [...prev, permissionId]);
    }
    setHasChanges(true);
  };

  // Save changes
  const handleSave = async () => {
    if (!selectedRole) return;

    setSaving(true);
    try {
      // Get current assignments
      const currentAssignments = await rolePermissionDB.getByRole(selectedRole);
      const currentPermIds = currentAssignments.map(p => p.permissionId);

      // Find permissions to add and remove
      const toAdd = rolePermissions.filter(id => !currentPermIds.includes(id));
      const toRemove = currentPermIds.filter(id => !rolePermissions.includes(id));

      // Add new permissions
      for (const permId of toAdd) {
        await rolePermissionDB.assign(selectedRole, permId);
      }

      // Remove old permissions
      for (const permId of toRemove) {
        await rolePermissionDB.remove(selectedRole, permId);
      }

      setHasChanges(false);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (error) {
      console.error('Error saving permissions:', error);
      alert('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  // Get role color classes
  const getRoleColorClasses = (role) => {
    const colors = {
      red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    };
    return colors[role.color] || colors.blue;
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Role Permissions</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Assign permissions to roles
          </p>
        </div>
        <div className="flex items-center gap-3">
          {savedMessage && (
            <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
              <Check className="h-4 w-4" />
              Saved successfully
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-white transition-colors ${
              hasChanges && !saving
                ? 'bg-primary-500 hover:bg-primary-600'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            <Save className="h-5 w-5" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Roles List */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Select Role
            </h3>
            <div className="space-y-2">
              {roles.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No roles found</p>
              ) : (
                roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedRole === role.id
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-medium">{role.name}</div>
                    <div className={`text-xs mt-1 ${selectedRole === role.id ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'}`}>
                      {role.userCount || 0} users
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Permissions Matrix */}
        <div className="lg:col-span-3">
          {!selectedRole ? (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-12 text-center">
              <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Select a role to manage its permissions
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {permissionModules.length === 0 ? (
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-12 text-center">
                  <Key className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No permissions found. Create permissions first.
                  </p>
                </div>
              ) : (
                permissionModules.map((module, moduleIndex) => (
                  <div
                    key={moduleIndex}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden"
                  >
                    {/* Module Header */}
                    <div className="bg-gray-50 dark:bg-gray-900 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <Key className="h-4 w-4 text-primary-500" />
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {module.module}
                        </h3>
                        <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                          {module.permissions.filter(p => isPermissionAssigned(p.id)).length} / {module.permissions.length} assigned
                        </span>
                      </div>
                    </div>

                    {/* Permissions */}
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {module.permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <code className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-900 text-xs font-mono text-gray-900 dark:text-gray-300">
                                {permission.name}
                              </code>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {permission.description}
                              </span>
                            </div>
                          </div>

                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isPermissionAssigned(permission.id)}
                              onChange={() => handleTogglePermission(permission.id)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <div className="fixed bottom-4 right-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 shadow-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            You have unsaved changes. Don&apos;t forget to save!
          </p>
        </div>
      )}
    </div>
  );
};

export default RolePermissions;
