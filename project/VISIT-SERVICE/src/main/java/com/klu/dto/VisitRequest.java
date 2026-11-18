package com.klu.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VisitRequest {

    @NotNull(message = "Property ID is required")
    @JsonProperty("propertyId")
    @JsonAlias({"property_id"})
    private Long propertyId;

    @NotNull(message = "Visit date is required")
    @JsonProperty("visitDate")
    @JsonAlias({"visit_date"})
    private LocalDateTime visitDate;

    private String notes;
}
