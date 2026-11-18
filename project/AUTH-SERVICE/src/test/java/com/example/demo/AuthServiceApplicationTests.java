package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.klu.AuthServiceApplication;
import com.klu.entity.User;
import com.klu.service.UserService;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = AuthServiceApplication.class)
class AuthServiceApplicationTests {

    @Autowired
    private UserService userService;

    @Test
    void contextLoads() {
        assertNotNull(userService);
    }

    @Test
    void testSignupWithoutEmail() {
        String testUser = "user_noemail_" + System.currentTimeMillis();
        User u = new User();
        u.setUsername(testUser);
        u.setPassword("testpass123");

        Map<String, Object> result = userService.signupService(u);
        System.out.println("Result without email: " + result);

        assertEquals(200, result.get("code"));
        assertEquals("User registered successfully", result.get("message"));
        assertNotNull(result.get("userId"));
        assertNotNull(result.get("email"));
    }

    @Test
    void testSignupWithEmailAndFullName() {
        long ts = System.currentTimeMillis();
        String testUser = "user_full_" + ts;
        User u = new User();
        u.setUsername(testUser);
        u.setPassword("testpass123");
        u.setEmail("custom_" + ts + "@example.com");
        u.setFullName("Custom Test User");
        u.setPhone("9123456780");

        Map<String, Object> result = userService.signupService(u);
        System.out.println("Result with full data: " + result);

        assertEquals(200, result.get("code"));
        assertEquals("custom_" + ts + "@example.com", result.get("email"));
        assertEquals("Custom Test User", result.get("fullName"));
        assertEquals("9123456780", result.get("phone"));

        // Test sign in using username
        Map<String, String> loginReq = new HashMap<>();
        loginReq.put("username", testUser);
        loginReq.put("password", "testpass123");
        Map<String, Object> loginRes = userService.signinService(loginReq);
        assertEquals(200, loginRes.get("code"));
        assertNotNull(loginRes.get("token"));
        assertNotNull(loginRes.get("jwt"));

        // Test sign in using email
        Map<String, String> emailLoginReq = new HashMap<>();
        emailLoginReq.put("email", "custom_" + ts + "@example.com");
        emailLoginReq.put("password", "testpass123");
        Map<String, Object> emailLoginRes = userService.signinService(emailLoginReq);
        assertEquals(200, emailLoginRes.get("code"));
        assertNotNull(emailLoginRes.get("token"));
    }

    @Test
    void testDuplicateUsername() {
        long ts = System.currentTimeMillis();
        String testUser = "dup_" + ts;
        User u1 = new User();
        u1.setUsername(testUser);
        u1.setPassword("pass1");
        userService.signupService(u1);

        User u2 = new User();
        u2.setUsername(testUser);
        u2.setPassword("pass2");
        Map<String, Object> result = userService.signupService(u2);
        assertEquals(409, result.get("code"));
    }
}
