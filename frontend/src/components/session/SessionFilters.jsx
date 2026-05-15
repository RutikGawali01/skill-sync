/**
 * SessionFilters.jsx
 * ──────────────────
 * Client-side search/filter bar for sessions within the active tab.
 * Filters by skill name, partner name, or message content.
 */

import { TextInput } from '@mantine/core';
import { Search } from 'lucide-react';

const SessionFilters = ({ query, onQueryChange }) => {
  return (
    <div className="flex items-center gap-3">
      <TextInput
        id="session-search"
        value={query}
        onChange={(e) => onQueryChange(e.currentTarget.value)}
        placeholder="Search by skill, name, or message…"
        leftSection={<Search style={{ width: 16, height: 16 }} />}
        radius="xl"
        size="sm"
        styles={{
          root: { flex: 1, maxWidth: 400 },
          input: {
            backgroundColor: 'var(--mantine-color-default)',
            border: '1px solid var(--mantine-color-default-border)',
            fontSize: '13px',
          },
        }}
      />
    </div>
  );
};

export default SessionFilters;
