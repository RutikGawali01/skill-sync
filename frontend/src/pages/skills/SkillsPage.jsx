/**
 * SkillsPage.jsx
 * ──────────────
 * Central Discovery Page — enhanced with three tabs:
 *
 *   ⭐ Recommended     GET /api/matches/recommendations  (paginated, pre-ranked)
 *   🔄 Mutual Exchange GET /api/matches/mutual           (bidirectional exchanges)
 *   🌍 Explore All     GET /api/skills/explore           (existing feed, unchanged)
 *
 * Architecture:
 *   - Tabs: MatchTabs component (spring-animated pill, matches SessionTabs pattern)
 *   - Redux: matchSlice (recommended/mutual) + skillSlice (explore all)
 *   - Hooks: useMatches() + existing Redux selectors for explore
 *   - Drawer: MatchDetailsDrawer (opens on "View" click)
 *   - Modal: RequestSessionModal (existing, unchanged)
 *
 * Performance:
 *   - Tab data is fetched once and cached in Redux; switching tabs is instant
 *   - React.memo on all card components prevents unnecessary re-renders
 *   - useMemo / useCallback for filtered lists and handlers
 */

import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, BookOpen, Star, AlertCircle, Layers, Award,
  ArrowLeftRight, ShieldCheck, CalendarPlus, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Tooltip } from '@mantine/core';

// ── Existing imports (unchanged) ─────────────────────────────────────────────
import RequestSessionModal from '../../components/session/RequestSessionModal';
import AvailabilityPreview from '../../components/session/AvailabilityPreview';
import {
  fetchExploreSkills,
  selectExploreSkills,
  selectExploreLoading,
  selectExploreError,
  selectExplorePagination,
} from '../../redux/skillSlice';

// ── New match imports ─────────────────────────────────────────────────────────
import MatchTabs, { MATCH_TABS }   from '../../components/match/MatchTabs';
import RecommendationCard          from '../../components/match/RecommendationCard';
import MutualExchangeCard          from '../../components/match/MutualExchangeCard';
import MatchDetailsDrawer          from '../../components/match/MatchDetailsDrawer';
import MatchCardSkeleton           from '../../components/match/MatchCardSkeleton';
import useMatches                  from '../../hooks/useMatches';

// ── Level → badge style (preserved from original) ────────────────────────────
const LEVEL_STYLE = {
  ADVANCED    : 'bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400',
  INTERMEDIATE: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400',
  BEGINNER    : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400',
};

const LEVEL_LABEL = {
  ADVANCED    : 'Advanced',
  INTERMEDIATE: 'Intermediate',
  BEGINNER    : 'Beginner',
};

const CATEGORY_EMOJI = {
  BACKEND     : '⚙️', FRONTEND: '🎨', DEVOPS: '☁️', DATABASE: '🗄️',
  MOBILE      : '📱', DATA_SCIENCE: '📊', DESIGN: '✏️', OTHER: '🔮',
};

// ── Existing SkeletonCard (preserved verbatim) ────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm animate-pulse flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <div className="w-20 h-5 rounded-full bg-gray-200 dark:bg-gray-700" />
      <div className="w-22 h-5 rounded-full bg-gray-200 dark:bg-gray-700" />
    </div>
    <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4" />
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
    <div className="border-t border-gray-100 dark:border-gray-800 pt-2.5 flex items-center gap-2">
      <div className="w-12 h-4 bg-gray-100 dark:bg-gray-800 rounded" />
      <div className="w-10 h-5 rounded-full bg-gray-100 dark:bg-gray-800" />
      <div className="w-14 h-5 rounded-full bg-gray-100 dark:bg-gray-800" />
    </div>
    <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-xl mt-1" />
  </div>
);

// ── Existing SkillCard (preserved verbatim) ───────────────────────────────────
const SkillCard = memo(({ skill, index, onRequestSession }) => {
  const {
    skillName, skillLevel, category, fullName, profilePicture,
    rating, completedSessions, wantsToLearn, isVerified,
  } = skill;

  const levelStyle   = LEVEL_STYLE[skillLevel]   ?? LEVEL_STYLE.BEGINNER;
  const levelLabel   = LEVEL_LABEL[skillLevel]   ?? skillLevel;
  const emoji        = CATEGORY_EMOJI[category]  ?? CATEGORY_EMOJI.OTHER;
  const initials     = fullName?.charAt(0)?.toUpperCase() ?? '?';
  const wantedSkills = Array.isArray(wantsToLearn) ? wantsToLearn : [];
  const ratingValue  = rating ?? 0;
  const sessionCount = completedSessions ?? 0;
  const isNewMentor  = ratingValue === 0;

  const cardBorderAndShadow = isVerified
    ? 'border-green-200/60 dark:border-green-900/40 shadow-[0_4px_20px_-4px_rgba(22,163,74,0.08)] hover:shadow-[0_8px_30px_-4px_rgba(22,163,74,0.15)]'
    : 'border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-[0_16px_36px_-8px_rgba(124,58,237,0.18)]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      whileHover={{ y: -5 }}
      className={`bg-white dark:bg-gray-900 border rounded-2xl p-5 cursor-pointer group transition-all duration-300 flex flex-col gap-3 ${cardBorderAndShadow}`}
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <span className="text-sm leading-none">{emoji}</span>
          {category?.replace(/_/g, ' ')}
        </span>
        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${levelStyle}`}>
          {levelLabel}
        </span>
      </div>

      <div className="flex flex-col items-start gap-1">
        <h3 className="text-[1.15rem] font-bold text-gray-900 dark:text-white leading-snug group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
          {skillName}
        </h3>
        {isVerified && (
          <Tooltip label="Verified through AI skill assessment" withArrow position="top">
            <div className="flex items-center gap-1.5 mt-0.5 px-1 py-0.5 rounded-sm transition-colors duration-200 hover:bg-green-50 dark:hover:bg-green-900/20">
              <ShieldCheck className="w-[14px] h-[14px] text-green-600 dark:text-green-500" />
              <span className="text-xs font-semibold text-green-600 dark:text-green-500">
                Verified Skill
              </span>
            </div>
          </Tooltip>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3">
        <div className="flex items-center gap-2 min-w-0">
          {profilePicture ? (
            <img
              src={profilePicture}
              alt={fullName ?? 'User'}
              className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-gray-200 dark:ring-gray-700"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
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
            sessionCount === 0 ? 'text-gray-300 dark:text-gray-600' : 'text-gray-400 dark:text-gray-500'
          }`}>
            <Award className="w-3 h-3 shrink-0" />
            <span>{sessionCount} sessions</span>
          </div>
        </div>
      </div>

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

      <div className="border-t border-gray-100 dark:border-gray-800 pt-2.5">
        <AvailabilityPreview slots={skill.availability} compact maxSlots={2} />
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onRequestSession?.(skill)}
        className="mt-1 w-full py-2 bg-violet-50 dark:bg-violet-950/50 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-violet-600 dark:text-violet-400 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
      >
        <CalendarPlus className="w-3.5 h-3.5" />
        Request Session
      </motion.button>
    </motion.div>
  );
});
SkillCard.displayName = 'SkillCard';

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ icon: Icon = Layers, title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="col-span-full flex flex-col items-center justify-center py-24 text-center"
  >
    <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center mb-5">
      <Icon className="w-8 h-8 text-violet-500" />
    </div>
    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">{description}</p>
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
      <p className="text-sm font-semibold text-red-700 dark:text-red-400">Failed to load</p>
      <p className="text-xs text-red-500 dark:text-red-500 mt-0.5">
        {message ?? 'Could not connect to the server. Please try again later.'}
      </p>
    </div>
  </motion.div>
);

// ── Pagination Controls ───────────────────────────────────────────────────────
const PaginationControls = memo(({ pagination, onPageChange }) => {
  const { page, totalPages, totalElements } = pagination;
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 pt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        aria-label="Previous page"
        className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <span className="text-sm text-gray-500 dark:text-gray-400">
        Page <span className="font-bold text-gray-900 dark:text-white">{page + 1}</span> of{' '}
        <span className="font-bold text-gray-900 dark:text-white">{totalPages}</span>
        <span className="text-xs ml-2 text-gray-400">({totalElements} total)</span>
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        aria-label="Next page"
        className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
});
PaginationControls.displayName = 'PaginationControls';

// ── Tab content fade variants ─────────────────────────────────────────────────
const tabVariants = {
  initial : { opacity: 0, y: 8 },
  animate : { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit    : { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

// ── Page ──────────────────────────────────────────────────────────────────────
const SkillsPage = () => {
  const dispatch  = useDispatch();

  // ── Explore All (existing redux) ──────────────────────────────────────────
  const skills            = useSelector(selectExploreSkills);
  const exploreLoading    = useSelector(selectExploreLoading);
  const exploreError      = useSelector(selectExploreError);
  const explorePagination = useSelector(selectExplorePagination);

  // ── Match state (new hook) ────────────────────────────────────────────────
  const {
    recommendedMatches, mutualMatches, selectedMatch,
    recommendedLoading, mutualLoading,
    recommendedError, mutualError,
    pagination,
    mutualPagination,
    loadRecommendations, loadMutualMatches,
    openMatch, closeMatch, goToPage, goToMutualPage,
  } = useMatches();

  // ── Search & Sort States ──────────────────────────────────────────────────
  const [recQuery, setRecQuery] = useState('');
  const [recSortBy, setRecSortBy] = useState('matchScore');
  const [recSortDir, setRecSortDir] = useState('desc');

  const [mutualQuery, setMutualQuery] = useState('');
  const [mutualSortBy, setMutualSortBy] = useState('matchScore');
  const [mutualSortDir, setMutualSortDir] = useState('desc');

  const [exploreQuery, setExploreQuery] = useState('');
  const [exploreSortBy, setExploreSortBy] = useState('createdAt');
  const [exploreSortDir, setExploreSortDir] = useState('desc');

  // ── Active tab ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState(MATCH_TABS.RECOMMENDED);

  // ── Session Request Modal ─────────────────────────────────────────────────
  const [modalOpened, setModalOpened]     = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);

  // ── Fetch triggers ────────────────────────────────────────────────────────
  const fetchRecommendedData = useCallback((pageOverride) => {
    const targetPage = pageOverride !== undefined ? pageOverride : pagination.page;
    loadRecommendations({
      page: targetPage,
      size: 9,
      search: recQuery,
      sortBy: recSortBy,
      sortDir: recSortDir,
    });
  }, [loadRecommendations, pagination.page, recQuery, recSortBy, recSortDir]);

  const fetchMutualData = useCallback((pageOverride) => {
    const targetPage = pageOverride !== undefined ? pageOverride : mutualPagination.page;
    loadMutualMatches({
      page: targetPage,
      size: 9,
      search: mutualQuery,
      sortBy: mutualSortBy,
      sortDir: mutualSortDir,
    });
  }, [loadMutualMatches, mutualPagination.page, mutualQuery, mutualSortBy, mutualSortDir]);

  const fetchExploreData = useCallback((pageOverride) => {
    const targetPage = pageOverride !== undefined ? pageOverride : explorePagination.page;
    dispatch(fetchExploreSkills({
      page: targetPage,
      size: 9,
      search: exploreQuery,
      sortBy: exploreSortBy,
      sortDir: exploreSortDir,
    }));
  }, [dispatch, explorePagination.page, exploreQuery, exploreSortBy, exploreSortDir]);

  // ── Data loading: fetch each tab's data once on first activation ──────────
  const [fetchedTabs, setFetchedTabs] = useState(new Set());

  useEffect(() => {
    if (!fetchedTabs.has(activeTab)) {
      setFetchedTabs((prev) => new Set([...prev, activeTab]));
      if (activeTab === MATCH_TABS.RECOMMENDED) {
        fetchRecommendedData(0);
      } else if (activeTab === MATCH_TABS.MUTUAL) {
        fetchMutualData(0);
      } else if (activeTab === MATCH_TABS.EXPLORE) {
        fetchExploreData(0);
      }
    }
  }, [activeTab, fetchedTabs, fetchRecommendedData, fetchMutualData, fetchExploreData]);

  // ── Auto-reload on Sort Change ────────────────────────────────────────────
  useEffect(() => {
    if (fetchedTabs.has(MATCH_TABS.RECOMMENDED)) {
      fetchRecommendedData(0);
    }
  }, [recSortBy, recSortDir]);

  useEffect(() => {
    if (fetchedTabs.has(MATCH_TABS.MUTUAL)) {
      fetchMutualData(0);
    }
  }, [mutualSortBy, mutualSortDir]);

  useEffect(() => {
    if (fetchedTabs.has(MATCH_TABS.EXPLORE)) {
      fetchExploreData(0);
    }
  }, [exploreSortBy, exploreSortDir]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleRequestSession = useCallback((skillOrCandidate) => {
    const adapted = skillOrCandidate?.skillName
      ? skillOrCandidate
      : {
          userId      : skillOrCandidate?.id,
          skillName   : 'Skill Exchange Session',
          fullName    : skillOrCandidate?.name,
          profilePicture: skillOrCandidate?.profilePicUrl,
          availability: [],
        };
    setSelectedSkill(adapted);
    setModalOpened(true);
  }, []);

  const handleViewDetails = useCallback((match) => {
    openMatch(match);
  }, [openMatch]);

  const handleRecPageChange = useCallback((newPage) => {
    goToPage(newPage, recQuery, recSortBy, recSortDir);
  }, [goToPage, recQuery, recSortBy, recSortDir]);

  const handleMutualPageChange = useCallback((newPage) => {
    goToMutualPage(newPage, mutualQuery, mutualSortBy, mutualSortDir);
  }, [goToMutualPage, mutualQuery, mutualSortBy, mutualSortDir]);

  const handleExplorePageChange = useCallback((newPage) => {
    dispatch(fetchExploreSkills({
      page: newPage,
      size: 9,
      search: exploreQuery,
      sortBy: exploreSortBy,
      sortDir: exploreSortDir,
    }));
  }, [dispatch, exploreQuery, exploreSortBy, exploreSortDir]);

  const handleRecSearchSubmit = (e) => {
    e?.preventDefault();
    fetchRecommendedData(0);
  };

  const handleMutualSearchSubmit = (e) => {
    e?.preventDefault();
    fetchMutualData(0);
  };

  const handleExploreSearchSubmit = (e) => {
    e?.preventDefault();
    fetchExploreData(0);
  };

  const filtered = skills;

  // ── Tab counts for badge display ──────────────────────────────────────────
  const tabCounts = useMemo(() => ({
    [MATCH_TABS.RECOMMENDED]: pagination.totalElements,
    [MATCH_TABS.MUTUAL]     : mutualPagination.totalElements,
    [MATCH_TABS.EXPLORE]    : explorePagination.totalElements,
  }), [pagination.totalElements, mutualPagination.totalElements, explorePagination.totalElements]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[80vh] bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="inline-block bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 font-semibold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            Skill Exchange
          </span>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Explore Skills
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
            Discover skills, find your perfect match, or explore mutual exchanges.
          </p>
        </motion.div>

        {/* ── Tab Navigation ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <MatchTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            counts={tabCounts}
          />
        </motion.div>

        {/* ── Search & Filter Controls ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-10 max-w-4xl mx-auto bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-center gap-4"
        >
          {/* Search Input */}
          <form onSubmit={
            activeTab === MATCH_TABS.RECOMMENDED ? handleRecSearchSubmit :
            activeTab === MATCH_TABS.MUTUAL ? handleMutualSearchSubmit :
            handleExploreSearchSubmit
          } className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="skills-search-input"
              type="text"
              value={
                activeTab === MATCH_TABS.RECOMMENDED ? recQuery :
                activeTab === MATCH_TABS.MUTUAL ? mutualQuery :
                exploreQuery
              }
              onChange={(e) => {
                const val = e.target.value;
                if (activeTab === MATCH_TABS.RECOMMENDED) setRecQuery(val);
                else if (activeTab === MATCH_TABS.MUTUAL) setMutualQuery(val);
                else setExploreQuery(val);
              }}
              placeholder={
                activeTab === MATCH_TABS.RECOMMENDED ? "Search recommended tutors or skills…" :
                activeTab === MATCH_TABS.MUTUAL ? "Search mutual exchanges or skills…" :
                "Search categories, skills or tutors…"
              }
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
              aria-label="Search skills"
            />
            <button type="submit" className="hidden" />
          </form>

          {/* Sort controls wrapper */}
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-between">
            {/* Sort By Select */}
            <div className="flex-1 md:flex-none">
              <select
                aria-label="Sort by field"
                value={
                  activeTab === MATCH_TABS.RECOMMENDED ? recSortBy :
                  activeTab === MATCH_TABS.MUTUAL ? mutualSortBy :
                  exploreSortBy
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (activeTab === MATCH_TABS.RECOMMENDED) setRecSortBy(val);
                  else if (activeTab === MATCH_TABS.MUTUAL) setMutualSortBy(val);
                  else setExploreSortBy(val);
                }}
                className="w-full md:w-44 px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850 text-gray-800 dark:text-gray-250 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all font-medium cursor-pointer"
              >
                {activeTab === MATCH_TABS.RECOMMENDED && (
                  <>
                    <option value="matchScore">Best Matches</option>
                    <option value="rating">Highest Rating</option>
                    <option value="completedSessions">Most Experienced</option>
                    <option value="name">Name (A-Z)</option>
                  </>
                )}
                {activeTab === MATCH_TABS.MUTUAL && (
                  <>
                    <option value="matchScore">Compatibility</option>
                    <option value="rating">Highest Rating</option>
                    <option value="completedSessions">Most Experienced</option>
                    <option value="name">Name (A-Z)</option>
                  </>
                )}
                {activeTab === MATCH_TABS.EXPLORE && (
                  <>
                    <option value="createdAt">Newest Additions</option>
                    <option value="skillName">Skill Name (A-Z)</option>
                    <option value="fullName">Tutor Name (A-Z)</option>
                  </>
                )}
              </select>
            </div>

            {/* Sort Order Select */}
            <div>
              <select
                aria-label="Sort order direction"
                value={
                  activeTab === MATCH_TABS.RECOMMENDED ? recSortDir :
                  activeTab === MATCH_TABS.MUTUAL ? mutualSortDir :
                  exploreSortDir
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (activeTab === MATCH_TABS.RECOMMENDED) setRecSortDir(val);
                  else if (activeTab === MATCH_TABS.MUTUAL) setMutualSortDir(val);
                  else setExploreSortDir(val);
                }}
                className="px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850 text-gray-800 dark:text-gray-250 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all font-medium cursor-pointer"
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>

            {/* Search Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={
                activeTab === MATCH_TABS.RECOMMENDED ? handleRecSearchSubmit :
                activeTab === MATCH_TABS.MUTUAL ? handleMutualSearchSubmit :
                handleExploreSearchSubmit
              }
              className="px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md transition-all shrink-0"
            >
              Search
            </motion.button>
          </div>
        </motion.div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">

          {/* ── ⭐ RECOMMENDED TAB ── */}
          {activeTab === MATCH_TABS.RECOMMENDED && (
            <motion.div
              key="recommended"
              role="tabpanel"
              id="tabpanel-recommended"
              aria-labelledby="tab-recommended"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedLoading ? (
                  Array.from({ length: 9 }).map((_, i) => (
                    <MatchCardSkeleton key={i} variant="recommendation" />
                  ))
                ) : recommendedError ? (
                  <ErrorBanner message={recommendedError} />
                ) : recommendedMatches.length === 0 ? (
                  <EmptyState
                    icon={BookOpen}
                    title={recQuery ? "No matching recommendations" : "No recommendations yet"}
                    description={recQuery ? `We couldn't find any recommendations matching "${recQuery}". Try searching for a different skill or topic.` : "Complete your profile and add skills you want to learn to get personalised recommendations."}
                  />
                ) : (
                  recommendedMatches.map((rec, i) => (
                    <RecommendationCard
                      key={rec.candidate?.id ?? i}
                      recommendation={rec}
                      index={i}
                      onViewDetails={handleViewDetails}
                      onRequestSession={handleRequestSession}
                    />
                  ))
                )}
              </div>

              {/* Pagination */}
              {!recommendedLoading && !recommendedError && (
                <PaginationControls
                  pagination={pagination}
                  onPageChange={handleRecPageChange}
                />
              )}
            </motion.div>
          )}

          {/* ── 🔄 MUTUAL EXCHANGE TAB ── */}
          {activeTab === MATCH_TABS.MUTUAL && (
            <motion.div
              key="mutual"
              role="tabpanel"
              id="tabpanel-mutual"
              aria-labelledby="tab-mutual"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mutualLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <MatchCardSkeleton key={i} variant="mutual" />
                  ))
                ) : mutualError ? (
                  <ErrorBanner message={mutualError} />
                ) : mutualMatches.length === 0 ? (
                  <EmptyState
                    icon={ArrowLeftRight}
                    title={mutualQuery ? "No matching mutual exchanges" : "No mutual exchanges found"}
                    description={mutualQuery ? `We couldn't find any mutual exchanges matching "${mutualQuery}". Try searching for a different skill or topic.` : "Add more skills to your profile to discover people you can teach and learn from simultaneously."}
                  />
                ) : (
                  mutualMatches.map((match, i) => (
                    <MutualExchangeCard
                      key={match.candidate?.id ?? i}
                      match={match}
                      index={i}
                      onViewDetails={handleViewDetails}
                      onRequestSession={handleRequestSession}
                    />
                  ))
                )}
              </div>

              {/* Pagination */}
              {!mutualLoading && !mutualError && (
                <PaginationControls
                  pagination={mutualPagination}
                  onPageChange={handleMutualPageChange}
                />
              )}
            </motion.div>
          )}

          {/* ── 🌍 EXPLORE ALL TAB ── */}
          {activeTab === MATCH_TABS.EXPLORE && (
            <motion.div
              key="explore"
              role="tabpanel"
              id="tabpanel-explore"
              aria-labelledby="tab-explore"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {exploreLoading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                ) : exploreError ? (
                  <ErrorBanner message={exploreError} />
                ) : filtered.length === 0 ? (
                  <EmptyState
                    icon={Layers}
                    title={exploreQuery ? "No matching skills" : "No skills available yet"}
                    description={exploreQuery ? `We couldn't find any skills matching "${exploreQuery}". Try searching for a different category or topic.` : "Be the first to add your skills and start skill exchanges with others on the platform."}
                  />
                ) : (
                  filtered.map((skill, i) => (
                    <SkillCard
                      key={skill.userSkillId ?? i}
                      skill={skill}
                      index={i}
                      onRequestSession={handleRequestSession}
                    />
                  ))
                )}
              </div>

              {/* Pagination */}
              {!exploreLoading && !exploreError && (
                <PaginationControls
                  pagination={explorePagination}
                  onPageChange={handleExplorePageChange}
                />
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Match Details Drawer ── */}
      <MatchDetailsDrawer
        match={selectedMatch}
        opened={Boolean(selectedMatch)}
        onClose={closeMatch}
        onRequestSession={handleRequestSession}
      />

      {/* ── Session Request Modal (existing, unchanged) ── */}
      <RequestSessionModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        skill={selectedSkill}
      />
    </div>
  );
};

export default SkillsPage;
