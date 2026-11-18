package com.klu.security;

import java.util.Arrays;

import com.klu.exception.ForbiddenException;
import com.klu.exception.UnauthorizedException;

public class SecurityUtil {

    public static UserPrincipal getAuthenticatedUser() {
        UserPrincipal user = UserContext.getCurrentUser();
        if (user == null) {
            throw new UnauthorizedException("Authentication token is required");
        }
        return user;
    }

    public static UserPrincipal requireRole(Role... allowedRoles) {
        UserPrincipal user = getAuthenticatedUser();
        for (Role allowedRole : allowedRoles) {
            if (user.getRole() == allowedRole) {
                return user;
            }
        }
        throw new ForbiddenException("Access denied. Insufficient permissions for role: " + user.getRole());
    }

    public static UserPrincipal getCurrentUserOptional() {
        return UserContext.getCurrentUser();
    }
}
