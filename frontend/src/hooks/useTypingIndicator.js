import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useWebSocket from './useWebSocket';
import { setTypingStatus } from '../redux/chatSlice';

/**
 * Hook to manage real-time typing indicators in chat.
 */
const useTypingIndicator = (conversationId) => {
  const dispatch = useDispatch();
  const { subscribe, send } = useWebSocket();
  const currentUserId = useSelector((state) => state.auth.user?.id);
  const isTypingRef = useRef(false);
  const stopTypingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!conversationId) return;

    // Listen for typing events from other users
    const unsubscribe = subscribe('/user/queue/chat/typing', (payload) => {
      // payload: { conversationId: 10, userId: 2, typing: true/false }
      if (
        payload &&
        payload.conversationId === conversationId &&
        payload.userId !== currentUserId
      ) {
        dispatch(
          setTypingStatus({
            userId: payload.userId,
            typing: payload.typing,
          })
        );
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
      if (stopTypingTimeoutRef.current) {
        clearTimeout(stopTypingTimeoutRef.current);
      }
      // If we were typing, reset typing status when unmounting
      if (isTypingRef.current) {
        send('/app/chat/typing', {
          conversationId,
          userId: currentUserId,
          typing: false,
        });
      }
    };
  }, [conversationId, currentUserId, subscribe, send, dispatch]);

  /**
   * Publishes typing status to server.
   */
  const publishTyping = (typing) => {
    if (!conversationId || !currentUserId) return;
    send('/app/chat/typing', {
      conversationId,
      userId: currentUserId,
      typing,
    });
  };

  /**
   * Triggered on input keystroke. Manages started and stopped typing indicators with a 3s timeout.
   */
  const handleKeystroke = () => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      publishTyping(true);
    }

    if (stopTypingTimeoutRef.current) {
      clearTimeout(stopTypingTimeoutRef.current);
    }

    stopTypingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      publishTyping(false);
    }, 3000);
  };

  return {
    handleKeystroke,
  };
};

export default useTypingIndicator;
