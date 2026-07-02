import React, { memo } from 'react';
import { Box, Text, Title, useMantineTheme } from '@mantine/core';
import { Lock, Zap } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ChatWelcome = memo(() => {
  const theme = useMantineTheme();
  const { isDark } = useTheme();

  const brandBg = isDark ? theme.colors.dark[8] : theme.colors.gray[0];
  const titleColor = isDark ? theme.colors.gray[2] : theme.colors.dark[8];
  const descColor = isDark ? theme.colors.gray[5] : theme.colors.gray[6];
  const footerColor = isDark ? theme.colors.gray[6] : theme.colors.gray[5];

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        backgroundColor: brandBg,
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* Project Branding Logo representation */}
        <Box 
          style={{ 
            width: 80, 
            height: 80, 
            marginBottom: '2rem', 
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)',
          }}
        >
          <Zap size={36} strokeWidth={2.5} />
        </Box>
        
        <Title order={2} style={{ color: titleColor, marginBottom: '0.5rem', fontWeight: 700, tracking: '-0.5px' }}>
          Skill Exchange Chat
        </Title>
        
        <Text size="md" weight={500} style={{ color: isDark ? theme.colors.blue[4] : theme.colors.blue[7], marginBottom: '1rem' }}>
          Select a conversation
        </Text>
        
        <Text size="sm" style={{ color: descColor, maxWidth: 360, lineHeight: 1.5 }}>
          Only users with accepted or completed sessions can exchange messages.
        </Text>
      </Box>

      <Box style={{ display: 'flex', alignItems: 'center', gap: '8px', color: footerColor, mt: 'auto' }}>
        <Lock size={14} />
        <Text size="xs">End-to-end encrypted learning sessions.</Text>
      </Box>
    </Box>
  );
});

ChatWelcome.displayName = 'ChatWelcome';

export default ChatWelcome;
