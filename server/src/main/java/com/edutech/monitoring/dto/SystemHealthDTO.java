package com.edutech.monitoring.dto;

public class SystemHealthDTO {

    private String status;          // UP | DOWN | DEGRADED
    private String dbStatus;        // UP | DOWN
    private long   uptimeSeconds;
    private String uptimeFormatted;
    private long   heapUsedMB;
    private long   heapMaxMB;
    private double heapUsagePercent;
    private long   totalUsersMB;    // metadata — not heap, reuses field for total DB records context
    private String javaVersion;
    private String springVersion;
    private long   totalMemoryMB;
    private long   freeMemoryMB;

    public SystemHealthDTO() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDbStatus() { return dbStatus; }
    public void setDbStatus(String dbStatus) { this.dbStatus = dbStatus; }

    public long getUptimeSeconds() { return uptimeSeconds; }
    public void setUptimeSeconds(long uptimeSeconds) { this.uptimeSeconds = uptimeSeconds; }

    public String getUptimeFormatted() { return uptimeFormatted; }
    public void setUptimeFormatted(String uptimeFormatted) { this.uptimeFormatted = uptimeFormatted; }

    public long getHeapUsedMB() { return heapUsedMB; }
    public void setHeapUsedMB(long heapUsedMB) { this.heapUsedMB = heapUsedMB; }

    public long getHeapMaxMB() { return heapMaxMB; }
    public void setHeapMaxMB(long heapMaxMB) { this.heapMaxMB = heapMaxMB; }

    public double getHeapUsagePercent() { return heapUsagePercent; }
    public void setHeapUsagePercent(double heapUsagePercent) { this.heapUsagePercent = heapUsagePercent; }

    public String getJavaVersion() { return javaVersion; }
    public void setJavaVersion(String javaVersion) { this.javaVersion = javaVersion; }

    public String getSpringVersion() { return springVersion; }
    public void setSpringVersion(String springVersion) { this.springVersion = springVersion; }

    public long getTotalMemoryMB() { return totalMemoryMB; }
    public void setTotalMemoryMB(long totalMemoryMB) { this.totalMemoryMB = totalMemoryMB; }

    public long getFreeMemoryMB() { return freeMemoryMB; }
    public void setFreeMemoryMB(long freeMemoryMB) { this.freeMemoryMB = freeMemoryMB; }
}
