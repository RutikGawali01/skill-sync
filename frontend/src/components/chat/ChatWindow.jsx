import React, { memo } from 'react';
import { Box } from '@mantine/core';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChatWelcome from './ChatWelcome';

const ChatWindow = memo(({
  selectedConversationId,
  activeConversation,
  messages,
  sessions,
  loadingMessages,
  sendingMessage,
  chatHasMore,
  typingUsers,
  currentUserId,
  fetchOlderMessages,
  sendMessage,
  handleKeystroke,
  handleMobileBack,
}) => {
  const latestSession =
    activeConversation && sessions.length > 0 ? sessions[sessions.length - 1] : null;

  const handleSendMessage = (content) => {
    if (latestSession) {
      sendMessage(latestSession.id, content);
    }
  };

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', width: '100%' }}>
      {selectedConversationId && activeConversation ? (
        <>
          {/* Header */}
          <ChatHeader
            conversation={{ ...activeConversation, sessions }}
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
            otherParticipant={
              activeConversation.participants?.find((p) => p.id !== currentUserId) || {
                id: activeConversation.otherParticipantId,
                name: activeConversation.otherParticipantName,
                profilePicUrl: activeConversation.otherParticipantProfilePicUrl,
              }
            }
          />

          {/* Message Input Bar */}
          <MessageInput
            latestSession={latestSession}
            onSend={handleSendMessage}
            onKeyPress={handleKeystroke}
            sending={sendingMessage}
          />
        </>
      ) : (
        <ChatWelcome />
      )}
    </Box>
  );
});

ChatWindow.displayName = 'ChatWindow';

export default ChatWindow;
