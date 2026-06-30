/**
 * MatchScore.jsx
 * ──────────────
 * SVG circular score ring showing the overall match percentage.
 * Used in the top-right corner of RecommendationCard and in MatchDetailsDrawer.
 *
 * Props:
 *   percentage — number  0–100 match percentage from backend (already on 0–100 scale)
 *   size       — number  diameter of the ring in px (default 56)
 *   strokeWidth— number  ring stroke width (default 5)
 *   showLabel  — boolean show percentage text inside the ring (default true)
 */

const SCORE_COLOR = (pct) => {
  if (pct >= 80) return { stroke: '#7c3aed', text: 'text-violet-600 dark:text-violet-400' }; // violet
  if (pct >= 60) return { stroke: '#2563eb', text: 'text-blue-600 dark:text-blue-400' };     // blue
  if (pct >= 40) return { stroke: '#059669', text: 'text-emerald-600 dark:text-emerald-400' }; // emerald
  return { stroke: '#d97706', text: 'text-amber-600 dark:text-amber-400' };                    // amber
};

const MatchScore = ({ percentage, size = 56, strokeWidth = 5, showLabel = true }) => {
  // Backend already sends percentage on a 0–100 scale — do NOT multiply by 100
  const pct    = percentage != null ? Math.round(percentage) : 0;
  const r      = (size - strokeWidth * 2) / 2;
  const circ   = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const { stroke, text } = SCORE_COLOR(pct);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-gray-100 dark:text-gray-800"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      {showLabel && (
        <span
          className={`absolute text-[10px] font-bold leading-none ${text}`}
          style={{ fontSize: size < 48 ? 9 : 11 }}
        >
          {pct}%
        </span>
      )}
    </div>
  );
};

export default MatchScore;
