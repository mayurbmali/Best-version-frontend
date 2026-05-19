package com.edutech.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private static final String CHARS = "0123456789";
    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final SecureRandom random = new SecureRandom();

    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    public String generateOtp(String key) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            sb.append(CHARS.charAt(random.nextInt(CHARS.length())));
        }
        String otp = sb.toString();
        otpStore.put(key, new OtpEntry(otp, LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES)));
        return otp;
    }

    public boolean verifyOtp(String key, String otp) {
        OtpEntry entry = otpStore.get(key);
        if (entry == null) return false;
        if (LocalDateTime.now().isAfter(entry.expiry)) {
            otpStore.remove(key);
            return false;
        }
        if (entry.otp.equals(otp)) {
            otpStore.remove(key);
            return true;
        }
        return false;
    }

    public boolean hasValidOtp(String key) {
        OtpEntry entry = otpStore.get(key);
        if (entry == null) return false;
        if (LocalDateTime.now().isAfter(entry.expiry)) {
            otpStore.remove(key);
            return false;
        }
        return true;
    }

    public void clearOtp(String key) {
        otpStore.remove(key);
    }

    private static class OtpEntry {
        final String otp;
        final LocalDateTime expiry;

        OtpEntry(String otp, LocalDateTime expiry) {
            this.otp = otp;
            this.expiry = expiry;
        }
    }
}
