package com.edutech.entity;

import javax.persistence.*;

@Entity
@Table(name = "freelancer_profile")
public class FreelancerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "highest_education")
    private String highestEducation;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "github_url")
    private String githubUrl;

    public FreelancerProfile() {}

    public FreelancerProfile(User user, Integer experienceYears, String highestEducation,
                              String linkedinUrl, String githubUrl) {
        this.user = user;
        this.experienceYears = experienceYears;
        this.highestEducation = highestEducation;
        this.linkedinUrl = linkedinUrl;
        this.githubUrl = githubUrl;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }

    public String getHighestEducation() { return highestEducation; }
    public void setHighestEducation(String highestEducation) { this.highestEducation = highestEducation; }

    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }
}
