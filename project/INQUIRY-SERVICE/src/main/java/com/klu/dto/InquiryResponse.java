package com.klu.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.klu.entity.Inquiry;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InquiryResponse {

    @JsonProperty("id")
    @JsonAlias({"inquiry_id", "inquiryId"})
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

    private String message;

    @JsonProperty("response")
    @JsonAlias({"reply"})
    private String response;

    private String status;

    @JsonProperty("propertyDetails")
    private PropertySummary propertyDetails;

    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;

    public static InquiryResponse fromEntity(Inquiry inquiry) {
        if (inquiry == null) {
            return null;
        }
        return InquiryResponse.builder()
                .id(inquiry.getId())
                .propertyId(inquiry.getPropertyId())
                .userId(inquiry.getUserId())
                .agentId(inquiry.getAgentId())
                .message(inquiry.getMessage())
                .response(inquiry.getResponse())
                .status(inquiry.getStatus())
                .createdAt(inquiry.getCreatedAt())
                .updatedAt(inquiry.getUpdatedAt())
                .build();
    }

    public static InquiryResponse fromEntity(Inquiry inquiry, PropertySummary propertyDetails) {
        InquiryResponse res = fromEntity(inquiry);
        if (res != null) {
            res.setPropertyDetails(propertyDetails);
        }
        return res;
    }
}
