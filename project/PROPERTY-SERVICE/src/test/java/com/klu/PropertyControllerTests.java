package com.klu;

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
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.klu.dto.PropertyResponse;
import com.klu.repo.PropertyRepo;
import com.klu.security.UserContext;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@SpringBootTest(classes = PropertyServiceApplication.class)
@AutoConfigureMockMvc
public class PropertyControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PropertyRepo propertyRepo;

    @Autowired
    private ObjectMapper objectMapper;

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
    void testCreatePropertyWithValidAgentTokenReturns201() throws Exception {
        String agentToken = generateToken("agent_frank", "AGENT", 250L);

        String json = """
            {
                "title": "Ocean View Apartment",
                "description": "Lovely 2-bedroom with panoramic sea view",
                "location": "Coastal Road",
                "price": 450000.0,
                "propertyType": "APARTMENT",
                "bedrooms": 2,
                "bathrooms": 2,
                "area": 120.0,
                "status": "AVAILABLE"
            }
            """;

        mockMvc.perform(post("/properties")
                .header("Authorization", "Bearer " + agentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title").value("Ocean View Apartment"))
                .andExpect(jsonPath("$.agentId").value(250))
                .andExpect(jsonPath("$.status").value("AVAILABLE"));
    }

    @Test
    void testCreatePropertyWithoutTokenReturns401() throws Exception {
        String json = """
            {
                "title": "Unauthenticated House",
                "location": "Some City",
                "price": 200000.0
            }
            """;

        mockMvc.perform(post("/properties")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    void testCreatePropertyWithClientTokenReturns403() throws Exception {
        String clientToken = generateToken("client_alice", "CLIENT", 123L);

        String json = """
            {
                "title": "Unauthorized Listing",
                "location": "Uptown",
                "price": 300000.0
            }
            """;

        mockMvc.perform(post("/properties")
                .header("Authorization", "Bearer " + clientToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(403));
    }

    @Test
    void testCreatePropertyValidationFailureReturns400() throws Exception {
        String agentToken = generateToken("agent_frank", "AGENT", 250L);

        // Missing location and negative price
        String invalidJson = """
            {
                "title": "Invalid Property",
                "location": "   ",
                "price": -50.0
            }
            """;

        mockMvc.perform(post("/properties")
                .header("Token", agentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    void testGetAllPropertiesPublicReturns200() throws Exception {
        mockMvc.perform(get("/properties"))
                .andExpect(status().isOk());
    }

    @Test
    void testGetPropertyByIdNotFoundReturns404() throws Exception {
        mockMvc.perform(get("/properties/9999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(404));
    }

    @Test
    void testUpdatePropertyStatusWithAgentTokenReturns200() throws Exception {
        String agentToken = generateToken("agent_frank", "AGENT", 250L);

        String createJson = """
            {
                "title": "Property for Status Test",
                "location": "Green Valley",
                "price": 280000.0,
                "status": "AVAILABLE"
            }
            """;

        MvcResult result = mockMvc.perform(post("/properties")
                .header("Authorization", "Bearer " + agentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(createJson))
                .andExpect(status().isCreated())
                .andReturn();

        PropertyResponse created = objectMapper.readValue(result.getResponse().getContentAsString(), PropertyResponse.class);

        // Update status to RESERVED
        String statusUpdateJson = """
            {
                "status": "RESERVED"
            }
            """;

        mockMvc.perform(put("/properties/" + created.getId() + "/status")
                .header("Authorization", "Bearer " + agentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(statusUpdateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RESERVED"));
    }
}

