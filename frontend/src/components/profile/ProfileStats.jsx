/**
 * ProfileStats.jsx
 * ────────────────
 * Displays key platform stats as animated counter cards.
 *
 * Stats shown (all read-only — set by the system):
 *   ⭐ Rating
 *   📚 Completed Sessions → "People You've Taught"
 *   📥 Requested Sessions
 *   📤 Provided Sessions
 *
 * Props:
 *   profile : ProfileDTO
 */

import { useEffect, useRef, useState } from 'react';
import { SimpleGrid, Box, Text, Group, Stack, Skeleton } from '@mantine/core';
import {
  IconStar,
  IconSchool,
  IconDownload,
  IconUpload,
} from '@tabler/icons-react';

// ── Animated counter hook ────────────────────────────────────────────────────
const useCountUp = (target, duration = 1200) => {
  const [count, setCount] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (target == null || target === 0) {
      setCount(0);
      return;
    }
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return count;
};

// ── Single stat card ─────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, subLabel, value, color, suffix = '' }) => {
  const animatedValue = useCountUp(value);

  return (
    <Box
      id={`stat-card-${label.toLowerCase().replace(/\s+/g, '-')}`}
      style={{
        background: 'linear-gradient(145deg, rgba(26,27,46,0.9) 0%, rgba(15,22,60,0.9) 100%)',
        border: `1px solid ${color}33`,
        borderRadius: 16,
        padding: '1.5rem',
        cursor: 'default',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 12px 30px ${color}30`;
        e.currentTarget.style.borderColor = `${color}66`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = `${color}33`;
      }}
    >
      {/* Decorative corner glow */}
      <Box
        style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}25 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <Stack gap={10}>
        {/* Icon */}
        <Box
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: `${color}18`,
            border: `1px solid ${color}33`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={22} color={color} />
        </Box>

        {/* Value */}
        <Group gap={4} align="baseline">
          <Text
            fw={800}
            style={{
              fontSize: '2rem',
              color: color,
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {value === null || value === undefined ? '—' : (
              // For rating (float), show decimal; for counters, animate
              typeof value === 'number' && !Number.isInteger(value)
                ? Number(value).toFixed(1)
                : animatedValue
            )}
          </Text>
          {suffix && (
            <Text size="sm" style={{ color: '#94a3b8' }}>{suffix}</Text>
          )}
        </Group>

        {/* Label */}
        <Stack gap={2}>
          <Text fw={600} size="sm" style={{ color: '#e2e8f0' }}>
            {label}
          </Text>
          {subLabel && (
            <Text size="xs" style={{ color: '#64748b' }}>
              {subLabel}
            </Text>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

// ── Skeleton ─────────────────────────────────────────────────────────────────
export const ProfileStatsSkeleton = () => (
  <SimpleGrid cols={{ base: 2, sm: 2, md: 4 }} spacing="md">
    {[...Array(4)].map((_, i) => (
      <Skeleton key={i} height={150} radius={16} />
    ))}
  </SimpleGrid>
);

// ── Main Component ───────────────────────────────────────────────────────────
const ProfileStats = ({ profile }) => {
  const stats = [
    {
      icon: IconStar,
      label: 'Trust Rating',
      subLabel: 'Community score',
      value: profile.rating ?? null,
      color: '#f59e0b',
      suffix: '/ 5',
    },
    {
      icon: IconSchool,
      label: 'People Taught',
      subLabel: `${profile.completedSessions ?? 0} completed sessions`,
      value: profile.completedSessions ?? 0,
      color: '#8b5cf6',
    },
    {
      icon: IconDownload,
      label: 'Skills Requested',
      subLabel: 'Learning sessions requested',
      value: profile.requestedSessions ?? 0,
      color: '#06b6d4',
    },
    {
      icon: IconUpload,
      label: 'Sessions Provided',
      subLabel: 'You taught others',
      value: profile.providedSessions ?? 0,
      color: '#22c55e',
    },
  ];

  return (
    <SimpleGrid cols={{ base: 2, sm: 2, md: 4 }} spacing="md">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </SimpleGrid>
  );
};

export default ProfileStats;
