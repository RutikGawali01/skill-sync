import React, { memo } from 'react';
import { Box, ScrollArea, Stack, useMantineTheme } from '@mantine/core';
import { MessageSquare, Search } from 'lucide-react';
import ConversationCard from './ConversationCard';
import ConversationSkeleton from './ConversationSkeleton';
import EmptyState from './EmptyState';
import { useTheme } from '../../context/ThemeContext';

/**
 * Scrollable list of conversations.
 */
const ConversationList = memo(({
  conversations = [],
  searchQuery = '',
  loading = false,
  hasMore = false,
  selectedId = null,
  onSelect,
  onLoadMore,
  currentUserId,
}) => {
  const theme = useMantineTheme();
  const { isDark } = useTheme();

  // Filter conversations:
  // Client-side search matching otherParticipantName.
  const filteredConversations = conversations.filter((c) => {
    return c.otherParticipantName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 50) {
      if (hasMore && !loading) {
        onLoadMore();
      }
    }
  };

  const listBg = isDark ? theme.colors.dark[8] : '#ffffff';

  return (
    <Box 
      style={{ 
        flex: 1, 
        minHeight: 0, 
        backgroundColor: listBg,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {loading && conversations.length === 0 ? (
        <ConversationSkeleton />
      ) : filteredConversations.length === 0 ? (
        searchQuery ? (
          <EmptyState
            icon={Search}
            title="No results found"
            description={`We couldn't find any conversations matching "${searchQuery}".`}
            height="100%"
          />
        ) : (
          <EmptyState
            icon={MessageSquare}
            title="No Conversations"
            description="Start a learning session to chat with other users."
            height="100%"
          />
        )
      ) : (
        <ScrollArea
          style={{ flex: 1, height: '100%' }}
          viewportRef={(ref) => {
            if (ref) ref.onscroll = handleScroll;
          }}
        >
          <Stack spacing={0}>
            {filteredConversations.map((conv) => (
              <ConversationCard
                key={conv.conversationId}
                conversation={conv}
                isSelected={conv.conversationId === selectedId}
                onClick={() => onSelect(conv.conversationId)}
                currentUserId={currentUserId}
              />
            ))}
          </Stack>
        </ScrollArea>
      )}
    </Box>
  );
});

ConversationList.displayName = 'ConversationList';

export default ConversationList;
