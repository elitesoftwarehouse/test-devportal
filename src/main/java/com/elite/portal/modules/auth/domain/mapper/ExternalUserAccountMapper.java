package com.elite.portal.modules.auth.domain.mapper;

import com.elite.portal.modules.auth.application.dto.ExternalRegistrationResponseDto;
import com.elite.portal.modules.auth.domain.ExternalUserAccount;
import org.springframework.stereotype.Component;

@Component
public class ExternalUserAccountMapper {

    public ExternalRegistrationResponseDto toExternalRegistrationResponse(ExternalUserAccount account,
                                                                          boolean canRequestAccreditation) {
        ExternalRegistrationResponseDto dto = new ExternalRegistrationResponseDto();
        dto.setId(account.getId());
        dto.setType(account.getType().name());
        dto.setStatus(account.getStatus().name());
        dto.setEmail(account.getEmail());
        dto.setCanRequestAccreditation(canRequestAccreditation);
        dto.setEmailConfirmationRequired(account.getEmailConfirmationToken() != null);
        return dto;
    }
}
