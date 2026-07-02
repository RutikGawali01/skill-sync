import React, { memo } from 'react';
import { Box, Text, useMantineTheme } from '@mantine/core';
import { useTheme } from '../../context/ThemeContext';
import { MessageSquare, Shield } from 'lucide-react';

const EmptyConversation = memo(() => {
  const theme = useMantineTheme();
  const { isDark } = useTheme();

  const iconColor = isDark ? theme.colors.dark[3] : theme.colors.gray[4];
  const titleColor = isDark ? theme.colors.gray[3] : theme.colors.gray[7];
  const descColor = isDark ? theme.colors.gray[5] : theme.colors.gray[6];

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
      <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* Modern Illustration icon */}
        <Box
          style={{
            width: 70,
            height: 70,
            borderRadius: '50%',
            backgroundColor: isDark ? theme.colors.dark[7] : theme.colors.gray[1],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconColor,
            marginBottom: '1.5rem',
            border: `1px solid ${isDark ? theme.colors.dark[6] : theme.colors.gray[2]}`
          }}
        >
          <MessageSquare size={32} />
        </Box>

        <Text weight={600} size="md" style={{ color: titleColor, marginBottom: '0.25rem' }}>
          No messages yet
        </Text>
        <Text size="sm" style={{ color: descColor, maxWidth: 280, lineHeight: 1.4 }}>
          Start learning together.
        </Text>
      </Box>

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
          marginTop: 'auto',
          maxWidth: '90%'
        }}
      >
        <Shield size={14} style={{ color: isDark ? theme.colors.blue[4] : theme.colors.blue[7] }} />
        <Text size="xs">Messages are end-to-end encrypted. No one outside of this chat can read them.</Text>
      </Box>
    </Box>
  );
});

EmptyConversation.displayName = 'EmptyConversation';

export default EmptyConversation;
