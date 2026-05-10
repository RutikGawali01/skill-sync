/**
 * AvailabilitySlotCard.jsx
 * ────────────────────────
 * Individual time-slot chip with edit/delete actions.
 * Shows a loading spinner on the specific slot being updated or deleted.
 */

import { motion } from 'framer-motion';
import { Clock, Pencil, Trash2, Loader2 } from 'lucide-react';

/**
 * Format "19:00" → "7:00 PM"
 */
const formatTime = (time24) => {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
};

const AvailabilitySlotCard = ({
  slot,
  onEdit,
  onDelete,
  isUpdating,
  isDeleting,
}) => {
  const busy = isUpdating || isDeleting;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={`
        group relative flex items-center gap-3 px-4 py-2.5 rounded-xl
        bg-violet-50/60 dark:bg-violet-950/30
        border border-violet-100 dark:border-violet-900/40
        hover:border-violet-300 dark:hover:border-violet-700
        hover:shadow-md hover:shadow-violet-200/30 dark:hover:shadow-violet-900/20
        transition-all duration-200
        ${busy ? 'opacity-60 pointer-events-none' : ''}
      `}
    >
      {/* Time icon */}
      <Clock className="w-4 h-4 text-violet-500 dark:text-violet-400 shrink-0" />

      {/* Time range */}
      <span className="text-sm font-semibold text-violet-700 dark:text-violet-300 tracking-wide">
        {formatTime(slot.startTime)} — {formatTime(slot.endTime)}
      </span>

      {/* Action buttons — visible on hover */}
      <div className="ml-auto flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {busy ? (
          <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />
        ) : (
          <>
            <button
              id={`edit-slot-${slot.id}`}
              onClick={() => onEdit(slot)}
              className="p-1.5 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/50 text-violet-500 dark:text-violet-400 transition-colors"
              aria-label="Edit slot"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              id={`delete-slot-${slot.id}`}
              onClick={() => onDelete(slot)}
              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-red-400 hover:text-red-500 dark:text-red-500 dark:hover:text-red-400 transition-colors"
              aria-label="Delete slot"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default AvailabilitySlotCard;
