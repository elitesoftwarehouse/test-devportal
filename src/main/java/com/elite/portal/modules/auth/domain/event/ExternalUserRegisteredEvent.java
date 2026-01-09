package com.elite.portal.modules.auth.domain.event;

import com.elite.portal.modules.auth.domain.ExternalUserType;
import org.springframework.context.ApplicationEvent;

import java.util.Locale;
import java.util.UUID;

public class ExternalUserRegisteredEvent extends ApplicationEvent {

    private final UUID accountId;
    private final String email;
    private final ExternalUserType type;
    private final String confirmationToken;
    private final Locale locale;

    public ExternalUserRegisteredEvent(Object source,
                                       UUID accountId,
                                       String email,
                                       ExternalUserType type,
                                       String confirmationToken,
                                       Locale locale) {
        super(source);
        this.accountId = accountId;
        this.email = email;
        this.type = type;
        this.confirmationToken = confirmationToken;
        this.locale = locale;
    }

    public UUID getAccountId() {
        return accountId;
    }

    public String getEmail() {
        return email;
    }

    public ExternalUserType getType() {
        return type;
    }

    public String getConfirmationToken() {
        return confirmationToken;
    }

    public Locale getLocale() {
        return locale;
    }
}
