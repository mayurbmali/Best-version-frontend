package com.edutech.service;

import com.edutech.dto.ProfileUpdateRequest;
import com.edutech.entity.Job;
import com.edutech.entity.User;
import com.edutech.exception.ResourceNotFoundException;
import com.edutech.repository.FreelancerProfileRepository;
import com.edutech.repository.JobApplicationRepository;
import com.edutech.repository.JobRepository;
import com.edutech.repository.ProposalRepository;
import com.edutech.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.Arrays;
import java.util.List;

@Service
public class UserService implements UserDetailsService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JobRepository jobRepository;
    @Autowired private ProposalRepository proposalRepository;
    @Autowired private JobApplicationRepository jobApplicationRepository;
    @Autowired private FreelancerProfileRepository freelancerProfileRepository;

    public User registerUser(User user) {
        if (user.getRole() == null) {
            user.setRole(User.Role.FREELANCER);
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User saved = userRepository.save(user);
        log.info("User registered: userId={}, username={}, role={}", saved.getId(), saved.getUsername(), saved.getRole());
        return saved;
    }

    public User registerUserWithEncodedPassword(String username, String encodedPassword,
            String email, String role, boolean emailVerified, String authProvider) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(encodedPassword);
        user.setEmail(email);
        try {
            user.setRole(User.Role.valueOf(role));
        } catch (Exception e) {
            log.warn("Unknown role '{}' — defaulting to FREELANCER for username={}", role, username);
            user.setRole(User.Role.FREELANCER);
        }
        user.setEmailVerified(emailVerified);
        user.setAuthProvider(authProvider != null ? authProvider : "LOCAL");
        User saved = userRepository.save(user);
        log.info("User registered with encoded password: userId={}, username={}", saved.getId(), saved.getUsername());
        return saved;
    }

    public User createGoogleUser(String username, String email, String role) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
        user.setEmail(email);
        try {
            user.setRole(User.Role.valueOf(role));
        } catch (Exception e) {
            user.setRole(User.Role.FREELANCER);
        }
        user.setEmailVerified(true);
        user.setAuthProvider("GOOGLE");
        User saved = userRepository.save(user);
        log.info("Google user created: userId={}, username={}, role={}", saved.getId(), saved.getUsername(), saved.getRole());
        return saved;
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public void updatePassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email);
        if (user == null) throw new ResourceNotFoundException("User not found for email: " + email);
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Password updated for userId={}", user.getId());
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found: " + username);
        }
        User.Role role = user.getRole() != null ? user.getRole() : User.Role.FREELANCER;
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                Arrays.asList(
                        new SimpleGrantedAuthority(role.name()),
                        new SimpleGrantedAuthority("ROLE_" + role.name())));
    }

    public User getUserProfile(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
    }

    public List<User> findAllUser() {
        return userRepository.findAll();
    }

    public List<User> getUserRolesDetails() {
        return userRepository.findAll();
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User updateSubscription(Long userId, String paymentId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setSubscribed(true);
        user.setPaymentId(paymentId);
        User saved = userRepository.save(user);
        log.info("Subscription activated for userId={}", userId);
        return saved;
    }

    public User updateUserProfile(Long userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        User.Role role = user.getRole();
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail());
        }
        if (request.getContactNumber() != null) {
            user.setContactNumber(request.getContactNumber());
        }
        if (role == User.Role.CLIENT || role == User.Role.FREELANCER) {
            if (request.getBio() != null) {
                user.setBio(request.getBio());
            }
        }
        if (role == User.Role.FREELANCER) {
            if (request.getSkills() != null) {
                user.setSkills(request.getSkills());
            }
        }
        User saved = userRepository.save(user);
        log.info("Profile updated: userId={}", userId);
        return saved;
    }

    @Transactional
    public void deleteUser(Long adminId, Long targetUserId) {
        if (adminId.equals(targetUserId)) {
            throw new com.edutech.exception.ForbiddenActionException("You cannot delete your own account.");
        }

        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", targetUserId));

        if (target.getRole() == User.Role.ADMIN) {
            throw new com.edutech.exception.ForbiddenActionException("Admin accounts cannot be deleted.");
        }

        if (target.getRole() == User.Role.CLIENT) {
            // Delete all data owned by this client's jobs before deleting the jobs themselves.
            // Order matters: proposals and job_applications reference job rows via FK.
            List<Job> clientJobs = jobRepository.findByClient(target);
            for (Job job : clientJobs) {
                proposalRepository.deleteByJobId(job.getId());
                jobApplicationRepository.deleteByJobId(job.getId());
            }
            jobRepository.deleteAll(clientJobs);

        } else if (target.getRole() == User.Role.FREELANCER) {
            // freelancer_profile.user_id → user.id (no cascade from the User side)
            freelancerProfileRepository.findByUserId(targetUserId)
                    .ifPresent(freelancerProfileRepository::delete);

            // job_application.user_id tracks which freelancer applied
            jobApplicationRepository.deleteByUserId(targetUserId);

            // proposal rows where this user is the freelancer are handled by
            // CascadeType.ALL on User.proposals, so no manual step needed here.
        }

        userRepository.deleteById(targetUserId);
        log.info("Admin userId={} deleted userId={}, role={}", adminId, targetUserId, target.getRole());
    }
}
