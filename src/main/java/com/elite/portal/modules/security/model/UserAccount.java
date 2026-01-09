package com.elite.portal.modules.security.model;

import java.util.HashSet;
import java.util.Set;
import javax.persistence.CollectionTable;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.Table;
import javax.persistence.Entity;

@Entity
@Table(name = "USER_ACCOUNT")
public class UserAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", nullable = false, unique = true, length = 100)
    private String username;

    @Column(name = "enabled", nullable = false)
    private boolean enabled;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "USER_ROLES", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private Set<RoleType> roles = new HashSet<>();

    public UserAccount() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public Set<RoleType> getRoles() {
        return roles;
    }

    public void setRoles(Set<RoleType> roles) {
        this.roles = roles;
    }

    public void addRole(RoleType roleType) {
        this.roles.add(roleType);
    }
}
