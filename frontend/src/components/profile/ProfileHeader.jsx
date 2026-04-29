/**
 * ProfileHeader.jsx
 * ─────────────────
 * Displays the user's avatar, name, email (read-only), rating ⭐ (read-only),
 * completed sessions (read-only), and the Edit / Cancel action buttons.
 *
 * Props:
 *   profile    : UserProfileResponseDTO
 *   isEditing  : boolean
 *   onEdit     : () => void
 *   onCancel   : () => void
 *   isDark     : boolean
 */

import {
  Avatar, Badge, Button, Group, Stack, Text, Box, Skeleton,
  ActionIcon, Tooltip,
} from '@mantine/core';
import {
  IconEdit, IconStar, IconCircleDashedCheck, IconX,
  IconMapPin, IconClock, IconAward,
} from '@tabler/icons-react';

// ── Trust badge helper ───────────────────────────────────────────────────────
const getTrustBadge = (rating) => {
  if (rating >= 4.5) return { label: 'Top Mentor 🏆', color: 'yellow' };
  if (rating >= 4.0) return { label: 'Trusted ✅', color: 'teal' };
  if (rating >= 3.0) return { label: 'Active 🔵', color: 'blue' };
  return { label: 'New Member 🌱', color: 'gray' };
};

// ── Stat pill ────────────────────────────────────────────────────────────────
const StatPill = ({ icon: Icon, label, value, color = '#8b5cf6', isDark }) => (
  <Box
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 14px',
      borderRadius: 20,
      background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
    }}
  >
    <Icon size={14} color={color} />
    <Text size="sm" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{label}:</Text>
    <Text size="sm" fw={700} style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>{value}</Text>
  </Box>
);

// ── Skeleton loader ──────────────────────────────────────────────────────────
export const ProfileHeaderSkeleton = ({ isDark }) => (
  <Box
    style={{
      background: isDark
        ? 'linear-gradient(135deg, #1a1b2e 0%, #16213e 60%, #0f3460 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 60%, #dbeafe 100%)',
      borderRadius: 20,
      padding: '2rem 2.5rem',
      border: isDark ? '1px solid rgba(139,92,246,0.2)' : '1px solid rgba(139,92,246,0.15)',
    }}
  >
    <Group align="flex-start" gap="xl" wrap="nowrap">
      <Skeleton circle height={110} />
      <Stack gap="sm" style={{ flex: 1 }}>
        <Skeleton height={28} width={200} radius="md" />
        <Skeleton height={16} width={160} radius="md" />
        <Skeleton height={16} width={280} radius="md" />
        <Skeleton height={14} width={220} radius="md" />
        <Group>
          <Skeleton height={28} width={120} radius="xl" />
          <Skeleton height={28} width={100} radius="xl" />
        </Group>
      </Stack>
      <Skeleton height={38} width={140} radius="md" />
    </Group>
  </Box>
);

// ── Component ────────────────────────────────────────────────────────────────
const ProfileHeader = ({ profile, isEditing, onEdit, onCancel, isDark }) => {
  const { name, email, profilePicUrl, rating, completedSessions, location, timezone } = profile;
  const trustBadge = getTrustBadge(rating ?? 0);

  const cardBg = isDark
    ? 'linear-gradient(135deg, #1a1b2e 0%, #16213e 60%, #0f3460 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 60%, #dbeafe 100%)';
  const border = isDark
    ? '1px solid rgba(139,92,246,0.25)'
    : '1px solid rgba(139,92,246,0.2)';
  const nameColor = isDark ? '#e2e8f0' : '#1e293b';
  const emailColor = isDark ? '#94a3b8' : '#64748b';
  const bioColor = isDark ? '#cbd5e1' : '#475569';

  return (
    <Box
      style={{
        background: cardBg,
        borderRadius: 20,
        padding: '2rem 2.5rem',
        border,
        boxShadow: isDark
          ? '0 8px 32px rgba(139,92,246,0.15)'
          : '0 8px 32px rgba(139,92,246,0.08)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Decorative glow blob */}
      <Box
        style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <Group align="flex-start" gap="xl" wrap="wrap">
        {/* ── Avatar ── */}
        <Box style={{ position: 'relative' }}>
          <Avatar
            src={profilePicUrl || null}
            alt={name}
            size={110}
            radius="50%"
            color="violet"
            style={{
              border: '3px solid rgba(139,92,246,0.6)',
              boxShadow: '0 0 20px rgba(139,92,246,0.4)',
              fontSize: '2.5rem',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {name?.charAt(0)?.toUpperCase()}
          </Avatar>

          {/* Online indicator */}
          <Box
            style={{
              position: 'absolute',
              bottom: 6,
              right: 6,
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: '#22c55e',
              border: `2px solid ${isDark ? '#1a1b2e' : '#f8fafc'}`,
              boxShadow: '0 0 8px rgba(34,197,94,0.6)',
            }}
          />
        </Box>

        {/* ── Identity ── */}
        <Stack gap={6} style={{ flex: 1, minWidth: 200 }}>
          <Group gap="sm" align="center">
            <Text fw={800} style={{ color: nameColor, fontSize: '1.6rem', letterSpacing: '-0.5px' }}>
              {name}
            </Text>
            <IconCircleDashedCheck size={22} color="#8b5cf6" />
          </Group>

          {/* Email — always read-only */}
          <Group gap={6} align="center">
            <Text size="sm" style={{ color: emailColor }}>
              {email}
            </Text>
            <Badge size="xs" variant="dot" color="gray" radius="sm">read-only</Badge>
          </Group>

          {/* Location & Timezone */}
          {(location || timezone) && (
            <Group gap="sm" wrap="wrap">
              {location && (
                <Group gap={4}>
                  <IconMapPin size={13} color={emailColor} />
                  <Text size="sm" style={{ color: bioColor }}>{location}</Text>
                </Group>
              )}
              {timezone && (
                <Group gap={4}>
                  <IconClock size={13} color={emailColor} />
                  <Text size="sm" style={{ color: bioColor }}>{timezone}</Text>
                </Group>
              )}
            </Group>
          )}

          {/* Trust badge + rating + sessions */}
          <Group gap="sm" mt={6} wrap="wrap">
            <Badge
              color={trustBadge.color}
              variant="light"
              size="md"
              radius="sm"
              leftSection={<IconStar size={12} />}
              style={{ fontWeight: 600 }}
            >
              {trustBadge.label}
            </Badge>

            {rating != null && (
              <StatPill
                icon={IconStar}
                label="Rating"
                value={`${Number(rating).toFixed(1)} / 5.0`}
                color="#f59e0b"
                isDark={isDark}
              />
            )}

            {completedSessions != null && (
              <StatPill
                icon={IconAward}
                label="Sessions"
                value={completedSessions}
                color="#22c55e"
                isDark={isDark}
              />
            )}
          </Group>
        </Stack>

        {/* ── Action Buttons ── */}
        <Group gap="sm" style={{ flexShrink: 0 }}>
          {isEditing ? (
            <Tooltip label="Cancel editing">
              <ActionIcon
                id="cancel-edit-btn"
                variant="light"
                color="gray"
                size="lg"
                radius="md"
                onClick={onCancel}
                style={{ border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)' }}
              >
                <IconX size={18} />
              </ActionIcon>
            </Tooltip>
          ) : (
            <Button
              id="edit-profile-btn"
              leftSection={<IconEdit size={16} />}
              onClick={onEdit}
              variant="gradient"
              gradient={{ from: '#7c3aed', to: '#4f46e5', deg: 135 }}
              radius="md"
              size="sm"
              style={{
                boxShadow: '0 4px 15px rgba(124,58,237,0.4)',
                fontWeight: 600,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              Edit Profile
            </Button>
          )}
        </Group>
      </Group>
    </Box>
  );
};

export default ProfileHeader;
