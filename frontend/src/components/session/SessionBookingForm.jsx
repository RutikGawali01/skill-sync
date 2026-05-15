/**
 * SessionBookingForm.jsx
 * ──────────────────────
 * The availability-aware booking form body, extracted from the modal
 * for clean separation. Handles all form state, validation, and submission.
 *
 * Props:
 *   skill              — ExploreSkillDTO (selected skill card data)
 *   providerSlots      — AvailabilityDTO[] (provider's weekly availability)
 *   slotsLoading       — boolean
 *   onSubmit           — (payload) => Promise<boolean>
 *   onClose            — () => void
 *   submitting         — boolean
 */

import { useState, useCallback, useMemo } from 'react';
import {
  Textarea,
  Button,
  Group,
  Stack,
  Text,
  Divider,
  Alert,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {
  Calendar,
  MessageSquare,
  Send,
  AlertCircle,
  BookOpen,
  User,
  Clock,
} from 'lucide-react';
import dayjs from 'dayjs';

import AvailabilityPreview from './AvailabilityPreview';
import TimeSlotPicker from './TimeSlotPicker';
import {
  createExcludeDateFn,
  validateTimeInSlot,
  getAvailableJsDays,
  DAY_SHORT_LABEL,
} from '../../utils/availabilityUtils';

const SessionBookingForm = ({
  skill,
  providerSlots = [],
  slotsLoading = false,
  onSubmit,
  onClose,
  submitting = false,
}) => {
  // ── Form state ─────────────────────────────────────────────────────────────
  const [date, setDate]           = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime]     = useState(null);
  const [message, setMessage]     = useState('');
  const [errors, setErrors]       = useState({});

  // ── Derived ────────────────────────────────────────────────────────────────

  // Date picker: exclude dates not matching provider availability
  const excludeDateFn = useMemo(
    () => createExcludeDateFn(providerSlots),
    [providerSlots]
  );

  // Available weekdays summary for UX hint
  const availableDayLabels = useMemo(() => {
    const days = getAvailableJsDays(providerSlots);
    // Convert back to backend enum for labels
    const labels = [];
    days.forEach((jsDay) => {
      const map = { 0: 'SUNDAY', 1: 'MONDAY', 2: 'TUESDAY', 3: 'WEDNESDAY', 4: 'THURSDAY', 5: 'FRIDAY', 6: 'SATURDAY' };
      labels.push(DAY_SHORT_LABEL[map[jsDay]] || '');
    });
    return labels.filter(Boolean).join(', ');
  }, [providerSlots]);

  // Duration preview
  const durationDisplay = useMemo(() => {
    if (!startTime || !endTime) return null;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins <= 0) return null;
    if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60 ? `${mins % 60}m` : ''}`;
    return `${mins} minutes`;
  }, [startTime, endTime]);

  // ── Reset time when date changes ───────────────────────────────────────────
  const handleDateChange = useCallback((newDate) => {
    setDate(newDate);
    setStartTime(null);
    setEndTime(null);
    setErrors((prev) => {
      const { date, startTime, endTime, ...rest } = prev;
      return rest;
    });
  }, []);

  const handleStartTimeChange = useCallback((val) => {
    setStartTime(val);
    setEndTime(null); // Reset end time when start changes
    setErrors((prev) => {
      const { startTime, endTime, ...rest } = prev;
      return rest;
    });
  }, []);

  const handleEndTimeChange = useCallback((val) => {
    setEndTime(val);
    setErrors((prev) => {
      const { endTime, ...rest } = prev;
      return rest;
    });
  }, []);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = useCallback(() => {
    const newErrors = {};

    if (!date) {
      newErrors.date = 'Date is required';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        newErrors.date = 'Date must be in the future';
      }
    }

    if (!startTime) newErrors.startTime = 'Start time is required';
    if (!endTime) newErrors.endTime = 'End time is required';

    // Validate time fits in provider slot
    if (date && startTime && endTime) {
      const result = validateTimeInSlot(providerSlots, date, startTime, endTime);
      if (!result.valid) {
        newErrors.endTime = result.error;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [date, startTime, endTime, providerSlots]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;

    const dateStr  = dayjs(date).format('YYYY-MM-DD');
    const startISO = `${dateStr}T${startTime}:00`;
    const endISO   = `${dateStr}T${endTime}:00`;

    const payload = {
      providerId: skill?.userId,
      skillId:    skill?.skillId || skill?.userSkillId,
      startTime:  startISO,
      endTime:    endISO,
      message:    message.trim() || undefined,
      mode:       'DIRECT_LEARNING',
    };

    const success = await onSubmit(payload);
    if (success) {
      // Reset form
      setDate(null);
      setStartTime(null);
      setEndTime(null);
      setMessage('');
      setErrors({});
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Stack gap="md">
      {/* ── Skill & Provider Info ── */}
      {skill && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <Text fw={700} size="sm" lineClamp={1}>
                {skill.skillName}
              </Text>
              <div className="flex items-center gap-1.5 mt-0.5">
                <User className="w-3 h-3 text-gray-400" />
                <Text size="xs" c="dimmed" lineClamp={1}>
                  with {skill.fullName || 'Provider'}
                </Text>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Provider Availability Schedule ── */}
      <AvailabilityPreview
        slots={providerSlots}
        loading={slotsLoading}
        compact={false}
      />

      <Divider />

      {/* ── Date Picker ── */}
      <DateInput
        label="Session Date"
        description={
          availableDayLabels
            ? `Provider available on: ${availableDayLabels}`
            : 'Loading availability…'
        }
        placeholder="Pick an available date"
        value={date}
        onChange={handleDateChange}
        excludeDate={excludeDateFn}
        error={errors.date}
        leftSection={<Calendar style={{ width: 16, height: 16 }} />}
        radius="md"
        required
        disabled={slotsLoading || providerSlots.length === 0}
      />

      {/* ── Time Pickers ── */}
      <Group grow>
        <TimeSlotPicker
          slots={providerSlots}
          selectedDate={date}
          value={startTime}
          onChange={handleStartTimeChange}
          type="start"
          error={errors.startTime}
          disabled={!date}
        />
        <TimeSlotPicker
          slots={providerSlots}
          selectedDate={date}
          startTime={startTime}
          value={endTime}
          onChange={handleEndTimeChange}
          type="end"
          error={errors.endTime}
          disabled={!date || !startTime}
        />
      </Group>

      {/* ── Duration Preview ── */}
      {durationDisplay && (
        <div className="flex items-center gap-2 px-3 py-2 bg-violet-50 dark:bg-violet-950/30 rounded-lg border border-violet-100 dark:border-violet-900/30">
          <Clock className="w-3.5 h-3.5 text-violet-500" />
          <Text size="xs" c="violet">
            Duration: {durationDisplay}
          </Text>
        </div>
      )}

      {/* ── Message ── */}
      <Textarea
        label="Message (Optional)"
        description="Introduce yourself or mention what you'd like to learn"
        placeholder="Hi! I'm interested in learning about…"
        value={message}
        onChange={(e) => setMessage(e.currentTarget.value)}
        radius="md"
        minRows={3}
        maxRows={5}
        maxLength={500}
      />

      {/* ── No Availability Warning ── */}
      {!slotsLoading && providerSlots.length === 0 && (
        <Alert
          icon={<AlertCircle style={{ width: 16, height: 16 }} />}
          color="orange"
          variant="light"
          radius="md"
          title="No availability"
        >
          This provider hasn't set their weekly availability yet. You won't be able to book a session until they do.
        </Alert>
      )}

      {/* ── Error Summary ── */}
      {Object.values(errors).some(Boolean) && (
        <Alert
          icon={<AlertCircle style={{ width: 16, height: 16 }} />}
          color="red"
          variant="light"
          radius="md"
        >
          Please fix the errors above before submitting.
        </Alert>
      )}

      {/* ── Actions ── */}
      <Group justify="flex-end" pt="xs">
        <Button
          variant="subtle"
          color="gray"
          onClick={onClose}
          radius="md"
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          loading={submitting}
          leftSection={<Send style={{ width: 16, height: 16 }} />}
          radius="md"
          variant="gradient"
          gradient={{ from: 'violet', to: 'indigo', deg: 135 }}
          disabled={providerSlots.length === 0}
        >
          Send Request
        </Button>
      </Group>
    </Stack>
  );
};

export default SessionBookingForm;
