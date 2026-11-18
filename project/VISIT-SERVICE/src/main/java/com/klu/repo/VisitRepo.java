package com.klu.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.klu.entity.Visit;

@Repository
public interface VisitRepo extends JpaRepository<Visit, Long> {

    List<Visit> findByUserId(Long userId);

    List<Visit> findByAgentId(Long agentId);

    List<Visit> findByPropertyId(Long propertyId);

    List<Visit> findByStatusIgnoreCase(String status);

    List<Visit> findByUserIdAndStatusIgnoreCase(Long userId, String status);

    List<Visit> findByAgentIdAndStatusIgnoreCase(Long agentId, String status);
}
