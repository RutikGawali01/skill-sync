/**
 * useNotifications.js
 * ───────────────────
 * Custom hook: unified interface for all notification state and actions.
 *
 * Provides:
 *   - All notification state from Redux
 *   - Dispatchers with toast feedback on failure
 *   - Page loading helpers (initial load + load more)
 *
 * Usage:
 *   const { notifications, unreadCount, markRead, loadMore } = useNotifications();
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { notifications as mantineNotify } from '@mantine/notifications';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  removeNotification,
  clearNotificationError,
  selectNotifications,
  selectUnreadCount,
  selectNotificationsLoading,
  selectMarkingRead,
  selectNotificationError,
  selectWsConnected,
  selectTotalPages,
  selectCurrentPage,
  selectHasMorePages,
  selectUnreadNotifications,
} from '../redux/notification/notificationSlice';

const useNotifications = () => {
  const dispatch = useDispatch();

  // ── Selectors ───────────────────────────────────────────────────────────────
  const allNotifications   = useSelector(selectNotifications);
  const unreadNotifications = useSelector(selectUnreadNotifications);
  const unreadCount        = useSelector(selectUnreadCount);
  const loading            = useSelector(selectNotificationsLoading);
  const markingRead        = useSelector(selectMarkingRead);
  const error              = useSelector(selectNotificationError);
  const wsConnected        = useSelector(selectWsConnected);
  const totalPages         = useSelector(selectTotalPages);
  const currentPage        = useSelector(selectCurrentPage);
  const hasMore            = useSelector(selectHasMorePages);

  // ── Actions ─────────────────────────────────────────────────────────────────

  /** Load the first page of notifications (page=0, replaces list). */
  const loadNotifications = useCallback((unreadOnly = false) => {
    dispatch(fetchNotifications({ page: 0, size: 20, unreadOnly }));
  }, [dispatch]);

  /** Load unread count silently. */
  const loadUnreadCount = useCallback(() => {
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  /** Load the next page for infinite scroll. */
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      dispatch(fetchNotifications({ page: currentPage + 1, size: 20 }));
    }
  }, [dispatch, hasMore, loading, currentPage]);

  /** Mark a single notification as read. */
  const markRead = useCallback(async (id) => {
    const result = await dispatch(markNotificationRead(id));
    if (markNotificationRead.rejected.match(result)) {
      mantineNotify.show({
        title: 'Error',
        message: result.payload || 'Could not mark notification as read.',
        color: 'red',
        autoClose: 3000,
      });
    }
  }, [dispatch]);

  /** Mark all notifications as read with toast feedback. */
  const markAllRead = useCallback(async () => {
    const result = await dispatch(markAllNotificationsRead());
    if (markAllNotificationsRead.fulfilled.match(result)) {
      mantineNotify.show({
        title: 'All caught up!',
        message: 'All notifications marked as read.',
        color: 'teal',
        autoClose: 3000,
        radius: 'md',
      });
    } else {
      mantineNotify.show({
        title: 'Error',
        message: result.payload || 'Could not mark all as read.',
        color: 'red',
        autoClose: 3000,
      });
    }
  }, [dispatch]);

  /** Delete a notification with toast feedback. */
  const deleteNotification = useCallback(async (id) => {
    const result = await dispatch(removeNotification(id));
    if (removeNotification.rejected.match(result)) {
      mantineNotify.show({
        title: 'Error',
        message: result.payload || 'Could not delete notification.',
        color: 'red',
        autoClose: 3000,
      });
    }
  }, [dispatch]);

  /** Clear error state. */
  const clearError = useCallback(() => {
    dispatch(clearNotificationError());
  }, [dispatch]);

  return {
    // State
    notifications:    allNotifications,
    unreadNotifications,
    unreadCount,
    loading,
    markingRead,
    error,
    wsConnected,
    totalPages,
    currentPage,
    hasMore,
    // Actions
    loadNotifications,
    loadUnreadCount,
    loadMore,
    markRead,
    markAllRead,
    deleteNotification,
    clearError,
  };
};

export default useNotifications;
