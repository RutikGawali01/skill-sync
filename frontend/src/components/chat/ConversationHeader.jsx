import React from 'react';
import { useSelector } from 'react-redux';
import { ActionIcon, Avatar, Box, Group, Text, useMantineTheme } from '@mantine/core';
import { ArrowLeft, BookOpen } from 'lucide-react';
import PresenceBadge from './PresenceBadge';
import { useTheme } from '../../context/ThemeContext';

/**
 * Top header of the right chat panel.
 */
const ConversationHeader = ({
  conversation,
  onBack,
  currentUserId,
}) => {
  const theme = useMantineTheme();
  const { isDark } = useTheme();
  const { participants = [], sessions = [] } = conversation;

  // Find other participant
  const otherParticipant = participants.find((p) => p.id !== currentUserId) || {};
  const otherParticipantId = otherParticipant.id;

  // Retrieve real-time presence
  const onlineUsers = useSelector((state) => state.presence.onlineUsers);
  const isOnline = onlineUsers[otherParticipantId] || otherParticipant.online || false;

  // Determine skill relationship from latest session card
  const latestSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
  const isTeacher = latestSession ? latestSession.teacherName === otherParticipant.name : false;
  
  let skillExchangeLabel = 'Skill Exchange';
  if (latestSession) {
    if (isTeacher) {
      skillExchangeLabel = `Teaching you: ${latestSession.skillOffered}`;
    } else {
      skillExchangeLabel = `Learning from you: ${latestSession.skillRequested}`;
    }
  }

  // Dynamic theme styling
  const headerBg = isDark ? 'rgba(26, 27, 30, 0.6)' : 'rgba(255, 255, 255, 0.8)';
  const borderBottomColor = isDark ? theme.colors.dark[8] : theme.colors.gray[2];
  const nameColor = isDark ? theme.colors.dark[0] : theme.colors.gray[8];
  const subtitleColor = isDark ? theme.colors.dark[3] : theme.colors.gray[6];

  return (
    <Box
      component="header"
      style={{
        height: 70,
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        borderBottom: `1px solid ${borderBottomColor}`,
        backgroundColor: headerBg,
        backdropFilter: 'blur(8px)',
        width: '100%',
        zIndex: 10,
      }}
    >
      <Group position="apart" style={{ width: '100%' }} noWrap>
        <Group spacing="sm" noWrap>
          {/* Mobile Back Button */}
          <ActionIcon
            onClick={onBack}
            variant="transparent"
            style={{
              display: 'inline-flex',
              // Visible only on small viewports
              '@media (min-width: 768px)': {
                display: 'none',
              },
            }}
            className="md:hidden"
          >
            <ArrowLeft size={20} style={{ color: isDark ? theme.colors.dark[0] : theme.colors.gray[7] }} />
          </ActionIcon>

          {/* Avatar with Presence Badge */}
          <Box style={{ position: 'relative' }}>
            <Avatar
              src={otherParticipant.profilePicUrl}
              alt={otherParticipant.name}
              radius="xl"
              size="md"
              color="violet"
              style={{
                border: `2px solid ${isDark ? theme.colors.dark[7] : '#fff'}`,
              }}
            >
              {otherParticipant.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Box
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                zIndex: 2,
              }}
            >
              <PresenceBadge online={isOnline} />
            </Box>
          </Box>

          {/* Text Info */}
          <Box>
            <Text weight={700} size="sm" style={{ color: nameColor, lineHeight: 1.2 }}>
              {otherParticipant.name}
            </Text>
            <Group spacing={6} align="center" noWrap mt={2}>
              <PresenceBadge online={isOnline} showText size={6} />
              <Text size="xs" style={{ color: subtitleColor, maxWidth: '280px' }} lineClamp={1}>
                {skillExchangeLabel}
              </Text>
            </Group>
          </Box>
        </Group>

        {/* Header decoration */}
        <Group spacing="xs" style={{ opacity: 0.8 }}>
          <BookOpen size={18} style={{ color: theme.colors.violet[isDark ? 4 : 6] }} />
        </Group>
      </Group>
    </Box>
  );
};

export default ConversationHeader;
