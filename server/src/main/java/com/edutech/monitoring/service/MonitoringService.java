package com.edutech.monitoring.service;

import com.edutech.monitoring.dto.SystemHealthDTO;
import com.edutech.repository.UserRepository;
import com.edutech.repository.JobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.lang.management.RuntimeMXBean;

@Service
public class MonitoringService {

    private static final Logger log = LoggerFactory.getLogger(MonitoringService.class);

    @Autowired private UserRepository userRepository;
    @Autowired private JobRepository  jobRepository;

    public SystemHealthDTO getSystemHealth() {
        log.debug("Collecting system health metrics");

        Runtime runtime = Runtime.getRuntime();
        RuntimeMXBean runtimeMXBean = ManagementFactory.getRuntimeMXBean();

        long totalMemoryBytes = runtime.totalMemory();
        long freeMemoryBytes  = runtime.freeMemory();
        long maxMemoryBytes   = runtime.maxMemory();
        long usedMemoryBytes  = totalMemoryBytes - freeMemoryBytes;

        long totalMemoryMB = totalMemoryBytes / (1024 * 1024);
        long freeMemoryMB  = freeMemoryBytes  / (1024 * 1024);
        long heapUsedMB    = usedMemoryBytes  / (1024 * 1024);
        long heapMaxMB     = maxMemoryBytes   / (1024 * 1024);

        double heapUsagePercent = maxMemoryBytes > 0
                ? Math.round((double) usedMemoryBytes / maxMemoryBytes * 1000.0) / 10.0
                : 0;

        long uptimeMs      = runtimeMXBean.getUptime();
        long uptimeSeconds = uptimeMs / 1000;
        String uptimeFormatted = formatUptime(uptimeSeconds);

        // DB health check — quick count query
        String dbStatus = "UP";
        try {
            userRepository.count();
            jobRepository.count();
        } catch (Exception e) {
            log.warn("DB health check failed: {}", e.getMessage());
            dbStatus = "DOWN";
        }

        String overallStatus = "DOWN".equals(dbStatus) ? "DEGRADED" : "UP";

        SystemHealthDTO dto = new SystemHealthDTO();
        dto.setStatus(overallStatus);
        dto.setDbStatus(dbStatus);
        dto.setUptimeSeconds(uptimeSeconds);
        dto.setUptimeFormatted(uptimeFormatted);
        dto.setHeapUsedMB(heapUsedMB);
        dto.setHeapMaxMB(heapMaxMB);
        dto.setHeapUsagePercent(heapUsagePercent);
        dto.setTotalMemoryMB(totalMemoryMB);
        dto.setFreeMemoryMB(freeMemoryMB);
        dto.setJavaVersion(System.getProperty("java.version", "unknown"));
        dto.setSpringVersion(org.springframework.core.SpringVersion.getVersion());

        log.info("Health check: status={}, db={}, heap={}MB/{}MB ({:.1f}%)",
                overallStatus, dbStatus, heapUsedMB, heapMaxMB, heapUsagePercent);
        return dto;
    }

    private String formatUptime(long totalSeconds) {
        long days    = totalSeconds / 86400;
        long hours   = (totalSeconds % 86400) / 3600;
        long minutes = (totalSeconds % 3600)  / 60;
        long secs    = totalSeconds % 60;

        if (days > 0)  return days    + "d " + hours   + "h " + minutes + "m";
        if (hours > 0) return hours   + "h " + minutes + "m " + secs    + "s";
        return minutes + "m " + secs + "s";
    }
}
