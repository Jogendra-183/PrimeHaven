package com.klu.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "inquiry_tab")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Inquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    @JsonAlias({"inquiry_id", "inquiryId"})
    private Long id;

    @Column(name = "user_id", nullable = false)
    @JsonProperty("userId")
    @JsonAlias({"user_id"})
    private Long userId;

    @Column(name = "property_id", nullable = false)
    @JsonProperty("propertyId")
    @JsonAlias({"property_id"})
    private Long propertyId;

    @Column(name = "agent_id")
    @JsonProperty("agentId")
    @JsonAlias({"agent_id"})
    private Long agentId;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(columnDefinition = "TEXT")
    @JsonProperty("response")
    @JsonAlias({"reply"})
    private String response;

    @Column(nullable = false)
    private String status; // OPEN, IN_PROGRESS, RESOLVED, CLOSED

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.status == null || this.status.trim().isEmpty()) {
            this.status = "OPEN";
        } else {
            this.status = this.status.trim().toUpperCase();
        }
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        if (this.status != null) {
            this.status = this.status.trim().toUpperCase();
        }
        this.updatedAt = LocalDateTime.now();
    }
}
