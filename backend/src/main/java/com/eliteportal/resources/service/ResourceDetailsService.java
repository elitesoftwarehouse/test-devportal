package com.eliteportal.resources.service;

import com.eliteportal.resources.dto.CompanySummaryDto;
import com.eliteportal.resources.dto.ResourceCvDto;
import com.eliteportal.resources.dto.ResourceDetailsDto;
import com.eliteportal.resources.dto.SkillProfileDto;
import com.eliteportal.resources.entity.Company;
import com.eliteportal.resources.entity.Resource;
import com.eliteportal.resources.entity.ResourceCv;
import com.eliteportal.resources.entity.ResourceSkill;
import com.eliteportal.resources.repository.ResourceCvRepository;
import com.eliteportal.resources.repository.ResourceRepository;
import com.eliteportal.resources.repository.ResourceSkillRepository;
import com.eliteportal.security.UserPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class ResourceDetailsService {

    private final ResourceRepository resourceRepository;
    private final ResourceSkillRepository resourceSkillRepository;
    private final ResourceCvRepository resourceCvRepository;

    public ResourceDetailsService(ResourceRepository resourceRepository,
                                  ResourceSkillRepository resourceSkillRepository,
                                  ResourceCvRepository resourceCvRepository) {
        this.resourceRepository = resourceRepository;
        this.resourceSkillRepository = resourceSkillRepository;
        this.resourceCvRepository = resourceCvRepository;
    }

    @Transactional(readOnly = true)
    public ResourceDetailsDto getResourceDetails(Long resourceId, UserPrincipal currentUser) {
        validateAccess(currentUser);

        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new IllegalArgumentException("Risorsa non trovata"));

        List<ResourceSkill> skills = resourceSkillRepository.findByResourceId(resourceId);
        List<ResourceCv> cvs = resourceCvRepository.findByResourceId(resourceId);

        ResourceDetailsDto dto = new ResourceDetailsDto();
        dto.setId(resource.getId());
        dto.setNome(resource.getFirstName());
        dto.setCognome(resource.getLastName());
        dto.setRuolo(resource.getRole());
        dto.setSeniority(resource.getSeniority());
        dto.setStato(resource.getStatus());

        Company company = resource.getCompany();
        if (company != null) {
            CompanySummaryDto companyDto = new CompanySummaryDto();
            companyDto.setId(company.getId());
            companyDto.setRagioneSociale(company.getName());
            dto.setAzienda(companyDto);
        }

        List<SkillProfileDto> skillTecniche = skills.stream()
                .filter(s -> Objects.equals(s.getType(), "TECHNICAL"))
                .map(this::mapSkill)
                .collect(Collectors.toList());

        List<SkillProfileDto> softSkill = skills.stream()
                .filter(s -> Objects.equals(s.getType(), "SOFT"))
                .map(this::mapSkill)
                .collect(Collectors.toList());

        dto.setSkillTecniche(skillTecniche);
        dto.setSoftSkill(softSkill);

        List<ResourceCvDto> cvDtos = cvs.stream()
                .map(this::mapCv)
                .collect(Collectors.toList());

        dto.setCvs(cvDtos);

        return dto;
    }

    private void validateAccess(UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new AccessDeniedException("Utente non autenticato");
        }
        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()) || "ROLE_AMMINISTRATORE".equals(a.getAuthority()));
        if (!isAdmin) {
            throw new AccessDeniedException("Permesso negato");
        }
    }

    private SkillProfileDto mapSkill(ResourceSkill skill) {
        SkillProfileDto dto = new SkillProfileDto();
        dto.setId(skill.getId());
        dto.setNome(skill.getName());
        dto.setCategoria(skill.getCategory());
        dto.setLivello(skill.getLevel());
        dto.setAnniEsperienza(skill.getYearsOfExperience());
        return dto;
    }

    private ResourceCvDto mapCv(ResourceCv cv) {
        ResourceCvDto dto = new ResourceCvDto();
        dto.setId(cv.getId());
        dto.setTitolo(cv.getTitle());
        dto.setNomeFile(cv.getFileName());
        dto.setLingua(cv.getLanguage());
        dto.setDataCreazione(cv.getCreatedAt());
        dto.setDataAggiornamento(cv.getUpdatedAt());
        dto.setContentType(cv.getContentType());
        dto.setDimensione(cv.getSizeBytes());
        dto.setPrincipale(Boolean.TRUE.equals(cv.getMainFlag()));
        String downloadId = cv.getFileStorageId() != null ? cv.getFileStorageId() : String.valueOf(cv.getId());
        dto.setDownloadId(downloadId);
        dto.setDownloadUrl("/api/resources/" + cv.getResource().getId() + "/cvs/" + downloadId + "/download");
        return dto;
    }
}
