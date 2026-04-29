package com.rutik.skill_sync_backend.match.enums;

public enum MatchType {
    PERFECT_EXCHANGE,  // Mutual learning
    PARTIAL_MATCH,     // One-way
    ONE_WAY_MATCH,     // Only learning
    GRAPH_MATCH        // A → B → C → A
}
