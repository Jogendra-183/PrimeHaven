package com.klu.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InquiryUpdateRequest {

    private String message;

    @JsonProperty("response")
    @JsonAlias({"reply"})
    private String response;

    private String status;
}
