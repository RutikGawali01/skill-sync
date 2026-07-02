import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Paper, useMantineTheme } from '@mantine/core';

import useChat from '../../hooks/useChat';
import usePresence from '../../hooks/usePresence';
import useTypingIndicator from '../../hooks/useTypingIndicator';

import ChatLayout from '../../components/chat/ChatLayout';
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

  usePresence();

  const chatProps = useChat();
  const { selectedConversationId, fetchConversations } = chatProps;
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
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <Paper
        shadow="xs"
        style={{
          flex: 1,
          margin: '0',
          padding: '0',
          overflow: 'hidden',
          backgroundColor: pageBg,
          borderRadius: '0',
          borderTop: `1px solid ${borderColor}`,
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ChatLayout
          {...chatProps}
          currentUserId={currentUserId}
          handleKeystroke={handleKeystroke}
          handleMobileBack={handleMobileBack}
        />
      </Paper>
    </Box>
  );
};

export default ChatPage;
