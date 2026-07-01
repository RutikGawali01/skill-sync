import React from 'react';
import { Badge, Box, Tooltip } from '@mantine/core';

/**
 * Renders user online/offline presence indicator.
 */
const PresenceBadge = ({ online, showText = false, size = 10 }) => {
  const color = online ? 'green' : 'gray';
  const label = online ? 'Online' : 'Offline';

  if (showText) {
    return (
      <Badge color={color} variant="filled" size="xs">
        {label}
      </Badge>
    );
  }

  return (
    <Tooltip label={label} position="top" withArrow>
      <Box
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: online ? '#40C057' : '#868E96',
          border: '1.5px solid var(--mantine-color-body, #fff)',
          display: 'inline-block',
        }}
      />
    </Tooltip>
  );
};

export default PresenceBadge;
