package com.edutech.controller;

import com.edutech.dto.*;
import com.edutech.entity.User;
import com.edutech.exception.BadRequestException;
import com.edutech.exception.DuplicateResourceException;
import com.edutech.exception.ForbiddenActionException;
import com.edutech.exception.ResourceNotFoundException;
import com.edutech.service.*;
import com.edutech.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private UserService userService;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private OtpService otpService;
    @Autowired private EmailService emailService;
    @Autowired private PendingRegistrationService pendingRegistrationService;
    @Autowired private PasswordResetService passwordResetService;
    @Autowired private GoogleAuthService googleAuthService;
    @Autowired private PasswordEncoder passwordEncoder;

    // ======================== ORIGINAL REGISTER (kept for backward compat) ========================
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        log.info("Legacy register request for username={}", user.getUsername());
        if (user.getRole() == null) {
            user.setRole(User.Role.FREELANCER);
        }
        User existingUser = userService.getUserByUsername(user.getUsername());
        if (existingUser != null) {
            log.info("Legacy register: user already exists username={}", user.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED).body(buildRegisterResponse(existingUser));
        }
        User savedUser = userService.registerUser(user);
        log.info("Legacy register: new user created id={}, username={}", savedUser.getId(), savedUser.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(buildRegisterResponse(savedUser));
    }

    // ======================== FEATURE 1: OTP REGISTRATION ========================
    @PostMapping("/register/initiate")
    public ResponseEntity<?> initiateRegistration(@Valid @RequestBody RegisterInitiateRequest req) {
        log.info("Registration initiate request for email={}, username={}", req.getEmail(), req.getUsername());

        // Business rule: ADMIN cannot self-register
        String role = req.getRole();
        if (role == null || role.trim().isEmpty()) role = "FREELANCER";
        if ("ADMIN".equalsIgnoreCase(role.trim())) {
            throw new ForbiddenActionException("Invalid role selection");
        }

        if (userService.existsByUsername(req.getUsername().trim())) {
            throw new DuplicateResourceException("Username already exists");
        }
        if (userService.existsByEmail(req.getEmail().trim())) {
            throw new DuplicateResourceException("Email already registered");
        }

        String encodedPassword = passwordEncoder.encode(req.getPassword());
        pendingRegistrationService.storePending(
            req.getEmail().trim(), req.getUsername().trim(), encodedPassword, role.toUpperCase().trim());

        String otp = otpService.generateOtp("REG_" + req.getEmail().trim());
        emailService.sendOtpEmail(req.getEmail().trim(), "NexLancer - Email Verification OTP", otp);

        log.info("Registration OTP sent for email={}", req.getEmail());
        Map<String, String> response = new HashMap<>();
        response.put("message", "OTP sent to " + req.getEmail());
        response.put("email", req.getEmail().trim());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register/verify-otp")
    public ResponseEntity<?> verifyRegistrationOtp(@Valid @RequestBody OtpVerifyRequest req) {
        log.info("OTP verify request for registration email={}", req.getEmail());

        boolean valid = otpService.verifyOtp("REG_" + req.getEmail().trim(), req.getOtp().trim());
        if (!valid) {
            throw new BadRequestException("Invalid or expired OTP");
        }

        PendingRegistrationService.PendingUser pending = pendingRegistrationService.getPending(req.getEmail().trim());
        if (pending == null) {
            throw new BadRequestException("Registration session expired. Please register again.");
        }

        User savedUser = userService.registerUserWithEncodedPassword(
            pending.username, pending.encodedPassword, pending.email,
            pending.role, true, "LOCAL");
        pendingRegistrationService.removePending(req.getEmail().trim());

        log.info("Registration completed: userId={}, username={}", savedUser.getId(), savedUser.getUsername());

        Map<String, Object> response = new HashMap<>();
        response.put("id", savedUser.getId());
        response.put("username", savedUser.getUsername());
        response.put("email", savedUser.getEmail());
        response.put("role", savedUser.getRole().name());
        response.put("message", "Registration successful! Please login.");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ======================== ORIGINAL LOGIN ========================
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("Login attempt for username={}", loginRequest.getUsername());
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()));
        } catch (BadCredentialsException e) {
            log.warn("Failed login attempt for username={}", loginRequest.getUsername());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid username or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        UserDetails userDetails = userService.loadUserByUsername(loginRequest.getUsername());
        User user = userService.getUserByUsername(loginRequest.getUsername());

        if (user == null) {
            throw new ResourceNotFoundException("User", loginRequest.getUsername());
        }

        String role = user.getRole() != null ? user.getRole().name() : "FREELANCER";
        String token = jwtUtil.generateToken(userDetails.getUsername(), role);

        log.info("Login successful for userId={}, username={}, role={}", user.getId(), user.getUsername(), role);
        LoginResponse response = new LoginResponse(
                user.getId(), token, user.getUsername(), user.getEmail(), role, user.isSubscribed());
        return ResponseEntity.ok(response);
    }

    // ======================== FEATURE 3: FORGOT PASSWORD ========================
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        log.info("Forgot-password request for email={}", req.getEmail());
        Map<String, String> response = new HashMap<>();

        User user = userService.getUserByEmail(req.getEmail().trim());
        if (user == null) {
            // Do not reveal whether the email exists — security best practice
            response.put("message", "If this email exists, an OTP has been sent.");
            return ResponseEntity.ok(response);
        }

        String otp = otpService.generateOtp("FP_" + req.getEmail().trim());
        emailService.sendOtpEmail(req.getEmail().trim(), "NexLancer - Password Reset OTP", otp);

        log.info("Password-reset OTP dispatched for userId={}", user.getId());
        response.put("message", "OTP sent to " + req.getEmail());
        response.put("email", req.getEmail().trim());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password/verify-otp")
    public ResponseEntity<?> verifyForgotPasswordOtp(@Valid @RequestBody OtpVerifyRequest req) {
        log.info("Forgot-password OTP verify for email={}", req.getEmail());

        boolean valid = otpService.verifyOtp("FP_" + req.getEmail().trim(), req.getOtp().trim());
        if (!valid) {
            throw new BadRequestException("Invalid or expired OTP");
        }

        String resetToken = passwordResetService.generateResetToken(req.getEmail().trim());
        log.info("Password-reset token issued for email={}", req.getEmail());

        Map<String, String> response = new HashMap<>();
        response.put("message", "OTP verified successfully");
        response.put("resetToken", resetToken);
        response.put("email", req.getEmail().trim());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        log.info("Password reset request for email={}", req.getEmail());

        if (!passwordResetService.verifyResetToken(req.getEmail().trim(), req.getResetToken())) {
            throw new BadRequestException("Invalid or expired reset token");
        }

        userService.updatePassword(req.getEmail().trim(), req.getNewPassword());
        passwordResetService.clearResetToken(req.getEmail().trim());

        log.info("Password reset successful for email={}", req.getEmail());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset successfully");
        return ResponseEntity.ok(response);
    }

    // ======================== FEATURE 4 & 5: GOOGLE OAUTH ========================
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@Valid @RequestBody GoogleAuthRequest req) {
        log.info("Google login attempt");
        GoogleAuthService.GoogleUserInfo googleUser;
        try {
            googleUser = googleAuthService.verifyToken(req.getIdToken());
        } catch (Exception e) {
            log.warn("Google token verification failed: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Google authentication failed: " + e.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).body(error);
        }

        User existingUser = userService.getUserByEmail(googleUser.email);
        if (existingUser != null) {
            String role = existingUser.getRole() != null ? existingUser.getRole().name() : "FREELANCER";
            String token = jwtUtil.generateToken(existingUser.getUsername(), role);
            log.info("Google login: existing user userId={}, username={}", existingUser.getId(), existingUser.getUsername());
            LoginResponse response = new LoginResponse(
                    existingUser.getId(), token, existingUser.getUsername(),
                    existingUser.getEmail(), role, existingUser.isSubscribed());
            return ResponseEntity.ok(response);
        }

        log.info("Google login: new user, needs role selection for email={}", googleUser.email);
        Map<String, Object> response = new HashMap<>();
        response.put("newUser", true);
        response.put("email", googleUser.email);
        response.put("name", googleUser.name);
        response.put("idToken", req.getIdToken());
        response.put("message", "New user. Please select your role to complete registration.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/google/complete")
    public ResponseEntity<?> completeGoogleRegistration(@Valid @RequestBody GoogleCompleteRequest req) {
        log.info("Google registration complete request, role={}", req.getRole());

        if ("ADMIN".equalsIgnoreCase(req.getRole().trim())) {
            throw new ForbiddenActionException("Cannot register as ADMIN via Google login");
        }

        GoogleAuthService.GoogleUserInfo googleUser;
        try {
            googleUser = googleAuthService.verifyToken(req.getIdToken());
        } catch (Exception e) {
            log.warn("Google token verification failed during registration: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Google authentication failed: " + e.getMessage());
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).body(error);
        }

        if (userService.existsByEmail(googleUser.email)) {
            throw new DuplicateResourceException("Email already registered");
        }

        String username = req.getUsername();
        if (username == null || username.trim().isEmpty()) {
            username = googleUser.email.split("@")[0].replaceAll("[^a-zA-Z0-9_]", "_");
        }
        username = username.trim();

        String baseUsername = username;
        int suffix = 1;
        while (userService.existsByUsername(username)) {
            username = baseUsername + suffix++;
        }

        String role = req.getRole().trim().toUpperCase();
        User newUser = userService.createGoogleUser(username, googleUser.email, role);

        String token = jwtUtil.generateToken(newUser.getUsername(), newUser.getRole().name());
        log.info("Google registration complete: userId={}, username={}, role={}", newUser.getId(), newUser.getUsername(), role);
        LoginResponse response = new LoginResponse(
                newUser.getId(), token, newUser.getUsername(),
                newUser.getEmail(), newUser.getRole().name(), newUser.isSubscribed());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ======================== EXISTING ENDPOINTS ========================
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long userId) {
        log.debug("Get user profile request for userId={}", userId);
        User user = userService.getUserProfile(userId);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/user/{userId}")
    public ResponseEntity<?> updateUserProfile(@PathVariable Long userId,
                                                @Valid @RequestBody ProfileUpdateRequest request) {
        log.info("Update user profile request for userId={}", userId);
        User updatedUser = userService.updateUserProfile(userId, request);

        Map<String, Object> response = new HashMap<>();
        response.put("id", updatedUser.getId());
        response.put("username", updatedUser.getUsername());
        response.put("email", updatedUser.getEmail());
        response.put("contactNumber", updatedUser.getContactNumber());
        response.put("bio", updatedUser.getBio());
        response.put("skills", updatedUser.getSkills());
        response.put("role", updatedUser.getRole() != null ? updatedUser.getRole().name() : null);
        response.put("message", "Profile updated successfully");
        log.info("Profile updated successfully for userId={}", userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        log.debug("Get all users request");
        return ResponseEntity.ok(userService.findAllUser());
    }


    // ======================== ADMIN: DELETE USER ========================
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId,
                                         @RequestHeader(value = "X-Admin-Id", required = false) Long adminId) {
        log.info("Delete user request: targetUserId={}, adminId={}", userId, adminId);
        if (adminId == null) {
            // Try to get admin ID from security context as fallback
            adminId = 0L;
        }
        userService.deleteUser(adminId, userId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "User deleted successfully");
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> buildRegisterResponse(User savedUser) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", savedUser.getId());
        response.put("username", savedUser.getUsername());
        response.put("email", savedUser.getEmail());
        response.put("role", savedUser.getRole() != null ? savedUser.getRole().name() : null);
        response.put("message", "User registered successfully");
        return response;
    }
}