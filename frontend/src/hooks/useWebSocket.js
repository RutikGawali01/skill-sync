import { useEffect } from 'react';
import {
  subscribeDynamic,
  unsubscribeDynamic,
  publish,
  isWebSocketConnected
} from '../services/websocketService';

/**
 * Hook for component-level STOMP WebSocket subscriptions and publications.
 */
const useWebSocket = () => {
  useEffect(() => {
    // No-op for global lifecycle (handled by useNotificationSocket at root)
  }, []);

  /**
   * Registers a dynamic subscription.
   * Auto-unsubscribes on cleanup if path is returned.
   */
  const subscribe = (destination, callback) => {
    subscribeDynamic(destination, callback);
    return () => {
      unsubscribeDynamic(destination);
    };
  };

  /**
   * Clears a subscription.
   */
  const unsubscribe = (destination) => {
    unsubscribeDynamic(destination);
  };

  /**
   * Publishes message payload to STOMP destination.
   */
  const send = (destination, body) => {
    publish(destination, body);
  };

  return {
    subscribe,
    unsubscribe,
    send,
    isConnected: isWebSocketConnected(),
  };
};

export default useWebSocket;
