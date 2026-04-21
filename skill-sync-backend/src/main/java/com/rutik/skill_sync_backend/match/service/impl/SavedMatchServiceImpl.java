package com.rutik.skill_sync_backend.match.service.impl;

import com.rutik.skill_sync_backend.common.exception.BadRequestException;
import com.rutik.skill_sync_backend.common.exception.ResourceNotFoundException;
import com.rutik.skill_sync_backend.match.entity.SavedMatch;
import com.rutik.skill_sync_backend.match.repository.SavedMatchRepository;
import com.rutik.skill_sync_backend.match.service.interfaces.SavedMatchService;
import com.rutik.skill_sync_backend.user.entity.User;
import com.rutik.skill_sync_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
@Service
@RequiredArgsConstructor
public class SavedMatchServiceImpl implements SavedMatchService {

    private final SavedMatchRepository savedMatchRepository;
    private final UserRepository userRepository;

    @Override
    public void saveMatch(Long userId, Long matchedUserId) {

        // ✅ 1. Null validation
        if (userId == null || matchedUserId == null) {
            throw new BadRequestException("UserId and MatchedUserId must not be null");
        }

        // ✅ 2. Self-save check
        if (userId.equals(matchedUserId)) {
            throw new BadRequestException("Cannot save yourself");
        }

        // ✅ 3. Validate users exist FIRST (fail fast)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        User matchedUser = userRepository.findById(matchedUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Matched user not found with id: " + matchedUserId));

        // ✅ 4. Already saved check
        boolean alreadyExists = savedMatchRepository
                .findByUserIdAndMatchedUserId(userId, matchedUserId)
                .isPresent();

        if (alreadyExists) {
            throw new BadRequestException("Match already saved");
        }

        // ✅ 5. Save
        SavedMatch savedMatch = SavedMatch.builder()
                .user(user)
                .matchedUser(matchedUser)
                .savedAt(LocalDateTime.now())
                .build();

        savedMatchRepository.save(savedMatch);
    }

    @Override
    public void removeMatch(Long userId, Long matchedUserId) {

        // ✅ 1. Null validation
        if (userId == null || matchedUserId == null) {
            throw new BadRequestException("UserId and MatchedUserId must not be null");
        }

        // ✅ 2. Validate existence
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        userRepository.findById(matchedUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Matched user not found with id: " + matchedUserId));

        // ✅ 3. Fetch saved match
        SavedMatch savedMatch = savedMatchRepository
                .findByUserIdAndMatchedUserId(userId, matchedUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Saved match not found"));

        savedMatchRepository.delete(savedMatch);
    }

    @Override
    public List<Long> getSavedMatches(Long userId) {

        // ✅ 1. Null validation
        if (userId == null) {
            throw new BadRequestException("UserId must not be null");
        }

        // ✅ 2. Validate user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // ✅ 3. Fetch safely
        return savedMatchRepository.findByUserId(userId)
                .stream()
                .map(sm -> sm.getMatchedUser().getId())
                .toList();
    }
}