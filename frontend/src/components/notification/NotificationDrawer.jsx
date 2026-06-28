/**
 * NotificationDrawer.jsx
 * ──────────────────────
 * Slide-in notification panel shown when the bell icon is clicked.
 *
 * Features:
 *   - Animated slide from the right
 *   - Filters: All / Unread
 *   - Mark all as read CTA
 *   - Infinite scroll / load more
 *   - Empty states for both filters
 *   - Loading skeleton
 */

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, BellOff, CheckCheck, RefreshCw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import useNotifications from '../../hooks/useNotifications';
import NotificationCard from './NotificationCard';

const DrawerFilter = ({ active, label, count, onClick, isDark }) => (
  <button
    onClick={onClick}
    style={{
      padding:      '5px 14px',
      borderRadius: 8,
      border:       'none',
      cursor:       'pointer',
      fontSize:     '0.8rem',
      fontWeight:   active ? 600 : 400,
      transition:   'all 0.15s',
      background:   active
        ? 'linear-gradient(135deg, #7c3aed, #6366f1)'
        : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
      color: active ? '#fff' : (isDark ? '#94a3b8' : '#64748b'),
      boxShadow: active ? '0 2px 10px rgba(124,58,237,0.35)' : 'none',
    }}
  >
    {label}
    {count > 0 && (
      <span
        style={{
          marginLeft:   5,
          background:   active ? 'rgba(255,255,255,0.25)' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
          borderRadius: 10,
          padding:      '1px 6px',
          fontSize:     '0.7rem',
          fontWeight:   700,
        }}
      >
        {count}
      </span>
    )}
  </button>
);

const NotificationDrawer = ({ open, onClose }) => {
  const { isDark }         = useTheme();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const listRef             = useRef(null);

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

  // Load fresh page when drawer opens or filter changes
  useEffect(() => {
    if (open) {
      loadNotifications(unreadOnly);
    }
  }, [open, unreadOnly]);  // eslint-disable-line react-hooks/exhaustive-deps

  // ── Theme tokens ─────────────────────────────────────────────────────────────
  const bg      = isDark ? '#0f1120' : '#ffffff';
  const border  = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const overlay = 'rgba(0,0,0,0.45)';
  const header  = isDark ? '#e2e8f0' : '#1e293b';
  const subtext = isDark ? '#475569' : '#94a3b8';

  const displayList = unreadOnly ? unreadNotifications : notifications;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* ── Overlay ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position:  'fixed',
              inset:     0,
              zIndex:    400,
              background: overlay,
              backdropFilter: 'blur(2px)',
            }}
          />

          {/* ── Drawer panel ── */}
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            style={{
              position:   'fixed',
              top:        0,
              right:      0,
              bottom:     0,
              zIndex:     401,
              width:      'min(420px, 100vw)',
              background: bg,
              borderLeft: `1px solid ${border}`,
              display:    'flex',
              flexDirection: 'column',
              boxShadow:  '-8px 0 40px rgba(0,0,0,0.25)',
            }}
          >
            {/* ── Header ── */}
            <div
              style={{
                padding:      '18px 20px 14px',
                borderBottom: `1px solid ${border}`,
                flexShrink:   0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width:           32,
                      height:          32,
                      borderRadius:    9,
                      background:      'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(99,102,241,0.2))',
                      border:          '1px solid rgba(124,58,237,0.3)',
                      display:         'flex',
                      alignItems:      'center',
                      justifyContent:  'center',
                    }}
                  >
                    {/* Bell icon inline */}
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: header }}>Notifications</p>
                    {unreadCount > 0 && (
                      <p style={{ margin: 0, fontSize: '0.72rem', color: subtext }}>
                        {unreadCount} unread
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      title="Mark all as read"
                      style={{
                        display:         'flex',
                        alignItems:      'center',
                        gap:             4,
                        padding:         '5px 10px',
                        borderRadius:    8,
                        border:          `1px solid ${border}`,
                        background:      'transparent',
                        cursor:          'pointer',
                        fontSize:        '0.73rem',
                        fontWeight:      500,
                        color:           isDark ? '#94a3b8' : '#64748b',
                        transition:      'all 0.15s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <CheckCheck size={13} />
                      All read
                    </button>
                  )}

                  <button
                    onClick={onClose}
                    aria-label="Close notifications"
                    style={{
                      width:      30,
                      height:     30,
                      borderRadius: 8,
                      border:     'none',
                      background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                      cursor:     'pointer',
                      display:    'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color:      isDark ? '#94a3b8' : '#64748b',
                    }}
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* ── Filter tabs ── */}
              <div style={{ display: 'flex', gap: 6 }}>
                <DrawerFilter
                  active={!unreadOnly}
                  label="All"
                  count={notifications.length}
                  onClick={() => setUnreadOnly(false)}
                  isDark={isDark}
                />
                <DrawerFilter
                  active={unreadOnly}
                  label="Unread"
                  count={unreadCount}
                  onClick={() => setUnreadOnly(true)}
                  isDark={isDark}
                />
              </div>
            </div>

            {/* ── Notification list ── */}
            <div
              ref={listRef}
              style={{
                flex:       1,
                overflowY:  'auto',
                padding:    '12px 12px',
                display:    'flex',
                flexDirection: 'column',
                gap:        8,
              }}
            >
              {/* Loading skeleton */}
              {loading && displayList.length === 0 && (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height:       72,
                      borderRadius: 12,
                      background:   isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                      animation:    'pulse 1.5s ease-in-out infinite',
                    }}
                  />
                ))
              )}

              {/* Empty state */}
              {!loading && displayList.length === 0 && (
                <div
                  style={{
                    flex:           1,
                    display:        'flex',
                    flexDirection:  'column',
                    alignItems:     'center',
                    justifyContent: 'center',
                    gap:            12,
                    padding:        '60px 20px',
                    textAlign:      'center',
                  }}
                >
                  <div
                    style={{
                      width:           56,
                      height:          56,
                      borderRadius:    16,
                      background:      isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                      display:         'flex',
                      alignItems:      'center',
                      justifyContent:  'center',
                    }}
                  >
                    <BellOff size={24} color={isDark ? '#334155' : '#cbd5e1'} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: isDark ? '#475569' : '#94a3b8' }}>
                      {unreadOnly ? 'All caught up!' : 'No notifications yet'}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: isDark ? '#334155' : '#cbd5e1' }}>
                      {unreadOnly ? 'No unread notifications.' : 'Activity updates will appear here.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Notification cards */}
              <AnimatePresence mode="popLayout">
                {displayList.map((n) => (
                  <NotificationCard
                    key={n.id}
                    notification={n}
                    onMarkRead={markRead}
                    onDelete={deleteNotification}
                    compact
                  />
                ))}
              </AnimatePresence>

              {/* Load more */}
              {hasMore && !unreadOnly && (
                <button
                  onClick={loadMore}
                  disabled={loading}
                  style={{
                    width:        '100%',
                    padding:      '10px',
                    borderRadius: 10,
                    border:       `1px dashed ${border}`,
                    background:   'transparent',
                    cursor:       loading ? 'default' : 'pointer',
                    fontSize:     '0.78rem',
                    fontWeight:   500,
                    color:        isDark ? '#475569' : '#94a3b8',
                    display:      'flex',
                    alignItems:   'center',
                    justifyContent: 'center',
                    gap:          6,
                    transition:   'all 0.15s',
                  }}
                >
                  <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                  {loading ? 'Loading...' : 'Load more'}
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default NotificationDrawer;
