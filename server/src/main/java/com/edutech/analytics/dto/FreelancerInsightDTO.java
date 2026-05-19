package com.edutech.analytics.dto;

public class FreelancerInsightDTO {

    private Long userId;
    private String username;
    private String email;
    private String skills;
    private long totalProposals;
    private long approvedProposals;
    private boolean profileComplete;
    private boolean subscribed;

    public FreelancerInsightDTO() {}

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public long getTotalProposals() { return totalProposals; }
    public void setTotalProposals(long totalProposals) { this.totalProposals = totalProposals; }

    public long getApprovedProposals() { return approvedProposals; }
    public void setApprovedProposals(long approvedProposals) { this.approvedProposals = approvedProposals; }

    public boolean isProfileComplete() { return profileComplete; }
    public void setProfileComplete(boolean profileComplete) { this.profileComplete = profileComplete; }

    public boolean isSubscribed() { return subscribed; }
    public void setSubscribed(boolean subscribed) { this.subscribed = subscribed; }
}
