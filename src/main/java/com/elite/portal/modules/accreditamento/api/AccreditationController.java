package com.elite.portal.modules.accreditamento.api;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.elite.portal.modules.accreditamento.api.dto.ApproveRequestDto;
import com.elite.portal.modules.accreditamento.api.dto.RejectRequestDto;
import com.elite.portal.modules.accreditamento.api.dto.RequestAccrDto;
import com.elite.portal.modules.accreditamento.model.AccreditationStatus;
import com.elite.portal.modules.accreditamento.model.RequestAccr;
import com.elite.portal.modules.accreditamento.service.AccreditationService;

@RestController
@RequestMapping("/api/accreditamento/requests")
public class AccreditationController {

    private final AccreditationService accreditationService;

    public AccreditationController(AccreditationService accreditationService) {
        this.accreditationService = accreditationService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SYS_ADMIN','IT_OPERATOR')")
    public ResponseEntity<List<RequestAccrDto>> list(@RequestParam(name = "status", required = false) AccreditationStatus status) {
        List<RequestAccr> entities = accreditationService.findByStatus(status);
        List<RequestAccrDto> dtos = entities.stream()
            .map(this::toDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYS_ADMIN','IT_OPERATOR')")
    public ResponseEntity<RequestAccrDto> detail(@PathVariable("id") Long id) {
        return accreditationService.findById(id)
            .map(e -> ResponseEntity.ok(toDto(e)))
            .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('SYS_ADMIN','IT_OPERATOR')")
    public ResponseEntity<RequestAccrDto> approve(@PathVariable("id") Long id,
                                                  @RequestBody ApproveRequestDto body) {
        try {
            RequestAccr entity = accreditationService.approveRequest(id, body.getApproverId());
            return ResponseEntity.ok(toDto(entity));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('SYS_ADMIN','IT_OPERATOR')")
    public ResponseEntity<RequestAccrDto> reject(@PathVariable("id") Long id,
                                                 @RequestBody RejectRequestDto body) {
        try {
            RequestAccr entity = accreditationService.rejectRequest(id, body.getApproverId(), body.getNote());
            return ResponseEntity.ok(toDto(entity));
        } catch (IllegalArgumentException e) {
            String message = e.getMessage();
            if (message != null && message.startsWith("RequestAccr not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    private RequestAccrDto toDto(RequestAccr entity) {
        RequestAccrDto dto = new RequestAccrDto();
        dto.setId(entity.getId());
        dto.setExternalEmail(entity.getExternalEmail());
        dto.setStatus(entity.getStatus());
        dto.setCreationDate(entity.getCreationDate());
        dto.setDecisionDate(entity.getDecisionDate());
        dto.setApproverId(entity.getApproverId());
        dto.setRejectNote(entity.getRejectNote());
        dto.setExternalUserId(entity.getExternalUserId());
        return dto;
    }
}
