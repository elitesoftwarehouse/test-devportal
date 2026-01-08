package com.elite.portal.modules.auth.registration;

import com.elite.portal.modules.auth.registration.dto.ExternalUserRegistrationRequest;
import com.elite.portal.modules.auth.registration.dto.ExternalUserType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import javax.validation.ConstraintViolation;
import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Test di validazione bean per la richiesta di registrazione utente esterno.
 * Verifica i vincoli sui campi: email, password, dati obbligatori,
 * tipo utente e dati aziendali per referente aziendale.
 */
public class UserRegistrationValidationTest {

    private final ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
    private final Validator validator = factory.getValidator();

    private ExternalUserRegistrationRequest createBaseProfessionalRequest() {
        ExternalUserRegistrationRequest request = new ExternalUserRegistrationRequest();
        request.setEmail("user.professional@example.com");
        request.setPassword("Password123!");
        request.setFirstName("Mario");
        request.setLastName("Rossi");
        request.setUserType(ExternalUserType.PROFESSIONAL);
        return request;
    }

    private ExternalUserRegistrationRequest createBaseCompanyContactRequest() {
        ExternalUserRegistrationRequest request = new ExternalUserRegistrationRequest();
        request.setEmail("referente.azienda@example.com");
        request.setPassword("Password123!");
        request.setFirstName("Luigi");
        request.setLastName("Bianchi");
        request.setUserType(ExternalUserType.COMPANY_CONTACT);
        request.setCompanyName("Azienda Test S.p.A.");
        request.setCompanyVatNumber("IT12345678901");
        return request;
    }

    @Nested
    @DisplayName("Validazione generica campi obbligatori")
    class GenericFieldValidation {

        @Test
        @DisplayName("Richiesta valida per professionista non ha violazioni")
        void validProfessionalRequest_hasNoViolations() {
            ExternalUserRegistrationRequest request = createBaseProfessionalRequest();

            Set<ConstraintViolation<ExternalUserRegistrationRequest>> violations = validator.validate(request);

            assertThat(violations).isEmpty();
        }

        @Test
        @DisplayName("Richiesta valida per referente aziendale non ha violazioni")
        void validCompanyContactRequest_hasNoViolations() {
            ExternalUserRegistrationRequest request = createBaseCompanyContactRequest();

            Set<ConstraintViolation<ExternalUserRegistrationRequest>> violations = validator.validate(request);

            assertThat(violations).isEmpty();
        }

        @Test
        @DisplayName("Email mancante genera violazione")
        void missingEmail_generatesViolation() {
            ExternalUserRegistrationRequest request = createBaseProfessionalRequest();
            request.setEmail(null);

            Set<ConstraintViolation<ExternalUserRegistrationRequest>> violations = validator.validate(request);

            assertThat(violations)
                .anyMatch(v -> "email".equals(v.getPropertyPath().toString()));
        }

        @Test
        @DisplayName("Email non valida genera violazione")
        void invalidEmail_generatesViolation() {
            ExternalUserRegistrationRequest request = createBaseProfessionalRequest();
            request.setEmail("not-an-email");

            Set<ConstraintViolation<ExternalUserRegistrationRequest>> violations = validator.validate(request);

            assertThat(violations)
                .anyMatch(v -> "email".equals(v.getPropertyPath().toString()));
        }

        @Test
        @DisplayName("Password mancante genera violazione")
        void missingPassword_generatesViolation() {
            ExternalUserRegistrationRequest request = createBaseProfessionalRequest();
            request.setPassword(null);

            Set<ConstraintViolation<ExternalUserRegistrationRequest>> violations = validator.validate(request);

            assertThat(violations)
                .anyMatch(v -> "password".equals(v.getPropertyPath().toString()));
        }

        @Test
        @DisplayName("Password troppo corta genera violazione")
        void shortPassword_generatesViolation() {
            ExternalUserRegistrationRequest request = createBaseProfessionalRequest();
            request.setPassword("Abc12!");

            Set<ConstraintViolation<ExternalUserRegistrationRequest>> violations = validator.validate(request);

            assertThat(violations)
                .anyMatch(v -> "password".equals(v.getPropertyPath().toString()));
        }

        @Test
        @DisplayName("Nome e cognome sono obbligatori")
        void firstNameAndLastNameAreRequired() {
            ExternalUserRegistrationRequest request = createBaseProfessionalRequest();
            request.setFirstName(null);
            request.setLastName(null);

            Set<ConstraintViolation<ExternalUserRegistrationRequest>> violations = validator.validate(request);

            assertThat(violations)
                .anyMatch(v -> "firstName".equals(v.getPropertyPath().toString()));
            assertThat(violations)
                .anyMatch(v -> "lastName".equals(v.getPropertyPath().toString()));
        }

        @Test
        @DisplayName("Tipo utente è obbligatorio")
        void userTypeIsRequired() {
            ExternalUserRegistrationRequest request = createBaseProfessionalRequest();
            request.setUserType(null);

            Set<ConstraintViolation<ExternalUserRegistrationRequest>> violations = validator.validate(request);

            assertThat(violations)
                .anyMatch(v -> "userType".equals(v.getPropertyPath().toString()));
        }
    }

    @Nested
    @DisplayName("Validazione specifica referente aziendale")
    class CompanyContactValidation {

        @Test
        @DisplayName("Dati aziendali obbligatori per referente aziendale")
        void companyFieldsRequiredForCompanyContact() {
            ExternalUserRegistrationRequest request = createBaseCompanyContactRequest();
            request.setCompanyName(null);
            request.setCompanyVatNumber(null);

            Set<ConstraintViolation<ExternalUserRegistrationRequest>> violations = validator.validate(request);

            assertThat(violations)
                .anyMatch(v -> "companyName".equals(v.getPropertyPath().toString()));
            assertThat(violations)
                .anyMatch(v -> "companyVatNumber".equals(v.getPropertyPath().toString()));
        }

        @Test
        @DisplayName("Dati aziendali non richiesti per professionista")
        void companyFieldsNotRequiredForProfessional() {
            ExternalUserRegistrationRequest request = createBaseProfessionalRequest();
            request.setCompanyName(null);
            request.setCompanyVatNumber(null);

            Set<ConstraintViolation<ExternalUserRegistrationRequest>> violations = validator.validate(request);

            assertThat(violations).isEmpty();
        }
    }
}
