package com.elite.portal.modules.registration.ui;

import java.util.List;

import org.junit.Assert;
import org.junit.Test;

/**
 * Test di base sulla checklist di test UI per la registrazione esterni.
 * Verifica che le liste di scenari non siano vuote e che contengano
 * alcuni elementi chiave previsti dalla user story.
 */
public class ExternalRegistrationUiTestChecklistProviderTest {

    @Test
    public void testDesktopTargetBrowsersNotEmpty() {
        List<String> browsers = ExternalRegistrationUiTestChecklistProvider.getDesktopTargetBrowsers();
        Assert.assertNotNull(browsers);
        Assert.assertFalse(browsers.isEmpty());
        Assert.assertTrue(browsers.stream().anyMatch(s -> s.toLowerCase().contains("chrome")));
    }

    @Test
    public void testMobileTargetBrowsersNotEmpty() {
        List<String> browsers = ExternalRegistrationUiTestChecklistProvider.getMobileTargetBrowsers();
        Assert.assertNotNull(browsers);
        Assert.assertFalse(browsers.isEmpty());
    }

    @Test
    public void testProfessionalRegistrationScenariosContainAccreditationReference() {
        List<String> scenarios = ExternalRegistrationUiTestChecklistProvider.getProfessionalRegistrationScenarios();
        Assert.assertNotNull(scenarios);
        Assert.assertFalse(scenarios.isEmpty());
        Assert.assertTrue(
            scenarios.stream().anyMatch(
                s -> s.toLowerCase().contains("accreditamento")
            )
        );
    }

    @Test
    public void testCompanyRegistrationScenariosContainAccreditationReference() {
        List<String> scenarios = ExternalRegistrationUiTestChecklistProvider.getCompanyRegistrationScenarios();
        Assert.assertNotNull(scenarios);
        Assert.assertFalse(scenarios.isEmpty());
        Assert.assertTrue(
            scenarios.stream().anyMatch(
                s -> s.toLowerCase().contains("accreditamento")
            )
        );
    }

    @Test
    public void testClientSideErrorScenariosMentionPasswordMismatch() {
        List<String> scenarios = ExternalRegistrationUiTestChecklistProvider.getClientSideErrorScenarios();
        Assert.assertNotNull(scenarios);
        Assert.assertFalse(scenarios.isEmpty());
        Assert.assertTrue(
            scenarios.stream().anyMatch(
                s -> s.toLowerCase().contains("password e conferma password non coincidenti")
            )
        );
    }

    @Test
    public void testServerSideErrorScenariosMentionEmailAlreadyUsed() {
        List<String> scenarios = ExternalRegistrationUiTestChecklistProvider.getServerSideErrorScenarios();
        Assert.assertNotNull(scenarios);
        Assert.assertFalse(scenarios.isEmpty());
        Assert.assertTrue(
            scenarios.stream().anyMatch(
                s -> s.toLowerCase().contains("email già utilizzata")
            )
        );
    }

    @Test
    public void testUsabilityScenariosContainResponsiveLayout() {
        List<String> scenarios = ExternalRegistrationUiTestChecklistProvider.getUsabilityScenarios();
        Assert.assertNotNull(scenarios);
        Assert.assertFalse(scenarios.isEmpty());
        Assert.assertTrue(
            scenarios.stream().anyMatch(
                s -> s.toLowerCase().contains("responsive")
            )
        );
    }
}
