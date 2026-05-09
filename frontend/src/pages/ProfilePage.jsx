/**
 * ProfilePage.jsx
 * ───────────────
 * Main profile page container.
 *
 * Layout (top → bottom):
 *   1. Page title bar  — "My Profile" + theme toggle
 *   2. Demo banner     — only when backend is unreachable
 *   3. ProfileHeader   — avatar, name, email (read-only), rating, sessions
 *   4. Profile body    — ProfileView (read) ↔ ProfileEditForm (edit)
 *   5. ProfileStats    — existing stats section (preserved)
 *   6. ProfileSkills   — existing skills section (preserved)
 *
 * State:
 *   isEditing is managed via Redux profileSlice
 *   Loading/updating flags drive skeleton + button states
 */

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Container, Stack, Text, Box, Title, Group, Divider,
  ActionIcon, Tooltip, Transition,
} from '@mantine/core';
import {
  IconUser, IconSun, IconMoon,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

import { useTheme } from '../context/ThemeContext';
import useProfile from '../hooks/useProfile';

import ProfileHeader, { ProfileHeaderSkeleton } from '../components/profile/ProfileHeader';
import ProfileView from '../components/profile/ProfileView';
import ProfileEditForm from '../components/profile/ProfileEditForm';
import ProfileStats, { ProfileStatsSkeleton } from '../components/profile/ProfileStats';
import SkillsSection, { SkillsSectionSkeleton } from '../components/profile/SkillsSection';
import VerifiedSkillsSection from '../components/profile/VerifiedSkillsSection';

import { fetchVerifiedBadges } from '../redux/verificationSlice';

// ── Page ──────────────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const dispatch = useDispatch();
  const { isDark, toggleTheme } = useTheme();

  const {
    profile,
    loading,
    updating,
    error,
    isEditing,
    fetchMyProfile,
    handleEdit,
    handleCancel,
    handleUpdate,
  } = useProfile();

  // ── Fetch on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchMyProfile();
    dispatch(fetchVerifiedBadges());
  }, [fetchMyProfile, dispatch]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSave = async (dto) => {
    const ok = await handleUpdate(dto);
    if (ok) {
      notifications.show({
        id: 'profile-saved',
        title: 'Profile Updated! 🎉',
        message: 'Your changes have been saved successfully.',
        color: 'teal',
        icon: null,
        autoClose: 4000,
        radius: 'md',
      });
    } else {
      notifications.show({
        id: 'profile-save-error',
        title: 'Update Failed',
        message: error || 'Something went wrong. Please try again.',
        color: 'red',
        autoClose: 5000,
        radius: 'md',
      });
    }
    return ok;
  };

  // ── Dynamic styles ──────────────────────────────────────────────────────────
  const pageBg = isDark
    ? 'linear-gradient(180deg, #0d0f1c 0%, #0a0c1a 100%)'
    : 'linear-gradient(180deg, #f0f4ff 0%, #e8f0fe 100%)';
  const titleColor = isDark ? '#e2e8f0' : '#1e293b';
  const dividerLabelColor = isDark ? '#475569' : '#94a3b8';
  const dividerBorderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: pageBg,
        paddingTop: '5.5rem',   /* 16px (navbar wrapper pt-4) + 56px (h-14 nav) + 16px gap */
        paddingBottom: '4rem',
        transition: 'background 0.3s ease',
      }}
    >
      <Container size="lg">
        <Stack gap="xl">

          {/* ── Page Header ── */}
          <Group justify="space-between" align="center">
            <Group gap={10} align="center">
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
                My Profile
              </Title>
            </Group>

            {/* Theme Toggle */}
            <Tooltip label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} position="left">
              <ActionIcon
                id="theme-toggle-btn"
                onClick={toggleTheme}
                variant="light"
                color="violet"
                size="lg"
                radius="md"
                aria-label="Toggle theme"
              >
                {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
              </ActionIcon>
            </Tooltip>
          </Group>

          {/* ── API Error State ── */}
          {!loading && error && !profile && (
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
                {error} — make sure the backend is running on{' '}
                <code style={{ fontSize: '0.85em', color: isDark ? '#a78bfa' : '#7c3aed' }}>localhost:8080</code>
              </Text>
            </Box>
          )}

          {/* ── Profile Header ── */}
          {loading || !profile ? (
            <ProfileHeaderSkeleton isDark={isDark} />
          ) : (
            <ProfileHeader
              profile={profile}
              isEditing={isEditing}
              onEdit={handleEdit}
              onCancel={handleCancel}
              isDark={isDark}
            />
          )}

          {/* ── Profile Body: View / Edit ── */}
          {profile && (
            <Box>
              <Divider
                label={
                  <Text size="xs" fw={600} style={{ color: dividerLabelColor, letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {isEditing ? '✏️ Edit Mode' : '👤 Profile Details'}
                  </Text>
                }
                labelPosition="left"
                mb="lg"
                styles={{ root: { borderColor: dividerBorderColor } }}
              />

              {isEditing ? (
                <Transition mounted={isEditing} transition="fade" duration={200}>
                  {(styles) => (
                    <Box style={styles}>
                      <ProfileEditForm
                        profile={profile}
                        updating={updating}
                        error={error}
                        onSave={handleSave}
                        onCancel={handleCancel}
                        isDark={isDark}
                      />
                    </Box>
                  )}
                </Transition>
              ) : (
                <Transition mounted={!isEditing} transition="fade" duration={200}>
                  {(styles) => (
                    <Box style={styles}>
                      <ProfileView profile={profile} isDark={isDark} />
                    </Box>
                  )}
                </Transition>
              )}
            </Box>
          )}

          {/* ── Stats ── */}
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
            {loading || !profile ? (
              <ProfileStatsSkeleton />
            ) : (
              <ProfileStats profile={profile} />
            )}
          </Box>

          {/* ── Verified Badges ── */}
          <VerifiedSkillsSection isDark={isDark} />

          {/* ── Skills ── */}
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
            {loading || !profile ? (
              <SkillsSectionSkeleton />
            ) : (
              <SkillsSection isDark={isDark} />
            )}
          </Box>

        </Stack>
      </Container>
    </Box>
  );
};

export default ProfilePage;
