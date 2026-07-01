import React from 'react';
import { useSelector } from 'react-redux';
import { Avatar, Box, Group, Text, UnstyledButton, useMantineTheme } from '@mantine/core';
import { VolumeX } from 'lucide-react';
import UnreadBadge from './UnreadBadge';
import { formatMessageTime } from '../../utils/dateFormatter';
import { useTheme } from '../../context/ThemeContext';

const ConversationCard = ({
  conversation,
  isSelected,
  onClick,
  currentUserId,
}) => {
  const theme = useMantineTheme();
  const { isDark } = useTheme();

  const {
    otherParticipantName,
    otherParticipantId,
    otherParticipantProfilePicUrl,
    unreadCount,
    lastMessageContent,
    lastMessageSentAt,
    muted,
    skillExchange, // Provided from our updated DTO
    sessionStatus // Provided from our updated DTO
  } = conversation;

  // Real-time presence
  const onlineUsers = useSelector((state) => state.presence.onlineUsers);
  const isOnline = onlineUsers[otherParticipantId] || false;

  // Real-time typing
  const typingUsers = useSelector((state) => state.chat.typingUsers);
  const isTyping = typingUsers[otherParticipantId] || false;

  // WhatsApp style styling
  const activeBg = isDark ? theme.colors.dark[6] : '#f0f2f5';
  const hoverBg = isDark ? theme.colors.dark[7] : '#f5f6f6';
  const nameColor = isDark ? theme.colors.gray[2] : '#111b21';
  const lastMsgColor = isDark ? theme.colors.gray[5] : '#667781';
  const timeColor = unreadCount > 0 ? theme.colors.green[6] : lastMsgColor;
  const borderColor = isDark ? theme.colors.dark[8] : '#f0f2f5';

  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        backgroundColor: isSelected ? activeBg : 'transparent',
        transition: 'background-color 0.2s ease',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: isSelected ? activeBg : hoverBg,
        },
      }}
    >
      <Box style={{ display: 'flex', alignItems: 'center', padding: '0 12px', height: 72 }}>
        {/* Avatar */}
        <Box style={{ position: 'relative', marginRight: 12 }}>
          <Avatar
            src={otherParticipantProfilePicUrl}
            alt={otherParticipantName}
            radius="xl"
            size={48}
          >
            {otherParticipantName?.charAt(0).toUpperCase()}
          </Avatar>
          {isOnline && (
            <Box
              style={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 10,
                height: 10,
                backgroundColor: theme.colors.green[5],
                borderRadius: '50%',
                border: `2px solid ${isDark ? theme.colors.dark[7] : '#fff'}`,
              }}
            />
          )}
        </Box>

        {/* Content with bottom border */}
        <Box style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderBottom: `1px solid ${isSelected ? 'transparent' : borderColor}`, paddingRight: 4 }}>
          {/* Top Row: Name and Time */}
          <Group position="apart" noWrap spacing={4} style={{ marginBottom: 2 }}>
            <Text weight={500} size="md" lineClamp={1} style={{ color: nameColor }}>
              {otherParticipantName}
            </Text>
            <Text size="xs" style={{ color: timeColor }}>
              {lastMessageSentAt ? formatMessageTime(lastMessageSentAt) : ''}
            </Text>
          </Group>

          {/* Bottom Row: Message and Badges */}
          <Group position="apart" noWrap spacing={4}>
            <Box style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              {isTyping ? (
                <Text size="sm" style={{ color: theme.colors.green[6], fontWeight: 500 }}>
                  typing...
                </Text>
              ) : (
                <>
                  {skillExchange && (
                    <Text size="xs" style={{ 
                      backgroundColor: isDark ? theme.colors.dark[5] : theme.colors.gray[2],
                      padding: '2px 6px',
                      borderRadius: 4,
                      color: isDark ? theme.colors.gray[3] : theme.colors.gray[7],
                      whiteSpace: 'nowrap'
                    }}>
                      {skillExchange.split(':')[0]} {/* Shorten to just Teaching/Learning */}
                    </Text>
                  )}
                  <Text size="sm" lineClamp={1} style={{ color: lastMsgColor, flex: 1 }}>
                    {lastMessageContent || 'No messages yet'}
                  </Text>
                </>
              )}
            </Box>

            <Group spacing={6} noWrap>
              {muted && <VolumeX size={14} style={{ color: lastMsgColor }} />}
              <UnreadBadge count={unreadCount} />
            </Group>
          </Group>
        </Box>
      </Box>
    </UnstyledButton>
  );
};

export default ConversationCard;
