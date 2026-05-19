// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// import { AuthService } from '../../services/auth.service';

// @Component({
//   selector: 'app-forgot-password',
//   templateUrl: './forgot-password.component.html',
//   styleUrls: ['./forgot-password.component.scss']
// })
// export class ForgotPasswordComponent implements OnInit {
//   emailForm!: FormGroup;
//   otpForm!: FormGroup;
//   passwordForm!: FormGroup;

//   step: 'email' | 'otp' | 'reset' = 'email';
//   loading = false;
//   errorMessage = '';
//   successMessage = '';
//   showPassword = false;
//   showConfirmPassword = false;

//   pendingEmail = '';
//   resetToken = '';
//   devOtp = '';

//   constructor(
//     private fb: FormBuilder,
//     private authService: AuthService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.emailForm = this.fb.group({
//       email: ['', [Validators.required, Validators.email]]
//     });
//     this.otpForm = this.fb.group({
//       otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
//     });
//     this.passwordForm = this.fb.group(
//       {
//         newPassword: ['', [Validators.required, Validators.minLength(6)]],
//         confirmPassword: ['', Validators.required]
//       },
//       { validators: this.passwordMatchValidator }
//     );
//   }

//   get ef() { return this.emailForm.controls; }
//   get of() { return this.otpForm.controls; }
//   get pf() { return this.passwordForm.controls; }

//   passwordMatchValidator(group: FormGroup) {
//     const p = group.get('newPassword')?.value;
//     const c = group.get('confirmPassword')?.value;
//     return p === c ? null : { passwordMismatch: true };
//   }

//   // Step 1: Send OTP to email
//   onSendOtp(): void {
//     this.errorMessage = '';
//     this.successMessage = '';
//     if (this.emailForm.invalid) { this.emailForm.markAllAsTouched(); return; }
//     this.loading = true;
//     this.authService.forgotPassword(this.emailForm.value.email).subscribe({
//       next: (res) => {
//         this.loading = false;
//         this.pendingEmail = this.emailForm.value.email;
//         this.devOtp = res.devOtp || '';
//         this.step = 'otp';
//         this.successMessage = `OTP sent to ${this.pendingEmail}`;
//       },
//       error: (err) => {
//         this.loading = false;
//         this.errorMessage = err?.error?.error || 'Failed to send OTP. Please try again.';
//       }
//     });
//   }

//   // Step 2: Verify OTP
//   onVerifyOtp(): void {
//     this.errorMessage = '';
//     this.successMessage = '';
//     if (this.otpForm.invalid) { this.otpForm.markAllAsTouched(); return; }
//     this.loading = true;
//     this.authService.verifyForgotPasswordOtp(this.pendingEmail, this.otpForm.value.otp).subscribe({
//       next: (res) => {
//         this.loading = false;
//         this.resetToken = res.resetToken;
//         this.step = 'reset';
//         this.successMessage = 'OTP verified. Set your new password.';
//       },
//       error: (err) => {
//         this.loading = false;
//         this.errorMessage = err?.error?.error || 'Invalid or expired OTP.';
//       }
//     });
//   }

//   // Step 3: Reset password
//   onResetPassword(): void {
//     this.errorMessage = '';
//     this.successMessage = '';
//     if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
//     this.loading = true;
//     this.authService.resetPassword(this.pendingEmail, this.resetToken, this.passwordForm.value.newPassword).subscribe({
//       next: () => {
//         this.loading = false;
//         alert('Password reset successfully! Please login.');
//         this.router.navigate(['/login']);
//       },
//       error: (err) => {
//         this.loading = false;
//         this.errorMessage = err?.error?.error || 'Password reset failed. Please try again.';
//       }
//     });
//   }
// }


import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  emailForm!: FormGroup;
  otpForm!: FormGroup;
  passwordForm!: FormGroup;

  step: 'email' | 'otp' | 'reset' = 'email';
  loading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  pendingEmail = '';
  resetToken = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
    this.passwordForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  get ef() { return this.emailForm.controls; }
  get of() { return this.otpForm.controls; }
  get pf() { return this.passwordForm.controls; }

  passwordMatchValidator(group: FormGroup) {
    const p = group.get('newPassword')?.value;
    const c = group.get('confirmPassword')?.value;
    return p === c ? null : { passwordMismatch: true };
  }

  onSendOtp(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.emailForm.invalid) { this.emailForm.markAllAsTouched(); return; }
    this.loading = true;
    this.authService.forgotPassword(this.emailForm.value.email).subscribe({
      next: (res) => {
        this.loading = false;
        this.pendingEmail = this.emailForm.value.email;
        this.step = 'otp';
        this.successMessage = `OTP sent to ${this.pendingEmail}. Please check your inbox.`;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.error || 'Failed to send OTP. Please try again.';
      }
    });
  }

  onVerifyOtp(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.otpForm.invalid) { this.otpForm.markAllAsTouched(); return; }
    this.loading = true;
    this.authService.verifyForgotPasswordOtp(this.pendingEmail, this.otpForm.value.otp).subscribe({
      next: (res) => {
        this.loading = false;
        this.resetToken = res.resetToken;
        this.step = 'reset';
        this.successMessage = 'OTP verified. Set your new password.';
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.error || 'Invalid or expired OTP.';
      }
    });
  }

  onResetPassword(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    this.loading = true;
    this.authService.resetPassword(
      this.pendingEmail, this.resetToken, this.passwordForm.value.newPassword
    ).subscribe({
      next: () => {
        this.loading = false;
        alert('Password reset successfully! Please login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.error || 'Password reset failed. Please try again.';
      }
    });
  }
}