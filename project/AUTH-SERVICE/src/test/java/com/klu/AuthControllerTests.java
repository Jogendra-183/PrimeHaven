package com.klu;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = AuthServiceApplication.class)
@AutoConfigureMockMvc
public class AuthControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testSignupValidReturns200() throws Exception {
        long ts = System.currentTimeMillis();
        String json = """
            {
                "username": "api_user_%d",
                "password": "Password123!",
                "email": "api_user_%d@example.com",
                "fullName": "API User",
                "phone": "9876543210"
            }
            """.formatted(ts, ts);

        mockMvc.perform(post("/user/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.userId").exists())
                .andExpect(jsonPath("$.token").doesNotExist());
    }

    @Test
    void testSignupMissingUsernameReturns400() throws Exception {
        String json = """
            {
                "password": "Password123!"
            }
            """;

        mockMvc.perform(post("/user/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message").value("Username is required"));
    }

    @Test
    void testSignupDuplicateUsernameReturns409() throws Exception {
        long ts = System.currentTimeMillis();
        String json = """
            {
                "username": "api_dup_%d",
                "password": "Password123!"
            }
            """.formatted(ts);

        // First signup succeeds
        mockMvc.perform(post("/user/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isOk());

        // Duplicate signup returns 409 Conflict
        mockMvc.perform(post("/user/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value(409))
                .andExpect(jsonPath("$.message").value("Username already exists"));
    }

    @Test
    void testLoginValidCredentialsReturns200AndToken() throws Exception {
        long ts = System.currentTimeMillis();
        String username = "login_success_" + ts;
        String signupJson = """
            {
                "username": "%s",
                "password": "MyPassword123"
            }
            """.formatted(username);

        mockMvc.perform(post("/user/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(signupJson))
                .andExpect(status().isOk());

        String loginJson = """
            {
                "username": "%s",
                "password": "MyPassword123"
            }
            """.formatted(username);

        mockMvc.perform(post("/user/signin")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.jwt").exists());
    }

    @Test
    void testLoginInvalidPasswordReturns401() throws Exception {
        long ts = System.currentTimeMillis();
        String username = "login_fail_" + ts;
        String signupJson = """
            {
                "username": "%s",
                "password": "CorrectPassword"
            }
            """.formatted(username);

        mockMvc.perform(post("/user/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(signupJson))
                .andExpect(status().isOk());

        String loginJson = """
            {
                "username": "%s",
                "password": "WrongPassword"
            }
            """.formatted(username);

        mockMvc.perform(post("/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401))
                .andExpect(jsonPath("$.message").value("Invalid username or password"));
    }

    @Test
    void testLoginMissingPasswordReturns400() throws Exception {
        String loginJson = """
            {
                "username": "some_user"
            }
            """;

        mockMvc.perform(post("/user/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message").value("Password is required"));
    }
}

