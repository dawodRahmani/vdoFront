import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
} from 'lucide-react';
import { trainingService, trainingCalendarService, trainingProgramService } from '../../services/db/trainingService';

const TrainingCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [trainings, setTrainings] = useState([]);
  const [calendarEntries, setCalendarEntries] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('month'); // month, week, list

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [trainingsData, calendarData, programsData] = await Promise.all([
        trainingService.getAll(),
        trainingCalendarService.getAll(),
        trainingProgramService.getAll(),
      ]);
      setTrainings(trainingsData);
      setCalendarEntries(calendarData);
      setPrograms(programsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];

    // Previous month days
    const prevMonth = new Date(year, month, 0);
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const getTrainingsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return trainings.filter((t) => {
      if (!t.startDate) return false;
      const startDate = t.startDate.split('T')[0];
      const endDate = t.endDate ? t.endDate.split('T')[0] : startDate;
      return dateStr >= startDate && dateStr <= endDate;
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-400',
      scheduled: 'bg-blue-500',
      confirmed: 'bg-cyan-500',
      in_progress: 'bg-yellow-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500',
      postponed: 'bg-orange-500',
    };
    return colors[status] || colors.draft;
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get upcoming trainings for the list view
  const upcomingTrainings = trainings
    .filter((t) => t.startDate && new Date(t.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Training Calendar
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              View and manage training schedule
            </p>
          </div>
          <Link
            to="/training/trainings/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Schedule Training
          </Link>
        </div>

        {/* Calendar Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white min-w-[180px] text-center">
                {formatMonthYear(currentDate)}
              </h2>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-sm rounded-lg ${
                viewMode === 'month'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-sm rounded-lg ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'month' ? (
        /* Calendar Grid */
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            {weekDays.map((day) => (
              <div
                key={day}
                className="py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const dayTrainings = getTrainingsForDate(day.date);
              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 border-b border-r border-gray-200 dark:border-gray-700 ${
                    !day.isCurrentMonth
                      ? 'bg-gray-50 dark:bg-gray-900/50'
                      : 'bg-white dark:bg-gray-800'
                  }`}
                >
                  <div
                    className={`text-sm font-medium mb-1 ${
                      isToday(day.date)
                        ? 'w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center'
                        : day.isCurrentMonth
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-400 dark:text-gray-600'
                    }`}
                  >
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayTrainings.slice(0, 3).map((training) => (
                      <Link
                        key={training.id}
                        to={`/training/trainings/${training.id}`}
                        className={`block px-2 py-1 text-xs rounded truncate text-white ${getStatusColor(
                          training.status
                        )}`}
                        title={training.title}
                      >
                        {training.title}
                      </Link>
                    ))}
                    {dayTrainings.length > 3 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{dayTrainings.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upcoming Trainings
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {upcomingTrainings.length === 0 ? (
              <div className="p-8 text-center">
                <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No upcoming trainings scheduled.</p>
              </div>
            ) : (
              upcomingTrainings.map((training) => (
                <Link
                  key={training.id}
                  to={`/training/trainings/${training.id}`}
                  className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          {new Date(training.startDate).toLocaleDateString('en-US', {
                            month: 'short',
                          })}
                        </span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {new Date(training.startDate).getDate()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {training.title}
                        </h4>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full text-white ${getStatusColor(
                            training.status
                          )}`}
                        >
                          {training.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {training.startTime} - {training.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {training.venueType} {training.venueName && `- ${training.venueName}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {training.actualParticipants || 0}/{training.targetParticipants || '?'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Status Legend</h3>
        <div className="flex flex-wrap gap-4">
          {[
            { status: 'scheduled', label: 'Scheduled' },
            { status: 'confirmed', label: 'Confirmed' },
            { status: 'in_progress', label: 'In Progress' },
            { status: 'completed', label: 'Completed' },
            { status: 'cancelled', label: 'Cancelled' },
          ].map((item) => (
            <div key={item.status} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${getStatusColor(item.status)}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrainingCalendar;
