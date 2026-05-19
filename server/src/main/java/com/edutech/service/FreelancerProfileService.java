package com.edutech.service;

import com.edutech.dto.FreelancerProfileDTO;
import com.edutech.entity.FreelancerProfile;
import com.edutech.entity.User;
import com.edutech.exception.ResourceNotFoundException;
import com.edutech.repository.FreelancerProfileRepository;
import com.edutech.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class FreelancerProfileService {

    private static final Logger log = LoggerFactory.getLogger(FreelancerProfileService.class);

    @Autowired private FreelancerProfileRepository freelancerProfileRepository;
    @Autowired private UserRepository userRepository;

    public FreelancerProfileDTO saveOrUpdateProfile(Long userId, FreelancerProfileDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        FreelancerProfile profile = freelancerProfileRepository.findByUserId(userId)
                .orElse(new FreelancerProfile());

        profile.setUser(user);

        if (dto.getExperienceYears() != null) {
            profile.setExperienceYears(dto.getExperienceYears());
        }
        if (dto.getHighestEducation() != null) {
            profile.setHighestEducation(dto.getHighestEducation());
        }
        if (dto.getLinkedinUrl() != null) {
            profile.setLinkedinUrl(dto.getLinkedinUrl());
        }
        if (dto.getGithubUrl() != null) {
            profile.setGithubUrl(dto.getGithubUrl());
        }

        FreelancerProfile saved = freelancerProfileRepository.save(profile);
        log.info("Freelancer profile saved/updated: userId={}, profileId={}", userId, saved.getId());
        return toDTO(saved);
    }

    public Optional<FreelancerProfileDTO> getByUserId(Long userId) {
        return freelancerProfileRepository.findByUserId(userId).map(this::toDTO);
    }

    public boolean isProfileComplete(Long userId) {
        Optional<FreelancerProfile> profileOpt = freelancerProfileRepository.findByUserId(userId);
        if (!profileOpt.isPresent()) {
            return false;
        }
        FreelancerProfile profile = profileOpt.get();
        boolean hasExperience = profile.getExperienceYears() != null;
        boolean hasEducation = profile.getHighestEducation() != null
                && !profile.getHighestEducation().trim().isEmpty();
        return hasExperience && hasEducation;
    }

    private FreelancerProfileDTO toDTO(FreelancerProfile profile) {
        Long userId = profile.getUser() != null ? profile.getUser().getId() : null;
        return new FreelancerProfileDTO(
                profile.getId(), userId, profile.getExperienceYears(),
                profile.getHighestEducation(), profile.getLinkedinUrl(), profile.getGithubUrl());
    }
}
