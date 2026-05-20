package org.example.tkinopoisk.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ErrorLogServiceTest {

    @Test
    void truncate_shortensLongMessage() {
        String longText = "a".repeat(1500);
        String result = ErrorLogService.truncate(longText, 1000, "fallback");
        assertEquals(1000, result.length());
    }

    @Test
    void truncateNullable_returnsNullForBlank() {
        assertNull(ErrorLogService.truncateNullable("   ", 100));
    }

    @Test
    void stackTraceOf_respectsMaxLength() {
        Exception ex = new Exception("boom");
        String stack = ErrorLogService.stackTraceOf(ex);
        assertTrue(stack.contains("boom"));
        assertTrue(stack.length() <= ErrorLogService.STACK_TRACE_MAX_LENGTH);
    }
}
