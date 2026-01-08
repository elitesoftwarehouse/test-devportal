package com.elite.portal.modules.auth.application;

import com.elite.portal.modules.auth.application.dto.ExternalRegistrationRequestDto;
import com.elite.portal.modules.auth.application.dto.ExternalRegistrationResponseDto;
import com.elite.portal.modules.auth.domain.ExternalUserAccount;
import com.elite.portal.modules.auth.domain.ExternalUserAccountRepository;
import com.elite.portal.modules.auth.domain.ExternalUserType;
import com.elite.portal.modules.auth.domain.UserAccountStatus;
import com.elite.portal.modules.auth.domain.exception.EmailAlreadyInUseException;
import com.elite.portal.modules.auth.domain.mapper.ExternalUserAccountMapper;
import com.elite.portal.modules.auth.domain.policy.PasswordPolicyValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Locale;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class ExternalRegistrationServiceTest {

    private ExternalUserAccountRepository repository;
    private PasswordEncoder passwordEncoder;
    private PasswordPolicyValidator passwordPolicyValidator;
    private ExternalUserAccountMapper mapper;
    private ApplicationEventPublisher eventPublisher;

    private ExternalRegistrationService service;

    @BeforeEach
    void setUp() {
        repository = mock(ExternalUserAccountRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        passwordPolicyValidator = mock(PasswordPolicyValidator.class);
        mapper = new ExternalUserAccountMapper();
        eventPublisher = mock(ApplicationEventPublisher.class);
        service = new ExternalRegistrationService(repository, passwordEncoder, passwordPolicyValidator, mapper, eventPublisher);
    }

    @Test
    void registerExternalUser_persistsAccountWithPendingStatus() {
        ExternalRegistrationRequestDto request = new ExternalRegistrationRequestDto();
        request.setType("PROFESSIONAL");
        request.setEmail("user@example.com");
        request.setPassword("Abcd1234!");
        request.setTermsAccepted(true);
        request.setPrivacyAccepted(true);
        request.setFirstName("Mario");
        request.setLastName("Rossi");

        when(repository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.empty());
        when(passwordPolicyValidator.isValid("Abcd1234!")).thenReturn(true);
        when(passwordEncoder.encode("Abcd1234!")).thenReturn("encodedPassword");
        when(repository.save(any(ExternalUserAccount.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ExternalRegistrationResponseDto response = service.registerExternalUser(request, Locale.ITALY);

        ArgumentCaptor<ExternalUserAccount> accountCaptor = ArgumentCaptor.forClass(ExternalUserAccount.class);
        verify(repository).save(accountCaptor.capture());
        ExternalUserAccount saved = accountCaptor.getValue();

        assertEquals("user@example.com", saved.getEmail());
        assertEquals("encodedPassword", saved.getPasswordHash());
        assertEquals(ExternalUserType.PROFESSIONAL, saved.getType());
        assertEquals(UserAccountStatus.REGISTERED_PENDING_ACCREDITATION, saved.getStatus());

        assertNotNull(response.getId());
        assertEquals("PROFESSIONAL", response.getType());
        assertEquals("REGISTERED_PENDING_ACCREDITATION", response.getStatus());
    }

    @Test
    void registerExternalUser_throwsWhenEmailAlreadyExists() {
        ExternalRegistrationRequestDto request = new ExternalRegistrationRequestDto();
        request.setType("PROFESSIONAL");
        request.setEmail("dup@example.com");
        request.setPassword("Abcd1234!");
        request.setTermsAccepted(true);
        request.setPrivacyAccepted(true);

        ExternalUserAccount existing = new ExternalUserAccount();
        existing.setEmail("dup@example.com");

        when(repository.findByEmailIgnoreCase("dup@example.com")).thenReturn(Optional.of(existing));

        assertThrows(EmailAlreadyInUseException.class, () -> service.registerExternalUser(request, Locale.ITALY));
    }
}
