/**
 * Date ko "5 minutes ago", "2 hours ago" etc. mein badlo
 */
export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return `${interval} saal pehle`;

  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return `${interval} mahine pehle`;

  interval = Math.floor(seconds / 86400);
  if (interval > 1) return `${interval} din pehle`;

  interval = Math.floor(seconds / 3600);
  if (interval > 1) return `${interval} ghante pehle`;

  interval = Math.floor(seconds / 60);
  if (interval > 1) return `${interval} minute pehle`;

  return 'Abhi abhi';
};

/**
 * Date ko "17 Sep, 2026" format mein dikhao
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