package com.klu.security;

public enum Role {
    CLIENT,
    AGENT,
    ADMIN;

    public static Role fromString(String roleStr) {
        if (roleStr == null || roleStr.trim().isEmpty()) {
            return CLIENT;
        }
        String normalized = roleStr.trim().toUpperCase();
        if (normalized.startsWith("ROLE_")) {
            normalized = normalized.substring(5);
        }
        switch (normalized) {
            case "ADMIN":
            case "3":
            case "0":
                return ADMIN;
            case "AGENT":
            case "2":
                return AGENT;
            case "CLIENT":
            case "1":
            default:
                return CLIENT;
        }
    }
}
