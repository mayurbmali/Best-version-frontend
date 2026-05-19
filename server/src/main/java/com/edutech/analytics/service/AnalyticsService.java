package com.edutech.analytics.service;

import com.edutech.analytics.dto.ActivityEventDTO;
import com.edutech.analytics.dto.FreelancerInsightDTO;
import com.edutech.analytics.dto.JobInsightsDTO;
import com.edutech.analytics.dto.PlatformOverviewDTO;
import com.edutech.entity.Job;
import com.edutech.entity.Proposal;
import com.edutech.entity.User;
import com.edutech.repository.FreelancerProfileRepository;
import com.edutech.repository.JobRepository;
import com.edutech.repository.ProposalRepository;
import com.edutech.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsService.class);

    @Autowired private UserRepository userRepository;
    @Autowired private JobRepository jobRepository;
    @Autowired private ProposalRepository proposalRepository;
    @Autowired private FreelancerProfileRepository freelancerProfileRepository;

    // ── Platform Overview ───────────────────────────────────────────────────

    public PlatformOverviewDTO getPlatformOverview() {
        log.info("Generating platform overview analytics");

        List<User> allUsers = userRepository.findAll();
        List<Job>  allJobs  = jobRepository.findAll();
        List<Proposal> allProposals = proposalRepository.findAll();

        long totalClients    = allUsers.stream().filter(u -> u.getRole() == User.Role.CLIENT).count();
        long totalFreelancers = allUsers.stream().filter(u -> u.getRole() == User.Role.FREELANCER).count();

        long openJobs     = allJobs.stream().filter(j -> "OPEN".equals(j.getStatus())).count();
        long closedJobs   = allJobs.stream().filter(j -> "CLOSED".equals(j.getStatus())).count();
        long appliedJobs  = allJobs.stream().filter(j -> "APPLIED".equals(j.getStatus())).count();
        long acceptedJobs = allJobs.stream().filter(j -> "ACCEPTED".equals(j.getStatus())).count();

        long pendingProposals  = allProposals.stream().filter(p -> "PENDING".equals(p.getStatus())).count();
        long approvedProposals = allProposals.stream().filter(p -> "APPROVED".equals(p.getStatus())).count();
        long rejectedProposals = allProposals.stream().filter(p -> "REJECTED".equals(p.getStatus())).count();

        long activeSubscriptions = allUsers.stream().filter(User::isSubscribed).count();

        long completedProfiles = freelancerProfileRepository.findAll().stream()
                .filter(fp -> fp.getExperienceYears() != null
                        && fp.getHighestEducation() != null
                        && !fp.getHighestEducation().trim().isEmpty())
                .count();

        double jobCompletionRate = allJobs.isEmpty() ? 0
                : Math.round((double)(closedJobs + acceptedJobs) / allJobs.size() * 1000.0) / 10.0;

        double proposalAcceptanceRate = allProposals.isEmpty() ? 0
                : Math.round((double) approvedProposals / allProposals.size() * 1000.0) / 10.0;

        PlatformOverviewDTO dto = new PlatformOverviewDTO();
        dto.setTotalUsers(totalClients + totalFreelancers);
        dto.setTotalClients(totalClients);
        dto.setTotalFreelancers(totalFreelancers);
        dto.setTotalJobs((long) allJobs.size());
        dto.setOpenJobs(openJobs);
        dto.setClosedJobs(closedJobs);
        dto.setAppliedJobs(appliedJobs);
        dto.setTotalProposals((long) allProposals.size());
        dto.setPendingProposals(pendingProposals);
        dto.setApprovedProposals(approvedProposals);
        dto.setRejectedProposals(rejectedProposals);
        dto.setActiveSubscriptions(activeSubscriptions);
        dto.setProfilesCompleted(completedProfiles);
        dto.setJobCompletionRate(jobCompletionRate);
        dto.setProposalAcceptanceRate(proposalAcceptanceRate);

        log.info("Overview: users={}, jobs={}, proposals={}, subscriptions={}",
                dto.getTotalUsers(), dto.getTotalJobs(), dto.getTotalProposals(), activeSubscriptions);
        return dto;
    }

    // ── Activity Feed ───────────────────────────────────────────────────────

    public List<ActivityEventDTO> getRecentActivity(int limit) {
        log.debug("Generating activity feed, limit={}", limit);
        List<ActivityEventDTO> activities = new ArrayList<>();

        // Proposals (have appliedAt timestamp)
        proposalRepository.findAll().stream()
                .sorted(Comparator.comparingLong(Proposal::getId).reversed())
                .limit(limit)
                .forEach(p -> {
                    String freelancer = p.getFreelancer() != null ? p.getFreelancer().getUsername() : "Freelancer";
                    String jobTitle   = p.getJob()        != null ? p.getJob().getTitle()           : "a job";
                    boolean hired     = "APPROVED".equals(p.getStatus());

                    ActivityEventDTO e = new ActivityEventDTO();
                    e.setType(hired ? "HIRED" : "PROPOSAL");
                    e.setDescription(hired
                            ? freelancer + " was hired for \"" + jobTitle + "\""
                            : freelancer + " applied to \"" + jobTitle + "\"");
                    e.setActorName(freelancer);
                    e.setBadge(hired ? "SUCCESS" : "INFO");
                    e.setTimestamp(p.getAppliedAt() != null ? p.getAppliedAt().toString() : "");
                    activities.add(e);
                });

        // Jobs posted (latest by ID)
        jobRepository.findAll().stream()
                .sorted(Comparator.comparingLong(Job::getId).reversed())
                .limit(8)
                .forEach(j -> {
                    String client = j.getClient() != null ? j.getClient().getUsername() : "Client";
                    ActivityEventDTO e = new ActivityEventDTO();
                    e.setType("JOB_POSTED");
                    e.setDescription(client + " posted \"" + j.getTitle() + "\"");
                    e.setActorName(client);
                    e.setBadge("WARNING");
                    e.setTimestamp("");
                    activities.add(e);
                });

        // User registrations (latest by ID)
        userRepository.findAll().stream()
                .filter(u -> u.getRole() != User.Role.ADMIN)
                .sorted(Comparator.comparingLong(User::getId).reversed())
                .limit(8)
                .forEach(u -> {
                    ActivityEventDTO e = new ActivityEventDTO();
                    e.setType("USER_JOINED");
                    e.setDescription(u.getUsername() + " joined as " + (u.getRole() != null ? u.getRole().name() : "USER"));
                    e.setActorName(u.getUsername());
                    e.setBadge("VIOLET");
                    e.setTimestamp("");
                    activities.add(e);
                });

        // Subscriptions
        userRepository.findAll().stream()
                .filter(User::isSubscribed)
                .sorted(Comparator.comparingLong(User::getId).reversed())
                .limit(5)
                .forEach(u -> {
                    ActivityEventDTO e = new ActivityEventDTO();
                    e.setType("SUBSCRIBED");
                    e.setDescription(u.getUsername() + " activated a premium subscription");
                    e.setActorName(u.getUsername());
                    e.setBadge("SUCCESS");
                    e.setTimestamp("");
                    activities.add(e);
                });

        return activities.stream().limit(limit).collect(Collectors.toList());
    }

    // ── Freelancer Insights ─────────────────────────────────────────────────

    public List<FreelancerInsightDTO> getFreelancerInsights() {
        log.debug("Generating freelancer insights");

        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.FREELANCER)
                .map(f -> {
                    List<Proposal> fps = proposalRepository.findByFreelancerId(f.getId());
                    long approved = fps.stream().filter(p -> "APPROVED".equals(p.getStatus())).count();

                    boolean hasFullProfile = freelancerProfileRepository.findByUserId(f.getId())
                            .map(fp -> fp.getExperienceYears() != null
                                    && fp.getHighestEducation() != null
                                    && !fp.getHighestEducation().trim().isEmpty())
                            .orElse(false);

                    boolean hasBasic = f.getSkills() != null && !f.getSkills().trim().isEmpty()
                            && f.getBio() != null && !f.getBio().trim().isEmpty();

                    FreelancerInsightDTO dto = new FreelancerInsightDTO();
                    dto.setUserId(f.getId());
                    dto.setUsername(f.getUsername());
                    dto.setEmail(f.getEmail());
                    dto.setSkills(f.getSkills());
                    dto.setTotalProposals(fps.size());
                    dto.setApprovedProposals(approved);
                    dto.setProfileComplete(hasFullProfile && hasBasic);
                    dto.setSubscribed(f.isSubscribed());
                    return dto;
                })
                .sorted(Comparator.comparingLong(FreelancerInsightDTO::getApprovedProposals).reversed()
                        .thenComparing(Comparator.comparingLong(FreelancerInsightDTO::getTotalProposals).reversed()))
                .collect(Collectors.toList());
    }

    // ── Job Insights ────────────────────────────────────────────────────────

    public JobInsightsDTO getJobInsights() {
        log.debug("Generating job insights");

        List<Job>      allJobs      = jobRepository.findAll();
        List<Proposal> allProposals = proposalRepository.findAll();

        long openJobs     = allJobs.stream().filter(j -> "OPEN".equals(j.getStatus())).count();
        long closedJobs   = allJobs.stream().filter(j -> "CLOSED".equals(j.getStatus())).count();
        long appliedJobs  = allJobs.stream().filter(j -> "APPLIED".equals(j.getStatus())).count();
        long acceptedJobs = allJobs.stream().filter(j -> "ACCEPTED".equals(j.getStatus())).count();

        long jobsWithoutProposals = allJobs.stream()
                .filter(j -> proposalRepository.findByJobId(j.getId()).isEmpty())
                .count();

        double avg = allJobs.isEmpty() ? 0
                : Math.round((double) allProposals.size() / allJobs.size() * 10.0) / 10.0;

        JobInsightsDTO dto = new JobInsightsDTO();
        dto.setTotalJobs(allJobs.size());
        dto.setOpenJobs(openJobs);
        dto.setClosedJobs(closedJobs);
        dto.setAppliedJobs(appliedJobs);
        dto.setAcceptedJobs(acceptedJobs);
        dto.setJobsWithoutProposals(jobsWithoutProposals);
        dto.setTotalProposals(allProposals.size());
        dto.setAvgProposalsPerJob(avg);
        return dto;
    }
}
