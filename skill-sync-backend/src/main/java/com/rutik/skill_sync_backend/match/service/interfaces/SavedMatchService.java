package com.rutik.skill_sync_backend.match.service.interfaces;

import java.util.List;

public interface SavedMatchService {

    void saveMatch(Long userId, Long matchedUserId);

    void removeMatch(Long userId, Long matchedUserId);

    List<Long> getSavedMatches(Long userId);
}
