package com.eliteportal.resources.api;

import com.eliteportal.resources.dto.ResourceDetailsDto;
import com.eliteportal.resources.service.ResourceDetailsService;
import com.eliteportal.security.CurrentUser;
import com.eliteportal.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/resources")
public class ResourceDetailsController {

    private final ResourceDetailsService resourceDetailsService;

    public ResourceDetailsController(ResourceDetailsService resourceDetailsService) {
        this.resourceDetailsService = resourceDetailsService;
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<ResourceDetailsDto> getResourceDetails(@PathVariable("id") Long id,
                                                                 @CurrentUser UserPrincipal currentUser) {
        try {
            ResourceDetailsDto dto = resourceDetailsService.getResourceDetails(id, currentUser);
            return ResponseEntity.ok(dto);
        } catch (AccessDeniedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
}
