/**
 * websocketService.js
 * ───────────────────
 * Singleton WebSocket / STOMP-over-SockJS service.
 *
 * Architecture contract
 * ─────────────────────
 * • ONE active Client at a time.  Any call to connectWebSocket() first tears
 *   down the existing client before building a new one.
 * • The STOMP library's built-in reconnect is DISABLED (reconnectDelay = 0).
 *   All reconnect decisions are owned by the caller (useNotificationSocket).
 * • onStompError NEVER triggers a token refresh.
 *   Rationale: authentication happens at the HTTP WebSocket handshake level
 *   (JwtHandshakeInterceptor).  If the handshake succeeds, the STOMP session
 *   is already authenticated.  Any subsequent STOMP error (e.g.
 *   "clientInboundChannel") is a broker/routing/serialization problem, NOT
 *   an auth problem.  Triggering a token refresh on every STOMP error caused
 *   an infinite refresh→reconnect→error→refresh loop.
 * • Token refresh on 401 is handled exclusively by the Axios interceptor in
 *   api.js for REST calls.  WebSocket re-auth is handled by disconnecting and
 *   letting the caller decide whether to reconnect with a fresh token.
 */

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { tokenService } from '../utils/tokenUtils';

// ── Config ────────────────────────────────────────────────────────────────────

const WS_URL         = '/ws';   // Vite dev proxy → http://localhost:8080/ws
const HEARTBEAT_MS   = 25_000;

// ── Module-level state ────────────────────────────────────────────────────────

/** The single active STOMP client, or null when disconnected. */
let client        = null;

/** Active STOMP subscription handles keyed by logical name. */
let subscriptions = {};

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Creates a SockJS transport that always reads the token fresh from storage.
 * Called by the STOMP library on every connection/reconnection attempt.
 */
const buildSockJS = () => {
  const token = tokenService.get();
  if (!token) {
    console.warn('[WebSocket] buildSockJS: no access token in storage — aborting connection');
    throw new Error('[WebSocket] No access token in storage');
  }
  return new SockJS(`${WS_URL}?token=${encodeURIComponent(token)}`);
};

/**
 * Unsubscribes all active subscriptions and deactivates the STOMP client.
 * Safe to call when client is already null.
 */
const teardown = () => {
  if (!client) return;
  Object.values(subscriptions).forEach((sub) => {
    try { sub.unsubscribe(); } catch { /* best-effort */ }
  });
  subscriptions = {};
  try { client.deactivate(); } catch { /* best-effort */ }
  client = null;
};

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Opens (or replaces) the WebSocket connection.
 *
 * @param {object} callbacks
 *   onConnect()               — called when STOMP session is ready
 *   onDisconnect()            — called when the session ends (for any reason)
 *   onNotification(payload)   — called with each parsed notification object
 *   onUnreadCount(n)          — called with the latest unread badge count
 *   onError(errorType, frame) — called on STOMP error; errorType is 'stomp'
 */
export const connectWebSocket = (callbacks = {}) => {
  const { onNotification, onUnreadCount, onConnect, onDisconnect, onError } = callbacks;

  // Tear down any existing client before creating a new one.
  // This prevents duplicate clients and duplicate subscriptions.
  teardown();

  client = new Client({
    webSocketFactory: buildSockJS,

    // Disable built-in reconnect.
    // The STOMP library's auto-reconnect re-enters connectWebSocket indirectly
    // and can cause duplicate clients when combined with our own reconnect logic.
    // The caller (useNotificationSocket) owns all reconnect decisions.
    reconnectDelay: 0,

    heartbeatIncoming: HEARTBEAT_MS,
    heartbeatOutgoing: HEARTBEAT_MS,

    onConnect: () => {
      console.info('[WebSocket] Connected — subscribing to notification queues');
      onConnect?.();

      subscriptions.notifications = client.subscribe(
        '/user/queue/notifications',
        (message) => {
          try {
            const payload = JSON.parse(message.body);
            onNotification?.(payload);
          } catch (err) {
            console.warn('[WebSocket] Failed to parse notification frame:', err);
          }
        }
      );

      subscriptions.unreadCount = client.subscribe(
        '/user/queue/notifications/count',
        (message) => {
          try {
            const raw   = message.body?.trim();
            const count = parseInt(raw, 10);
            onUnreadCount?.(Number.isFinite(count) ? count : 0);
          } catch (err) {
            console.warn('[WebSocket] Failed to parse unread-count frame:', err);
          }
        }
      );
    },

    onDisconnect: () => {
      console.info('[WebSocket] Disconnected');
      subscriptions = {};
      onDisconnect?.();
    },

    /**
     * STOMP protocol-level error (ERROR frame from broker).
     *
     * ⚠ DO NOT perform token refresh here.
     *
     * A STOMP ERROR frame means the broker rejected a frame we sent AFTER the
     * HTTP handshake already succeeded.  Authentication was already validated at
     * handshake time by JwtHandshakeInterceptor.  Common causes:
     *
     *   • "clientInboundChannel" — Spring's message broker failed to route the
     *     frame (transaction timing, listener exception, serialization error).
     *     This is a SERVER-SIDE BUG, not a client auth problem.
     *   • Subscription to an unauthorized destination — security policy mismatch.
     *
     * Refreshing the token and reconnecting for any of these causes an infinite
     * loop because the same error will fire again after reconnect.
     *
     * Strategy: log it, notify the caller, and let the caller decide what to do.
     */
    onStompError: (frame) => {
      const msg = frame.headers?.message || '(no message)';
      console.error('[WebSocket] STOMP ERROR frame received:', msg);
      console.debug('[WebSocket] Full STOMP error frame:', frame);

      teardown();
      onError?.('stomp', frame);
      onDisconnect?.();
    },

    onWebSocketError: (event) => {
      console.error('[WebSocket] Transport-level error:', event);
      teardown();
      onDisconnect?.();
    },
  });

  client.activate();
};

/**
 * Gracefully closes the current WebSocket connection.
 * Safe to call when already disconnected.
 */
export const disconnectWebSocket = () => {
  teardown();
};

/**
 * Returns true if the STOMP client is currently connected and active.
 */
export const isWebSocketConnected = () =>
  Boolean(client?.connected);
