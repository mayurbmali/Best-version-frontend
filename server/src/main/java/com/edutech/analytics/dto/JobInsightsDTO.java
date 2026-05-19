package com.edutech.analytics.dto;

public class JobInsightsDTO {

    private long totalJobs;
    private long openJobs;
    private long closedJobs;
    private long appliedJobs;
    private long acceptedJobs;
    private long jobsWithoutProposals;
    private long totalProposals;
    private double avgProposalsPerJob;

    public JobInsightsDTO() {}

    public long getTotalJobs() { return totalJobs; }
    public void setTotalJobs(long totalJobs) { this.totalJobs = totalJobs; }

    public long getOpenJobs() { return openJobs; }
    public void setOpenJobs(long openJobs) { this.openJobs = openJobs; }

    public long getClosedJobs() { return closedJobs; }
    public void setClosedJobs(long closedJobs) { this.closedJobs = closedJobs; }

    public long getAppliedJobs() { return appliedJobs; }
    public void setAppliedJobs(long appliedJobs) { this.appliedJobs = appliedJobs; }

    public long getAcceptedJobs() { return acceptedJobs; }
    public void setAcceptedJobs(long acceptedJobs) { this.acceptedJobs = acceptedJobs; }

    public long getJobsWithoutProposals() { return jobsWithoutProposals; }
    public void setJobsWithoutProposals(long jobsWithoutProposals) { this.jobsWithoutProposals = jobsWithoutProposals; }

    public long getTotalProposals() { return totalProposals; }
    public void setTotalProposals(long totalProposals) { this.totalProposals = totalProposals; }

    public double getAvgProposalsPerJob() { return avgProposalsPerJob; }
    public void setAvgProposalsPerJob(double avgProposalsPerJob) { this.avgProposalsPerJob = avgProposalsPerJob; }
}
