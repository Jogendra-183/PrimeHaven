package com.klu.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.klu.entity.Inquiry;

@Repository
public interface InquiryRepo extends JpaRepository<Inquiry, Long> {

    List<Inquiry> findByUserId(Long userId);

    List<Inquiry> findByAgentId(Long agentId);

    List<Inquiry> findByPropertyId(Long propertyId);

    List<Inquiry> findByStatusIgnoreCase(String status);

    List<Inquiry> findByUserIdAndStatusIgnoreCase(Long userId, String status);

    List<Inquiry> findByAgentIdAndStatusIgnoreCase(Long agentId, String status);
}
