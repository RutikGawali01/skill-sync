/**
 * skillEnums.js
 * ─────────────
 * Single source of truth for all skill-related enum option arrays.
 *
 * Rules:
 *  ✅ value  = exact Java enum name (sent to / received from backend)
 *  ✅ label  = human-readable string (shown in UI)
 *  ❌ Never hardcode options inside components — always import from here
 *
 * Backend API payload fields:
 *   type  (not skillType)
 *   level (not proficiencyLevel)
 */

// ─────────────────────────────────────────────────────────────────────────────
// SkillType  (backend field: "type")
// ─────────────────────────────────────────────────────────────────────────────
export const skillTypeOptions = [
  { value: 'OFFER', label: 'Offering' },
  { value: 'WANT',  label: 'Learning' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Level  (backend field: "level")
// ─────────────────────────────────────────────────────────────────────────────
export const levelOptions = [
  { value: 'BEGINNER',     label: 'Beginner'     },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED',     label: 'Advanced'     },
];

// Alias kept for backward compat (old name used in ProfileView etc.)
export const proficiencyLevelOptions = levelOptions;

// ─────────────────────────────────────────────────────────────────────────────
// Skill Category  (returned by GET /api/skills)
// ─────────────────────────────────────────────────────────────────────────────
export const CATEGORY_COLOR = {
  FRONTEND:   { color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',   border: 'rgba(6,182,212,0.25)'   },
  BACKEND:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)'  },
  DEVOPS:     { color: '#f97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.25)'  },
  DATABASE:   { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)'   },
  MOBILE:     { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)' },
  DATA_SCIENCE:{ color: '#e879f9',bg: 'rgba(232,121,249,0.1)', border: 'rgba(232,121,249,0.25)' },
  DESIGN:     { color: '#fb7185', bg: 'rgba(251,113,133,0.1)', border: 'rgba(251,113,133,0.25)' },
  OTHER:      { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.25)' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Resolve a human-readable label from any option array by its backend value. */
export const resolveSkillLabel = (options, value) =>
  options.find((o) => o.value === value)?.label ?? value ?? '—';

/** Badge colour per level. */
export const LEVEL_COLOR = {
  BEGINNER:     { color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.3)'   },
  INTERMEDIATE: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)'  },
  ADVANCED:     { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',  border: 'rgba(139,92,246,0.3)'  },
};

// Alias kept for backward compat
export const PROFICIENCY_COLOR = LEVEL_COLOR;

/** Badge colour per skill type. */
export const SKILL_TYPE_COLOR = {
  OFFER: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)'  },
  WANT:  { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)' },
};
