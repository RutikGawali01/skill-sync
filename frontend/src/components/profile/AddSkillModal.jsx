/**
 * AddSkillModal.jsx
 * ─────────────────
 * Modal form for adding a skill to the user's profile.
 *
 * Props:
 *   opened          : boolean
 *   onClose         : () => void
 *   onSubmit        : ({ skillId, type, level }) => Promise<void>
 *   adding          : boolean        – submit loading state
 *   availableSkills : SkillDTO[]     – [{ id, name, category }, ...]
 *   catalogLoading  : boolean        – true while catalog is fetching
 *   isDark          : boolean
 *
 * No business logic — all dispatching is handled by SkillsSection.
 *
 * Payload sent to backend:
 *   { skillId: number, type: 'OFFER'|'WANT', level: string }
 */

import { useEffect } from 'react';
import {
  Modal, Stack, Select, Button, Group, Text, Box, Loader,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconSparkles, IconX } from '@tabler/icons-react';

import { skillTypeOptions, levelOptions } from '../../utils/skillEnums';

// ── Component ─────────────────────────────────────────────────────────────────
const AddSkillModal = ({
  opened,
  onClose,
  onSubmit,
  adding,
  availableSkills = [],
  catalogLoading  = false,
  isDark,
}) => {
  const overlayBg    = isDark ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.45)';
  const modalBg      = isDark ? '#12131f' : '#ffffff';
  const inputVariant = isDark ? 'filled' : 'default';

  // Build Select data from dynamic catalog
  const skillSelectData = availableSkills.map((s) => ({
    value: String(s.id),
    label: s.name,
  }));

  const form = useForm({
    initialValues: {
      skillId: '',
      type:    '',
      level:   '',
    },
    validate: {
      skillId: (v) => (!v ? 'Please select a skill'      : null),
      type:    (v) => (!v ? 'Please choose a skill type' : null),
      level:   (v) => (!v ? 'Please choose a level'      : null),
    },
  });

  // Reset form whenever modal closes
  useEffect(() => {
    if (!opened) form.reset();
  }, [opened]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (values) => {
    await onSubmit({
      skillId: Number(values.skillId),
      type:    values.type,
      level:   values.level,
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap={10}>
          <Box
            style={{
              width:          32,
              height:         32,
              borderRadius:   8,
              background:     'rgba(139,92,246,0.18)',
              border:         '1px solid rgba(139,92,246,0.35)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
            }}
          >
            <IconSparkles size={16} color="#8b5cf6" />
          </Box>
          <Text fw={700} size="md" style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>
            Add Skill
          </Text>
        </Group>
      }
      centered
      radius="lg"
      size="sm"
      overlayProps={{ backgroundOpacity: 0.6, blur: 6, color: overlayBg }}
      styles={{
        content: {
          background: modalBg,
          border: isDark
            ? '1px solid rgba(139,92,246,0.25)'
            : '1px solid rgba(139,92,246,0.15)',
        },
        header: {
          background: modalBg,
          borderBottom: isDark
            ? '1px solid rgba(255,255,255,0.06)'
            : '1px solid rgba(0,0,0,0.08)',
          paddingBottom: '0.75rem',
        },
        close: { color: isDark ? '#94a3b8' : '#64748b' },
      }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md" mt="sm">

          {/* ── Skill Select (dynamic from catalog) ── */}
          <Select
            id="add-skill-select"
            label="Skill"
            placeholder={catalogLoading ? 'Loading skills…' : 'Search and select a skill…'}
            data={skillSelectData}
            searchable
            clearable
            disabled={catalogLoading || adding}
            rightSection={catalogLoading ? <Loader size={14} color="violet" /> : undefined}
            nothingFoundMessage="No matching skills found"
            variant={inputVariant}
            radius="md"
            styles={selectStyles(isDark)}
            {...form.getInputProps('skillId')}
          />

          {/* ── Skill Type ── */}
          <Select
            id="add-skill-type"
            label="I want to…"
            placeholder="Select skill type"
            data={skillTypeOptions}
            disabled={adding}
            variant={inputVariant}
            radius="md"
            styles={selectStyles(isDark)}
            {...form.getInputProps('type')}
          />

          {/* ── Level ── */}
          <Select
            id="add-skill-level"
            label="Proficiency Level"
            placeholder="Select your level"
            data={levelOptions}
            disabled={adding}
            variant={inputVariant}
            radius="md"
            styles={selectStyles(isDark)}
            {...form.getInputProps('level')}
          />

          {/* ── Action buttons ── */}
          <Group justify="flex-end" mt="xs" gap="sm">
            <Button
              id="add-skill-cancel-btn"
              variant="subtle"
              color="gray"
              radius="md"
              leftSection={<IconX size={15} />}
              onClick={onClose}
              disabled={adding}
            >
              Cancel
            </Button>
            <Button
              id="add-skill-submit-btn"
              type="submit"
              variant="gradient"
              gradient={{ from: '#7c3aed', to: '#4f46e5', deg: 135 }}
              radius="md"
              loading={adding}
              leftSection={!adding ? <IconSparkles size={15} /> : null}
              style={{ boxShadow: '0 4px 15px rgba(124,58,237,0.35)' }}
            >
              Add Skill
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

// ── Shared Mantine style overrides ────────────────────────────────────────────
const selectStyles = (isDark) => ({
  label: { color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 },
  input: {
    background:  isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    borderColor: isDark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.12)',
    color:       isDark ? '#e2e8f0'                : '#1e293b',
  },
  dropdown: {
    background:  isDark ? '#1a1b2e' : '#ffffff',
    borderColor: isDark ? 'rgba(139,92,246,0.25)' : 'rgba(139,92,246,0.15)',
  },
  option: {
    color: isDark ? '#e2e8f0' : '#1e293b',
    '&[dataSelected]': { background: 'rgba(139,92,246,0.2)' },
    '&[dataHovered]':  { background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
  },
});

export default AddSkillModal;
