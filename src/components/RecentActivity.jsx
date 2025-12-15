import { UserPlus, Calendar, FileText, UserCheck, DollarSign } from 'lucide-react';

const RecentActivity = () => {
  const activities = [
    {
      icon: UserPlus,
      title: 'New Employee Onboarded',
      description: 'John Smith joined as Senior Developer',
      time: '2 hours ago',
      color: 'blue',
    },
    {
      icon: Calendar,
      title: 'Leave Request Approved',
      description: 'Sarah Johnson - Annual Leave (5 days)',
      time: '3 hours ago',
      color: 'green',
    },
    {
      icon: FileText,
      title: 'Job Posted',
      description: 'Frontend Developer position published',
      time: '5 hours ago',
      color: 'purple',
    },
    {
      icon: UserCheck,
      title: 'Performance Review Completed',
      description: 'Q4 2024 review for Marketing Team',
      time: '1 day ago',
      color: 'pink',
    },
    {
      icon: DollarSign,
      title: 'Payroll Processed',
      description: 'Monthly payroll for November 2024',
      time: '2 days ago',
      color: 'emerald',
    },
  ];

  const iconBgClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    green: 'bg-green-100 dark:bg-green-900/30',
    purple: 'bg-purple-100 dark:bg-purple-900/30',
    pink: 'bg-pink-100 dark:bg-pink-900/30',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30',
  };

  const iconColorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    purple: 'text-purple-600 dark:text-purple-400',
    pink: 'text-pink-600 dark:text-pink-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
  };

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h3>
        <button className="text-sm font-medium text-primary-500 hover:text-primary-600">
          View All
        </button>
      </div>
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div key={index} className="flex items-start gap-4">
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${iconBgClasses[activity.color]}`}
              >
                <Icon className={`h-5 w-5 ${iconColorClasses[activity.color]}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {activity.description}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  {activity.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;
