import React from 'react';
import { Box, Group, Paper } from '@mantine/core';

/**
 * Animated three-dot typing indicator bubble.
 */
const TypingIndicator = () => {
  return (
    <Box
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        width: '100%',
        margin: '6px 0',
      }}
    >
      <Paper
        shadow="xs"
        radius="lg"
        p="sm"
        style={{
          backgroundColor: '#25262B',
          borderTopLeftRadius: 0,
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <Group spacing={4} noWrap style={{ height: '14px', alignItems: 'center' }}>
          <Box className="typing-dot" style={{ ...dotStyle, animationDelay: '0s' }} />
          <Box className="typing-dot" style={{ ...dotStyle, animationDelay: '0.2s' }} />
          <Box className="typing-dot" style={{ ...dotStyle, animationDelay: '0.4s' }} />
        </Group>

        {/* CSS injection for typing dots animation */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes typing-bounce {
            0%, 100% { transform: translateY(0); opacity: 0.4; }
            50% { transform: translateY(-4px); opacity: 1; }
          }
          .typing-dot {
            animation: typing-bounce 1.4s infinite ease-in-out;
          }
        `}} />
      </Paper>
    </Box>
  );
};

const dotStyle = {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  backgroundColor: '#A78BFA', // Violet color
  display: 'inline-block',
};

export default TypingIndicator;
