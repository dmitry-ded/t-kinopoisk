package org.example.tkinopoisk.service;

import org.example.tkinopoisk.model.ErrorLog;
import org.example.tkinopoisk.model.ErrorSource;
import org.example.tkinopoisk.repository.ErrorLogRepository;
import org.example.tkinopoisk.repository.UserRepository;
import org.example.tkinopoisk.security.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.io.PrintWriter;
import java.io.StringWriter;

@Service
public class ErrorLogService {

    private static final Logger log = LoggerFactory.getLogger(ErrorLogService.class);

    static final int MESSAGE_MAX_LENGTH = 1000;
    static final int STACK_TRACE_MAX_LENGTH = 4000;
    static final int ENDPOINT_MAX_LENGTH = 500;

    private final ErrorLogRepository errorLogRepository;
    private final UserRepository userRepository;

    public ErrorLogService(ErrorLogRepository errorLogRepository, UserRepository userRepository) {
        this.errorLogRepository = errorLogRepository;
        this.userRepository = userRepository;
    }

    public void logBackend(
            String message,
            Throwable throwable,
            String endpoint,
            String httpMethod,
            int httpStatus,
            Long userId) {
        String stackTrace = throwable != null ? stackTraceOf(throwable) : null;
        persist(
                ErrorSource.BACKEND,
                message,
                stackTrace,
                endpoint,
                httpMethod,
                httpStatus,
                userId);
    }

    public void logFrontend(String message, String stackTrace, String pageUrl, Long userId) {
        persist(
                ErrorSource.FRONTEND,
                message,
                stackTrace,
                pageUrl,
                "POST",
                null,
                userId);
    }

    private void persist(
            ErrorSource source,
            String message,
            String stackTrace,
            String endpoint,
            String httpMethod,
            Integer httpStatus,
            Long userId) {
        try {
            ErrorLog entry = new ErrorLog();
            entry.setSource(source);
            entry.setMessage(truncate(message, MESSAGE_MAX_LENGTH, "Unknown error"));
            entry.setStackTrace(truncateNullable(stackTrace, STACK_TRACE_MAX_LENGTH));
            entry.setEndpoint(truncateNullable(endpoint, ENDPOINT_MAX_LENGTH));
            entry.setHttpMethod(truncateNullable(httpMethod, 16));
            entry.setHttpStatus(httpStatus);
            if (userId != null) {
                userRepository.findById(userId).ifPresent(entry::setUser);
            }
            errorLogRepository.save(entry);
        } catch (Exception e) {
            log.warn("Failed to persist error log: {}", e.getMessage());
        }
    }

    public Long resolveCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl principal)) {
            return null;
        }
        return principal.getUserId();
    }

    static String stackTraceOf(Throwable throwable) {
        StringWriter writer = new StringWriter();
        throwable.printStackTrace(new PrintWriter(writer));
        return truncate(writer.toString(), STACK_TRACE_MAX_LENGTH, null);
    }

    static String truncate(String value, int maxLength, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        String trimmed = value.trim();
        if (trimmed.length() <= maxLength) {
            return trimmed;
        }
        return trimmed.substring(0, maxLength);
    }

    static String truncateNullable(String value, int maxLength) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return truncate(value, maxLength, null);
    }
}
