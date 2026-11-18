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

import com.klu.dto.InquiryRequest;
import com.klu.dto.InquiryResponse;
import com.klu.dto.InquiryUpdateRequest;
import com.klu.service.InquiryService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping({"/inquiries", "/inquiry"})
public class InquiryController {

    private final InquiryService inquiryService;

    public InquiryController(InquiryService inquiryService) {
        this.inquiryService = inquiryService;
    }

    @PostMapping({"", "/"})
    public ResponseEntity<InquiryResponse> createInquiry(@Valid @RequestBody InquiryRequest request) {
        InquiryResponse created = inquiryService.createInquiry(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping({"", "/"})
    public ResponseEntity<List<InquiryResponse>> getInquiries(
            @RequestParam(required = false) String status) {
        List<InquiryResponse> inquiries = inquiryService.getInquiries(status);
        return ResponseEntity.ok(inquiries);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InquiryResponse> getInquiryById(@PathVariable Long id) {
        InquiryResponse inquiry = inquiryService.getInquiryById(id);
        return ResponseEntity.ok(inquiry);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InquiryResponse> updateInquiry(
            @PathVariable Long id,
            @RequestBody InquiryUpdateRequest request) {
        InquiryResponse updated = inquiryService.updateInquiry(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteInquiry(@PathVariable Long id) {
        inquiryService.deleteInquiry(id);
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("message", "Inquiry deleted successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<InquiryResponse> updateInquiryStatus(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @RequestParam(required = false) String status) {
        String newStatus = status;
        if ((newStatus == null || newStatus.trim().isEmpty()) && body != null) {
            newStatus = body.get("status");
        }
        InquiryResponse updated = inquiryService.updateInquiryStatus(id, newStatus);
        return ResponseEntity.ok(updated);
    }
}
