import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Proposal } from '../../model/proposal';
import { ProposalService } from '../../services/proposal.service';

@Component({
  selector: 'app-my-proposal',
  templateUrl: './my-proposal.component.html',
  styleUrls: ['./my-proposal.component.scss']
})
export class MyProposalComponent implements OnInit, OnDestroy {
  proposals: Proposal[] = [];
  loading = true;
  roleName = '';

  // Toast
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' | 'warning' = 'info';
  toastVisible = false;
  private toastTimer: any;

  constructor(private proposalService: ProposalService, private router: Router) {}

  ngOnInit(): void {
    this.roleName = localStorage.getItem('role') || '';
    this.proposalService.getMyProposals().subscribe({
      next: (data) => { this.proposals = data || []; this.loading = false; },
      error: () => { this.loading = false; this.showToast('Failed to load proposals.', 'error'); }
    });
  }

  ngOnDestroy(): void { if (this.toastTimer) clearTimeout(this.toastTimer); }

  get totalCount(): number { return this.proposals.length; }
  get pendingCount(): number { return this.proposals.filter(p => (p.status||'').toUpperCase() === 'PENDING').length; }
  get acceptedCount(): number { return this.proposals.filter(p => ['ACCEPTED','APPROVED'].includes((p.status||'').toUpperCase())).length; }
  get rejectedCount(): number { return this.proposals.filter(p => (p.status||'').toUpperCase() === 'REJECTED').length; }

  getStatusClass(status: string | undefined): string {
    const map: any = { PENDING:'mp-status-pending', APPROVED:'mp-status-accepted', ACCEPTED:'mp-status-accepted', REJECTED:'mp-status-rejected', APPLIED:'mp-status-applied' };
    return map[(status||'').toUpperCase()] || 'mp-status-pending';
  }

  getAccentClass(status: string | undefined): string {
    const map: any = { PENDING:'mp-accent-pending', APPROVED:'mp-accent-accepted', ACCEPTED:'mp-accent-accepted', REJECTED:'mp-accent-rejected', APPLIED:'mp-accent-applied' };
    return map[(status||'').toUpperCase()] || 'mp-accent-pending';
  }

  getStatusIcon(status: string | undefined): string {
    const map: any = { PENDING:'⏳', APPROVED:'✅', ACCEPTED:'✅', REJECTED:'❌', APPLIED:'📨' };
    return map[(status||'').toUpperCase()] || '⏳';
  }

  showToast(message: string, type: 'success'|'error'|'info'|'warning' = 'info'): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage = message; this.toastType = type; this.toastVisible = true;
    this.toastTimer = setTimeout(() => { this.toastVisible = false; }, 4000);
  }

  dismissToast(): void { this.toastVisible = false; }
  logout(): void { localStorage.clear(); this.router.navigate(['/login']); }
}
