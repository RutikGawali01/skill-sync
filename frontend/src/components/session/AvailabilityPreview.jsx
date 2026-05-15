/**
 * AvailabilityPreview.jsx
 * ───────────────────────
 * Compact, reusable availability schedule display.
 * Used in both skill cards (mini preview) and the booking modal (full list).
 *
 * Props:
 *   slots       — AvailabilityDTO[] from the backend
 *   compact     — boolean (true for skill card, false for modal)
 *   loading     — boolean (show skeleton)
 *   maxSlots    — number of slots to show before "+N more"
 */

import { Clock, CalendarDays } from 'lucide-react';
import { Skeleton } from '@mantine/core';
import {
  sortSlotsByDay,
  formatTimeCompact,
  DAY_SHORT_LABEL,
} from '../../utils/availabilityUtils';

// ── Skeleton ──────────────────────────────────────────────────────────────────
const AvailabilitySkeleton = ({ compact }) => (
  <div className={`flex flex-col gap-1.5 ${compact ? '' : 'gap-2'}`}>
    {Array.from({ length: compact ? 2 : 3 }).map((_, i) => (
      <Skeleton key={i} height={compact ? 18 : 28} radius={6} />
    ))}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const AvailabilityPreview = ({
  slots = [],
  compact = false,
  loading = false,
  maxSlots = 3,
}) => {
  if (loading) return <AvailabilitySkeleton compact={compact} />;

  if (!Array.isArray(slots) || slots.length === 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 italic">
        <CalendarDays className="w-3 h-3 shrink-0" />
        No availability set
      </div>
    );
  }

  const sorted     = sortSlotsByDay(slots);
  const displayed  = sorted.slice(0, maxSlots);
  const remaining  = slots.length - maxSlots;

  // ── Compact mode (skill card) ─────────────────────────────────────────────
  if (compact) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          Available
        </span>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {displayed.map((slot, i) => (
            <span
              key={slot.id ?? i}
              className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400"
            >
              <Clock className="w-2.5 h-2.5 shrink-0 text-violet-400" />
              <span className="font-semibold text-gray-600 dark:text-gray-300">
                {DAY_SHORT_LABEL[slot.day] ?? slot.day}
              </span>
              <span>
                {formatTimeCompact(slot.startTime)} – {formatTimeCompact(slot.endTime)}
              </span>
            </span>
          ))}
          {remaining > 0 && (
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              +{remaining} more
            </span>
          )}
        </div>
      </div>
    );
  }

  // ── Full mode (modal) ─────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
        Provider Availability
      </span>
      <div className="flex flex-col gap-1.5">
        {sorted.map((slot, i) => (
          <div
            key={slot.id ?? i}
            className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700"
          >
            <div className="w-6 h-6 rounded-md bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center shrink-0">
              <Clock className="w-3 h-3 text-violet-500" />
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[40px]">
              {DAY_SHORT_LABEL[slot.day] ?? slot.day}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatTimeCompact(slot.startTime)} – {formatTimeCompact(slot.endTime)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailabilityPreview;
