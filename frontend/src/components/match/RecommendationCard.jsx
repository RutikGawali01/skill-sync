/**
 * RecommendationCard.jsx
 * ───────────────────────
 * Card for displaying a single RecommendationDTO from GET /api/matches/recommendations.
 * Results are already ranked by backend — display in the order received.
 *
 * Skill extraction strategy:
 *   Backend embeds skill names in reason messages:
 *     MATCHED_SKILL  → message: "Offers Java"  |  "Needs React"
 *     MUTUAL_EXCHANGE→ message: "Excellent Mutual Exchange: Offers Java & Wants React"
 *   We parse these to render actual skill name badges so the user can see
 *   exactly what the candidate offers and what they want to learn.
 *
 * Props:
 *   recommendation   — RecommendationDTO
 *   index            — number  (staggered animation delay)
 *   onViewDetails    — (recommendation) => void   opens MatchDetailsDrawer
 *   onRequestSession — (candidate) => void         opens RequestSessionModal
 */

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, Award, CalendarPlus, Eye, BookOpen, GraduationCap } from 'lucide-react';
import MatchScore from './MatchScore';
import RecommendationReasons from './RecommendationReasons';
import TrustBadge from './TrustBadge';

// ── Skill extraction from reason messages ─────────────────────────────────────

/**
 * Parses reason messages from the backend to extract "they offer" and "they want" skill lists.
 *
 * Backend message formats:
 *   MATCHED_SKILL   → "Offers Java"   |  "Needs React"
 *   MUTUAL_EXCHANGE → "Excellent Mutual Exchange: Offers Java, Python & Wants React"
 *
 * Returns { theyOffer: string[], theyWant: string[] }
 */
const extractSkillsFromReasons = (reasons) => {
  const theyOffer = [];
  const theyWant  = [];

  for (const reason of reasons) {
    const msg = reason?.message ?? '';

    if (reason.reasonType === 'MUTUAL_EXCHANGE') {
      // e.g. "Excellent Mutual Exchange: Offers Java, Python & Wants React"
      const offersMatch = msg.match(/Offers\s+(.+?)(?:\s*&\s*Wants|$)/i);
      const wantsMatch  = msg.match(/Wants\s+(.+?)$/i);

      if (offersMatch?.[1]) {
        offersMatch[1].split(',').map((s) => s.trim()).filter(Boolean).forEach((s) => theyOffer.push(s));
      }
      if (wantsMatch?.[1]) {
        wantsMatch[1].split(',').map((s) => s.trim()).filter(Boolean).forEach((s) => theyWant.push(s));
      }
    } else if (reason.reasonType === 'MATCHED_SKILL') {
      // e.g. "Offers Java"  or  "Needs React"
      const offerMatch = msg.match(/^Offers\s+(.+)$/i);
      const needMatch  = msg.match(/^Needs\s+(.+)$/i);

      if (offerMatch?.[1]) theyOffer.push(offerMatch[1].trim());
      if (needMatch?.[1])  theyWant.push(needMatch[1].trim());
    }
  }

  return {
    theyOffer: [...new Set(theyOffer)], // deduplicate
    theyWant : [...new Set(theyWant)],
  };
};

// ── Skill pill (inline, no external dep) ──────────────────────────────────────
const SkillPill = ({ name, variant }) => {
  const style = variant === 'offer'
    ? 'bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border-violet-100 dark:border-violet-900/50'
    : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900/50';

  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border ${style}`}>
      {name}
    </span>
  );
};

// ── Card ──────────────────────────────────────────────────────────────────────
const RecommendationCard = memo(({ recommendation, index, onViewDetails, onRequestSession }) => {
  const { candidate, matchScore, recommendationReason } = recommendation;

  const name              = candidate?.name ?? 'Unknown';
  const bio               = candidate?.bio;
  const profilePicUrl     = candidate?.profilePicUrl;
  const rating            = candidate?.rating ?? 0;
  const completedSessions = candidate?.completedSessions ?? 0;
  const initials          = name.charAt(0).toUpperCase();
  const isNewMentor       = rating === 0;

  const pct        = matchScore?.percentage ?? 0;
  const trustScore = matchScore?.breakdown?.trustScore ?? null;
  const reasons    = recommendationReason?.reasons ?? [];

  // Extract real skill names from reason messages
  const { theyOffer, theyWant } = useMemo(
    () => extractSkillsFromReasons(reasons),
    [reasons]
  );

  // Filter out skill reasons from the reason pills (they are shown as badges instead)
  const nonSkillReasons = useMemo(
    () => reasons.filter(
      (r) => r.reasonType !== 'MATCHED_SKILL' && r.reasonType !== 'MUTUAL_EXCHANGE'
    ),
    [reasons]
  );

  // Keep skill reasons only for the pill row (compact label, no message tooltip duplication)
  const hasSkillReason = reasons.some(
    (r) => r.reasonType === 'MATCHED_SKILL' || r.reasonType === 'MUTUAL_EXCHANGE'
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-[0_16px_36px_-8px_rgba(124,58,237,0.18)] transition-all duration-300 flex flex-col gap-3 cursor-pointer group"
    >
      {/* ── Header: avatar + name + score ring ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          {profilePicUrl ? (
            <img
              src={profilePicUrl}
              alt={name}
              className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-violet-100 dark:ring-violet-900/50"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              {name}
            </h3>
            {bio && (
              <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                {bio}
              </p>
            )}
          </div>
        </div>

        {/* Match Score Ring */}
        <div className="shrink-0">
          <MatchScore percentage={pct} size={52} strokeWidth={5} />
        </div>
      </div>

      {/* ── Trust Badge ── */}
      {trustScore != null && (
        <div className="flex items-center gap-2">
          <TrustBadge score={trustScore} compact />
        </div>
      )}

      {/* ── Skills Section ── */}
      {(theyOffer.length > 0 || theyWant.length > 0) && (
        <div className="border-t border-gray-100 dark:border-gray-800 pt-2.5 flex flex-col gap-2">

          {/* They Offer (skills they can teach you) — show up to 3, then +N more */}
          {theyOffer.length > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-1.5">
                <GraduationCap className="w-3 h-3 text-violet-500 shrink-0" />
                <span className="text-[10px] font-bold text-violet-500 dark:text-violet-400 uppercase tracking-wider">
                  They Teach
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {theyOffer.slice(0, 3).map((skill) => (
                  <SkillPill key={skill} name={skill} variant="offer" />
                ))}
                {theyOffer.length > 3 && (
                  <span className="text-[11px] font-semibold text-violet-400 dark:text-violet-500 self-center">
                    +{theyOffer.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* They Want (skills they want to learn — you can teach) — show up to 3, then +N more */}
          {theyWant.length > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-1.5">
                <BookOpen className="w-3 h-3 text-indigo-500 shrink-0" />
                <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">
                  They Want
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {theyWant.slice(0, 3).map((skill) => (
                  <SkillPill key={skill} name={skill} variant="want" />
                ))}
                {theyWant.length > 3 && (
                  <span className="text-[11px] font-semibold text-indigo-400 dark:text-indigo-500 self-center">
                    +{theyWant.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Non-skill Recommendation Reasons (availability, trust, rating, etc.) ── */}
      {nonSkillReasons.length > 0 && (
        <div className={theyOffer.length > 0 || theyWant.length > 0 ? '' : 'border-t border-gray-100 dark:border-gray-800 pt-2.5'}>
          <RecommendationReasons reasons={nonSkillReasons} compact />
        </div>
      )}

      {/* Fallback: show all reasons as pills if no skill names were extracted */}
      {theyOffer.length === 0 && theyWant.length === 0 && hasSkillReason && nonSkillReasons.length === 0 && (
        <div className="border-t border-gray-100 dark:border-gray-800 pt-2.5">
          <RecommendationReasons reasons={reasons} compact />
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
          onClick={() => onViewDetails?.(recommendation)}
          aria-label={`View details for ${name}`}
          className="flex-1 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 border border-gray-100 dark:border-gray-700"
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onRequestSession?.(candidate)}
          aria-label={`Request session with ${name}`}
          className="flex-1 py-2 bg-violet-50 dark:bg-violet-950/50 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-violet-600 dark:text-violet-400 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
        >
          <CalendarPlus className="w-3.5 h-3.5" />
          Request
        </motion.button>
      </div>
    </motion.div>
  );
});

RecommendationCard.displayName = 'RecommendationCard';

export default RecommendationCard;
