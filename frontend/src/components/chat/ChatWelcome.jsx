import React from 'react';
import { Box, Text, Title, useMantineTheme } from '@mantine/core';
import { Lock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ChatWelcome = () => {
  const theme = useMantineTheme();
  const { isDark } = useTheme();

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        backgroundColor: isDark ? theme.colors.dark[8] : theme.colors.gray[0],
        borderBottom: `8px solid ${theme.colors.blue[6]}`, // subtle bottom accent
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      {/* Abstract Illustration/Icon replacing full image */}
      <Box 
        style={{ 
          width: 250, 
          height: 150, 
          marginBottom: '2rem', 
          backgroundColor: isDark ? theme.colors.dark[6] : theme.colors.gray[2],
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isDark ? theme.colors.dark[3] : theme.colors.gray[5]
        }}
      >
        <Text size="xl" weight={600}>Skill Sync Web</Text>
      </Box>
      
      <Title order={2} style={{ color: isDark ? theme.colors.gray[2] : theme.colors.dark[8], marginBottom: '1rem', fontWeight: 300 }}>
        Skill Sync for Web
      </Title>
      
      <Text size="md" style={{ color: isDark ? theme.colors.gray[5] : theme.colors.gray[6], maxWidth: 450, marginBottom: '2rem' }}>
        Select a conversation from the sidebar to start collaborating, planning sessions, and exchanging skills in real-time.
      </Text>

      <Box style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto', color: isDark ? theme.colors.gray[6] : theme.colors.gray[5] }}>
        <Lock size={14} />
        <Text size="xs">End-to-end encrypted learning sessions.</Text>
      </Box>
    </Box>
  );
};

export default ChatWelcome;
