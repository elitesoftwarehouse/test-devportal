package com.elite.portal.modules.accreditamento.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserProvider {

    public Long getCurrentUserIdOrNull() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof EliteUserDetails eliteUserDetails) {
            return eliteUserDetails.getId();
        }
        return null;
    }

    public String getCurrentUserEmailOrNull() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof EliteUserDetails eliteUserDetails) {
            return eliteUserDetails.getEmail();
        }
        if (authentication.getName() != null) {
            return authentication.getName();
        }
        return null;
    }

    public interface EliteUserDetails {
        Long getId();
        String getEmail();
    }
}
