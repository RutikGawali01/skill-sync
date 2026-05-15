/**
 * availabilityUtils.js
 * ────────────────────
 * Pure utility functions for availability-aware session booking.
 *
 * Backend availability shape:
 *   { id, day: 'MONDAY', startTime: '19:00', endTime: '22:00' }
 *
 * Functions:
 *   - Weekday mapping (backend enum ↔ JS Date.getDay())
 *   - Date restriction (which dates are selectable in DatePicker)
 *   - Time restriction (which hours are selectable for a given date)
 *   - Validation helpers
 *   - Formatting helpers
 */

// ── Weekday Mapping ───────────────────────────────────────────────────────────

/**
 * Maps backend DayOfWeek enum strings to JS Date.getDay() values.
 * JS: 0=Sunday, 1=Monday, …, 6=Saturday
 */
export const BACKEND_DAY_TO_JS = {
  MONDAY:    1,
  TUESDAY:   2,
  WEDNESDAY: 3,
  THURSDAY:  4,
  FRIDAY:    5,
  SATURDAY:  6,
  SUNDAY:    0,
};

/**
 * Reverse mapping: JS getDay() → backend enum string.
 */
export const JS_DAY_TO_BACKEND = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
};

/** Human-readable short labels */
export const DAY_SHORT_LABEL = {
  MONDAY:    'Mon',
  TUESDAY:   'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY:  'Thu',
  FRIDAY:    'Fri',
  SATURDAY:  'Sat',
  SUNDAY:    'Sun',
};

/** Canonical day ordering */
export const DAYS_ORDER = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY',
  'FRIDAY', 'SATURDAY', 'SUNDAY',
];

// ── Internal helper ───────────────────────────────────────────────────────────

/**
 * Coerce any date-like value (Date, dayjs, string, timestamp) to a native Date.
 * Mantine DateInput may pass dayjs objects instead of native Date instances.
 */
const toNativeDate = (d) => {
  if (!d) return null;
  if (d instanceof Date) return d;
  // dayjs objects have a .toDate() method
  if (typeof d.toDate === 'function') return d.toDate();
  return new Date(d);
};

// ── Date Restrictions ─────────────────────────────────────────────────────────

/**
 * Get the set of JS weekday numbers the provider is available on.
 * @param {AvailabilityDTO[]} slots
 * @returns {Set<number>}  e.g. Set(1, 3) for Monday + Wednesday
 */
export const getAvailableJsDays = (slots) => {
  if (!Array.isArray(slots) || slots.length === 0) return new Set();
  return new Set(slots.map((s) => BACKEND_DAY_TO_JS[s.day]).filter((d) => d !== undefined));
};

/**
 * Returns a function suitable for Mantine DateInput's `excludeDate` prop.
 * Dates are excluded if:
 *   1. Their weekday is NOT in the provider's available weekdays
 *   2. They are in the past
 *
 * @param {AvailabilityDTO[]} slots
 * @returns {(date: Date) => boolean}  true = exclude (disable) this date
 */
export const createExcludeDateFn = (slots) => {
  const allowedDays = getAvailableJsDays(slots);

  return (rawDate) => {
    const date = toNativeDate(rawDate);
    if (!date || isNaN(date.getTime())) return true;

    // Exclude past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;

    // Exclude weekdays not in provider availability
    return !allowedDays.has(date.getDay());
  };
};

// ── Time Restrictions ─────────────────────────────────────────────────────────

/**
 * Get the availability slot(s) for a specific date.
 * A provider may have multiple slots on the same weekday.
 *
 * @param {AvailabilityDTO[]} slots  All provider slots
 * @param {Date} date                Selected date
 * @returns {AvailabilityDTO[]}      Matching slots for that weekday
 */
export const getSlotsForDate = (slots, rawDate) => {
  if (!Array.isArray(slots) || !rawDate) return [];
  const date = toNativeDate(rawDate);
  if (!date || isNaN(date.getTime())) return [];
  const backendDay = JS_DAY_TO_BACKEND[date.getDay()];
  return slots.filter((s) => s.day === backendDay);
};

/**
 * Generate selectable time options (in 30-min increments) that fall inside
 * the provider's availability slots for a given date.
 *
 * @param {AvailabilityDTO[]} slots  Provider's availability slots
 * @param {Date} date                Selected date
 * @param {'start'|'end'} type       Whether generating start or end times
 * @param {string} [startTime]       Selected start time (for end-time filtering)
 * @returns {{ value: string, label: string }[]}
 */
export const getTimeOptions = (slots, date, type = 'start', startTime = null) => {
  const daySlots = getSlotsForDate(slots, date);
  if (daySlots.length === 0) return [];

  const options = [];

  for (const slot of daySlots) {
    const [startH, startM] = slot.startTime.split(':').map(Number);
    const [endH, endM]     = slot.endTime.split(':').map(Number);
    const slotStartMins    = startH * 60 + startM;
    const slotEndMins      = endH * 60 + endM;

    // Generate 30-minute increments
    for (let mins = slotStartMins; mins < slotEndMins; mins += 30) {
      // For end time: skip options ≤ selected start time, and include the slot end
      if (type === 'end' && startTime) {
        const [sh, sm] = startTime.split(':').map(Number);
        const selectedStartMins = sh * 60 + sm;
        if (mins <= selectedStartMins) continue;
      }

      const h = Math.floor(mins / 60);
      const m = mins % 60;
      const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      options.push({ value, label: formatTime12h(value) });
    }

    // For end time: include the slot's end time itself
    if (type === 'end') {
      const endValue = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
      if (startTime) {
        const [sh, sm] = startTime.split(':').map(Number);
        if (endH * 60 + endM > sh * 60 + sm) {
          // Avoid duplicate if already added
          if (!options.find((o) => o.value === endValue)) {
            options.push({ value: endValue, label: formatTime12h(endValue) });
          }
        }
      }
    }
  }

  // Dedupe and sort
  const unique = [...new Map(options.map((o) => [o.value, o])).values()];
  unique.sort((a, b) => a.value.localeCompare(b.value));
  return unique;
};

// ── Validation ────────────────────────────────────────────────────────────────

/**
 * Check if a time range falls within any of the provider's slots for that date.
 *
 * @param {AvailabilityDTO[]} slots
 * @param {Date} date
 * @param {string} startTime  "HH:mm"
 * @param {string} endTime    "HH:mm"
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateTimeInSlot = (slots, rawDate, startTime, endTime) => {
  if (!rawDate) return { valid: false, error: 'Date is required' };
  const date = toNativeDate(rawDate);
  if (!startTime) return { valid: false, error: 'Start time is required' };
  if (!endTime) return { valid: false, error: 'End time is required' };

  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const startMins = sh * 60 + sm;
  const endMins   = eh * 60 + em;

  if (endMins <= startMins) {
    return { valid: false, error: 'End time must be after start time' };
  }

  const daySlots = getSlotsForDate(slots, date);
  if (daySlots.length === 0) {
    return { valid: false, error: 'Provider is not available on this day' };
  }

  // Check if time range fits inside any slot
  const fitsInSlot = daySlots.some((slot) => {
    const [slotSH, slotSM] = slot.startTime.split(':').map(Number);
    const [slotEH, slotEM] = slot.endTime.split(':').map(Number);
    const slotStart = slotSH * 60 + slotSM;
    const slotEnd   = slotEH * 60 + slotEM;
    return startMins >= slotStart && endMins <= slotEnd;
  });

  if (!fitsInSlot) {
    return { valid: false, error: 'Selected time is outside provider availability' };
  }

  return { valid: true };
};

// ── Formatting ────────────────────────────────────────────────────────────────

/**
 * Format 24h time string to 12h display.
 * "19:00" → "7:00 PM", "09:30" → "9:30 AM"
 */
export const formatTime12h = (time24) => {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
};

/**
 * Compact format: "7 PM" for on-the-hour, "7:30 PM" otherwise.
 */
export const formatTimeCompact = (time24) => {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return m === 0 ? `${hour12} ${period}` : `${hour12}:${String(m).padStart(2, '0')} ${period}`;
};

/**
 * Sort availability slots by canonical day order.
 */
export const sortSlotsByDay = (slots) => {
  if (!Array.isArray(slots)) return [];
  return [...slots].sort(
    (a, b) => DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day)
  );
};
