package com.eliteportal.resources.repository;

import com.eliteportal.resources.entity.ResourceSkill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResourceSkillRepository extends JpaRepository<ResourceSkill, Long> {

    List<ResourceSkill> findByResourceId(Long resourceId);
}
