import React, { useState, memo } from 'react';
import { Avatar, Box, Group, Paper, Text, useMantineTheme } from '@mantine/core';
import { Check, CheckCheck, FileText, Image, Link } from 'lucide-react';
import { formatBubbleTime } from '../../utils/dateFormatter';
import { useTheme } from '../../context/ThemeContext';

/**
 * Single chat bubble in the conversation timeline.
 */
const MessageBubble = memo(({
  message,
  isOwn,
  isFirstInGroup = true,
  isLastInGroup = true,
  otherParticipant,
}) => {
  const theme = useMantineTheme();
  const { isDark } = useTheme();
  const [hovered, setHovered] = useState(false);

  const { content, createdAt, status, deleted, edited, type } = message;

  // Determine ticks for message delivery status (only for own messages)
  const renderStatusTicks = () => {
    if (!isOwn || deleted) return null;
    switch (status) {
      case 'READ':
        return <CheckCheck size={14} style={{ color: isDark ? '#53bdeb' : '#34B7F1' }} />; // WhatsApp blue tick
      case 'DELIVERED':
        return <CheckCheck size={14} style={{ color: isDark ? theme.colors.gray[5] : '#8696a0' }} />;
      case 'SENT':
      default:
        return <Check size={14} style={{ color: isDark ? theme.colors.gray[5] : '#8696a0' }} />;
    }
  };

  // Render attachment placeholders for future readiness
  const renderAttachmentPlaceholder = () => {
    if (type === 'TEXT' || type === 'SYSTEM') return null;

    let icon = <FileText size={16} />;
    let label = 'Attachment';

    if (type === 'IMAGE') {
      icon = <Image size={16} />;
      label = 'Image Attachment';
    } else if (type === 'LINK') {
      icon = <Link size={16} />;
      label = 'Shared Link';
    }

    return (
      <Group
        spacing={8}
        mt="xs"
        p="xs"
        style={{
          borderRadius: '6px',
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          border: '1px dashed rgba(0, 0, 0, 0.1)',
        }}
      >
        {icon}
        <Text size="xs" color="dimmed">
          {label} (Coming Soon)
        </Text>
      </Group>
    );
  };

  // Project primary theme colors (Violet) for own messages, and contrasting gray/slate for other messages
  const ownBg = isDark ? theme.colors.violet[8] : theme.colors.violet[6];
  const otherBg = isDark ? theme.colors.dark[6] : theme.colors.gray[1];
  const deletedBg = isDark ? theme.colors.dark[8] : theme.colors.gray[0];
  const ownTextColor = '#ffffff';
  const otherTextColor = isDark ? theme.colors.gray[2] : theme.colors.dark[9];
  
  const timestampColor = isOwn 
    ? 'rgba(255, 255, 255, 0.7)' 
    : (isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.45)');

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        width: '100%',
        marginTop: isFirstInGroup ? '12px' : '3px',
        marginBottom: '0px',
        alignItems: 'flex-start',
        gap: '8px',
        boxSizing: 'border-box',
      }}
    >
      {/* Avatar column for other participant */}
      {!isOwn && (
        <Box style={{ width: '32px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          {isFirstInGroup ? (
            <Avatar
              src={otherParticipant?.profilePicUrl}
              alt={otherParticipant?.name}
              radius="xl"
              size="sm"
              style={{ border: `1px solid ${isDark ? theme.colors.dark[5] : theme.colors.gray[3]}` }}
            >
              {otherParticipant?.name?.charAt(0).toUpperCase()}
            </Avatar>
          ) : null}
        </Box>
      )}

      <Paper
        shadow="xs"
        p="8px 12px"
        className="w-fit max-w-[75%] md:max-w-[65%] lg:max-w-[60%]"
        style={{
          backgroundColor: deleted ? deletedBg : isOwn ? ownBg : otherBg,
          borderRadius: '8px',
          borderTopRightRadius: isOwn && isFirstInGroup ? '0' : '8px',
          borderTopLeftRadius: !isOwn && isFirstInGroup ? '0' : '8px',
          border: deleted
            ? `1px dashed ${isDark ? theme.colors.dark[5] : theme.colors.gray[3]}`
            : 'none',
          position: 'relative',
          transition: 'background-color 0.2s ease',
          boxSizing: 'border-box',
        }}
      >
        {deleted ? (
          <Text size="sm" color="dimmed" italic style={{ letterSpacing: '0.1px' }}>
            This message was deleted
          </Text>
        ) : (
          <Box style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {/* Sender Label */}
            {isFirstInGroup && (
              <Text
                size="xs"
                style={{
                  fontWeight: 600,
                  color: isOwn 
                    ? (isDark ? theme.colors.violet[3] : theme.colors.violet[1]) 
                    : (isDark ? theme.colors.blue[4] : theme.colors.blue[7]),
                  marginBottom: '4px',
                  display: 'block',
                }}
              >
                {isOwn ? 'You' : (message.senderName || otherParticipant?.name || 'Participant')}
              </Text>
            )}

            {/* Message Content */}
            <Text
              size="sm"
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: isOwn ? ownTextColor : otherTextColor,
                lineHeight: 1.4,
              }}
            >
              {content}
            </Text>

            {renderAttachmentPlaceholder()}

            {/* Bottom-right aligned timestamp & ticks */}
            <Box
              style={{
                alignSelf: 'flex-end',
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Text
                size="9px"
                style={{
                  color: timestampColor,
                  fontWeight: 500,
                }}
              >
                {formatBubbleTime(createdAt)}
              </Text>
              {renderStatusTicks()}
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;
