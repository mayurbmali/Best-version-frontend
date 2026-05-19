package com.edutech.dto;

import javax.validation.constraints.Min;
import javax.validation.constraints.Size;

public class FreelancerProfileDTO {

    private Long id;
    private Long userId;

    @Min(value = 0, message = "Experience years must be 0 or more")
    private Integer experienceYears;

    @Size(max = 200, message = "Education must not exceed 200 characters")
    private String highestEducation;

    @Size(max = 500, message = "LinkedIn URL must not exceed 500 characters")
    private String linkedinUrl;

    @Size(max = 500, message = "GitHub URL must not exceed 500 characters")
    private String githubUrl;

    public FreelancerProfileDTO() {}

    public FreelancerProfileDTO(Long id, Long userId, Integer experienceYears,
                                 String highestEducation, String linkedinUrl, String githubUrl) {
        this.id = id;
        this.userId = userId;
        this.experienceYears = experienceYears;
        this.highestEducation = highestEducation;
        this.linkedinUrl = linkedinUrl;
        this.githubUrl = githubUrl;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }

    public String getHighestEducation() { return highestEducation; }
    public void setHighestEducation(String highestEducation) { this.highestEducation = highestEducation; }

    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }
}
