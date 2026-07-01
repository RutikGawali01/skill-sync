/**
 * timelineBuilder.js
 * ──────────────────
 * Builds a chronological list of timeline items from sessions and messages.
 *
 * Output timeline item types:
 * • 'SESSION_CARD'      - Renders details of the learning session invitation/details
 * • 'MESSAGE'           - Renders a chat message bubble
 * • 'SESSION_STATUS'    - Renders completion or cancellation card status
 * • 'REVIEW_CARD'       - Renders review actions (leave review / read review details)
 */
export const buildTimeline = (sessions = [], messages = []) => {
  const timeline = [];

  // 1. Sort sessions chronologically (oldest first, i.e., top of chat is oldest)
  // Fallback to id if createdTime / startTime is missing
  const sortedSessions = [...sessions].sort((a, b) => {
    const timeA = new Date(a.createdTime || a.startTime || 0).getTime();
    const timeB = new Date(b.createdTime || b.startTime || 0).getTime();
    if (timeA !== timeB) return timeA - timeB;
    return a.id - b.id;
  });

  // Create a map of sessionId -> messages for O(1) grouping
  const messagesBySession = {};
  messages.forEach((msg) => {
    const sId = msg.sessionId || 'no-session';
    if (!messagesBySession[sId]) {
      messagesBySession[sId] = [];
    }
    messagesBySession[sId].push(msg);
  });

  // 2. Iterate sessions and interleave items
  sortedSessions.forEach((session) => {
    // Add the session initialization card
    timeline.push({
      id: `session-card-${session.id}`,
      type: 'SESSION_CARD',
      timestamp: new Date(session.createdTime || session.startTime || 0).getTime(),
      data: session,
    });

    // Add all messages belonging to this session
    // Messages within a session are sorted chronologically ascending (oldest first)
    const sessionMessages = messagesBySession[session.id] || [];
    const sortedMessages = [...sessionMessages].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      if (timeA !== timeB) return timeA - timeB;
      return a.id - b.id;
    });

    sortedMessages.forEach((msg) => {
      timeline.push({
        id: `message-${msg.id || msg.clientMessageId}`,
        type: 'MESSAGE',
        timestamp: new Date(msg.createdAt).getTime(),
        data: msg,
      });
    });

    // Add status completion / review cards if the session has ended
    if (session.status === 'COMPLETED' || session.status === 'CANCELLED') {
      const completionTime = new Date(session.completedTime || Date.now()).getTime();

      // Completion/Cancellation card
      timeline.push({
        id: `session-status-${session.id}`,
        type: 'SESSION_STATUS',
        timestamp: completionTime,
        data: session, // carries status, duration, etc.
      });

      // Review card (either leave review button or details)
      // Only applicable for COMPLETED sessions
      if (session.status === 'COMPLETED') {
        timeline.push({
          id: `session-review-${session.id}`,
          type: 'REVIEW_CARD',
          timestamp: completionTime + 1, // slightly after completion card
          data: session, // carries review rating, comments, reviewSubmitted, etc.
        });
      }
    }
  });

  // Handle messages that don't belong to any session (defensive programming)
  const orphanMessages = messagesBySession['no-session'] || [];
  if (orphanMessages.length > 0) {
    const sortedOrphans = [...orphanMessages].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      if (timeA !== timeB) return timeA - timeB;
      return a.id - b.id;
    });

    sortedOrphans.forEach((msg) => {
      timeline.push({
        id: `message-${msg.id || msg.clientMessageId}`,
        type: 'MESSAGE',
        timestamp: new Date(msg.createdAt).getTime(),
        data: msg,
      });
    });
  }

  return timeline;
};
