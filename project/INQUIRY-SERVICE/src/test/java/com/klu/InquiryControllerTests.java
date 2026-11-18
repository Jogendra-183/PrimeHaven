package com.klu;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.SecretKey;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.klu.client.PropertyServiceClient;
import com.klu.dto.PropertySummary;
import com.klu.exception.ServiceUnavailableException;
import com.klu.repo.InquiryRepo;
import com.klu.security.UserContext;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@SpringBootTest(classes = InquiryServiceApplication.class)
@AutoConfigureMockMvc
public class InquiryControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private InquiryRepo inquiryRepo;

    @MockitoBean
    private PropertyServiceClient propertyServiceClient;

    private static final String SECRET = "asjflkjklwejrkljlkajlkjlkdsajflkwejrlkjaklsdf";

    private String generateToken(String username, String role, Long id) {
        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes());
        Map<String, String> claims = new HashMap<>();
        claims.put("un", username);
        claims.put("role", role);
        claims.put("id", id.toString());

        return Jwts.builder()
                .subject(username)
                .claims(claims)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(key)
                .compact();
    }

    @BeforeEach
    void setUp() {
        UserContext.clear();
    }

    @Test
    void testCreateInquiryWithClientTokenReturns201() throws Exception {
        PropertySummary mockProperty = PropertySummary.builder()
                .id(20L)
                .title("Luxury Villa")
                .location("Palm Hills")
                .price(850000.0)
                .status("AVAILABLE")
                .agentId(55L)
                .build();
        when(propertyServiceClient.getPropertyById(eq(20L))).thenReturn(mockProperty);

        String clientToken = generateToken("client_anna", "CLIENT", 410L);

        String json = """
            {
                "propertyId": 20,
                "message": "Is financing available for this villa?"
            }
            """;

        mockMvc.perform(post("/inquiries")
                .header("Authorization", "Bearer " + clientToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.propertyId").value(20))
                .andExpect(jsonPath("$.userId").value(410))
                .andExpect(jsonPath("$.agentId").value(55))
                .andExpect(jsonPath("$.status").value("OPEN"))
                .andExpect(jsonPath("$.message").value("Is financing available for this villa?"));
    }

    @Test
    void testCreateInquiryWithoutTokenReturns401() throws Exception {
        String json = """
            {
                "propertyId": 20,
                "message": "Unauthenticated inquiry"
            }
            """;

        mockMvc.perform(post("/inquiries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    void testCreateInquiryWithAgentTokenReturns403() throws Exception {
        String agentToken = generateToken("agent_mike", "AGENT", 601L);

        String json = """
            {
                "propertyId": 20,
                "message": "Agent trying to create inquiry"
            }
            """;

        mockMvc.perform(post("/inquiries")
                .header("Token", agentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(403));
    }

    @Test
    void testCreateInquiryValidationFailureReturns400() throws Exception {
        String clientToken = generateToken("client_anna", "CLIENT", 410L);

        // Missing message and propertyId
        String invalidJson = """
            {
            }
            """;

        mockMvc.perform(post("/inquiries")
                .header("Authorization", "Bearer " + clientToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    void testGetInquiriesWithClientTokenReturns200() throws Exception {
        String clientToken = generateToken("client_anna", "CLIENT", 410L);

        mockMvc.perform(get("/inquiries")
                .header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isOk());
    }

    @Test
    void testGetInquiryByIdNotFoundReturns404() throws Exception {
        String clientToken = generateToken("client_anna", "CLIENT", 410L);

        mockMvc.perform(get("/inquiries/9999999")
                .header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(404));
    }

    @Test
    void testCreateInquiryWhenDownstreamServiceUnavailableReturns503() throws Exception {
        when(propertyServiceClient.getPropertyById(eq(999L)))
                .thenThrow(new ServiceUnavailableException("Property Service is currently unavailable"));

        String clientToken = generateToken("client_anna", "CLIENT", 410L);

        String json = """
            {
                "propertyId": 999,
                "message": "Testing downstream failure"
            }
            """;

        mockMvc.perform(post("/inquiries")
                .header("Authorization", "Bearer " + clientToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value(503));
    }
}

