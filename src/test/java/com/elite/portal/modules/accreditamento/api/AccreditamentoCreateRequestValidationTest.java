package com.elite.portal.modules.accreditamento.api;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Set;

import javax.validation.ConstraintViolation;
import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

public class AccreditamentoCreateRequestValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void validRequest_shouldHaveNoViolations() {
        AccreditamentoCreateRequest request = new AccreditamentoCreateRequest(
                "valid@example.com",
                "Mario",
                "Rossi"
        );

        Set<ConstraintViolation<AccreditamentoCreateRequest>> violations = validator.validate(request);

        assertThat(violations).isEmpty();
    }

    @Test
    void missingRequiredFields_shouldReturnViolations() {
        AccreditamentoCreateRequest request = new AccreditamentoCreateRequest();

        Set<ConstraintViolation<AccreditamentoCreateRequest>> violations = validator.validate(request);

        assertThat(violations).hasSize(3);
    }

    @Test
    void invalidEmailFormat_shouldReturnViolation() {
        AccreditamentoCreateRequest request = new AccreditamentoCreateRequest(
                "invalid-email",
                "Mario",
                "Rossi"
        );

        Set<ConstraintViolation<AccreditamentoCreateRequest>> violations = validator.validate(request);

        assertThat(violations).hasSize(1);
        ConstraintViolation<AccreditamentoCreateRequest> violation = violations.iterator().next();
        assertThat(violation.getPropertyPath().toString()).isEqualTo("email");
    }
}
