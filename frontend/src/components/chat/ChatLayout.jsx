import React, { memo } from 'react';
import { Box, useMantineTheme } from '@mantine/core';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import { useTheme } from '../../context/ThemeContext';

const ChatLayout = memo(({
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
  currentUserId,
  handleKeystroke,
  handleMobileBack,
}) => {
  const theme = useMantineTheme();
  const { isDark } = useTheme();
  const borderColor = isDark ? theme.colors.dark[8] : theme.colors.gray[2];

  const activeConversation = conversations.find(
    (c) => c.conversationId === selectedConversationId
  );

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'row',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Left Side: Sidebar Column */}
      <Box
        style={{
          height: '100%',
          overflow: 'hidden',
          flexShrink: 0,
          borderRight: `1px solid ${borderColor}`,
        }}
        className={`w-full md:w-[320px] lg:w-[380px] ${selectedConversationId ? 'hidden md:flex' : 'flex'}`}
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
      </Box>

      {/* Right Side: Message Thread Pane Column */}
      <Box
        style={{
          flex: 1,
          height: '100%',
          overflow: 'hidden',
        }}
        className={`flex-1 ${selectedConversationId ? 'flex' : 'hidden md:flex'}`}
      >
        <ChatWindow
          selectedConversationId={selectedConversationId}
          activeConversation={activeConversation}
          messages={messages}
          sessions={sessions}
          loadingMessages={loadingMessages}
          sendingMessage={sendingMessage}
          chatHasMore={chatHasMore}
          typingUsers={typingUsers}
          currentUserId={currentUserId}
          fetchOlderMessages={fetchOlderMessages}
          sendMessage={sendMessage}
          handleKeystroke={handleKeystroke}
          handleMobileBack={handleMobileBack}
        />
      </Box>
    </Box>
  );
});

ChatLayout.displayName = 'ChatLayout';

export default ChatLayout;
