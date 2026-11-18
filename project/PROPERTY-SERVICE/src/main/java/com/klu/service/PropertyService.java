package com.klu.service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.klu.dto.PropertyRequest;
import com.klu.dto.PropertyResponse;
import com.klu.entity.Property;
import com.klu.exception.BadRequestException;
import com.klu.exception.ForbiddenException;
import com.klu.exception.ResourceNotFoundException;
import com.klu.repo.PropertyRepo;
import com.klu.security.Role;
import com.klu.security.SecurityUtil;
import com.klu.security.UserPrincipal;

@Service
public class PropertyService {

    private static final List<String> VALID_STATUSES = Arrays.asList(
            "AVAILABLE", "UNDER_NEGOTIATION", "RESERVED", "SOLD"
    );

    private final PropertyRepo propertyRepo;

    public PropertyService(PropertyRepo propertyRepo) {
        this.propertyRepo = propertyRepo;
    }

    public PropertyResponse createProperty(PropertyRequest request) {
        UserPrincipal currentUser = SecurityUtil.requireRole(Role.ADMIN, Role.AGENT);

        Property property = new Property();
        property.setTitle(request.getTitle());
        property.setDescription(request.getDescription());
        property.setLocation(request.getLocation().trim());
        property.setPrice(request.getPrice());
        property.setPropertyType(request.getPropertyType());
        property.setBedrooms(request.getBedrooms());
        property.setBathrooms(request.getBathrooms());
        property.setArea(request.getArea());

        // Validate status
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            String status = request.getStatus().trim().toUpperCase();
            if (!VALID_STATUSES.contains(status)) {
                throw new BadRequestException("Invalid property status: " + status + ". Allowed: " + VALID_STATUSES);
            }
            property.setStatus(status);
        } else {
            property.setStatus("AVAILABLE");
        }

        // AGENT user ID comes from JWT; ADMIN can assign agent or default to self
        if (currentUser.isAgent()) {
            property.setAgentId(currentUser.getUserId());
        } else if (currentUser.isAdmin()) {
            if (request.getAgentId() != null) {
                property.setAgentId(request.getAgentId());
            } else {
                property.setAgentId(currentUser.getUserId());
            }
        }

        Property saved = propertyRepo.save(property);
        return PropertyResponse.fromEntity(saved);
    }

    public List<PropertyResponse> getAllProperties(String status, String location) {
        List<Property> list;
        if (status != null && !status.trim().isEmpty() && location != null && !location.trim().isEmpty()) {
            list = propertyRepo.findByStatusIgnoreCaseAndLocationContainingIgnoreCase(status.trim(), location.trim());
        } else if (status != null && !status.trim().isEmpty()) {
            list = propertyRepo.findByStatusIgnoreCase(status.trim());
        } else if (location != null && !location.trim().isEmpty()) {
            list = propertyRepo.findByLocationContainingIgnoreCase(location.trim());
        } else {
            list = propertyRepo.findAll();
        }

        return list.stream()
                .map(PropertyResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public PropertyResponse getPropertyById(Long id) {
        Property property = propertyRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + id));
        return PropertyResponse.fromEntity(property);
    }

    public PropertyResponse updateProperty(Long id, PropertyRequest request) {
        UserPrincipal currentUser = SecurityUtil.requireRole(Role.ADMIN, Role.AGENT);

        Property property = propertyRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + id));

        // AGENT can only update properties assigned to them
        if (currentUser.isAgent() && (property.getAgentId() == null || !property.getAgentId().equals(currentUser.getUserId()))) {
            throw new ForbiddenException("Agents can only update properties assigned to them");
        }

        if (request.getTitle() != null) {
            property.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            property.setDescription(request.getDescription());
        }
        if (request.getLocation() != null && !request.getLocation().trim().isEmpty()) {
            property.setLocation(request.getLocation().trim());
        }
        if (request.getPrice() != null) {
            if (request.getPrice() <= 0) {
                throw new BadRequestException("Price must be positive");
            }
            property.setPrice(request.getPrice());
        }
        if (request.getPropertyType() != null) {
            property.setPropertyType(request.getPropertyType());
        }
        if (request.getBedrooms() != null) {
            property.setBedrooms(request.getBedrooms());
        }
        if (request.getBathrooms() != null) {
            property.setBathrooms(request.getBathrooms());
        }
        if (request.getArea() != null) {
            property.setArea(request.getArea());
        }
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            String status = request.getStatus().trim().toUpperCase();
            if (!VALID_STATUSES.contains(status)) {
                throw new BadRequestException("Invalid property status: " + status + ". Allowed: " + VALID_STATUSES);
            }
            property.setStatus(status);
        }
        if (currentUser.isAdmin() && request.getAgentId() != null) {
            property.setAgentId(request.getAgentId());
        }

        Property updated = propertyRepo.save(property);
        return PropertyResponse.fromEntity(updated);
    }

    public void deleteProperty(Long id) {
        UserPrincipal currentUser = SecurityUtil.requireRole(Role.ADMIN, Role.AGENT);

        Property property = propertyRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + id));

        if (currentUser.isAgent() && (property.getAgentId() == null || !property.getAgentId().equals(currentUser.getUserId()))) {
            throw new ForbiddenException("Agents can only delete properties assigned to them");
        }

        propertyRepo.delete(property);
    }

    public PropertyResponse updatePropertyStatus(Long id, String status) {
        UserPrincipal currentUser = SecurityUtil.requireRole(Role.ADMIN, Role.AGENT);

        if (status == null || status.trim().isEmpty()) {
            throw new BadRequestException("Property status is required");
        }

        String normalizedStatus = status.trim().toUpperCase();
        if (!VALID_STATUSES.contains(normalizedStatus)) {
            throw new BadRequestException("Invalid property status: " + normalizedStatus + ". Allowed: " + VALID_STATUSES);
        }

        Property property = propertyRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + id));

        if (currentUser.isAgent() && (property.getAgentId() == null || !property.getAgentId().equals(currentUser.getUserId()))) {
            throw new ForbiddenException("Agents can only update status for properties assigned to them");
        }

        property.setStatus(normalizedStatus);
        Property updated = propertyRepo.save(property);
        return PropertyResponse.fromEntity(updated);
    }
}
