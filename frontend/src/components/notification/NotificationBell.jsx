/**
 * NotificationBell.jsx
 * ────────────────────
 * The notification bell button for the Navbar.
 * Shows an animated unread badge and toggles the NotificationDrawer.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectUnreadCount } from '../../redux/notification/notificationSlice';
import NotificationDrawer from './NotificationDrawer';

const NotificationBell = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const unreadCount = useSelector(selectUnreadCount);

  const displayCount = unreadCount > 99 ? '99+' : unreadCount;
  const hasUnread    = unreadCount > 0;

  return (
    <>
      <motion.button
        id="notification-bell-btn"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setDrawerOpen(true)}
        aria-label={`Notifications${hasUnread ? `, ${unreadCount} unread` : ''}`}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100/80 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        {/* Bell icon — animates when new notification arrives */}
        <motion.div
          animate={hasUnread ? { rotate: [0, -8, 8, -5, 5, 0] } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Bell className="w-4 h-4" />
        </motion.div>

        {/* ── Unread badge ── */}
        <AnimatePresence>
          {hasUnread && (
            <motion.div
              key="badge"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              style={{
                position:       'absolute',
                top:            unreadCount > 9 ? -4 : -2,
                right:          unreadCount > 9 ? -4 : -2,
                minWidth:       unreadCount > 9 ? 18 : 14,
                height:         unreadCount > 9 ? 18 : 14,
                borderRadius:   9,
                background:     'linear-gradient(135deg, #7c3aed, #6366f1)',
                color:          '#fff',
                fontSize:       '0.6rem',
                fontWeight:     700,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                padding:        '0 3px',
                boxShadow:      '0 0 0 2px var(--badge-ring, #f9fafb)',
                lineHeight:     1,
              }}
              className="dark:[--badge-ring:#1f2937]"
            >
              {displayCount > 0 ? displayCount : null}
            </motion.div>
          )}

          {/* Fallback: simple dot for 0-unread indicator */}
          {!hasUnread && (
            <motion.span
              key="dot"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              style={{
                display: 'none',  // hide dot when no unread
              }}
            />
          )}
        </AnimatePresence>
      </motion.button>

      <NotificationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
};

export default NotificationBell;
