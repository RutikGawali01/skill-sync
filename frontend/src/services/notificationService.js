/**
 * notificationService.js
 * ──────────────────────
 * Service layer for Notification REST API calls.
 * Uses the shared Axios instance (JWT auth interceptors already wired in).
 *
 * API Contract (backend):
 *   GET    /api/notifications                → ApiResponse<Page<NotificationResponseDto>>
 *   GET    /api/notifications/unread-count   → ApiResponse<Long>
 *   PATCH  /api/notifications/{id}/read      → ApiResponse<Void>
 *   PATCH  /api/notifications/read-all       → ApiResponse<Void>
 *   DELETE /api/notifications/{id}           → ApiResponse<Void>
 *
 * Always returns response.data.data (the inner payload from ApiResponse<T>).
 */

import api from './api';

// ── Get paginated notifications ───────────────────────────────────────────────

/**
 * Fetch paginated notification history for the current user.
 * @param {{ page?: number, size?: number, unreadOnly?: boolean }} params
 * @returns {Promise<Page<NotificationResponseDto>>}
 */
export const getNotifications = async ({ page = 0, size = 20, unreadOnly = false } = {}) => {
  const response = await api.get('/notifications', {
    params: { page, size, unreadOnly },
  });
  return response.data.data;
};

// ── Get unread count ──────────────────────────────────────────────────────────

/**
 * Fetch the count of unread notifications for the current user.
 * @returns {Promise<number>}
 */
export const getUnreadCount = async () => {
  const response = await api.get('/notifications/unread-count');
  return response.data.data;
};

// ── Mark one notification as read ─────────────────────────────────────────────

/**
 * Mark a specific notification as read.
 * @param {number} id - Notification ID
 * @returns {Promise<void>}
 */
export const markAsRead = async (id) => {
  await api.patch(`/notifications/${id}/read`);
};

// ── Mark all notifications as read ────────────────────────────────────────────

/**
 * Mark all notifications for the current user as read.
 * @returns {Promise<void>}
 */
export const markAllRead = async () => {
  await api.patch('/notifications/read-all');
};

// ── Delete a notification ─────────────────────────────────────────────────────

/**
 * Soft-delete a specific notification.
 * @param {number} id - Notification ID
 * @returns {Promise<void>}
 */
export const deleteNotification = async (id) => {
  await api.delete(`/notifications/${id}`);
};

// ── Test WebSocket Push ───────────────────────────────────────────────────────

/**
 * Triggers a test WebSocket notification from the backend.
 * @returns {Promise<void>}
 */
export const testPushNotification = async () => {
  await api.post('/notifications/test-push');
};

// Expose globally for easy console testing
if (typeof window !== 'undefined') {
  window.testPushNotification = testPushNotification;
}


