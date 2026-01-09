package com.elite.portal.modules.accreditation.controller;

import com.elite.portal.modules.accreditation.dto.AccreditationRequestApproveRequestDto;
import com.elite.portal.modules.accreditation.dto.AccreditationRequestDetailDto;
import com.elite.portal.modules.accreditation.dto.AccreditationRequestListItemDto;
import com.elite.portal.modules.accreditation.dto.AccreditationRequestRejectRequestDto;
import com.elite.portal.modules.accreditation.service.AccreditationRequestService;
import com.elite.portal.shared.auth.CurrentUser;
import com.elite.portal.shared.auth.RoleConstant;
import com.elite.portal.shared.dto.PageResponseDto;
import com.elite.portal.shared.dto.ResponseEnvelope;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/accreditation-requests")
@Validated
public class AccreditationRequestController {

    private final AccreditationRequestService accreditationRequestService;

    public AccreditationRequestController(AccreditationRequestService accreditationRequestService) {
        this.accreditationRequestService = accreditationRequestService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('" + RoleConstant.SYS_ADMIN + "','" + RoleConstant.IT_OPERATOR + "')")
    public ResponseEntity<ResponseEnvelope<PageResponseDto<AccreditationRequestListItemDto>>> list(
            @RequestParam(name = "status", required = false) String status,
            Pageable pageable,
            @CurrentUser Long currentUserId) {
        Page<AccreditationRequestListItemDto> page = accreditationRequestService.findByStatus(status, pageable, currentUserId);
        PageResponseDto<AccreditationRequestListItemDto> pageResponseDto = PageResponseDto.from(page);
        return ResponseEntity.ok(ResponseEnvelope.ok(pageResponseDto));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('" + RoleConstant.SYS_ADMIN + "','" + RoleConstant.IT_OPERATOR + "')")
    public ResponseEntity<ResponseEnvelope<AccreditationRequestDetailDto>> detail(
            @PathVariable("id") Long id,
            @CurrentUser Long currentUserId) {
        AccreditationRequestDetailDto dto = accreditationRequestService.getDetail(id, currentUserId);
        return ResponseEntity.ok(ResponseEnvelope.ok(dto));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('" + RoleConstant.SYS_ADMIN + "','" + RoleConstant.IT_OPERATOR + "')")
    public ResponseEntity<ResponseEnvelope<AccreditationRequestDetailDto>> approve(
            @PathVariable("id") Long id,
            @Valid @RequestBody(required = false) AccreditationRequestApproveRequestDto approveRequestDto,
            @CurrentUser Long currentUserId) {
        AccreditationRequestDetailDto dto = accreditationRequestService.approve(id, approveRequestDto, currentUserId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseEnvelope.ok(dto));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('" + RoleConstant.SYS_ADMIN + "','" + RoleConstant.IT_OPERATOR + "')")
    public ResponseEntity<ResponseEnvelope<AccreditationRequestDetailDto>> reject(
            @PathVariable("id") Long id,
            @Valid @RequestBody AccreditationRequestRejectRequestDto rejectRequestDto,
            @CurrentUser Long currentUserId) {
        AccreditationRequestDetailDto dto = accreditationRequestService.reject(id, rejectRequestDto, currentUserId);
        return ResponseEntity.status(HttpStatus.OK).body(ResponseEnvelope.ok(dto));
    }
}
