/**
 * SessionActionButtons.jsx
 * ────────────────────────
 * Renders context-aware action buttons based on session status + current user role.
 *
 * Button visibility rules:
 *   PENDING  (provider)  → Accept / Reject
 *   PENDING  (requester) → Cancel
 *   ACCEPTED (both)      → Cancel / Complete
 *   Others               → No actions
 *
 * Uses the useSessionActions hook for all dispatches + notification feedback.
 */

import { Button, Group, Tooltip } from '@mantine/core';
import { Check, X, Ban, CheckCheck } from 'lucide-react';
import { SESSION_STATUS } from '../../redux/session/sessionSlice';

const SessionActionButtons = ({
  session,
  currentUserId,
  actionLoading,
  onAccept,
  onReject,
  onCancel,
  onComplete,
  compact = false,
}) => {
  if (!session || !currentUserId) return null;

  const { id, status, requester, provider } = session;
  const isProvider  = provider?.id != null && currentUserId != null && provider.id == currentUserId;
  const isRequester = requester?.id != null && currentUserId != null && requester.id == currentUserId;
  const isProcessing = actionLoading === id;

  const btnSize  = compact ? 'xs' : 'sm';
  const iconSize = compact ? 14 : 16;

  // ── PENDING: provider can accept/reject, requester can cancel ────────────
  if (status === SESSION_STATUS.PENDING) {
    return (
      <Group gap={compact ? 6 : 8}>
        {isProvider && (
          <>
            <Tooltip label="Accept this session request" withArrow>
              <Button
                size={btnSize}
                color="green"
                variant="light"
                leftSection={<Check style={{ width: iconSize, height: iconSize }} />}
                loading={isProcessing}
                onClick={() => onAccept?.(id)}
                radius="md"
              >
                Accept
              </Button>
            </Tooltip>
            <Tooltip label="Reject this session request" withArrow>
              <Button
                size={btnSize}
                color="red"
                variant="subtle"
                leftSection={<X style={{ width: iconSize, height: iconSize }} />}
                loading={isProcessing}
                onClick={() => onReject?.(id)}
                radius="md"
              >
                Reject
              </Button>
            </Tooltip>
          </>
        )}
        {isRequester && (
          <Tooltip label="Cancel your session request" withArrow>
            <Button
              size={btnSize}
              color="gray"
              variant="subtle"
              leftSection={<Ban style={{ width: iconSize, height: iconSize }} />}
              loading={isProcessing}
              onClick={() => onCancel?.(id)}
              radius="md"
            >
              Cancel
            </Button>
          </Tooltip>
        )}
      </Group>
    );
  }

  // ── ACCEPTED: both roles can cancel or complete ──────────────────────────
  if (status === SESSION_STATUS.ACCEPTED) {
    return (
      <Group gap={compact ? 6 : 8}>
        <Tooltip label="Mark session as completed" withArrow>
          <Button
            size={btnSize}
            color="teal"
            variant="light"
            leftSection={<CheckCheck style={{ width: iconSize, height: iconSize }} />}
            loading={isProcessing}
            onClick={() => onComplete?.(id)}
            radius="md"
          >
            Complete
          </Button>
        </Tooltip>
        <Tooltip label="Cancel this session" withArrow>
          <Button
            size={btnSize}
            color="red"
            variant="subtle"
            leftSection={<Ban style={{ width: iconSize, height: iconSize }} />}
            loading={isProcessing}
            onClick={() => onCancel?.(id)}
            radius="md"
          >
            Cancel
          </Button>
        </Tooltip>
      </Group>
    );
  }

  // ── All other statuses: no actions available ─────────────────────────────
  return null;
};

export default SessionActionButtons;
