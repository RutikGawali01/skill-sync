/**
 * ProfileEditForm.jsx
 * ───────────────────
 * Full edit form for user profile.
 * Shown when isEditing = true.
 *
 * Sections:
 *  1. Profile Picture upload
 *  2. Basic Info  — name (required), bio (max 1000), location, timezone
 *  3. MatchingPreferences (imported)
 *  4. Action buttons: Save Changes | Cancel
 *
 * Props:
 *   profile    : UserProfileResponseDTO (initial values)
 *   updating   : boolean (from Redux)
 *   error      : string | null (from Redux)
 *   onSave     : (dto) => Promise<boolean>
 *   onCancel   : () => void
 *   isDark     : boolean
 */

import { useEffect, useRef, useState } from 'react';
import {
  Stack, TextInput, Textarea, Box, Button, Group,
  Text, Avatar, Alert, ThemeIcon, Divider, Notification,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconUpload, IconX, IconAlertCircle, IconCheck,
  IconUser, IconFileText, IconMapPin, IconClock, IconSparkles,
} from '@tabler/icons-react';
import MatchingPreferences from './MatchingPreferences';

// ── Shared input styles ──────────────────────────────────────────────────────
const getInputStyles = (isDark) => ({
  input: {
    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    border: isDark ? '1px solid rgba(139,92,246,0.25)' : '1px solid rgba(139,92,246,0.2)',
    color: isDark ? '#e2e8f0' : '#1e293b',
    borderRadius: 10,
    '&:focus': { borderColor: 'rgba(139,92,246,0.6)' },
    '&::placeholder': { color: isDark ? '#475569' : '#94a3b8' },
  },
  label: {
    color: isDark ? '#94a3b8' : '#64748b',
    fontWeight: 600,
    fontSize: '0.8rem',
    marginBottom: 4,
  },
  description: { color: isDark ? '#475569' : '#94a3b8' },
  error: { color: '#f87171' },
});

// ── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ title, icon: Icon, children, isDark }) => (
  <Box
    style={{
      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
      border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
      borderRadius: 16,
      padding: '1.5rem',
      backdropFilter: 'blur(8px)',
    }}
  >
    <Group gap={10} mb="lg">
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

// ── Component ─────────────────────────────────────────────────────────────────
const ProfileEditForm = ({ profile, updating, error, onSave, onCancel, isDark }) => {
  const [previewUrl, setPreviewUrl] = useState(profile?.profilePicUrl || null);
  const [picFile, setPicFile] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const inputStyles = getInputStyles(isDark);

  // ── Mantine form ──────────────────────────────────────────────────────────
  const form = useForm({
    initialValues: {
      name: profile?.name || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      timezone: profile?.timezone || '',
      // Matching preferences
      learningGoal:            profile?.learningGoal            || null,
      goalTimeline:            profile?.goalTimeline            || null,
      teachingMotivation:      profile?.teachingMotivation      || null,
      teachingApproach:        profile?.teachingApproach        || null,
      preferredLearningMethod: profile?.preferredLearningMethod || null,
      // sessionStyle is a UI-only split of LearningMethod (Category.SESSION)
      // It is NOT a separate backend field — we send it as preferredLearningMethod
      // if the user picks a SESSION-category value instead of a PREFERENCE one.
      sessionStyle:            profile?.sessionStyle            || null,
      communicationPace:       profile?.communicationPace       || null,
      domainFocus:             profile?.domainFocus             || null,
      preferredLanguage:       profile?.preferredLanguage       || '',
      hoursPerWeek:            profile?.hoursPerWeek            || null,
    },
    validate: {
      name: (value) =>
        !value?.trim() ? 'Name is required' : value.trim().length < 2 ? 'Name must be at least 2 characters' : null,
      bio: (value) =>
        value?.length > 1000 ? 'Bio must be 1000 characters or less' : null,
      hoursPerWeek: (value) =>
        value !== null && value !== undefined && value <= 0 ? 'Hours per week must be greater than 0' : null,
    },
  });

  // Re-seed form when profile prop changes (e.g. after successful save)
  useEffect(() => {
    if (profile) {
      form.setValues({
        name:                    profile.name                    || '',
        bio:                     profile.bio                     || '',
        location:                profile.location                || '',
        timezone:                profile.timezone                || '',
        learningGoal:            profile.learningGoal            || null,
        goalTimeline:            profile.goalTimeline            || null,
        teachingMotivation:      profile.teachingMotivation      || null,
        teachingApproach:        profile.teachingApproach        || null,
        preferredLearningMethod: profile.preferredLearningMethod || null,
        sessionStyle:            profile.sessionStyle            || null,
        communicationPace:       profile.communicationPace       || null,
        domainFocus:             profile.domainFocus             || null,
        preferredLanguage:       profile.preferredLanguage       || '',
        hoursPerWeek:            profile.hoursPerWeek            || null,
      });
      setPreviewUrl(profile.profilePicUrl || null);
      setPicFile(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPicFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemovePic = () => {
    setPicFile(null);
    setPreviewUrl(profile?.profilePicUrl || null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = form.onSubmit(async (values) => {
    setSuccess(false);

    // sessionStyle is UI-only — remove it before sending to backend.
    // The user may pick either a PREFERENCE or SESSION method in the form;
    // whichever is set in preferredLearningMethod wins.
    // eslint-disable-next-line no-unused-vars
    const { sessionStyle, ...rest } = values;

    // Strip null / empty-string values so backend ignores unset optional fields.
    const payload = Object.fromEntries(
      Object.entries(rest).filter(([, v]) => v !== null && v !== undefined && v !== '')
    );

    const ok = await onSave(payload);
    if (ok) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  });

  const nameBg = isDark ? 'rgba(255,255,255,0.03)' : '#fff';

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack gap="lg">

        {/* ── Profile Picture ── */}
        <Section title="Profile Photo" icon={IconUpload} isDark={isDark}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Box style={{ position: 'relative', flexShrink: 0 }}>
              <Avatar
                src={previewUrl}
                alt="Profile preview"
                size={90}
                radius="50%"
                color="violet"
                style={{
                  border: '3px solid rgba(139,92,246,0.5)',
                  boxShadow: '0 0 16px rgba(139,92,246,0.3)',
                  fontSize: '2rem',
                  fontWeight: 700,
                }}
              >
                {profile?.name?.charAt(0)?.toUpperCase()}
              </Avatar>

              {picFile && (
                <Box
                  onClick={handleRemovePic}
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: `2px solid ${isDark ? '#1a1b2e' : '#f8fafc'}`,
                    zIndex: 1,
                  }}
                >
                  <IconX size={12} color="#fff" />
                </Box>
              )}
            </Box>

            <Stack gap="xs" style={{ flex: 1 }}>
              <input
                ref={fileInputRef}
                id="profile-pic-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <Button
                variant="light"
                color="violet"
                size="sm"
                radius="md"
                leftSection={<IconUpload size={14} />}
                onClick={() => fileInputRef.current?.click()}
                style={{ width: 'fit-content' }}
              >
                {picFile ? 'Change Photo' : 'Upload Photo'}
              </Button>
              {picFile ? (
                <Text size="xs" style={{ color: '#8b5cf6' }}>{picFile.name}</Text>
              ) : (
                <Text size="xs" style={{ color: isDark ? '#475569' : '#94a3b8' }}>
                  JPG, PNG or GIF. Max 5MB.
                </Text>
              )}
            </Stack>
          </Box>
        </Section>

        {/* ── Basic Info ── */}
        <Section title="Basic Information" icon={IconUser} isDark={isDark}>
          <Stack gap="md">
            <TextInput
              id="edit-name"
              label="Full Name"
              placeholder="Your full name"
              required
              leftSection={<IconUser size={15} color="#8b5cf6" />}
              styles={inputStyles}
              {...form.getInputProps('name')}
            />

            <Textarea
              id="edit-bio"
              label="Bio"
              placeholder="Tell the community what you do, what you can teach, and what you're learning..."
              autosize
              minRows={3}
              maxRows={7}
              styles={{
                ...inputStyles,
                input: {
                  ...inputStyles.input,
                  resize: 'none',
                },
              }}
              description={`${form.values.bio?.length ?? 0} / 1000 characters`}
              {...form.getInputProps('bio')}
            />

            <Group grow gap="md">
              <TextInput
                id="edit-location"
                label="Location"
                placeholder="e.g. Pune, India"
                leftSection={<IconMapPin size={15} color="#8b5cf6" />}
                styles={inputStyles}
                {...form.getInputProps('location')}
              />

              <TextInput
                id="edit-timezone"
                label="Timezone"
                placeholder="e.g. Asia/Kolkata"
                leftSection={<IconClock size={15} color="#8b5cf6" />}
                styles={inputStyles}
                {...form.getInputProps('timezone')}
              />
            </Group>
          </Stack>
        </Section>

        {/* ── Matching Preferences ── */}
        <MatchingPreferences form={form} isDark={isDark} />

        {/* ── Feedback ── */}
        {error && (
          <Alert
            id="profile-error-alert"
            icon={<IconAlertCircle size={16} />}
            color="red"
            radius="md"
            variant="light"
            styles={{
              root: {
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
              },
            }}
          >
            <Text size="sm" style={{ color: '#fca5a5' }}>{error}</Text>
          </Alert>
        )}

        {success && (
          <Notification
            id="profile-success-notif"
            icon={<IconCheck size={16} />}
            color="teal"
            title="Profile updated!"
            withCloseButton={false}
            radius="md"
            style={{
              background: isDark ? 'rgba(20,184,166,0.12)' : 'rgba(20,184,166,0.08)',
              border: '1px solid rgba(20,184,166,0.3)',
            }}
          >
            Your profile has been saved successfully.
          </Notification>
        )}

        {/* ── Actions ── */}
        <Group justify="flex-end" gap="sm">
          <Button
            id="cancel-profile-btn"
            variant="subtle"
            color="gray"
            radius="md"
            onClick={onCancel}
            disabled={updating}
            styles={{ root: { color: isDark ? '#94a3b8' : '#64748b' } }}
          >
            Cancel
          </Button>

          <Button
            id="save-profile-btn"
            type="submit"
            variant="gradient"
            gradient={{ from: '#7c3aed', to: '#4f46e5', deg: 135 }}
            radius="md"
            loading={updating}
            style={{ boxShadow: '0 4px 15px rgba(124,58,237,0.4)', fontWeight: 600 }}
          >
            Save Changes
          </Button>
        </Group>

      </Stack>
    </Box>
  );
};

export default ProfileEditForm;
