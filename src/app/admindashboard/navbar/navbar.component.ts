import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, LoginResponse } from 'src/app/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  currentUser: LoginResponse | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

 ngOnInit(): void {
  this.loadCurrentUser();
}

loadCurrentUser(): void {
  this.currentUser = this.authService.getUser();
  console.log('Navbar current user:', this.currentUser);
}

  logout(event: Event): void {
    event.preventDefault();

    this.authService.logout().subscribe({
      next: () => this.finishLogout(),
      error: (error) => {
        console.error('Logout request failed:', error);
        this.finishLogout();
      }
    });
  }

  private finishLogout(): void {
    this.currentUser = null;
    this.router.navigateByUrl('/login').then(() => {
      window.location.reload();
    });
  }
}
