import { STATUS_LABELS } from '../../utils/constants';

// tone → [pill classes, dot class]
const tones = {
  blue: ['bg-sky-50 text-sky-700', 'bg-sky-500'],
  green: ['bg-primary-50 text-primary-700', 'bg-primary-500'],
  amber: ['bg-accent-50 text-accent-700', 'bg-accent-500'],
  violet: ['bg-violet-50 text-violet-700', 'bg-violet-500'],
  teal: ['bg-teal-50 text-teal-700', 'bg-teal-500'],
  red: ['bg-red-50 text-red-700', 'bg-red-500'],
  gray: ['bg-gray-100 text-gray-600', 'bg-gray-400'],
};

// Every status used across requests, trips and escrow in one place.
const map = {
  // requests
  requested: ['blue'],
  accepted: ['green'],
  shopping: ['amber'],
  delivered: ['violet'],
  paid: ['teal'],
  cancelled: ['gray'],
  rejected: ['red'],
  disputed: ['red'],
  // trips
  open: ['green', 'Open'],
  full: ['amber', 'Full'],
  'in-progress': ['blue', 'In progress'],
  completed: ['gray', 'Completed'],
  // escrow
  pending: ['amber', 'Pending'],
  held: ['blue', 'Held'],
  confirmed: ['green', 'Confirmed'],
  released: ['green', 'Released'],
  refunded: ['violet', 'Refunded'],
};

const StatusBadge = ({ status, label: labelOverride, size = 'sm', className = '' }) => {
  const [tone = 'gray', custom] = map[status] || [];
  const [pill, dot] = tones[tone];
  const label =
    labelOverride ||
    custom ||
    STATUS_LABELS[status]?.en ||
    (status ? status.charAt(0).toUpperCase() + status.slice(1) : '—');

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full font-medium ${pill} ${
        size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'
      } ${className}`}
    >
      <span className={`size-1.5 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </span>
  );
};

export default StatusBadge;
