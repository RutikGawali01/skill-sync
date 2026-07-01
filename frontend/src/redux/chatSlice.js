import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  sessions: [],
  loadingMessages: false,
  sendingMessage: false,
  error: null,
  page: 0,
  hasMore: true,
  typingUsers: {}, // Map of userId -> boolean
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setTimelineData: (state, action) => {
      const { messages, sessions } = action.payload;
      state.messages = messages;
      state.sessions = sessions;
    },
    appendOldMessages: (state, action) => {
      // Append older messages to the top (which are chronologically older, i.e., start of array)
      const existingIds = new Set(state.messages.map((m) => m.id || m.clientMessageId));
      const newItems = action.payload.filter((m) => !existingIds.has(m.id || m.clientMessageId));
      state.messages = [...newItems, ...state.messages];
    },
    addNewMessage: (state, action) => {
      const message = action.payload;
      
      // Prevent duplicates by checking id or clientMessageId
      const index = state.messages.findIndex(
        (m) => (message.id && m.id === message.id) || 
               (message.clientMessageId && m.clientMessageId === message.clientMessageId)
      );

      if (index === -1) {
        state.messages.push(message);
      } else {
        // If it was already in the list (e.g., local optimistic add), update it with server details
        state.messages[index] = { ...state.messages[index], ...message };
      }
    },
    updateMessageStatus: (state, action) => {
      const { id, clientMessageId, status } = action.payload;
      const index = state.messages.findIndex(
        (m) => (id && m.id === id) || (clientMessageId && m.clientMessageId === clientMessageId)
      );
      if (index !== -1) {
        state.messages[index].status = status;
      }
    },
    updateReadReceipt: (state, action) => {
      const { readerId, messageId } = action.payload;
      // Mark all messages sent by current user up to messageId as READ
      state.messages.forEach((m) => {
        if (m.senderId !== readerId && m.id <= messageId) {
          m.status = 'READ';
        }
      });
    },
    setLoadingMessages: (state, action) => {
      state.loadingMessages = action.payload;
    },
    setSendingMessage: (state, action) => {
      state.sendingMessage = action.payload;
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
    setTypingStatus: (state, action) => {
      const { userId, typing } = action.payload;
      if (typing) {
        state.typingUsers[userId] = true;
      } else {
        delete state.typingUsers[userId];
      }
    },
    clearChatState: (state) => {
      state.messages = [];
      state.sessions = [];
      state.loadingMessages = false;
      state.sendingMessage = false;
      state.error = null;
      state.page = 0;
      state.hasMore = true;
      state.typingUsers = {};
    }
  },
});

export const {
  setTimelineData,
  appendOldMessages,
  addNewMessage,
  updateMessageStatus,
  updateReadReceipt,
  setLoadingMessages,
  setSendingMessage,
  setError,
  setPage,
  setHasMore,
  setTypingStatus,
  clearChatState,
} = chatSlice.actions;

export default chatSlice.reducer;
