package com.klu.service;

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

	public String generateJWT(Map<String, String> u1, String role, Long id) {

		Map<String, Object> claim = new HashMap<>();

		String username = u1.get("username");
		claim.put("un", username);
		claim.put("role", role);
		claim.put("id", id.toString());

		return Jwts.builder()
				.subject(username)
				.claims(claim)
				.issuedAt(new Date())
				.expiration(
						new Date(
								new Date().getTime()
								+ (24 * 60 * 60 * 1000)
						)
				)
				.signWith(getSignKey())
				.compact();
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
		parsedJWT.put("role", claim.get("role") != null ? claim.get("role").toString() : "1");
		parsedJWT.put("id", claim.get("id") != null ? claim.get("id").toString() : "0");

		return parsedJWT;
	}
}
