package com.rutik.skill_sync_backend.match.controller;

import com.rutik.skill_sync_backend.common.response.ApiResponse;
import com.rutik.skill_sync_backend.match.service.interfaces.SavedMatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/saved-matches")
@RequiredArgsConstructor
public class SavedMatchController {

    private final SavedMatchService savedMatchService;

    // save match -
    @PostMapping
    public ApiResponse<Void> saveMatch(
            @RequestParam Long userId,
            @RequestParam Long matchedUserId
    ) {
        savedMatchService.saveMatch(userId, matchedUserId);
        return ApiResponse.success("Match saved successfully");
    }

    // remove match
    @DeleteMapping
    public ApiResponse<Void> removeMatch(
            @RequestParam Long userId,
            @RequestParam Long matchedUserId
    ) {
        savedMatchService.removeMatch(userId, matchedUserId);
        return ApiResponse.success("Match removed successfully");
    }


//     get all the saved matches
    @GetMapping("/{userId}")
    public ApiResponse<List<Long>> getSavedMatches(@PathVariable Long userId) {

        List<Long> saved = savedMatchService.getSavedMatches(userId);

        return ApiResponse.success("Saved matches fetched", saved);
    }
}