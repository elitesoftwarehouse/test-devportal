package com.elite.portal.shared.logging;

public interface AppLogger {

    void info(String message, Object... context);

    void warn(String message, Object... context);

    void error(String message, Throwable throwable, Object... context);

    void debug(String message, Object... context);

}
