import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Box, Button, Card, Center, Group, ScrollArea, Stack, Text, ThemeIcon, useMantineTheme } from '@mantine/core';
import { AlertTriangle, BookOpen, CheckCircle, MessageSquare, Star } from 'lucide-react';
import { buildTimeline } from '../../utils/timelineBuilder';
import MessageBubble from './MessageBubble';
import SessionCard from './SessionCard';
import TypingIndicator from './TypingIndicator';
import EmptyState from './EmptyState';
import MessageSkeleton from './MessageSkeleton';
import { formatSessionDate } from '../../utils/dateFormatter';
import { useTheme } from '../../context/ThemeContext';

/**
 * Main chronological timeline of messages, session invitations, status updates, and review cards.
 */
const ConversationTimeline = ({
  messages = [],
  sessions = [],
  loading = false,
  hasMore = false,
  typingUsers = {},
  currentUserId,
  onLoadMore,
  otherParticipant,
}) => {
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const { isDark } = useTheme();

  const scrollViewportRef = useRef(null);
  const prevScrollHeightRef = useRef(0);
  const isInitialLoadRef = useRef(true);

  // Generate interleaved chronological list
  const timelineItems = buildTimeline(sessions, messages);

  // Detect top scroll to load older messages
  const handleScroll = (event) => {
    const { scrollTop, scrollHeight } = event.currentTarget;
    
    if (scrollTop < 30 && hasMore && !loading) {
      // Record scroll height before loading more messages to preserve scroll offset
      prevScrollHeightRef.current = scrollHeight;
      onLoadMore();
    }
  };

  // Scroll to bottom helper
  const scrollToBottom = () => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTo({
        top: scrollViewportRef.current.scrollHeight,
        behavior: isInitialLoadRef.current ? 'auto' : 'smooth',
      });
    }
  };

  // Trigger scroll positioning
  useEffect(() => {
    if (loading) return;

    if (isInitialLoadRef.current) {
      scrollToBottom();
      isInitialLoadRef.current = false;
    } else if (prevScrollHeightRef.current > 0 && scrollViewportRef.current) {
      const newScrollHeight = scrollViewportRef.current.scrollHeight;
      const heightDifference = newScrollHeight - prevScrollHeightRef.current;
      scrollViewportRef.current.scrollTop = heightDifference;
      prevScrollHeightRef.current = 0;
    } else {
      scrollToBottom();
    }
  }, [messages.length, sessions.length, loading]);

  useEffect(() => {
    isInitialLoadRef.current = true;
    prevScrollHeightRef.current = 0;
  }, [sessions.length > 0 ? sessions[0].id : null]);

  // Renders individual elements of the timeline
  const renderTimelineItem = (item) => {
    switch (item.type) {
      case 'SESSION_CARD':
        return (
          <SessionCard
            key={item.id}
            session={item.data}
            currentUserId={currentUserId}
          />
        );

      case 'MESSAGE':
        return (
          <MessageBubble
            key={item.id}
            message={item.data}
            isOwn={item.data.senderId === currentUserId}
          />
        );

      case 'SESSION_STATUS':
        const isCompleted = item.data.status === 'COMPLETED';
        const statusBg = isCompleted
          ? (isDark ? 'rgba(52, 211, 153, 0.08)' : 'rgba(52, 211, 153, 0.05)')
          : (isDark ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.05)');
        const statusBorder = isCompleted
          ? (isDark ? 'rgba(52, 211, 153, 0.15)' : 'rgba(52, 211, 153, 0.1)')
          : (isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)');
        
        return (
          <Center key={item.id} style={{ margin: '16px 0' }}>
            <Group
              spacing={8}
              p="xs"
              style={{
                borderRadius: '8px',
                backgroundColor: statusBg,
                border: `1px solid ${statusBorder}`,
              }}
            >
              <ThemeIcon color={isCompleted ? 'green' : 'red'} size={18} radius="xl" variant="light">
                {isCompleted ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
              </ThemeIcon>
              <Text size="xs" color={isCompleted ? 'green' : 'red'} weight={600}>
                {isCompleted
                  ? `Session completed on ${formatSessionDate(item.data.completedTime)}`
                  : 'Session request cancelled'}
              </Text>
            </Group>
          </Center>
        );

      case 'REVIEW_CARD':
        return (
          <Center key={item.id} style={{ margin: '8px 0 16px 0' }}>
            <Card
              p="sm"
              radius="md"
              withBorder
              style={{
                width: '100%',
                maxWidth: '520px',
                backgroundColor: isDark ? theme.colors.dark[8] : theme.colors.gray[0],
                borderColor: isDark ? theme.colors.dark[7] : theme.colors.gray[2],
              }}
            >
              <Stack spacing="xs" align="center">
                {item.data.reviewSubmitted ? (
                  <Stack spacing={4} align="center" style={{ width: '100%' }}>
                    <Text size="xs" color="dimmed" weight={600}>
                      Session Review Details
                    </Text>
                    <Group spacing={2}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          fill={i < (item.data.reviewRating || 0) ? '#F59E0B' : 'transparent'}
                          color={i < (item.data.reviewRating || 0) ? '#F59E0B' : '#6B7280'}
                        />
                      ))}
                    </Group>
                    {item.data.reviewComment && (
                      <Text size="xs" color="dimmed" align="center" italic>
                        "{item.data.reviewComment}"
                      </Text>
                    )}
                  </Stack>
                ) : (
                  <Group position="apart" style={{ width: '100%' }} noWrap>
                    <Text size="xs" color="dimmed" weight={600}>
                      How was your learning experience?
                    </Text>
                    <Button
                      variant="light"
                      color="violet"
                      size="xs"
                      onClick={() => navigate(`/sessions/${item.data.id}/reviews`)}
                    >
                      Leave Review
                    </Button>
                  </Group>
                )}
              </Stack>
            </Card>
          </Center>
        );

      default:
        return null;
    }
  };

  const isOtherTyping = otherParticipant && typingUsers[otherParticipant.id];
  const timelineBg = isDark ? theme.colors.dark[8] : '#fafafa';

  // 1. Loading state skeleton
  if (loading && messages.length === 0) {
    return (
      <Box style={{ flex: 1, minHeight: 0, backgroundColor: timelineBg }}>
        <MessageSkeleton />
      </Box>
    );
  }

  // 2. No active accepted sessions empty state
  if (sessions.length === 0 && messages.length === 0) {
    return (
      <Box style={{ flex: 1, minHeight: 0, backgroundColor: timelineBg }}>
        <EmptyState
          icon={BookOpen}
          title="📚 No Active Learning Sessions"
          description="You don't have any accepted learning sessions between this user yet. Request or accept a session to start chatting."
          actionLabel="Explore Skills"
          actionPath="/skills"
          height="100%"
        />
      </Box>
    );
  }

  return (
    <Box style={{ flex: 1, minHeight: 0, position: 'relative', backgroundColor: timelineBg }}>
      <ScrollArea
        style={{ height: '100%' }}
        viewportRef={(ref) => {
          if (ref) ref.onscroll = handleScroll;
          scrollViewportRef.current = ref;
        }}
      >
        <Stack spacing="xs" p="md">
          {timelineItems.map(renderTimelineItem)}
          
          {/* 3. Messages length is 0, but sessions exist: display "Start your conversation" invitation */}
          {sessions.length > 0 && messages.length === 0 && (
            <EmptyState
              icon={MessageSquare}
              title="Start your conversation."
              description="Introduce yourself and discuss your upcoming learning session."
              height="250px"
            />
          )}

          {isOtherTyping && <TypingIndicator />}
        </Stack>
      </ScrollArea>
    </Box>
  );
};

export default ConversationTimeline;
