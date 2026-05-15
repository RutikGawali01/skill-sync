/**
 * UserReviewsPage.jsx
 * ───────────────────
 * Full-page view of a user's reviews + trust profile.
 *
 * Layout (responsive):
 *   Desktop → LEFT: TrustScoreCard + ReviewStats | RIGHT: ReviewList
 *   Mobile  → Stacked vertically
 *
 * Data flow:
 *   1. Reads userId from the auth store (current user)
 *   2. Fetches trust score + reviews via useReview hook
 *   3. Renders dashboard layout
 */

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box, Container, Stack, Title, Group, Text,
  Grid, Divider, ActionIcon, Tooltip,
} from '@mantine/core';
import {
  IconStarsFilled, IconSun, IconMoon,
} from '@tabler/icons-react';

import { useTheme } from '../../context/ThemeContext';
import useReview from '../../hooks/useReview';
import TrustScoreCard from '../../components/review/TrustScoreCard';
import ReviewStats from '../../components/review/ReviewStats';
import ReviewSummary from '../../components/review/ReviewSummary';
import ReviewList from '../../components/review/ReviewList';

const UserReviewsPage = () => {
  const { isDark, toggleTheme } = useTheme();
  const currentUser   = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?.id;

  const {
    userReviews,
    reviewsLoading,
    reviewError,
    trustData,
    trustLoading,
    trustError,
    averageRating,
    ratingDistribution,
    loadUserReviews,
    loadTrustScore,
  } = useReview();

  // ── Fetch data on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    if (currentUserId) {
      loadUserReviews(currentUserId);
      loadTrustScore(currentUserId);
    }
  }, [currentUserId, loadUserReviews, loadTrustScore]);

  // ── Theme tokens ────────────────────────────────────────────────────────────
  const pageBg = isDark
    ? 'linear-gradient(180deg, #0d0f1c 0%, #0a0c1a 100%)'
    : 'linear-gradient(180deg, #f0f4ff 0%, #e8f0fe 100%)';
  const titleColor = isDark ? '#e2e8f0' : '#1e293b';
  const dividerLabelColor = isDark ? '#475569' : '#94a3b8';
  const dividerBorderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';

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
      <Container size="xl">
        <Stack gap="xl">

          {/* ── Page Header ── */}
          <Group justify="space-between" align="center">
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
                  transition: 'color 0.3s ease',
                }}
              >
                Reviews & Trust
              </Title>
            </Group>

            <Tooltip label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} position="left">
              <ActionIcon
                id="reviews-theme-toggle"
                onClick={toggleTheme}
                variant="light"
                color="violet"
                size="lg"
                radius="md"
                aria-label="Toggle theme"
              >
                {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
              </ActionIcon>
            </Tooltip>
          </Group>

          {/* ── Dashboard Grid ── */}
          <Grid gutter="xl">

            {/* ── LEFT SIDE: Trust + Stats ── */}
            <Grid.Col span={{ base: 12, md: 5, lg: 4 }}>
              <Stack gap="md">
                <TrustScoreCard
                  trustData={trustData}
                  loading={trustLoading}
                  error={trustError}
                  isDark={isDark}
                />

                {/* Review Stats (dimension breakdown) */}
                {!reviewsLoading && userReviews.length > 0 && (
                  <ReviewStats reviews={userReviews} isDark={isDark} />
                )}
              </Stack>
            </Grid.Col>

            {/* ── RIGHT SIDE: Summary + Review List ── */}
            <Grid.Col span={{ base: 12, md: 7, lg: 8 }}>
              <Stack gap="md">
                {/* Rating summary chart */}
                {!reviewsLoading && userReviews.length > 0 && (
                  <ReviewSummary
                    averageRating={averageRating}
                    totalReviews={userReviews.length}
                    ratingDistribution={ratingDistribution}
                    isDark={isDark}
                  />
                )}

                {/* Divider */}
                <Divider
                  label={
                    <Text
                      size="xs"
                      fw={600}
                      style={{ color: dividerLabelColor, letterSpacing: '1px', textTransform: 'uppercase' }}
                    >
                      {userReviews.length > 0
                        ? `${userReviews.length} ${userReviews.length === 1 ? 'Review' : 'Reviews'}`
                        : 'Reviews'}
                    </Text>
                  }
                  labelPosition="left"
                  styles={{ root: { borderColor: dividerBorderColor } }}
                />

                {/* Review list */}
                <ReviewList
                  reviews={userReviews}
                  loading={reviewsLoading}
                  error={reviewError}
                  isDark={isDark}
                />
              </Stack>
            </Grid.Col>
          </Grid>

        </Stack>
      </Container>
    </Box>
  );
};

export default UserReviewsPage;
