import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { notifications as mantineNotify } from '@mantine/notifications';
import chatService from '../services/chatService';
import useWebSocket from './useWebSocket';
import {
  setConversations,
  appendConversations,
  setLoading as setConvLoading,
  setError as setConvError,
  setPage as setConvPage,
  setHasMore as setConvHasMore,
  setSelectedConversationId,
  updateConversationLatestMessage,
  resetConversationUnreadCount,
  setConversationMuted,
  setConversationArchived,
} from '../redux/conversationSlice';
import {
  setTimelineData,
  appendOldMessages,
  addNewMessage,
  updateMessageStatus,
  updateReadReceipt,
  setLoadingMessages,
  setSendingMessage,
  setPage as setChatPage,
  setHasMore as setChatHasMore,
  clearChatState,
} from '../redux/chatSlice';

/**
 * Orchestrator hook for chat business logic, pagination, and real-time updates.
 */
const useChat = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const currentUserId = useSelector((state) => state.auth.user?.id);
  const { subscribe, send } = useWebSocket();

  // Conversations List Redux State
  const {
    conversations,
    loading: loadingConversations,
    page: convPage,
    hasMore: convHasMore,
    selectedConversationId,
  } = useSelector((state) => state.conversations);

  // Chat Messages Thread Redux State
  const {
    messages,
    sessions,
    loadingMessages,
    sendingMessage,
    page: chatPage,
    hasMore: chatHasMore,
    typingUsers,
  } = useSelector((state) => state.chat);

  // ── 1. Fetch Conversations List (REST) ──────────────────────────────────────
  const fetchConversations = useCallback(
    async (reset = false) => {
      if (!token) return;
      dispatch(setConvLoading(true));
      try {
        const targetPage = reset ? 0 : convPage;
        const res = await chatService.getConversations(targetPage, 20);
        
        if (res.data) {
          const { content, last } = res.data;
          if (reset) {
            dispatch(setConversations(content));
            dispatch(setConvPage(1));
          } else {
            dispatch(appendConversations(content));
            dispatch(setConvPage(targetPage + 1));
          }
          dispatch(setConvHasMore(!last));
        }
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
        dispatch(setConvError(err?.response?.data?.message || 'Failed to load conversations'));
      } finally {
        dispatch(setConvLoading(false));
      }
    },
    [token, convPage, dispatch]
  );

  // ── 2. Select & Load Conversation Detail Timeline (REST) ────────────────────
  const selectConversation = useCallback(
    async (conversationId) => {
      if (!token || !conversationId) return;
      dispatch(setSelectedConversationId(conversationId));
      dispatch(clearChatState());
      dispatch(setLoadingMessages(true));
      try {
        const res = await chatService.getConversationDetails(conversationId);
        if (res.data) {
          const { messages: msgSlice, sessions: sessList } = res.data;
          
          // Timeline Builder handles chronological interleaving in UI
          dispatch(
            setTimelineData({
              messages: msgSlice.content.reverse(), // reverse to chronologically order oldest first
              sessions: sessList,
            })
          );
          dispatch(setChatPage(1));
          dispatch(setChatHasMore(!msgSlice.last));

          // Acknowledge read receipts
          if (msgSlice.content.length > 0) {
            const latestMsg = msgSlice.content[msgSlice.content.length - 1];
            markConversationAsRead(conversationId, latestMsg.id);
          }
        }
      } catch (err) {
        console.error('Failed to load conversation details:', err);
        mantineNotify.show({
          title: 'Error',
          message: err?.response?.data?.message || 'Failed to load chat history',
          color: 'red',
        });
      } finally {
        dispatch(setLoadingMessages(false));
      }
    },
    [token, dispatch]
  );

  // ── 3. Load Older Messages (REST Slice Pagination) ──────────────────────────
  const fetchOlderMessages = useCallback(async () => {
    if (!token || !selectedConversationId || loadingMessages || !chatHasMore) return;
    dispatch(setLoadingMessages(true));
    try {
      const res = await chatService.getMessages(selectedConversationId, chatPage, 20);
      if (res.data) {
        const { content, last } = res.data;
        dispatch(appendOldMessages(content.reverse()));
        dispatch(setChatPage(chatPage + 1));
        dispatch(setChatHasMore(!last));
      }
    } catch (err) {
      console.error('Failed to fetch older messages:', err);
    } finally {
      dispatch(setLoadingMessages(false));
    }
  }, [token, selectedConversationId, chatPage, chatHasMore, loadingMessages, dispatch]);

  // ── 4. Send Message (WS with REST fallback) ──────────────────────────────────
  const sendMessage = useCallback(
    async (sessionId, content, type = 'TEXT') => {
      if (!selectedConversationId || !token || !content.trim()) return;

      const clientMsgId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Optimistic addition to message list
      const optimisticMsg = {
        clientMessageId: clientMsgId,
        conversationId: selectedConversationId,
        sessionId,
        senderId: currentUserId,
        content: content.trim(),
        type,
        status: 'SENT',
        createdAt: new Date().toISOString(),
        deleted: false,
      };

      dispatch(addNewMessage(optimisticMsg));
      dispatch(
        updateConversationLatestMessage({
          conversationId: selectedConversationId,
          content: content.trim(),
          sentAt: new Date().toISOString(),
          senderId: currentUserId,
          currentUserId,
        })
      );

      // Attempt WebSocket Publish
      try {
        send('/app/chat/send', {
          conversationId: selectedConversationId,
          sessionId,
          content: content.trim(),
          type,
          clientMessageId: clientMsgId,
        });
      } catch (wsError) {
        console.warn('WS send failed, falling back to REST:', wsError);
        // Fallback to REST API call
        try {
          dispatch(setSendingMessage(true));
          await chatService.sendMessage(
            selectedConversationId,
            sessionId,
            content,
            type,
            clientMsgId
          );
        } catch (apiError) {
          console.error('REST fallback send failed:', apiError);
          // Mark optimistic message as failed/un-sent
          dispatch(
            updateMessageStatus({
              clientMessageId: clientMsgId,
              status: 'FAILED',
            })
          );
        } finally {
          dispatch(setSendingMessage(false));
        }
      }
    },
    [selectedConversationId, token, currentUserId, send, dispatch]
  );

  // ── 5. Mark Messages As Read (WS with REST fallback) ─────────────────────────
  const markConversationAsRead = useCallback(
    async (conversationId, messageId) => {
      if (!token || !conversationId || !messageId) return;

      dispatch(resetConversationUnreadCount(conversationId));

      try {
        send('/app/chat/read', { conversationId, messageId });
      } catch (wsErr) {
        console.warn('WS read receipt failed, falling back to REST:', wsErr);
        try {
          await chatService.markAsRead(conversationId, messageId);
        } catch (apiErr) {
          console.error('REST read receipt failed:', apiErr);
        }
      }
    },
    [token, send, dispatch]
  );

  // ── 6. Conversation Actions (Local State) ──────────────────────────────────
  const toggleMuteConversation = useCallback(
    (conversationId, isCurrentlyMuted) => {
      const nextState = !isCurrentlyMuted;
      dispatch(setConversationMuted({ conversationId, muted: nextState }));
    },
    [dispatch]
  );

  const archiveConversation = useCallback(
    (conversationId) => {
      dispatch(setConversationArchived({ conversationId, archived: true }));
    },
    [dispatch]
  );

  // ── 7. Real-time Subscription Setup ─────────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    // Listen to real-time message stream
    const unsubMessages = subscribe('/user/queue/chat/messages', (message) => {
      // If it belongs to currently selected conversation, append it
      if (message.conversationId === selectedConversationId) {
        dispatch(addNewMessage(message));
        
        // Acknowledge receipt
        markConversationAsRead(selectedConversationId, message.id);
      }

      // Update the left conversation list summary
      dispatch(
        updateConversationLatestMessage({
          conversationId: message.conversationId,
          content: message.content,
          sentAt: message.createdAt,
          senderId: message.senderId,
          currentUserId,
        })
      );
    });

    // Listen to message delivered status events
    const unsubDeliveries = subscribe('/user/queue/chat/message-delivered', (message) => {
      dispatch(
        updateMessageStatus({
          id: message.id,
          clientMessageId: message.clientMessageId,
          status: 'DELIVERED',
        })
      );
    });

    // Listen to read receipt updates from other user
    const unsubReceipts = subscribe('/user/queue/chat/read-receipts', (payload) => {
      // payload: { conversationId, messageId, readerId }
      if (payload && payload.conversationId === selectedConversationId) {
        dispatch(
          updateReadReceipt({
            readerId: payload.readerId,
            messageId: payload.messageId,
          })
        );
      }
    });

    return () => {
      if (unsubMessages) unsubMessages();
      if (unsubDeliveries) unsubDeliveries();
      if (unsubReceipts) unsubReceipts();
    };
  }, [
    token,
    selectedConversationId,
    currentUserId,
    subscribe,
    markConversationAsRead,
    dispatch,
  ]);

  return {
    conversations,
    loadingConversations,
    convHasMore,
    selectedConversationId,
    messages,
    sessions,
    loadingMessages,
    sendingMessage,
    chatHasMore,
    typingUsers,
    fetchConversations,
    selectConversation,
    fetchOlderMessages,
    sendMessage,
    markConversationAsRead,
    toggleMuteConversation,
    archiveConversation,
  };
};

export default useChat;
