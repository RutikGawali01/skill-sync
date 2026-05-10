/**
 * EmptyAvailabilityState.jsx
 * ──────────────────────────
 * Shown when a day has zero availability slots.
 * Lightweight, animated empty state with a subtle CTA.
 */

import { motion } from 'framer-motion';
import { CalendarOff } from 'lucide-react';

const EmptyAvailabilityState = ({ dayLabel, onAdd }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    className="flex items-center gap-3 py-3 px-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700"
  >
    <CalendarOff className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
    <span className="text-sm text-gray-400 dark:text-gray-500 italic">
      No availability set{dayLabel ? ` for ${dayLabel}` : ''}
    </span>
    {onAdd && (
      <button
        onClick={onAdd}
        className="ml-auto text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
      >
        + Add slot
      </button>
    )}
  </motion.div>
);

export default EmptyAvailabilityState;
