/**
 * ScoreBreakdown.jsx
 * ──────────────────
 * Displays the six-dimension score breakdown from ScoreBreakdownDTO
 * as a set of labelled horizontal progress bars.
 *
 * Used in MatchDetailsDrawer.
 *
 * Props:
 *   breakdown — ScoreBreakdownDTO
 *     { skillScore, trustScore, ratingScore, availabilityScore, experienceScore, activityScore }
 *   Each field is a 0–1 double from the backend.
 */

const DIMENSIONS = [
  { key: 'skillScore',        label: 'Skill Match',    color: 'bg-violet-500' },
  { key: 'trustScore',        label: 'Trust',          color: 'bg-green-500'  },
  { key: 'ratingScore',       label: 'Rating',         color: 'bg-yellow-400' },
  { key: 'availabilityScore', label: 'Availability',   color: 'bg-blue-500'   },
  { key: 'experienceScore',   label: 'Experience',     color: 'bg-indigo-500' },
  { key: 'activityScore',     label: 'Recent Activity',color: 'bg-teal-500'   },
];

const ScoreBreakdown = ({ breakdown }) => {
  if (!breakdown) return null;

  return (
    <div className="flex flex-col gap-2.5">
      {DIMENSIONS.map(({ key, label, color }) => {
        const raw = breakdown[key];
        // Backend sends breakdown scores on 0–100 scale — do NOT multiply by 100
        const pct = raw != null ? Math.round(raw) : 0;

        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {label}
              </span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {pct}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${color} transition-all duration-700`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScoreBreakdown;
