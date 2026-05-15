/**
 * SessionTabs.jsx
 * ───────────────
 * Tab navigation for the Session Dashboard.
 * Shows badge counts per status and handles tab switching.
 */

import { motion } from 'framer-motion';
import { Clock, CalendarCheck2, CheckCircle2, XCircle } from 'lucide-react';
import { SESSION_TABS } from '../../redux/session/sessionSlice';

// ── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  {
    key: SESSION_TABS.PENDING,
    label: 'Pending',
    icon: Clock,
    countKey: 'pending',
    accentColor: 'amber',
  },
  {
    key: SESSION_TABS.UPCOMING,
    label: 'Upcoming',
    icon: CalendarCheck2,
    countKey: 'upcoming',
    accentColor: 'emerald',
  },
  {
    key: SESSION_TABS.COMPLETED,
    label: 'Completed',
    icon: CheckCircle2,
    countKey: 'completed',
    accentColor: 'teal',
  },
  {
    key: SESSION_TABS.CANCELLED,
    label: 'Cancelled',
    icon: XCircle,
    countKey: 'cancelled',
    accentColor: 'gray',
  },
];

const SessionTabs = ({ activeTab, counts, onTabChange }) => {
  return (
    <div className="flex gap-1 p-1 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
      {TABS.map((tab) => {
        const Icon    = tab.icon;
        const count   = counts?.[tab.countKey] ?? 0;
        const isActive = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex-1 justify-center ${
              isActive
                ? 'text-violet-700 dark:text-violet-300 font-semibold'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60'
            }`}
          >
            {/* Active background pill */}
            {isActive && (
              <motion.div
                layoutId="session-tab-pill"
                className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}

            <span className="relative flex items-center gap-2">
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{tab.label}</span>
              {count > 0 && (
                <span
                  className={`min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold px-1 ${
                    isActive
                      ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default SessionTabs;
