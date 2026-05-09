/**
 * VerificationSidebar.jsx
 * ───────────────────────
 * Sticky right panel on the verification test page.
 * Contains: timer, progress bar, question palette, submit button.
 */

import { Box, Text, Button, Group, Progress } from '@mantine/core';
import { IconSend, IconShieldCheck } from '@tabler/icons-react';
import { useSelector } from 'react-redux';
import { selectAnswers } from '../../redux/verificationSlice';
import VerificationTimer from './VerificationTimer';
import QuestionPalette   from './QuestionPalette';

const VerificationSidebar = ({
  test,
  visited,
  onNavigate,
  onSubmit,
  onAutoSubmit,
  submitting,
  isDark,
}) => {
  const answers       = useSelector(selectAnswers);
  const answeredCount = Object.keys(answers).length;
  const total         = test?.questions?.length ?? 0;
  const progress      = total > 0 ? (answeredCount / total) * 100 : 0;

  const sidebarBg     = isDark ? 'rgba(17,19,40,0.9)' : '#ffffff';
  const sidebarBorder = isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)';
  const headingColor  = isDark ? '#e2e8f0' : '#1e293b';
  const subColor      = isDark ? '#64748b' : '#94a3b8';

  return (
    <Box
      style={{
        background:     sidebarBg,
        border:         `1px solid ${sidebarBorder}`,
        borderRadius:   16,
        padding:        '1.25rem',
        backdropFilter: 'blur(10px)',
        boxShadow:      isDark
          ? '0 4px 24px rgba(0,0,0,0.4)'
          : '0 4px 24px rgba(139,92,246,0.08)',
        position:       'sticky',
        top:            80,
      }}
    >
      {/* Header */}
      <Group gap={8} mb="md" align="center">
        <Box
          style={{
            width:          28,
            height:         28,
            borderRadius:   8,
            background:     'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
          }}
        >
          <IconShieldCheck size={14} color="#fff" />
        </Box>
        <Text fw={700} size="sm" style={{ color: headingColor }}>
          Assessment Panel
        </Text>
      </Group>

      {/* Timer */}
      <Box mb="md">
        <Text size="xs" fw={600} mb={6} style={{ color: subColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Time Remaining
        </Text>
        <VerificationTimer onAutoSubmit={onAutoSubmit} />
      </Box>

      {/* Progress */}
      <Box mb="md">
        <Group justify="space-between" mb={6}>
          <Text size="xs" fw={600} style={{ color: subColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Progress
          </Text>
          <Text size="xs" fw={700} style={{ color: '#22c55e' }}>
            {answeredCount} / {total}
          </Text>
        </Group>
        <Progress
          value={progress}
          radius="xl"
          size="sm"
          color="violet"
          animated={progress > 0}
          styles={{
            root: { background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
          }}
        />
        <Text size="xs" mt={4} style={{ color: subColor }}>
          {answeredCount} answered
        </Text>
      </Box>

      {/* Question palette */}
      <Box mb="md">
        <Text
          size="xs"
          fw={600}
          mb={8}
          style={{ color: subColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}
        >
          Questions
        </Text>
        <QuestionPalette
          questions={test?.questions ?? []}
          visited={visited}
          onNavigate={onNavigate}
          isDark={isDark}
        />
      </Box>

      {/* Submit */}
      <Button
        id="submit-test-btn"
        fullWidth
        radius="md"
        size="sm"
        loading={submitting}
        onClick={onSubmit}
        variant="gradient"
        gradient={{ from: '#7c3aed', to: '#4f46e5', deg: 135 }}
        leftSection={!submitting && <IconSend size={14} />}
        style={{ boxShadow: '0 4px 14px rgba(124,58,237,0.35)', fontWeight: 600 }}
      >
        Submit Test
      </Button>
    </Box>
  );
};

export default VerificationSidebar;
