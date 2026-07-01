import React, { useState } from 'react';
import { Box, TextInput, useMantineTheme, ActionIcon } from '@mantine/core';
import { Search, Filter } from 'lucide-react';
import ConversationList from './ConversationList';
import { useTheme } from '../../context/ThemeContext';

const ChatSidebar = ({
  conversations = [],
  loading = false,
  hasMore = false,
  selectedId = null,
  onSelect,
  onLoadMore,
  currentUserId,
}) => {
  const theme = useMantineTheme();
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const sidebarBg = isDark ? theme.colors.dark[8] : '#ffffff';
  const borderRightColor = isDark ? theme.colors.dark[7] : '#d1d7db';
  const searchBg = isDark ? theme.colors.dark[7] : '#f0f2f5';

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: sidebarBg,
        borderRight: `1px solid ${borderRightColor}`,
      }}
    >
      {/* WhatsApp style Sidebar Header with Search */}
      <Box p="sm" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        borderBottom: `1px solid ${borderRightColor}` 
      }}>
        <TextInput
          placeholder="Search or start new chat"
          icon={<Search size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          radius="md"
          size="sm"
          style={{ flex: 1 }}
          styles={{
            input: {
              backgroundColor: searchBg,
              border: 'none',
              '&:focus': {
                border: 'none',
              },
            },
          }}
        />
        <ActionIcon variant="subtle" size="md">
          <Filter size={18} style={{ color: isDark ? theme.colors.gray[4] : '#54656f' }} />
        </ActionIcon>
      </Box>

      {/* Conversation List */}
      <ConversationList
        conversations={conversations}
        searchQuery={searchQuery}
        loading={loading}
        hasMore={hasMore}
        selectedId={selectedId}
        onSelect={onSelect}
        onLoadMore={onLoadMore}
        currentUserId={currentUserId}
      />
    </Box>
  );
};

export default ChatSidebar;
