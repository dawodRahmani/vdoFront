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
  GraduationCap,
  Heart,
  Shield,
  Award,
  Languages,
  Folder,
  Download,
  Plus,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  BadgeCheck,
  History,
  ClipboardList,
  FileCheck
} from 'lucide-react';

const EMPLOYMENT_STATUSES = {
  pre_boarding: { label: 'Pre-Boarding', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
  onboarding: { label: 'Onboarding', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  probation: { label: 'Probation', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  active: { label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  suspended: { label: 'Suspended', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
  on_leave: { label: 'On Leave', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
  notice_period: { label: 'Notice Period', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400' },
  separated: { label: 'Separated', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400' },
  terminated: { label: 'Terminated', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
};

const EMPLOYMENT_TYPES = {
  core: 'Core Staff',
  project: 'Project Staff',
  consultant: 'Consultant',
  part_time: 'Part-Time',
  intern: 'Intern',
  volunteer: 'Volunteer',
  daily_wage: 'Daily Wage',
  temporary: 'Temporary'
};

const EmployeeProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    loadEmployee();
  }, [id]);

  const loadEmployee = async () => {
    setLoading(true);
    try {
      // Simulated data - replace with API call
      const mockEmployee = {
        id: 1,
        employee_code: 'VDO-EMP-0001',
        full_name: 'Ahmad Shah Ahmadi',
        father_name: 'Mohammad Shah',
        date_of_birth: '1990-05-15',
        gender: 'male',
        nationality: 'Afghan',
        national_id_type: 'tazkira',
        national_id_number: '1234-5678-9012',
        tax_id: 'TAX-001234',
        marital_status: 'married',
        phone_primary: '+93700123456',
        phone_secondary: '+93799123456',
        personal_email: 'ahmad.shah@gmail.com',
        current_address: 'House 123, Street 4, Karte-e-Mamorin',
        current_city: 'Kabul',
        current_province: 'Kabul',
        permanent_address: 'House 45, Street 2, District 3',
        permanent_city: 'Kabul',
        permanent_province: 'Kabul',
        bank_name: 'Afghanistan International Bank',
        bank_branch: 'Kabul Main Branch',
        account_name: 'Ahmad Shah Ahmadi',
        account_number: '1234567890123',
        mobile_money_number: '+93700123456',
        position: 'Program Manager',
        department: 'Programs',
        project: 'Education Support Project',
        reporting_to: 'Sara Mohammadi (Program Director)',
        date_of_hire: '2020-03-15',
        employment_type: 'core',
        employment_status: 'active',
        probation_end_date: '2020-06-15',
        contract_end_date: null,
        photo_path: null,
        emergency_contacts: [
          { id: 1, contact_type: 'primary', full_name: 'Fatima Ahmadi', relationship: 'spouse', phone_primary: '+93700111222', phone_secondary: null, address: 'Same as employee' },
          { id: 2, contact_type: 'secondary', full_name: 'Mohammad Shah', relationship: 'parent', phone_primary: '+93700333444', phone_secondary: null, address: 'Kabul' }
        ],
        educations: [
          { id: 1, degree_level: 'masters', degree_name: 'Master of Business Administration', specialization: 'Project Management', institution_name: 'Kabul University', country: 'Afghanistan', graduation_year: 2015, is_verified: true },
          { id: 2, degree_level: 'bachelors', degree_name: 'Bachelor of Economics', specialization: 'Economics', institution_name: 'Kabul University', country: 'Afghanistan', graduation_year: 2012, is_verified: true }
        ],
        work_experiences: [
          { id: 1, organization_name: 'UNDP Afghanistan', position_held: 'Program Officer', start_date: '2018-01-01', end_date: '2020-02-28', is_current: false, reason_for_leaving: 'Career Growth', verification_status: 'verified' },
          { id: 2, organization_name: 'World Vision', position_held: 'Project Assistant', start_date: '2015-06-01', end_date: '2017-12-31', is_current: false, reason_for_leaving: 'Contract End', verification_status: 'verified' }
        ],
        skills: [
          { id: 1, skill_type: 'language', skill_name: 'English', proficiency_level: 'advanced' },
          { id: 2, skill_type: 'language', skill_name: 'Dari', proficiency_level: 'native' },
          { id: 3, skill_type: 'language', skill_name: 'Pashto', proficiency_level: 'intermediate' },
          { id: 4, skill_type: 'technical', skill_name: 'Project Management', proficiency_level: 'expert' },
          { id: 5, skill_type: 'certification', skill_name: 'PMP', proficiency_level: 'expert', certificate_name: 'Project Management Professional', certificate_issuer: 'PMI', certificate_date: '2019-06-01', expiry_date: '2025-06-01' }
        ],
        medical_info: {
          blood_type: 'O+',
          special_needs: null
        },
        contracts: [
          { id: 1, contract_number: 'CTR-2020-001', contract_type: 'core', start_date: '2020-03-15', end_date: null, status: 'active', base_salary: 85000 }
        ],
        policy_acknowledgements: [
          { id: 1, policy_type: 'confidentiality_nda', policy_version: '2.0', acknowledged_at: '2024-01-15' },
          { id: 2, policy_type: 'code_of_conduct', policy_version: '3.1', acknowledged_at: '2024-01-15' },
          { id: 3, policy_type: 'safeguarding_pseah', policy_version: '1.5', acknowledged_at: '2024-01-15' },
          { id: 4, policy_type: 'whistleblowing', policy_version: '1.0', acknowledged_at: '2024-01-15' },
          { id: 5, policy_type: 'conflict_of_interest', policy_version: '1.2', acknowledged_at: '2024-01-15' }
        ],
        status_history: [
          { id: 1, previous_status: 'onboarding', new_status: 'probation', effective_date: '2020-03-15', reason: 'Onboarding completed' },
          { id: 2, previous_status: 'probation', new_status: 'active', effective_date: '2020-06-15', reason: 'Probation completed successfully' }
        ],
        created_at: '2020-03-10',
        updated_at: '2024-01-15'
      };

      setEmployee(mockEmployee);
    } catch (error) {
      console.error('Error loading employee:', error);
      navigate('/employee-admin/employees');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount, currency = 'AFN') => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const InfoItem = ({ icon: Icon, label, value, className = '' }) => (
    <div className={`flex items-start space-x-3 ${className}`}>
      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0">
        <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white break-words">{value || '-'}</p>
      </div>
    </div>
  );

  const SectionHeader = ({ title, icon: Icon, collapsible = false, sectionKey }) => (
    <div
      className={`flex items-center justify-between py-3 ${collapsible ? 'cursor-pointer' : ''}`}
      onClick={collapsible ? () => toggleSection(sectionKey) : undefined}
    >
      <div className="flex items-center space-x-2">
        <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      {collapsible && (
        expandedSections[sectionKey] ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )
      )}
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
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'experience', label: 'Experience', icon: Award },
    { id: 'skills', label: 'Skills', icon: Languages },
    { id: 'banking', label: 'Banking', icon: CreditCard },
    { id: 'emergency', label: 'Emergency', icon: Heart },
    { id: 'documents', label: 'Documents', icon: Folder },
    { id: 'policies', label: 'Policies', icon: Shield },
    { id: 'history', label: 'History', icon: History }
  ];

  const statusConfig = EMPLOYMENT_STATUSES[employee.employment_status] || EMPLOYMENT_STATUSES.active;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/employee-admin/employees')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Profile</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Comprehensive employee information
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/employee-admin/employees/${id}/edit`)}
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
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                employee.gender === 'female' ? 'bg-pink-200' : 'bg-blue-200'
              }`}>
                <span className={`text-2xl font-bold ${
                  employee.gender === 'female' ? 'text-pink-700' : 'text-blue-700'
                }`}>
                  {employee.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{employee.full_name}</h2>
                <p className="text-primary-100">{employee.position || 'No Position Assigned'}</p>
                <p className="text-primary-200 text-sm">{employee.employee_code}</p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end space-y-2">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
              <span className="text-primary-100 text-sm">
                {EMPLOYMENT_TYPES[employee.employment_type] || employee.employment_type}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 dark:bg-gray-700/50">
          <InfoItem icon={Mail} label="Email" value={employee.personal_email} />
          <InfoItem icon={Phone} label="Phone" value={employee.phone_primary} />
          <InfoItem icon={Building} label="Department" value={employee.department} />
          <InfoItem icon={Calendar} label="Hire Date" value={formatDate(employee.date_of_hire)} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => navigate(`/employee-admin/employees/${id}/onboarding`)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          <ClipboardList className="w-4 h-4" />
          <span>View Onboarding</span>
        </button>
        <button
          onClick={() => navigate(`/employee-admin/contracts?employee=${id}`)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
        >
          <FileText className="w-4 h-4" />
          <span>View Contracts</span>
        </button>
        <button
          onClick={() => navigate(`/employee-admin/employees/${id}/personnel-file`)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
        >
          <Folder className="w-4 h-4" />
          <span>Personnel File</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <nav className="flex space-x-2 px-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
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
                <SectionHeader title="Personal Information" icon={User} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                  <InfoItem icon={User} label="Full Name" value={employee.full_name} />
                  <InfoItem icon={User} label="Father's Name" value={employee.father_name} />
                  <InfoItem icon={Calendar} label="Date of Birth" value={formatDate(employee.date_of_birth)} />
                  <InfoItem icon={User} label="Gender" value={employee.gender?.charAt(0).toUpperCase() + employee.gender?.slice(1)} />
                  <InfoItem icon={User} label="Marital Status" value={employee.marital_status?.charAt(0).toUpperCase() + employee.marital_status?.slice(1)} />
                  <InfoItem icon={FileText} label="Nationality" value={employee.nationality} />
                  <InfoItem icon={CreditCard} label={`${employee.national_id_type?.toUpperCase() || 'ID'} Number`} value={employee.national_id_number} />
                  <InfoItem icon={FileText} label="Tax ID" value={employee.tax_id} />
                </div>
              </div>

              <div>
                <SectionHeader title="Contact Information" icon={Phone} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                  <InfoItem icon={Phone} label="Primary Phone" value={employee.phone_primary} />
                  <InfoItem icon={Phone} label="Secondary Phone" value={employee.phone_secondary} />
                  <InfoItem icon={Mail} label="Personal Email" value={employee.personal_email} />
                </div>
              </div>

              <div>
                <SectionHeader title="Address Information" icon={MapPin} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Current Address</h4>
                    <p className="text-gray-600 dark:text-gray-400">{employee.current_address}</p>
                    <p className="text-gray-600 dark:text-gray-400">{employee.current_city}, {employee.current_province}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Permanent Address</h4>
                    <p className="text-gray-600 dark:text-gray-400">{employee.permanent_address || 'Same as current'}</p>
                    <p className="text-gray-600 dark:text-gray-400">{employee.permanent_city}, {employee.permanent_province}</p>
                  </div>
                </div>
              </div>

              <div>
                <SectionHeader title="Medical Information" icon={Heart} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                  <InfoItem icon={Heart} label="Blood Type" value={employee.medical_info?.blood_type} />
                  <InfoItem icon={Heart} label="Special Needs" value={employee.medical_info?.special_needs || 'None'} />
                </div>
              </div>
            </div>
          )}

          {/* Employment Tab */}
          {activeTab === 'employment' && (
            <div className="space-y-6">
              <div>
                <SectionHeader title="Employment Details" icon={Briefcase} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                  <InfoItem icon={Building} label="Department" value={employee.department} />
                  <InfoItem icon={Briefcase} label="Position" value={employee.position} />
                  <InfoItem icon={Folder} label="Project" value={employee.project} />
                  <InfoItem icon={User} label="Reports To" value={employee.reporting_to} />
                  <InfoItem icon={FileText} label="Employment Type" value={EMPLOYMENT_TYPES[employee.employment_type]} />
                  <InfoItem icon={CheckCircle} label="Employment Status" value={statusConfig.label} />
                </div>
              </div>

              <div>
                <SectionHeader title="Important Dates" icon={Calendar} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                  <InfoItem icon={Calendar} label="Date of Hire" value={formatDate(employee.date_of_hire)} />
                  <InfoItem icon={Calendar} label="Probation End Date" value={formatDate(employee.probation_end_date)} />
                  <InfoItem icon={Calendar} label="Contract End Date" value={formatDate(employee.contract_end_date) || 'Indefinite'} />
                </div>
              </div>

              {/* Current Contract */}
              {employee.contracts?.length > 0 && (
                <div>
                  <SectionHeader title="Current Contract" icon={FileText} />
                  <div className="mt-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    {employee.contracts.filter(c => c.status === 'active').map(contract => (
                      <div key={contract.id} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Contract Number</p>
                          <p className="font-medium text-gray-900 dark:text-white">{contract.contract_number}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
                          <p className="font-medium text-gray-900 dark:text-white">{EMPLOYMENT_TYPES[contract.contract_type]}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Start Date</p>
                          <p className="font-medium text-gray-900 dark:text-white">{formatDate(contract.start_date)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Base Salary</p>
                          <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(contract.base_salary)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Education Tab */}
          {activeTab === 'education' && (
            <div className="space-y-6">
              <SectionHeader title="Education History" icon={GraduationCap} />
              {employee.educations?.length > 0 ? (
                <div className="space-y-4">
                  {employee.educations.map((edu) => (
                    <div key={edu.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                            <GraduationCap className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{edu.degree_name}</h4>
                            <p className="text-gray-600 dark:text-gray-400">{edu.institution_name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {edu.specialization} | {edu.graduation_year} | {edu.country}
                            </p>
                          </div>
                        </div>
                        {edu.is_verified && (
                          <span className="flex items-center text-green-600 dark:text-green-400 text-sm">
                            <BadgeCheck className="w-4 h-4 mr-1" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No education records found</p>
                </div>
              )}
            </div>
          )}

          {/* Experience Tab */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              <SectionHeader title="Work Experience" icon={Award} />
              {employee.work_experiences?.length > 0 ? (
                <div className="space-y-4">
                  {employee.work_experiences.map((exp) => (
                    <div key={exp.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">{exp.position_held}</h4>
                            <p className="text-gray-600 dark:text-gray-400">{exp.organization_name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(exp.start_date)} - {exp.is_current ? 'Present' : formatDate(exp.end_date)}
                            </p>
                            {exp.reason_for_leaving && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Reason for leaving: {exp.reason_for_leaving}
                              </p>
                            )}
                          </div>
                        </div>
                        {exp.verification_status === 'verified' && (
                          <span className="flex items-center text-green-600 dark:text-green-400 text-sm">
                            <BadgeCheck className="w-4 h-4 mr-1" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No work experience records found</p>
                </div>
              )}
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              {/* Languages */}
              <div>
                <SectionHeader title="Languages" icon={Languages} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {employee.skills?.filter(s => s.skill_type === 'language').map((skill) => (
                    <div key={skill.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">{skill.skill_name}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          skill.proficiency_level === 'native' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          skill.proficiency_level === 'advanced' || skill.proficiency_level === 'expert' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {skill.proficiency_level?.charAt(0).toUpperCase() + skill.proficiency_level?.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Skills */}
              <div>
                <SectionHeader title="Technical Skills" icon={Award} />
                <div className="flex flex-wrap gap-2 mt-4">
                  {employee.skills?.filter(s => s.skill_type === 'technical').map((skill) => (
                    <span key={skill.id} className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm">
                      {skill.skill_name} ({skill.proficiency_level})
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <SectionHeader title="Certifications" icon={FileCheck} />
                <div className="space-y-4 mt-4">
                  {employee.skills?.filter(s => s.skill_type === 'certification').map((skill) => (
                    <div key={skill.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{skill.certificate_name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{skill.certificate_issuer}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Issued: {formatDate(skill.certificate_date)} | Expires: {formatDate(skill.expiry_date)}
                          </p>
                        </div>
                        <BadgeCheck className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Banking Tab */}
          {activeTab === 'banking' && (
            <div className="space-y-6">
              <SectionHeader title="Banking Information" icon={CreditCard} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Bank Account</h4>
                  <div className="space-y-4">
                    <InfoItem icon={Building} label="Bank Name" value={employee.bank_name} />
                    <InfoItem icon={MapPin} label="Branch" value={employee.bank_branch} />
                    <InfoItem icon={User} label="Account Name" value={employee.account_name} />
                    <InfoItem icon={CreditCard} label="Account Number" value={employee.account_number} />
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Mobile Money</h4>
                  <InfoItem icon={Phone} label="Mobile Money Number" value={employee.mobile_money_number} />
                </div>
              </div>
            </div>
          )}

          {/* Emergency Tab */}
          {activeTab === 'emergency' && (
            <div className="space-y-6">
              <SectionHeader title="Emergency Contacts" icon={Heart} />
              {employee.emergency_contacts?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employee.emergency_contacts.map((contact) => (
                    <div key={contact.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          contact.contact_type === 'primary' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {contact.contact_type?.charAt(0).toUpperCase() + contact.contact_type?.slice(1)}
                        </span>
                      </div>
                      <div className="space-y-3">
                        <InfoItem icon={User} label="Name" value={contact.full_name} />
                        <InfoItem icon={Users} label="Relationship" value={contact.relationship?.charAt(0).toUpperCase() + contact.relationship?.slice(1)} />
                        <InfoItem icon={Phone} label="Phone" value={contact.phone_primary} />
                        {contact.address && <InfoItem icon={MapPin} label="Address" value={contact.address} />}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No emergency contacts found</p>
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <SectionHeader title="Personnel File Documents" icon={Folder} />
                <button
                  onClick={() => navigate(`/employee-admin/employees/${id}/personnel-file`)}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Folder className="w-4 h-4" />
                  <span>Manage Files</span>
                </button>
              </div>
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>View and manage documents in Personnel File</p>
                <button
                  onClick={() => navigate(`/employee-admin/employees/${id}/personnel-file`)}
                  className="mt-4 text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Go to Personnel File
                </button>
              </div>
            </div>
          )}

          {/* Policies Tab */}
          {activeTab === 'policies' && (
            <div className="space-y-6">
              <SectionHeader title="Policy Acknowledgements" icon={Shield} />
              {employee.policy_acknowledgements?.length > 0 ? (
                <div className="space-y-3">
                  {employee.policy_acknowledgements.map((policy) => (
                    <div key={policy.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {policy.policy_type?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Version {policy.policy_version}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(policy.acknowledged_at)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No policy acknowledgements found</p>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <SectionHeader title="Status History" icon={History} />
              {employee.status_history?.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                  <div className="space-y-6">
                    {employee.status_history.map((history, index) => (
                      <div key={history.id} className="relative flex items-start space-x-4 ml-2">
                        <div className="w-4 h-4 rounded-full bg-primary-600 border-4 border-white dark:border-gray-800 z-10" />
                        <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${EMPLOYMENT_STATUSES[history.previous_status]?.color || ''}`}>
                                {EMPLOYMENT_STATUSES[history.previous_status]?.label || history.previous_status}
                              </span>
                              <span className="text-gray-400">→</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${EMPLOYMENT_STATUSES[history.new_status]?.color || ''}`}>
                                {EMPLOYMENT_STATUSES[history.new_status]?.label || history.new_status}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(history.effective_date)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{history.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No status history found</p>
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
            <span>Created: {formatDate(employee.created_at)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Last Updated: {formatDate(employee.updated_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
