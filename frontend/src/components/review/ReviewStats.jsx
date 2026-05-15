/**
 * ReviewStats.jsx
 * ───────────────
 * Displays aggregated review statistics in a compact grid.
 *
 * Shows:
 *   - Average teaching, communication, punctuality, knowledge ratings
 *   - Total reviews count
 *
 * Props:
 *   reviews - ReviewDTO[]
 *   isDark  - boolean
 */

import {
  Box, Group, Stack, Text, SimpleGrid, RingProgress,
} from '@mantine/core';
import {
  IconBook, IconBulb, IconClock, IconMessageCircle,
} from '@tabler/icons-react';

// ── Stat categories ───────────────────────────────────────────────────────────
const STAT_DIMS = [
  { key: 'teachingRating',      label: 'Teaching',      icon: IconBook,          color: '#8b5cf6', mantineColor: 'violet' },
  { key: 'communicationRating', label: 'Communication', icon: IconMessageCircle, color: '#06b6d4', mantineColor: 'cyan' },
  { key: 'punctualityRating',   label: 'Punctuality',   icon: IconClock,         color: '#10b981', mantineColor: 'teal' },
  { key: 'knowledgeRating',     label: 'Knowledge',     icon: IconBulb,          color: '#f59e0b', mantineColor: 'yellow' },
];

const ReviewStats = ({ reviews = [], isDark = false }) => {
  // Compute averages for each dimension
  const averages = STAT_DIMS.map(({ key, ...rest }) => {
    const total  = reviews.reduce((acc, r) => acc + (r[key] || 0), 0);
    const avg    = reviews.length ? total / reviews.length : 0;
    return { ...rest, key, average: Math.round(avg * 10) / 10 };
  });

  const cardBg     = isDark ? 'rgba(15,17,30,0.85)' : '#ffffff';
  const cardBorder = isDark ? 'rgba(139,92,246,0.12)' : 'rgba(0,0,0,0.06)';

  return (
    <Box
      id="review-stats"
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
        Dimension Breakdown
      </Text>

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        {averages.map(({ key, label, icon: Icon, color, mantineColor, average }) => (
          <Stack key={key} align="center" gap={6}>
            <RingProgress
              size={72}
              thickness={6}
              roundCaps
              sections={[{ value: (average / 5) * 100, color: mantineColor }]}
              label={
                <Text
                  ta="center"
                  fw={700}
                  size="sm"
                  style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}
                >
                  {average > 0 ? average.toFixed(1) : '—'}
                </Text>
              }
            />
            <Group gap={4} align="center">
              <Icon size={13} color={color} />
              <Text size="xs" fw={500} c="dimmed">
                {label}
              </Text>
            </Group>
          </Stack>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default ReviewStats;
