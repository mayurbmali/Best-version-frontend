import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { SubscriptionGuard } from './subscription.guard';
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

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'google-complete', component: GoogleCompleteComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'job-list', component: JobListComponent, canActivate: [AuthGuard] },
  { path: 'job-create', component: JobCreateComponent, canActivate: [AuthGuard, SubscriptionGuard] },
  { path: 'my-job', component: MyJobComponent, canActivate: [AuthGuard] },
  { path: 'my-proposals', component: MyProposalComponent, canActivate: [AuthGuard] },
  { path: 'my-profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'users', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'reports', component: ReportComponent, canActivate: [AuthGuard] },
  { path: 'browse-jobs', component: BrowseJobsComponent, canActivate: [AuthGuard] },
  { path: 'subscribe', component: SubscribeComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
