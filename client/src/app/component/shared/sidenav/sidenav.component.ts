import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  roleName: string = '';
  username: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.roleName = this.authService.getRole() || '';
    this.username =
      localStorage.getItem('username') ||
      localStorage.getItem('name') ||
      'User';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get avatarLetter(): string {
    return this.username ? this.username[0].toUpperCase() : 'U';
  }
}
