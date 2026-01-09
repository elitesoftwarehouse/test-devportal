package com.elite.portal.modules.accreditamento.api;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.elite.portal.modules.accreditamento.model.AccreditationStatus;
import com.elite.portal.modules.accreditamento.model.RequestAccr;
import com.elite.portal.modules.accreditamento.repository.RequestAccrRepository;
import com.elite.portal.modules.security.model.RoleType;
import com.elite.portal.modules.security.model.UserAccount;
import com.elite.portal.modules.security.repository.UserAccountRepository;

@SpringBootTest
@AutoConfigureMockMvc
public class AccreditationControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private RequestAccrRepository requestAccrRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired(required = false)
    private Clock clock;

    @BeforeEach
    public void setup() {
        requestAccrRepository.deleteAll();
        userAccountRepository.deleteAll();
    }

    @Test
    @WithMockUser(username = "admin", roles = {"SYS_ADMIN"})
    public void listRequests_shouldFilterByStatusAndBeAccessibleToSysAdmin() throws Exception {
        RequestAccr pending = new RequestAccr();
        pending.setExternalEmail("a@example.com");
        pending.setStatus(AccreditationStatus.PENDING);
        pending.setCreationDate(now());
        requestAccrRepository.save(pending);

        RequestAccr approved = new RequestAccr();
        approved.setExternalEmail("b@example.com");
        approved.setStatus(AccreditationStatus.APPROVED);
        approved.setCreationDate(now());
        requestAccrRepository.save(approved);

        mockMvc.perform(get("/api/accreditamento/requests")
                .param("status", "PENDING"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].externalEmail", is("a@example.com")))
            .andExpect(jsonPath("$[0].status", is("PENDING")));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"IT_OPERATOR"})
    public void getDetail_shouldReturn404WhenNotFound() throws Exception {
        mockMvc.perform(get("/api/accreditamento/requests/{id}", 999L))
            .andExpect(status().isNotFound());
    }

    @Test
    public void listRequests_shouldReturn401ForUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/accreditamento/requests"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "user", roles = {"EXTERNAL_USER"})
    public void listRequests_shouldReturn403ForUnauthorizedRole() throws Exception {
        mockMvc.perform(get("/api/accreditamento/requests"))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "operator", roles = {"IT_OPERATOR"})
    public void approveEndpoint_shouldExecuteEndToEndFlow() throws Exception {
        RequestAccr pending = new RequestAccr();
        pending.setExternalEmail("new.external@example.com");
        pending.setStatus(AccreditationStatus.PENDING);
        pending.setCreationDate(now());
        pending = requestAccrRepository.save(pending);

        String body = "{\"approverId\": 100}";

        mockMvc.perform(post("/api/accreditamento/requests/{id}/approve", pending.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status", is("APPROVED")))
            .andExpect(jsonPath("$.approverId", is(100)))
            .andExpect(jsonPath("$.decisionDate").exists())
            .andExpect(jsonPath("$.externalUserId").isNumber());

        UserAccount createdUser = userAccountRepository.findByUsername("new.external@example.com").orElseThrow();
        org.junit.jupiter.api.Assertions.assertTrue(createdUser.isEnabled());
        org.junit.jupiter.api.Assertions.assertTrue(createdUser.getRoles().contains(RoleType.EXTERNAL_USER));
    }

    @Test
    @WithMockUser(username = "operator", roles = {"IT_OPERATOR"})
    public void rejectEndpoint_shouldRequireNoteAndSetRejectedStatus() throws Exception {
        RequestAccr pending = new RequestAccr();
        pending.setExternalEmail("reject.external@example.com");
        pending.setStatus(AccreditationStatus.PENDING);
        pending.setCreationDate(now());
        pending = requestAccrRepository.save(pending);

        String body = "{\"approverId\": 101, \"note\": \"Documentazione mancante\"}";

        mockMvc.perform(post("/api/accreditamento/requests/{id}/reject", pending.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status", is("REJECTED")))
            .andExpect(jsonPath("$.rejectNote", is("Documentazione mancante")))
            .andExpect(jsonPath("$.decisionDate").exists());
    }

    @Test
    @WithMockUser(username = "operator", roles = {"IT_OPERATOR"})
    public void rejectEndpoint_shouldReturnBadRequestWhenNoteMissing() throws Exception {
        RequestAccr pending = new RequestAccr();
        pending.setExternalEmail("reject2.external@example.com");
        pending.setStatus(AccreditationStatus.PENDING);
        pending.setCreationDate(now());
        pending = requestAccrRepository.save(pending);

        String body = "{\"approverId\": 101}";

        mockMvc.perform(post("/api/accreditamento/requests/{id}/reject", pending.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "operator", roles = {"IT_OPERATOR"})
    public void approveEndpoint_shouldReturnConflictWhenStatusNotPending() throws Exception {
        RequestAccr approved = new RequestAccr();
        approved.setExternalEmail("already.approved@example.com");
        approved.setStatus(AccreditationStatus.APPROVED);
        approved.setCreationDate(now());
        approved = requestAccrRepository.save(approved);

        String body = "{\"approverId\": 200}";

        mockMvc.perform(post("/api/accreditamento/requests/{id}/approve", approved.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isConflict());
    }

    private java.time.LocalDateTime now() {
        if (clock != null) {
            return java.time.LocalDateTime.ofInstant(clock.instant(), clock.getZone());
        }
        return java.time.LocalDateTime.ofInstant(Clock.fixed(Instant.parse("2024-01-01T00:00:00Z"), ZoneId.of("UTC")).instant(), ZoneId.of("UTC"));
    }
}
