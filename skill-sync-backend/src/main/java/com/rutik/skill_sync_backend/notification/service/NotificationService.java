package com.rutik.skill_sync_backend.notification.service;

import com.rutik.skill_sync_backend.notification.dto.response.NotificationResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Domain-specific service interface orchestrating notifications.
 *
 * Responsibilities:
 * ─────────────────
 * 1. Exposes specialized, domain-specific methods (e.g. notifyReviewReceived)
 *    rather than generic creation methods, ensuring high cohesion.
 * 2. Implements business rules, validation, and database persistence.
 * 3. Does NOT know about WebSockets, STOMP, or SimpMessagingTemplate.
 */
public interface NotificationService {

    // ── Domain-Specific Notification Creators ──────────────────────────────
    
    NotificationResponseDto notifyReviewReceived(Long recipientId, Long reviewerId, Long reviewId, Long sessionId, Integer rating);

    NotificationResponseDto notifySessionAccepted(Long recipientId, Long providerId, Long sessionId, String skillName);

    NotificationResponseDto notifySessionCompleted(Long recipientId, Long providerId, Long sessionId, String skillName);

    NotificationResponseDto notifySessionCancelled(Long recipientId, Long cancelledById, Long sessionId, String skillName, String reason);

    NotificationResponseDto notifyMatchFound(Long userId, Long matchedUserId, Long matchId, String matchedSkillName);

    NotificationResponseDto notifyBadgeEarned(Long userId, Long badgeId, String badgeName);

    // ── Standard Notification Operations ───────────────────────────────────

    void markAsRead(Long notificationId, Long userId);

    void markAllAsRead(Long userId);

    void deleteNotification(Long notificationId, Long userId);

    Page<NotificationResponseDto> getNotifications(Long userId, Pageable pageable);

    Page<NotificationResponseDto> getUnreadNotifications(Long userId, Pageable pageable);

    long getUnreadCount(Long userId);
}
