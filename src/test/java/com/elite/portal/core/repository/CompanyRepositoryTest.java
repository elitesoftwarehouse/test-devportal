package com.elite.portal.core.repository;

import com.elite.portal.core.entity.Company;
import java.time.OffsetDateTime;
import java.util.Optional;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

/**
 * Test di integrazione per CompanyRepository.
 */
@DataJpaTest
public class CompanyRepositoryTest {

    @Autowired
    private CompanyRepository companyRepository;

    @Test
    void shouldPersistAndFindByName() {
        Company company = new Company();
        company.setName("ACME S.p.A.");
        company.setVatNumber("IT12345678901");
        company.setCountry("IT");
        company.setCreatedAt(OffsetDateTime.now());

        companyRepository.saveAndFlush(company);

        Optional<Company> loaded = companyRepository.findByName("ACME S.p.A.");
        Assertions.assertTrue(loaded.isPresent());
        Assertions.assertEquals("IT12345678901", loaded.get().getVatNumber());
    }
}
