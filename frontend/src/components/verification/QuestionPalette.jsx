/**
 * QuestionPalette.jsx
 * ───────────────────
 * Right-sidebar question navigation palette for the verification test.
 * Shows color-coded status for each question:
 *   • Current   — violet filled
 *   • Answered  — green filled
 *   • Skipped   — orange outline
 *   • Unvisited — gray outline
 */

import { Box, Text, Group, SimpleGrid } from '@mantine/core';
import { useSelector } from 'react-redux';
import {
  selectAnswers,
  selectCurrentIndex,
} from '../../redux/verificationSlice';

const PALETTE_STATUS = {
  current:   { bg: '#7c3aed', border: '#7c3aed', color: '#fff' },
  answered:  { bg: 'rgba(34,197,94,0.15)',  border: '#22c55e', color: '#22c55e' },
  skipped:   { bg: 'rgba(249,115,22,0.12)', border: '#f97316', color: '#f97316' },
  unvisited: { bg: 'transparent',            border: 'rgba(100,116,139,0.3)', color: '#64748b' },
};

const QuestionPalette = ({ questions, visited, onNavigate, isDark }) => {
  const answers      = useSelector(selectAnswers);
  const currentIndex = useSelector(selectCurrentIndex);

  const getStatus = (q, idx) => {
    if (idx === currentIndex)          return 'current';
    if (answers[q.questionId])         return 'answered';
    if (visited.has(q.questionId))     return 'skipped';
    return 'unvisited';
  };

  const answeredCount  = Object.keys(answers).length;
  const skippedCount   = visited.size - answeredCount;
  const total          = questions.length;

  const legendItems = [
    { label: 'Current',   ...PALETTE_STATUS.current   },
    { label: 'Answered',  ...PALETTE_STATUS.answered  },
    { label: 'Skipped',   ...PALETTE_STATUS.skipped   },
    { label: 'Unvisited', ...PALETTE_STATUS.unvisited },
  ];

  return (
    <Box>
      {/* Legend */}
      <Box mb="sm">
        {legendItems.map((item) => (
          <Group key={item.label} gap={6} mb={4}>
            <Box
              style={{
                width:        10,
                height:       10,
                borderRadius: 3,
                background:   item.bg,
                border:       `1px solid ${item.border}`,
              }}
            />
            <Text size="xs" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
              {item.label}
            </Text>
          </Group>
        ))}
      </Box>

      {/* Grid of question buttons */}
      <SimpleGrid cols={5} spacing={6}>
        {questions.map((q, idx) => {
          const status = getStatus(q, idx);
          const cfg    = PALETTE_STATUS[status];
          return (
            <Box
              key={q.questionId}
              id={`palette-q-${idx + 1}`}
              onClick={() => onNavigate(idx)}
              style={{
                width:          34,
                height:         34,
                borderRadius:   8,
                background:     cfg.bg,
                border:         `1.5px solid ${cfg.border}`,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                cursor:         'pointer',
                fontWeight:     700,
                fontSize:       '0.72rem',
                color:          cfg.color,
                transition:     'transform 0.15s ease, box-shadow 0.15s ease',
                boxShadow:      status === 'current'
                  ? '0 0 10px rgba(124,58,237,0.5)'
                  : 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform  = 'scale(1.12)';
                e.currentTarget.style.boxShadow  = `0 4px 12px ${cfg.border}55`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = status === 'current'
                  ? '0 0 10px rgba(124,58,237,0.5)'
                  : 'none';
              }}
            >
              {idx + 1}
            </Box>
          );
        })}
      </SimpleGrid>

      {/* Progress summary */}
      <Box
        mt="md"
        style={{
          background:   isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
          borderRadius: 10,
          padding:      '0.6rem 0.8rem',
        }}
      >
        <Group justify="space-between" mb={6}>
          <Text size="xs" style={{ color: '#64748b' }}>Answered</Text>
          <Text size="xs" fw={700} style={{ color: '#22c55e' }}>{answeredCount}/{total}</Text>
        </Group>
        <Group justify="space-between">
          <Text size="xs" style={{ color: '#64748b' }}>Skipped</Text>
          <Text size="xs" fw={700} style={{ color: '#f97316' }}>{skippedCount < 0 ? 0 : skippedCount}</Text>
        </Group>
      </Box>
    </Box>
  );
};

export default QuestionPalette;
