package com.klu.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.klu.dto.PropertySummary;
import com.klu.exception.BadRequestException;
import com.klu.exception.ResourceNotFoundException;
import com.klu.exception.ServiceUnavailableException;

import jakarta.servlet.http.HttpServletRequest;

@Component
public class PropertyServiceClient {

    private static final Logger log = LoggerFactory.getLogger(PropertyServiceClient.class);
    private static final String PROPERTY_SERVICE_URL = "http://PROPERTY-SERVICE/properties/";

    private final RestTemplate restTemplate;

    public PropertyServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public PropertySummary getPropertyById(Long propertyId) {
        if (propertyId == null) {
            throw new BadRequestException("Property ID must not be null");
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            forwardCurrentToken(headers);

            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
            String url = PROPERTY_SERVICE_URL + propertyId;

            log.info("Calling Property Service via Eureka: {}", url);
            ResponseEntity<PropertySummary> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    requestEntity,
                    PropertySummary.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody();
            } else {
                throw new ResourceNotFoundException("Property not found with ID: " + propertyId);
            }

        } catch (HttpClientErrorException.NotFound e) {
            log.warn("Property with ID {} not found in Property Service", propertyId);
            throw new ResourceNotFoundException("Property not found with ID: " + propertyId);
        } catch (HttpClientErrorException e) {
            log.error("Property Service returned client error {}: {}", e.getStatusCode(), e.getMessage());
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                throw new ResourceNotFoundException("Property not found with ID: " + propertyId);
            }
            throw new BadRequestException("Failed to validate property with ID " + propertyId + ": " + e.getMessage());
        } catch (Exception e) {
            log.error("Failed to communicate with Property Service: {}", e.getMessage());
            throw new ServiceUnavailableException("Property Service is currently unavailable: " + e.getMessage());
        }
    }

    private void forwardCurrentToken(HttpHeaders headers) {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest currentRequest = attrs.getRequest();
                String token = currentRequest.getHeader("Token");
                if (token != null && !token.trim().isEmpty()) {
                    headers.set("Token", token);
                }
                String authHeader = currentRequest.getHeader("Authorization");
                if (authHeader != null && !authHeader.trim().isEmpty()) {
                    headers.set("Authorization", authHeader);
                }
            }
        } catch (Exception ignored) {
            // Context not available, skip token forwarding
        }
    }
}
