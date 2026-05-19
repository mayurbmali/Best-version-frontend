import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-admin-analytics',
  templateUrl: './admin-analytics.component.html',
  styleUrls: ['./admin-analytics.component.scss']
})
export class AdminAnalyticsComponent implements OnChanges {
  @Input() overview: any = null;
  @Input() jobInsights: any = null;

  // Donut SVG constants
  readonly R = 42;
  readonly CIRC = 2 * Math.PI * 42; // ≈ 263.9

  // User distribution donut
  clientPct  = 0;
  freelancerPct = 0;
  clientDash  = '0 263.9';
  freelancerDash = '0 263.9';
  clientOffset = 0;

  // Job status bars (percentages)
  jobBars: { label: string; value: number; pct: number; color: string }[] = [];

  // Proposal donut
  pendingPct  = 0;
  approvedPct = 0;
  rejectedPct = 0;
  proposalSegments: { dash: string; offset: number; color: string; label: string; pct: number }[] = [];

  // Subscription radial
  subPct = 0;
  subDash = '0 263.9';

  ngOnChanges(changes: SimpleChanges): void {
    if (this.overview) this.computeUserAndProposalCharts();
    if (this.jobInsights) this.computeJobChart();
    if (this.overview)   this.computeSubChart();
  }

  private computeUserAndProposalCharts(): void {
    const o = this.overview;
    const totalUsers = (o.totalClients || 0) + (o.totalFreelancers || 0);

    if (totalUsers > 0) {
      this.clientPct    = Math.round(o.totalClients    / totalUsers * 100);
      this.freelancerPct = Math.round(o.totalFreelancers / totalUsers * 100);
      const cLen = this.clientPct / 100 * this.CIRC;
      this.clientDash = `${cLen.toFixed(1)} ${this.CIRC.toFixed(1)}`;
      const fLen = this.freelancerPct / 100 * this.CIRC;
      this.freelancerDash = `${fLen.toFixed(1)} ${this.CIRC.toFixed(1)}`;
      this.clientOffset = 0;
    }

    // Proposal donut - 3 segments
    const total = (o.pendingProposals || 0) + (o.approvedProposals || 0) + (o.rejectedProposals || 0);
    if (total > 0) {
      const pcts = [
        { v: o.pendingProposals  || 0, color: '#fbbf24', label: 'Pending' },
        { v: o.approvedProposals || 0, color: '#34d399', label: 'Approved' },
        { v: o.rejectedProposals || 0, color: '#f87171', label: 'Rejected' },
      ];
      let cumulativeOffset = -this.CIRC * 0.25; // start at top
      this.proposalSegments = pcts.map(p => {
        const pct = Math.round(p.v / total * 100);
        const len = pct / 100 * this.CIRC;
        const seg = {
          dash: `${len.toFixed(1)} ${this.CIRC.toFixed(1)}`,
          offset: cumulativeOffset,
          color: p.color,
          label: p.label,
          pct
        };
        cumulativeOffset -= len;
        return seg;
      });
    }
  }

  private computeJobChart(): void {
    const j = this.jobInsights;
    const total = j.totalJobs || 1;
    this.jobBars = [
      { label: 'Open',     value: j.openJobs    || 0, pct: Math.round((j.openJobs    || 0) / total * 100), color: '#34d399' },
      { label: 'Applied',  value: j.appliedJobs || 0, pct: Math.round((j.appliedJobs || 0) / total * 100), color: '#60a5fa' },
      { label: 'Accepted', value: j.acceptedJobs|| 0, pct: Math.round((j.acceptedJobs|| 0) / total * 100), color: '#a78bfa' },
      { label: 'Closed',   value: j.closedJobs  || 0, pct: Math.round((j.closedJobs  || 0) / total * 100), color: '#f87171' },
    ];
  }

  private computeSubChart(): void {
    const o = this.overview;
    const total = o.totalUsers || 1;
    this.subPct = Math.round((o.activeSubscriptions || 0) / total * 100);
    const len = this.subPct / 100 * this.CIRC;
    this.subDash = `${len.toFixed(1)} ${this.CIRC.toFixed(1)}`;
  }

  get circumference(): number { return this.CIRC; }
}
