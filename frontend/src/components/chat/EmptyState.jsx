import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Center, Stack, Text, ThemeIcon, useMantineTheme } from '@mantine/core';

/**
 * Reusable empty state component displaying centered icon, details, and optional action CTA.
 */
const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionPath,
  height = '300px',
}) => {
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const isDark = theme.colorScheme === 'dark';

  return (
    <Center style={{ height, width: '100%', padding: '24px' }}>
      <Stack align="center" spacing="md" style={{ textAlign: 'center', maxWidth: '400px' }}>
        {Icon && (
          <ThemeIcon
            size={60}
            radius="xl"
            variant="light"
            color="violet"
            style={{
              backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.08)',
              color: isDark ? theme.colors.violet[4] : theme.colors.violet[6],
            }}
          >
            <Icon size={30} />
          </ThemeIcon>
        )}

        <Stack spacing={6}>
          <Text
            weight={700}
            size="lg"
            style={{
              color: isDark ? theme.colors.dark[0] : theme.colors.gray[8],
              letterSpacing: '0.1px',
            }}
          >
            {title}
          </Text>

          {description && (
            <Text
              size="sm"
              style={{
                color: isDark ? theme.colors.dark[2] : theme.colors.gray[6],
                lineHeight: 1.5,
              }}
            >
              {description}
            </Text>
          )}
        </Stack>

        {actionLabel && actionPath && (
          <Button
            onClick={() => navigate(actionPath)}
            color="violet"
            variant="light"
            radius="md"
            size="sm"
            style={{
              marginTop: '8px',
              fontWeight: 600,
              transition: 'transform 0.15s ease',
              '&:hover': {
                transform: 'scale(1.02)',
              },
            }}
          >
            {actionLabel}
          </Button>
        )}
      </Stack>
    </Center>
  );
};

export default EmptyState;
