
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';

import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {

    // 1. Hakikisha mtumiaji ameingia
    if (!this.authService.isLoggedIn()) {
      return this.router.createUrlTree(['/login']);
    }

    const user = this.authService.getUser();

    if (!user) {
      return this.router.createUrlTree(['/login']);
    }

    // 2. Pata role ya mtumiaji
    const userRole = (user.role || '')
      .toUpperCase()
      .replace(/^ROLE_/, '');

    // 3. Soma roles zinazoruhusiwa kwenye route
    const allowedRoles: string[] =
      route.data['roles'] || [];

    // 4. Route isiyo na roles inaruhusiwa kwa user
    // yeyote aliyeingia, mfano Profile
    if (allowedRoles.length === 0) {
      return true;
    }

    // 5. Linganisha role ya user na ruhusa za route
    const normalizedRoles = allowedRoles.map(role =>
      role.toUpperCase().replace(/^ROLE_/, '')
    );

    if (normalizedRoles.includes(userRole)) {
      return true;
    }

    // 6. Akikosa ruhusa, mpeleke kwenye ukurasa
    // anaoruhusiwa kufungua
    switch (userRole) {
      case 'ADMIN':
        return this.router.createUrlTree(['/dashboard']);

      case 'HR':
        return this.router.createUrlTree(['/hr-dashboard']);

      case 'EMPLOYEE':
        return this.router.createUrlTree(['/profile']);

      default:
        return this.router.createUrlTree(['/login']);
    }
  }
}
