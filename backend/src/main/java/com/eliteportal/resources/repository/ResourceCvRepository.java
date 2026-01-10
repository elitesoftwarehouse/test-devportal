package com.eliteportal.resources.repository;

import com.eliteportal.resources.entity.ResourceCv;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResourceCvRepository extends JpaRepository<ResourceCv, Long> {

    List<ResourceCv> findByResourceId(Long resourceId);
}
