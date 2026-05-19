package com.edutech.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PendingRegistrationService {

    private static final int EXPIRY_MINUTES = 10;

    private final Map<String, PendingUser> pendingUsers = new ConcurrentHashMap<>();

    public void storePending(String email, String username, String encodedPassword, String role) {
        pendingUsers.put(email, new PendingUser(username, encodedPassword, email, role,
                LocalDateTime.now().plusMinutes(EXPIRY_MINUTES)));
    }

    public PendingUser getPending(String email) {
        PendingUser pu = pendingUsers.get(email);
        if (pu == null) return null;
        if (LocalDateTime.now().isAfter(pu.expiry)) {
            pendingUsers.remove(email);
            return null;
        }
        return pu;
    }

    public void removePending(String email) {
        pendingUsers.remove(email);
    }

    public static class PendingUser {
        public final String username;
        public final String encodedPassword;
        public final String email;
        public final String role;
        public final LocalDateTime expiry;

        public PendingUser(String username, String encodedPassword, String email, String role, LocalDateTime expiry) {
            this.username = username;
            this.encodedPassword = encodedPassword;
            this.email = email;
            this.role = role;
            this.expiry = expiry;
        }
    }
}
