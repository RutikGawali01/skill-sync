/**
 * ReviewSummary.jsx
 * ─────────────────
 * Displays average rating + rating distribution bar chart.
 * Inspired by Airbnb/Amazon review summary sections.
 *
 * Props:
 *   averageRating      - number (0-5)
 *   totalReviews       - number
 *   ratingDistribution - { 5: count, 4: count, 3: count, 2: count, 1: count }
 *   isDark             - boolean
 */

import {
  Box, Group, Stack, Text, Progress,
} from '@mantine/core';
import { IconStarFilled } from '@tabler/icons-react';
import RatingStars from './RatingStars';

const ReviewSummary = ({
  averageRating = 0,
  totalReviews = 0,
  ratingDistribution = {},
  isDark = false,
}) => {
  const maxCount = Math.max(...Object.values(ratingDistribution), 1);

  const cardBg     = isDark ? 'rgba(15,17,30,0.85)' : '#ffffff';
  const cardBorder = isDark ? 'rgba(139,92,246,0.12)' : 'rgba(0,0,0,0.06)';

  return (
    <Box
      id="review-summary"
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: 16,
        padding: '1.5rem',
        boxShadow: isDark
          ? '0 2px 12px rgba(0,0,0,0.3)'
          : '0 1px 8px rgba(0,0,0,0.04)',
      }}
    >
      <Text size="xs" fw={600} c="dimmed" mb="md" style={{ letterSpacing: '1px', textTransform: 'uppercase' }}>
        Rating Overview
      </Text>

      <Group gap="xl" align="flex-start" wrap="wrap">
        {/* Left: Big average + stars */}
        <Stack align="center" gap={4} style={{ minWidth: 100 }}>
          <Text
            fw={800}
            style={{
              fontSize: '2.5rem',
              lineHeight: 1,
              color: isDark ? '#e2e8f0' : '#1e293b',
            }}
          >
            {averageRating > 0 ? averageRating.toFixed(1) : '—'}
          </Text>
          <RatingStars rating={averageRating} size={18} />
          <Text size="xs" c="dimmed" mt={2}>
            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </Text>
        </Stack>

        {/* Right: Distribution bars */}
        <Stack gap={6} style={{ flex: 1, minWidth: 160 }}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count   = ratingDistribution[star] || 0;
            const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

            return (
              <Group key={star} gap="xs" align="center" wrap="nowrap">
                <Group gap={3} wrap="nowrap" style={{ minWidth: 32 }}>
                  <Text size="xs" fw={600} style={{ color: isDark ? '#cbd5e1' : '#475569' }}>
                    {star}
                  </Text>
                  <IconStarFilled size={11} color="#f59e0b" />
                </Group>
                <Progress
                  value={percent}
                  size={8}
                  radius="xl"
                  color={
                    star >= 4 ? 'green' :
                    star === 3 ? 'yellow' : 'red'
                  }
                  style={{ flex: 1 }}
                  styles={{
                    root: {
                      background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    },
                  }}
                />
                <Text
                  size="xs"
                  c="dimmed"
                  style={{ minWidth: 20, textAlign: 'right' }}
                >
                  {count}
                </Text>
              </Group>
            );
          })}
        </Stack>
      </Group>
    </Box>
  );
};

export default ReviewSummary;
