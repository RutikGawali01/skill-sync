/**
 * QuestionCard.jsx
 * ────────────────
 * Renders a single MCQ question with 4 radio-card options.
 * Selected option glows; hover shows a subtle highlight.
 */

import { Box, Text, Stack, Radio } from '@mantine/core';

const OptionCard = ({ option, isSelected, onSelect, isDark }) => {
  const baseStyle = {
    borderRadius: 10,
    padding:      '0.75rem 1rem',
    border:       `1.5px solid ${
      isSelected
        ? '#7c3aed'
        : isDark
          ? 'rgba(255,255,255,0.07)'
          : 'rgba(0,0,0,0.08)'
    }`,
    background: isSelected
      ? 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(79,70,229,0.08) 100%)'
      : isDark
        ? 'rgba(255,255,255,0.02)'
        : 'rgba(0,0,0,0.015)',
    cursor:     'pointer',
    transition: 'all 0.18s ease',
    display:    'flex',
    alignItems: 'center',
    gap:        12,
    boxShadow:  isSelected ? '0 0 0 1px rgba(124,58,237,0.3), 0 4px 12px rgba(124,58,237,0.15)' : 'none',
  };

  return (
    <Box
      style={baseStyle}
      onClick={() => onSelect(option.label)}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.border        = `1.5px solid rgba(139,92,246,0.35)`;
          e.currentTarget.style.background    = isDark
            ? 'rgba(139,92,246,0.06)'
            : 'rgba(139,92,246,0.04)';
          e.currentTarget.style.transform     = 'translateX(2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.border     = `1.5px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}`;
          e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)';
          e.currentTarget.style.transform  = 'translateX(0)';
        }
      }}
    >
      {/* Custom radio circle */}
      <Box
        style={{
          width:          18,
          height:         18,
          borderRadius:   '50%',
          border:         `2px solid ${isSelected ? '#7c3aed' : isDark ? '#334155' : '#cbd5e1'}`,
          background:     isSelected ? '#7c3aed' : 'transparent',
          flexShrink:     0,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          transition:     'all 0.18s ease',
          boxShadow:      isSelected ? '0 0 8px rgba(124,58,237,0.5)' : 'none',
        }}
      >
        {isSelected && (
          <Box
            style={{
              width:        7,
              height:       7,
              borderRadius: '50%',
              background:   '#fff',
            }}
          />
        )}
      </Box>

      <Text
        size="sm"
        style={{
          color:      isDark
            ? isSelected ? '#e2e8f0' : '#94a3b8'
            : isSelected ? '#1e293b' : '#475569',
          fontWeight: isSelected ? 600 : 400,
          lineHeight: 1.5,
          transition: 'all 0.18s ease',
          flex:       1,
        }}
      >
        {option.text}
      </Text>
    </Box>
  );
};

const QuestionCard = ({ question, questionNumber, totalQuestions, selectedAnswer, onSelect, isDark }) => {
  const options = [
    { text: question.optionA, label: 'Option A' },
    { text: question.optionB, label: 'Option B' },
    { text: question.optionC, label: 'Option C' },
    { text: question.optionD, label: 'Option D' },
  ];

  const cardBg     = isDark ? 'rgba(17,19,40,0.8)' : '#ffffff';
  const cardBorder = isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)';
  const numColor   = isDark ? '#64748b' : '#94a3b8';
  const qColor     = isDark ? '#e2e8f0' : '#1e293b';

  return (
    <Box
      style={{
        background:     cardBg,
        border:         `1px solid ${cardBorder}`,
        borderRadius:   16,
        padding:        '1.5rem',
        backdropFilter: 'blur(8px)',
        boxShadow:      isDark
          ? '0 4px 24px rgba(0,0,0,0.3)'
          : '0 4px 24px rgba(139,92,246,0.06)',
      }}
    >
      {/* Question number */}
      <Text
        size="xs"
        fw={600}
        mb={8}
        style={{
          color:         numColor,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        Question {questionNumber} of {totalQuestions}
      </Text>

      {/* Question text */}
      <Text
        size="md"
        fw={600}
        mb="lg"
        style={{ color: qColor, lineHeight: 1.7 }}
      >
        {question.question}
      </Text>

      {/* Options */}
      <Stack gap={10}>
        {options.map((opt) => (
          <OptionCard
            key={opt.label}
            option={opt}
            isSelected={selectedAnswer === opt.label}
            onSelect={onSelect}
            isDark={isDark}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default QuestionCard;
