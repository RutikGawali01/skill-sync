import React from 'react';
import { Box, Text, useMantineTheme } from '@mantine/core';
import { useTheme } from '../../context/ThemeContext';
import { Lock } from 'lucide-react';

const SystemMessage = ({ text, icon: Icon = null }) => {
  const theme = useMantineTheme();
  const { isDark } = useTheme();

  return (
    <Box style={{ display: 'flex', justifyContent: 'center', margin: '12px 0' }}>
      <Box
        style={{
          backgroundColor: isDark ? theme.colors.dark[6] : '#fff3c4',
          color: isDark ? theme.colors.gray[4] : '#54656f',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 1px 0.5px rgba(11,20,26,.13)',
          textAlign: 'center',
          maxWidth: '85%'
        }}
      >
        {Icon && <Icon size={14} />}
        <Text size="xs">{text}</Text>
      </Box>
    </Box>
  );
};

export default SystemMessage;
