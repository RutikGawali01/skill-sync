import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  conversations: [],
  loading: false,
  error: null,
  page: 0,
  hasMore: true,
  selectedConversationId: null,
};

const conversationSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
      // Ensure they are sorted by latest message sent at descending
      state.conversations.sort((a, b) => {
        const timeA = a.lastMessageSentAt ? new Date(a.lastMessageSentAt).getTime() : 0;
        const timeB = b.lastMessageSentAt ? new Date(b.lastMessageSentAt).getTime() : 0;
        return timeB - timeA;
      });
    },
    appendConversations: (state, action) => {
      const existingIds = new Set(state.conversations.map((c) => c.conversationId));
      const newItems = action.payload.filter((c) => !existingIds.has(c.conversationId));
      state.conversations = [...state.conversations, ...newItems];
      state.conversations.sort((a, b) => {
        const timeA = a.lastMessageSentAt ? new Date(a.lastMessageSentAt).getTime() : 0;
        const timeB = b.lastMessageSentAt ? new Date(b.lastMessageSentAt).getTime() : 0;
        return timeB - timeA;
      });
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setHasMore: (state, action) => {
      state.hasMore = action.payload;
    },
    setSelectedConversationId: (state, action) => {
      state.selectedConversationId = action.payload;
    },
    updateConversationLatestMessage: (state, action) => {
      const { conversationId, content, sentAt, senderId, currentUserId } = action.payload;
      
      const index = state.conversations.findIndex((c) => c.conversationId === conversationId);
      if (index !== -1) {
        const conv = state.conversations[index];
        conv.lastMessageContent = content;
        conv.lastMessageSentAt = sentAt;
        
        // If message is from others and not active conversation, increment unread count
        if (senderId !== currentUserId && state.selectedConversationId !== conversationId) {
          conv.unreadCount = (conv.unreadCount || 0) + 1;
        }
        
        // Move conversation to the top (sort descending by date)
        state.conversations.sort((a, b) => {
          const timeA = a.lastMessageSentAt ? new Date(a.lastMessageSentAt).getTime() : 0;
          const timeB = b.lastMessageSentAt ? new Date(b.lastMessageSentAt).getTime() : 0;
          return timeB - timeA;
        });
      }
    },
    resetConversationUnreadCount: (state, action) => {
      const conversationId = action.payload;
      const conv = state.conversations.find((c) => c.conversationId === conversationId);
      if (conv) {
        conv.unreadCount = 0;
      }
    },
    setConversationMuted: (state, action) => {
      const { conversationId, muted } = action.payload;
      const conv = state.conversations.find((c) => c.conversationId === conversationId);
      if (conv) {
        conv.muted = muted;
      }
    },
    setConversationArchived: (state, action) => {
      const { conversationId, archived } = action.payload;
      if (archived) {
        // Remove from the list if archived (we only list non-archived by default)
        state.conversations = state.conversations.filter((c) => c.conversationId !== conversationId);
      } else {
        const conv = state.conversations.find((c) => c.conversationId === conversationId);
        if (conv) {
          conv.archived = false;
        }
      }
    },
    clearConversationState: (state) => {
      state.conversations = [];
      state.loading = false;
      state.error = null;
      state.page = 0;
      state.hasMore = true;
      state.selectedConversationId = null;
    }
  },
});

export const {
  setConversations,
  appendConversations,
  setLoading,
  setError,
  setPage,
  setHasMore,
  setSelectedConversationId,
  updateConversationLatestMessage,
  resetConversationUnreadCount,
  setConversationMuted,
  setConversationArchived,
  clearConversationState,
} = conversationSlice.actions;

export default conversationSlice.reducer;
