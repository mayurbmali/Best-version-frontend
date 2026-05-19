import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-admin-insights',
  templateUrl: './admin-insights.component.html',
  styleUrls: ['./admin-insights.component.scss']
})
export class AdminInsightsComponent implements OnChanges {
  @Input() freelancers: any[] = [];
  @Input() jobInsights: any  = null;
  @Input() loading = true;

  topFreelancers: any[] = [];
  incompleteProfiles: any[] = [];

  ngOnChanges(c: SimpleChanges): void {
    if (this.freelancers?.length) {
      this.topFreelancers    = this.freelancers.slice(0, 8);
      this.incompleteProfiles = this.freelancers.filter(f => !f.profileComplete).slice(0, 5);
    }
  }

  hireRate(f: any): number {
    if (!f.totalProposals) return 0;
    return Math.round(f.approvedProposals / f.totalProposals * 100);
  }

  getInitial(name: string): string {
    return name ? name[0].toUpperCase() : 'F';
  }

  jobEngagementPct(key: string): number {
    if (!this.jobInsights?.totalJobs) return 0;
    return Math.round((this.jobInsights[key] || 0) / this.jobInsights.totalJobs * 100);
  }
}
