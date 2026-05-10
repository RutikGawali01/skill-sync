/**
 * AvailabilityGrid.jsx
 * ────────────────────
 * The main weekly grid container. Renders 7 DayAvailabilityRows,
 * grouping slots by day of week. Also renders loading skeletons
 * and the full-page error state.
 */

import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';
import DayAvailabilityRow from './DayAvailabilityRow';

// Canonical day order
const DAYS_OF_WEEK = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

// ── Skeleton row for loading state ────────────────────────────────────────────
const SkeletonRow = () => (
  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 py-5 px-1 border-b border-gray-100 dark:border-gray-800/60 animate-pulse">
    <div className="flex items-center gap-3 sm:w-36">
      <div className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-gray-700" />
      <div>
        <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="w-12 h-3 bg-gray-100 dark:bg-gray-800 rounded mt-1" />
      </div>
    </div>
    <div className="flex-1 flex flex-col gap-2">
      <div className="h-10 rounded-xl bg-gray-100 dark:bg-gray-800 w-52" />
      <div className="h-10 rounded-xl bg-gray-50 dark:bg-gray-800/60 w-44" />
    </div>
  </div>
);

// ── Error State ───────────────────────────────────────────────────────────────
const ErrorState = ({ message, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 text-center"
  >
    <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center mb-4">
      <AlertCircle className="w-7 h-7 text-red-500" />
    </div>
    <h3 className="text-base font-bold text-gray-800 dark:text-white mb-1">
      Failed to load availability
    </h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-5">
      {message ?? 'Could not connect to the server. Please try again later.'}
    </p>
    {onRetry && (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-violet-500/25 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </motion.button>
    )}
  </motion.div>
);

// ── Main Grid ─────────────────────────────────────────────────────────────────
const AvailabilityGrid = ({
  slots,
  loading,
  error,
  onAddSlot,
  onEditSlot,
  onDeleteSlot,
  updatingId,
  deletingId,
  onRetry,
}) => {
  // Group slots by day
  const slotsByDay = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = (slots ?? []).filter((s) => s.day === day);
    return acc;
  }, {});

  // Loading state
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6 shadow-sm">
        {Array.from({ length: 7 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6 shadow-sm">
        <ErrorState message={error} onRetry={onRetry} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6 shadow-sm"
    >
      {DAYS_OF_WEEK.map((day, i) => (
        <DayAvailabilityRow
          key={day}
          day={day}
          slots={slotsByDay[day]}
          onAddSlot={onAddSlot}
          onEditSlot={onEditSlot}
          onDeleteSlot={onDeleteSlot}
          updatingId={updatingId}
          deletingId={deletingId}
        />
      ))}
    </motion.div>
  );
};

export default AvailabilityGrid;
