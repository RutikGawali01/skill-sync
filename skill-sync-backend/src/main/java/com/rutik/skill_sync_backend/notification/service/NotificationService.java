package com.rutik.skill_sync_backend.notification.service;

import com.rutik.skill_sync_backend.notification.dto.response.NotificationResponseDto;
import com.rutik.skill_sync_backend.notification.dto.response.NotificationSummaryDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.rutik.skill_sync_backend.common.dto.PageResponse;

public interface NotificationService {


    NotificationResponseDto notifyReviewReceived(Long recipientId, Long reviewerId, Long reviewId, Long sessionId, Integer rating);

    NotificationResponseDto notifySessionAccepted(Long recipientId, Long providerId, Long sessionId, String skillName);

    NotificationResponseDto notifySessionCompleted(Long recipientId, Long providerId, Long sessionId, String skillName);

    NotificationResponseDto notifySessionCancelled(Long recipientId, Long cancelledById, Long sessionId, String skillName, String reason);

    NotificationResponseDto notifyMatchFound(Long userId, Long matchedUserId, Long matchId, String matchedSkillName);

    NotificationResponseDto notifyBadgeEarned(Long userId, Long badgeId, String badgeName);


    void markAsRead(Long notificationId, Long userId);

    void markAllAsRead(Long userId);

    void deleteNotification(Long notificationId, Long userId);

    PageResponse<NotificationResponseDto> getNotifications(Long userId, Pageable pageable);

    PageResponse<NotificationResponseDto> getUnreadNotifications(Long userId, Pageable pageable);

    long getUnreadCount(Long userId);

    NotificationSummaryDto getNotificationSummary(Long userId);
}

