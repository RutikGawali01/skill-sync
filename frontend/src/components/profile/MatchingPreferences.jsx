/**
 * MatchingPreferences.jsx
 * ───────────────────────
 * Form section: all matching + teaching preference selects.
 * Used inside ProfileEditForm.
 *
 * All enum options are imported from utils/profileEnums.js — never hardcoded here.
 * LearningMethod is split into two grouped selects:
 *   1. "Learning Preference" (Category.PREFERENCE)
 *   2. "Session Style"       (Category.SESSION)
 *
 * Props:
 *   form   : Mantine useForm instance
 *   isDark : boolean
 */

import { Grid, Select, TextInput, NumberInput, Text, Box, ThemeIcon, Group, Divider } from '@mantine/core';
import {
  IconTarget, IconCalendar, IconHeart, IconBook,
  IconBrain, IconMessageCircle, IconCode, IconLanguage,
  IconClock2, IconSparkles, IconDeviceLaptop, IconUsers,
} from '@tabler/icons-react';

import {
  communicationPaceOptions,
  domainFocusOptions,
  goalTimelineOptions,
  learningGoalOptions,
  learningPreferenceOptions,
  sessionStyleOptions,
  teachingApproachOptions,
  teachingMotivationOptions,
} from '../../utils/profileEnums';

// ── Shared input styles ──────────────────────────────────────────────────────
const getInputStyles = (isDark) => ({
  input: {
    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    border: isDark ? '1px solid rgba(139,92,246,0.25)' : '1px solid rgba(139,92,246,0.2)',
    color: isDark ? '#e2e8f0' : '#1e293b',
    borderRadius: 10,
    '&:focus': { borderColor: 'rgba(139,92,246,0.6)' },
  },
  label: {
    color: isDark ? '#94a3b8' : '#64748b',
    fontWeight: 600,
    fontSize: '0.8rem',
    marginBottom: 4,
  },
  description: {
    color: isDark ? '#475569' : '#94a3b8',
    fontSize: '0.73rem',
  },
  dropdown: {
    background: isDark ? '#1a1b2e' : '#fff',
    border: isDark ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(139,92,246,0.2)',
    borderRadius: 12,
  },
  option: {
    color: isDark ? '#e2e8f0' : '#1e293b',
    '&[data-selected]': { background: 'rgba(139,92,246,0.2)' },
    '&[data-hovered]': {
      background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    },
  },
});

// ── Sub-section divider ───────────────────────────────────────────────────────
const SubSection = ({ label, isDark }) => (
  <Divider
    label={
      <Text size="xs" fw={700} style={{
        color: isDark ? '#475569' : '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
      }}>
        {label}
      </Text>
    }
    labelPosition="left"
    my="xs"
    styles={{ root: { borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)' } }}
  />
);

// ── Component ─────────────────────────────────────────────────────────────────
const MatchingPreferences = ({ form, isDark }) => {
  const s = getInputStyles(isDark);
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)';
  const cardBorder = isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)';

  return (
    <Box
      style={{
        background: cardBg,
        border: cardBorder,
        borderRadius: 16,
        padding: '1.5rem',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* ── Section Header ── */}
      <Group gap={10} mb="xs">
        <ThemeIcon
          size={30}
          radius="md"
          variant="gradient"
          gradient={{ from: '#7c3aed', to: '#4f46e5', deg: 135 }}
        >
          <IconSparkles size={15} color="#fff" />
        </ThemeIcon>
        <Text fw={700} size="sm" style={{ color: isDark ? '#e2e8f0' : '#1e293b', letterSpacing: '0.3px' }}>
          Matching Preferences
        </Text>
      </Group>
      <Text size="xs" style={{ color: isDark ? '#475569' : '#94a3b8', marginBottom: '1.25rem', lineHeight: 1.5 }}>
        These help our algorithm find the best skill exchange partners for you.
      </Text>

      {/* ════════════════════════════════════════
          1. LEARNING PREFERENCES
          ════════════════════════════════════════ */}
      <SubSection label="🎯 Learning" isDark={isDark} />
      <Grid gutter="md" mb="md">
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Select
            id="pref-learning-goal"
            label="Learning Goal"
            description="What do you want to achieve?"
            placeholder="Select your learning goal"
            data={learningGoalOptions}
            leftSection={<IconTarget size={15} color="#8b5cf6" />}
            searchable
            clearable
            styles={s}
            {...form.getInputProps('learningGoal')}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Select
            id="pref-goal-timeline"
            label="Goal Timeline"
            description="By when do you want to achieve it?"
            placeholder="Select a timeline"
            data={goalTimelineOptions}
            leftSection={<IconCalendar size={15} color="#8b5cf6" />}
            clearable
            styles={s}
            {...form.getInputProps('goalTimeline')}
          />
        </Grid.Col>

        {/* ── Learning Method: Preference style ── */}
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Select
            id="pref-learning-preference"
            label="Learning Preference"
            description="How do you absorb knowledge best?"
            placeholder="Select your learning style"
            data={learningPreferenceOptions}
            leftSection={<IconBrain size={15} color="#8b5cf6" />}
            searchable
            clearable
            styles={s}
            {...form.getInputProps('preferredLearningMethod')}
          />
        </Grid.Col>

        {/* ── Learning Method: Session style ── */}
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Select
            id="pref-session-style"
            label="Session Style"
            description="How do you prefer live sessions?"
            placeholder="Select session format"
            data={sessionStyleOptions}
            leftSection={<IconDeviceLaptop size={15} color="#8b5cf6" />}
            searchable
            clearable
            styles={s}
            value={form.values.sessionStyle ?? null}
            onChange={(val) => form.setFieldValue('sessionStyle', val)}
            error={form.errors.sessionStyle}
          />
        </Grid.Col>
      </Grid>

      {/* ════════════════════════════════════════
          2. TEACHING PREFERENCES
          ════════════════════════════════════════ */}
      <SubSection label="🎓 Teaching" isDark={isDark} />
      <Grid gutter="md" mb="md">
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Select
            id="pref-teaching-motivation"
            label="Teaching Motivation"
            description="Why do you want to teach?"
            placeholder="Select your motivation"
            data={teachingMotivationOptions}
            leftSection={<IconHeart size={15} color="#8b5cf6" />}
            searchable
            clearable
            styles={s}
            {...form.getInputProps('teachingMotivation')}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Select
            id="pref-teaching-approach"
            label="Teaching Approach"
            description="How do you prefer to teach?"
            placeholder="Select your teaching style"
            data={teachingApproachOptions}
            leftSection={<IconBook size={15} color="#8b5cf6" />}
            searchable
            clearable
            styles={s}
            {...form.getInputProps('teachingApproach')}
          />
        </Grid.Col>
      </Grid>

      {/* ════════════════════════════════════════
          3. GENERAL / DOMAIN
          ════════════════════════════════════════ */}
      <SubSection label="🌐 General" isDark={isDark} />
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Select
            id="pref-comm-pace"
            label="Communication Pace"
            description="Preferred session speed?"
            placeholder="Select a pace"
            data={communicationPaceOptions}
            leftSection={<IconMessageCircle size={15} color="#8b5cf6" />}
            clearable
            styles={s}
            {...form.getInputProps('communicationPace')}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Select
            id="pref-domain-focus"
            label="Domain Focus"
            description="Your primary technical domain"
            placeholder="Select your domain"
            data={domainFocusOptions}
            leftSection={<IconCode size={15} color="#8b5cf6" />}
            searchable
            clearable
            styles={s}
            {...form.getInputProps('domainFocus')}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            id="pref-preferred-language"
            label="Preferred Language"
            description="Language for sessions"
            placeholder="e.g. English, Hindi, Marathi"
            leftSection={<IconLanguage size={15} color="#8b5cf6" />}
            styles={s}
            {...form.getInputProps('preferredLanguage')}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6 }}>
          <NumberInput
            id="pref-hours-per-week"
            label="Hours Per Week"
            description="How many hours can you commit?"
            placeholder="e.g. 5"
            min={1}
            max={40}
            leftSection={<IconClock2 size={15} color="#8b5cf6" />}
            styles={s}
            {...form.getInputProps('hoursPerWeek')}
          />
        </Grid.Col>
      </Grid>
    </Box>
  );
};

export default MatchingPreferences;
