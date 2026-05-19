import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JobService } from '../../services/job.service';

@Component({
  selector: 'app-job-create',
  templateUrl: './job-create.component.html',
  styleUrls: ['./job-create.component.scss']
})
export class JobCreateComponent implements OnInit, OnDestroy {
  jobForm!: FormGroup;
  clientId!: number;
  loading = false;
  roleName = '';

  toastMessage = '';
  toastType: 'success' | 'error' | 'info' | 'warning' = 'info';
  toastVisible = false;
  private toastTimer: any;

  constructor(private fb: FormBuilder, private jobService: JobService, private router: Router) {}

  ngOnInit(): void {
    this.roleName = localStorage.getItem('role') || '';
    this.clientId = Number(localStorage.getItem('userId') || localStorage.getItem('id') || '0');
    this.jobForm = this.fb.group({
      title:       ['', Validators.required],
      description: ['', Validators.required],
      budget:      [null, [Validators.required, Validators.min(1)]],
      status:      ['OPEN', Validators.required]
    });
  }

  ngOnDestroy(): void { if (this.toastTimer) clearTimeout(this.toastTimer); }
  get f() { return this.jobForm.controls; }

  onSubmit(): void {
    if (this.jobForm.invalid) { this.jobForm.markAllAsTouched(); return; }
    if (!this.clientId) { this.showToast('Session expired. Please login again.', 'error'); return; }
    this.loading = true;
    this.jobService.create(this.clientId, this.jobForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.showToast('Job posted successfully! Redirecting...', 'success');
        setTimeout(() => this.router.navigate(['/my-job']), 1600);
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message || err?.error?.error || '';
        if (msg.toLowerCase().includes('subscription')) {
          this.showToast('Subscription required to post jobs. Please subscribe first.', 'warning');
        } else {
          this.showToast(msg || 'Failed to create job. Please try again.', 'error');
        }
      }
    });
  }

  showToast(message: string, type: 'success'|'error'|'info'|'warning' = 'info'): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage = message; this.toastType = type; this.toastVisible = true;
    this.toastTimer = setTimeout(() => { this.toastVisible = false; }, 4500);
  }
  dismissToast(): void { this.toastVisible = false; }
  logout(): void { localStorage.clear(); this.router.navigate(['/login']); }
}
