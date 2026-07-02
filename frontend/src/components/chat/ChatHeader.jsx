import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { ActionIcon, Avatar, Box, Group, Text, Menu, Badge, useMantineTheme } from '@mantine/core';
import { ArrowLeft, MoreVertical, User, Calendar } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const ChatHeader = memo(({
  conversation,
  onBack,
  currentUserId,
}) => {
  const theme = useMantineTheme();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const { participants = [], sessions = [] } = conversation;
  
  const otherParticipant = (participants.length > 0 && participants.find((p) => p.id !== currentUserId)) || {
    id: conversation.otherParticipantId,
    name: conversation.otherParticipantName,
    profilePicUrl: conversation.otherParticipantProfilePicUrl,
  };
  const otherParticipantId = otherParticipant.id;
  
  const onlineUsers = useSelector((state) => state.presence.onlineUsers);
  const isOnline = onlineUsers[otherParticipantId] || otherParticipant.online || false;
  
  const latestSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;

  const skillExchangeText = latestSession 
    ? `${latestSession.skillOffered} ↔ ${latestSession.skillRequested}` 
    : 'Skill Exchange';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge color="green" variant="light" size="xs">Completed Session</Badge>;
      case 'ACCEPTED':
        return <Badge color="blue" variant="light" size="xs">Scheduled Session</Badge>;
      case 'PENDING':
        return <Badge color="yellow" variant="light" size="xs">Pending Session</Badge>;
      case 'CANCELLED':
        return <Badge color="red" variant="light" size="xs">Cancelled Session</Badge>;
      case 'REJECTED':
        return <Badge color="red" variant="light" size="xs">Rejected Session</Badge>;
      default:
        return null;
    }
  };

  const headerBg = isDark ? theme.colors.dark[7] : '#f0f2f5'; // WhatsApp header color
  const borderBottomColor = isDark ? theme.colors.dark[8] : '#e9edef';
  const nameColor = isDark ? theme.colors.gray[2] : '#111b21';
  const subtitleColor = isDark ? theme.colors.gray[5] : '#667781';
  const iconColor = isDark ? theme.colors.gray[4] : '#54656f';

  return (
    <Box
      component="header"
      style={{
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${borderBottomColor}`,
        backgroundColor: headerBg,
        width: '100%',
        zIndex: 10,
        flexShrink: 0,
      }}
    >
      <Group spacing="sm" noWrap style={{ flex: 1, minWidth: 0 }}>
        {/* Mobile Back Button */}
        <ActionIcon
          onClick={onBack}
          variant="transparent"
          style={{
            display: 'inline-flex',
            flexShrink: 0,
          }}
          className="md:hidden"
        >
          <ArrowLeft size={20} style={{ color: iconColor }} />
        </ActionIcon>

        <Avatar
          src={otherParticipant.profilePicUrl}
          alt={otherParticipant.name}
          radius="xl"
          size="md"
          style={{ border: `2px solid ${isDark ? theme.colors.dark[5] : theme.colors.gray[2]}`, flexShrink: 0 }}
        >
          {otherParticipant.name?.charAt(0).toUpperCase()}
        </Avatar>

        <Box style={{ cursor: 'pointer', flex: 1, minWidth: 0 }} onClick={() => navigate(`/profile/${otherParticipantId}`)}>
          <Text weight={600} size="sm" lineClamp={1} style={{ color: nameColor, lineHeight: 1.2 }}>
            {otherParticipant.name}
          </Text>
          <Group spacing="xs" align="center" noWrap mt={2}>
            <Text size="xs" style={{ color: subtitleColor, fontWeight: 500 }} lineClamp={1}>
              {skillExchangeText}
            </Text>
            {latestSession && <Box style={{ flexShrink: 0 }}>{getStatusBadge(latestSession.status)}</Box>}
          </Group>
          <Text size="11px" style={{ color: isOnline ? (isDark ? theme.colors.green[4] : theme.colors.green[7]) : subtitleColor, display: 'flex', alignItems: 'center', gap: '4px', mt: 2, lineHeight: 1.2 }}>
            {isOnline && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: isDark ? theme.colors.green[4] : theme.colors.green[7] }} />}
            {isOnline ? 'online' : 'Last seen today'}
          </Text>
        </Box>
      </Group>

      <Group spacing="xs" style={{ flexShrink: 0 }}>
        <Menu position="bottom-end" shadow="md">
          <Menu.Target>
            <ActionIcon variant="transparent">
              <MoreVertical size={20} style={{ color: iconColor }} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item 
              icon={<User size={14} />} 
              onClick={() => navigate(`/profile/${otherParticipantId}`)}
            >
              View Profile
            </Menu.Item>
            {latestSession && (
              <Menu.Item 
                icon={<Calendar size={14} />} 
                onClick={() => navigate(`/sessions/${latestSession.id}`)}
              >
                View Session
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Box>
  );
});

ChatHeader.displayName = 'ChatHeader';

export default ChatHeader;
