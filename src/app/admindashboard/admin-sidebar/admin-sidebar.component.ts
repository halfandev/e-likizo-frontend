import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent {


  currentUser = this.authService.getUser();

  constructor(private authService: AuthService) {}

  get isAdmin(): boolean {
    return this.currentUser?.role?.toUpperCase() === 'ADMIN';
  }

  get isHR(): boolean {
    return this.currentUser?.role?.toUpperCase() === 'HR';
  }

  get isEmployee(): boolean {
    return this.currentUser?.role?.toUpperCase() === 'EMPLOYEE';
  }
}
