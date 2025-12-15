import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Calendar,
  User,
  Users,
  Filter,
  Eye,
} from 'lucide-react';
import { leaveCalendarService, holidayService } from '../../services/db/leaveManagementService';
import { leaveRequestDB, leaveTypeDB, employeeDB, departmentDB, seedAllDefaults } from '../../services/db/indexedDB';

const LeaveCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [viewMode, setViewMode] = useState('month'); // month, week

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      await seedAllDefaults();

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const [requestsData, holidaysData, employeesData, departmentsData, leaveTypesData] = await Promise.all([
        leaveRequestDB.getAll(),
        holidayService.getByDateRange(startDate.toISOString(), endDate.toISOString()),
        employeeDB.getAll(),
        departmentDB.getAll(),
        leaveTypeDB.getAll(),
      ]);

      // Filter requests that overlap with current month
      const monthRequests = requestsData.filter(r => {
        if (!['approved', 'taken', 'completed'].includes(r.status)) return false;
        const reqStart = new Date(r.startDate);
        const reqEnd = new Date(r.endDate);
        return (reqStart <= endDate && reqEnd >= startDate);
      });

      setLeaveRequests(monthRequests);
      setHolidays(holidaysData);
      setEmployees(employeesData);
      setDepartments(departmentsData);
      setLeaveTypes(leaveTypesData);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Failed to load calendar data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const getEmployeeName = (id) => {
    const employee = employees.find(e => e.id === id);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
  };

  const getEmployeeDepartment = (id) => {
    const employee = employees.find(e => e.id === id);
    return employee?.departmentId || employee?.department;
  };

  const getLeaveTypeName = (id) => {
    const type = leaveTypes.find(lt => lt.id === id);
    return type?.name || 'Unknown';
  };

  const getLeaveTypeColor = (id) => {
    const type = leaveTypes.find(lt => lt.id === id);
    return type?.color || 'gray';
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDayOfMonth };
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isWeekend = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 5 || dayOfWeek === 6; // Friday-Saturday
  };

  const getHolidayForDate = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return holidays.find(h => h.date === dateStr);
  };

  const getLeavesForDate = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

    let filteredRequests = leaveRequests.filter(r => {
      const start = new Date(r.startDate);
      const end = new Date(r.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return date >= start && date <= end;
    });

    if (filterDepartment) {
      filteredRequests = filteredRequests.filter(r => {
        const empDept = getEmployeeDepartment(r.employeeId);
        return empDept === Number(filterDepartment) || empDept === filterDepartment;
      });
    }

    if (filterEmployee) {
      filteredRequests = filteredRequests.filter(r => r.employeeId === Number(filterEmployee));
    }

    return filteredRequests;
  };

  const handleDateClick = (day) => {
    const leaves = getLeavesForDate(day);
    const holiday = getHolidayForDate(day);
    if (leaves.length > 0 || holiday) {
      setSelectedDate({
        day,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
        leaves,
        holiday,
      });
      setShowDetailModal(true);
    }
  };

  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Calendar</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View team leaves and holidays at a glance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <span className="text-lg font-semibold text-gray-900 dark:text-white min-w-[180px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Filter:</span>
          </div>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
          <select
            value={filterEmployee}
            onChange={(e) => setFilterEmployee(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Employees</option>
            {employees.filter(e => e.status === 'active').map(emp => (
              <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
            ))}
          </select>
          {(filterDepartment || filterEmployee) && (
            <button
              onClick={() => {
                setFilterDepartment('');
                setFilterEmployee('');
              }}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Holiday</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Weekend</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Leave</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Today</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          {dayNames.map(day => (
            <div key={day} className="px-2 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {/* Empty cells for days before first day of month */}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="min-h-[100px] p-2 border-b border-r border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const leaves = getLeavesForDate(day);
            const holiday = getHolidayForDate(day);
            const weekend = isWeekend(day);
            const today = isToday(day);

            return (
              <div
                key={day}
                onClick={() => handleDateClick(day)}
                className={`min-h-[100px] p-2 border-b border-r border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${
                  holiday ? 'bg-red-50 dark:bg-red-900/20' :
                  weekend ? 'bg-gray-50 dark:bg-gray-800/50' :
                  'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                } ${today ? 'ring-2 ring-inset ring-primary-500' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <span className={`inline-flex items-center justify-center w-7 h-7 text-sm rounded-full ${
                    today ? 'bg-primary-500 text-white font-bold' :
                    weekend ? 'text-gray-400' :
                    'text-gray-900 dark:text-white'
                  }`}>
                    {day}
                  </span>
                  {(leaves.length > 0 || holiday) && (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </div>

                {/* Holiday indicator */}
                {holiday && (
                  <div className="mt-1 text-xs text-red-600 dark:text-red-400 truncate">
                    {holiday.name}
                  </div>
                )}

                {/* Leave indicators */}
                <div className="mt-1 space-y-1">
                  {leaves.slice(0, 3).map((leave, idx) => (
                    <div
                      key={idx}
                      className={`text-xs px-1.5 py-0.5 rounded truncate bg-${getLeaveTypeColor(leave.leaveTypeId)}-100 text-${getLeaveTypeColor(leave.leaveTypeId)}-800 dark:bg-${getLeaveTypeColor(leave.leaveTypeId)}-900/30 dark:text-${getLeaveTypeColor(leave.leaveTypeId)}-400`}
                    >
                      {getEmployeeName(leave.employeeId).split(' ')[0]}
                    </div>
                  ))}
                  {leaves.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      +{leaves.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto m-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-primary-500" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedDate.date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h2>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* Holiday */}
              {selectedDate.holiday && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">Holiday: {selectedDate.holiday.name}</span>
                  </div>
                </div>
              )}

              {/* Leaves */}
              {selectedDate.leaves.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Employees on Leave ({selectedDate.leaves.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedDate.leaves.map((leave, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-gray-800 rounded-full">
                              <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {getEmployeeName(leave.employeeId)}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {getLeaveTypeName(leave.leaveTypeId)}
                              </p>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full bg-${getLeaveTypeColor(leave.leaveTypeId)}-100 text-${getLeaveTypeColor(leave.leaveTypeId)}-800 dark:bg-${getLeaveTypeColor(leave.leaveTypeId)}-900/30 dark:text-${getLeaveTypeColor(leave.leaveTypeId)}-400`}>
                            {leave.totalDays} day{leave.totalDays !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!selectedDate.holiday && selectedDate.leaves.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  No leaves or holidays on this date
                </p>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedDate(null);
                }}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveCalendar;
