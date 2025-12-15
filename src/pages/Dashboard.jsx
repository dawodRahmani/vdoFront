import { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  Building2,
  UserCheck,
  HandCoins,
  FolderOpen,
  FileText,
  ClipboardCheck
} from 'lucide-react';
import {
  employeeDB,
  departmentDB,
  positionDB,
  attendanceDB,
  donorDB,
  projectDB,
  complianceProjectDB,
  complianceDocumentDB
} from '../services/db/indexedDB';

const Dashboard = () => {
  const [stats, setStats] = useState([
    { title: 'Total Employees', value: 0, icon: Users, color: 'blue' },
    { title: 'Departments', value: 0, icon: Building2, color: 'purple' },
    { title: 'Positions', value: 0, icon: Briefcase, color: 'green' },
    { title: 'Attendance Today', value: 0, icon: UserCheck, color: 'indigo' },
    { title: 'Donors', value: 0, icon: HandCoins, color: 'emerald' },
    { title: 'Finance Projects', value: 0, icon: FolderOpen, color: 'yellow' },
    { title: 'Compliance Projects', value: 0, icon: ClipboardCheck, color: 'pink' },
    { title: 'Compliance Documents', value: 0, icon: FileText, color: 'red' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      const [
        employees,
        departments,
        positions,
        attendance,
        donors,
        financeProjects,
        complianceProjects,
        documents
      ] = await Promise.all([
        employeeDB.getAll(),
        departmentDB.getAll(),
        positionDB.getAll(),
        attendanceDB.getByDate(today),
        donorDB.getAll(),
        projectDB.getAll(),
        complianceProjectDB.getAll(),
        complianceDocumentDB.getAll()
      ]);

      const activeEmployees = employees.filter(e => e.status === 'active').length;
      const presentToday = attendance.filter(a => a.status === 'present').length;
      const activeDonors = donors.filter(d => d.isActive).length;
      const activeFinanceProjects = financeProjects.filter(p => p.status === 'ongoing').length;
      const activeComplianceProjects = complianceProjects.filter(p => p.status === 'active').length;
      const activeDocuments = documents.filter(d => d.status === 'active').length;

      setStats([
        { title: 'Active Employees', value: activeEmployees, icon: Users, color: 'blue' },
        { title: 'Departments', value: departments.length, icon: Building2, color: 'purple' },
        { title: 'Positions', value: positions.length, icon: Briefcase, color: 'green' },
        { title: 'Present Today', value: presentToday, icon: UserCheck, color: 'indigo' },
        { title: 'Active Donors', value: activeDonors, icon: HandCoins, color: 'emerald' },
        { title: 'Active Finance Projects', value: activeFinanceProjects, icon: FolderOpen, color: 'yellow' },
        { title: 'Active Compliance Projects', value: activeComplianceProjects, icon: ClipboardCheck, color: 'pink' },
        { title: 'Active Documents', value: activeDocuments, icon: FileText, color: 'red' },
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    pink: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Welcome back! Here's an overview of your organization.
        </p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`rounded-full p-3 ${colorClasses[stat.color]}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
