package com.rutik.skill_sync_backend.notification.template;

import org.springframework.stereotype.Service;

/**
 * Implementation of NotificationTemplateService that builds copy and message content.
 */
@Service
public class NotificationTemplateServiceImpl implements NotificationTemplateService {

    @Override
    public String buildReviewReceivedTitle() {
        return "You received a new review";
    }

    @Override
    public String buildReviewReceivedMessage(String reviewerName, Integer rating) {
        return String.format("%s rated your session %d stars.", reviewerName, rating);
    }

    @Override
    public String buildSessionAcceptedTitle() {
        return "Session Request Accepted";
    }

    @Override
    public String buildSessionAcceptedMessage(String providerName, String skillName) {
        return String.format("%s accepted your %s session request.", providerName, skillName);
    }

    @Override
    public String buildSessionCompletedTitle() {
        return "Session Completed";
    }

    @Override
    public String buildSessionCompletedMessage(String otherPartyName, String skillName) {
        return String.format("Your session on %s with %s has been completed.", skillName, otherPartyName);
    }

    @Override
    public String buildSessionCancelledTitle() {
        return "Session Cancelled";
    }

    @Override
    public String buildSessionCancelledMessage(String otherPartyName, String skillName, String reason) {
        String cleanReason = (reason == null || reason.isBlank()) ? "No reason provided" : reason;
        return String.format("%s cancelled your session on %s. Reason: %s", otherPartyName, skillName, cleanReason);
    }

    @Override
    public String buildMatchFoundTitle() {
        return "New Match Found! 🎉";
    }

    @Override
    public String buildMatchFoundMessage(String matchedUserName, String matchedSkillName) {
        return String.format("You have a new skill match with %s for %s.", matchedUserName, matchedSkillName);
    }

    @Override
    public String buildBadgeEarnedTitle() {
        return "New Badge Earned! 🏆";
    }

    @Override
    public String buildBadgeEarnedMessage(String badgeName) {
        return String.format("Congratulations! You earned the '%s' badge.", badgeName);
    }
}
