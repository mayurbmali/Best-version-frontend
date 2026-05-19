package com.edutech.dto;

import java.time.LocalDateTime;

/**
 * Enhanced proposal response DTO used by the client's "My Jobs" view.
 * Carries all standard proposal fields plus the freelancer's professional profile data.
 * The 'freelancer' object mirrors the User fields expected by the Angular frontend.
 */
public class ProposalWithProfileDTO {

    private Long id;
    private Double bidAmount;
    private String status;
    private LocalDateTime appliedAt;

    // Mirrors the Proposal.job structure expected by the frontend
    private JobSummary job;

    // Mirrors the Proposal.freelancer (User) structure expected by the frontend
    private FreelancerSummary freelancer;

    // NEW: professional profile data from FreelancerProfile entity
    private FreelancerProfileDTO freelancerProfile;

    public ProposalWithProfileDTO() {}

    // ─── Nested: JobSummary ──────────────────────────────────────────────────
    public static class JobSummary {
        private Long id;
        private String title;
        private String status;
        private Double budget;

        public JobSummary() {}
        public JobSummary(Long id, String title, String status, Double budget) {
            this.id = id; this.title = title; this.status = status; this.budget = budget;
        }
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Double getBudget() { return budget; }
        public void setBudget(Double budget) { this.budget = budget; }
    }

    // ─── Nested: FreelancerSummary ───────────────────────────────────────────
    public static class FreelancerSummary {
        private Long id;
        private String username;
        private String email;
        private Long contactNumber;
        private String skills;
        private String bio;
        private String role;

        public FreelancerSummary() {}
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public Long getContactNumber() { return contactNumber; }
        public void setContactNumber(Long contactNumber) { this.contactNumber = contactNumber; }
        public String getSkills() { return skills; }
        public void setSkills(String skills) { this.skills = skills; }
        public String getBio() { return bio; }
        public void setBio(String bio) { this.bio = bio; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    // ─── Root getters/setters ────────────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Double getBidAmount() { return bidAmount; }
    public void setBidAmount(Double bidAmount) { this.bidAmount = bidAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }

    public JobSummary getJob() { return job; }
    public void setJob(JobSummary job) { this.job = job; }

    public FreelancerSummary getFreelancer() { return freelancer; }
    public void setFreelancer(FreelancerSummary freelancer) { this.freelancer = freelancer; }

    public FreelancerProfileDTO getFreelancerProfile() { return freelancerProfile; }
    public void setFreelancerProfile(FreelancerProfileDTO freelancerProfile) {
        this.freelancerProfile = freelancerProfile;
    }
}
