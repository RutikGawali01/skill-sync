/**
 * SessionDashboardPage.jsx
 * ────────────────────────
 * Main session management dashboard.
 *
 * Features:
 *   - Tab navigation (Pending / Upcoming / Completed / Cancelled)
 *   - Session card grid with filtering
 *   - Loading skeletons
 *   - Empty states per tab
 *   - Error state
 *   - Responsive layout
 *
 * Data flow:
 *   mount → dispatch(fetchMySessions())
 *         → Redux (sessions / loading / error)
 *         → Tab filters → SessionCard grid
 */

import { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { CalendarClock, AlertCircle } from 'lucide-react';

import useSessionActions from '../../hooks/useSessionActions';
import SessionTabs from '../../components/session/SessionTabs';
import SessionFilters from '../../components/session/SessionFilters';
import SessionCard from '../../components/session/SessionCard';
import EmptySessionState from '../../components/session/EmptySessionState';

// ── Skeleton Card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 animate-pulse flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <div className="w-20 h-5 rounded-full bg-gray-200 dark:bg-gray-700" />
      <div className="w-24 h-5 rounded-full bg-gray-200 dark:bg-gray-700" />
    </div>
    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3" />
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700" />
      <div className="flex-1 space-y-1">
        <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-28" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-16" />
      </div>
    </div>
    <div className="flex gap-3">
      <div className="h-3.5 bg-gray-100 dark:bg-gray-800 rounded w-24" />
      <div className="h-3.5 bg-gray-100 dark:bg-gray-800 rounded w-32" />
    </div>
    <div className="h-10 bg-gray-50 dark:bg-gray-800 rounded-xl" />
    <div className="flex justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
      <div className="flex gap-2">
        <div className="w-20 h-7 bg-gray-100 dark:bg-gray-800 rounded-md" />
        <div className="w-16 h-7 bg-gray-100 dark:bg-gray-800 rounded-md" />
      </div>
      <div className="w-20 h-4 bg-gray-100 dark:bg-gray-800 rounded" />
    </div>
  </div>
);

// ── Error Banner ──────────────────────────────────────────────────────────────
const ErrorBanner = ({ message, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-2xl p-5"
  >
    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
    <div className="flex-1">
      <p className="text-sm font-semibold text-red-700 dark:text-red-400">
        Failed to load sessions
      </p>
      <p className="text-xs text-red-500 dark:text-red-500 mt-0.5">
        {message ?? 'Could not connect to the server. Please try again later.'}
      </p>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
      >
        Retry
      </button>
    )}
  </motion.div>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const SessionDashboardPage = () => {
  const {
    filtered,
    counts,
    loading,
    error,
    activeTab,
    actionLoading,
    loadSessions,
    changeTab,
    acceptSession,
    rejectSession,
    cancelSession,
    completeSession,
  } = useSessionActions();

  const currentUser = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?.id;

  const [searchQuery, setSearchQuery] = useState('');

  // Fetch sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Client-side search filter
  const displayedSessions = useMemo(() => {
    if (!searchQuery.trim()) return filtered;
    const q = searchQuery.toLowerCase();
    return filtered.filter(
      (s) =>
        s.skillName?.toLowerCase().includes(q) ||
        s.requester?.name?.toLowerCase().includes(q) ||
        s.provider?.name?.toLowerCase().includes(q) ||
        s.message?.toLowerCase().includes(q)
    );
  }, [filtered, searchQuery]);

  return (
    <div className="min-h-[80vh] bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <CalendarClock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white">
                My Sessions
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage your learning sessions and requests
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Tabs + Search ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4 mb-8"
        >
          <SessionTabs
            activeTab={activeTab}
            counts={counts}
            onTabChange={changeTab}
          />

          <div className="flex items-center justify-between gap-4">
            <SessionFilters
              query={searchQuery}
              onQueryChange={setSearchQuery}
            />
            <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
              {displayedSessions.length} session{displayedSessions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </motion.div>

        {/* ── Content ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorBanner message={error} onRetry={loadSessions} />
        ) : displayedSessions.length === 0 ? (
          <EmptySessionState tab={activeTab} />
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {displayedSessions.map((session, i) => (
              <SessionCard
                key={session.id}
                session={session}
                currentUserId={currentUserId}
                actionLoading={actionLoading}
                onAccept={acceptSession}
                onReject={rejectSession}
                onCancel={cancelSession}
                onComplete={completeSession}
                index={i}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SessionDashboardPage;
