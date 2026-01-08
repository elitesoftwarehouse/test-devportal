package com.elite.portal.modules.user.entity;

import java.time.Instant;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

public class ExternalUserTest {

    @Test
    public void testCanCompleteRegistrationTrueWhenApprovedPendingRegistration() {
        ExternalUser user = new ExternalUser();
        user.setStatus(ExternalUserStatus.APPROVED_PENDING_REGISTRATION);
        Assertions.assertTrue(user.canCompleteRegistration());
    }

    @Test
    public void testCanCompleteRegistrationFalseWhenActive() {
        ExternalUser user = new ExternalUser();
        user.setStatus(ExternalUserStatus.ACTIVE);
        Assertions.assertFalse(user.canCompleteRegistration());
    }

    @Test
    public void testMarkRegistrationCompletedTransitionsToActiveAndClearsToken() {
        ExternalUser user = new ExternalUser();
        user.setStatus(ExternalUserStatus.APPROVED_PENDING_REGISTRATION);
        user.setRegistrationToken("token");
        user.setRegistrationTokenExpiresAt(Instant.now());
        Instant completedAt = Instant.now();

        user.markRegistrationCompleted(completedAt);

        Assertions.assertEquals(ExternalUserStatus.ACTIVE, user.getStatus());
        Assertions.assertEquals(completedAt, user.getRegistrationCompletedAt());
        Assertions.assertNull(user.getRegistrationToken());
        Assertions.assertNull(user.getRegistrationTokenExpiresAt());
        Assertions.assertFalse(user.isFirstLoginCompleted());
    }

    @Test
    public void testMarkRegistrationCompletedFailsOnInvalidState() {
        ExternalUser user = new ExternalUser();
        user.setStatus(ExternalUserStatus.PENDING_APPROVAL);
        Assertions.assertThrows(IllegalStateException.class, () -> user.markRegistrationCompleted(Instant.now()));
    }

    @Test
    public void testMarkFirstLoginCompletedSetsFlag() {
        ExternalUser user = new ExternalUser();
        user.setFirstLoginCompleted(false);
        user.markFirstLoginCompleted();
        Assertions.assertTrue(user.isFirstLoginCompleted());
    }
}
