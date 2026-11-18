package com.klu.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.klu.entity.Property;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyResponse {

    @JsonProperty("id")
    @JsonAlias({"property_id", "propertyId"})
    private Long id;

    private String title;

    private String description;

    private String location;

    private Double price;

    private String status;

    @JsonProperty("propertyType")
    private String propertyType;

    private Integer bedrooms;

    private Integer bathrooms;

    private Double area;

    @JsonProperty("agentId")
    private Long agentId;

    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;

    public static PropertyResponse fromEntity(Property property) {
        if (property == null) {
            return null;
        }
        return PropertyResponse.builder()
                .id(property.getId())
                .title(property.getTitle())
                .description(property.getDescription())
                .location(property.getLocation())
                .price(property.getPrice())
                .status(property.getStatus())
                .propertyType(property.getPropertyType())
                .bedrooms(property.getBedrooms())
                .bathrooms(property.getBathrooms())
                .area(property.getArea())
                .agentId(property.getAgentId())
                .createdAt(property.getCreatedAt())
                .updatedAt(property.getUpdatedAt())
                .build();
    }
}
