import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { Avatar, Box, Group, Text, UnstyledButton, Badge, useMantineTheme } from '@mantine/core';
import { VolumeX } from 'lucide-react';
import UnreadBadge from './UnreadBadge';
import { formatMessageTime } from '../../utils/dateFormatter';
import { useTheme } from '../../context/ThemeContext';

const ConversationCard = memo(({
  conversation,
  isSelected,
  onClick,
  currentUserId,
}) => {
  const theme = useMantineTheme();
  const { isDark } = useTheme();

  const {
    conversationId,
    otherParticipantName,
    otherParticipantId,
    otherParticipantProfilePicUrl,
    unreadCount,
    lastMessageContent,
    lastMessageSentAt,
    muted,
    skillExchange,
    sessionStatus
  } = conversation;

  // Real-time presence
  const onlineUsers = useSelector((state) => state.presence.onlineUsers);
  const isOnline = onlineUsers[otherParticipantId] || false;

  // Real-time typing
  const typingUsers = useSelector((state) => state.chat.typingUsers);
  const isTyping = typingUsers[otherParticipantId] || false;

  // Active sessions from Redux (fallback for detailed display on selection)
  const sessions = useSelector((state) => state.chat.sessions);

  // Skill exchange label resolver
  let skillExchangeLabel = 'Skill Exchange';
  if (skillExchange) {
    if (skillExchange.includes(':')) {
      const parts = skillExchange.split(':');
      skillExchangeLabel = parts.length > 1 ? parts[1].trim() : parts[0].trim();
    } else {
      skillExchangeLabel = skillExchange;
    }
  } else if (isSelected && sessions && sessions.length > 0) {
    const latest = sessions[sessions.length - 1];
    skillExchangeLabel = `${latest.skillOffered} ↔ ${latest.skillRequested}`;
  } else {
    skillExchangeLabel = 'React ↔ Spring Boot'; // Mock fallback for prototype parity
  }

  // Session status label resolver
  const displayStatus = sessionStatus || (isSelected && sessions && sessions.length > 0 ? sessions[sessions.length - 1].status : 'ACCEPTED');

  // WhatsApp style dynamic styling
  const activeBg = isDark ? theme.colors.dark[6] : '#f0f2f5';
  const hoverBg = isDark ? theme.colors.dark[7] : '#f5f6f6';
  const nameColor = isDark ? theme.colors.gray[2] : '#111b21';
  const lastMsgColor = isDark ? theme.colors.gray[5] : '#667781';
  const timeColor = unreadCount > 0 ? (isDark ? theme.colors.green[4] : theme.colors.green[7]) : lastMsgColor;
  const borderColor = isDark ? theme.colors.dark[8] : '#f0f2f5';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge color="green" variant="light" size="xs">Completed</Badge>;
      case 'ACCEPTED':
        return <Badge color="blue" variant="light" size="xs">Scheduled</Badge>;
      default:
        return null;
    }
  };

  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        backgroundColor: isSelected ? activeBg : 'transparent',
        transition: 'background-color 0.2s ease',
        cursor: 'pointer',
        borderBottom: `1px solid ${borderColor}`,
        '&:hover': {
          backgroundColor: isSelected ? activeBg : hoverBg,
        },
      }}
    >
      <Box style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', minHeight: 76 }}>
        {/* Avatar with Presence Indicator */}
        <Box style={{ position: 'relative', marginRight: 12, flexShrink: 0 }}>
          <Avatar
            src={otherParticipantProfilePicUrl}
            alt={otherParticipantName}
            radius="xl"
            size={48}
            style={{ border: `2px solid ${isSelected ? activeBg : (isDark ? theme.colors.dark[8] : '#fff')}` }}
          >
            {otherParticipantName?.charAt(0).toUpperCase()}
          </Avatar>
          {isOnline && (
            <Box
              style={{
                position: 'absolute',
                bottom: 1,
                right: 1,
                width: 11,
                height: 11,
                backgroundColor: isDark ? theme.colors.green[4] : theme.colors.green[6],
                borderRadius: '50%',
                border: `2px solid ${isSelected ? activeBg : (isDark ? theme.colors.dark[8] : '#fff')}`,
              }}
            />
          )}
        </Box>

        {/* Content Box */}
        <Box style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {/* First Row: Name and Time */}
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <Text weight={600} size="sm" lineClamp={1} style={{ color: nameColor, flex: 1 }}>
              {otherParticipantName}
            </Text>
            <Text size="11px" style={{ color: timeColor, flexShrink: 0 }}>
              {lastMessageSentAt ? formatMessageTime(lastMessageSentAt) : ''}
            </Text>
          </Box>

          {/* Second Row: Skill Exchange and Badge */}
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <Text size="xs" weight={500} style={{ color: isDark ? theme.colors.blue[4] : theme.colors.blue[7], flex: 1 }} lineClamp={1}>
              {skillExchangeLabel}
            </Text>
            <Box style={{ flexShrink: 0 }}>
              {getStatusBadge(displayStatus)}
            </Box>
          </Box>

          {/* Third Row: Last Message Content */}
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <Box style={{ flex: 1, minWidth: 0 }}>
              {isTyping ? (
                <Text size="xs" style={{ color: isDark ? theme.colors.green[4] : theme.colors.green[7], fontWeight: 600 }}>
                  typing...
                </Text>
              ) : (
                <Text size="xs" lineClamp={1} style={{ color: lastMsgColor }}>
                  {lastMessageContent || 'No messages yet'}
                </Text>
              )}
            </Box>
            <Group spacing={6} noWrap style={{ flexShrink: 0 }}>
              {muted && <VolumeX size={12} style={{ color: lastMsgColor }} />}
              <UnreadBadge count={unreadCount} />
            </Group>
          </Box>
        </Box>
      </Box>
    </UnstyledButton>
  );
});

ConversationCard.displayName = 'ConversationCard';

export default ConversationCard;
