/**
 * notificationUtils.js
 * ────────────────────
 * Icon and color helpers for notification types.
 * Returns Tabler icon components and Tailwind/CSS color tokens.
 *
 * Notification types must match backend NotificationType enum:
 *   REVIEW_RECEIVED, SESSION_ACCEPTED, SESSION_COMPLETED,
 *   SESSION_CANCELLED, MATCH_FOUND, SYSTEM
 */

import {
  IconStar,
  IconCalendarCheck,
  IconCircleCheck,
  IconCalendarX,
  IconBell,
  IconSparkles,
} from '@tabler/icons-react';

// ── Notification type constants ───────────────────────────────────────────────

export const NOTIFICATION_TYPES = {
  REVIEW_RECEIVED:   'REVIEW_RECEIVED',
  SESSION_ACCEPTED:  'SESSION_ACCEPTED',
  SESSION_COMPLETED: 'SESSION_COMPLETED',
  SESSION_CANCELLED: 'SESSION_CANCELLED',
  MATCH_FOUND:       'MATCH_FOUND',
  SYSTEM:            'SYSTEM',
};

// ── Icon resolver ─────────────────────────────────────────────────────────────

/**
 * Returns the Tabler icon component for a given notification type.
 * @param {string} type
 * @returns {React.ComponentType}
 */
export const getNotificationIcon = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.REVIEW_RECEIVED:
      return IconStar;
    case NOTIFICATION_TYPES.SESSION_ACCEPTED:
      return IconCalendarCheck;
    case NOTIFICATION_TYPES.SESSION_COMPLETED:
      return IconCircleCheck;
    case NOTIFICATION_TYPES.SESSION_CANCELLED:
      return IconCalendarX;
    case NOTIFICATION_TYPES.MATCH_FOUND:
      return IconSparkles;
    case NOTIFICATION_TYPES.SYSTEM:
    default:
      return IconBell;
  }
};

// ── Color resolver ────────────────────────────────────────────────────────────

/**
 * Returns { bg, border, icon } CSS color strings for a notification type.
 * Compatible with both light and dark mode via CSS variables.
 *
 * @param {string} type
 * @param {boolean} isDark
 * @returns {{ bg: string, border: string, iconColor: string }}
 */
export const getNotificationColors = (type, isDark) => {
  const alpha = isDark ? '0.15' : '0.12';
  const borderAlpha = isDark ? '0.25' : '0.2';

  switch (type) {
    case NOTIFICATION_TYPES.REVIEW_RECEIVED:
      return {
        bg:        `rgba(245,158,11,${alpha})`,
        border:    `rgba(245,158,11,${borderAlpha})`,
        iconColor: '#f59e0b',
      };
    case NOTIFICATION_TYPES.SESSION_ACCEPTED:
      return {
        bg:        `rgba(16,185,129,${alpha})`,
        border:    `rgba(16,185,129,${borderAlpha})`,
        iconColor: '#10b981',
      };
    case NOTIFICATION_TYPES.SESSION_COMPLETED:
      return {
        bg:        `rgba(139,92,246,${alpha})`,
        border:    `rgba(139,92,246,${borderAlpha})`,
        iconColor: '#8b5cf6',
      };
    case NOTIFICATION_TYPES.SESSION_CANCELLED:
      return {
        bg:        `rgba(239,68,68,${alpha})`,
        border:    `rgba(239,68,68,${borderAlpha})`,
        iconColor: '#ef4444',
      };
    case NOTIFICATION_TYPES.MATCH_FOUND:
      return {
        bg:        `rgba(99,102,241,${alpha})`,
        border:    `rgba(99,102,241,${borderAlpha})`,
        iconColor: '#6366f1',
      };
    case NOTIFICATION_TYPES.SYSTEM:
    default:
      return {
        bg:        `rgba(100,116,139,${alpha})`,
        border:    `rgba(100,116,139,${borderAlpha})`,
        iconColor: '#64748b',
      };
  }
};

// ── Time formatting ───────────────────────────────────────────────────────────

/**
 * Formats a notification timestamp as a relative string.
 * e.g. "just now", "5m ago", "2h ago", "3d ago"
 *
 * @param {string} isoTimestamp
 * @returns {string}
 */
export const formatNotificationTime = (isoTimestamp) => {
  if (!isoTimestamp) return '';
  const date = new Date(isoTimestamp);
  const now  = new Date();
  const diffMs = now - date;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours / 24);

  if (seconds < 60)  return 'just now';
  if (minutes < 60)  return `${minutes}m ago`;
  if (hours < 24)    return `${hours}h ago`;
  if (days < 7)      return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
