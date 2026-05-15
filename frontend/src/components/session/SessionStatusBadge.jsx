/**
 * SessionStatusBadge.jsx
 * ──────────────────────
 * Reusable status badge component for session states.
 * Maps each SessionStatus enum to a Mantine Badge with appropriate color and icon.
 */

import { Badge } from '@mantine/core';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  Timer,
  CircleCheck,
} from 'lucide-react';

// ── Status → config map ──────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    color: 'yellow',
    variant: 'light',
    icon: Clock,
  },
  ACCEPTED: {
    label: 'Accepted',
    color: 'green',
    variant: 'light',
    icon: CheckCircle2,
  },
  COMPLETED: {
    label: 'Completed',
    color: 'teal',
    variant: 'light',
    icon: CircleCheck,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'gray',
    variant: 'light',
    icon: Ban,
  },
  REJECTED: {
    label: 'Rejected',
    color: 'red',
    variant: 'light',
    icon: XCircle,
  },
  EXPIRED: {
    label: 'Expired',
    color: 'gray',
    variant: 'outline',
    icon: Timer,
  },
};

const SessionStatusBadge = ({ status, size = 'sm' }) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  const Icon   = config.icon;

  return (
    <Badge
      color={config.color}
      variant={config.variant}
      size={size}
      radius="md"
      leftSection={<Icon style={{ width: 12, height: 12 }} />}
      styles={{
        root: {
          textTransform: 'capitalize',
          fontWeight: 600,
          letterSpacing: '0.02em',
        },
      }}
    >
      {config.label}
    </Badge>
  );
};

export default SessionStatusBadge;
