package com.klu.service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.klu.client.PropertyServiceClient;
import com.klu.dto.PropertySummary;
import com.klu.dto.VisitRequest;
import com.klu.dto.VisitResponse;
import com.klu.entity.Visit;
import com.klu.exception.BadRequestException;
import com.klu.exception.ForbiddenException;
import com.klu.exception.ResourceNotFoundException;
import com.klu.repo.VisitRepo;
import com.klu.security.SecurityUtil;
import com.klu.security.UserPrincipal;

@Service
public class VisitService {

    private static final List<String> VALID_STATUSES = Arrays.asList(
            "REQUESTED", "CONFIRMED", "CANCELLED", "COMPLETED"
    );

    private final VisitRepo visitRepo;
    private final PropertyServiceClient propertyServiceClient;

    public VisitService(VisitRepo visitRepo, PropertyServiceClient propertyServiceClient) {
        this.visitRepo = visitRepo;
        this.propertyServiceClient = propertyServiceClient;
    }

    public VisitResponse createVisit(VisitRequest request) {
        UserPrincipal currentUser = SecurityUtil.getAuthenticatedUser();

        // CLIENT or ADMIN can create visit requests
        if (currentUser.isAgent()) {
            throw new ForbiddenException("Agents are not authorized to create visit requests");
        }

        // Validate property existence through inter-service communication to PROPERTY-SERVICE
        PropertySummary property = propertyServiceClient.getPropertyById(request.getPropertyId());

        Visit visit = new Visit();
        visit.setPropertyId(request.getPropertyId());
        // user_id MUST come from the authenticated JWT
        visit.setUserId(currentUser.getUserId());
        // Automatically associate the visit with the property's agent if assigned
        visit.setAgentId(property.getAgentId());
        visit.setVisitDate(request.getVisitDate());
        visit.setStatus("REQUESTED");
        visit.setNotes(request.getNotes());

        Visit saved = visitRepo.save(visit);
        return VisitResponse.fromEntity(saved, property);
    }

    public List<VisitResponse> getVisits(String status) {
        UserPrincipal currentUser = SecurityUtil.getAuthenticatedUser();
        List<Visit> visits;

        if (currentUser.isClient()) {
            // CLIENT: view own visits only
            if (status != null && !status.trim().isEmpty()) {
                visits = visitRepo.findByUserIdAndStatusIgnoreCase(currentUser.getUserId(), status.trim());
            } else {
                visits = visitRepo.findByUserId(currentUser.getUserId());
            }
        } else if (currentUser.isAgent()) {
            // AGENT: view assigned visits
            if (status != null && !status.trim().isEmpty()) {
                visits = visitRepo.findByAgentIdAndStatusIgnoreCase(currentUser.getUserId(), status.trim());
            } else {
                visits = visitRepo.findByAgentId(currentUser.getUserId());
            }
        } else {
            // ADMIN: full visit management
            if (status != null && !status.trim().isEmpty()) {
                visits = visitRepo.findByStatusIgnoreCase(status.trim());
            } else {
                visits = visitRepo.findAll();
            }
        }

        return visits.stream()
                .map(VisitResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public VisitResponse getVisitById(Long id) {
        UserPrincipal currentUser = SecurityUtil.getAuthenticatedUser();

        Visit visit = visitRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found with ID: " + id));

        // Role verification
        if (currentUser.isClient() && !visit.getUserId().equals(currentUser.getUserId())) {
            throw new ForbiddenException("You can only view your own visits");
        }
        if (currentUser.isAgent() && (visit.getAgentId() == null || !visit.getAgentId().equals(currentUser.getUserId()))) {
            throw new ForbiddenException("You can only view visits assigned to you");
        }

        PropertySummary property = null;
        try {
            property = propertyServiceClient.getPropertyById(visit.getPropertyId());
        } catch (Exception ignored) {
            // Property service detail is optional on retrieval
        }

        return VisitResponse.fromEntity(visit, property);
    }

    public VisitResponse updateVisit(Long id, VisitRequest request) {
        UserPrincipal currentUser = SecurityUtil.getAuthenticatedUser();

        Visit visit = visitRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found with ID: " + id));

        if (currentUser.isClient()) {
            if (!visit.getUserId().equals(currentUser.getUserId())) {
                throw new ForbiddenException("You can only update your own visits");
            }
            if (!"REQUESTED".equalsIgnoreCase(visit.getStatus())) {
                throw new BadRequestException("Cannot update visit in status: " + visit.getStatus());
            }
        } else if (currentUser.isAgent()) {
            if (visit.getAgentId() == null || !visit.getAgentId().equals(currentUser.getUserId())) {
                throw new ForbiddenException("You can only update visits assigned to you");
            }
        }

        if (request.getPropertyId() != null && !request.getPropertyId().equals(visit.getPropertyId())) {
            PropertySummary prop = propertyServiceClient.getPropertyById(request.getPropertyId());
            visit.setPropertyId(request.getPropertyId());
            visit.setAgentId(prop.getAgentId());
        }

        if (request.getVisitDate() != null) {
            visit.setVisitDate(request.getVisitDate());
        }

        if (request.getNotes() != null) {
            visit.setNotes(request.getNotes());
        }

        Visit updated = visitRepo.save(visit);
        return VisitResponse.fromEntity(updated);
    }

    public void deleteVisit(Long id) {
        UserPrincipal currentUser = SecurityUtil.getAuthenticatedUser();

        Visit visit = visitRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found with ID: " + id));

        if (currentUser.isClient()) {
            if (!visit.getUserId().equals(currentUser.getUserId())) {
                throw new ForbiddenException("You can only cancel your own visits");
            }
        } else if (currentUser.isAgent()) {
            if (visit.getAgentId() == null || !visit.getAgentId().equals(currentUser.getUserId())) {
                throw new ForbiddenException("You can only manage visits assigned to you");
            }
        }

        visitRepo.delete(visit);
    }

    public VisitResponse updateVisitStatus(Long id, String status) {
        UserPrincipal currentUser = SecurityUtil.getAuthenticatedUser();

        if (status == null || status.trim().isEmpty()) {
            throw new BadRequestException("Status is required");
        }

        String normalizedStatus = status.trim().toUpperCase();
        if (!VALID_STATUSES.contains(normalizedStatus)) {
            throw new BadRequestException("Invalid visit status: " + normalizedStatus + ". Allowed: " + VALID_STATUSES);
        }

        Visit visit = visitRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found with ID: " + id));

        if (currentUser.isClient()) {
            if (!visit.getUserId().equals(currentUser.getUserId())) {
                throw new ForbiddenException("You can only update your own visits");
            }
            if (!"CANCELLED".equals(normalizedStatus)) {
                throw new ForbiddenException("Clients can only cancel their visits");
            }
        } else if (currentUser.isAgent()) {
            if (visit.getAgentId() == null || !visit.getAgentId().equals(currentUser.getUserId())) {
                throw new ForbiddenException("You can only update status for visits assigned to you");
            }
        }

        visit.setStatus(normalizedStatus);
        Visit updated = visitRepo.save(visit);
        return VisitResponse.fromEntity(updated);
    }
}
