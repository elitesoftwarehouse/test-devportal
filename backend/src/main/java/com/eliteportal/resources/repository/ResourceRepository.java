package com.eliteportal.resources.repository;

import com.eliteportal.resources.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
}
