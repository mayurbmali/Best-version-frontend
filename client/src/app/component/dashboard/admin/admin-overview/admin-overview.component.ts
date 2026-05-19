import { Component, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';

interface StatCard {
  icon: string;
  label: string;
  value: number;
  displayValue: number;
  desc: string;
  color: string;
  suffix?: string;
}

@Component({
  selector: 'app-admin-overview',
  templateUrl: './admin-overview.component.html',
  styleUrls: ['./admin-overview.component.scss']
})
export class AdminOverviewComponent implements OnChanges, OnDestroy {
  @Input() overview: any = null;

  cards: StatCard[] = [];
  private animTimers: any[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['overview'] && this.overview) {
      this.buildCards();
    }
  }

  private buildCards(): void {
    const o = this.overview;
    const raw: StatCard[] = [
      { icon: '👥', label: 'Total Users',         value: o.totalUsers         || 0, displayValue: 0, desc: 'Registered on platform',   color: 'violet' },
      { icon: '🏢', label: 'Total Clients',        value: o.totalClients       || 0, displayValue: 0, desc: 'Employer accounts',         color: 'cyan'   },
      { icon: '💻', label: 'Total Freelancers',    value: o.totalFreelancers   || 0, displayValue: 0, desc: 'Active talent pool',         color: 'teal'   },
      { icon: '💼', label: 'Total Jobs',           value: o.totalJobs          || 0, displayValue: 0, desc: 'Jobs ever posted',           color: 'pink'   },
      { icon: '📨', label: 'Total Proposals',      value: o.totalProposals     || 0, displayValue: 0, desc: 'Proposals submitted',        color: 'orange' },
      { icon: '✅', label: 'Hired',                value: o.approvedProposals  || 0, displayValue: 0, desc: 'Successful hires',           color: 'green'  },
      { icon: '⭐', label: 'Subscriptions',        value: o.activeSubscriptions|| 0, displayValue: 0, desc: 'Premium members',           color: 'gold'   },
      { icon: '📊', label: 'Completion Rate',      value: o.jobCompletionRate  || 0, displayValue: 0, desc: 'Jobs completed',            color: 'indigo', suffix: '%' },
      { icon: '🎯', label: 'Hire Rate',            value: o.proposalAcceptanceRate || 0, displayValue: 0, desc: 'Proposal acceptance', color: 'rose', suffix: '%' },
    ];

    this.cards = raw;
    this.animateCounters();
  }

  private animateCounters(): void {
    this.animTimers.forEach(t => clearInterval(t));
    this.animTimers = [];

    this.cards.forEach((card, i) => {
      const target = card.value;
      const duration = 1400;
      const steps = 50;
      const interval = duration / steps;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        card.displayValue = parseFloat((eased * target).toFixed(1));
        if (step >= steps) {
          card.displayValue = target;
          clearInterval(timer);
        }
      }, interval + i * 20);

      this.animTimers.push(timer);
    });
  }

  ngOnDestroy(): void {
    this.animTimers.forEach(t => clearInterval(t));
  }
}
