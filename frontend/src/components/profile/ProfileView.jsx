/**
 * ProfileView.jsx
 * ───────────────
 * Read-only display of the user's full profile.
 * Shown when isEditing = false.
 *
 * All enum → label resolution is done via resolveLabel() from profileEnums.js.
 * No hardcoded label maps in this file.
 *
 * Props:
 *   profile : UserProfileResponseDTO
 *   isDark  : boolean
 */

import { Box, Text, Stack, Group, Grid, ThemeIcon, Divider } from '@mantine/core';
import {
  IconUser, IconFileText, IconMapPin, IconClock,
  IconTarget, IconCalendar, IconHeart, IconBook,
  IconBrain, IconMessageCircle, IconCode, IconLanguage,
  IconClock2, IconSparkles, IconDeviceLaptop,
} from '@tabler/icons-react';

import {
  communicationPaceOptions,
  domainFocusOptions,
  goalTimelineOptions,
  learningGoalOptions,
  learningMethodOptions,
  teachingApproachOptions,
  teachingMotivationOptions,
  resolveLabel,
} from '../../utils/profileEnums';

// ── Info row (icon + label + value) ─────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value, isDark }) => {
  if (!value) return null;
  return (
    <Group gap="sm" align="flex-start" wrap="nowrap">
      <ThemeIcon size={32} radius="md" variant="light" color="violet" style={{ flexShrink: 0, marginTop: 2 }}>
        <Icon size={15} />
      </ThemeIcon>
      <Stack gap={1}>
        <Text size="xs" style={{
          color: isDark ? '#64748b' : '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.6px',
          fontWeight: 600,
        }}>
          {label}
        </Text>
        <Text size="sm" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>
          {value}
        </Text>
      </Stack>
    </Group>
  );
};

// ── Preference chip ──────────────────────────────────────────────────────────
const PrefChip = ({ icon: Icon, label, value, isDark }) => {
  if (!value) return null;
  return (
    <Box style={{
      padding: '0.6rem 1rem',
      borderRadius: 12,
      background: isDark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.05)',
      border: isDark ? '1px solid rgba(139,92,246,0.2)' : '1px solid rgba(139,92,246,0.15)',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}>
      <Group gap={6}>
        <Icon size={13} color="#8b5cf6" />
        <Text size="xs" style={{
          color: isDark ? '#64748b' : '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontWeight: 600,
        }}>
          {label}
        </Text>
      </Group>
      <Text size="sm" fw={600} style={{ color: isDark ? '#a78bfa' : '#7c3aed' }}>
        {value}
      </Text>
    </Box>
  );
};

// ── Section card ──────────────────────────────────────────────────────────────
const Section = ({ title, icon: Icon, children, isDark }) => (
  <Box style={{
    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
    border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
    borderRadius: 16,
    padding: '1.5rem',
    backdropFilter: 'blur(8px)',
  }}>
    <Group gap={10} mb="md">
      <ThemeIcon size={30} radius="md" variant="gradient" gradient={{ from: '#7c3aed', to: '#4f46e5', deg: 135 }}>
        <Icon size={15} color="#fff" />
      </ThemeIcon>
      <Text fw={700} size="sm" style={{ color: isDark ? '#e2e8f0' : '#1e293b', letterSpacing: '0.3px' }}>
        {title}
      </Text>
    </Group>
    {children}
  </Box>
);

// ── Sub-section label ──────────────────────────────────────────────────────────
const SubLabel = ({ children, isDark }) => (
  <Divider
    label={
      <Text size="xs" fw={700} style={{
        color: isDark ? '#475569' : '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
      }}>
        {children}
      </Text>
    }
    labelPosition="left"
    my="sm"
    styles={{ root: { borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)' } }}
  />
);

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({ message, isDark }) => (
  <Box style={{
    padding: '1.25rem',
    borderRadius: 10,
    background: isDark ? 'rgba(139,92,246,0.06)' : 'rgba(139,92,246,0.04)',
    border: isDark ? '1px dashed rgba(139,92,246,0.2)' : '1px dashed rgba(139,92,246,0.15)',
    textAlign: 'center',
  }}>
    <IconSparkles size={24} color="#8b5cf6" style={{ marginBottom: 8 }} />
    <Text size="sm" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>{message}</Text>
  </Box>
);

// ── Main Component ────────────────────────────────────────────────────────────
const ProfileView = ({ profile, isDark }) => {
  const {
    name, bio, location, timezone,
    learningGoal, goalTimeline,
    teachingMotivation, teachingApproach,
    preferredLearningMethod, communicationPace,
    domainFocus, preferredLanguage, hoursPerWeek,
  } = profile;

  // Resolve enum values → human-readable labels
  const learningGoalLabel      = resolveLabel(learningGoalOptions, learningGoal);
  const goalTimelineLabel      = resolveLabel(goalTimelineOptions, goalTimeline);
  const teachingMotivationLabel = resolveLabel(teachingMotivationOptions, teachingMotivation);
  const teachingApproachLabel  = resolveLabel(teachingApproachOptions, teachingApproach);
  const learningMethodLabel    = resolveLabel(learningMethodOptions, preferredLearningMethod);
  const communicationPaceLabel = resolveLabel(communicationPaceOptions, communicationPace);
  const domainFocusLabel       = resolveLabel(domainFocusOptions, domainFocus);

  const hasLearningPrefs = learningGoal || goalTimeline || preferredLearningMethod;
  const hasTeachingPrefs = teachingMotivation || teachingApproach;
  const hasGeneralPrefs  = communicationPace || domainFocus || preferredLanguage || hoursPerWeek;
  const hasAnyPrefs = hasLearningPrefs || hasTeachingPrefs || hasGeneralPrefs;

  return (
    <Stack gap="lg">
      {/* ── Basic Info ── */}
      <Section title="Basic Information" icon={IconUser} isDark={isDark}>
        <Stack gap="md">
          <InfoRow icon={IconUser} label="Name" value={name} isDark={isDark} />

          {bio ? (
            <Group gap="sm" align="flex-start" wrap="nowrap">
              <ThemeIcon size={32} radius="md" variant="light" color="violet" style={{ flexShrink: 0, marginTop: 2 }}>
                <IconFileText size={15} />
              </ThemeIcon>
              <Stack gap={1} style={{ flex: 1 }}>
                <Text size="xs" style={{
                  color: isDark ? '#64748b' : '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  fontWeight: 600,
                }}>
                  Bio
                </Text>
                <Text size="sm" style={{
                  color: isDark ? '#cbd5e1' : '#334155',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}>
                  {bio}
                </Text>
              </Stack>
            </Group>
          ) : (
            <Box style={{
              padding: '0.75rem 1rem',
              borderRadius: 10,
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
              border: isDark ? '1px dashed rgba(255,255,255,0.1)' : '1px dashed rgba(0,0,0,0.1)',
            }}>
              <Text size="sm" style={{ color: isDark ? '#475569' : '#94a3b8', fontStyle: 'italic' }}>
                No bio added yet. Click &quot;Edit Profile&quot; to tell the community about yourself.
              </Text>
            </Box>
          )}

          <Group gap="xl" wrap="wrap">
            <InfoRow icon={IconMapPin} label="Location" value={location} isDark={isDark} />
            <InfoRow icon={IconClock} label="Timezone" value={timezone} isDark={isDark} />
          </Group>
        </Stack>
      </Section>

      {/* ── Matching Preferences ── */}
      <Section title="Matching Preferences" icon={IconSparkles} isDark={isDark}>
        {hasAnyPrefs ? (
          <Stack gap={0}>
            {/* Learning */}
            {hasLearningPrefs && (
              <>
                <SubLabel isDark={isDark}>🎯 Learning</SubLabel>
                <Grid gutter="sm" mb="sm">
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <PrefChip icon={IconTarget} label="Learning Goal" value={learningGoal ? learningGoalLabel : null} isDark={isDark} />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <PrefChip icon={IconCalendar} label="Goal Timeline" value={goalTimeline ? goalTimelineLabel : null} isDark={isDark} />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <PrefChip icon={IconBrain} label="Learning Method" value={preferredLearningMethod ? learningMethodLabel : null} isDark={isDark} />
                  </Grid.Col>
                </Grid>
              </>
            )}

            {/* Teaching */}
            {hasTeachingPrefs && (
              <>
                <SubLabel isDark={isDark}>🎓 Teaching</SubLabel>
                <Grid gutter="sm" mb="sm">
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <PrefChip icon={IconHeart} label="Motivation" value={teachingMotivation ? teachingMotivationLabel : null} isDark={isDark} />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <PrefChip icon={IconBook} label="Approach" value={teachingApproach ? teachingApproachLabel : null} isDark={isDark} />
                  </Grid.Col>
                </Grid>
              </>
            )}

            {/* General */}
            {hasGeneralPrefs && (
              <>
                <SubLabel isDark={isDark}>🌐 General</SubLabel>
                <Grid gutter="sm">
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <PrefChip icon={IconMessageCircle} label="Comm. Pace" value={communicationPace ? communicationPaceLabel : null} isDark={isDark} />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <PrefChip icon={IconCode} label="Domain Focus" value={domainFocus ? domainFocusLabel : null} isDark={isDark} />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <PrefChip icon={IconLanguage} label="Language" value={preferredLanguage || null} isDark={isDark} />
                  </Grid.Col>
                  {hoursPerWeek && (
                    <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                      <PrefChip icon={IconClock2} label="Hours / Week" value={`${hoursPerWeek} hrs`} isDark={isDark} />
                    </Grid.Col>
                  )}
                </Grid>
              </>
            )}
          </Stack>
        ) : (
          <EmptyState
            message="No matching preferences set yet. Edit your profile to help us find better matches!"
            isDark={isDark}
          />
        )}
      </Section>
    </Stack>
  );
};

export default ProfileView;
