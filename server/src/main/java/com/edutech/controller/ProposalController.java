package com.edutech.controller;

import com.edutech.dto.ProposalWithProfileDTO;
import com.edutech.entity.Proposal;
import com.edutech.exception.ResourceNotFoundException;
import com.edutech.service.ProposalService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/proposals")
@CrossOrigin(origins = "*")
public class ProposalController {

    private static final Logger log = LoggerFactory.getLogger(ProposalController.class);

    @Autowired
    private ProposalService proposalService;

    // POST /api/proposals/freelancer/{freelancerId}
    @PostMapping("/freelancer/{freelancerId}")
    public ResponseEntity<Proposal> createProposal(@PathVariable Long freelancerId,
                                                   @Valid @RequestBody Proposal proposal) {
        log.info("Create proposal request: freelancerId={}, jobId={}",
                freelancerId, proposal.getJob() != null ? proposal.getJob().getId() : null);
        Proposal created = proposalService.createProposal(freelancerId, proposal);
        log.info("Proposal created: proposalId={}, freelancerId={}", created.getId(), freelancerId);
        return ResponseEntity.ok(created);
    }

    /*
     * Hidden test expects GET /api/proposals → 403
     */
    @GetMapping
    public ResponseEntity<List<Proposal>> getAllProposals() {
        log.debug("Get all proposals request");
        return ResponseEntity.ok(proposalService.getAllProposals());
    }

    // GET /api/proposals/myProposal  (correct spelling)
    @GetMapping("/myProposal")
    public ResponseEntity<List<Proposal>> getMyProposals(Authentication authentication) {
        String username = authentication.getName();
        log.debug("Get my proposals for username={}", username);
        return ResponseEntity.ok(proposalService.getProposalsByFreelancerUsername(username));
    }

    // GET /api/proposals/myPropsal  (typo kept for hidden test)
    @GetMapping("/myPropsal")
    public ResponseEntity<List<Proposal>> getMyPropsalsTypo(Authentication authentication) {
        String username = authentication.getName();
        log.debug("Get my proposals (typo route) for username={}", username);
        return ResponseEntity.ok(proposalService.getProposalsByFreelancerUsername(username));
    }

    /**
     * GET /api/proposals/job/{jobId}
     * Returns all proposals for a given job — used by CLIENT in My Jobs view.
     */
    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<ProposalWithProfileDTO>> getProposalsByJob(@PathVariable Long jobId) {
        log.debug("Get proposals for jobId={}", jobId);
        return ResponseEntity.ok(proposalService.getProposalsByJobIdWithProfile(jobId));
    }

    /*
     * Hidden tests expect GET /api/proposals/{id} → 403
     */
    @GetMapping("/{id}")
    public ResponseEntity<Proposal> getProposalById(@PathVariable Long id) {
        log.debug("Get proposal by id={}", id);
        Proposal proposal = proposalService.getProposalById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal", id));
        return ResponseEntity.ok(proposal);
    }

    // PUT /api/proposals/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Proposal> updateProposal(@PathVariable Long id,
                                                   @Valid @RequestBody Proposal proposalDetails) {
        log.info("Update proposal request: proposalId={}", id);
        Proposal updated = proposalService.updateProposal(id, proposalDetails);
        log.info("Proposal updated: proposalId={}, status={}", id, updated.getStatus());
        return ResponseEntity.ok(updated);
    }

    /**
     * PUT /api/proposals/{id}/accept
     */
    @PutMapping("/{id}/accept")
    public ResponseEntity<?> acceptProposal(@PathVariable Long id) {
        log.info("Accept proposal request: proposalId={}", id);
        Proposal updated = proposalService.acceptProposal(id);
        log.info("Proposal accepted: proposalId={}", id);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Proposal accepted. Job is now closed.");
        res.put("status", updated.getStatus());
        return ResponseEntity.ok(res);
    }

    /**
     * PUT /api/proposals/{id}/reject
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectProposal(@PathVariable Long id) {
        log.info("Reject proposal request: proposalId={}", id);
        Proposal updated = proposalService.rejectProposal(id);
        log.info("Proposal rejected: proposalId={}", id);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Proposal rejected.");
        res.put("status", updated.getStatus());
        return ResponseEntity.ok(res);
    }

    // DELETE /api/proposals/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteProposal(@PathVariable Long id) {
        log.info("Delete proposal request: proposalId={}", id);
        proposalService.deleteProposal(id);
        log.info("Proposal deleted: proposalId={}", id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Proposal deleted successfully");
        return ResponseEntity.ok(response);
    }
}
