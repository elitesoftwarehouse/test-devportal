package com.elite.portal.modules.user.entity;

import java.time.Instant;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import com.elite.portal.core.entity.ExternalAccreditationStatus;
import com.elite.portal.core.entity.SubjectType;

/**
 * Test di base per verificare il modello dati dell'entità ExternalUser.
 */
public class ExternalUserTest {

    @Test
    public void testNewProfessionalFactorySetsDefaultValues() {
        String email = "test@example.com";
        String passwordHash = "hashed";
        String firstName = "Mario";
        String lastName = "Rossi";
        String codiceFiscale = "MRARSS80A01H501U";
        String partitaIva = "IT12345678901";

        ExternalUser user = ExternalUser.newProfessional(email, passwordHash, firstName, lastName, codiceFiscale, partitaIva, true, true);

        Assertions.assertNull(user.getId(), "L'ID non deve essere valorizzato prima del persist");
        Assertions.assertEquals(email, user.getEmail());
        Assertions.assertEquals(passwordHash, user.getPasswordHash());
        Assertions.assertEquals(SubjectType.EXTERNAL_PROFESSIONAL, user.getSubjectType());
        Assertions.assertEquals(firstName, user.getFirstName());
        Assertions.assertEquals(lastName, user.getLastName());
        Assertions.assertEquals(codiceFiscale, user.getCodiceFiscale());
        Assertions.assertEquals(partitaIva, user.getPartitaIva());
        Assertions.assertTrue(user.isPrivacyConsented());
        Assertions.assertTrue(user.isTosConsented());
        Assertions.assertEquals(ExternalAccreditationStatus.REGISTERED_PENDING_ACCREDITATION, user.getAccreditationStatus());
        Assertions.assertNotNull(user.getCreatedAt());
        Assertions.assertNotNull(user.getUpdatedAt());
        Assertions.assertTrue(user.getCreatedAt().isBefore(Instant.now().plusSeconds(5)));
    }

}
