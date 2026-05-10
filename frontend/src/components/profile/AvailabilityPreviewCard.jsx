/**
 * AvailabilityPreviewCard.jsx
 * ───────────────────────────
 * Compact preview card for the user's weekly availability,
 * displayed on the Profile page.
 *
 * Behavior:
 *   - Fetches availability from Redux if not already loaded
 *   - Shows loading skeleton while fetching
 *   - Shows up to MAX_PREVIEW_SLOTS slot previews
 *   - Shows empty state if no slots exist
 *   - "Manage Availability" CTA navigates to /availability
 *
 * Reuses the global availability Redux slice — no duplicate API calls.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Text, Group, Stack, Button, Center, Skeleton,
} from '@mantine/core';
import {
  IconCalendarEvent,
  IconClock,
  IconArrowRight,
  IconCalendarOff,
} from '@tabler/icons-react';

import {
  fetchAvailability,
  selectAvailabilitySlots,
  selectAvailabilityLoading,
} from '../../redux/availabilitySlice';

// ── Constants ─────────────────────────────────────────────────────────────────

/** Max slot previews to show — keeps the card compact */
const MAX_PREVIEW_SLOTS = 3;

/** Day display labels */
const DAY_LABEL = {
  MONDAY:    'Monday',
  TUESDAY:   'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY:  'Thursday',
  FRIDAY:    'Friday',
  SATURDAY:  'Saturday',
  SUNDAY:    'Sunday',
};

/** Short day labels for the summary dots */
const SHORT_DAY = {
  MONDAY:    'Mon',
  TUESDAY:   'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY:  'Thu',
  FRIDAY:    'Fri',
  SATURDAY:  'Sat',
  SUNDAY:    'Sun',
};

/** Canonical day order */
const DAYS_ORDER = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY',
  'FRIDAY', 'SATURDAY', 'SUNDAY',
];

/**
 * Format "19:00" → "7 PM" (compact) or "7:30 PM" (with minutes)
 */
const formatTimeShort = (time24) => {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return m === 0 ? `${hour12} ${period}` : `${hour12}:${String(m).padStart(2, '0')} ${period}`;
};

// ── Skeleton ──────────────────────────────────────────────────────────────────

const PreviewSkeleton = ({ isDark }) => (
  <Box
    style={{
      background: isDark
        ? 'linear-gradient(135deg, rgba(26,27,46,0.9) 0%, rgba(15,22,60,0.9) 100%)'
        : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
      border: `1px solid ${isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.2)'}`,
      borderRadius: 18,
      padding: '1.5rem',
    }}
  >
    <Stack gap="md">
      <Group gap="sm">
        <Skeleton width={42} height={42} radius={12} />
        <Stack gap={4}>
          <Skeleton width={120} height={16} radius={4} />
          <Skeleton width={160} height={12} radius={4} />
        </Stack>
      </Group>
      <Skeleton width="60%" height={20} radius={6} />
      <Stack gap={8}>
        <Skeleton height={36} radius={10} />
        <Skeleton height={36} radius={10} />
      </Stack>
      <Skeleton height={38} radius={10} />
    </Stack>
  </Box>
);

// ── Empty State ───────────────────────────────────────────────────────────────

const EmptyState = ({ isDark, onManage }) => (
  <Center py="lg">
    <Stack align="center" gap="sm">
      <Box
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: isDark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.08)',
          border: `1px solid ${isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.15)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconCalendarOff size={28} color={isDark ? '#a78bfa' : '#8b5cf6'} />
      </Box>
      <Text fw={600} size="sm" style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>
        No availability added yet
      </Text>
      <Text size="xs" ta="center" style={{ color: isDark ? '#94a3b8' : '#64748b', maxWidth: 240 }}>
        Set your weekly schedule to get matched with skill exchange partners.
      </Text>
      <Button
        onClick={onManage}
        variant="light"
        color="violet"
        radius="xl"
        size="sm"
        rightSection={<IconArrowRight size={14} />}
        mt={4}
      >
        Set Availability
      </Button>
    </Stack>
  </Center>
);

// ── Main Component ────────────────────────────────────────────────────────────

const AvailabilityPreviewCard = ({ isDark }) => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const slots     = useSelector(selectAvailabilitySlots);
  const loading   = useSelector(selectAvailabilityLoading);
  const userId    = useSelector((state) => state.auth.user?.id);

  // Fetch availability if not already loaded (reuses global state)
  useEffect(() => {
    if (userId && slots.length === 0 && !loading) {
      dispatch(fetchAvailability(userId));
    }
  }, [dispatch, userId, slots.length, loading]);

  const handleManage = () => navigate('/availability');

  // Loading state
  if (loading) return <PreviewSkeleton isDark={isDark} />;

  // ── Computed data ─────────────────────────────────────────────────────────
  const activeDays = [...new Set(slots.map((s) => s.day))];
  const activeDaysSorted = DAYS_ORDER.filter((d) => activeDays.includes(d));

  // Pick the first N slots for preview, sorted by day order
  const sortedSlots = [...slots].sort(
    (a, b) => DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day),
  );
  const previewSlots = sortedSlots.slice(0, MAX_PREVIEW_SLOTS);
  const remainingCount = slots.length - MAX_PREVIEW_SLOTS;

  return (
    <Box
      id="availability-preview-card"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(26,27,46,0.9) 0%, rgba(15,22,60,0.9) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
        border: `1px solid ${isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.2)'}`,
        borderRadius: 18,
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isDark
          ? '0 4px 20px rgba(0,0,0,0.3)'
          : '0 4px 20px rgba(139,92,246,0.06)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = isDark
          ? '0 8px 30px rgba(139,92,246,0.15)'
          : '0 8px 30px rgba(139,92,246,0.1)';
        e.currentTarget.style.borderColor = isDark
          ? 'rgba(139,92,246,0.3)'
          : 'rgba(139,92,246,0.35)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = isDark
          ? '0 4px 20px rgba(0,0,0,0.3)'
          : '0 4px 20px rgba(139,92,246,0.06)';
        e.currentTarget.style.borderColor = isDark
          ? 'rgba(139,92,246,0.15)'
          : 'rgba(139,92,246,0.2)';
      }}
    >
      {/* Decorative corner glow */}
      <Box
        style={{
          position: 'absolute',
          top: -25,
          right: -25,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <Stack gap="md" style={{ position: 'relative', zIndex: 1 }}>
        {/* ── Card Header ── */}
        <Group gap="sm" align="flex-start">
          <Box
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'rgba(139,92,246,0.15)',
              border: '1px solid rgba(139,92,246,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <IconCalendarEvent size={22} color="#8b5cf6" />
          </Box>
          <Box>
            <Text fw={700} size="md" style={{ color: isDark ? '#e2e8f0' : '#1e293b', lineHeight: 1.3 }}>
              Availability
            </Text>
            <Text size="xs" style={{ color: isDark ? '#64748b' : '#94a3b8', marginTop: 2 }}>
              Your weekly learning schedule
            </Text>
          </Box>
        </Group>

        {/* ── Content ── */}
        {slots.length === 0 ? (
          <EmptyState isDark={isDark} onManage={handleManage} />
        ) : (
          <>
            {/* Active days summary */}
            <Group gap={6}>
              {DAYS_ORDER.map((day) => {
                const isActive = activeDays.includes(day);
                return (
                  <Box
                    key={day}
                    style={{
                      padding: '3px 10px',
                      borderRadius: 8,
                      background: isActive
                        ? (isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.1)')
                        : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
                      border: `1px solid ${isActive
                        ? (isDark ? 'rgba(139,92,246,0.35)' : 'rgba(139,92,246,0.25)')
                        : 'transparent'}`,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Text
                      size="xs"
                      fw={isActive ? 700 : 500}
                      style={{
                        color: isActive
                          ? (isDark ? '#a78bfa' : '#7c3aed')
                          : (isDark ? '#475569' : '#94a3b8'),
                      }}
                    >
                      {SHORT_DAY[day]}
                    </Text>
                  </Box>
                );
              })}
            </Group>

            {/* Slot previews */}
            <Stack gap={6}>
              {previewSlots.map((slot) => (
                <Group
                  key={slot.id}
                  gap="sm"
                  style={{
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
                  }}
                >
                  <IconClock size={14} color={isDark ? '#64748b' : '#94a3b8'} />
                  <Text size="xs" fw={600} style={{ color: isDark ? '#cbd5e1' : '#475569' }}>
                    {DAY_LABEL[slot.day] ?? slot.day}
                  </Text>
                  <Text size="xs" style={{ color: isDark ? '#94a3b8' : '#64748b', marginLeft: 'auto' }}>
                    {formatTimeShort(slot.startTime)} – {formatTimeShort(slot.endTime)}
                  </Text>
                </Group>
              ))}

              {/* Overflow indicator */}
              {remainingCount > 0 && (
                <Text size="xs" style={{ color: isDark ? '#64748b' : '#94a3b8', paddingLeft: 4 }}>
                  + {remainingCount} more slot{remainingCount > 1 ? 's' : ''}
                </Text>
              )}
            </Stack>

            {/* CTA Button */}
            <Button
              id="manage-availability-btn"
              onClick={handleManage}
              variant="light"
              color="violet"
              radius="xl"
              size="sm"
              fullWidth
              rightSection={<IconArrowRight size={14} />}
              styles={{
                root: {
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                  },
                },
              }}
            >
              Manage Availability
            </Button>
          </>
        )}
      </Stack>
    </Box>
  );
};

export default AvailabilityPreviewCard;
