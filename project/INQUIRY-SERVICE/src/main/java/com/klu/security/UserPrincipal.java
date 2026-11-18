package com.klu.security;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPrincipal {
    private Long userId;
    private String username;
    private Role role;

    public boolean isClient() {
        return this.role == Role.CLIENT;
    }

    public boolean isAgent() {
        return this.role == Role.AGENT;
    }

    public boolean isAdmin() {
        return this.role == Role.ADMIN;
    }
}
