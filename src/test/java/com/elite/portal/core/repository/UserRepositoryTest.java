package com.elite.portal.core.repository;

import com.elite.portal.core.entity.User;
import com.elite.portal.core.entity.UserType;
import java.time.OffsetDateTime;
import java.util.Optional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

/**
 * Test di integrazione per UserRepository.
 */
@DataJpaTest
public class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldPersistUserWithRequiredFields() {
        User user = new User();
        user.setFirstName("Mario");
        user.setLastName("Rossi");
        user.setEmail("mario.rossi@example.com");
        user.setPasswordHash("hashed-password");
        user.setUserType(UserType.EXTERNAL_PROFESSIONAL);
        user.setEmailVerified(false);
        user.setAcceptedPrivacy(true);
        user.setAcceptedTos(true);
        user.setPreferredLanguage("it");
        user.setCreatedAt(OffsetDateTime.now());

        User saved = userRepository.saveAndFlush(user);

        Assertions.assertNotNull(saved.getId());
        Optional<User> loaded = userRepository.findByEmail("mario.rossi@example.com");
        Assertions.assertTrue(loaded.isPresent());
        Assertions.assertEquals(UserType.EXTERNAL_PROFESSIONAL, loaded.get().getUserType());
        Assertions.assertFalse(loaded.get().isEmailVerified());
    }

    @Test
    void shouldEnforceUniqueEmail() {
        User user1 = new User();
        user1.setFirstName("Mario");
        user1.setLastName("Rossi");
        user1.setEmail("unique@example.com");
        user1.setPasswordHash("pass1");
        user1.setUserType(UserType.EXTERNAL_PROFESSIONAL);
        user1.setEmailVerified(false);
        user1.setAcceptedPrivacy(true);
        user1.setAcceptedTos(true);
        user1.setCreatedAt(OffsetDateTime.now());

        userRepository.saveAndFlush(user1);

        User user2 = new User();
        user2.setFirstName("Luigi");
        user2.setLastName("Verdi");
        user2.setEmail("unique@example.com");
        user2.setPasswordHash("pass2");
        user2.setUserType(UserType.EXTERNAL_COMPANY_REP);
        user2.setEmailVerified(false);
        user2.setAcceptedPrivacy(true);
        user2.setAcceptedTos(true);
        user2.setCreatedAt(OffsetDateTime.now());

        Assertions.assertThrows(DataIntegrityViolationException.class, () -> {
            userRepository.saveAndFlush(user2);
        });
    }

    @Test
    void shouldFindByEmailVerificationToken() {
        User user = new User();
        user.setFirstName("Anna");
        user.setLastName("Bianchi");
        user.setEmail("anna.bianchi@example.com");
        user.setPasswordHash("pass");
        user.setUserType(UserType.EXTERNAL_PROFESSIONAL);
        user.setEmailVerified(false);
        user.setAcceptedPrivacy(true);
        user.setAcceptedTos(true);
        user.setEmailVerificationToken("token-123");
        user.setEmailVerificationTokenExpiry(OffsetDateTime.now().plusDays(1));
        user.setCreatedAt(OffsetDateTime.now());

        userRepository.saveAndFlush(user);

        Optional<User> found = userRepository.findByEmailVerificationToken("token-123");
        Assertions.assertTrue(found.isPresent());
        Assertions.assertEquals("anna.bianchi@example.com", found.get().getEmail());
    }
}
