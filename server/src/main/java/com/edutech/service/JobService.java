package com.edutech.service;

import com.edutech.dto.JobDTO;
import com.edutech.entity.Job;
import com.edutech.entity.JobApplication;
import com.edutech.entity.Proposal;
import com.edutech.entity.User;
import com.edutech.exception.BadRequestException;
import com.edutech.exception.ResourceNotFoundException;
import com.edutech.exception.SubscriptionRequiredException;
import com.edutech.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import javax.transaction.Transactional;

@Service
public class JobService {

    private static final Logger log = LoggerFactory.getLogger(JobService.class);

    @Autowired private JobRepository jobRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ProposalRepository proposalRepository;
    @Autowired private JobApplicationRepository jobApplicationRepository;
    @Autowired private FreelancerProfileService freelancerProfileService;

    public Job createJob(Long clientId, Job job) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client", clientId));
        if (client.getRole() == User.Role.CLIENT && !client.isSubscribed()) {
            log.warn("Job creation blocked — subscription required: clientId={}", clientId);
            throw new SubscriptionRequiredException("Subscription required to post jobs");
        }
        job.setClient(client);
        job.setStatus("OPEN");
        Job saved = jobRepository.save(job);
        log.info("Job created: jobId={}, title={}, clientId={}", saved.getId(), saved.getTitle(), clientId);
        return saved;
    }

    public List<JobDTO> getAllJobs() {
        return jobRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Job getJobById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job", id));
    }

    public Job updateJob(Long id, Map<String, Object> body) {
        Job existing = getJobById(id);

        if (body.containsKey("title")) {
            String title = String.valueOf(body.get("title")).trim();
            if (title.isEmpty()) {
                throw new BadRequestException("Job title is required.");
            }
            existing.setTitle(title);
        }

        if (body.containsKey("description")) {
            String description = String.valueOf(body.get("description")).trim();
            if (description.isEmpty()) {
                throw new BadRequestException("Job description is required.");
            }
            existing.setDescription(description);
        }

        if (body.containsKey("budget")) {
            Double budget = Double.valueOf(String.valueOf(body.get("budget")));
            if (budget <= 0) {
                throw new BadRequestException("Budget must be greater than 0.");
            }
            existing.setBudget(budget);
        }

        Job saved = jobRepository.save(existing);
        log.info("Job updated: jobId={}", id);
        return saved;
    }

    @Transactional
    public void deleteJob(Long id) {
        log.info("Deleting job: jobId={}", id);
        proposalRepository.deleteByJobId(id);
        jobRepository.deleteById(id);
        log.info("Job deleted: jobId={}", id);
    }

    /**
     * Freelancer applies to a job.
     */
    public Map<String, String> applyToJob(Long jobId, Long userId, Double bidAmount) {
        Map<String, String> response = new HashMap<>();

        Job job = getJobById(jobId);

        if ("CLOSED".equals(job.getStatus())) {
            log.warn("Apply attempt on closed job: jobId={}, userId={}", jobId, userId);
            response.put("message", "This job is closed. Applications are no longer accepted.");
            return response;
        }

        User freelancerCheck = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        boolean hasSkills = freelancerCheck.getSkills() != null
                && !freelancerCheck.getSkills().trim().isEmpty();
        boolean hasBio = freelancerCheck.getBio() != null
                && !freelancerCheck.getBio().trim().isEmpty();
        boolean hasProfessionalProfile = freelancerProfileService.isProfileComplete(userId);

        if (!hasSkills || !hasBio || !hasProfessionalProfile) {
            log.warn("Apply blocked — incomplete profile: userId={}", userId);
            response.put("message", "Please complete your profile before applying.");
            return response;
        }

        if (hasUserAlreadyApplied(jobId, userId)) {
            log.warn("Duplicate apply attempt: jobId={}, userId={}", jobId, userId);
            response.put("message", "Already Applied.");
            return response;
        }

        User freelancer = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Proposal proposal = new Proposal();
        proposal.setBidAmount(bidAmount != null && bidAmount > 0 ? bidAmount : 0.0);
        proposal.setStatus("PENDING");
        proposal.setJob(job);
        proposal.setFreelancer(freelancer);
        proposal.setAppliedAt(LocalDateTime.now());
        proposalRepository.save(proposal);

        if ("OPEN".equals(job.getStatus())) {
            job.setStatus("APPLIED");
            jobRepository.save(job);
        }

        JobApplication application = new JobApplication(jobId, userId, LocalDateTime.now());
        jobApplicationRepository.save(application);

        log.info("Job application created: jobId={}, userId={}, bidAmount={}", jobId, userId, bidAmount);
        response.put("message", "Applied successfully.");
        return response;
    }

    public boolean hasUserAlreadyApplied(Long jobId, Long freelancerId) {
        return proposalRepository.existsByJobIdAndFreelancerId(jobId, freelancerId);
    }

    public List<JobDTO> getJobsPostedByClient(String username) {
        User client = userRepository.findByUsername(username);
        if (client == null) {
            throw new UsernameNotFoundException("Client not found: " + username);
        }
        return jobRepository.findByClientOrderByCreatedAtDesc(client).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Job updateJobStatus(Long jobId, String status) {
        Job job = getJobById(jobId);

        if (status == null || status.trim().isEmpty()) {
            throw new BadRequestException("Status is required.");
        }

        String requestedStatus = status.trim().toUpperCase();
        String currentStatus = job.getStatus() != null ? job.getStatus().trim().toUpperCase() : "OPEN";

        if (!requestedStatus.equals("ACCEPTED") && !requestedStatus.equals("REJECTED")) {
            throw new IllegalArgumentException("Invalid status. Only ACCEPTED or REJECTED is allowed.");
        }

        if (!currentStatus.equals("APPLIED")) {
            throw new IllegalArgumentException(
                    "Only APPLIED jobs can be accepted or rejected. Current status: " + currentStatus);
        }

        job.setStatus(requestedStatus.equals("ACCEPTED") ? "ACCEPTED" : "OPEN");
        Job saved = jobRepository.save(job);
        log.info("Job status updated: jobId={}, status={}", jobId, saved.getStatus());
        return saved;
    }

    public Map<String, Object> getUserReport() {
        log.debug("Generating user report");
        List<User> allUsers = userRepository.findAll();

        List<User> clients = allUsers.stream()
                .filter(u -> u.getRole() == User.Role.CLIENT)
                .collect(Collectors.toList());

        List<User> freelancers = allUsers.stream()
                .filter(u -> u.getRole() == User.Role.FREELANCER)
                .collect(Collectors.toList());

        Map<String, Object> report = new HashMap<>();
        report.put("totalClients", clients.size());
        report.put("totalFreelancers", freelancers.size());
        report.put("clients", clients);
        report.put("freelancers", freelancers);
        return report;
    }

    private JobDTO toDTO(Job job) {
        Long clientId = job.getClient() != null ? job.getClient().getId() : null;
        String clientUsername = job.getClient() != null ? job.getClient().getUsername() : null;
        return new JobDTO(job.getId(), job.getTitle(), job.getDescription(),
                job.getBudget(), job.getStatus(), clientId, clientUsername);
    }
}
