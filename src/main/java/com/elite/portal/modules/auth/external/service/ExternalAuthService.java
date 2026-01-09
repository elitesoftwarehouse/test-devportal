package com.elite.portal.modules.auth.external.service;

import com.elite.portal.modules.auth.external.dto.ExternalLoginRequestDto;
import com.elite.portal.modules.auth.external.dto.ExternalLoginResponseDto;
import com.elite.portal.modules.user.domain.User;
import com.elite.portal.modules.user.enums.UserRole;
import com.elite.portal.modules.user.repository.UserRepository;
import com.elite.portal.modules.auth.security.JwtTokenProvider;
import com.elite.portal.modules.auth.security.LoginAttemptService;
import com.elite.portal.modules.auth.service.PasswordHashingService;
import com.elite.portal.modules.common.exception.BusinessException;
import com.elite.portal.modules.common.exception.ErrorCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class ExternalAuthService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ExternalAuthService.class);

    private final UserRepository userRepository;
    private final PasswordHashingService passwordHashingService;
    private final JwtTokenProvider jwtTokenProvider;
    private final LoginAttemptService loginAttemptService;

    public ExternalAuthService(UserRepository userRepository,
                               PasswordHashingService passwordHashingService,
                               JwtTokenProvider jwtTokenProvider,
                               LoginAttemptService loginAttemptService) {
        this.userRepository = userRepository;
        this.passwordHashingService = passwordHashingService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.loginAttemptService = loginAttemptService;
    }

    @Transactional(readOnly = true)
    public ExternalLoginResponseDto login(ExternalLoginRequestDto requestDto, String clientIp) {
        String identifier = requestDto.getUsernameOrEmail();

        if (loginAttemptService.isBlocked(identifier, clientIp)) {
            LOGGER.warn("Tentativi di login superati per identifier={} ip={}", identifier, clientIp);
            throw new BusinessException(ErrorCode.LOGIN_ATTEMPTS_EXCEEDED);
        }

        Optional<User> userOpt = userRepository.findByUsernameOrEmail(identifier, identifier);

        if (userOpt.isEmpty()) {
            loginAttemptService.onLoginFailure(identifier, clientIp);
            LOGGER.info("Login esterno fallito: utente non trovato identifier={} ip={}", identifier, clientIp);
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }

        User user = userOpt.get();

        if (!UserRole.EXTERNAL.equals(user.getRole())) {
            loginAttemptService.onLoginFailure(identifier, clientIp);
            LOGGER.info("Login esterno fallito: utente non esterno userId={} ip={}", user.getId(), clientIp);
            throw new BusinessException(ErrorCode.USER_NOT_EXTERNAL);
        }

        if (!user.isEnabled() || user.isBanned()) {
            loginAttemptService.onLoginFailure(identifier, clientIp);
            LOGGER.info("Login esterno fallito: utente disabilitato o bannato userId={} ip={}", user.getId(), clientIp);
            throw new BusinessException(ErrorCode.USER_DISABLED);
        }

        boolean validPassword = passwordHashingService.matches(requestDto.getPassword(), user.getPasswordHash());
        if (!validPassword) {
            loginAttemptService.onLoginFailure(identifier, clientIp);
            LOGGER.info("Login esterno fallito: password errata userId={} ip={}", user.getId(), clientIp);
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }

        loginAttemptService.onLoginSuccess(identifier, clientIp);

        String token = jwtTokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole().name());
        long expiresIn = jwtTokenProvider.getAccessTokenValiditySeconds();

        LOGGER.info("Login esterno riuscito userId={} ip={}", user.getId(), clientIp);

        return new ExternalLoginResponseDto(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name(),
                token,
                expiresIn
        );
    }
}
