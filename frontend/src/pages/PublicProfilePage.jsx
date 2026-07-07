/**
 * PublicProfilePage.jsx
 * ───────────────
 * Public profile page container (/users/:userId).
 * Displays another user's profile in completely read-only mode.
 * Reuses the same design, layout, spacing, and theme as the main ProfilePage.jsx.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Stack, Text, Box, Title, Group, Divider,
  ActionIcon, Tooltip,
} from '@mantine/core';
import {
  IconUser, IconArrowLeft,
} from '@tabler/icons-react';

import { useTheme } from '../context/ThemeContext';
import { getUserProfile } from '../services/profileService';
import { getUserSkillsByUserId } from '../services/skillService';
import { getVerifiedBadgesByUserId } from '../services/verificationService';
import { getUserAvailability } from '../services/availabilityService';
import useReview from '../hooks/useReview';

import ProfileHeader, { ProfileHeaderSkeleton } from '../components/profile/ProfileHeader';
import ProfileView from '../components/profile/ProfileView';
import ProfileStats, { ProfileStatsSkeleton } from '../components/profile/ProfileStats';
import SkillsSection, { SkillsSectionSkeleton } from '../components/profile/SkillsSection';
import VerifiedSkillsSection from '../components/profile/VerifiedSkillsSection';
import AvailabilityPreviewCard from '../components/profile/AvailabilityPreviewCard';
import TrustScoreCard from '../components/review/TrustScoreCard';

const PublicProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const {
    trustData,
    trustLoading,
    trustError,
    loadTrustScore,
  } = useReview();

  // ── Local State ────────────────────────────────────────────────────────────
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [badges, setBadges] = useState([]);
  const [availability, setAvailability] = useState([]);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [loadingBadges, setLoadingBadges] = useState(true);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [error, setError] = useState(null);

  // ── Fetch on mount/userId change ──────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    const fetchAllData = async () => {
      setLoadingProfile(true);
      setLoadingSkills(true);
      setLoadingBadges(true);
      setLoadingAvailability(true);
      setError(null);

      try {
        // Fetch Profile details
        const profileData = await getUserProfile(userId);
        setProfile(profileData);
        setLoadingProfile(false);

        // Fetch user skills
        const skillsData = await getUserSkillsByUserId(userId);
        setSkills(skillsData);
        setLoadingSkills(false);

        // Fetch verified badges
        const badgesData = await getVerifiedBadgesByUserId(userId);
        setBadges(badgesData);
        setLoadingBadges(false);

        // Fetch availability
        const availabilityData = await getUserAvailability(userId);
        setAvailability(availabilityData);
        setLoadingAvailability(false);

        // Fetch trust score
        loadTrustScore(userId);

      } catch (err) {
        console.error("Error loading public profile:", err);
        setError(err?.response?.data?.message || 'Failed to load profile. Please make sure the user exists.');
        setLoadingProfile(false);
        setLoadingSkills(false);
        setLoadingBadges(false);
        setLoadingAvailability(false);
      }
    };

    fetchAllData();
  }, [userId, loadTrustScore]);

  // ── Dynamic styles ──────────────────────────────────────────────────────────
  const pageBg = isDark
    ? 'linear-gradient(180deg, #0d0f1c 0%, #0a0c1a 100%)'
    : 'linear-gradient(180deg, #f0f4ff 0%, #e8f0fe 100%)';
  const titleColor = isDark ? '#e2e8f0' : '#1e293b';
  const dividerLabelColor = isDark ? '#475569' : '#94a3b8';
  const dividerBorderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: pageBg,
        paddingTop: '5.5rem',
        paddingBottom: '4rem',
        transition: 'background 0.3s ease',
      }}
    >
      <Container size="lg">
        <Stack gap="xl">

          {/* ── Page Header ── */}
          <Group justify="space-between" align="center">
            <Group gap={10} align="center">
              <Tooltip label="Go back" position="right">
                <ActionIcon
                  onClick={handleBack}
                  variant="light"
                  color="violet"
                  size="lg"
                  radius="md"
                  aria-label="Go back"
                >
                  <IconArrowLeft size={18} />
                </ActionIcon>
              </Tooltip>
              <Box
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(139,92,246,0.18)',
                  border: '1px solid rgba(139,92,246,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconUser size={18} color="#8b5cf6" />
              </Box>
              <Title
                order={1}
                style={{
                  color: titleColor,
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  letterSpacing: '-0.3px',
                  transition: 'color 0.3s ease',
                }}
              >
                {profile ? `${profile.name}'s Profile` : 'Member Profile'}
              </Title>
            </Group>
          </Group>

          {/* ── API Error State ── */}
          {!loadingProfile && error && (
            <Box
              style={{
                background: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.05)',
                border: `1px solid ${isDark ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.2)'}`,
                borderRadius: 12,
                padding: '1.25rem 1.5rem',
                textAlign: 'center',
              }}
            >
              <Text fw={600} style={{ color: '#f87171', marginBottom: 4 }}>Failed to load profile</Text>
              <Text size="sm" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                {error}
              </Text>
            </Box>
          )}

          {/* ── Profile Header ── */}
          {loadingProfile ? (
            <ProfileHeaderSkeleton isDark={isDark} />
          ) : profile ? (
            <ProfileHeader
              profile={profile}
              isEditing={false}
              onEdit={null}
              onCancel={null}
              isDark={isDark}
              readOnly={true}
            />
          ) : null}

          {/* ── Profile Body: Details ── */}
          {profile && (
            <Box>
              <Divider
                label={
                  <Text size="xs" fw={600} style={{ color: dividerLabelColor, letterSpacing: '1px', textTransform: 'uppercase' }}>
                    👤 Profile Details
                  </Text>
                }
                labelPosition="left"
                mb="lg"
                styles={{ root: { borderColor: dividerBorderColor } }}
              />
              <ProfileView profile={profile} isDark={isDark} />
            </Box>
          )}

          {/* ── Stats ── */}
          {profile && (
            <Box>
              <Divider
                label={
                  <Text size="xs" fw={600} style={{ color: dividerLabelColor, letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Platform Stats
                  </Text>
                }
                labelPosition="left"
                mb="md"
                styles={{ root: { borderColor: dividerBorderColor } }}
              />
              <ProfileStats profile={profile} />
            </Box>
          )}

          {/* ── Verified Badges ── */}
          {profile && (
            <VerifiedSkillsSection
              isDark={isDark}
              verifiedSkills={badges}
              loading={loadingBadges}
            />
          )}

          {/* ── Availability Preview ── */}
          {profile && (
            <Box>
              <Divider
                label={
                  <Text size="xs" fw={600} style={{ color: dividerLabelColor, letterSpacing: '1px', textTransform: 'uppercase' }}>
                    📅 Availability
                  </Text>
                }
                labelPosition="left"
                mb="md"
                styles={{ root: { borderColor: dividerBorderColor } }}
              />
              <AvailabilityPreviewCard
                isDark={isDark}
                slots={availability}
                loading={loadingAvailability}
                readOnly={true}
              />
            </Box>
          )}

          {/* ── Reviews & Trust ── */}
          {profile && (
            <Box>
              <Divider
                label={
                  <Text size="xs" fw={600} style={{ color: dividerLabelColor, letterSpacing: '1px', textTransform: 'uppercase' }}>
                    ⭐ Reviews & Trust
                  </Text>
                }
                labelPosition="left"
                mb="md"
                styles={{ root: { borderColor: dividerBorderColor } }}
              />
              <TrustScoreCard
                trustData={trustData}
                loading={trustLoading}
                error={trustError}
                isDark={isDark}
              />
            </Box>
          )}

          {/* ── Skills ── */}
          {profile && (
            <Box>
              <Divider
                label={
                  <Text size="xs" fw={600} style={{ color: dividerLabelColor, letterSpacing: '1px', textTransform: 'uppercase' }}>
                    ✦ Skills
                  </Text>
                }
                labelPosition="left"
                mb="md"
                styles={{ root: { borderColor: dividerBorderColor } }}
              />
              <SkillsSection
                isDark={isDark}
                skills={skills}
                loading={loadingSkills}
                readOnly={true}
              />
            </Box>
          )}

        </Stack>
      </Container>
    </Box>
  );
};

export default PublicProfilePage;
