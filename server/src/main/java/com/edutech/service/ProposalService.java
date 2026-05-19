package com.edutech.service;

import com.edutech.dto.FreelancerProfileDTO;
import com.edutech.dto.ProposalWithProfileDTO;
import com.edutech.entity.Job;
import com.edutech.entity.Proposal;
import com.edutech.entity.User;
import com.edutech.exception.ResourceNotFoundException;
import com.edutech.repository.FreelancerProfileRepository;
import com.edutech.repository.JobRepository;
import com.edutech.repository.ProposalRepository;
import com.edutech.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProposalService {

    private static final Logger log = LoggerFactory.getLogger(ProposalService.class);

    @Autowired private ProposalRepository proposalRepository;
    @Autowired private JobRepository jobRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private FreelancerProfileRepository freelancerProfileRepository;

    public Proposal createProposal(Long freelancerId, Proposal proposal) {
        User freelancer = userRepository.findById(freelancerId)
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer", freelancerId));

        proposal.setFreelancer(freelancer);

        if (proposal.getJob() != null && proposal.getJob().getId() != null) {
            Job job = jobRepository.findById(proposal.getJob().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Job", proposal.getJob().getId()));
            proposal.setJob(job);
        }

        if (proposal.getStatus() == null) {
            proposal.setStatus("PENDING");
        }
        if (proposal.getAppliedAt() == null) {
            proposal.setAppliedAt(LocalDateTime.now());
        }

        Proposal saved = proposalRepository.save(proposal);
        log.info("Proposal created: proposalId={}, freelancerId={}, jobId={}",
                saved.getId(), freelancerId,
                proposal.getJob() != null ? proposal.getJob().getId() : null);
        return saved;
    }

    public List<Proposal> getAllProposals() {
        return proposalRepository.findAll();
    }

    public Optional<Proposal> getProposalById(Long id) {
        return proposalRepository.findById(id);
    }

    public Proposal updateProposal(Long id, Proposal proposalDetails) {
        Proposal existing = proposalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal", id));
        existing.setBidAmount(proposalDetails.getBidAmount());
        existing.setStatus(proposalDetails.getStatus());
        Proposal saved = proposalRepository.save(existing);
        log.info("Proposal updated: proposalId={}, status={}", id, saved.getStatus());
        return saved;
    }

    public void deleteProposal(Long id) {
        log.info("Deleting proposal: proposalId={}", id);
        proposalRepository.deleteById(id);
    }

    public List<Proposal> getProposalsByFreelancerUsername(String username) {
        User freelancer = userRepository.findByUsername(username);
        if (freelancer == null) {
            throw new UsernameNotFoundException("Freelancer not found: " + username);
        }
        return proposalRepository.findByFreelancerId(freelancer.getId());
    }

    public List<Proposal> getProposalsByJobId(Long jobId) {
        return proposalRepository.findByJobId(jobId);
    }

    public List<ProposalWithProfileDTO> getProposalsByJobIdWithProfile(Long jobId) {
        List<Proposal> proposals = proposalRepository.findByJobId(jobId);
        return proposals.stream()
                .map(this::toProposalWithProfileDTO)
                .collect(Collectors.toList());
    }

    private ProposalWithProfileDTO toProposalWithProfileDTO(Proposal proposal) {
        ProposalWithProfileDTO dto = new ProposalWithProfileDTO();
        dto.setId(proposal.getId());
        dto.setBidAmount(proposal.getBidAmount());
        dto.setStatus(proposal.getStatus());
        dto.setAppliedAt(proposal.getAppliedAt());

        if (proposal.getJob() != null) {
            Job job = proposal.getJob();
            dto.setJob(new ProposalWithProfileDTO.JobSummary(
                    job.getId(), job.getTitle(), job.getStatus(), job.getBudget()));
        }

        if (proposal.getFreelancer() != null) {
            User f = proposal.getFreelancer();
            ProposalWithProfileDTO.FreelancerSummary fs = new ProposalWithProfileDTO.FreelancerSummary();
            fs.setId(f.getId());
            fs.setUsername(f.getUsername());
            fs.setEmail(f.getEmail());
            fs.setContactNumber(f.getContactNumber());
            fs.setSkills(f.getSkills());
            fs.setBio(f.getBio());
            fs.setRole(f.getRole() != null ? f.getRole().name() : null);
            dto.setFreelancer(fs);

            freelancerProfileRepository.findByUserId(f.getId()).ifPresent(fp -> {
                FreelancerProfileDTO profileDTO = new FreelancerProfileDTO(
                        fp.getId(), f.getId(), fp.getExperienceYears(),
                        fp.getHighestEducation(), fp.getLinkedinUrl(), fp.getGithubUrl());
                dto.setFreelancerProfile(profileDTO);
            });
        }

        return dto;
    }

    @Transactional
    public Proposal acceptProposal(Long proposalId) {
        Proposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal", proposalId));

        proposal.setStatus("APPROVED");
        proposalRepository.save(proposal);

        Job job = proposal.getJob();
        job.setStatus("CLOSED");
        jobRepository.save(job);

        List<Proposal> others = proposalRepository.findByJobId(job.getId());
        for (Proposal other : others) {
            if (!other.getId().equals(proposalId) && "PENDING".equals(other.getStatus())) {
                other.setStatus("REJECTED");
                proposalRepository.save(other);
            }
        }

        log.info("Proposal accepted: proposalId={}, jobId={} closed", proposalId, job.getId());
        return proposal;
    }

    public Proposal rejectProposal(Long proposalId) {
        Proposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal", proposalId));
        proposal.setStatus("REJECTED");
        Proposal saved = proposalRepository.save(proposal);
        log.info("Proposal rejected: proposalId={}", proposalId);
        return saved;
    }
}
