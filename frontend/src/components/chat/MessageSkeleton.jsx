import React from 'react';
import { Card, Group, Skeleton, Stack } from '@mantine/core';

/**
 * Skeletal loading state for the message timeline thread.
 */
const MessageSkeleton = ({ count = 3 }) => {
  return (
    <Stack spacing="xl" p="md">
      {Array.from({ length: count }).map((_, idx) => {
        const isRight = idx % 2 === 1;

        return (
          <Stack key={idx} spacing="sm">
            {/* Mock Session Card in the middle for the first item */}
            {idx === 0 && (
              <Card shadow="xs" p="md" radius="md" withBorder style={{ opacity: 0.7 }}>
                <Stack spacing="xs">
                  <Skeleton height={18} width="30%" />
                  <Skeleton height={14} width="70%" />
                  <Skeleton height={14} width="50%" />
                  <Group position="apart" mt="xs">
                    <Skeleton height={32} width="45%" radius="md" />
                    <Skeleton height={32} width="45%" radius="md" />
                  </Group>
                </Stack>
              </Card>
            )}

            {/* Alternating message bubbles */}
            <Group position={isRight ? 'right' : 'left'} spacing="sm" noWrap>
              {!isRight && <Skeleton height={32} circle />}
              <Stack spacing={4} align={isRight ? 'flex-end' : 'flex-start'}>
                <Skeleton
                  height={40}
                  width={isRight ? 180 : 220}
                  radius="md"
                  style={{
                    borderTopRightRadius: isRight ? 0 : 'md',
                    borderTopLeftRadius: !isRight ? 0 : 'md',
                  }}
                />
                <Skeleton height={8} width={50} />
              </Stack>
              {isRight && <Skeleton height={32} circle />}
            </Group>
          </Stack>
        );
      })}
    </Stack>
  );
};

export default MessageSkeleton;
