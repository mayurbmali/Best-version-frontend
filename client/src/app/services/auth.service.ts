import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest } from '../model/loginrequest';
import { LoginResponse } from '../model/login-response';
import { User } from '../model/user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) { }

  // ---- Original methods (preserved) ----
  registerUser(user: User): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.baseUrl}/auth/register`, user, { headers });
  }

  updateProfile(userId: number, profileData: Partial<User>): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<any>(`${this.baseUrl}/auth/user/${userId}`, profileData, { headers });
  }

  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, loginRequest);
  }

  saveToken(token: string): void { localStorage.setItem('token', token); }
  getToken(): string | null { return localStorage.getItem('token'); }
  setRole(role: string): void { localStorage.setItem('role', role); }
  getRole(): string | null { return localStorage.getItem('role'); }
  saveUserId(userId: number): void { localStorage.setItem('userId', userId.toString()); }
  getUserId(): number { return parseInt(localStorage.getItem('userId') || '0', 10); }
  getLoginStatus(): boolean { return !!this.getToken(); }

  setSubscribed(isSubscribed: boolean): void {
    localStorage.setItem('isSubscribed', isSubscribed ? 'true' : 'false');
  }
  isSubscribed(): boolean { return localStorage.getItem('isSubscribed') === 'true'; }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('isSubscribed');
    localStorage.removeItem('pendingGoogleToken');
    localStorage.removeItem('pendingGoogleEmail');
    localStorage.removeItem('pendingGoogleName');
  }

  isAdmin(): boolean { return this.getRole() === 'ADMIN'; }
  isManager(): boolean { return this.getRole() === 'CLIENT'; }
  isCustomer(): boolean { return this.getRole() === 'FREELANCER'; }

  getLoggedInUser(userId: number): Observable<User> {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.getToken()}` });
    return this.http.get<User>(`${this.baseUrl}/auth/user/${userId}`, { headers });
  }

  getUsers(): Observable<User[]> {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.getToken()}` });
    return this.http.get<User[]>(`${this.baseUrl}/auth`, { headers });
  }

  // ---- Feature 1: OTP Registration ----
  initiateRegistration(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register/initiate`, data);
  }

  verifyRegistrationOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register/verify-otp`, { email, otp });
  }

  // ---- Feature 3: Forgot Password ----
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/forgot-password`, { email });
  }

  verifyForgotPasswordOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/forgot-password/verify-otp`, { email, otp });
  }

  resetPassword(email: string, resetToken: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/reset-password`, { email, resetToken, newPassword });
  }

  // ---- Feature 4 & 5: Google OAuth ----
  googleLogin(idToken: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/google`, { idToken });
  }

  completeGoogleRegistration(idToken: string, role: string, username?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/google/complete`, { idToken, role, username });
  }

  // ---- Subscription ----
  createSubscriptionOrder(userId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/subscription/create-order/${userId}`, {});
  }

  verifySubscriptionPayment(payload: { paymentId: string; orderId: string; signature: string; userId: number }): Observable<any> {
    return this.http.post(`${this.baseUrl}/subscription/verify`, payload);
  }
}
