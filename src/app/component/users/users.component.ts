
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  forkJoin,
  catchError,
  of,
  finalize,
  interval,
  takeUntil,
  Subject
} from 'rxjs';

import {
  AdminService,
  AdminUserResponse,
  OnlineUserResponse
} from 'src/app/services/admin.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  users: AdminUserResponse[] = [];
  onlineUsers: OnlineUserResponse[] = [];

  searchTerm = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  processingUserId: number | null = null;

  constructor(private adminService: AdminService) {}

  // Initialize component
  ngOnInit(): void {
    // Load data immediately
    this.loadUsers();

    // Auto-refresh every 30 seconds
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadUsers();
      });
  }

  // Stop the timer when leaving this component
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Load all users and currently online users
  loadUsers(): void {

    // Prevent overlapping requests
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      users: this.adminService.getAllUsers(),

      online: this.adminService.getOnlineUsers().pipe(
        catchError((error) => {
          console.error('Failed to load online users:', error);
          return of(null);
        })
      )
    })
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (result) => {
          this.users = result.users;

          if (result.online === null) {
            this.errorMessage =
              'Users wamepatikana, lakini online status haikuweza kupatikana.';

            this.onlineUsers = [];
          } else {
            this.onlineUsers = result.online;
          }
        },

        error: (error) => {
          console.error('Failed to load users:', error);

          if (error.status === 401) {
            this.errorMessage =
              'Session imeisha au JWT token haipo. Tafadhali login tena.';

          } else if (error.status === 403) {
            this.errorMessage =
              'Huna ruhusa ya kuona taarifa hizi. Hakikisha umeingia kama ADMIN.';

          } else {
            this.errorMessage =
              'Imeshindwa kupata watumiaji. Hakikisha backend inafanya kazi.';
          }
        }
      });
  }

  // Check whether a user is currently online
  isOnline(user: AdminUserResponse): boolean {
    return this.onlineUsers.some(
      onlineUser => onlineUser.id === user.id
    );
  }

  // Total users
  get totalUsers(): number {
    return this.users.length;
  }

  // Online users
  get onlineCount(): number {
    return this.users.filter(
      user => this.isOnline(user)
    ).length;
  }

  // Offline users
  get offlineCount(): number {
    return this.users.length - this.onlineCount;
  }

  // Search users by name, email or role
  get filteredUsers(): AdminUserResponse[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.users;
    }

    return this.users.filter(user =>
      (user.fullName || '').toLowerCase().includes(term) ||
      (user.email || '').toLowerCase().includes(term) ||
      (user.role || '').toLowerCase().includes(term)
    );
  }

  // Get online duration in minutes
  getOnlineDuration(user: AdminUserResponse): number | null {
    const onlineUser = this.onlineUsers.find(
      item => item.id === user.id
    );

    return onlineUser
      ? onlineUser.onlineDurationMinutes
      : null;
  }

  // Disable user account using SweetAlert2
  disableUser(user: AdminUserResponse): void {

    if (this.processingUserId !== null || !user.enabled) {
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to disable ${user.fullName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Disable',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then((result) => {

      if (!result.isConfirmed) {
        return;
      }

      this.processingUserId = user.id;
      this.errorMessage = '';
      this.successMessage = '';

      this.adminService.disableUser(user.id)
        .pipe(
          finalize(() => {
            this.processingUserId = null;
          })
        )
        .subscribe({
          next: () => {
            this.successMessage =
              `Account of ${user.fullName} disabled successfully.`;

            // Reload users and online status
            this.loadUsers();

            Swal.fire({
              title: 'Success!',
              text: `The account of ${user.fullName} has been disabled.`,
              icon: 'success',
              confirmButtonText: 'OK'
            });
          },

          error: (error) => {
            console.error('Disable user failed:', error);

            Swal.fire({
              title: 'Error!',
              text: error.error?.message ||
                'Failed to disable the user account.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        });
    });
  }

  // Enable user account using SweetAlert2
  enableUser(user: AdminUserResponse): void {

    if (this.processingUserId !== null || user.enabled) {
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to enable ${user.fullName}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Enable',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then((result) => {

      if (!result.isConfirmed) {
        return;
      }

      this.processingUserId = user.id;
      this.errorMessage = '';
      this.successMessage = '';

      this.adminService.enableUser(user.id)
        .pipe(
          finalize(() => {
            this.processingUserId = null;
          })
        )
        .subscribe({
          next: () => {
            this.successMessage =
              `Account of ${user.fullName} enabled successfully.`;

            // Reload users and online status
            this.loadUsers();

            Swal.fire({
              title: 'Success!',
              text: `The account of ${user.fullName} has been enabled.`,
              icon: 'success',
              confirmButtonText: 'OK'
            });
          },

          error: (error) => {
            console.error('Enable user failed:', error);

            Swal.fire({
              title: 'Error!',
              text: error.error?.message ||
                'Failed to enable the user account.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        });
    });
  }
}
