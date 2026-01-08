package com.elite.portal.modules.user.security;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.elite.portal.core.entity.UserStatus;
import com.elite.portal.modules.user.entity.User;

/**
 * Implementazione di UserDetails che incapsula la logica di abilitazione
 * al login per utenti esterni in base allo stato applicativo.
 */
public class ExternalUserDetails implements UserDetails {

    private final User user;

    public ExternalUserDetails(User user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Set<GrantedAuthority> authorities = new HashSet<GrantedAuthority>();
        for (String role : user.getRoles()) {
            authorities.add(new SimpleGrantedAuthority(role));
        }
        return authorities;
    }

    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return user.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !UserStatus.BLOCKED.equals(user.getStatus());
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        // Per utenti esterni consentiamo il login solo se in stato ACTIVE
        if (user.isExternal()) {
            return UserStatus.ACTIVE.equals(user.getStatus());
        }
        // Per utenti interni applichiamo le stesse regole di base
        return !UserStatus.DISABLED.equals(user.getStatus()) && !UserStatus.BLOCKED.equals(user.getStatus());
    }

    /**
     * @return l'entita' User sottostante.
     */
    public User getDomainUser() {
        return user;
    }
}
