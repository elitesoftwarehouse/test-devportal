package com.elite.portal.modules.auth.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private final int maxAttempts;
    private final long blockSeconds;

    private static class AttemptInfo {
        private int attempts;
        private Instant lastAttempt;
        private Instant blockedUntil;
    }

    private final Map<String, AttemptInfo> attemptsByKey = new ConcurrentHashMap<>();

    public LoginAttemptService(@Value("${security.login.max-attempts:5}") int maxAttempts,
                               @Value("${security.login.block-seconds:900}") long blockSeconds) {
        this.maxAttempts = maxAttempts;
        this.blockSeconds = blockSeconds;
    }

    public boolean isBlocked(String identifier, String ip) {
        String key = buildKey(identifier, ip);
        AttemptInfo info = attemptsByKey.get(key);
        if (info == null || info.blockedUntil == null) {
            return false;
        }
        if (Instant.now().isAfter(info.blockedUntil)) {
            attemptsByKey.remove(key);
            return false;
        }
        return true;
    }

    public void onLoginFailure(String identifier, String ip) {
        String key = buildKey(identifier, ip);
        AttemptInfo info = attemptsByKey.computeIfAbsent(key, k -> new AttemptInfo());
        info.attempts++;
        info.lastAttempt = Instant.now();
        if (info.attempts >= maxAttempts) {
            info.blockedUntil = Instant.now().plusSeconds(blockSeconds);
        }
    }

    public void onLoginSuccess(String identifier, String ip) {
        String key = buildKey(identifier, ip);
        attemptsByKey.remove(key);
    }

    private String buildKey(String identifier, String ip) {
        return identifier + "|" + ip;
    }
}
