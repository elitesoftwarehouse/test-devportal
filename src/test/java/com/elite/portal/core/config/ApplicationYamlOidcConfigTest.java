package com.elite.portal.core.config;

import java.util.Properties;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.config.YamlPropertiesFactoryBean;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

/**
 * Test di validazione per la configurazione OIDC in application.yml.
 * Verifica la presenza delle chiavi richieste e il formato dei valori attesi
 * senza eseguire chiamate esterne al provider OIDC.
 */
public class ApplicationYamlOidcConfigTest {

    private Properties loadYaml() {
        Resource resource = new ClassPathResource("application.yml");
        YamlPropertiesFactoryBean yamlFactory = new YamlPropertiesFactoryBean();
        yamlFactory.setResources(resource);
        yamlFactory.afterPropertiesSet();
        Properties props = yamlFactory.getObject();
        return props == null ? new Properties() : props;
    }

    /**
     * Verifica che le proprietà OIDC principali siano presenti e valorizzate con placeholder di ambiente.
     */
    @Test
    public void testOidcPropertiesPresent() {
        Properties props = loadYaml();

        // server.port con default
        Assertions.assertEquals("${SERVER_PORT:8080}", props.getProperty("server.port"), "server.port deve usare placeholder con default 8080");

        // Registrazione client OIDC
        Assertions.assertEquals("${OIDC_CLIENT_ID}", props.getProperty("spring.security.oauth2.client.registration.company.client-id"), "client-id deve usare il placeholder OIDC_CLIENT_ID");
        Assertions.assertEquals("${OIDC_CLIENT_SECRET}", props.getProperty("spring.security.oauth2.client.registration.company.client-secret"), "client-secret deve usare il placeholder OIDC_CLIENT_SECRET");

        // Scope multipli
        Assertions.assertEquals("openid", props.getProperty("spring.security.oauth2.client.registration.company.scope[0]"));
        Assertions.assertEquals("profile", props.getProperty("spring.security.oauth2.client.registration.company.scope[1]"));
        Assertions.assertEquals("email", props.getProperty("spring.security.oauth2.client.registration.company.scope[2]"));

        // Grant type
        Assertions.assertEquals("authorization_code", props.getProperty("spring.security.oauth2.client.registration.company.authorization-grant-type"));

        // Provider con issuer-uri
        Assertions.assertEquals("${OIDC_ISSUER_URI}", props.getProperty("spring.security.oauth2.client.provider.company.issuer-uri"), "issuer-uri deve usare il placeholder OIDC_ISSUER_URI");
    }

    /**
     * Verifica che la redirect-uri sia configurata con il template standard {baseUrl}/login/oauth2/code/{registrationId}.
     */
    @Test
    public void testRedirectUriTemplate() {
        Properties props = loadYaml();
        String redirect = props.getProperty("spring.security.oauth2.client.registration.company.redirect-uri");
        Assertions.assertNotNull(redirect, "redirect-uri non deve essere null");
        Assertions.assertEquals("{baseUrl}/login/oauth2/code/{registrationId}", redirect, "redirect-uri deve rispettare il template standard");
    }
}
