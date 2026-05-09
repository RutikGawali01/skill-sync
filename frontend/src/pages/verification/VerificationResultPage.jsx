/**
 * VerificationResultPage.jsx
 * ──────────────────────────
 * Shows the outcome of a completed skill verification test.
 * Fetches result from Redux store (already in state after submit)
 * or falls back to API fetch if navigated directly via URL.
 *
 * Pass: confetti animation + green success card
 * Fail: red/orange failure card with retry info
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Center, Loader, Text, Button,
  useMantineColorScheme,
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';

import {
  selectVerificationResult,
  selectResultLoading,
  selectCurrentTest,
  fetchTestResult,
  resetTest,
} from '../../redux/verificationSlice';

import VerificationResultCard from '../../components/verification/VerificationResultCard';

// ── Confetti helper ───────────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#7c3aed','#22c55e','#f59e0b','#06b6d4','#ec4899'];

const ConfettiDot = ({ style }) => (
  <Box
    style={{
      position: 'fixed',
      width:    8,
      height:   8,
      borderRadius: '50%',
      pointerEvents: 'none',
      zIndex: 0,
      ...style,
    }}
  />
);

const Confetti = () => {
  const dots = Array.from({ length: 30 }).map((_, i) => ({
    left:     `${Math.random() * 100}%`,
    top:      `${Math.random() * 60}%`,
    background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    animation: `fall ${1.5 + Math.random() * 2}s ease-in ${Math.random() * 1}s both`,
    opacity:  0.8,
  }));

  return (
    <>
      <style>{`
        @keyframes fall {
          0%   { transform: translateY(-40px) rotate(0deg); opacity: 0.9; }
          100% { transform: translateY(100vh)  rotate(720deg); opacity: 0; }
        }
      `}</style>
      {dots.map((style, i) => <ConfettiDot key={i} style={style} />)}
    </>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const VerificationResultPage = () => {
  const { testId }       = useParams();
  const dispatch         = useDispatch();
  const navigate         = useNavigate();
  const { colorScheme }  = useMantineColorScheme();
  const isDark           = colorScheme === 'dark';

  const result      = useSelector(selectVerificationResult);
  const loading     = useSelector(selectResultLoading);
  const currentTest = useSelector(selectCurrentTest);

  // Fetch result if not already in store (direct URL access)
  useEffect(() => {
    if (!result && testId) {
      dispatch(fetchTestResult(parseInt(testId, 10)));
    }
  }, [result, testId, dispatch]);

  // Clean up test from store when leaving result page
  useEffect(() => {
    return () => {
      dispatch(resetTest());
    };
  }, [dispatch]);

  const pageBg = isDark
    ? 'radial-gradient(ellipse at top, rgba(124,58,237,0.07) 0%, #0a0b14 60%)'
    : 'radial-gradient(ellipse at top, rgba(124,58,237,0.04) 0%, #f8faff 60%)';

  const skillName = currentTest?.skillName ?? result?.skillName ?? 'Skill';
  const passed    = result?.passed ?? false;

  return (
    <Box
      style={{
        minHeight:  '100vh',
        background: pageBg,
        paddingTop: '2rem',
        paddingBottom: '3rem',
        position:   'relative',
        overflow:   'hidden',
      }}
    >
      {/* Confetti for pass */}
      {!loading && result && passed && <Confetti />}

      <Box
        maw={640}
        mx="auto"
        px={{ base: '1rem', md: '1.5rem' }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* Back nav */}
        <Button
          variant="subtle"
          color="gray"
          size="xs"
          radius="md"
          mb="xl"
          leftSection={<IconArrowLeft size={13} />}
          onClick={() => navigate('/profile')}
        >
          Back to Profile
        </Button>

        {loading ? (
          <Center style={{ minHeight: '50vh' }}>
            <Box ta="center">
              <Loader color="violet" size="md" mb="md" />
              <Text size="sm" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                Loading your results…
              </Text>
            </Box>
          </Center>
        ) : result ? (
          <VerificationResultCard
            result={result}
            skillName={skillName}
            isDark={isDark}
          />
        ) : (
          <Center style={{ minHeight: '50vh' }}>
            <Box ta="center">
              <Text size="md" fw={600} style={{ color: isDark ? '#e2e8f0' : '#1e293b' }} mb="sm">
                Result not found
              </Text>
              <Text size="sm" style={{ color: isDark ? '#64748b' : '#94a3b8' }} mb="lg">
                Could not load the test result. It may have expired.
              </Text>
              <Button
                variant="light"
                color="violet"
                radius="md"
                onClick={() => navigate('/profile')}
              >
                Go to Profile
              </Button>
            </Box>
          </Center>
        )}
      </Box>
    </Box>
  );
};

export default VerificationResultPage;
