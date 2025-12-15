import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  Calendar,
  Flag,
  CheckCircle,
  XCircle,
  Sun,
  Moon,
  Star,
} from 'lucide-react';
import { holidayService } from '../../services/db/leaveManagementService';

const Holidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterType, setFilterType] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    nameDari: '',
    namePashto: '',
    date: '',
    holidayType: 'national',
    isRecurring: false,
    isActive: true,
  });

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  const holidayTypes = [
    { value: 'national', label: 'National', icon: Flag, color: 'blue' },
    { value: 'religious', label: 'Religious', icon: Moon, color: 'purple' },
    { value: 'organizational', label: 'Organizational', icon: Star, color: 'orange' },
  ];

  useEffect(() => {
    loadData();
  }, [filterYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      await holidayService.seedDefaults(filterYear);
      const data = await holidayService.getByYear(filterYear);
      setHolidays(data);
    } catch (error) {
      console.error('Error loading holidays:', error);
      showToast('Failed to load holidays', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddNew = () => {
    setIsEditing(false);
    setFormData({
      name: '',
      nameDari: '',
      namePashto: '',
      date: '',
      holidayType: 'national',
      isRecurring: false,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleEdit = (holiday) => {
    setIsEditing(true);
    setSelectedHoliday(holiday);
    setFormData({
      name: holiday.name || '',
      nameDari: holiday.nameDari || '',
      namePashto: holiday.namePashto || '',
      date: holiday.date || '',
      holidayType: holiday.holidayType || 'national',
      isRecurring: holiday.isRecurring || false,
      isActive: holiday.isActive !== false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.date) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      const data = {
        ...formData,
        fiscalYear: filterYear,
      };

      if (isEditing && selectedHoliday) {
        await holidayService.update(selectedHoliday.id, data);
        showToast('Holiday updated successfully');
      } else {
        await holidayService.create(data);
        showToast('Holiday created successfully');
      }

      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving holiday:', error);
      showToast(error.message || 'Failed to save holiday', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedHoliday) return;

    try {
      await holidayService.delete(selectedHoliday.id);
      showToast('Holiday deleted successfully');
      setShowDeleteModal(false);
      setSelectedHoliday(null);
      loadData();
    } catch (error) {
      console.error('Error deleting holiday:', error);
      showToast('Failed to delete holiday', 'error');
    }
  };

  const getHolidayTypeConfig = (type) => {
    return holidayTypes.find(t => t.value === type) || holidayTypes[0];
  };

  const filteredHolidays = holidays.filter(holiday => {
    const matchesSearch = holiday.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || holiday.holidayType === filterType;
    return matchesSearch && matchesType;
  });

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDayOfWeek = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const isUpcoming = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    return date >= today;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Holidays</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage official and public holidays for leave calculations
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Holiday
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{holidays.length}</p>
            </div>
          </div>
        </div>
        {holidayTypes.map(type => {
          const count = holidays.filter(h => h.holidayType === type.value).length;
          const TypeIcon = type.icon;
          return (
            <div key={type.value} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-${type.color}-100 dark:bg-${type.color}-900/30 rounded-lg`}>
                  <TypeIcon className={`w-5 h-5 text-${type.color}-600 dark:text-${type.color}-400`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{type.label}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{count}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search holidays..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Types</option>
            {holidayTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Holidays List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHolidays.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-500 dark:text-gray-400">No holidays found</p>
          </div>
        ) : (
          filteredHolidays.map(holiday => {
            const typeConfig = getHolidayTypeConfig(holiday.holidayType);
            const TypeIcon = typeConfig.icon;
            const upcoming = isUpcoming(holiday.date);

            return (
              <div
                key={holiday.id}
                className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${
                  !holiday.isActive ? 'opacity-60' : ''
                } ${upcoming ? 'ring-2 ring-primary-200 dark:ring-primary-800' : ''}`}
              >
                <div className={`h-2 bg-${typeConfig.color}-500`} />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <TypeIcon className={`w-5 h-5 text-${typeConfig.color}-500`} />
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        {typeConfig.label}
                      </span>
                    </div>
                    {upcoming && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                        Upcoming
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{holiday.name}</h3>
                  {holiday.nameDari && (
                    <p className="text-sm text-gray-500 dark:text-gray-400" dir="rtl">{holiday.nameDari}</p>
                  )}

                  <div className="flex items-center gap-2 mt-3 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(holiday.date)}</span>
                  </div>

                  {holiday.isRecurring && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-purple-600 dark:text-purple-400">
                      <RefreshCw className="w-3 h-3" />
                      <span>Recurring annually</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className={`inline-flex items-center gap-1 text-xs ${
                      holiday.isActive
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {holiday.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {holiday.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(holiday)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedHoliday(holiday);
                          setShowDeleteModal(true);
                        }}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg m-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Holiday' : 'Add Holiday'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Holiday Name (English) *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Independence Day"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name (Dari)
                  </label>
                  <input
                    type="text"
                    name="nameDari"
                    value={formData.nameDari}
                    onChange={handleFormChange}
                    dir="rtl"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name (Pashto)
                  </label>
                  <input
                    type="text"
                    name="namePashto"
                    value={formData.namePashto}
                    onChange={handleFormChange}
                    dir="rtl"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Holiday Type
                  </label>
                  <select
                    name="holidayType"
                    value={formData.holidayType}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {holidayTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleFormChange}
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Recurring Annually</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleFormChange}
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                >
                  {isEditing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedHoliday && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md m-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Holiday</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Are you sure you want to delete "{selectedHoliday.name}"?
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedHoliday(null);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
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

export default Holidays;
