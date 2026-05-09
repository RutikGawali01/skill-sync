/**
 * StartVerificationModal.jsx
 * ──────────────────────────
 * Professional confirmation modal shown before starting the AI skill
 * verification test. Communicates rules clearly and sets expectations.
 */

import {
  Modal, Box, Text, Group, Stack, Button, ThemeIcon, List,
} from '@mantine/core';
import {
  IconShieldCheck, IconClock, IconQuestionMark,
  IconTrophy, IconAlertTriangle, IconRocket,
} from '@tabler/icons-react';

const RuleItem = ({ icon: Icon, color, text }) => (
  <Group gap={10} align="flex-start" wrap="nowrap">
    <ThemeIcon
      size={28}
      radius="md"
      style={{
        background: `${color}18`,
        border:     `1px solid ${color}35`,
        flexShrink: 0,
        marginTop:  2,
      }}
    >
      <Icon size={14} color={color} />
    </ThemeIcon>
    <Text size="sm" style={{ color: '#94a3b8', lineHeight: 1.6 }}>
      {text}
    </Text>
  </Group>
);

const StartVerificationModal = ({
  opened,
  onClose,
  onStart,
  skill,
  loading,
  isDark,
}) => {
  const bg     = isDark ? '#0f1117' : '#ffffff';
  const border = isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.15)';
  const title  = isDark ? '#e2e8f0' : '#1e293b';

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="md"
      withCloseButton={!loading}
      styles={{
        content: {
          background:   bg,
          border:       `1px solid ${border}`,
          borderRadius: 20,
          overflow:     'hidden',
        },
        header: { background: 'transparent', paddingBottom: 0 },
        body:   { padding: '1.25rem 1.5rem 1.5rem' },
      }}
      title={null}
    >
      {/* Header gradient band */}
      <Box
        style={{
          background:   'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(79,70,229,0.1) 100%)',
          border:       `1px solid rgba(139,92,246,0.2)`,
          borderRadius: 14,
          padding:      '1.25rem',
          marginBottom: '1.25rem',
          textAlign:    'center',
        }}
      >
        <Box
          style={{
            width:          52,
            height:         52,
            borderRadius:   14,
            background:     'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            margin:         '0 auto 0.75rem',
            boxShadow:      '0 8px 20px rgba(124,58,237,0.4)',
          }}
        >
          <IconShieldCheck size={26} color="#fff" />
        </Box>

        <Text fw={700} size="lg" style={{ color: title, marginBottom: 4 }}>
          Skill Verification Test
        </Text>
        <Text size="sm" style={{ color: '#8b5cf6', fontWeight: 600 }}>
          {skill?.skillName ?? 'Skill'} — {skill?.level ?? 'Intermediate'}
        </Text>
      </Box>

      {/* Rules */}
      <Stack gap={10} mb="xl">
        <RuleItem
          icon={IconQuestionMark}
          color="#8b5cf6"
          text="10 AI-generated multiple choice questions tailored to your skill."
        />
        <RuleItem
          icon={IconClock}
          color="#f59e0b"
          text="15-minute timer. The test auto-submits when time runs out."
        />
        <RuleItem
          icon={IconTrophy}
          color="#22c55e"
          text="Score 70% or above to receive a Verified badge on your skill."
        />
        <RuleItem
          icon={IconAlertTriangle}
          color="#ef4444"
          text="You cannot pause or restart once the test has begun."
        />
        <RuleItem
          icon={IconRocket}
          color="#06b6d4"
          text="If you fail, you can retry after a 24-hour cooldown period."
        />
      </Stack>

      {/* Action buttons */}
      <Group grow gap="sm">
        <Button
          variant="subtle"
          color="gray"
          radius="md"
          size="sm"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          id="start-verification-test-btn"
          radius="md"
          size="sm"
          loading={loading}
          onClick={onStart}
          variant="gradient"
          gradient={{ from: '#7c3aed', to: '#4f46e5', deg: 135 }}
          leftSection={!loading && <IconRocket size={15} />}
          style={{ boxShadow: '0 4px 14px rgba(124,58,237,0.4)', fontWeight: 600 }}
        >
          Start Test
        </Button>
      </Group>
    </Modal>
  );
};

export default StartVerificationModal;
