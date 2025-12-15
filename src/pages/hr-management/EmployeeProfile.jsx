import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Building,
  DollarSign,
  Users,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
} from 'lucide-react';
import { employeeDB } from '../../services/db/indexedDB';

const EmployeeProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    loadEmployee();
  }, [id]);

  const loadEmployee = async () => {
    setLoading(true);
    try {
      const data = await employeeDB.getById(id);
      if (data) {
        setEmployee(data);
      } else {
        navigate('/hr/employees');
      }
    } catch (error) {
      console.error('Error loading employee:', error);
      navigate('/hr/employees');
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount, currency = 'AFN') => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate total salary
  const calculateTotalSalary = () => {
    if (!employee) return 0;
    const basic = parseFloat(employee.basicSalary) || 0;
    const housing = parseFloat(employee.housingAllowance) || 0;
    const transport = parseFloat(employee.transportAllowance) || 0;
    const communication = parseFloat(employee.communicationAllowance) || 0;
    const other = parseFloat(employee.otherAllowances) || 0;
    return basic + housing + transport + communication + other;
  };

  // Status badge
  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      on_leave: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
      terminated: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };

    const labels = {
      active: 'Active',
      on_leave: 'On Leave',
      inactive: 'Inactive',
      terminated: 'Terminated',
    };

    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status] || styles.inactive}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Employment type label
  const getEmploymentTypeLabel = (type) => {
    const labels = {
      full_time: 'Full Time',
      part_time: 'Part Time',
      contract: 'Contract',
      intern: 'Intern',
      temporary: 'Temporary',
    };
    return labels[type] || type;
  };

  // Info item component
  const InfoItem = ({ icon: Icon, label, value, className = '' }) => (
    <div className={`flex items-start space-x-3 ${className}`}>
      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{value || '-'}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">Employee not found</p>
      </div>
    );
  }

  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'employment', label: 'Employment', icon: Briefcase },
    { id: 'salary', label: 'Salary', icon: DollarSign },
    { id: 'emergency', label: 'Emergency', icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/hr/employees')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Profile</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              View detailed employee information
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/hr/employees/${id}/edit`)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Edit className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {employee.firstName?.[0]}{employee.lastName?.[0]}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {employee.title} {employee.firstName} {employee.lastName}
                </h2>
                <p className="text-primary-100">{employee.position || 'No Position Assigned'}</p>
                <p className="text-primary-200 text-sm">{employee.employeeId}</p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end space-y-2">
              {getStatusBadge(employee.status)}
              {employee.profileComplete ? (
                <span className="flex items-center text-sm text-green-200">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Profile Complete
                </span>
              ) : (
                <span className="flex items-center text-sm text-yellow-200">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Profile Incomplete
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 dark:bg-gray-700/50">
          <InfoItem icon={Mail} label="Email" value={employee.email} />
          <InfoItem icon={Phone} label="Phone" value={employee.phone} />
          <InfoItem icon={Building} label="Department" value={employee.department} />
          <InfoItem icon={Calendar} label="Hire Date" value={formatDate(employee.hireDate)} />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-4 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Personal Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InfoItem icon={User} label="Full Name" value={`${employee.title || ''} ${employee.firstName} ${employee.lastName}`.trim()} />
                  <InfoItem icon={User} label="Father's Name" value={employee.fatherName} />
                  <InfoItem icon={User} label="Grandfather's Name" value={employee.grandfatherName} />
                  <InfoItem icon={Calendar} label="Date of Birth" value={formatDate(employee.dateOfBirth)} />
                  <InfoItem icon={User} label="Gender" value={employee.gender ? employee.gender.charAt(0).toUpperCase() + employee.gender.slice(1) : '-'} />
                  <InfoItem icon={User} label="Marital Status" value={employee.maritalStatus ? employee.maritalStatus.charAt(0).toUpperCase() + employee.maritalStatus.slice(1) : '-'} />
                  <InfoItem icon={FileText} label="Nationality" value={employee.nationality} />
                  <InfoItem icon={CreditCard} label="National ID / Tazkira" value={employee.nationalId} />
                  <InfoItem icon={FileText} label="Passport Number" value={employee.passportNumber} />
                  <InfoItem icon={User} label="Blood Group" value={employee.bloodGroup} />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InfoItem icon={Mail} label="Work Email" value={employee.email} />
                  <InfoItem icon={Mail} label="Personal Email" value={employee.personalEmail} />
                  <InfoItem icon={Phone} label="Primary Phone" value={employee.phone} />
                  <InfoItem icon={Phone} label="Secondary Phone" value={employee.secondaryPhone} />
                  <div className="lg:col-span-3">
                    <InfoItem icon={MapPin} label="Current Address" value={employee.currentAddress} />
                  </div>
                  <div className="lg:col-span-3">
                    <InfoItem icon={MapPin} label="Permanent Address" value={employee.permanentAddress} />
                  </div>
                  <InfoItem icon={MapPin} label="City" value={employee.city} />
                  <InfoItem icon={MapPin} label="Province" value={employee.province} />
                  <InfoItem icon={MapPin} label="Country" value={employee.country} />
                </div>
              </div>
            </div>
          )}

          {/* Employment Tab */}
          {activeTab === 'employment' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Employment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InfoItem icon={Building} label="Department" value={employee.department} />
                  <InfoItem icon={Briefcase} label="Position" value={employee.position} />
                  <InfoItem icon={Building} label="Office" value={employee.office} />
                  <InfoItem icon={FileText} label="Grade" value={employee.grade} />
                  <InfoItem icon={Briefcase} label="Employment Type" value={getEmploymentTypeLabel(employee.employmentType)} />
                  <InfoItem icon={Clock} label="Work Schedule" value={employee.workSchedule ? employee.workSchedule.charAt(0).toUpperCase() + employee.workSchedule.slice(1).replace('_', ' ') : '-'} />
                  <InfoItem icon={User} label="Line Manager" value={employee.lineManager} />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Important Dates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InfoItem icon={Calendar} label="Hire Date" value={formatDate(employee.hireDate)} />
                  <InfoItem icon={Calendar} label="Probation End Date" value={formatDate(employee.probationEndDate)} />
                  <InfoItem icon={Calendar} label="Contract End Date" value={formatDate(employee.contractEndDate)} />
                </div>
              </div>
            </div>
          )}

          {/* Salary Tab */}
          {activeTab === 'salary' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Compensation Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InfoItem icon={DollarSign} label="Basic Salary" value={formatCurrency(employee.basicSalary, employee.currency)} />
                  <InfoItem icon={DollarSign} label="Currency" value={employee.currency || 'AFN'} />
                  <InfoItem icon={CreditCard} label="Payment Method" value={employee.paymentMethod ? employee.paymentMethod.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '-'} />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bank Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoItem icon={Building} label="Bank Name" value={employee.bankName} />
                  <InfoItem icon={CreditCard} label="Account Number" value={employee.bankAccountNumber} />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Allowances</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <InfoItem icon={DollarSign} label="Housing" value={formatCurrency(employee.housingAllowance, employee.currency)} />
                  <InfoItem icon={DollarSign} label="Transport" value={formatCurrency(employee.transportAllowance, employee.currency)} />
                  <InfoItem icon={DollarSign} label="Communication" value={formatCurrency(employee.communicationAllowance, employee.currency)} />
                  <InfoItem icon={DollarSign} label="Other" value={formatCurrency(employee.otherAllowances, employee.currency)} />
                </div>
              </div>

              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-primary-600 dark:text-primary-400">Total Monthly Compensation</p>
                    <p className="text-3xl font-bold text-primary-700 dark:text-primary-300">
                      {formatCurrency(calculateTotalSalary(), employee.currency)}
                    </p>
                  </div>
                  <div className="p-4 bg-primary-100 dark:bg-primary-800/30 rounded-full">
                    <DollarSign className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Contact Tab */}
          {activeTab === 'emergency' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Emergency Contact</h3>
                {employee.emergencyContactName ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <InfoItem icon={User} label="Contact Name" value={employee.emergencyContactName} />
                    <InfoItem icon={Users} label="Relationship" value={employee.emergencyContactRelationship ? employee.emergencyContactRelationship.charAt(0).toUpperCase() + employee.emergencyContactRelationship.slice(1) : '-'} />
                    <InfoItem icon={Phone} label="Phone" value={employee.emergencyContactPhone} />
                    <InfoItem icon={Mail} label="Email" value={employee.emergencyContactEmail} />
                    <div className="lg:col-span-2">
                      <InfoItem icon={MapPin} label="Address" value={employee.emergencyContactAddress} />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No emergency contact information provided</p>
                    <button
                      onClick={() => navigate(`/hr/employees/${id}/edit`)}
                      className="mt-4 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                    >
                      Add Emergency Contact
                    </button>
                  </div>
                )}
              </div>

              {employee.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Notes</h3>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{employee.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap gap-6 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Created: {formatDate(employee.createdAt)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Last Updated: {formatDate(employee.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
