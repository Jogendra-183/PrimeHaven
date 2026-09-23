package com.klu.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.klu.entity.User;
import com.klu.repo.UserRepo;

@Service
public class UserService {

    @Autowired
    private UserRepo repo;

    @Autowired
    private JWTService jwtService;

    public Object signupService(User userRequest) {

        Map<String, Object> response = new HashMap<>();

        try {

            User existingUser =
                    repo.findByUsername(userRequest.getUsername());

            if (existingUser != null) {

                response.put("code", 409);
                response.put("message",
                        "User already exists with this username.");

                return response;
            }

            userRequest.setRole(1);

            repo.save(userRequest);

            response.put("code", 200);
            response.put("message",
                    "User registered successfully.");

            return response;

        } catch (Exception e) {

            response.put("code", 500);
            response.put("message",
                    "An error occurred while registering the user.");

            return response;
        }
    }

    public Object signinService(Map<String, String> loginRequest) {

        Map<String, Object> response = new HashMap<>();

        try {

            User user =
                    repo.findByUsername(
                            loginRequest.get("username")
                    );

            if (user == null ||
                !user.getPassword()
                     .equals(loginRequest.get("password"))) {

                response.put("code", 401);
                response.put("message",
                        "Invalid username or password.");

                return response;
            }

            String jwtToken =
                    jwtService.generateJWT(
                            loginRequest,
                            user.getRole().toString(),
                            user.getId()
                    );

            response.put("code", 200);
            response.put("message",
                    "Login successful.");
            response.put("jwt", jwtToken);

            return response;

        } catch (Exception e) {

            response.put("code", 500);
            response.put("message",
                    "An error occurred while processing the login request.");

            return response;
        }
    }
}