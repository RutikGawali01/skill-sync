import React from 'react';
import { useSelector } from 'react-redux';
import { ActionIcon, Avatar, Box, Group, Text, Menu, useMantineTheme } from '@mantine/core';
import { ArrowLeft, MoreVertical, User, Calendar } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const ChatHeader = ({
  conversation,
  onBack,
  currentUserId,
}) => {
  const theme = useMantineTheme();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const { participants = [], sessions = [] } = conversation;
  
  const otherParticipant = participants.find((p) => p.id !== currentUserId) || {};
  const otherParticipantId = otherParticipant.id;
  
  const onlineUsers = useSelector((state) => state.presence.onlineUsers);
  const isOnline = onlineUsers[otherParticipantId] || otherParticipant.online || false;
  
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

  const headerBg = isDark ? theme.colors.dark[7] : '#f0f2f5'; // WhatsApp header color
  const borderBottomColor = isDark ? theme.colors.dark[8] : '#e9edef';
  const nameColor = isDark ? theme.colors.gray[2] : '#111b21';
  const subtitleColor = isDark ? theme.colors.gray[5] : '#667781';
  const iconColor = isDark ? theme.colors.gray[4] : '#54656f';

  return (
    <Box
      component="header"
      style={{
        height: 60,
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${borderBottomColor}`,
        backgroundColor: headerBg,
        width: '100%',
        zIndex: 10,
      }}
    >
      <Group spacing="sm" noWrap>
        {/* Mobile Back Button */}
        <ActionIcon
          onClick={onBack}
          variant="transparent"
          style={{
            display: 'inline-flex',
            '@media (min-width: 768px)': {
              display: 'none',
            },
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
        >
          {otherParticipant.name?.charAt(0).toUpperCase()}
        </Avatar>

        <Box style={{ cursor: 'pointer' }} onClick={() => navigate(`/profile/${otherParticipantId}`)}>
          <Text weight={500} size="md" style={{ color: nameColor, lineHeight: 1.2 }}>
            {otherParticipant.name}
          </Text>
          <Text size="xs" style={{ color: subtitleColor, lineHeight: 1.2 }} lineClamp={1}>
            {isOnline ? 'online' : skillExchangeLabel}
          </Text>
        </Box>
      </Group>

      <Group spacing="xs">
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
};

export default ChatHeader;
