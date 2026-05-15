/**
 * TrustScoreCard.jsx
 * ──────────────────
 * Modern trust score dashboard card.
 *
 * Displays:
 *   - Trust Score with animated ring progress
 *   - Average Rating
 *   - Total Reviews
 *   - Completion Rate
 *   - Completed Sessions
 *   - Cancelled Sessions
 *
 * Props:
 *   trustData   - TrustScoreDTO | null
 *   loading     - boolean
 *   error       - string | null
 *   isDark      - boolean
 */

import {
  Box, Group, Stack, Text, RingProgress, Badge,
  SimpleGrid, Skeleton, ThemeIcon, Progress,
} from '@mantine/core';
import {
  IconShieldCheck, IconStar, IconMessageReport,
  IconChecks, IconX, IconTrendingUp,
} from '@tabler/icons-react';

// ── Stat Item ─────────────────────────────────────────────────────────────────
const StatItem = ({ icon: Icon, label, value, color, isDark }) => (
  <Box
    style={{
      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      borderRadius: 12,
      padding: '0.875rem 1rem',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
      transition: 'all 0.2s ease',
    }}
  >
    <Group gap="sm" align="center" wrap="nowrap">
      <ThemeIcon
        size={36}
        radius="md"
        variant="light"
        color={color}
        style={{ flexShrink: 0 }}
      >
        <Icon size={18} />
      </ThemeIcon>
      <Stack gap={1}>
        <Text size="xs" c="dimmed" fw={500}>
          {label}
        </Text>
        <Text fw={700} size="md" style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>
          {value}
        </Text>
      </Stack>
    </Group>
  </Box>
);

// ── Skeleton ──────────────────────────────────────────────────────────────────
export const TrustScoreSkeleton = ({ isDark }) => (
  <Box
    style={{
      background: isDark ? 'rgba(15,17,30,0.85)' : '#ffffff',
      border: `1px solid ${isDark ? 'rgba(139,92,246,0.12)' : 'rgba(0,0,0,0.06)'}`,
      borderRadius: 16,
      padding: '1.5rem',
    }}
  >
    <Group gap="md" mb="lg">
      <Skeleton height={100} circle />
      <Stack gap={8} style={{ flex: 1 }}>
        <Skeleton height={16} width="60%" radius="md" />
        <Skeleton height={12} width="40%" radius="md" />
        <Skeleton height={10} width="80%" radius="md" />
      </Stack>
    </Group>
    <SimpleGrid cols={2} spacing="sm">
      <Skeleton height={60} radius="md" />
      <Skeleton height={60} radius="md" />
      <Skeleton height={60} radius="md" />
      <Skeleton height={60} radius="md" />
    </SimpleGrid>
  </Box>
);

// ── Main Component ────────────────────────────────────────────────────────────
const TrustScoreCard = ({ trustData, loading = false, error = null, isDark = false }) => {
  const cardBg     = isDark ? 'rgba(15,17,30,0.85)' : '#ffffff';
  const cardBorder = isDark ? 'rgba(139,92,246,0.12)' : 'rgba(0,0,0,0.06)';

  if (loading) {
    return <TrustScoreSkeleton isDark={isDark} />;
  }

  if (error) {
    return (
      <Box
        style={{
          background: cardBg,
          border: `1px solid ${isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.15)'}`,
          borderRadius: 16,
          padding: '1.5rem',
          textAlign: 'center',
        }}
      >
        <Text size="sm" c="red" fw={500}>Failed to load trust score</Text>
        <Text size="xs" c="dimmed" mt={4}>{error}</Text>
      </Box>
    );
  }

  if (!trustData) {
    return (
      <Box
        style={{
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: 16,
          padding: '1.5rem',
          textAlign: 'center',
        }}
      >
        <IconShieldCheck size={32} color="#8b5cf6" style={{ opacity: 0.4, marginBottom: 8 }} />
        <Text size="sm" c="dimmed">No trust data available yet</Text>
      </Box>
    );
  }

  const {
    averageRating     = 0,
    totalReviews      = 0,
    completionRate    = 0,
    trustScore        = 0,
    completedSessions = 0,
    cancelledSessions = 0,
  } = trustData;

  // Trust tier badge
  const getTrustTier = (score) => {
    if (score >= 90) return { label: 'Excellent',     color: 'teal',   emoji: '🌟' };
    if (score >= 75) return { label: 'Very Good',     color: 'green',  emoji: '✨' };
    if (score >= 60) return { label: 'Good',          color: 'blue',   emoji: '👍' };
    if (score >= 40) return { label: 'Building Trust', color: 'yellow', emoji: '🔨' };
    return               { label: 'New Member',      color: 'gray',   emoji: '🌱' };
  };

  const tier = getTrustTier(trustScore);

  // Ring color based on trust score
  const ringColor =
    trustScore >= 80 ? 'teal' :
    trustScore >= 60 ? 'green' :
    trustScore >= 40 ? 'yellow' : 'red';

  return (
    <Box
      id="trust-score-card"
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: 16,
        padding: '1.5rem',
        boxShadow: isDark
          ? '0 4px 20px rgba(0,0,0,0.4)'
          : '0 2px 12px rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* ── Header ── */}
      <Group gap="xs" mb="lg" align="center">
        <IconShieldCheck size={18} color="#8b5cf6" />
        <Text size="xs" fw={600} c="dimmed" style={{ letterSpacing: '1px', textTransform: 'uppercase' }}>
          Trust Score
        </Text>
        <Badge size="xs" variant="light" color={tier.color} radius="sm">
          {tier.emoji} {tier.label}
        </Badge>
      </Group>

      {/* ── Score Ring + Summary ── */}
      <Group gap="lg" mb="lg" align="center" wrap="wrap" justify="center">
        <RingProgress
          size={110}
          thickness={10}
          roundCaps
          sections={[{ value: trustScore, color: ringColor }]}
          label={
            <Stack align="center" gap={0}>
              <Text fw={800} size="xl" style={{ color: isDark ? '#e2e8f0' : '#1e293b', lineHeight: 1 }}>
                {trustScore}
              </Text>
              <Text size="xs" c="dimmed" fw={500}>
                / 100
              </Text>
            </Stack>
          }
        />

        <Stack gap="xs" style={{ flex: 1, minWidth: 140 }}>
          {/* Completion Rate bar */}
          <Box>
            <Group justify="space-between" mb={4}>
              <Text size="xs" fw={500} c="dimmed">Completion Rate</Text>
              <Text size="xs" fw={600} style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>
                {completionRate.toFixed(0)}%
              </Text>
            </Group>
            <Progress
              value={completionRate}
              size={8}
              radius="xl"
              color={completionRate >= 80 ? 'teal' : completionRate >= 60 ? 'yellow' : 'red'}
              styles={{
                root: {
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                },
              }}
            />
          </Box>

          {/* Avg Rating bar */}
          <Box>
            <Group justify="space-between" mb={4}>
              <Text size="xs" fw={500} c="dimmed">Average Rating</Text>
              <Text size="xs" fw={600} style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>
                {averageRating > 0 ? `${averageRating.toFixed(1)} / 5.0` : '—'}
              </Text>
            </Group>
            <Progress
              value={(averageRating / 5) * 100}
              size={8}
              radius="xl"
              color="yellow"
              styles={{
                root: {
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                },
              }}
            />
          </Box>
        </Stack>
      </Group>

      {/* ── Stats Grid ── */}
      <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm">
        <StatItem
          icon={IconStar}
          label="Average Rating"
          value={averageRating > 0 ? averageRating.toFixed(1) : '—'}
          color="yellow"
          isDark={isDark}
        />
        <StatItem
          icon={IconMessageReport}
          label="Total Reviews"
          value={totalReviews}
          color="violet"
          isDark={isDark}
        />
        <StatItem
          icon={IconChecks}
          label="Completed"
          value={completedSessions}
          color="teal"
          isDark={isDark}
        />
        <StatItem
          icon={IconX}
          label="Cancelled"
          value={cancelledSessions}
          color="red"
          isDark={isDark}
        />
      </SimpleGrid>
    </Box>
  );
};

export default TrustScoreCard;
