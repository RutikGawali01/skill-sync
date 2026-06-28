package com.rutik.skill_sync_backend.notification.enums;

/**
 * Represents the type of domain entity associated with a notification.
 * Enables client-side deep-linking and dynamic routing (e.g. /sessions/{id} or /reviews/{id})
 * without storing hardcoded URLs in the database.
 */
public enum NotificationEntityType {
    SESSION,
    REVIEW,
    MATCH,
    BADGE,
    PROFILE,
    SYSTEM
}
