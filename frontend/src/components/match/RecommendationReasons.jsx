/**
 * RecommendationReasons.jsx
 * ──────────────────────────
 * Displays recommendation reason pills from RecommendationReasonDTO.
 * Maps the backend ReasonType enum to human-readable labels + icons.
 *
 * Props:
 *   reasons — ReasonDetailDTO[]
 *     [{ reasonType, message, weightContribution }, ...]
 *   compact — boolean  show only top 3 reasons (for cards, default false)
 */

import {
  Zap,
  ShieldCheck,
  Star,
  ArrowLeftRight,
  CalendarCheck,
  Award,
  Activity,
} from 'lucide-react';
import { Tooltip } from '@mantine/core';

// Maps backend ReasonType enum → { label, icon, style }
const REASON_CONFIG = {
  MATCHED_SKILL      : { label: 'Skill Match',       Icon: Zap,            style: 'bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border-violet-100 dark:border-violet-900/50' },
  HIGH_TRUST         : { label: 'High Trust',         Icon: ShieldCheck,    style: 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/50' },
  TOP_RATED          : { label: 'Top Rated',          Icon: Star,           style: 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900/50' },
  MUTUAL_EXCHANGE    : { label: 'Mutual Exchange',    Icon: ArrowLeftRight, style: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border-teal-100 dark:border-teal-900/50' },
  SHARED_AVAILABILITY: { label: 'Shared Availability',Icon: CalendarCheck,  style: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/50' },
  HIGH_EXPERIENCE    : { label: 'Experienced',        Icon: Award,          style: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50' },
  RECENT_ACTIVITY    : { label: 'Recently Active',    Icon: Activity,       style: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-900/50' },
};

const RecommendationReasons = ({ reasons, compact = false }) => {
  if (!Array.isArray(reasons) || reasons.length === 0) return null;

  const displayed = compact ? reasons.slice(0, 3) : reasons;
  const remaining = compact && reasons.length > 3 ? reasons.length - 3 : 0;

  return (
    <div className="flex flex-wrap gap-1.5">
      {displayed.map((r, i) => {
        const config = REASON_CONFIG[r.reasonType] ?? {
          label: r.reasonType?.replace(/_/g, ' '),
          Icon : Zap,
          style: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
        };
        const { label, Icon, style } = config;

        return (
          <Tooltip
            key={i}
            label={r.message || label}
            withArrow
            position="top"
            multiline
            w={200}
          >
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border cursor-default ${style}`}
            >
              <Icon className="w-2.5 h-2.5 shrink-0" />
              {label}
            </span>
          </Tooltip>
        );
      })}
      {remaining > 0 && (
        <span className="text-[11px] text-gray-400 dark:text-gray-500 self-center">
          +{remaining} more
        </span>
      )}
    </div>
  );
};

export default RecommendationReasons;
