import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, FileText } from 'lucide-react';
import {
  getMOUTrackingById,
  deleteMOUTracking,
} from '../../services/db/mouTrackingService';

const MOUTrackingView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntry();
  }, [id]);

  const loadEntry = async () => {
    try {
      setLoading(true);
      const data = await getMOUTrackingById(Number(id));
      setEntry(data);
    } catch (error) {
      console.error('Error loading MOU entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this MOU entry?')) {
      try {
        await deleteMOUTracking(Number(id));
        navigate('/programm/mou-tracking');
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Failed to delete entry');
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      project: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      amendment: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    };
    return classes[status?.toLowerCase()] || classes.project;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-600 dark:text-gray-400">
          MOU entry not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/programm/mou-tracking')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to MOU Tracking
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              MOU Entry Details
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              View MOU tracking information
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              to={`/programm/mou-tracking/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* MOU Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          MOU Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {entry.serialNumber && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Serial Number (S/N)
              </label>
              <p className="text-gray-900 dark:text-white">{entry.serialNumber}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Status
            </label>
            <span
              className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeClass(
                entry.status
              )}`}
            >
              {entry.status === 'project' ? 'Project (Initial MOU)' : 'Amendment'}
            </span>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Name of Sectoral Authority
            </label>
            <p className="text-gray-900 dark:text-white font-medium">
              {entry.sectoralAuthority}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Government department or ministry
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Project
            </label>
            <p className="text-gray-900 dark:text-white">{entry.project}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Donor
            </label>
            <p className="text-gray-900 dark:text-white">{entry.donor}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Location
            </label>
            <p className="text-gray-900 dark:text-white">{entry.location || '-'}</p>
          </div>
        </div>
      </div>

      {/* Document Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documents
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Upload Document (MOU and Approval Letters)
          </label>
          {entry.uploadDocument ? (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                {entry.uploadDocument}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">
              No documents uploaded
            </p>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
          About This MOU
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-400">
          This entry tracks formal agreements with government authorities, essential for legal
          compliance and access to implementation areas. The status indicates whether this is
          an original MOU (Project) or a modification to an existing agreement (Amendment).
        </p>
      </div>

      {/* Metadata */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        <p>Created: {new Date(entry.createdAt).toLocaleString()}</p>
        {entry.updatedAt && (
          <p>Last Updated: {new Date(entry.updatedAt).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
};

export default MOUTrackingView;
