/**
 * notificationNavigation.js
 * ─────────────────────────
 * Centralised navigation helper for notifications.
 * Maps entityType + entityId to the correct app route.
 *
 * Keeps all routing logic OUT of UI components.
 */

// ── Entity type constants (must match backend NotificationEntityType enum) ────

export const ENTITY_TYPES = {
  SESSION:  'SESSION',
  REVIEW:   'REVIEW',
  MATCH:    'MATCH',
  USER:     'USER',
  SYSTEM:   'SYSTEM',
};

// ── Route resolver ────────────────────────────────────────────────────────────

/**
 * Returns the React Router path to navigate to when a notification is clicked.
 *
 * @param {string} entityType  - e.g. 'SESSION', 'REVIEW', 'MATCH'
 * @param {number|string} entityId - the ID of the related entity
 * @returns {string|null} route path, or null if no navigation applies
 */
export const resolveNotificationRoute = (entityType, entityId) => {
  if (!entityType || !entityId) return null;

  switch (entityType) {
    case ENTITY_TYPES.SESSION:
      return `/sessions/${entityId}`;

    case ENTITY_TYPES.REVIEW:
      return `/reviews`;

    case ENTITY_TYPES.MATCH:
      return `/matches`;

    case ENTITY_TYPES.USER:
      return `/profile`;

    case ENTITY_TYPES.SYSTEM:
    default:
      return null;
  }
};
