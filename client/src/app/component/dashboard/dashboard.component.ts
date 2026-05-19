import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { JobService } from '../../services/job.service';
import { ProposalService } from '../../services/proposal.service';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  roleName: string = '';
  username: string = '';
  stats: any = {};
  recentJobs: any[] = [];
  recentProposals: any[] = [];

  // ── Admin section state ──────────────────────────────────────────────────
  adminSection: string = 'overview';
  adminOverview: any     = null;
  adminActivities: any[] = [];
  adminFreelancers: any[]= [];
  adminJobInsights: any  = null;
  adminOverviewLoading    = true;
  adminActivitiesLoading  = true;
  adminFreelancersLoading = true;
  adminJobInsightsLoading = true;

  readonly adminTabs = [
    { key: 'overview',   icon: '⬡',  label: 'Overview'  },
    { key: 'analytics',  icon: '📊', label: 'Analytics' },
    { key: 'activity',   icon: '⚡',  label: 'Activity'  },
    { key: 'insights',   icon: '🔍', label: 'Insights'  },
    { key: 'monitoring', icon: '🖥️', label: 'Monitoring'},
  ];

  constructor(
    private authService: AuthService,
    private jobService: JobService,
    private proposalService: ProposalService,
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.roleName = this.authService.getRole() || '';
    this.username = localStorage.getItem('username') || 'User';
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    if (this.roleName === 'ADMIN') {
      this.loadAdminData();
      this.jobService.getJobList().subscribe({
        next: (jobs) => { this.recentJobs = jobs.slice(0, 4); },
        error: () => {}
      });
    } else if (this.roleName === 'CLIENT') {
      this.jobService.getMyJobs().subscribe({
        next: (jobs) => {
          this.recentJobs = jobs.slice(0, 4);
          this.stats.totalJobs   = jobs.length;
          this.stats.openJobs    = jobs.filter((j: any) => j.status === 'OPEN').length;
          this.stats.appliedJobs = jobs.filter((j: any) => j.status === 'APPLIED').length;
        },
        error: () => {}
      });
    } else if (this.roleName === 'FREELANCER') {
      this.jobService.getJobList().subscribe({
        next: (jobs) => { this.recentJobs = jobs.slice(0, 4); this.stats.totalJobs = jobs.length; },
        error: () => {}
      });
      this.proposalService.getMyProposals().subscribe({
        next: (p) => {
          this.recentProposals = p.slice(0, 3);
          this.stats.totalProposals    = p.length;
          this.stats.approvedProposals = p.filter((x: any) => x.status === 'ACCEPTED' || x.status === 'APPROVED').length;
        },
        error: () => {}
      });
    }
  }

  loadAdminData(): void {
    this.adminService.getPlatformOverview().subscribe({
      next: (d) => { this.adminOverview = d; this.adminOverviewLoading = false; },
      error: () => { this.adminOverviewLoading = false; }
    });
    this.adminService.getActivityFeed(30).subscribe({
      next: (d) => { this.adminActivities = d; this.adminActivitiesLoading = false; },
      error: () => { this.adminActivitiesLoading = false; }
    });
    this.adminService.getFreelancerInsights().subscribe({
      next: (d) => { this.adminFreelancers = d; this.adminFreelancersLoading = false; },
      error: () => { this.adminFreelancersLoading = false; }
    });
    this.adminService.getJobInsights().subscribe({
      next: (d) => { this.adminJobInsights = d; this.adminJobInsightsLoading = false; },
      error: () => { this.adminJobInsightsLoading = false; }
    });
  }

  setAdminSection(section: string): void { this.adminSection = section; }

  navigate(path: string): void { this.router.navigate([path]); }

  logout(): void { this.authService.logout(); this.router.navigate(['/login']); }

  getStatusClass(status: string): string {
    const map: any = {
      'OPEN': 'status-open', 'APPLIED': 'status-applied',
      'CLOSED': 'status-closed', 'ACCEPTED': 'status-accepted',
      'REJECTED': 'status-rejected', 'PENDING': 'status-pending'
    };
    return map[status] || 'status-open';
  }
}
