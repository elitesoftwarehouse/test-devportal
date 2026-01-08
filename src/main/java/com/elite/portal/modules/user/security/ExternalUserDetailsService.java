package com.elite.portal.modules.user.security;

import java.util.Optional;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.elite.portal.modules.user.entity.User;
import com.elite.portal.modules.user.repository.UserRepository;

/**
 * Implementazione di UserDetailsService utilizzata per il processo di
 * autenticazione (form login e API) che supporta utenti esterni.
 */
@Service
public class ExternalUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public ExternalUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> userOptional = userRepository.findByUsername(username);
        User user = userOptional.orElseThrow(() -> new UsernameNotFoundException("Utente non trovato"));
        return new ExternalUserDetails(user);
    }
}
