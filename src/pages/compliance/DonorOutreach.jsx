import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Send, Calendar, Users, FileText } from 'lucide-react';
import Modal from '../../components/Modal';
import { donorOutreachDB } from '../../services/db/indexedDB';

const DONOR_CATEGORIES = [
  'INGO - inside AFG',
  'INGO - outside AFG',
  'Private Sector',
  'Individual Sponsors',
  'Institutional Donors',
  'UN Agencies',
  'World Bank',
  'EU',
  'Asian Development Bank',
  'Foundations',
  'Others',
  'Embassies - inside Afghanistan',
  'Embassies - Outside Afghanistan'
];

const FINAL_OUTCOMES = ['Rejected', 'Accepted', 'Pending'];

const DonorOutreach = () => {
  const [outreaches, setOutreaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOutreach, setSelectedOutreach] = useState(null);
  const [formData, setFormData] = useState({
    donorName: '',
    category: '',
    location: '',
    areaOfCollaboration: '',
    pointOfContact: '',

    // Meeting 1
    meeting1Date: '',
    meeting1Agenda: '',
    meeting1Participants: '',
    meeting1Minutes: '',

    // Meeting 2
    meeting2Date: '',
    meeting2Agenda: '',
    meeting2Participants: '',
    meeting2Minutes: '',

    // Meeting 3
    meeting3Date: '',
    meeting3Agenda: '',
    meeting3Participants: '',
    meeting3Minutes: '',

    finalOutcome: '',

    // Status Tracking
    trackingDate: '',
    reminderSent: false,
    followUpActions: '',
    documentMissing: false,
    noFollowUp: false,

    remarks: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await donorOutreachDB.getAll();
      setOutreaches(data);
    } catch (error) {
      console.error('Error loading outreach records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (outreach = null) => {
    if (outreach) {
      setSelectedOutreach(outreach);
      setFormData({
        donorName: outreach.donorName || '',
        category: outreach.category || '',
        location: outreach.location || '',
        areaOfCollaboration: outreach.areaOfCollaboration || '',
        pointOfContact: outreach.pointOfContact || '',

        meeting1Date: outreach.meeting1Date || '',
        meeting1Agenda: outreach.meeting1Agenda || '',
        meeting1Participants: outreach.meeting1Participants || '',
        meeting1Minutes: outreach.meeting1Minutes || '',

        meeting2Date: outreach.meeting2Date || '',
        meeting2Agenda: outreach.meeting2Agenda || '',
        meeting2Participants: outreach.meeting2Participants || '',
        meeting2Minutes: outreach.meeting2Minutes || '',

        meeting3Date: outreach.meeting3Date || '',
        meeting3Agenda: outreach.meeting3Agenda || '',
        meeting3Participants: outreach.meeting3Participants || '',
        meeting3Minutes: outreach.meeting3Minutes || '',

        finalOutcome: outreach.finalOutcome || '',

        trackingDate: outreach.trackingDate || '',
        reminderSent: outreach.reminderSent || false,
        followUpActions: outreach.followUpActions || '',
        documentMissing: outreach.documentMissing || false,
        noFollowUp: outreach.noFollowUp || false,

        remarks: outreach.remarks || '',
      });
    } else {
      setFormData({
        donorName: '',
        category: '',
        location: '',
        areaOfCollaboration: '',
        pointOfContact: '',

        meeting1Date: '',
        meeting1Agenda: '',
        meeting1Participants: '',
        meeting1Minutes: '',

        meeting2Date: '',
        meeting2Agenda: '',
        meeting2Participants: '',
        meeting2Minutes: '',

        meeting3Date: '',
        meeting3Agenda: '',
        meeting3Participants: '',
        meeting3Minutes: '',

        finalOutcome: '',

        trackingDate: '',
        reminderSent: false,
        followUpActions: '',
        documentMissing: false,
        noFollowUp: false,

        remarks: '',
      });
      setSelectedOutreach(null);
    }
    setErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.donorName.trim()) newErrors.donorName = 'Donor name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      if (selectedOutreach) {
        await donorOutreachDB.update(selectedOutreach.id, formData);
      } else {
        await donorOutreachDB.create(formData);
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving outreach:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this outreach record?')) {
      await donorOutreachDB.delete(id);
      loadData();
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const getOutcomeColor = (outcome) => {
    switch (outcome) {
      case 'Accepted': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const calculateDaysBetweenMeetings = (date1, date2) => {
    if (!date1 || !date2) return null;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Donor Outreach Tracking</h1>
        <p className="text-gray-600 dark:text-gray-400">Track outreach activities with potential and existing donors, including meeting history and outcomes</p>
      </div>

      <div className="mb-6 flex justify-end">
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
          <Plus className="h-5 w-5" />Add Donor Outreach
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : outreaches.length === 0 ? (
        <div className="text-center py-12">
          <Send className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No outreach records found</h3>
          <p className="text-gray-500 dark:text-gray-400">Get started by adding your first donor outreach record</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sn</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Donor Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area of Collaboration</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meetings</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Final Outcome</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {outreaches.map((outreach, index) => {
                  const meetingCount = [outreach.meeting1Date, outreach.meeting2Date, outreach.meeting3Date].filter(Boolean).length;
                  return (
                    <tr key={outreach.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{index + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{outreach.donorName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{outreach.category}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{outreach.location || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">{outreach.areaOfCollaboration || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4" />
                          {meetingCount} meeting{meetingCount !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {outreach.finalOutcome ? (
                          <span className={`px-2 py-1 text-xs rounded-full ${getOutcomeColor(outreach.finalOutcome)}`}>
                            {outreach.finalOutcome}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleOpenModal(outreach)} className="p-1 text-gray-500 hover:text-blue-500">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(outreach.id)} className="p-1 text-gray-500 hover:text-red-500 ml-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedOutreach ? 'Edit Donor Outreach' : 'Add Donor Outreach'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Donor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="donorName"
                  value={formData.donorName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white ${errors.donorName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  placeholder="Enter donor organization name"
                />
                {errors.donorName && <p className="text-red-500 text-xs mt-1">{errors.donorName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white ${errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                >
                  <option value="">Select Category</option>
                  {DONOR_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Location of donor/meetings"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Point of Contact</label>
                <input
                  type="text"
                  name="pointOfContact"
                  value={formData.pointOfContact}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Phone number, email"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Area/Topic of Collaboration</label>
                <input
                  type="text"
                  name="areaOfCollaboration"
                  value={formData.areaOfCollaboration}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Education - emergency response"
                />
              </div>
            </div>
          </div>

          {/* Meeting 1 */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              1st Meeting
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Date</label>
                <input
                  type="date"
                  name="meeting1Date"
                  value={formData.meeting1Date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Agenda</label>
                <input
                  type="text"
                  name="meeting1Agenda"
                  value={formData.meeting1Agenda}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Meeting agenda"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Participant List</label>
                <input
                  type="text"
                  name="meeting1Participants"
                  value={formData.meeting1Participants}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Names of participants (comma-separated)"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Minutes of Meeting</label>
                <textarea
                  name="meeting1Minutes"
                  value={formData.meeting1Minutes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Meeting minutes and key points discussed"
                />
              </div>
            </div>
          </div>

          {/* Meeting 2 */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              2nd Meeting
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Date</label>
                <input
                  type="date"
                  name="meeting2Date"
                  value={formData.meeting2Date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
                {formData.meeting1Date && formData.meeting2Date && (
                  <p className="text-xs text-gray-500 mt-1">
                    {calculateDaysBetweenMeetings(formData.meeting1Date, formData.meeting2Date)} days since 1st meeting
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Agenda</label>
                <input
                  type="text"
                  name="meeting2Agenda"
                  value={formData.meeting2Agenda}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Meeting agenda"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Participant List</label>
                <input
                  type="text"
                  name="meeting2Participants"
                  value={formData.meeting2Participants}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Names of participants (comma-separated)"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Minutes of Meeting</label>
                <textarea
                  name="meeting2Minutes"
                  value={formData.meeting2Minutes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Meeting minutes and key points discussed"
                />
              </div>
            </div>
          </div>

          {/* Meeting 3 */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              3rd Meeting
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Date</label>
                <input
                  type="date"
                  name="meeting3Date"
                  value={formData.meeting3Date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
                {formData.meeting2Date && formData.meeting3Date && (
                  <p className="text-xs text-gray-500 mt-1">
                    {calculateDaysBetweenMeetings(formData.meeting2Date, formData.meeting3Date)} days since 2nd meeting
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Agenda</label>
                <input
                  type="text"
                  name="meeting3Agenda"
                  value={formData.meeting3Agenda}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Meeting agenda"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Participant List</label>
                <input
                  type="text"
                  name="meeting3Participants"
                  value={formData.meeting3Participants}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Names of participants (comma-separated)"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Minutes of Meeting</label>
                <textarea
                  name="meeting3Minutes"
                  value={formData.meeting3Minutes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Meeting minutes and key points discussed"
                />
              </div>
            </div>
          </div>

          {/* Final Outcome */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Final Outcome</h3>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Outcome</label>
              <select
                name="finalOutcome"
                value={formData.finalOutcome}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Outcome</option>
                {FINAL_OUTCOMES.map(outcome => (
                  <option key={outcome} value={outcome}>{outcome}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Tracking */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Status Tracking
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Tracking Date</label>
                  <input
                    type="date"
                    name="trackingDate"
                    value={formData.trackingDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Follow Up Actions</label>
                <textarea
                  name="followUpActions"
                  value={formData.followUpActions}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Describe follow-up actions required"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="reminderSent"
                    checked={formData.reminderSent}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Reminder Sent</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="documentMissing"
                    checked={formData.documentMissing}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Document Missing and Not Sending</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="noFollowUp"
                    checked={formData.noFollowUp}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">No Follow Up</span>
                </label>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="Additional notes or remarks"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : selectedOutreach ? 'Update Outreach' : 'Save Outreach'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DonorOutreach;
