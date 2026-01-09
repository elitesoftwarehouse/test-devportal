package com.elite.portal.modules.auth.service;

import com.elite.portal.modules.auth.model.ExternalUser;
import com.elite.portal.modules.auth.repository.ExternalUserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ExternalUserDetailsService implements UserDetailsService {

    private final ExternalUserRepository externalUserRepository;

    public ExternalUserDetailsService(ExternalUserRepository externalUserRepository) {
        this.externalUserRepository = externalUserRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        ExternalUser user = externalUserRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utente esterno non trovato"));

        if (!user.isEmailVerified()) {
            throw new UsernameNotFoundException("Email non verificata. Completa la verifica per accedere.");
        }

        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_EXTERNAL_USER"));

        return new User(user.getEmail(), user.getPasswordHash(), authorities);
    }
}
