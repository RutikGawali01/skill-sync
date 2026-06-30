/**
 * SkillBadge.jsx
 * ──────────────
 * Reusable pill badge for displaying a skill name with optional skill level.
 * Used in match cards, mutual exchange flows, and the details drawer.
 *
 * Props:
 *   name     — string  skill name
 *   level    — string  'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' (optional)
 *   variant  — 'offer' | 'want' | 'give' | 'take' | 'default'  (optional)
 */

const LEVEL_STYLE = {
  ADVANCED:     'bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-900/50',
  INTERMEDIATE: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50',
  BEGINNER:     'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50',
};

const VARIANT_STYLE = {
  offer  : 'bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-900/50',
  want   : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50',
  give   : 'bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-900/50',
  take   : 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-900/50',
  default: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700',
};

const SkillBadge = ({ name, level, variant = 'default', className = '' }) => {
  const baseStyle  = level ? (LEVEL_STYLE[level] ?? LEVEL_STYLE.BEGINNER) : (VARIANT_STYLE[variant] ?? VARIANT_STYLE.default);

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${baseStyle} ${className}`}
    >
      {name}
      {level && (
        <span className="text-[9px] font-normal opacity-70 ml-0.5">
          {level.charAt(0) + level.slice(1).toLowerCase()}
        </span>
      )}
    </span>
  );
};

export default SkillBadge;
