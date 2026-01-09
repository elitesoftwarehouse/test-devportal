package com.elite.portal.modules.accreditation.controller;

import com.elite.portal.modules.accreditation.dto.AccreditationRequestDetailDto;
import com.elite.portal.modules.accreditation.dto.AccreditationRequestListItemDto;
import com.elite.portal.modules.accreditation.service.AccreditationRequestService;
import com.elite.portal.shared.dto.PageResponseDto;
import com.elite.portal.shared.dto.ResponseEnvelope;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;

import java.time.OffsetDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;

public class AccreditationRequestControllerTest {

    private AccreditationRequestService accreditationRequestService;
    private AccreditationRequestController controller;

    @BeforeEach
    public void setUp() {
        accreditationRequestService = Mockito.mock(AccreditationRequestService.class);
        controller = new AccreditationRequestController(accreditationRequestService);
    }

    @Test
    public void testListReturnsPageEnvelope() {
        AccreditationRequestListItemDto item = new AccreditationRequestListItemDto(1L, "user@example.com", "User Test", "PENDING", "EXTERNAL_USER", OffsetDateTime.now());
        Page<AccreditationRequestListItemDto> page = new PageImpl<>(List.of(item), PageRequest.of(0, 20), 1);

        Mockito.when(accreditationRequestService.findByStatus(eq("PENDING"), any(), eq(10L))).thenReturn(page);

        ResponseEntity<ResponseEnvelope<PageResponseDto<AccreditationRequestListItemDto>>> response = controller.list("PENDING", PageRequest.of(0, 20), 10L);

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().getData());
        assertEquals(1, response.getBody().getData().getTotalElements());
    }

    @Test
    public void testDetailReturnsEnvelope() {
        AccreditationRequestDetailDto dto = new AccreditationRequestDetailDto();
        dto.setId(5L);
        dto.setStatus("PENDING");

        Mockito.when(accreditationRequestService.getDetail(5L, 20L)).thenReturn(dto);

        ResponseEntity<ResponseEnvelope<AccreditationRequestDetailDto>> response = controller.detail(5L, 20L);

        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals(5L, response.getBody().getData().getId());
    }
}
