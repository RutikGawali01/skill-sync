/**
 * ProfileSkills.jsx
 * ─────────────────
 * Renders the "Skills Offered" and "Skills Wanted" sections.
 *
 * Each skill shows:
 *   - Skill name
 *   - Level pill (BEGINNER / INTERMEDIATE / ADVANCED)
 *
 * Props:
 *   skillsOffered : Array<{ name: string, level: string }>
 *   skillsWanted  : Array<{ name: string, level: string }>
 */

import { Box, Text, Badge, Group, Stack, Skeleton, SimpleGrid } from '@mantine/core';
import { IconBrain, IconSearch } from '@tabler/icons-react';

// ── Level → style map ────────────────────────────────────────────────────────
const LEVEL_CONFIG = {
  BEGINNER:     { label: 'Beginner',     color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',  dot: '#06b6d4' },
  INTERMEDIATE: { label: 'Intermediate', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', dot: '#f59e0b' },
  ADVANCED:     { label: 'Advanced',     color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', dot: '#8b5cf6' },
};

// ── Individual Skill Card ────────────────────────────────────────────────────
const SkillCard = ({ name, level, accentColor }) => {
  const config = LEVEL_CONFIG[level?.toUpperCase()] ?? LEVEL_CONFIG.BEGINNER;

  return (
    <Box
      style={{
        background: 'rgba(26, 27, 46, 0.8)',
        border: `1px solid ${accentColor}22`,
        borderRadius: 12,
        padding: '0.8rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = `${accentColor}55`;
        e.currentTarget.style.boxShadow = `0 6px 20px ${accentColor}18`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = `${accentColor}22`;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Skill name + dot */}
      <Group gap={8} align="center">
        <Box
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: config.dot,
            boxShadow: `0 0 6px ${config.dot}`,
            flexShrink: 0,
          }}
        />
        <Text size="sm" fw={600} style={{ color: '#e2e8f0' }}>
          {name}
        </Text>
      </Group>

      {/* Level badge */}
      <Box
        style={{
          background: config.bg,
          border: `1px solid ${config.color}33`,
          borderRadius: 6,
          padding: '2px 8px',
        }}
      >
        <Text size="xs" fw={700} style={{ color: config.color, letterSpacing: '0.5px' }}>
          {config.label}
        </Text>
      </Box>
    </Box>
  );
};

// ── Skills Section Block ─────────────────────────────────────────────────────
const SkillsBlock = ({ title, icon: Icon, skills, accentColor, emptyMessage }) => (
  <Box
    style={{
      background: 'linear-gradient(145deg, rgba(26,27,46,0.9) 0%, rgba(15,22,60,0.85) 100%)',
      border: `1px solid ${accentColor}22`,
      borderRadius: 18,
      padding: '1.5rem',
    }}
  >
    {/* Section header */}
    <Group gap={10} mb="md" align="center">
      <Box
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: `${accentColor}18`,
          border: `1px solid ${accentColor}33`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={20} color={accentColor} />
      </Box>
      <Stack gap={0}>
        <Text fw={700} size="md" style={{ color: '#e2e8f0' }}>{title}</Text>
        <Text size="xs" style={{ color: '#64748b' }}>
          {skills?.length ?? 0} skill{skills?.length !== 1 ? 's' : ''}
        </Text>
      </Stack>
    </Group>

    {/* Skills list */}
    {!skills?.length ? (
      <Box
        style={{
          textAlign: 'center',
          padding: '2rem',
          border: `1px dashed ${accentColor}22`,
          borderRadius: 12,
        }}
      >
        <Text size="sm" style={{ color: '#475569' }}>{emptyMessage}</Text>
      </Box>
    ) : (
      <Stack gap={8}>
        {skills.map((skill, idx) => (
          <SkillCard
            key={`${skill.name}-${idx}`}
            name={skill.name}
            level={skill.level}
            accentColor={accentColor}
          />
        ))}
      </Stack>
    )}
  </Box>
);

// ── Skeleton ─────────────────────────────────────────────────────────────────
export const ProfileSkillsSkeleton = () => (
  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
    <Skeleton height={250} radius={18} />
    <Skeleton height={250} radius={18} />
  </SimpleGrid>
);

// ── Main Component ───────────────────────────────────────────────────────────
const ProfileSkills = ({ skillsOffered = [], skillsWanted = [] }) => (
  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
    <SkillsBlock
      title="Skills I Offer"
      icon={IconBrain}
      skills={skillsOffered}
      accentColor="#22c55e"
      emptyMessage="No skills offered yet. Add skills to start matching!"
    />
    <SkillsBlock
      title="Skills I Want to Learn"
      icon={IconSearch}
      skills={skillsWanted}
      accentColor="#8b5cf6"
      emptyMessage="No skills requested yet. Add what you want to learn!"
    />
  </SimpleGrid>
);

export default ProfileSkills;
