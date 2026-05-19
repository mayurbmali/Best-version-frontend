package com.edutech.controller;

import com.edutech.dto.ApplyJobRequest;
import com.edutech.dto.JobDTO;
import com.edutech.entity.Job;
import com.edutech.service.JobService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class JobController {

    private static final Logger log = LoggerFactory.getLogger(JobController.class);

    @Autowired
    private JobService jobService;

    // POST /api/jobs/client/{clientId}
    @PostMapping("/client/{clientId}")
    public ResponseEntity<Job> createJob(@PathVariable Long clientId,
            @Valid @RequestBody Job job) {
        log.info("Create job request by clientId={}, title={}", clientId, job.getTitle());
        Job created = jobService.createJob(clientId, job);
        log.info("Job created: jobId={}, title={}, clientId={}", created.getId(), created.getTitle(), clientId);
        return ResponseEntity.ok(created);
    }

    // GET /api/jobs
    @GetMapping
    public ResponseEntity<List<JobDTO>> getAllJobs() {
        log.debug("Get all jobs request");
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    // GET /api/jobs/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable Long id) {
        log.debug("Get job by id={}", id);
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    // PUT /api/jobs/status/{jobId}?status=
    @PutMapping("/status/{jobId}")
    public ResponseEntity<Map<String, String>> updateJobStatus(
            @PathVariable Long jobId,
            @RequestParam String status) {
        log.info("Update job status request: jobId={}, newStatus={}", jobId, status);
        Job updatedJob = jobService.updateJobStatus(jobId, status);
        log.info("Job status updated: jobId={}, status={}", jobId, updatedJob.getStatus());
        return ResponseEntity.ok(Map.of(
                "message", "Status updated successfully",
                "status", updatedJob.getStatus()));
    }

    /**
     * POST /api/jobs/{jobId}/apply
     * Body: { "userId": 1, "bidAmount": 4500 }
     */
    @PostMapping("/{jobId}/apply")
    public ResponseEntity<Map<String, String>> applyToJob(@PathVariable Long jobId,
            @Valid @RequestBody ApplyJobRequest body) {
        log.info("Apply to job: jobId={}, userId={}, bidAmount={}", jobId, body.getUserId(), body.getBidAmount());
        Double bidAmount = body.getBidAmount() != null ? body.getBidAmount() : 0.0;
        Map<String, String> response = jobService.applyToJob(jobId, body.getUserId(), bidAmount);
        log.info("Apply to job result: jobId={}, userId={}, message={}", jobId, body.getUserId(), response.get("message"));
        return ResponseEntity.ok(response);
    }

    // GET /api/jobs/my-jobs
    @GetMapping("/my-jobs")
    public ResponseEntity<List<JobDTO>> getMyJobs(Authentication authentication) {
        String username = authentication.getName();
        log.debug("Get my jobs for username={}", username);
        return ResponseEntity.ok(jobService.getJobsPostedByClient(username));
    }

    // DELETE /api/jobs/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteJob(@PathVariable Long id) {
        log.info("Delete job request: jobId={}", id);
        jobService.deleteJob(id);
        log.info("Job deleted: jobId={}", id);
        return ResponseEntity.ok(Map.of("message", "Job deleted successfully"));
    }

    // GET /api/jobs/report/users
    @GetMapping("/report/users")
    public ResponseEntity<Map<String, Object>> getUserReport() {
        log.debug("Get user report request");
        return ResponseEntity.ok(jobService.getUserReport());
    }

    // PUT /api/jobs/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> updateJob(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        log.info("Update job request: jobId={}, fields={}", id, body.keySet());
        Job updatedJob = jobService.updateJob(id, body);
        log.info("Job updated: jobId={}", id);
        return ResponseEntity.ok(updatedJob);
    }
}
