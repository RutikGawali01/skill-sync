/**
 * ReviewCard.jsx
 * ──────────────
 * Elegant review card — inspired by LinkedIn recommendations / Airbnb reviews.
 *
 * Displays:
 *   - Reviewer name + avatar
 *   - Overall rating with stars
 *   - Individual dimension ratings (collapsed by default, expandable)
 *   - Feedback text
 *   - Session verified badge
 *   - Review date
 *
 * Props:
 *   review  - ReviewDTO object
 *   isDark  - boolean for theme-aware styling
 */

import { useState } from 'react';
import {
  Box, Group, Text, Badge, Collapse,
  UnstyledButton, Avatar, Stack, Divider,
} from '@mantine/core';
import {
  IconChevronDown, IconChevronUp,
  IconShieldCheck, IconMessage,
  IconBook, IconBulb, IconClock, IconMessageCircle,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import RatingStars from './RatingStars';

dayjs.extend(relativeTime);

// ── Rating dimensions metadata ────────────────────────────────────────────────
const DIMENSIONS = [
  { key: 'teachingRating',       label: 'Teaching',       icon: IconBook,          color: '#8b5cf6' },
  { key: 'communicationRating',  label: 'Communication',  icon: IconMessageCircle, color: '#06b6d4' },
  { key: 'punctualityRating',    label: 'Punctuality',    icon: IconClock,         color: '#10b981' },
  { key: 'knowledgeRating',      label: 'Knowledge',      icon: IconBulb,          color: '#f59e0b' },
];

const ReviewCard = ({ review, isDark = false }) => {
  const [expanded, setExpanded] = useState(false);

  if (!review) return null;

  const reviewerName = review.reviewerName || review.reviewer?.name || 'Anonymous User';
  const reviewerPic  = review.reviewerProfilePic || review.reviewer?.profilePicUrl;
  const skillName    = review.skillName || review.session?.skillName || review.session?.skill?.name || review.skill?.name;
  const initial      = reviewerName.charAt(0).toUpperCase();
  const dateDisplay  = review.createdAt ? dayjs(review.createdAt).fromNow() : '';

  // Theme-aware tokens
  const cardBg     = isDark ? 'rgba(15,17,30,0.85)' : '#ffffff';
  const cardBorder = isDark ? 'rgba(139,92,246,0.12)' : 'rgba(0,0,0,0.06)';
  const subtextC   = isDark ? '#94a3b8' : '#64748b';
  const feedbackBg = isDark ? 'rgba(139,92,246,0.06)' : 'rgba(139,92,246,0.03)';

  return (
    <Box
      id={`review-card-${review.id}`}
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: 16,
        padding: '1.25rem 1.5rem',
        transition: 'all 0.25s ease',
        boxShadow: isDark
          ? '0 2px 12px rgba(0,0,0,0.3)'
          : '0 1px 8px rgba(0,0,0,0.04)',
      }}
      className="review-card"
    >
      {/* ── Header: Avatar + Name + Rating + Date ── */}
      <Group justify="space-between" align="flex-start" wrap="nowrap" mb="sm">
        <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
          <Avatar
            src={reviewerPic}
            radius="xl"
            size={44}
            color="violet"
            style={{
              border: '2px solid',
              borderColor: isDark ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.15)',
            }}
          >
            {initial}
          </Avatar>
          <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
            <Group gap="xs" align="center" wrap="nowrap">
              <Text fw={600} size="sm" truncate style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>
                {reviewerName}
              </Text>
              {review.sessionId && (
                <Badge
                  size="xs"
                  variant="light"
                  color="teal"
                  leftSection={<IconShieldCheck size={10} />}
                  radius="sm"
                  style={{ flexShrink: 0 }}
                >
                  Verified
                </Badge>
              )}
              {skillName && (
                <Text size="xs" c="dimmed" truncate style={{ flexShrink: 1, maxWidth: '140px' }}>
                  for {skillName}
                </Text>
              )}
            </Group>
            <Group gap="xs" align="center">
              <RatingStars rating={review.overallRating || 0} size={14} showValue />
              {dateDisplay && (
                <Text size="xs" c="dimmed">
                  · {dateDisplay}
                </Text>
              )}
            </Group>
          </Stack>
        </Group>
      </Group>

      {/* ── Feedback ── */}
      {review.feedback && (
        <Box
          style={{
            background: feedbackBg,
            borderRadius: 10,
            padding: '0.75rem 1rem',
            marginBottom: expanded ? '0.75rem' : 0,
          }}
        >
          <Group gap={6} mb={4} align="center">
            <IconMessage size={13} color={subtextC} />
            <Text size="xs" fw={600} style={{ color: subtextC, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Feedback
            </Text>
          </Group>
          <Text
            size="sm"
            style={{
              color: isDark ? '#cbd5e1' : '#334155',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}
          >
            {review.feedback}
          </Text>
        </Box>
      )}

      {/* ── Expand / Collapse dimension ratings ── */}
      <UnstyledButton
        onClick={() => setExpanded((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          marginTop: '0.5rem',
          padding: '4px 0',
        }}
      >
        <Text size="xs" fw={500} style={{ color: '#8b5cf6' }}>
          {expanded ? 'Hide' : 'View'} detailed ratings
        </Text>
        {expanded ? (
          <IconChevronUp size={14} color="#8b5cf6" />
        ) : (
          <IconChevronDown size={14} color="#8b5cf6" />
        )}
      </UnstyledButton>

      <Collapse in={expanded}>
        <Divider
          my="xs"
          style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
        />
        <Stack gap="xs">
          {DIMENSIONS.map(({ key, label, icon: Icon, color }) => (
            <Group key={key} justify="space-between" align="center" px="xs">
              <Group gap={6} align="center">
                <Icon size={14} color={color} />
                <Text size="xs" fw={500} style={{ color: subtextC }}>
                  {label}
                </Text>
              </Group>
              <RatingStars rating={review[key] || 0} size={12} showValue />
            </Group>
          ))}
        </Stack>
      </Collapse>
    </Box>
  );
};

export default ReviewCard;
