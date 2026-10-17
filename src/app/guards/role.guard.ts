
import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';


export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Hakikisha mtumiaji ameingia
  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const user = authService.getUser();

  if (!user) {
    return router.createUrlTree(['/login']);
  }

  // Role ya mtumiaji aliyeingia
  const userRole = user.role?.toUpperCase();

  // Roles zinazoruhusiwa kufungua route hii
  const allowedRoles: string[] =
    route.data?.['roles'] || [];

  if (allowedRoles.includes(userRole)) {
    return true;
  }

  // Mtumiaji asiye na ruhusa apelekwe kwenye dashboard yake
  switch (userRole) {
    case 'ADMIN':
      return router.createUrlTree(['/admin/dashboard']);

    case 'HR':
      return router.createUrlTree(['/hr/dashboard']);

    case 'EMPLOYEE':
      return router.createUrlTree(['/employee/dashboard']);

    default:
      return router.createUrlTree(['/login']);
  }
};
