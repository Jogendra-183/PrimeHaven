package com.klu;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.crypto.SecretKey;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.klu.dto.PropertyRequest;
import com.klu.dto.PropertyResponse;
import com.klu.exception.ForbiddenException;
import com.klu.exception.ResourceNotFoundException;
import com.klu.repo.PropertyRepo;
import com.klu.security.JWTService;
import com.klu.security.Role;
import com.klu.security.UserContext;
import com.klu.security.UserPrincipal;
import com.klu.service.PropertyService;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@SpringBootTest(classes = PropertyServiceApplication.class)
public class PropertyServiceTests {

    @Autowired
    private PropertyService propertyService;

    @Autowired
    private PropertyRepo propertyRepo;

    @Autowired
    private JWTService jwtService;

    private static final String AUTH_SERVICE_SECRET = "asjflkjklwejrkljlkajlkjlkdsajflkwejrlkjaklsdf";

    private String generateAuthServiceToken(String username, String role, Long id) {
        SecretKey key = Keys.hmacShaKeyFor(AUTH_SERVICE_SECRET.getBytes());
        Map<String, String> claims = new HashMap<>();
        claims.put("un", username);
        claims.put("role", role);
        claims.put("id", id.toString());

        return Jwts.builder()
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
    void testJwtCompatibilityWithAuthService() throws Exception {
        // Token format matching Auth Service exactly
        String token = generateAuthServiceToken("agent_john", "AGENT", 101L);

        Map<String, String> parsed = jwtService.validateJWT(token);
        assertEquals("agent_john", parsed.get("username"));
        assertEquals("AGENT", parsed.get("role"));
        assertEquals("101", parsed.get("id"));

        UserPrincipal principal = jwtService.extractPrincipal(token);
        assertEquals(101L, principal.getUserId());
        assertEquals("agent_john", principal.getUsername());
        assertEquals(Role.AGENT, principal.getRole());
        assertTrue(principal.isAgent());
        assertFalse(principal.isClient());
    }

    @Test
    void testNumericRoleMappingFromAuthService() throws Exception {
        // Auth service defaults role to 1 (CLIENT)
        String clientToken = generateAuthServiceToken("client_mary", "1", 201L);
        UserPrincipal clientPrincipal = jwtService.extractPrincipal(clientToken);
        assertEquals(Role.CLIENT, clientPrincipal.getRole());
        assertTrue(clientPrincipal.isClient());

        // Role 2 is AGENT
        String agentToken = generateAuthServiceToken("agent_bob", "2", 202L);
        UserPrincipal agentPrincipal = jwtService.extractPrincipal(agentToken);
        assertEquals(Role.AGENT, agentPrincipal.getRole());
        assertTrue(agentPrincipal.isAgent());

        // Role 3 or 0 is ADMIN
        String adminToken = generateAuthServiceToken("admin_user", "3", 301L);
        UserPrincipal adminPrincipal = jwtService.extractPrincipal(adminToken);
        assertEquals(Role.ADMIN, adminPrincipal.getRole());
        assertTrue(adminPrincipal.isAdmin());
    }

    @Test
    void testAgentCanCreatePropertyAndClientCannot() {
        // Set context to CLIENT
        UserContext.setCurrentUser(new UserPrincipal(501L, "client_user", Role.CLIENT));
        PropertyRequest req = new PropertyRequest();
        req.setTitle("Downtown Luxury Flat");
        req.setDescription("Spacious 2BHK");
        req.setLocation("Downtown");
        req.setPrice(350000.0);
        req.setPropertyType("APARTMENT");
        req.setBedrooms(2);
        req.setBathrooms(2);

        // CLIENT cannot create property
        assertThrows(ForbiddenException.class, () -> propertyService.createProperty(req));

        // Set context to AGENT
        UserContext.setCurrentUser(new UserPrincipal(102L, "agent_alice", Role.AGENT));
        PropertyResponse created = propertyService.createProperty(req);
        assertNotNull(created.getId());
        assertEquals(102L, created.getAgentId()); // Agent ID forced from JWT!
        assertEquals("AVAILABLE", created.getStatus());
        assertEquals("Downtown", created.getLocation());
        assertEquals(350000.0, created.getPrice());

        // Read property by ID
        PropertyResponse fetched = propertyService.getPropertyById(created.getId());
        assertEquals("Downtown Luxury Flat", fetched.getTitle());

        // Update status by AGENT
        PropertyResponse updated = propertyService.updatePropertyStatus(created.getId(), "RESERVED");
        assertEquals("RESERVED", updated.getStatus());

        // Clean up
        propertyService.deleteProperty(created.getId());
        assertThrows(ResourceNotFoundException.class, () -> propertyService.getPropertyById(created.getId()));
    }
}
