package com.elite.portal.modules.user.security;

import java.util.Collections;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import com.elite.portal.core.entity.UserStatus;
import com.elite.portal.modules.user.entity.ExternalUserType;
import com.elite.portal.modules.user.entity.User;

/**
 * Test per la logica di abilitazione in ExternalUserDetails.
 */
public class ExternalUserDetailsTest {

    @Test
    public void testExternalActiveUserIsEnabled() {
        User user = new User();
        user.setUsername("ext1");
        user.setPasswordHash("pwd");
        user.setExternal(true);
        user.setStatus(UserStatus.ACTIVE);
        user.setExternalType(ExternalUserType.EXTERNAL_COLLABORATOR);
        user.setRoles(Collections.singleton("EXTERNAL_COLLABORATOR"));

        ExternalUserDetails details = new ExternalUserDetails(user);

        Assertions.assertTrue(details.isEnabled());
        Assertions.assertTrue(details.isAccountNonLocked());
    }

    @Test
    public void testExternalPendingUserIsNotEnabled() {
        User user = new User();
        user.setUsername("ext2");
        user.setPasswordHash("pwd");
        user.setExternal(true);
        user.setStatus(UserStatus.PENDING);
        user.setExternalType(ExternalUserType.EXTERNAL_COLLABORATOR);
        user.setRoles(Collections.singleton("EXTERNAL_COLLABORATOR"));

        ExternalUserDetails details = new ExternalUserDetails(user);

        Assertions.assertFalse(details.isEnabled());
    }

    @Test
    public void testBlockedUserIsNotAccountNonLocked() {
        User user = new User();
        user.setUsername("ext3");
        user.setPasswordHash("pwd");
        user.setExternal(true);
        user.setStatus(UserStatus.BLOCKED);
        user.setExternalType(ExternalUserType.EXTERNAL_COLLABORATOR);
        user.setRoles(Collections.singleton("EXTERNAL_COLLABORATOR"));

        ExternalUserDetails details = new ExternalUserDetails(user);

        Assertions.assertFalse(details.isAccountNonLocked());
    }

    @Test
    public void testInternalDisabledUserIsNotEnabled() {
        User user = new User();
        user.setUsername("int1");
        user.setPasswordHash("pwd");
        user.setExternal(false);
        user.setStatus(UserStatus.DISABLED);
        user.setRoles(Collections.singleton("IT_OPERATOR"));

        ExternalUserDetails details = new ExternalUserDetails(user);

        Assertions.assertFalse(details.isEnabled());
    }
}
