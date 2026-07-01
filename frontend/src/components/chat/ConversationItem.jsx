import React from 'react';
import { useSelector } from 'react-redux';
import { Avatar, Box, Group, Menu, Text, UnstyledButton, useMantineTheme } from '@mantine/core';
import { Archive, MoreVertical, Volume2, VolumeX } from 'lucide-react';
import PresenceBadge from './PresenceBadge';
import UnreadBadge from './UnreadBadge';
import { formatMessageTime } from '../../utils/dateFormatter';
import { useTheme } from '../../context/ThemeContext';

/**
 * Single conversation item in the sidebar list.
 */
const ConversationItem = ({
  conversation,
  isSelected,
  onClick,
  onMute,
  onArchive,
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
  } = conversation;

  // Retrieve real-time presence from redux
  const onlineUsers = useSelector((state) => state.presence.onlineUsers);
  const isOnline = onlineUsers[otherParticipantId] || false;

  // Retrieve real-time typing status from redux
  const typingUsers = useSelector((state) => state.chat.typingUsers);
  const isTyping = typingUsers[otherParticipantId] || false;

  // Dynamic theme colors
  const activeBg = isDark ? 'rgba(139, 92, 246, 0.18)' : 'rgba(124, 58, 237, 0.08)';
  const hoverBg = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)';
  const nameColor = isDark ? theme.colors.dark[0] : theme.colors.gray[8];
  const lastMsgColor = isDark ? theme.colors.dark[3] : theme.colors.gray[6];
  const unreadCountWeight = unreadCount > 0 ? 600 : 400;

  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        padding: '12px 16px',
        borderRadius: '10px',
        backgroundColor: isSelected ? activeBg : 'transparent',
        transition: 'background-color 0.2s ease',
        cursor: 'pointer',
        border: '1px solid transparent',
        '&:hover': {
          backgroundColor: isSelected ? activeBg : hoverBg,
        },
      }}
    >
      <Group spacing="sm" position="apart" noWrap>
        {/* Left Side: Avatar & Presence */}
        <Group spacing="sm" noWrap style={{ flex: 1, minWidth: 0 }}>
          <Box style={{ position: 'relative' }}>
            <Avatar
              src={otherParticipantProfilePicUrl}
              alt={otherParticipantName}
              radius="xl"
              size="md"
              color="violet"
              style={{
                border: `2px solid ${isSelected ? theme.colors.violet[4] : 'transparent'}`,
              }}
            >
              {otherParticipantName?.charAt(0).toUpperCase()}
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

          {/* Middle: Details */}
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group position="apart" noWrap spacing={4}>
              <Text
                weight={isSelected || unreadCount > 0 ? 700 : 500}
                size="sm"
                lineClamp={1}
                style={{ color: nameColor }}
              >
                {otherParticipantName}
              </Text>
              <Text size="xs" style={{ color: lastMsgColor }}>
                {lastMessageSentAt ? formatMessageTime(lastMessageSentAt) : ''}
              </Text>
            </Group>

            {isTyping ? (
              <Text size="xs" color="violet" italic weight={600}>
                typing...
              </Text>
            ) : (
              <Text
                size="xs"
                lineClamp={1}
                weight={unreadCountWeight}
                style={{
                  color: unreadCount > 0 ? (isDark ? '#fff' : '#000') : lastMsgColor,
                }}
              >
                {lastMessageContent || 'No messages yet'}
              </Text>
            )}
          </Box>
        </Group>

        {/* Right Side: Badges & Menu */}
        <Group spacing={8} noWrap onClick={(e) => e.stopPropagation()}>
          {muted && <VolumeX size={14} style={{ color: theme.colors.gray[5] }} />}
          <UnreadBadge count={unreadCount} />
          
          <Box style={{ opacity: isSelected ? 1 : 0.5 }}>
            <Menu position="bottom-end" shadow="md" withinPortal>
              <Menu.Target>
                <UnstyledButton style={{ display: 'flex', alignItems: 'center', padding: '4px' }}>
                  <MoreVertical size={16} style={{ color: isDark ? theme.colors.dark[2] : theme.colors.gray[6] }} />
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  icon={muted ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  onClick={onMute}
                >
                  {muted ? 'Unmute Notification' : 'Mute Notification'}
                </Menu.Item>
                <Menu.Item icon={<Archive size={14} />} onClick={onArchive}>
                  Archive Conversation
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Box>
        </Group>
      </Group>
    </UnstyledButton>
  );
};

export default ConversationItem;
