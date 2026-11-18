package com.klu.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.klu.entity.Property;

@Repository
public interface PropertyRepo extends JpaRepository<Property, Long> {

    List<Property> findByLocationContainingIgnoreCase(String location);

    List<Property> findByStatusIgnoreCase(String status);

    List<Property> findByAgentId(Long agentId);

    List<Property> findByStatusIgnoreCaseAndLocationContainingIgnoreCase(String status, String location);
}
