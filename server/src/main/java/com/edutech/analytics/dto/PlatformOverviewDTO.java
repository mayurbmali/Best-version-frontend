package com.edutech.analytics.dto;

public class PlatformOverviewDTO {

    private long totalUsers;
    private long totalClients;
    private long totalFreelancers;
    private long totalJobs;
    private long openJobs;
    private long closedJobs;
    private long appliedJobs;
    private long totalProposals;
    private long pendingProposals;
    private long approvedProposals;
    private long rejectedProposals;
    private long activeSubscriptions;
    private long profilesCompleted;
    private double jobCompletionRate;
    private double proposalAcceptanceRate;

    public PlatformOverviewDTO() {}

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getTotalClients() { return totalClients; }
    public void setTotalClients(long totalClients) { this.totalClients = totalClients; }

    public long getTotalFreelancers() { return totalFreelancers; }
    public void setTotalFreelancers(long totalFreelancers) { this.totalFreelancers = totalFreelancers; }

    public long getTotalJobs() { return totalJobs; }
    public void setTotalJobs(long totalJobs) { this.totalJobs = totalJobs; }

    public long getOpenJobs() { return openJobs; }
    public void setOpenJobs(long openJobs) { this.openJobs = openJobs; }

    public long getClosedJobs() { return closedJobs; }
    public void setClosedJobs(long closedJobs) { this.closedJobs = closedJobs; }

    public long getAppliedJobs() { return appliedJobs; }
    public void setAppliedJobs(long appliedJobs) { this.appliedJobs = appliedJobs; }

    public long getTotalProposals() { return totalProposals; }
    public void setTotalProposals(long totalProposals) { this.totalProposals = totalProposals; }

    public long getPendingProposals() { return pendingProposals; }
    public void setPendingProposals(long pendingProposals) { this.pendingProposals = pendingProposals; }

    public long getApprovedProposals() { return approvedProposals; }
    public void setApprovedProposals(long approvedProposals) { this.approvedProposals = approvedProposals; }

    public long getRejectedProposals() { return rejectedProposals; }
    public void setRejectedProposals(long rejectedProposals) { this.rejectedProposals = rejectedProposals; }

    public long getActiveSubscriptions() { return activeSubscriptions; }
    public void setActiveSubscriptions(long activeSubscriptions) { this.activeSubscriptions = activeSubscriptions; }

    public long getProfilesCompleted() { return profilesCompleted; }
    public void setProfilesCompleted(long profilesCompleted) { this.profilesCompleted = profilesCompleted; }

    public double getJobCompletionRate() { return jobCompletionRate; }
    public void setJobCompletionRate(double jobCompletionRate) { this.jobCompletionRate = jobCompletionRate; }

    public double getProposalAcceptanceRate() { return proposalAcceptanceRate; }
    public void setProposalAcceptanceRate(double proposalAcceptanceRate) { this.proposalAcceptanceRate = proposalAcceptanceRate; }
}
