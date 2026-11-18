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
@Table(name = "visit_tab")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Visit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    @JsonAlias({"visit_id", "visitId"})
    private Long id;

    @Column(name = "property_id", nullable = false)
    @JsonProperty("propertyId")
    @JsonAlias({"property_id"})
    private Long propertyId;

    @Column(name = "user_id", nullable = false)
    @JsonProperty("userId")
    @JsonAlias({"user_id"})
    private Long userId;

    @Column(name = "agent_id")
    @JsonProperty("agentId")
    @JsonAlias({"agent_id"})
    private Long agentId;

    @Column(name = "visit_date", nullable = false)
    @JsonProperty("visitDate")
    @JsonAlias({"visit_date"})
    private LocalDateTime visitDate;

    @Column(nullable = false)
    private String status; // REQUESTED, CONFIRMED, CANCELLED, COMPLETED

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.status == null || this.status.trim().isEmpty()) {
            this.status = "REQUESTED";
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
