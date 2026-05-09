/**
 * VerificationTimer.jsx
 * ─────────────────────
 * Countdown timer for the verification test.
 * Ticks every second via Redux `tickTimer` action.
 * Auto-submits when time reaches zero.
 * Shows red warning when ≤ 2 minutes remain.
 */

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Text, Group } from '@mantine/core';
import { IconClock } from '@tabler/icons-react';
import { tickTimer, selectTimerSeconds } from '../../redux/verificationSlice';

const pad = (n) => String(n).padStart(2, '0');

const VerificationTimer = ({ onAutoSubmit }) => {
  const dispatch = useDispatch();
  const seconds  = useSelector(selectTimerSeconds);
  const intervalRef = useRef(null);

  const mins   = Math.floor(seconds / 60);
  const secs   = seconds % 60;
  const isWarn = seconds <= 120; // ≤ 2 mins → red

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      dispatch(tickTimer());
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [dispatch]);

  // Auto-submit when timer hits zero
  useEffect(() => {
    if (seconds === 0) {
      clearInterval(intervalRef.current);
      onAutoSubmit?.();
    }
  }, [seconds, onAutoSubmit]);

  return (
    <Box
      style={{
        background:   isWarn
          ? 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(220,38,38,0.08) 100%)'
          : 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(79,70,229,0.06) 100%)',
        border:       `1px solid ${isWarn ? 'rgba(239,68,68,0.3)' : 'rgba(139,92,246,0.2)'}`,
        borderRadius: 12,
        padding:      '0.75rem 1rem',
        transition:   'all 0.3s ease',
      }}
    >
      <Group gap={8} justify="center" align="center">
        <IconClock
          size={16}
          color={isWarn ? '#ef4444' : '#8b5cf6'}
          style={{ animation: isWarn ? 'pulse 1s infinite' : 'none' }}
        />
        <Text
          fw={800}
          size="lg"
          style={{
            color:      isWarn ? '#ef4444' : '#8b5cf6',
            fontFamily: 'monospace',
            letterSpacing: '0.05em',
            transition: 'color 0.3s',
          }}
        >
          {pad(mins)}:{pad(secs)}
        </Text>
      </Group>
      {isWarn && (
        <Text size="xs" ta="center" style={{ color: '#ef4444', opacity: 0.8, marginTop: 4 }}>
          Time is running out!
        </Text>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>
    </Box>
  );
};

export default VerificationTimer;
