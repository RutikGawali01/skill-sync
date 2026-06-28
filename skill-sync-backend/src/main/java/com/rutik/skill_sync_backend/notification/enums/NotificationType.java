package com.rutik.skill_sync_backend.notification.enums;

/**
 * Canonical set of notification types for the Skill Sync platform.
 *
 * Design: Each value corresponds to a specific domain event.
 * Listeners use these to stamp every Notification, enabling
 * type-based rendering on the React client.
 *
 * Open-Closed: Add new values here to support new events
 * without changing any existing notification logic.
 */
public enum NotificationType {

    // ─────────────── Session lifecycle ───────────────
    SESSION_REQUEST,
    SESSION_ACCEPTED,
    SESSION_REJECTED,
    SESSION_CANCELLED,
    SESSION_COMPLETED,

    // ─────────────── Review lifecycle ────────────────
    REVIEW_RECEIVED,
    REVIEW_REMINDER,

    // ─────────────── Matching ────────────────────────
    MATCH_FOUND,

    // ─────────────── Gamification ────────────────────
    BADGE_EARNED,

    // ─────────────── Administrative ──────────────────
    SYSTEM
}
