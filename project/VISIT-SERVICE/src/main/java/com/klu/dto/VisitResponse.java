package com.klu.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.klu.entity.Visit;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitResponse {

    @JsonProperty("id")
    @JsonAlias({"visit_id", "visitId"})
    private Long id;

    @JsonProperty("propertyId")
    @JsonAlias({"property_id"})
    private Long propertyId;

    @JsonProperty("userId")
    @JsonAlias({"user_id"})
    private Long userId;

    @JsonProperty("agentId")
    @JsonAlias({"agent_id"})
    private Long agentId;

    @JsonProperty("visitDate")
    @JsonAlias({"visit_date"})
    private LocalDateTime visitDate;

    private String status;

    private String notes;

    @JsonProperty("propertyDetails")
    private PropertySummary propertyDetails;

    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;

    public static VisitResponse fromEntity(Visit visit) {
        if (visit == null) {
            return null;
        }
        return VisitResponse.builder()
                .id(visit.getId())
                .propertyId(visit.getPropertyId())
                .userId(visit.getUserId())
                .agentId(visit.getAgentId())
                .visitDate(visit.getVisitDate())
                .status(visit.getStatus())
                .notes(visit.getNotes())
                .createdAt(visit.getCreatedAt())
                .updatedAt(visit.getUpdatedAt())
                .build();
    }

    public static VisitResponse fromEntity(Visit visit, PropertySummary propertyDetails) {
        VisitResponse response = fromEntity(visit);
        if (response != null) {
            response.setPropertyDetails(propertyDetails);
        }
        return response;
    }
}
