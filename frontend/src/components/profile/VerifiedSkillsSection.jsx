/**
 * VerifiedSkillsSection.jsx
 * ─────────────────────────
 * Displays a list of the user's verified skills in a dedicated section.
 * Only shows skills where verificationStatus === "VERIFIED".
 */

import { useSelector } from 'react-redux';
import { Box, Text, Group, SimpleGrid, ThemeIcon, Divider, Center, Stack } from '@mantine/core';
import { IconShieldCheck, IconTrophy, IconRosetteDiscountCheck, IconCertificate } from '@tabler/icons-react';
import { selectVerifiedBadges, selectBadgesLoading } from '../../redux/verificationSlice';

const VerifiedSkillBadge = ({ skill, isDark }) => {
  return (
    <Box
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(34,197,94,0.03) 100%)'
          : 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(34,197,94,0.01) 100%)',
        border: `1px solid ${isDark ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.3)'}`,
        borderRadius: 14,
        padding: '1.25rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isDark
          ? '0 4px 15px rgba(0,0,0,0.2)'
          : '0 4px 15px rgba(34,197,94,0.05)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = isDark
          ? '0 6px 20px rgba(34,197,94,0.15)'
          : '0 6px 20px rgba(34,197,94,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = isDark
          ? '0 4px 15px rgba(0,0,0,0.2)'
          : '0 4px 15px rgba(34,197,94,0.05)';
      }}
    >
      {/* Background decoration */}
      <IconShieldCheck
        size={80}
        color={isDark ? 'rgba(34,197,94,0.05)' : 'rgba(34,197,94,0.04)'}
        style={{
          position: 'absolute',
          right: -15,
          top: -15,
          transform: 'rotate(15deg)',
          pointerEvents: 'none',
        }}
      />

      <Group wrap="nowrap" align="flex-start" gap="md">
        <ThemeIcon
          size={42}
          radius="md"
          style={{
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
          }}
        >
          <IconRosetteDiscountCheck size={24} color="#fff" />
        </ThemeIcon>

        <Box style={{ flex: 1, zIndex: 1 }}>
          <Text
            fw={700}
            size="md"
            style={{ color: isDark ? '#e2e8f0' : '#1e293b', lineHeight: 1.3, marginBottom: 4 }}
          >
            {skill.skillName}
          </Text>
          <Text size="xs" fw={600} style={{ color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Verified Skill
          </Text>

          <Group gap="sm">
            <Box style={{ background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: 6 }}>
              <Text size="xs" fw={700} style={{ color: '#22c55e' }}>
                Score: {skill.verificationScore ?? 0}%
              </Text>
            </Box>
            {skill.verifiedAt && (
              <Text size="xs" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                {new Date(skill.verifiedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
              </Text>
            )}
          </Group>
        </Box>
      </Group>
    </Box>
  );
};

const VerifiedSkillsSection = ({ isDark }) => {
  const verifiedSkills = useSelector(selectVerifiedBadges);
  const loading = useSelector(selectBadgesLoading);

  const dividerLabelColor = isDark ? '#475569' : '#94a3b8';
  const dividerBorderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';

  return (
    <Box mb="xl">
      <Divider
        label={
          <Group gap={6}>
            <IconTrophy size={14} color="#f59e0b" />
            <Text size="xs" fw={700} style={{ color: dividerLabelColor, letterSpacing: '1px', textTransform: 'uppercase' }}>
              Verified Badges
            </Text>
          </Group>
        }
        labelPosition="left"
        mb="md"
        styles={{ root: { borderColor: dividerBorderColor } }}
      />
      
      <Box
        style={{
          background: isDark ? 'rgba(17,19,40,0.4)' : 'rgba(255,255,255,0.6)',
          border: `1px solid ${isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.2)'}`,
          borderRadius: 18,
          padding: '1.5rem',
          backdropFilter: 'blur(10px)',
        }}
      >
        {loading ? (
          <Text size="sm" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Loading verified badges...</Text>
        ) : verifiedSkills && verifiedSkills.length > 0 ? (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {verifiedSkills.map(skill => (
              <VerifiedSkillBadge key={skill.skillId} skill={skill} isDark={isDark} />
            ))}
          </SimpleGrid>
        ) : (
          <Center py="xl">
            <Stack align="center" gap="sm">
              <ThemeIcon size={64} radius="50%" variant="light" color="gray" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}>
                <IconCertificate size={32} color={isDark ? '#64748b' : '#94a3b8'} />
              </ThemeIcon>
              <Text fw={600} size="md" style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>
                No verified skills yet.
              </Text>
              <Text size="sm" ta="center" style={{ color: isDark ? '#94a3b8' : '#64748b', maxWidth: 300 }}>
                Complete verification tests to earn verified badges and increase trust.
              </Text>
            </Stack>
          </Center>
        )}
      </Box>
    </Box>
  );
};

export default VerifiedSkillsSection;
