
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import AvailabilitySlotCard from './AvailabilitySlotCard';
import EmptyAvailabilityState from './EmptyAvailabilityState';

// Short labels for compact mobile display
const SHORT_DAY = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
  SUNDAY: 'Sun',
};

// Friendly display labels
const DAY_LABEL = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
};

// Color accent per day for visual variety
const DAY_ACCENT = {
  MONDAY: 'from-violet-500 to-indigo-500',
  TUESDAY: 'from-blue-500 to-cyan-500',
  WEDNESDAY: 'from-emerald-500 to-teal-500',
  THURSDAY: 'from-amber-500 to-orange-500',
  FRIDAY: 'from-pink-500 to-rose-500',
  SATURDAY: 'from-purple-500 to-fuchsia-500',
  SUNDAY: 'from-red-500 to-rose-500',
};

const DayAvailabilityRow = ({
  day,
  slots,
  onAddSlot,
  onEditSlot,
  onDeleteSlot,
  updatingId,
  deletingId,
}) => {
  const label = DAY_LABEL[day] ?? day;
  const shortLbl = SHORT_DAY[day] ?? day;
  const accent = DAY_ACCENT[day] ?? 'from-gray-500 to-gray-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col sm:flex-row gap-4 sm:gap-6 py-5 px-1 border-b border-gray-100 dark:border-gray-800/60 last:border-b-0"
    >
      {/* ── Day label ── */}
      <div className="flex items-center gap-3 sm:w-36 shrink-0">
        {/* Colored dot indicator */}
        <div
          className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${accent} shrink-0 ring-2 ring-white dark:ring-gray-900`}
        />
        <div>
          {/* Full label on desktop, short on mobile */}
          <span className="hidden sm:inline text-sm font-bold text-gray-800 dark:text-white">
            {label}
          </span>
          <span className="sm:hidden text-sm font-bold text-gray-800 dark:text-white">
            {shortLbl}
          </span>
          {/* Slot count hint */}
          <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-tight mt-0.5">
            {slots.length === 0
              ? 'No slots'
              : `${slots.length} slot${slots.length > 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* ── Slots area ── */}
      <div className="flex-1 flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {slots.length === 0 ? (
            <EmptyAvailabilityState
              key="empty"
              dayLabel={label}
              onAdd={() => onAddSlot(day)}
            />
          ) : (
            slots.map((slot) => (
              <AvailabilitySlotCard
                key={slot.id}
                slot={slot}
                onEdit={onEditSlot}
                onDelete={onDeleteSlot}
                isUpdating={updatingId === slot.id}
                isDeleting={deletingId === slot.id}
              />
            ))
          )}
        </AnimatePresence>

        {/* Add slot button — always visible if slots exist */}
        {slots.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onAddSlot(day)}
            className="mt-1 self-start flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 px-3 py-1.5 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add slot
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default DayAvailabilityRow;
