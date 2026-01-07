package com.elite.portal.modules.home.controller;

import java.lang.reflect.Method;
import java.util.Map;
import java.util.Objects;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUserInfo;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controller MVC per la Home del portale.
 * Espone la rotta "/" e popola l'attributo di modello "displayName" con il nome visualizzato dell'utente autenticato.
 */
@Controller
@RequestMapping("/")
public class HomeController {

    /**
     * Gestisce la richiesta GET alla home ("/").
     * Popola il model con l'attributo "displayName" determinato dal principal autenticato.
     *
     * @param model     il model MVC
     * @param principal il principal autenticato estratto da Spring Security (OIDC o OAuth2), può essere null
     * @return il nome della view da renderizzare ("home/index")
     */
    @GetMapping
    public String index(Model model, @AuthenticationPrincipal(expression = "principal") Object principal) {
        String displayName = resolveDisplayName(principal);
        model.addAttribute("displayName", displayName);
        return "home/index";
    }

    private String resolveDisplayName(Object principal) {
        if (principal == null) {
            return "";
        }

        if (principal instanceof OidcUser) {
            OidcUser oidcUser = (OidcUser) principal;

            // 1) Tentativo tramite metodo getFullName() se disponibile sul principal
            String fullName = invokeNoArgStringMethodIfExists(oidcUser, "getFullName");
            if (isNotBlank(fullName)) {
                return fullName;
            }

            // 2) Tentativo su OidcUserInfo (se presente), incluse varianti fullName/name
            OidcUserInfo userInfo = oidcUser.getUserInfo();
            if (userInfo != null) {
                String uiFullName = invokeNoArgStringMethodIfExists(userInfo, "getFullName");
                if (isNotBlank(uiFullName)) {
                    return uiFullName;
                }
                String uiName = safeToString(userInfo.getName());
                if (isNotBlank(uiName)) {
                    return uiName;
                }
            }

            // 3) Dal claims map: name -> email -> preferred_username
            Map<String, Object> claims = oidcUser.getClaims();
            String byClaims = firstNonBlank(
                claims != null ? claims.get("name") : null,
                claims != null ? claims.get("email") : null,
                claims != null ? claims.get("preferred_username") : null
            );
            if (isNotBlank(byClaims)) {
                return byClaims;
            }

            // 4) Fallback finale sull'identificativo
            String fallback = safeToString(oidcUser.getName());
            return fallback;
        }

        if (principal instanceof OAuth2User) {
            OAuth2User oauth2User = (OAuth2User) principal;
            Map<String, Object> attributes = oauth2User.getAttributes();

            // name -> preferred_username -> email
            String byAttrs = firstNonBlank(
                attributes != null ? attributes.get("name") : null,
                attributes != null ? attributes.get("preferred_username") : null,
                attributes != null ? attributes.get("email") : null
            );
            if (isNotBlank(byAttrs)) {
                return byAttrs;
            }

            // Fallback su getName()
            return safeToString(oauth2User.getName());
        }

        // Se non riconosciuto, restituisce stringa vuota
        return "";
    }

    private String firstNonBlank(Object... values) {
        if (values == null) {
            return "";
        }
        for (Object v : values) {
            String s = safeToString(v);
            if (isNotBlank(s)) {
                return s;
            }
        }
        return "";
    }

    private boolean isNotBlank(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private String safeToString(Object value) {
        return value == null ? "" : Objects.toString(value, "").trim();
    }

    private String invokeNoArgStringMethodIfExists(Object target, String methodName) {
        if (target == null || methodName == null) {
            return "";
        }
        try {
            Method m = target.getClass().getMethod(methodName);
            if (m.getReturnType() == String.class) {
                Object result = m.invoke(target);
                return result != null ? result.toString().trim() : "";
            }
        } catch (NoSuchMethodException ex) {
            // Metodo non presente: ignora
        } catch (Exception ex) {
            // Qualsiasi altro errore riflessivo: ignora in sicurezza
        }
        return "";
    }
}
