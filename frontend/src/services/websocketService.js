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
 * • Token refresh on 401 is handled exclusively by the Axios interceptor in
 *   api.js for REST calls.  WebSocket re-auth is handled by disconnecting and
 *   letting the caller decide whether to reconnect with a fresh token.
 */

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { tokenService } from '../utils/tokenUtils';

// ── Config ────────────────────────────────────────────────────────────────────

const WS_URL       = import.meta.env.VITE_WS_URL || '/ws';
const HEARTBEAT_MS = 25_000;

// ── Module-level state ────────────────────────────────────────────────────────

/** The single active STOMP client, or null when disconnected. */
let client        = null;

/** Active STOMP subscription handles keyed by logical name / destination. */
let subscriptions = {};

/** Registry for dynamic subscriptions that must survive reconnection. */
let dynamicSubscriptions = {};

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Creates a SockJS transport that always reads the token fresh from storage.
 * Called by the STOMP library on every connection/reconnection attempt.
 */
const buildSockJS = () => {
  const token = tokenService.get();
  if (!token) {
    return new SockJS(WS_URL);
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
 */
export const connectWebSocket = (callbacks = {}) => {
  const { onNotification, onUnreadCount, onConnect, onDisconnect, onError } = callbacks;

  teardown();

  const token = tokenService.get();
  if (!token) {
    return;
  }

  client = new Client({
    webSocketFactory: buildSockJS,
    reconnectDelay: 0,
    heartbeatIncoming: HEARTBEAT_MS,
    heartbeatOutgoing: HEARTBEAT_MS,

    onConnect: () => {
      onConnect?.();

      subscriptions.notifications = client.subscribe(
        '/user/queue/notifications',
        (message) => {
          try {
            const payload = JSON.parse(message.body);
            onNotification?.(payload);
          } catch {
            // ignore malformed frame
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
          } catch {
            // ignore malformed frame
          }
        }
      );

      // Re-establish dynamic subscriptions upon reconnect
      Object.entries(dynamicSubscriptions).forEach(([dest, cb]) => {
        subscriptions[dest] = client.subscribe(dest, (message) => {
          try {
            const payload = JSON.parse(message.body);
            cb(payload);
          } catch (err) {
            cb(message.body);
          }
        });
      });
    },

    onDisconnect: () => {
      subscriptions = {};
      onDisconnect?.();
    },

    onStompError: (frame) => {
      teardown();
      onError?.('stomp', frame);
      onDisconnect?.();
    },

    onWebSocketError: () => {
      teardown();
      onDisconnect?.();
    },
  });

  client.activate();
};

/**
 * Gracefully closes the current WebSocket connection.
 */
export const disconnectWebSocket = () => {
  teardown();
};

/**
 * Returns true if the STOMP client is currently connected and active.
 */
export const isWebSocketConnected = () =>
  Boolean(client?.connected);

/**
 * Subscribes dynamically to a STOMP destination.
 * If already connected, registers immediately.
 * Survived by reconnection.
 */
export const subscribeDynamic = (destination, callback) => {
  dynamicSubscriptions[destination] = callback;

  if (client && client.connected) {
    if (subscriptions[destination]) {
      try { subscriptions[destination].unsubscribe(); } catch {}
    }
    const sub = client.subscribe(destination, (message) => {
      try {
        const payload = JSON.parse(message.body);
        callback(payload);
      } catch (err) {
        callback(message.body);
      }
    });
    subscriptions[destination] = sub;
    return sub;
  }
  return null;
};

/**
 * Unsubscribes dynamically from a destination and removes it from the reconnect registry.
 */
export const unsubscribeDynamic = (destination) => {
  delete dynamicSubscriptions[destination];
  if (subscriptions[destination]) {
    try { subscriptions[destination].unsubscribe(); } catch {}
    delete subscriptions[destination];
  }
};

/**
 * Publishes a STOMP frame to a destination.
 */
export const publish = (destination, body) => {
  if (client && client.connected) {
    client.publish({
      destination,
      body: JSON.stringify(body)
    });
  }
};
