/**
 * useNotificationSocket.js
 * ────────────────────────
 * Custom hook: manages the WebSocket lifecycle for real-time notifications.
 *
 * Responsibilities:
 *   - Connects on mount when the user is authenticated
 *   - Disconnects on unmount or when the JWT token is cleared (logout)
 *   - Dispatches Redux actions for realtime notifications + unread count
 *   - Shows a Mantine toast when a new notification arrives
 *   - Owns all reconnect decisions (websocketService does NOT auto-reconnect)
 *
 * Reconnect policy:
 *   - On a STOMP error or unexpected disconnect, retries up to MAX_RETRIES times
 *     with an exponential-ish delay (BASE_RETRY_MS * attempt).
 *   - If all retries are exhausted the user is left in a "disconnected" state
 *     (they can navigate away and back to trigger a fresh connection).
 *
 * Usage (mount once at the app root, inside ProtectedRoute or MainLayout):
 *   useNotificationSocket();
 */

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { notifications as mantineNotify } from '@mantine/notifications';
import { connectWebSocket, disconnectWebSocket } from '../services/websocketService';
import {
  addRealtimeNotification,
  setUnreadCount,
  setWsConnected,
} from '../redux/notification/notificationSlice';

// ── Reconnect config ──────────────────────────────────────────────────────────

const MAX_RETRIES   = 3;
const BASE_RETRY_MS = 3000;

// ─────────────────────────────────────────────────────────────────────────────

const useNotificationSocket = () => {
  const dispatch  = useDispatch();
  const token     = useSelector((state) => state.auth.token);

  // Ref-based state that survives re-renders without triggering them
  const retryCount      = useRef(0);
  const retryTimer      = useRef(null);
  const isActive        = useRef(false);   // true while this effect instance owns the connection
  const currentToken    = useRef(token);

  // Keep the ref in sync with the latest token without re-running the effect
  useEffect(() => { currentToken.current = token; }, [token]);

  useEffect(() => {
    if (!token) {
      // User logged out — tear down everything
      clearTimeout(retryTimer.current);
      disconnectWebSocket();
      dispatch(setWsConnected(false));
      isActive.current  = false;
      retryCount.current = 0;
      return;
    }

    isActive.current  = true;
    retryCount.current = 0;

    const connect = () => {
      if (!isActive.current) return;  // effect was cleaned up while we waited

      connectWebSocket({
        onConnect: () => {
          if (!isActive.current) { disconnectWebSocket(); return; }
          retryCount.current = 0; // reset on successful connect
          dispatch(setWsConnected(true));
          console.info('[useNotificationSocket] WebSocket connected');
        },

        onNotification: (payload) => {
          dispatch(addRealtimeNotification(payload));
          mantineNotify.show({
            id:        `notif-${payload.id}`,
            title:     payload.title   || 'New Notification',
            message:   payload.message || '',
            color:     'violet',
            autoClose: 5000,
            radius:    'md',
          });
        },

        onUnreadCount: (count) => {
          dispatch(setUnreadCount(count));
        },

        /**
         * Called when the STOMP session ends for any reason (clean close,
         * STOMP ERROR frame, transport error).
         * websocketService has already torn down the client by this point.
         */
        onDisconnect: () => {
          if (!isActive.current) return;
          dispatch(setWsConnected(false));
          scheduleRetry();
        },

        /**
         * Called specifically on a STOMP ERROR frame.
         * The service also calls onDisconnect afterwards, so we only need to
         * log here — reconnect is handled by onDisconnect → scheduleRetry.
         */
        onError: (errorType, frame) => {
          console.warn(
            `[useNotificationSocket] STOMP error (${errorType}):`,
            frame?.headers?.message || frame
          );
        },
      });
    };

    const scheduleRetry = () => {
      if (!isActive.current) return;

      retryCount.current += 1;

      if (retryCount.current > MAX_RETRIES) {
        console.warn(
          `[useNotificationSocket] Max retries (${MAX_RETRIES}) reached — ` +
          'stopping reconnect. Refresh the page to reconnect.'
        );
        return;
      }

      const delay = BASE_RETRY_MS * retryCount.current;
      console.info(
        `[useNotificationSocket] Reconnecting in ${delay}ms ` +
        `(attempt ${retryCount.current}/${MAX_RETRIES})…`
      );

      retryTimer.current = setTimeout(connect, delay);
    };

    connect();

    // ── Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      isActive.current = false;
      clearTimeout(retryTimer.current);
      disconnectWebSocket();
      dispatch(setWsConnected(false));
    };
  }, [token, dispatch]); // reconnect from scratch whenever the token changes
};

export default useNotificationSocket;
