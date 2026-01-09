package com.elite.portal.modules.auth.application;

import com.elite.portal.modules.auth.application.dto.ExternalRegistrationRequestDto;
import com.elite.portal.modules.auth.application.dto.ExternalRegistrationResponseDto;
import com.elite.portal.modules.auth.domain.ExternalUserAccount;
import com.elite.portal.modules.auth.domain.ExternalUserAccountRepository;
import com.elite.portal.modules.auth.domain.ExternalUserType;
import com.elite.portal.modules.auth.domain.UserAccountStatus;
import com.elite.portal.modules.auth.domain.event.ExternalUserRegisteredEvent;
import com.elite.portal.modules.auth.domain.exception.EmailAlreadyInUseException;
import com.elite.portal.modules.auth.domain.exception.InvalidPasswordPolicyException;
import com.elite.portal.modules.auth.domain.mapper.ExternalUserAccountMapper;
import com.elite.portal.modules.auth.domain.policy.PasswordPolicyValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
public class ExternalRegistrationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ExternalRegistrationService.class);

    private final ExternalUserAccountRepository externalUserAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordPolicyValidator passwordPolicyValidator;
    private final ExternalUserAccountMapper externalUserAccountMapper;
    private final ApplicationEventPublisher eventPublisher;

    public ExternalRegistrationService(ExternalUserAccountRepository externalUserAccountRepository,
                                       PasswordEncoder passwordEncoder,
                                       PasswordPolicyValidator passwordPolicyValidator,
                                       ExternalUserAccountMapper externalUserAccountMapper,
                                       ApplicationEventPublisher eventPublisher) {
        this.externalUserAccountRepository = externalUserAccountRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordPolicyValidator = passwordPolicyValidator;
        this.externalUserAccountMapper = externalUserAccountMapper;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public ExternalRegistrationResponseDto registerExternalUser(ExternalRegistrationRequestDto requestDto, Locale locale) {
        validateEmailUniqueness(requestDto.getEmail());
        validatePassword(requestDto.getPassword(), locale);

        ExternalUserType type = ExternalUserType.fromCode(requestDto.getType());

        String encodedPassword = passwordEncoder.encode(requestDto.getPassword());

        ExternalUserAccount account = buildAccountEntity(requestDto, type, encodedPassword);

        ExternalUserAccount saved = externalUserAccountRepository.save(account);

        publishRegistrationEvent(saved, locale);

        return externalUserAccountMapper.toExternalRegistrationResponse(saved, true);
    }

    private void validateEmailUniqueness(String email) {
        Optional<ExternalUserAccount> existing = externalUserAccountRepository.findByEmailIgnoreCase(email);
        if (existing.isPresent()) {
            throw new EmailAlreadyInUseException(email);
        }
    }

    private void validatePassword(String rawPassword, Locale locale) {
        if (!passwordPolicyValidator.isValid(rawPassword)) {
            throw new InvalidPasswordPolicyException(locale);
        }
    }

    private ExternalUserAccount buildAccountEntity(ExternalRegistrationRequestDto requestDto,
                                                   ExternalUserType type,
                                                   String encodedPassword) {
        ExternalUserAccount account = new ExternalUserAccount();
        account.setId(UUID.randomUUID());
        account.setEmail(requestDto.getEmail().trim().toLowerCase(Locale.ROOT));
        account.setPasswordHash(encodedPassword);
        account.setType(type);
        account.setStatus(UserAccountStatus.REGISTERED_PENDING_ACCREDITATION);
        account.setCreatedAt(OffsetDateTime.now());
        account.setUpdatedAt(OffsetDateTime.now());
        account.setTermsAccepted(requestDto.isTermsAccepted());
        account.setPrivacyAccepted(requestDto.isPrivacyAccepted());
        account.setCompanyName(requestDto.getCompanyName());
        account.setVatNumber(requestDto.getVatNumber());
        account.setFirstName(requestDto.getFirstName());
        account.setLastName(requestDto.getLastName());

        if (requestDto.isEmailConfirmationRequired()) {
            String token = UUID.randomUUID().toString();
            account.setEmailConfirmationToken(token);
            account.setEmailConfirmationTokenCreatedAt(OffsetDateTime.now());
        }

        return account;
    }

    private void publishRegistrationEvent(ExternalUserAccount account, Locale locale) {
        ExternalUserRegisteredEvent event = new ExternalUserRegisteredEvent(
                this,
                account.getId(),
                account.getEmail(),
                account.getType(),
                account.getEmailConfirmationToken(),
                locale
        );
        LOGGER.debug("Publishing ExternalUserRegisteredEvent for account {}", account.getId());
        eventPublisher.publishEvent(event);
    }
}
