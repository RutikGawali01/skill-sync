# Onboarding Guide: Skill Sync Matching Engine

Welcome to the **Skill Exchange Platform** team! This guide acts as your end-to-end technical manual for the **Matching Engine** module. It covers the system's design patterns, database query strategies, scoring mechanics, and API flow lifecycles.

---

## 1. High-Level Overview

### The Problem
In a skill-sharing marketplace, users have **Wanted Skills** (what they want to learn) and **Offered Skills** (what they can teach). Manually searching for exchange partners is highly inefficient. 

### The Solution
The Matching Engine automates partner matching by checking mutual compatibility.
* **Basic Compatibility:** Does Candidate X teach what I want?
* **Mutual Compatibility (Barter Exchange):** Can we swap skills? (I teach you Java; you teach me React).
* **Multi-Dimensional Value Optimization:** Out of hundreds of compatible candidates, who is the best match? (Considering ratings, trust scores, overlapping calendar hours, experience level, and recent activity).

### System Architecture
The module follows a highly modular, decoupled architecture:
```
           [ REST Controllers ]  (MatchController)
                    ↓
            [ Service Layer ]    (MatchServiceImpl)
                    ↓
       ┌────────────┴────────────┐
       ▼                         ▼
 [ Match Strategies ]      [ Recommendation Engine ]
 (Basic vs. Mutual)        (RecommendationEngine)
                                 ↓
                           [ Recommendation Provider ]
                           (RecommendationProvider SPI)
                                 ↓
                           [ Rule-Based Provider ]
                           (RuleBasedRecommendationProvider)
                                 ↓
             ┌───────────────────┼───────────────────┐
             ▼                   ▼                   ▼
      [ Scoring Engine ]  [ Ranking Engine ]  [ Reason Builder ]
       (ScoreEngine)      (RankingEngine)     (RecommendationReasonBuilder)
             ↓
    [ Score Calculators ]
    (Skill, Trust, Rating,
     Availability, Exp, Activity)
```

---

## 2. Request Flow

### 1. Basic & Mutual Matches Flow (`/api/matches/basic` and `/api/matches/mutual`)
```
[Client] ➔ MatchController ➔ MatchServiceImpl ➔ UserRepository/UserSkillRepository
                                     ↓
                               (Filters candidates)
                                     ↓
                           (Maps Strategy Context)
                                     ↓
                           Mutual/BasicMatchStrategy ➔ MatchResponseDTO ➔ [Client]
```
1. **Controller:** The controller retrieves the current user's security principal and passes their `userId` to the service.
2. **Service (`MatchServiceImpl`):** Fetches the user, finds their wanted skills, and queries raw candidates from the database. It filters candidates through the `EligibilityFilter` and maps the results to `MatchStrategyContext`.
3. **Strategy (`BasicMatchStrategy` / `MutualMatchStrategy`):** Iterates over candidates and screens them for basic or mutual skill exchanges. It builds a flat list of `MatchResponseDTO` records.
4. **Database Interaction:** It fetches candidate skills in bulk (`findByUserIdIn`) using a single `IN` query to prevent N+1 queries.

### 2. Ranked Matches & Recommendations Flow (`/ranked` and `/recommendations`)
```
[Client] ➔ Controller ➔ MatchService ➔ RecommendationEngine ➔ RecommendationProvider (SPI)
                                                                       ↓
                                                        RuleBasedRecommendationProvider
                                                                       ↓
                                                           (1. Fetch & Filter)
                                                           (2. Bulk Fetch Aux Maps)
                                                           (3. ScoreEngine: context loop)
                                                           (4. ReasonBuilder: explanation)
                                                           (5. RankingEngine: sorting)
                                                           (6. Page Slicing)
                                                                       ↓
                                                            Page<RecommendationDTO>
                                                                       ↓
                                                                    [Client]
```
1. **Controller:** Takes paginated query arguments (`page`, `size`) and standard authentication. Resolves a `Pageable` instance.
2. **Service (`MatchServiceImpl`):** Delegates directly to the `RecommendationEngine`.
3. **Engine (`RecommendationEngine`):** Invokes the registered `RecommendationProvider` implementation (`RuleBasedRecommendationProvider`).
4. **Provider (`RuleBasedRecommendationProvider`):** 
   * **Discovery & Filtering:** Queries matching candidates and runs them through `EligibilityFilter`.
   * **Prefetching:** Executes bulk queries for trust scores, calendars, and skills to cache them in lookup Maps.
   * **Scoring:** For each candidate, builds a `MatchContext` and delegates to `ScoreEngine`.
   * **Reasons:** Sends `MatchContext` and score breakdown to `RecommendationReasonBuilder`.
   * **Sorting:** Delegates the unsorted list to `RankingEngine` to sort and break ties.
   * **Pagination:** Slices the sorted array in memory to return a Spring `PageImpl`.

---

## 3. Component-by-Component Explanation

| Component Name | File Link | Why It Exists / Responsibility | Called By | Returns | Design Decision |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MatchController** | [MatchController.java](file:///d:/skill-sync/skill-sync-backend/src/main/java/com/rutik/skill_sync_backend/match/controller/MatchController.java) | Exposes matching endpoints. Decouples HTTP parsing from engine logic. | Client / Web Layer | `ApiResponse<T>` | Returns immutable wrapper response format standard to the platform. |
| **MatchService** | [MatchService.java](file:///d:/skill-sync/skill-sync-backend/src/main/java/com/rutik/skill_sync_backend/match/service/interfaces/MatchService.java) | Service boundary interface. | Controller | `Page<RecommendationDTO>` or `List<MatchResponseDTO>` | Decouples caller from service implementations. |
| **MatchServiceImpl** | [MatchServiceImpl.java](file:///d:/skill-sync/skill-sync-backend/src/main/java/com/rutik/skill_sync_backend/match/service/impl/MatchServiceImpl.java) | Service transaction boundaries. Performs strategy selection. | Controller | Matches / Recommendations pages | Manages database transactions (`@Transactional`). |
| **MatchStrategy** | [MatchStrategy.java](file:///d:/skill-sync/skill-sync-backend/src/main/java/com/rutik/skill_sync_backend/match/strategy/MatchStrategy.java) | Interface defining compatibility rules. | `MatchServiceImpl` | `List<MatchResponseDTO>` | Strategy Pattern: allows swapping routing logic dynamically. |
| **EligibilityFilter** | [EligibilityFilter.java](file:///d:/skill-sync/skill-sync-backend/src/main/java/com/rutik/skill_sync_backend/match/engine/EligibilityFilter.java) | Runs active checks on discovered candidate users. | service / provider | Filtered `List<User>` | Separates verification constraints from query logic. |
| **ScoreEngine** | [ScoreEngine.java](file:///d:/skill-sync/skill-sync-backend/src/main/java/com/rutik/skill_sync_backend/match/engine/ScoreEngine.java) | Orchestrates weighted scoring. | `RuleBasedRecommendationProvider` | `MatchScoreDTO` | Single Responsibility: manages composite scoring execution. |
| **Calculators** | `*ScoreCalculator.java` | Compute values for a single matching dimension. | `ScoreEngine` | `double` (score points) | Open-Closed Principle: new rules can be added without modifying the engine. |
| **RankingEngine** | [RankingEngine.java](file:///d:/skill-sync/skill-sync-backend/src/main/java/com/rutik/skill_sync_backend/match/engine/RankingEngine.java) | Performs deterministic sorting. | `RuleBasedRecommendationProvider` | Sorted `List<RecommendationDTO>` | Ensures tie-breaking is state-free and consistent. |
| **Reason Builder** | [RecommendationReasonBuilder.java](file:///d:/skill-sync/skill-sync-backend/src/main/java/com/rutik/skill_sync_backend/match/engine/RecommendationReasonBuilder.java) | Explains recommendation rationale. | `RuleBasedRecommendationProvider` | `RecommendationReasonDTO` | Decouples translation text formatting from score calculation. |

---

## 4. Matching Pipeline (End-to-End Example)

Let's trace a concrete example:
* **User A (`ID: 1`):** Wants **React** (`ID: 101`) & Offers **Spring Boot** (`ID: 202`)
* **User B (`ID: 2`):** Wants **Spring Boot** (`ID: 202`) & Offers **React** (`ID: 101`)

```
Step 1: User A requests GET /api/matches/recommendations?page=0&size=5
        ↓
Step 2: RuleBasedRecommendationProvider.getRecommendations(userId=1) is triggered.
        ↓
Step 3: UserA's wanted skill ID [101] is resolved.
        ↓
Step 4: UserRepository.findCandidatesForMatching([101], userId=1) queries database.
        Returns: [User B] (because User B offers React [101]).
        ↓
Step 5: EligibilityFilter evaluates User B.
        - Check 1: Profile complete? Yes.
        - Check 2: Email verified? Yes.
        - Check 3: Active availability slots? Yes.
        Result: User B is qualified.
        ↓
Step 6: Bulk fetching is executed:
        - Fetch User B's trust score: 85.0
        - Fetch User B's availability slots: Monday 9:00 - 11:00
        - Fetch User A's availability slots: Monday 10:00 - 12:00
        - Fetch User B's skills: WANT [202], OFFER [101]
        ↓
Step 7: ScoreEngine.calculateScore(context) is invoked for User B.
        Calculators run:
        - SkillScoreCalculator: matches React (WANT [101] vs OFFER [101]). Level diff = 0. Score: 40.0
        - TrustScoreCalculator: Trust 85.0. Score: 17.0 (out of max 20)
        - RatingScoreCalculator: Rating 4.8. Score: 14.4 (out of max 15)
        - AvailabilityScoreCalculator: Overlap detected (Monday 10:00-11:00). Score: 10.0 (out of max 10)
        - ExperienceScoreCalculator: 8 completed sessions. Score: 8.0 (out of max 10)
        - ActivityScoreCalculator: Active 2 days ago. Score: 5.0 (out of max 5)
        Overall Score: 94.4 points.
        ↓
Step 8: RecommendationReasonBuilder compiles explanations.
        - Check want vs offer match: Adds ReasonType.MUTUAL_EXCHANGE ("Excellent Mutual Exchange: Offers React & Wants Spring Boot").
        - Trust >= 80: Adds ReasonType.HIGH_TRUST ("High Trust Score (85/100)").
        - Availability score > 0: Adds ReasonType.SHARED_AVAILABILITY ("Shared Availability Slots").
        ↓
Step 9: RankingEngine.rank(...) sorts the candidate list.
        User B is placed at Index 0 (Score: 94.4).
        ↓
Step 10: In-memory page slicing extracts index range.
        PageImpl is constructed and returned to Client as JSON.
```

---

## 5. Scoring Process

The final match score is calculated out of **100.0** points. The engine discovers all beans implementing `MatchScoreCalculator` and runs them against the `MatchContext`.

The default weight contributions are externalized in `application.yml` and read by `MatchWeightProperties`:

```yaml
match:
  weights:
    skill: 40.0         # Match compatibility
    trust: 20.0         # Trust score multiplier
    rating: 15.0        # User reviews evaluation
    availability: 10.0  # Shared calendar slots
    experience: 10.0     # Completed session count
    activity: 5.0       # Recency of update activity
```

### Breakdown of Calculators:

1. **`SkillScoreCalculator` (Max 40.0):**
   * Computes a raw compatibility score: `+30` points for basic skill overlap.
   * Compares proficiency level values (`Want` vs `Offer` levels):
     * Level Difference = 0: `+20` raw points
     * Level Difference = 1: `+10` raw points
     * Level Difference > 1: `+5` raw points
   * The raw score is capped at `50.0` and scaled to the configured weight (40.0):
     $$\text{Scaled Score} = \left(\frac{\text{Min}(\text{Raw}, 50.0)}{50.0}\right) \times 40.0$$

2. **`TrustScoreCalculator` (Max 20.0):**
   * Fetches the user's rating in the Trust System (scale `0` to `100`).
     $$\text{Scaled Score} = \left(\frac{\text{Trust}}{100.0}\right) \times 20.0$$

3. **`RatingScoreCalculator` (Max 15.0):**
   * Evaluates the candidate's average star rating (scale `0.0` to `5.0`).
     $$\text{Scaled Score} = \left(\frac{\text{Rating}}{5.0}\right) \times 15.0$$

4. **`AvailabilityScoreCalculator` (Max 10.0):**
   * Compares the active user's calendar with the candidate's slots.
   * If there is an overlap on the same `DayOfWeek` where:
     $$\text{startTime}_A < \text{endTime}_B \quad \text{and} \quad \text{startTime}_B < \text{endTime}_A$$
     it awards the full weight (`10.0` points). Otherwise, `0.0` points.

5. **`ExperienceScoreCalculator` (Max 10.0):**
   * Encourages active session exchange history.
   * Awards `0.5` points per completed session, capped at `5.0` raw points (10 sessions).
     $$\text{Scaled Score} = \left(\frac{\text{Min}(\text{Completed} \times 0.5, 5.0)}{5.0}\right) \times 10.0$$

6. **`ActivityScoreCalculator` (Max 5.0):**
   * Rewards active platform users.
   * Compares last update timestamps with current date:
     * Last active $\le$ 7 days: `5.0` raw points
     * Last active $\le$ 30 days: `3.0` raw points
     * Last active $>$ 30 days: `1.0` raw point
   * Raw points are scaled to the max configured weight (`5.0`).

---

## 6. Ranking Process

Candidates are sorted using Spring's `Comparator` chain. Sorting is deterministic to prevent pagination inconsistencies.

### Tie-Breaking Order:
If two candidates have the same score, the engine resolves ties sequentially:
1. **Overall Score (Descending):** Highest score first.
2. **Trust Score (Descending):** More trustworthy candidate first.
3. **Rating (Descending):** Better reviewed partner first.
4. **Completed Sessions (Descending):** More experienced partner first.
5. **Recent Activity (Descending):** Last active candidate first.
6. **Registration Date (Ascending):** Older registered accounts first (acts as a stable timeline anchor).
7. **User ID (Ascending):** Database primary key fallback (guarantees absolute order consistency).

---

## 7. Recommendation Process

Recommendations map candidate profiles, scores, and reasons into the unified `RecommendationDTO`.

The `RecommendationReasonBuilder` compiles structured details:
```java
public class ReasonDetailDTO {
    private ReasonType reasonType;       // MATCHED_SKILL, HIGH_TRUST, SHARED_AVAILABILITY, etc.
    private String message;              // Natural language description
    private Double weightContribution;   // Numeric score points added
}
```
* **Mutual Exchange:** Triggered if both want/offer conditions match.
* **Matched Skill:** Triggered for individual offers/needs. Shows matching skill name.
* **High Trust:** Added if trust score is $\ge 80$.
* **Top Rated:** Added if candidate rating is $\ge 4.5$.
* **Shared Availability:** Added if there is an availability slot overlap.

---

## 8. Design Patterns Used

1. **Strategy Pattern:**
   * **Location:** `MatchStrategy` interface and its implementations (`BasicMatchStrategy`, `MutualMatchStrategy`).
   * **Why:** Decouples core match query workflows. `MatchServiceImpl` chooses the strategy based on the endpoint, allowing strategy extensions without modifying service logic.

2. **Composite / Pipeline Pattern:**
   * **Location:** `ScoreEngine` and `MatchScoreCalculator`.
   * **Why:** The engine acts as a pipeline organizer. It iterates over all discovered calculator beans to compose the final score breakdown.

3. **Dependency Inversion Principle (DIP) / Provider Pattern:**
   * **Location:** `RecommendationProvider` interface and `RuleBasedRecommendationProvider`.
   * **Why:** Isolates recommendation generation from the recommendation engine orchestrator. This allows adding AI-based or Redis-cached recommendation providers in the future without changing `RecommendationEngine`.

4. **Builder Pattern:**
   * **Location:** `MatchContext` and DTO builders generated by Lombok's `@Builder`.
   * **Why:** Avoids constructor bloat and ensures objects remain immutable during computation.

---

## 9. Performance Optimizations

### 1. Eliminating N+1 Query Loops
In a naive implementation, evaluating 10 candidates would trigger separate database queries for each candidate's skills, trust scores, and availabilities, resulting in $1 + 3N$ queries.

We solve this using **Bulk Batch-Fetching**:
```java
// Fetch trust scores for all eligible candidates in a single Jpa query
List<UserTrustScore> trustScores = trustScoreRepository.findByUserIn(eligibleCandidates);

// Fetch availabilities for all candidates and current user in a single JPQL query
List<Availability> availabilities = availabilityRepository.findByUserIn(allUsersForAvailability);

// Fetch all candidate skills in a single JPQL query
List<UserSkill> candidateSkillsList = userSkillRepository.findByUserIdIn(candidateIds);
```
These collection results are grouped in memory using Java Stream grouping collectors (`Collectors.toMap` / `Collectors.groupingBy`), yielding $O(1)$ lookups during scoring loops.

### 2. In-Memory Slicing
Instead of retrieving hundreds of database rows page-by-page, the candidates are scored, ranked, and paginated in memory using offset bounds (`ranked.subList(start, end)`), avoiding redundant database hits.

---

## 10. Folder Structure Walkthrough

The `match` directory is organized into distinct domain layers:

```
match/
├── config/
│   └── MatchWeightProperties.java         # Externalized YAML property bindings
├── controller/
│   └── MatchController.java               # REST controllers exposing Pageable endpoints
├── dto/
│   ├── MatchCandidateDTO.java             # Candidate profile payload
│   ├── MatchScoreDTO.java                 # Overall score and breakdown
│   ├── ReasonDetailDTO.java               # Explanatory reason element
│   ├── RecommendationDTO.java             # Complete recommendation payload
│   └── ScoreBreakdownDTO.java             # Dimension metrics points
├── engine/
│   ├── MatchScoreCalculator.java          # Scoring interface
│   ├── SkillScoreCalculator.java          # Skill level calculator
│   ├── TrustScoreCalculator.java          # Trust metric calculator
│   ├── RatingScoreCalculator.java         # Rating point calculator
│   ├── AvailabilityScoreCalculator.java   # Calendar slot calculator
│   ├── ExperienceScoreCalculator.java     # Completed sessions calculator
│   ├── ActivityScoreCalculator.java       # Activity recency calculator
│   ├── EligibilityRule.java               # Filter rule interface
│   ├── EligibilityFilter.java             # Filter pipeline coordinator
│   ├── ScoreEngine.java                   # Scoring loop coordinator
│   ├── RankingEngine.java                 # Sorting & tie-breaker coordinator
│   ├── RecommendationProvider.java        # Extensibility provider interface
│   ├── RuleBasedRecommendationProvider.java# Concrete recommendation compiler
│   └── RecommendationReasonBuilder.java   # Natural explanation compiler
├── enums/
│   └── ReasonType.java                    # Enumeration of reason types
├── model/
│   ├── MatchContext.java                  # Candidate-specific evaluation context
│   └── MatchStrategyContext.java          # Strategy execution context
├── repository/
│   └── MatchRepository.java               # Persisted matches repository
└── strategy/
    ├── MatchStrategy.java                 # Strategy interface
    ├── BasicMatchStrategy.java            # Basic skill matching strategy
    └── MutualMatchStrategy.java           # Barter exchange strategy
```

---

## 11. Interview Preparation: Top 20 Questions & Answers

<details>
<summary>1. How does the Matching Engine avoid the N+1 select problem?</summary>
We pre-fetch all evaluation metadata (skills, availability slots, and trust scores) in bulk queries before starting the scoring loop. We pass candidates as collections to <code>findByUserIn</code> or <code>findByUserIdIn</code> repository queries, then group them into memory lookups. This reduces database queries to a fixed count ($O(1)$ database query overhead) instead of scaling query counts linearly with candidate counts ($O(N)$).
</details>

<details>
<summary>2. Why did you choose to use the Strategy Pattern for matching?</summary>
Different matching algorithms have different criteria (e.g., basic matching only checks candidate offers, while mutual matching requires a dual barter exchange). The Strategy pattern decouples these algorithms into isolated classes implementing <code>MatchStrategy</code>, making it easy to add new match types (e.g. group matching or project matching) without altering service logic.
</details>

<details>
<summary>3. What is the difference between MatchContext and MatchStrategyContext?</summary>
<code>MatchStrategyContext</code> is a collection-level model containing all candidate users and skills maps, which is passed to <code>MatchStrategy</code> implementations. <code>MatchContext</code> is a candidate-specific model representing the data context of a single candidate under evaluation, which is passed to the individual scoring calculators. This enforces proper encapsulation and class segregation.
</details>

<details>
<summary>4. How does the system handle tie-breaking when two candidates have the same match score?</summary>
We implement a deterministic <code>Comparator</code> chain inside the <code>RankingEngine</code>. If match scores are equal, we check trust scores, followed by user ratings, completed sessions, recent activity timestamps, registration dates, and finally fall back to the ascending user ID. This ensures order consistency across page requests.
</details>

<details>
<summary>5. How are the scoring weights configured and dynamically refreshed?</summary>
Weights are externalized in <code>application.yml</code> under the <code>match.weights</code> block. The values are bound to the <code>MatchWeightProperties</code> class using <code>@ConfigurationProperties</code>. Individual calculators inject this configuration properties bean to fetch active weights, meaning scoring values can be updated without rebuilding the code.
</details>

<details>
<summary>6. Explain the Pageable implementation for recommendations. Why not run LIMIT queries directly in Jpa?</summary>
Because matching scores are computed dynamically in-memory based on complex relationships (e.g., calendar slot overlaps and current candidate ratings), we cannot easily score and sort candidates using static SQL queries. Therefore, candidate profiles are fetched and scored in bulk, sorted in-memory, and then sliced using <code>PageImpl</code>.
</details>

<details>
<summary>7. What design pattern does the ScoreEngine use?</summary>
The <code>ScoreEngine</code> uses the Composite/Pipeline pattern. It collects all beans implementing the <code>MatchScoreCalculator</code> interface, loops through them, aggregates their scores, and returns a composite breakdown result.
</details>

<details>
<summary>8. How does AvailabilityScoreCalculator calculate overlapping times?</summary>
It loops through the availability slots of the active user and candidate. If they share the same day of the week, it checks for an overlap using the condition: <code>(startTimeA &lt; endTimeB) &amp;&amp; (startTimeB &lt; endTimeA)</code>. If an overlap is found, it awards the full weight points.
</details>

<details>
<summary>9. What is the role of EligibilityFilter?</summary>
The <code>EligibilityFilter</code> filters candidates based on specific criteria before scoring. It runs candidate users through rules like <code>ProfileCompletedRule</code>, <code>VerifiedEmailRule</code>, and <code>HasAvailabilityRule</code> to filter out inactive profiles, saving scoring computation overhead.
</details>

<details>
<summary>10. How does the system prevent matching a user with themselves?</summary>
The candidate discovery query excludes the active user's ID: <code>WHERE u.id &lt;&gt; :userId</code>. Additionally, strategies explicitly skip candidate records where the ID matches the active user's ID.
</details>

<details>
<summary>11. What is the role of RecommendationProvider?</summary>
It is an SPI (Service Provider Interface) that isolates matching algorithm orchestration. <code>RecommendationEngine</code> relies on this interface, allowing developers to register alternative providers (like AI or cache-backed providers) without changing the engine orchestrator.
</details>

<details>
<summary>12. How does the SkillScoreCalculator handle proficiency levels?</summary>
It rewards candidates with matching skills. It compares the user's want level and candidate's offer level. An exact level match yields maximum points. If the level difference is 1, it awards partial points. It then caps the raw score and scales it to the configured skill weight.
</details>

<details>
<summary>13. Is the MatchServiceImpl thread-safe?</summary>
Yes, <code>MatchServiceImpl</code> is a stateless Spring bean. It does not store user or candidate state in instance variables. Instead, it passes all required context inside local variables and method parameters, which are stack-allocated and thread-safe.
</details>

<details>
<summary>14. How are database transactions managed in the Matching Engine?</summary>
We apply <code>@Transactional</code> annotations to the service layer. Since the database operations are read-only (fetching candidate profiles), the transaction ensures clean JPA session management, allowing lazy fields to load without throwing <code>LazyInitializationException</code>.
</details>

<details>
<summary>15. What annotations are used to register scoring calculators?</summary>
We annotate each calculator with Spring's <code>@Component</code> annotation. Spring Automatically detects them and injects them into the <code>List&lt;MatchScoreCalculator&gt;</code> constructor argument in <code>ScoreEngine</code>.
</details>

<details>
<summary>16. Why does RecommendationReasonBuilder return a weight contribution for each reason?</summary>
It provides transparency to users and the frontend. By sending the exact weight contribution alongside the matching reasons, the UI can show breakdown gauges or explain how a match score was calculated.
</details>

<details>
<summary>17. Why is the registration date checked during ranking tie-breaks?</summary>
Timestamps like registration dates are immutable and ordered. Checking the registration date provides a stable tie-breaker before falling back to database IDs, prioritizing established platform users in case of identical scores.
</details>

<details>
<summary>18. How are invalid query requests handled (e.g. request with null userId)?</summary>
The service validates inputs and throws a <code>BadRequestException</code> if parameters are missing. This custom exception is handled by a controller advice class (<code>GlobalExceptionHandler</code>) to return a structured error response.
</details>

<details>
<summary>19. How does spring-security Authentication link to the controller endpoints?</summary>
The controller methods accept an <code>Authentication</code> parameter injected by Spring Security. We extract the active user's profile from the security principal to query matching candidates securely, preventing users from tampering with query IDs.
</details>

<details>
<summary>20. How do you measure execution times in the matching pipeline?</summary>
We use Spring's <code>StopWatch</code> utility inside <code>RuleBasedRecommendationProvider</code>. It records the start and stop times of discovery, prefetching, scoring, and ranking phases, and logs the execution metrics.
</details>

---

## 12. Future Architectural Extensibility

Here is how the Matching Engine is designed to support future scale-out enhancements without breaking existing APIs:

1. **AI / ML Recommendations:**
   * **How to integrate:** Create a new `AIRecommendationProvider` class that implements the `RecommendationProvider` interface. You can fetch embeddings from an AI engine and query vectors instead of using rule-based SQL discovery.
   * **Impact:** Seamless swap. Simply mark the new class as the primary `@Component` and `RecommendationEngine` will use it without modifications.

2. **Graph Matching (Neo4j Integration):**
   * **How to integrate:** Swap the discovery layer in `RuleBasedRecommendationProvider` to query a Graph database, returning candidates based on multi-hop skill networks (e.g., User A teaches B, B teaches C, C teaches A).

3. **Redis Caching Layer:**
   * **How to integrate:** Implement a caching decorator pattern: `RedisCachedRecommendationProvider` that wraps `RuleBasedRecommendationProvider`. It can read and store ranked matching IDs in Redis, clearing the cache only when user skills or availabilities change.
   * **Impact:** Sub-millisecond response times for returning matches, bypassing Hibernate and PostgreSQL completely.

4. **Match Analytics Pipeline:**
   * **How to integrate:** Register an asynchronous Spring Event Publisher inside `RuleBasedRecommendationProvider` to emit match request events. A listener can capture these events to track match counts and popular skills.

---

You are now ready to write, refactor, and deploy code within the Matching Engine module!
