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
@Table(name = "property_tab")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    @JsonAlias({"property_id", "propertyId"})
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private String status; // AVAILABLE, UNDER_NEGOTIATION, RESERVED, SOLD

    @Column(name = "property_type")
    @JsonProperty("propertyType")
    @JsonAlias({"property_type", "type"})
    private String propertyType;

    private Integer bedrooms;

    private Integer bathrooms;

    private Double area;

    @Column(name = "agent_id")
    @JsonProperty("agentId")
    @JsonAlias({"agent_id"})
    private Long agentId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.status == null || this.status.trim().isEmpty()) {
            this.status = "AVAILABLE";
        } else {
            this.status = this.status.trim().toUpperCase();
        }
        if (this.title == null || this.title.trim().isEmpty()) {
            this.title = "Property at " + (this.location != null ? this.location : "PrimeHaven");
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
