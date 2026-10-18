import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm: FormGroup;
  submitted = false;
  showPassword = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {

    this.loginForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8)
        ]
      ]
    });

  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {

    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.loginForm.invalid || this.loading) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.authService.login(this.loginForm.getRawValue())
      .subscribe({


        next: (response) => {

          this.loading = false;

          if (response.role?.toUpperCase() === 'ADMIN') {
            window.location.href = '/dashboard';
          } else if(response.role?.toUpperCase()=='EMPLOYEE') {
            window.location.href = '/employee-dashboard';
          }else{
            window.location.href='/hr-dashboard'
          }

        },

        // employee-dashboard

        error: (error: HttpErrorResponse) => {

          this.loading = false;

          if (error.status === 401 || error.status === 403) {
            this.errorMessage =
              'Invalid email or password, or your account is disabled.';
          } else if (error.status === 0) {
            this.errorMessage =
              'Cannot connect to the server. Check that Spring Boot is running.';
          } else {
            this.errorMessage =
              error.error?.message ||
              'Login failed. Please try again.';
          }

        }

      });

  }

}
