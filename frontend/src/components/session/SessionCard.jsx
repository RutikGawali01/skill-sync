/**
 * SessionCard.jsx
 * ───────────────
 * Production-grade session card with clear visual differentiation
 * between INCOMING (you are the provider/mentor) and OUTGOING
 * (you are the requester/student) sessions.
 *
 * Visual Design:
 *   INCOMING (Teaching):  Teal accent, "↓ Incoming Request" badge
 *   OUTGOING (Learning):  Violet accent, "↑ You Requested" badge
 *
 * Information hierarchy (top-to-bottom):
 *   1. Direction badge + Status + Mode
 *   2. Skill name (large, prominent) + category
 *   3. Role subtitle ("You're teaching" / "You're learning")
 *   4. Partner card (who you're meeting)
 *   5. Schedule bar (date, time, duration)
 *   6. Message preview
 *   7. Action buttons + view detail
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MessageSquare,
  ArrowRight,
  BookOpen,
  ArrowDownLeft,
  ArrowUpRight,
  GraduationCap,
  Presentation,
  Tag,
} from 'lucide-react';
import SessionStatusBadge from './SessionStatusBadge';
import SessionActionButtons from './SessionActionButtons';
import dayjs from 'dayjs';

// ── Direction-based design tokens ─────────────────────────────────────────────
const DIRECTION_STYLES = {
  incoming: {
    badge:         'Incoming Request',
    BadgeIcon:     ArrowDownLeft,
    subtitle:      "You're teaching",
    RoleIcon:      Presentation,
    partnerRole:   'Student',
    accentText:    'text-teal-600 dark:text-teal-400',
    badgeBg:       'bg-teal-50 dark:bg-teal-950/50',
    badgeText:     'text-teal-700 dark:text-teal-400',
    badgeBorder:   'border-teal-200 dark:border-teal-800/50',
    avatarGrad:    'from-teal-500 to-emerald-600',
    hoverShadow:   'hover:shadow-[0_12px_32px_-8px_rgba(20,184,166,0.15)] dark:hover:shadow-[0_12px_32px_-8px_rgba(20,184,166,0.08)]',
    hoverBorder:   'hover:border-teal-200/60 dark:hover:border-teal-900/40',
    topAccent:     'bg-gradient-to-r from-teal-500 to-emerald-500',
    skillBg:       'bg-teal-50 dark:bg-teal-950/30',
    skillBorder:   'border-teal-100 dark:border-teal-900/30',
    durationBg:    'bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400',
    viewColor:     'text-teal-500 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300',
  },
  outgoing: {
    badge:         'You Requested',
    BadgeIcon:     ArrowUpRight,
    subtitle:      "You're learning",
    RoleIcon:      GraduationCap,
    partnerRole:   'Mentor',
    accentText:    'text-violet-600 dark:text-violet-400',
    badgeBg:       'bg-violet-50 dark:bg-violet-950/50',
    badgeText:     'text-violet-700 dark:text-violet-400',
    badgeBorder:   'border-violet-200 dark:border-violet-800/50',
    avatarGrad:    'from-violet-500 to-indigo-600',
    hoverShadow:   'hover:shadow-[0_12px_32px_-8px_rgba(124,58,237,0.15)] dark:hover:shadow-[0_12px_32px_-8px_rgba(124,58,237,0.08)]',
    hoverBorder:   'hover:border-violet-200/60 dark:hover:border-violet-900/40',
    topAccent:     'bg-gradient-to-r from-violet-500 to-indigo-500',
    skillBg:       'bg-violet-50 dark:bg-violet-950/30',
    skillBorder:   'border-violet-100 dark:border-violet-900/30',
    durationBg:    'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400',
    viewColor:     'text-violet-500 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300',
  },
};

const SessionCard = ({
  session,
  currentUserId,
  actionLoading,
  onAccept,
  onReject,
  onCancel,
  onComplete,
  index = 0,
}) => {
  const navigate = useNavigate();

  if (!session) return null;

  const {
    id,
    requester,
    provider,
    skill,
    skillName,
    status,
    startTime,
    endTime,
    message,
    mode,
  } = session;

  // Resolve skill info — backend may return nested skill object or flat skillName
  const resolvedSkillName = skillName || skill?.name || 'Session';
  const skillCategory     = skill?.category || null;

  // ── Direction detection ─────────────────────────────────────────────────────
  // Use loose equality (==) — provider.id is a number from Java, currentUserId may be a string
  const isProvider = provider?.id != null && currentUserId != null && provider.id == currentUserId;
  const direction  = isProvider ? 'incoming' : 'outgoing';
  const styles     = DIRECTION_STYLES[direction];
  const partner    = isProvider ? requester : provider;
  const partnerName    = partner?.name || partner?.email || 'Unknown User';
  const partnerInitial = partnerName.charAt(0).toUpperCase();
  const partnerPic     = partner?.profilePicUrl || partner?.profilePicture;

  // ── Format date/time ────────────────────────────────────────────────────────
  const startDate   = startTime ? dayjs(startTime) : null;
  const endDate     = endTime   ? dayjs(endTime)   : null;
  const dateDisplay = startDate ? startDate.format('ddd, MMM D') : '—';
  const timeDisplay = startDate && endDate
    ? `${startDate.format('h:mm A')} – ${endDate.format('h:mm A')}`
    : '—';

  const durationMins = startDate && endDate
    ? endDate.diff(startDate, 'minute')
    : null;
  const durationDisplay = durationMins
    ? durationMins >= 60
      ? `${Math.floor(durationMins / 60)}h ${durationMins % 60 ? `${durationMins % 60}m` : ''}`
      : `${durationMins}m`
    : null;

  const { BadgeIcon, RoleIcon } = styles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -3 }}
      className={`group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${styles.hoverShadow} ${styles.hoverBorder}`}
      onClick={() => navigate(`/sessions/${id}`)}
    >
      {/* ── Top accent stripe ── */}
      <div className={`h-1 ${styles.topAccent}`} />

      <div className="p-5">

        {/* ── Row 1: Direction badge + Status ── */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${styles.badgeBg} ${styles.badgeText} ${styles.badgeBorder}`}>
              <BadgeIcon className="w-3 h-3" />
              {styles.badge}
            </span>
            <SessionStatusBadge status={status} />
          </div>
          {mode && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wider shrink-0">
              {mode.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        {/* ── Row 2: Skill name (prominent) + category ── */}
        <div className={`p-3 rounded-xl border mb-3 ${styles.skillBg} ${styles.skillBorder}`}>
          <div className="flex items-start gap-2.5">
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${styles.avatarGrad} flex items-center justify-center shrink-0 mt-0.5`}>
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight mb-1">
                {resolvedSkillName}
              </h3>
              <div className="flex items-center gap-3 flex-wrap">
                {skillCategory && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                    <Tag className="w-2.5 h-2.5" />
                    {skillCategory.replace(/_/g, ' ')}
                  </span>
                )}
                <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${styles.accentText}`}>
                  <RoleIcon className="w-3 h-3" />
                  {styles.subtitle}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 3: Partner info ── */}
        <div className="flex items-center gap-3 mb-3">
          {partnerPic ? (
            <img
              src={partnerPic}
              alt={partnerName}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700 shrink-0"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${styles.avatarGrad} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
              {partnerInitial}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
              {partnerName}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              {styles.partnerRole}
            </p>
          </div>
        </div>

        {/* ── Row 4: Schedule bar ── */}
        <div className="flex items-center gap-2 mb-3 p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 font-medium">
            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            {dateDisplay}
          </div>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            {timeDisplay}
          </div>
          {durationDisplay && (
            <>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${styles.durationBg}`}>
                {durationDisplay}
              </span>
            </>
          )}
        </div>

        {/* ── Row 5: Message preview ── */}
        {message && (
          <div className="flex items-start gap-2 mb-3 p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <MessageSquare className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {message}
            </p>
          </div>
        )}

        {/* ── Row 6: Actions + View detail link ── */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
          <div onClick={(e) => e.stopPropagation()}>
            <SessionActionButtons
              session={session}
              currentUserId={currentUserId}
              actionLoading={actionLoading}
              onAccept={onAccept}
              onReject={onReject}
              onCancel={onCancel}
              onComplete={onComplete}
              compact
            />
          </div>

          <button
            className={`inline-flex items-center gap-1 text-xs font-medium ${styles.viewColor} transition-colors`}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/sessions/${id}`);
            }}
          >
            View Details
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SessionCard;
