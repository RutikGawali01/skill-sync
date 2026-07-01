import api from './api';

/**
 * Service for Chat REST operations.
 */
const chatService = {
  /**
   * Retrieves paginated conversation summaries for the current user.
   */
  getConversations: async (page = 0, size = 20) => {
    const response = await api.get('/chat/conversations', {
      params: { page, size }
    });
    return response.data;
  },

  /**
   * Retrieves full details of a specific conversation (participants, sessions timeline, initial messages).
   */
  getConversationDetails: async (conversationId) => {
    const response = await api.get(`/chat/conversations/${conversationId}`);
    return response.data;
  },

  /**
   * Retrieves a paginated slice of messages for a specific conversation.
   */
  getMessages: async (conversationId, page = 0, size = 20) => {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`, {
      params: { page, size }
    });
    return response.data;
  },

  /**
   * Creates a new conversation with the given recipient.
   */
  createConversation: async (recipientId) => {
    const response = await api.post('/chat/conversations', { recipientId });
    return response.data;
  },

  /**
   * Sends a message via REST API.
   */
  sendMessage: async (conversationId, sessionId, content, type = 'TEXT', clientMessageId = null) => {
    const response = await api.post('/chat/messages', {
      conversationId,
      sessionId,
      content,
      type,
      clientMessageId
    });
    return response.data;
  },

  /**
   * Marks a conversation's messages up to the given message ID as read.
   */
  markAsRead: async (conversationId, messageId) => {
    const response = await api.put('/chat/messages/read', {
      conversationId,
      messageId
    });
    return response.data;
  },

  /**
   * Retrieves total unread message count across all conversations.
   */
  getUnreadCount: async () => {
    const response = await api.get('/chat/unread-count');
    return response.data;
  }
};

export default chatService;
