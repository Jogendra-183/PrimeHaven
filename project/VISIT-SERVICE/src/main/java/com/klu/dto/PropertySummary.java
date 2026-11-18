package com.klu.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertySummary {

    @JsonProperty("id")
    @JsonAlias({"property_id", "propertyId"})
    private Long id;

    private String title;

    private String location;

    private Double price;

    private String status;

    @JsonProperty("agentId")
    @JsonAlias({"agent_id"})
    private Long agentId;
}
