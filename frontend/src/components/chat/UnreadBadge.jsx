import React from 'react';
import { Badge } from '@mantine/core';

/**
 * Renders unread message count badges.
 */
const UnreadBadge = ({ count }) => {
  if (!count || count <= 0) return null;

  return (
    <Badge
      color="violet"
      variant="filled"
      size="sm"
      style={{
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        padding: '0 4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        fontWeight: 'bold',
      }}
    >
      {count > 99 ? '99+' : count}
    </Badge>
  );
};

export default UnreadBadge;
