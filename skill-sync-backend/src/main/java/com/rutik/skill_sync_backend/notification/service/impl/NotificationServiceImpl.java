package com.rutik.skill_sync_backend.notification.service.impl;

import com.rutik.skill_sync_backend.common.exception.ResourceNotFoundException;
import com.rutik.skill_sync_backend.notification.dto.response.NotificationResponseDto;
import com.rutik.skill_sync_backend.notification.entity.Notification;
import com.rutik.skill_sync_backend.notification.enums.NotificationEntityType;
import com.rutik.skill_sync_backend.notification.enums.NotificationPriority;
import com.rutik.skill_sync_backend.notification.enums.NotificationType;
import com.rutik.skill_sync_backend.notification.factory.NotificationFactory;
import com.rutik.skill_sync_backend.notification.mapper.NotificationMapper;
import com.rutik.skill_sync_backend.notification.repository.NotificationRepository;
import com.rutik.skill_sync_backend.notification.service.NotificationPushService;
import com.rutik.skill_sync_backend.notification.service.NotificationService;
import com.rutik.skill_sync_backend.notification.template.NotificationTemplateService;
import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of NotificationService orchestrating templates, factories, repositories, and sockets.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationFactory notificationFactory;
    private final NotificationTemplateService templateService;
    private final NotificationMapper notificationMapper;
    private final NotificationPushService pushService;

    @Override
    @Transactional
    public NotificationResponseDto notifyReviewReceived(Long recipientId, Long reviewerId, Long reviewId, Long sessionId, Integer rating) {
        log.info("🔔 Creating REVIEW_RECEIVED notification for recipientId: {} (reviewer: {}, rating: {})", recipientId, reviewerId, rating);
        
        User recipient = fetchUser(recipientId);
        User reviewer = fetchUser(reviewerId);

        String title = templateService.buildReviewReceivedTitle();
        String message = templateService.buildReviewReceivedMessage(reviewer.getName(), rating);

        Notification notification = notificationFactory.buildNotification(
                recipient,
                title,
                message,
                NotificationType.REVIEW_RECEIVED,
                NotificationPriority.NORMAL,
                reviewId,
                NotificationEntityType.REVIEW
        );

        return saveAndPush(notification, recipientId);
    }

    @Override
    @Transactional
    public NotificationResponseDto notifySessionAccepted(Long recipientId, Long providerId, Long sessionId, String skillName) {
        log.info("🔔 Creating SESSION_ACCEPTED notification for recipientId: {} (provider: {}, session: {})", recipientId, providerId, sessionId);

        User recipient = fetchUser(recipientId);
        User provider = fetchUser(providerId);

        String title = templateService.buildSessionAcceptedTitle();
        String message = templateService.buildSessionAcceptedMessage(provider.getName(), skillName);

        Notification notification = notificationFactory.buildNotification(
                recipient,
                title,
                message,
                NotificationType.SESSION_ACCEPTED,
                NotificationPriority.HIGH,
                sessionId,
                NotificationEntityType.SESSION
        );

        return saveAndPush(notification, recipientId);
    }

    @Override
    @Transactional
    public NotificationResponseDto notifySessionCompleted(Long recipientId, Long providerId, Long sessionId, String skillName) {
        log.info("🔔 Creating SESSION_COMPLETED notification for recipientId: {} (session: {})", recipientId, sessionId);

        User recipient = fetchUser(recipientId);
        User otherParty = fetchUser(providerId);

        String title = templateService.buildSessionCompletedTitle();
        String message = templateService.buildSessionCompletedMessage(otherParty.getName(), skillName);

        Notification notification = notificationFactory.buildNotification(
                recipient,
                title,
                message,
                NotificationType.SESSION_COMPLETED,
                NotificationPriority.NORMAL,
                sessionId,
                NotificationEntityType.SESSION
        );

        return saveAndPush(notification, recipientId);
    }

    @Override
    @Transactional
    public NotificationResponseDto notifySessionCancelled(Long recipientId, Long cancelledById, Long sessionId, String skillName, String reason) {
        log.info("🔔 Creating SESSION_CANCELLED notification for recipientId: {} (cancelledBy: {}, session: {})", recipientId, cancelledById, sessionId);

        User recipient = fetchUser(recipientId);
        User otherParty = fetchUser(cancelledById);

        String title = templateService.buildSessionCancelledTitle();
        String message = templateService.buildSessionCancelledMessage(otherParty.getName(), skillName, reason);

        Notification notification = notificationFactory.buildNotification(
                recipient,
                title,
                message,
                NotificationType.SESSION_CANCELLED,
                NotificationPriority.HIGH,
                sessionId,
                NotificationEntityType.SESSION
        );

        return saveAndPush(notification, recipientId);
    }

    @Override
    @Transactional
    public NotificationResponseDto notifyMatchFound(Long userId, Long matchedUserId, Long matchId, String matchedSkillName) {
        log.info("🔔 Creating MATCH_FOUND notification for userId: {} (matchedUser: {}, matchId: {})", userId, matchedUserId, matchId);

        User recipient = fetchUser(userId);
        User matchedUser = fetchUser(matchedUserId);

        String title = templateService.buildMatchFoundTitle();
        String message = templateService.buildMatchFoundMessage(matchedUser.getName(), matchedSkillName);

        Notification notification = notificationFactory.buildNotification(
                recipient,
                title,
                message,
                NotificationType.MATCH_FOUND,
                NotificationPriority.NORMAL,
                matchId,
                NotificationEntityType.MATCH
        );

        return saveAndPush(notification, userId);
    }

    @Override
    @Transactional
    public NotificationResponseDto notifyBadgeEarned(Long userId, Long badgeId, String badgeName) {
        log.info("🔔 Creating BADGE_EARNED notification for userId: {} (badgeId: {}, name: {})", userId, badgeId, badgeName);

        User recipient = fetchUser(userId);

        String title = templateService.buildBadgeEarnedTitle();
        String message = templateService.buildBadgeEarnedMessage(badgeName);

        Notification notification = notificationFactory.buildNotification(
                recipient,
                title,
                message,
                NotificationType.BADGE_EARNED,
                NotificationPriority.HIGH,
                badgeId,
                NotificationEntityType.BADGE
        );

        return saveAndPush(notification, userId);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        log.info("✍️ Marking notification {} as read for user {}", notificationId, userId);
        int rowsUpdated = notificationRepository.markAsRead(notificationId, userId);
        if (rowsUpdated == 0) {
            log.error("❌ Notification {} not found or does not belong to user {}", notificationId, userId);
            throw new ResourceNotFoundException("Notification not found or access denied");
        }
        pushService.pushUnreadCount(userId, notificationRepository.countUnreadByRecipientId(userId));
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        log.info("✍️ Marking all notifications as read for user {}", userId);
        notificationRepository.markAllReadByRecipientId(userId);
        pushService.pushUnreadCount(userId, 0L);
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId, Long userId) {
        log.info("✍️ Soft deleting notification {} for user {}", notificationId, userId);
        int rowsUpdated = notificationRepository.softDelete(notificationId, userId);
        if (rowsUpdated == 0) {
            log.error("❌ Notification {} not found or does not belong to user {}", notificationId, userId);
            throw new ResourceNotFoundException("Notification not found or access denied");
        }
        pushService.pushUnreadCount(userId, notificationRepository.countUnreadByRecipientId(userId));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponseDto> getNotifications(Long userId, Pageable pageable) {
        log.info("🔍 Fetching notification history page for user {}", userId);
        return notificationRepository.findByRecipientIdAndIsDeletedFalseOrderByCreatedAtDesc(userId, pageable)
                .map(notificationMapper::toResponseDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponseDto> getUnreadNotifications(Long userId, Pageable pageable) {
        log.info("🔍 Fetching unread notifications page for user {}", userId);
        return notificationRepository.findByRecipientIdAndIsReadFalseAndIsDeletedFalseOrderByCreatedAtDesc(userId, pageable)
                .map(notificationMapper::toResponseDto);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        log.info("🔍 Querying unread count for user {}", userId);
        return notificationRepository.countUnreadByRecipientId(userId);
    }

    // ── Helper Methods ─────────────────────────────────────────────────────

    private User fetchUser(Long userId) {
        return userRepository.findByIdAndIsActiveTrue(userId)
                .orElseThrow(() -> {
                    log.error("❌ Active user ID {} not found", userId);
                    return new ResourceNotFoundException("User not found");
                });
    }

    private NotificationResponseDto saveAndPush(Notification notification, Long recipientId) {
        // save notification
        Notification saved = notificationRepository.saveAndFlush(notification);
        log.info("💾 Notification saved successfully with ID: {}", saved.getId());

        NotificationResponseDto responseDto = notificationMapper.toResponseDto(saved);
        
        try {
            // push notification
            pushService.pushNotification(recipientId, responseDto);
            // push unread count
            long unreadCount = notificationRepository.countUnreadByRecipientId(recipientId);
            pushService.pushUnreadCount(recipientId, unreadCount);
            log.info("✅ Notification and count pushed to recipient user ID {}", recipientId);
        } catch (Exception ex) {
            log.error("⚠️ Failed to push notification over WebSocket: {}", ex.getMessage());
        }

        return responseDto;
    }
}
