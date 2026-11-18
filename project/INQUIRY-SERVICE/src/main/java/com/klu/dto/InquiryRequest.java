package com.klu.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InquiryRequest {

    @NotNull(message = "Property ID is required")
    @JsonProperty("propertyId")
    @JsonAlias({"property_id"})
    private Long propertyId;

    @NotBlank(message = "Message is required")
    private String message;
}
