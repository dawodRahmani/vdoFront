import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FileCheck } from 'lucide-react';
import Modal from '../../components/Modal';
import { proposalDB } from '../../services/db/indexedDB';

const RFPTracking = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [formData, setFormData] = useState({
    donor: '',
    thematicAreas: '',
    beneficiaries: '',
    budget: '',
    duration: '12 months',
    location: [],
    announcedPlatform: '',
    customPlatform: '',
    donorTemplates: '',
    submissionMechanism: '',
    submissionDate: '',
    submissionDeadline: '',
    rmc: '',
    proposalPackage: '',
    status: 'submitted',
    result: '',
    resultAnnouncementDate: '',
    rejectionReason: '',
    customRejectionReason: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Afghanistan provinces (34 provinces)
  const afghanistanProvinces = [
    'Badakhshan', 'Badghis', 'Baghlan', 'Balkh', 'Bamyan', 'Daykundi', 'Farah',
    'Faryab', 'Ghazni', 'Ghor', 'Helmand', 'Herat', 'Jowzjan', 'Kabul',
    'Kandahar', 'Kapisa', 'Khost', 'Kunar', 'Kunduz', 'Laghman', 'Logar',
    'Nangarhar', 'Nimroz', 'Nuristan', 'Paktia', 'Paktika', 'Panjshir',
    'Parwan', 'Samangan', 'Sar-e Pol', 'Takhar', 'Uruzgan', 'Wardak', 'Zabul'
  ];

  const platforms = ['UNGM', 'ACBAR', 'Sole Source', 'UNPP', 'Any other platform'];
  const rmcOptions = ['Lead - Members', 'Resource Mobilization Committee', 'To be assigned by ED'];
  const rejectionReasons = [
    'Lack of lobby',
    'Not timely submission',
    'Not quality proposal',
    'Not quality budgeting',
    'Not meeting compliance',
    'Any other reason'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await proposalDB.getAll();
      setProposals(data);
    } catch (error) {
      console.error('Error loading RFP data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (proposal = null) => {
    if (proposal) {
      setSelectedProposal(proposal);
      setFormData({
        donor: proposal.donor || '',
        thematicAreas: proposal.thematicAreas || '',
        beneficiaries: proposal.beneficiaries || '',
        budget: proposal.budget || '',
        duration: proposal.duration || '12 months',
        location: proposal.location || [],
        announcedPlatform: proposal.announcedPlatform || '',
        customPlatform: proposal.customPlatform || '',
        donorTemplates: proposal.donorTemplates || '',
        submissionMechanism: proposal.submissionMechanism || '',
        submissionDate: proposal.submissionDate || '',
        submissionDeadline: proposal.submissionDeadline || '',
        rmc: proposal.rmc || '',
        proposalPackage: proposal.proposalPackage || '',
        status: proposal.status || 'submitted',
        result: proposal.result || '',
        resultAnnouncementDate: proposal.resultAnnouncementDate || '',
        rejectionReason: proposal.rejectionReason || '',
        customRejectionReason: proposal.customRejectionReason || '',
      });
    } else {
      setFormData({
        donor: '',
        thematicAreas: '',
        beneficiaries: '',
        budget: '',
        duration: '12 months',
        location: [],
        announcedPlatform: '',
        customPlatform: '',
        donorTemplates: '',
        submissionMechanism: '',
        submissionDate: '',
        submissionDeadline: '',
        rmc: '',
        proposalPackage: '',
        status: 'submitted',
        result: '',
        resultAnnouncementDate: '',
        rejectionReason: '',
        customRejectionReason: '',
      });
      setSelectedProposal(null);
    }
    setErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.donor.trim()) newErrors.donor = 'Donor name is required';
    if (!formData.submissionDeadline) newErrors.submissionDeadline = 'Submission deadline is required';
    if (formData.announcedPlatform === 'Any other platform' && !formData.customPlatform.trim()) {
      newErrors.customPlatform = 'Please specify the platform name';
    }
    if (formData.rejectionReason === 'Any other reason' && !formData.customRejectionReason.trim()) {
      newErrors.customRejectionReason = 'Please specify the rejection reason';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      const dataToSave = {
        ...formData,
        budget: Number(formData.budget) || 0,
      };
      if (selectedProposal) {
        await proposalDB.update(selectedProposal.id, dataToSave);
      } else {
        await proposalDB.create(dataToSave);
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving RFP:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this RFP entry?')) {
      await proposalDB.delete(id);
      loadData();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleLocationChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setFormData(prev => ({ ...prev, location: selected }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getResultColor = (result) => {
    switch (result) {
      case 'accepted': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">RFP Tracking</h1>
        <p className="text-gray-600 dark:text-gray-400">VDO Proposals and Concept Tracking Sheet</p>
      </div>

      <div className="mb-6 flex justify-end">
        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
          <Plus className="h-5 w-5" />Add RFP Entry
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : proposals.length === 0 ? (
        <div className="text-center py-12">
          <FileCheck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No RFP entries found</h3>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Donor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Thematic Areas</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Budget</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Deadline</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Result</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {proposals.map((proposal) => (
                  <tr key={proposal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{proposal.donor}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{proposal.thematicAreas || '-'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white text-right">
                      {proposal.budget ? proposal.budget.toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{proposal.submissionDeadline || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(proposal.status)}`}>
                        {proposal.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {proposal.result && (
                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${getResultColor(proposal.result)}`}>
                          {proposal.result}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleOpenModal(proposal)} className="p-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(proposal.id)} className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 ml-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedProposal ? 'Edit RFP Entry' : 'Add RFP Entry'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Donor <span className="text-red-500">*</span></label>
            <input type="text" name="donor" value={formData.donor} onChange={handleInputChange}
              placeholder="Donor organization name"
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.donor ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Thematic Areas of Proposal</label>
            <textarea name="thematicAreas" value={formData.thematicAreas} onChange={handleInputChange} rows={2}
              placeholder="Description of thematic areas"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Beneficiaries</label>
              <input type="text" name="beneficiaries" value={formData.beneficiaries} onChange={handleInputChange}
                placeholder="Target beneficiaries"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Budget</label>
              <input type="number" name="budget" value={formData.budget} onChange={handleInputChange}
                placeholder="Proposal amount"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Duration</label>
              <input type="text" name="duration" value={formData.duration} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Location (Multiple Select)</label>
              <select multiple name="location" value={formData.location} onChange={handleLocationChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-24"
                size={5}>
                {afghanistanProvinces.map((province) => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Hold Ctrl/Cmd to select multiple provinces</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Announced Platform/Website</label>
              <select name="announcedPlatform" value={formData.announcedPlatform} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">Select Platform</option>
                {platforms.map((platform) => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">RMC</label>
              <select name="rmc" value={formData.rmc} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">Select RMC</option>
                {rmcOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          {formData.announcedPlatform === 'Any other platform' && (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">
                Custom Platform Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="customPlatform"
                value={formData.customPlatform}
                onChange={handleInputChange}
                placeholder="Enter platform name"
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.customPlatform ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.customPlatform && (
                <p className="mt-1 text-sm text-red-500">{errors.customPlatform}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Donor Templates</label>
              <input type="text" name="donorTemplates" value={formData.donorTemplates} onChange={handleInputChange}
                placeholder="Link to donor templates"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Submission Mechanism</label>
              <input type="text" name="submissionMechanism" value={formData.submissionMechanism} onChange={handleInputChange}
                placeholder="How to submit"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Submission Date</label>
              <input type="date" name="submissionDate" value={formData.submissionDate} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Submission Deadline <span className="text-red-500">*</span></label>
              <input type="date" name="submissionDeadline" value={formData.submissionDeadline} onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.submissionDeadline ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Proposal Submission Package</label>
            <input type="text" name="proposalPackage" value={formData.proposalPackage} onChange={handleInputChange}
              placeholder="Link to submitted package"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="submitted">Submitted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Result</label>
              <select name="result" value={formData.result} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">Not Announced</option>
                <option value="accepted">Accepted</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">Result Announcement Date</label>
              <input type="date" name="resultAnnouncementDate" value={formData.resultAnnouncementDate} onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">If Rejected, Rejection Reason</label>
              <select name="rejectionReason" value={formData.rejectionReason} onChange={handleInputChange}
                disabled={formData.status !== 'rejected'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50">
                <option value="">Select Reason</option>
                {rejectionReasons.map((reason) => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>
          </div>

          {formData.rejectionReason === 'Any other reason' && (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-1">
                Custom Rejection Reason <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="customRejectionReason"
                value={formData.customRejectionReason}
                onChange={handleInputChange}
                placeholder="Enter rejection reason"
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.customRejectionReason ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.customRejectionReason && (
                <p className="mt-1 text-sm text-red-500">{errors.customRejectionReason}</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-500 text-white rounded-lg disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RFPTracking;
