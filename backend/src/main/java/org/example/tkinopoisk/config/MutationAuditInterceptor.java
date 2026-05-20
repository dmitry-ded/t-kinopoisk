package org.example.tkinopoisk.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.tkinopoisk.service.ErrorLogService;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class MutationAuditInterceptor implements HandlerInterceptor {

    private final ErrorLogService errorLogService;

    public MutationAuditInterceptor(ErrorLogService errorLogService) {
        this.errorLogService = errorLogService;
    }

    @Override
    public void afterCompletion(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler,
            Exception ex) {
        if (ex != null || !isMutation(request.getMethod())) {
            return;
        }
        String uri = request.getRequestURI();
        if (shouldSkip(uri)) {
            return;
        }

        int status = response.getStatus();
        if (status < 200 || status >= 300) {
            return;
        }

        errorLogService.logSuccess(
                describeAction(request.getMethod(), uri),
                uri,
                request.getMethod(),
                status,
                errorLogService.resolveCurrentUserId());
    }

    private boolean isMutation(String method) {
        return HttpMethod.POST.matches(method)
                || HttpMethod.PUT.matches(method)
                || HttpMethod.PATCH.matches(method)
                || HttpMethod.DELETE.matches(method);
    }

    private boolean shouldSkip(String uri) {
        return uri.startsWith("/api/errors")
                || uri.startsWith("/swagger-ui")
                || uri.startsWith("/v3/api-docs")
                || uri.startsWith("/swagger-resources")
                || uri.startsWith("/webjars");
    }

    private String describeAction(String method, String uri) {
        if (uri.startsWith("/api/auth/register")) {
            return "Регистрация";
        }
        if (uri.startsWith("/api/auth/login")) {
            return "Вход";
        }
        if (uri.startsWith("/api/auth/logout")) {
            return "Выход";
        }
        if ("POST".equals(method) && uri.matches("/api/movie-lists/\\d+/movies")) {
            return "Фильм добавлен в список";
        }
        if ("DELETE".equals(method) && uri.matches("/api/movie-lists/\\d+/movies/\\d+")) {
            return "Фильм удалён из списка";
        }
        if ("POST".equals(method) && "/api/movie-lists".equals(uri)) {
            return "Список создан";
        }
        if ("PATCH".equals(method) && uri.matches("/api/movie-lists/\\d+")) {
            return "Список обновлён";
        }
        if ("DELETE".equals(method) && uri.matches("/api/movie-lists/\\d+")) {
            return "Список удалён";
        }
        if ("POST".equals(method) && uri.matches("/api/movies/\\d+/favorite")) {
            return "Добавлено в избранное";
        }
        if ("DELETE".equals(method) && uri.matches("/api/movies/\\d+/favorite")) {
            return "Удалено из избранного";
        }
        if ("PUT".equals(method) && uri.matches("/api/movies/\\d+/rating")) {
            return "Оценка сохранена";
        }
        if ("DELETE".equals(method) && uri.matches("/api/movies/\\d+/rating")) {
            return "Оценка удалена";
        }
        if ("POST".equals(method) && uri.matches("/api/movies/\\d+/comments")) {
            return "Комментарий создан";
        }
        if ("PATCH".equals(method) && uri.matches("/api/movies/\\d+/comments/\\d+")) {
            return "Комментарий изменён";
        }
        if ("DELETE".equals(method) && uri.matches("/api/movies/\\d+/comments/\\d+")) {
            return "Комментарий удалён";
        }
        return method + " " + uri;
    }
}
