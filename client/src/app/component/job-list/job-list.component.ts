// import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';

// import { Job } from '../../model/job';
// import { JobService } from '../../services/job.service';
// import { AuthService } from '../../services/auth.service';

// @Component({
//   selector: 'app-job-list',
//   templateUrl: './job-list.component.html',
//   styleUrls: ['./job-list.component.scss']
// })
// export class JobListComponent implements OnInit {
//   jobs: Job[] = [];
//   allJobs: Job[] = [];
//   roleName = '';
//   searchTitle = '';
//   loading = true;

//   constructor(
//     private jobService: JobService,
//     private authService: AuthService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.roleName = this.authService.getRole() || '';
//     this.loadJobs();
//   }

//   loadJobs(): void {
//     this.loading = true;
//     this.jobService.getJobList().subscribe({
//       next: (jobs) => {
//         this.allJobs = jobs;
//         this.jobs = [...jobs];
//         this.loading = false;
//       },
//       error: () => { this.loading = false; }
//     });
//   }

//   searchJobs(): void {
//     if (!this.searchTitle.trim()) {
//       this.jobs = [...this.allJobs];
//     } else {
//       this.jobs = this.allJobs.filter(j =>
//         j.title.toLowerCase().includes(this.searchTitle.toLowerCase())
//       );
//     }
//   }

//   applyJob(jobId: number | undefined): void {
//     if (!jobId) return;
//     const userId = this.authService.getUserId();
//     this.jobService.applyToJob(jobId, userId).subscribe({
//       next: (res) => {
//         const msg = res?.message || 'Applied!';
//         alert(msg);
//         if (msg.toLowerCase().includes('success') || msg.toLowerCase().includes('applied')) {
//           const job = this.jobs.find(j => j.id === jobId);
//           if (job) job.status = 'APPLIED';
//         }
//       },
//       error: (err) => {
//         if (err.status === 409) {
//           alert('Already Applied.');
//         } else {
//           const msg = err?.error?.message || 'Failed to apply. Please try again.';
//           alert(msg);
//         }
//       }
//     });
//   }

//   deleteJob(jobId: number | undefined): void {
//     if (!jobId) return;
//     if (!confirm('Are you sure you want to delete this job?')) return;
//     this.jobService.deleteJob(jobId).subscribe({
//       next: () => {
//         this.allJobs = this.allJobs.filter(j => j.id !== jobId);
//         this.jobs = this.jobs.filter(j => j.id !== jobId);
//       },
//       error: () => alert('Failed to delete job.')
//     });
//   }

//   getStatusClass(status: string): string {
//     const map: any = {
//       'OPEN': 'status-open', 'APPLIED': 'status-applied',
//       'CLOSED': 'status-closed', 'ACCEPTED': 'status-accepted',
//       'REJECTED': 'status-rejected', 'PENDING': 'status-pending'
//     };
//     return map[status] || 'status-open';
//   }

//   logout(): void {
//     this.authService.logout();
//     this.router.navigate(['/login']);
//   }
// }

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Job } from '../../model/job';
import { JobService } from '../../services/job.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.scss']
})
export class JobListComponent implements OnInit {
  job: Job[] = [];
  allJobs: Job[] = [];
  roleName: string | null = '';
  searchTitle: string = '';
  loading = false;

  constructor(
    private jobService: JobService,
    public authService: AuthService,
    private router: Router
  ) {}

  get jobs(): Job[] {
    return this.job;
  }

  set jobs(value: Job[]) {
    this.job = value;
  }

  ngOnInit(): void {
    this.roleName = this.authService.getRole();
    this.fetchJobs();
  }

  fetchJobs(): void {
    this.loading = true;

    this.jobService.getJobList().subscribe({
      next: (data) => {
        this.job = data;
        this.allJobs = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error fetching jobs', err);
      }
    });
  }

  loadJobs(): void {
    this.fetchJobs();
  }

  applyJob(jobId: number | undefined): void {
    if (jobId === undefined || jobId === null) {
      return;
    }

    const userId = Number(
      localStorage.getItem('userId') ||
      localStorage.getItem('id') ||
      '1'
    );

    this.jobService.applyToJob(jobId, userId).subscribe({
      next: () => {
        alert('Applied successfully');

        this.job = this.job.map(j =>
          j.id === jobId ? { ...j, status: 'APPLIED' } : j
        );

        this.allJobs = this.allJobs.map(j =>
          j.id === jobId ? { ...j, status: 'APPLIED' } : j
        );
      },
      error: (err) => {
        if (err.status === 409) {
          alert('You have already applied to this job.');
        } else {
          alert('Failed to apply. Please try again.');
          console.error('Error details:', err);
        }
      }
    });
  }

  searchJobs(): void {
    if (this.searchTitle.trim() === '') {
      this.job = [...this.allJobs];
    } else {
      this.job = this.allJobs.filter(j =>
        j.title?.toLowerCase().includes(this.searchTitle.toLowerCase())
      );
    }
  }

  deleteJob(jobId: number | undefined): void {
    if (jobId === undefined || jobId === null) {
      return;
    }

    if (!confirm('Are you sure you want to delete this job?')) {
      return;
    }

    const service: any = this.jobService;

    if (service.deleteJob) {
      service.deleteJob(jobId).subscribe({
        next: () => {
          this.allJobs = this.allJobs.filter(j => j.id !== jobId);
          this.job = this.job.filter(j => j.id !== jobId);
        },
        error: () => {
          alert('Failed to delete job.');
        }
      });
    }
  }

  getStatusClass(status: string | undefined): string {
    const map: any = {
      OPEN: 'status-open',
      APPLIED: 'status-applied',
      CLOSED: 'status-closed',
      ACCEPTED: 'status-accepted',
      REJECTED: 'status-rejected',
      PENDING: 'status-pending'
    };

    return map[status || 'OPEN'] || 'status-open';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}