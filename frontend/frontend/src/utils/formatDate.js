/**
 * Convert a date to "5 minutes ago", "2 hours ago", etc.
 */
export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];

  for (const [name, size] of units) {
    const value = Math.floor(seconds / size);
    if (value >= 1) return `${value} ${name}${value > 1 ? 's' : ''} ago`;
  }

  return 'Just now';
};

/**
 * Show a date as "17 Sep, 2026"
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Date + time: "17 Sep, 10:30 AM"
 */
export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-PK', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Time window: "10:00 AM - 12:00 PM"
 */
export const formatTimeWindow = (start, end) => {
  const startTime = new Date(start).toLocaleTimeString('en-PK', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const endTime = new Date(end).toLocaleTimeString('en-PK', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${startTime} - ${endTime}`;
};

export default { timeAgo, formatDate, formatDateTime, formatTimeWindow };