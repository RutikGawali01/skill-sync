package com.rutik.skill_sync_backend.notification.template;

/**
 * Service interface centralizing user-facing notification titles and messages.
 * Helps isolate user interface copy changes from the core database/business layers.
 */
public interface NotificationTemplateService {

    String buildReviewReceivedTitle();
    String buildReviewReceivedMessage(String reviewerName, Integer rating);

    String buildSessionAcceptedTitle();
    String buildSessionAcceptedMessage(String providerName, String skillName);

    String buildSessionCompletedTitle();
    String buildSessionCompletedMessage(String otherPartyName, String skillName);

    String buildSessionCancelledTitle();
    String buildSessionCancelledMessage(String otherPartyName, String skillName, String reason);

    String buildMatchFoundTitle();
    String buildMatchFoundMessage(String matchedUserName, String matchedSkillName);

    String buildBadgeEarnedTitle();
    String buildBadgeEarnedMessage(String badgeName);
}
