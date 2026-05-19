// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { Router } from '@angular/router';
// import { JobService } from '../../services/job.service';
// import { ProposalService } from '../../services/proposal.service';
// import { Job } from '../../model/job';
// import { Proposal } from '../../model/proposal';

// @Component({
//   selector: 'app-my-job',
//   templateUrl: './my-job.component.html',
//   styleUrls: ['./my-job.component.scss']
// })
// export class MyJobComponent implements OnInit, OnDestroy {
//   jobs: Job[] = [];
//   loading = false;
//   roleName = '';

//   // Map of jobId → proposals for that job
//   proposalsMap: { [jobId: number]: Proposal[] } = {};
//   loadingProposals: { [jobId: number]: boolean } = {};

//   // Track in-progress accept/reject requests by proposalId
//   updatingProposalIds = new Set<number>();

  // Delete confirmation
  // confirmDeleteJobId: number | null = null;

  // // Toast
  // toastMessage = '';
  // toastType: 'success' | 'error' | 'info' | 'warning' = 'info';
  // toastVisible = false;
  // private toastTimer: any;

//   // Track which proposal card is expanded to show full details
//   expandedProposalId: number | null = null;

//   // Inline edit state
//   editingJobId: number | null = null;
//   editForm = { title: '', description: '', budget: 0 };

//   constructor(
//     private jobService: JobService,
//     private proposalService: ProposalService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.roleName = localStorage.getItem('role') || '';
//     this.loadMyJobs();
//   }

//   loadMyJobs(): void {
//     this.loading = true;
//     this.jobService.getMyJobs().subscribe({
//       next: (data: Job[]) => {
//         this.jobs = data;
//         this.loading = false;
//         this.jobs.forEach(job => {
//           if (job.id) this.loadProposals(job.id);
//         });
//       },
//       error: () => { this.loading = false; }
//     });
//   }

//   loadProposals(jobId: number): void {
//     this.loadingProposals[jobId] = true;
//     this.proposalService.getProposalsByJob(jobId).subscribe({
//       next: (proposals: Proposal[]) => {
//         this.proposalsMap[jobId] = proposals;
//         this.loadingProposals[jobId] = false;
//       },
//       error: () => {
//         this.proposalsMap[jobId] = [];
//         this.loadingProposals[jobId] = false;
//       }
//     });
//   }

//   getProposals(jobId: number | undefined): Proposal[] {
//     if (!jobId) return [];
//     return this.proposalsMap[jobId] || [];
//   }

//   isLoadingProposals(jobId: number | undefined): boolean {
//     if (!jobId) return false;
//     return !!this.loadingProposals[jobId];
//   }

//   toggleProposalDetails(proposalId: number | undefined): void {
//     if (!proposalId) return;
//     this.expandedProposalId = this.expandedProposalId === proposalId ? null : proposalId;
//   }

//   isExpanded(proposalId: number | undefined): boolean {
//     return !!proposalId && this.expandedProposalId === proposalId;
//   }

//   acceptProposal(proposal: Proposal, job: Job): void {
//     if (!proposal.id) return;
//     if (this.updatingProposalIds.has(proposal.id)) return;

//     this.updatingProposalIds.add(proposal.id);

//     this.proposalService.acceptProposal(proposal.id).subscribe({
//       next: () => {
//         this.updatingProposalIds.delete(proposal.id!);
//         job.status = 'CLOSED';
//         if (job.id) {
//           const proposals = this.proposalsMap[job.id] || [];
//           this.proposalsMap[job.id] = proposals.map(p => ({
//             ...p,
//             status: p.id === proposal.id ? 'APPROVED'
//                   : p.status === 'PENDING' ? 'REJECTED'
//                   : p.status
//           }));
//         }
//       },
//       error: (err) => {
//         this.updatingProposalIds.delete(proposal.id!);
//         const msg = err?.error?.message || 'Failed to accept proposal.';
//         alert(msg);
//       }
//     });
//   }

//   rejectProposal(proposal: Proposal, job: Job): void {
//     if (!proposal.id) return;
//     if (this.updatingProposalIds.has(proposal.id)) return;

//     this.updatingProposalIds.add(proposal.id);

//     this.proposalService.rejectProposal(proposal.id).subscribe({
//       next: () => {
//         this.updatingProposalIds.delete(proposal.id!);
//         if (job.id) {
//           this.proposalsMap[job.id] = (this.proposalsMap[job.id] || []).map(p =>
//             p.id === proposal.id ? { ...p, status: 'REJECTED' } : p
//           );
//         }
//       },
//       error: (err) => {
//         this.updatingProposalIds.delete(proposal.id!);
//         const msg = err?.error?.message || 'Failed to reject proposal.';
//         alert(msg);
//       }
//     });
//   }

//   isUpdatingProposal(proposalId: number | undefined): boolean {
//     if (!proposalId) return false;
//     return this.updatingProposalIds.has(proposalId);
//   }

//   startEdit(job: Job): void {
//     if (!job.id) return;
//     this.editingJobId = job.id;
//     this.editForm = {
//       title: job.title || '',
//       description: job.description || '',
//       budget: Number(job.budget) || 0
//     };
//   }

//   cancelEdit(): void {
//     this.editingJobId = null;
//     this.editForm = { title: '', description: '', budget: 0 };
//   }

//   saveJob(job: Job): void {
//     if (!job.id) return;
//     if (!this.editForm.title.trim()) { this.showToast('Job title is required.', 'warning'); return; }
//     if (!this.editForm.description.trim()) { this.showToast('Job description is required.', 'warning'); return; }
//     if (this.editForm.budget <= 0) { this.showToast('Budget must be greater than 0.', 'warning'); return; }

//     const payload = {
//       title: this.editForm.title.trim(),
//       description: this.editForm.description.trim(),
//       budget: this.editForm.budget
//     };

//     this.jobService.updateJob(job.id, payload).subscribe({
//       next: (updated: Job) => {
//         this.jobs = this.jobs.map(j =>
//           j.id === job.id
//             ? { ...j, title: updated.title, description: updated.description, budget: updated.budget }
//             : j
//         );
//         this.cancelEdit();
//       },
//       error: () => this.showToast('Failed to update job. Please try again.', 'error')
//     });
//   }

//   deleteJob(jobId: number | undefined): void {
//     if (!jobId || !confirm('Delete this job?')) return;
//     this.jobService.deleteJob(jobId).subscribe({
//       next: () => {
//         this.jobs = this.jobs.filter(j => j.id !== jobId);
//         delete this.proposalsMap[jobId];
//       },
//       error: () => this.showToast('Failed to delete job. Please try again.', 'error')
//     });
//   }

//   getStatusClass(status: string | undefined): string {
//     const map: { [k: string]: string } = {
//       OPEN: 'status-open', APPLIED: 'status-applied',
//       CLOSED: 'status-closed', ACCEPTED: 'status-accepted',
//       REJECTED: 'status-rejected', PENDING: 'status-pending',
//       APPROVED: 'status-accepted'
//     };
//     return map[status || 'OPEN'] || 'status-open';
//   }

//   logout(): void {
//     localStorage.clear();
//     this.router.navigate(['/login']);
//   }
// }

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { JobService } from '../../services/job.service';
import { ProposalService } from '../../services/proposal.service';
import { Job } from '../../model/job';
import { Proposal } from '../../model/proposal';

@Component({
  selector: 'app-my-job',
  templateUrl: './my-job.component.html',
  styleUrls: ['./my-job.component.scss']
})
export class MyJobComponent implements OnInit, OnDestroy {
  jobs: Job[] = [];
  loading = false;
  roleName = '';

  // Map of jobId → proposals
  proposalsMap: { [jobId: number]: Proposal[] } = {};
  loadingProposals: { [jobId: number]: boolean } = {};

  // Track in-progress accept/reject
  updatingProposalIds = new Set<number>();

  // Delete confirmation
  confirmDeleteJobId: number | null = null;

  // Toast
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' | 'warning' = 'info';
  toastVisible = false;
  private toastTimer: any;

  // Which job's applicant panel is expanded
  expandedJobId: number | null = null;

  // Selected applicant (proposal) per job for detail panel
  selectedProposalMap: { [jobId: number]: Proposal | null } = {};

  // Inline edit state
  editingJobId: number | null = null;
  editForm = { title: '', description: '', budget: 0 };

  constructor(
    private jobService: JobService,
    private proposalService: ProposalService,
    private router: Router
  ) {}

  ngOnDestroy(): void { if (this.toastTimer) clearTimeout(this.toastTimer); }

  ngOnInit(): void {
    this.roleName = localStorage.getItem('role') || '';
    this.loadMyJobs();
  }

  loadMyJobs(): void {
    this.loading = true;
    this.jobService.getMyJobs().subscribe({
      next: (data: Job[]) => {
        this.jobs = data;
        this.loading = false;
        this.jobs.forEach(job => {
          if (job.id) this.loadProposals(job.id);
        });
      },
      error: () => { this.loading = false; }
    });
  }

  loadProposals(jobId: number): void {
    this.loadingProposals[jobId] = true;
    this.proposalService.getProposalsByJob(jobId).subscribe({
      next: (proposals: Proposal[]) => {
        this.proposalsMap[jobId] = proposals;
        this.loadingProposals[jobId] = false;
      },
      error: () => {
        this.proposalsMap[jobId] = [];
        this.loadingProposals[jobId] = false;
      }
    });
  }

  getProposals(jobId: number | undefined): Proposal[] {
    if (!jobId) return [];
    return this.proposalsMap[jobId] || [];
  }

  isLoadingProposals(jobId: number | undefined): boolean {
    if (!jobId) return false;
    return !!this.loadingProposals[jobId];
  }

  // Toggle the applicants panel for a job
  toggleApplicants(jobId: number | undefined): void {
    if (!jobId) return;
    if (this.expandedJobId === jobId) {
      this.expandedJobId = null;
    } else {
      this.expandedJobId = jobId;
      // Auto-select first proposal if none selected
      if (!this.selectedProposalMap[jobId]) {
        const proposals = this.getProposals(jobId);
        if (proposals.length > 0) {
          this.selectedProposalMap[jobId] = proposals[0];
        }
      }
    }
  }

  isApplicantsExpanded(jobId: number | undefined): boolean {
    return !!jobId && this.expandedJobId === jobId;
  }

  // Select applicant for detail panel
  selectApplicant(jobId: number, proposal: Proposal): void {
    this.selectedProposalMap[jobId] = proposal;
  }

  getSelectedProposal(jobId: number | undefined): Proposal | null {
    if (!jobId) return null;
    return this.selectedProposalMap[jobId] || null;
  }

  isSelectedApplicant(jobId: number, proposalId: number | undefined): boolean {
    const sel = this.selectedProposalMap[jobId];
    return !!sel && sel.id === proposalId;
  }

  acceptProposal(proposal: Proposal, job: Job): void {
    if (!proposal.id) return;
    if (this.updatingProposalIds.has(proposal.id)) return;
    this.updatingProposalIds.add(proposal.id);
    this.proposalService.acceptProposal(proposal.id).subscribe({
      next: () => {
        this.updatingProposalIds.delete(proposal.id!);
        job.status = 'CLOSED';
        if (job.id) {
          const proposals = this.proposalsMap[job.id] || [];
          this.proposalsMap[job.id] = proposals.map(p => ({
            ...p,
            status: p.id === proposal.id ? 'APPROVED'
                  : p.status === 'PENDING' ? 'REJECTED'
                  : p.status
          }));
          // Refresh selected proposal state
          const updated = this.proposalsMap[job.id].find(p => p.id === proposal.id);
          if (updated) this.selectedProposalMap[job.id] = updated;
        }
        this.showToast('Proposal accepted! The job is now closed.', 'success');
      },
      error: (err) => {
        this.updatingProposalIds.delete(proposal.id!);
        this.showToast(err?.error?.message || 'Failed to accept proposal.', 'error');
      }
    });
  }

  rejectProposal(proposal: Proposal, job: Job): void {
    if (!proposal.id) return;
    if (this.updatingProposalIds.has(proposal.id)) return;
    this.updatingProposalIds.add(proposal.id);
    this.proposalService.rejectProposal(proposal.id).subscribe({
      next: () => {
        this.updatingProposalIds.delete(proposal.id!);
        if (job.id) {
          this.proposalsMap[job.id] = (this.proposalsMap[job.id] || []).map(p =>
            p.id === proposal.id ? { ...p, status: 'REJECTED' } : p
          );
          const updated = this.proposalsMap[job.id].find(p => p.id === proposal.id);
          if (updated) this.selectedProposalMap[job.id] = updated;
        }
      },
      error: (err) => {
        this.updatingProposalIds.delete(proposal.id!);
        this.showToast(err?.error?.message || 'Failed to reject proposal.', 'error');
      }
    });
  }

  isUpdatingProposal(proposalId: number | undefined): boolean {
    if (!proposalId) return false;
    return this.updatingProposalIds.has(proposalId);
  }

  startEdit(job: Job): void {
    if (!job.id) return;
    this.editingJobId = job.id;
    this.editForm = {
      title: job.title || '',
      description: job.description || '',
      budget: Number(job.budget) || 0
    };
  }

  cancelEdit(): void {
    this.editingJobId = null;
    this.editForm = { title: '', description: '', budget: 0 };
  }

  saveJob(job: Job): void {
    if (!job.id) return;
    if (!this.editForm.title.trim()) { this.showToast('Job title is required.', 'warning'); return; }
    if (!this.editForm.description.trim()) { this.showToast('Job description is required.', 'warning'); return; }
    if (this.editForm.budget <= 0) { this.showToast('Budget must be greater than 0.', 'warning'); return; }
    const payload = {
      title: this.editForm.title.trim(),
      description: this.editForm.description.trim(),
      budget: this.editForm.budget
    };
    this.jobService.updateJob(job.id, payload).subscribe({
      next: (updated: Job) => {
        this.jobs = this.jobs.map(j =>
          j.id === job.id
            ? { ...j, title: updated.title, description: updated.description, budget: updated.budget }
            : j
        );
        this.showToast('Job updated successfully!', 'success');
        this.cancelEdit();
      },
      error: () => this.showToast('Failed to update job. Please try again.', 'error')
    });
  }

  openDeleteConfirm(jobId: number | undefined): void {
    if (!jobId) return;
    this.confirmDeleteJobId = jobId;
  }

  closeDeleteConfirm(): void { this.confirmDeleteJobId = null; }

  deleteJob(jobId: number | undefined): void {
    if (!jobId) return;
    this.confirmDeleteJobId = null;
    this.jobService.deleteJob(jobId).subscribe({
      next: () => {
        this.showToast('Job deleted successfully.', 'success');
        this.jobs = this.jobs.filter(j => j.id !== jobId);
        delete this.proposalsMap[jobId];
        delete this.selectedProposalMap[jobId];
        if (this.expandedJobId === jobId) this.expandedJobId = null;
      },
      error: () => this.showToast('Failed to delete job. Please try again.', 'error')
    });
  }

  showToast(message: string, type: 'success'|'error'|'info'|'warning' = 'info'): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage = message; this.toastType = type; this.toastVisible = true;
    this.toastTimer = setTimeout(() => { this.toastVisible = false; }, 4500);
  }
  dismissToast(): void { this.toastVisible = false; }

  getInitial(name: string | undefined): string {
    return name ? name[0].toUpperCase() : 'F';
  }

  getTotalBudget(): number {
    return this.jobs.reduce((sum, j) => sum + (Number(j.budget) || 0), 0);
  }

  getTotalApplicants(): number {
    return Object.values(this.proposalsMap).reduce((sum, arr) => sum + arr.length, 0);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}