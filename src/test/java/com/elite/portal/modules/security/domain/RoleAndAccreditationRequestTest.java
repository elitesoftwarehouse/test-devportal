package com.elite.portal.modules.security.domain;

import static org.assertj.core.api.Assertions.assertThat;

import com.elite.portal.modules.user.domain.User;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;

/**
 * Test di base su entity di sicurezza per verificare mapping e valori di default.
 */
public class RoleAndAccreditationRequestTest {

    @Test
    void createRole_ShouldInitializeTimestamps() {
        Role role = new Role(RoleCode.SYS_ADMIN, "Amministratore di sistema");

        assertThat(role.getCode()).isEqualTo(RoleCode.SYS_ADMIN);
        assertThat(role.getDescription()).isEqualTo("Amministratore di sistema");
        assertThat(role.getCreatedAt()).isNotNull();
        assertThat(role.getUpdatedAt()).isNotNull();
        assertThat(role.getDeletedAt()).isNull();
    }

    @Test
    void createAccreditationRequest_ShouldBePendingByDefault() {
        User requester = new User();
        requester.setId(1L);

        AccreditationRequest request = new AccreditationRequest(requester, AccreditationRequestType.NEW_ACCESS);

        assertThat(request.getRequester()).isEqualTo(requester);
        assertThat(request.getRequestType()).isEqualTo(AccreditationRequestType.NEW_ACCESS);
        assertThat(request.getStatus()).isEqualTo(AccreditationRequestStatus.PENDING);
        assertThat(request.getCreatedAt()).isNotNull();
        assertThat(request.getDecidedAt()).isNull();
    }

    @Test
    void softDeleteFields_ShouldBeMutable() {
        Role role = new Role(RoleCode.IT_OPERATOR, "Operatore IT");
        LocalDateTime now = LocalDateTime.now();
        role.setDeletedAt(now);

        assertThat(role.getDeletedAt()).isEqualTo(now);
    }
}
