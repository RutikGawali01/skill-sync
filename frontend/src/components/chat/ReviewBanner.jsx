import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Group, Text, useMantineTheme } from '@mantine/core';
import { Star } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ReviewBanner = memo(({ session }) => {
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const { isDark } = useTheme();

  const {
    id: sessionId,
    reviewSubmitted,
    reviewRating,
    reviewComment,
  } = session;

  const bg = isDark ? theme.colors.dark[6] : theme.colors.gray[0];
  const border = isDark ? `1px solid ${theme.colors.dark[5]}` : `1px solid ${theme.colors.gray[3]}`;
  const textColor = isDark ? theme.colors.gray[2] : theme.colors.gray[8];

  if (!reviewSubmitted) {
    return (
      <Box style={{ display: 'flex', justifyContent: 'center', margin: '8px 0', width: '100%' }}>
        <Box
          style={{
            backgroundColor: isDark ? theme.colors.dark[6] : '#fff3c4',
            color: isDark ? theme.colors.gray[3] : '#54656f',
            border: isDark ? `1px solid ${theme.colors.dark[5]}` : `1px solid #ffe0b2`,
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '11px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'transform 0.2s ease',
          }}
          className="hover:scale-105"
          onClick={() => navigate(`/sessions/${sessionId}/reviews`)}
        >
          <Star size={12} fill="#F59E0B" color="#F59E0B" />
          <Text size="xs" weight={600}>
            Tap to leave a review
          </Text>
        </Box>
      </Box>
    );
  }

  // Submitted review - compact chip
  return (
    <Box style={{ display: 'flex', justifyContent: 'center', margin: '8px 0', width: '100%' }}>
      <Box
        style={{
          backgroundColor: bg,
          border: border,
          padding: '8px 16px',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          maxWidth: '280px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}
      >
        <Group spacing={2} noWrap>
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
          <Text size="xs" italic style={{ color: textColor, textAlign: 'center', lineHeight: 1.3 }}>
            "{reviewComment}"
          </Text>
        )}
      </Box>
    </Box>
  );
});

ReviewBanner.displayName = 'ReviewBanner';

export default ReviewBanner;
