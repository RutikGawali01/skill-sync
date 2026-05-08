/**
 * SkillsPage.jsx
 * ──────────────
 * Exchange Discovery Feed — fetches the public skill feed from the backend.
 *
 * Data flow:
 *   mount → dispatch(fetchExploreSkills())
 *         → GET /api/skills/explore
 *         → Redux store (exploreSkills / exploreLoading / exploreError)
 *         → UI renders dynamic Exchange cards
 *
 * Card shape (from API):
 *   { userSkillId, skillName, skillLevel, category,
 *     userId, fullName, profilePicture, rating,
 *     completedSessions, wantsToLearn: string[] }
 *
 * States:
 *   loading → skeleton grid
 *   error   → error banner
 *   empty   → empty-state message
 *   data    → SkillCard grid
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Search, BookOpen, Star, AlertCircle, Layers, Award, ArrowLeftRight } from 'lucide-react';

import {
  fetchExploreSkills,
  selectExploreSkills,
  selectExploreLoading,
  selectExploreError,
} from '../../redux/skillSlice';

// ── Level → badge style ───────────────────────────────────────────────────────
const LEVEL_STYLE = {
  ADVANCED:     'bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400',
  INTERMEDIATE: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400',
  BEGINNER:     'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400',
};

const LEVEL_LABEL = {
  ADVANCED:     'Advanced',
  INTERMEDIATE: 'Intermediate',
  BEGINNER:     'Beginner',
};

// ── Category → emoji (visual hint, no deps) ───────────────────────────────────
const CATEGORY_EMOJI = {
  BACKEND:      '⚙️',
  FRONTEND:     '🎨',
  DEVOPS:       '☁️',
  DATABASE:     '🗄️',
  MOBILE:       '📱',
  DATA_SCIENCE: '📊',
  DESIGN:       '✏️',
  OTHER:        '🔮',
};

// ── Skeleton Card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm animate-pulse flex flex-col gap-3">
    {/* badges */}
    <div className="flex items-center justify-between">
      <div className="w-20 h-5 rounded-full bg-gray-200 dark:bg-gray-700" />
      <div className="w-22 h-5 rounded-full bg-gray-200 dark:bg-gray-700" />
    </div>
    {/* skill name */}
    <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4" />
    {/* user row */}
    <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="flex gap-2">
        <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
    {/* wants row */}
    <div className="border-t border-gray-100 dark:border-gray-800 pt-2.5 flex items-center gap-2">
      <div className="w-12 h-4 bg-gray-100 dark:bg-gray-800 rounded" />
      <div className="w-10 h-5 rounded-full bg-gray-100 dark:bg-gray-800" />
      <div className="w-14 h-5 rounded-full bg-gray-100 dark:bg-gray-800" />
      <div className="w-10 h-5 rounded-full bg-gray-100 dark:bg-gray-800" />
    </div>
    {/* CTA */}
    <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-xl mt-1" />
  </div>
);

// ── Skill Card ────────────────────────────────────────────────────────────────
const SkillCard = ({ skill, index }) => {
  const {
    skillName,
    skillLevel,
    category,
    fullName,
    profilePicture,
    rating,
    completedSessions,
    wantsToLearn,
  } = skill;

  const levelStyle   = LEVEL_STYLE[skillLevel] ?? LEVEL_STYLE.BEGINNER;
  const levelLabel   = LEVEL_LABEL[skillLevel] ?? skillLevel;
  const emoji        = CATEGORY_EMOJI[category] ?? CATEGORY_EMOJI.OTHER;
  const initials     = fullName?.charAt(0)?.toUpperCase() ?? '?';
  const wantedSkills = Array.isArray(wantsToLearn) ? wantsToLearn : [];
  const ratingValue  = rating ?? 0;
  const sessionCount = completedSessions ?? 0;
  const isNewMentor  = ratingValue === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      whileHover={{ y: -5, boxShadow: '0 16px 36px -8px rgba(124,58,237,0.18)' }}
      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm cursor-pointer group transition-shadow duration-300 flex flex-col gap-3"
    >
      {/* ── 1. TOP METADATA: category badge + level badge ── */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <span className="text-sm leading-none">{emoji}</span>
          {category?.replace(/_/g, ' ')}
        </span>
        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${levelStyle}`}>
          {levelLabel}
        </span>
      </div>

      {/* ── 2. PRIMARY: Skill name ── */}
      <h3 className="text-[1.15rem] font-bold text-gray-900 dark:text-white leading-snug group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
        {skillName}
      </h3>

      {/* ── 3. USER TRUST SECTION ── */}
      <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3">
        {/* Avatar + name */}
        <div className="flex items-center gap-2 min-w-0">
          {profilePicture ? (
            <img
              src={profilePicture}
              alt={fullName ?? 'User'}
              className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-gray-200 dark:ring-gray-700"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
          )}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
            {fullName}
          </span>
        </div>

        {/* Rating + sessions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {isNewMentor ? (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
              New Mentor
            </span>
          ) : (
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {ratingValue.toFixed(1)}
              </span>
            </div>
          )}
          <div className={`flex items-center gap-1 text-xs ${
            sessionCount === 0
              ? 'text-gray-300 dark:text-gray-600'
              : 'text-gray-400 dark:text-gray-500'
          }`}>
            <Award className="w-3 h-3 shrink-0" />
            <span>{sessionCount} sessions</span>
          </div>
        </div>
      </div>

      {/* ── 4. EXCHANGE SECTION: compact inline Wants ── */}
      <div className="flex items-start gap-2 border-t border-gray-100 dark:border-gray-800 pt-2.5">
        <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 shrink-0 mt-0.5">
          Wants:
        </span>
        {wantedSkills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {wantedSkills.map((s) => (
              <span
                key={s}
                className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50"
              >
                {s}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-[11px] text-gray-400 dark:text-gray-500 italic mt-0.5">
            Open to learning
          </span>
        )}
      </div>

      {/* ── 5. CTA ── */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="mt-1 w-full py-2 bg-violet-50 dark:bg-violet-950/50 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-violet-600 dark:text-violet-400 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
      >
        <ArrowLeftRight className="w-3.5 h-3.5" />
        Request Exchange
      </motion.button>
    </motion.div>
  );
};

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="col-span-full flex flex-col items-center justify-center py-24 text-center"
  >
    <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center mb-5">
      <Layers className="w-8 h-8 text-violet-500" />
    </div>
    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">No skills available yet</h3>
    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">
      Be the first to add your skills and start skill exchanges with others on the platform.
    </p>
  </motion.div>
);

// ── Error Banner ──────────────────────────────────────────────────────────────
const ErrorBanner = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="col-span-full flex items-center gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-2xl p-5"
  >
    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
    <div>
      <p className="text-sm font-semibold text-red-700 dark:text-red-400">Failed to load skills</p>
      <p className="text-xs text-red-500 dark:text-red-500 mt-0.5">
        {message ?? 'Could not connect to the server. Please try again later.'}
      </p>
    </div>
  </motion.div>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const SkillsPage = () => {
  const dispatch      = useDispatch();
  const skills        = useSelector(selectExploreSkills);
  const loading       = useSelector(selectExploreLoading);
  const error         = useSelector(selectExploreError);

  const [query, setQuery] = useState('');

  // Fetch on mount
  useEffect(() => {
    dispatch(fetchExploreSkills());
  }, [dispatch]);

  // Client-side search filter
  const filtered = query.trim()
    ? skills.filter((s) =>
        s.skillName?.toLowerCase().includes(query.toLowerCase()) ||
        s.category?.toLowerCase().includes(query.toLowerCase()) ||
        s.fullName?.toLowerCase().includes(query.toLowerCase())
      )
    : skills;

  return (
    <div className="min-h-[80vh] bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 font-semibold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            Skill Exchange
          </span>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Explore Skills
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
            Discover skills people are offering and find your perfect learning match.
          </p>

          {/* Search bar */}
          <div className="mt-8 flex items-center gap-3 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="explore-skills-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search skills, categories or people…"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all shadow-sm"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {}}
              className="px-5 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-violet-500/25"
            >
              Search
            </motion.button>
          </div>

          {/* Result count badge */}
          {!loading && !error && skills.length > 0 && (
            <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
              {filtered.length} skill{filtered.length !== 1 ? 's' : ''} found
              {query && ` for "${query}"`}
            </p>
          )}
        </motion.div>

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : error ? (
            <ErrorBanner message={error} />
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            filtered.map((skill, i) => (
              <SkillCard key={skill.userSkillId ?? i} skill={skill} index={i} />
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default SkillsPage;
