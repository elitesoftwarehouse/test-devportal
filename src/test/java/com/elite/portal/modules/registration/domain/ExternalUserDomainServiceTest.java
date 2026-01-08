package com.elite.portal.modules.registration.domain;

import com.elite.portal.modules.registration.dto.ExternalCompanyRegistrationRequest;
import com.elite.portal.modules.registration.dto.ExternalProfessionalRegistrationRequest;
import com.elite.portal.modules.registration.exception.DuplicateEmailException;
import com.elite.portal.modules.registration.repository.ExternalUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExternalUserDomainServiceTest {

    @Mock
    private ExternalUserRepository externalUserRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private ExternalUserDomainService externalUserDomainService;

    @BeforeEach
    void setUp() {
        when(passwordEncoder.encode(any())).thenAnswer(invocation -> "HASHED-" + invocation.getArgument(0));
    }

    @Test
    @DisplayName("Creazione professionista esterno: stato REGISTERED_PENDING_ACCREDITATION e password hashata")
    void createExternalProfessional_shouldSetPendingAccreditationAndHashPassword() {
        ExternalProfessionalRegistrationRequest request = new ExternalProfessionalRegistrationRequest();
        request.setEmail("pro.user@test.com");
        request.setFirstName("Mario");
        request.setLastName("Rossi");
        request.setPassword("Password123!");
        request.setAcceptPrivacy(true);
        request.setAcceptTerms(true);

        when(externalUserRepository.findByEmailIgnoreCase("pro.user@test.com")).thenReturn(Optional.empty());
        when(externalUserRepository.save(any(ExternalUser.class))).thenAnswer(inv -> inv.getArgument(0));

        ExternalUser result = externalUserDomainService.registerProfessional(request);

        ArgumentCaptor<ExternalUser> captor = ArgumentCaptor.forClass(ExternalUser.class);
        verify(externalUserRepository).save(captor.capture());
        ExternalUser saved = captor.getValue();

        assertThat(result.getId()).isNull();
        assertThat(saved.getEmail()).isEqualTo("pro.user@test.com");
        assertThat(saved.getType()).isEqualTo(ExternalUserType.PROFESSIONAL);
        assertThat(saved.getStatus()).isEqualTo(RegistrationStatus.REGISTERED_PENDING_ACCREDITATION);
        assertThat(saved.getPasswordHash()).isEqualTo("HASHED-Password123!");
    }

    @Test
    @DisplayName("Creazione azienda esterna: stato REGISTERED_PENDING_ACCREDITATION e password hashata")
    void createExternalCompany_shouldSetPendingAccreditationAndHashPassword() {
        ExternalCompanyRegistrationRequest request = new ExternalCompanyRegistrationRequest();
        request.setEmail("company.user@test.com");
        request.setCompanyName("ACME Spa");
        request.setVatNumber("IT12345678901");
        request.setPassword("Password123!");
        request.setAcceptPrivacy(true);
        request.setAcceptTerms(true);

        when(externalUserRepository.findByEmailIgnoreCase("company.user@test.com")).thenReturn(Optional.empty());
        when(externalUserRepository.save(any(ExternalUser.class))).thenAnswer(inv -> inv.getArgument(0));

        ExternalUser result = externalUserDomainService.registerCompany(request);

        ArgumentCaptor<ExternalUser> captor = ArgumentCaptor.forClass(ExternalUser.class);
        verify(externalUserRepository).save(captor.capture());
        ExternalUser saved = captor.getValue();

        assertThat(result.getEmail()).isEqualTo("company.user@test.com");
        assertThat(saved.getType()).isEqualTo(ExternalUserType.COMPANY);
        assertThat(saved.getStatus()).isEqualTo(RegistrationStatus.REGISTERED_PENDING_ACCREDITATION);
        assertThat(saved.getPasswordHash()).isEqualTo("HASHED-Password123!");
    }

    @Test
    @DisplayName("Registrazione fallisce con DuplicateEmailException se l'email esiste già")
    void registerExternalUser_shouldFailOnDuplicateEmail() {
        ExternalProfessionalRegistrationRequest request = new ExternalProfessionalRegistrationRequest();
        request.setEmail("duplicate@test.com");
        request.setFirstName("Mario");
        request.setLastName("Rossi");
        request.setPassword("Password123!");
        request.setAcceptPrivacy(true);
        request.setAcceptTerms(true);

        ExternalUser existing = new ExternalUser();
        existing.setId(1L);
        existing.setEmail("duplicate@test.com");

        when(externalUserRepository.findByEmailIgnoreCase("duplicate@test.com")).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> externalUserDomainService.registerProfessional(request))
                .isInstanceOf(DuplicateEmailException.class)
                .hasMessageContaining("duplicate@test.com");
    }
}
