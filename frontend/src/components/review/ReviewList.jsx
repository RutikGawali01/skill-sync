/**
 * ReviewList.jsx
 * ──────────────
 * Displays a list of ReviewCard components with:
 *   - Loading skeleton state
 *   - Empty state
 *   - Error state
 *   - Pagination-ready architecture
 *
 * Props:
 *   reviews  - ReviewDTO[]
 *   loading  - boolean
 *   error    - string | null
 *   isDark   - boolean
 *   emptyTitle   - custom empty state title
 *   emptyMessage - custom empty state message
 */

import {
  Stack, Box, Text, Group, Skeleton, Center,
} from '@mantine/core';
import {
  IconMoodEmpty, IconAlertTriangle,
} from '@tabler/icons-react';
import ReviewCard from './ReviewCard';

// ── Skeleton ──────────────────────────────────────────────────────────────────
const ReviewSkeleton = ({ isDark }) => (
  <Box
    style={{
      background: isDark ? 'rgba(15,17,30,0.85)' : '#ffffff',
      border: `1px solid ${isDark ? 'rgba(139,92,246,0.12)' : 'rgba(0,0,0,0.06)'}`,
      borderRadius: 16,
      padding: '1.25rem 1.5rem',
    }}
  >
    <Group gap="sm" mb="sm">
      <Skeleton height={44} circle />
      <Stack gap={6} style={{ flex: 1 }}>
        <Skeleton height={14} width="40%" radius="md" />
        <Skeleton height={12} width="60%" radius="md" />
      </Stack>
    </Group>
    <Skeleton height={60} radius="md" mb="sm" />
    <Skeleton height={12} width="30%" radius="md" />
  </Box>
);

export const ReviewListSkeleton = ({ isDark, count = 3 }) => (
  <Stack gap="md">
    {Array.from({ length: count }, (_, i) => (
      <ReviewSkeleton key={i} isDark={isDark} />
    ))}
  </Stack>
);

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyReviewState = ({ isDark, title, message }) => (
  <Center py="xl">
    <Stack align="center" gap="sm">
      <Box
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: isDark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconMoodEmpty size={28} color="#8b5cf6" style={{ opacity: 0.6 }} />
      </Box>
      <Text fw={600} size="sm" style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>
        {title || 'No Reviews Yet'}
      </Text>
      <Text size="xs" c="dimmed" ta="center" maw={280}>
        {message || 'Reviews will appear here once sessions are completed and rated.'}
      </Text>
    </Stack>
  </Center>
);

// ── Error State ───────────────────────────────────────────────────────────────
const ErrorState = ({ isDark, error }) => (
  <Box
    style={{
      background: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.05)',
      border: `1px solid ${isDark ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.2)'}`,
      borderRadius: 12,
      padding: '1.25rem 1.5rem',
      textAlign: 'center',
    }}
  >
    <Group justify="center" gap="xs" mb={6}>
      <IconAlertTriangle size={18} color="#f87171" />
      <Text fw={600} size="sm" style={{ color: '#f87171' }}>
        Failed to load reviews
      </Text>
    </Group>
    <Text size="xs" c="dimmed">
      {error || 'Something went wrong. Please try again later.'}
    </Text>
  </Box>
);

// ── Main Component ────────────────────────────────────────────────────────────
const ReviewList = ({
  reviews = [],
  loading = false,
  error = null,
  isDark = false,
  emptyTitle,
  emptyMessage,
}) => {
  if (loading) {
    return <ReviewListSkeleton isDark={isDark} />;
  }

  if (error) {
    return <ErrorState isDark={isDark} error={error} />;
  }

  if (!reviews.length) {
    return (
      <EmptyReviewState
        isDark={isDark}
        title={emptyTitle}
        message={emptyMessage}
      />
    );
  }

  return (
    <Stack gap="md">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} isDark={isDark} />
      ))}
    </Stack>
  );
};

export default ReviewList;
