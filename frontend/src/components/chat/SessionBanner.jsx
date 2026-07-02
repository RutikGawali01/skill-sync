import React, { memo } from 'react';
import { Box, Group, Text, useMantineTheme } from '@mantine/core';
import { Calendar, CheckCircle, Clock3, AlertCircle, XCircle } from 'lucide-react';
import { formatSessionDate } from '../../utils/dateFormatter';
import { useTheme } from '../../context/ThemeContext';

const SessionBanner = memo(({ session }) => {
  const theme = useMantineTheme();
  const { isDark } = useTheme();

  const {
    skillOffered,
    skillRequested,
    scheduledDate,
    status,
  } = session;

  const getStatusConfig = () => {
    switch (status) {
      case 'COMPLETED':
        return {
          label: 'Completed Session',
          color: 'green',
          icon: CheckCircle
        };
      case 'ACCEPTED':
        return {
          label: 'Scheduled Session',
          color: 'blue',
          icon: Clock3
        };
      case 'PENDING':
        return {
          label: 'Pending Session Request',
          color: 'yellow',
          icon: Clock3
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled Session',
          color: 'red',
          icon: XCircle
        };
      case 'REJECTED':
        return {
          label: 'Rejected Session',
          color: 'red',
          icon: XCircle
        };
      default:
        return {
          label: 'Session',
          color: 'gray',
          icon: AlertCircle
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const bg = isDark ? theme.colors.dark[6] : theme.colors.gray[1];
  const border = isDark ? `1px solid ${theme.colors.dark[5]}` : `1px solid ${theme.colors.gray[3]}`;
  const textColor = isDark ? theme.colors.gray[3] : theme.colors.gray[8];
  const subtitleColor = isDark ? theme.colors.gray[5] : theme.colors.gray[6];

  return (
    <Box style={{ display: 'flex', justifyContent: 'center', margin: '8px 0', width: '100%' }}>
      <Box
        style={{
          backgroundColor: bg,
          border: border,
          padding: '8px 16px',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          maxWidth: '320px',
          width: '100%',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}
      >
        <Group spacing={6} noWrap>
          <Icon size={14} style={{ color: theme.colors[config.color][6] }} />
          <Text size="xs" weight={600} style={{ color: textColor }}>
            {config.label}
          </Text>
        </Group>
        
        <Text size="xs" weight={500} style={{ color: subtitleColor }}>
          {skillOffered} ↔ {skillRequested}
        </Text>

        <Group spacing={4} noWrap style={{ color: subtitleColor }}>
          <Calendar size={12} />
          <Text size="10px">{formatSessionDate(scheduledDate)}</Text>
        </Group>
      </Box>
    </Box>
  );
});

SessionBanner.displayName = 'SessionBanner';

export default SessionBanner;
