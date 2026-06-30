package com.rutik.skill_sync_backend.skill.repository;

import com.rutik.skill_sync_backend.skill.entity.UserSkill;
import com.rutik.skill_sync_backend.skill.enums.SkillType;
import com.rutik.skill_sync_backend.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {

    List<UserSkill> findByUserId(Long userId);

    List<UserSkill> findByUserIdAndType(Long userId, SkillType type);

    Optional<UserSkill> findByUserIdAndSkillIdAndType(Long userId, Long skillId, SkillType type);

    void deleteByUserIdAndSkillIdAndType(Long userId, Long skillId, SkillType type);

    @Query("""
    SELECT us FROM UserSkill us
    WHERE us.skill.id = :skillId
    AND us.type = :type
""")
    List<UserSkill> findBySkillAndType(Long skillId, SkillType type);


    List<UserSkill> findByType(SkillType type);

    Page<UserSkill> findByTypeAndIsVisibleTrue(SkillType type, Pageable pageable);

    @Query("""
        SELECT us FROM UserSkill us
        WHERE us.type = :type
        AND us.isVisible = true
        AND (
            LOWER(us.skill.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(str(us.skill.category)) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(us.user.name) LIKE LOWER(CONCAT('%', :search, '%'))
        )
    """)
    Page<UserSkill> findByTypeAndIsVisibleTrueAndSearch(
            @Param("type") SkillType type,
            @Param("search") String search,
            Pageable pageable
    );

//    List<UserSkill> findByUser(User user);
//
//    Optional<UserSkill> findByIdAndUserId(Long id, Long userId);

    List<UserSkill> findByUserIdAndIsVerifiedTrue(
            Long userId
    );

    List<UserSkill> findByUserIdIn(List<Long> userIds);
}