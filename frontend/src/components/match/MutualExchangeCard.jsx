/**
 * MutualExchangeCard.jsx
 * ──────────────────────
 * Card for displaying a single mutual MatchResponseDTO from GET /api/matches/mutual.
 * Shows the bidirectional skill exchange: You Teach → They Learn / They Teach → You Learn.
 *
 * Props:
 *   match            — MatchResponseDTO (matchType must be "MUTUAL")
 *   index            — number  (staggered animation delay)
 *   onViewDetails    — (match) => void   opens MatchDetailsDrawer
 *   onRequestSession — (candidate) => void opens RequestSessionModal
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Star, Award, ArrowDown, ArrowLeftRight, CalendarPlus, Eye } from 'lucide-react';
import SkillBadge from './SkillBadge';

const MutualExchangeCard = memo(({ match, index, onViewDetails, onRequestSession }) => {
  const { candidate, mutualMatch, score } = match;

  const name              = candidate?.name ?? 'Unknown';
  const bio               = candidate?.bio;
  const profilePicUrl     = candidate?.profilePicUrl;
  const rating            = candidate?.rating ?? 0;
  const completedSessions = candidate?.completedSessions ?? 0;
  const initials          = name.charAt(0).toUpperCase();
  const isNewMentor       = rating === 0;

  const exchangeSkills    = mutualMatch?.exchangeSkills ?? [];
  // Separate GIVE (you teach) and TAKE (you learn) skills
  const youTeach = exchangeSkills.filter((s) => s.direction === 'GIVE');
  const youLearn = exchangeSkills.filter((s) => s.direction === 'TAKE');

  // Backend sends score on 0–100 scale — do NOT multiply by 100
  const scoreLabel = score != null ? `${Math.round(score)}%` : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-900 border border-teal-100 dark:border-teal-900/40 rounded-2xl p-5 shadow-sm hover:shadow-[0_8px_30px_-4px_rgba(20,184,166,0.18)] transition-all duration-300 flex flex-col gap-3 cursor-pointer group"
    >
      {/* ── Header: avatar + name + compatibility badge ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          {profilePicUrl ? (
            <img
              src={profilePicUrl}
              alt={name}
              className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-teal-100 dark:ring-teal-900/50"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              {name}
            </h3>
            {bio && (
              <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                {bio}
              </p>
            )}
          </div>
        </div>

        {/* Exchange compatibility badge */}
        <div className="shrink-0 flex flex-col items-center gap-0.5">
          <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center border border-teal-100 dark:border-teal-900/50">
            <ArrowLeftRight className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          </div>
          {scoreLabel && (
            <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">
              {scoreLabel}
            </span>
          )}
        </div>
      </div>

      {/* ── Exchange Flow ── */}
      {(youTeach.length > 0 || youLearn.length > 0) && (
        <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex flex-col gap-2">
          {/* You Teach → They Learn */}
          {youTeach.length > 0 && (
            <div className="bg-violet-50/60 dark:bg-violet-950/20 rounded-xl px-3 py-2">
              <p className="text-[10px] font-semibold text-violet-500 dark:text-violet-400 uppercase tracking-wider mb-1.5">
                You Teach
              </p>
              <div className="flex flex-wrap gap-1">
                {youTeach.map((s, i) => (
                  <SkillBadge key={i} name={s.skillName} level={s.level} variant="give" />
                ))}
              </div>
            </div>
          )}

          {/* Arrow connector */}
          {youTeach.length > 0 && youLearn.length > 0 && (
            <div className="flex items-center justify-center">
              <ArrowDown className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
            </div>
          )}

          {/* They Teach → You Learn */}
          {youLearn.length > 0 && (
            <div className="bg-teal-50/60 dark:bg-teal-950/20 rounded-xl px-3 py-2">
              <p className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1.5">
                You Learn
              </p>
              <div className="flex flex-wrap gap-1">
                {youLearn.map((s, i) => (
                  <SkillBadge key={i} name={s.skillName} level={s.level} variant="take" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Rating + Sessions ── */}
      <div className="flex items-center gap-2.5 border-t border-gray-100 dark:border-gray-800 pt-2.5">
        {isNewMentor ? (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
            New Mentor
          </span>
        ) : (
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {rating.toFixed(1)}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
          <Award className="w-3 h-3 shrink-0" />
          <span>{completedSessions} sessions</span>
        </div>
      </div>

      {/* ── CTA Buttons ── */}
      <div className="flex gap-2 pt-1">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onViewDetails?.(match)}
          aria-label={`View exchange details with ${name}`}
          className="flex-1 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 border border-gray-100 dark:border-gray-700"
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onRequestSession?.(candidate)}
          aria-label={`Request exchange session with ${name}`}
          className="flex-1 py-2 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-600 dark:text-teal-400 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
        >
          <CalendarPlus className="w-3.5 h-3.5" />
          Exchange
        </motion.button>
      </div>
    </motion.div>
  );
});

MutualExchangeCard.displayName = 'MutualExchangeCard';

export default MutualExchangeCard;
