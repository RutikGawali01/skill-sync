import React from 'react';
import { Box, Text, useMantineTheme } from '@mantine/core';
import { useTheme } from '../../context/ThemeContext';
import { Shield } from 'lucide-react';

const EmptyConversation = () => {
  const theme = useMantineTheme();
  const { isDark } = useTheme();

  return (
    <Box
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <Box
        style={{
          backgroundColor: isDark ? theme.colors.dark[6] : '#fff3c4',
          color: isDark ? theme.colors.gray[4] : '#54656f',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 1px 0.5px rgba(11,20,26,.13)',
          marginBottom: '1rem'
        }}
      >
        <Shield size={14} />
        <Text size="xs">Messages are end-to-end encrypted. No one outside of this chat can read or listen to them.</Text>
      </Box>
      <Text size="sm" style={{ color: isDark ? theme.colors.gray[5] : theme.colors.gray[6] }}>
        Send a message to start the conversation.
      </Text>
    </Box>
  );
};

export default EmptyConversation;
