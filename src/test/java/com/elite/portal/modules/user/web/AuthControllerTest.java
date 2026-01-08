package com.elite.portal.modules.user.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;

import com.elite.portal.core.entity.UserStatus;
import com.elite.portal.modules.user.entity.ExternalUserType;
import com.elite.portal.modules.user.entity.User;
import com.elite.portal.modules.user.security.ExternalUserDetails;
import com.elite.portal.modules.user.web.AuthController.LoginRequest;
import com.elite.portal.modules.user.web.AuthController.LoginResponse;

/**
 * Test per AuthController.login.
 */
public class AuthControllerTest {

    private AuthenticationManager authenticationManager;
    private AuthController controller;

    @BeforeEach
    public void setup() {
        authenticationManager = Mockito.mock(AuthenticationManager.class);
        controller = new AuthController(authenticationManager);
    }

    @Test
    public void testLoginSuccessExternalUser() {
        User user = new User();
        user.setUsername("ext");
        user.setPasswordHash("pwd");
        user.setExternal(true);
        user.setStatus(UserStatus.ACTIVE);
        user.setExternalType(ExternalUserType.EXTERNAL_COLLABORATOR);
        user.setRoles(Collections.singleton("EXTERNAL_COLLABORATOR"));

        ExternalUserDetails details = new ExternalUserDetails(user);

        Authentication auth = new UsernamePasswordAuthenticationToken(details, "pwd",
                Collections.singleton(new SimpleGrantedAuthority("EXTERNAL_COLLABORATOR")));

        when(authenticationManager.authenticate(any(Authentication.class))).thenReturn(auth);

        LoginRequest request = new LoginRequest();
        request.setUsername("ext");
        request.setPassword("pwd");

        ResponseEntity<LoginResponse> responseEntity = controller.login(request);

        assert responseEntity.getStatusCode() == HttpStatus.OK;
        LoginResponse body = responseEntity.getBody();
        assert body != null;
        assert "OK".equals(body.getStatus());
        assert body.isExternal();
        assert body.getRoles().length == 1;
        assert "EXTERNAL_COLLABORATOR".equals(body.getRoles()[0]);
    }

    @Test
    public void testLoginDisabledAccount() {
        when(authenticationManager.authenticate(any(Authentication.class)))
                .thenThrow(new DisabledException("disabled"));

        LoginRequest request = new LoginRequest();
        request.setUsername("u");
        request.setPassword("p");

        ResponseEntity<LoginResponse> responseEntity = controller.login(request);

        assert responseEntity.getStatusCode() == HttpStatus.FORBIDDEN;
        LoginResponse body = responseEntity.getBody();
        assert body != null;
        assert "ERROR".equals(body.getStatus());
        assert "ACCOUNT_DISABLED".equals(body.getCode());
    }

    @Test
    public void testLoginBlockedAccount() {
        when(authenticationManager.authenticate(any(Authentication.class)))
                .thenThrow(new LockedException("locked"));

        LoginRequest request = new LoginRequest();
        request.setUsername("u");
        request.setPassword("p");

        ResponseEntity<LoginResponse> responseEntity = controller.login(request);

        assert responseEntity.getStatusCode() == HttpStatus.FORBIDDEN;
        LoginResponse body = responseEntity.getBody();
        assert body != null;
        assert "ERROR".equals(body.getStatus());
        assert "ACCOUNT_BLOCKED".equals(body.getCode());
    }

    @Test
    public void testLoginBadCredentials() {
        when(authenticationManager.authenticate(any(Authentication.class)))
                .thenThrow(new BadCredentialsException("bad"));

        LoginRequest request = new LoginRequest();
        request.setUsername("u");
        request.setPassword("p");

        ResponseEntity<LoginResponse> responseEntity = controller.login(request);

        assert responseEntity.getStatusCode() == HttpStatus.UNAUTHORIZED;
        LoginResponse body = responseEntity.getBody();
        assert body != null;
        assert "ERROR".equals(body.getStatus());
        assert "BAD_CREDENTIALS".equals(body.getCode());
    }
}
