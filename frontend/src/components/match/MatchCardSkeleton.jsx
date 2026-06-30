/**
 * MatchCardSkeleton.jsx
 * ─────────────────────
 * Pulse skeleton placeholder for match cards during loading.
 * Matches the exact height/structure of RecommendationCard so layout doesn't shift.
 *
 * Props:
 *   variant — 'recommendation' | 'mutual'  (default 'recommendation')
 */

const MatchCardSkeleton = ({ variant = 'recommendation' }) => (
  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm animate-pulse flex flex-col gap-3">
    {/* Header row: avatar + name + score ring */}
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
        <div className="flex flex-col gap-1.5">
          <div className="w-28 h-4 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="w-20 h-3 rounded bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>
      {/* Score ring placeholder */}
      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 shrink-0" />
    </div>

    {/* Bio line */}
    <div className="w-full h-3 rounded bg-gray-100 dark:bg-gray-800" />
    <div className="w-3/4 h-3 rounded bg-gray-100 dark:bg-gray-800" />

    {variant === 'recommendation' ? (
      <>
        {/* Reason pills */}
        <div className="flex gap-1.5 pt-1">
          <div className="w-20 h-5 rounded-full bg-violet-50 dark:bg-violet-950/30" />
          <div className="w-16 h-5 rounded-full bg-green-50 dark:bg-green-950/30" />
          <div className="w-24 h-5 rounded-full bg-blue-50 dark:bg-blue-950/30" />
        </div>
      </>
    ) : (
      <>
        {/* Exchange flow placeholder */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex flex-col gap-2">
          <div className="w-full h-8 rounded-xl bg-gray-100 dark:bg-gray-800" />
          <div className="w-4 h-4 rounded-full bg-gray-100 dark:bg-gray-800 mx-auto" />
          <div className="w-full h-8 rounded-xl bg-gray-100 dark:bg-gray-800" />
        </div>
      </>
    )}

    {/* Rating + sessions row */}
    <div className="flex items-center gap-2.5 border-t border-gray-100 dark:border-gray-800 pt-2.5">
      <div className="w-10 h-4 rounded bg-gray-100 dark:bg-gray-800" />
      <div className="w-16 h-4 rounded bg-gray-100 dark:bg-gray-800" />
    </div>

    {/* CTA buttons */}
    <div className="flex gap-2 pt-1">
      <div className="flex-1 h-8 rounded-xl bg-gray-100 dark:bg-gray-800" />
      <div className="flex-1 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/30" />
    </div>
  </div>
);

export default MatchCardSkeleton;
