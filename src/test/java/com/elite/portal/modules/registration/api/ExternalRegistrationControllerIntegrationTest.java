package com.elite.portal.modules.registration.api;

import com.elite.portal.modules.registration.domain.ExternalUser;
import com.elite.portal.modules.registration.domain.ExternalUserType;
import com.elite.portal.modules.registration.domain.RegistrationStatus;
import com.elite.portal.modules.registration.dto.ExternalCompanyRegistrationRequest;
import com.elite.portal.modules.registration.dto.ExternalProfessionalRegistrationRequest;
import com.elite.portal.modules.registration.repository.ExternalUserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ExternalRegistrationControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ExternalUserRepository externalUserRepository;

    @BeforeEach
    void cleanDb() {
        externalUserRepository.deleteAll();
    }

    @Nested
    @DisplayName("Registrazione professionista")
    class ProfessionalRegistration {

        @Test
        @DisplayName("Registrazione professionista valida restituisce 201 e persiste utente con stato PENDING_ACCREDITATION")
        void validProfessionalRegistration_shouldCreateUserAndReturn201() throws Exception {
            ExternalProfessionalRegistrationRequest request = new ExternalProfessionalRegistrationRequest();
            request.setEmail("pro.valid@test.com");
            request.setFirstName("Mario");
            request.setLastName("Rossi");
            request.setPassword("Password123!");
            request.setAcceptPrivacy(true);
            request.setAcceptTerms(true);

            mockMvc.perform(post("/api/registration/external/professional")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.email").value("pro.valid@test.com"))
                    .andExpect(jsonPath("$.type").value("PROFESSIONAL"))
                    .andExpect(jsonPath("$.status").value("REGISTERED_PENDING_ACCREDITATION"));

            ExternalUser saved = externalUserRepository.findByEmailIgnoreCase("pro.valid@test.com").orElseThrow();
            assertThat(saved.getType()).isEqualTo(ExternalUserType.PROFESSIONAL);
            assertThat(saved.getStatus()).isEqualTo(RegistrationStatus.REGISTERED_PENDING_ACCREDITATION);
            assertThat(saved.getPasswordHash()).isNotBlank();
            assertThat(saved.getPasswordHash()).doesNotContain("Password123!");
        }

        @Test
        @DisplayName("Tentativo di registrazione professionista con email duplicata restituisce 409")
        void professionalRegistration_duplicateEmail_shouldReturn409() throws Exception {
            ExternalUser existing = new ExternalUser();
            existing.setEmail("duplicate.pro@test.com");
            existing.setType(ExternalUserType.PROFESSIONAL);
            existing.setStatus(RegistrationStatus.REGISTERED_PENDING_ACCREDITATION);
            existing.setPasswordHash("hash");
            externalUserRepository.save(existing);

            ExternalProfessionalRegistrationRequest request = new ExternalProfessionalRegistrationRequest();
            request.setEmail("duplicate.pro@test.com");
            request.setFirstName("Mario");
            request.setLastName("Rossi");
            request.setPassword("Password123!");
            request.setAcceptPrivacy(true);
            request.setAcceptTerms(true);

            mockMvc.perform(post("/api/registration/external/professional")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.code").value("EMAIL_ALREADY_REGISTERED"));
        }
    }

    @Nested
    @DisplayName("Registrazione azienda")
    class CompanyRegistration {

        @Test
        @DisplayName("Registrazione azienda valida restituisce 201 e persiste utente con stato PENDING_ACCREDITATION")
        void validCompanyRegistration_shouldCreateUserAndReturn201() throws Exception {
            ExternalCompanyRegistrationRequest request = new ExternalCompanyRegistrationRequest();
            request.setEmail("company.valid@test.com");
            request.setCompanyName("ACME Spa");
            request.setVatNumber("IT12345678901");
            request.setPassword("Password123!");
            request.setAcceptPrivacy(true);
            request.setAcceptTerms(true);

            mockMvc.perform(post("/api/registration/external/company")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.email").value("company.valid@test.com"))
                    .andExpect(jsonPath("$.type").value("COMPANY"))
                    .andExpect(jsonPath("$.status").value("REGISTERED_PENDING_ACCREDITATION"));

            ExternalUser saved = externalUserRepository.findByEmailIgnoreCase("company.valid@test.com").orElseThrow();
            assertThat(saved.getType()).isEqualTo(ExternalUserType.COMPANY);
            assertThat(saved.getStatus()).isEqualTo(RegistrationStatus.REGISTERED_PENDING_ACCREDITATION);
            assertThat(saved.getPasswordHash()).isNotBlank();
            assertThat(saved.getPasswordHash()).doesNotContain("Password123!");
        }

        @Test
        @DisplayName("Tentativo di registrazione azienda con email duplicata restituisce 409")
        void companyRegistration_duplicateEmail_shouldReturn409() throws Exception {
            ExternalUser existing = new ExternalUser();
            existing.setEmail("duplicate.company@test.com");
            existing.setType(ExternalUserType.COMPANY);
            existing.setStatus(RegistrationStatus.REGISTERED_PENDING_ACCREDITATION);
            existing.setPasswordHash("hash");
            externalUserRepository.save(existing);

            ExternalCompanyRegistrationRequest request = new ExternalCompanyRegistrationRequest();
            request.setEmail("duplicate.company@test.com");
            request.setCompanyName("ACME Spa");
            request.setVatNumber("IT12345678901");
            request.setPassword("Password123!");
            request.setAcceptPrivacy(true);
            request.setAcceptTerms(true);

            mockMvc.perform(post("/api/registration/external/company")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.code").value("EMAIL_ALREADY_REGISTERED"));
        }
    }

    @Nested
    @DisplayName("Validazione input e gestione errori")
    class ValidationAndErrorHandling {

        @Test
        @DisplayName("Registrazione fallisce con 400 se email non valida")
        void registration_invalidEmail_shouldReturn400() throws Exception {
            ExternalProfessionalRegistrationRequest request = new ExternalProfessionalRegistrationRequest();
            request.setEmail("invalid-email");
            request.setFirstName("Mario");
            request.setLastName("Rossi");
            request.setPassword("Password123!");
            request.setAcceptPrivacy(true);
            request.setAcceptTerms(true);

            mockMvc.perform(post("/api/registration/external/professional")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        }

        @Test
        @DisplayName("Registrazione fallisce con 400 se password troppo debole")
        void registration_weakPassword_shouldReturn400() throws Exception {
            ExternalProfessionalRegistrationRequest request = new ExternalProfessionalRegistrationRequest();
            request.setEmail("weak.pass@test.com");
            request.setFirstName("Mario");
            request.setLastName("Rossi");
            request.setPassword("123");
            request.setAcceptPrivacy(true);
            request.setAcceptTerms(true);

            mockMvc.perform(post("/api/registration/external/professional")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        }

        @Test
        @DisplayName("Registrazione fallisce con 400 se privacy o ToS non accettati")
        void registration_missingPrivacyOrTos_shouldReturn400() throws Exception {
            ExternalProfessionalRegistrationRequest request = new ExternalProfessionalRegistrationRequest();
            request.setEmail("no.privacy@test.com");
            request.setFirstName("Mario");
            request.setLastName("Rossi");
            request.setPassword("Password123!");
            request.setAcceptPrivacy(false);
            request.setAcceptTerms(true);

            mockMvc.perform(post("/api/registration/external/professional")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
        }

        @Test
        @DisplayName("Gestione errore 500 restituisce struttura errore standard")
        void registration_unexpectedError_shouldReturn500() throws Exception {
            ExternalProfessionalRegistrationRequest request = new ExternalProfessionalRegistrationRequest();
            request.setEmail("trigger.500@test.com");
            request.setFirstName("Mario");
            request.setLastName("Rossi");
            request.setPassword("Password123!");
            request.setAcceptPrivacy(true);
            request.setAcceptTerms(true);

            mockMvc.perform(post("/api/registration/external/professional?forceError=true")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isInternalServerError())
                    .andExpect(jsonPath("$.code").value("INTERNAL_ERROR"));
        }
    }

    @Test
    @DisplayName("Endpoint di supporto test consente di verificare persistenza e hash password")
    void testSupportEndpoint_shouldExposeUserMetadata() throws Exception {
        ExternalProfessionalRegistrationRequest request = new ExternalProfessionalRegistrationRequest();
        request.setEmail("support.endpoint@test.com");
        request.setFirstName("Mario");
        request.setLastName("Rossi");
        request.setPassword("Password123!");
        request.setAcceptPrivacy(true);
        request.setAcceptTerms(true);

        mockMvc.perform(post("/api/registration/external/professional")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/test/registration/user/by-email/support.endpoint@test.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("support.endpoint@test.com"))
                .andExpect(jsonPath("$.status").value("REGISTERED_PENDING_ACCREDITATION"))
                .andExpect(jsonPath("$.passwordNotBlank").value(true))
                .andExpect(jsonPath("$.passwordLooksHashed").value(true));
    }
}
