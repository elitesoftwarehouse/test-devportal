package com.elite.portal.modules.user.web;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.elite.portal.modules.user.security.ExternalUserDetails;

/**
 * Controller REST per l'autenticazione (es. POST /api/auth/login).
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;

    public AuthController(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    /**
     * Effettua il login API. Consente l'accesso solo ad utenti in stato abilitato
     * (per esterni: ACTIVE). Restituisce i ruoli per consentire al frontend di
     * applicare le regole di visibilita'.
     *
     * @param request payload con username e password
     * @return risposta con informazioni essenziali sull'utente autenticato
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

            Object principal = authentication.getPrincipal();
            ExternalUserDetails userDetails = (ExternalUserDetails) principal;

            LoginResponse response = new LoginResponse();
            response.setUsername(userDetails.getUsername());
            response.setExternal(userDetails.getDomainUser().isExternal());
            response.setRoles(authentication.getAuthorities().stream()
                    .map(authority -> authority.getAuthority())
                    .toArray(String[]::new));
            response.setStatus("OK");

            return ResponseEntity.ok(response);
        } catch (DisabledException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(LoginResponse.error("ACCOUNT_DISABLED", "Account non attivo. Contattare il supporto."));
        } catch (LockedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(LoginResponse.error("ACCOUNT_BLOCKED", "Account bloccato. Contattare il supporto."));
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(LoginResponse.error("BAD_CREDENTIALS", "Credenziali non valide."));
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(LoginResponse.error("AUTH_ERROR", "Errore di autenticazione."));
        }
    }

    /**
     * DTO per la richiesta di login.
     */
    public static class LoginRequest {

        private String username;
        private String password;

        public LoginRequest() {
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    /**
     * DTO per la risposta di login.
     */
    public static class LoginResponse {

        private String status;
        private String code;
        private String message;
        private String username;
        private boolean external;
        private String[] roles;

        public LoginResponse() {
        }

        public static LoginResponse error(String code, String message) {
            LoginResponse response = new LoginResponse();
            response.setStatus("ERROR");
            response.setCode(code);
            response.setMessage(message);
            return response;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public boolean isExternal() {
            return external;
        }

        public void setExternal(boolean external) {
            this.external = external;
        }

        public String[] getRoles() {
            return roles;
        }

        public void setRoles(String[] roles) {
            this.roles = roles;
        }
    }
}
