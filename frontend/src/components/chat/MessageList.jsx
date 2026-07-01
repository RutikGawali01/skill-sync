import React, { useEffect, useRef } from 'react';
import { Box, ScrollArea, Stack, useMantineTheme } from '@mantine/core';
import { buildTimeline } from '../../utils/timelineBuilder';
import MessageBubble from './MessageBubble';
import SessionBanner from './SessionBanner';
import ReviewBanner from './ReviewBanner';
import SystemMessage from './SystemMessage';
import TypingIndicator from './TypingIndicator';
import EmptyConversation from './EmptyConversation';
import MessageSkeleton from './MessageSkeleton';
import { useTheme } from '../../context/ThemeContext';
import { formatSessionDate } from '../../utils/dateFormatter';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const MessageList = ({
  messages = [],
  sessions = [],
  loading = false,
  hasMore = false,
  typingUsers = {},
  currentUserId,
  onLoadMore,
  otherParticipant,
}) => {
  const theme = useMantineTheme();
  const { isDark } = useTheme();

  const scrollViewportRef = useRef(null);
  const prevScrollHeightRef = useRef(0);
  const isInitialLoadRef = useRef(true);

  const timelineItems = buildTimeline(sessions, messages);

  const handleScroll = (event) => {
    const { scrollTop, scrollHeight } = event.currentTarget;
    if (scrollTop < 30 && hasMore && !loading) {
      prevScrollHeightRef.current = scrollHeight;
      onLoadMore();
    }
  };

  const scrollToBottom = () => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTo({
        top: scrollViewportRef.current.scrollHeight,
        behavior: isInitialLoadRef.current ? 'auto' : 'smooth',
      });
    }
  };

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

  const renderTimelineItem = (item) => {
    switch (item.type) {
      case 'SESSION_CARD':
        return <SessionBanner key={item.id} session={item.data} />;

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
        return (
          <SystemMessage 
            key={item.id} 
            text={isCompleted 
              ? `Session completed on ${formatSessionDate(item.data.completedTime)}` 
              : 'Session request cancelled'
            }
            icon={isCompleted ? CheckCircle : AlertTriangle}
          />
        );

      case 'REVIEW_CARD':
        return <ReviewBanner key={item.id} session={item.data} />;

      default:
        return null;
    }
  };

  const isOtherTyping = otherParticipant && typingUsers[otherParticipant.id];
  const listBg = isDark ? '#0b141a' : '#efeae2'; // WhatsApp dark/light background colors

  if (loading && messages.length === 0) {
    return (
      <Box style={{ flex: 1, minHeight: 0, backgroundColor: listBg }}>
        <MessageSkeleton />
      </Box>
    );
  }

  if (sessions.length === 0 && messages.length === 0) {
    return (
      <Box style={{ flex: 1, minHeight: 0, backgroundColor: listBg, display: 'flex', flexDirection: 'column' }}>
        <EmptyConversation />
      </Box>
    );
  }

  return (
    <Box style={{ flex: 1, minHeight: 0, position: 'relative', backgroundColor: listBg }}>
      {/* Background doodle overlay (optional, but typical for WhatsApp) */}
      <Box 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: isDark ? 0.05 : 0.4,
          pointerEvents: 'none',
          backgroundImage: 'url("https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png")',
          backgroundRepeat: 'repeat',
          zIndex: 0
        }}
      />
      <ScrollArea
        style={{ height: '100%', position: 'relative', zIndex: 1 }}
        viewportRef={(ref) => {
          if (ref) ref.onscroll = handleScroll;
          scrollViewportRef.current = ref;
        }}
      >
        <Stack spacing="xs" p="md">
          {timelineItems.map(renderTimelineItem)}
          
          {sessions.length > 0 && messages.length === 0 && (
            <SystemMessage text="Introduce yourself and discuss your upcoming learning session." />
          )}

          {isOtherTyping && (
             <Box style={{ margin: '4px 0' }}>
               <TypingIndicator />
             </Box>
          )}
        </Stack>
      </ScrollArea>
    </Box>
  );
};

export default MessageList;
