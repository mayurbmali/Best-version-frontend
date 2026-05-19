import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Job } from '../model/job';

@Injectable({ providedIn: 'root' })
export class JobService {
  private api = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  create(clientId: number, data: any): Observable<any> {
    return this.http.post(`${this.api}/jobs/client/${clientId}`, data, {
      headers: this.getHeaders()
    });
  }

  get(id: number): Observable<Job> {
    return this.http.get<Job>(`${this.api}/jobs/${id}`, {
      headers: this.getHeaders()
    });
  }

  getJobList(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.api}/jobs`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Apply to a job. Sends bidAmount so backend creates a PENDING proposal.
   */
  applyToJob(jobId: number, userId: number, bidAmount: number = 0): Observable<any> {
    return this.http.post(`${this.api}/jobs/${jobId}/apply`, { userId, bidAmount }, {
      headers: this.getHeaders()
    });
  }

  getMyJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.api}/jobs/my-jobs`, {
      headers: this.getHeaders()
    });
  }

  updateJobStatus(jobId: number, status: string): Observable<any> {
    return this.http.put(`${this.api}/jobs/status/${jobId}?status=${status}`, {}, {
      headers: this.getHeaders()
    });
  }

  getUserReport(): Observable<any> {
    return this.http.get<any>(`${this.api}/jobs/report/users`, {
      headers: this.getHeaders()
    });
  }

  deleteJob(id: number): Observable<any> {
    return this.http.delete(`${this.api}/jobs/${id}`, {
      headers: this.getHeaders()
    });
  }

  updateJob(id: number, data: any): Observable<any> {
    return this.http.put(`${this.api}/jobs/${id}`, data, {
      headers: this.getHeaders()
    });
  }
}
