/**
 * SkillsSection.jsx
 * ─────────────────
 * Unified, production-grade Skills Management section for the Profile Page.
 *
 * Design:
 *  ✅ One section — no duplicates
 *  ✅ Summary stat pills (Total / Offering / Learning)
 *  ✅ Filter tabs: All | Offering | Learning
 *  ✅ Compact skill cards (Name, Category, Type, Level, Delete)
 *  ✅ Skeleton loaders + empty state with CTA
 *  ✅ Inline confirm-delete overlay
 *  ✅ Success / error notifications
 *
 * Props:
 *   isDark : boolean
 *
 * No userId — backend identifies user via JWT.
 * Data flow: Component → Redux Thunk → Service Layer → Backend → Store → UI
 */

import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Text, Group, Stack, Button, ActionIcon, Tabs,
  Skeleton, Tooltip, SimpleGrid,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconPlus, IconTrash, IconBrain, IconBook2,
  IconSparkles, IconInbox, IconX, IconCheck,
  IconCode, IconServer, IconCloud, IconDeviceMobile,
  IconPalette, IconDatabase, IconChartBar,
} from '@tabler/icons-react';

import {
  fetchAvailableSkills,
  fetchUserSkills,
  addUserSkill,
  removeUserSkill,
  selectAvailableSkills,
  selectUserSkills,
  selectSkillsLoading,
  selectCatalogLoading,
  selectSkillsAdding,
  selectSkillsRemoving,
  selectSkillsError,
  clearSkillError,
} from '../../redux/skillSlice';

import AddSkillModal from './AddSkillModal';
import {
  LEVEL_COLOR,
  SKILL_TYPE_COLOR,
  CATEGORY_COLOR,
  resolveSkillLabel,
  levelOptions,
  skillTypeOptions,
} from '../../utils/skillEnums';

// ── Category → icon map ───────────────────────────────────────────────────────
const CATEGORY_ICON = {
  FRONTEND:    IconCode,
  BACKEND:     IconServer,
  DEVOPS:      IconCloud,
  DATABASE:    IconDatabase,
  MOBILE:      IconDeviceMobile,
  DATA_SCIENCE: IconChartBar,
  DESIGN:      IconPalette,
  OTHER:       IconSparkles,
};

// ── Inline Confirm Delete overlay ─────────────────────────────────────────────
const ConfirmDeleteOverlay = ({ skill, onConfirm, onCancel, isRemoving, isDark }) => (
  <Box
    style={{
      position:       'absolute',
      inset:          0,
      borderRadius:   12,
      background:     isDark ? 'rgba(10,8,28,0.97)' : 'rgba(255,248,248,0.97)',
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      gap:            10,
      padding:        '0.75rem',
      zIndex:         10,
      backdropFilter: 'blur(6px)',
    }}
  >
    <IconTrash size={18} color="#ef4444" />
    <Text size="xs" fw={600} ta="center" style={{ color: isDark ? '#fca5a5' : '#dc2626', lineHeight: 1.5 }}>
      Remove "{skill.skillName ?? `Skill #${skill.skillId}`}"?
    </Text>
    <Group gap={6}>
      <Button size="xs" variant="subtle" color="gray" radius="md" leftSection={<IconX size={11} />} onClick={onCancel} disabled={isRemoving}>
        Keep
      </Button>
      <Button size="xs" color="red" radius="md" leftSection={<IconCheck size={11} />} loading={isRemoving} onClick={onConfirm}>
        Remove
      </Button>
    </Group>
  </Box>
);

// ── Skill Card ────────────────────────────────────────────────────────────────
const SkillCard = ({ skill, onRemove, isRemoving, isDark }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const levelKey    = skill.level    ?? skill.proficiencyLevel;
  const typeKey     = skill.type     ?? skill.skillType;
  const categoryKey = skill.category;

  const levelConfig    = LEVEL_COLOR[levelKey]       ?? LEVEL_COLOR.BEGINNER;
  const typeConfig     = SKILL_TYPE_COLOR[typeKey]    ?? SKILL_TYPE_COLOR.OFFER;
  const categoryConfig = CATEGORY_COLOR[categoryKey] ?? CATEGORY_COLOR.OTHER;
  const CategoryIcon   = CATEGORY_ICON[categoryKey]  ?? CATEGORY_ICON.OTHER;

  const cardBg     = isDark ? 'rgba(22,24,45,0.9)' : '#ffffff';
  const borderCol  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const nameColor  = isDark ? '#e2e8f0' : '#1e293b';

  return (
    <Box
      style={{
        background:    cardBg,
        border:        `1px solid ${borderCol}`,
        borderRadius:  12,
        padding:       '0.85rem 1rem',
        display:       'flex',
        flexDirection: 'column',
        gap:           8,
        position:      'relative',
        overflow:      'hidden',
        transition:    'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
        boxShadow:     isDark ? '0 2px 8px rgba(0,0,0,0.25)' : '0 2px 8px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={(e) => {
        if (confirmOpen) return;
        e.currentTarget.style.transform   = 'translateY(-2px)';
        e.currentTarget.style.boxShadow   = isDark
          ? `0 8px 20px rgba(0,0,0,0.4), 0 0 0 1px ${typeConfig.border}`
          : `0 8px 20px rgba(0,0,0,0.08), 0 0 0 1px ${typeConfig.border}`;
        e.currentTarget.style.borderColor = typeConfig.border;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform   = 'translateY(0)';
        e.currentTarget.style.boxShadow   = isDark ? '0 2px 8px rgba(0,0,0,0.25)' : '0 2px 8px rgba(0,0,0,0.05)';
        e.currentTarget.style.borderColor = borderCol;
      }}
    >
      {/* Thin left accent bar */}
      <Box
        style={{
          position:     'absolute',
          top:          0, left: 0, bottom: 0,
          width:        3,
          background:   `linear-gradient(180deg, ${typeConfig.color} 0%, ${levelConfig.color} 100%)`,
          borderRadius: '12px 0 0 12px',
        }}
      />

      {/* Row 1: icon + name + delete */}
      <Group justify="space-between" align="center" wrap="nowrap" pl={8}>
        <Group gap={8} align="center" style={{ flex: 1, minWidth: 0 }}>
          <Box
            style={{
              width:          26,
              height:         26,
              borderRadius:   7,
              background:     categoryConfig.bg,
              border:         `1px solid ${categoryConfig.border}`,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              flexShrink:     0,
            }}
          >
            <CategoryIcon size={13} color={categoryConfig.color} />
          </Box>
          <Text
            fw={700}
            size="sm"
            style={{ color: nameColor, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            title={skill.skillName}
          >
            {skill.skillName ?? `Skill #${skill.skillId}`}
          </Text>
        </Group>

        <Tooltip label="Remove" position="left" withArrow>
          <ActionIcon
            id={`remove-skill-${skill.skillId}-${typeKey}`}
            variant="subtle"
            color="red"
            size="xs"
            radius="md"
            onClick={() => setConfirmOpen(true)}
            style={{ flexShrink: 0, opacity: 0.7 }}
          >
            <IconTrash size={12} />
          </ActionIcon>
        </Tooltip>
      </Group>

      {/* Row 2: badges */}
      <Group gap={5} wrap="wrap" pl={8}>
        {/* Category */}
        {categoryKey && (
          <Box style={{ background: categoryConfig.bg, border: `1px solid ${categoryConfig.border}`, borderRadius: 5, padding: '1px 7px' }}>
            <Text size="xs" fw={600} style={{ color: categoryConfig.color, fontSize: '0.68rem', letterSpacing: '0.2px' }}>
              {categoryKey.replace(/_/g, ' ')}
            </Text>
          </Box>
        )}

        {/* Type: OFFER/WANT */}
        <Box style={{ background: typeConfig.bg, border: `1px solid ${typeConfig.border}`, borderRadius: 5, padding: '1px 7px' }}>
          <Text size="xs" fw={600} style={{ color: typeConfig.color, fontSize: '0.68rem', letterSpacing: '0.2px' }}>
            {typeKey === 'OFFER' ? '↑ Offering' : '↓ Learning'}
          </Text>
        </Box>

        {/* Level */}
        <Box style={{ background: levelConfig.bg, border: `1px solid ${levelConfig.border}`, borderRadius: 5, padding: '1px 7px' }}>
          <Text size="xs" fw={600} style={{ color: levelConfig.color, fontSize: '0.68rem', letterSpacing: '0.2px' }}>
            {resolveSkillLabel(levelOptions, levelKey)}
          </Text>
        </Box>
      </Group>

      {/* Confirm delete overlay */}
      {confirmOpen && (
        <ConfirmDeleteOverlay
          skill={skill}
          onConfirm={async () => { await onRemove(skill); setConfirmOpen(false); }}
          onCancel={() => setConfirmOpen(false)}
          isRemoving={isRemoving}
          isDark={isDark}
        />
      )}
    </Box>
  );
};

// ── Stat Pill ─────────────────────────────────────────────────────────────────
const StatPill = ({ label, count, color, bg, border }) => (
  <Box
    style={{
      display:        'flex',
      alignItems:     'center',
      gap:            6,
      padding:        '5px 12px',
      borderRadius:   20,
      background:     bg,
      border:         `1px solid ${border}`,
    }}
  >
    <Box style={{ width: 7, height: 7, borderRadius: '50%', background: color, boxShadow: `0 0 5px ${color}` }} />
    <Text size="xs" style={{ color, fontWeight: 700 }}>{count}</Text>
    <Text size="xs" style={{ color, opacity: 0.75, fontWeight: 500 }}>{label}</Text>
  </Box>
);

// ── Skeleton (exported for ProfilePage) ───────────────────────────────────────
export const SkillsSectionSkeleton = () => (
  <Box style={{ borderRadius: 16, overflow: 'hidden' }}>
    <Group justify="space-between" align="center" mb="md">
      <Group gap={8}>
        <Skeleton height={18} width={60} radius="xl" />
        <Skeleton height={18} width={60} radius="xl" />
        <Skeleton height={18} width={60} radius="xl" />
      </Group>
      <Skeleton height={32} width={100} radius="md" />
    </Group>
    <Skeleton height={34} radius="md" mb="md" />
    <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing="sm">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} height={90} radius={12} />
      ))}
    </SimpleGrid>
  </Box>
);

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({ isDark, onAdd, tab }) => {
  const message =
    tab === 'offer'
      ? 'No skills offered yet. Add the skills you can teach or share.'
      : tab === 'want'
        ? 'No learning goals yet. Add what you want to learn from others.'
        : 'No skills added yet. Add your first skill to start matching with learners and mentors.';

  return (
    <Box
      style={{
        textAlign:    'center',
        padding:      '2.5rem 1.5rem',
        border:       `1px dashed ${isDark ? 'rgba(139,92,246,0.18)' : 'rgba(139,92,246,0.12)'}`,
        borderRadius: 14,
        background:   isDark ? 'rgba(139,92,246,0.03)' : 'rgba(139,92,246,0.015)',
      }}
    >
      <IconInbox size={32} color={isDark ? '#334155' : '#cbd5e1'} style={{ marginBottom: 10 }} />
      <Text size="sm" mb="md" style={{ color: isDark ? '#475569' : '#94a3b8', maxWidth: 340, margin: '0 auto 1rem' }}>
        {message}
      </Text>
      {tab === 'all' && (
        <Button
          id="empty-state-add-skill-btn"
          size="xs"
          variant="light"
          color="violet"
          radius="md"
          leftSection={<IconPlus size={13} />}
          onClick={onAdd}
        >
          Add Skill
        </Button>
      )}
    </Box>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const SkillsSection = ({ isDark }) => {
  const dispatch        = useDispatch();
  const availableSkills = useSelector(selectAvailableSkills);
  const userSkills      = useSelector(selectUserSkills);
  const loading         = useSelector(selectSkillsLoading);
  const catalogLoading  = useSelector(selectCatalogLoading);
  const adding          = useSelector(selectSkillsAdding);
  const removing        = useSelector(selectSkillsRemoving);
  const storeError      = useSelector(selectSkillsError);

  const [activeTab, setActiveTab] = useState('all');
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

  // ── Fetch on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchUserSkills());
    dispatch(fetchAvailableSkills());
  }, [dispatch]);

  // ── Surface errors ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (storeError) {
      notifications.show({ id: 'skill-error', title: 'Skills Error', message: storeError, color: 'red', autoClose: 5000, radius: 'md' });
      dispatch(clearSkillError());
    }
  }, [storeError, dispatch]);

  // ── Derived values ──────────────────────────────────────────────────────────
  const typeOf = (s) => s.type ?? s.skillType;

  const filteredSkills = useMemo(() => {
    if (activeTab === 'offer') return userSkills.filter((s) => typeOf(s) === 'OFFER');
    if (activeTab === 'want')  return userSkills.filter((s) => typeOf(s) === 'WANT');
    return userSkills;
  }, [userSkills, activeTab]);

  const totalCount = userSkills.length;
  const offerCount = userSkills.filter((s) => typeOf(s) === 'OFFER').length;
  const wantCount  = userSkills.filter((s) => typeOf(s) === 'WANT').length;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleAddSkill = async (payload) => {
    const result = await dispatch(addUserSkill(payload));
    if (addUserSkill.fulfilled.match(result)) {
      notifications.show({ id: 'skill-added', title: 'Skill Added ✨', message: 'Skill added to your profile.', color: 'teal', autoClose: 4000, radius: 'md' });
      closeModal();
    }
  };

  const handleRemoveSkill = async (skill) => {
    const result = await dispatch(removeUserSkill({ skillId: skill.skillId, type: typeOf(skill) }));
    if (removeUserSkill.fulfilled.match(result)) {
      notifications.show({ id: 'skill-removed', title: 'Skill Removed', message: 'Skill removed from your profile.', color: 'orange', autoClose: 3000, radius: 'md' });
    }
  };

  // ── Style tokens ─────────────────────────────────────────────────────────────
  const wrapBg     = isDark ? 'rgba(17,19,40,0.7)' : 'rgba(255,255,255,0.85)';
  const wrapBorder = isDark ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.1)';
  const titleColor = isDark ? '#e2e8f0' : '#1e293b';
  const subColor   = isDark ? '#64748b' : '#94a3b8';

  return (
    <>
      <Box
        style={{
          background:     wrapBg,
          border:         `1px solid ${wrapBorder}`,
          borderRadius:   18,
          padding:        '1.4rem 1.5rem',
          backdropFilter: 'blur(10px)',
          boxShadow:      isDark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 24px rgba(139,92,246,0.06)',
        }}
      >
        {/* ── Header ── */}
        <Group justify="space-between" align="flex-start" mb="md" wrap="wrap" gap={12}>
          {/* Left: title + subtitle + stat pills */}
          <Stack gap={6}>
            <Group gap={8} align="center">
              <Box
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: 'rgba(139,92,246,0.15)',
                  border: '1px solid rgba(139,92,246,0.28)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <IconSparkles size={15} color="#8b5cf6" />
              </Box>
              <Text fw={700} size="md" style={{ color: titleColor }}>Skills</Text>
            </Group>
            <Text size="xs" style={{ color: subColor, maxWidth: 380 }}>
              Manage the skills you can teach and the skills you want to learn.
            </Text>

            {/* Stat pills */}
            {!loading && (
              <Group gap={6} mt={2} wrap="wrap">
                <StatPill label="Total"    count={totalCount} color="#8b5cf6" bg="rgba(139,92,246,0.1)"  border="rgba(139,92,246,0.2)" />
                <StatPill label="Offering" count={offerCount} color="#22c55e" bg="rgba(34,197,94,0.08)"  border="rgba(34,197,94,0.2)"  />
                <StatPill label="Learning" count={wantCount}  color="#a78bfa" bg="rgba(167,139,250,0.08)" border="rgba(167,139,250,0.2)" />
              </Group>
            )}
          </Stack>

          {/* Right: Add button */}
          <Button
            id="open-add-skill-modal-btn"
            leftSection={<IconPlus size={14} />}
            onClick={openModal}
            variant="gradient"
            gradient={{ from: '#7c3aed', to: '#4f46e5', deg: 135 }}
            radius="md"
            size="sm"
            style={{ boxShadow: '0 4px 14px rgba(124,58,237,0.3)', fontWeight: 600, flexShrink: 0 }}
          >
            Add Skill
          </Button>
        </Group>

        {/* ── Tabs ── */}
        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          mb="md"
          styles={{
            tab:  { fontWeight: 600, fontSize: '0.8rem', padding: '6px 14px' },
            list: { borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}` },
          }}
        >
          <Tabs.List>
            <Tabs.Tab id="skills-tab-all"   value="all"   rightSection={<TabCount n={totalCount} color="#8b5cf6" />}>All</Tabs.Tab>
            <Tabs.Tab id="skills-tab-offer" value="offer" rightSection={<TabCount n={offerCount} color="#22c55e" />}>Offering</Tabs.Tab>
            <Tabs.Tab id="skills-tab-want"  value="want"  rightSection={<TabCount n={wantCount}  color="#a78bfa" />}>Learning</Tabs.Tab>
          </Tabs.List>
        </Tabs>

        {/* ── Content ── */}
        {loading ? (
          <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing="sm">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={90} radius={12} />)}
          </SimpleGrid>
        ) : filteredSkills.length === 0 ? (
          <EmptyState isDark={isDark} onAdd={openModal} tab={activeTab} />
        ) : (
          <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing="sm">
            {filteredSkills.map((skill) => (
              <SkillCard
                key={`${skill.skillId}-${typeOf(skill)}`}
                skill={skill}
                isDark={isDark}
                isRemoving={removing === skill.skillId}
                onRemove={handleRemoveSkill}
              />
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* ── Modal ── */}
      <AddSkillModal
        opened={modalOpened}
        onClose={closeModal}
        onSubmit={handleAddSkill}
        adding={adding}
        availableSkills={availableSkills}
        catalogLoading={catalogLoading}
        isDark={isDark}
      />
    </>
  );
};

// ── Small tab count badge ─────────────────────────────────────────────────────
const TabCount = ({ n, color }) => (
  <Box
    style={{
      background: `${color}18`,
      color,
      borderRadius: 20,
      padding:      '0 6px',
      fontSize:     '0.65rem',
      fontWeight:   700,
      minWidth:     18,
      textAlign:    'center',
      lineHeight:   '16px',
    }}
  >
    {n}
  </Box>
);

export default SkillsSection;
