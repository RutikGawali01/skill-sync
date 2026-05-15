/**
 * SessionDetailsPage.jsx
 * ──────────────────────
 * Detailed view for a single session.
 * Fetched via GET /api/sessions/{sessionId} using the URL param.
 *
 * Displays:
 *   - Full session metadata
 *   - Requester + Provider cards
 *   - Timeline / status history
 *   - Action buttons (context-aware)
 *   - Message
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Clock,
  BookOpen,
  User,
  MessageSquare,
  AlertCircle,
  MapPin,
  ArrowDownLeft,
  ArrowUpRight,
  GraduationCap,
  Presentation,
} from 'lucide-react';
import { Divider } from '@mantine/core';
import dayjs from 'dayjs';

import useSessionActions from '../../hooks/useSessionActions';
import SessionStatusBadge from '../../components/session/SessionStatusBadge';
import SessionActionButtons from '../../components/session/SessionActionButtons';

// ── Skeleton ──────────────────────────────────────────────────────────────────
const DetailSkeleton = () => (
  <div className="max-w-3xl mx-auto animate-pulse space-y-6">
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40" />
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-24" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl" />
        <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl" />
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
      </div>
    </div>
  </div>
);

// ── Person Card ───────────────────────────────────────────────────────────────
const PersonCard = ({ person, role, isYou = false, accentGrad = 'from-violet-500 to-indigo-600' }) => {
  if (!person) return null;
  const name    = person.name || person.email || 'Unknown User';
  const initial = name.charAt(0).toUpperCase();
  const pic     = person.profilePicUrl || person.profilePicture;

  return (
    <div className={`flex items-center gap-3 p-3.5 rounded-xl border ${isYou ? 'bg-violet-50/50 dark:bg-violet-950/20 border-violet-200/50 dark:border-violet-800/30' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700'}`}>
      {pic ? (
        <img
          src={pic}
          alt={name}
          className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700 shrink-0"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      ) : (
        <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${accentGrad} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
          {initial}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
          {name} {isYou && <span className="text-xs font-normal text-gray-400">(You)</span>}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">
          {role}
        </p>
      </div>
    </div>
  );
};

// ── Info Row ──────────────────────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-2.5">
    <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-violet-500" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
        {value || '—'}
      </p>
    </div>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const SessionDetailsPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const {
    selected: session,
    detailLoading,
    error,
    actionLoading,
    loadSessionDetails,
    acceptSession,
    rejectSession,
    cancelSession,
    completeSession,
    clearDetail,
  } = useSessionActions();

  const currentUser   = useSelector((state) => state.auth.user);
  const currentUserId = currentUser?.id;

  // Fetch on mount
  useEffect(() => {
    if (sessionId) loadSessionDetails(sessionId);
    return () => clearDetail();
  }, [sessionId, loadSessionDetails, clearDetail]);

  // Direction detection — use loose equality (==) for number vs string comparison
  const isProvider = session?.provider?.id != null && currentUserId != null && session.provider.id == currentUserId;
  const direction  = isProvider ? 'incoming' : 'outgoing';

  // Direction-aware styles
  const dirStyles = {
    incoming: {
      badge: 'Incoming Request',
      BadgeIcon: ArrowDownLeft,
      subtitle: "You're teaching this skill",
      RoleIcon: Presentation,
      topAccent: 'bg-gradient-to-r from-teal-500 to-emerald-500',
      iconBg: 'from-teal-600 to-emerald-600',
      iconShadow: 'shadow-teal-500/25',
      badgeBg: 'bg-teal-50 dark:bg-teal-950/50',
      badgeText: 'text-teal-700 dark:text-teal-400',
      badgeBorder: 'border-teal-200 dark:border-teal-800/50',
      accentText: 'text-teal-600 dark:text-teal-400',
    },
    outgoing: {
      badge: 'You Requested',
      BadgeIcon: ArrowUpRight,
      subtitle: "You're learning this skill",
      RoleIcon: GraduationCap,
      topAccent: 'bg-gradient-to-r from-violet-600 to-indigo-600',
      iconBg: 'from-violet-600 to-indigo-600',
      iconShadow: 'shadow-violet-500/25',
      badgeBg: 'bg-violet-50 dark:bg-violet-950/50',
      badgeText: 'text-violet-700 dark:text-violet-400',
      badgeBorder: 'border-violet-200 dark:border-violet-800/50',
      accentText: 'text-violet-600 dark:text-violet-400',
    },
  };
  const ds = session ? dirStyles[direction] : dirStyles.outgoing;

  // Format helpers
  const startDate   = session?.startTime ? dayjs(session.startTime) : null;
  const endDate     = session?.endTime   ? dayjs(session.endTime)   : null;
  const dateDisplay = startDate ? startDate.format('dddd, MMMM D, YYYY') : '—';
  const timeDisplay = startDate && endDate
    ? `${startDate.format('h:mm A')} – ${endDate.format('h:mm A')}`
    : '—';
  const durationMins = startDate && endDate ? endDate.diff(startDate, 'minute') : null;
  const durationDisplay = durationMins
    ? durationMins >= 60
      ? `${Math.floor(durationMins / 60)}h ${durationMins % 60 ? `${durationMins % 60}m` : ''}`
      : `${durationMins} minutes`
    : null;

  return (
    <div className="min-h-[80vh] bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 py-20">

        {/* ── Back Button ── */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/sessions')}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sessions
        </motion.button>

        {/* ── Loading ── */}
        {detailLoading && <DetailSkeleton />}

        {/* ── Error ── */}
        {!detailLoading && error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-2xl p-5"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                Failed to load session
              </p>
              <p className="text-xs text-red-500 mt-0.5">
                {error}
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Session Detail ── */}
        {!detailLoading && !error && session && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Main card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">

              {/* Header with direction-aware gradient accent */}
              <div className={`h-1.5 ${ds.topAccent}`} />
              <div className="relative p-6 pb-4">

                {/* Direction badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${ds.badgeBg} ${ds.badgeText} ${ds.badgeBorder}`}>
                    <ds.BadgeIcon className="w-3.5 h-3.5" />
                    {ds.badge}
                  </span>
                  <SessionStatusBadge status={session.status} size="md" />
                </div>

                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ds.iconBg} flex items-center justify-center shadow-lg ${ds.iconShadow}`}>
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                        {session.skillName || session.skill?.name || 'Session'}
                      </h1>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <ds.RoleIcon className={`w-3.5 h-3.5 ${ds.accentText}`} />
                        <span className={`text-xs font-medium ${ds.accentText}`}>
                          {ds.subtitle}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Divider />

              {/* Body */}
              <div className="p-6 space-y-6">

                {/* ── People ── */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                    Participants
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <PersonCard
                      person={session.requester}
                      role="Requester (Student)"
                      isYou={!isProvider}
                      accentGrad={isProvider ? 'from-violet-500 to-indigo-600' : 'from-teal-500 to-emerald-600'}
                    />
                    <PersonCard
                      person={session.provider}
                      role="Provider (Mentor)"
                      isYou={isProvider}
                      accentGrad={isProvider ? 'from-teal-500 to-emerald-600' : 'from-violet-500 to-indigo-600'}
                    />
                  </div>
                </div>

                <Divider />

                {/* ── Schedule Info ── */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                    Schedule
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    <InfoRow icon={Calendar} label="Date" value={dateDisplay} />
                    <InfoRow icon={Clock} label="Time" value={timeDisplay} />
                    {durationDisplay && (
                      <InfoRow icon={Clock} label="Duration" value={durationDisplay} />
                    )}
                    <InfoRow icon={MapPin} label="Mode" value={session.mode?.replace(/_/g, ' ') || 'Direct Learning'} />
                  </div>
                </div>

                {/* ── Message ── */}
                {session.message && (
                  <>
                    <Divider />
                    <div>
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                        Message
                      </p>
                      <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                        <MessageSquare className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {session.message}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* ── Timestamps ── */}
                <Divider />
                <div className="flex flex-wrap gap-4 text-xs text-gray-400 dark:text-gray-500">
                  {session.createdAt && (
                    <span>Created: {dayjs(session.createdAt).format('MMM D, YYYY h:mm A')}</span>
                  )}
                  {session.updatedAt && (
                    <span>Updated: {dayjs(session.updatedAt).format('MMM D, YYYY h:mm A')}</span>
                  )}
                </div>

                {/* ── Actions ── */}
                <div className="flex items-center justify-end pt-2">
                  <SessionActionButtons
                    session={session}
                    currentUserId={currentUserId}
                    actionLoading={actionLoading}
                    onAccept={acceptSession}
                    onReject={rejectSession}
                    onCancel={cancelSession}
                    onComplete={completeSession}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SessionDetailsPage;
