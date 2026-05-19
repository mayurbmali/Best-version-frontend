package com.edutech.controller;

import com.edutech.dto.FreelancerProfileDTO;
import com.edutech.exception.ResourceNotFoundException;
import com.edutech.service.FreelancerProfileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Optional;

@RestController
@RequestMapping("/api/freelancer-profile")
@CrossOrigin(origins = "*")
public class FreelancerProfileController {

    private static final Logger log = LoggerFactory.getLogger(FreelancerProfileController.class);

    @Autowired
    private FreelancerProfileService freelancerProfileService;

    /**
     * POST /api/freelancer-profile/{userId}
     * Create or update the professional profile for the given freelancer.
     */
    @PostMapping("/{userId}")
    public ResponseEntity<?> saveFreelancerProfile(
            @PathVariable Long userId,
            @Valid @RequestBody FreelancerProfileDTO dto) {
        log.info("Save freelancer profile request: userId={}", userId);
        FreelancerProfileDTO saved = freelancerProfileService.saveOrUpdateProfile(userId, dto);
        log.info("Freelancer profile saved: userId={}, profileId={}", userId, saved.getId());
        return ResponseEntity.ok(saved);
    }

    /**
     * GET /api/freelancer-profile/{userId}
     * Retrieve the professional profile for the given freelancer.
     * Returns 404 if not found.
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getFreelancerProfile(@PathVariable Long userId) {
        log.debug("Get freelancer profile request: userId={}", userId);
        Optional<FreelancerProfileDTO> profileOpt = freelancerProfileService.getByUserId(userId);
        FreelancerProfileDTO profile = profileOpt.orElseThrow(() ->
                new ResourceNotFoundException("Freelancer profile not found for userId: " + userId));
        return ResponseEntity.ok(profile);
    }
}
