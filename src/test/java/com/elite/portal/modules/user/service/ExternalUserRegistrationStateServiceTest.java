package com.elite.portal.modules.user.service;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import com.elite.portal.modules.user.entity.ExternalUser;
import com.elite.portal.modules.user.entity.ExternalUserStatus;
import com.elite.portal.modules.user.repository.ExternalUserRepository;

public class ExternalUserRegistrationStateServiceTest {

    private ExternalUserRepository externalUserRepository;
    private Clock clock;
    private RegistrationTokenGenerator tokenGenerator;
    private ExternalUserRegistrationStateService service;

    @BeforeEach
    public void setUp() {
        externalUserRepository = Mockito.mock(ExternalUserRepository.class);
        clock = Clock.fixed(Instant.parse("2023-01-01T10:00:00Z"), ZoneOffset.UTC);
        tokenGenerator = Mockito.mock(RegistrationTokenGenerator.class);
        service = new ExternalUserRegistrationStateService(externalUserRepository, clock, tokenGenerator);
    }

    @Test
    public void testMarkApprovedPendingRegistrationSetsStateAndToken() {
        ExternalUser user = new ExternalUser();
        user.setId(1L);
        user.setStatus(ExternalUserStatus.PENDING_APPROVAL);

        Mockito.when(tokenGenerator.generateToken()).thenReturn("test-token");
        Mockito.when(externalUserRepository.save(Mockito.any(ExternalUser.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ExternalUser result = service.markApprovedPendingRegistration(user, 24);

        Assertions.assertEquals(ExternalUserStatus.APPROVED_PENDING_REGISTRATION, result.getStatus());
        Assertions.assertEquals("test-token", result.getRegistrationToken());
        Assertions.assertEquals(Instant.parse("2023-01-02T10:00:00Z"), result.getRegistrationTokenExpiresAt());
        Assertions.assertNull(result.getRegistrationCompletedAt());
        Assertions.assertFalse(result.isFirstLoginCompleted());
    }

    @Test
    public void testMarkApprovedPendingRegistrationFailsIfNotPendingApproval() {
        ExternalUser user = new ExternalUser();
        user.setStatus(ExternalUserStatus.ACTIVE);
        Assertions.assertThrows(IllegalStateException.class, () -> service.markApprovedPendingRegistration(user, 24));
    }

    @Test
    public void testCompleteRegistrationWithTokenSuccess() {
        ExternalUser user = new ExternalUser();
        user.setId(10L);
        user.setStatus(ExternalUserStatus.APPROVED_PENDING_REGISTRATION);
        user.setRegistrationToken("token123");
        user.setRegistrationTokenExpiresAt(Instant.parse("2023-01-01T12:00:00Z"));

        Mockito.when(externalUserRepository.findByRegistrationToken("token123")).thenReturn(Optional.of(user));
        Mockito.when(externalUserRepository.save(Mockito.any(ExternalUser.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ExternalUser result = service.completeRegistrationWithToken("token123");

        Assertions.assertEquals(ExternalUserStatus.ACTIVE, result.getStatus());
        Assertions.assertNotNull(result.getRegistrationCompletedAt());
        Assertions.assertNull(result.getRegistrationToken());
        Assertions.assertNull(result.getRegistrationTokenExpiresAt());
    }

    @Test
    public void testCompleteRegistrationWithTokenFailsOnMissingToken() {
        Assertions.assertThrows(IllegalArgumentException.class, () -> service.completeRegistrationWithToken(null));
    }

    @Test
    public void testCompleteRegistrationWithTokenFailsOnUnknownToken() {
        Mockito.when(externalUserRepository.findByRegistrationToken("unknown")).thenReturn(Optional.empty());
        Assertions.assertThrows(IllegalArgumentException.class, () -> service.completeRegistrationWithToken("unknown"));
    }

    @Test
    public void testCompleteRegistrationWithTokenFailsOnExpiredToken() {
        ExternalUser user = new ExternalUser();
        user.setId(10L);
        user.setStatus(ExternalUserStatus.APPROVED_PENDING_REGISTRATION);
        user.setRegistrationToken("token123");
        // Expired one hour before fixed clock
        user.setRegistrationTokenExpiresAt(Instant.parse("2023-01-01T09:00:00Z"));

        Mockito.when(externalUserRepository.findByRegistrationToken("token123")).thenReturn(Optional.of(user));

        Assertions.assertThrows(IllegalArgumentException.class, () -> service.completeRegistrationWithToken("token123"));
    }

    @Test
    public void testMarkFirstLoginCompletedUpdatesFlag() {
        ExternalUser user = new ExternalUser();
        user.setId(5L);
        user.setFirstLoginCompleted(false);

        Mockito.when(externalUserRepository.findById(5L)).thenReturn(Optional.of(user));
        Mockito.when(externalUserRepository.save(Mockito.any(ExternalUser.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ExternalUser result = service.markFirstLoginCompleted(5L);

        Assertions.assertTrue(result.isFirstLoginCompleted());

        ArgumentCaptor<ExternalUser> captor = ArgumentCaptor.forClass(ExternalUser.class);
        Mockito.verify(externalUserRepository).save(captor.capture());
        Assertions.assertTrue(captor.getValue().isFirstLoginCompleted());
    }

    @Test
    public void testMarkFirstLoginCompletedFailsOnUnknownUser() {
        Mockito.when(externalUserRepository.findById(99L)).thenReturn(Optional.empty());
        Assertions.assertThrows(IllegalArgumentException.class, () -> service.markFirstLoginCompleted(99L));
    }
}
