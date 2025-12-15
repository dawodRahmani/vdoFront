import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, FileText, ArrowDown, ArrowUp } from 'lucide-react';
import {
  getInOutTrackingById,
  deleteInOutTracking,
} from '../../services/db/inOutTrackingService';

const InOutTrackingView = () => {
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
      const data = await getInOutTrackingById(Number(id));
      setEntry(data);
    } catch (error) {
      console.error('Error loading entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this document entry?')) {
      try {
        await deleteInOutTracking(Number(id));
        navigate('/programm/in-out-tracking');
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Failed to delete entry');
      }
    }
  };

  const getDocumentTypeBadgeClass = (type) => {
    const classes = {
      incoming: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      outgoing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    };
    return classes[type?.toLowerCase()] || classes.incoming;
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      processed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return classes[status?.toLowerCase()] || classes.pending;
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
          Document entry not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/programm/in-out-tracking')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to In-Out Tracking
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Document Entry Details
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              View document tracking information
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              to={`/programm/in-out-tracking/${id}/edit`}
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

      {/* Document Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Document Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {entry.serialNumber && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Serial Number
              </label>
              <p className="text-gray-900 dark:text-white">{entry.serialNumber}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Document Type
            </label>
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${getDocumentTypeBadgeClass(
                entry.documentType
              )}`}
            >
              {entry.documentType === 'incoming' ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
              {entry.documentType}
            </span>
          </div>

          {entry.referenceNumber && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Reference Number
              </label>
              <p className="text-gray-900 dark:text-white">{entry.referenceNumber}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Date
            </label>
            <p className="text-gray-900 dark:text-white">
              {entry.date
                ? new Date(entry.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '-'}
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Document Title
            </label>
            <p className="text-gray-900 dark:text-white font-medium">{entry.documentTitle}</p>
          </div>

          {entry.subject && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Subject
              </label>
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{entry.subject}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              From (Sender)
            </label>
            <p className="text-gray-900 dark:text-white">{entry.from}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              To (Recipient)
            </label>
            <p className="text-gray-900 dark:text-white">{entry.to}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Status
            </label>
            <span
              className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeClass(
                entry.status
              )}`}
            >
              {entry.status || 'pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Document Link */}
      {entry.documentLink && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Storage
          </h2>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {entry.documentLink}
            </p>
          </div>
        </div>
      )}

      {/* Notes */}
      {entry.notes && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Notes / Remarks
          </h2>
          <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{entry.notes}</p>
        </div>
      )}

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

export default InOutTrackingView;
