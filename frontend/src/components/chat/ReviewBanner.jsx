import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Group, Text, useMantineTheme } from '@mantine/core';
import { Star } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ReviewBanner = ({ session }) => {
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const { isDark } = useTheme();

  const {
    id: sessionId,
    reviewSubmitted,
    reviewRating,
    reviewComment,
  } = session;

  return (
    <Box style={{ display: 'flex', justifyContent: 'center', margin: '12px 0' }}>
      <Box
        style={{
          backgroundColor: isDark ? theme.colors.dark[6] : '#fff3c4',
          color: isDark ? theme.colors.gray[4] : '#54656f',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '12px',
          boxShadow: '0 1px 0.5px rgba(11,20,26,.13)',
          maxWidth: '90%',
          textAlign: 'center',
          cursor: reviewSubmitted ? 'default' : 'pointer',
        }}
        onClick={() => {
          if (!reviewSubmitted) navigate(`/sessions/${sessionId}/reviews`);
        }}
      >
        {reviewSubmitted ? (
          <Box>
            <Group position="center" spacing={4} noWrap style={{ marginBottom: 4 }}>
              <Text size="xs" weight={600}>Session Reviewed</Text>
            </Group>
            <Group position="center" spacing={2} noWrap style={{ marginBottom: 4 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  fill={i < (reviewRating || 0) ? '#F59E0B' : 'transparent'}
                  color={i < (reviewRating || 0) ? '#F59E0B' : '#6B7280'}
                />
              ))}
            </Group>
            {reviewComment && (
              <Text size="xs" italic>
                "{reviewComment}"
              </Text>
            )}
          </Box>
        ) : (
          <Group position="center" spacing={4} noWrap>
            <Star size={14} style={{ color: theme.colors.yellow[6] }} />
            <Text size="xs" weight={600} style={{ textDecoration: 'underline' }}>
              Tap to leave a review for this session
            </Text>
          </Group>
        )}
      </Box>
    </Box>
  );
};

export default ReviewBanner;
