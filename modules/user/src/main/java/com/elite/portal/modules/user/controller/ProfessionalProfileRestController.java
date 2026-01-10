package com.elite.portal.modules.user.controller;

import com.elite.portal.modules.user.dto.ProfessionalProfileDto;
import com.elite.portal.modules.user.service.ProfessionalProfileService;
import javax.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/professional-profile")
public class ProfessionalProfileRestController {

    private final ProfessionalProfileService professionalProfileService;

    public ProfessionalProfileRestController(ProfessionalProfileService professionalProfileService) {
        this.professionalProfileService = professionalProfileService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ProfessionalProfileDto> getProfileByUser(@PathVariable("userId") Long userId) {
        ProfessionalProfileDto dto = professionalProfileService.getByUserId(userId);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<ProfessionalProfileDto> upsertProfileForUser(
            @PathVariable("userId") Long userId,
            @RequestBody ProfessionalProfileDto request) {
        ProfessionalProfileDto saved = professionalProfileService.upsertForUser(userId, request);
        return ResponseEntity.ok(saved);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<String> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}
