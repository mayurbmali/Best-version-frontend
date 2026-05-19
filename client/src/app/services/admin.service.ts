import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = `${environment.apiUrl}/api/admin`;
  private authBase = `${environment.apiUrl}/api/auth`;

  constructor(private http: HttpClient) {}

  getPlatformOverview(): Observable<any> {
    return this.http.get(`${this.base}/analytics/overview`);
  }
  getActivityFeed(limit = 30): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/analytics/activity?limit=${limit}`);
  }
  getFreelancerInsights(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/analytics/freelancers`);
  }
  getJobInsights(): Observable<any> {
    return this.http.get(`${this.base}/analytics/jobs`);
  }
  getSystemHealth(): Observable<any> {
    return this.http.get(`${this.base}/system/health`);
  }

  /** Admin: delete a user by ID */
  deleteUser(targetUserId: number, adminId: number): Observable<any> {
    return this.http.delete(`${this.authBase}/user/${targetUserId}`, {
      headers: { 'X-Admin-Id': adminId.toString() }
    });
  }
}
