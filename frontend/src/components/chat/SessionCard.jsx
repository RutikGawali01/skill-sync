import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Box, Button, Card, Group, Stack, Text, Tooltip, useMantineTheme } from '@mantine/core';
import { Calendar, Clock, Link as LinkIcon, MapPin, Star, Video } from 'lucide-react';
import { formatSessionDate, formatSessionTime } from '../../utils/dateFormatter';
import { useTheme } from '../../context/ThemeContext';

/**
 * Interactive session status and metadata card rendered inside the chat timeline.
 */
const SessionCard = ({ session, currentUserId }) => {
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const { isDark } = useTheme();

  const {
    id: sessionId,
    skillOffered,
    skillRequested,
    teacherName,
    learnerName,
    scheduledDate,
    scheduledTime,
    durationMinutes,
    mode,
    meetingLink,
    status,
    showReviewButton,
    reviewSubmitted,
    reviewRating,
    reviewComment,
  } = session;

  const isOnline = mode === 'ONLINE';

  // Session status badge colors
  const getStatusBadge = () => {
    switch (status) {
      case 'ACCEPTED':
        return <Badge color="green" variant="filled" size="xs">Accepted</Badge>;
      case 'COMPLETED':
        return <Badge color="blue" variant="filled" size="xs">Completed</Badge>;
      case 'CANCELLED':
        return <Badge color="red" variant="filled" size="xs">Cancelled</Badge>;
      case 'REJECTED':
        return <Badge color="gray" variant="filled" size="xs">Rejected</Badge>;
      default:
        return <Badge color="yellow" variant="filled" size="xs">Pending</Badge>;
    }
  };

  // Dynamic colors
  const cardBg = isDark ? theme.colors.dark[7] : theme.colors.gray[0];
  const cardBorderColor = isDark ? theme.colors.dark[6] : theme.colors.gray[2];
  const textColor = isDark ? theme.colors.dark[0] : theme.colors.gray[8];
  const subtitleColor = isDark ? theme.colors.dark[2] : theme.colors.gray[6];

  return (
    <Card
      shadow="xs"
      p="md"
      radius="md"
      withBorder
      style={{
        margin: '16px auto',
        maxWidth: '520px',
        width: '100%',
        backgroundColor: cardBg,
        borderColor: cardBorderColor,
      }}
    >
      <Stack spacing="xs">
        {/* Header: Skill Exchange Context */}
        <Group position="apart" noWrap>
          <Text weight={700} size="xs" color="violet" style={{ letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Learning Session #{sessionId}
          </Text>
          {getStatusBadge()}
        </Group>

        {/* Skill details */}
        <Box>
          <Text size="md" weight={700} style={{ color: textColor }}>
            {skillOffered} Exchange
          </Text>
          <Text size="xs" style={{ color: subtitleColor, marginTop: 2 }}>
            Teacher: <span style={{ fontWeight: 600 }}>{teacherName}</span> &nbsp;·&nbsp; Learner: <span style={{ fontWeight: 600 }}>{learnerName}</span>
          </Text>
        </Box>

        {/* Date, Time, Duration Info */}
        <Group spacing="lg" mt="xs">
          <Group spacing={6} noWrap>
            <Calendar size={14} style={{ color: theme.colors.violet[isDark ? 4 : 6] }} />
            <Text size="xs" style={{ color: textColor }}>{formatSessionDate(scheduledDate)}</Text>
          </Group>
          <Group spacing={6} noWrap>
            <Clock size={14} style={{ color: theme.colors.violet[isDark ? 4 : 6] }} />
            <Text size="xs" style={{ color: textColor }}>
              {formatSessionTime(scheduledTime)} ({durationMinutes} mins)
            </Text>
          </Group>
        </Group>

        {/* Meeting Mode / Venue Info */}
        <Group spacing="lg">
          <Group spacing={6} noWrap>
            {isOnline ? (
              <Video size={14} style={{ color: theme.colors.indigo[isDark ? 4 : 6] }} />
            ) : (
              <MapPin size={14} style={{ color: theme.colors.red[isDark ? 4 : 6] }} />
            )}
            <Text size="xs" style={{ color: textColor }}>{isOnline ? 'Online Meeting' : 'In-Person Session'}</Text>
          </Group>

          {isOnline && meetingLink && (status === 'ACCEPTED' || status === 'COMPLETED') && (
            <Group spacing={6} noWrap>
              <LinkIcon size={13} style={{ color: theme.colors.teal[isDark ? 4 : 6] }} />
              <Text
                component="a"
                href={meetingLink}
                target="_blank"
                rel="noreferrer"
                size="xs"
                style={{
                  color: theme.colors.teal[isDark ? 4 : 7],
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Join Meeting Room
              </Text>
            </Group>
          )}
        </Group>

        {/* Review System Integration */}
        {status === 'COMPLETED' && (
          <Box
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: `1px solid ${isDark ? theme.colors.dark[5] : theme.colors.gray[2]}`,
            }}
          >
            {reviewSubmitted ? (
              <Stack spacing={6}>
                <Group spacing={4} align="center">
                  <Badge color="violet" size="xs" variant="filled">
                    Review Submitted
                  </Badge>
                  {/* Render Review Stars */}
                  <Group spacing={2} ml={6}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        fill={i < (reviewRating || 0) ? '#F59E0B' : 'transparent'}
                        color={i < (reviewRating || 0) ? '#F59E0B' : '#6B7280'}
                      />
                    ))}
                  </Group>
                </Group>
                {reviewComment && (
                  <Text
                    size="xs"
                    italic
                    style={{
                      backgroundColor: isDark ? theme.colors.dark[8] : theme.colors.gray[1],
                      color: isDark ? theme.colors.dark[1] : theme.colors.gray[7],
                      padding: '8px 12px',
                      borderRadius: '8px',
                      borderLeft: `3px solid ${theme.colors.violet[5]}`,
                    }}
                  >
                    "{reviewComment}"
                  </Text>
                )}
              </Stack>
            ) : showReviewButton ? (
              <Button
                variant="light"
                color="violet"
                size="xs"
                fullWidth
                onClick={() => navigate(`/sessions/${sessionId}/reviews`)}
                style={{
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: theme.colors.violet[isDark ? 8 : 1],
                  }
                }}
              >
                Leave Review & Feedback
              </Button>
            ) : null}
          </Box>
        )}
      </Stack>
    </Card>
  );
};

export default SessionCard;
