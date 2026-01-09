package com.elite.portal.modules.auth.integration;

import com.elite.portal.modules.auth.email.MockEmailSender;
import com.elite.portal.modules.auth.registration.dto.ExternalUserRegistrationRequest;
import com.elite.portal.modules.auth.registration.dto.ExternalUserType;
import com.elite.portal.modules.auth.user.ExternalUserRepository;
import com.elite.portal.modules.auth.verification.EmailVerificationToken;
import com.elite.portal.modules.auth.verification.EmailVerificationTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.doReturn;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test di integrazione end-to-end per il flusso di registrazione e verifica email
 * di utenti esterni (professionista e referente aziendale).
 *
 * Scenari coperti:
 * - Registrazione professionista con verifica email e successivo login.
 * - Registrazione referente aziendale con verifica email.
 * - Tentativo di verifica con token scaduto.
 * - Tentativo di login con email non verificata (deve essere bloccato).
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class ExternalUserRegistrationFlowIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EmailVerificationTokenRepository tokenRepository;

    @Autowired
    private ExternalUserRepository userRepository;

    @SpyBean
    private Clock clock;

    @Autowired
    private MockEmailSender mockEmailSender;

    @BeforeEach
    void setUp() {
        mockEmailSender.clear();
    }

    private ExternalUserRegistrationRequest buildProfessionalRequest() {
        ExternalUserRegistrationRequest request = new ExternalUserRegistrationRequest();
        request.setEmail("pro.it@example.com");
        request.setPassword("Password123!");
        request.setFirstName("Mario");
        request.setLastName("Rossi");
        request.setUserType(ExternalUserType.PROFESSIONAL);
        return request;
    }

    private ExternalUserRegistrationRequest buildCompanyContactRequest() {
        ExternalUserRegistrationRequest request = new ExternalUserRegistrationRequest();
        request.setEmail("referente.it@example.com");
        request.setPassword("Password123!");
        request.setFirstName("Luigi");
        request.setLastName("Bianchi");
        request.setUserType(ExternalUserType.COMPANY_CONTACT);
        request.setCompanyName("Elite Portal Test S.r.l.");
        request.setCompanyVatNumber("IT12345678901");
        return request;
    }

    private String toJson(ExternalUserRegistrationRequest request) {
        return "{" +
            "\"email\":\"" + request.getEmail() + "\"," +
            "\"password\":\"" + request.getPassword() + "\"," +
            "\"firstName\":\"" + request.getFirstName() + "\"," +
            "\"lastName\":\"" + request.getLastName() + "\"," +
            "\"userType\":\"" + request.getUserType().name() + "\"" +
            (request.getCompanyName() != null ? ",\"companyName\":\"" + request.getCompanyName() + "\"" : "") +
            (request.getCompanyVatNumber() != null ? ",\"companyVatNumber\":\"" + request.getCompanyVatNumber() + "\"" : "") +
            "}";
    }

    private String extractTokenFromLastEmail() {
        assertThat(mockEmailSender.getSentEmails()).isNotEmpty();
        MockEmailSender.SentEmail email = mockEmailSender.getSentEmails().get(mockEmailSender.getSentEmails().size() - 1);
        String body = email.getBody();
        int idx = body.indexOf("token=");
        assertThat(idx).isGreaterThanOrEqualTo(0);
        return body.substring(idx + 6).trim();
    }

    @Nested
    @DisplayName("Professionista")
    class ProfessionalFlow {

        @Test
        @DisplayName("Registrazione, verifica email e login funzionano correttamente")
        @WithAnonymousUser
        void professionalRegistration_verification_andLogin() throws Exception {
            ExternalUserRegistrationRequest request = buildProfessionalRequest();

            mockMvc.perform(post("/api/public/auth/external/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(request)))
                .andExpect(status().isCreated());

            assertThat(mockEmailSender.getSentEmails()).hasSize(1);
            MockEmailSender.SentEmail email = mockEmailSender.getSentEmails().get(0);
            assertThat(email.getTo()).isEqualTo(request.getEmail());
            assertThat(email.getSubject()).containsIgnoringCase("verifica");
            assertThat(email.getBody()).contains("token=");

            String tokenValue = extractTokenFromLastEmail();

            mockMvc.perform(post("/api/public/auth/external/verify")
                    .param("token", tokenValue))
                .andExpect(status().isOk());

            Optional<EmailVerificationToken> storedToken = tokenRepository.findByToken(tokenValue);
            assertThat(storedToken).isPresent();
            assertThat(storedToken.get().isUsed()).isTrue();

            mockMvc.perform(post("/api/public/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"username\":\"" + request.getEmail() + "\",\"password\":\"" + request.getPassword() + "\"}"))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Referente aziendale")
    class CompanyContactFlow {

        @Test
        @DisplayName("Registrazione referente aziendale e verifica email")
        @WithAnonymousUser
        void companyContactRegistration_andVerification() throws Exception {
            ExternalUserRegistrationRequest request = buildCompanyContactRequest();

            mockMvc.perform(post("/api/public/auth/external/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(request)))
                .andExpect(status().isCreated());

            assertThat(mockEmailSender.getSentEmails()).hasSize(1);
            MockEmailSender.SentEmail email = mockEmailSender.getSentEmails().get(0);
            assertThat(email.getTo()).isEqualTo(request.getEmail());
            assertThat(email.getBody()).contains("token=");

            String tokenValue = extractTokenFromLastEmail();

            mockMvc.perform(post("/api/public/auth/external/verify")
                    .param("token", tokenValue))
                .andExpect(status().isOk());

            Optional<EmailVerificationToken> storedToken = tokenRepository.findByToken(tokenValue);
            assertThat(storedToken).isPresent();
            assertThat(storedToken.get().isUsed()).isTrue();
        }
    }

    @Nested
    @DisplayName("Token scaduto e login bloccato")
    class ExpiredTokenAndBlockedLogin {

        @Test
        @DisplayName("Verifica con token scaduto restituisce errore")
        @WithAnonymousUser
        void verificationWithExpiredToken_fails() throws Exception {
            ExternalUserRegistrationRequest request = buildProfessionalRequest();

            mockMvc.perform(post("/api/public/auth/external/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(request)))
                .andExpect(status().isCreated());

            String tokenValue = extractTokenFromLastEmail();

            Optional<EmailVerificationToken> storedTokenOpt = tokenRepository.findByToken(tokenValue);
            assertThat(storedTokenOpt).isPresent();

            EmailVerificationToken stored = storedTokenOpt.get();
            LocalDateTime expiredAt = stored.getExpiresAt().minusMinutes(1L);
            doReturn(Clock.fixed(expiredAt.toInstant(ZoneOffset.UTC), ZoneOffset.UTC).instant())
                .when(clock).instant();

            mockMvc.perform(post("/api/public/auth/external/verify")
                    .param("token", tokenValue))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Tentativo di login con email non verificata è bloccato")
        @WithAnonymousUser
        void loginWithUnverifiedEmail_isBlocked() throws Exception {
            ExternalUserRegistrationRequest request = buildProfessionalRequest();

            mockMvc.perform(post("/api/public/auth/external/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(request)))
                .andExpect(status().isCreated());

            mockMvc.perform(post("/api/public/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"username\":\"" + request.getEmail() + "\",\"password\":\"" + request.getPassword() + "\"}"))
                .andExpect(status().isUnauthorized());
        }
    }
}
