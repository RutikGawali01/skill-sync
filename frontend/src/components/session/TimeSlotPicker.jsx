/**
 * TimeSlotPicker.jsx
 * ──────────────────
 * Smart time picker that only shows times within provider availability slots.
 *
 * Props:
 *   slots          — AvailabilityDTO[] (provider's availability)
 *   selectedDate   — Date object (the selected booking date)
 *   startTime      — string "HH:mm" (selected start time, for end-time filtering)
 *   value          — current selected value
 *   onChange        — (value: string) => void
 *   type           — 'start' | 'end'
 *   error          — error message
 *   disabled       — boolean
 *
 * Uses Mantine Select with options generated from availabilityUtils.
 */

import { Select } from '@mantine/core';
import { Clock } from 'lucide-react';
import { getTimeOptions, getSlotsForDate, formatTimeCompact } from '../../utils/availabilityUtils';

const TimeSlotPicker = ({
  slots = [],
  selectedDate,
  startTime = null,
  value,
  onChange,
  type = 'start',
  error,
  disabled = false,
}) => {
  // Generate time options based on provider availability for the selected date
  const options = selectedDate
    ? getTimeOptions(slots, selectedDate, type, type === 'end' ? startTime : null)
    : [];

  // Get the slot range for the helper text
  const daySlots = selectedDate ? getSlotsForDate(slots, selectedDate) : [];
  const rangeHint = daySlots.length > 0
    ? daySlots
        .map((s) => `${formatTimeCompact(s.startTime)} – ${formatTimeCompact(s.endTime)}`)
        .join(', ')
    : null;

  return (
    <Select
      label={type === 'start' ? 'Start Time' : 'End Time'}
      description={
        rangeHint
          ? `Available: ${rangeHint}`
          : selectedDate
            ? 'No availability for this date'
            : 'Select a date first'
      }
      placeholder={
        !selectedDate
          ? 'Select date first'
          : options.length === 0
            ? 'No slots available'
            : `Choose ${type} time`
      }
      data={options}
      value={value}
      onChange={onChange}
      error={error}
      disabled={disabled || !selectedDate || options.length === 0}
      leftSection={<Clock style={{ width: 16, height: 16 }} />}
      radius="md"
      searchable
      clearable
      required
      nothingFoundMessage="No available times"
      maxDropdownHeight={200}
      styles={{
        input: { fontSize: '13px' },
        description: { fontSize: '11px' },
      }}
    />
  );
};

export default TimeSlotPicker;
