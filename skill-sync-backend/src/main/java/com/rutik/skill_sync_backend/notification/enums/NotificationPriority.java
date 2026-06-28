package com.rutik.skill_sync_backend.notification.enums;

/**
 * Priority level for a notification.
 *
 * Used by the React client to decide how to render the notification:
 *   LOW    → subtle inbox item only
 *   NORMAL → standard toast + bell update
 *   HIGH   → prominent modal or sticky toast
 *
 * NotificationFactory assigns the appropriate priority
 * when constructing each notification type.
 */
public enum NotificationPriority {
    LOW,
    NORMAL,
    HIGH
}
