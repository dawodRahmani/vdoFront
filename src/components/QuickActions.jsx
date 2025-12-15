import { UserPlus, Calendar, FileText, Clock, TrendingUp, DollarSign } from 'lucide-react';

const QuickActions = () => {
  const actions = [
    { icon: UserPlus, label: 'Add Employee', color: 'blue' },
    { icon: Calendar, label: 'New Leave Request', color: 'green' },
    { icon: FileText, label: 'Job Posting', color: 'purple' },
    { icon: Clock, label: 'Mark Attendance', color: 'yellow' },
    { icon: TrendingUp, label: 'Performance Review', color: 'pink' },
    { icon: DollarSign, label: 'Process Payroll', color: 'emerald' },
  ];

  const colorClasses = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    yellow: 'bg-yellow-500 hover:bg-yellow-600',
    pink: 'bg-pink-500 hover:bg-pink-600',
    emerald: 'bg-emerald-500 hover:bg-emerald-600',
  };

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Quick Actions
      </h3>
      <div className="space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              className={`flex w-full items-center gap-3 rounded-lg ${colorClasses[action.color]} px-4 py-3 text-white transition-colors`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
