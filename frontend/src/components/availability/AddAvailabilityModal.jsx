/**
 * AddAvailabilityModal.jsx
 * ────────────────────────
 * Modal for creating a new weekly availability slot.
 *
 * Fields: Day (Select), Start Time, End Time
 * Validation: all required, start < end
 * Uses Mantine Modal + Select + native time inputs for maximum compatibility.
 */

import { useState, useEffect } from 'react';
import { Modal, Select, Button } from '@mantine/core';
import { Clock, CalendarPlus } from 'lucide-react';

// Day options for the dropdown
const DAY_OPTIONS = [
  { value: 'MONDAY',    label: 'Monday' },
  { value: 'TUESDAY',   label: 'Tuesday' },
  { value: 'WEDNESDAY', label: 'Wednesday' },
  { value: 'THURSDAY',  label: 'Thursday' },
  { value: 'FRIDAY',    label: 'Friday' },
  { value: 'SATURDAY',  label: 'Saturday' },
  { value: 'SUNDAY',    label: 'Sunday' },
];

/**
 * Validate that startTime is before endTime.
 * Both are in "HH:mm" 24h format.
 */
const isValidTimeRange = (start, end) => {
  if (!start || !end) return false;
  return start < end;
};

const AddAvailabilityModal = ({ opened, onClose, onSubmit, preselectedDay, creating }) => {
  const [day, setDay]             = useState(preselectedDay || '');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime]     = useState('');
  const [errors, setErrors]       = useState({});

  // Reset form when modal opens or preselected day changes
  useEffect(() => {
    if (opened) {
      setDay(preselectedDay || '');
      setStartTime('');
      setEndTime('');
      setErrors({});
    }
  }, [opened, preselectedDay]);

  const validate = () => {
    const errs = {};
    if (!day)       errs.day       = 'Please select a day';
    if (!startTime) errs.startTime = 'Start time is required';
    if (!endTime)   errs.endTime   = 'End time is required';
    if (startTime && endTime && !isValidTimeRange(startTime, endTime)) {
      errs.endTime = 'End time must be after start time';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({ day, startTime, endTime });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <CalendarPlus className="w-5 h-5 text-violet-500" />
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            Add Availability Slot
          </span>
        </div>
      }
      centered
      radius="lg"
      size="md"
      overlayProps={{ backgroundOpacity: 0.4, blur: 4 }}
      styles={{
        content: {
          backgroundColor: 'var(--modal-bg, #fff)',
        },
      }}
      classNames={{
        content: 'dark:!bg-gray-900',
        header:  'dark:!bg-gray-900',
        body:    'dark:!bg-gray-900',
      }}
    >
      <div className="flex flex-col gap-5 pt-2">
        {/* Day Select */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Day of Week
          </label>
          <Select
            id="add-slot-day"
            placeholder="Select a day"
            data={DAY_OPTIONS}
            value={day}
            onChange={setDay}
            error={errors.day}
            searchable
            classNames={{
              input: 'dark:!bg-gray-800 dark:!border-gray-700 dark:!text-white',
              dropdown: 'dark:!bg-gray-800 dark:!border-gray-700',
              option: 'dark:hover:!bg-gray-700 dark:!text-gray-200',
            }}
          />
        </div>

        {/* Time inputs */}
        <div className="grid grid-cols-2 gap-4">
          {/* Start Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Start Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
              <input
                id="add-slot-start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={`w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm font-medium
                  bg-white dark:bg-gray-800
                  text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500
                  transition-all
                  ${errors.startTime
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-200 dark:border-gray-700'}
                `}
              />
            </div>
            {errors.startTime && (
              <p className="text-xs text-red-500 mt-1">{errors.startTime}</p>
            )}
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              End Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
              <input
                id="add-slot-end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={`w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm font-medium
                  bg-white dark:bg-gray-800
                  text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500
                  transition-all
                  ${errors.endTime
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-200 dark:border-gray-700'}
                `}
              />
            </div>
            {errors.endTime && (
              <p className="text-xs text-red-500 mt-1">{errors.endTime}</p>
            )}
          </div>
        </div>

        {/* Submit */}
        <Button
          id="add-slot-submit"
          onClick={handleSubmit}
          loading={creating}
          disabled={creating}
          fullWidth
          size="md"
          radius="xl"
          className="!bg-gradient-to-r !from-violet-600 !to-indigo-600 hover:!from-violet-700 hover:!to-indigo-700 !text-white !font-semibold !shadow-lg !shadow-violet-500/25 !transition-all"
        >
          Add Availability
        </Button>
      </div>
    </Modal>
  );
};

export default AddAvailabilityModal;
