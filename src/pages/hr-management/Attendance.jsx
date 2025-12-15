import { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Search,
  Check,
  X,
  UserCheck,
  UserX,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Save,
  ChevronDown
} from 'lucide-react';
import { attendanceDB, employeeDB, departmentDB, seedAllDefaults } from '../../services/db/indexedDB';

const Attendance = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    onLeave: 0,
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [showBulkMenu, setShowBulkMenu] = useState(false);

  // Attendance status options
  const statusOptions = [
    { value: 'present', label: 'Present', color: 'green', icon: UserCheck },
    { value: 'absent', label: 'Absent', color: 'red', icon: UserX },
    { value: 'late', label: 'Late', color: 'yellow', icon: Clock },
    { value: 'half_day', label: 'Half Day', color: 'orange', icon: AlertCircle },
    { value: 'on_leave', label: 'On Leave', color: 'blue', icon: Calendar },
  ];

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Load attendance when date changes
  useEffect(() => {
    if (employees.length > 0) {
      loadAttendance();
    }
  }, [selectedDate, employees]);

  const loadData = async () => {
    setLoading(true);
    try {
      await seedAllDefaults();
      const [employeesData, departmentsData] = await Promise.all([
        employeeDB.getAll({ status: 'active' }),
        departmentDB.getAll(),
      ]);

      setEmployees(employeesData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = async () => {
    try {
      const records = await attendanceDB.getByDate(selectedDate);

      // Create a map of attendance by employee ID
      const attendanceMap = {};
      records.forEach(record => {
        attendanceMap[record.employeeId] = record;
      });

      // Merge with employees
      const mergedRecords = employees.map(emp => ({
        employee: emp,
        attendance: attendanceMap[emp.id] || null,
        status: attendanceMap[emp.id]?.status || '',
        checkIn: attendanceMap[emp.id]?.checkIn || '',
        checkOut: attendanceMap[emp.id]?.checkOut || '',
        notes: attendanceMap[emp.id]?.notes || '',
      }));

      setAttendanceRecords(mergedRecords);
      updateStats(mergedRecords);
      setHasChanges(false);
    } catch (error) {
      console.error('Error loading attendance:', error);
    }
  };

  const updateStats = (records) => {
    const newStats = {
      total: records.length,
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length,
      halfDay: records.filter(r => r.status === 'half_day').length,
      onLeave: records.filter(r => r.status === 'on_leave').length,
    };
    setStats(newStats);
  };

  // Handle status change
  const handleStatusChange = (employeeId, status) => {
    setAttendanceRecords(prev => {
      const updated = prev.map(record => {
        if (record.employee.id === employeeId) {
          return { ...record, status };
        }
        return record;
      });
      updateStats(updated);
      return updated;
    });
    setHasChanges(true);
  };

  // Handle time change
  const handleTimeChange = (employeeId, field, value) => {
    setAttendanceRecords(prev => {
      return prev.map(record => {
        if (record.employee.id === employeeId) {
          return { ...record, [field]: value };
        }
        return record;
      });
    });
    setHasChanges(true);
  };

  // Handle notes change
  const handleNotesChange = (employeeId, notes) => {
    setAttendanceRecords(prev => {
      return prev.map(record => {
        if (record.employee.id === employeeId) {
          return { ...record, notes };
        }
        return record;
      });
    });
    setHasChanges(true);
  };

  // Save all attendance
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      for (const record of attendanceRecords) {
        if (record.status) {
          await attendanceDB.markAttendance(record.employee.id, selectedDate, {
            status: record.status,
            checkIn: record.checkIn,
            checkOut: record.checkOut,
            notes: record.notes,
          });
        }
      }
      setHasChanges(false);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  // Mark all with a specific status
  const handleMarkAll = (status) => {
    setAttendanceRecords(prev => {
      const updated = prev.map(record => ({
        ...record,
        status: status,
      }));
      updateStats(updated);
      return updated;
    });
    setHasChanges(true);
  };

  // Navigate dates
  const navigateDate = (direction) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + direction);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  // Filter employees
  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = !searchTerm ||
      `${record.employee.firstName} ${record.employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employee.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = !selectedDepartment || record.employee.department === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  // Get status color classes
  const getStatusColor = (status) => {
    const option = statusOptions.find(o => o.value === status);
    if (!option) return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';

    const colors = {
      green: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
      red: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
      yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
      orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400',
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
    };
    return colors[option.color];
  };

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Attendance</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Mark and manage employee attendance
          </p>
        </div>
        <div className="flex items-center gap-3">
          {savedMessage && (
            <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
              <Check className="h-4 w-4" />
              Saved successfully
            </span>
          )}

          {/* Bulk Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowBulkMenu(!showBulkMenu)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <UserCheck className="h-5 w-5" />
              Bulk Actions
              <ChevronDown className="h-4 w-4" />
            </button>

            {showBulkMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowBulkMenu(false)}
                />

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg z-20">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        handleMarkAll('present');
                        setShowBulkMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <UserCheck className="h-4 w-4 text-green-600" />
                      Mark All Present
                    </button>
                    <button
                      onClick={() => {
                        handleMarkAll('absent');
                        setShowBulkMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <UserX className="h-4 w-4 text-red-600" />
                      Mark All Absent
                    </button>
                    <button
                      onClick={() => {
                        handleMarkAll('late');
                        setShowBulkMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Clock className="h-4 w-4 text-yellow-600" />
                      Mark All Late
                    </button>
                    <button
                      onClick={() => {
                        handleMarkAll('half_day');
                        setShowBulkMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      Mark All Half Day
                    </button>
                    <button
                      onClick={() => {
                        handleMarkAll('on_leave');
                        setShowBulkMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Calendar className="h-4 w-4 text-blue-600" />
                      Mark All On Leave
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleSaveAll}
            disabled={!hasChanges || saving}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-white transition-colors ${
              hasChanges && !saving
                ? 'bg-primary-500 hover:bg-primary-600'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            <Save className="h-5 w-5" />
            {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>

      {/* Date Navigation & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Date Picker */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateDate(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-lg font-semibold text-gray-900 dark:text-white border-none focus:outline-none"
              />
            </div>
            <button
              onClick={() => navigateDate(1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            {formatDate(selectedDate)}
          </p>
        </div>

        {/* Stats */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.present}</p>
              <p className="text-xs text-gray-500">Present</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
              <p className="text-xs text-gray-500">Absent</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
              <p className="text-xs text-gray-500">Late</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.halfDay}</p>
              <p className="text-xs text-gray-500">Half Day</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.onLeave}</p>
              <p className="text-xs text-gray-500">On Leave</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-2.5 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.name}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      {/* Attendance Table */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Check Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {employees.length === 0 ? 'No active employees found' : 'No employees match your search'}
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-semibold">
                          {record.employee.firstName?.[0]}{record.employee.lastName?.[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {record.employee.firstName} {record.employee.lastName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {record.employee.employeeId} {record.employee.department && `• ${record.employee.department}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={record.status}
                        onChange={(e) => handleStatusChange(record.employee.id, e.target.value)}
                        className={`rounded-lg border-0 px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 ${getStatusColor(record.status)}`}
                      >
                        <option value="">Select...</option>
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="time"
                        value={record.checkIn}
                        onChange={(e) => handleTimeChange(record.employee.id, 'checkIn', e.target.value)}
                        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="time"
                        value={record.checkOut}
                        onChange={(e) => handleTimeChange(record.employee.id, 'checkOut', e.target.value)}
                        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={record.notes}
                        onChange={(e) => handleNotesChange(record.employee.id, e.target.value)}
                        placeholder="Add notes..."
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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

export default Attendance;
