/**
 * profileEnums.js
 * ───────────────
 * Single source of truth for all profile-related enum option arrays.
 *
 * Rules:
 *  ✅ value  = exact Java enum name (sent to / received from backend)
 *  ✅ label  = human-readable string (shown in UI)
 *  ❌ Never hardcode options inside components — always import from here
 *
 * Enum sources (backend):
 *  com.rutik.skill_sync_backend.user.enums.*
 */

// ─────────────────────────────────────────────────────────────────────────────
// CommunicationPace
// ─────────────────────────────────────────────────────────────────────────────
export const communicationPaceOptions = [
  { value: 'SLOW',       label: 'Slow & Steady' },
  { value: 'MODERATE',   label: 'Moderate' },
  { value: 'FAST_PACED', label: 'Fast Paced' },
  { value: 'FLEXIBLE',   label: 'Flexible' },
];

// ─────────────────────────────────────────────────────────────────────────────
// DomainFocus
// ─────────────────────────────────────────────────────────────────────────────
export const domainFocusOptions = [
  { value: 'FULL_STACK',     label: 'Full Stack Development' },
  { value: 'DEVOPS',         label: 'DevOps / Cloud' },
  { value: 'DATA_SCIENCE',   label: 'Data Science / AI' },
  { value: 'MOBILE',         label: 'Mobile Development' },
  { value: 'DESIGN',         label: 'UI/UX Design' },
  { value: 'DSA_ALGORITHMS', label: 'DSA & Algorithms' },
  { value: 'OTHER',          label: 'Other' },
];

// ─────────────────────────────────────────────────────────────────────────────
// GoalTimeline
// ─────────────────────────────────────────────────────────────────────────────
export const goalTimelineOptions = [
  { value: 'ONE_MONTH',    label: '1 Month' },
  { value: 'THREE_MONTHS', label: '3 Months' },
  { value: 'SIX_MONTHS',  label: '6 Months' },
  { value: 'ONE_YEAR',     label: '1 Year' },
  { value: 'FLEXIBLE',     label: 'Flexible' },
];

// ─────────────────────────────────────────────────────────────────────────────
// LearningGoal
// ─────────────────────────────────────────────────────────────────────────────
export const learningGoalOptions = [
  { value: 'LEARN_NEW_SKILL',        label: 'Learn New Skill' },
  { value: 'IMPROVE_EXISTING_SKILL', label: 'Improve Existing Skill' },
  { value: 'TEACH_AND_LEARN',        label: 'Teach & Learn' },
  { value: 'CAREER_TRANSITION',      label: 'Career Transition' },
  { value: 'HOBBY_FUN',              label: 'Hobby / Fun' },
  { value: 'JOB_PREPARATION',        label: 'Job Preparation' },
  { value: 'PERSONAL_PROJECT',       label: 'Build Projects' },
  { value: 'EXPLORATION',            label: 'Exploration' },
];

// ─────────────────────────────────────────────────────────────────────────────
// LearningMethod — split by category (mirrors backend Category enum)
// Category.PREFERENCE = how the learner prefers to absorb knowledge
// Category.SESSION    = how a live session should be conducted
// ─────────────────────────────────────────────────────────────────────────────
export const learningMethodOptions = [
  // ── Learning Preference ───────────────────────────────────────────────────
  // NOTE: no 'group' key — Mantine Select treats any item with 'group' as a
  // group-header and crashes trying to call .map() on item.items (undefined).
  // We use two separate Selects instead, so 'group' is not needed here.
  { value: 'VISUAL',        label: 'Visual Learning',    category: 'PREFERENCE' },
  { value: 'HANDS_ON',      label: 'Hands-on Practice',  category: 'PREFERENCE' },
  { value: 'READING',       label: 'Reading',             category: 'PREFERENCE' },
  { value: 'PROJECT_BASED', label: 'Project Based',       category: 'PREFERENCE' },
  { value: 'COLLABORATIVE', label: 'Collaborative',       category: 'PREFERENCE' },

  // ── Session Style ─────────────────────────────────────────────────────────
  { value: 'VIDEO_CALL',     label: 'Video Call',          category: 'SESSION' },
  { value: 'SCREEN_SHARING', label: 'Screen Sharing',      category: 'SESSION' },
  { value: 'CODE_REVIEW',    label: 'Code Review',         category: 'SESSION' },
  { value: 'ASYNCHRONOUS',   label: 'Async Communication', category: 'SESSION' },
];

/** Convenience: only PREFERENCE options */
export const learningPreferenceOptions = learningMethodOptions.filter(
  (o) => o.category === 'PREFERENCE'
);

/** Convenience: only SESSION options */
export const sessionStyleOptions = learningMethodOptions.filter(
  (o) => o.category === 'SESSION'
);

// ─────────────────────────────────────────────────────────────────────────────
// TeachingApproach
// ─────────────────────────────────────────────────────────────────────────────
export const teachingApproachOptions = [
  { value: 'STRUCTURED',    label: 'Structured Curriculum' },
  { value: 'ADAPTIVE',      label: 'Adaptive Teaching' },
  { value: 'PROJECT_BASED', label: 'Project Based' },
  { value: 'SOCRATIC',      label: 'Socratic (Question Driven)' },
];

// ─────────────────────────────────────────────────────────────────────────────
// TeachingMotivation
// ─────────────────────────────────────────────────────────────────────────────
export const teachingMotivationOptions = [
  { value: 'GIVE_BACK_COMMUNITY', label: 'Give Back to Community' },
  { value: 'IMPROVE_OWN_SKILLS',  label: 'Improve Own Skills' },
  { value: 'NETWORKING',          label: 'Networking' },
  { value: 'EARN_INCOME',         label: 'Earn Income' },
  { value: 'PASSION',             label: 'Passion for Teaching' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Utility: resolve a label from any option array by its value
// Usage: resolveLabel(domainFocusOptions, 'DSA_ALGORITHMS') → 'DSA & Algorithms'
// ─────────────────────────────────────────────────────────────────────────────
export const resolveLabel = (options, value) =>
  options.find((o) => o.value === value)?.label ?? value ?? '—';
