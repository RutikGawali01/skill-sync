import React from 'react';
import { Box, Group, Text, ThemeIcon, useMantineTheme } from '@mantine/core';
import { Calendar, Clock, MapPin, Video, CheckCircle, Clock3 } from 'lucide-react';
import { formatSessionDate, formatSessionTime } from '../../utils/dateFormatter';
import { useTheme } from '../../context/ThemeContext';

const SessionBanner = ({ session }) => {
  const theme = useMantineTheme();
  const { isDark } = useTheme();

  const {
    id: sessionId,
    skillOffered,
    skillRequested,
    teacherName,
    learnerName,
    scheduledDate,
    scheduledTime,
    durationMinutes,
    mode,
    status,
  } = session;

  const isOnline = mode === 'ONLINE';

  return (
    <Box style={{ display: 'flex', justifyContent: 'center', margin: '12px 0' }}>
      <Box
        style={{
          backgroundColor: isDark ? theme.colors.dark[6] : '#fff3c4',
          color: isDark ? theme.colors.gray[4] : '#54656f',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '12px',
          boxShadow: '0 1px 0.5px rgba(11,20,26,.13)',
          maxWidth: '90%',
          textAlign: 'center',
        }}
      >
        <Group position="center" spacing={4} noWrap style={{ marginBottom: 4 }}>
          {status === 'ACCEPTED' ? (
            <Clock3 size={14} style={{ color: theme.colors.blue[6] }} />
          ) : status === 'COMPLETED' ? (
            <CheckCircle size={14} style={{ color: theme.colors.green[6] }} />
          ) : null}
          <Text size="xs" weight={600}>
            Session {status === 'COMPLETED' ? 'Completed' : 'Scheduled'}: {skillOffered}
          </Text>
        </Group>
        
        <Text size="xs" style={{ marginBottom: 4 }}>
          {teacherName} teaching {learnerName}
        </Text>

        <Group position="center" spacing="xs" noWrap>
          <Group spacing={4} noWrap>
            <Calendar size={12} />
            <Text size="xs">{formatSessionDate(scheduledDate)}</Text>
          </Group>
          <Text size="xs">·</Text>
          <Group spacing={4} noWrap>
            <Clock size={12} />
            <Text size="xs">{formatSessionTime(scheduledTime)}</Text>
          </Group>
          <Text size="xs">·</Text>
          <Group spacing={4} noWrap>
            {isOnline ? <Video size={12} /> : <MapPin size={12} />}
            <Text size="xs">{isOnline ? 'Online' : 'In-Person'}</Text>
          </Group>
        </Group>
      </Box>
    </Box>
  );
};

export default SessionBanner;
