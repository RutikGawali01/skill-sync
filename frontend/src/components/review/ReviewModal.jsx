/**
 * ReviewModal.jsx
 * ───────────────
 * Professional review submission modal.
 *
 * Features:
 *   - Multi-dimensional star ratings using Mantine Rating
 *   - Feedback textarea with character count
 *   - Validation (all ratings required, feedback min length)
 *   - Submit / loading / success / error states
 *   - Only opens for COMPLETED sessions
 *
 * Props:
 *   opened      - boolean controlling visibility
 *   onClose     - callback to close modal
 *   session     - SessionDTO (used to derive sessionId, revieweeId)
 *   currentUserId - logged-in user's ID
 *   isDark      - theme boolean
 */

import { useState, useEffect } from 'react';
import {
  Modal, Stack, Group, Text, Rating, Textarea,
  Button, Divider, Box, Badge, Loader,
  Progress,
} from '@mantine/core';
import {
  IconStar, IconSend, IconCheck,
  IconBook, IconBulb, IconClock, IconMessageCircle,
  IconTrophy,
} from '@tabler/icons-react';
import useReview from '../../hooks/useReview';

const MAX_FEEDBACK_CHARS = 1000;
const MIN_FEEDBACK_CHARS = 10;

// ── Rating dimension config ───────────────────────────────────────────────────
const RATING_FIELDS = [
  { key: 'overallRating',       label: 'Overall Experience', icon: IconTrophy,        color: '#f59e0b', required: true },
  { key: 'teachingRating',      label: 'Teaching Quality',   icon: IconBook,          color: '#8b5cf6', required: true },
  { key: 'communicationRating', label: 'Communication',      icon: IconMessageCircle, color: '#06b6d4', required: true },
  { key: 'punctualityRating',   label: 'Punctuality',        icon: IconClock,         color: '#10b981', required: true },
  { key: 'knowledgeRating',     label: 'Knowledge',          icon: IconBulb,          color: '#f97316', required: true },
];

const ReviewModal = ({ opened, onClose, session, currentUserId, isDark = false }) => {
  const { submitting, submitNewReview, resetSuccess } = useReview();

  // ── Local form state ────────────────────────────────────────────────────────
  const [ratings, setRatings] = useState({
    overallRating:       0,
    teachingRating:      0,
    communicationRating: 0,
    punctualityRating:   0,
    knowledgeRating:     0,
  });
  const [feedback, setFeedback]     = useState('');
  const [errors, setErrors]         = useState({});
  const [submitted, setSubmitted]   = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (opened) {
      setRatings({
        overallRating:       0,
        teachingRating:      0,
        communicationRating: 0,
        punctualityRating:   0,
        knowledgeRating:     0,
      });
      setFeedback('');
      setErrors({});
      setSubmitted(false);
      resetSuccess();
    }
  }, [opened, resetSuccess]);

  // ── Derive reviewee ─────────────────────────────────────────────────────────
  const revieweeId = session
    ? (session.provider?.id == currentUserId ? session.requester?.id : session.provider?.id)
    : null;
  const revieweeName = session
    ? (session.provider?.id == currentUserId
        ? (session.requester?.name || 'the other participant')
        : (session.provider?.name || 'the other participant'))
    : '';

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    RATING_FIELDS.forEach(({ key, label }) => {
      if (!ratings[key] || ratings[key] < 1) {
        newErrors[key] = `${label} is required`;
      }
    });
    if (feedback.trim().length < MIN_FEEDBACK_CHARS) {
      newErrors.feedback = `Feedback must be at least ${MIN_FEEDBACK_CHARS} characters`;
    }
    if (feedback.length > MAX_FEEDBACK_CHARS) {
      newErrors.feedback = `Feedback cannot exceed ${MAX_FEEDBACK_CHARS} characters`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      sessionId:  session?.id,
      revieweeId: revieweeId,
      ...ratings,
      feedback: feedback.trim(),
    };

    const ok = await submitNewReview(payload);
    if (ok) {
      setSubmitted(true);
      // Auto-close after success animation
      setTimeout(() => {
        onClose();
      }, 1800);
    }
  };

  // ── Set individual rating ───────────────────────────────────────────────────
  const setRating = (key, value) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  // ── Feedback change ─────────────────────────────────────────────────────────
  const handleFeedbackChange = (e) => {
    const val = e.currentTarget.value;
    if (val.length <= MAX_FEEDBACK_CHARS) {
      setFeedback(val);
      if (errors.feedback) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.feedback;
          return next;
        });
      }
    }
  };

  // ── Average of all filled ratings ───────────────────────────────────────────
  const filledRatings = Object.values(ratings).filter((v) => v > 0);
  const avgRating     = filledRatings.length
    ? (filledRatings.reduce((a, b) => a + b, 0) / filledRatings.length).toFixed(1)
    : '—';

  // ── Theme tokens ────────────────────────────────────────────────────────────
  const cardBg    = isDark ? 'rgba(15,17,30,0.6)' : 'rgba(139,92,246,0.03)';
  const subtextC  = isDark ? '#94a3b8' : '#64748b';

  // ── Success View ────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <Modal
        opened={opened}
        onClose={onClose}
        title=""
        centered
        size="sm"
        radius="lg"
        overlayProps={{ backgroundOpacity: 0.6, blur: 4 }}
        styles={{
          header: { display: 'none' },
          body: { padding: '2.5rem 2rem' },
        }}
      >
        <Stack align="center" gap="md">
          <Box
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #06d6a0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(16,185,129,0.3)',
              animation: 'scaleIn 0.4s ease',
            }}
          >
            <IconCheck size={36} color="#fff" stroke={3} />
          </Box>
          <Text fw={700} size="lg" ta="center" style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>
            Review Submitted!
          </Text>
          <Text size="sm" ta="center" c="dimmed">
            Your feedback helps build trust in our community. Thank you! 🌟
          </Text>
        </Stack>

        <style>{`
          @keyframes scaleIn {
            0% { transform: scale(0); opacity: 0; }
            60% { transform: scale(1.15); }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </Modal>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs" align="center">
          <IconStar size={20} color="#f59e0b" />
          <Text fw={700} size="md">Leave a Review</Text>
        </Group>
      }
      centered
      size="lg"
      radius="lg"
      overlayProps={{ backgroundOpacity: 0.6, blur: 4 }}
      styles={{
        header: {
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          paddingBottom: '0.75rem',
        },
        body: { padding: '1.5rem' },
      }}
    >
      <Stack gap="lg">
        {/* ── Session Context ── */}
        <Box
          style={{
            background: cardBg,
            borderRadius: 12,
            padding: '0.75rem 1rem',
            border: `1px solid ${isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)'}`,
          }}
        >
          <Text size="xs" c="dimmed" mb={4}>Reviewing your session with</Text>
          <Group gap="xs" align="center">
            <Text fw={600} size="sm" style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>
              {revieweeName}
            </Text>
            <Badge size="xs" variant="light" color="violet" radius="sm">
              {session?.skillName || session?.skill?.name || 'Session'}
            </Badge>
          </Group>
        </Box>

        {/* ── Rating Fields ── */}
        <Stack gap="md">
          {RATING_FIELDS.map(({ key, label, icon: Icon, color }) => (
            <Box key={key}>
              <Group justify="space-between" align="center" mb={6}>
                <Group gap={6} align="center">
                  <Icon size={16} color={color} />
                  <Text size="sm" fw={500} style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>
                    {label}
                  </Text>
                </Group>
                {ratings[key] > 0 && (
                  <Badge size="xs" variant="light" color={ratings[key] >= 4 ? 'green' : ratings[key] >= 3 ? 'yellow' : 'red'}>
                    {ratings[key]}/5
                  </Badge>
                )}
              </Group>
              <Rating
                value={ratings[key]}
                onChange={(value) => setRating(key, value)}
                size="lg"
                count={5}
                color={color}
              />
              {errors[key] && (
                <Text size="xs" c="red" mt={4}>
                  {errors[key]}
                </Text>
              )}
            </Box>
          ))}
        </Stack>

        <Divider style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />

        {/* ── Average Preview ── */}
        <Group justify="center">
          <Box
            style={{
              background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.06)',
              borderRadius: 12,
              padding: '0.5rem 1.25rem',
              border: `1px solid ${isDark ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.15)'}`,
            }}
          >
            <Group gap="xs" align="center">
              <IconStar size={18} color="#f59e0b" />
              <Text size="sm" fw={600} style={{ color: '#f59e0b' }}>
                Average: {avgRating}
              </Text>
            </Group>
          </Box>
        </Group>

        {/* ── Feedback Textarea ── */}
        <Box>
          <Textarea
            label="Written Feedback"
            description="Share your experience in detail — it helps others decide."
            placeholder="What went well? How was the teaching quality? Would you recommend this person?"
            value={feedback}
            onChange={handleFeedbackChange}
            minRows={4}
            maxRows={6}
            error={errors.feedback}
            radius="md"
            styles={{
              input: {
                transition: 'border-color 0.2s ease',
              },
            }}
          />
          <Group justify="space-between" mt={6}>
            <Text size="xs" c="dimmed">
              Min {MIN_FEEDBACK_CHARS} characters
            </Text>
            <Text
              size="xs"
              c={feedback.length > MAX_FEEDBACK_CHARS * 0.9 ? 'orange' : 'dimmed'}
              fw={feedback.length > MAX_FEEDBACK_CHARS * 0.9 ? 600 : 400}
            >
              {feedback.length}/{MAX_FEEDBACK_CHARS}
            </Text>
          </Group>
          <Progress
            value={(feedback.length / MAX_FEEDBACK_CHARS) * 100}
            size={3}
            radius="xl"
            color={feedback.length > MAX_FEEDBACK_CHARS * 0.9 ? 'orange' : 'violet'}
            mt={4}
          />
        </Box>

        <Divider style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />

        {/* ── Actions ── */}
        <Group justify="flex-end" gap="sm">
          <Button
            variant="subtle"
            color="gray"
            radius="md"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            leftSection={submitting ? <Loader size={14} color="white" /> : <IconSend size={16} />}
            color="violet"
            radius="md"
            onClick={handleSubmit}
            disabled={submitting}
            loading={submitting}
            style={{
              boxShadow: '0 4px 14px rgba(139,92,246,0.25)',
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default ReviewModal;
