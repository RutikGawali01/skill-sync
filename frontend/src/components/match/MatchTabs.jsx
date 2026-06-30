/**
 * MatchTabs.jsx
 * ─────────────
 * Three-tab pill navigation for the enhanced Explore Skills page.
 * Visually identical to the existing SessionTabs component (same layout-id spring pill pattern).
 *
 * Tabs:
 *   recommended  — ⭐ Recommended (default)
 *   mutual       — 🔄 Mutual Exchange
 *   explore      — 🌍 Explore All (existing feed)
 *
 * Props:
 *   activeTab  — 'recommended' | 'mutual' | 'explore'
 *   onTabChange — (tab: string) => void
 *   counts     — { recommended?: number, mutual?: number }  optional count badges
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeftRight, Globe } from 'lucide-react';

export const MATCH_TABS = {
  RECOMMENDED: 'recommended',
  MUTUAL     : 'mutual',
  EXPLORE    : 'explore',
};

const TABS = [
  {
    key  : MATCH_TABS.RECOMMENDED,
    label: 'Recommended',
    emoji: '⭐',
    Icon : Sparkles,
  },
  {
    key  : MATCH_TABS.MUTUAL,
    label: 'Mutual Exchange',
    emoji: '🔄',
    Icon : ArrowLeftRight,
  },
  {
    key  : MATCH_TABS.EXPLORE,
    label: 'Explore All',
    emoji: '🌍',
    Icon : Globe,
  },
];

const MatchTabs = memo(({ activeTab, onTabChange, counts = {} }) => (
  <div
    role="tablist"
    aria-label="Explore Skills tabs"
    className="flex gap-1 p-1 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800"
  >
    {TABS.map((tab) => {
      const count    = counts[tab.key] ?? 0;
      const isActive = activeTab === tab.key;
      const Icon     = tab.Icon;

      return (
        <button
          key={tab.key}
          role="tab"
          aria-selected={isActive}
          aria-controls={`tabpanel-${tab.key}`}
          id={`tab-${tab.key}`}
          onClick={() => onTabChange(tab.key)}
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex-1 justify-center ${
            isActive
              ? 'text-violet-700 dark:text-violet-300 font-semibold'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60'
          }`}
        >
          {/* Active background spring-animated pill */}
          {isActive && (
            <motion.div
              layoutId="match-tab-pill"
              className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}

          <span className="relative flex items-center gap-2">
            <span className="text-base leading-none hidden sm:inline">{tab.emoji}</span>
            <Icon className="w-4 h-4 shrink-0 sm:hidden" />
            <span className="hidden sm:inline">{tab.label}</span>
            <Icon className="w-4 h-4 shrink-0 hidden xs:inline sm:hidden" />
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
));

MatchTabs.displayName = 'MatchTabs';

export default MatchTabs;
