import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  loading = false;
  showPassword = false;

  // Captcha
  captchaText = '';
  captchaInput = '';
  captchaError = '';

  // Cooldown
  failedCaptchaAttempts = 0;
  cooldownActive = false;
  cooldownSeconds = 0;
  private cooldownTimer: any;

  // Modern toast
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' | 'warning' = 'error';
  toastVisible = false;
  private toastTimer: any;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.getLoginStatus()) { this.router.navigate(['/dashboard']); return; }
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.generateCaptcha();
    this.loadGoogleScript();
  }

  ngOnDestroy(): void {
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  get f() { return this.loginForm.controls; }

  generateCaptcha(): void {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    this.captchaText = result;
    this.captchaInput = '';
    this.captchaError = '';
  }

  refreshCaptcha(): void { this.generateCaptcha(); }

  private validateCaptcha(): boolean {
    if (!this.captchaInput || this.captchaInput !== this.captchaText) {
      this.failedCaptchaAttempts++;
      if (this.failedCaptchaAttempts >= 3) {
        this.startCooldown();
      } else {
        const remaining = 3 - this.failedCaptchaAttempts;
        this.captchaError = `Incorrect captcha. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`;
        this.showToast(this.captchaError, 'warning');
        this.generateCaptcha();
      }
      return false;
    }
    this.failedCaptchaAttempts = 0;
    this.captchaError = '';
    return true;
  }

  private startCooldown(): void {
    this.cooldownActive = true;
    this.cooldownSeconds = 20;
    this.failedCaptchaAttempts = 0;
    this.captchaError = '';
    this.showToast('Too many failed attempts. Please wait 20 seconds.', 'error');
    this.cooldownTimer = setInterval(() => {
      this.cooldownSeconds--;
      if (this.cooldownSeconds <= 0) {
        clearInterval(this.cooldownTimer);
        this.cooldownActive = false;
        this.generateCaptcha();
      }
    }, 1000);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    if (this.cooldownActive) {
      this.showToast(`Too many failed attempts. Try again in ${this.cooldownSeconds}s.`, 'error');
      return;
    }
    if (!this.validateCaptcha()) return;

    this.loading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.authService.saveToken(res.token);
        this.authService.setRole(res.role);
        this.authService.saveUserId(res.userId);
        this.authService.setSubscribed(res.isSubscribed === true);
        localStorage.setItem('username', res.username);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading = false;
        this.showToast('Invalid username or password.', 'error');
        this.generateCaptcha();
      }
    });
  }

  showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'error'): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    this.toastTimer = setTimeout(() => { this.toastVisible = false; }, 4500);
  }

  dismissToast(): void { this.toastVisible = false; }

  private loadGoogleScript(): void {
    if (document.getElementById('google-gsi-script')) { setTimeout(() => this.initGoogleSignIn(), 300); return; }
    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true; script.defer = true;
    script.onload = () => this.initGoogleSignIn();
    document.head.appendChild(script);
  }

  private initGoogleSignIn(): void {
    setTimeout(() => {
      try {
        if (typeof google !== 'undefined' && google.accounts) {
          google.accounts.id.initialize({
            client_id: environment.googleClientId,
            callback: (response: any) => this.handleGoogleResponse(response),
            auto_select: false
          });
          const btnEl = document.getElementById('google-signin-btn');
          if (btnEl) google.accounts.id.renderButton(btnEl, { theme: 'outline', size: 'large', width: 380, text: 'continue_with' });
        }
      } catch (e) { console.warn('Google Sign-In init failed:', e); }
    }, 500);
  }

  handleGoogleResponse(googleResp: any): void {
    if (!googleResp || !googleResp.credential) { this.showToast('Google sign-in failed. Please try again.', 'error'); return; }
    this.loading = true;
    this.authService.googleLogin(googleResp.credential).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.newUser) {
          localStorage.setItem('pendingGoogleToken', googleResp.credential);
          localStorage.setItem('pendingGoogleEmail', res.email);
          localStorage.setItem('pendingGoogleName', res.name || '');
          this.router.navigate(['/google-complete']);
        } else {
          this.authService.saveToken(res.token);
          this.authService.setRole(res.role);
          this.authService.saveUserId(res.userId);
          this.authService.setSubscribed(res.isSubscribed === true);
          localStorage.setItem('username', res.username);
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.showToast(err?.error?.error || 'Google login failed. Please try again.', 'error');
      }
    });
  }
}
