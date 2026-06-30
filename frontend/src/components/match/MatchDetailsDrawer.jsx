/**
 * MatchDetailsDrawer.jsx
 * ──────────────────────
 * Centered Mantine Modal displaying full match details.
 * Opens when the user clicks "View" on any match card.
 *
 * Handles both:
 *   - RecommendationDTO (from /recommendations)
 *   - MatchResponseDTO  (from /mutual, matchType === "MUTUAL")
 *
 * Props:
 *   match            — RecommendationDTO | MatchResponseDTO | null
 *   opened           — boolean
 *   onClose          — () => void
 *   onRequestSession — (candidate) => void  triggers RequestSessionModal
 */

import { memo, useMemo } from 'react';
import { Modal, Text, Divider } from '@mantine/core';
import { motion } from 'framer-motion';
import {
  Star, Award, MapPin, CalendarPlus, ArrowLeftRight, ArrowDown,
} from 'lucide-react';
import MatchScore from './MatchScore';
import ScoreBreakdown from './ScoreBreakdown';
import RecommendationReasons from './RecommendationReasons';
import SkillBadge from './SkillBadge';
import TrustBadge from './TrustBadge';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Normalise both DTO shapes into a consistent display object.
 * RecommendationDTO   → { candidate, matchScore, recommendationReason, isMutual: false }
 * MatchResponseDTO    → { candidate, score, mutualMatch, isMutual: true }
 */
const normalise = (match) => {
  if (!match) return null;

  const isRecommendation = Boolean(match.matchScore);

  if (isRecommendation) {
    return {
      candidate     : match.candidate,
      matchScore    : match.matchScore,
      breakdown     : match.matchScore?.breakdown,
      reasons       : match.recommendationReason?.reasons ?? [],
      exchangeSkills: [],
      isMutual      : false,
      rawScore      : null,
    };
  }

  return {
    candidate     : match.candidate,
    matchScore    : null,
    breakdown     : null,
    reasons       : [],
    exchangeSkills: match.mutualMatch?.exchangeSkills ?? [],
    isMutual      : match.matchType === 'MUTUAL',
    // Backend sends score on 0–100 scale — do NOT multiply by 100
    rawScore      : match.score,
  };
};

// ── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({ children }) => (
  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
    {children}
  </p>
);

// ── Main Component ────────────────────────────────────────────────────────────
const MatchDetailsDrawer = memo(({ match, opened, onClose, onRequestSession }) => {
  const data = useMemo(() => normalise(match), [match]);

  if (!data) return null;

  const { candidate, matchScore, breakdown, reasons, exchangeSkills, isMutual, rawScore } = data;

  const name              = candidate?.name ?? 'Unknown';
  const bio               = candidate?.bio;
  const profilePicUrl     = candidate?.profilePicUrl;
  const location          = candidate?.location;
  const rating            = candidate?.rating ?? 0;
  const completedSessions = candidate?.completedSessions ?? 0;
  const initials          = name.charAt(0).toUpperCase();
  const isNewMentor       = rating === 0;
  const trustScore        = breakdown?.trustScore ?? null;

  const youTeach = exchangeSkills.filter((s) => s.direction === 'GIVE');
  const youLearn = exchangeSkills.filter((s) => s.direction === 'TAKE');

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="lg"
      radius="xl"
      overlayProps={{ backgroundOpacity: 0.5, blur: 8 }}
      withCloseButton={false}
      padding={0}
      styles={{
        content: { overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' },
        body   : { padding: 0, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
      }}
      aria-label={`Match details for ${name}`}
    >
      <div className="flex flex-col h-full max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900 rounded-xl">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shrink-0">
              {isMutual
                ? <ArrowLeftRight className="w-4 h-4 text-white" />
                : <Star className="w-4 h-4 text-white fill-white" />}
            </div>
            <div>
              <Text fw={700} size="md" className="text-gray-900 dark:text-white leading-tight">
                {isMutual ? 'Mutual Exchange Details' : 'Match Details'}
              </Text>
              <Text size="xs" c="dimmed">{name}</Text>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors text-xl font-light leading-none"
            aria-label="Close match details"
          >
            ×
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* ── Profile Section ── */}
          <div className="flex items-start gap-4">
            {profilePicUrl ? (
              <img
                src={profilePicUrl}
                alt={name}
                className="w-16 h-16 rounded-2xl object-cover shrink-0 ring-2 ring-violet-100 dark:ring-violet-900/50"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shrink-0">
                {initials}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight">
                {name}
              </h2>
              {location && (
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                  <span className="text-xs text-gray-400 dark:text-gray-500">{location}</span>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2.5 mt-2">
                {isNewMentor ? (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                    New Mentor
                  </span>
                ) : (
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {rating.toFixed(1)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                  <Award className="w-3 h-3 shrink-0" />
                  <span>{completedSessions} sessions</span>
                </div>
                {trustScore != null && <TrustBadge score={trustScore} compact />}
              </div>
            </div>

            {/* Score display — ring for recommendations, number for mutual */}
            {matchScore && (
              <div className="shrink-0">
                <MatchScore percentage={matchScore.percentage} size={64} strokeWidth={6} />
              </div>
            )}
            {rawScore != null && !matchScore && (
              <div className="shrink-0 text-center">
                <div className="text-2xl font-extrabold text-teal-600 dark:text-teal-400">
                  {/* Backend already sends score on 0–100 scale */}
                  {Math.round(rawScore)}%
                </div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">Match</div>
              </div>
            )}
          </div>

          {/* Bio */}
          {bio && (
            <>
              <Divider className="border-gray-100 dark:border-gray-800" />
              <div>
                <SectionHeader>About</SectionHeader>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{bio}</p>
              </div>
            </>
          )}

          {/* ── Recommendation Reasons ── */}
          {reasons.length > 0 && (
            <>
              <Divider className="border-gray-100 dark:border-gray-800" />
              <div>
                <SectionHeader>Why we recommend</SectionHeader>
                <RecommendationReasons reasons={reasons} />
              </div>
            </>
          )}

          {/* ── Score Breakdown ── */}
          {breakdown && (
            <>
              <Divider className="border-gray-100 dark:border-gray-800" />
              <div>
                <SectionHeader>Score Breakdown</SectionHeader>
                <ScoreBreakdown breakdown={breakdown} />
              </div>
            </>
          )}

          {/* ── Exchange Skills (mutual) ── */}
          {isMutual && exchangeSkills.length > 0 && (
            <>
              <Divider className="border-gray-100 dark:border-gray-800" />
              <div>
                <SectionHeader>Exchange Compatibility</SectionHeader>
                <div className="flex flex-col gap-3">
                  {youTeach.length > 0 && (
                    <div className="bg-violet-50/60 dark:bg-violet-950/20 rounded-xl px-4 py-3">
                      <p className="text-[10px] font-bold text-violet-500 dark:text-violet-400 uppercase tracking-widest mb-2">
                        You Teach
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {youTeach.map((s, i) => (
                          <SkillBadge key={i} name={s.skillName} level={s.level} variant="give" />
                        ))}
                      </div>
                    </div>
                  )}
                  {youTeach.length > 0 && youLearn.length > 0 && (
                    <div className="flex justify-center">
                      <ArrowDown className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                    </div>
                  )}
                  {youLearn.length > 0 && (
                    <div className="bg-teal-50/60 dark:bg-teal-950/20 rounded-xl px-4 py-3">
                      <p className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-2">
                        You Learn
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {youLearn.map((s, i) => (
                          <SkillBadge key={i} name={s.skillName} level={s.level} variant="take" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Bottom padding so content clears the sticky footer */}
          <div className="h-2" />
        </div>

        {/* ── Sticky Footer CTA ── */}
        <div className="shrink-0 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              onRequestSession?.(candidate);
              onClose();
            }}
            aria-label={`Request a session with ${name}`}
            className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 transition-all"
          >
            <CalendarPlus className="w-4 h-4" />
            Request Session with {name.split(' ')[0]}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
});

MatchDetailsDrawer.displayName = 'MatchDetailsDrawer';

export default MatchDetailsDrawer;
