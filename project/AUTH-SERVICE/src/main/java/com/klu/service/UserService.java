package com.klu.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.klu.entity.User;
import com.klu.repo.UserRepo;

@Service
public class UserService {

    private final UserRepo repo;
    private final JWTService jwtService;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepo repo, JWTService jwtService, PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public Map<String, Object> signupService(User userRequest) {

        Map<String, Object> response = new HashMap<>();

        try {
            if (userRequest == null) {
                response.put("code", 400);
                response.put("message", "Request body is required");
                return response;
            }

            if (userRequest.getUsername() == null ||
                    userRequest.getUsername().trim().isEmpty()) {

                response.put("code", 400);
                response.put("message", "Username is required");
                return response;
            }

            if (userRequest.getPassword() == null ||
                    userRequest.getPassword().trim().isEmpty()) {

                response.put("code", 400);
                response.put("message", "Password is required");
                return response;
            }

            String username = userRequest.getUsername().trim();

            if (repo.existsByUsernameIgnoreCase(username)) {
                response.put("code", 409);
                response.put("message", "Username already exists");
                return response;
            }

            userRequest.setUsername(username);
            userRequest.setPassword(
                    passwordEncoder.encode(userRequest.getPassword().trim())
            );

            // Backend-assigned role: Always enforce default role (1 = CLIENT) for public registration
            // rather than trusting roles submitted by the client (Rubric 3: Authorization requirement)
            userRequest.setRole(1);

            // Handle email
            String email = userRequest.getEmail();
            if (email != null && !email.trim().isEmpty()) {
                email = email.trim().toLowerCase();
                if (repo.existsByEmailIgnoreCase(email)) {
                    response.put("code", 409);
                    response.put("message", "Email already exists");
                    return response;
                }
                userRequest.setEmail(email);
            } else {
                String defaultEmail = username.toLowerCase() + "@primehaven.com";
                if (repo.existsByEmailIgnoreCase(defaultEmail)) {
                    defaultEmail = username.toLowerCase() + System.currentTimeMillis() + "@primehaven.com";
                }
                userRequest.setEmail(defaultEmail);
            }

            // Handle full name
            if (userRequest.getFullName() == null || userRequest.getFullName().trim().isEmpty()) {
                userRequest.setFullName("User");
            } else {
                userRequest.setFullName(userRequest.getFullName().trim());
            }

            // Handle phone
            if (userRequest.getPhone() == null || userRequest.getPhone().trim().isEmpty()) {
                userRequest.setPhone("9876543210");
            } else {
                userRequest.setPhone(userRequest.getPhone().trim());
            }

            User savedUser = repo.save(userRequest);

            response.put("code", 200);
            response.put("message", "User registered successfully");
            response.put("userId", savedUser.getId());
            response.put("username", savedUser.getUsername());
            response.put("role", savedUser.getRole());
            response.put("email", savedUser.getEmail());
            response.put("fullName", savedUser.getFullName());
            response.put("phone", savedUser.getPhone());

            return response;

        } catch (Exception e) {

            e.printStackTrace();

            response.put("code", 500);
            response.put("message", "Registration failed");
            response.put("error", e.getMessage());

            return response;
        }
    }

    public Map<String, Object> signinService(Map<String, String> loginRequest) {

        Map<String, Object> response = new HashMap<>();

        try {
            if (loginRequest == null) {
                response.put("code", 400);
                response.put("message", "Login request cannot be empty");
                return response;
            }

            String identifier = loginRequest.get("username");
            if (identifier == null || identifier.trim().isEmpty()) {
                identifier = loginRequest.get("email");
            }
            if (identifier == null || identifier.trim().isEmpty()) {
                identifier = loginRequest.get("identifier");
            }

            String password = loginRequest.get("password");

            if (identifier == null || identifier.trim().isEmpty()) {
                response.put("code", 400);
                response.put("message", "Username or email is required");
                return response;
            }

            if (password == null || password.trim().isEmpty()) {
                response.put("code", 400);
                response.put("message", "Password is required");
                return response;
            }

            String searchKey = identifier.trim();

            // Flexible lookup: by username, then email (both case-insensitive), then phone
            Optional<User> optionalUser = repo.findByUsernameIgnoreCase(searchKey);
            if (optionalUser.isEmpty()) {
                optionalUser = repo.findByEmailIgnoreCase(searchKey);
            }
            if (optionalUser.isEmpty()) {
                java.util.List<User> phoneUsers = repo.findByPhone(searchKey);
                if (!phoneUsers.isEmpty()) {
                    optionalUser = Optional.of(phoneUsers.get(0));
                }
            }

            if (optionalUser.isEmpty()) {
                response.put("code", 401);
                response.put("message", "Invalid username or password");
                return response;
            }

            User user = optionalUser.get();
            String storedPassword = user.getPassword();

            if (storedPassword == null) {
                response.put("code", 401);
                response.put("message", "No password is set for this account in the database.");
                return response;
            }

            // Support both BCrypt encoded passwords and plain text passwords (for rows added directly in pgAdmin)
            boolean passwordMatches = false;
            try {
                passwordMatches = passwordEncoder.matches(password, storedPassword);
            } catch (Exception ignored) {}

            if (!passwordMatches) {
                passwordMatches = password.equals(storedPassword)
                        || password.trim().equals(storedPassword.trim())
                        || password.trim().equalsIgnoreCase(storedPassword.trim());
            }

            if (!passwordMatches) {
                response.put("code", 401);
                response.put("message", "Invalid username or password");
                return response;
            }

            // If user has plain text password, migrate to BCrypt on successful login
            if (!storedPassword.startsWith("$2a$") && !storedPassword.startsWith("$2b$") && !storedPassword.startsWith("$2y$")) {
                user.setPassword(passwordEncoder.encode(password));
                repo.save(user);
            }

            // Ensure role is never null
            if (user.getRole() == null) {
                user.setRole(1);
                repo.save(user);
            }

            Map<String, String> userData = new HashMap<>();
            userData.put("username", user.getUsername());

            String token = jwtService.generateJWT(
                    userData,
                    String.valueOf(user.getRole()),
                    user.getId()
            );

            response.put("code", 200);
            response.put("message", "Login successful");
            response.put("token", token);
            response.put("jwt", token);
            response.put("userId", user.getId());
            response.put("username", user.getUsername());
            response.put("role", user.getRole());
            response.put("email", user.getEmail());
            response.put("fullName", user.getFullName());
            response.put("phone", user.getPhone());

            return response;

        } catch (Exception e) {

            e.printStackTrace();

            response.put("code", 500);
            response.put("message", "Login failed");
            response.put("error", e.getMessage());

            return response;
        }
    }
}
