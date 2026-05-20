package org.example.tkinopoisk.controller;

import org.example.tkinopoisk.service.ErrorLogService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/errors")
public class ErrorLogController {

    private final ErrorLogService errorLogService;

    public ErrorLogController(ErrorLogService errorLogService) {
        this.errorLogService = errorLogService;
    }

    public record ClientErrorRequest(String message, String stackTrace, String pageUrl) {}

    @PostMapping("/client")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logClientError(@RequestBody ClientErrorRequest request) {
        String message = request.message() == null ? "" : request.message().trim();
        if (message.isEmpty()) {
            message = "Client error";
        }

        Long userId = errorLogService.resolveCurrentUserId();
        errorLogService.logFrontend(
                message,
                request.stackTrace(),
                request.pageUrl(),
                userId);
    }
}
