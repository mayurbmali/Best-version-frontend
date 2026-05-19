import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Proposal } from '../model/proposal';

@Injectable({ providedIn: 'root' })
export class ProposalService {
  private api = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  create(freelancerId: number, data: any): Observable<any> {
    return this.http.post(`${this.api}/proposals/freelancer/${freelancerId}`, data, {
      headers: this.getHeaders()
    });
  }

  /** Freelancer: get own proposals */
  getMyProposals(): Observable<Proposal[]> {
    return this.http.get<Proposal[]>(`${this.api}/proposals/myPropsal`, {
      headers: this.getHeaders()
    });
  }

  /** Client: get all proposals for a specific job */
  getProposalsByJob(jobId: number): Observable<Proposal[]> {
    return this.http.get<Proposal[]>(`${this.api}/proposals/job/${jobId}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Client accepts a proposal:
   *   proposal → APPROVED, job → CLOSED, others → REJECTED
   */
  acceptProposal(proposalId: number): Observable<any> {
    return this.http.put(`${this.api}/proposals/${proposalId}/accept`, {}, {
      headers: this.getHeaders()
    });
  }

  /**
   * Client rejects a single proposal — job stays open.
   */
  rejectProposal(proposalId: number): Observable<any> {
    return this.http.put(`${this.api}/proposals/${proposalId}/reject`, {}, {
      headers: this.getHeaders()
    });
  }

  deleteProposal(id: number): Observable<any> {
    return this.http.delete(`${this.api}/proposals/${id}`, {
      headers: this.getHeaders()
    });
  }
}
