import { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  X,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  ChevronRight,
  Search,
  Filter,
  Eye,
  Megaphone,
  Send
} from 'lucide-react';
import {
  jobRequisitionDB,
  jobAnnouncementDB,
  candidateDB,
  interviewDB,
  jobOfferDB,
  departmentDB,
  positionDB,
  seedAllDefaults
} from '../../services/db/indexedDB';

const Recruitment = () => {
  // Main state
  const [activeTab, setActiveTab] = useState('requisitions');
  const [loading, setLoading] = useState(true);

  // Requisition state
  const [requisitions, setRequisitions] = useState([]);
  const [showRequisitionModal, setShowRequisitionModal] = useState(false);
  const [editingRequisition, setEditingRequisition] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Announcement state
  const [announcements, setAnnouncements] = useState([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [selectedAnnouncementForCandidate, setSelectedAnnouncementForCandidate] = useState(null);

  // Candidate state
  const [candidates, setCandidates] = useState([]);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [selectedRequisitionForCandidate, setSelectedRequisitionForCandidate] = useState(null);

  // Interview state
  const [interviews, setInterviews] = useState([]);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);

  // Offer state
  const [offers, setOffers] = useState([]);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  // Reference data
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);

  // Statistics
  const [stats, setStats] = useState({
    totalRequisitions: 0,
    openPositions: 0,
    publishedAnnouncements: 0,
    totalCandidates: 0,
    scheduledInterviews: 0,
    pendingOffers: 0
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form data
  const [requisitionForm, setRequisitionForm] = useState({
    positionTitle: '',
    departmentId: '',
    numberOfPositions: 1,
    priority: 'medium',
    employmentType: 'full_time',
    salaryRangeMin: '',
    salaryRangeMax: '',
    description: '',
    requirements: '',
    status: 'draft'
  });

  const [announcementForm, setAnnouncementForm] = useState({
    requisitionId: '',
    title: '',
    description: '',
    requirements: '',
    benefits: '',
    location: '',
    publishDate: '',
    closingDate: '',
    channels: [],
    status: 'draft'
  });

  const [candidateForm, setCandidateForm] = useState({
    announcementId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    resumeUrl: '',
    source: 'website',
    status: 'new',
    notes: ''
  });

  const [interviewForm, setInterviewForm] = useState({
    candidateId: '',
    scheduledDate: '',
    scheduledTime: '',
    interviewType: 'phone',
    interviewers: '',
    location: '',
    notes: '',
    status: 'scheduled'
  });

  const [offerForm, setOfferForm] = useState({
    candidateId: '',
    positionTitle: '',
    departmentId: '',
    salary: '',
    startDate: '',
    offerDate: '',
    expiryDate: '',
    benefits: '',
    notes: '',
    status: 'draft'
  });

  const [errors, setErrors] = useState({});

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await seedAllDefaults();

      const [reqsData, annsData, candsData, intsData, offersData, deptsData, posData] = await Promise.all([
        jobRequisitionDB.getAll(),
        jobAnnouncementDB.getAll(),
        candidateDB.getAll(),
        interviewDB.getAll(),
        jobOfferDB.getAll(),
        departmentDB.getAll(),
        positionDB.getAll()
      ]);

      setRequisitions(reqsData);
      setAnnouncements(annsData);
      setCandidates(candsData);
      setInterviews(intsData);
      setOffers(offersData);
      setDepartments(deptsData);
      setPositions(posData);

      // Calculate stats
      setStats({
        totalRequisitions: reqsData.length,
        openPositions: reqsData.filter(r => r.status === 'open').length,
        publishedAnnouncements: annsData.filter(a => a.status === 'published').length,
        totalCandidates: candsData.length,
        scheduledInterviews: intsData.filter(i => i.status === 'scheduled').length,
        pendingOffers: offersData.filter(o => o.status === 'pending').length
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter requisitions
  const filteredRequisitions = requisitions.filter(req => {
    const matchesSearch = req.positionTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requisitionId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get department name by ID
  const getDepartmentName = (id) => {
    const dept = departments.find(d => d.id === Number(id));
    return dept?.name || 'Unknown';
  };

  // Get candidate by ID
  const getCandidate = (id) => {
    return candidates.find(c => c.id === Number(id));
  };

  // Get requisition by ID
  const getRequisition = (id) => {
    return requisitions.find(r => r.id === Number(id));
  };

  // Get announcement by ID
  const getAnnouncement = (id) => {
    return announcements.find(a => a.id === Number(id));
  };

  // Status badge colors
  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      open: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      on_hold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      filled: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      screening: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      interview: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      offer: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      hired: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      withdrawn: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      declined: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      expired: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return colors[status] || colors.draft;
  };

  // Priority badge colors
  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[priority] || colors.medium;
  };

  // ========== REQUISITION HANDLERS ==========
  const handleAddRequisition = () => {
    setEditingRequisition(null);
    setRequisitionForm({
      positionTitle: '',
      departmentId: departments[0]?.id || '',
      numberOfPositions: 1,
      priority: 'medium',
      employmentType: 'full_time',
      salaryRangeMin: '',
      salaryRangeMax: '',
      description: '',
      requirements: '',
      status: 'draft'
    });
    setErrors({});
    setShowRequisitionModal(true);
  };

  const handleEditRequisition = (req) => {
    setEditingRequisition(req);
    setRequisitionForm({
      positionTitle: req.positionTitle,
      departmentId: req.departmentId,
      numberOfPositions: req.numberOfPositions,
      priority: req.priority,
      employmentType: req.employmentType,
      salaryRangeMin: req.salaryRangeMin || '',
      salaryRangeMax: req.salaryRangeMax || '',
      description: req.description || '',
      requirements: req.requirements || '',
      status: req.status
    });
    setErrors({});
    setShowRequisitionModal(true);
  };

  const validateRequisitionForm = () => {
    const newErrors = {};
    if (!requisitionForm.positionTitle.trim()) {
      newErrors.positionTitle = 'Position title is required';
    }
    if (!requisitionForm.departmentId) {
      newErrors.departmentId = 'Department is required';
    }
    if (requisitionForm.numberOfPositions < 1) {
      newErrors.numberOfPositions = 'At least 1 position is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveRequisition = async () => {
    if (!validateRequisitionForm()) return;

    try {
      if (editingRequisition) {
        await jobRequisitionDB.update(editingRequisition.id, requisitionForm);
      } else {
        await jobRequisitionDB.create(requisitionForm);
      }
      setShowRequisitionModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving requisition:', error);
    }
  };

  const handleDeleteRequisition = async (id) => {
    try {
      await jobRequisitionDB.delete(id);
      setShowDeleteConfirm(null);
      loadData();
    } catch (error) {
      console.error('Error deleting requisition:', error);
    }
  };

  // ========== ANNOUNCEMENT HANDLERS ==========
  const handleAddAnnouncement = (requisitionId = null) => {
    const requisition = requisitionId ? getRequisition(requisitionId) : null;
    setEditingAnnouncement(null);
    setAnnouncementForm({
      requisitionId: requisitionId || '',
      title: requisition ? `${requisition.positionTitle} - Job Opening` : '',
      description: requisition?.description || '',
      requirements: requisition?.requirements || '',
      benefits: '',
      location: '',
      publishDate: new Date().toISOString().split('T')[0],
      closingDate: '',
      channels: ['website'],
      status: 'draft'
    });
    setErrors({});
    setShowAnnouncementModal(true);
  };

  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setAnnouncementForm({
      requisitionId: announcement.requisitionId,
      title: announcement.title,
      description: announcement.description || '',
      requirements: announcement.requirements || '',
      benefits: announcement.benefits || '',
      location: announcement.location || '',
      publishDate: announcement.publishDate || '',
      closingDate: announcement.closingDate || '',
      channels: announcement.channels || ['website'],
      status: announcement.status
    });
    setErrors({});
    setShowAnnouncementModal(true);
  };

  const validateAnnouncementForm = () => {
    const newErrors = {};
    if (!announcementForm.requisitionId) {
      newErrors.requisitionId = 'Job requisition is required';
    }
    if (!announcementForm.title.trim()) {
      newErrors.title = 'Title is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAnnouncement = async () => {
    if (!validateAnnouncementForm()) return;

    try {
      if (editingAnnouncement) {
        await jobAnnouncementDB.update(editingAnnouncement.id, announcementForm);
      } else {
        await jobAnnouncementDB.create(announcementForm);
      }
      setShowAnnouncementModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving announcement:', error);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      await jobAnnouncementDB.delete(id);
      loadData();
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const handlePublishAnnouncement = async (id) => {
    try {
      await jobAnnouncementDB.publish(id);
      loadData();
    } catch (error) {
      console.error('Error publishing announcement:', error);
    }
  };

  const handleCloseAnnouncement = async (id) => {
    try {
      await jobAnnouncementDB.close(id);
      loadData();
    } catch (error) {
      console.error('Error closing announcement:', error);
    }
  };

  // ========== CANDIDATE HANDLERS ==========
  const handleAddCandidate = (announcementId = null) => {
    setEditingCandidate(null);
    setCandidateForm({
      announcementId: announcementId || (announcements.find(a => a.status === 'published')?.id || ''),
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      resumeUrl: '',
      source: 'website',
      status: 'new',
      notes: ''
    });
    setErrors({});
    setShowCandidateModal(true);
  };

  const handleEditCandidate = (candidate) => {
    setEditingCandidate(candidate);
    setCandidateForm({
      announcementId: candidate.announcementId,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      phone: candidate.phone || '',
      resumeUrl: candidate.resumeUrl || '',
      source: candidate.source,
      status: candidate.status,
      notes: candidate.notes || ''
    });
    setErrors({});
    setShowCandidateModal(true);
  };

  const validateCandidateForm = () => {
    const newErrors = {};
    if (!candidateForm.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!candidateForm.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!candidateForm.email.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!candidateForm.announcementId) {
      newErrors.announcementId = 'Job announcement is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveCandidate = async () => {
    if (!validateCandidateForm()) return;

    try {
      if (editingCandidate) {
        await candidateDB.update(editingCandidate.id, candidateForm);
      } else {
        await candidateDB.create(candidateForm);
      }
      setShowCandidateModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving candidate:', error);
    }
  };

  const handleDeleteCandidate = async (id) => {
    try {
      await candidateDB.delete(id);
      loadData();
    } catch (error) {
      console.error('Error deleting candidate:', error);
    }
  };

  // ========== INTERVIEW HANDLERS ==========
  const handleAddInterview = (candidateId = null) => {
    setEditingInterview(null);
    setInterviewForm({
      candidateId: candidateId || '',
      scheduledDate: '',
      scheduledTime: '',
      interviewType: 'phone',
      interviewers: '',
      location: '',
      notes: '',
      status: 'scheduled'
    });
    setErrors({});
    setShowInterviewModal(true);
  };

  const handleEditInterview = (interview) => {
    setEditingInterview(interview);
    setInterviewForm({
      candidateId: interview.candidateId,
      scheduledDate: interview.scheduledDate,
      scheduledTime: interview.scheduledTime || '',
      interviewType: interview.interviewType,
      interviewers: interview.interviewers || '',
      location: interview.location || '',
      notes: interview.notes || '',
      status: interview.status
    });
    setErrors({});
    setShowInterviewModal(true);
  };

  const validateInterviewForm = () => {
    const newErrors = {};
    if (!interviewForm.candidateId) {
      newErrors.candidateId = 'Candidate is required';
    }
    if (!interviewForm.scheduledDate) {
      newErrors.scheduledDate = 'Date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveInterview = async () => {
    if (!validateInterviewForm()) return;

    try {
      if (editingInterview) {
        await interviewDB.update(editingInterview.id, interviewForm);
      } else {
        await interviewDB.create(interviewForm);
      }
      setShowInterviewModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving interview:', error);
    }
  };

  const handleDeleteInterview = async (id) => {
    try {
      await interviewDB.delete(id);
      loadData();
    } catch (error) {
      console.error('Error deleting interview:', error);
    }
  };

  // ========== OFFER HANDLERS ==========
  const handleAddOffer = (candidateId = null) => {
    const candidate = candidateId ? getCandidate(candidateId) : null;
    const requisition = candidate ? getRequisition(candidate.requisitionId) : null;

    setEditingOffer(null);
    setOfferForm({
      candidateId: candidateId || '',
      positionTitle: requisition?.positionTitle || '',
      departmentId: requisition?.departmentId || '',
      salary: '',
      startDate: '',
      offerDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      benefits: '',
      notes: '',
      status: 'draft'
    });
    setErrors({});
    setShowOfferModal(true);
  };

  const handleEditOffer = (offer) => {
    setEditingOffer(offer);
    setOfferForm({
      candidateId: offer.candidateId,
      positionTitle: offer.positionTitle,
      departmentId: offer.departmentId,
      salary: offer.salary,
      startDate: offer.startDate,
      offerDate: offer.offerDate,
      expiryDate: offer.expiryDate || '',
      benefits: offer.benefits || '',
      notes: offer.notes || '',
      status: offer.status
    });
    setErrors({});
    setShowOfferModal(true);
  };

  const validateOfferForm = () => {
    const newErrors = {};
    if (!offerForm.candidateId) {
      newErrors.candidateId = 'Candidate is required';
    }
    if (!offerForm.positionTitle.trim()) {
      newErrors.positionTitle = 'Position title is required';
    }
    if (!offerForm.salary) {
      newErrors.salary = 'Salary is required';
    }
    if (!offerForm.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveOffer = async () => {
    if (!validateOfferForm()) return;

    try {
      if (editingOffer) {
        await jobOfferDB.update(editingOffer.id, offerForm);
      } else {
        await jobOfferDB.create(offerForm);
      }
      setShowOfferModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving offer:', error);
    }
  };

  const handleDeleteOffer = async (id) => {
    try {
      await jobOfferDB.delete(id);
      loadData();
    } catch (error) {
      console.error('Error deleting offer:', error);
    }
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Recruitment</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage job requisitions, candidates, and hiring process
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Requisitions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRequisitions}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Briefcase className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Open Positions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.openPositions}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Candidates</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCandidates}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Calendar className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Scheduled Interviews</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.scheduledInterviews}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Offers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingOffers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4">
          {[
            { id: 'requisitions', label: 'Requisitions', icon: FileText },
            { id: 'announcements', label: 'Announcements', icon: Megaphone },
            { id: 'candidates', label: 'Candidates', icon: Users },
            { id: 'interviews', label: 'Interviews', icon: Calendar },
            { id: 'offers', label: 'Offers', icon: CheckCircle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'requisitions' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requisitions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="on_hold">On Hold</option>
                <option value="filled">Filled</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <button
              onClick={handleAddRequisition}
              className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-white hover:bg-primary-600 transition-colors"
            >
              <Plus className="h-5 w-5" />
              New Requisition
            </button>
          </div>

          {/* Requisitions Table */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Requisition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Positions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Candidates
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRequisitions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No requisitions found. Create your first requisition.
                    </td>
                  </tr>
                ) : (
                  filteredRequisitions.map((req) => {
                    const candidateCount = candidates.filter(c => c.requisitionId === req.id).length;
                    return (
                      <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {req.positionTitle}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {req.requisitionId}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {getDepartmentName(req.departmentId)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {req.numberOfPositions}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(req.priority)}`}>
                            {req.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(req.status)}`}>
                            {req.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedRequisitionForCandidate(req.id);
                              setActiveTab('candidates');
                            }}
                            className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                          >
                            {candidateCount} candidates
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleAddAnnouncement(req.id)}
                              className="p-1.5 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                              title="Create announcement"
                            >
                              <Megaphone className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditRequisition(req)}
                              className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(req)}
                              className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-end">
            <button
              onClick={() => handleAddAnnouncement()}
              className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-white hover:bg-primary-600 transition-colors"
            >
              <Plus className="h-5 w-5" />
              New Announcement
            </button>
          </div>

          {/* Announcements Table */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Announcement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Publish Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Closing Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Candidates
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {announcements.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No announcements found. Create an announcement from a requisition.
                    </td>
                  </tr>
                ) : (
                  announcements.map((ann) => {
                    const requisition = getRequisition(ann.requisitionId);
                    const candidateCount = candidates.filter(c => c.announcementId === ann.id).length;
                    return (
                      <tr key={ann.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {ann.title}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {ann.announcementId}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {requisition?.positionTitle || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {ann.publishDate ? new Date(ann.publishDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {ann.closingDate ? new Date(ann.closingDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ann.status)}`}>
                            {ann.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedAnnouncementForCandidate(ann.id);
                              setActiveTab('candidates');
                            }}
                            className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                          >
                            {candidateCount} candidates
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {ann.status === 'draft' && (
                              <button
                                onClick={() => handlePublishAnnouncement(ann.id)}
                                className="p-1.5 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                                title="Publish"
                              >
                                <Send className="h-4 w-4" />
                              </button>
                            )}
                            {ann.status === 'published' && (
                              <button
                                onClick={() => handleCloseAnnouncement(ann.id)}
                                className="p-1.5 rounded-lg text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                                title="Close"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleAddCandidate(ann.id)}
                              className="p-1.5 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                              title="Add candidate"
                            >
                              <Users className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditAnnouncement(ann)}
                              className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAnnouncement(ann.id)}
                              className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'candidates' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <select
                value={selectedAnnouncementForCandidate || ''}
                onChange={(e) => setSelectedAnnouncementForCandidate(e.target.value ? Number(e.target.value) : null)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">All Announcements</option>
                {announcements.map(ann => (
                  <option key={ann.id} value={ann.id}>{ann.title}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => handleAddCandidate()}
              className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-white hover:bg-primary-600 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add Candidate
            </button>
          </div>

          {/* Candidates Table */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Position Applied
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {candidates
                  .filter(c => !selectedAnnouncementForCandidate || c.announcementId === selectedAnnouncementForCandidate)
                  .map((candidate) => {
                    const announcement = getAnnouncement(candidate.announcementId);
                    const requisition = announcement ? getRequisition(announcement.requisitionId) : null;
                    return (
                      <tr key={candidate.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {candidate.firstName} {candidate.lastName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {candidate.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {requisition?.positionTitle || announcement?.title || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {candidate.source}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(candidate.status)}`}>
                            {candidate.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(candidate.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleAddInterview(candidate.id)}
                              className="p-1.5 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                              title="Schedule interview"
                            >
                              <Calendar className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleAddOffer(candidate.id)}
                              className="p-1.5 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                              title="Make offer"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditCandidate(candidate)}
                              className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCandidate(candidate.id)}
                              className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                {candidates.filter(c => !selectedRequisitionForCandidate || c.requisitionId === selectedRequisitionForCandidate).length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No candidates found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'interviews' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-end">
            <button
              onClick={() => handleAddInterview()}
              className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-white hover:bg-primary-600 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Schedule Interview
            </button>
          </div>

          {/* Interviews Table */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Interviewers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {interviews.map((interview) => {
                  const candidate = getCandidate(interview.candidateId);
                  return (
                    <tr key={interview.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(interview.scheduledDate).toLocaleDateString()}
                        {interview.scheduledTime && ` at ${interview.scheduledTime}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {interview.interviewType.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {interview.interviewers || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(interview.status)}`}>
                          {interview.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditInterview(interview)}
                            className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteInterview(interview.id)}
                            className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {interviews.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No interviews scheduled.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'offers' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-end">
            <button
              onClick={() => handleAddOffer()}
              className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-white hover:bg-primary-600 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create Offer
            </button>
          </div>

          {/* Offers Table */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {offers.map((offer) => {
                  const candidate = getCandidate(offer.candidateId);
                  return (
                    <tr key={offer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {offer.positionTitle}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        ${Number(offer.salary).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(offer.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(offer.status)}`}>
                          {offer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditOffer(offer)}
                            className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOffer(offer.id)}
                            className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {offers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No offers created.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Requisition Modal */}
      {showRequisitionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingRequisition ? 'Edit Requisition' : 'New Job Requisition'}
              </h2>
              <button
                onClick={() => setShowRequisitionModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Position Title */}
                <div className="col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Position Title *
                  </label>
                  <input
                    type="text"
                    value={requisitionForm.positionTitle}
                    onChange={(e) => setRequisitionForm(prev => ({ ...prev, positionTitle: e.target.value }))}
                    className={`w-full rounded-lg border ${errors.positionTitle ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                    placeholder="e.g., Senior Software Engineer"
                  />
                  {errors.positionTitle && <p className="text-xs text-red-500">{errors.positionTitle}</p>}
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Department *
                  </label>
                  <select
                    value={requisitionForm.departmentId}
                    onChange={(e) => setRequisitionForm(prev => ({ ...prev, departmentId: e.target.value }))}
                    className={`w-full rounded-lg border ${errors.departmentId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                  >
                    <option value="">Select department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                  {errors.departmentId && <p className="text-xs text-red-500">{errors.departmentId}</p>}
                </div>

                {/* Number of Positions */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Number of Positions *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={requisitionForm.numberOfPositions}
                    onChange={(e) => setRequisitionForm(prev => ({ ...prev, numberOfPositions: parseInt(e.target.value) || 1 }))}
                    className={`w-full rounded-lg border ${errors.numberOfPositions ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                  />
                  {errors.numberOfPositions && <p className="text-xs text-red-500">{errors.numberOfPositions}</p>}
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Priority
                  </label>
                  <select
                    value={requisitionForm.priority}
                    onChange={(e) => setRequisitionForm(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {/* Employment Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Employment Type
                  </label>
                  <select
                    value={requisitionForm.employmentType}
                    onChange={(e) => setRequisitionForm(prev => ({ ...prev, employmentType: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                {/* Salary Range */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Salary Range Min
                  </label>
                  <input
                    type="number"
                    value={requisitionForm.salaryRangeMin}
                    onChange={(e) => setRequisitionForm(prev => ({ ...prev, salaryRangeMin: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Min salary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Salary Range Max
                  </label>
                  <input
                    type="number"
                    value={requisitionForm.salaryRangeMax}
                    onChange={(e) => setRequisitionForm(prev => ({ ...prev, salaryRangeMax: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Max salary"
                  />
                </div>

                {/* Status */}
                <div className="col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <select
                    value={requisitionForm.status}
                    onChange={(e) => setRequisitionForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="on_hold">On Hold</option>
                    <option value="filled">Filled</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Description */}
                <div className="col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Job Description
                  </label>
                  <textarea
                    value={requisitionForm.description}
                    onChange={(e) => setRequisitionForm(prev => ({ ...prev, description: e.target.value }))}
                    rows="3"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Enter job description..."
                  />
                </div>

                {/* Requirements */}
                <div className="col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Requirements
                  </label>
                  <textarea
                    value={requisitionForm.requirements}
                    onChange={(e) => setRequisitionForm(prev => ({ ...prev, requirements: e.target.value }))}
                    rows="3"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Enter job requirements..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowRequisitionModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRequisition}
                className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              >
                {editingRequisition ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingAnnouncement ? 'Edit Announcement' : 'New Job Announcement'}
              </h2>
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Requisition */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Job Requisition *
                </label>
                <select
                  value={announcementForm.requisitionId}
                  onChange={(e) => {
                    const reqId = Number(e.target.value);
                    const req = getRequisition(reqId);
                    setAnnouncementForm(prev => ({
                      ...prev,
                      requisitionId: reqId,
                      title: req ? `${req.positionTitle} - Job Opening` : prev.title,
                      description: req?.description || prev.description,
                      requirements: req?.requirements || prev.requirements
                    }));
                  }}
                  className={`w-full rounded-lg border ${errors.requisitionId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                >
                  <option value="">Select requisition</option>
                  {requisitions.filter(r => r.status === 'open' || r.status === 'in_progress').map(req => (
                    <option key={req.id} value={req.id}>{req.positionTitle} ({req.requisitionId})</option>
                  ))}
                </select>
                {errors.requisitionId && <p className="text-xs text-red-500">{errors.requisitionId}</p>}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full rounded-lg border ${errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                  placeholder="e.g., Senior Software Engineer - Job Opening"
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Publish Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Publish Date
                  </label>
                  <input
                    type="date"
                    value={announcementForm.publishDate}
                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, publishDate: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                {/* Closing Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Closing Date
                  </label>
                  <input
                    type="date"
                    value={announcementForm.closingDate}
                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, closingDate: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Location
                </label>
                <input
                  type="text"
                  value={announcementForm.location}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="e.g., Remote, New York, etc."
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Job Description
                </label>
                <textarea
                  value={announcementForm.description}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Requirements */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Requirements
                </label>
                <textarea
                  value={announcementForm.requirements}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, requirements: e.target.value }))}
                  rows="3"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Benefits */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Benefits
                </label>
                <textarea
                  value={announcementForm.benefits}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, benefits: e.target.value }))}
                  rows="2"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="e.g., Health insurance, 401k, flexible hours..."
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  value={announcementForm.status}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAnnouncement}
                className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              >
                {editingAnnouncement ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Modal */}
      {showCandidateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingCandidate ? 'Edit Candidate' : 'Add Candidate'}
              </h2>
              <button
                onClick={() => setShowCandidateModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Announcement */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Job Announcement *
                </label>
                <select
                  value={candidateForm.announcementId}
                  onChange={(e) => setCandidateForm(prev => ({ ...prev, announcementId: Number(e.target.value) }))}
                  className={`w-full rounded-lg border ${errors.announcementId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                >
                  <option value="">Select announcement</option>
                  {announcements.filter(a => a.status === 'published').map(ann => (
                    <option key={ann.id} value={ann.id}>{ann.title}</option>
                  ))}
                </select>
                {errors.announcementId && <p className="text-xs text-red-500">{errors.announcementId}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={candidateForm.firstName}
                    onChange={(e) => setCandidateForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className={`w-full rounded-lg border ${errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                  />
                  {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={candidateForm.lastName}
                    onChange={(e) => setCandidateForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className={`w-full rounded-lg border ${errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                  />
                  {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email *
                </label>
                <input
                  type="email"
                  value={candidateForm.email}
                  onChange={(e) => setCandidateForm(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone
                </label>
                <input
                  type="tel"
                  value={candidateForm.phone}
                  onChange={(e) => setCandidateForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Source */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Source
                  </label>
                  <select
                    value={candidateForm.source}
                    onChange={(e) => setCandidateForm(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="website">Website</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="referral">Referral</option>
                    <option value="job_board">Job Board</option>
                    <option value="agency">Agency</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <select
                    value={candidateForm.status}
                    onChange={(e) => setCandidateForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="new">New</option>
                    <option value="screening">Screening</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                    <option value="withdrawn">Withdrawn</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notes
                </label>
                <textarea
                  value={candidateForm.notes}
                  onChange={(e) => setCandidateForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows="3"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowCandidateModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCandidate}
                className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              >
                {editingCandidate ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interview Modal */}
      {showInterviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingInterview ? 'Edit Interview' : 'Schedule Interview'}
              </h2>
              <button
                onClick={() => setShowInterviewModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Candidate */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Candidate *
                </label>
                <select
                  value={interviewForm.candidateId}
                  onChange={(e) => setInterviewForm(prev => ({ ...prev, candidateId: Number(e.target.value) }))}
                  className={`w-full rounded-lg border ${errors.candidateId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                >
                  <option value="">Select candidate</option>
                  {candidates.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
                {errors.candidateId && <p className="text-xs text-red-500">{errors.candidateId}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={interviewForm.scheduledDate}
                    onChange={(e) => setInterviewForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    className={`w-full rounded-lg border ${errors.scheduledDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                  />
                  {errors.scheduledDate && <p className="text-xs text-red-500">{errors.scheduledDate}</p>}
                </div>

                {/* Time */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Time
                  </label>
                  <input
                    type="time"
                    value={interviewForm.scheduledTime}
                    onChange={(e) => setInterviewForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Interview Type
                  </label>
                  <select
                    value={interviewForm.interviewType}
                    onChange={(e) => setInterviewForm(prev => ({ ...prev, interviewType: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="phone">Phone</option>
                    <option value="video">Video</option>
                    <option value="in_person">In Person</option>
                    <option value="technical">Technical</option>
                    <option value="panel">Panel</option>
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <select
                    value={interviewForm.status}
                    onChange={(e) => setInterviewForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no_show">No Show</option>
                  </select>
                </div>
              </div>

              {/* Interviewers */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Interviewers
                </label>
                <input
                  type="text"
                  value={interviewForm.interviewers}
                  onChange={(e) => setInterviewForm(prev => ({ ...prev, interviewers: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="e.g., John Smith, Jane Doe"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Location
                </label>
                <input
                  type="text"
                  value={interviewForm.location}
                  onChange={(e) => setInterviewForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="e.g., Conference Room A or Zoom link"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notes
                </label>
                <textarea
                  value={interviewForm.notes}
                  onChange={(e) => setInterviewForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows="3"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowInterviewModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveInterview}
                className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              >
                {editingInterview ? 'Update' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingOffer ? 'Edit Offer' : 'Create Offer'}
              </h2>
              <button
                onClick={() => setShowOfferModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Candidate */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Candidate *
                </label>
                <select
                  value={offerForm.candidateId}
                  onChange={(e) => {
                    const candId = Number(e.target.value);
                    const cand = getCandidate(candId);
                    const req = cand ? getRequisition(cand.requisitionId) : null;
                    setOfferForm(prev => ({
                      ...prev,
                      candidateId: candId,
                      positionTitle: req?.positionTitle || prev.positionTitle,
                      departmentId: req?.departmentId || prev.departmentId
                    }));
                  }}
                  className={`w-full rounded-lg border ${errors.candidateId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                >
                  <option value="">Select candidate</option>
                  {candidates.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
                {errors.candidateId && <p className="text-xs text-red-500">{errors.candidateId}</p>}
              </div>

              {/* Position Title */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Position Title *
                </label>
                <input
                  type="text"
                  value={offerForm.positionTitle}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, positionTitle: e.target.value }))}
                  className={`w-full rounded-lg border ${errors.positionTitle ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                />
                {errors.positionTitle && <p className="text-xs text-red-500">{errors.positionTitle}</p>}
              </div>

              {/* Salary */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Salary *
                </label>
                <input
                  type="number"
                  value={offerForm.salary}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, salary: e.target.value }))}
                  className={`w-full rounded-lg border ${errors.salary ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                  placeholder="Annual salary"
                />
                {errors.salary && <p className="text-xs text-red-500">{errors.salary}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={offerForm.startDate}
                    onChange={(e) => setOfferForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className={`w-full rounded-lg border ${errors.startDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                  />
                  {errors.startDate && <p className="text-xs text-red-500">{errors.startDate}</p>}
                </div>

                {/* Expiry Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Offer Expiry Date
                  </label>
                  <input
                    type="date"
                    value={offerForm.expiryDate}
                    onChange={(e) => setOfferForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  value={offerForm.status}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="declined">Declined</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              {/* Benefits */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Benefits
                </label>
                <textarea
                  value={offerForm.benefits}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, benefits: e.target.value }))}
                  rows="2"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="e.g., Health insurance, 401k, PTO..."
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notes
                </label>
                <textarea
                  value={offerForm.notes}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows="2"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowOfferModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOffer}
                className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              >
                {editingOffer ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Delete Requisition
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete <strong>{showDeleteConfirm.positionTitle}</strong>? This will also remove all associated candidates, interviews, and offers.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteRequisition(showDeleteConfirm.id)}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recruitment;
