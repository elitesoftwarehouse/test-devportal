package com.elite.portal.core.repository;

import com.elite.portal.core.entity.Company;
import com.elite.portal.core.entity.CompanyUser;
import com.elite.portal.core.entity.User;
import com.elite.portal.core.entity.UserType;
import java.time.OffsetDateTime;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

/**
 * Test di integrazione per CompanyUserRepository.
 */
@DataJpaTest
public class CompanyUserRepositoryTest {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyUserRepository companyUserRepository;

    @Test
    void shouldLinkUserToCompany() {
        Company company = new Company();
        company.setName("Beta S.r.l.");
        company.setVatNumber("IT98765432109");
        company.setCountry("IT");
        company.setCreatedAt(OffsetDateTime.now());
        company = companyRepository.saveAndFlush(company);

        User user = new User();
        user.setFirstName("Francesco");
        user.setLastName("Neri");
        user.setEmail("francesco.neri@example.com");
        user.setPasswordHash("pass");
        user.setUserType(UserType.EXTERNAL_COMPANY_REP);
        user.setEmailVerified(false);
        user.setAcceptedPrivacy(true);
        user.setAcceptedTos(true);
        user.setCreatedAt(OffsetDateTime.now());
        user = userRepository.saveAndFlush(user);

        CompanyUser companyUser = new CompanyUser();
        companyUser.setCompany(company);
        companyUser.setUser(user);
        companyUser.setPrimaryContact(true);
        companyUser.setCreatedAt(OffsetDateTime.now());
        companyUserRepository.saveAndFlush(companyUser);

        List<CompanyUser> byCompany = companyUserRepository.findByCompanyId(company.getId());
        Assertions.assertFalse(byCompany.isEmpty());
        Assertions.assertEquals(user.getId(), byCompany.get(0).getUser().getId());

        List<CompanyUser> byUser = companyUserRepository.findByUserId(user.getId());
        Assertions.assertFalse(byUser.isEmpty());
        Assertions.assertEquals(company.getId(), byUser.get(0).getCompany().getId());
    }
}
