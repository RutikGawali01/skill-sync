/**
 * SessionReviewPage.jsx
 * ─────────────────────
 * Session-scoped review view.
 *
 * Behavior:
 *   - Shows session context (skill, participants)
 *   - If session status === COMPLETED → shows "Leave Review" button
 *   - Otherwise → shows status info, review disabled
 *   - Clicking "Leave Review" opens ReviewModal
 *   - Lists existing reviews for this session
 *
 * Route: /sessions/:sessionId/reviews (or integrated within SessionDetailsPage)
 *
 * This is designed to be used as a standalone page OR embedded as a section.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box, Container, Stack, Group, Text, Title,
  Button, Badge, Divider, Alert,
} from '@mantine/core';
import {
  IconStarsFilled, IconStar, IconArrowLeft,
  IconInfoCircle,
} from '@tabler/icons-react';

import { useTheme } from '../../context/ThemeContext';
import useReview from '../../hooks/useReview';
import useSessionActions from '../../hooks/useSessionActions';
import ReviewModal from '../../components/review/ReviewModal';
import ReviewList from '../../components/review/ReviewList';

const SessionReviewPage = () => {
  const { isDark } = useTheme();
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?.id;

  const {
    selected: session,
    detailLoading,
    error: sessionError,
    loadSessionDetails,
    clearDetail,
  } = useSessionActions();

  const {
    sessionReviews,
    sessionRLoading,
    reviewError,
    loadSessionReviews,
    clearReviews,
  } = useReview();

  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // ── Fetch on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (sessionId) {
      loadSessionDetails(sessionId);
      loadSessionReviews(sessionId);
    }
    return () => {
      clearDetail();
      clearReviews();
    };
  }, [sessionId, loadSessionDetails, loadSessionReviews, clearDetail, clearReviews]);

  const isCompleted = session?.status === 'COMPLETED';

  // Check if current user has already reviewed
  const hasReviewed = sessionReviews.some(
    (r) => r.reviewerId === currentUserId || r.reviewer?.id === currentUserId
  );

  // ── Theme tokens ────────────────────────────────────────────────────────────
  const pageBg = isDark
    ? 'linear-gradient(180deg, #0d0f1c 0%, #0a0c1a 100%)'
    : 'linear-gradient(180deg, #f0f4ff 0%, #e8f0fe 100%)';
  const titleColor = isDark ? '#e2e8f0' : '#1e293b';

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: pageBg,
        paddingTop: '5.5rem',
        paddingBottom: '4rem',
        transition: 'background 0.3s ease',
      }}
    >
      <Container size="md">
        <Stack gap="xl">

          {/* ── Back button ── */}
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate(-1)}
            radius="md"
            size="sm"
            style={{ alignSelf: 'flex-start' }}
          >
            Back
          </Button>

          {/* ── Page Header ── */}
          <Group gap={10} align="center">
            <Box
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(245,158,11,0.18)',
                border: '1px solid rgba(245,158,11,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconStarsFilled size={18} color="#f59e0b" />
            </Box>
            <Title
              order={1}
              style={{
                color: titleColor,
                fontSize: '1.4rem',
                fontWeight: 700,
                letterSpacing: '-0.3px',
              }}
            >
              Session Reviews
            </Title>
            {session && (
              <Badge variant="light" color="violet" size="sm" radius="sm">
                {session.skillName || session.skill?.name || 'Session'}
              </Badge>
            )}
          </Group>

          {/* ── Session status info ── */}
          {session && !isCompleted && (
            <Alert
              icon={<IconInfoCircle size={18} />}
              color="blue"
              variant="light"
              radius="md"
            >
              <Text size="sm">
                Reviews can only be submitted for <strong>completed</strong> sessions.
                Current status: <Badge size="xs" color="gray">{session.status}</Badge>
              </Text>
            </Alert>
          )}

          {/* ── Leave Review CTA ── */}
          {isCompleted && !hasReviewed && (
            <Box
              style={{
                background: isDark ? 'rgba(139,92,246,0.06)' : 'rgba(139,92,246,0.03)',
                border: `1px solid ${isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)'}`,
                borderRadius: 16,
                padding: '1.5rem',
                textAlign: 'center',
              }}
            >
              <IconStar size={28} color="#f59e0b" style={{ marginBottom: 8 }} />
              <Text fw={600} size="md" mb={4} style={{ color: titleColor }}>
                How was your experience?
              </Text>
              <Text size="sm" c="dimmed" mb="md">
                Your review helps build trust and improve the community.
              </Text>
              <Button
                id="leave-review-btn"
                leftSection={<IconStar size={16} />}
                color="violet"
                radius="md"
                size="md"
                onClick={() => setReviewModalOpen(true)}
                style={{
                  boxShadow: '0 4px 14px rgba(139,92,246,0.25)',
                }}
              >
                Leave a Review
              </Button>
            </Box>
          )}

          {/* ── Already reviewed ── */}
          {isCompleted && hasReviewed && (
            <Alert
              icon={<IconStarsFilled size={18} />}
              color="teal"
              variant="light"
              radius="md"
            >
              <Text size="sm">
                You've already submitted a review for this session. Thank you! 🌟
              </Text>
            </Alert>
          )}

          {/* ── Reviews for this session ── */}
          <Divider
            label={
              <Text size="xs" fw={600} c="dimmed" style={{ letterSpacing: '1px', textTransform: 'uppercase' }}>
                {sessionReviews.length > 0
                  ? `${sessionReviews.length} ${sessionReviews.length === 1 ? 'Review' : 'Reviews'}`
                  : 'Reviews'}
              </Text>
            }
            labelPosition="left"
          />

          <ReviewList
            reviews={sessionReviews}
            loading={sessionRLoading}
            error={reviewError}
            isDark={isDark}
            emptyTitle="No Reviews Yet"
            emptyMessage="Be the first to leave a review for this session."
          />

        </Stack>
      </Container>

      {/* ── Review Modal ── */}
      <ReviewModal
        opened={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          // Refresh reviews after modal closes
          if (sessionId) loadSessionReviews(sessionId);
        }}
        session={session}
        currentUserId={currentUserId}
        isDark={isDark}
      />
    </Box>
  );
};

export default SessionReviewPage;
