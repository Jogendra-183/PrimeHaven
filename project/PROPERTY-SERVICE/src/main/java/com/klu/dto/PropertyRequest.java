package com.klu.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyRequest {

    private String title;

    private String description;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private Double price;

    private String status;

    @JsonProperty("propertyType")
    @JsonAlias({"property_type", "type"})
    private String propertyType;

    private Integer bedrooms;

    private Integer bathrooms;

    private Double area;

    @JsonProperty("agentId")
    @JsonAlias({"agent_id"})
    private Long agentId;
}
