/**
 * VerificationTestPage.jsx
 * ────────────────────────
 * Full-screen AI skill verification test interface.
 *
 * Layout:
 *   LEFT  — Question panel (QuestionCard, prev/next/skip navigation)
 *   RIGHT — Sticky sidebar (VerificationSidebar: timer, palette, submit)
 *
 * UX:
 *   • Warns before page unload (accidental refresh)
 *   • Suggests fullscreen on mount
 *   • Auto-submits when timer hits zero
 *   • Shows submit confirmation modal
 *   • Navigates to /verification-result/:testId after submit
 *
 * Data flow:
 *   Redux store (verificationSlice) → components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Text, Group, Button, Modal, Stack,
  Alert, ActionIcon, useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconChevronLeft, IconChevronRight, IconPlayerSkipForward,
  IconAlertTriangle, IconMaximize, IconShieldCheck,
} from '@tabler/icons-react';

import {
  selectCurrentTest,
  selectAnswers,
  selectCurrentIndex,
  selectSubmitting,
  selectVerificationError,
  saveAnswer,
  setCurrentIndex,
  nextQuestion,
  previousQuestion,
  submitTest,
  clearVerificationError,
  fetchTestResult,
  fetchVerifiedBadges,
  resetTest,
} from '../../redux/verificationSlice';

import { fetchUserSkills } from '../../redux/skillSlice';

import QuestionCard        from '../../components/verification/QuestionCard';
import VerificationSidebar from '../../components/verification/VerificationSidebar';

// ── Submit Confirmation Modal ─────────────────────────────────────────────────
const SubmitConfirmModal = ({ opened, onClose, onConfirm, submitting, answers, total, isDark }) => {
  const attempted = Object.keys(answers).length;
  const skipped   = total - attempted;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="sm"
      withCloseButton={!submitting}
      styles={{
        content: {
          background:   isDark ? '#0f1117' : '#ffffff',
          border:       '1px solid rgba(139,92,246,0.2)',
          borderRadius: 16,
        },
        body: { padding: '1.5rem' },
      }}
      title={null}
    >
      <Stack align="center" gap="md">
        <Box
          style={{
            width:          48,
            height:         48,
            borderRadius:   12,
            background:     'rgba(249,115,22,0.12)',
            border:         '1px solid rgba(249,115,22,0.25)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
          }}
        >
          <IconAlertTriangle size={22} color="#f97316" />
        </Box>

        <Text fw={700} size="md" style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>
          Submit Assessment?
        </Text>
        <Text size="sm" ta="center" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
          This action cannot be undone.
        </Text>

        <Box
          style={{
            width:        '100%',
            background:   isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
            borderRadius: 10,
            padding:      '0.75rem 1rem',
          }}
        >
          <Group justify="space-between" mb={4}>
            <Text size="sm" style={{ color: isDark ? '#94a3b8' : '#475569' }}>Answered</Text>
            <Text size="sm" fw={700} style={{ color: '#22c55e' }}>{attempted}</Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" style={{ color: isDark ? '#94a3b8' : '#475569' }}>Skipped</Text>
            <Text size="sm" fw={700} style={{ color: '#f97316' }}>{skipped < 0 ? 0 : skipped}</Text>
          </Group>
        </Box>

        <Group grow gap="sm" style={{ width: '100%' }}>
          <Button
            variant="subtle"
            color="gray"
            radius="md"
            size="sm"
            onClick={onClose}
            disabled={submitting}
          >
            Continue Test
          </Button>
          <Button
            id="confirm-submit-test-btn"
            radius="md"
            size="sm"
            loading={submitting}
            onClick={onConfirm}
            color="violet"
            style={{ fontWeight: 600 }}
          >
            Submit
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const VerificationTestPage = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { testId } = useParams();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const currentTest  = useSelector(selectCurrentTest);
  const answers      = useSelector(selectAnswers);
  const currentIndex = useSelector(selectCurrentIndex);
  const submitting   = useSelector(selectSubmitting);
  const storeError   = useSelector(selectVerificationError);

  const [visited, setVisited]           = useState(new Set());
  const [submitModalOpen, { open: openSubmit, close: closeSubmit }] = useDisclosure(false);
  const [fullscreenTip, setFullscreenTip] = useState(true);
  const autoSubmitCalledRef = useRef(false);

  const questions = currentTest?.questions ?? [];
  const total     = questions.length;
  const current   = questions[currentIndex];

  // ── Error surface ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (storeError) {
      notifications.show({
        id:        'verify-error',
        title:     'Error',
        message:   storeError,
        color:     'red',
        autoClose: 5000,
        radius:    'md',
      });
      dispatch(clearVerificationError());
    }
  }, [storeError, dispatch]);

  // ── Warn on page leave ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = 'Your test is in progress. Are you sure you want to leave?';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // ── Mark current question as visited ─────────────────────────────────────
  useEffect(() => {
    if (current?.questionId) {
      setVisited((prev) => new Set([...prev, current.questionId]));
    }
  }, [currentIndex, current]);

  // ── If no test loaded, redirect to profile ────────────────────────────────
  useEffect(() => {
    if (!currentTest && !submitting) {
      navigate('/profile', { replace: true });
    }
  }, [currentTest, submitting, navigate]);

  // ── Handle answer selection ───────────────────────────────────────────────
  const handleSelect = useCallback(
    (selectedAnswer) => {
      if (!current) return;
      dispatch(saveAnswer({ questionId: current.questionId, selectedAnswer }));
    },
    [dispatch, current]
  );

  // ── Navigation ────────────────────────────────────────────────────────────
  const handlePrev   = () => dispatch(previousQuestion());
  const handleNext   = () => dispatch(nextQuestion());
  const handleSkip   = () => { handleNext(); };
  const handleNavigate = (idx) => dispatch(setCurrentIndex(idx));

  // ── Submit ────────────────────────────────────────────────────────────────
  const doSubmit = useCallback(async () => {
    closeSubmit();
    const answersPayload = Object.entries(answers).map(([qId, selectedAnswer]) => ({
      questionId:     parseInt(qId, 10),
      selectedAnswer,
    }));

    const result = await dispatch(
      submitTest({ testId: currentTest?.testId, answers: answersPayload })
    );

    if (submitTest.fulfilled.match(result)) {
      dispatch(fetchUserSkills()); // update skill card badge live
      dispatch(fetchVerifiedBadges()); // update profile verified badges
      navigate(`/verification-result/${currentTest?.testId}`, { replace: true });
    }
  }, [dispatch, answers, currentTest, navigate, closeSubmit]);

  const handleAutoSubmit = useCallback(() => {
    if (autoSubmitCalledRef.current) return;
    autoSubmitCalledRef.current = true;
    notifications.show({
      id:      'auto-submit',
      title:   'Time Up!',
      message: 'Your answers have been auto-submitted.',
      color:   'orange',
      radius:  'md',
    });
    doSubmit();
  }, [doSubmit]);

  // ── Page colors ───────────────────────────────────────────────────────────
  const pageBg   = isDark
    ? 'radial-gradient(ellipse at top left, rgba(124,58,237,0.08) 0%, #0a0b14 60%)'
    : 'radial-gradient(ellipse at top left, rgba(124,58,237,0.04) 0%, #f8faff 60%)';
  const headerBg = isDark ? 'rgba(17,19,40,0.85)' : 'rgba(255,255,255,0.85)';

  if (!currentTest) return null;

  return (
    <Box
      style={{
        minHeight:  '100vh',
        background: pageBg,
        paddingBottom: '2rem',
      }}
    >
      {/* ── Top Header Bar ── */}
      <Box
        style={{
          background:     headerBg,
          backdropFilter: 'blur(12px)',
          borderBottom:   `1px solid ${isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)'}`,
          padding:        '0.75rem 1.5rem',
          position:       'sticky',
          top:            0,
          zIndex:         100,
        }}
      >
        <Group justify="space-between" align="center" maw={1200} mx="auto">
          <Group gap={12} align="center">
            <Box
              style={{
                width:          34,
                height:         34,
                borderRadius:   10,
                background:     'linear-gradient(135deg, #7c3aed, #4f46e5)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                boxShadow:      '0 4px 12px rgba(124,58,237,0.4)',
              }}
            >
              <IconShieldCheck size={17} color="#fff" />
            </Box>
            <Box>
              <Text fw={700} size="sm" style={{ color: isDark ? '#e2e8f0' : '#1e293b', lineHeight: 1.2 }}>
                {currentTest.skillName} Verification
              </Text>
              <Text size="xs" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                {currentTest.skillLevel ?? 'Intermediate'} · {total} Questions
              </Text>
            </Box>
          </Group>

          <ActionIcon
            variant="subtle"
            color="violet"
            radius="md"
            size="md"
            title="Fullscreen"
            onClick={() => document.documentElement.requestFullscreen?.()}
          >
            <IconMaximize size={16} />
          </ActionIcon>
        </Group>
      </Box>

      {/* ── Fullscreen tip ── */}
      {fullscreenTip && (
        <Box maw={1200} mx="auto" px={{ base: '1rem', md: '1.5rem' }} mt="md">
          <Alert
            icon={<IconMaximize size={16} />}
            color="violet"
            radius="md"
            withCloseButton
            onClose={() => setFullscreenTip(false)}
            styles={{ body: { fontSize: '0.8rem' } }}
          >
            For the best assessment experience, use fullscreen mode (F11).
          </Alert>
        </Box>
      )}

      {/* ── Main Content ── */}
      <Box
        maw={1200}
        mx="auto"
        px={{ base: '1rem', md: '1.5rem' }}
        mt="lg"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 280px',
          gap: '1.25rem',
          alignItems: 'start',
        }}
      >
        {/* LEFT — Question Panel */}
        <Box>
          {current && (
            <QuestionCard
              question={current}
              questionNumber={currentIndex + 1}
              totalQuestions={total}
              selectedAnswer={answers[current.questionId] ?? null}
              onSelect={handleSelect}
              isDark={isDark}
            />
          )}

          {/* Navigation Buttons */}
          <Group
            justify="space-between"
            align="center"
            mt="md"
            style={{
              background:     isDark ? 'rgba(17,19,40,0.7)' : '#ffffff',
              border:         `1px solid ${isDark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.08)'}`,
              borderRadius:   12,
              padding:        '0.75rem 1rem',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Button
              id="prev-question-btn"
              variant="subtle"
              color="gray"
              radius="md"
              size="sm"
              disabled={currentIndex === 0}
              leftSection={<IconChevronLeft size={16} />}
              onClick={handlePrev}
            >
              Previous
            </Button>

            <Text size="xs" fw={600} style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
              {currentIndex + 1} / {total}
            </Text>

            <Group gap={8}>
              {currentIndex < total - 1 && (
                <Button
                  id="skip-question-btn"
                  variant="subtle"
                  color="orange"
                  radius="md"
                  size="sm"
                  rightSection={<IconPlayerSkipForward size={14} />}
                  onClick={handleSkip}
                >
                  Skip
                </Button>
              )}
              <Button
                id="next-question-btn"
                variant="light"
                color="violet"
                radius="md"
                size="sm"
                disabled={currentIndex === total - 1}
                rightSection={<IconChevronRight size={16} />}
                onClick={handleNext}
              >
                Next
              </Button>
            </Group>
          </Group>
        </Box>

        {/* RIGHT — Sticky Sidebar */}
        <VerificationSidebar
          test={currentTest}
          visited={visited}
          onNavigate={handleNavigate}
          onSubmit={openSubmit}
          onAutoSubmit={handleAutoSubmit}
          submitting={submitting}
          isDark={isDark}
        />
      </Box>

      {/* Submit Confirmation Modal */}
      <SubmitConfirmModal
        opened={submitModalOpen}
        onClose={closeSubmit}
        onConfirm={doSubmit}
        submitting={submitting}
        answers={answers}
        total={total}
        isDark={isDark}
      />
    </Box>
  );
};

export default VerificationTestPage;
