package com.klu;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.crypto.SecretKey;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import com.klu.client.PropertyServiceClient;
import com.klu.dto.PropertySummary;
import com.klu.dto.VisitRequest;
import com.klu.dto.VisitResponse;
import com.klu.exception.ForbiddenException;
import com.klu.exception.ResourceNotFoundException;
import com.klu.repo.VisitRepo;
import com.klu.security.JWTService;
import com.klu.security.Role;
import com.klu.security.UserContext;
import com.klu.security.UserPrincipal;
import com.klu.service.VisitService;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@SpringBootTest(classes = VisitServiceApplication.class)
public class VisitServiceTests {

    @Autowired
    private VisitService visitService;

    @Autowired
    private VisitRepo visitRepo;

    @Autowired
    private JWTService jwtService;

    @MockitoBean
    private PropertyServiceClient propertyServiceClient;

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
        visitRepo.deleteAll();
    }

    @Test
    void testJwtCompatibility() throws Exception {
        String token = generateAuthServiceToken("client_sam", "CLIENT", 301L);
        UserPrincipal principal = jwtService.extractPrincipal(token);
        assertEquals(301L, principal.getUserId());
        assertEquals("client_sam", principal.getUsername());
        assertEquals(Role.CLIENT, principal.getRole());
    }

    @Test
    void testClientCreateVisitWithPropertyValidation() {
        // Mock property response from Property Service
        PropertySummary mockProp = PropertySummary.builder()
                .id(10L)
                .title("Sunny Villa")
                .location("Beach Road")
                .price(500000.0)
                .status("AVAILABLE")
                .agentId(88L)
                .build();
        when(propertyServiceClient.getPropertyById(eq(10L))).thenReturn(mockProp);

        // Authenticate client with userId = 405
        UserContext.setCurrentUser(new UserPrincipal(405L, "client_405", Role.CLIENT));

        VisitRequest req = new VisitRequest();
        req.setPropertyId(10L);
        req.setVisitDate(LocalDateTime.now().plusDays(3));
        req.setNotes("Looking forward to the visit");

        VisitResponse res = visitService.createVisit(req);
        assertNotNull(res.getId());
        assertEquals(10L, res.getPropertyId());
        // Verify user_id is forced from JWT!
        assertEquals(405L, res.getUserId());
        // Verify agent_id is set from Property Service!
        assertEquals(88L, res.getAgentId());
        assertEquals("REQUESTED", res.getStatus());

        // Client views own visits
        List<VisitResponse> clientVisits = visitService.getVisits(null);
        assertEquals(1, clientVisits.size());
        assertEquals(res.getId(), clientVisits.get(0).getId());

        // Another client cannot view this visit
        UserContext.setCurrentUser(new UserPrincipal(999L, "another_client", Role.CLIENT));
        List<VisitResponse> otherVisits = visitService.getVisits(null);
        assertEquals(0, otherVisits.size());
        assertThrows(ForbiddenException.class, () -> visitService.getVisitById(res.getId()));

        // Assigned agent (88) can view the visit
        UserContext.setCurrentUser(new UserPrincipal(88L, "agent_88", Role.AGENT));
        List<VisitResponse> agentVisits = visitService.getVisits(null);
        assertEquals(1, agentVisits.size());

        // Agent updates status to CONFIRMED
        VisitResponse confirmed = visitService.updateVisitStatus(res.getId(), "CONFIRMED");
        assertEquals("CONFIRMED", confirmed.getStatus());
    }

    @Test
    void testAgentCannotCreateVisitRequest() {
        UserContext.setCurrentUser(new UserPrincipal(88L, "agent_88", Role.AGENT));
        VisitRequest req = new VisitRequest();
        req.setPropertyId(10L);
        req.setVisitDate(LocalDateTime.now().plusDays(2));

        assertThrows(ForbiddenException.class, () -> visitService.createVisit(req));
    }
}
