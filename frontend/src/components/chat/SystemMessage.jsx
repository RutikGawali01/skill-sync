import React, { memo } from 'react';
import { Box, Text, useMantineTheme } from '@mantine/core';
import { useTheme } from '../../context/ThemeContext';

const SystemMessage = memo(({ text, icon: Icon = null }) => {
  const theme = useMantineTheme();
  const { isDark } = useTheme();

  const bg = isDark ? theme.colors.dark[8] : theme.colors.gray[1];
  const color = isDark ? theme.colors.dark[3] : theme.colors.gray[6];

  return (
    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '16px 0', width: '100%' }}>
      {/* Left line */}
      <Box style={{ flex: 1, height: '1px', backgroundColor: isDark ? theme.colors.dark[7] : theme.colors.gray[2] }} />
      
      {/* Center message badge */}
      <Box
        style={{
          backgroundColor: bg,
          color: color,
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 500,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          margin: '0 12px',
          border: `1px solid ${isDark ? theme.colors.dark[7] : theme.colors.gray[3]}`
        }}
      >
        {Icon && <Icon size={12} />}
        <Text size="xs" style={{ whiteSpace: 'nowrap' }}>{text}</Text>
      </Box>

      {/* Right line */}
      <Box style={{ flex: 1, height: '1px', backgroundColor: isDark ? theme.colors.dark[7] : theme.colors.gray[2] }} />
    </Box>
  );
});

SystemMessage.displayName = 'SystemMessage';

export default SystemMessage;
