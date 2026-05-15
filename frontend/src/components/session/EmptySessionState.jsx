/**
 * EmptySessionState.jsx
 * ─────────────────────
 * Reusable empty state component for session tabs/lists.
 * Shows a contextual illustration and message based on the active tab.
 */

import { motion } from 'framer-motion';
import {
  Clock,
  CalendarCheck2,
  CheckCircle2,
  XCircle,
  CalendarPlus,
} from 'lucide-react';

// ── Tab → config ─────────────────────────────────────────────────────────────
const EMPTY_CONFIG = {
  PENDING: {
    icon: Clock,
    title: 'No pending requests',
    description: 'When someone requests a session with you, it will appear here.',
    gradient: 'from-amber-500 to-orange-500',
  },
  UPCOMING: {
    icon: CalendarCheck2,
    title: 'No upcoming sessions',
    description: 'Accept session requests or book a new one to see upcoming sessions.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  COMPLETED: {
    icon: CheckCircle2,
    title: 'No completed sessions yet',
    description: 'Complete your first session to start building your track record.',
    gradient: 'from-teal-500 to-cyan-500',
  },
  CANCELLED: {
    icon: XCircle,
    title: 'No cancelled sessions',
    description: 'Cancelled and rejected sessions will appear here.',
    gradient: 'from-gray-400 to-gray-500',
  },
};

const EmptySessionState = ({ tab = 'PENDING' }) => {
  const config = EMPTY_CONFIG[tab] ?? EMPTY_CONFIG.PENDING;
  const Icon   = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      {/* Icon container */}
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center mb-5 shadow-lg`}>
        <Icon className="w-8 h-8 text-white" />
      </div>

      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
        {config.title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm leading-relaxed">
        {config.description}
      </p>

      {/* Subtle CTA for Upcoming tab */}
      {tab === 'UPCOMING' && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => window.location.href = '/skills'}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-violet-500/25 transition-all"
        >
          <CalendarPlus className="w-4 h-4" />
          Browse Skills
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptySessionState;
