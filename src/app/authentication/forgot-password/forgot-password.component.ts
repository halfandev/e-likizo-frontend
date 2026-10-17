import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

  forgotForm: FormGroup;
  submitted = false;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() {
    return this.forgotForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.forgotForm.invalid || this.loading) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.authService.forgotPassword({
      email: this.forgotForm.value.email.trim()
    }).subscribe({
      next: (response) => {
        this.loading = false;

        this.successMessage =
          response.message ||
          'If the account exists, recovery instructions will be sent to its email.';
      },

      error: (error: HttpErrorResponse) => {
        this.loading = false;

        if (error.status === 0) {
          this.errorMessage =
            'Cannot connect to the server. Please try again.';
        } else {
          this.errorMessage =
            'Unable to process your request. Please try again.';
        }
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

}
