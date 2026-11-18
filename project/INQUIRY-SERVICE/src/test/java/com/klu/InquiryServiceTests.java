package com.klu;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

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
import com.klu.dto.InquiryRequest;
import com.klu.dto.InquiryResponse;
import com.klu.dto.InquiryUpdateRequest;
import com.klu.dto.PropertySummary;
import com.klu.exception.ForbiddenException;
import com.klu.repo.InquiryRepo;
import com.klu.security.JWTService;
import com.klu.security.Role;
import com.klu.security.UserContext;
import com.klu.security.UserPrincipal;
import com.klu.service.InquiryService;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@SpringBootTest(classes = InquiryServiceApplication.class)
public class InquiryServiceTests {

    @Autowired
    private InquiryService inquiryService;

    @Autowired
    private InquiryRepo inquiryRepo;

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
        inquiryRepo.deleteAll();
    }

    @Test
    void testJwtCompatibility() throws Exception {
        String token = generateAuthServiceToken("client_emma", "CLIENT", 401L);
        UserPrincipal principal = jwtService.extractPrincipal(token);
        assertEquals(401L, principal.getUserId());
        assertEquals("client_emma", principal.getUsername());
        assertEquals(Role.CLIENT, principal.getRole());
    }

    @Test
    void testClientCreateInquiryWithPropertyValidation() {
        // Mock property response from Property Service
        PropertySummary mockProp = PropertySummary.builder()
                .id(25L)
                .title("Modern Penthouse")
                .location("Central Park")
                .price(1200000.0)
                .status("AVAILABLE")
                .agentId(77L)
                .build();
        when(propertyServiceClient.getPropertyById(eq(25L))).thenReturn(mockProp);

        // Authenticate client with userId = 555
        UserContext.setCurrentUser(new UserPrincipal(555L, "client_555", Role.CLIENT));

        InquiryRequest req = new InquiryRequest();
        req.setPropertyId(25L);
        req.setMessage("Is this property still available for immediate move-in?");

        InquiryResponse res = inquiryService.createInquiry(req);
        assertNotNull(res.getId());
        assertEquals(25L, res.getPropertyId());
        // Verify user_id is forced from JWT!
        assertEquals(555L, res.getUserId());
        // Verify agent_id is set from Property Service!
        assertEquals(77L, res.getAgentId());
        assertEquals("OPEN", res.getStatus());

        // Client views own inquiries
        List<InquiryResponse> clientInquiries = inquiryService.getInquiries(null);
        assertEquals(1, clientInquiries.size());

        // Agent (77) views inquiries assigned to their properties
        UserContext.setCurrentUser(new UserPrincipal(77L, "agent_77", Role.AGENT));
        List<InquiryResponse> agentInquiries = inquiryService.getInquiries(null);
        assertEquals(1, agentInquiries.size());

        // Agent responds to the inquiry and updates status
        InquiryUpdateRequest replyReq = new InquiryUpdateRequest();
        replyReq.setResponse("Yes, it is available for immediate occupancy.");
        replyReq.setStatus("IN_PROGRESS");
        InquiryResponse updated = inquiryService.updateInquiry(res.getId(), replyReq);
        assertEquals("IN_PROGRESS", updated.getStatus());
        assertEquals("Yes, it is available for immediate occupancy.", updated.getResponse());

        // Agent cannot delete inquiries
        assertThrows(ForbiddenException.class, () -> inquiryService.deleteInquiry(res.getId()));
    }

    @Test
    void testAgentCannotCreateInquiry() {
        UserContext.setCurrentUser(new UserPrincipal(77L, "agent_77", Role.AGENT));
        InquiryRequest req = new InquiryRequest();
        req.setPropertyId(25L);
        req.setMessage("Agent cannot ask inquiry");

        assertThrows(ForbiddenException.class, () -> inquiryService.createInquiry(req));
    }
}
