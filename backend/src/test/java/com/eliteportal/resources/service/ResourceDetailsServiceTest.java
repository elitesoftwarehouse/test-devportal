package com.eliteportal.resources.service;

import com.eliteportal.resources.dto.ResourceDetailsDto;
import com.eliteportal.resources.entity.Company;
import com.eliteportal.resources.entity.Resource;
import com.eliteportal.resources.entity.ResourceCv;
import com.eliteportal.resources.entity.ResourceSkill;
import com.eliteportal.resources.repository.ResourceCvRepository;
import com.eliteportal.resources.repository.ResourceRepository;
import com.eliteportal.resources.repository.ResourceSkillRepository;
import com.eliteportal.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

public class ResourceDetailsServiceTest {

    private ResourceRepository resourceRepository;
    private ResourceSkillRepository resourceSkillRepository;
    private ResourceCvRepository resourceCvRepository;
    private ResourceDetailsService service;

    @BeforeEach
    public void setUp() {
        resourceRepository = Mockito.mock(ResourceRepository.class);
        resourceSkillRepository = Mockito.mock(ResourceSkillRepository.class);
        resourceCvRepository = Mockito.mock(ResourceCvRepository.class);
        service = new ResourceDetailsService(resourceRepository, resourceSkillRepository, resourceCvRepository);
    }

    @Test
    public void testGetResourceDetailsAsAdmin() {
        Resource resource = new Resource();
        resource.setId(1L);
        resource.setFirstName("Mario");
        resource.setLastName("Rossi");
        resource.setRole("Developer");
        resource.setSeniority("Senior");
        resource.setStatus("ATTIVO");
        Company company = new Company();
        company.setId(10L);
        company.setName("Elite Srl");
        resource.setCompany(company);

        when(resourceRepository.findById(1L)).thenReturn(Optional.of(resource));

        ResourceSkill skill = new ResourceSkill();
        skill.setId(100L);
        skill.setResource(resource);
        skill.setName("Java");
        skill.setCategory("Backend");
        skill.setType("TECHNICAL");
        skill.setLevel("Expert");
        skill.setYearsOfExperience(5);

        when(resourceSkillRepository.findByResourceId(1L)).thenReturn(Collections.singletonList(skill));

        ResourceCv cv = new ResourceCv();
        cv.setId(200L);
        cv.setResource(resource);
        cv.setTitle("CV IT");
        cv.setFileName("mario_rossi_cv.pdf");
        cv.setLanguage("IT");
        cv.setCreatedAt(OffsetDateTime.now());
        cv.setUpdatedAt(OffsetDateTime.now());
        cv.setContentType("application/pdf");
        cv.setSizeBytes(10240L);
        cv.setMainFlag(true);
        cv.setFileStorageId("file-123");

        when(resourceCvRepository.findByResourceId(1L)).thenReturn(Collections.singletonList(cv));

        UserPrincipal admin = new UserPrincipal(99L, "admin", "pwd",
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));

        ResourceDetailsDto dto = service.getResourceDetails(1L, admin);

        assertNotNull(dto);
        assertEquals(1L, dto.getId());
        assertEquals("Mario", dto.getNome());
        assertEquals("Rossi", dto.getCognome());
        assertEquals("Developer", dto.getRuolo());
        assertEquals("Senior", dto.getSeniority());
        assertEquals("ATTIVO", dto.getStato());
        assertNotNull(dto.getAzienda());
        assertEquals(1, dto.getSkillTecniche().size());
        assertEquals(1, dto.getCvs().size());
        assertEquals("file-123", dto.getCvs().get(0).getDownloadId());
        assertTrue(dto.getCvs().get(0).getDownloadUrl().contains("/api/resources/1/cvs/file-123/download"));
    }

    @Test
    public void testGetResourceDetailsAccessDenied() {
        UserPrincipal user = new UserPrincipal(2L, "user", "pwd",
                List.of(new SimpleGrantedAuthority("ROLE_USER")));
        assertThrows(AccessDeniedException.class, () -> service.getResourceDetails(1L, user));
    }
}
