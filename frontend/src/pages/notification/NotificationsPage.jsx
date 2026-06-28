/**
 * NotificationsPage.jsx
 * ─────────────────────
 * Full-page notification center for /notifications route.
 *
 * Layout:
 *   - Page header with unread count badge
 *   - Filter bar: All / Unread
 *   - Stats row: total, unread, read counts
 *   - Notification list with load more
 *   - Empty states per filter
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Container, Box, Group, Stack, Title, Text, ActionIcon, Tooltip,
} from '@mantine/core';
import { IconBell, IconSun, IconMoon, IconChecks, IconRefresh } from '@tabler/icons-react';
import { useTheme } from '../../context/ThemeContext';
import useNotifications from '../../hooks/useNotifications';
import NotificationCard from '../../components/notification/NotificationCard';
import { BellOff } from 'lucide-react';

// ── Filter Tab ────────────────────────────────────────────────────────────────
const FilterTab = ({ active, label, count, onClick, isDark }) => (
  <button
    onClick={onClick}
    style={{
      padding:      '8px 20px',
      borderRadius: 10,
      border:       'none',
      cursor:       'pointer',
      fontSize:     '0.875rem',
      fontWeight:   active ? 600 : 500,
      transition:   'all 0.18s ease',
      background:   active
        ? 'linear-gradient(135deg, #7c3aed, #6366f1)'
        : 'transparent',
      color:        active ? '#fff' : (isDark ? '#64748b' : '#94a3b8'),
      boxShadow:    active ? '0 3px 14px rgba(124,58,237,0.35)' : 'none',
    }}
  >
    {label}
    {count > 0 && (
      <span
        style={{
          marginLeft:   7,
          background:   active ? 'rgba(255,255,255,0.25)' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
          color:        active ? '#fff' : (isDark ? '#64748b' : '#94a3b8'),
          borderRadius: 12,
          padding:      '2px 7px',
          fontSize:     '0.75rem',
          fontWeight:   700,
        }}
      >
        {count}
      </span>
    )}
  </button>
);

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color, isDark }) => (
  <div
    style={{
      flex:         1,
      padding:      '14px 18px',
      borderRadius: 12,
      background:   isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
      border:       `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
      textAlign:    'center',
    }}
  >
    <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color, lineHeight: 1.2 }}>{value}</p>
    <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: isDark ? '#475569' : '#94a3b8' }}>{label}</p>
  </div>
);

// ── Loading Skeleton ──────────────────────────────────────────────────────────
const SkeletonCard = ({ isDark }) => (
  <div
    style={{
      height:       80,
      borderRadius: 12,
      background:   isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
      border:       `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
    }}
  />
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const NotificationsPage = () => {
  const { isDark, toggleTheme } = useTheme();
  const [unreadOnly, setUnreadOnly] = useState(false);

  const {
    notifications,
    unreadNotifications,
    unreadCount,
    loading,
    hasMore,
    loadNotifications,
    loadMore,
    markRead,
    markAllRead,
    deleteNotification,
  } = useNotifications();

  // Load on mount and when filter changes
  useEffect(() => {
    loadNotifications(unreadOnly);
  }, [unreadOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Theme tokens ─────────────────────────────────────────────────────────────
  const pageBg    = isDark
    ? 'linear-gradient(180deg, #0d0f1c 0%, #0a0c1a 100%)'
    : 'linear-gradient(180deg, #f0f4ff 0%, #e8f0fe 100%)';
  const panelBg   = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)';
  const panelBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const titleColor  = isDark ? '#e2e8f0' : '#1e293b';
  const subColor    = isDark ? '#475569' : '#94a3b8';

  const displayList  = unreadOnly ? unreadNotifications : notifications;
  const totalCount   = notifications.length;
  const readCount    = totalCount - unreadCount;

  return (
    <Box
      style={{
        minHeight:     '100vh',
        background:    pageBg,
        paddingTop:    '5.5rem',
        paddingBottom: '4rem',
        transition:    'background 0.3s ease',
      }}
    >
      <Container size="xl">
        <Stack gap="xl">

          {/* ── Page Header ── */}
          <Group justify="space-between" align="center">
            <Group gap={10} align="center">
              <Box
                style={{
                  width:           36,
                  height:          36,
                  borderRadius:    10,
                  background:      'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(99,102,241,0.2))',
                  border:          '1px solid rgba(124,58,237,0.3)',
                  display:         'flex',
                  alignItems:      'center',
                  justifyContent:  'center',
                }}
              >
                <IconBell size={18} color="#7c3aed" />
              </Box>
              <div>
                <Title
                  order={1}
                  style={{
                    color:      titleColor,
                    fontSize:   '1.4rem',
                    fontWeight: 700,
                    letterSpacing: '-0.3px',
                    margin:     0,
                  }}
                >
                  Notifications
                </Title>
                {unreadCount > 0 && (
                  <Text size="xs" style={{ color: subColor, marginTop: 1 }}>
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </Text>
                )}
              </div>
            </Group>

            <Group gap={8}>
              {unreadCount > 0 && (
                <Tooltip label="Mark all as read" position="left">
                  <ActionIcon
                    id="mark-all-read-btn"
                    onClick={markAllRead}
                    variant="light"
                    color="violet"
                    size="lg"
                    radius="md"
                    aria-label="Mark all notifications as read"
                  >
                    <IconChecks size={18} />
                  </ActionIcon>
                </Tooltip>
              )}
              <Tooltip label="Refresh" position="left">
                <ActionIcon
                  id="notifications-refresh-btn"
                  onClick={() => loadNotifications(unreadOnly)}
                  variant="light"
                  color="gray"
                  size="lg"
                  radius="md"
                  aria-label="Refresh notifications"
                  disabled={loading}
                >
                  <IconRefresh size={18} className={loading ? 'animate-spin' : ''} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} position="left">
                <ActionIcon
                  id="notifications-theme-toggle"
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
          </Group>

          {/* ── Stats row ── */}
          <Group grow gap="md" style={{ maxWidth: 480 }}>
            <StatCard label="Total" value={totalCount} color={isDark ? '#e2e8f0' : '#1e293b'} isDark={isDark} />
            <StatCard label="Unread" value={unreadCount} color="#7c3aed" isDark={isDark} />
            <StatCard label="Read" value={Math.max(0, readCount)} color={isDark ? '#10b981' : '#059669'} isDark={isDark} />
          </Group>

          {/* ── Main Panel ── */}
          <Box
            style={{
              background:   panelBg,
              border:       `1px solid ${panelBorder}`,
              borderRadius: 16,
              overflow:     'hidden',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* ── Filter bar ── */}
            <div
              style={{
                padding:      '14px 20px',
                borderBottom: `1px solid ${panelBorder}`,
                display:      'flex',
                alignItems:   'center',
                gap:          4,
              }}
            >
              <FilterTab
                active={!unreadOnly}
                label="All"
                count={totalCount}
                onClick={() => setUnreadOnly(false)}
                isDark={isDark}
              />
              <FilterTab
                active={unreadOnly}
                label="Unread"
                count={unreadCount}
                onClick={() => setUnreadOnly(true)}
                isDark={isDark}
              />
            </div>

            {/* ── Notification list ── */}
            <div style={{ padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 200 }}>

              {/* Loading skeletons */}
              {loading && displayList.length === 0 && (
                <Stack gap={8}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} isDark={isDark} />
                  ))}
                </Stack>
              )}

              {/* Empty state */}
              {!loading && displayList.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display:        'flex',
                    flexDirection:  'column',
                    alignItems:     'center',
                    justifyContent: 'center',
                    padding:        '80px 40px',
                    gap:            16,
                    textAlign:      'center',
                  }}
                >
                  <div
                    style={{
                      width:          72,
                      height:         72,
                      borderRadius:   20,
                      background:     isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                      border:         `1px solid ${panelBorder}`,
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                    }}
                  >
                    <BellOff size={28} color={isDark ? '#334155' : '#cbd5e1'} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: titleColor }}>
                      {unreadOnly ? 'All caught up!' : 'No notifications yet'}
                    </p>
                    <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: subColor, maxWidth: 320 }}>
                      {unreadOnly
                        ? "You're all up to date. No unread notifications."
                        : 'When you receive session requests, reviews, or match updates, they\'ll appear here.'}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Notification cards */}
              <AnimatePresence mode="popLayout">
                {displayList.map((n) => (
                  <NotificationCard
                    key={n.id}
                    notification={n}
                    onMarkRead={markRead}
                    onDelete={deleteNotification}
                    compact={false}
                  />
                ))}
              </AnimatePresence>

              {/* Load more */}
              {hasMore && !unreadOnly && (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={loadMore}
                  disabled={loading}
                  style={{
                    marginTop:     8,
                    width:         '100%',
                    padding:       '12px',
                    borderRadius:  10,
                    border:        `1px dashed ${panelBorder}`,
                    background:    'transparent',
                    cursor:        loading ? 'default' : 'pointer',
                    fontSize:      '0.85rem',
                    fontWeight:    500,
                    color:         isDark ? '#475569' : '#94a3b8',
                    transition:    'all 0.15s',
                  }}
                >
                  {loading ? 'Loading more...' : 'Load more notifications'}
                </motion.button>
              )}
            </div>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default NotificationsPage;
