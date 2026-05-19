import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminService } from '../../../../services/admin.service';

@Component({
  selector: 'app-admin-monitoring',
  templateUrl: './admin-monitoring.component.html',
  styleUrls: ['./admin-monitoring.component.scss']
})
export class AdminMonitoringComponent implements OnInit, OnDestroy {
  health: any = null;
  loading = true;
  error = false;
  private refreshTimer: any;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.fetchHealth();
    this.refreshTimer = setInterval(() => this.fetchHealth(), 30000); // refresh every 30s
  }

  fetchHealth(): void {
    this.adminService.getSystemHealth().subscribe({
      next: (data) => { this.health = data; this.loading = false; this.error = false; },
      error: () => { this.loading = false; this.error = true; }
    });
  }

  get statusColor(): string {
    if (!this.health) return '#64748b';
    const s = this.health.status;
    if (s === 'UP') return '#34d399';
    if (s === 'DEGRADED') return '#fbbf24';
    return '#f87171';
  }

  get statusBg(): string {
    if (!this.health) return 'rgba(100,116,139,0.1)';
    const s = this.health.status;
    if (s === 'UP') return 'rgba(16,185,129,0.12)';
    if (s === 'DEGRADED') return 'rgba(245,158,11,0.12)';
    return 'rgba(239,68,68,0.12)';
  }

  get statusBorder(): string {
    if (!this.health) return 'rgba(100,116,139,0.2)';
    const s = this.health.status;
    if (s === 'UP') return 'rgba(16,185,129,0.22)';
    if (s === 'DEGRADED') return 'rgba(245,158,11,0.22)';
    return 'rgba(239,68,68,0.22)';
  }

  get statusIcon(): string {
    if (!this.health) return '⚪';
    const s = this.health.status;
    if (s === 'UP') return '🟢';
    if (s === 'DEGRADED') return '🟡';
    return '🔴';
  }

  get dbStatusColor(): string {
    return this.health?.dbStatus === 'UP' ? '#34d399' : '#f87171';
  }

  get heapPct(): number { return this.health?.heapUsagePercent || 0; }

  get heapColor(): string {
    const p = this.heapPct;
    if (p < 60) return '#34d399';
    if (p < 80) return '#fbbf24';
    return '#f87171';
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
  }
}
