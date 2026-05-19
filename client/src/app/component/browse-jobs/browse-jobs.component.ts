import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Job } from '../../model/job';
import { JobService } from '../../services/job.service';
import { AuthService } from '../../services/auth.service';
import { FreelancerProfileService } from '../../services/freelancer-profile.service';

@Component({
  selector: 'app-browse-jobs',
  templateUrl: './browse-jobs.component.html',
  styleUrls: ['./browse-jobs.component.scss']
})
export class BrowseJobsComponent implements OnInit, OnDestroy {
  allJobs: Job[] = [];
  jobs: Job[] = [];

  roleName: string | null = '';
  username: string = '';

  searchTitle: string = '';
  filterStatus: string = 'ALL';
  statusOptions: string[] = ['ALL', 'OPEN', 'APPLIED', 'CLOSED'];

  loading = false;

  bidFormJobId: number | null = null;
  bidAmount: number | null = null;
  applyingJobId: number | null = null;

  // Profile-incomplete toast
  showProfileIncompleteToast = false;
  profileToastMessage = 'Please complete your profile before applying.';

  // General toast
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' | 'warning' = 'info';
  toastVisible = false;
  private toastTimer: any;

  constructor(
    private jobService: JobService,
    public authService: AuthService,
    private freelancerProfileService: FreelancerProfileService,
    private router: Router
  ) {}

  ngOnDestroy(): void { if (this.toastTimer) clearTimeout(this.toastTimer); }

  ngOnInit(): void {
    this.roleName = this.authService.getRole();
    this.username =
      localStorage.getItem('username') || localStorage.getItem('name') || 'User';
    this.fetchJobs();
  }

  fetchJobs(): void {
    this.loading = true;
    this.jobService.getJobList().subscribe({
      next: (data) => {
        this.allJobs = data || [];
        this.applyFilters();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilters(): void {
    let filtered = [...this.allJobs];
    if (this.searchTitle.trim()) {
      const q = this.searchTitle.toLowerCase().trim();
      filtered = filtered.filter(j => j.title?.toLowerCase().includes(q));
    }
    if (this.filterStatus !== 'ALL') {
      filtered = filtered.filter(j => j.status === this.filterStatus);
    }
    this.jobs = filtered;
  }

  searchJobs(): void { this.applyFilters(); }

  clearSearch(): void {
    this.searchTitle = '';
    this.filterStatus = 'ALL';
    this.applyFilters();
  }

  setFilter(status: string): void {
    this.filterStatus = status;
    this.applyFilters();
  }

  getOpenCount(): number { return this.allJobs.filter(j => j.status === 'OPEN').length; }
  getAppliedCount(): number { return this.allJobs.filter(j => j.status === 'APPLIED').length; }

  isAlreadyApplied(job: Job): boolean {
    return job.status === 'APPLIED';
  }

  isApplying(jobId: number | undefined): boolean {
    return this.applyingJobId === (jobId ?? null);
  }

  /** Validate profile completeness, then open the bid form */
  openBidForm(job: Job): void {
    if (this.roleName !== 'FREELANCER') return;

    const userId = this.authService.getUserId();

    // Check freelancer profile completeness via the service
    this.freelancerProfileService.getProfile(userId).subscribe({
      next: (fp) => {
        const hasExperience = fp?.experienceYears != null;
        const hasEducation = fp?.highestEducation && fp.highestEducation.trim() !== '';

        // Also need to check user skills/bio — fetch from localStorage-cached profile
        // The backend also enforces this but we give a frontend guard too
        const userStr = localStorage.getItem('userProfile');
        let hasSkills = false;
        let hasBio = false;
        if (userStr) {
          try {
            const u = JSON.parse(userStr);
            hasSkills = !!u.skills?.trim();
            hasBio = !!u.bio?.trim();
          } catch {}
        }

        if (!hasExperience || !hasEducation) {
          this.triggerProfileToast('Please complete your professional profile (Experience & Education) before applying.');
          return;
        }

        this.bidFormJobId = job.id ?? null;
        this.bidAmount = null;
      },
      error: () => {
        // Profile doesn't exist
        this.triggerProfileToast('Please complete your professional profile before applying.');
      }
    });
  }

  cancelBidForm(): void {
    this.bidFormJobId = null;
    this.bidAmount = null;
  }

  /** Submit application with bid amount */
  submitApplication(job: Job): void {
    if (!job.id) return;

    if (!this.bidAmount || this.bidAmount <= 0) {
      alert('Please enter a valid bid amount greater than 0.');
      return;
    }

    const userId = Number(localStorage.getItem('userId') || '0');
    if (!userId) {
      alert('Session expired. Please login again.');
      this.router.navigate(['/login']);
      return;
    }

    this.applyingJobId = job.id;

    this.jobService.applyToJob(job.id, userId, this.bidAmount).subscribe({
      next: (res) => {
        this.applyingJobId = null;
        this.cancelBidForm();
        const msg: string = res?.message || '';

        if (msg.toLowerCase().includes('complete your profile')) {
          this.triggerProfileToast(msg);
        } else if (msg.toLowerCase().includes('already')) {
          this.showToast('You have already applied to this job.', 'warning');
        } else if (msg.toLowerCase().includes('closed')) {
          this.showToast('This job is closed. Applications are no longer accepted.', 'warning');
        } else {
          this.showToast('Applied successfully! Good luck! 🎉', 'success');
          this.allJobs = this.allJobs.map(j =>
            j.id === job.id ? { ...j, status: 'APPLIED' } : j
          );
          this.applyFilters();
        }
      },
      error: (err) => {
        this.applyingJobId = null;
        this.cancelBidForm();
        const msg = err?.error?.message || 'Failed to apply. Please try again.';
        if (msg.toLowerCase().includes('complete your profile')) {
          this.triggerProfileToast(msg);
        } else {
          this.showToast(msg || 'Failed to apply. Please try again.', 'error');
        }
      }
    });
  }

  showToast(message: string, type: 'success'|'error'|'info'|'warning' = 'info'): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage = message; this.toastType = type; this.toastVisible = true;
    this.toastTimer = setTimeout(() => { this.toastVisible = false; }, 4000);
  }
  dismissToast(): void { this.toastVisible = false; }

  triggerProfileToast(msg?: string): void {
    this.profileToastMessage = msg || 'Please complete your profile before applying.';
    this.showProfileIncompleteToast = true;
    setTimeout(() => { this.showProfileIncompleteToast = false; }, 4000);
  }

  goToProfile(): void {
    this.showProfileIncompleteToast = false;
    this.router.navigate(['/my-profile']);
  }

  getStatusClass(status: string | undefined): string {
    const map: any = {
      OPEN: 'status-open', APPLIED: 'status-applied',
      CLOSED: 'status-closed', PENDING: 'status-pending'
    };
    return map[status || 'OPEN'] || 'status-open';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
