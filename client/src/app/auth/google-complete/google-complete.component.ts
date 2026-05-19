import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-google-complete',
  templateUrl: './google-complete.component.html',
  styleUrls: ['./google-complete.component.scss']
})
export class GoogleCompleteComponent implements OnInit {
  completeForm!: FormGroup;
  loading = false;
  errorMessage = '';
  pendingGoogleToken = '';
  pendingEmail = '';
  pendingName = '';

  selectedRole = 'FREELANCER';
  roleError = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.pendingGoogleToken = localStorage.getItem('pendingGoogleToken') || '';
    this.pendingEmail = localStorage.getItem('pendingGoogleEmail') || '';
    this.pendingName = localStorage.getItem('pendingGoogleName') || '';

    if (!this.pendingGoogleToken) {
      this.router.navigate(['/login']);
      return;
    }

    const defaultUsername = this.pendingEmail
      ? this.pendingEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_')
      : '';

    this.completeForm = this.fb.group({
      username: [
        defaultUsername,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[a-zA-Z0-9_]+$/)
        ]
      ]
    });
  }

  get f() { return this.completeForm.controls; }

  selectRole(role: string): void {
    this.selectedRole = role;
    this.roleError = false;
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.roleError = false;

    if (this.completeForm.invalid) {
      this.completeForm.markAllAsTouched();
      return;
    }

    if (!this.selectedRole) {
      this.roleError = true;
      return;
    }

    this.loading = true;

    this.authService
      .completeGoogleRegistration(
        this.pendingGoogleToken,
        this.selectedRole,
        this.completeForm.value.username
      )
      .subscribe({
        next: (res) => {
          this.loading = false;
          localStorage.removeItem('pendingGoogleToken');
          localStorage.removeItem('pendingGoogleEmail');
          localStorage.removeItem('pendingGoogleName');

          this.authService.saveToken(res.token);
          this.authService.setRole(res.role);
          this.authService.saveUserId(res.userId);
          this.authService.setSubscribed(res.isSubscribed);
          localStorage.setItem('username', res.username);

          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage =
            err?.error?.error || 'Registration failed. Please try again.';
        }
      });
  }

  cancelGoogle(): void {
    localStorage.removeItem('pendingGoogleToken');
    localStorage.removeItem('pendingGoogleEmail');
    localStorage.removeItem('pendingGoogleName');
    this.router.navigate(['/login']);
  }
}