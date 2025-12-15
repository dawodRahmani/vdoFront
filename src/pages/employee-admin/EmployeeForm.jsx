import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  User,
  Phone,
  Briefcase,
  CreditCard,
  Heart,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  GraduationCap,
  Award,
  Languages
} from 'lucide-react';

const EMPLOYMENT_TYPES = [
  { value: 'core', label: 'Core Staff' },
  { value: 'project', label: 'Project Staff' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'part_time', label: 'Part-Time' },
  { value: 'intern', label: 'Intern' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'daily_wage', label: 'Daily Wage' },
  { value: 'temporary', label: 'Temporary' }
];

const DEGREE_LEVELS = [
  { value: 'high_school', label: 'High School' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'bachelors', label: "Bachelor's" },
  { value: 'masters', label: "Master's" },
  { value: 'phd', label: 'PhD' },
  { value: 'other', label: 'Other' }
];

const SKILL_TYPES = [
  { value: 'technical', label: 'Technical' },
  { value: 'language', label: 'Language' },
  { value: 'certification', label: 'Certification' },
  { value: 'other', label: 'Other' }
];

const PROFICIENCY_LEVELS = [
  { value: 'basic', label: 'Basic' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
  { value: 'native', label: 'Native' }
];

const EmployeeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [formData, setFormData] = useState({
    // Personal Info
    full_name: '',
    father_name: '',
    date_of_birth: '',
    gender: 'male',
    nationality: 'Afghan',
    national_id_type: 'tazkira',
    national_id_number: '',
    tax_id: '',
    marital_status: 'single',
    // Contact Info
    phone_primary: '',
    phone_secondary: '',
    personal_email: '',
    current_address: '',
    current_city: '',
    current_province: '',
    permanent_address: '',
    permanent_city: '',
    permanent_province: '',
    // Employment Info
    position_id: '',
    department_id: '',
    project_id: '',
    reporting_to_id: '',
    date_of_hire: '',
    employment_type: 'core',
    probation_period_months: 3,
    // Banking Info
    bank_name: '',
    bank_branch: '',
    account_name: '',
    account_number: '',
    mobile_money_number: '',
    // Emergency Contacts
    emergency_contacts: [
      { contact_type: 'primary', full_name: '', relationship: '', phone_primary: '', phone_secondary: '', address: '' }
    ],
    // Education
    educations: [],
    // Skills
    skills: [],
    // Medical
    blood_type: '',
    special_needs: ''
  });

  const [referenceData, setReferenceData] = useState({
    departments: [],
    positions: [],
    projects: [],
    employees: [],
    provinces: []
  });

  useEffect(() => {
    loadReferenceData();
    if (isEditing) {
      loadEmployee();
    }
  }, [id]);

  const loadReferenceData = async () => {
    // Simulated data - replace with API calls
    setReferenceData({
      departments: [
        { id: 1, name: 'Programs' },
        { id: 2, name: 'Finance' },
        { id: 3, name: 'HR & Administration' },
        { id: 4, name: 'Operations' },
        { id: 5, name: 'IT' },
        { id: 6, name: 'Monitoring & Evaluation' }
      ],
      positions: [
        { id: 1, name: 'Program Manager' },
        { id: 2, name: 'Program Officer' },
        { id: 3, name: 'Finance Officer' },
        { id: 4, name: 'HR Manager' },
        { id: 5, name: 'IT Specialist' },
        { id: 6, name: 'Driver' }
      ],
      projects: [
        { id: 1, name: 'Education Support Project' },
        { id: 2, name: 'Health Initiative' },
        { id: 3, name: 'Livelihood Program' }
      ],
      employees: [
        { id: 1, name: 'Sara Mohammadi (Program Director)' },
        { id: 2, name: 'Ali Rezaei (Finance Director)' }
      ],
      provinces: [
        { id: 1, name: 'Kabul' },
        { id: 2, name: 'Herat' },
        { id: 3, name: 'Balkh' },
        { id: 4, name: 'Nangarhar' },
        { id: 5, name: 'Kandahar' }
      ]
    });
  };

  const loadEmployee = async () => {
    setLoading(true);
    try {
      // API call to load employee data
      // Simulated for now
    } catch (error) {
      console.error('Error loading employee:', error);
      showToast('Failed to load employee', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmergencyContactChange = (index, field, value) => {
    const updated = [...formData.emergency_contacts];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, emergency_contacts: updated }));
  };

  const addEmergencyContact = () => {
    if (formData.emergency_contacts.length < 2) {
      setFormData(prev => ({
        ...prev,
        emergency_contacts: [
          ...prev.emergency_contacts,
          { contact_type: 'secondary', full_name: '', relationship: '', phone_primary: '', phone_secondary: '', address: '' }
        ]
      }));
    }
  };

  const removeEmergencyContact = (index) => {
    if (formData.emergency_contacts.length > 1) {
      const updated = formData.emergency_contacts.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, emergency_contacts: updated }));
    }
  };

  const handleEducationChange = (index, field, value) => {
    const updated = [...formData.educations];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, educations: updated }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      educations: [
        ...prev.educations,
        { degree_level: 'bachelors', degree_name: '', specialization: '', institution_name: '', country: 'Afghanistan', graduation_year: '' }
      ]
    }));
  };

  const removeEducation = (index) => {
    const updated = formData.educations.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, educations: updated }));
  };

  const handleSkillChange = (index, field, value) => {
    const updated = [...formData.skills];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, skills: updated }));
  };

  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      skills: [
        ...prev.skills,
        { skill_type: 'technical', skill_name: '', proficiency_level: 'intermediate' }
      ]
    }));
  };

  const removeSkill = (index) => {
    const updated = formData.skills.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, skills: updated }));
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.full_name && formData.father_name && formData.date_of_birth && formData.gender && formData.national_id_number;
      case 2:
        return formData.phone_primary && formData.current_address && formData.current_city;
      case 3:
        return formData.department_id && formData.position_id && formData.date_of_hire && formData.employment_type;
      case 4:
        return true; // Banking is optional
      case 5:
        return formData.emergency_contacts[0]?.full_name && formData.emergency_contacts[0]?.phone_primary;
      case 6:
        return true; // Education is optional
      case 7:
        return true; // Skills is optional
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    } else {
      showToast('Please fill in all required fields', 'error');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setSaving(true);
    try {
      // API call to save employee
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
      showToast(isEditing ? 'Employee updated successfully' : 'Employee created successfully', 'success');
      setTimeout(() => navigate('/employee-admin/employees'), 1500);
    } catch (error) {
      console.error('Error saving employee:', error);
      showToast('Failed to save employee', 'error');
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { id: 1, label: 'Personal Info', icon: User },
    { id: 2, label: 'Contact', icon: Phone },
    { id: 3, label: 'Employment', icon: Briefcase },
    { id: 4, label: 'Banking', icon: CreditCard },
    { id: 5, label: 'Emergency', icon: Heart },
    { id: 6, label: 'Education', icon: GraduationCap },
    { id: 7, label: 'Skills', icon: Languages }
  ];

  const InputField = ({ label, required, ...props }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        {...props}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
    </div>
  );

  const SelectField = ({ label, required, options, ...props }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        {...props}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      >
        <option value="">Select...</option>
        {options.map(opt => (
          <option key={opt.value || opt.id} value={opt.value || opt.id}>
            {opt.label || opt.name}
          </option>
        ))}
      </select>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center space-x-2 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/employee-admin/employees')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Employee' : 'Add New Employee'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isEditing ? 'Update employee information' : 'Create a new employee record'}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between overflow-x-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  currentStep === step.id
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : currentStep > step.id
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-400'
                }`}
                onClick={() => setCurrentStep(step.id)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === step.id
                    ? 'bg-primary-600 text-white'
                    : currentStep > step.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                </div>
                <span className="hidden md:block text-sm font-medium whitespace-nowrap">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-2 ${currentStep > step.id ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InputField label="Full Name" required type="text" value={formData.full_name} onChange={(e) => handleChange('full_name', e.target.value)} placeholder="Enter full name" />
              <InputField label="Father's Name" required type="text" value={formData.father_name} onChange={(e) => handleChange('father_name', e.target.value)} placeholder="Enter father's name" />
              <InputField label="Date of Birth" required type="date" value={formData.date_of_birth} onChange={(e) => handleChange('date_of_birth', e.target.value)} />
              <SelectField label="Gender" required value={formData.gender} onChange={(e) => handleChange('gender', e.target.value)} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} />
              <SelectField label="Marital Status" value={formData.marital_status} onChange={(e) => handleChange('marital_status', e.target.value)} options={[{ value: 'single', label: 'Single' }, { value: 'married', label: 'Married' }, { value: 'divorced', label: 'Divorced' }, { value: 'widowed', label: 'Widowed' }]} />
              <InputField label="Nationality" type="text" value={formData.nationality} onChange={(e) => handleChange('nationality', e.target.value)} placeholder="Afghan" />
              <SelectField label="ID Type" required value={formData.national_id_type} onChange={(e) => handleChange('national_id_type', e.target.value)} options={[{ value: 'tazkira', label: 'Tazkira' }, { value: 'passport', label: 'Passport' }, { value: 'other', label: 'Other' }]} />
              <InputField label="ID Number" required type="text" value={formData.national_id_number} onChange={(e) => handleChange('national_id_number', e.target.value)} placeholder="Enter ID number" />
              <InputField label="Tax ID" type="text" value={formData.tax_id} onChange={(e) => handleChange('tax_id', e.target.value)} placeholder="Enter tax ID" />
            </div>
          </div>
        )}

        {/* Step 2: Contact Info */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InputField label="Primary Phone" required type="tel" value={formData.phone_primary} onChange={(e) => handleChange('phone_primary', e.target.value)} placeholder="+93..." />
              <InputField label="Secondary Phone" type="tel" value={formData.phone_secondary} onChange={(e) => handleChange('phone_secondary', e.target.value)} placeholder="+93..." />
              <InputField label="Personal Email" type="email" value={formData.personal_email} onChange={(e) => handleChange('personal_email', e.target.value)} placeholder="email@example.com" />
            </div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mt-6">Current Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-3">
                <InputField label="Address" required type="text" value={formData.current_address} onChange={(e) => handleChange('current_address', e.target.value)} placeholder="House, Street, Area" />
              </div>
              <InputField label="City" required type="text" value={formData.current_city} onChange={(e) => handleChange('current_city', e.target.value)} placeholder="City" />
              <SelectField label="Province" value={formData.current_province} onChange={(e) => handleChange('current_province', e.target.value)} options={referenceData.provinces} />
            </div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mt-6">Permanent Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-3">
                <InputField label="Address" type="text" value={formData.permanent_address} onChange={(e) => handleChange('permanent_address', e.target.value)} placeholder="House, Street, Area (leave blank if same as current)" />
              </div>
              <InputField label="City" type="text" value={formData.permanent_city} onChange={(e) => handleChange('permanent_city', e.target.value)} placeholder="City" />
              <SelectField label="Province" value={formData.permanent_province} onChange={(e) => handleChange('permanent_province', e.target.value)} options={referenceData.provinces} />
            </div>
          </div>
        )}

        {/* Step 3: Employment Info */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Employment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SelectField label="Department" required value={formData.department_id} onChange={(e) => handleChange('department_id', e.target.value)} options={referenceData.departments} />
              <SelectField label="Position" required value={formData.position_id} onChange={(e) => handleChange('position_id', e.target.value)} options={referenceData.positions} />
              <SelectField label="Project" value={formData.project_id} onChange={(e) => handleChange('project_id', e.target.value)} options={referenceData.projects} />
              <SelectField label="Reports To" value={formData.reporting_to_id} onChange={(e) => handleChange('reporting_to_id', e.target.value)} options={referenceData.employees} />
              <InputField label="Date of Hire" required type="date" value={formData.date_of_hire} onChange={(e) => handleChange('date_of_hire', e.target.value)} />
              <SelectField label="Employment Type" required value={formData.employment_type} onChange={(e) => handleChange('employment_type', e.target.value)} options={EMPLOYMENT_TYPES} />
              <InputField label="Probation Period (months)" type="number" min="0" max="12" value={formData.probation_period_months} onChange={(e) => handleChange('probation_period_months', e.target.value)} />
            </div>
          </div>
        )}

        {/* Step 4: Banking Info */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Banking Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InputField label="Bank Name" type="text" value={formData.bank_name} onChange={(e) => handleChange('bank_name', e.target.value)} placeholder="Enter bank name" />
              <InputField label="Branch" type="text" value={formData.bank_branch} onChange={(e) => handleChange('bank_branch', e.target.value)} placeholder="Enter branch name" />
              <InputField label="Account Name" type="text" value={formData.account_name} onChange={(e) => handleChange('account_name', e.target.value)} placeholder="Account holder name" />
              <InputField label="Account Number" type="text" value={formData.account_number} onChange={(e) => handleChange('account_number', e.target.value)} placeholder="Enter account number" />
              <InputField label="Mobile Money Number" type="tel" value={formData.mobile_money_number} onChange={(e) => handleChange('mobile_money_number', e.target.value)} placeholder="+93..." />
            </div>
          </div>
        )}

        {/* Step 5: Emergency Contacts */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Emergency Contacts</h3>
              {formData.emergency_contacts.length < 2 && (
                <button
                  type="button"
                  onClick={addEmergencyContact}
                  className="flex items-center space-x-2 px-3 py-2 text-sm bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Contact</span>
                </button>
              )}
            </div>
            {formData.emergency_contacts.map((contact, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {index === 0 ? 'Primary Contact' : 'Secondary Contact'}
                  </span>
                  {index > 0 && (
                    <button type="button" onClick={() => removeEmergencyContact(index)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InputField label="Full Name" required={index === 0} type="text" value={contact.full_name} onChange={(e) => handleEmergencyContactChange(index, 'full_name', e.target.value)} placeholder="Contact name" />
                  <SelectField label="Relationship" value={contact.relationship} onChange={(e) => handleEmergencyContactChange(index, 'relationship', e.target.value)} options={[{ value: 'spouse', label: 'Spouse' }, { value: 'parent', label: 'Parent' }, { value: 'sibling', label: 'Sibling' }, { value: 'child', label: 'Child' }, { value: 'friend', label: 'Friend' }, { value: 'other', label: 'Other' }]} />
                  <InputField label="Phone" required={index === 0} type="tel" value={contact.phone_primary} onChange={(e) => handleEmergencyContactChange(index, 'phone_primary', e.target.value)} placeholder="+93..." />
                  <InputField label="Secondary Phone" type="tel" value={contact.phone_secondary} onChange={(e) => handleEmergencyContactChange(index, 'phone_secondary', e.target.value)} placeholder="+93..." />
                  <div className="md:col-span-2">
                    <InputField label="Address" type="text" value={contact.address} onChange={(e) => handleEmergencyContactChange(index, 'address', e.target.value)} placeholder="Address" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 6: Education */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Education History</h3>
              <button
                type="button"
                onClick={addEducation}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30"
              >
                <Plus className="w-4 h-4" />
                <span>Add Education</span>
              </button>
            </div>
            {formData.educations.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No education records added</p>
                <button type="button" onClick={addEducation} className="mt-4 text-primary-600 dark:text-primary-400 hover:underline">
                  Add Education
                </button>
              </div>
            ) : (
              formData.educations.map((edu, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Education #{index + 1}</span>
                    <button type="button" onClick={() => removeEducation(index)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <SelectField label="Degree Level" value={edu.degree_level} onChange={(e) => handleEducationChange(index, 'degree_level', e.target.value)} options={DEGREE_LEVELS} />
                    <InputField label="Degree Name" type="text" value={edu.degree_name} onChange={(e) => handleEducationChange(index, 'degree_name', e.target.value)} placeholder="e.g., Bachelor of Science" />
                    <InputField label="Specialization" type="text" value={edu.specialization} onChange={(e) => handleEducationChange(index, 'specialization', e.target.value)} placeholder="e.g., Computer Science" />
                    <InputField label="Institution" type="text" value={edu.institution_name} onChange={(e) => handleEducationChange(index, 'institution_name', e.target.value)} placeholder="University/College name" />
                    <InputField label="Country" type="text" value={edu.country} onChange={(e) => handleEducationChange(index, 'country', e.target.value)} placeholder="Afghanistan" />
                    <InputField label="Graduation Year" type="number" min="1950" max="2030" value={edu.graduation_year} onChange={(e) => handleEducationChange(index, 'graduation_year', e.target.value)} placeholder="2020" />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Step 7: Skills */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Skills & Certifications</h3>
              <button
                type="button"
                onClick={addSkill}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30"
              >
                <Plus className="w-4 h-4" />
                <span>Add Skill</span>
              </button>
            </div>
            {formData.skills.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Languages className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No skills added</p>
                <button type="button" onClick={addSkill} className="mt-4 text-primary-600 dark:text-primary-400 hover:underline">
                  Add Skill
                </button>
              </div>
            ) : (
              formData.skills.map((skill, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Skill #{index + 1}</span>
                    <button type="button" onClick={() => removeSkill(index)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SelectField label="Type" value={skill.skill_type} onChange={(e) => handleSkillChange(index, 'skill_type', e.target.value)} options={SKILL_TYPES} />
                    <InputField label="Skill Name" type="text" value={skill.skill_name} onChange={(e) => handleSkillChange(index, 'skill_name', e.target.value)} placeholder="e.g., Project Management, English" />
                    <SelectField label="Proficiency" value={skill.proficiency_level} onChange={(e) => handleSkillChange(index, 'proficiency_level', e.target.value)} options={PROFICIENCY_LEVELS} />
                  </div>
                </div>
              ))
            )}

            {/* Medical Info */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-8">Medical Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField label="Blood Type" value={formData.blood_type} onChange={(e) => handleChange('blood_type', e.target.value)} options={[{ value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' }, { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' }, { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' }, { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' }, { value: 'unknown', label: 'Unknown' }]} />
              <InputField label="Special Needs" type="text" value={formData.special_needs} onChange={(e) => handleChange('special_needs', e.target.value)} placeholder="Any special needs or requirements" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center space-x-3">
          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? 'Update Employee' : 'Create Employee'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;
