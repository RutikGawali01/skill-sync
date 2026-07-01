import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Grid, Paper, useMantineTheme } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';

import useChat from '../../hooks/useChat';
import usePresence from '../../hooks/usePresence';
import useTypingIndicator from '../../hooks/useTypingIndicator';

import ChatSidebar from '../../components/chat/ChatSidebar';
import ChatHeader from '../../components/chat/ChatHeader';
import MessageList from '../../components/chat/MessageList';
import MessageInput from '../../components/chat/MessageInput';
import ChatWelcome from '../../components/chat/ChatWelcome';
import { setSelectedConversationId } from '../../redux/conversationSlice';
import { useTheme } from '../../context/ThemeContext';

/**
 * WhatsApp Web style 2-column chat page.
 */
const ChatPage = () => {
  const dispatch = useDispatch();
  const theme = useMantineTheme();
  const { isDark } = useTheme();
  const currentUserId = useSelector((state) => state.auth.user?.id);

  // Dynamic height calculation
  const { height } = useViewportSize();
  const chatHeight = height > 0 ? height - 80 : 'calc(100vh - 80px)';

  usePresence();

  const {
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
  } = useChat();

  const { handleKeystroke } = useTypingIndicator(selectedConversationId);

  useEffect(() => {
    fetchConversations(true);
  }, []);

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.id = 'chat-footer-override';
    styleElement.innerHTML = 'footer { display: none !important; }';
    document.head.appendChild(styleElement);
    
    return () => {
      const el = document.getElementById('chat-footer-override');
      if (el) el.remove();
    };
  }, []);

  const activeConversation = conversations.find(
    (c) => c.conversationId === selectedConversationId
  );

  const latestSession =
    activeConversation && sessions.length > 0 ? sessions[sessions.length - 1] : null;

  const handleSendMessage = (content) => {
    if (latestSession) {
      sendMessage(latestSession.id, content);
    }
  };

  const handleMobileBack = () => {
    dispatch(setSelectedConversationId(null));
  };

  const pageBg = isDark ? theme.colors.dark[9] : '#ffffff';
  const borderColor = isDark ? theme.colors.dark[8] : theme.colors.gray[2];

  return (
    <Box
      style={{
        paddingTop: '80px',
        backgroundColor: isDark ? theme.colors.dark[9] : theme.colors.gray[1],
        minHeight: '100vh',
      }}
    >
      <Paper
        shadow="xs"
        style={{
          height: chatHeight,
          margin: '0',
          padding: '0',
          overflow: 'hidden',
          backgroundColor: pageBg,
          borderRadius: '0',
          borderTop: `1px solid ${borderColor}`,
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <Grid gutter={0} style={{ height: '100%' }}>
          {/* Left Side: Sidebar */}
          <Grid.Col
            span={12}
            md={4}
            lg={3}
            style={{
              height: '100%',
              display: selectedConversationId ? 'none' : 'block',
              '@media (min-width: 768px)': {
                display: 'block',
              },
            }}
            className={`md:block ${selectedConversationId ? 'hidden' : 'block'}`}
          >
            <ChatSidebar
              conversations={conversations}
              loading={loadingConversations}
              hasMore={convHasMore}
              selectedId={selectedConversationId}
              onSelect={selectConversation}
              onLoadMore={() => fetchConversations(false)}
              currentUserId={currentUserId}
            />
          </Grid.Col>

          {/* Right Side: Message Thread Pane */}
          <Grid.Col
            span={12}
            md={8}
            lg={9}
            style={{
              height: '100%',
              display: !selectedConversationId ? 'none' : 'block',
              '@media (min-width: 768px)': {
                display: 'block',
              },
            }}
            className={`md:block ${!selectedConversationId ? 'hidden' : 'block'}`}
          >
            {selectedConversationId && activeConversation ? (
              <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Header */}
                <ChatHeader
                  conversation={activeConversation}
                  onBack={handleMobileBack}
                  currentUserId={currentUserId}
                />

                {/* Message History Timeline */}
                <MessageList
                  messages={messages}
                  sessions={sessions}
                  loading={loadingMessages}
                  hasMore={chatHasMore}
                  typingUsers={typingUsers}
                  currentUserId={currentUserId}
                  onLoadMore={fetchOlderMessages}
                  otherParticipant={activeConversation.participants?.find((p) => p.id !== currentUserId)}
                />

                {/* Message Input Bar */}
                <MessageInput
                  latestSession={latestSession}
                  onSend={handleSendMessage}
                  onKeyPress={handleKeystroke}
                  sending={sendingMessage}
                />
              </Box>
            ) : (
              <ChatWelcome />
            )}
          </Grid.Col>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ChatPage;

