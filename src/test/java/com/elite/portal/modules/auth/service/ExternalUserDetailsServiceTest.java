package com.elite.portal.modules.auth.service;

import com.elite.portal.modules.auth.model.ExternalUser;
import com.elite.portal.modules.auth.repository.ExternalUserRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.mockito.Mockito.when;

public class ExternalUserDetailsServiceTest {

    private ExternalUserRepository externalUserRepository;
    private ExternalUserDetailsService externalUserDetailsService;

    @BeforeEach
    public void setUp() {
        externalUserRepository = Mockito.mock(ExternalUserRepository.class);
        externalUserDetailsService = new ExternalUserDetailsService(externalUserRepository);
    }

    @Test
    public void testLoadUserByUsername_EmailVerified() {
        ExternalUser user = new ExternalUser();
        user.setEmail("test@example.com");
        user.setPasswordHash("hash");
        user.setEmailVerified(true);

        when(externalUserRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        UserDetails userDetails = externalUserDetailsService.loadUserByUsername("test@example.com");

        Assertions.assertEquals("test@example.com", userDetails.getUsername());
        Assertions.assertEquals("hash", userDetails.getPassword());
        Assertions.assertTrue(userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_EXTERNAL_USER")));
    }

    @Test
    public void testLoadUserByUsername_EmailNotVerified() {
        ExternalUser user = new ExternalUser();
        user.setEmail("test@example.com");
        user.setPasswordHash("hash");
        user.setEmailVerified(false);

        when(externalUserRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        Assertions.assertThrows(UsernameNotFoundException.class,
                () -> externalUserDetailsService.loadUserByUsername("test@example.com"));
    }

    @Test
    public void testLoadUserByUsername_UserNotFound() {
        when(externalUserRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        Assertions.assertThrows(UsernameNotFoundException.class,
                () -> externalUserDetailsService.loadUserByUsername("missing@example.com"));
    }
}
