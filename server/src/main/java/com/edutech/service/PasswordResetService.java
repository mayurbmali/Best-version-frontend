package com.edutech.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PasswordResetService {

    private static final int TOKEN_EXPIRY_MINUTES = 10;
    private final Map<String, ResetEntry> resetStore = new ConcurrentHashMap<>();

    public String generateResetToken(String email) {
        String token = UUID.randomUUID().toString();
        resetStore.put(email, new ResetEntry(token, LocalDateTime.now().plusMinutes(TOKEN_EXPIRY_MINUTES)));
        return token;
    }

    public boolean verifyResetToken(String email, String token) {
        ResetEntry entry = resetStore.get(email);
        if (entry == null) return false;
        if (LocalDateTime.now().isAfter(entry.expiry)) {
            resetStore.remove(email);
            return false;
        }
        return entry.token.equals(token);
    }

    public void clearResetToken(String email) {
        resetStore.remove(email);
    }

    private static class ResetEntry {
        final String token;
        final LocalDateTime expiry;
        ResetEntry(String token, LocalDateTime expiry) {
            this.token = token;
            this.expiry = expiry;
        }
    }
}
