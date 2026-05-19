package com.edutech.analytics.controller;

import com.edutech.analytics.dto.ActivityEventDTO;
import com.edutech.analytics.dto.FreelancerInsightDTO;
import com.edutech.analytics.dto.JobInsightsDTO;
import com.edutech.analytics.dto.PlatformOverviewDTO;
import com.edutech.analytics.service.AnalyticsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsController.class);

    @Autowired
    private AnalyticsService analyticsService;

    /**
     * GET /api/admin/analytics/overview
     * Full platform overview — KPIs for the admin dashboard header.
     */
    @GetMapping("/overview")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<PlatformOverviewDTO> getOverview() {
        log.info("Admin: platform overview requested");
        return ResponseEntity.ok(analyticsService.getPlatformOverview());
    }

    /**
     * GET /api/admin/analytics/activity?limit=30
     * Recent platform activity feed.
     */
    @GetMapping("/activity")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<ActivityEventDTO>> getActivity(
            @RequestParam(defaultValue = "30") int limit) {
        log.debug("Admin: activity feed requested, limit={}", limit);
        return ResponseEntity.ok(analyticsService.getRecentActivity(limit));
    }

    /**
     * GET /api/admin/analytics/freelancers
     * Freelancer insights — sorted by performance.
     */
    @GetMapping("/freelancers")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<FreelancerInsightDTO>> getFreelancerInsights() {
        log.debug("Admin: freelancer insights requested");
        return ResponseEntity.ok(analyticsService.getFreelancerInsights());
    }

    /**
     * GET /api/admin/analytics/jobs
     * Job insights — status breakdown and engagement metrics.
     */
    @GetMapping("/jobs")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<JobInsightsDTO> getJobInsights() {
        log.debug("Admin: job insights requested");
        return ResponseEntity.ok(analyticsService.getJobInsights());
    }
}
