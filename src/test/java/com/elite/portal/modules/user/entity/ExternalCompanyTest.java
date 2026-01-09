package com.elite.portal.modules.user.entity;

import java.time.Instant;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import com.elite.portal.core.entity.ExternalAccreditationStatus;
import com.elite.portal.core.entity.SubjectType;

/**
 * Test di base per verificare il modello dati dell'entità ExternalCompany.
 */
public class ExternalCompanyTest {

    @Test
    public void testNewCompanyFactorySetsDefaultValues() {
        String ragioneSociale = "ACME S.p.A.";
        String partitaIva = "IT12345678901";
        String referenceEmail = "amministrazione@acme.it";
        String address = "Via Roma 1, 20100 Milano (MI)";

        ExternalCompany company = ExternalCompany.newCompany(ragioneSociale, partitaIva, referenceEmail, address);

        Assertions.assertNull(company.getId(), "L'ID non deve essere valorizzato prima del persist");
        Assertions.assertEquals(ragioneSociale, company.getRagioneSociale());
        Assertions.assertEquals(partitaIva, company.getPartitaIva());
        Assertions.assertEquals(referenceEmail, company.getReferenceEmail());
        Assertions.assertEquals(address, company.getAddress());
        Assertions.assertEquals(SubjectType.EXTERNAL_COMPANY, company.getSubjectType());
        Assertions.assertEquals(ExternalAccreditationStatus.REGISTERED_PENDING_ACCREDITATION, company.getAccreditationStatus());
        Assertions.assertNotNull(company.getCreatedAt());
        Assertions.assertNotNull(company.getUpdatedAt());
        Assertions.assertTrue(company.getCreatedAt().isBefore(Instant.now().plusSeconds(5)));
    }

}
