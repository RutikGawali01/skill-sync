import React, { useState, memo } from 'react';
import { Box, TextInput, useMantineTheme, ActionIcon } from '@mantine/core';
import { Search, Filter } from 'lucide-react';
import ConversationList from './ConversationList';
import { useTheme } from '../../context/ThemeContext';

const ChatSidebar = memo(({
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
  const borderColor = isDark ? theme.colors.dark[7] : '#e9edef';
  const searchBg = isDark ? theme.colors.dark[7] : '#f0f2f5';

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: sidebarBg,
      }}
    >
      {/* Search Header */}
      <Box 
        p="sm" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          borderBottom: `1px solid ${borderColor}`,
          flexShrink: 0,
        }}
      >
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
});

ChatSidebar.displayName = 'ChatSidebar';

export default ChatSidebar;
