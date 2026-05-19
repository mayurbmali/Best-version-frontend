package com.edutech.monitoring.controller;

import com.edutech.monitoring.dto.SystemHealthDTO;
import com.edutech.monitoring.service.MonitoringService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/system")
@CrossOrigin(origins = "*")
public class MonitoringController {

    private static final Logger log = LoggerFactory.getLogger(MonitoringController.class);

    @Autowired
    private MonitoringService monitoringService;

    /**
     * GET /api/admin/system/health
     * Admin-only — returns JVM memory, DB status, and uptime.
     */
    @GetMapping("/health")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<SystemHealthDTO> getSystemHealth() {
        log.info("Admin: system health check requested");
        return ResponseEntity.ok(monitoringService.getSystemHealth());
    }
}
