import React, { useState } from 'react';
import { ActionIcon, Box, Group, Paper, Text, TextInput, useMantineTheme } from '@mantine/core';
import { AlertCircle, Send, Smile, Paperclip } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Message input component supporting locks based on active session status.
 */
const MessageInput = ({ latestSession, onSend, onKeyPress, sending }) => {
  const theme = useMantineTheme();
  const { isDark } = useTheme();
  const [content, setContent] = useState('');

  const handleSend = () => {
    if (!content.trim() || sending) return;
    onSend(content.trim());
    setContent('');
  };

  const handleKeyDown = (e) => {
    // Send on Enter
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  // Enforce session state checks for input locks
  const getDisabledBanner = () => {
    if (!latestSession) {
      return 'No active learning session. Chat is disabled.';
    }

    const { status } = latestSession;
    switch (status) {
      case 'PENDING':
        return 'Chat will be available once the session invitation is accepted.';
      case 'REJECTED':
        return 'This session request was rejected. Chat is unavailable.';
      case 'COMPLETED':
        return 'This learning session has been completed. Chat is read-only.';
      case 'CANCELLED':
        return 'This learning session was cancelled. Chat is read-only.';
      case 'ACCEPTED':
      default:
        return null; // Enable input
    }
  };

  const disabledMessage = getDisabledBanner();

  // Dynamic WhatsApp style colors
  const inputBg = isDark ? theme.colors.dark[7] : '#f0f2f5';
  const textAreaBg = isDark ? theme.colors.dark[6] : '#ffffff';
  const iconColor = isDark ? theme.colors.gray[4] : '#54656f';

  if (disabledMessage) {
    return (
      <Box
        p="sm"
        style={{
          backgroundColor: inputBg,
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Paper
          p="sm"
          radius="md"
          style={{
            backgroundColor: isDark ? theme.colors.dark[8] : theme.colors.gray[0],
            maxWidth: '400px',
            width: '100%',
          }}
        >
          <Group spacing={8} noWrap align="center" position="center">
            <AlertCircle size={16} style={{ color: theme.colors.yellow[isDark ? 4 : 6] }} />
            <Text size="xs" weight={600} style={{ color: isDark ? theme.colors.dark[2] : theme.colors.gray[7] }}>
              {disabledMessage}
            </Text>
          </Group>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      p="sm"
      style={{
        backgroundColor: inputBg,
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}
    >
      <ActionIcon variant="transparent">
        <Smile size={24} style={{ color: iconColor }} />
      </ActionIcon>
      <ActionIcon variant="transparent">
        <Paperclip size={24} style={{ color: iconColor }} />
      </ActionIcon>
      
      <TextInput
        placeholder="Type a message"
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          onKeyPress?.(); // typing indicator keystroke hook trigger
        }}
        onKeyDown={handleKeyDown}
        style={{ flex: 1 }}
        radius="md"
        size="md"
        styles={{
          input: {
            backgroundColor: textAreaBg,
            border: 'none',
            '&:focus': {
              border: 'none',
            }
          }
        }}
      />
      
      <ActionIcon
        onClick={handleSend}
        disabled={!content.trim() || sending}
        variant="transparent"
        style={{
          transition: 'transform 0.1s ease',
          '&:active': { transform: 'scale(0.95)' }
        }}
      >
        <Send size={24} style={{ color: content.trim() ? (isDark ? theme.colors.gray[3] : '#54656f') : (isDark ? theme.colors.dark[4] : '#aebac1') }} />
      </ActionIcon>
    </Box>
  );
};

export default MessageInput;

