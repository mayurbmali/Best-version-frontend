import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { FreelancerProfile } from '../model/freelancer-profile';

@Injectable({ providedIn: 'root' })
export class FreelancerProfileService {
  private baseUrl = `${environment.apiUrl}/api/freelancer-profile`;

  constructor(private http: HttpClient) {}

  /** GET /api/freelancer-profile/{userId} */
  getProfile(userId: number): Observable<FreelancerProfile> {
    return this.http.get<FreelancerProfile>(`${this.baseUrl}/${userId}`);
  }

  /** POST /api/freelancer-profile/{userId} — create or update */
  saveProfile(userId: number, profile: FreelancerProfile): Observable<FreelancerProfile> {
    return this.http.post<FreelancerProfile>(`${this.baseUrl}/${userId}`, profile);
  }
}
