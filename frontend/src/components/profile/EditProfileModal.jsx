/**
 * EditProfileModal.jsx
 * ────────────────────
 * Mantine Modal for editing: bio + optional profile picture.
 *
 * Features:
 *   - Textarea for bio
 *   - File input for profilePic with live preview
 *   - Submits via Redux → updateProfile thunk
 *   - Shows updating spinner in Save button
 *
 * Props:
 *   opened   : boolean
 *   onClose  : () => void
 *   profile  : ProfileDTO
 */

import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Modal,
  Stack,
  Textarea,
  Button,
  Group,
  Avatar,
  Text,
  Box,
  Alert,
} from '@mantine/core';
import { IconUpload, IconX, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { updateProfile, clearProfileError } from '../../redux/profileSlice';

const EditProfileModal = ({ opened, onClose, profile }) => {
  const dispatch = useDispatch();
  const { updating, error } = useSelector((s) => s.profile);

  const [bio, setBio] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [picFile, setPicFile] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Seed form from current profile whenever modal opens
  useEffect(() => {
    if (opened && profile) {
      setBio(profile.bio || '');
      setPreviewUrl(profile.profilePic || null);
      setPicFile(null);
      setSuccess(false);
      dispatch(clearProfileError());
    }
  }, [opened, profile, dispatch]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPicFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemovePic = () => {
    setPicFile(null);
    setPreviewUrl(profile?.profilePic || null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    setSuccess(false);

    let payload;
    if (picFile) {
      // Multipart: backend parses as MultipartFile
      payload = new FormData();
      payload.append('bio', bio);
      payload.append('profilePic', picFile);
    } else {
      payload = { bio };
    }

    const result = await dispatch(updateProfile(payload));
    if (updateProfile.fulfilled.match(result)) {
      setSuccess(true);
      // Close after brief success flash
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 900);
    }
  };

  const avatarInitial = profile?.name?.charAt(0)?.toUpperCase();

  return (
    <Modal
      id="edit-profile-modal"
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg" style={{ color: '#e2e8f0' }}>
          Edit Profile
        </Text>
      }
      centered
      size="md"
      radius="lg"
      styles={{
        content: {
          background: 'linear-gradient(145deg, #1a1b2e 0%, #16213e 100%)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
        },
        header: {
          background: 'transparent',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          paddingBottom: '0.75rem',
        },
        close: {
          color: '#94a3b8',
          '&:hover': { background: 'rgba(239,68,68,0.15)', color: '#f87171' },
        },
      }}
    >
      <Stack gap="lg" mt="sm">

        {/* ── Profile Picture Preview ── */}
        <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <Box style={{ position: 'relative', display: 'inline-block' }}>
            <Avatar
              src={previewUrl}
              alt="Profile preview"
              size={90}
              radius="50%"
              color="violet"
              style={{
                border: '3px solid rgba(139, 92, 246, 0.5)',
                boxShadow: '0 0 16px rgba(139,92,246,0.3)',
                fontSize: '2rem',
                fontWeight: 700,
              }}
            >
              {avatarInitial}
            </Avatar>

            {/* Remove preview button (only if user picked a new file) */}
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
                  border: '2px solid #1a1b2e',
                }}
              >
                <IconX size={12} color="#fff" />
              </Box>
            )}
          </Box>

          {/* Hidden file input + styled trigger */}
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
            size="xs"
            radius="md"
            leftSection={<IconUpload size={13} />}
            onClick={() => fileInputRef.current?.click()}
          >
            {picFile ? 'Change Photo' : 'Upload Photo'}
          </Button>
          {picFile && (
            <Text size="xs" style={{ color: '#8b5cf6' }}>
              {picFile.name}
            </Text>
          )}
        </Box>

        {/* ── Bio ── */}
        <Textarea
          id="edit-bio-textarea"
          label={
            <Text size="sm" fw={600} style={{ color: '#94a3b8', marginBottom: 4 }}>
              Bio
            </Text>
          }
          placeholder="Tell the community what you do, what you can teach, and what you're learning..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          autosize
          minRows={3}
          maxRows={6}
          maxLength={300}
          description={`${bio.length} / 300 characters`}
          styles={{
            input: {
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(139,92,246,0.25)',
              color: '#e2e8f0',
              borderRadius: 10,
              resize: 'none',
              '&:focus': { borderColor: 'rgba(139,92,246,0.6)' },
              '&::placeholder': { color: '#475569' },
            },
            description: { color: '#475569' },
          }}
        />

        {/* ── Error ── */}
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            radius="md"
            variant="light"
            styles={{ root: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' } }}
          >
            <Text size="sm" style={{ color: '#fca5a5' }}>{error}</Text>
          </Alert>
        )}

        {/* ── Success ── */}
        {success && (
          <Alert
            icon={<IconCheck size={16} />}
            color="green"
            radius="md"
            variant="light"
            styles={{ root: { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' } }}
          >
            <Text size="sm" style={{ color: '#86efac' }}>Profile updated!</Text>
          </Alert>
        )}

        {/* ── Actions ── */}
        <Group justify="flex-end" gap="sm">
          <Button
            variant="subtle"
            color="gray"
            radius="md"
            onClick={onClose}
            disabled={updating}
            styles={{ root: { color: '#94a3b8' } }}
          >
            Cancel
          </Button>
          <Button
            id="save-profile-btn"
            variant="gradient"
            gradient={{ from: '#7c3aed', to: '#4f46e5', deg: 135 }}
            radius="md"
            loading={updating}
            onClick={handleSave}
            style={{ boxShadow: '0 4px 15px rgba(124,58,237,0.4)' }}
          >
            Save Changes
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default EditProfileModal;
