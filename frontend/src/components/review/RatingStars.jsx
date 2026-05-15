/**
 * RatingStars.jsx
 * ───────────────
 * Reusable star-rating display component.
 *
 * Props:
 *   rating  - numeric value (0-5)
 *   size    - icon size in px (default 16)
 *   color   - fill color (default amber)
 *   showValue - whether to display the numeric rating beside stars
 *   label   - optional label displayed before stars
 */

import { Group, Text, Box } from '@mantine/core';
import { IconStar, IconStarFilled, IconStarHalfFilled } from '@tabler/icons-react';

const RatingStars = ({
  rating = 0,
  size = 16,
  color = '#f59e0b',
  showValue = false,
  label = '',
}) => {
  const fullStars  = Math.floor(rating);
  const hasHalf    = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const totalFull  = hasHalf ? fullStars : (rating - fullStars >= 0.75 ? fullStars + 1 : fullStars);
  const emptyStars = 5 - totalFull - (hasHalf ? 1 : 0);

  return (
    <Group gap={4} align="center" wrap="nowrap">
      {label && (
        <Text size="xs" fw={500} c="dimmed" style={{ minWidth: 'max-content' }}>
          {label}
        </Text>
      )}
      <Group gap={1} wrap="nowrap">
        {Array.from({ length: totalFull }, (_, i) => (
          <IconStarFilled key={`full-${i}`} size={size} color={color} />
        ))}
        {hasHalf && (
          <IconStarHalfFilled size={size} color={color} />
        )}
        {Array.from({ length: emptyStars }, (_, i) => (
          <IconStar key={`empty-${i}`} size={size} color={color} style={{ opacity: 0.25 }} />
        ))}
      </Group>
      {showValue && (
        <Text size="xs" fw={600} c="dimmed" style={{ minWidth: 24, textAlign: 'center' }}>
          {rating > 0 ? rating.toFixed(1) : '—'}
        </Text>
      )}
    </Group>
  );
};

export default RatingStars;
