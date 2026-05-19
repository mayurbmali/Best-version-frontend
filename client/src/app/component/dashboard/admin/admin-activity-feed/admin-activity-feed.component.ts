import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-admin-activity-feed',
  templateUrl: './admin-activity-feed.component.html',
  styleUrls: ['./admin-activity-feed.component.scss']
})
export class AdminActivityFeedComponent implements OnChanges {
  @Input() activities: any[] = [];
  @Input() loading = true;

  readonly typeConfig: Record<string, { icon: string; color: string; label: string }> = {
    HIRED:      { icon: '🏆', color: 'green',  label: 'Hired'       },
    PROPOSAL:   { icon: '📝', color: 'cyan',   label: 'Applied'     },
    JOB_POSTED: { icon: '💼', color: 'orange', label: 'Job Posted'  },
    USER_JOINED:{ icon: '👤', color: 'violet', label: 'Joined'      },
    SUBSCRIBED: { icon: '⭐', color: 'gold',   label: 'Subscribed'  },
  };

  ngOnChanges(c: SimpleChanges): void {}

  getConfig(type: string) {
    return this.typeConfig[type] || { icon: '🔔', color: 'cyan', label: type };
  }

  getInitial(name: string): string {
    return name ? name[0].toUpperCase() : 'U';
  }
}
