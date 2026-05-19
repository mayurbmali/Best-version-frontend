import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// Custom validator: strong password
function strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const v: string = control.value || '';
  if (!v) return null;
  const errors: any = {};
  if (v.length < 6) errors['minLength'] = true;
  if (!/[A-Z]/.test(v)) errors['noUppercase'] = true;
  if (!/[a-z]/.test(v)) errors['noLowercase'] = true;
  if (!/[0-9]/.test(v)) errors['noDigit'] = true;
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v)) errors['noSpecial'] = true;
  return Object.keys(errors).length ? errors : null;
}

// Cross-field: confirm password match
function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('password')?.value;
  const cp = group.get('confirmPassword')?.value;
  if (cp && pw !== cp) return { passwordMismatch: true };
  return null;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  otpForm!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  step: 'register' | 'otp' = 'register';
  pendingEmail = '';

  // Toast notification
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' | 'warning' = 'info';
  toastVisible = false;
  private toastTimer: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.getLoginStatus()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, strongPasswordValidator]],
      confirmPassword: ['', [Validators.required]],
      contactNumber: [''],
      role: ['FREELANCER', Validators.required]
    }, { validators: passwordMatchValidator });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  ngOnDestroy(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  get f() { return this.registerForm.controls; }
  get of() { return this.otpForm.controls; }

  // Password strength helpers
  get pwErrors() { return this.f['password'].errors || {}; }
  get pwTouched() { return this.f['password'].touched; }

  getPasswordStrength(): number {
    const v: string = this.f['password'].value || '';
    let score = 0;
    if (v.length >= 6) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/[a-z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v)) score++;
    return score;
  }

  getStrengthLabel(): string {
    const s = this.getPasswordStrength();
    if (s <= 1) return 'Very Weak';
    if (s === 2) return 'Weak';
    if (s === 3) return 'Fair';
    if (s === 4) return 'Strong';
    return 'Very Strong';
  }

  getStrengthClass(): string {
    const s = this.getPasswordStrength();
    if (s <= 1) return 'strength-very-weak';
    if (s === 2) return 'strength-weak';
    if (s === 3) return 'strength-fair';
    if (s === 4) return 'strength-strong';
    return 'strength-very-strong';
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      if (this.registerForm.hasError('passwordMismatch')) {
        this.showToast('Passwords do not match.', 'error');
      }
      return;
    }
    this.loading = true;
    const payload: any = { ...this.registerForm.value };
    delete payload.confirmPassword;
    if (payload.contactNumber) payload.contactNumber = Number(payload.contactNumber);
    else delete payload.contactNumber;

    this.authService.initiateRegistration(payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.pendingEmail = res.email;
        this.step = 'otp';
        this.showToast(`Verification code sent to ${this.pendingEmail}`, 'info');
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message || err?.error?.error || 'Registration failed. Please try again.';
        this.errorMessage = msg;
        this.showToast(msg, 'error');
      }
    });
  }

  onVerifyOtp(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.otpForm.invalid) { this.otpForm.markAllAsTouched(); return; }
    this.loading = true;

    this.authService.verifyRegistrationOtp(this.pendingEmail, this.otpForm.value.otp).subscribe({
      next: () => {
        this.loading = false;
        this.showToast('Registration successful! Redirecting to login...', 'success');
        setTimeout(() => this.router.navigate(['/login']), 1800);
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.error || 'Invalid or expired OTP. Please try again.';
        this.errorMessage = msg;
        this.showToast(msg, 'error');
      }
    });
  }

  resendOtp(): void {
    if (this.loading) return;
    this.loading = true;
    const payload: any = { ...this.registerForm.value };
    delete payload.confirmPassword;
    if (payload.contactNumber) payload.contactNumber = Number(payload.contactNumber);
    else delete payload.contactNumber;

    this.authService.initiateRegistration(payload).subscribe({
      next: () => {
        this.loading = false;
        this.showToast('New OTP sent! Check your inbox.', 'info');
        this.otpForm.reset();
      },
      error: () => {
        this.loading = false;
        this.showToast('Could not resend OTP. Please try again.', 'error');
      }
    });
  }

  goBackToRegister(): void {
    this.step = 'register';
    this.errorMessage = '';
    this.successMessage = '';
    this.otpForm.reset();
  }

  showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    this.toastTimer = setTimeout(() => { this.toastVisible = false; }, 4500);
  }

  dismissToast(): void {
    this.toastVisible = false;
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }
}
