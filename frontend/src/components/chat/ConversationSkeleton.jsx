import React from 'react';
import { Group, Skeleton, Stack } from '@mantine/core';

/**
 * Skeletal loading state for the conversation list.
 */
const ConversationSkeleton = ({ count = 4 }) => {
  return (
    <Stack spacing="md" p="md">
      {Array.from({ length: count }).map((_, idx) => (
        <Group key={idx} spacing="sm" noWrap>
          <Skeleton height={42} circle />
          <Stack spacing={8} style={{ flexGrow: 1 }}>
            <Group position="apart">
              <Skeleton height={14} width="40%" radius="xs" />
              <Skeleton height={10} width="15%" radius="xs" />
            </Group>
            <Skeleton height={12} width="80%" radius="xs" />
          </Stack>
        </Group>
      ))}
    </Stack>
  );
};

export default ConversationSkeleton;
