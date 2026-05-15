/**
 * RequestSessionModal.jsx
 * ───────────────────────
 * Availability-aware session booking modal.
 *
 * On open:
 *   1. Fetches provider availability via GET /api/availability/user/{userId}
 *   2. Passes slots to SessionBookingForm for date/time restriction
 *   3. On submit: POST /api/sessions
 *
 * The modal itself is thin — all form logic lives in SessionBookingForm.
 */

import { useState, useEffect, useCallback } from 'react';
import { Modal, Text } from '@mantine/core';
import { Calendar } from 'lucide-react';

import SessionBookingForm from './SessionBookingForm';
import useSessionActions from '../../hooks/useSessionActions';
import { getUserAvailability } from '../../services/availabilityService';

const RequestSessionModal = ({ opened, onClose, skill }) => {
  const { requestSession, creating } = useSessionActions();

  // ── Provider availability state ────────────────────────────────────────────
  const [providerSlots, setProviderSlots]   = useState([]);
  const [slotsLoading, setSlotsLoading]     = useState(false);

  // Fetch provider availability when modal opens
  // Use explore feed data as initial (instant display), then refresh from API
  useEffect(() => {
    if (opened && skill?.userId) {
      // Use pre-loaded availability from explore feed for instant display
      const initialSlots = Array.isArray(skill.availability) ? skill.availability : [];
      setProviderSlots(initialSlots);

      // Fetch fresh availability from API (silent refresh)
      setSlotsLoading(initialSlots.length === 0);
      getUserAvailability(skill.userId)
        .then((data) => {
          setProviderSlots(Array.isArray(data) ? data : initialSlots);
        })
        .catch(() => {
          // Keep explore feed data as fallback
          if (initialSlots.length === 0) setProviderSlots([]);
        })
        .finally(() => {
          setSlotsLoading(false);
        });
    }
  }, [opened, skill?.userId]);

  // ── Submit handler ─────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (payload) => {
    const success = await requestSession(payload);
    if (success) {
      onClose();
    }
    return success;
  }, [requestSession, onClose]);

  // ── Close handler ──────────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    setProviderSlots([]);
    onClose();
  }, [onClose]);

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div>
            <Text fw={700} size="md">Request Session</Text>
            <Text size="xs" c="dimmed">Book a learning session</Text>
          </div>
        </div>
      }
      centered
      radius="lg"
      size="lg"
      overlayProps={{ backgroundOpacity: 0.4, blur: 8 }}
      styles={{
        header: { paddingBottom: 0 },
        body: { paddingTop: 16 },
      }}
    >
      <SessionBookingForm
        skill={skill}
        providerSlots={providerSlots}
        slotsLoading={slotsLoading}
        onSubmit={handleSubmit}
        onClose={handleClose}
        submitting={creating}
      />
    </Modal>
  );
};

export default RequestSessionModal;
