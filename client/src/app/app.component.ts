import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'NexLancer';

  constructor(private authService: AuthService, private http: HttpClient) {}

  ngOnInit(): void {
    // Rehydrate subscription status from backend on every app load
    if (this.authService.getLoginStatus() && this.authService.getRole() === 'CLIENT') {
      const userId = this.authService.getUserId();
      if (userId) {
        this.http.get<any>(`${environment.apiUrl}/api/subscription/status/${userId}`)
          .subscribe({
            next: (res) => { this.authService.setSubscribed(res.isSubscribed === true); },
            error: () => {} // Silently ignore — localStorage value remains
          });
      }
    }
  }
}
