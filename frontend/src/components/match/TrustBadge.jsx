/**
 * TrustBadge.jsx
 * ──────────────
 * Displays a trust score as a colour-coded pill badge.
 * Color thresholds: ≥ 80 = green, ≥ 60 = yellow, < 60 = gray.
 *
 * Props:
 *   score   — number  0–100 trust score (from ScoreBreakdownDTO.trustScore × 100)
 *   compact — boolean show just the icon + number (for cards)
 */

import { ShieldCheck } from 'lucide-react';
import { Tooltip } from '@mantine/core';

const getTrustStyle = (score) => {
  if (score >= 80) return 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/50';
  if (score >= 60) return 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900/50';
  return 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700';
};

const getTrustLabel = (score) => {
  if (score >= 80) return 'High Trust';
  if (score >= 60) return 'Good Trust';
  return 'Building Trust';
};

const TrustBadge = ({ score, compact = false }) => {
  // Backend sends trustScore on 0–100 scale — do NOT multiply by 100
  const normalised = score != null ? Math.round(score) : null;
  if (normalised == null) return null;

  const style = getTrustStyle(normalised);
  const label = getTrustLabel(normalised);

  return (
    <Tooltip label={`Trust Score: ${normalised}%`} withArrow position="top">
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border cursor-default ${style}`}
      >
        <ShieldCheck className="w-3 h-3 shrink-0" />
        {compact ? `${normalised}%` : label}
      </span>
    </Tooltip>
  );
};

export default TrustBadge;
