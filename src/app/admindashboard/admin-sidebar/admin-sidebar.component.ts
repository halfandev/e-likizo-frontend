
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

  // User Management dropdown
  isUserMenuOpen = false;

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  // Employee Management dropdown
  isEmployeeMenuOpen = false;

  toggleEmployeeMenu(): void {
    this.isEmployeeMenuOpen = !this.isEmployeeMenuOpen;
  }

  // Administrative dropdown
  isAdministrativeMenuOpen = false;

  toggleAdministrativeMenu(): void {
    this.isAdministrativeMenuOpen = !this.isAdministrativeMenuOpen;
  }
}
