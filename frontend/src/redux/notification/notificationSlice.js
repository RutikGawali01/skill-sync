/**
 * notificationSlice.js
 * ────────────────────
 * Redux slice for the Notification feature.
 *
 * State shape:
 * {
 *   notifications  : NotificationResponseDto[],  // paginated list
 *   unreadCount    : number,
 *   totalPages     : number,
 *   currentPage    : number,
 *   loading        : boolean,
 *   markingRead    : boolean,
 *   error          : string | null,
 *   wsConnected    : boolean,                    // WebSocket connection status
 * }
 */

import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import * as notificationService from '../../services/notificationService';

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async ({ page = 0, size = 20, unreadOnly = false } = {}, { rejectWithValue }) => {
    try {
      return await notificationService.getNotifications({ page, size, unreadOnly });
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to load notifications'
      );
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      return await notificationService.getUnreadCount();
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to fetch unread count'
      );
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(id);
      return id;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to mark as read'
      );
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllRead();
      return true;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to mark all as read'
      );
    }
  }
);

export const removeNotification = createAsyncThunk(
  'notifications/remove',
  async (id, { rejectWithValue }) => {
    try {
      await notificationService.deleteNotification(id);
      return id;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || 'Failed to delete notification'
      );
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount:   0,
    totalPages:    0,
    currentPage:   0,
    loading:       false,
    markingRead:   false,
    error:         null,
    wsConnected:   false,
  },
  reducers: {
    /** Called when a real-time WS notification arrives. Prepends to list and bumps unread count. */
    addRealtimeNotification: (state, action) => {
      // Avoid duplicates
      const exists = state.notifications.some((n) => n.id === action.payload.id);
      if (!exists) {
        state.notifications = [action.payload, ...state.notifications];
        if (!action.payload.read) {
          state.unreadCount = state.unreadCount + 1;
        }
      }
    },
    /** Called when the WS sends an updated unread count. */
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    /** Update WebSocket connection status. */
    setWsConnected: (state, action) => {
      state.wsConnected = action.payload;
    },
    clearNotificationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchNotifications ────────────────────────────────────────────────────
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload;
        if (data) {
          // Backend returns a Page object
          const items       = Array.isArray(data.content) ? data.content : (Array.isArray(data) ? data : []);
          const page        = data.number ?? action.meta.arg?.page ?? 0;
          // If loading page 0, replace list; otherwise append (infinite scroll)
          state.notifications = page === 0 ? items : [...state.notifications, ...items];
          state.totalPages    = data.totalPages ?? 1;
          state.currentPage   = page;
        }
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // ── fetchUnreadCount ──────────────────────────────────────────────────────
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload ?? 0;
      });

    // ── markNotificationRead ──────────────────────────────────────────────────
    builder
      .addCase(markNotificationRead.pending, (state) => {
        state.markingRead = true;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.markingRead = false;
        const id = action.payload;
        state.notifications = state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        );
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      .addCase(markNotificationRead.rejected, (state) => {
        state.markingRead = false;
      });

    // ── markAllNotificationsRead ──────────────────────────────────────────────
    builder
      .addCase(markAllNotificationsRead.pending, (state) => {
        state.markingRead = true;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.markingRead     = false;
        state.notifications   = state.notifications.map((n) => ({ ...n, read: true }));
        state.unreadCount     = 0;
      })
      .addCase(markAllNotificationsRead.rejected, (state) => {
        state.markingRead = false;
      });

    // ── removeNotification ────────────────────────────────────────────────────
    builder
      .addCase(removeNotification.fulfilled, (state, action) => {
        const id = action.payload;
        const removed = state.notifications.find((n) => n.id === id);
        state.notifications = state.notifications.filter((n) => n.id !== id);
        if (removed && !removed.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  },
});

export const {
  addRealtimeNotification,
  setUnreadCount,
  setWsConnected,
  clearNotificationError,
} = notificationSlice.actions;

export default notificationSlice.reducer;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectNotifications     = (state) => state.notifications.notifications;
export const selectUnreadCount       = (state) => state.notifications.unreadCount;
export const selectNotificationsLoading = (state) => state.notifications.loading;
export const selectMarkingRead       = (state) => state.notifications.markingRead;
export const selectNotificationError = (state) => state.notifications.error;
export const selectWsConnected       = (state) => state.notifications.wsConnected;
export const selectTotalPages        = (state) => state.notifications.totalPages;
export const selectCurrentPage       = (state) => state.notifications.currentPage;

// ── Derived Selectors (memoized) ──────────────────────────────────────────────

/** All unread notifications from the list. Memoized to avoid new-reference rerenders. */
export const selectUnreadNotifications = createSelector(
  (state) => state.notifications.notifications,
  (notifications) => notifications.filter((n) => !n.read)
);

/** Whether there's a next page available. */
export const selectHasMorePages = (state) =>
  state.notifications.currentPage < state.notifications.totalPages - 1;
