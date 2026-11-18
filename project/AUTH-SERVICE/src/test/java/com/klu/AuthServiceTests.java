package com.klu;

import static org.junit.jupiter.api.Assertions.*;

import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.klu.entity.User;
import com.klu.service.JWTService;
import com.klu.service.UserService;

@SpringBootTest(classes = AuthServiceApplication.class)
public class AuthServiceTests {

    @Autowired
    private UserService userService;

    @Autowired
    private JWTService jwtService;

    @Test
    void testSuccessfulSignupAndSignin() {
        long ts = System.currentTimeMillis();
        String username = "testuser_" + ts;
        String email = "testuser_" + ts + "@example.com";
        String password = "SecurePassword123!";

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password);
        user.setFullName("Test User");
        user.setPhone("9988776655");

        Map<String, Object> signupRes = userService.signupService(user);
        assertEquals(200, signupRes.get("code"));
        assertEquals(username, signupRes.get("username"));
        assertEquals(1, signupRes.get("role")); // Client role

        // Sign in with username
        Map<String, String> loginReq = new HashMap<>();
        loginReq.put("username", username);
        loginReq.put("password", password);

        Map<String, Object> loginRes = userService.signinService(loginReq);
        assertEquals(200, loginRes.get("code"));
        assertNotNull(loginRes.get("token"));
        assertEquals(username, loginRes.get("username"));

        // Sign in with email
        Map<String, String> emailLoginReq = new HashMap<>();
        emailLoginReq.put("email", email);
        emailLoginReq.put("password", password);

        Map<String, Object> emailLoginRes = userService.signinService(emailLoginReq);
        assertEquals(200, emailLoginRes.get("code"));
        assertNotNull(emailLoginRes.get("token"));
    }

    @Test
    void testFailedLoginInvalidPassword() {
        long ts = System.currentTimeMillis();
        String username = "wrongpass_" + ts;

        User user = new User();
        user.setUsername(username);
        user.setPassword("correctPassword");
        userService.signupService(user);

        Map<String, String> loginReq = new HashMap<>();
        loginReq.put("username", username);
        loginReq.put("password", "wrongPassword");

        Map<String, Object> res = userService.signinService(loginReq);
        assertEquals(401, res.get("code"));
        assertEquals("Invalid username or password", res.get("message"));
    }

    @Test
    void testFailedLoginNonExistentUser() {
        Map<String, String> loginReq = new HashMap<>();
        loginReq.put("username", "non_existent_user_9999");
        loginReq.put("password", "somePassword");

        Map<String, Object> res = userService.signinService(loginReq);
        assertEquals(401, res.get("code"));
        assertEquals("Invalid username or password", res.get("message"));
    }

    @Test
    void testFailedLoginMissingFields() {
        // Missing username/email
        Map<String, String> reqNoUser = new HashMap<>();
        reqNoUser.put("password", "pass123");
        Map<String, Object> res1 = userService.signinService(reqNoUser);
        assertEquals(400, res1.get("code"));

        // Missing password
        Map<String, String> reqNoPass = new HashMap<>();
        reqNoPass.put("username", "someuser");
        Map<String, Object> res2 = userService.signinService(reqNoPass);
        assertEquals(400, res2.get("code"));
    }

    @Test
    void testSignupValidationMissingFields() {
        // Missing username
        User noUser = new User();
        noUser.setPassword("pass123");
        Map<String, Object> res1 = userService.signupService(noUser);
        assertEquals(400, res1.get("code"));

        // Missing password
        User noPass = new User();
        noPass.setUsername("validuser_" + System.currentTimeMillis());
        Map<String, Object> res2 = userService.signupService(noPass);
        assertEquals(400, res2.get("code"));
    }

    @Test
    void testSignupDuplicateUsernameAndEmail() {
        long ts = System.currentTimeMillis();
        String username = "dupuser_" + ts;
        String email = "dupemail_" + ts + "@example.com";

        User u1 = new User();
        u1.setUsername(username);
        u1.setEmail(email);
        u1.setPassword("pass123");
        userService.signupService(u1);

        // Attempt duplicate username
        User dupUser = new User();
        dupUser.setUsername(username);
        dupUser.setEmail("different_" + ts + "@example.com");
        dupUser.setPassword("pass123");
        Map<String, Object> resDupUser = userService.signupService(dupUser);
        assertEquals(409, resDupUser.get("code"));

        // Attempt duplicate email
        User dupEmail = new User();
        dupEmail.setUsername("diffuser_" + ts);
        dupEmail.setEmail(email);
        dupEmail.setPassword("pass123");
        Map<String, Object> resDupEmail = userService.signupService(dupEmail);
        assertEquals(409, resDupEmail.get("code"));
    }

    @Test
    void testBackendAssignedRoleEnforcement() {
        long ts = System.currentTimeMillis();
        String username = "escalation_target_" + ts;

        // Malicious client attempts to register as ADMIN (role 3 or 0)
        User u = new User();
        u.setUsername(username);
        u.setPassword("pass123");
        u.setRole(3); // Attempted privilege escalation to ADMIN

        Map<String, Object> res = userService.signupService(u);
        assertEquals(200, res.get("code"));
        // Backend must enforce role = 1 (CLIENT)
        assertEquals(1, res.get("role"));
    }

    @Test
    void testJwtGenerationAndValidation() throws Exception {
        Map<String, String> userData = new HashMap<>();
        userData.put("username", "jwt_test_user");

        String token = jwtService.generateJWT(userData, "2", 888L);
        assertNotNull(token);

        Map<String, String> claims = jwtService.validateJWT(token);
        assertEquals("jwt_test_user", claims.get("username"));
        assertEquals("2", claims.get("role"));
        assertEquals("888", claims.get("id"));

        // Tampered token test
        assertThrows(Exception.class, () -> jwtService.validateJWT(token + "tampered"));

        // Malformed token test
        assertThrows(Exception.class, () -> jwtService.validateJWT("invalid.jwt.token"));
    }
}

