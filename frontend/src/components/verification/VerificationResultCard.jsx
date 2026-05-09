/**
 * VerificationResultCard.jsx
 * ──────────────────────────
 * Displays the result card for pass or fail with score breakdown.
 * Pass: confetti-like gradient, trophy icon, green success state.
 * Fail: red/orange state with retry information and motivational message.
 */

import { Box, Text, Group, Stack, ThemeIcon, Button, Progress } from '@mantine/core';
import {
  IconTrophy, IconShieldCheck, IconX, IconRocket,
  IconClock, IconChartBar,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

const PASSING_SCORE = 70;

const ScoreRing = ({ score, passed }) => {
  const color = passed ? '#22c55e' : '#ef4444';
  const bg    = passed
    ? 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.1))'
    : 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(249,115,22,0.1))';

  return (
    <Box
      style={{
        width:          120,
        height:         120,
        borderRadius:   '50%',
        background:     bg,
        border:         `3px solid ${color}`,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        boxShadow:      `0 0 30px ${color}40`,
        margin:         '0 auto',
      }}
    >
      <Text fw={800} size="xl" style={{ color, lineHeight: 1 }}>
        {score}%
      </Text>
      <Text size="xs" style={{ color, opacity: 0.75 }}>Score</Text>
    </Box>
  );
};

const VerificationResultCard = ({ result, skillName, isDark }) => {
  const navigate = useNavigate();
  const passed   = result?.isVerified ?? (result?.result === 'PASSED');
  const score    = result?.scorePercentage ?? 0;
  const statusText = result?.result || (passed ? 'PASSED' : 'FAILED');

  const bgGrad = passed
    ? isDark
      ? 'linear-gradient(160deg, rgba(16,185,129,0.08) 0%, rgba(17,19,40,0.9) 60%)'
      : 'linear-gradient(160deg, rgba(16,185,129,0.06) 0%, rgba(255,255,255,1) 60%)'
    : isDark
      ? 'linear-gradient(160deg, rgba(239,68,68,0.08) 0%, rgba(17,19,40,0.9) 60%)'
      : 'linear-gradient(160deg, rgba(239,68,68,0.05) 0%, rgba(255,255,255,1) 60%)';

  const borderColor = passed
    ? 'rgba(34,197,94,0.25)'
    : 'rgba(239,68,68,0.2)';

  const headingColor = isDark ? '#e2e8f0' : '#1e293b';
  const subColor     = isDark ? '#64748b'  : '#94a3b8';

  return (
    <Box
      style={{
        background:     bgGrad,
        border:         `1px solid ${borderColor}`,
        borderRadius:   20,
        padding:        '2rem',
        backdropFilter: 'blur(12px)',
        boxShadow:      isDark
          ? '0 8px 40px rgba(0,0,0,0.4)'
          : '0 8px 40px rgba(0,0,0,0.08)',
        maxWidth:       520,
        margin:         '0 auto',
        textAlign:      'center',
      }}
    >
      {/* Status icon */}
      <ThemeIcon
        size={64}
        radius="50%"
        style={{
          background:  passed
            ? 'linear-gradient(135deg, #22c55e, #16a34a)'
            : 'linear-gradient(135deg, #ef4444, #dc2626)',
          margin:      '0 auto 1.25rem',
          boxShadow:   passed
            ? '0 8px 24px rgba(34,197,94,0.5)'
            : '0 8px 24px rgba(239,68,68,0.5)',
          display:     'flex',
          alignItems:  'center',
          justifyContent: 'center',
        }}
      >
        {passed
          ? <IconTrophy size={28} color="#fff" />
          : <IconX size={28} color="#fff" />
        }
      </ThemeIcon>

      {/* Headline */}
      <Text fw={800} size="xl" mb={4} style={{ color: headingColor }}>
        {passed ? '🎉 Skill Verified!' : '❌ Verification Failed'}
      </Text>
      <Text size="sm" mb="xl" style={{ color: subColor }}>
        {skillName}
        {passed
          ? ' — You have demonstrated proficiency.'
          : ' — Keep practicing and try again.'}
      </Text>

      {/* Score ring */}
      <Box mb="xl">
        <ScoreRing score={score} passed={passed} />
      </Box>

      {/* Stats */}
      <Stack gap={12} mb="xl">
        <Box
          style={{
            background:   isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
            borderRadius: 12,
            padding:      '0.75rem 1rem',
          }}
        >
          <Group justify="space-between" mb={8}>
            <Group gap={6}>
              <IconChartBar size={14} color={passed ? '#22c55e' : '#ef4444'} />
              <Text size="xs" style={{ color: subColor }}>Your Score</Text>
            </Group>
            <Text size="sm" fw={700} style={{ color: passed ? '#22c55e' : '#ef4444' }}>
              {score}%
            </Text>
          </Group>
          <Progress
            value={score}
            color={passed ? 'green' : 'red'}
            radius="xl"
            size="sm"
            styles={{ root: { background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' } }}
          />
        </Box>

        <Group grow gap="sm">
          <Box
            style={{
              background:   passed ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.06)',
              borderRadius: 10,
              padding:      '0.6rem',
              border:       `1px solid ${passed ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.15)'}`,
            }}
          >
            <Text size="xs" style={{ color: subColor }}>Required</Text>
            <Text fw={700} size="sm" style={{ color: passed ? '#22c55e' : '#ef4444' }}>
              {PASSING_SCORE}%
            </Text>
          </Box>

          <Box
            style={{
              background:   'rgba(139,92,246,0.08)',
              borderRadius: 10,
              padding:      '0.6rem',
              border:       '1px solid rgba(139,92,246,0.2)',
            }}
          >
            <Text size="xs" style={{ color: subColor }}>Status</Text>
            <Text fw={700} size="sm" style={{ color: '#8b5cf6' }}>
              {statusText}
            </Text>
          </Box>
        </Group>

        {!passed && (
          <Group
            gap={8}
            style={{
              background:   'rgba(249,115,22,0.08)',
              border:       '1px solid rgba(249,115,22,0.2)',
              borderRadius: 10,
              padding:      '0.7rem 1rem',
            }}
          >
            <IconClock size={14} color="#f97316" />
            <Text size="xs" style={{ color: '#f97316', fontWeight: 600 }}>
              Retry available after 24 hours
            </Text>
          </Group>
        )}
      </Stack>

      {/* Actions */}
      <Group grow gap="sm">
        <Button
          variant="subtle"
          color="gray"
          radius="md"
          size="sm"
          onClick={() => navigate('/profile')}
        >
          Back to Profile
        </Button>
        {passed && (
          <Button
            radius="md"
            size="sm"
            variant="gradient"
            gradient={{ from: '#22c55e', to: '#16a34a', deg: 135 }}
            leftSection={<IconShieldCheck size={14} />}
            onClick={() => navigate('/profile')}
            style={{ boxShadow: '0 4px 14px rgba(34,197,94,0.4)', fontWeight: 600 }}
          >
            View Badge
          </Button>
        )}
        {!passed && (
          <Button
            radius="md"
            size="sm"
            variant="gradient"
            gradient={{ from: '#f97316', to: '#dc2626', deg: 135 }}
            leftSection={<IconRocket size={14} />}
            onClick={() => navigate('/profile')}
            style={{ boxShadow: '0 4px 14px rgba(249,115,22,0.3)', fontWeight: 600 }}
          >
            Keep Practicing
          </Button>
        )}
      </Group>
    </Box>
  );
};

export default VerificationResultCard;
