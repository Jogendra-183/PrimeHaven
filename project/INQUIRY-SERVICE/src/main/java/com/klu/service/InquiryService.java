package com.klu.service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.klu.client.PropertyServiceClient;
import com.klu.dto.InquiryRequest;
import com.klu.dto.InquiryResponse;
import com.klu.dto.InquiryUpdateRequest;
import com.klu.dto.PropertySummary;
import com.klu.entity.Inquiry;
import com.klu.exception.BadRequestException;
import com.klu.exception.ForbiddenException;
import com.klu.exception.ResourceNotFoundException;
import com.klu.repo.InquiryRepo;
import com.klu.security.SecurityUtil;
import com.klu.security.UserPrincipal;

@Service
public class InquiryService {

    private static final List<String> VALID_STATUSES = Arrays.asList(
            "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"
    );

    private final InquiryRepo inquiryRepo;
    private final PropertyServiceClient propertyServiceClient;

    public InquiryService(InquiryRepo inquiryRepo, PropertyServiceClient propertyServiceClient) {
        this.inquiryRepo = inquiryRepo;
        this.propertyServiceClient = propertyServiceClient;
    }

    public InquiryResponse createInquiry(InquiryRequest request) {
        UserPrincipal currentUser = SecurityUtil.getAuthenticatedUser();

        if (currentUser.isAgent()) {
            throw new ForbiddenException("Agents are not authorized to create inquiries");
        }

        // Verify property existence through inter-service communication to PROPERTY-SERVICE
        PropertySummary property = propertyServiceClient.getPropertyById(request.getPropertyId());

        Inquiry inquiry = new Inquiry();
        inquiry.setPropertyId(request.getPropertyId());
        // user_id MUST come from the authenticated JWT
        inquiry.setUserId(currentUser.getUserId());
        // Automatically associate the inquiry with the property's agent if assigned
        inquiry.setAgentId(property.getAgentId());
        inquiry.setMessage(request.getMessage().trim());
        inquiry.setStatus("OPEN");

        Inquiry saved = inquiryRepo.save(inquiry);
        return InquiryResponse.fromEntity(saved, property);
    }

    public List<InquiryResponse> getInquiries(String status) {
        UserPrincipal currentUser = SecurityUtil.getAuthenticatedUser();
        List<Inquiry> inquiries;

        if (currentUser.isClient()) {
            // CLIENT: view own inquiries only
            if (status != null && !status.trim().isEmpty()) {
                inquiries = inquiryRepo.findByUserIdAndStatusIgnoreCase(currentUser.getUserId(), status.trim());
            } else {
                inquiries = inquiryRepo.findByUserId(currentUser.getUserId());
            }
        } else if (currentUser.isAgent()) {
            // AGENT: view inquiries related to assigned properties
            if (status != null && !status.trim().isEmpty()) {
                inquiries = inquiryRepo.findByAgentIdAndStatusIgnoreCase(currentUser.getUserId(), status.trim());
            } else {
                inquiries = inquiryRepo.findByAgentId(currentUser.getUserId());
            }
        } else {
            // ADMIN: full inquiry management
            if (status != null && !status.trim().isEmpty()) {
                inquiries = inquiryRepo.findByStatusIgnoreCase(status.trim());
            } else {
                inquiries = inquiryRepo.findAll();
            }
        }

        return inquiries.stream()
                .map(InquiryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public InquiryResponse getInquiryById(Long id) {
        UserPrincipal currentUser = SecurityUtil.getAuthenticatedUser();

        Inquiry inquiry = inquiryRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inquiry not found with ID: " + id));

        // Role verification
        if (currentUser.isClient() && !inquiry.getUserId().equals(currentUser.getUserId())) {
            throw new ForbiddenException("You can only view your own inquiries");
        }
        if (currentUser.isAgent() && (inquiry.getAgentId() == null || !inquiry.getAgentId().equals(currentUser.getUserId()))) {
            throw new ForbiddenException("You can only view inquiries assigned to you");
        }

        PropertySummary property = null;
        try {
            property = propertyServiceClient.getPropertyById(inquiry.getPropertyId());
        } catch (Exception ignored) {
            // Property detail is optional on retrieval
        }

        return InquiryResponse.fromEntity(inquiry, property);
    }

    public InquiryResponse updateInquiry(Long id, InquiryUpdateRequest request) {
        UserPrincipal currentUser = SecurityUtil.getAuthenticatedUser();

        Inquiry inquiry = inquiryRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inquiry not found with ID: " + id));

        if (currentUser.isClient()) {
            if (!inquiry.getUserId().equals(currentUser.getUserId())) {
                throw new ForbiddenException("You can only update your own inquiries");
            }
            if (!"OPEN".equalsIgnoreCase(inquiry.getStatus())) {
                throw new BadRequestException("Cannot edit inquiry that is already in status: " + inquiry.getStatus());
            }
            if (request.getMessage() != null && !request.getMessage().trim().isEmpty()) {
                inquiry.setMessage(request.getMessage().trim());
            }
        } else if (currentUser.isAgent()) {
            if (inquiry.getAgentId() == null || !inquiry.getAgentId().equals(currentUser.getUserId())) {
                throw new ForbiddenException("You can only respond to inquiries assigned to you");
            }
            if (request.getResponse() != null) {
                inquiry.setResponse(request.getResponse().trim());
            }
            if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
                String norm = request.getStatus().trim().toUpperCase();
                if (!VALID_STATUSES.contains(norm)) {
                    throw new BadRequestException("Invalid inquiry status: " + norm + ". Allowed: " + VALID_STATUSES);
                }
                inquiry.setStatus(norm);
            }
        } else if (currentUser.isAdmin()) {
            if (request.getMessage() != null && !request.getMessage().trim().isEmpty()) {
                inquiry.setMessage(request.getMessage().trim());
            }
            if (request.getResponse() != null) {
                inquiry.setResponse(request.getResponse().trim());
            }
            if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
                String norm = request.getStatus().trim().toUpperCase();
                if (!VALID_STATUSES.contains(norm)) {
                    throw new BadRequestException("Invalid inquiry status: " + norm + ". Allowed: " + VALID_STATUSES);
                }
                inquiry.setStatus(norm);
            }
        }

        Inquiry updated = inquiryRepo.save(inquiry);
        return InquiryResponse.fromEntity(updated);
    }

    public void deleteInquiry(Long id) {
        UserPrincipal currentUser = SecurityUtil.getAuthenticatedUser();

        Inquiry inquiry = inquiryRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inquiry not found with ID: " + id));

        if (currentUser.isClient()) {
            if (!inquiry.getUserId().equals(currentUser.getUserId())) {
                throw new ForbiddenException("You can only delete your own inquiries");
            }
            if (!"OPEN".equalsIgnoreCase(inquiry.getStatus())) {
                throw new BadRequestException("Cannot delete inquiry in status: " + inquiry.getStatus());
            }
        } else if (currentUser.isAgent()) {
            throw new ForbiddenException("Agents are not allowed to delete customer inquiries");
        }

        inquiryRepo.delete(inquiry);
    }

    public InquiryResponse updateInquiryStatus(Long id, String status) {
        UserPrincipal currentUser = SecurityUtil.getAuthenticatedUser();

        if (currentUser.isClient()) {
            throw new ForbiddenException("Clients are not authorized to update inquiry status");
        }

        if (status == null || status.trim().isEmpty()) {
            throw new BadRequestException("Status is required");
        }

        String normalizedStatus = status.trim().toUpperCase();
        if (!VALID_STATUSES.contains(normalizedStatus)) {
            throw new BadRequestException("Invalid inquiry status: " + normalizedStatus + ". Allowed: " + VALID_STATUSES);
        }

        Inquiry inquiry = inquiryRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inquiry not found with ID: " + id));

        if (currentUser.isAgent()) {
            if (inquiry.getAgentId() == null || !inquiry.getAgentId().equals(currentUser.getUserId())) {
                throw new ForbiddenException("You can only update status for inquiries assigned to you");
            }
        }

        inquiry.setStatus(normalizedStatus);
        Inquiry updated = inquiryRepo.save(inquiry);
        return InquiryResponse.fromEntity(updated);
    }
}
