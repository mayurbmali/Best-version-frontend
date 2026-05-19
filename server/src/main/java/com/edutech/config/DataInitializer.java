package com.edutech.config;

import com.edutech.entity.User;
import com.edutech.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private static final String ADMIN_USERNAME = "admin123";
    private static final String ADMIN_PASSWORD = "Admin@123";
    private static final String ADMIN_EMAIL = "admin@nexlancer.com";

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        User existing = userRepository.findByUsername(ADMIN_USERNAME);

        if (existing == null) {
            // Admin does not exist at all — create fresh
            User admin = new User();
            admin.setUsername(ADMIN_USERNAME);
            admin.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
            admin.setEmail(ADMIN_EMAIL);
            admin.setRole(User.Role.ADMIN);
            admin.setEmailVerified(true);
            admin.setAuthProvider("LOCAL");
            userRepository.save(admin);
            log.info("Default admin user created: username='{}'", ADMIN_USERNAME);

        } else if (!existing.getPassword().startsWith("$2a$") &&
                !existing.getPassword().startsWith("$2b$") &&
                !existing.getPassword().startsWith("$2y$")) {
            // Admin exists but password is NOT BCrypt-encoded — fix it
            existing.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
            existing.setRole(User.Role.ADMIN);
            existing.setEmailVerified(true);
            userRepository.save(existing);
            log.info("Admin user '{}' had a plain-text password — re-encoded successfully.", ADMIN_USERNAME);

        } else {
            log.info("Admin user '{}' already exists with a valid password — skipping seed.", ADMIN_USERNAME);
        }
    }
}