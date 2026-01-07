package com.elite.portal.core.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.io.File;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

/**
 * Verifica che il pom.xml contenga le dipendenze richieste con gli scope corretti:
 * - spring-boot-starter-oauth2-client (runtime)
 * - thymeleaf-extras-springsecurity5 (runtime)
 * - spring-security-test (test)
 */
public class PomDependenciesTest {

    private static class Dep {
        final String groupId;
        final String artifactId;
        final String scope;
        Dep(String g, String a, String s) { this.groupId = g; this.artifactId = a; this.scope = s; }
    }

    private Dep findDependency(Element root, String groupId, String artifactId) {
        NodeList depsNodes = root.getElementsByTagName("dependencies");
        if (depsNodes.getLength() == 0) {
            return null;
        }
        Element deps = (Element) depsNodes.item(0);
        NodeList dependencyList = deps.getElementsByTagName("dependency");
        for (int i = 0; i < dependencyList.getLength(); i++) {
            Node n = dependencyList.item(i);
            if (n.getNodeType() != Node.ELEMENT_NODE) {
                continue;
            }
            Element d = (Element) n;
            String g = textContentOfFirst(d, "groupId");
            String a = textContentOfFirst(d, "artifactId");
            if (groupId.equals(g) && artifactId.equals(a)) {
                String s = textContentOfFirst(d, "scope");
                return new Dep(g, a, s);
            }
        }
        return null;
    }

    private String textContentOfFirst(Element parent, String tag) {
        NodeList nodes = parent.getElementsByTagName(tag);
        if (nodes.getLength() == 0) {
            return null;
        }
        Node n = nodes.item(0);
        return n != null ? n.getTextContent() : null;
    }

    @Test
    @DisplayName("pom.xml contiene le dipendenze OAuth2 Client e Thymeleaf Security con scope runtime e spring-security-test con scope test")
    void pomContainsExpectedDependenciesWithScopes() throws Exception {
        File pom = new File("pom.xml");
        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        dbf.setNamespaceAware(false);
        dbf.setExpandEntityReferences(false);
        dbf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        DocumentBuilder db = dbf.newDocumentBuilder();
        Document doc = db.parse(pom);
        Element root = doc.getDocumentElement();

        Dep oauth2 = findDependency(root, "org.springframework.boot", "spring-boot-starter-oauth2-client");
        assertNotNull(oauth2, "Dipendenza spring-boot-starter-oauth2-client non trovata nel pom.xml");
        assertEquals("runtime", oauth2.scope, "Scope atteso per spring-boot-starter-oauth2-client: runtime");

        Dep thymeleafSec = findDependency(root, "org.thymeleaf.extras", "thymeleaf-extras-springsecurity5");
        assertNotNull(thymeleafSec, "Dipendenza thymeleaf-extras-springsecurity5 non trovata nel pom.xml");
        assertEquals("runtime", thymeleafSec.scope, "Scope atteso per thymeleaf-extras-springsecurity5: runtime");

        Dep secTest = findDependency(root, "org.springframework.security", "spring-security-test");
        assertNotNull(secTest, "Dipendenza spring-security-test non trovata nel pom.xml");
        assertEquals("test", secTest.scope, "Scope atteso per spring-security-test: test");
    }
}
