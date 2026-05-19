import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { GoogleCompleteComponent } from './auth/google-complete/google-complete.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { JobListComponent } from './component/job-list/job-list.component';
import { JobCreateComponent } from './component/job-create/job-create.component';
import { MyJobComponent } from './component/my-job/my-job.component';
import { MyProposalComponent } from './component/my-proposal/my-proposal.component';
import { ProfileComponent } from './component/profile/profile.component';
import { ReportComponent } from './component/report/report.component';
import { BrowseJobsComponent } from './component/browse-jobs/browse-jobs.component';
import { HomeComponent } from './component/home/home.component';
import { SubscribeComponent } from './component/subscribe/subscribe.component';
import { JwtInterceptor } from './jwt.interceptor';

// ── Shared components ─────────────────────────────────────────────────────────
import { SidenavComponent } from './component/shared/sidenav/sidenav.component';

// ── Admin sub-components ──────────────────────────────────────────────────────
import { AdminOverviewComponent } from './component/dashboard/admin/admin-overview/admin-overview.component';
import { AdminAnalyticsComponent } from './component/dashboard/admin/admin-analytics/admin-analytics.component';
import { AdminActivityFeedComponent } from './component/dashboard/admin/admin-activity-feed/admin-activity-feed.component';
import { AdminInsightsComponent } from './component/dashboard/admin/admin-insights/admin-insights.component';
import { AdminMonitoringComponent } from './component/dashboard/admin/admin-monitoring/admin-monitoring.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    GoogleCompleteComponent,
    DashboardComponent,
    JobListComponent,
    JobCreateComponent,
    MyJobComponent,
    MyProposalComponent,
    ProfileComponent,
    ReportComponent,
    BrowseJobsComponent,
    HomeComponent,
    SubscribeComponent,
    // Shared
    SidenavComponent,
    // Admin
    AdminOverviewComponent,
    AdminAnalyticsComponent,
    AdminActivityFeedComponent,
    AdminInsightsComponent,
    AdminMonitoringComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
