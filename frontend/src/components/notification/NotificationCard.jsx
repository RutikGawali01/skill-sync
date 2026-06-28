/**
 * NotificationCard.jsx
 * ────────────────────
 * A single notification item in the drawer or page list.
 *
 * Features:
 *   - Icon + color badge based on notification type
 *   - Unread indicator (pulsing dot)
 *   - Relative time display
 *   - Click to navigate + mark as read
 *   - Delete button
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import {
  getNotificationIcon,
  getNotificationColors,
  formatNotificationTime,
} from '../../utils/notificationUtils';
import { resolveNotificationRoute } from '../../utils/notificationNavigation';

const NotificationCard = ({ notification, onMarkRead, onDelete, compact = false }) => {
  const navigate         = useNavigate();
  const { isDark }       = useTheme();
  const { id, type, title, message, read, createdAt, entityType, entityId } = notification;

  const colors     = getNotificationColors(type, isDark);
  const IconComp   = getNotificationIcon(type);
  const timeStr    = formatNotificationTime(createdAt);
  const route      = resolveNotificationRoute(entityType, entityId);

  const handleClick = () => {
    if (!read && onMarkRead) {
      onMarkRead(id);
    }
    if (route) {
      navigate(route);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(id);
  };

  const cardBg     = isDark ? (read ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)') : (read ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.95)');
  const cardBorder = isDark ? (read ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.10)') : (read ? 'rgba(0,0,0,0.06)' : 'rgba(139,92,246,0.15)');
  const titleColor = isDark ? (read ? '#94a3b8' : '#e2e8f0') : (read ? '#64748b' : '#1e293b');
  const msgColor   = isDark ? '#64748b' : '#94a3b8';
  const timeColor  = isDark ? '#475569' : '#94a3b8';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
      style={{
        position:     'relative',
        display:      'flex',
        alignItems:   'flex-start',
        gap:          compact ? 10 : 12,
        padding:      compact ? '10px 12px' : '14px 16px',
        background:   cardBg,
        border:       `1px solid ${cardBorder}`,
        borderRadius: 12,
        cursor:       route ? 'pointer' : 'default',
        transition:   'all 0.15s ease',
        boxShadow:    read ? 'none' : (isDark ? '0 2px 12px rgba(0,0,0,0.25)' : '0 2px 12px rgba(139,92,246,0.08)'),
      }}
      whileHover={route ? { scale: 1.005, boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.35)' : '0 4px 20px rgba(139,92,246,0.12)' } : {}}
      whileTap={route ? { scale: 0.998 } : {}}
    >
      {/* ── Icon badge ── */}
      <div
        style={{
          flexShrink:      0,
          width:           compact ? 34 : 38,
          height:          compact ? 34 : 38,
          borderRadius:    10,
          background:      colors.bg,
          border:          `1px solid ${colors.border}`,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
        }}
      >
        <IconComp size={compact ? 16 : 18} color={colors.iconColor} />
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
          <p
            style={{
              margin:     0,
              fontSize:   compact ? '0.8rem' : '0.875rem',
              fontWeight: read ? 400 : 600,
              color:      titleColor,
              lineHeight: 1.4,
              flex:       1,
              minWidth:   0,
              overflow:   'hidden',
              display:    '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {title}
          </p>

          {/* ── Unread dot ── */}
          {!read && (
            <div
              style={{
                flexShrink: 0,
                width:      7,
                height:     7,
                borderRadius: '50%',
                background: '#8b5cf6',
                marginTop:  4,
                boxShadow:  '0 0 6px rgba(139,92,246,0.6)',
              }}
            />
          )}
        </div>

        {/* Message */}
        {message && (
          <p
            style={{
              margin:    '3px 0 0',
              fontSize:  compact ? '0.73rem' : '0.8rem',
              color:     msgColor,
              lineHeight: 1.4,
              overflow:  'hidden',
              display:   '-webkit-box',
              WebkitLineClamp: compact ? 1 : 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {message}
          </p>
        )}

        {/* Time */}
        <p
          style={{
            margin:   '4px 0 0',
            fontSize: '0.7rem',
            color:    timeColor,
          }}
        >
          {timeStr}
        </p>
      </div>

      {/* ── Delete button ── */}
      {onDelete && (
        <button
          onClick={handleDelete}
          aria-label="Delete notification"
          style={{
            flexShrink:      0,
            width:           24,
            height:          24,
            borderRadius:    6,
            border:          'none',
            background:      'transparent',
            cursor:          'pointer',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            color:           isDark ? '#475569' : '#94a3b8',
            transition:      'all 0.15s',
            padding:         0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)';
            e.currentTarget.style.color = '#ef4444';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = isDark ? '#475569' : '#94a3b8';
          }}
        >
          <X size={13} />
        </button>
      )}
    </motion.div>
  );
};

export default NotificationCard;
