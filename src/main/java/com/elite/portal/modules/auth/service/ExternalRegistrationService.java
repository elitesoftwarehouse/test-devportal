package com.elite.portal.modules.auth.service;

import com.elite.portal.modules.auth.dto.ExternalCompanyPayload;
import com.elite.portal.modules.auth.dto.ExternalUserRegistrationRequest;
import com.elite.portal.modules.auth.dto.ExternalUserRegistrationResponse;
import com.elite.portal.modules.auth.model.EmailVerificationToken;
import com.elite.portal.modules.auth.model.ExternalUserType;
import com.elite.portal.modules.auth.model.User;
import com.elite.portal.modules.auth.repository.EmailVerificationTokenRepository;
import com.elite.portal.modules.auth.repository.UserRepository;
import com.elite.portal.modules.company.model.Company;
import com.elite.portal.modules.company.repository.CompanyRepository;
import com.elite.portal.shared.config.SecurityPasswordPolicyProperties;
import com.elite.portal.shared.exception.BusinessException;
import com.elite.portal.shared.logging.AppLogger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

/**
 * Service per la registrazione di utenti esterni con:
 * - Validazione email univoca
 * - Validazione password policy
 * - Generazione token verifica email
 * - Gestione aziende (nuove o esistenti)
 */
@Service
public class ExternalRegistrationService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityPasswordPolicyProperties passwordPolicyProperties;
    private final AppLogger logger;

    private final long emailVerificationTokenValidityHours;

    public ExternalRegistrationService(UserRepository userRepository,
                                       CompanyRepository companyRepository,
                                       EmailVerificationTokenRepository emailVerificationTokenRepository,
                                       PasswordEncoder passwordEncoder,
                                       SecurityPasswordPolicyProperties passwordPolicyProperties,
                                       AppLogger logger,
                                       @Value("${auth.email-verification.token-validity-hours:24}") long emailVerificationTokenValidityHours) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordPolicyProperties = passwordPolicyProperties;
        this.logger = logger;
        this.emailVerificationTokenValidityHours = emailVerificationTokenValidityHours;
    }

    /**
     * Registra un nuovo utente esterno.
     * 
     * @param request dati di registrazione
     * @return response con userId e messaggio di conferma
     * @throws BusinessException in caso di validazione fallita
     */
    @Transactional
    public ExternalUserRegistrationResponse registerExternalUser(ExternalUserRegistrationRequest request) {
        validateEmailNotInUse(request.getEmail());
        validatePasswordPolicy(request.getPassword());

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setActive(true);
        user.setEmailVerified(false);
        user.setExternal(true);

        if (request.getUserType() == ExternalUserType.REFERENTE_AZIENDALE) {
            Company company = handleCompanyPayload(request.getCompany());
            user.setCompany(company);
        }

        user = userRepository.save(user);

        EmailVerificationToken token = createVerificationToken(user);
        emailVerificationTokenRepository.save(token);

        logger.info("[ExternalRegistrationService] Registrazione utente esterno completata, userId={}, email={}",
                user.getId(), user.getEmail());

        // L'invio dell'email di verifica viene delegato a un componente già esistente

        String message = "Registrazione completata con successo. Ti abbiamo inviato un'email per la verifica dell'indirizzo.";
        return new ExternalUserRegistrationResponse(user.getId(), message);
    }

    private void validateEmailNotInUse(String email) {
        Optional<User> existing = userRepository.findByEmailIgnoreCase(email);
        if (existing.isPresent() && existing.get().isActive()) {
            logger.warn("[ExternalRegistrationService] Email già registrata come utente attivo, email={}", email);
            throw new BusinessException("EMAIL_ALREADY_REGISTERED", "L'indirizzo email è già registrato.");
        }
    }

    private void validatePasswordPolicy(String rawPassword) {
        if (rawPassword == null) {
            throw new BusinessException("PASSWORD_INVALID", "La password non può essere nulla.");
        }

        if (rawPassword.length() < passwordPolicyProperties.getMinLength()) {
            throw new BusinessException("PASSWORD_TOO_SHORT", "La password non rispetta i requisiti minimi.");
        }

        if (passwordPolicyProperties.isRequireUppercase() && rawPassword.chars().noneMatch(Character::isUpperCase)) {
            throw new BusinessException("PASSWORD_POLICY_UPPERCASE", "La password non rispetta i requisiti di complessità.");
        }

        if (passwordPolicyProperties.isRequireLowercase() && rawPassword.chars().noneMatch(Character::isLowerCase)) {
            throw new BusinessException("PASSWORD_POLICY_LOWERCASE", "La password non rispetta i requisiti di complessità.");
        }

        if (passwordPolicyProperties.isRequireDigit() && rawPassword.chars().noneMatch(Character::isDigit)) {
            throw new BusinessException("PASSWORD_POLICY_DIGIT", "La password non rispetta i requisiti di complessità.");
        }

        if (passwordPolicyProperties.isRequireSpecial() && rawPassword.chars().noneMatch(ch -> !Character.isLetterOrDigit(ch))) {
            throw new BusinessException("PASSWORD_POLICY_SPECIAL", "La password non rispetta i requisiti di complessità.");
        }
    }

    private Company handleCompanyPayload(ExternalCompanyPayload companyPayload) {
        if (companyPayload == null) {
            throw new BusinessException("COMPANY_REQUIRED", "I dati aziendali sono obbligatori per il referente aziendale.");
        }

        if (companyPayload.getExistingCompanyId() != null && companyPayload.isCreateNewCompany()) {
            throw new BusinessException("COMPANY_PAYLOAD_CONFLICT", "Specificare solo azienda esistente o nuova, non entrambe.");
        }

        if (companyPayload.getExistingCompanyId() != null) {
            return companyRepository.findById(companyPayload.getExistingCompanyId())
                    .orElseThrow(() -> new BusinessException("COMPANY_NOT_FOUND", "L'azienda selezionata non esiste."));
        }

        if (!companyPayload.isCreateNewCompany()) {
            throw new BusinessException("COMPANY_SELECTION_REQUIRED", "È necessario selezionare un'azienda esistente o crearne una nuova.");
        }

        Company company = new Company();
        company.setName(companyPayload.getCompanyName());
        company.setVatNumber(companyPayload.getVatNumber());
        company.setTaxCode(companyPayload.getTaxCode());
        company.setAddress(companyPayload.getAddress());

        return companyRepository.save(company);
    }

    private EmailVerificationToken createVerificationToken(User user) {
        EmailVerificationToken token = new EmailVerificationToken();
        token.setUser(user);
        token.setToken(generateSecureToken());
        token.setExpiresAt(LocalDateTime.now().plusHours(emailVerificationTokenValidityHours));
        token.setConsumed(false);
        return token;
    }

    private String generateSecureToken() {
        byte[] randomBytes = new byte[32];
        new SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
}
