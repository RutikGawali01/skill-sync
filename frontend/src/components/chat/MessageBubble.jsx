import React from 'react';
import { Box, Group, Paper, Text, useMantineTheme } from '@mantine/core';
import { Check, CheckCheck, FileText, Image, Link } from 'lucide-react';
import { formatMessageTime } from '../../utils/dateFormatter';
import { useTheme } from '../../context/ThemeContext';

/**
 * Single chat bubble in the conversation timeline.
 */
const MessageBubble = ({ message, isOwn }) => {
  const theme = useMantineTheme();
  const { isDark } = useTheme();

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

  // WhatsApp style dynamic bubble colors
  const ownBg = isDark ? '#005c4b' : '#d9fdd3';
  const otherBg = isDark ? '#202c33' : '#ffffff';
  const deletedBg = isDark ? theme.colors.dark[8] : theme.colors.gray[0];
  const ownTextColor = isDark ? '#e9edef' : '#111b21';
  const otherTextColor = isDark ? '#e9edef' : '#111b21';
  
  const timestampColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.45)';

  return (
    <Box
      style={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        width: '100%',
        margin: '2px 0',
      }}
    >
      <Paper
        shadow="sm"
        p="8px 12px"
        style={{
          maxWidth: '65%',
          backgroundColor: deleted ? deletedBg : isOwn ? ownBg : otherBg,
          borderRadius: '8px',
          borderTopRightRadius: isOwn ? '0' : '8px',
          borderTopLeftRadius: !isOwn ? '0' : '8px',
          border: deleted
            ? `1px dashed ${isDark ? theme.colors.dark[5] : theme.colors.gray[3]}`
            : 'none',
          position: 'relative',
        }}
      >
        {deleted ? (
          <Text size="sm" color="dimmed" italic style={{ letterSpacing: '0.1px' }}>
            This message was deleted
          </Text>
        ) : (
          <Box style={{ display: 'flex', flexDirection: 'column' }}>
            <Text
              size="sm"
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: isOwn ? ownTextColor : otherTextColor,
                lineHeight: 1.4,
                paddingRight: '35px' // Leave space for the timestamp float
              }}
            >
              {content}
            </Text>
            {renderAttachmentPlaceholder()}
          </Box>
        )}

        {/* Timestamp & Status Metadata overlay on bottom right */}
        {!deleted && (
          <Group 
            spacing={4} 
            noWrap 
            style={{ 
              position: 'absolute',
              bottom: '4px',
              right: '8px',
              height: '15px'
            }}
          >
            <Text
              size="10px"
              style={{
                color: timestampColor,
              }}
            >
              {formatMessageTime(createdAt)}
            </Text>
            {renderStatusTicks()}
          </Group>
        )}
      </Paper>
    </Box>
  );
};

export default MessageBubble;

