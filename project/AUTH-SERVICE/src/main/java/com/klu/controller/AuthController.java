package com.klu.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.klu.entity.User;
import com.klu.service.UserService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping({"/user", "/auth", ""})
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping({"/signup", "/register"})
    public ResponseEntity<Map<String, Object>> signup(
            @RequestBody(required = false) User user) {

        Map<String, Object> response = userService.signupService(user);
        int statusCode = (int) response.getOrDefault("code", 200);
        return ResponseEntity.status(statusCode).body(response);
    }

    @PostMapping({"/signin", "/login"})
    public ResponseEntity<Map<String, Object>> signin(
            @RequestBody(required = false) Map<String, String> loginRequest) {

        Map<String, Object> response = userService.signinService(loginRequest);
        int statusCode = (int) response.getOrDefault("code", 200);
        return ResponseEntity.status(statusCode).body(response);
    }
}
