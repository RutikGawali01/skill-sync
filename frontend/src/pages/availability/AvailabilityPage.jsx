/**
 * AvailabilityPage.jsx
 * ────────────────────
 * Weekly Availability Scheduling page.
 *
 * Data flow:
 *   mount → dispatch(fetchAvailability(userId))
 *         → GET /api/availability/user/{userId}
 *         → Redux store (slots / loading / error)
 *         → UI renders weekly grid
 *
 * Features:
 *   - 7-day weekly grid with grouped slots
 *   - Add / Edit / Delete modals
 *   - Loading skeletons
 *   - Error handling with retry
 *   - Success/error toast notifications
 *   - Tips sidebar on desktop
 *   - Fully responsive
 */

import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { notifications } from '@mantine/notifications';
import {
  CalendarDays,
  CheckCircle2,
  Users,
  Zap,
  Clock,
  Plus,
  Sparkles,
} from 'lucide-react';

import AvailabilityGrid from '../../components/availability/AvailabilityGrid';
import AddAvailabilityModal from '../../components/availability/AddAvailabilityModal';
import EditAvailabilityModal from '../../components/availability/EditAvailabilityModal';

import {
  fetchAvailability,
  createAvailability,
  editAvailability,
  removeAvailability,
  selectAvailabilitySlots,
  selectAvailabilityLoading,
  selectAvailabilityCreating,
  selectAvailabilityUpdating,
  selectAvailabilityDeleting,
  selectAvailabilityError,
} from '../../redux/availabilitySlice';

// ── Tip items for the sidebar card ────────────────────────────────────────────
const TIPS = [
  {
    icon: Users,
    label: 'Better matches',
    desc: 'More availability means better skill matching',
  },
  {
    icon: CalendarDays,
    label: 'Easier scheduling',
    desc: 'Partners can see when you\'re free',
  },
  {
    icon: Zap,
    label: 'Faster session booking',
    desc: 'Reduce back-and-forth with clear slots',
  },
];

// ── Stats Bar ─────────────────────────────────────────────────────────────────
const StatsBar = ({ slots }) => {
  const totalSlots = slots.length;
  const daysWithSlots = new Set(slots.map((s) => s.day)).size;

  // Calculate total hours
  const totalMinutes = slots.reduce((acc, s) => {
    if (!s.startTime || !s.endTime) return acc;
    const [sh, sm] = s.startTime.split(':').map(Number);
    const [eh, em] = s.endTime.split(':').map(Number);
    return acc + (eh * 60 + em) - (sh * 60 + sm);
  }, 0);
  const totalHours = Math.round(totalMinutes / 60 * 10) / 10;

  const stats = [
    { label: 'Total Slots', value: totalSlots, icon: CalendarDays },
    { label: 'Active Days', value: `${daysWithSlots}/7`, icon: Clock },
    { label: 'Weekly Hours', value: `${totalHours}h`, icon: Sparkles },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="grid grid-cols-3 gap-3 mb-6"
    >
      {stats.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm"
        >
          <div className="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center shrink-0">
            <Icon className="w-4.5 h-4.5 text-violet-500 dark:text-violet-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              {value}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              {label}
            </p>
          </div>
        </div>
      ))}
    </motion.div>
  );
};

// ── Tips Sidebar Card ─────────────────────────────────────────────────────────
const TipsCard = () => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay: 0.3 }}
    className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 border border-violet-100 dark:border-violet-900/40 rounded-2xl p-6 shadow-sm"
  >
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
        <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
      </div>
      <h3 className="text-sm font-bold text-gray-800 dark:text-white">
        Why set availability?
      </h3>
    </div>

    <div className="flex flex-col gap-3.5">
      {TIPS.map(({ icon: Icon, label, desc }) => (
        <div key={label} className="flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-violet-500 dark:text-violet-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {label}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {desc}
            </p>
          </div>
        </div>
      ))}
    </div>

    {/* Decorative gradient bar */}
    <div className="mt-5 h-1 rounded-full bg-gradient-to-r from-violet-400 via-indigo-400 to-purple-400 opacity-40" />
  </motion.div>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const AvailabilityPage = () => {
  const dispatch = useDispatch();

  // Redux state
  const slots      = useSelector(selectAvailabilitySlots);
  const loading    = useSelector(selectAvailabilityLoading);
  const creating   = useSelector(selectAvailabilityCreating);
  const updatingId = useSelector(selectAvailabilityUpdating);
  const deletingId = useSelector(selectAvailabilityDeleting);
  const error      = useSelector(selectAvailabilityError);

  // Get userId from auth state
  const user   = useSelector((state) => state.auth.user);
  const userId = user?.id;

  // Modal state
  const [addModalOpen, setAddModalOpen]   = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [preselectedDay, setPreselectedDay] = useState('');
  const [editingSlot, setEditingSlot]     = useState(null);

  // ── Fetch on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (userId) {
      dispatch(fetchAvailability(userId));
    }
  }, [dispatch, userId]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleRetry = useCallback(() => {
    if (userId) dispatch(fetchAvailability(userId));
  }, [dispatch, userId]);

  /** Open Add modal, optionally pre-selecting a day */
  const handleOpenAdd = useCallback((day) => {
    setPreselectedDay(day || '');
    setAddModalOpen(true);
  }, []);

  /** Submit new slot */
  const handleAddSubmit = useCallback(
    async (payload) => {
      if (!userId) return;
      try {
        await dispatch(
          createAvailability({ userId, payload }),
        ).unwrap();
        setAddModalOpen(false);
        notifications.show({
          title: 'Slot Added',
          message: `Availability added for ${payload.day.charAt(0) + payload.day.slice(1).toLowerCase()}`,
          color: 'green',
          icon: <CheckCircle2 className="w-4 h-4" />,
          autoClose: 3000,
        });
      } catch (err) {
        notifications.show({
          title: 'Failed to add slot',
          message: typeof err === 'string' ? err : 'Something went wrong. Please try again.',
          color: 'red',
          autoClose: 5000,
        });
      }
    },
    [dispatch, userId],
  );

  /** Open Edit modal with existing slot data */
  const handleOpenEdit = useCallback((slot) => {
    setEditingSlot(slot);
    setEditModalOpen(true);
  }, []);

  /** Submit updated slot */
  const handleEditSubmit = useCallback(
    async ({ availabilityId, payload }) => {
      if (!userId) return;
      try {
        await dispatch(
          editAvailability({ userId, availabilityId, payload }),
        ).unwrap();
        setEditModalOpen(false);
        setEditingSlot(null);
        notifications.show({
          title: 'Slot Updated',
          message: 'Your availability has been updated successfully.',
          color: 'blue',
          icon: <CheckCircle2 className="w-4 h-4" />,
          autoClose: 3000,
        });
      } catch (err) {
        notifications.show({
          title: 'Failed to update slot',
          message: typeof err === 'string' ? err : 'Something went wrong. Please try again.',
          color: 'red',
          autoClose: 5000,
        });
      }
    },
    [dispatch, userId],
  );

  /** Delete a slot with confirmation */
  const handleDelete = useCallback(
    async (slot) => {
      if (!userId) return;
      // Simple confirmation
      const confirmed = window.confirm(
        `Delete this availability slot? This cannot be undone.`,
      );
      if (!confirmed) return;

      try {
        await dispatch(
          removeAvailability({ userId, availabilityId: slot.id }),
        ).unwrap();
        notifications.show({
          title: 'Slot Deleted',
          message: 'Availability slot has been removed.',
          color: 'orange',
          autoClose: 3000,
        });
      } catch (err) {
        notifications.show({
          title: 'Failed to delete slot',
          message: typeof err === 'string' ? err : 'Something went wrong. Please try again.',
          color: 'red',
          autoClose: 5000,
        });
      }
    },
    [dispatch, userId],
  );

  return (
    <div className="min-h-[80vh] bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <CalendarDays className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white">
                  Weekly Availability
                </h1>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base ml-[52px]">
                Set your recurring weekly schedule for skill exchange sessions.
              </p>
            </div>

            {/* Desktop: Add Slot CTA */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleOpenAdd('')}
              className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-violet-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Slot
            </motion.button>
          </div>
        </motion.div>

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          {/* Left: Grid */}
          <div>
            {/* Stats bar — only show when loaded and has slots */}
            {!loading && !error && slots.length > 0 && (
              <StatsBar slots={slots} />
            )}

            <AvailabilityGrid
              slots={slots}
              loading={loading}
              error={error}
              onAddSlot={handleOpenAdd}
              onEditSlot={handleOpenEdit}
              onDeleteSlot={handleDelete}
              updatingId={updatingId}
              deletingId={deletingId}
              onRetry={handleRetry}
            />
          </div>

          {/* Right: Tips sidebar (desktop only) */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <TipsCard />
            </div>
          </div>
        </div>

        {/* ── Mobile Tips Card ── */}
        <div className="lg:hidden mt-8">
          <TipsCard />
        </div>
      </div>

      {/* ── Modals ── */}
      <AddAvailabilityModal
        opened={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddSubmit}
        preselectedDay={preselectedDay}
        creating={creating}
      />

      <EditAvailabilityModal
        opened={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingSlot(null);
        }}
        onSubmit={handleEditSubmit}
        slot={editingSlot}
        updating={!!updatingId}
      />
    </div>
  );
};

export default AvailabilityPage;
