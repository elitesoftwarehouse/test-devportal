package com.elite.portal.modules.auth.service;

import com.elite.portal.modules.auth.dto.ExternalCompanyPayload;
import com.elite.portal.modules.auth.dto.ExternalUserRegistrationRequest;
import com.elite.portal.modules.auth.dto.ExternalUserRegistrationResponse;
import com.elite.portal.modules.auth.model.EmailVerificationToken;
import com.elite.portal.modules.auth.model.ExternalUserType;
import com.elite.portal.modules.auth.model.User;
import com.elite.portal.modules.auth.repository.EmailVerificationTokenRepository;
import com.elite.portal.modules.auth.repository.UserRepository;
import com.elite.portal.modules.company.model.Company;
import com.elite.portal.modules.company.repository.CompanyRepository;
import com.elite.portal.shared.config.SecurityPasswordPolicyProperties;
import com.elite.portal.shared.exception.BusinessException;
import com.elite.portal.shared.logging.AppLogger;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

public class ExternalRegistrationServiceTest {

    private UserRepository userRepository;
    private CompanyRepository companyRepository;
    private EmailVerificationTokenRepository emailVerificationTokenRepository;
    private PasswordEncoder passwordEncoder;
    private SecurityPasswordPolicyProperties passwordPolicyProperties;
    private AppLogger logger;

    private ExternalRegistrationService service;

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        companyRepository = Mockito.mock(CompanyRepository.class);
        emailVerificationTokenRepository = Mockito.mock(EmailVerificationTokenRepository.class);
        passwordEncoder = Mockito.mock(PasswordEncoder.class);
        passwordPolicyProperties = new SecurityPasswordPolicyProperties();
        logger = Mockito.mock(AppLogger.class);

        when(passwordEncoder.encode(any())).thenReturn("encoded");
        when(userRepository.save(any())).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1L);
            return u;
        });
        when(emailVerificationTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service = new ExternalRegistrationService(
                userRepository,
                companyRepository,
                emailVerificationTokenRepository,
                passwordEncoder,
                passwordPolicyProperties,
                logger,
                24L
        );
    }

    @Test
    void registerExternal_professionista_createsUserAndToken() {
        ExternalUserRegistrationRequest request = new ExternalUserRegistrationRequest();
        request.setUserType(ExternalUserType.PROFESSIONISTA);
        request.setFirstName("Mario");
        request.setLastName("Rossi");
        request.setEmail("mario.rossi@example.com");
        request.setPassword("Password1!");

        when(userRepository.findByEmailIgnoreCase("mario.rossi@example.com")).thenReturn(Optional.empty());

        ExternalUserRegistrationResponse response = service.registerExternalUser(request);

        assertNotNull(response);
        assertEquals(1L, response.getUserId());

        ArgumentCaptor<EmailVerificationToken> captor = ArgumentCaptor.forClass(EmailVerificationToken.class);
        Mockito.verify(emailVerificationTokenRepository).save(captor.capture());
        assertNotNull(captor.getValue().getToken());
    }

    @Test
    void registerExternal_emailAlreadyUsed_throwsBusinessException() {
        ExternalUserRegistrationRequest request = new ExternalUserRegistrationRequest();
        request.setUserType(ExternalUserType.PROFESSIONISTA);
        request.setFirstName("Mario");
        request.setLastName("Rossi");
        request.setEmail("mario.rossi@example.com");
        request.setPassword("Password1!");

        User existing = new User();
        existing.setId(2L);
        existing.setEmail("mario.rossi@example.com");
        existing.setActive(true);

        when(userRepository.findByEmailIgnoreCase("mario.rossi@example.com")).thenReturn(Optional.of(existing));

        assertThrows(BusinessException.class, () -> service.registerExternalUser(request));
    }

    @Test
    void registerExternal_referenteAziendale_createsCompanyWhenRequested() {
        ExternalUserRegistrationRequest request = new ExternalUserRegistrationRequest();
        request.setUserType(ExternalUserType.REFERENTE_AZIENDALE);
        request.setFirstName("Luca");
        request.setLastName("Bianchi");
        request.setEmail("luca.bianchi@example.com");
        request.setPassword("Password1!");

        ExternalCompanyPayload companyPayload = new ExternalCompanyPayload();
        companyPayload.setCreateNewCompany(true);
        companyPayload.setCompanyName("Azienda Test");
        request.setCompany(companyPayload);

        when(userRepository.findByEmailIgnoreCase("luca.bianchi@example.com")).thenReturn(Optional.empty());
        when(companyRepository.save(any())).thenAnswer(inv -> {
            Company c = inv.getArgument(0);
            c.setId(10L);
            return c;
        });

        ExternalUserRegistrationResponse response = service.registerExternalUser(request);

        assertNotNull(response);
        assertEquals(1L, response.getUserId());
    }
}
