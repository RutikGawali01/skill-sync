/**
 * dateFormatter.js
 * ────────────────
 * Utility to format dates and times across the chat application.
 */

/**
 * Formats a timestamp for a message bubble (e.g. "10:30 AM", "Yesterday, 2:15 PM", "July 1, 3:00 PM").
 */
export const formatMessageTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();

  // Time part (e.g., "10:30 AM")
  const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
  const timeStr = date.toLocaleTimeString([], timeOptions);

  // Check if today
  if (date.toDateString() === now.toDateString()) {
    return timeStr;
  }

  // Check if yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${timeStr}`;
  }

  // Same year
  if (date.getFullYear() === now.getFullYear()) {
    const monthDay = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return `${monthDay}, ${timeStr}`;
  }

  // Different year
  const fullDate = date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  return `${fullDate}, ${timeStr}`;
};

/**
 * Formats a date for a session card (e.g. "Tuesday, Jul 14, 2026").
 */
export const formatSessionDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Formats a time block for a session card (e.g. "10:30 AM").
 */
export const formatSessionTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};
