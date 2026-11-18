package com.klu;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.LocalDateTime;
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
import com.klu.repo.VisitRepo;
import com.klu.security.UserContext;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@SpringBootTest(classes = VisitServiceApplication.class)
@AutoConfigureMockMvc
public class VisitControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private VisitRepo visitRepo;

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
    void testCreateVisitWithClientTokenReturns201() throws Exception {
        PropertySummary mockProperty = PropertySummary.builder()
                .id(15L)
                .title("Cozy Cottage")
                .location("Hilltop")
                .price(320000.0)
                .status("AVAILABLE")
                .agentId(42L)
                .build();
        when(propertyServiceClient.getPropertyById(eq(15L))).thenReturn(mockProperty);

        String clientToken = generateToken("client_jane", "CLIENT", 310L);

        String json = """
            {
                "propertyId": 15,
                "visitDate": "%s",
                "notes": "Looking for afternoon slot"
            }
            """.formatted(LocalDateTime.now().plusDays(2).toString());

        mockMvc.perform(post("/visits")
                .header("Authorization", "Bearer " + clientToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.propertyId").value(15))
                .andExpect(jsonPath("$.userId").value(310))
                .andExpect(jsonPath("$.agentId").value(42))
                .andExpect(jsonPath("$.status").value("REQUESTED"));
    }

    @Test
    void testCreateVisitWithoutTokenReturns401() throws Exception {
        String json = """
            {
                "propertyId": 15,
                "visitDate": "2026-11-01T10:00:00"
            }
            """;

        mockMvc.perform(post("/visits")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    void testCreateVisitWithAgentTokenReturns403() throws Exception {
        String agentToken = generateToken("agent_dave", "AGENT", 501L);

        String json = """
            {
                "propertyId": 15,
                "visitDate": "2026-11-01T10:00:00"
            }
            """;

        mockMvc.perform(post("/visits")
                .header("Token", agentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(403));
    }

    @Test
    void testCreateVisitValidationFailureReturns400() throws Exception {
        String clientToken = generateToken("client_jane", "CLIENT", 310L);

        // Missing visitDate and propertyId
        String invalidJson = """
            {
                "notes": "No date provided"
            }
            """;

        mockMvc.perform(post("/visits")
                .header("Authorization", "Bearer " + clientToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    void testGetVisitsWithClientTokenReturns200() throws Exception {
        String clientToken = generateToken("client_jane", "CLIENT", 310L);

        mockMvc.perform(get("/visits")
                .header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isOk());
    }

    @Test
    void testGetVisitByIdNotFoundReturns404() throws Exception {
        String clientToken = generateToken("client_jane", "CLIENT", 310L);

        mockMvc.perform(get("/visits/9999999")
                .header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(404));
    }

    @Test
    void testCreateVisitWhenDownstreamServiceUnavailableReturns503() throws Exception {
        when(propertyServiceClient.getPropertyById(eq(99L)))
                .thenThrow(new ServiceUnavailableException("Property Service is currently unavailable"));

        String clientToken = generateToken("client_jane", "CLIENT", 310L);

        String json = """
            {
                "propertyId": 99,
                "visitDate": "2026-11-05T14:00:00",
                "notes": "Testing downstream failure"
            }
            """;

        mockMvc.perform(post("/visits")
                .header("Authorization", "Bearer " + clientToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value(503));
    }
}

