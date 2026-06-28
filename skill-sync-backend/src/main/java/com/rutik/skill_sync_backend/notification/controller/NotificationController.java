package com.rutik.skill_sync_backend.notification.controller;

import com.rutik.skill_sync_backend.common.response.ApiResponse;
import com.rutik.skill_sync_backend.notification.dto.response.NotificationResponseDto;
import com.rutik.skill_sync_backend.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller exposing read-only and state-update operations for Notifications.
 * Reuses same security principal retrieval standard across the project.
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Retrieve paginated history of notifications for the authenticated user.
     * Supports filtering by read/unread via the optional `unreadOnly` flag.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<NotificationResponseDto>>> getNotifications(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @RequestParam(value = "unreadOnly", required = false, defaultValue = "false") boolean unreadOnly,
            @PageableDefault(size = 20) Pageable pageable) {
        
        log.info("📥 REST Request: Get notifications for user ID: {} (unreadOnly: {})", userId, unreadOnly);
        Page<NotificationResponseDto> page;
        if (unreadOnly) {
            page = notificationService.getUnreadNotifications(userId, pageable);
        } else {
            page = notificationService.getNotifications(userId, pageable);
        }
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved successfully", page));
    }

    /**
     * Retrieve the count of unread notifications (used for display badges).
     */
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@AuthenticationPrincipal(expression = "id") Long userId) {
        log.info("📥 REST Request: Get unread count for user ID: {}", userId);
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success("Unread count retrieved successfully", count));
    }

    /**
     * Mark a specific notification as read.
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @PathVariable("id") Long id) {
        
        log.info("📥 REST Request: Mark notification ID {} as read for user ID: {}", id, userId);
        notificationService.markAsRead(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read successfully"));
    }

    /**
     * Mark all notifications of the user as read.
     */
    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@AuthenticationPrincipal(expression = "id") Long userId) {
        log.info("📥 REST Request: Mark all notifications as read for user ID: {}", userId);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read successfully"));
    }

    /**
     * Soft delete a specific notification.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @PathVariable("id") Long id) {
        
        log.info("📥 REST Request: Delete notification ID {} for user ID: {}", id, userId);
        notificationService.deleteNotification(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Notification deleted successfully"));
    }
}
