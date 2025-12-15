import { RECRUITMENT_STATUS, RECRUITMENT_STATUS_LABELS } from '../../services/db/recruitmentService';

const statusStyles = {
  [RECRUITMENT_STATUS.DRAFT]: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  [RECRUITMENT_STATUS.TOR_PENDING]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  [RECRUITMENT_STATUS.REQUISITION_PENDING]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  [RECRUITMENT_STATUS.ANNOUNCED]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  [RECRUITMENT_STATUS.APPLICATIONS_OPEN]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  [RECRUITMENT_STATUS.COMMITTEE_FORMED]: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  [RECRUITMENT_STATUS.LONGLISTING]: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  [RECRUITMENT_STATUS.SHORTLISTING]: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  [RECRUITMENT_STATUS.TESTING]: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  [RECRUITMENT_STATUS.INTERVIEWING]: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  [RECRUITMENT_STATUS.REPORT_PENDING]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  [RECRUITMENT_STATUS.OFFER_SENT]: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400',
  [RECRUITMENT_STATUS.BACKGROUND_CHECK]: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  [RECRUITMENT_STATUS.CONTRACT_PENDING]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  [RECRUITMENT_STATUS.COMPLETED]: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  [RECRUITMENT_STATUS.CANCELLED]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const StatusBadge = ({ status, size = 'sm', className = '' }) => {
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${statusStyles[status] || 'bg-gray-100 text-gray-700'}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {RECRUITMENT_STATUS_LABELS[status] || status}
    </span>
  );
};

// Application status badge
export const ApplicationStatusBadge = ({ status, size = 'sm', className = '' }) => {
  const applicationStatusStyles = {
    received: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    longlisted: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    shortlisted: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    tested: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    interviewed: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    selected: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    offered: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400',
    hired: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    withdrawn: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium capitalize
        ${applicationStatusStyles[status] || 'bg-gray-100 text-gray-700'}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {status}
    </span>
  );
};

// Approval status badge
export const ApprovalBadge = ({ status, size = 'sm', className = '' }) => {
  const approvalStyles = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    pending_approval: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    hr_review: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    finance_review: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const labels = {
    draft: 'Draft',
    pending_approval: 'Pending Approval',
    hr_review: 'HR Review',
    finance_review: 'Finance Review',
    approved: 'Approved',
    rejected: 'Rejected',
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${approvalStyles[status] || 'bg-gray-100 text-gray-700'}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {labels[status] || status}
    </span>
  );
};

export default StatusBadge;
