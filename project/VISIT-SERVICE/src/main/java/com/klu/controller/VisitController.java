package com.klu.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.klu.dto.VisitRequest;
import com.klu.dto.VisitResponse;
import com.klu.service.VisitService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping({"/visits", "/visit"})
public class VisitController {

    private final VisitService visitService;

    public VisitController(VisitService visitService) {
        this.visitService = visitService;
    }

    @PostMapping({"", "/"})
    public ResponseEntity<VisitResponse> createVisit(@Valid @RequestBody VisitRequest request) {
        VisitResponse created = visitService.createVisit(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping({"", "/"})
    public ResponseEntity<List<VisitResponse>> getVisits(
            @RequestParam(required = false) String status) {
        List<VisitResponse> visits = visitService.getVisits(status);
        return ResponseEntity.ok(visits);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VisitResponse> getVisitById(@PathVariable Long id) {
        VisitResponse visit = visitService.getVisitById(id);
        return ResponseEntity.ok(visit);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VisitResponse> updateVisit(
            @PathVariable Long id,
            @Valid @RequestBody VisitRequest request) {
        VisitResponse updated = visitService.updateVisit(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteVisit(@PathVariable Long id) {
        visitService.deleteVisit(id);
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("message", "Visit cancelled/deleted successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<VisitResponse> updateVisitStatus(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @RequestParam(required = false) String status) {
        String newStatus = status;
        if ((newStatus == null || newStatus.trim().isEmpty()) && body != null) {
            newStatus = body.get("status");
        }
        VisitResponse updated = visitService.updateVisitStatus(id, newStatus);
        return ResponseEntity.ok(updated);
    }
}
