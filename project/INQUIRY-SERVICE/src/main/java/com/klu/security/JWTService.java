package com.klu.security;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JWTService {

    @Value("${jwt.secret:asjflkjklwejrkljlkajlkjlkdsajflkwejrlkjaklsdf}")
    private String secret = "asjflkjklwejrkljlkajlkjlkdsajflkwejrlkjaklsdf";

    public SecretKey getSignKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public Map<String, String> validateJWT(String token) throws Exception {
        Claims claim = Jwts.parser()
                .verifyWith(getSignKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        if (claim == null || (claim.getExpiration() != null && claim.getExpiration().before(new Date()))) {
            throw new Exception("Token Invalid!");
        }

        Map<String, String> parsedJWT = new HashMap<>();
        String username = claim.get("un") != null ? claim.get("un").toString() : claim.getSubject();
        parsedJWT.put("username", username != null ? username : "");
        parsedJWT.put("role", claim.get("role") != null ? claim.get("role").toString() : "CLIENT");
        parsedJWT.put("id", claim.get("id") != null ? claim.get("id").toString() : "0");

        return parsedJWT;
    }

    public UserPrincipal extractPrincipal(String token) throws Exception {
        Map<String, String> claims = validateJWT(token);
        Long userId = Long.parseLong(claims.get("id"));
        String username = claims.get("username");
        Role role = Role.fromString(claims.get("role"));
        return new UserPrincipal(userId, username, role);
    }
}
