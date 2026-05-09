package com.rutik.skill_sync_backend.skill.repository;

import com.rutik.skill_sync_backend.skill.entity.UserSkill;
import com.rutik.skill_sync_backend.skill.enums.SkillType;
import com.rutik.skill_sync_backend.user.entity.User;
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

//    List<UserSkill> findByUser(User user);
//
//    Optional<UserSkill> findByIdAndUserId(Long id, Long userId);

    List<UserSkill> findByUserIdAndIsVerifiedTrue(
            Long userId
    );
}