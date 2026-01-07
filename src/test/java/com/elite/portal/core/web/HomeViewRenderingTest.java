package com.elite.portal.core.web;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.thymeleaf.extras.springsecurity5.dialect.SpringSecurityDialect;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

class HomeViewRenderingTest {

    private static TemplateEngine engine;

    @BeforeAll
    static void setupEngine() {
        ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
        resolver.setPrefix("templates/");
        resolver.setSuffix(".html");
        resolver.setTemplateMode(TemplateMode.HTML);
        resolver.setCharacterEncoding("UTF-8");
        resolver.setCacheable(false);

        engine = new TemplateEngine();
        engine.setTemplateResolver(resolver);
        engine.addDialect(new SpringSecurityDialect());
    }

    @AfterEach
    void clearSecurity() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void homeTemplate_shouldRenderGreeting_andHeaderWithUser_whenAuthenticated() {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                "mrossi",
                "password",
                java.util.Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        Map<String, Object> variables = new HashMap<>();
        variables.put("displayName", ""); // forza il fallback sul nome autenticazione

        Context ctx = new Context(Locale.ITALY, variables);
        String html = engine.process("home/index", ctx);

        assertTrue(html.contains("Benvenuto, mrossi!"), "La home deve mostrare il saluto con il nome utente in fallback");
        assertTrue(html.contains("Ciao,"), "L'header deve contenere il testo 'Ciao,' quando autenticato");
        assertTrue(html.contains("mrossi"), "L'header deve mostrare il nome utente autenticato");
    }
}
